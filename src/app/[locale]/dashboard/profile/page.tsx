'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { Badge } from 'shadcn/badge';
import { Button } from 'shadcn/button';
import { Skeleton } from 'shadcn/skeleton';
import { User, Shield, CheckCircle2, XCircle, Key, LogOut } from 'lucide-react';
import { getUsername, getTokenPayload, logout, refreshRolesCache } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const t = useTranslations('profile');
    const router = useRouter();
    const username = getUsername();
    const tokenPayload = getTokenPayload();
    const [roles, setRoles] = useState<string[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        async function fetchRoles() {
            try {
                setLoadingRoles(true);
                const fetchedRoles = await refreshRolesCache();
                setRoles(fetchedRoles);
            } catch {
                setRoles([]);
            } finally {
                setLoadingRoles(false);
            }
        }

        fetchRoles();
    }, []);

    const user = {
        username: username || 'Unknown',
        roles: roles.map((role, index) => ({
            id: index + 1,
            name: role
        })),
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

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{user.username}</CardTitle>
                            <CardDescription>{t('accountInfo.title')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">{t('accountInfo.username')}</p>
                                <p className="text-sm text-muted-foreground">{user.username}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                        {loadingRoles ? (
                            <>
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-7 w-20" />
                            </>
                        ) : user.roles.length > 0 ? (
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
