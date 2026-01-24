'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Package, BarChart3, LogOut, Shield, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { logout, getUsername, getUserRoles, isAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

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
            {/* Header with user info and switchers - fixed at top */}
            <div className="p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">MagazynierUZ</h2>
                    <div className="flex gap-2">
                        <ThemeSwitcher />
                        <LocaleSwitcher />
                    </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                    <p className="truncate">{username || 'User'}</p>
                    {roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {roles.slice(0, 2).map((role) => (
                                <Badge key={role} variant="secondary" className="text-[10px] px-1 py-0">
                                    {role.replace('ROLE_', '')}
                                </Badge>
                            ))}
                            {roles.length > 2 && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  +{roles.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
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

                    {/* Profile - visible to all users */}
                    <Separator className="my-2" />
                    <li>
                        <Link href={`/${locale}/dashboard/profile`} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', pathname === `/${locale}/dashboard/profile` ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
                            <User className="h-4 w-4" />
                            {t('profile')}
                        </Link>
                    </li>
                </ul>
            </div>

            <Separator />

            {/* Logout button */}
            <div className="p-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                </Button>
            </div>
        </nav>
    );
}
