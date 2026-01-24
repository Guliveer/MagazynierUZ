import { notFound } from 'next/navigation';

// This page renders when no locale matches
// It redirects to the default locale's not-found page
export default function GlobalNotFound() {
    notFound();
}
