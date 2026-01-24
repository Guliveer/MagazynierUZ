'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { OrganisationResponse, CreateOrganisationRequest, UpdateOrganisationRequest } from '@/types';

interface OrganisationFormProps {
  organisation?: OrganisationResponse | null;
  onSubmit: (data: CreateOrganisationRequest | UpdateOrganisationRequest) => void;
  isLoading: boolean;
}

export function OrganisationForm({ organisation, onSubmit, isLoading }: OrganisationFormProps) {
    const t = useTranslations('admin.organisationForm');
    const [name, setName] = useState(organisation?.name || '');
    const [tin, setTin] = useState(organisation?.tin || '');

    const [errors, setErrors] = useState<{
    name?: string;
    tin?: string;
  }>({});

    const validateName = (value: string): string | undefined => {
        if (!value) {
            return t('nameRequired');
        }
        if (value.length > 20) {
            return t('nameMaxLength');
        }
        if (value.length < 1) {
            return t('nameMinLength');
        }
        return undefined;
    };

    const validateTin = (value: string): string | undefined => {
        if (!value) {
            return t('tinRequired');
        }
        if (value.length > 20) {
            return t('tinMaxLength');
        }
        if (value.length < 1) {
            return t('tinMinLength');
        }
        // Basic TIN format validation (alphanumeric and hyphens)
        if (!/^[A-Za-z0-9-]+$/.test(value)) {
            return t('tinInvalidFormat');
        }
        return undefined;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEdit = !!organisation;
        const nameError = validateName(name);
        const tinError = validateTin(tin);

        if (nameError || tinError) {
            setErrors({
                name: nameError,
                tin: tinError
            });
            return;
        }

        setErrors({});

        if (isEdit) {
            // Update organisation - only include changed fields
            const updateData: UpdateOrganisationRequest = {};
            if (name !== organisation.name) {
                updateData.name = name;
            }
            if (tin !== organisation.tin) {
                updateData.tin = tin;
            }
            onSubmit(updateData);
        } else {
            // Create organisation
            const createData: CreateOrganisationRequest = {
                name,
                tin
            };
            onSubmit(createData);
        }
    };

    const isFormValid = name.trim() && tin.trim() && !errors.name && !errors.tin;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organisation Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
          Organisation Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => {
                        const error = validateName(name);
                        if (error) {
                            setErrors((prev) => ({ ...prev, name: error }));
                        }
                    }}
                    placeholder="Enter organisation name (max 20 characters)"
                    disabled={isLoading}
                    className={errors.name ? 'border-destructive' : ''}
                    maxLength={20}
                />
                <div className="flex items-center justify-between">
                    {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">{name.length}/20 characters</p>
                </div>
            </div>

            {/* TIN (Tax Identification Number) */}
            <div className="space-y-2">
                <Label htmlFor="tin">
          TIN (Tax Identification Number) <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="tin"
                    value={tin}
                    onChange={(e) => {
                        // Auto-format: uppercase and remove invalid characters
                        const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                        setTin(formatted);
                        setErrors((prev) => ({ ...prev, tin: undefined }));
                    }}
                    onBlur={() => {
                        const error = validateTin(tin);
                        if (error) {
                            setErrors((prev) => ({ ...prev, tin: error }));
                        }
                    }}
                    placeholder="Enter TIN (e.g., 123-456-789)"
                    disabled={isLoading}
                    className={errors.tin ? 'border-destructive' : ''}
                    maxLength={20}
                />
                <div className="flex items-center justify-between">
                    {errors.tin && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.tin}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">{tin.length}/20 characters</p>
                </div>
                <p className="text-xs text-muted-foreground">Tax Identification Number must be unique across all organisations</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={isLoading || !isFormValid} className="min-w-[140px]">
                    {isLoading ? (
                        <>
                            <span className="mr-2">⏳</span>
                            {organisation ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            {organisation ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update Organisation
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Organisation
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
