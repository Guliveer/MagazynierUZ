'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from 'shadcn/form';
import { Input } from 'shadcn/input';
import { Button } from 'shadcn/button';
import { Spinner } from 'shadcn/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shadcn/select';
import { Switch } from 'shadcn/switch';
import type { Location, LocationType } from '@/types';
import { useTranslations } from 'next-intl';

const locationFormSchema = z.object({
    locationCode: z.string().min(1, 'Location code is required').max(20, 'Location code can be at most 20 characters'),
    locationType: z.enum(['PICKING', 'BULK', 'RECEIVING', 'SHIPPING', 'RETURNS']),
    zoneName: z.string().min(1, 'Zone name is required').max(50, 'Zone name can be at most 50 characters'),
    isActive: z.boolean().optional(),
    isLocked: z.boolean().optional()
});

export type LocationFormData = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  location?: Location | null;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LocationForm({ location, onSubmit, onCancel, isLoading = false }: LocationFormProps) {
    const t = useTranslations('locations');
    const isEditing = !!location;

    const LOCATION_TYPES: { value: LocationType; label: string; description: string }[] = [
        { value: 'PICKING', label: t('types.PICKING'), description: t('types.descriptions.PICKING') },
        { value: 'BULK', label: t('types.BULK'), description: t('types.descriptions.BULK') },
        { value: 'RECEIVING', label: t('types.RECEIVING'), description: t('types.descriptions.RECEIVING') },
        { value: 'SHIPPING', label: t('types.SHIPPING'), description: t('types.descriptions.SHIPPING') },
        { value: 'RETURNS', label: t('types.RETURNS'), description: t('types.descriptions.RETURNS') }
    ];

    const form = useForm<LocationFormData>({
        resolver: zodResolver(locationFormSchema),
        defaultValues: {
            locationCode: location?.locationCode ?? '',
            locationType: location?.locationType ?? 'PICKING',
            zoneName: location?.zoneName ?? '',
            isActive: location?.isActive ?? true,
            isLocked: location?.isLocked ?? false
        }
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        await onSubmit(data);
    });

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    control={form.control}
                    name="locationCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.fields.locationCode')} *</FormLabel>
                            <FormControl>
                                <Input placeholder={t('form.fields.locationCodePlaceholder')} {...field} disabled={isEditing} />
                            </FormControl>
                            <FormDescription>{isEditing ? t('form.fields.locationCodeCannotChange') : t('form.fields.locationCodeDescription')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.fields.locationType')} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('form.fields.locationTypePlaceholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {LOCATION_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{type.label}</span>
                                                <span className="text-xs text-muted-foreground">{type.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="zoneName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.fields.zoneName')} *</FormLabel>
                            <FormControl>
                                <Input placeholder={t('form.fields.zoneNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormDescription>{t('form.fields.zoneNameDescription')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isEditing && (
                    <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="text-sm font-medium">{t('form.status.title')}</h4>

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t('form.status.active')}</FormLabel>
                                        <FormDescription>{t('form.status.activeDescription')}</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isLocked"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t('form.status.locked')}</FormLabel>
                                        <FormDescription>{t('form.status.lockedDescription')}</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        {t('form.buttons.cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        {location ? t('form.buttons.save') : t('form.buttons.add')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
