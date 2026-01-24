'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'shadcn/button';
import { Input } from 'shadcn/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'shadcn/card';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import HCaptchaWrapper, { HCaptchaRef } from '@/components/HCaptcha';
import { register, login, ApiError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { z } from 'zod/v4';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function RegisterPage() {
    const t = useTranslations('auth.register');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const captchaRef = useRef<HCaptchaRef>(null);

    // Password validation schema with translated messages
    const passwordSchema = z.string().min(6, t('validation.passwordMinLength')).max(500, t('validation.passwordMaxLength'));

    const validatePassword = (value: string): boolean => {
        const result = passwordSchema.safeParse(value);
        if (!result.success) {
            setPasswordError(result.error.issues[0].message);
            return false;
        }
        setPasswordError(null);
        return true;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (value) {
            validatePassword(value);
        } else {
            setPasswordError(null);
        }
    };

    const handleCaptchaVerify = (token: string) => {
        setCaptchaToken(token);
        // Clear any captcha-related errors
        if (alert?.message.includes('captcha')) {
            setAlert(null);
        }
    };

    const handleCaptchaExpire = () => {
        setCaptchaToken(null);
    };

    const handleCaptchaError = (err: string) => {
        setAlert({ type: 'error', message: t('errors.captchaError', { error: err }) });
        setCaptchaToken(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password strength
        if (!validatePassword(password)) {
            setAlert({ type: 'error', message: passwordError || t('errors.passwordRequirements') });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ type: 'error', message: t('errors.passwordMismatch') });
            return;
        }

        if (!captchaToken) {
            setAlert({ type: 'error', message: t('errors.captchaRequired') });
            return;
        }

        setIsLoading(true);
        setAlert(null);

        try {
            await register(username, password);

            setAlert({ type: 'success', message: t('success.registered') });

            // Reset captcha after submission
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);

            // Auto-login after successful registration
            try {
                const loginResponse = await login(username, password);
                setToken(loginResponse.token);
                router.push('/dashboard');
            } catch {
                // If auto-login fails, redirect to login page
                setAlert({ type: 'success', message: t('success.registeredLogin') });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.statusCode === 409) {
                    setAlert({ type: 'error', message: t('errors.userExists') });
                } else {
                    setAlert({ type: 'error', message: err.message || t('errors.registrationFailed') });
                }
            } else {
                setAlert({ type: 'error', message: t('errors.unexpectedError') });
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
            {/* Locale Switcher in top-right corner */}
            <div className="absolute top-4 right-4 z-20">
                <LocaleSwitcher />
            </div>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">{t('title')}</CardTitle>
                    <CardDescription className="text-center">{t('subtitle')}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {alert && (
                        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="flex items-start space-x-2">
                            {alert.type === 'error' ? <AlertCircleIcon className="h-5 w-5 mt-0.5" /> : <CheckCircle2Icon className="h-5 w-5 mt-0.5" />}
                            <div>
                                <AlertTitle>{alert.type === 'error' ? tCommon('status.error') : tCommon('status.success')}</AlertTitle>
                                <AlertDescription>{alert.message}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="username" type="text" placeholder={tCommon('labels.username')} value={username} onChange={(e) => setUsername(e.target.value)} className={'space-y-2'} disabled={isLoading} required />

                        <div className="space-y-1">
                            <Input id="password" type="password" placeholder={tCommon('labels.password')} value={password} onChange={handlePasswordChange} className={passwordError ? 'border-red-500' : ''} disabled={isLoading} required />
                            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        </div>

                        <Input id="confirmPassword" type="password" placeholder={tCommon('labels.confirmPassword')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={'space-y-2'} disabled={isLoading} required />

                        <div className="flex justify-center">
                            <HCaptchaWrapper ref={captchaRef} onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} onError={handleCaptchaError} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    {t('registering')}
                                </>
                            ) : (
                                t('title')
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground text-center flex justify-center">
                    {t('hasAccount')}{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
                        {t('loginLink')}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
