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
import { searchProducts, createProduct, updateProduct, deleteProduct, ApiError } from '@/lib/api';
import type { Product, CreateProductRequest, PaginatedResponse } from '@/types';
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
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Product> | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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
            setPaginatedData(data);

            // Update URL with current filters
            updateURL(filters, page, pageSize, sortBy, sortDirection, viewMode);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'An error occurred while searching products';
            toast.error(message);
            setPaginatedData(null);
        } finally {
            setIsSearching(false);
        }
    }, [filters, page, pageSize, sortBy, sortDirection, viewMode, updateURL]);

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

    // Handle edit product
    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    // Handle delete product
    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    // Handle product submission
    const handleSubmit = async (data: CreateProductRequest) => {
        if (!filters.warehouseId || !filters.locationId) {
            toast.error('Please select a warehouse and location first');
            return;
        }

        try {
            setIsSaving(true);
            if (selectedProduct) {
                await updateProduct(filters.warehouseId, filters.locationId, selectedProduct.id, data);
                toast.success('Product has been updated');
            } else {
                await createProduct(filters.warehouseId, filters.locationId, data);
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
        if (!selectedProduct || !filters.warehouseId || !filters.locationId) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteProduct(filters.warehouseId, filters.locationId, selectedProduct.id);
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

            {/* Initial state - no search performed yet */}
            {!hasSearched && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Enter search criteria and click &quot;Search&quot; to find products</p>
                </div>
            )}

            {/* Dialogs */}
            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={selectedProduct} onSubmit={handleSubmit} isLoading={isSaving} />

            <DeleteProductDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} product={selectedProduct} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />
        </div>
    );
}
