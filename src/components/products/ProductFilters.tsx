'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { getWarehouses, getLocations, ApiError } from '@/lib/api';
import type { Warehouse, Location } from '@/types';

interface ProductFiltersProps {
  selectedWarehouseId: number | null;
  selectedLocationId: number | null;
  onWarehouseChange: (warehouseId: number | null) => void;
  onLocationChange: (locationId: number | null) => void;
}

export function ProductFilters({ selectedWarehouseId, selectedLocationId, onWarehouseChange, onLocationChange }: ProductFiltersProps) {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Fetch warehouses on mount
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setIsLoadingWarehouses(true);
                const data = await getWarehouses();
                setWarehouses(data);
            } catch (err) {
                const message = err instanceof ApiError ? err.message : 'An error occurred while fetching warehouses';
                toast.error(message);
            } finally {
                setIsLoadingWarehouses(false);
            }
        };

        fetchWarehouses();
    }, []);

    // Fetch locations when warehouse changes
    useEffect(() => {
        if (!selectedWarehouseId) {
            setLocations([]);
            return;
        }

        const fetchLocations = async () => {
            try {
                setIsLoadingLocations(true);
                const data = await getLocations(selectedWarehouseId);
                setLocations(data);
            } catch (err) {
                const message = err instanceof ApiError ? err.message : 'An error occurred while fetching locations';
                toast.error(message);
                setLocations([]);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        fetchLocations();
    }, [selectedWarehouseId]);

    const handleWarehouseChange = (value: string) => {
        const warehouseId = value === 'none' ? null : parseInt(value, 10);
        onWarehouseChange(warehouseId);
        onLocationChange(null); // Reset location when warehouse changes
    };

    const handleLocationChange = (value: string) => {
        const locationId = value === 'none' ? null : parseInt(value, 10);
        onLocationChange(locationId);
    };

    const getLocationTypeBadgeVariant = (type: Location['locationType']) => {
        switch (type) {
            case 'PICKING':
                return 'default';
            case 'BULK':
                return 'secondary';
            case 'RECEIVING':
                return 'outline';
            case 'SHIPPING':
                return 'default';
            case 'RETURNS':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getLocationTypeLabel = (type: Location['locationType']) => {
        switch (type) {
            case 'PICKING':
                return 'Picking';
            case 'BULK':
                return 'Bulk Storage';
            case 'RECEIVING':
                return 'Receiving';
            case 'SHIPPING':
                return 'Shipping';
            case 'RETURNS':
                return 'Returns';
            default:
                return type;
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Warehouse selector */}
                    <div className="space-y-2">
                        <Label htmlFor="warehouse-select" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
              Warehouse
                        </Label>
                        {isLoadingWarehouses ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedWarehouseId?.toString() ?? 'none'} onValueChange={handleWarehouseChange}>
                                <SelectTrigger id="warehouse-select">
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select warehouse</SelectItem>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span>{warehouse.name}</span>
                                                <code className="text-xs text-muted-foreground">({warehouse.code})</code>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Location selector */}
                    <div className="space-y-2">
                        <Label htmlFor="location-select" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
              Location
                        </Label>
                        {isLoadingLocations ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedLocationId?.toString() ?? 'none'} onValueChange={handleLocationChange} disabled={!selectedWarehouseId}>
                                <SelectTrigger id="location-select">
                                    <SelectValue placeholder={selectedWarehouseId ? 'Select location' : 'Select warehouse first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select location</SelectItem>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span>{location.locationCode}</span>
                                                <Badge variant={getLocationTypeBadgeVariant(location.locationType)} className="text-xs">
                                                    {getLocationTypeLabel(location.locationType)}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                {/* Info messages */}
                {!selectedWarehouseId && !isLoadingWarehouses && <p className="mt-4 text-sm text-muted-foreground">Select a warehouse to see available locations and products.</p>}
                {selectedWarehouseId && !selectedLocationId && !isLoadingLocations && <p className="mt-4 text-sm text-muted-foreground">Select a location to see products.</p>}
            </CardContent>
        </Card>
    );
}
