import type { Product } from "@/types";

/**
 * Escapes special characters in CSV fields
 * Handles quotes, commas, and newlines
 */
function escapeCSVField(field: string | number | undefined | null): string {
  if (field === null || field === undefined) {
    return "";
  }

  const stringField = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Converts an array of products to CSV format
 * @param products - Array of products to export
 * @returns CSV string
 */
export function productsToCSV(products: Product[]): string {
  // Define CSV headers
  const headers = ["ID", "Name", "Description", "Price (PLN)", "Quantity"];

  // Create CSV rows
  const rows = products.map((product) => [escapeCSVField(product.id), escapeCSVField(product.name), escapeCSVField(product.description), escapeCSVField(product.price.toFixed(2)), escapeCSVField(product.quantity)]);

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csvContent;
}

/**
 * Triggers a download of CSV data
 * @param csvContent - CSV string content
 * @param filename - Optional filename (defaults to timestamped name)
 */
export function downloadCSV(csvContent: string, filename?: string): void {
  // Generate filename with timestamp if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const finalFilename = filename || `products-export-${timestamp}.csv`;

  // Create blob with UTF-8 BOM for proper Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link and trigger download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Exports products to CSV and triggers download
 * @param products - Array of products to export
 * @param filename - Optional filename
 */
export function exportProductsToCSV(products: Product[], filename?: string): void {
  if (products.length === 0) {
    throw new Error("No products to export");
  }

  const csvContent = productsToCSV(products);
  downloadCSV(csvContent, filename);
}

/**
 * Formats export statistics for display
 * @param count - Number of items to export
 * @returns Formatted string
 */
export function formatExportCount(count: number): string {
  if (count === 0) {
    return "No items";
  }
  if (count === 1) {
    return "1 item";
  }
  return `${count.toLocaleString("pl-PL")} items`;
}
