'use client';

import { Pencil, Trash2, Package, Grid3x3, List, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'shadcn/table';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'shadcn/card';
import { Badge } from 'shadcn/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from 'shadcn/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shadcn/select';
import { Skeleton } from 'shadcn/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'shadcn/tooltip';
import type { Product } from '@/types';
import { escapeRegex } from '@/lib/utils';

const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm || !text) {
        return text;
    }

    const escapedSearchTerm = escapeRegex(searchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

export type SortField = 'name' | 'price' | 'quantity' | 'id';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'table' | 'grid';

interface ProductSearchResultsProps {
  products: Product[];
  isLoading: boolean;
  searchTerm?: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  page: number;
  pageSize: number;
  totalResults: number;
  onSort: (field: SortField) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductSearchResults({ products, isLoading, searchTerm, sortBy, sortDirection, viewMode, page, pageSize, totalResults, onSort, onViewModeChange, onPageChange, onPageSizeChange, onEdit, onDelete }: ProductSearchResultsProps) {
    const t = useTranslations('products');
    const locale = useLocale();
    const totalPages = Math.ceil(totalResults / pageSize);
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, totalResults);

    const formatPrice = (price: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'PLN' }).format(price);

    const truncateDescription = (description?: string, maxLength: number = 50) => {
        if (!description) {
            return t('results.noDescription');
        }
        return description.length > maxLength ? `${description.substring(0, maxLength)}...` : description;
    };

    const hasContext = (product: Product): boolean => {
        const warehouseId = product.warehouseId || product.warehouse?.id;
        const locationId = product.locationId || product.location?.id;
        return !!(warehouseId && locationId);
    };

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
        }
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">{t('results.sort.id')}</TableHead>
                                    <TableHead>{t('results.sort.name')}</TableHead>
                                    <TableHead>{t('list.table.description')}</TableHead>
                                    <TableHead>{t('results.sort.price')}</TableHead>
                                    <TableHead>{t('results.sort.quantity')}</TableHead>
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
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <Empty className="border rounded-lg py-12">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Package />
                    </EmptyMedia>
                    <EmptyTitle>{t('search.noResults')}</EmptyTitle>
                    <EmptyDescription>{searchTerm ? t('search.noResultsDescription') : t('search.noResultsDescription')}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    {t('results.showing')}{' '}
                    <span className="font-medium text-foreground">
                        {startIndex}-{endIndex}
                    </span>{' '}
                    {t('results.of')} <span className="font-medium text-foreground">{totalResults}</span> {t('results.results')}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">{t('results.perPage.10')}</SelectItem>
                            <SelectItem value="25">{t('results.perPage.25')}</SelectItem>
                            <SelectItem value="50">{t('results.perPage.50')}</SelectItem>
                            <SelectItem value="100">{t('results.perPage.100')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex border rounded-md">
                        <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => onViewModeChange('table')} title={t('results.viewMode.table')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => onViewModeChange('grid')} title={t('results.viewMode.grid')}>
                            <Grid3x3 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">
                                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort('id')}>
                                        {t('results.sort.id')}
                                        {renderSortIcon('id')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort('name')}>
                                        {t('results.sort.name')}
                                        {renderSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>{t('list.table.description')}</TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort('price')}>
                                        {t('results.sort.price')}
                                        {renderSortIcon('price')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort('quantity')}>
                                        {t('results.sort.quantity')}
                                        {renderSortIcon('quantity')}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">{t('list.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-mono text-muted-foreground">{product.id}</TableCell>
                                    <TableCell className="font-medium">{highlightText(product.name, searchTerm)}</TableCell>
                                    <TableCell className="text-muted-foreground">{product.description ? highlightText(truncateDescription(product.description), searchTerm) : t('results.noDescription')}</TableCell>
                                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.quantity > 0 ? 'default' : 'destructive'}>{product.quantity}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-2">
                                                {hasContext(product) ? (
                                                    <>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(product)} title={t('list.actions.edit')}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(product)} title={t('list.actions.delete')}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block">
                                                                    <Button variant="ghost" size="icon-sm" disabled title={t('results.editUnavailable')}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {t('results.missingContext')}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block">
                                                                    <Button variant="ghost" size="icon-sm" disabled title={t('results.deleteUnavailable')}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {t('results.missingContext')}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{highlightText(product.name, searchTerm)}</CardTitle>
                                        <CardDescription className="mt-1">ID: {product.id}</CardDescription>
                                    </div>
                                    <Badge variant={product.quantity > 0 ? 'default' : 'destructive'}>{product.quantity}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description ? highlightText(product.description, searchTerm) : t('results.noDescription')}</p>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                                        <TooltipProvider>
                                            <div className="flex gap-2">
                                                {hasContext(product) ? (
                                                    <>
                                                        <Button variant="outline" size="icon-sm" onClick={() => onEdit(product)} title={t('list.actions.edit')}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon-sm" onClick={() => onDelete(product)} title={t('list.actions.delete')}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block">
                                                                    <Button variant="outline" size="icon-sm" disabled title={t('results.editUnavailable')}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {t('results.missingContext')}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block">
                                                                    <Button variant="outline" size="icon-sm" disabled title={t('results.deleteUnavailable')}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {t('results.missingContext')}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
                        {t('results.pagination.previous')}
                    </Button>

                    <div className="flex items-center gap-1">
                        {page > 3 && (
                            <>
                                <Button variant={1 === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(1)}>
                  1
                                </Button>
                                {page > 4 && <span className="px-2">...</span>}
                            </>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p >= page - 2 && p <= page + 2)
                            .map((p) => (
                                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(p)}>
                                    {p}
                                </Button>
                            ))}

                        {page < totalPages - 2 && (
                            <>
                                {page < totalPages - 3 && <span className="px-2">...</span>}
                                <Button variant={totalPages === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(totalPages)}>
                                    {totalPages}
                                </Button>
                            </>
                        )}
                    </div>

                    <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
                        {t('results.pagination.next')}
                    </Button>
                </div>
            )}
        </div>
    );
}
