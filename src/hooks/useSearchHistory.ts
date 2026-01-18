import { useState, useEffect, useCallback } from "react";

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

const STORAGE_KEY = "product_search_history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook for managing search history in localStorage
 * Stores last 10 searches with automatic deduplication
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save search history:", error);
      // Handle quota exceeded error
      if (error instanceof Error && error.name === "QuotaExceededError") {
        // Clear old items and try again
        const reducedHistory = newHistory.slice(0, 5);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
          setHistory(reducedHistory);
        } catch {
          console.error("Failed to save even reduced history");
        }
      }
    }
  }, []);

  // Generate description from filters
  const generateDescription = useCallback((filters: SearchHistoryItem["filters"]): string => {
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
      const priceRange = [filters.minPrice ? `${filters.minPrice} PLN` : "", filters.maxPrice ? `${filters.maxPrice} PLN` : ""].filter(Boolean).join(" - ");
      parts.push(`Price: ${priceRange}`);
    }
    if (filters.minQuantity || filters.maxQuantity) {
      const qtyRange = [filters.minQuantity || "", filters.maxQuantity || ""].filter(Boolean).join(" - ");
      parts.push(`Qty: ${qtyRange}`);
    }
    if (filters.isAvailable) {
      parts.push("Available only");
    }

    return parts.length > 0 ? parts.join(" • ") : "All products";
  }, []);

  // Check if filters match an existing history item
  const isDuplicate = useCallback(
    (filters: SearchHistoryItem["filters"]): boolean => {
      return history.some((item) => {
        return item.filters.searchQuery === filters.searchQuery && item.filters.warehouseId === filters.warehouseId && item.filters.locationId === filters.locationId && item.filters.minPrice === filters.minPrice && item.filters.maxPrice === filters.maxPrice && item.filters.minQuantity === filters.minQuantity && item.filters.maxQuantity === filters.maxQuantity && item.filters.isAvailable === filters.isAvailable;
      });
    },
    [history],
  );

  // Add a new search to history
  const addSearch = useCallback(
    (filters: SearchHistoryItem["filters"]) => {
      // Don't add if it's a duplicate
      if (isDuplicate(filters)) {
        return;
      }

      const newItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        filters,
        description: generateDescription(filters),
      };

      // Add to beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(newHistory);
    },
    [history, isDuplicate, generateDescription, saveHistory],
  );

  // Remove a specific search from history
  const removeSearch = useCallback(
    (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      saveHistory(newHistory);
    },
    [history, saveHistory],
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  }, []);

  return {
    history,
    isLoading,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
