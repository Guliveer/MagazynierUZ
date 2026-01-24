import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import '../css/globals.css';
import React from 'react';
import ThemeProviderWrapper from '../themeProvider';
import { Toaster } from 'shadcn/sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
    title: 'MagazynierUZ',
    description: 'App for warehouse management'
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
};

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as 'en' | 'pl')) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={'antialiased'}>
                <Analytics />
                <NextIntlClientProvider messages={messages}>
                    <ThemeProviderWrapper>
                        {children}
                        <Toaster />
                    </ThemeProviderWrapper>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
