'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';

import { ProductFilters } from './ProductFilters';
import { ProductDialog } from './ProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';

import { getProducts, createProduct, updateProduct, deleteProduct, ApiError } from '@/lib/api';
import type { Product, CreateProductRequest } from '@/types';

// Format price as PLN currency
const formatPrice = (price: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(price);

// Truncate description to 50 characters
const truncateDescription = (description?: string) => {
    if (!description) { return '-'; }
    return description.length > 50 ? `${description.substring(0, 50)}...` : description;
};

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        if (!selectedWarehouseId || !selectedLocationId) {
            setProducts([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await getProducts(selectedWarehouseId, selectedLocationId);
            setProducts(data);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while fetching products';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWarehouseId, selectedLocationId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleWarehouseChange = (warehouseId: number | null) => {
        setSelectedWarehouseId(warehouseId);
        setSelectedLocationId(null);
        setProducts([]);
        setError(null);
    };

    const handleLocationChange = (locationId: number | null) => {
        setSelectedLocationId(locationId);
    };

    const handleAddClick = () => {
        setSelectedProduct(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (data: CreateProductRequest) => {
        if (!selectedWarehouseId || !selectedLocationId) { return; }

        try {
            setIsSaving(true);
            if (selectedProduct) {
                await updateProduct(selectedWarehouseId, selectedLocationId, selectedProduct.id, data);
                toast.success('Product has been updated');
            } else {
                await createProduct(selectedWarehouseId, selectedLocationId, data);
                toast.success('Product has been added');
            }
            setIsDialogOpen(false);
            await fetchProducts();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while saving the product';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProduct || !selectedWarehouseId || !selectedLocationId) { return; }

        try {
            setIsDeleting(true);
            await deleteProduct(selectedWarehouseId, selectedLocationId, selectedProduct.id);
            toast.success('Product has been deleted');
            setIsDeleteDialogOpen(false);
            await fetchProducts();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while deleting the product';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const canShowProducts = selectedWarehouseId && selectedLocationId;

    // Loading state
    const renderLoadingState = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
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
                                <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-12" />
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
    );

    // Error state
    const renderErrorState = () => (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchProducts}>
        Try Again
            </Button>
        </div>
    );

    // Empty state
    const renderEmptyState = () => (
        <Empty className="border rounded-lg py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Package />
                </EmptyMedia>
                <EmptyTitle>No products</EmptyTitle>
                <EmptyDescription>There are no products in this location yet. Add your first product to start managing inventory.</EmptyDescription>
            </EmptyHeader>
            <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
        Add First Product
            </Button>
        </Empty>
    );

    // Products table
    const renderProductsTable = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-mono text-muted-foreground">{product.id}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground">{truncateDescription(product.description)}</TableCell>
                            <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditClick(product)} title="Edit">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(product)} title="Delete">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
            <ProductFilters selectedWarehouseId={selectedWarehouseId} selectedLocationId={selectedLocationId} onWarehouseChange={handleWarehouseChange} onLocationChange={handleLocationChange} />

            {/* Header with Add button */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                <Button onClick={handleAddClick} disabled={!canShowProducts}>
                    <Plus className="mr-2 h-4 w-4" />
          Add Product
                </Button>
            </div>

            {/* Content */}
            {!canShowProducts ? (
                <Empty className="border rounded-lg py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Package />
                        </EmptyMedia>
                        <EmptyTitle>Select warehouse and location</EmptyTitle>
                        <EmptyDescription>Please select a warehouse and location from the filters above to view and manage products.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : isLoading ? (
                renderLoadingState()
            ) : error ? (
                renderErrorState()
            ) : products.length === 0 ? (
                renderEmptyState()
            ) : (
                renderProductsTable()
            )}

            {/* Dialogs */}
            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={selectedProduct} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteProductDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} product={selectedProduct} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
