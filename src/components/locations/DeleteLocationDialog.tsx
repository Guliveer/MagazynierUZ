'use client';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Location } from '@/types';

interface DeleteLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteLocationDialog({ open, onOpenChange, location, onConfirm, isLoading = false }: DeleteLocationDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this location?</AlertDialogTitle>
                    <AlertDialogDescription>
            You are about to delete location <span className="font-semibold text-foreground">{location?.locationCode}</span> in zone <span className="font-semibold text-foreground">{location?.zoneName}</span>. This action cannot be undone and will remove all associated data.
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
