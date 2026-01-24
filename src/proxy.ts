import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
    // First, handle i18n routing
    const response = intlMiddleware(request);

    // Extract locale from pathname
    const pathname = request.nextUrl.pathname;
    const pathnameHasLocale = routing.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

    // Get the locale from the pathname or use default
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;

    // Then, handle authentication logic
    const token = request.cookies.get('auth_token')?.value;
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    const isProtectedRoute = pathname.includes('/dashboard');

    // If user is not logged in and tries to access protected route
    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // If user is logged in and tries to access login/register page
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
