'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, LogIn, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTimeRemaining } from '@/hooks/useTokenRefresh';

export interface TokenExpirationModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Time remaining until token expires (in milliseconds) */
  timeRemaining: number | null;
  /** Callback when user dismisses the warning */
  onDismiss: () => void;
  /** Callback when user chooses to extend session */
  onExtend: () => void;
}

/**
 * Modal that warns users about upcoming token expiration
 *
 * This modal:
 * - Shows a countdown timer
 * - Provides option to extend session (re-login)
 * - Allows user to dismiss and continue working
 * - Updates countdown in real-time
 *
 * @example
 * ```tsx
 * <TokenExpirationModal
 *   open={showWarning}
 *   timeRemaining={timeRemaining}
 *   onDismiss={dismissWarning}
 *   onExtend={extendSession}
 * />
 * ```
 */
export function TokenExpirationModal({ open, timeRemaining, onDismiss, onExtend }: TokenExpirationModalProps) {
    const [currentTimeRemaining, setCurrentTimeRemaining] = useState(timeRemaining);

    // Update countdown every second
    useEffect(() => {
        if (!open || !timeRemaining) {
            return;
        }

        // Use microtask to avoid synchronous setState in effect
        Promise.resolve().then(() => {
            // Only update if the value has changed significantly
            if (Math.abs((currentTimeRemaining || 0) - timeRemaining) > 1000) {
                setCurrentTimeRemaining(timeRemaining);
            }
        });

        const intervalId = setInterval(() => {
            setCurrentTimeRemaining((prev) => {
                if (!prev || prev <= 1000) {
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [open, timeRemaining, currentTimeRemaining]);

    // Determine urgency level based on time remaining
    const isUrgent = currentTimeRemaining !== null && currentTimeRemaining < 2 * 60 * 1000; // Less than 2 minutes
    const isCritical = currentTimeRemaining !== null && currentTimeRemaining < 60 * 1000; // Less than 1 minute

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-yellow-500'}`} />
                        <DialogTitle>Session Expiring Soon</DialogTitle>
                    </div>
                    <DialogDescription>Your session is about to expire. You&apos;ll be logged out automatically when the timer reaches zero.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Countdown Display */}
                    <div className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 ${isCritical ? 'border-destructive bg-destructive/5' : isUrgent ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}`}>
                        <Clock className={`h-8 w-8 ${isCritical ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-yellow-600'}`} />
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-700 dark:text-yellow-400'}`}>{formatTimeRemaining(currentTimeRemaining)}</div>
                            <div className="text-sm text-muted-foreground mt-1">remaining</div>
                        </div>
                    </div>

                    {/* Information Alert */}
                    <Alert>
                        <AlertDescription>
                            <strong>What happens next?</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>Click &quot;Stay Logged In&quot; to extend your session</li>
                                <li>You&apos;ll be redirected to login and returned to this page</li>
                                <li>Or dismiss this warning and continue working</li>
                                <li>Save your work to avoid losing any changes</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onDismiss} className="w-full sm:w-auto">
                        <X className="h-4 w-4 mr-2" />
            Dismiss
                    </Button>
                    <Button onClick={onExtend} className="w-full sm:w-auto">
                        <LogIn className="h-4 w-4 mr-2" />
            Stay Logged In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
