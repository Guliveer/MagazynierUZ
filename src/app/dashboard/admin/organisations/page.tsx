'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Warehouse } from 'lucide-react';
import { OrganisationList } from '@/components/admin/OrganisationList';
import { OrganisationDialog } from '@/components/admin/OrganisationDialog';
import { DeleteOrganisationDialog } from '@/components/admin/DeleteOrganisationDialog';
import { getAllOrganisations, getAllUsers, getWarehousesByOrganisation } from '@/lib/api';
import type { OrganisationResponse } from '@/types';
import { toast } from 'sonner';

export default function OrganisationsPage() {
    const [organisations, setOrganisations] = useState<OrganisationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrganisation, setSelectedOrganisation] = useState<OrganisationResponse | null>(null);
    const [organisationToDelete, setOrganisationToDelete] = useState<OrganisationResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Statistics
    const [warehouseCounts, setWarehouseCounts] = useState<Map<number, number>>(new Map());
    const [userCounts, setUserCounts] = useState<Map<number, number>>(new Map());

    useEffect(() => {
        loadOrganisations();
    }, []);

    const loadOrganisations = async () => {
        setIsLoading(true);
        try {
            const [orgsData, usersData] = await Promise.all([getAllOrganisations(), getAllUsers()]);

            setOrganisations(orgsData);

            // Calculate user counts
            const userCountMap = new Map<number, number>();
            usersData.forEach((user) => {
                if (user.organisationId) {
                    userCountMap.set(user.organisationId, (userCountMap.get(user.organisationId) || 0) + 1);
                }
            });
            setUserCounts(userCountMap);

            // Load warehouse counts for each organisation
            const warehouseCountMap = new Map<number, number>();
            await Promise.all(
                orgsData.map(async (org) => {
                    try {
                        const warehouses = await getWarehousesByOrganisation(org.id);
                        warehouseCountMap.set(org.id, warehouses.length);
                    } catch (error) {
                        console.error(`Failed to load warehouses for org ${org.id}:`, error);
                        warehouseCountMap.set(org.id, 0);
                    }
                })
            );
            setWarehouseCounts(warehouseCountMap);
        } catch (error) {
            console.error('Failed to load organisations:', error);
            toast.error('Failed to load organisations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedOrganisation(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (organisation: OrganisationResponse) => {
        setSelectedOrganisation(organisation);
        setIsDialogOpen(true);
    };

    const handleDelete = (organisation: OrganisationResponse) => {
        setOrganisationToDelete(organisation);
        setIsDeleteDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        loadOrganisations();
    };

    // Calculate totals for statistics
    const totalOrganisations = organisations.length;
    const totalWarehouses = Array.from(warehouseCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalUsers = Array.from(userCounts.values()).reduce((sum, count) => sum + count, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organisation Management</h1>
                <p className="text-muted-foreground mt-2">Manage organisations, view their warehouses and users, and maintain organisation data.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Organisations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrganisations}</div>
                        <p className="text-xs text-muted-foreground">Active organisations in system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWarehouses}</div>
                        <p className="text-xs text-muted-foreground">Across all organisations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Assigned to organisations</p>
                    </CardContent>
                </Card>
            </div>

            {/* Organisation List */}
            <Card>
                <CardHeader>
                    <CardTitle>Organisations</CardTitle>
                    <CardDescription>View and manage all organisations in the system. Create, edit, or delete organisations as needed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrganisationList organisations={organisations} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} warehouseCounts={warehouseCounts} userCounts={userCounts} />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <OrganisationDialog organisation={selectedOrganisation} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleDialogSuccess} />

            <DeleteOrganisationDialog organisation={organisationToDelete} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onSuccess={handleDialogSuccess} />
        </div>
    );
}
