import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id: string;
  timestamp: number;
  filters: {
    searchQuery?: string;
    warehouseId?: number | null;
    locationId?: number | null;
    minPrice?: string;
    maxPrice?: string;
    minQuantity?: string;
    maxQuantity?: string;
    isAvailable?: boolean;
  };
  description: string;
}

const STORAGE_KEY = 'product_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook for managing search history in localStorage
 * Stores last 10 searches with automatic deduplication
 */
export function useSearchHistory() {
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as SearchHistoryItem[];
                setHistory(parsed);
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            setHistory(newHistory);
        } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                const reducedHistory = newHistory.slice(0, 5);
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
                    setHistory(reducedHistory);
                } catch {}
            }
        }
    }, []);

    const generateDescription = useCallback((filters: SearchHistoryItem['filters']): string => {
        const parts: string[] = [];

        if (filters.searchQuery) {
            parts.push(`"${filters.searchQuery}"`);
        }
        if (filters.warehouseId) {
            parts.push(`Warehouse #${filters.warehouseId}`);
        }
        if (filters.locationId) {
            parts.push(`Location #${filters.locationId}`);
        }
        if (filters.minPrice || filters.maxPrice) {
            const priceRange = [filters.minPrice ? `${filters.minPrice} PLN` : '', filters.maxPrice ? `${filters.maxPrice} PLN` : ''].filter(Boolean).join(' - ');
            parts.push(`Price: ${priceRange}`);
        }
        if (filters.minQuantity || filters.maxQuantity) {
            const qtyRange = [filters.minQuantity || '', filters.maxQuantity || ''].filter(Boolean).join(' - ');
            parts.push(`Qty: ${qtyRange}`);
        }
        if (filters.isAvailable) {
            parts.push('Available only');
        }

        return parts.length > 0 ? parts.join(' • ') : 'All products';
    }, []);

    const isDuplicate = useCallback(
        (filters: SearchHistoryItem['filters']): boolean => {
            return history.some((item) => {
                return item.filters.searchQuery === filters.searchQuery && item.filters.warehouseId === filters.warehouseId && item.filters.locationId === filters.locationId && item.filters.minPrice === filters.minPrice && item.filters.maxPrice === filters.maxPrice && item.filters.minQuantity === filters.minQuantity && item.filters.maxQuantity === filters.maxQuantity && item.filters.isAvailable === filters.isAvailable;
            });
        },
        [history]
    );

    const addSearch = useCallback(
        (filters: SearchHistoryItem['filters']) => {
            if (isDuplicate(filters)) {
                return;
            }

            const newItem: SearchHistoryItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                filters,
                description: generateDescription(filters)
            };

            const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
            saveHistory(newHistory);
        },
        [history, isDuplicate, generateDescription, saveHistory]
    );

    const removeSearch = useCallback(
        (id: string) => {
            const newHistory = history.filter((item) => item.id !== id);
            saveHistory(newHistory);
        },
        [history, saveHistory]
    );

    const clearHistory = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setHistory([]);
        } catch {}
    }, []);

    return {
        history,
        isLoading,
        addSearch,
        removeSearch,
        clearHistory
    };
}
