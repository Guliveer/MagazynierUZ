'use client';

import { ReactNode, useState, useEffect } from 'react';
import { hasRole, hasAnyRole, hasAnyRoleFromServer } from '@/lib/auth';

interface RoleGuardProps {
  /** Array of role names required to view the content */
  roles: string[];
  /** If true, user must have ALL roles. If false, user must have ANY role. Default: false */
  requireAll?: boolean;
  /** Content to show if user doesn't have required roles */
  fallback?: ReactNode;
  /** Content to show if user has required roles */
  children: ReactNode;
  /** If true, verify roles against server. Default: false */
  useServerVerification?: boolean;
}

interface RoleCache {
  roles: string[];
  timestamp: number;
}

const roleCache: Map<string, RoleCache> = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

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
 *
 * @example
 * // Verify roles against server for enhanced security
 * <RoleGuard
 *   roles={["ROLE_ADMIN"]}
 *   useServerVerification={true}
 * >
 *   <SensitiveAdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ roles, requireAll = false, fallback = null, children, useServerVerification = false }: RoleGuardProps) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [isVerifying, setIsVerifying] = useState(useServerVerification);

    useEffect(() => {
        if (!useServerVerification) {
            const access = requireAll ? roles.every((role) => hasRole(role)) : hasAnyRole(roles);
            setHasAccess(access);
            setIsVerifying(false);
            return;
        }

        const verifyRoles = async () => {
            const cacheKey = roles.join(',');
            const cached = roleCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                const access = requireAll ? roles.every((role) => cached.roles.includes(role)) : roles.some((role) => cached.roles.includes(role));
                setHasAccess(access);
                setIsVerifying(false);
                return;
            }

            try {
                const serverHasAccess = await hasAnyRoleFromServer(roles);

                import('@/lib/api').then(({ getCurrentUserRole }) => {
                    getCurrentUserRole()
                        .then((roleResponse) => {
                            roleCache.set(cacheKey, {
                                roles: roleResponse.roles,
                                timestamp: Date.now()
                            });
                        })
                        .catch(() => {});
                });

                setHasAccess(serverHasAccess);
            } catch {
                const access = requireAll ? roles.every((role) => hasRole(role)) : hasAnyRole(roles);
                setHasAccess(access);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyRoles();
    }, [roles, requireAll, useServerVerification]);

    if (isVerifying || hasAccess === null) {
        return null;
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
