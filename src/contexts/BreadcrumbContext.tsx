'use client';

/**
 * Breadcrumb Context
 *
 * React context for managing dynamic breadcrumb labels.
 * Allows pages to set custom labels for dynamic routes (e.g., warehouse names).
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { BreadcrumbContextType } from '@/types/breadcrumb';
import { matchRoutePattern } from '@/config/breadcrumbs';

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

/**
 * Provider for breadcrumb dynamic data
 * Allows pages to set dynamic labels - e.g., warehouse names
 */
export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [dynamicLabels, setDynamicLabelsState] = useState<Record<string, string>>({});

    const setDynamicLabel = useCallback((key: string, value: string) => {
        setDynamicLabelsState((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearDynamicLabel = useCallback((key?: string) => {
        if (key) {
            setDynamicLabelsState((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        } else {
            setDynamicLabelsState({});
        }
    }, []);

    return <BreadcrumbContext.Provider value={{ dynamicLabels, setDynamicLabel, clearDynamicLabel }}>{children}</BreadcrumbContext.Provider>;
}

/**
 * Hook to access breadcrumb context
 *
 * @throws Error if used outside of BreadcrumbProvider
 */
export function useBreadcrumbContext(): BreadcrumbContextType {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
    }
    return context;
}

/**
 * Hook to set a dynamic breadcrumb label for the current page
 *
 * Usage in a page component:
 * ```tsx
 * useSetBreadcrumbLabel(warehouse?.name);
 * ```
 *
 * @param label - The dynamic label to display (e.g., warehouse name)
 */
export function useSetBreadcrumbLabel(label: string | undefined | null): void {
    const pathname = usePathname();
    const { setDynamicLabel, clearDynamicLabel } = useBreadcrumbContext();

    useEffect(() => {
        if (!label) {
            return;
        }

        const { pattern, params } = matchRoutePattern(pathname);
        if (!pattern) {
            return;
        }

        const paramValue = Object.values(params)[0];
        if (!paramValue) {
            return;
        }

        const contextKey = `${pattern}:${paramValue}`;
        setDynamicLabel(contextKey, label);

        return () => {
            clearDynamicLabel(contextKey);
        };
    }, [label, pathname, setDynamicLabel, clearDynamicLabel]);
}
