'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Warehouse } from '@/types';

// Validation schema for warehouse form
const warehouseFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code can be at most 10 characters'),
    description: z.string().optional(),
    street: z.string().min(1, 'Street is required'),
    houseNumber: z.string().min(1, 'House number is required'),
    apartmentNumber: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postcode: z.string().min(1, 'Postcode is required'),
    coordinates: z.string().optional()
});

type WarehouseFormSchemaData = z.infer<typeof warehouseFormSchema>;

// Exported type includes parsed latitude/longitude for API compatibility
export type WarehouseFormData = Omit<WarehouseFormSchemaData, 'coordinates'> & {
  latitude: number;
  longitude: number;
};

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper function to parse coordinates from string
function parseCoordinates(coordString: string): { latitude: number; longitude: number } {
    const parts = coordString.split(',').map((s) => s.trim());
    if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { latitude: lat, longitude: lng };
        }
    }
    return { latitude: 0, longitude: 0 };
}

// Helper function to format coordinates to string
function formatCoordinates(lat?: number, lng?: number): string {
    if (lat !== undefined && lng !== undefined && (lat !== 0 || lng !== 0)) {
        return `${lat}, ${lng}`;
    }
    return '';
}

export function WarehouseForm({ warehouse, onSubmit, onCancel, isLoading = false }: WarehouseFormProps) {
    const form = useForm<WarehouseFormSchemaData>({
        resolver: zodResolver(warehouseFormSchema),
        defaultValues: {
            name: warehouse?.name ?? '',
            code: warehouse?.code ?? '',
            description: '',
            street: warehouse?.address?.street ?? '',
            houseNumber: warehouse?.address?.houseNumber ?? '',
            apartmentNumber: warehouse?.address?.apartmentNumber ?? '',
            city: warehouse?.address?.city ?? '',
            postcode: warehouse?.address?.postcode ?? '',
            coordinates: formatCoordinates(warehouse?.address?.latitude, warehouse?.address?.longitude)
        }
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        const { coordinates, ...rest } = data;
        const { latitude, longitude } = parseCoordinates(coordinates ?? '');
        await onSubmit({ ...rest, latitude, longitude });
    });

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Warehouse Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Main Warehouse" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Warehouse Code *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. WH01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Optional warehouse description..." className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Address */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>

                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Street *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Warehouse Street" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="houseNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>House No. *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 15" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="apartmentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apt. No.</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 2A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postcode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postcode *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 00-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Warsaw" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="coordinates"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Coordinates (latitude, longitude)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 52.2297, 21.0122" {...field} />
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
                        {warehouse ? 'Save Changes' : 'Add Warehouse'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
