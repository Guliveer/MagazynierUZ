'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTimeUntilExpiration, isAuthenticated, logout, setToken } from '@/lib/auth';
import { getStoredCredentials, hasStoredCredentials } from '@/lib/crypto';
import { login } from '@/lib/api';
import { toast } from 'sonner';

// Auto-refresh threshold: attempt automatic refresh 30 seconds before expiration
const AUTO_REFRESH_THRESHOLD_MS = 30 * 1000;

// Check interval: check token status every 10 seconds for more responsive auto-refresh
const CHECK_INTERVAL_MS = 10 * 1000;

export interface TokenRefreshState {
  /** Whether the token is expiring soon and user should be warned */
  showWarning: boolean;
  /** Time remaining until token expires (in milliseconds) */
  timeRemaining: number | null;
  /** Whether the token has expired */
  isExpired: boolean;
  /** Dismiss the warning modal */
  dismissWarning: () => void;
  /** Extend the session (redirect to current page to trigger re-auth) */
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

    /**
   * Attempt automatic token refresh using stored credentials
   * @returns true if refresh was successful, false otherwise
   */
    const attemptAutoRefresh = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
        if (isRefreshing.current) {
            return false;
        }

        // Check if we have stored credentials
        if (!hasStoredCredentials()) {
            console.log('Auto-refresh skipped: No stored credentials');
            return false;
        }

        try {
            isRefreshing.current = true;

            // Get stored credentials
            const credentials = await getStoredCredentials();
            if (!credentials) {
                console.warn('Auto-refresh failed: Could not decrypt stored credentials');
                // Clear invalid credentials to prevent future attempts
                return false;
            }

            // Attempt to re-authenticate
            const response = await login(credentials.username, credentials.password);

            // Update token
            setToken(response.token);

            // Reset warning state
            hasShownWarning.current = false;
            hasAttemptedAutoRefresh.current = false;
            setShowWarning(false);

            // Show success notification
            toast.success('Session extended automatically', {
                description: 'You can continue working without interruption',
                duration: 3000
            });

            return true;
        } catch (error) {
            console.error('Auto-refresh failed:', error);
            // If decryption or login fails, the user will see the warning modal
            return false;
        } finally {
            isRefreshing.current = false;
        }
    }, []);

    /**
   * Check token status and update state accordingly
   */
    const checkTokenStatus = useCallback(async () => {
    // Check if user is still authenticated
        if (!isAuthenticated()) {
            setIsExpired(true);
            setShowWarning(false);

            // Clear interval
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }

            // Logout and redirect
            logout();
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}&expired=true`);
            return;
        }

        // Get time until expiration
        const timeLeft = getTimeUntilExpiration();
        setTimeRemaining(timeLeft);

        // Check if we should attempt automatic refresh
        if (timeLeft && timeLeft <= AUTO_REFRESH_THRESHOLD_MS && !hasAttemptedAutoRefresh.current && !isRefreshing.current) {
            hasAttemptedAutoRefresh.current = true;

            const refreshSuccess = await attemptAutoRefresh();

            // If auto-refresh failed, show warning modal
            if (!refreshSuccess && !hasShownWarning.current) {
                setShowWarning(true);
                hasShownWarning.current = true;
            }
        }
    }, [router, attemptAutoRefresh]);

    /**
   * Dismiss the warning modal
   * User acknowledges the warning but chooses to continue
   */
    const dismissWarning = useCallback(() => {
        setShowWarning(false);
    }, []);

    /**
   * Extend the session by redirecting to login with return URL
   * This allows user to re-authenticate and return to current page
   */
    const extendSession = useCallback(() => {
    // Close the modal first
        setShowWarning(false);

        // Save current location and redirect to login
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}&extend=true`);
    }, [router]);

    // Set up periodic token checking
    useEffect(() => {
    // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }

        // Initial check
        checkTokenStatus();

        // Set up interval for periodic checks
        checkIntervalRef.current = setInterval(checkTokenStatus, CHECK_INTERVAL_MS);

        // Cleanup on unmount
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        };
    }, [checkTokenStatus]);

    // Listen for storage events (token changes in other tabs)
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (e: StorageEvent) => {
            // If token was removed in another tab, check status
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
