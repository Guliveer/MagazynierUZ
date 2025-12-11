import Link from 'next/link';
import { Button } from 'shadcn/button';

export default function Subpage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <main className="max-w-3xl p-8 bg-white dark:bg-black rounded-lg">
                <h1 className="text-3xl font-semibold mb-4 text-black dark:text-zinc-50">Subpage</h1>
                <p className="text-lg text-zinc-700 dark:text-zinc-400 mb-6">
                    This is an example subpage in a Next.js application using the App Router.
                </p>
                <Button variant={'default'} asChild>
                    <Link href="/">Go back to Home</Link>
                </Button>
            </main>
        </div>
    );
}
