'use client';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Location } from '@/types';
import { useTranslations } from 'next-intl';

interface DeleteLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteLocationDialog({ open, onOpenChange, location, onConfirm, isLoading = false }: DeleteLocationDialogProps) {
    const t = useTranslations('locations');

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('delete.description', { code: location?.locationCode ?? '', zone: location?.zoneName ?? '' })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{t('delete.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="bg-destructive text-white hover:bg-destructive/90">
                        {isLoading && <Spinner className="mr-2" />}
                        {t('delete.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
