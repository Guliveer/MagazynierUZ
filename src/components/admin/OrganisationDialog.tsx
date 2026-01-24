'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'shadcn/dialog';
import { toast } from 'sonner';
import { createOrganisation, updateOrganisation } from '@/lib/api';
import type { OrganisationResponse, CreateOrganisationRequest, UpdateOrganisationRequest } from '@/types';
import { OrganisationForm } from './OrganisationForm';

interface OrganisationDialogProps {
  organisation?: OrganisationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrganisationDialog({ organisation, open, onOpenChange, onSuccess }: OrganisationDialogProps) {
    const t = useTranslations('admin.organisationDialog');
    const [isLoading, setIsLoading] = useState(false);

    const isEdit = !!organisation;

    const handleSubmit = async (data: CreateOrganisationRequest | UpdateOrganisationRequest) => {
        setIsLoading(true);
        try {
            if (isEdit && organisation) {
                await updateOrganisation(organisation.id, data as UpdateOrganisationRequest);
                toast.success(t('organisationUpdated', { name: organisation.name }));
            } else {
                const newOrg = await createOrganisation(data as CreateOrganisationRequest);
                toast.success(t('organisationCreated', { name: newOrg.name }));
            }
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to save organisation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Check for common errors
            if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                toast.error(isEdit ? t('updateFailedDuplicate') : t('createFailedDuplicate'));
            } else {
                toast.error(isEdit ? t('updateFailed', { error: errorMessage }) : t('createFailed', { error: errorMessage }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Organisation' : 'Create New Organisation'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Update organisation information. Name and TIN must be unique.' : 'Create a new organisation with a unique name and TIN.'}</DialogDescription>
                </DialogHeader>
                <OrganisationForm organisation={organisation} onSubmit={handleSubmit} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}
