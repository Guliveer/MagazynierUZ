import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from 'shadcn/button';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default async function HomePage() {
    const t = await getTranslations('landing');

    return (
        <main className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/warehouse-bg.png')" }}>
            <div className="absolute inset-0 bg-black/50" />

            <div className="absolute top-4 right-4 z-20">
                <LocaleSwitcher />
            </div>

            <div className="relative z-10 text-center">
                <h1 className="text-3xl font-bold text-white mb-6">{t('title')}</h1>

                <h3 className="text-lg font-medium text-gray-200 mb-8">{t('subtitle')}</h3>

                <div className="space-x-4">
                    <Button asChild>
                        <Link href="/login">{t('actions.login')}</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/register">{t('actions.register')}</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
