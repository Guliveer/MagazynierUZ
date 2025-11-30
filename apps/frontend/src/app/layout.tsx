import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import './css/globals.css';
import React from 'react';
import ThemeProviderWrapper from './themeProvider';

export const metadata: Metadata = {
    title: 'MagazynierUZ',
    description: 'App for warehouse management'
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={'antialiased'}>
                <Analytics />
                <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
            </body>
        </html>
    );
}
