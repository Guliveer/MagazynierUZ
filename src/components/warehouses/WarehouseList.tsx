'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';

import { WarehouseDialog } from './WarehouseDialog';
import { DeleteWarehouseDialog } from './DeleteWarehouseDialog';

import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, ApiError } from '@/lib/api';
import type { Warehouse, CreateWarehouseRequest } from '@/types';

export function WarehouseList() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchWarehouses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getWarehouses();
            // Protection against null/undefined - always set an array
            setWarehouses(Array.isArray(data) ? data : []);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while fetching warehouses';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const handleAddClick = () => {
        setSelectedWarehouse(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (data: CreateWarehouseRequest) => {
        try {
            setIsSaving(true);
            if (selectedWarehouse) {
                await updateWarehouse(selectedWarehouse.id, data);
                toast.success('Warehouse has been updated');
            } else {
                await createWarehouse(data);
                toast.success('Warehouse has been added');
            }
            setIsDialogOpen(false);
            await fetchWarehouses();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while saving the warehouse';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedWarehouse) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteWarehouse(selectedWarehouse.id);
            toast.success('Warehouse has been deleted');
            setIsDeleteDialogOpen(false);
            await fetchWarehouses();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while deleting the warehouse';
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
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-8" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
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
                    <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
                    </Button>
                </div>
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchWarehouses}>
            Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (warehouses.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
                    </Button>
                </div>
                <Empty className="border rounded-lg py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2 />
                        </EmptyMedia>
                        <EmptyTitle>No warehouses</EmptyTitle>
                        <EmptyDescription>You don't have any warehouses yet. Add your first warehouse to start managing locations and products.</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
            Add First Warehouse
                    </Button>
                </Empty>

                <WarehouseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} warehouse={selectedWarehouse} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        );
    }

    // Normal state with data
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                                <TableCell className="font-mono text-muted-foreground">{warehouse.id}</TableCell>
                                <TableCell className="font-medium">{warehouse.name}</TableCell>
                                <TableCell>
                                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{warehouse.code}</code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>{warehouse.isActive ? 'Active' : 'Inactive'}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {warehouse.address.city}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon-sm" onClick={() => handleEditClick(warehouse)} title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(warehouse)} title="Delete">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <WarehouseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} warehouse={selectedWarehouse} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteWarehouseDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} warehouse={selectedWarehouse} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
