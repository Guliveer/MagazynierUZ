'use client';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from 'shadcn/alert-dialog';
import { Spinner } from 'shadcn/spinner';
import type { Warehouse } from '@/types';
import { useTranslations } from 'next-intl';

interface DeleteWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Warehouse | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteWarehouseDialog({ open, onOpenChange, warehouse, onConfirm, isLoading = false }: DeleteWarehouseDialogProps) {
    const t = useTranslations('warehouses.delete');

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('description', { name: warehouse?.name ?? '' })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="bg-destructive text-white hover:bg-destructive/90">
                        {isLoading && <Spinner className="mr-2" />}
                        {t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
