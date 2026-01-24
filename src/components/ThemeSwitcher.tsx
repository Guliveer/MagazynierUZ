'use client';

import { useTheme } from 'next-themes';
import { Button } from 'shadcn/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'shadcn/dropdown-menu';
import { useTranslations } from 'next-intl';

const themes = [
    { value: 'light', icon: Sun, emoji: '☀️' },
    { value: 'dark', icon: Moon, emoji: '🌙' },
    { value: 'system', icon: Monitor, emoji: '💻' }
] as const;

export default function ThemeSwitcher() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const t = useTranslations('theme');

    if (!resolvedTheme) {
        return (
            <Button variant="outline" size="sm" className="gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
            </Button>
        );
    }

    const currentTheme = themes.find((t) => t.value === theme) || themes[2];
    const CurrentIcon = currentTheme.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CurrentIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t(currentTheme.value)}</span>
                    <span className="sm:hidden">{currentTheme.emoji}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                        <DropdownMenuItem key={themeOption.value} onClick={() => setTheme(themeOption.value)} className={theme === themeOption.value ? 'bg-accent' : ''}>
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{t(themeOption.value)}</span>
                            {theme === themeOption.value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
