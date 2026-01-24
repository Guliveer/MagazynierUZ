'use client';

import { useTranslations } from 'next-intl';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/types';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteProductDialog({ open, onOpenChange, product, onConfirm, isLoading = false }: DeleteProductDialogProps) {
    const t = useTranslations('products.delete');

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('description', { name: product?.name || '' })}</AlertDialogDescription>
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
