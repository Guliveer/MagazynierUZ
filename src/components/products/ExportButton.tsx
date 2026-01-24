'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { exportProductsToCSV, formatExportCount } from '@/lib/export';
import type { Product } from '@/types';

interface ExportButtonProps {
  products: Product[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button component for exporting products to CSV
 * Shows loading state during export and displays success/error toasts
 */
export function ExportButton({ products, disabled = false, variant = 'outline', size = 'default', className }: ExportButtonProps) {
    const t = useTranslations('products.export');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (products.length === 0) {
            toast.error(t('noProducts'));
            return;
        }

        try {
            setIsExporting(true);

            // Add small delay to show loading state for better UX
            await new Promise((resolve) => setTimeout(resolve, 300));

            exportProductsToCSV(products);

            toast.success(t('success', { count: formatExportCount(products.length) }));
        } catch (error) {
            console.error('Export error:', error);
            const message = error instanceof Error ? error.message : t('error');
            toast.error(message);
        } finally {
            setIsExporting(false);
        }
    };

    const isDisabled = disabled || products.length === 0 || isExporting;

    return (
        <Button variant={variant} size={size} onClick={handleExport} disabled={isDisabled} className={className} title={products.length === 0 ? t('noProducts') : t('tooltip', { count: formatExportCount(products.length) })}>
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('exporting')}
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('button')} ({products.length})
                </>
            )}
        </Button>
    );
}
