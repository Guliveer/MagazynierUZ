'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, Package } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { TokenExpirationModal } from '@/components/auth/TokenExpirationModal';

const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/warehouses', label: 'Magazyny', icon: Building2 },
    { href: '/dashboard/products', label: 'Produkty', icon: Package }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    // Token refresh monitoring
    const { showWarning, timeRemaining, dismissWarning, extendSession } = useTokenRefresh();

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                router.push('/login');
            } else {
                setIsAuth(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!isAuth) {
        return null;
    }

    return (
        <>
            {/* Token Expiration Warning Modal */}
            <TokenExpirationModal open={showWarning} timeRemaining={timeRemaining} onDismiss={dismissWarning} onExtend={extendSession} />

            <div className="flex min-h-screen">
                {/* Sidebar - desktop - fixed position */}
                <aside className="w-64 border-r bg-card hidden md:block fixed left-0 top-0 h-screen z-40">
                    <DashboardNav />
                </aside>

                {/* Mobile navigation - bottom bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50">
                    <nav className="flex justify-around p-2">
                        {mobileNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-1 px-3 py-1 rounded-md text-xs transition-colors', isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Main content - with left margin to account for fixed sidebar */}
                <main className="flex-1 p-6 pb-20 md:pb-6 md:ml-64 overflow-auto">{children}</main>
            </div>
        </>
    );
}
