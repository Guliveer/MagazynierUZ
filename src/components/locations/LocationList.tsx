'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ApiError, createLocation, deleteLocation, getLocations, updateLocation } from '@/lib/api';
import type { CreateLocationRequest, Location, LocationType } from '@/types';
import { MapPin, Pencil, Plus, Trash2, Lock, Package } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteLocationDialog } from './DeleteLocationDialog';
import { LocationDialog } from './LocationDialog';
import { PdfExportButton } from '@/components/exports/PdfExportButton';

interface LocationListProps {
  warehouseId: number;
  warehouseName: string;
}

// Location type badge colors
const LOCATION_TYPE_COLORS: Record<LocationType, string> = {
    PICKING: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    BULK: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    RECEIVING: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    SHIPPING: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    RETURNS: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
};

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
    PICKING: 'Picking',
    BULK: 'Bulk Storage',
    RECEIVING: 'Receiving',
    SHIPPING: 'Shipping',
    RETURNS: 'Returns'
};

export function LocationList({ warehouseId, warehouseName }: LocationListProps) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter and sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<LocationType | 'ALL'>('ALL');
    const [filterZone, setFilterZone] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'>('ALL');
    const [sortBy, setSortBy] = useState<'code' | 'type' | 'zone'>('code');

    const fetchLocations = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getLocations(warehouseId);
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while fetching locations';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [warehouseId]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // Get unique zones for filter
    const uniqueZones = useMemo(() => {
        const zones = new Set(locations.map((loc) => loc.zoneName));
        return Array.from(zones).sort();
    }, [locations]);

    // Filter and sort locations
    const filteredLocations = useMemo(() => {
        const filtered = locations.filter((location) => {
            // Search filter
            if (searchQuery && !location.locationCode.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'ALL' && location.locationType !== filterType) {
                return false;
            }

            // Zone filter
            if (filterZone !== 'ALL' && location.zoneName !== filterZone) {
                return false;
            }

            // Status filter
            if (filterStatus === 'ACTIVE' && !location.isActive) {
                return false;
            }
            if (filterStatus === 'INACTIVE' && location.isActive) {
                return false;
            }
            if (filterStatus === 'LOCKED' && !location.isLocked) {
                return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'code') {
                return a.locationCode.localeCompare(b.locationCode);
            }
            if (sortBy === 'type') {
                return a.locationType.localeCompare(b.locationType);
            }
            if (sortBy === 'zone') {
                return a.zoneName.localeCompare(b.zoneName);
            }
            return 0;
        });

        return filtered;
    }, [locations, searchQuery, filterType, filterZone, filterStatus, sortBy]);

    const handleAddClick = () => {
        setSelectedLocation(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (location: Location) => {
        setSelectedLocation(location);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (location: Location) => {
        setSelectedLocation(location);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (data: CreateLocationRequest) => {
        try {
            setIsSaving(true);
            if (selectedLocation) {
                await updateLocation(warehouseId, selectedLocation.id, data);
                toast.success('Location has been updated');
            } else {
                await createLocation(warehouseId, data);
                toast.success('Location has been added');
            }
            setIsDialogOpen(false);
            await fetchLocations();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while saving the location';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedLocation) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteLocation(warehouseId, selectedLocation.id);
            toast.success('Location has been deleted');
            setIsDeleteDialogOpen(false);
            await fetchLocations();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while deleting the location';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-36" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Zone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Locations in {warehouseName}</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add Location
                    </Button>
                </div>
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchLocations}>
            Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (locations.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Locations in {warehouseName}</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add Location
                    </Button>
                </div>
                <Empty className="border rounded-lg py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MapPin />
                        </EmptyMedia>
                        <EmptyTitle>No locations</EmptyTitle>
                        <EmptyDescription>This warehouse doesn&apos;t have any locations yet. Add your first location to start organizing products.</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add First Location
                    </Button>
                </Empty>

                <LocationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} location={selectedLocation} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        );
    }

    // Normal state with data
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Locations in {warehouseName}</h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredLocations.length} of {locations.length} locations
                    </p>
                </div>
                <div className="flex gap-2">
                    <PdfExportButton scope="WAREHOUSE" warehouseId={warehouseId} variant="outline" size="default" label="Export Warehouse PDF" />
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add Location
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Input placeholder="Search by code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />

                <Select value={filterType} onValueChange={(value) => setFilterType(value as LocationType | 'ALL')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="PICKING">Picking</SelectItem>
                        <SelectItem value="BULK">Bulk Storage</SelectItem>
                        <SelectItem value="RECEIVING">Receiving</SelectItem>
                        <SelectItem value="SHIPPING">Shipping</SelectItem>
                        <SelectItem value="RETURNS">Returns</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterZone} onValueChange={setFilterZone}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Zones</SelectItem>
                        {uniqueZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                                {zone}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="LOCKED">Locked</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'code' | 'type' | 'zone')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="code">Sort by Code</SelectItem>
                        <SelectItem value="type">Sort by Type</SelectItem>
                        <SelectItem value="zone">Sort by Zone</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLocations.map((location) => (
                            <TableRow key={location.id}>
                                <TableCell className="font-medium">
                                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{location.locationCode}</code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={LOCATION_TYPE_COLORS[location.locationType]}>
                                        {LOCATION_TYPE_LABELS[location.locationType]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Package className="h-3.5 w-3.5" />
                                        {location.zoneName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Badge variant={location.isActive ? 'default' : 'secondary'}>{location.isActive ? 'Active' : 'Inactive'}</Badge>
                                        {location.isLocked && (
                                            <Badge variant="outline" className="gap-1">
                                                <Lock className="h-3 w-3" />
                        Locked
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <PdfExportButton scope="LOCATION" warehouseId={warehouseId} locationId={location.id} variant="ghost" size="icon" className="h-8 w-8" label="" />
                                        <Button variant="ghost" size="icon-sm" onClick={() => handleEditClick(location)} title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(location)} title="Delete">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <LocationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} location={selectedLocation} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteLocationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} location={selectedLocation} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
