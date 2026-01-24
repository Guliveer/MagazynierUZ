/**
 * Encryption utilities for secure credential storage
 * Uses browser's built-in Web Crypto API for encryption/decryption
 *
 * SECURITY NOTE: This implementation uses client-side encryption with a key derived
 * from an environment variable. While this provides obfuscation, it's important to
 * understand that client-side encryption cannot provide true security against
 * determined attackers who have access to the client code. The encryption secret
 * is exposed in the browser bundle.
 *
 * This approach is suitable for:
 * - Preventing casual inspection of stored credentials
 * - Adding a layer of obfuscation to sessionStorage
 * - Ensuring credentials aren't stored in plain text
 *
 * For truly sensitive data, consider server-side encryption or secure token storage.
 */

// Storage keys
const ENCRYPTED_CREDENTIALS_KEY = 'auth_encrypted_creds';
const ENCRYPTION_KEY_CACHE = 'auth_encryption_key_cache';

// Encryption algorithm configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// PBKDF2 configuration for key derivation
const PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum
const SALT_LENGTH = 16; // 128 bits

/**
 * Get the encryption secret from environment variables
 * Falls back to a default value if not configured (with warning)
 */
function getEncryptionSecret(): string {
    const secret = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;

    if (!secret) {
        console.warn('NEXT_PUBLIC_ENCRYPTION_SECRET is not configured. Using fallback secret. ' + 'Please set this environment variable for production use.');
        // Fallback secret - should only be used in development
        return 'default-encryption-secret-please-change-in-production';
    }

    if (secret.length < 32) {
        console.warn('NEXT_PUBLIC_ENCRYPTION_SECRET is too short. ' + 'Please use a secret of at least 32 characters for better security.');
    }

    return secret;
}

/**
 * Get a consistent salt for key derivation
 * Uses a static salt combined with browser fingerprint for consistency
 * This ensures the same key is derived across sessions
 */
function getDerivationSalt(): Uint8Array {
    // Create a fingerprint from browser characteristics
    const fingerprint = [navigator.userAgent, navigator.language, new Date().getTimezoneOffset().toString(), screen.colorDepth.toString(), screen.width.toString(), screen.height.toString()].join('|');

    // Hash the fingerprint to create a consistent salt
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);

    // Use a simple hash for salt
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = (hash << 5) - hash + data[i];
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Create a 16-byte salt from the hash
    const salt = new Uint8Array(SALT_LENGTH);
    for (let i = 0; i < SALT_LENGTH; i++) {
        salt[i] = (hash >> ((i % 4) * 8)) & 0xff;
    }

    return salt;
}

/**
 * Derive a cryptographic key from the environment secret using PBKDF2
 * The derived key is cached in sessionStorage for performance
 */
async function deriveEncryptionKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const secretBuffer = encoder.encode(secret);

    // Import secret as key material
    const keyMaterial = await crypto.subtle.importKey('raw', secretBuffer, 'PBKDF2', false, ['deriveBits', 'deriveKey']);

    // Derive AES key using PBKDF2
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt.buffer as ArrayBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // Allow export for caching
        ['encrypt', 'decrypt']
    );
}

/**
 * Get or derive the encryption key
 * Uses environment variable secret with PBKDF2 key derivation
 * Caches the derived key in sessionStorage for performance
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    if (typeof window === 'undefined') {
        throw new Error('Encryption key can only be generated in browser context');
    }

    // Check if we have a cached derived key
    const cachedKeyData = sessionStorage.getItem(ENCRYPTION_KEY_CACHE);

    if (cachedKeyData) {
        try {
            const keyData = JSON.parse(cachedKeyData);
            const keyBuffer = Uint8Array.from(atob(keyData.key), (c) => c.charCodeAt(0));

            return await crypto.subtle.importKey('raw', keyBuffer, { name: ALGORITHM, length: KEY_LENGTH }, true, ['encrypt', 'decrypt']);
        } catch (error) {
            console.error('Failed to import cached key, deriving new one:', error);
            sessionStorage.removeItem(ENCRYPTION_KEY_CACHE);
        }
    }

    // Derive a new key from the environment secret
    const secret = getEncryptionSecret();
    const salt = getDerivationSalt();
    const key = await deriveEncryptionKey(secret, salt);

    // Cache the derived key for performance
    try {
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        const keyArray = new Uint8Array(exportedKey);
        const keyData = {
            key: btoa(String.fromCharCode(...keyArray)),
            timestamp: Date.now()
        };
        sessionStorage.setItem(ENCRYPTION_KEY_CACHE, JSON.stringify(keyData));
    } catch (error) {
        console.error('Failed to cache encryption key:', error);
    // Continue even if caching fails - the key will still work
    }

    return key;
}

/**
 * Encrypt credentials for secure storage
 * @param username - User's username
 * @param password - User's password
 * @returns Base64-encoded encrypted data
 */
export async function encryptCredentials(username: string, password: string): Promise<string> {
    try {
        const encoder = new TextEncoder();
        const data = JSON.stringify({ username, password });
        const dataBuffer = encoder.encode(data);

        // Generate a random IV
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // Get encryption key
        const key = await getEncryptionKey();

        // Encrypt the data
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            dataBuffer
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt credentials');
    }
}

/**
 * Decrypt stored credentials
 * @param encrypted - Base64-encoded encrypted data
 * @returns Decrypted credentials object
 */
export async function decryptCredentials(encrypted: string): Promise<{ username: string; password: string }> {
    try {
    // Decode from base64
        const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encryptedData = combined.slice(IV_LENGTH);

        // Get decryption key
        const key = await getEncryptionKey();

        // Decrypt the data
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            encryptedData
        );

        // Convert to string and parse JSON
        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decryptedBuffer);
        const credentials = JSON.parse(decryptedString);

        return credentials;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt credentials');
    }
}

/**
 * Store encrypted credentials in sessionStorage
 * @param username - User's username
 * @param password - User's password
 */
export async function storeEncryptedCredentials(username: string, password: string): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const encrypted = await encryptCredentials(username, password);
        sessionStorage.setItem(ENCRYPTED_CREDENTIALS_KEY, encrypted);
    } catch (error) {
        console.error('Failed to store credentials:', error);
        throw error;
    }
}

/**
 * Retrieve and decrypt stored credentials
 * @returns Decrypted credentials or null if not found
 */
export async function getStoredCredentials(): Promise<{ username: string; password: string } | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const encrypted = sessionStorage.getItem(ENCRYPTED_CREDENTIALS_KEY);
        if (!encrypted) {
            return null;
        }

        return await decryptCredentials(encrypted);
    } catch (error) {
        console.error('Failed to retrieve credentials:', error);
        // Clear invalid credentials
        clearStoredCredentials();
        return null;
    }
}

/**
 * Clear stored credentials and encryption key cache from sessionStorage
 */
export function clearStoredCredentials(): void {
    if (typeof window === 'undefined') {
        return;
    }

    sessionStorage.removeItem(ENCRYPTED_CREDENTIALS_KEY);
    sessionStorage.removeItem(ENCRYPTION_KEY_CACHE);
}

/**
 * Check if credentials are stored
 * @returns true if credentials exist in storage
 */
export function hasStoredCredentials(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return sessionStorage.getItem(ENCRYPTED_CREDENTIALS_KEY) !== null;
}
