'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from 'shadcn/button';
import { exportInventoryToPdf, type ExportInventoryParams } from '@/lib/api';

interface PdfExportButtonProps {
  scope: 'ORGANISATION' | 'WAREHOUSE' | 'LOCATION';
  warehouseId?: number;
  locationId?: number;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button component for exporting inventory to PDF
 * Shows loading state during export and displays success/error toasts
 * Automatically triggers download when PDF is ready
 */
export function PdfExportButton({ scope, warehouseId, locationId, label, variant = 'outline', size = 'default', className }: PdfExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    // Validate required parameters
    const isDisabled = (scope === 'WAREHOUSE' && warehouseId === undefined) || (scope === 'LOCATION' && (warehouseId === undefined || locationId === undefined));

    const handleExport = async () => {
        if (isDisabled) {
            toast.error('Missing required parameters for export');
            return;
        }

        try {
            setIsExporting(true);

            // Build export parameters
            const params: ExportInventoryParams = {
                scope,
                warehouseId,
                locationId
            };

            // Call API to get PDF blob
            const blob = await exportInventoryToPdf(params);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const scopeLower = scope.toLowerCase();
            const filename = `inventory-${scopeLower}-${timestamp}.pdf`;

            // Create download link and trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            URL.revokeObjectURL(url);

            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('PDF export error:', error);
            const message = error instanceof Error ? error.message : 'Failed to export PDF';
            toast.error(message);
        } finally {
            setIsExporting(false);
        }
    };

    // Generate button label
    const buttonLabel = label || `Export ${scope === 'ORGANISATION' ? 'Organisation' : scope === 'WAREHOUSE' ? 'Warehouse' : 'Location'} PDF`;

    // Generate tooltip
    const tooltip = isDisabled ? 'Missing required parameters' : `Export inventory to PDF (${scope})`;

    return (
        <Button variant={variant} size={size} onClick={handleExport} disabled={isDisabled || isExporting} className={className} title={tooltip}>
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    {buttonLabel}
                </>
            )}
        </Button>
    );
}
