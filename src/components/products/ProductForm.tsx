'use client';

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
import type { Product } from '@/types';

// Base schema for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseProductFormSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    quantity: z.number().int().min(0)
});

export type ProductFormData = z.infer<typeof baseProductFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
    const t = useTranslations('products.form');

    // Validation schema with translated messages
    const productFormSchema = z.object({
        name: z.string().min(2, t('validation.nameMin')),
        description: z.string().optional(),
        price: z.number({ message: t('validation.priceRequired') }).positive(t('validation.pricePositive')),
        quantity: z
            .number({ message: t('validation.quantityRequired') })
            .int(t('validation.quantityInteger'))
            .min(0, t('validation.quantityNonNegative'))
    });

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0
        }
    });

    // Reset form when product prop changes
    useEffect(() => {
        form.reset({
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0
        });
    }, [product, form]);

    const handleSubmit = form.handleSubmit(async (data) => {
        try {
            await onSubmit(data);
        } catch (error) {
            throw error;
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
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
