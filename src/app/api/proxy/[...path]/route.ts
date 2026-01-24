import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:8080';

/**
 * Bezpieczne parsowanie odpowiedzi - obsługuje JSON, puste odpowiedzi i błędy
 */
async function safeParseResponse(response: Response, url: string, method: string = 'GET'): Promise<{ data: unknown; error?: string }> {
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
        if (method === 'GET') {
            return { data: [] };
        }
        return { data: null };
    }

    try {
        const data = JSON.parse(responseText);
        return { data };
    } catch {
        if (contentType.includes('application/json')) {
            return { data: null, error: `Invalid JSON response: ${responseText.substring(0, 100)}` };
        }

        return {
            data: null,
            error: `Backend returned non-JSON response (${contentType}): ${responseText.substring(0, 200)}`
        };
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/pdf') || contentType.includes('image/') || contentType.includes('application/octet-stream')) {
            const blob = await response.blob();
            return new NextResponse(blob, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': response.headers.get('Content-Disposition') || ''
                }
            });
        }

        const { data, error } = await safeParseResponse(response, url, 'GET');

        if (error) {
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const body = await request.json();

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const { data, error } = await safeParseResponse(response, url, 'POST');

        if (error) {
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const body = await request.json();

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        const { data, error } = await safeParseResponse(response, url, 'PUT');

        if (error) {
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const body = await request.json();

        const response = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body)
        });

        const { data, error } = await safeParseResponse(response, url, 'PATCH');

        if (error) {
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const { data, error } = await safeParseResponse(response, url, 'DELETE');

        if (error) {
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}
