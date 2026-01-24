'use client';

import { Clock, X, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from 'shadcn/card';
import { Button } from 'shadcn/button';
import { ScrollArea } from 'shadcn/scroll-area';
import { Badge } from 'shadcn/badge';
import type { SearchHistoryItem } from '@/hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  isLoading: boolean;
  onSelectSearch: (filters: SearchHistoryItem['filters']) => void;
  onRemoveSearch: (id: string) => void;
  onClearHistory: () => void;
}

/**
 * Component to display and manage search history
 * Shows recent searches with ability to reload, remove individual items, or clear all
 */
export function SearchHistory({ history, isLoading, onSelectSearch, onRemoveSearch, onClearHistory }: SearchHistoryProps) {
    const t = useTranslations('products.history');
    const locale = useLocale();

    const formatTimestamp = (timestamp: number): string => {
    // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return t('timeAgo.justNow');
        }
        if (minutes < 60) {
            return t('timeAgo.minutesAgo', { minutes });
        }
        if (hours < 24) {
            return t('timeAgo.hoursAgo', { hours });
        }
        if (days < 7) {
            return t('timeAgo.daysAgo', { days });
        }
        return new Date(timestamp).toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return null;
    }

    if (history.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {history.length}
                        </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t('clearAll')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                        {history.map((item) => (
                            <div key={item.id} className="group flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <button onClick={() => onSelectSearch(item.filters)} className="flex-1 text-left min-w-0" title={t('loadSearch')}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium truncate flex-1">{item.description}</p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(item.timestamp)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.filters.searchQuery && (
                                            <Badge variant="outline" className="text-xs">
                                                {item.filters.searchQuery}
                                            </Badge>
                                        )}
                                        {item.filters.warehouseId && (
                                            <Badge variant="outline" className="text-xs">
                                                {t('filters.warehouse')}
                                                {item.filters.warehouseId}
                                            </Badge>
                                        )}
                                        {item.filters.locationId && (
                                            <Badge variant="outline" className="text-xs">
                                                {t('filters.location')}
                                                {item.filters.locationId}
                                            </Badge>
                                        )}
                                        {(item.filters.minPrice || item.filters.maxPrice) && (
                                            <Badge variant="outline" className="text-xs">
                                                {item.filters.minPrice || '0'} - {item.filters.maxPrice || '∞'} PLN
                                            </Badge>
                                        )}
                                        {(item.filters.minQuantity || item.filters.maxQuantity) && (
                                            <Badge variant="outline" className="text-xs">
                                                {t('filters.qty')}: {item.filters.minQuantity || '0'} - {item.filters.maxQuantity || '∞'}
                                            </Badge>
                                        )}
                                        {item.filters.isAvailable && (
                                            <Badge variant="outline" className="text-xs">
                                                {t('filters.available')}
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveSearch(item.id);
                                    }}
                                    title={t('removeFromHistory')}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
