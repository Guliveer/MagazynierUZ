'use client';
import { useState, useRef } from 'react';
import { Button } from 'shadcn/button';
import { Input } from 'shadcn/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'shadcn/card';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import HCaptchaWrapper, { HCaptchaRef } from '@/components/HCaptcha';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const captchaRef = useRef<HCaptchaRef>(null);

    const handleCaptchaVerify = (token: string) => {
        setCaptchaToken(token);
        setError(null);
    };

    const handleCaptchaExpire = () => {
        setCaptchaToken(null);
    };

    const handleCaptchaError = (err: string) => {
        setError(`Captcha error: ${err}`);
        setCaptchaToken(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            setError('Please complete the captcha verification');
            return;
        }

        console.log('Login:', { email, captchaToken });
        // Reset captcha after submission
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/warehouse-bg.png')" }}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Login</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="flex items-start space-x-2">
                            <AlertCircleIcon className="h-5 w-5 mt-0.5" />
                            <div>
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={'space-y-2'} required />

                        <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={'space-y-2'} required />

                        <div className="flex justify-center">
                            <HCaptchaWrapper ref={captchaRef} onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} onError={handleCaptchaError} />
                        </div>

                        <Button type="submit" className="w-full">
              Login
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground text-center flex justify-center">
          Don't have an account?{' '}
                    <Link href="/register" className="ml-1 text-primary hover:underline">
            Register now
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
