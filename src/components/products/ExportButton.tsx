'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (products.length === 0) {
            toast.error('No products to export');
            return;
        }

        try {
            setIsExporting(true);

            // Add small delay to show loading state for better UX
            await new Promise((resolve) => setTimeout(resolve, 300));

            exportProductsToCSV(products);

            toast.success(`Successfully exported ${formatExportCount(products.length)} to CSV`);
        } catch (error) {
            console.error('Export error:', error);
            const message = error instanceof Error ? error.message : 'Failed to export products';
            toast.error(message);
        } finally {
            setIsExporting(false);
        }
    };

    const isDisabled = disabled || products.length === 0 || isExporting;

    return (
        <Button variant={variant} size={size} onClick={handleExport} disabled={isDisabled} className={className} title={products.length === 0 ? 'No products to export' : `Export ${formatExportCount(products.length)}`}>
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
          Export ({products.length})
                </>
            )}
        </Button>
    );
}
