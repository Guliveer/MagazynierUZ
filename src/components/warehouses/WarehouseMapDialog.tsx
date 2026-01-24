'use client';

import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Warehouse } from '@/types';
import { useTranslations } from 'next-intl';

const WarehouseMap = dynamic(() => import('./WarehouseMap'), { ssr: false });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
};

export function WarehouseMapDialog({ open, onOpenChange, warehouses }: Props) {
    const t = useTranslations('warehouses.map');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                </DialogHeader>

                <WarehouseMap warehouses={warehouses} />
            </DialogContent>
        </Dialog>
    );
}
