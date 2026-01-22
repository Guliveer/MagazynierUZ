'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    // Compute authorization state during render instead of in effect
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }
        if (!isAuthenticated()) {
            return null;
        }
        return isAdmin();
    });

    useEffect(() => {
    // Check authentication and admin role
        if (!isAuthenticated()) {
            router.push('/login?redirect=/dashboard/admin');
            return;
        }

        // Use a microtask to avoid synchronous setState in effect
        Promise.resolve().then(() => {
            const authorized = isAdmin();
            setIsAuthorized(authorized);
        });
    }, [router]);

    // Loading state
    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Unauthorized state
    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="max-w-md w-full">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>You do not have permission to access the admin panel. This area is restricted to administrators only.</AlertDescription>
                    </Alert>
                    <div className="mt-6 flex gap-2">
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="default" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
                            </Button>
                        </Link>
                        <Link href="/dashboard/profile" className="flex-1">
                            <Button variant="outline" className="w-full">
                View Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Authorized - render admin content
    return <>{children}</>;
}
