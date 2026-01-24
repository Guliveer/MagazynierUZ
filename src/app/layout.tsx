import type { ReactNode } from 'react';

// This is a minimal root layout required by Next.js
// The actual layout with providers is in [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
