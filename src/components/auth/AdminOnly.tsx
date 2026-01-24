'use client';

import { ReactNode } from 'react';
import { RoleGuard } from './RoleGuard';

interface AdminOnlyProps {
  /** Content to show if user doesn't have admin access */
  fallback?: ReactNode;
  /** Content to show if user is admin */
  children: ReactNode;
}

/**
 * Simplified wrapper for admin-only content
 * Shows content only to users with ROLE_ADMIN
 *
 * @example
 * <AdminOnly>
 *   <AdminPanel />
 * </AdminOnly>
 *
 * @example
 * <AdminOnly fallback={<p>Admin access required</p>}>
 *   <AdminSettings />
 * </AdminOnly>
 */
export function AdminOnly({ fallback, children }: AdminOnlyProps) {
    return (
        <RoleGuard roles={['ROLE_ADMIN', 'SUPERADMIN', 'ROLE_SUPERADMIN']} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}
