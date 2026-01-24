'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'shadcn/dialog';
import { ProductForm, type ProductFormData } from './ProductForm';
import { ProductLocationBadge } from './ProductLocationBadge';
import { Alert, AlertDescription } from 'shadcn/alert';
import { Info } from 'lucide-react';
import type { Product, CreateProductRequest, ProductWithContext } from '@/types';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isLoading?: boolean;
  warehouseName?: string;
  warehouseCode?: string;
  locationCode?: string;
  zoneName?: string;
}

export function ProductDialog({ open, onOpenChange, product, onSubmit, isLoading = false, warehouseName, warehouseCode, locationCode, zoneName }: ProductDialogProps) {
    const t = useTranslations('products.form');
    const isEditing = !!product;
    const productWithContext = product as ProductWithContext | undefined;

    const handleSubmit = async (data: ProductFormData) => {
        const request: CreateProductRequest = {
            name: data.name,
            description: data.description ?? '',
            price: data.price,
            quantity: data.quantity
        };

        try {
            await onSubmit(request);
        } catch (error) {
            throw error;
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    // Determine which location info to show
    const displayWarehouseName = productWithContext?.warehouseName || warehouseName;
    const displayWarehouseCode = productWithContext?.warehouseCode || warehouseCode;
    const displayLocationCode = productWithContext?.locationCode || locationCode;
    const displayZoneName = productWithContext?.zoneName || zoneName;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? t('title.edit') : t('title.add')}</DialogTitle>
                    <DialogDescription>{isEditing ? t('description.edit') : t('description.add')}</DialogDescription>
                </DialogHeader>

                {/* Show current location information */}
                {(displayWarehouseName || displayLocationCode) && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="flex items-center gap-2">
                            <span className="text-sm">{isEditing ? t('currentLocation') : t('addingTo')}</span>
                            <ProductLocationBadge warehouseName={displayWarehouseName} warehouseCode={displayWarehouseCode} locationCode={displayLocationCode} zoneName={displayZoneName} locationType={productWithContext?.locationType} compact />
                        </AlertDescription>
                    </Alert>
                )}

                <ProductForm product={product} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
