"use client";

import { useState } from "react";
import { Pencil, Trash2, Package, Grid3x3, List, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import type { Product } from "@/types";

// Format price as PLN currency
const formatPrice = (price: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);

// Truncate description
const truncateDescription = (description?: string, maxLength: number = 50) => {
  if (!description) return "-";
  return description.length > maxLength ? `${description.substring(0, maxLength)}...` : description;
};

// Highlight search terms in text
const highlightText = (text: string, searchTerm?: string) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

export type SortField = "name" | "price" | "quantity" | "id";
export type SortDirection = "asc" | "desc";
export type ViewMode = "table" | "grid";

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
  const totalPages = Math.ceil(totalResults / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalResults);

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Content skeleton */}
        {viewMode === "table" ? (
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

  // Empty state
  if (products.length === 0) {
    return (
      <Empty className="border rounded-lg py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>No products found</EmptyTitle>
          <EmptyDescription>{searchTerm ? `No products match your search criteria. Try adjusting your filters.` : "There are no products to display. Try changing your search filters."}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {startIndex}-{endIndex}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalResults}</span> results
        </div>

        <div className="flex items-center gap-2">
          {/* Page size selector */}
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex border rounded-md">
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon-sm" onClick={() => onViewModeChange("table")} title="Table view">
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => onViewModeChange("grid")} title="Grid view">
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results content */}
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort("id")}>
                    ID
                    <SortIcon field="id" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort("name")}>
                    Name
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort("price")}>
                    Price
                    <SortIcon field="price" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => onSort("quantity")}>
                    Quantity
                    <SortIcon field="quantity" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-muted-foreground">{product.id}</TableCell>
                  <TableCell className="font-medium">{highlightText(product.name, searchTerm)}</TableCell>
                  <TableCell className="text-muted-foreground">{product.description ? highlightText(truncateDescription(product.description), searchTerm) : "-"}</TableCell>
                  <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.quantity > 0 ? "default" : "destructive"}>{product.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(product)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(product)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
                  <Badge variant={product.quantity > 0 ? "default" : "destructive"}>{product.quantity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description ? highlightText(product.description, searchTerm) : "No description"}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon-sm" onClick={() => onEdit(product)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" onClick={() => onDelete(product)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* Show first page */}
            {page > 3 && (
              <>
                <Button variant={1 === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(1)}>
                  1
                </Button>
                {page > 4 && <span className="px-2">...</span>}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p >= page - 2 && p <= page + 2)
              .map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(p)}>
                  {p}
                </Button>
              ))}

            {/* Show last page */}
            {page < totalPages - 2 && (
              <>
                {page < totalPages - 3 && <span className="px-2">...</span>}
                <Button variant={totalPages === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
