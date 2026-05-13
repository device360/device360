import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../../firebaseClient';

const BACKEND = 'https://device360.onrender.com';
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECS = 60;

// ── Verifier management ────────────────────────────────────────────────────
let _verifier: RecaptchaVerifier | null = null;

function destroyVerifier() {
  try {
    _verifier?.clear();
  } catch {
    /* ignore */
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
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autofillPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const isVerifyingRef = useRef(false);
  const hasSentRef = useRef(false);

  const digits = otp.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
  const isComplete = otp.length === OTP_LENGTH;

  const syncOtpValue = useCallback((value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp((prev) => (prev === clean ? prev : clean));
    return clean;
  }, []);

  const syncFromDom = useCallback(() => {
    const current = inputRef.current?.value ?? '';
    const clean = syncOtpValue(current);
    if (inputRef.current && inputRef.current.value !== clean) {
      inputRef.current.value = clean;
    }
  }, [syncOtpValue]);

  // ── Countdown ─────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(OTP_EXPIRY_SECS);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  // ── Verify ────────────────────────────────────────────────────────────
  const verifyOTP = useCallback(
    async (code: string) => {
      if (!confirmationRef.current || code.length !== OTP_LENGTH) return;
      if (isVerifyingRef.current) return;

      isVerifyingRef.current = true;
      setVerifying(true);
      setError('');

      try {
        const cred = await confirmationRef.current.confirm(code);
        const token = await cred.user.getIdToken();
        onVerify(code);

        fetch(`${BACKEND}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        }).catch(() => {});
      } catch (err: any) {
        const errCode = err?.code ?? '';
        if (errCode === 'auth/invalid-verification-code') {
          setError('Incorrect OTP. Please check and try again.');
        } else if (errCode === 'auth/code-expired') {
          setError('OTP expired. Tap "Resend OTP" to get a new one.');
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          setCountdown(0);
        } else {
          setError('Verification failed. Try resending OTP.');
        }

        setOtp('');
        if (inputRef.current) inputRef.current.value = '';
        setTimeout(() => inputRef.current?.focus(), 50);
      } finally {
        setVerifying(false);
        isVerifyingRef.current = false;
      }
    },
    [onVerify],
  );

  // Auto-submit when complete
  useEffect(() => {
    if (isComplete && !verifying && !isVerifyingRef.current) {
      void verifyOTP(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, otp]);

  // ── Web OTP API (Android Chrome) ──────────────────────────────────────
  const startWebOtpListener = useCallback(() => {
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return;
    if (!('credentials' in navigator)) return;

    try {
      webOtpAbortRef.current?.abort();
    } catch {
      /* ignore */
    }

    const controller = new AbortController();
    webOtpAbortRef.current = controller;

    navigator.credentials
      .get({
        // @ts-expect-error Web OTP API not in TS lib
        otp: { transport: ['sms'] },
        signal: controller.signal,
      })
      .then((credential: any) => {
        if (credential?.code) {
          const clean = syncOtpValue(String(credential.code));
          if (inputRef.current) inputRef.current.value = clean;
        }
      })
      .catch(() => {
        /* aborted or unsupported */
      });
  }, [syncOtpValue]);

  // ── Send OTP ──────────────────────────────────────────────────────────
  const sendOTP = useCallback(async () => {
    setLoading(true);
    setError('');
    setSent(false);
    setOtp('');
    if (inputRef.current) inputRef.current.value = '';

    // Start the listener BEFORE sending the SMS.
    startWebOtpListener();

    try {
      destroyVerifier();
      const verifier = getOrCreateVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationRef.current = result;
      setSent(true);
      startCountdown();
      setTimeout(() => inputRef.current?.focus(), 150);
    } catch (err: any) {
      destroyVerifier();
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone, startCountdown, startWebOtpListener]);

  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    void sendOTP();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autofillPollRef.current) clearInterval(autofillPollRef.current);
      try {
        webOtpAbortRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, [sendOTP]);

  // Some browsers autofill the DOM value without firing a React change event.
  // This lightweight poll catches that case and syncs the state.
  useEffect(() => {
    if (autofillPollRef.current) {
      clearInterval(autofillPollRef.current);
      autofillPollRef.current = null;
    }

    if (!sent || verifying) return;

    autofillPollRef.current = setInterval(() => {
      syncFromDom();
    }, 200);

    syncFromDom();

    return () => {
      if (autofillPollRef.current) {
        clearInterval(autofillPollRef.current);
        autofillPollRef.current = null;
      }
    };
  }, [sent, verifying, syncFromDom]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = syncOtpValue(e.target.value);
    if (e.target.value !== clean) {
      e.target.value = clean;
    }
    setError('');
  };

  const handleResend = () => {
    hasSentRef.current = false;
    void sendOTP();
  };

  return (
    <div className="relative space-y-6 p-6 sm:p-8">
      <div id="recaptcha-root" />

      <style>{`
        @keyframes otp-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-1 text-xl font-black text-gray-900">Verify your number</h3>
        <p className="text-sm text-gray-400">
          {loading && !sent
            ? 'Sending OTP…'
            : sent
              ? (
                <>
                  OTP sent to <span className="font-bold text-gray-700">{phone}</span>
                </>
              )
              : 'Getting ready…'}
        </p>
      </div>

      {/* Form */}
      <form autoComplete="one-time-code" onSubmit={(e) => e.preventDefault()}>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
          Enter OTP
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            name="one-time-code"
            id="one-time-code"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={handleChange}
            onInput={handleChange}
            aria-label="One-time password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={loading || verifying}
            placeholder="123456"
            className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl font-black tracking-[0.6em] text-gray-900 outline-none transition-all placeholder:tracking-[0.25em] placeholder:text-gray-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
          />

          <div className="pointer-events-none mt-3 flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, i) => {
              const isActive = !digit && otp.length === i && !verifying && !loading;
              return (
                <div
                  key={i}
                  className={[
                    'flex h-12 w-10 items-center justify-center rounded-2xl border-2 text-xl font-black transition-all select-none sm:h-14 sm:w-12 sm:text-2xl',
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-300',
                    isActive ? 'border-blue-400 bg-white ring-4 ring-blue-50' : '',
                    error ? 'border-red-300 bg-red-50' : '',
                    verifying ? 'opacity-60' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {digit ? digit : isActive ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '22px',
                        backgroundColor: '#60a5fa',
                        animation: 'otp-blink 1s step-end infinite',
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </form>

      {/* Countdown / Resend */}
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
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50"
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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3.5">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <span className="text-[10px] font-black text-white">!</span>
          </div>
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Auto-verifying */}
      {isComplete && !verifying && !error && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <span className="text-sm font-semibold">Verifying automatically…</span>
        </div>
      )}

      {/* Try Again */}
      {error && isComplete && (
        <button
          onClick={() => void verifyOTP(otp)}
          disabled={verifying}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Try Again'}
        </button>
      )}

      {/* Change number */}
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
