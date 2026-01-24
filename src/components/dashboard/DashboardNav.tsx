'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Package, BarChart3, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { logout, getUsername, getUserRoles, isAdmin } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import UserProfileMenu from './UserProfileMenu';

export function DashboardNav() {
    const t = useTranslations('dashboard.nav');
    const pathname = usePathname();
    const router = useRouter();
    const username = getUsername();
    const roles = getUserRoles();
    const userIsAdmin = isAdmin();

    // Extract locale from pathname
    const locale = pathname?.split('/')[1] || 'en';

    const navItems = [
        { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
        { href: `/${locale}/dashboard/warehouses`, label: t('warehouses'), icon: Building2 },
        { href: `/${locale}/dashboard/products`, label: t('products'), icon: Package },
        { href: `/${locale}/dashboard/statistics`, label: t('statistics'), icon: BarChart3 }
    ];

    const handleLogout = () => {
        logout();
        router.push(`/${locale}/login`);
    };

    return (
        <nav className="flex flex-col h-screen">
            {/* Header with branding and user profile menu - fixed at top */}
            <div className="p-4 flex-shrink-0">
                <h2 className="text-lg font-semibold mb-3">MagazynierUZ</h2>
                <UserProfileMenu username={username} roles={roles} isAdmin={userIsAdmin} onLogout={handleLogout} />
            </div>
            <Separator />

            {/* Main navigation - scrollable content */}
            <div className="flex-1 p-2 overflow-y-auto">
                <ul className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link href={item.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}

                    {/* Admin Panel - only visible to admins */}
                    {userIsAdmin && (
                        <>
                            <Separator className="my-2" />
                            <li>
                                <Link href={`/${locale}/dashboard/admin`} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', pathname?.startsWith(`/${locale}/dashboard/admin`) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
                                    <Shield className="h-4 w-4" />
                                    {t('adminPanel')}
                                    <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">
                                        {t('adminBadge')}
                                    </Badge>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
