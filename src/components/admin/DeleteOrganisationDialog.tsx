'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { deleteOrganisation, getWarehousesByOrganisation, getAllUsers } from '@/lib/api';
import type { OrganisationResponse } from '@/types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteOrganisationDialogProps {
  organisation: OrganisationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteOrganisationDialog({ organisation, open, onOpenChange, onSuccess }: DeleteOrganisationDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
    const [warehouseCount, setWarehouseCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [hasDependencies, setHasDependencies] = useState(false);

    const checkDependencies = useCallback(async () => {
        if (!organisation) {
            return;
        }

        setIsCheckingDependencies(true);
        try {
            // Check warehouses
            const warehouses = await getWarehousesByOrganisation(organisation.id);
            const warehouseCount = warehouses.length;

            // Check users
            const users = await getAllUsers();
            const usersInOrg = users.filter((u) => u.organisationId === organisation.id);
            const userCount = usersInOrg.length;

            setWarehouseCount(warehouseCount);
            setUserCount(userCount);
            setHasDependencies(warehouseCount > 0 || userCount > 0);
        } catch (error) {
            console.error('Failed to check dependencies:', error);
            // If we can't check, assume there might be dependencies
            setHasDependencies(true);
        } finally {
            setIsCheckingDependencies(false);
        }
    }, [organisation]);

    // Check for dependencies when dialog opens
    useEffect(() => {
        if (open && organisation) {
            checkDependencies();
        }
    }, [open, organisation, checkDependencies]);

    const handleDelete = async () => {
        if (!organisation) {
            return;
        }

        // Prevent deletion if there are dependencies
        if (hasDependencies) {
            toast.error('Cannot delete organisation with existing warehouses or users');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteOrganisation(organisation.id);
            toast.success(`Organisation "${organisation.name}" has been deleted`);
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to delete organisation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Check for specific error messages
            if (errorMessage.includes('has warehouses') || errorMessage.includes('has users')) {
                toast.error('Cannot delete: Organisation has associated warehouses or users');
            } else {
                toast.error(`Failed to delete organisation: ${errorMessage}`);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (!organisation) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organisation</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            {isCheckingDependencies ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                  Checking dependencies...
                                </div>
                            ) : hasDependencies ? (
                                <>
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                      This organisation cannot be deleted because it has:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                {warehouseCount > 0 && (
                                                    <li>
                                                        <strong>{warehouseCount}</strong> warehouse{warehouseCount !== 1 ? 's' : ''}
                                                    </li>
                                                )}
                                                {userCount > 0 && (
                                                    <li>
                                                        <strong>{userCount}</strong> user{userCount !== 1 ? 's' : ''}
                                                    </li>
                                                )}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                    <p className="text-sm">Please remove all warehouses and reassign all users before deleting this organisation.</p>
                                </>
                            ) : (
                                <>
                                    <p>
                    Are you sure you want to delete organisation <span className="font-semibold">{organisation.name}</span> (TIN: {organisation.tin})?
                                    </p>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone. All data associated with this organisation will be permanently removed from the system.</p>
                                </>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    {!hasDependencies && !isCheckingDependencies && (
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                                </>
                            ) : (
                                'Delete Organisation'
                            )}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
