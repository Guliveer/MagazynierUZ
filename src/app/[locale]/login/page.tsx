'use client';
import HCaptchaWrapper, { HCaptchaRef } from '@/components/HCaptcha';
import { ApiError, login } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { storeEncryptedCredentials } from '@/lib/crypto';
import { AlertCircleIcon, InfoIcon, Loader2Icon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'shadcn/card';
import { Input } from 'shadcn/input';
import { Checkbox } from 'shadcn/checkbox';
import { Label } from 'shadcn/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

function LoginForm() {
    const t = useTranslations('auth.login');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
    const [sessionExtendMessage, setSessionExtendMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const captchaRef = useRef<HCaptchaRef>(null);

    // Check for session expiration or extension message
    useEffect(() => {
        const expired = searchParams.get('expired');
        const extend = searchParams.get('extend');
        const sessionExpired = typeof window !== 'undefined' && sessionStorage.getItem('session_expired');
        const storedMessage = typeof window !== 'undefined' && sessionStorage.getItem('session_expired_message');

        if (expired === 'true' || sessionExpired === 'true') {
            setSessionExpiredMessage(storedMessage || t('sessionExpired.message'));
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('session_expired');
                sessionStorage.removeItem('session_expired_message');
            }
        } else if (extend === 'true') {
            setSessionExtendMessage(t('extendSession.message'));
        }
    }, [searchParams, t]);

    const handleCaptchaVerify = (token: string) => {
        setCaptchaToken(token);
        setError(null);
    };

    const handleCaptchaExpire = () => {
        setCaptchaToken(null);
    };

    const handleCaptchaError = (err: string) => {
        setError(t('errors.captchaError', { error: err }));
        setCaptchaToken(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Skip CAPTCHA validation in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (!isDevelopment && !captchaToken) {
            setError(t('errors.captchaRequired'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setSessionExpiredMessage(null);

        try {
            const response = await login(username, password);
            setToken(response.token);

            // Store credentials if "Remember me" is checked
            if (rememberMe) {
                try {
                    await storeEncryptedCredentials(username, password);
                } catch (error) {
                    console.error('Failed to store credentials:', error);
                    // Continue with login even if credential storage fails
                }
            }

            // Reset captcha after submission
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);

            // Check for redirect parameter
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl && redirectUrl.startsWith('/')) {
                router.push(redirectUrl);
            } else {
                // Redirect to dashboard after successful login
                router.push('/dashboard');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.statusCode === 401) {
                    setError(t('errors.invalidCredentials'));
                } else {
                    setError(err.message || t('errors.loginFailed'));
                }
            } else {
                setError(t('errors.unexpectedError'));
            }

            // Reset captcha on error
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/warehouse-bg.png')" }}>
            {/* Theme and Locale Switchers in top-right corner */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <ThemeSwitcher />
                <LocaleSwitcher />
            </div>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">{t('title')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {sessionExpiredMessage && (
                        <Alert variant="default" className="flex items-start space-x-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                            <InfoIcon className="h-5 w-5 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <AlertTitle className="text-yellow-800 dark:text-yellow-200">{t('sessionExpired.title')}</AlertTitle>
                                <AlertDescription className="text-yellow-700 dark:text-yellow-300">{sessionExpiredMessage}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    {sessionExtendMessage && (
                        <Alert variant="default" className="flex items-start space-x-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                            <InfoIcon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <AlertTitle className="text-blue-800 dark:text-blue-200">{t('extendSession.title')}</AlertTitle>
                                <AlertDescription className="text-blue-700 dark:text-blue-300">{sessionExtendMessage}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive" className="flex items-start space-x-2">
                            <AlertCircleIcon className="h-5 w-5 mt-0.5" />
                            <div>
                                <AlertTitle>{tCommon('status.error')}</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="username" type="text" placeholder={tCommon('labels.username')} value={username} onChange={(e) => setUsername(e.target.value)} className={'space-y-2'} disabled={isLoading} required />

                        <Input id="password" type="password" placeholder={tCommon('labels.password')} value={password} onChange={(e) => setPassword(e.target.value)} className={'space-y-2'} disabled={isLoading} required />

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} disabled={isLoading} />
                            <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                                {tCommon('labels.rememberMe')}
                            </Label>
                        </div>

                        <div className="flex justify-center">
                            <HCaptchaWrapper ref={captchaRef} onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} onError={handleCaptchaError} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    {t('loggingIn')}
                                </>
                            ) : (
                                t('title')
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground text-center flex justify-center">
                    {t('noAccount')}{' '}
                    <Link href="/register" className="ml-1 text-primary hover:underline">
                        {t('registerNow')}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner className="h-8 w-8" />
                </div>
            }>
            <LoginForm />
        </Suspense>
    );
}
