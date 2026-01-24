'use client';

import { Badge } from 'shadcn/badge';
import { Button } from 'shadcn/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'shadcn/empty';
import { Skeleton } from 'shadcn/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shadcn/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shadcn/select';
import { Input } from 'shadcn/input';
import { ApiError, createLocation, deleteLocation, getLocations, updateLocation } from '@/lib/api';
import type { CreateLocationRequest, Location, LocationType } from '@/types';
import { MapPin, Pencil, Plus, Trash2, Lock, Package } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteLocationDialog } from './DeleteLocationDialog';
import { LocationDialog } from './LocationDialog';
import { PdfExportButton } from '@/components/exports/PdfExportButton';
import { useTranslations } from 'next-intl';

interface LocationListProps {
  warehouseId: number;
  warehouseName: string;
}

const LOCATION_TYPE_COLORS: Record<LocationType, string> = {
    PICKING: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    BULK: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    RECEIVING: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    SHIPPING: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    RETURNS: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
};

export function LocationList({ warehouseId, warehouseName }: LocationListProps) {
    const t = useTranslations('locations');
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
            const message = err instanceof ApiError ? err.message : t('messages.fetchError');
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [warehouseId, t]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const uniqueZones = useMemo(() => {
        const zones = new Set(locations.map((loc) => loc.zoneName));
        return Array.from(zones).sort();
    }, [locations]);

    const filteredLocations = useMemo(() => {
        const filtered = locations.filter((location) => {
            if (searchQuery && !location.locationCode.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            if (filterType !== 'ALL' && location.locationType !== filterType) {
                return false;
            }

            if (filterZone !== 'ALL' && location.zoneName !== filterZone) {
                return false;
            }

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
                toast.success(t('messages.updated'));
            } else {
                await createLocation(warehouseId, data);
                toast.success(t('messages.created'));
            }
            setIsDialogOpen(false);
            await fetchLocations();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.createError');
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
            toast.success(t('messages.deleted'));
            setIsDeleteDialogOpen(false);
            await fetchLocations();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.deleteError');
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

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
                                <TableHead>{t('table.locationCode')}</TableHead>
                                <TableHead>{t('table.type')}</TableHead>
                                <TableHead>{t('table.zone')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead className="text-right">{t('table.actions')}</TableHead>
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

    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">{t('title', { warehouseName })}</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addLocation')}
                    </Button>
                </div>
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchLocations}>
                        {t('messages.tryAgain')}
                    </Button>
                </div>
            </div>
        );
    }

    if (locations.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">{t('title', { warehouseName })}</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addLocation')}
                    </Button>
                </div>
                <Empty className="border rounded-lg py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MapPin />
                        </EmptyMedia>
                        <EmptyTitle>{t('empty.title')}</EmptyTitle>
                        <EmptyDescription>{t('empty.description')}</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addFirstLocation')}
                    </Button>
                </Empty>

                <LocationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} location={selectedLocation} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('title', { warehouseName })}</h2>
                    <p className="text-sm text-muted-foreground">{t('showing', { filtered: filteredLocations.length, total: locations.length })}</p>
                </div>
                <div className="flex gap-2">
                    <PdfExportButton scope="WAREHOUSE" warehouseId={warehouseId} variant="outline" size="default" label={t('exportWarehousePdf')} />
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addLocation')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Input placeholder={t('search.placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />

                <Select value={filterType} onValueChange={(value) => setFilterType(value as LocationType | 'ALL')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('filters.type')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('filters.allTypes')}</SelectItem>
                        <SelectItem value="PICKING">{t('types.PICKING')}</SelectItem>
                        <SelectItem value="BULK">{t('types.BULK')}</SelectItem>
                        <SelectItem value="RECEIVING">{t('types.RECEIVING')}</SelectItem>
                        <SelectItem value="SHIPPING">{t('types.SHIPPING')}</SelectItem>
                        <SelectItem value="RETURNS">{t('types.RETURNS')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterZone} onValueChange={setFilterZone}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('filters.zone')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('filters.allZones')}</SelectItem>
                        {uniqueZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                                {zone}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('filters.status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('filters.allStatus')}</SelectItem>
                        <SelectItem value="ACTIVE">{t('filters.active')}</SelectItem>
                        <SelectItem value="INACTIVE">{t('filters.inactive')}</SelectItem>
                        <SelectItem value="LOCKED">{t('filters.locked')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'code' | 'type' | 'zone')}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('filters.sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="code">{t('filters.sortByCode')}</SelectItem>
                        <SelectItem value="type">{t('filters.sortByType')}</SelectItem>
                        <SelectItem value="zone">{t('filters.sortByZone')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.locationCode')}</TableHead>
                            <TableHead>{t('table.type')}</TableHead>
                            <TableHead>{t('table.zone')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                                        {t(`types.${location.locationType}`)}
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
                                        <Badge variant={location.isActive ? 'default' : 'secondary'}>{location.isActive ? t('filters.active') : t('filters.inactive')}</Badge>
                                        {location.isLocked && (
                                            <Badge variant="outline" className="gap-1">
                                                <Lock className="h-3 w-3" />
                                                {t('filters.locked')}
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
