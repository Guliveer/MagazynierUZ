'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LocationForm, type LocationFormData } from './LocationForm';
import type { Location, CreateLocationRequest } from '@/types';
import { useTranslations } from 'next-intl';

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
  onSubmit: (data: CreateLocationRequest) => Promise<void>;
  isLoading?: boolean;
}

export function LocationDialog({ open, onOpenChange, location, onSubmit, isLoading = false }: LocationDialogProps) {
    const t = useTranslations('locations');
    const isEditing = !!location;

    const handleSubmit = async (data: LocationFormData) => {
        const request: CreateLocationRequest = {
            locationCode: data.locationCode,
            locationType: data.locationType,
            zoneName: data.zoneName
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
                    <DialogTitle>{isEditing ? t('form.title.edit') : t('form.title.add')}</DialogTitle>
                    <DialogDescription>{isEditing ? t('form.description.edit') : t('form.description.add')}</DialogDescription>
                </DialogHeader>

                <LocationForm location={location} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
