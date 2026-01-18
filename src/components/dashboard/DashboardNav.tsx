'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Package, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { removeToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/warehouses', label: 'Warehouses', icon: Building2 },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/statistics', label: 'Statistics', icon: BarChart3 }
];

export function DashboardNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        removeToken();
        router.push('/login');
    };

    return (
        <nav className="flex flex-col h-full">
            <div className="p-4">
                <h2 className="text-lg font-semibold">MagazynierUZ</h2>
            </div>
            <Separator />
            <div className="flex-1 p-2">
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
                </ul>
            </div>
            <Separator />
            <div className="p-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
          Log out
                </Button>
            </div>
        </nav>
    );
}
