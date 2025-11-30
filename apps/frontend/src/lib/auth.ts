const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) {
        return false;
    }

    // Check if token is expired
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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

export function getTokenPayload(): Record<string, unknown> | null {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}
