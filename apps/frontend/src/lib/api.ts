const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:8080';

export interface AuthRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: email,
            password: password
        } as AuthRequest)
    });

    if (!response.ok) {
        const errorMessage = await response.text().catch(() => 'Login failed');
        throw new ApiError(response.status, errorMessage || 'Login failed');
    }

    return response.json();
}

export async function register(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: email,
            password: password
        } as AuthRequest)
    });

    if (!response.ok) {
        const errorMessage = await response.text().catch(() => 'Registration failed');
        throw new ApiError(response.status, errorMessage || 'Registration failed');
    }
}
