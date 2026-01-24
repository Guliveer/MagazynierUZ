'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from 'shadcn/button';
import { Badge } from 'shadcn/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from 'shadcn/dropdown-menu';
import { User, ChevronDown, Sun, Moon, Monitor, UserCircle, Shield, LogOut, RefreshCw } from 'lucide-react';
import { getCurrentUserRole } from '@/lib/api';

interface UserProfileMenuProps {
  username: string | null;
  roles: string[];
  isAdmin: boolean;
  onLogout: () => void;
}

const themes = [
    { value: 'light', icon: Sun, label: 'light' },
    { value: 'dark', icon: Moon, label: 'dark' },
    { value: 'system', icon: Monitor, label: 'system' }
] as const;

const locales = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' }
] as const;

export default function UserProfileMenu({ username, roles, isAdmin, onLogout }: UserProfileMenuProps) {
    const { theme, setTheme } = useTheme();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('dashboard.nav');
    const tTheme = useTranslations('theme');

    // Server-side role fetching state
    const [serverRoles, setServerRoles] = useState<string[]>(roles);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [roleError, setRoleError] = useState<string | null>(null);

    // Fetch roles from server on mount and periodically
    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            setRoleError(null);
            try {
                const roleResponse = await getCurrentUserRole();
                setServerRoles(roleResponse.roles);
            } catch (error) {
                console.error('Failed to fetch roles from server:', error);
                setRoleError('Failed to fetch roles');
                // Fallback to prop-based roles
                setServerRoles(roles);
            } finally {
                setLoadingRoles(false);
            }
        };

        // Initial fetch
        fetchRoles();

        // Set up periodic refresh (every 5 minutes)
        const intervalId = setInterval(fetchRoles, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [roles]);

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    // Use server roles if available, otherwise fall back to prop roles
    const displayRoles = serverRoles.length > 0 ? serverRoles : roles;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-3">
                    <User className="h-4 w-4" />
                    <span className="truncate flex-1 text-left">{username || 'User'}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                {/* Section 1: User Info */}
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium truncate">{username || 'User'}</p>
                        {displayRoles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {displayRoles.slice(0, 2).map((role) => (
                                    <Badge key={role} variant="secondary" className="text-[10px] px-1 py-0">
                                        {role.replace('ROLE_', '')}
                                    </Badge>
                                ))}
                                {displayRoles.length > 2 && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    +{displayRoles.length - 2}
                                    </Badge>
                                )}
                                {loadingRoles && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Section 2: Settings - Theme */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
                {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    const isActive = theme === themeOption.value;
                    return (
                        <DropdownMenuItem key={themeOption.value} onClick={() => setTheme(themeOption.value)} className={isActive ? 'bg-accent' : ''}>
                            <Icon className="h-4 w-4" />
                            <span>{tTheme(themeOption.label)}</span>
                            {isActive && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />

                {/* Section 2: Settings - Language */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">Language</DropdownMenuLabel>
                {locales.map((loc) => {
                    const isActive = locale === loc.code;
                    return (
                        <DropdownMenuItem key={loc.code} onClick={() => switchLocale(loc.code)} className={isActive ? 'bg-accent' : ''}>
                            <span>{loc.flag}</span>
                            <span>{loc.name}</span>
                            {isActive && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />

                {/* Section 3: Navigation */}
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <UserCircle className="h-4 w-4" />
                    <span>{t('profile')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Section 4: Logout */}
                <DropdownMenuItem variant="destructive" onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>{t('logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
