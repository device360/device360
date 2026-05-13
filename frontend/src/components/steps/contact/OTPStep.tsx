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
  try { _verifier?.clear(); } catch { /* ignore */ }
  _verifier = null;
}

function getOrCreateVerifier(): RecaptchaVerifier {
  if (!_verifier) {
    _verifier = new RecaptchaVerifier(auth, 'recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { destroyVerifier(); },
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
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  // Refs — keep mutable values out of React state to avoid stale closures
  const realInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const isVerifyingRef = useRef(false);
  const hasSentRef = useRef(false);

  const otpValue = digits.join('');
  const isComplete = digits.every(Boolean);

  // ── Apply any raw string → 6-digit array ────────────────────────────────
  const applyDigits = useCallback((raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => clean[i] ?? ''));
    // Keep the uncontrolled input's DOM value in sync so the browser
    // doesn't reset it on next render (important for autofill)
    if (realInputRef.current && realInputRef.current.value !== clean) {
      realInputRef.current.value = clean;
    }
  }, []);

  // ── Countdown ───────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(OTP_EXPIRY_SECS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  // ── Verify ──────────────────────────────────────────────────────────────
  const verifyOTP = useCallback(async (code: string) => {
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
      // Clear both state and the DOM input value
      setDigits(Array(OTP_LENGTH).fill(''));
      if (realInputRef.current) realInputRef.current.value = '';
      setTimeout(() => realInputRef.current?.focus(), 50);
    } finally {
      setVerifying(false);
      isVerifyingRef.current = false;
    }
  }, [onVerify]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (isComplete && !verifying && !isVerifyingRef.current) {
      void verifyOTP(otpValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, otpValue]);

  // ── Web OTP API (Android Chrome) ────────────────────────────────────────
  const startWebOtpListener = useCallback(() => {
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return;
    try { webOtpAbortRef.current?.abort(); } catch { /* ignore */ }
    const controller = new AbortController();
    webOtpAbortRef.current = controller;
    navigator.credentials
      .get({
        // @ts-expect-error Web OTP API not in TS lib yet
        otp: { transport: ['sms'] },
        signal: controller.signal,
      })
      .then((credential: any) => {
        if (credential?.code) applyDigits(credential.code);
      })
      .catch(() => { /* aborted or unsupported */ });
  }, [applyDigits]);

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const sendOTP = useCallback(async () => {
    setLoading(true);
    setError('');
    setSent(false);
    setDigits(Array(OTP_LENGTH).fill(''));
    if (realInputRef.current) realInputRef.current.value = '';

    // Start Web OTP listener BEFORE sending — must be in-flight when SMS arrives
    startWebOtpListener();

    try {
      destroyVerifier();
      const verifier = getOrCreateVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationRef.current = result;
      setSent(true);
      startCountdown();
      // Focus opens the keyboard and activates the autofill suggestion
      setTimeout(() => realInputRef.current?.focus(), 150);
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
      try { webOtpAbortRef.current?.abort(); } catch { /* ignore */ }
    };
  }, [sendOTP]);

  // ── Input event handler (attached via ref, not React prop) ───────────────
  // Using a ref-based native 'input' event listener instead of React's
  // onChange avoids the controlled-input interception that blocks browser autofill.
  // The browser fires a native 'input' event on autofill; React's synthetic
  // onChange sometimes doesn't fire for programmatic/autofill fills in WebViews.
  useEffect(() => {
    const el = realInputRef.current;
    if (!el) return;

    const handleInput = () => {
      applyDigits(el.value);
    };

    el.addEventListener('input', handleInput);
    return () => el.removeEventListener('input', handleInput);
  }, [applyDigits]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    applyDigits(e.clipboardData?.getData('text') ?? '');
  }, [applyDigits]);

  useEffect(() => {
    const el = realInputRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste as EventListener);
    return () => el.removeEventListener('paste', handlePaste as EventListener);
  }, [handlePaste]);

  const handleBoxClick = () => realInputRef.current?.focus();

  const handleResend = () => {
    hasSentRef.current = false;
    void sendOTP();
  };

  return (
    <div className="relative space-y-6 p-6 sm:p-8">
      <div id="recaptcha-root" />

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-1 text-xl font-black text-gray-900">Verify your number</h3>
        <p className="text-sm text-gray-400">
          {loading && !sent
            ? 'Sending OTP…'
            : sent
              ? <> OTP sent to <span className="font-bold text-gray-700">{phone}</span> </>
              : 'Getting ready…'}
        </p>
      </div>

      {/*
        OTP Row
        ───────
        The real <input> is UNCONTROLLED (no value= prop, no onChange= prop).
        Reasons:
          1. React controlled inputs block browser/OS autofill in many WebViews
             because autofill bypasses React's event system.
          2. The input must NEVER be disabled — not even during loading —
             because iOS/Android refuse to autofill a disabled input. If the
             SMS arrives while we're still calling Firebase, we'd miss it.
          3. overflow-hidden on any ancestor clips the absolute-positioned
             input, preventing autofill tap events from landing on it.
             (Fixed in LeadCapture.tsx by removing overflow-hidden.)
        
        The <form autoComplete="on"> wrapper is required by iOS Safari to
        surface the "From Messages" suggestion above the keyboard.
      */}
      <form onSubmit={(e) => e.preventDefault()} autoComplete="on">
        <div className="relative" style={{ minHeight: '56px' }}>
          {/*
            THE REAL INPUT — uncontrolled, always enabled, never visibility:hidden.
            Sits behind the visual boxes and owns all text input, autofill, Web OTP.
          */}
          <input
            ref={realInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            name="one-time-code"
            id="one-time-code"
            maxLength={OTP_LENGTH}
            defaultValue=""
            aria-label="One-time password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onFocus={() => {
              const firstEmpty = digits.findIndex((d) => !d);
              setFocusedIndex(firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty);
            }}
            onBlur={() => setFocusedIndex(null)}
            style={{
              // Covers the entire OTP box row so autofill-banner taps hit it.
              // opacity:0 — invisible but still in the accessibility + autofill tree.
              // NEVER use display:none / visibility:hidden / pointer-events:none.
              // NEVER use disabled — autofill won't fill a disabled input.
              // fontSize:16px — prevents iOS auto-zoom on focus.
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              fontSize: '16px',
              caretColor: 'transparent',
              zIndex: 10,
              // NO disabled, NO pointerEvents:none, NO visibility:hidden
            }}
          />

          {/* Visual digit boxes — purely decorative divs, no real input logic */}
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onClick={handleBoxClick}
            role="group"
            aria-label="OTP digits"
          >
            {digits.map((digit, i) => {
              const firstEmpty = digits.findIndex((d) => !d);
              const activeIdx = firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty;
              const isActive = focusedIndex !== null && i === activeIdx;

              return (
                <div
                  key={i}
                  onClick={handleBoxClick}
                  className={[
                    'h-14 w-11 select-none rounded-2xl border-2 cursor-text sm:w-12',
                    'flex items-center justify-center text-2xl font-black transition-all',
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-900',
                    isActive && !digit ? 'border-blue-400 bg-white ring-4 ring-blue-50' : '',
                    error ? 'border-red-300 bg-red-50' : '',
                    verifying ? 'cursor-not-allowed opacity-50' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {digit
                    ? digit
                    : isActive
                      ? (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '2px',
                            height: '28px',
                            backgroundColor: '#60a5fa',
                            animation: 'blink 1s step-end infinite',
                          }}
                        />
                      )
                      : null}
                </div>
              );
            })}
          </div>
        </div>
      </form>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3.5">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <span className="text-[10px] font-black text-white">!</span>
          </div>
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Auto-verifying indicator */}
      {isComplete && !verifying && !error && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <span className="text-sm font-semibold">Verifying automatically…</span>
        </div>
      )}

      {/* Try Again after error */}
      {error && isComplete && (
        <button
          onClick={() => void verifyOTP(otpValue)}
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