'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';

export interface HCaptchaRef {
  execute: () => void;
  resetCaptcha: () => void;
}

interface HCaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

const HCaptchaWrapper = forwardRef<HCaptchaRef, HCaptchaWrapperProps>(({ onVerify, onExpire, onError }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);

    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

    useImperativeHandle(ref, () => ({
        execute: () => {
            captchaRef.current?.execute();
        },
        resetCaptcha: () => {
            captchaRef.current?.resetCaptcha();
        }
    }));

    const handleVerify = useCallback(
        (token: string) => {
            onVerify(token);
        },
        [onVerify]
    );

    const handleExpire = useCallback(() => {
        onExpire?.();
    }, [onExpire]);

    const handleError = useCallback(
        (error: string) => {
            onError?.(error);
        },
        [onError]
    );

    if (!siteKey) {
        console.warn('hCaptcha site key is not configured');
        return null;
    }

    return <HCaptcha ref={captchaRef} sitekey={siteKey} onVerify={handleVerify} onExpire={handleExpire} onError={handleError} />;
});

HCaptchaWrapper.displayName = 'HCaptchaWrapper';

export default HCaptchaWrapper;
