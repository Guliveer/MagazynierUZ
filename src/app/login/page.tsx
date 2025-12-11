'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'shadcn/card';
import { Input } from 'shadcn/input';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login:', {email});
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
            style={{backgroundImage: "url('/warehouse-bg.png')"}}
        >
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Login</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={'space-y-2'}
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={'space-y-2'}
                            required
                        />

                        <Button type="submit" className="w-full">
                            Login
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
