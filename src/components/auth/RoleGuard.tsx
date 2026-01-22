'use client';

import { ReactNode } from 'react';
import { hasRole, hasAnyRole } from '@/lib/auth';

interface RoleGuardProps {
  /** Array of role names required to view the content */
  roles: string[];
  /** If true, user must have ALL roles. If false, user must have ANY role. Default: false */
  requireAll?: boolean;
  /** Content to show if user doesn't have required roles */
  fallback?: ReactNode;
  /** Content to show if user has required roles */
  children: ReactNode;
}

/**
 * Component wrapper that shows/hides content based on user roles
 *
 * @example
 * // Show content only to admins
 * <RoleGuard roles={["ROLE_ADMIN"]}>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Show content to admins or managers
 * <RoleGuard roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
 *   <ManagementTools />
 * </RoleGuard>
 *
 * @example
 * // Show content only if user has both roles
 * <RoleGuard roles={["ROLE_ADMIN", "ROLE_MANAGER"]} requireAll>
 *   <AdvancedSettings />
 * </RoleGuard>
 *
 * @example
 * // Show fallback content if user doesn't have access
 * <RoleGuard
 *   roles={["ROLE_ADMIN"]}
 *   fallback={<p>You need admin access to view this.</p>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ roles, requireAll = false, fallback = null, children }: RoleGuardProps) {
    // Check if user has required roles
    const hasAccess = requireAll ? roles.every((role) => hasRole(role)) : hasAnyRole(roles);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
