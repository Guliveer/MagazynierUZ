'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, Settings, FileText, Shield, Activity, Database, Package, Warehouse, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getUserRoles, getUsername } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { getSystemStatistics, getAllUsers, type SystemStatistics } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function AdminPanelPage() {
    const t = useTranslations('admin');
    const params = useParams();
    const locale = params.locale as string;
    const username = getUsername();
    const roles = getUserRoles();
    const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
    const [userCount, setUserCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStatistics() {
            try {
                setLoading(true);
                setError(null);
                const [stats, users] = await Promise.all([getSystemStatistics(), getAllUsers().catch(() => [])]);
                setStatistics(stats);
                setUserCount(users.length);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('messages.loadStatisticsFailed'));
                // Set offline statistics on error
                setStatistics({
                    totalWarehouses: 0,
                    totalLocations: 0,
                    totalProducts: 0,
                    totalInventoryValue: 0,
                    activeWarehouses: 0,
                    apiStatus: 'offline',
                    databaseStatus: 'disconnected'
                });
                setUserCount(0);
            } finally {
                setLoading(false);
            }
        }

        fetchStatistics();
    }, [t]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {t('badge')}
                    </Badge>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Current User Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('session.title')}</CardTitle>
                    <CardDescription>{t('session.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('session.username')}</p>
                            <p className="text-lg font-semibold">{username || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('session.roles')}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <Badge key={role} variant="secondary" className="text-xs">
                                            {t(`roles.${role}` as `roles.${string}`)}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        {t('session.noRoles')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Health Status */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('systemHealth.systemStatus')}</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.apiStatus === 'online' ? t('systemHealth.online') : t('systemHealth.offline')}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.apiStatus === 'online' ? t('systemHealth.allSystemsOperational') : t('systemHealth.systemUnavailable')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('systemHealth.database')}</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.databaseStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.databaseStatus === 'connected' ? t('systemHealth.connected') : t('systemHealth.disconnected')}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.databaseStatus === 'connected' ? t('systemHealth.databaseResponsive') : t('systemHealth.databaseUnavailable')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('systemHealth.apiStatus')}</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.apiStatus === 'online' ? t('systemHealth.active') : t('systemHealth.inactive')}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.apiStatus === 'online' ? t('systemHealth.apiEndpointsReady') : t('systemHealth.apiUnavailable')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('systemHealth.session')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t('systemHealth.active')}</div>
                        <p className="text-xs text-muted-foreground">{t('systemHealth.authenticatedSession')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* System Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('statistics.totalUsers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{userCount}</div>
                                <p className="text-xs text-muted-foreground">{t('statistics.registeredUsers')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('statistics.totalWarehouses')}</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalWarehouses || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {statistics?.activeWarehouses || 0} {t('statistics.active')}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('statistics.totalLocations')}</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalLocations || 0}</div>
                                <p className="text-xs text-muted-foreground">{t('statistics.acrossAllWarehouses')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('statistics.totalProducts')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalProducts || 0}</div>
                                <p className="text-xs text-muted-foreground">{t('statistics.inInventory')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('statistics.inventoryValue')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(statistics?.totalInventoryValue || 0)}</div>
                                <p className="text-xs text-muted-foreground">{t('statistics.totalValue')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Admin Features */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Organisation Management */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.organisations')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.organisationsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/dashboard/admin/organisations`}>
                            <Button className="w-full">{t('features.manageOrganisations')}</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* My Organisation */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.myOrganisation')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.myOrganisationDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/dashboard/admin/organisation`}>
                            <Button className="w-full" variant="outline">
                                {t('features.viewDetails')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Warehouse Overview */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.warehouses')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.warehousesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/dashboard/warehouses`}>
                            <Button className="w-full">{t('features.viewWarehouses')}</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Inventory Summary */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.inventory')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.inventoryDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/dashboard/products`}>
                            <Button className="w-full">{t('features.viewInventory')}</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* User Management */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.userManagement')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.userManagementDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/dashboard/admin/users`}>
                            <Button className="w-full">{t('features.manageUsers')}</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* System Settings */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.systemSettings')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.systemSettingsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" disabled>
                            {t('features.comingSoon')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{t('features.auditLogs')}</CardTitle>
                        </div>
                        <CardDescription>{t('features.auditLogsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" disabled>
                            {t('features.comingSoon')}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('quickActions.title')}</CardTitle>
                    <CardDescription>{t('quickActions.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Link href={`/${locale}/dashboard/profile`}>
                            <Button variant="outline" size="sm">
                                <Users className="h-4 w-4 mr-2" />
                                {t('quickActions.viewProfile')}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/dashboard`}>
                            <Button variant="outline" size="sm">
                                <Activity className="h-4 w-4 mr-2" />
                                {t('quickActions.dashboard')}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/dashboard/statistics`}>
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                {t('quickActions.statistics')}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/dashboard/products`}>
                            <Button variant="outline" size="sm">
                                <Package className="h-4 w-4 mr-2" />
                                {t('quickActions.products')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
