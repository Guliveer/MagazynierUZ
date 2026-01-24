import { FileQuestion, Home } from 'lucide-react';
import { Button } from 'shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
    const t = await getTranslations('notFound');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <FileQuestion className="h-24 w-24 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-6xl font-bold text-primary">{t('title')}</CardTitle>
                    <CardDescription className="text-xl">{t('subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{t('message')}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild variant="default">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                {t('goHome')}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
