'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Search, Filter, UserPlus, Building2 } from 'lucide-react';
import type { UserResponse } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';

interface UserListProps {
  users: UserResponse[];
  isLoading: boolean;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onCreate: () => void;
  currentUserId?: number;
}

type SortField = 'username' | 'roles' | 'organisation';
type SortDirection = 'asc' | 'desc';

export function UserList({ users, isLoading, onEdit, onDelete, onCreate, currentUserId }: UserListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [organisationFilter, setOrganisationFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('username');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Get unique roles and organisations for filters
    const availableRoles = useMemo(() => {
        const roles = new Set<string>();
        users.forEach((user) => user.roles.forEach((role) => roles.add(role)));
        return Array.from(roles).sort();
    }, [users]);

    const availableOrganisations = useMemo(() => {
        const orgs = new Map<number, string>();
        users.forEach((user) => {
            if (user.organisationId && user.organisationName) {
                orgs.set(user.organisationId, user.organisationName);
            }
        });
        return Array.from(orgs.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [users]);

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((user) => user.username.toLowerCase().includes(query));
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter((user) => user.roles.includes(roleFilter));
        }

        // Organisation filter
        if (organisationFilter !== 'all') {
            if (organisationFilter === 'none') {
                filtered = filtered.filter((user) => !user.organisationId);
            } else {
                filtered = filtered.filter((user) => user.organisationId?.toString() === organisationFilter);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'username':
                    comparison = a.username.localeCompare(b.username);
                    break;
                case 'roles':
                    comparison = a.roles.join(',').localeCompare(b.roles.join(','));
                    break;
                case 'organisation':
                    const orgA = a.organisationName || '';
                    const orgB = b.organisationName || '';
                    comparison = orgA.localeCompare(orgB);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [users, searchQuery, roleFilter, organisationFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        if (role === 'ROLE_ADMIN') {
            return 'destructive';
        }
        if (role === 'ROLE_MANAGER') {
            return 'default';
        }
        return 'secondary';
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[140px]" />
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
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                                {role.replace('ROLE_', '')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={organisationFilter} onValueChange={setOrganisationFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Building2 className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by org" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Organisations</SelectItem>
                        <SelectItem value="none">No Organisation</SelectItem>
                        {availableOrganisations.map(([id, name]) => (
                            <SelectItem key={id} value={id.toString()}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={onCreate} className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
          Create User
                </Button>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedUsers.length} of {users.length} users
            </div>

            {/* Users Table */}
            {filteredAndSortedUsers.length === 0 ? (
                <Card>
                    <CardContent className="p-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>No users found</EmptyTitle>
                                <EmptyDescription>{searchQuery || roleFilter !== 'all' || organisationFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first user'}</EmptyDescription>
                            </EmptyHeader>
                            {!searchQuery && roleFilter === 'all' && organisationFilter === 'all' && (
                                <EmptyContent>
                                    <Button onClick={onCreate}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                    Create User
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
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('username')}>
                                            <div className="flex items-center gap-2">
                        Username
                                                {sortField === 'username' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('roles')}>
                                            <div className="flex items-center gap-2">
                        Roles
                                                {sortField === 'roles' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('organisation')}>
                                            <div className="flex items-center gap-2">
                        Organisation
                                                {sortField === 'organisation' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {user.username}
                                                    {currentUserId === user.id && (
                                                        <Badge variant="outline" className="text-xs">
                              You
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                                            {role.replace('ROLE_', '')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.organisationName ? <span className="text-sm">{user.organisationName}</span> : <span className="text-sm text-muted-foreground italic">No organisation</span>}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => onDelete(user)} disabled={currentUserId === user.id}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
