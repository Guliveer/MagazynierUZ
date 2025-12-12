import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:8080';

/**
 * Bezpieczne parsowanie odpowiedzi - obsługuje JSON, puste odpowiedzi i błędy
 */
async function safeParseResponse(response: Response, url: string, method: string = 'GET'): Promise<{ data: unknown; error?: string }> {
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    console.log(`[Proxy] Response from ${url}:`);
    console.log(`[Proxy]   Status: ${response.status} ${response.statusText}`);
    console.log(`[Proxy]   Content-Type: ${contentType}`);
    console.log(`[Proxy]   Body length: ${responseText.length}`);
    console.log(`[Proxy]   Body preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);

    // Pusta odpowiedź - zwróć odpowiednią wartość w zależności od metody HTTP
    // Backend może zwracać pustą odpowiedź zamiast [] gdy nie ma danych
    if (!responseText || responseText.trim() === '') {
        if (method === 'GET') {
            console.log('[Proxy]   Empty response body - returning empty array');
            return { data: [] };
        }
        console.log('[Proxy]   Empty response body - returning null');
        return { data: null };

    }

    // Próbuj sparsować jako JSON niezależnie od Content-Type
    // (niektóre backendy nie ustawiają poprawnie Content-Type)
    try {
        const data = JSON.parse(responseText);
        return { data };
    } catch (parseError) {
    // Jeśli Content-Type wskazuje na JSON, to jest błąd
        if (contentType.includes('application/json')) {
            console.error('[Proxy]   JSON parse error:', parseError);
            return { data: null, error: `Invalid JSON response: ${responseText.substring(0, 100)}` };
        }

        // Nie-JSON odpowiedź (np. HTML error page)
        console.warn('[Proxy]   Non-JSON response received');
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

    console.log(`[Proxy] GET ${url}`);

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
        console.log('[Proxy]   Authorization header present');
    } else {
        console.log('[Proxy]   No Authorization header');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        const { data, error } = await safeParseResponse(response, url, 'GET');

        if (error) {
            console.error(`[Proxy]   Parse error: ${error}`);
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Proxy] Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    console.log(`[Proxy] POST ${url}`);

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
        console.log('[Proxy]   Authorization header present');
    } else {
        console.log('[Proxy]   No Authorization header');
    }

    try {
        const body = await request.json();
        console.log('[Proxy]   Request body:', JSON.stringify(body).substring(0, 200));

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const { data, error } = await safeParseResponse(response, url, 'POST');

        if (error) {
            console.error(`[Proxy]   Parse error: ${error}`);
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Proxy] Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    console.log(`[Proxy] PUT ${url}`);

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
        console.log('[Proxy]   Authorization header present');
    } else {
        console.log('[Proxy]   No Authorization header');
    }

    try {
        const body = await request.json();
        console.log('[Proxy]   Request body:', JSON.stringify(body).substring(0, 200));

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        const { data, error } = await safeParseResponse(response, url, 'PUT');

        if (error) {
            console.error(`[Proxy]   Parse error: ${error}`);
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Proxy] Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/${pathString}`;

    console.log(`[Proxy] DELETE ${url}`);

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
        console.log('[Proxy]   Authorization header present');
    } else {
        console.log('[Proxy]   No Authorization header');
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });

        // DELETE może zwrócić pusty response (204 No Content)
        if (response.status === 204) {
            console.log('[Proxy]   Response: 204 No Content');
            return new NextResponse(null, { status: 204 });
        }

        const { data, error } = await safeParseResponse(response, url, 'DELETE');

        if (error) {
            console.error(`[Proxy]   Parse error: ${error}`);
            return NextResponse.json({ error }, { status: response.status >= 400 ? response.status : 502 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Proxy] Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Proxy error: ${errorMessage}` }, { status: 500 });
    }
}
