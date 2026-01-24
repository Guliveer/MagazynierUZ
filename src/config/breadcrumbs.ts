/**
 * Breadcrumb Configuration
 *
 * Centralized route configuration for the breadcrumb system.
 * Defines the hierarchy and labels for all application routes.
 */

import { LayoutDashboard, Building2, Package, BarChart3, User, Shield, Users, Building } from 'lucide-react';
import type { BreadcrumbConfigMap, BreadcrumbRouteConfig, RouteMatchResult, BreadcrumbChainItem } from '@/types/breadcrumb';

/**
 * Breadcrumb configuration for all application routes
 *
 * Route patterns use :param syntax for dynamic segments
 * Parent references create the hierarchy chain
 */
export const BREADCRUMB_CONFIG: BreadcrumbConfigMap = {
    '/dashboard': {
        labelKey: 'dashboard',
        parent: null,
        icon: LayoutDashboard
    },

    '/dashboard/warehouses': {
        labelKey: 'warehouses',
        parent: '/dashboard',
        icon: Building2
    },
    '/dashboard/warehouses/:id': {
        labelKey: 'warehouseDetail',
        parent: '/dashboard/warehouses',
        isDynamic: true,
        icon: Building2
    },

    '/dashboard/products': {
        labelKey: 'products',
        parent: '/dashboard',
        icon: Package
    },

    '/dashboard/statistics': {
        labelKey: 'statistics',
        parent: '/dashboard',
        icon: BarChart3
    },

    '/dashboard/profile': {
        labelKey: 'profile',
        parent: '/dashboard',
        icon: User
    },

    '/dashboard/admin': {
        labelKey: 'admin',
        parent: '/dashboard',
        icon: Shield
    },
    '/dashboard/admin/users': {
        labelKey: 'users',
        parent: '/dashboard/admin',
        icon: Users
    },
    '/dashboard/admin/organisations': {
        labelKey: 'organisations',
        parent: '/dashboard/admin',
        icon: Building
    },
    '/dashboard/admin/organisation': {
        labelKey: 'myOrganisation',
        parent: '/dashboard/admin',
        icon: Building
    }
};

/**
 * Helper to match a pathname to a route pattern
 * Handles dynamic segments like /warehouses/123
 *
 * @param pathname - The current pathname (e.g., '/en/dashboard/warehouses/123')
 * @returns The matched pattern and extracted params
 */
export function matchRoutePattern(pathname: string): RouteMatchResult {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');

    if (BREADCRUMB_CONFIG[pathWithoutLocale]) {
        return { pattern: pathWithoutLocale, params: {} };
    }

    for (const pattern of Object.keys(BREADCRUMB_CONFIG)) {
        const patternParts = pattern.split('/');
        const pathParts = pathWithoutLocale.split('/');

        if (patternParts.length !== pathParts.length) {
            continue;
        }

        const params: Record<string, string> = {};
        let isMatch = true;

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                isMatch = false;
                break;
            }
        }

        if (isMatch) {
            return { pattern, params };
        }
    }

    return { pattern: null, params: {} };
}

/**
 * Build breadcrumb chain from current route to root
 *
 * @param pathname - The current pathname
 * @returns Array of breadcrumb chain items from root to current
 */
export function buildBreadcrumbChain(pathname: string): BreadcrumbChainItem[] {
    const { pattern, params } = matchRoutePattern(pathname);

    if (!pattern) {
        return [];
    }

    const chain: BreadcrumbChainItem[] = [];
    let currentPattern: string | null = pattern;

    while (currentPattern) {
        const config: BreadcrumbRouteConfig | undefined = BREADCRUMB_CONFIG[currentPattern];
        if (!config) {
            break;
        }

        let href = currentPattern;
        for (const [key, value] of Object.entries(params)) {
            href = href.replace(`:${key}`, value);
        }

        chain.unshift({
            pattern: currentPattern,
            href,
            params
        });

        currentPattern = config.parent;
    }

    return chain;
}

/**
 * Get the configuration for a specific route pattern
 *
 * @param pattern - The route pattern
 * @returns The route configuration or undefined
 */
export function getRouteConfig(pattern: string) {
    return BREADCRUMB_CONFIG[pattern];
}
