import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import '@/app/css/globals.css';

import en from '../../messages/en.json';
import pl from '../../messages/pl.json';

type Locale = 'en' | 'pl';

const messages: Record<Locale, typeof en> = { en, pl };
const locales: Locale[] = ['en', 'pl'];
const defaultLocale: Locale = 'en';

/**
 * Detect user's preferred locale from cookies or Accept-Language header
 */
async function detectLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
    if (localeCookie && locales.includes(localeCookie as Locale)) {
        return localeCookie as Locale;
    }

    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    const preferredLanguages = acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim().toLowerCase());

    for (const lang of preferredLanguages) {
        if (locales.includes(lang as Locale)) {
            return lang as Locale;
        }
        const langPrefix = lang.split('-')[0];
        if (locales.includes(langPrefix as Locale)) {
            return langPrefix as Locale;
        }
    }

    return defaultLocale;
}

/**
 * Root 404 Not Found Page
 *
 * This is a Server Component that serves as the fallback 404 page
 * for routes outside the [locale] segment. It detects the user's
 * preferred language and displays localized content.
 *
 * Features:
 * - Automatic locale detection from cookies and Accept-Language header
 * - Forced dark theme with modern, professional design
 * - Animated background effects
 */
export default async function GlobalNotFound() {
    const locale = await detectLocale();
    const t = messages[locale].notFound;

    return (
        <html lang={locale} className="dark" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>404 - {t.title} | MagazynierUZ</title>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              /* Force dark theme colors */
              :root {
                --bg-primary: #0a0a0b;
                --bg-secondary: #111113;
                --bg-card: #161618;
                --text-primary: #fafafa;
                --text-secondary: #a1a1aa;
                --text-muted: #71717a;
                --accent-primary: oklch(0.795 0.184 86.047);
                --accent-glow: oklch(0.795 0.184 86.047 / 0.3);
                --border-color: #27272a;
              }

              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--bg-primary);
                color: var(--text-primary);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                overflow: hidden;
              }

              /* Animated gradient background */
              .bg-gradient {
                position: fixed;
                inset: 0;
                background: 
                  radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.795 0.184 86.047 / 0.15), transparent),
                  radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.6 0.15 250 / 0.1), transparent),
                  var(--bg-primary);
                z-index: 0;
              }

              /* Subtle grid pattern */
              .bg-grid {
                position: fixed;
                inset: 0;
                background-image: 
                  linear-gradient(var(--border-color) 1px, transparent 1px),
                  linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
                background-size: 60px 60px;
                opacity: 0.3;
                z-index: 1;
                mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
              }

              /* Main content container */
              .container {
                position: relative;
                z-index: 10;
                text-align: center;
                max-width: 480px;
                width: 100%;
              }

              /* Card styling */
              .card {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 1.5rem;
                padding: 3rem 2.5rem;
                backdrop-filter: blur(10px);
                box-shadow: 
                  0 0 0 1px var(--border-color),
                  0 25px 50px -12px rgba(0, 0, 0, 0.5);
              }

              /* 404 number with glow effect */
              .error-code {
                font-size: clamp(6rem, 20vw, 10rem);
                font-weight: 800;
                line-height: 1;
                background: linear-gradient(135deg, var(--accent-primary), oklch(0.85 0.15 70));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 0 30px var(--accent-glow));
                animation: glow 3s ease-in-out infinite alternate;
                margin-bottom: 1rem;
              }

              @keyframes glow {
                from {
                  filter: drop-shadow(0 0 20px var(--accent-glow));
                }
                to {
                  filter: drop-shadow(0 0 40px var(--accent-glow));
                }
              }

              /* Title */
              .title {
                font-size: 1.75rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.75rem;
              }

              /* Description */
              .description {
                font-size: 1rem;
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 2rem;
              }

              /* Button styling */
              .button {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.875rem 1.75rem;
                background: var(--accent-primary);
                color: #0a0a0b;
                font-size: 0.95rem;
                font-weight: 600;
                text-decoration: none;
                border-radius: 0.75rem;
                transition: all 0.2s ease;
                box-shadow: 0 0 20px var(--accent-glow);
              }

              .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 30px var(--accent-glow), 0 10px 30px -10px var(--accent-glow);
              }

              .button:active {
                transform: translateY(0);
              }

              .button svg {
                width: 1.125rem;
                height: 1.125rem;
              }

              /* Floating orbs animation */
              .orb {
                position: fixed;
                border-radius: 50%;
                filter: blur(60px);
                opacity: 0.4;
                animation: float 8s ease-in-out infinite;
                z-index: 0;
              }

              .orb-1 {
                width: 300px;
                height: 300px;
                background: oklch(0.795 0.184 86.047 / 0.3);
                top: -100px;
                left: -100px;
                animation-delay: 0s;
              }

              .orb-2 {
                width: 200px;
                height: 200px;
                background: oklch(0.6 0.15 250 / 0.2);
                bottom: -50px;
                right: -50px;
                animation-delay: -4s;
              }

              @keyframes float {
                0%, 100% {
                  transform: translate(0, 0) scale(1);
                }
                50% {
                  transform: translate(30px, -30px) scale(1.1);
                }
              }

              /* Decorative lines */
              .lines {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200%;
                height: 200%;
                pointer-events: none;
                z-index: 0;
              }

              .line {
                position: absolute;
                background: linear-gradient(90deg, transparent, var(--border-color), transparent);
                height: 1px;
                width: 100%;
                animation: scan 8s linear infinite;
              }

              .line:nth-child(1) { top: 20%; animation-delay: 0s; }
              .line:nth-child(2) { top: 40%; animation-delay: -2s; }
              .line:nth-child(3) { top: 60%; animation-delay: -4s; }
              .line:nth-child(4) { top: 80%; animation-delay: -6s; }

              @keyframes scan {
                0% { opacity: 0; transform: translateX(-100%); }
                50% { opacity: 0.5; }
                100% { opacity: 0; transform: translateX(100%); }
              }

              /* Secondary links */
              .secondary-links {
                margin-top: 1.5rem;
                display: flex;
                justify-content: center;
                gap: 1.5rem;
              }

              .secondary-link {
                color: var(--text-muted);
                font-size: 0.875rem;
                text-decoration: none;
                transition: color 0.2s ease;
              }

              .secondary-link:hover {
                color: var(--accent-primary);
              }
            `
                    }}
                />
            </head>
            <body>
                <div className="bg-gradient" />
                <div className="bg-grid" />

                <div className="orb orb-1" />
                <div className="orb orb-2" />

                <div className="lines">
                    <div className="line" />
                    <div className="line" />
                    <div className="line" />
                    <div className="line" />
                </div>

                <div className="container">
                    <div className="card">
                        <div className="error-code">404</div>
                        <h1 className="title">{t.title}</h1>
                        <p className="description">{t.description}</p>
                        <Link href={`/${locale}`} className="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            {t.goHome}
                        </Link>
                        <div className="secondary-links">
                            <Link href={`/${locale}/dashboard`} className="secondary-link">
                                {t.dashboard}
                            </Link>
                            <Link href={`/${locale}/login`} className="secondary-link">
                                {t.signIn}
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
