/**
 * Encryption utilities for secure credential storage
 * Uses browser's built-in Web Crypto API for encryption/decryption
 */

// Storage key for encrypted credentials
const ENCRYPTED_CREDENTIALS_KEY = 'auth_encrypted_creds';

// Encryption algorithm configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Generate a cryptographic key from a password
 * Uses PBKDF2 with a salt derived from browser fingerprint
 */
async function deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits', 'deriveKey']);

    // Derive AES key using PBKDF2
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Get a consistent salt based on browser fingerprint
 * This allows us to derive the same key without storing it
 */
function getBrowserSalt(): BufferSource {
    // Create a fingerprint from browser characteristics
    const fingerprint = [navigator.userAgent, navigator.language, new Date().getTimezoneOffset().toString(), screen.colorDepth.toString(), screen.width.toString(), screen.height.toString()].join('|');

    // Hash the fingerprint to create a consistent salt
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);

    // Use a simple hash for salt (not cryptographically secure, but sufficient for this use case)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = (hash << 5) - hash + data[i];
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Create a 16-byte salt from the hash
    const salt = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        salt[i] = (hash >> ((i % 4) * 8)) & 0xff;
    }

    return salt.buffer;
}

/**
 * Get encryption key based on session
 * Uses a combination of session ID and browser fingerprint
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    // Use a session-specific password
    const sessionPassword = `magazynier_uz_${Date.now().toString(36)}`;
    const salt = getBrowserSalt();

    return await deriveKey(sessionPassword, salt);
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
 * Clear stored credentials from sessionStorage
 */
export function clearStoredCredentials(): void {
    if (typeof window === 'undefined') {
        return;
    }

    sessionStorage.removeItem(ENCRYPTED_CREDENTIALS_KEY);
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
