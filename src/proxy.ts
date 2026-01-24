import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
    const response = intlMiddleware(request);

    const pathname = request.nextUrl.pathname;
    const pathnameHasLocale = routing.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;

    const token = request.cookies.get('auth_token')?.value;
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    const isProtectedRoute = pathname.includes('/dashboard');

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
