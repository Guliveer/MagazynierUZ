'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { Badge } from 'shadcn/badge';
import { Button } from 'shadcn/button';
import { Separator } from 'shadcn/separator';
import { Skeleton } from 'shadcn/skeleton';
import { Alert, AlertDescription } from 'shadcn/alert';
import { Building2, Users, Package, Warehouse, ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Hash, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getUsername, getOrganisationId, getOrganisationName } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { getOrganisationStatistics, type OrganisationStatistics } from '@/lib/api';

export default function OrganisationPage() {
    const username = getUsername();
    const organisationId = getOrganisationId();
    const organisationName = getOrganisationName();

    const [statistics, setStatistics] = useState<OrganisationStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStatistics() {
            try {
                setLoading(true);
                setError(null);
                const stats = await getOrganisationStatistics();
                setStatistics(stats);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load statistics');
                setStatistics({
                    warehouseCount: 0,
                    locationCount: 0,
                    productCount: 0,
                    totalValue: 0
                });
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
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Organisation Management</h1>
                        <p className="text-muted-foreground mt-2">View and manage organisation details</p>
                    </div>
                </div>
                <Button disabled>
                    <Edit className="h-4 w-4 mr-2" />
          Edit Organisation
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Organisation Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{organisationName || 'Organisation'}</CardTitle>
                                <CardDescription>{organisationId ? `Organisation ID: ${organisationId}` : 'Organisation information from JWT token'}</CardDescription>
                            </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Organisation Information */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Organisation Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Organisation</p>
                                            <p className="text-sm text-muted-foreground">{organisationName || organisationId ? `${organisationName || 'Organisation'} ${organisationId ? `(ID: ${organisationId})` : ''}` : 'Information not available in JWT token'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Data Source</p>
                                            <p className="text-sm text-muted-foreground">Statistics from API endpoints</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information Placeholder */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">Not available via API</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">Not available via API</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Address</p>
                                            <p className="text-sm text-muted-foreground">Not available via API</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organisation Details */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Administrator Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Current Administrator</p>
                                            <p className="text-sm text-muted-foreground">{username || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Session</p>
                                            <p className="text-sm text-muted-foreground">Active and authenticated</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Information</h3>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Organisation details are extracted from your JWT authentication token. Additional organisation management features require backend API support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.warehouseCount || 0}</div>
                                <p className="text-xs text-muted-foreground">Managed warehouses</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Locations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.locationCount || 0}</div>
                                <p className="text-xs text-muted-foreground">Total locations</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.productCount || 0}</div>
                                <p className="text-xs text-muted-foreground">Total products in inventory</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(statistics?.totalValue || 0)}</div>
                                <p className="text-xs text-muted-foreground">Inventory value</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Organisation Members</CardTitle>
                    <CardDescription>Users who belong to this organisation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm font-medium">User management coming soon</p>
                        <p className="text-xs mt-2">This feature requires backend API support for user listing and management</p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Navigate to related sections</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/dashboard/warehouses">
                            <Button variant="outline" size="sm">
                                <Warehouse className="h-4 w-4 mr-2" />
                View Warehouses
                            </Button>
                        </Link>
                        <Link href="/dashboard/products">
                            <Button variant="outline" size="sm">
                                <Package className="h-4 w-4 mr-2" />
                View Products
                            </Button>
                        </Link>
                        <Link href="/dashboard/statistics">
                            <Button variant="outline" size="sm">
                                <TrendingUp className="h-4 w-4 mr-2" />
                View Statistics
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Organisation Actions</CardTitle>
                    <CardDescription>Administrative actions for this organisation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" disabled>
                            <Edit className="h-4 w-4 mr-2" />
              Edit Details
                        </Button>
                        <Button variant="outline" disabled>
                            <Users className="h-4 w-4 mr-2" />
              Manage Members
                        </Button>
                        <Button variant="outline" disabled>
                            <Mail className="h-4 w-4 mr-2" />
              Send Notification
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Note: These features require backend API support for organisation management and are currently unavailable.</p>
                </CardContent>
            </Card>
        </div>
    );
}
