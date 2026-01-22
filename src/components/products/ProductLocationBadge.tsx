'use client';

import { Building2, MapPin, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LocationType } from '@/types';

interface ProductLocationBadgeProps {
  warehouseName?: string;
  warehouseCode?: string;
  locationCode?: string;
  zoneName?: string;
  locationType?: LocationType;
  onWarehouseClick?: () => void;
  onLocationClick?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Reusable component for displaying product location information
 * Shows warehouse and location with visual indicators
 * Supports click handlers for navigation
 */
export function ProductLocationBadge({ warehouseName, warehouseCode, locationCode, zoneName, locationType, onWarehouseClick, onLocationClick, compact = false, className = '' }: ProductLocationBadgeProps) {
    // If no location data, show unknown
    if (!warehouseName && !warehouseCode && !locationCode) {
        return (
            <Badge variant="outline" className={`gap-1 ${className}`}>
                <Package className="h-3 w-3" />
        Unknown Location
            </Badge>
        );
    }

    // Get location type badge variant
    const getLocationTypeBadgeVariant = (type?: LocationType) => {
        if (!type) { return 'secondary'; }
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

    // Get location type label
    const getLocationTypeLabel = (type?: LocationType) => {
        if (!type) { return ''; }
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

    // Compact view - single badge with tooltip
    if (compact) {
        const tooltipContent = (
            <div className="space-y-1 text-xs">
                {warehouseName && (
                    <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="font-medium">{warehouseName}</span>
                        {warehouseCode && <code className="text-xs">({warehouseCode})</code>}
                    </div>
                )}
                {locationCode && (
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{locationCode}</span>
                        {zoneName && <span className="text-muted-foreground">- {zoneName}</span>}
                    </div>
                )}
                {locationType && <div className="text-muted-foreground">Type: {getLocationTypeLabel(locationType)}</div>}
            </div>
        );

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={`gap-1 cursor-help ${className}`}>
                            <Building2 className="h-3 w-3" />
                            {warehouseCode || warehouseName}
                            {locationCode && (
                                <>
                                    <span className="text-muted-foreground">/</span>
                                    <MapPin className="h-3 w-3" />
                                    {locationCode}
                                </>
                            )}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        {tooltipContent}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Full view - separate badges for warehouse and location
    return (
        <div className={`flex flex-wrap items-center gap-1 ${className}`}>
            {/* Warehouse badge */}
            {(warehouseName || warehouseCode) && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="secondary" className={`gap-1 ${onWarehouseClick ? 'cursor-pointer hover:bg-secondary/80' : ''}`} onClick={onWarehouseClick}>
                                <Building2 className="h-3 w-3" />
                                {warehouseCode || warehouseName}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <div className="text-xs">
                                <div className="font-medium">{warehouseName}</div>
                                {warehouseCode && <code className="text-muted-foreground">Code: {warehouseCode}</code>}
                                {onWarehouseClick && <div className="text-muted-foreground mt-1">Click to filter by warehouse</div>}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Location badge */}
            {locationCode && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant={getLocationTypeBadgeVariant(locationType)} className={`gap-1 ${onLocationClick ? 'cursor-pointer hover:opacity-80' : ''}`} onClick={onLocationClick}>
                                <MapPin className="h-3 w-3" />
                                {locationCode}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <div className="text-xs">
                                <div className="font-medium">{locationCode}</div>
                                {zoneName && <div className="text-muted-foreground">Zone: {zoneName}</div>}
                                {locationType && <div className="text-muted-foreground">Type: {getLocationTypeLabel(locationType)}</div>}
                                {onLocationClick && <div className="text-muted-foreground mt-1">Click to filter by location</div>}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}
