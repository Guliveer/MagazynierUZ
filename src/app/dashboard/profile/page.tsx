'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building2, Shield, Calendar, Clock, CheckCircle2, XCircle, Key, LogOut } from 'lucide-react';
import { getUserRoles, getUsername, getTokenPayload, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const username = getUsername();
    const roles = getUserRoles();
    const tokenPayload = getTokenPayload();

    // Mock user data - in a real app, this would come from an API
    const user = {
        userId: 1,
        username: username || 'Unknown',
        email: `${username}@example.com`,
        organisation: {
            id: 1,
            name: 'Sample Organisation',
            tin: '1234567890'
        },
        roles: roles.map((role, index) => ({
            id: index + 1,
            name: role
        })),
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: new Date().toISOString(),
        enabled: true,
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const getTokenExpiration = () => {
        if (!tokenPayload?.exp) { return 'Unknown'; }
        const expirationDate = new Date(tokenPayload.exp * 1000);
        return expirationDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTokenIssuedAt = () => {
        if (!tokenPayload?.iat) { return 'Unknown'; }
        const issuedDate = new Date(tokenPayload.iat * 1000);
        return issuedDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
                    <p className="text-muted-foreground mt-2">Your account information and settings</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
          Logout
                </Button>
            </div>

            {/* Profile Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{user.username}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Account Information */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Account Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">User ID</p>
                                            <p className="text-sm text-muted-foreground">{user.userId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Account Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Last Login</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.lastLogin).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organisation */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Organisation</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Organisation Name</p>
                                            <p className="text-sm text-muted-foreground">{user.organisation.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Organisation ID</p>
                                            <p className="text-sm text-muted-foreground">{user.organisation.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Tax ID (TIN)</p>
                                            <p className="text-sm text-muted-foreground">{user.organisation.tin}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roles & Permissions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle>Roles & Permissions</CardTitle>
                    </div>
                    <CardDescription>Your assigned roles in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <Badge key={role.id} variant="default" className="text-sm px-3 py-1">
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="outline">No roles assigned</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                    <CardDescription>Current status of your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.enabled ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">Account Enabled</p>
                                <p className="text-xs text-muted-foreground">{user.enabled ? 'Active' : 'Disabled'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.accountNonExpired ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">Account Not Expired</p>
                                <p className="text-xs text-muted-foreground">{user.accountNonExpired ? 'Valid' : 'Expired'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.accountNonLocked ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">Account Not Locked</p>
                                <p className="text-xs text-muted-foreground">{user.accountNonLocked ? 'Unlocked' : 'Locked'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.credentialsNonExpired ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">Credentials Not Expired</p>
                                <p className="text-xs text-muted-foreground">{user.credentialsNonExpired ? 'Valid' : 'Expired'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Session Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        <CardTitle>Session Information</CardTitle>
                    </div>
                    <CardDescription>Current authentication session details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="text-sm font-medium">Token Issued At</p>
                                <p className="text-xs text-muted-foreground">{getTokenIssuedAt()}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="text-sm font-medium">Token Expires At</p>
                                <p className="text-xs text-muted-foreground">{getTokenExpiration()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
