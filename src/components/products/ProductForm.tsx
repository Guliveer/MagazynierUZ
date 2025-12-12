'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/types';

// Validation schema for product form
const productFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number({ message: 'Price is required and must be a number' }).positive('Price must be greater than 0'),
    quantity: z.number({ message: 'Quantity is required and must be a number' }).int('Quantity must be an integer').min(0, 'Quantity cannot be negative')
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Dell XPS 15 Laptop" {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Optional product description..." className="resize-none" rows={3} {...field} />
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
                                <FormLabel>Price (PLN) *</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0.01" placeholder="e.g. 4999.99" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
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
                                <FormLabel>Quantity *</FormLabel>
                                <FormControl>
                                    <Input type="number" step="1" min="0" placeholder="e.g. 10" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        {product ? 'Save Changes' : 'Add Product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
