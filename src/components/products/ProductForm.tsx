'use client';
'use no memo';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from 'shadcn/form';
import { Input } from 'shadcn/input';
import { Textarea } from 'shadcn/textarea';
import { Button } from 'shadcn/button';
import { Spinner } from 'shadcn/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shadcn/select';
import type { Product, Warehouse, Location } from '@/types';

// Base schema for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseProductFormSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    quantity: z.number().int().min(0),
    warehouseId: z.number().nullable(),
    locationId: z.number().nullable()
});

export type ProductFormData = z.infer<typeof baseProductFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  warehouses?: Warehouse[];
  locations?: Location[];
  selectedWarehouseId?: number | null;
  selectedLocationId?: number | null;
  onWarehouseChange?: (warehouseId: number | null) => void;
  isLoadingLocations?: boolean;
  isEditing?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading = false, warehouses = [], locations = [], selectedWarehouseId, selectedLocationId, onWarehouseChange, isLoadingLocations = false, isEditing = false }: ProductFormProps) {
    const t = useTranslations('products.form');

    // Validation schema with translated messages
    const productFormSchema = z.object({
        name: z.string().min(2, t('validation.nameMin')),
        description: z.string().optional(),
        price: z.number({ message: t('validation.priceRequired') }).positive(t('validation.pricePositive')),
        quantity: z
            .number({ message: t('validation.quantityRequired') })
            .int(t('validation.quantityInteger'))
            .min(0, t('validation.quantityNonNegative')),
        warehouseId: z
            .number({ message: t('validation.warehouseRequired') })
            .nullable()
            .refine((val) => isEditing || val !== null, { message: t('validation.warehouseRequired') }),
        locationId: z
            .number({ message: t('validation.locationRequired') })
            .nullable()
            .refine((val) => isEditing || val !== null, { message: t('validation.locationRequired') })
    });

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0,
            warehouseId: selectedWarehouseId ?? product?.warehouseId ?? null,
            locationId: selectedLocationId ?? product?.locationId ?? null
        }
    });

    // Reset form when product prop changes
    useEffect(() => {
        form.reset({
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0,
            warehouseId: selectedWarehouseId ?? product?.warehouseId ?? null,
            locationId: selectedLocationId ?? product?.locationId ?? null
        });
    }, [product, form, selectedWarehouseId, selectedLocationId]);

    // Update form values when selectedWarehouseId or selectedLocationId changes externally
    useEffect(() => {
        if (selectedWarehouseId !== undefined) {
            form.setValue('warehouseId', selectedWarehouseId);
        }
    }, [selectedWarehouseId, form]);

    useEffect(() => {
        if (selectedLocationId !== undefined) {
            form.setValue('locationId', selectedLocationId);
        }
    }, [selectedLocationId, form]);

    const handleSubmit = form.handleSubmit(async (data) => {
        try {
            await onSubmit(data);
        } catch (error) {
            throw error;
        }
    });

    const handleWarehouseChange = (value: string) => {
        const warehouseId = value ? parseInt(value, 10) : null;
        form.setValue('warehouseId', warehouseId);
        form.setValue('locationId', null); // Reset location when warehouse changes
        if (onWarehouseChange) {
            onWarehouseChange(warehouseId);
        }
    };

    const handleLocationChange = (value: string) => {
        const locationId = value ? parseInt(value, 10) : null;
        form.setValue('locationId', locationId);
    };

    // eslint-disable-next-line react-hooks/incompatible-library
    const currentWarehouseId = form.watch('warehouseId');
    const isLocationDisabled = !currentWarehouseId || isLoadingLocations;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Warehouse and Location Selection - only show when not editing */}
                {!isEditing && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="warehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.warehouse')} *</FormLabel>
                                    <Select value={field.value?.toString() ?? ''} onValueChange={handleWarehouseChange} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('fields.warehousePlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} ({warehouse.code})
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
                            name="locationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.location')} *</FormLabel>
                                    <Select value={field.value?.toString() ?? ''} onValueChange={handleLocationChange} disabled={isLocationDisabled || isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingLocations ? '...' : !currentWarehouseId ? t('fields.selectWarehouseFirst') : t('fields.locationPlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.locationCode} - {location.zoneName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('fields.name')} *</FormLabel>
                            <FormControl>
                                <Input placeholder={t('fields.namePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('fields.description')}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t('fields.descriptionPlaceholder')} className="resize-none" rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('fields.price')} *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.1"
                                        placeholder={t('fields.pricePlaceholder')}
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                field.onChange(undefined);
                                            } else {
                                                const parsed = parseFloat(value);
                                                field.onChange(isNaN(parsed) ? value : parsed);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('fields.quantity')} *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        min="0"
                                        placeholder={t('fields.quantityPlaceholder')}
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                field.onChange(undefined);
                                            } else {
                                                const parsed = parseInt(value, 10);
                                                field.onChange(isNaN(parsed) ? value : parsed);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        {product ? t('buttons.save') : t('buttons.add')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
