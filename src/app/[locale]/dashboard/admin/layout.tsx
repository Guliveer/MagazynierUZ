'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, refreshRolesCache } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { Button } from 'shadcn/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('admin.layout');
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!isAuthenticated()) {
                router.push(`/${locale}/login?redirect=/${locale}/dashboard/admin`);
                return;
            }

            try {
                const fetchedRoles = await refreshRolesCache();

                const hasAdminAccess = fetchedRoles.includes('ROLE_ADMIN') || fetchedRoles.includes('SUPERADMIN') || fetchedRoles.includes('ROLE_SUPERADMIN');

                setIsAuthorized(hasAdminAccess);
            } catch {
                setIsAuthorized(false);
            }
        };

        checkAdminAccess();
    }, [router, locale]);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('verifyingAccess')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="max-w-md w-full">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>{t('accessDenied')}</AlertTitle>
                        <AlertDescription>{t('accessDeniedMessage')}</AlertDescription>
                    </Alert>
                    <div className="mt-6 flex gap-2">
                        <Link href={`/${locale}/dashboard`} className="flex-1">
                            <Button variant="default" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('backToDashboard')}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/dashboard/profile`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                {t('viewProfile')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
