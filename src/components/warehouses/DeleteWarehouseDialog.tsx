'use client';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Warehouse } from '@/types';

interface DeleteWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Warehouse | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteWarehouseDialog({ open, onOpenChange, warehouse, onConfirm, isLoading = false }: DeleteWarehouseDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this warehouse?</AlertDialogTitle>
                    <AlertDialogDescription>
            You are about to delete <span className="font-semibold text-foreground">{warehouse?.name}</span>. This action cannot be undone and will remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="bg-destructive text-white hover:bg-destructive/90">
                        {isLoading && <Spinner className="mr-2" />}
            Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
