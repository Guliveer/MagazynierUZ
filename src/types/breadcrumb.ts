/**
 * Breadcrumb TypeScript Types
 *
 * This file contains all TypeScript interfaces and types for the breadcrumb system.
 */

import type { ComponentType } from 'react';

/**
 * Represents a single breadcrumb item in the navigation trail
 */
export interface BreadcrumbItem {
  /** Translation key for the label (e.g., 'dashboard', 'warehouses') */
  label: string;
  /** Route path for navigation */
  href: string;
  /** Whether this is the current/active page */
  isCurrentPage?: boolean;
  /** Optional icon component to display */
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Configuration for a single route in the breadcrumb system
 */
export interface BreadcrumbRouteConfig {
  /** Translation key for the breadcrumb label */
  labelKey: string;
  /** Parent route path - null for root level items */
  parent: string | null;
  /** Whether this route has dynamic segments (e.g., :id) */
  isDynamic?: boolean;
  /** Optional icon for this breadcrumb */
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Complete breadcrumb configuration map
 * Key is the route pattern (e.g., '/dashboard/warehouses/:id'), value is the configuration
 */
export type BreadcrumbConfigMap = Record<string, BreadcrumbRouteConfig>;

/**
 * Props for the main Breadcrumbs component
 */
export interface BreadcrumbsProps {
  /** Optional custom items to override automatic generation */
  items?: BreadcrumbItem[];
  /** Optional className for styling */
  className?: string;
  /** Whether to show home/dashboard as first item (default: true) */
  showHome?: boolean;
  /** Custom separator component */
  separator?: React.ReactNode;
  /** Maximum items to show before collapsing (default: 4) */
  maxItems?: number;
}

/**
 * Context type for dynamic breadcrumb data
 * Used to pass dynamic labels (e.g., warehouse names) to breadcrumbs
 */
export interface BreadcrumbContextType {
  /** Dynamic labels for route segments - key is route pattern:paramValue, value is the label */
  dynamicLabels: Record<string, string>;
  /** Function to set a dynamic label */
  setDynamicLabel: (key: string, value: string) => void;
  /** Function to clear a dynamic label or all labels */
  clearDynamicLabel: (key?: string) => void;
}

/**
 * Return type for the useBreadcrumbs hook
 */
export interface UseBreadcrumbsReturn {
  /** Generated breadcrumb items */
  items: BreadcrumbItem[];
  /** Whether breadcrumbs are loading (e.g., fetching dynamic labels) */
  isLoading: boolean;
  /** Current pathname */
  pathname: string;
}

/**
 * Result of matching a pathname to a route pattern
 */
export interface RouteMatchResult {
  /** The matched route pattern or null if no match */
  pattern: string | null;
  /** Extracted route parameters (e.g., { id: '123' }) */
  params: Record<string, string>;
}

/**
 * Item in the breadcrumb chain during construction
 */
export interface BreadcrumbChainItem {
  /** The route pattern */
  pattern: string;
  /** The actual href with params substituted */
  href: string;
  /** Route parameters */
  params: Record<string, string>;
}
