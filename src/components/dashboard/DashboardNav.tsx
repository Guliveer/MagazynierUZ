'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Package, BarChart3, LogOut, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, getUsername, getUserRoles, isAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/warehouses', label: 'Warehouses', icon: Building2 },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/statistics', label: 'Statistics', icon: BarChart3 }
];

export function DashboardNav() {
    const pathname = usePathname();
    const router = useRouter();
    const username = getUsername();
    const roles = getUserRoles();
    const userIsAdmin = isAdmin();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="flex flex-col h-screen">
            {/* Header with user info - fixed at top */}
            <div className="p-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">MagazynierUZ</h2>
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
                                <Link href="/dashboard/admin" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', pathname?.startsWith('/dashboard/admin') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
                                    <Shield className="h-4 w-4" />
                  Admin Panel
                                    <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">
                    ADMIN
                                    </Badge>
                                </Link>
                            </li>
                        </>
                    )}

                    {/* Profile - visible to all users */}
                    <Separator className="my-2" />
                    <li>
                        <Link href="/dashboard/profile" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', pathname === '/dashboard/profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
                            <User className="h-4 w-4" />
              Profile
                        </Link>
                    </li>
                </ul>
            </div>

            <Separator />

            {/* Logout button */}
            <div className="p-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
          Log out
                </Button>
            </div>
        </nav>
    );
}
