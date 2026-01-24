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

    const getWarehouseById = useCallback(
        (warehouseId: number): Warehouse | undefined => {
            if (cache[warehouseId]) {
                return cache[warehouseId].warehouse;
            }
            return allWarehouses.find((w) => w.id === warehouseId);
        },
        [cache, allWarehouses]
    );

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

    const loadWarehouseWithLocations = useCallback(
        async (warehouseId: number): Promise<WarehouseCacheEntry | null> => {
            const existing = cache[warehouseId];
            if (existing && Date.now() - existing.lastFetched < CACHE_TTL) {
                return existing;
            }

            try {
                const warehouse = allWarehouses.find((w) => w.id === warehouseId);
                if (!warehouse) {
                    throw new Error(`Warehouse ${warehouseId} not found`);
                }

                const locations = await getLocations(warehouseId);

                const entry: WarehouseCacheEntry = {
                    warehouse,
                    locations,
                    lastFetched: Date.now()
                };

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

    const getWarehouseName = useCallback(
        (warehouseId: number): string | undefined => {
            const warehouse = getWarehouseById(warehouseId);
            return warehouse?.name;
        },
        [getWarehouseById]
    );

    const getWarehouseCode = useCallback(
        (warehouseId: number): string | undefined => {
            const warehouse = getWarehouseById(warehouseId);
            return warehouse?.code;
        },
        [getWarehouseById]
    );

    const getLocationCode = useCallback(
        (warehouseId: number, locationId: number): string | undefined => {
            const location = getLocationById(warehouseId, locationId);
            return location?.locationCode;
        },
        [getLocationById]
    );

    const getLocationZoneName = useCallback(
        (warehouseId: number, locationId: number): string | undefined => {
            const location = getLocationById(warehouseId, locationId);
            return location?.zoneName;
        },
        [getLocationById]
    );

    const getLocationContext = useCallback(
        async (warehouseId: number, locationId: number) => {
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

    const preloadWarehouses = useCallback(
        async (warehouseIds: number[]) => {
            const promises = warehouseIds.map((id) => loadWarehouseWithLocations(id));
            await Promise.all(promises);
        },
        [loadWarehouseWithLocations]
    );

    return {
        allWarehouses,
        isLoading,
        error,
        cache,

        getWarehouseById,
        getLocationById,
        getWarehouseName,
        getWarehouseCode,
        getLocationCode,
        getLocationZoneName,
        getLocationContext,

        loadWarehouseWithLocations,
        preloadWarehouses,
        clearCache
    };
}
