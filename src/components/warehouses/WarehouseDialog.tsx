'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WarehouseForm, type WarehouseFormData } from './WarehouseForm';
import type { Warehouse, CreateWarehouseRequest } from '@/types';

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
  onSubmit: (data: CreateWarehouseRequest) => Promise<void>;
  isLoading?: boolean;
}

export function WarehouseDialog({ open, onOpenChange, warehouse, onSubmit, isLoading = false }: WarehouseDialogProps) {
    const isEditing = !!warehouse;

    const handleSubmit = async (data: WarehouseFormData) => {
        const request: CreateWarehouseRequest = {
            name: data.name,
            code: data.code,
            description: data.description ?? '',
            address: {
                street: data.street,
                houseNumber: data.houseNumber,
                apartmentNumber: data.apartmentNumber ?? '',
                city: data.city,
                postcode: data.postcode,
                latitude: data.latitude,
                longitude: data.longitude
            }
        };

        await onSubmit(request);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
                    <DialogDescription>{isEditing ? 'Update the warehouse details and save changes.' : 'Fill in the form to add a new warehouse to the system.'}</DialogDescription>
                </DialogHeader>

                <WarehouseForm warehouse={warehouse} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
