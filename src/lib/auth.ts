import { TOKEN_KEY, TOKEN_EXPIRY_DAYS } from '@/constants';
import type { JwtPayload } from '@/types';

// Cookie options for security
const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * TOKEN_EXPIRY_DAYS
};

/**
 * Parse cookies from document.cookie string
 */
function parseCookies(): Record<string, string> {
    if (typeof document === 'undefined') {
        return {};
    }
    return document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
        return cookies;
    }, {} as Record<string, string>);
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
