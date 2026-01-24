'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTimeUntilExpiration, isAuthenticated, logout, setToken } from '@/lib/auth';
import { getStoredCredentials, hasStoredCredentials } from '@/lib/crypto';
import { login } from '@/lib/api';
import { toast } from 'sonner';

const AUTO_REFRESH_THRESHOLD_MS = 30 * 1000;

const CHECK_INTERVAL_MS = 10 * 1000;

export interface TokenRefreshState {
  showWarning: boolean;
  timeRemaining: number | null;
  isExpired: boolean;
  dismissWarning: () => void;
  extendSession: () => void;
}

/**
 * Hook to monitor JWT token expiration and provide automatic refresh warnings
 *
 * This hook:
 * - Monitors token expiration every 10 seconds
 * - Attempts automatic token refresh 30 seconds before expiration (if credentials stored)
 * - Shows warning modal if automatic refresh fails or is not enabled
 * - Automatically logs out user when token expires
 * - Provides methods to dismiss warning or extend session
 *
 * @returns TokenRefreshState with warning status and control methods
 *
 * @example
 * ```tsx
 * const { showWarning, timeRemaining, dismissWarning, extendSession } = useTokenRefresh();
 *
 * if (showWarning) {
 *   return <TokenExpirationModal
 *     timeRemaining={timeRemaining}
 *     onDismiss={dismissWarning}
 *     onExtend={extendSession}
 *   />;
 * }
 * ```
 */
export function useTokenRefresh(): TokenRefreshState {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const hasShownWarning = useRef(false);
    const hasAttemptedAutoRefresh = useRef(false);
    const isRefreshing = useRef(false);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const attemptAutoRefresh = useCallback(async (): Promise<boolean> => {
        if (isRefreshing.current) {
            return false;
        }

        if (!hasStoredCredentials()) {
            return false;
        }

        try {
            isRefreshing.current = true;

            const credentials = await getStoredCredentials();
            if (!credentials) {
                return false;
            }

            const response = await login(credentials.username, credentials.password);

            setToken(response.token);

            hasShownWarning.current = false;
            hasAttemptedAutoRefresh.current = false;
            setShowWarning(false);

            toast.success('Session extended automatically', {
                description: 'You can continue working without interruption',
                duration: 3000
            });

            return true;
        } catch {
            return false;
        } finally {
            isRefreshing.current = false;
        }
    }, []);

    const checkTokenStatus = useCallback(async () => {
        if (!isAuthenticated()) {
            setIsExpired(true);
            setShowWarning(false);

            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }

            logout();
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}&expired=true`);
            return;
        }

        const timeLeft = getTimeUntilExpiration();
        setTimeRemaining(timeLeft);

        if (timeLeft && timeLeft <= AUTO_REFRESH_THRESHOLD_MS && !hasAttemptedAutoRefresh.current && !isRefreshing.current) {
            hasAttemptedAutoRefresh.current = true;

            const refreshSuccess = await attemptAutoRefresh();

            if (!refreshSuccess && !hasShownWarning.current) {
                setShowWarning(true);
                hasShownWarning.current = true;
            }
        }
    }, [router, attemptAutoRefresh]);

    const dismissWarning = useCallback(() => {
        setShowWarning(false);
    }, []);

    const extendSession = useCallback(async () => {
        setShowWarning(false);

        // First try to refresh using stored credentials
        const refreshSuccess = await attemptAutoRefresh();

        if (!refreshSuccess) {
            // If auto-refresh fails (no stored credentials or API error), redirect to login
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}&extend=true`);
        }
    }, [router, attemptAutoRefresh]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        checkTokenStatus();

        checkIntervalRef.current = setInterval(checkTokenStatus, CHECK_INTERVAL_MS);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        };
    }, [checkTokenStatus]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token' || e.key === null) {
                checkTokenStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkTokenStatus]);

    return {
        showWarning,
        timeRemaining,
        isExpired,
        dismissWarning,
        extendSession
    };
}

/**
 * Format time remaining in a human-readable format
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string like "4 minutes 30 seconds"
 */
export function formatTimeRemaining(milliseconds: number | null): string {
    if (!milliseconds || milliseconds <= 0) {
        return '0 seconds';
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
