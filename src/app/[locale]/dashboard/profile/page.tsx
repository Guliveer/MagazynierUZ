'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building2, Shield, Calendar, Clock, CheckCircle2, XCircle, Key, LogOut } from 'lucide-react';
import { getUserRoles, getUsername, getTokenPayload, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
    const t = useTranslations('profile');
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
        if (!tokenPayload?.exp) {
            return t('session.unknown');
        }
        const expirationDate = new Date(tokenPayload.exp * 1000);
        return expirationDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTokenIssuedAt = () => {
        if (!tokenPayload?.iat) {
            return t('session.unknown');
        }
        const issuedDate = new Date(tokenPayload.iat * 1000);
        return issuedDate.toLocaleString(undefined, {
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
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
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
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('accountInfo.title')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t('accountInfo.userId')}</p>
                                            <p className="text-sm text-muted-foreground">{user.userId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t('accountInfo.accountCreated')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, {
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
                                            <p className="text-sm font-medium">{t('accountInfo.lastLogin')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.lastLogin).toLocaleDateString(undefined, {
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
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('organisation.title')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t('organisation.name')}</p>
                                            <p className="text-sm text-muted-foreground">{user.organisation.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t('organisation.id')}</p>
                                            <p className="text-sm text-muted-foreground">{user.organisation.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{t('organisation.tin')}</p>
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
                        <CardTitle>{t('roles.title')}</CardTitle>
                    </div>
                    <CardDescription>{t('roles.description')}</CardDescription>
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
                            <Badge variant="outline">{t('roles.noRoles')}</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accountStatus.title')}</CardTitle>
                    <CardDescription>{t('accountStatus.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.enabled ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">{t('accountStatus.enabled')}</p>
                                <p className="text-xs text-muted-foreground">{user.enabled ? t('accountStatus.active') : t('accountStatus.disabled')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.accountNonExpired ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">{t('accountStatus.notExpired')}</p>
                                <p className="text-xs text-muted-foreground">{user.accountNonExpired ? t('accountStatus.valid') : t('accountStatus.expired')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.accountNonLocked ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">{t('accountStatus.notLocked')}</p>
                                <p className="text-xs text-muted-foreground">{user.accountNonLocked ? t('accountStatus.unlocked') : t('accountStatus.locked')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            {user.credentialsNonExpired ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <div>
                                <p className="text-sm font-medium">{t('accountStatus.credentialsNotExpired')}</p>
                                <p className="text-xs text-muted-foreground">{user.credentialsNonExpired ? t('accountStatus.valid') : t('accountStatus.expired')}</p>
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
                        <CardTitle>{t('session.title')}</CardTitle>
                    </div>
                    <CardDescription>{t('session.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="text-sm font-medium">{t('session.tokenIssuedAt')}</p>
                                <p className="text-xs text-muted-foreground">{getTokenIssuedAt()}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="text-sm font-medium">{t('session.tokenExpiresAt')}</p>
                                <p className="text-xs text-muted-foreground">{getTokenExpiration()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
