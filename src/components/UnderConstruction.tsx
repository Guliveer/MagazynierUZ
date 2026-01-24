'use client';

import { Construction, Hammer, HardHat } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export default function UnderConstruction({ title, description }: UnderConstructionProps) {
    const t = useTranslations('dashboard.underConstruction');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center gap-4">
                        <HardHat className="h-12 w-12 text-yellow-500 animate-bounce" />
                        <Construction className="h-12 w-12 text-orange-500" />
                        <Hammer className="h-12 w-12 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <CardTitle className="text-2xl">{title || t('title')}</CardTitle>
                    <CardDescription className="text-base">{description || t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{t('message')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
