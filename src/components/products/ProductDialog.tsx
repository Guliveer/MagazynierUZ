'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'shadcn/dialog';
import { ProductForm, type ProductFormData } from './ProductForm';
import { ProductLocationBadge } from './ProductLocationBadge';
import { Alert, AlertDescription } from 'shadcn/alert';
import { Info } from 'lucide-react';
import type { Product, CreateProductRequest, ProductWithContext, Warehouse, Location } from '@/types';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: CreateProductRequest, warehouseId: number, locationId: number) => Promise<void>;
  isLoading?: boolean;
  warehouseName?: string;
  warehouseCode?: string;
  locationCode?: string;
  zoneName?: string;
  warehouses?: Warehouse[];
  locations?: Location[];
  selectedWarehouseId?: number | null;
  selectedLocationId?: number | null;
  onWarehouseChange?: (warehouseId: number | null) => void;
  isLoadingLocations?: boolean;
}

export function ProductDialog({ open, onOpenChange, product, onSubmit, isLoading = false, warehouseName, warehouseCode, locationCode, zoneName, warehouses = [], locations = [], selectedWarehouseId, selectedLocationId, onWarehouseChange, isLoadingLocations = false }: ProductDialogProps) {
    const t = useTranslations('products.form');
    const isEditing = !!product;
    const productWithContext = product as ProductWithContext | undefined;

    const handleSubmit = async (data: ProductFormData) => {
        const warehouseId = isEditing ? productWithContext?.warehouseId || product?.warehouseId || product?.warehouse?.id : data.warehouseId;
        const locationId = isEditing ? productWithContext?.locationId || product?.locationId || product?.location?.id : data.locationId;

        if (!warehouseId || !locationId) {
            throw new Error('Warehouse and location are required');
        }

        const request: CreateProductRequest = {
            name: data.name,
            description: data.description ?? '',
            price: data.price,
            quantity: data.quantity
        };

        try {
            await onSubmit(request, warehouseId, locationId);
        } catch (error) {
            throw error;
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

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

                {isEditing && (displayWarehouseName || displayLocationCode) && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="flex items-center gap-2">
                            <span className="text-sm">{t('currentLocation')}</span>
                            <ProductLocationBadge warehouseName={displayWarehouseName} warehouseCode={displayWarehouseCode} locationCode={displayLocationCode} zoneName={displayZoneName} locationType={productWithContext?.locationType} compact />
                        </AlertDescription>
                    </Alert>
                )}

                <ProductForm product={product} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} warehouses={warehouses} locations={locations} selectedWarehouseId={isEditing ? productWithContext?.warehouseId || product?.warehouseId : selectedWarehouseId} selectedLocationId={isEditing ? productWithContext?.locationId || product?.locationId : selectedLocationId} onWarehouseChange={onWarehouseChange} isLoadingLocations={isLoadingLocations} isEditing={isEditing} />
            </DialogContent>
        </Dialog>
    );
}
