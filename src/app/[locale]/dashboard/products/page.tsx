'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from 'shadcn/button';

import { ProductFilters, type ProductFilterValues } from '@/components/products/ProductFilters';
import { ProductSearchResults, type SortField, type SortDirection, type ViewMode } from '@/components/products/ProductSearchResults';
import { ProductDialog } from '@/components/products/ProductDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { searchProducts, createProduct, updateProduct, deleteProduct, ApiError, getWarehouse, getLocation, getWarehouses, getLocations } from '@/lib/api';
import type { Product, ProductWithContext, CreateProductRequest, PaginatedResponse, Warehouse, Location } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { escapeRegex } from '@/lib/utils';

export default function ProductsPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const searchParams = useSearchParams();
    const t = useTranslations('products');

    const getInitialFilters = (): ProductFilterValues => ({
        searchQuery: searchParams.get('q') || '',
        warehouseId: searchParams.get('warehouse') ? parseInt(searchParams.get('warehouse')!, 10) : null,
        locationId: searchParams.get('location') ? parseInt(searchParams.get('location')!, 10) : null,
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minQuantity: searchParams.get('minQty') || '',
        maxQuantity: searchParams.get('maxQty') || '',
        isAvailable: searchParams.get('available') === 'true'
    });

    const [filters, setFilters] = useState<ProductFilterValues>(getInitialFilters);
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<ProductWithContext> | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(true); // Changed to true to load all products on mount

    const [warehouseCache, setWarehouseCache] = useState<Map<number, Warehouse>>(new Map());
    const [locationCache, setLocationCache] = useState<Map<string, Location>>(new Map());

    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '25', 10));
    const [sortBy, setSortBy] = useState<SortField>((searchParams.get('sortBy') as SortField) || 'name');
    const [sortDirection, setSortDirection] = useState<SortDirection>((searchParams.get('sortDir') as SortDirection) || 'asc');
    const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'table');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [dialogWarehouses, setDialogWarehouses] = useState<Warehouse[]>([]);
    const [dialogLocations, setDialogLocations] = useState<Location[]>([]);
    const [dialogSelectedWarehouseId, setDialogSelectedWarehouseId] = useState<number | null>(null);
    const [dialogSelectedLocationId, setDialogSelectedLocationId] = useState<number | null>(null);
    const [isLoadingDialogLocations, setIsLoadingDialogLocations] = useState(false);

    const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

    useEffect(() => {
        if (isDialogOpen && dialogWarehouses.length === 0) {
            getWarehouses()
                .then(setDialogWarehouses)
                .catch(() => {
                    toast.error(t('messages.warehousesError'));
                });
        }
    }, [isDialogOpen, dialogWarehouses.length, t]);

    const handleDialogWarehouseChange = useCallback(
        async (warehouseId: number | null) => {
            setDialogSelectedWarehouseId(warehouseId);
            setDialogSelectedLocationId(null);
            setDialogLocations([]);

            if (warehouseId) {
                setIsLoadingDialogLocations(true);
                try {
                    const locations = await getLocations(warehouseId);
                    setDialogLocations(locations);
                } catch {
                    toast.error(t('messages.locationsError'));
                } finally {
                    setIsLoadingDialogLocations(false);
                }
            }
        },
        [t]
    );

    const updateURL = useCallback(
        (newFilters: ProductFilterValues, newPage: number, newPageSize: number, newSortBy: SortField, newSortDir: SortDirection, newViewMode: ViewMode) => {
            const params = new URLSearchParams();

            if (newFilters.searchQuery) {
                params.set('q', newFilters.searchQuery);
            }
            if (newFilters.warehouseId) {
                params.set('warehouse', newFilters.warehouseId.toString());
            }
            if (newFilters.locationId) {
                params.set('location', newFilters.locationId.toString());
            }
            if (newFilters.minPrice) {
                params.set('minPrice', newFilters.minPrice);
            }
            if (newFilters.maxPrice) {
                params.set('maxPrice', newFilters.maxPrice);
            }
            if (newFilters.minQuantity) {
                params.set('minQty', newFilters.minQuantity);
            }
            if (newFilters.maxQuantity) {
                params.set('maxQty', newFilters.maxQuantity);
            }
            if (newFilters.isAvailable) {
                params.set('available', 'true');
            }
            if (newPage > 1) {
                params.set('page', newPage.toString());
            }
            if (newPageSize !== 25) {
                params.set('size', newPageSize.toString());
            }
            if (newSortBy !== 'name') {
                params.set('sortBy', newSortBy);
            }
            if (newSortDir !== 'asc') {
                params.set('sortDir', newSortDir);
            }
            if (newViewMode !== 'table') {
                params.set('view', newViewMode);
            }

            const queryString = params.toString();
            router.push(`/${locale}/dashboard/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
        },
        [router, locale]
    );

    const enrichProductsWithContext = useCallback(
        async (products: Product[]): Promise<ProductWithContext[]> => {
            const productsWithIds = products.map((p) => ({
                ...p,
                warehouseId: p.warehouseId || p.warehouse?.id,
                locationId: p.locationId || p.location?.id
            }));

            if (!filters.warehouseId || !filters.locationId) {
                // No filter context - use product's own context if available
                return productsWithIds.map((p) => ({
                    ...p,
                    warehouseId: p.warehouseId || 0,
                    locationId: p.locationId || 0,
                    warehouseName: p.warehouse?.name,
                    warehouseCode: p.warehouse?.code,
                    locationCode: p.location?.locationCode,
                    zoneName: p.location?.zoneName,
                    locationType: p.location?.locationType
                }));
            }

            try {
                const cacheKey = `${filters.warehouseId}-${filters.locationId}`;
                let warehouse = warehouseCache.get(filters.warehouseId);
                let location = locationCache.get(cacheKey);

                if (!warehouse || !location) {
                    const [warehouseData, locationData] = await Promise.all([warehouse ? Promise.resolve(warehouse) : getWarehouse(filters.warehouseId), location ? Promise.resolve(location) : getLocation(filters.warehouseId, filters.locationId)]);

                    warehouse = warehouseData;
                    location = locationData;

                    setWarehouseCache((prev) => new Map(prev).set(filters.warehouseId!, warehouse!));
                    setLocationCache((prev) => new Map(prev).set(cacheKey, location!));
                }

                return productsWithIds.map((product) => ({
                    ...product,
                    warehouseId: filters.warehouseId!,
                    locationId: filters.locationId!,
                    warehouseName: warehouse!.name,
                    warehouseCode: warehouse!.code,
                    locationCode: location!.locationCode,
                    zoneName: location!.zoneName,
                    locationType: location!.locationType
                }));
            } catch {
                return productsWithIds.map((p) => ({
                    ...p,
                    warehouseId: filters.warehouseId || p.warehouseId || 0,
                    locationId: filters.locationId || p.locationId || 0,
                    warehouseName: p.warehouse?.name,
                    warehouseCode: p.warehouse?.code,
                    locationCode: p.location?.locationCode,
                    zoneName: p.location?.zoneName,
                    locationType: p.location?.locationType
                }));
            }
        },
        [filters.warehouseId, filters.locationId, warehouseCache, locationCache]
    );

    const performSearch = useCallback(async () => {
        try {
            setIsSearching(true);
            setHasSearched(true);

            const params: Record<string, string | number | boolean> = {
                page: page - 1, // Backend uses 0-indexed pages
                size: pageSize,
                sortBy,
                sortDirection
            };

            if (filters.searchQuery) {
                params.name = filters.searchQuery;
            }
            if (filters.warehouseId) {
                params.warehouseId = filters.warehouseId;
            }
            if (filters.locationId) {
                params.locationId = filters.locationId;
            }
            if (filters.minPrice) {
                params.minPrice = parseFloat(filters.minPrice);
            }
            if (filters.maxPrice) {
                params.maxPrice = parseFloat(filters.maxPrice);
            }
            if (filters.minQuantity) {
                params.minQuantity = parseInt(filters.minQuantity, 10);
            }
            if (filters.maxQuantity) {
                params.maxQuantity = parseInt(filters.maxQuantity, 10);
            }
            if (filters.isAvailable) {
                params.isAvailable = true;
            }

            const data = await searchProducts(params);

            const enrichedProducts = await enrichProductsWithContext(data.content);

            setPaginatedData({
                ...data,
                content: enrichedProducts
            });

            updateURL(filters, page, pageSize, sortBy, sortDirection, viewMode);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.searchError');
            toast.error(message);
            setPaginatedData(null);
        } finally {
            setIsSearching(false);
        }
    }, [filters, page, pageSize, sortBy, sortDirection, viewMode, updateURL, enrichProductsWithContext, t]);

    useEffect(() => {
        if (hasSearched) {
            setPage(1);
            performSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (hasSearched) {
            performSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, sortBy, sortDirection]);

    const handleFiltersChange = (newFilters: ProductFilterValues) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleSearch = () => {
        setPage(1);
        performSearch();
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            updateURL(filters, page, pageSize, field, newDirection, viewMode);
        } else {
            setSortBy(field);
            setSortDirection('asc');
            updateURL(filters, page, pageSize, field, 'asc', viewMode);
        }
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        updateURL(filters, page, pageSize, sortBy, sortDirection, mode);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateURL(filters, newPage, pageSize, sortBy, sortDirection, viewMode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
        updateURL(filters, 1, newSize, sortBy, sortDirection, viewMode);
    };

    const handleAddClick = () => {
        setSelectedProduct(null);
        setDialogSelectedWarehouseId(filters.warehouseId);
        setDialogSelectedLocationId(filters.locationId);

        if (filters.warehouseId) {
            setIsLoadingDialogLocations(true);
            getLocations(filters.warehouseId)
                .then(setDialogLocations)
                .catch(() => {})
                .finally(() => setIsLoadingDialogLocations(false));
        }

        setIsDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        const warehouseId = product.warehouseId || product.warehouse?.id;
        const locationId = product.locationId || product.location?.id;

        if (warehouseId && locationId) {
            setSelectedProduct({
                ...product,
                warehouseId,
                locationId
            });
            setIsDialogOpen(true);
        } else {
            toast.error(t('messages.missingContext'));
        }
    };

    const handleDeleteClick = (product: Product) => {
        const warehouseId = product.warehouseId || product.warehouse?.id;
        const locationId = product.locationId || product.location?.id;

        if (warehouseId && locationId) {
            setSelectedProduct({
                ...product,
                warehouseId,
                locationId
            });
            setIsDeleteDialogOpen(true);
        } else {
            toast.error(t('messages.missingContextDelete'));
        }
    };

    const handleSubmit = async (data: CreateProductRequest, warehouseId: number, locationId: number) => {
        const isEditing = !!selectedProduct;

        try {
            setIsSaving(true);
            if (isEditing) {
                await updateProduct(warehouseId, locationId, selectedProduct.id, data);
                toast.success(t('messages.updated'));
            } else {
                await createProduct(warehouseId, locationId, data);
                toast.success(t('messages.created'));
            }
            setIsDialogOpen(false);
            setDialogSelectedWarehouseId(null);
            setDialogSelectedLocationId(null);
            setDialogLocations([]);
            await performSearch();
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

        const warehouseId = selectedProduct.warehouseId || selectedProduct.warehouse?.id;
        const locationId = selectedProduct.locationId || selectedProduct.location?.id;

        if (!warehouseId || !locationId) {
            toast.error(t('messages.missingContextDelete'));
            return;
        }

        try {
            setIsDeleting(true);
            await deleteProduct(warehouseId, locationId, selectedProduct.id);
            toast.success(t('messages.deleted'));
            setIsDeleteDialogOpen(false);
            await performSearch();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : t('messages.deleteError');
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setDialogSelectedWarehouseId(null);
            setDialogSelectedLocationId(null);
            setDialogLocations([]);
        }
    };

    // Client-side filtering for immediate feedback while typing
    // This filters the already-loaded products based on the current search query
    // without waiting for the debounced API call
    const filteredProducts = useMemo(() => {
        if (!paginatedData?.content) {
            return [];
        }

        const searchQuery = filters.searchQuery.trim();

        // If no search query, return all products
        if (!searchQuery) {
            return paginatedData.content;
        }

        // Create a case-insensitive regex pattern using escapeRegex for safety
        const escapedQuery = escapeRegex(searchQuery);
        const regex = new RegExp(escapedQuery, 'i');

        // Filter products by checking multiple fields
        return paginatedData.content.filter((product) => {
            // Check name
            if (product.name && regex.test(product.name)) {
                return true;
            }
            // Check description
            if (product.description && regex.test(product.description)) {
                return true;
            }
            // Check ID (convert to string for matching)
            if (product.id && regex.test(product.id.toString())) {
                return true;
            }
            // Check warehouse name if available
            if (product.warehouseName && regex.test(product.warehouseName)) {
                return true;
            }
            // Check warehouse code if available
            if (product.warehouseCode && regex.test(product.warehouseCode)) {
                return true;
            }
            // Check location code if available
            if (product.locationCode && regex.test(product.locationCode)) {
                return true;
            }
            // Check zone name if available
            if (product.zoneName && regex.test(product.zoneName)) {
                return true;
            }
            return false;
        });
    }, [paginatedData?.content, filters.searchQuery]);

    // Calculate the filtered total for display purposes
    const filteredTotalResults = useMemo(() => {
    // If the current search query matches the debounced query, use the API total
    // Otherwise, use the filtered count for immediate feedback
        if (filters.searchQuery === debouncedSearchQuery) {
            return paginatedData?.totalElements ?? 0;
        }
        return filteredProducts.length;
    }, [filters.searchQuery, debouncedSearchQuery, paginatedData?.totalElements, filteredProducts.length]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addProduct')}
                </Button>
            </div>

            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} isSearching={isSearching} />

            {hasSearched && paginatedData && <ProductSearchResults products={filteredProducts} isLoading={isSearching} searchTerm={filters.searchQuery} sortBy={sortBy} sortDirection={sortDirection} viewMode={viewMode} page={page} pageSize={pageSize} totalResults={filteredTotalResults} onSort={handleSort} onViewModeChange={handleViewModeChange} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onEdit={handleEditClick} onDelete={handleDeleteClick} />}

            {hasSearched && paginatedData && filteredProducts.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">{t('search.noResults')}</p>
                </div>
            )}

            <ProductDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange} product={selectedProduct} onSubmit={handleSubmit} isLoading={isSaving} warehouses={dialogWarehouses} locations={dialogLocations} selectedWarehouseId={dialogSelectedWarehouseId} selectedLocationId={dialogSelectedLocationId} onWarehouseChange={handleDialogWarehouseChange} isLoadingLocations={isLoadingDialogLocations} />

            <DeleteProductDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} product={selectedProduct} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
