import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../../firebaseClient';

const BACKEND = 'https://device360.onrender.com';
const OTP_EXPIRY_SECS = 60;

// ── Verifier management ────────────────────────────────────────────────────
let _verifier: RecaptchaVerifier | null = null;

function destroyVerifier() {
  try {
    _verifier?.clear();
  } catch {
    // ignore
  }
  _verifier = null;
}

function getOrCreateVerifier(): RecaptchaVerifier {
  if (!_verifier) {
    _verifier = new RecaptchaVerifier(auth, 'recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        destroyVerifier();
      },
    });
  }
  return _verifier;
}

interface OTPStepProps {
  phone: string;
  onVerify: (code: string) => void;
  goBack: () => void;
}

export const OTPStep = ({ phone, onVerify, goBack }: OTPStepProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenOtpRef = useRef<HTMLInputElement | null>(null);
  const hasSentRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const isVerifyingRef = useRef(false);

  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(OTP_EXPIRY_SECS);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const stopWebOtpListener = useCallback(() => {
    try {
      webOtpAbortRef.current?.abort();
    } catch {
      // ignore
    }
    webOtpAbortRef.current = null;
  }, []);

  const applyOtpCode = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const next = Array.from({ length: 6 }, (_, i) => digits[i] ?? '');
    setOtp(next);

    if (digits.length === 6) {
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 50);
    }
  }, []);

  const verifyOTP = useCallback(
    async (code: string) => {
      if (!confirmation || code.length !== 6) return;
      if (isVerifyingRef.current) return;

      isVerifyingRef.current = true;
      setVerifying(true);
      setError('');

      try {
        const cred = await confirmation.confirm(code);
        const token = await cred.user.getIdToken();

        onVerify(code);

        fetch(`${BACKEND}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        }).catch(() => {
          // non-critical
        });
      } catch (err: any) {
        const code_ = err?.code ?? '';

        if (code_ === 'auth/invalid-verification-code') {
          setError('Incorrect OTP. Please check and try again.');
        } else if (code_ === 'auth/code-expired') {
          setError('OTP expired. Tap "Resend OTP" to get a new one.');
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          setCountdown(0);
        } else {
          setError('Verification failed. Try resending OTP.');
        }

        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } finally {
        setVerifying(false);
        isVerifyingRef.current = false;
      }
    },
    [confirmation, onVerify],
  );

  const startWebOtpListener = useCallback(async () => {
    stopWebOtpListener();

    if (typeof window === 'undefined') return;
    if (!('OTPCredential' in window)) return;
    if (!navigator.credentials?.get) return;

    const controller = new AbortController();
    webOtpAbortRef.current = controller;

    try {
      const credential = (await navigator.credentials.get({
        // @ts-expect-error Web OTP is not available in all TS libs
        otp: { transport: ['sms'] },
        signal: controller.signal,
      })) as any;

      if (credential?.code) {
        applyOtpCode(String(credential.code));
      }
    } catch {
      // ignore abort / unsupported
    } finally {
      if (webOtpAbortRef.current === controller) {
        webOtpAbortRef.current = null;
      }
    }
  }, [applyOtpCode, stopWebOtpListener]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopWebOtpListener();
    };
  }, [stopWebOtpListener]);

  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    void sendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!confirmation) return;
    void startWebOtpListener();
    return () => stopWebOtpListener();
  }, [confirmation, startWebOtpListener, stopWebOtpListener]);

  useEffect(() => {
    if (otp.every((d) => d !== '') && confirmation && !verifying) {
      void verifyOTP(otp.join(''));
    }
  }, [otp, confirmation, verifying, verifyOTP]);

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setSent(false);

    try {
      destroyVerifier();
      const verifier = getOrCreateVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);

      setConfirmation(result);
      setSent(true);
      startCountdown();

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      destroyVerifier();
      const code = err?.code ?? '';

      if (code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Go back and check.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (code === 'auth/invalid-app-credential') {
        setError('App credential error. Refresh and try again.');
      } else {
        setError(err?.message || 'Failed to send OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    hasSentRef.current = false;
    setOtp(['', '', '', '', '', '']);
    setError('');
    void sendOTP();
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const digitsOnly = val.replace(/\D/g, '');

    // If the browser/autofill drops the full OTP into one field, spread it across all boxes.
    if (digitsOnly.length > 1) {
      applyOtpCode(digitsOnly);
      return;
    }

    const updated = [...otp];
    updated[i] = val.slice(-1);
    setOtp(updated);

    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyOtpCode(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length) applyOtpCode(digits);
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="relative space-y-6 p-6 sm:p-8">
      <input
        ref={hiddenOtpRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        name="otp"
        aria-hidden="true"
        tabIndex={-1}
        defaultValue=""
        onInput={handleHiddenChange}
        onChange={handleHiddenChange}
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />

      <div id="recaptcha-root" />

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-1 text-xl font-black text-gray-900">Verify your number</h3>
        <p className="text-sm text-gray-400">
          {loading && !sent ? (
            'Sending OTP…'
          ) : sent ? (
            <>
              OTP sent to <span className="font-bold text-gray-700">{phone}</span>
            </>
          ) : (
            'Getting ready…'
          )}
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="tel"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading || verifying}
            className={`h-14 w-11 rounded-2xl border-2 text-center text-2xl font-black outline-none transition-all sm:h-14 sm:w-12
              ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
              ${loading || verifying ? 'cursor-not-allowed opacity-50' : 'focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50'}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          />
        ))}
      </div>

      <div className="text-center">
        {verifying ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm font-semibold">Verifying…</span>
          </div>
        ) : canResend ? (
          <button
            onClick={handleResend}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {loading ? 'Sending…' : 'Resend OTP'}
          </button>
        ) : sent ? (
          <p className="text-xs text-gray-400">
            Resend OTP in{' '}
            <span className={`font-bold ${countdown <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
              {countdown}s
            </span>
          </p>
        ) : null}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3.5">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <span className="text-[10px] font-black text-white">!</span>
          </div>
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {isComplete && !verifying && !error && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <span className="text-sm font-semibold">Verifying automatically…</span>
        </div>
      )}

      {error && isComplete && (
        <button
          onClick={() => void verifyOTP(otp.join(''))}
          disabled={verifying}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Try Again'}
        </button>
      )}

      <button
        onClick={goBack}
        disabled={loading || verifying}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Change number
      </button>
    </div>
  );
};