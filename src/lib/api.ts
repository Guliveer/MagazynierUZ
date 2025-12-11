import type { LoginResponse } from '@/types';

const API_BASE_URL = (() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_HOST;
    if (!url && process.env.NODE_ENV === 'production') {
        throw new Error('NEXT_PUBLIC_BACKEND_HOST environment variable is required in production');
    }
    return url || 'http://localhost:8080';
})();

export interface AuthRequest {
  username: string;
  password: string;
}

export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new ApiError(response.status, errorData || 'Request failed');
    }

    return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    return await fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        } as AuthRequest)
    });
}

export async function register(username: string, password: string): Promise<void> {
    await fetchApi<void>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        } as AuthRequest)
    });
}
