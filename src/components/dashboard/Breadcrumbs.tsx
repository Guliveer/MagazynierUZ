'use client';

/**
 * Breadcrumbs Component
 *
 * Reusable breadcrumb navigation component that automatically generates
 * breadcrumb trails based on the current route configuration.
 *
 * Features:
 * - Automatic breadcrumb generation from route configuration
 * - i18n support via next-intl
 * - Dynamic route support (e.g., warehouse names)
 * - Collapsible for long breadcrumb chains
 * - Accessible with proper ARIA attributes
 */

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem as BreadcrumbItemUI, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from '@/components/ui/breadcrumb';
import { useBreadcrumbContext } from '@/contexts/BreadcrumbContext';
import { buildBreadcrumbChain, BREADCRUMB_CONFIG } from '@/config/breadcrumbs';
import type { BreadcrumbsProps, BreadcrumbItem } from '@/types/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * Main Breadcrumbs component
 *
 * @param items - Optional custom items to override automatic generation
 * @param className - Optional className for styling
 * @param showHome - Whether to show home icon for dashboard root (default: true)
 * @param separator - Custom separator component
 * @param maxItems - Maximum items to show before collapsing (default: 4)
 */
export function Breadcrumbs({ items: customItems, className, showHome = true, separator, maxItems = 4 }: BreadcrumbsProps) {
    const t = useTranslations('breadcrumbs');
    const pathname = usePathname();
    const { dynamicLabels } = useBreadcrumbContext();

    // Generate breadcrumb items from current route
    const autoItems = useMemo<BreadcrumbItem[]>(() => {
        const chain = buildBreadcrumbChain(pathname);

        return chain.map((item, index) => {
            const config = BREADCRUMB_CONFIG[item.pattern];
            const isLast = index === chain.length - 1;

            // Check for dynamic label in context
            let dynamicLabel: string | undefined;
            if (config?.isDynamic) {
                // Try to get dynamic label from context
                // Key format: pattern:paramValue - e.g., /dashboard/warehouses/:id:123
                const paramValue = Object.values(item.params)[0];
                const contextKey = `${item.pattern}:${paramValue}`;
                dynamicLabel = dynamicLabels[contextKey];
            }

            // Get the translated label or use dynamic label
            const label = dynamicLabel || (config ? t(config.labelKey) : '');

            return {
                label,
                href: item.href,
                isCurrentPage: isLast,
                icon: config?.icon
            };
        });
    }, [pathname, dynamicLabels, t]);

    // Use custom items if provided, otherwise use auto-generated
    const items = customItems || autoItems;

    // Handle collapsing for long breadcrumb chains
    const shouldCollapse = items.length > maxItems;
    const visibleItems = shouldCollapse
        ? [
            items[0], // First item - always show
            ...items.slice(-(maxItems - 1)) // Last items - always show
        ]
        : items;

    if (items.length === 0) {
        return null;
    }

    return (
        <Breadcrumb className={cn('mb-4', className)}>
            <BreadcrumbList>
                {visibleItems.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === visibleItems.length - 1;
                    const showEllipsis = shouldCollapse && index === 1;

                    return (
                        <React.Fragment key={item.href}>
                            {/* Ellipsis for collapsed items */}
                            {showEllipsis && (
                                <>
                                    <BreadcrumbItemUI>
                                        <BreadcrumbEllipsis />
                                    </BreadcrumbItemUI>
                                    <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                                </>
                            )}

                            <BreadcrumbItemUI>
                                {isLast || item.isCurrentPage ? (
                                    <BreadcrumbPage className="flex items-center gap-1.5">
                                        {isFirst && showHome ? (
                                            <>
                                                <Home className="h-4 w-4" />
                                                <span className="sr-only">{item.label}</span>
                                            </>
                                        ) : (
                                            <>
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href} className="flex items-center gap-1.5">
                                            {isFirst && showHome ? (
                                                <>
                                                    <Home className="h-4 w-4" />
                                                    <span className="sr-only">{item.label}</span>
                                                </>
                                            ) : (
                                                <>
                                                    {item.icon && <item.icon className="h-4 w-4" />}
                                                    <span>{item.label}</span>
                                                </>
                                            )}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItemUI>

                            {!isLast && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default Breadcrumbs;
