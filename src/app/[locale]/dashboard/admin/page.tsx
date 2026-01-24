'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { Badge } from 'shadcn/badge';
import { Button } from 'shadcn/button';
import { Skeleton } from 'shadcn/skeleton';
import { Users, Building2, Shield, Package, Warehouse, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getUsername, refreshRolesCache } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { getSystemStatistics, getAllUsers, type SystemStatistics } from '@/lib/api';
import { Alert, AlertDescription } from 'shadcn/alert';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function AdminPanelPage() {
    const t = useTranslations('admin');
    const params = useParams();
    const locale = params.locale as string;
    const username = getUsername();
    const [roles, setRoles] = useState<string[]>([]);
    const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
    const [userCount, setUserCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setLoadingRoles(true);
                setError(null);

                const [fetchedRoles, stats, users] = await Promise.all([refreshRolesCache(), getSystemStatistics(), getAllUsers().catch(() => [])]);

                setRoles(fetchedRoles);
                setStatistics(stats);
                setUserCount(users.length);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('messages.loadStatisticsFailed'));
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
                setLoadingRoles(false);
            }
        }

        fetchData();
    }, [t]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(value);
    };

    return (
        <div className="space-y-6">
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

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
                                {loadingRoles ? (
                                    <Skeleton className="h-5 w-20" />
                                ) : roles.length > 0 ? (
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                            <Button className="w-full">{t('features.viewDetails')}</Button>
                        </Link>
                    </CardContent>
                </Card>

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
            </div>
        </div>
    );
}
