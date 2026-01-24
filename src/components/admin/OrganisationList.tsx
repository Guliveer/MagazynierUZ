'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shadcn/table';
import { Button } from 'shadcn/button';
import { Input } from 'shadcn/input';
import { Card, CardContent } from 'shadcn/card';
import { Pencil, Trash2, Search, Building2, Warehouse, Users } from 'lucide-react';
import type { OrganisationResponse } from '@/types';
import { Skeleton } from 'shadcn/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from 'shadcn/empty';
import { Badge } from 'shadcn/badge';

interface OrganisationListProps {
  organisations: OrganisationResponse[];
  isLoading: boolean;
  onEdit: (organisation: OrganisationResponse) => void;
  onDelete: (organisation: OrganisationResponse) => void;
  onCreate: () => void;
  warehouseCounts?: Map<number, number>;
  userCounts?: Map<number, number>;
}

type SortField = 'name' | 'tin' | 'warehouses' | 'users';
type SortDirection = 'asc' | 'desc';

export function OrganisationList({ organisations, isLoading, onEdit, onDelete, onCreate, warehouseCounts = new Map(), userCounts = new Map() }: OrganisationListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const filteredAndSortedOrganisations = useMemo(() => {
        let filtered = organisations;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((org) => org.name.toLowerCase().includes(query) || org.tin.toLowerCase().includes(query));
        }

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'tin':
                    comparison = a.tin.localeCompare(b.tin);
                    break;
                case 'warehouses':
                    comparison = (warehouseCounts.get(a.id) || 0) - (warehouseCounts.get(b.id) || 0);
                    break;
                case 'users':
                    comparison = (userCounts.get(a.id) || 0) - (userCounts.get(b.id) || 0);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [organisations, searchQuery, sortField, sortDirection, warehouseCounts, userCounts]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or TIN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>

                <Button onClick={onCreate} className="w-full sm:w-auto">
                    <Building2 className="mr-2 h-4 w-4" />
          Create Organisation
                </Button>
            </div>

            <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedOrganisations.length} of {organisations.length} organisations
            </div>

            {filteredAndSortedOrganisations.length === 0 ? (
                <Card>
                    <CardContent className="p-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>No organisations found</EmptyTitle>
                                <EmptyDescription>{searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first organisation'}</EmptyDescription>
                            </EmptyHeader>
                            {!searchQuery && (
                                <EmptyContent>
                                    <Button onClick={onCreate}>
                                        <Building2 className="mr-2 h-4 w-4" />
                    Create Organisation
                                    </Button>
                                </EmptyContent>
                            )}
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-2">
                        Name
                                                {sortField === 'name' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('tin')}>
                                            <div className="flex items-center gap-2">
                        TIN
                                                {sortField === 'tin' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('warehouses')}>
                                            <div className="flex items-center gap-2">
                                                <Warehouse className="h-4 w-4" />
                        Warehouses
                                                {sortField === 'warehouses' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('users')}>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                        Users
                                                {sortField === 'users' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedOrganisations.map((org) => {
                                        const warehouseCount = warehouseCounts.get(org.id) || 0;
                                        const userCount = userCounts.get(org.id) || 0;

                                        return (
                                            <TableRow key={org.id}>
                                                <TableCell className="font-medium">{org.name}</TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">{org.tin}</code>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        {warehouseCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        {userCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => onEdit(org)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => onDelete(org)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
