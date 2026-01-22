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

export default function AdminPanelPage() {
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
                setError(err instanceof Error ? err.message : 'Failed to load statistics');
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
    }, []);

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
                    <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                    <p className="text-muted-foreground mt-2">System administration and management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
            Administrator
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
                    <CardTitle className="text-lg">Current Session</CardTitle>
                    <CardDescription>Your administrator session information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Username</p>
                            <p className="text-lg font-semibold">{username || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Roles</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <Badge key={role} variant="secondary" className="text-xs">
                                            {role}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                    No roles
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
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.apiStatus === 'online' ? 'Online' : 'Offline'}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.apiStatus === 'online' ? 'All systems operational' : 'System unavailable'}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.databaseStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.databaseStatus === 'connected' ? 'Connected' : 'Disconnected'}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.databaseStatus === 'connected' ? 'Database responsive' : 'Database unavailable'}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Status</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${statistics?.apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>{statistics?.apiStatus === 'online' ? 'Active' : 'Inactive'}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.apiStatus === 'online' ? 'API endpoints ready' : 'API unavailable'}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Session</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">Authenticated session</p>
                    </CardContent>
                </Card>
            </div>

            {/* System Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{userCount}</div>
                                <p className="text-xs text-muted-foreground">Registered users</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalWarehouses || 0}</div>
                                <p className="text-xs text-muted-foreground">{statistics?.activeWarehouses || 0} active</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalLocations || 0}</div>
                                <p className="text-xs text-muted-foreground">Across all warehouses</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.totalProducts || 0}</div>
                                <p className="text-xs text-muted-foreground">In inventory</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(statistics?.totalInventoryValue || 0)}</div>
                                <p className="text-xs text-muted-foreground">Total value</p>
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
                            <CardTitle className="text-lg">Organisations</CardTitle>
                        </div>
                        <CardDescription>Manage all organisations in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/admin/organisations">
                            <Button className="w-full">Manage Organisations</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* My Organisation */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">My Organisation</CardTitle>
                        </div>
                        <CardDescription>View your organisation details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/admin/organisation">
                            <Button className="w-full" variant="outline">
                View Details
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Warehouse Overview */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Warehouses</CardTitle>
                        </div>
                        <CardDescription>View and manage all warehouses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/warehouses">
                            <Button className="w-full">View Warehouses</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Inventory Summary */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Inventory</CardTitle>
                        </div>
                        <CardDescription>View inventory across all locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/products">
                            <Button className="w-full">View Inventory</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* User Management */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">User Management</CardTitle>
                        </div>
                        <CardDescription>Manage users, roles, and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/admin/users">
                            <Button className="w-full">Manage Users</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* System Settings */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">System Settings</CardTitle>
                        </div>
                        <CardDescription>Configure system-wide settings (Coming Soon)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" disabled>
              Coming Soon
                        </Button>
                    </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Audit Logs</CardTitle>
                        </div>
                        <CardDescription>View system activity and audit trails (Coming Soon)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" disabled>
              Coming Soon
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/dashboard/profile">
                            <Button variant="outline" size="sm">
                                <Users className="h-4 w-4 mr-2" />
                View Profile
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <Activity className="h-4 w-4 mr-2" />
                Dashboard
                            </Button>
                        </Link>
                        <Link href="/dashboard/statistics">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                Statistics
                            </Button>
                        </Link>
                        <Link href="/dashboard/products">
                            <Button variant="outline" size="sm">
                                <Package className="h-4 w-4 mr-2" />
                Products
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
