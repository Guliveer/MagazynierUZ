'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWarehouses, getLocations, ApiError } from '@/lib/api';
import type { Warehouse, Location } from '@/types';

interface WarehouseCacheEntry {
  warehouse: Warehouse;
  locations: Location[];
  lastFetched: number;
}

interface WarehouseCache {
  [warehouseId: number]: WarehouseCacheEntry;
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Hook for caching warehouse and location data to minimize API calls
 * Provides efficient lookup of warehouse/location names and codes
 */
export function useWarehouseCache() {
    const [cache, setCache] = useState<WarehouseCache>({});
    const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load all warehouses on mount
    useEffect(() => {
        const loadWarehouses = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const warehouses = await getWarehouses();
                setAllWarehouses(warehouses);
            } catch (err) {
                const message = err instanceof ApiError ? err.message : 'Failed to load warehouses';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        loadWarehouses();
    }, []);

    /**
   * Get warehouse by ID from cache or all warehouses list
   */
    const getWarehouseById = useCallback(
        (warehouseId: number): Warehouse | undefined => {
            // Check cache first
            if (cache[warehouseId]) {
                return cache[warehouseId].warehouse;
            }
            // Fallback to all warehouses list
            return allWarehouses.find((w) => w.id === warehouseId);
        },
        [cache, allWarehouses]
    );

    /**
   * Get location by ID from cache
   * Requires warehouse ID to know where to look
   */
    const getLocationById = useCallback(
        (warehouseId: number, locationId: number): Location | undefined => {
            const entry = cache[warehouseId];
            if (!entry) {
                return undefined;
            }
            return entry.locations.find((l) => l.id === locationId);
        },
        [cache]
    );

    /**
   * Load warehouse and its locations into cache
   * Returns the cached entry or fetches from API if needed
   */
    const loadWarehouseWithLocations = useCallback(
        async (warehouseId: number): Promise<WarehouseCacheEntry | null> => {
            // Check if cache is still valid
            const existing = cache[warehouseId];
            if (existing && Date.now() - existing.lastFetched < CACHE_TTL) {
                return existing;
            }

            try {
                // Find warehouse in all warehouses list
                const warehouse = allWarehouses.find((w) => w.id === warehouseId);
                if (!warehouse) {
                    throw new Error(`Warehouse ${warehouseId} not found`);
                }

                // Fetch locations
                const locations = await getLocations(warehouseId);

                const entry: WarehouseCacheEntry = {
                    warehouse,
                    locations,
                    lastFetched: Date.now()
                };

                // Update cache
                setCache((prev) => ({
                    ...prev,
                    [warehouseId]: entry
                }));

                return entry;
            } catch (err) {
                const message = err instanceof ApiError ? err.message : 'Failed to load warehouse data';
                setError(message);
                return null;
            }
        },
        [cache, allWarehouses]
    );

    /**
   * Get warehouse name by ID
   */
    const getWarehouseName = useCallback(
        (warehouseId: number): string | undefined => {
            const warehouse = getWarehouseById(warehouseId);
            return warehouse?.name;
        },
        [getWarehouseById]
    );

    /**
   * Get warehouse code by ID
   */
    const getWarehouseCode = useCallback(
        (warehouseId: number): string | undefined => {
            const warehouse = getWarehouseById(warehouseId);
            return warehouse?.code;
        },
        [getWarehouseById]
    );

    /**
   * Get location code by ID
   */
    const getLocationCode = useCallback(
        (warehouseId: number, locationId: number): string | undefined => {
            const location = getLocationById(warehouseId, locationId);
            return location?.locationCode;
        },
        [getLocationById]
    );

    /**
   * Get location zone name by ID
   */
    const getLocationZoneName = useCallback(
        (warehouseId: number, locationId: number): string | undefined => {
            const location = getLocationById(warehouseId, locationId);
            return location?.zoneName;
        },
        [getLocationById]
    );

    /**
   * Get full context for a product location
   */
    const getLocationContext = useCallback(
        async (warehouseId: number, locationId: number) => {
            // Ensure warehouse and locations are loaded
            await loadWarehouseWithLocations(warehouseId);

            const warehouse = getWarehouseById(warehouseId);
            const location = getLocationById(warehouseId, locationId);

            return {
                warehouseName: warehouse?.name,
                warehouseCode: warehouse?.code,
                locationCode: location?.locationCode,
                zoneName: location?.zoneName,
                locationType: location?.locationType
            };
        },
        [loadWarehouseWithLocations, getWarehouseById, getLocationById]
    );

    /**
   * Clear cache for a specific warehouse or all warehouses
   */
    const clearCache = useCallback((warehouseId?: number) => {
        if (warehouseId !== undefined) {
            setCache((prev) => {
                const newCache = { ...prev };
                delete newCache[warehouseId];
                return newCache;
            });
        } else {
            setCache({});
        }
    }, []);

    /**
   * Preload multiple warehouses into cache
   * Useful when displaying products from multiple warehouses
   */
    const preloadWarehouses = useCallback(
        async (warehouseIds: number[]) => {
            const promises = warehouseIds.map((id) => loadWarehouseWithLocations(id));
            await Promise.all(promises);
        },
        [loadWarehouseWithLocations]
    );

    return {
    // State
        allWarehouses,
        isLoading,
        error,
        cache,

        // Getters
        getWarehouseById,
        getLocationById,
        getWarehouseName,
        getWarehouseCode,
        getLocationCode,
        getLocationZoneName,
        getLocationContext,

        // Actions
        loadWarehouseWithLocations,
        preloadWarehouses,
        clearCache
    };
}
