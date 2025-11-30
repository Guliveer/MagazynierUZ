'use client';
import HCaptchaWrapper, { HCaptchaRef } from '@/components/HCaptcha';
import { ApiError, login } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from 'shadcn/alert';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'shadcn/card';
import { Input } from 'shadcn/input';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            setError('Please complete the captcha verification');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await login(email, password);
            setToken(response.token);

            // Reset captcha after submission
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);

            // Redirect to dashboard after successful login
            router.push('/dashboard');
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.statusCode === 401) {
                    setError('Invalid email or password');
                } else {
                    setError(err.message || 'Login failed. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }

            // Reset captcha on error
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
            style={{backgroundImage: "url('/warehouse-bg.png')"}}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Login</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="flex items-start space-x-2">
                            <AlertCircleIcon className="h-5 w-5 mt-0.5"/>
                            <div>
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input id="email" type="email" placeholder="Email" value={email}
                            onChange={(e) => setEmail(e.target.value)} className={'space-y-2'} disabled={isLoading}
                            required/>

                        <Input id="password" type="password" placeholder="Password" value={password}
                            onChange={(e) => setPassword(e.target.value)} className={'space-y-2'}
                            disabled={isLoading} required/>

                        <div className="flex justify-center">
                            <HCaptchaWrapper ref={captchaRef} onVerify={handleCaptchaVerify}
                                onExpire={handleCaptchaExpire} onError={handleCaptchaError}/>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground text-center flex justify-center">
                    Don&#39;t have an account?{' '}
                    <Link href="/register" className="ml-1 text-primary hover:underline">
                        Register now
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
