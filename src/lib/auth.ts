import { TOKEN_KEY, TOKEN_EXPIRY_DAYS } from '@/constants';
import type { JwtPayload } from '@/types';

// Cookie options for security
const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * TOKEN_EXPIRY_DAYS
};

// Token refresh threshold: refresh if token expires within 30 seconds
const TOKEN_REFRESH_THRESHOLD_MS = 30 * 1000;

/**
 * Parse cookies from document.cookie string
 */
function parseCookies(): Record<string, string> {
    if (typeof document === 'undefined') {
        return {};
    }
    return document.cookie.split(';').reduce(
        (cookies, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
            return cookies;
        },
    {} as Record<string, string>
    );
}

/**
 * Set a cookie with security options
 */
function setCookie(name: string, value: string, options: typeof COOKIE_OPTIONS): void {
    if (typeof document === 'undefined') {
        return;
    }

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.path) {
        cookieString += `; path=${options.path}`;
    }
    if (options.maxAge) {
        cookieString += `; max-age=${options.maxAge}`;
    }
    if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
    }
    if (options.secure) {
        cookieString += '; secure';
    }

    document.cookie = cookieString;
}

/**
 * Delete a cookie by setting its expiration to the past
 */
function deleteCookie(name: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    // Try to get from cookie first
    const cookies = parseCookies();
    const cookieToken = cookies[TOKEN_KEY];
    if (cookieToken) {
        return cookieToken;
    }

    // Fallback to localStorage for backward compatibility
    const localStorageToken = localStorage.getItem(TOKEN_KEY);
    if (localStorageToken) {
    // Migrate to cookie
        setToken(localStorageToken);
        localStorage.removeItem(TOKEN_KEY);
        return localStorageToken;
    }

    return null;
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Set cookie with security options
    setCookie(TOKEN_KEY, token, COOKIE_OPTIONS);

    // Remove from localStorage if exists (migration)
    localStorage.removeItem(TOKEN_KEY);
}

export function removeToken(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Remove cookie
    deleteCookie(TOKEN_KEY);

    // Also remove from localStorage for backward compatibility
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) {
        return false;
    }

    // Check if token is expired
    try {
        const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        if (exp && Date.now() >= exp * 1000) {
            removeToken();
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function getTokenPayload(): JwtPayload | null {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Check if token is expiring soon (within TOKEN_REFRESH_THRESHOLD_MS)
 * @returns true if token needs refresh, false otherwise
 */
export function isTokenExpiringSoon(): boolean {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        if (!exp) {
            return false;
        }

        const expirationTime = exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        // Token is expiring soon if it expires within the threshold
        return timeUntilExpiration > 0 && timeUntilExpiration <= TOKEN_REFRESH_THRESHOLD_MS;
    } catch {
        return false;
    }
}

/**
 * Get time until token expiration in milliseconds
 * @returns milliseconds until expiration, or null if token is invalid/expired
 */
export function getTimeUntilExpiration(): number | null {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        if (!exp) {
            return null;
        }

        const expirationTime = exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        return timeUntilExpiration > 0 ? timeUntilExpiration : null;
    } catch {
        return null;
    }
}

/**
 * Logout user by clearing all authentication data
 */
export function logout(): void {
    removeToken();

    // Clear any other auth-related data from localStorage and sessionStorage
    if (typeof window !== 'undefined') {
    // Clear search history or other user-specific data if needed
    // This ensures a clean logout
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('auth_') || key === TOKEN_KEY)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Clear encrypted credentials from sessionStorage
        sessionStorage.removeItem('auth_encrypted_creds');
    }
}

/**
 * Check if user is authenticated and redirect to login if not
 * @param redirectUrl - URL to redirect to after login (optional)
 */
export function requireAuth(redirectUrl?: string): boolean {
    if (!isAuthenticated()) {
        if (typeof window !== 'undefined') {
            const loginUrl = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
            window.location.href = loginUrl;
        }
        return false;
    }
    return true;
}

// ============================================
// Role-Based Access Control Functions
// ============================================

/**
 * Get user roles from JWT token
 * @returns Array of role names, or empty array if no roles found
 */
export function getUserRoles(): string[] {
    const payload = getTokenPayload();
    if (!payload || !payload.roles) {
        return [];
    }
    return payload.roles;
}

/**
 * Check if user has a specific role
 * @param role - Role name to check (e.g., "ROLE_ADMIN")
 * @returns true if user has the role, false otherwise
 */
export function hasRole(role: string): boolean {
    const roles = getUserRoles();
    return roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 * @param roles - Array of role names to check
 * @returns true if user has at least one of the roles, false otherwise
 */
export function hasAnyRole(roles: string[]): boolean {
    const userRoles = getUserRoles();
    return roles.some((role) => userRoles.includes(role));
}

/**
 * Check if user is an admin
 * @returns true if user has ROLE_ADMIN, false otherwise
 */
export function isAdmin(): boolean {
    return hasRole('ROLE_ADMIN');
}

/**
 * Get username from JWT token
 * @returns Username or null if not found
 */
export function getUsername(): string | null {
    const payload = getTokenPayload();
    return payload?.sub || null;
}

/**
 * Get organisation ID from JWT token
 * Note: Current JWT payload doesn't include organisation info
 * This is a placeholder for future implementation
 * @returns Organisation ID or null if not found
 */
export function getOrganisationId(): number | null {
    // JWT payload doesn't currently include organisation info
    // This would need to be added to the backend JWT token
    return null;
}

/**
 * Get organisation name from JWT token
 * Note: Current JWT payload doesn't include organisation info
 * This is a placeholder for future implementation
 * @returns Organisation name or null if not found
 */
export function getOrganisationName(): string | null {
    // JWT payload doesn't currently include organisation info
    // This would need to be added to the backend JWT token
    return null;
}
