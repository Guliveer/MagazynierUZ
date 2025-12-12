'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProductForm, type ProductFormData } from './ProductForm';
import type { Product, CreateProductRequest } from '@/types';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ProductDialog({ open, onOpenChange, product, onSubmit, isLoading = false }: ProductDialogProps) {
    const isEditing = !!product;

    const handleSubmit = async (data: ProductFormData) => {
        const request: CreateProductRequest = {
            name: data.name,
            description: data.description ?? '',
            price: data.price,
            quantity: data.quantity
        };

        await onSubmit(request);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>{isEditing ? 'Update the product details and save changes.' : 'Fill in the form to add a new product to this location.'}</DialogDescription>
                </DialogHeader>

                <ProductForm product={product} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
