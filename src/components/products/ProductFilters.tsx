"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Search, X, ChevronDown, ChevronUp, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { getWarehouses, getLocations, ApiError } from "@/lib/api";
import type { Warehouse, Location } from "@/types";

export interface ProductFilterValues {
  searchQuery: string;
  warehouseId: number | null;
  locationId: number | null;
  minPrice: string;
  maxPrice: string;
  minQuantity: string;
  maxQuantity: string;
  isAvailable: boolean;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onFiltersChange: (filters: ProductFilterValues) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

export function ProductFilters({ filters, onFiltersChange, onSearch, isSearching = false }: ProductFiltersProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fetch warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoadingWarehouses(true);
        const data = await getWarehouses();
        setWarehouses(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "An error occurred while fetching warehouses";
        toast.error(message);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Fetch locations when warehouse changes
  useEffect(() => {
    if (!filters.warehouseId) {
      setLocations([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const data = await getLocations(filters.warehouseId!);
        setLocations(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "An error occurred while fetching locations";
        toast.error(message);
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [filters.warehouseId]);

  const handleWarehouseChange = (value: string) => {
    const warehouseId = value === "none" ? null : parseInt(value, 10);
    onFiltersChange({
      ...filters,
      warehouseId,
      locationId: null, // Reset location when warehouse changes
    });
  };

  const handleLocationChange = (value: string) => {
    const locationId = value === "none" ? null : parseInt(value, 10);
    onFiltersChange({
      ...filters,
      locationId,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: "",
      warehouseId: null,
      locationId: null,
      minPrice: "",
      maxPrice: "",
      minQuantity: "",
      maxQuantity: "",
      isAvailable: false,
    });
  };

  const hasActiveFilters = filters.searchQuery || filters.warehouseId || filters.locationId || filters.minPrice || filters.maxPrice || filters.minQuantity || filters.maxQuantity || filters.isAvailable;

  const getLocationTypeBadgeVariant = (type: Location["locationType"]) => {
    switch (type) {
      case "PICKING":
        return "default";
      case "BULK":
        return "secondary";
      case "RECEIVING":
        return "outline";
      case "SHIPPING":
        return "default";
      case "RETURNS":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getLocationTypeLabel = (type: Location["locationType"]) => {
    switch (type) {
      case "PICKING":
        return "Picking";
      case "BULK":
        return "Bulk Storage";
      case "RECEIVING":
        return "Receiving";
      case "SHIPPING":
        return "Shipping";
      case "RETURNS":
        return "Returns";
      default:
        return type;
    }
  };

  // Validate price range
  const isPriceRangeValid = () => {
    if (!filters.minPrice || !filters.maxPrice) return true;
    const min = parseFloat(filters.minPrice);
    const max = parseFloat(filters.maxPrice);
    return !isNaN(min) && !isNaN(max) && min <= max;
  };

  // Validate quantity range
  const isQuantityRangeValid = () => {
    if (!filters.minQuantity || !filters.maxQuantity) return true;
    const min = parseInt(filters.minQuantity, 10);
    const max = parseInt(filters.maxQuantity, 10);
    return !isNaN(min) && !isNaN(max) && min <= max;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="search-input" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Products
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Search by product name or description..."
                  value={filters.searchQuery}
                  onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearch();
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button onClick={onSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Basic filters */}
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
                <Select value={filters.warehouseId?.toString() ?? "none"} onValueChange={handleWarehouseChange}>
                  <SelectTrigger id="warehouse-select">
                    <SelectValue placeholder="All warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All warehouses</SelectItem>
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
                <Select value={filters.locationId?.toString() ?? "none"} onValueChange={handleLocationChange} disabled={!filters.warehouseId}>
                  <SelectTrigger id="location-select">
                    <SelectValue placeholder={filters.warehouseId ? "All locations" : "Select warehouse first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All locations</SelectItem>
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

          {/* Advanced filters */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  Advanced Filters
                  {(filters.minPrice || filters.maxPrice || filters.minQuantity || filters.maxQuantity || filters.isAvailable) && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </span>
                {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Price range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range (PLN)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Min price" value={filters.minPrice} onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })} min="0" step="0.01" />
                  <Input type="number" placeholder="Max price" value={filters.maxPrice} onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })} min="0" step="0.01" />
                </div>
                {!isPriceRangeValid() && <p className="text-sm text-destructive">Min price must be less than or equal to max price</p>}
              </div>

              {/* Quantity range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Quantity Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Min quantity" value={filters.minQuantity} onChange={(e) => onFiltersChange({ ...filters, minQuantity: e.target.value })} min="0" step="1" />
                  <Input type="number" placeholder="Max quantity" value={filters.maxQuantity} onChange={(e) => onFiltersChange({ ...filters, maxQuantity: e.target.value })} min="0" step="1" />
                </div>
                {!isQuantityRangeValid() && <p className="text-sm text-destructive">Min quantity must be less than or equal to max quantity</p>}
              </div>

              {/* Availability toggle */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="availability-toggle" className="flex-1 cursor-pointer">
                  Show only available products (quantity &gt; 0)
                </Label>
                <Switch id="availability-toggle" checked={filters.isAvailable} onCheckedChange={(checked) => onFiltersChange({ ...filters, isAvailable: checked })} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Active filters chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, searchQuery: "" })} />
                </Badge>
              )}
              {filters.warehouseId && (
                <Badge variant="secondary" className="gap-1">
                  Warehouse: {warehouses.find((w) => w.id === filters.warehouseId)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, warehouseId: null, locationId: null })} />
                </Badge>
              )}
              {filters.locationId && (
                <Badge variant="secondary" className="gap-1">
                  Location: {locations.find((l) => l.id === filters.locationId)?.locationCode}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, locationId: null })} />
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  Price: {filters.minPrice || "0"} - {filters.maxPrice || "∞"} PLN
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, minPrice: "", maxPrice: "" })} />
                </Badge>
              )}
              {(filters.minQuantity || filters.maxQuantity) && (
                <Badge variant="secondary" className="gap-1">
                  Quantity: {filters.minQuantity || "0"} - {filters.maxQuantity || "∞"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, minQuantity: "", maxQuantity: "" })} />
                </Badge>
              )}
              {filters.isAvailable && (
                <Badge variant="secondary" className="gap-1">
                  Available only
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, isAvailable: false })} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-6 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
