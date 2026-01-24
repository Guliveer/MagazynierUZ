'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';

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
    const isDevelopment = process.env.NODE_ENV === 'development';

    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

    useImperativeHandle(ref, () => ({
        execute: () => {
            captchaRef.current?.execute();
        },
        resetCaptcha: () => {
            captchaRef.current?.resetCaptcha();
        }
    }));

    useEffect(() => {
        if (isDevelopment) {
            onVerify('dev-bypass-token');
        }
    }, [isDevelopment, onVerify]);

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
        return null;
    }

    return <HCaptcha ref={captchaRef} sitekey={siteKey} onVerify={handleVerify} onExpire={handleExpire} onError={handleError} />;
});

HCaptchaWrapper.displayName = 'HCaptchaWrapper';

export default HCaptchaWrapper;
