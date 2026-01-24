'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'shadcn/table';
import { Button } from 'shadcn/button';
import { Skeleton } from 'shadcn/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from 'shadcn/empty';
import { Input } from 'shadcn/input';

import { ProductDialog } from './ProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';

import { getProducts, createProduct, updateProduct, deleteProduct, ApiError } from '@/lib/api';
import type { Product, CreateProductRequest } from '@/types';

interface ProductListProps {
  warehouseId: number;
  locationId: number;
}

export function ProductList({ warehouseId, locationId }: ProductListProps) {
    const t = useTranslations('products');
    const locale = useLocale();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'PLN' }).format(price);
    };

    const truncateDescription = (description?: string) => {
        if (!description) {
            return '-';
        }
        return description.length > 50 ? `${description.substring(0, 50)}...` : description;
    };

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProducts(warehouseId, locationId);
            setProducts(data);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.fetchError');
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [warehouseId, locationId, t]);

    const filteredProducts = products.filter((product) => {
        const query = search.toLowerCase();

        return product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query) || product.id.toString().includes(query);
    });

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
        try {
            setIsSaving(true);
            if (selectedProduct) {
                await updateProduct(warehouseId, locationId, selectedProduct.id, data);
                toast.success(t('messages.updated'));
            } else {
                await createProduct(warehouseId, locationId, data);
                toast.success(t('messages.created'));
            }
            setIsDialogOpen(false);
            await fetchProducts();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.createError');
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProduct) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteProduct(warehouseId, locationId, selectedProduct.id);
            toast.success(t('messages.deleted'));
            setIsDeleteDialogOpen(false);
            await fetchProducts();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.deleteError');
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderLoadingState = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">{t('list.table.id')}</TableHead>
                        <TableHead>{t('list.table.name')}</TableHead>
                        <TableHead>{t('list.table.description')}</TableHead>
                        <TableHead>{t('list.table.price')}</TableHead>
                        <TableHead>{t('list.table.quantity')}</TableHead>
                        <TableHead className="text-right">{t('list.table.actions')}</TableHead>
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

    const renderErrorState = () => (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchProducts}>
                {t('list.error.tryAgain')}
            </Button>
        </div>
    );

    const renderEmptyState = () => (
        <Empty className="border rounded-lg py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Package />
                </EmptyMedia>
                <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
                <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
            </EmptyHeader>
            <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                {t('list.empty.addFirst')}
            </Button>
        </Empty>
    );

    const renderProductsTable = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">{t('list.table.id')}</TableHead>
                        <TableHead>{t('list.table.name')}</TableHead>
                        <TableHead>{t('list.table.description')}</TableHead>
                        <TableHead>{t('list.table.price')}</TableHead>
                        <TableHead>{t('list.table.quantity')}</TableHead>
                        <TableHead className="text-right">{t('list.table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-mono text-muted-foreground">{product.id}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground">{truncateDescription(product.description)}</TableCell>
                            <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditClick(product)} title={t('list.actions.edit')}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(product)} title={t('list.actions.delete')}>
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{t('list.title')}</h2>
                <Input placeholder={t('list.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('list.addProduct')}
                </Button>
            </div>

            {isLoading ? renderLoadingState() : error ? renderErrorState() : products.length === 0 ? renderEmptyState() : renderProductsTable()}

            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={selectedProduct} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteProductDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} product={selectedProduct} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
