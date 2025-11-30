'use client';
import { useState, useRef } from 'react';
import { Button } from 'shadcn/button';
import { Input } from 'shadcn/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'shadcn/card';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import Link from 'next/link';
import HCaptchaWrapper, { HCaptchaRef } from '@/components/HCaptcha';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const captchaRef = useRef<HCaptchaRef>(null);

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
        setAlert({ type: 'error', message: `Captcha error: ${err}` });
        setCaptchaToken(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setAlert({ type: 'error', message: 'Passwords need to match!' });
            return;
        }
        if (!captchaToken) {
            setAlert({ type: 'error', message: 'Please complete the captcha verification' });
            return;
        }
        setAlert({ type: 'success', message: 'Registration was successful!' });
        console.log('Registration:', { email, captchaToken });
        // Reset captcha after submission
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/warehouse-bg.png')" }}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Registration</CardTitle>
                    <CardDescription className="text-center">Create your account</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {alert && (
                        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="flex items-start space-x-2">
                            {alert.type === 'error' ? <AlertCircleIcon className="h-5 w-5 mt-0.5" /> : <CheckCircle2Icon className="h-5 w-5 mt-0.5" />}
                            <div>
                                <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                                <AlertDescription>{alert.message}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={'space-y-2'} required />

                        <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={'space-y-2'} required />

                        <Input id="confirmPassword" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={'space-y-2'} required />

                        <div className="flex justify-center">
                            <HCaptchaWrapper ref={captchaRef} onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} onError={handleCaptchaError} />
                        </div>

                        <Button type="submit" className="w-full">
              Register
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground text-center flex justify-center">
          Already have an account?{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
            Log in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
