'use client';

import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, ChevronDown, Sun, Moon, Monitor, Languages, UserCircle, Shield, LogOut } from 'lucide-react';

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

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

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
                        {roles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
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

                {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/dashboard/admin')}>
                        <Shield className="h-4 w-4" />
                        <span>{t('adminPanel')}</span>
                    </DropdownMenuItem>
                )}

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
