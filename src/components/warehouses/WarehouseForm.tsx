'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from 'shadcn/form';
import { Input } from 'shadcn/input';
import { Textarea } from 'shadcn/textarea';
import { Button } from 'shadcn/button';
import { Spinner } from 'shadcn/spinner';
import type { Warehouse } from '@/types';
import { useTranslations } from 'next-intl';

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Exported type includes parsed latitude/longitude for API compatibility
export type WarehouseFormData = {
  name: string;
  code: string;
  description?: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
};

// Helper function to parse coordinates from string
function parseCoordinates(coordString: string): { latitude: number; longitude: number } | null {
    const parts = coordString.split(',').map((s) => s.trim());
    if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { latitude: lat, longitude: lng };
        }
    }
    return null;
}

// Helper function to format coordinates to string
function formatCoordinates(lat?: number, lng?: number): string {
    if (lat !== undefined && lng !== undefined && (lat !== 0 || lng !== 0)) {
        return `${lat}, ${lng}`;
    }
    return '';
}

export function WarehouseForm({ warehouse, onSubmit, onCancel, isLoading = false }: WarehouseFormProps) {
    const t = useTranslations('warehouses.form');

    // Validation schema for warehouse form
    const warehouseFormSchema = z.object({
        name: z.string().min(2, t('validation.nameMin')),
        code: z.string().min(2, t('validation.codeMin')).max(10, t('validation.codeMax')),
        description: z.string().optional(),
        street: z.string().min(1, t('validation.streetRequired')),
        houseNumber: z.string().min(1, t('validation.houseNumberRequired')),
        apartmentNumber: z.string().optional(),
        city: z.string().min(1, t('validation.cityRequired')),
        postcode: z.string().min(1, t('validation.postcodeRequired')),
        coordinates: z.string().optional()
    });

  type WarehouseFormSchemaData = z.infer<typeof warehouseFormSchema>;

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
      const parsedCoords = parseCoordinates(coordinates ?? '');
      const latitude = parsedCoords?.latitude ?? 0;
      const longitude = parsedCoords?.longitude ?? 0;
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
                      name="code"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>{t('fields.code')} *</FormLabel>
                              <FormControl>
                                  <Input placeholder={t('fields.codePlaceholder')} {...field} />
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
                          <FormLabel>{t('fields.description')}</FormLabel>
                          <FormControl>
                              <Textarea placeholder={t('fields.descriptionPlaceholder')} className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Address */}
              <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('sections.address')}</h4>

                  <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>{t('fields.street')} *</FormLabel>
                              <FormControl>
                                  <Input placeholder={t('fields.streetPlaceholder')} {...field} />
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
                                  <FormLabel>{t('fields.houseNumber')} *</FormLabel>
                                  <FormControl>
                                      <Input placeholder={t('fields.houseNumberPlaceholder')} {...field} />
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
                                  <FormLabel>{t('fields.apartmentNumber')}</FormLabel>
                                  <FormControl>
                                      <Input placeholder={t('fields.apartmentNumberPlaceholder')} {...field} />
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
                                  <FormLabel>{t('fields.postcode')} *</FormLabel>
                                  <FormControl>
                                      <Input placeholder={t('fields.postcodePlaceholder')} {...field} />
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
                              <FormLabel>{t('fields.city')} *</FormLabel>
                              <FormControl>
                                  <Input placeholder={t('fields.cityPlaceholder')} {...field} />
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
                              <FormLabel>{t('fields.coordinates')}</FormLabel>
                              <FormControl>
                                  <Input placeholder={t('fields.coordinatesPlaceholder')} {...field} />
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
                      {warehouse ? t('buttons.save') : t('buttons.add')}
                  </Button>
              </div>
          </form>
      </Form>
  );
}
