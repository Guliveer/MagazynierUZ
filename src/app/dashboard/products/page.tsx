'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { ProductFilters, type ProductFilterValues } from '@/components/products/ProductFilters';
import { ProductSearchResults, type SortField, type SortDirection, type ViewMode } from '@/components/products/ProductSearchResults';
import { ProductDialog } from '@/components/products/ProductDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { searchProducts, createProduct, updateProduct, deleteProduct, ApiError, getWarehouse, getLocation } from '@/lib/api';
import type { Product, ProductWithContext, CreateProductRequest, PaginatedResponse, Warehouse, Location } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize filters from URL params
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

    // Cache for warehouse and location data
    const [warehouseCache, setWarehouseCache] = useState<Map<number, Warehouse>>(new Map());
    const [locationCache, setLocationCache] = useState<Map<string, Location>>(new Map());

    // Pagination and sorting - now handled server-side
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '25', 10));
    const [sortBy, setSortBy] = useState<SortField>((searchParams.get('sortBy') as SortField) || 'name');
    const [sortDirection, setSortDirection] = useState<SortDirection>((searchParams.get('sortDir') as SortDirection) || 'asc');
    const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'table');

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

    // Update URL when filters change
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
            router.push(`/dashboard/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
        },
        [router]
    );

    // Enrich products with warehouse and location context
    const enrichProductsWithContext = useCallback(
        async (products: Product[]): Promise<ProductWithContext[]> => {
            // First, extract IDs from nested objects if present
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
                // Check cache first
                const cacheKey = `${filters.warehouseId}-${filters.locationId}`;
                let warehouse = warehouseCache.get(filters.warehouseId);
                let location = locationCache.get(cacheKey);

                // Fetch if not in cache
                if (!warehouse || !location) {
                    const [warehouseData, locationData] = await Promise.all([warehouse ? Promise.resolve(warehouse) : getWarehouse(filters.warehouseId), location ? Promise.resolve(location) : getLocation(filters.warehouseId, filters.locationId)]);

                    warehouse = warehouseData;
                    location = locationData;

                    // Update cache
                    setWarehouseCache((prev) => new Map(prev).set(filters.warehouseId!, warehouse!));
                    setLocationCache((prev) => new Map(prev).set(cacheKey, location!));
                }

                // Enrich products with context from filters
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
            } catch (err) {
                console.error('Failed to enrich products with context:', err);
                // Return products with basic context on error
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

    // Perform search with server-side pagination
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

            // Enrich products with full warehouse and location context
            const enrichedProducts = await enrichProductsWithContext(data.content);

            setPaginatedData({
                ...data,
                content: enrichedProducts
            });

            // Update URL with current filters
            updateURL(filters, page, pageSize, sortBy, sortDirection, viewMode);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while searching products';
            toast.error(message);
            setPaginatedData(null);
        } finally {
            setIsSearching(false);
        }
    }, [filters, page, pageSize, sortBy, sortDirection, viewMode, updateURL, enrichProductsWithContext]);

    // Auto-search when debounced query changes
    useEffect(() => {
        if (hasSearched) {
            setPage(1); // Reset to first page when search query changes
            performSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery]);

    // Re-search when pagination or sorting changes
    useEffect(() => {
        if (hasSearched) {
            performSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, sortBy, sortDirection]);

    // Handle filter changes
    const handleFiltersChange = (newFilters: ProductFilterValues) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    // Handle manual search button click
    const handleSearch = () => {
        setPage(1);
        performSearch();
    };

    // Handle sorting - no client-side sorting needed anymore
    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            // Toggle direction if same field
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            updateURL(filters, page, pageSize, field, newDirection, viewMode);
        } else {
            // Set new field with ascending direction
            setSortBy(field);
            setSortDirection('asc');
            updateURL(filters, page, pageSize, field, 'asc', viewMode);
        }
    };

    // Handle view mode change
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        updateURL(filters, page, pageSize, sortBy, sortDirection, mode);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateURL(filters, newPage, pageSize, sortBy, sortDirection, viewMode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page
        updateURL(filters, 1, newSize, sortBy, sortDirection, viewMode);
    };

    // Handle add product
    const handleAddClick = () => {
        setSelectedProduct(null);
        setIsDialogOpen(true);
    };

    // Handle edit product - fetch full context if needed
    const handleEditClick = (product: Product) => {
    // Check if product already has warehouse and location IDs
        const warehouseId = product.warehouseId || product.warehouse?.id;
        const locationId = product.locationId || product.location?.id;

        if (warehouseId && locationId) {
            // Product has context, use it directly
            setSelectedProduct({
                ...product,
                warehouseId,
                locationId
            });
            setIsDialogOpen(true);
        } else {
            // Product missing context - try to fetch it
            toast.error('Cannot edit product: missing warehouse/location information');
            console.error('Product missing context:', product);
        }
    };

    // Handle delete product - ensure context is available
    const handleDeleteClick = (product: Product) => {
    // Check if product has warehouse and location IDs
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
            toast.error('Cannot delete product: missing warehouse/location information');
            console.error('Product missing context:', product);
        }
    };

    // Handle product submission
    const handleSubmit = async (data: CreateProductRequest) => {
        const isEditing = !!selectedProduct;

        // Get warehouse and location IDs from the product (if editing) or filters (if creating)
        const warehouseId = isEditing && selectedProduct?.warehouseId ? selectedProduct.warehouseId : filters.warehouseId;
        const locationId = isEditing && selectedProduct?.locationId ? selectedProduct.locationId : filters.locationId;

        // Validate that we have the required IDs
        if (!warehouseId || !locationId) {
            toast.error('Please select a warehouse and location first');
            return;
        }

        try {
            setIsSaving(true);
            if (isEditing) {
                await updateProduct(warehouseId, locationId, selectedProduct.id, data);
                toast.success('Product has been updated');
            } else {
                await createProduct(warehouseId, locationId, data);
                toast.success('Product has been added');
            }
            setIsDialogOpen(false);
            await performSearch(); // Refresh results
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while saving the product';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle product deletion
    const handleDeleteConfirm = async () => {
        if (!selectedProduct) {
            return;
        }

        // Get warehouse and location IDs from the product
        const warehouseId = selectedProduct.warehouseId || selectedProduct.warehouse?.id;
        const locationId = selectedProduct.locationId || selectedProduct.location?.id;

        if (!warehouseId || !locationId) {
            toast.error('Cannot delete product: missing warehouse/location information');
            return;
        }

        try {
            setIsDeleting(true);
            await deleteProduct(warehouseId, locationId, selectedProduct.id);
            toast.success('Product has been deleted');
            setIsDeleteDialogOpen(false);
            await performSearch(); // Refresh results
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while deleting the product';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Search</h1>
                    <p className="text-muted-foreground mt-1">Search and filter products across all warehouses and locations</p>
                </div>
                <Button onClick={handleAddClick} disabled={!filters.warehouseId || !filters.locationId} title={!filters.warehouseId || !filters.locationId ? 'Select warehouse and location to add products' : 'Add product'}>
                    <Plus className="mr-2 h-4 w-4" />
          Add Product
                </Button>
            </div>

            {/* Search filters */}
            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} isSearching={isSearching} />

            {/* Search results */}
            {hasSearched && paginatedData && <ProductSearchResults products={paginatedData.content} isLoading={isSearching} searchTerm={filters.searchQuery} sortBy={sortBy} sortDirection={sortDirection} viewMode={viewMode} page={page} pageSize={pageSize} totalResults={paginatedData.totalElements} onSort={handleSort} onViewModeChange={handleViewModeChange} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onEdit={handleEditClick} onDelete={handleDeleteClick} />}

            {/* No results state */}
            {hasSearched && paginatedData && paginatedData.content.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No products found matching your search criteria</p>
                </div>
            )}

            {/* Dialogs */}
            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={selectedProduct} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteProductDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} product={selectedProduct} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
