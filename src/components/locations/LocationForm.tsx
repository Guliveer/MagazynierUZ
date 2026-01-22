'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Location, LocationType } from '@/types';

// Validation schema for location form
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

const LOCATION_TYPES: { value: LocationType; label: string; description: string }[] = [
    { value: 'PICKING', label: 'Picking', description: 'Area for order picking operations' },
    { value: 'BULK', label: 'Bulk Storage', description: 'High-capacity storage area' },
    { value: 'RECEIVING', label: 'Receiving', description: 'Incoming goods processing' },
    { value: 'SHIPPING', label: 'Shipping', description: 'Outgoing goods staging' },
    { value: 'RETURNS', label: 'Returns', description: 'Returned items processing' }
];

export function LocationForm({ location, onSubmit, onCancel, isLoading = false }: LocationFormProps) {
    const isEditing = !!location;

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
                {/* Location Code */}
                <FormField
                    control={form.control}
                    name="locationCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location Code *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. A-01-01"
                                    {...field}
                                    disabled={isEditing} // Location code cannot be changed after creation
                                />
                            </FormControl>
                            <FormDescription>{isEditing ? 'Location code cannot be changed' : 'Unique identifier for this location'}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location Type */}
                <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location type" />
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

                {/* Zone Name */}
                <FormField
                    control={form.control}
                    name="zoneName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zone Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Zone A" {...field} />
                            </FormControl>
                            <FormDescription>Logical grouping for organizing locations</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Status toggles - only shown in edit mode */}
                {isEditing && (
                    <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="text-sm font-medium">Location Status</h4>

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <FormDescription>Location is available for use</FormDescription>
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
                                        <FormLabel>Locked</FormLabel>
                                        <FormDescription>Prevent modifications to this location</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        {location ? 'Save Changes' : 'Add Location'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
