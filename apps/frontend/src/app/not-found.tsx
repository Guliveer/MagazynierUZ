import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <FileQuestion className="h-24 w-24 text-muted-foreground"/>
                    </div>
                    <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
                    <CardDescription className="text-xl">Page Not Found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Sorry, the page you&#39;re looking for doesn&#39;t exist or has
                        been moved.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild variant="default">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4"/>
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
