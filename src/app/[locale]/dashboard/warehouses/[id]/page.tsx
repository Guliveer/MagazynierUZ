'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, getWarehouse } from '@/lib/api';
import type { Warehouse } from '@/types';
import { LocationList } from '@/components/locations/LocationList';
import { Skeleton } from 'shadcn/skeleton';
import { Button } from 'shadcn/button';
import { ArrowLeft, Building2, MapPin } from 'lucide-react';
import { Badge } from 'shadcn/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { Separator } from 'shadcn/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { PdfExportButton } from '@/components/exports/PdfExportButton';
import { useTranslations } from 'next-intl';

interface WarehouseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WarehouseDetailPage({ params }: WarehouseDetailPageProps) {
    const t = useTranslations('warehouses.detail');
    const tMessages = useTranslations('warehouses.messages');
    const router = useRouter();
    const { id } = use(params);
    const warehouseId = parseInt(id);
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWarehouse = async () => {
            if (isNaN(warehouseId)) {
                setError(t('invalidId'));
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const data = await getWarehouse(warehouseId);
                setWarehouse(data);
            } catch (err) {
                const message = err instanceof ApiError ? err.message : tMessages('fetchDetailError');
                setError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWarehouse();
    }, [warehouseId, t, tMessages]);

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    // Error state
    if (error || !warehouse) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/warehouses')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Details</h1>
                </div>
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive">{error || 'Warehouse not found'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/warehouses')}>
            Back to Warehouses
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header with breadcrumb */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/warehouses')} title="Back to warehouses">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href="/dashboard/warehouses" className="hover:text-foreground">
              Warehouses
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">{warehouse.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                </div>
            </div>

            {/* Warehouse Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Warehouse Information</CardTitle>
                                <CardDescription>Details and status of this warehouse</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <PdfExportButton scope="WAREHOUSE" warehouseId={warehouse.id} variant="outline" size="sm" label="Export PDF" />
                            <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>{warehouse.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Warehouse Code</p>
                                <code className="text-lg font-mono bg-muted px-2 py-1 rounded">{warehouse.code}</code>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Warehouse ID</p>
                                <p className="text-lg font-mono">{warehouse.id}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Address</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div className="text-sm">
                                        <p>
                                            {warehouse.address.street} {warehouse.address.houseNumber}
                                        </p>
                                        {warehouse.address.apartmentNumber && <p>Apt. {warehouse.address.apartmentNumber}</p>}
                                        <p>
                                            {warehouse.address.postcode} {warehouse.address.city}
                                        </p>
                                        {(warehouse.address.latitude !== 0 || warehouse.address.longitude !== 0) && (
                                            <p className="text-muted-foreground mt-1">
                                                {warehouse.address.latitude.toFixed(6)}, {warehouse.address.longitude.toFixed(6)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Locations Section */}
            <LocationList warehouseId={warehouse.id} warehouseName={warehouse.name} />
        </div>
    );
}
