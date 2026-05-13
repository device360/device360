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

let _verifier: RecaptchaVerifier | null = null;

function destroyVerifier() {
  try { _verifier?.clear(); } catch { /* */ }
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
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  // 6 real input refs — one per box
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const isVerifyingRef = useRef(false);
  const hasSentRef = useRef(false);

  const otpValue = digits.join('');
  const isComplete = digits.every(Boolean);

  const focusBox = (i: number) => {
    const el = inputRefs.current[Math.max(0, Math.min(i, OTP_LENGTH - 1))];
    el?.focus();
    // Move cursor to end
    setTimeout(() => el?.setSelectionRange(el.value.length, el.value.length), 0);
  };

  // Fill all boxes from a string (autofill / paste / Web OTP)
  const fillAll = useCallback((raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!clean) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => clean[i] ?? '');
    setDigits(next);
    setError('');
    // Focus last filled box
    focusBox(Math.min(clean.length, OTP_LENGTH - 1));
  }, []);

  // Countdown
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

  // Verify
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
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => focusBox(0), 50);
    } finally {
      setVerifying(false);
      isVerifyingRef.current = false;
    }
  }, [onVerify]);

  // Auto-submit when all filled
  useEffect(() => {
    if (isComplete && !verifying && !isVerifyingRef.current) {
      void verifyOTP(otpValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, otpValue]);

  // Web OTP API (Android Chrome)
  const startWebOtpListener = useCallback(() => {
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return;
    try { webOtpAbortRef.current?.abort(); } catch { /* */ }
    const controller = new AbortController();
    webOtpAbortRef.current = controller;
    navigator.credentials
      .get({
        // @ts-expect-error Web OTP API
        otp: { transport: ['sms'] },
        signal: controller.signal,
      })
      .then((credential: any) => {
        if (credential?.code) fillAll(credential.code);
      })
      .catch(() => { /* aborted/unsupported */ });
  }, [fillAll]);

  // Send OTP
  const sendOTP = useCallback(async () => {
    setLoading(true);
    setError('');
    setSent(false);
    setDigits(Array(OTP_LENGTH).fill(''));
    startWebOtpListener(); // must be before SMS sends
    try {
      destroyVerifier();
      const verifier = getOrCreateVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationRef.current = result;
      setSent(true);
      startCountdown();
      setTimeout(() => focusBox(0), 150);
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
      try { webOtpAbortRef.current?.abort(); } catch { /* */ }
    };
  }, [sendOTP]);

  // Per-box handlers
  const handleChange = (i: number, val: string) => {
    // If browser autofills the whole OTP into box 0 (common on iOS)
    if (val.length > 1) {
      fillAll(val);
      return;
    }
    const char = val.replace(/\D/g, '');
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    setError('');
    if (char && i < OTP_LENGTH - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits];
        next[i] = '';
        setDigits(next);
      } else if (i > 0) {
        const next = [...digits];
        next[i - 1] = '';
        setDigits(next);
        focusBox(i - 1);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      focusBox(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    fillAll(e.clipboardData.getData('text'));
  };

  const handleFocus = (i: number) => {
    // If clicking an already-filled box, select all so typing replaces it
    inputRefs.current[i]?.select();
  };

  const handleResend = () => {
    hasSentRef.current = false;
    void sendOTP();
  };

  return (
    <div className="relative space-y-6 p-6 sm:p-8">
      <div id="recaptcha-root" />

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
              ? <> OTP sent to <span className="font-bold text-gray-700">{phone}</span> </>
              : 'Getting ready…'}
        </p>
      </div>

      {/*
        6 REAL INPUTS — one per digit.

        Why this works when every other approach failed:
        ─────────────────────────────────────────────────
        iOS Safari's SMS autofill scans for an input with autoComplete="one-time-code".
        It requires the input to be:
          1. Visible (not opacity:0, not visibility:hidden, not display:none)
          2. Enabled (not disabled)
          3. Not clipped by overflow:hidden on any ancestor
          4. In normal document flow

        Every previous approach violated at least one of these by hiding the
        real input behind decorative divs. This approach uses 6 actual <input>
        elements — exactly what WhatsApp, Google, and every major app uses.

        The autoComplete="one-time-code" on box[0] is what triggers the
        "From Messages" suggestion on iOS. On Android, the Web OTP API
        (navigator.credentials.get) fills all boxes via fillAll().

        The <form autoComplete="on"> wrapper is required by iOS Safari ≤16.

        Critical: overflow-x:hidden on body (index.css, App.css) and
        overflow-x-hidden on Layout's root div have ALL been removed,
        as any of them would clip these inputs in mobile WebViews.
      */}
      <form autoComplete="on" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={2}
              value={digit}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              name={i === 0 ? 'one-time-code' : undefined}
              id={i === 0 ? 'one-time-code' : undefined}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => handleFocus(i)}
              disabled={verifying}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label={`OTP digit ${i + 1}`}
              className={[
                // Each box is a real visible input
                'h-14 w-11 sm:w-12 rounded-2xl border-2 text-center text-2xl font-black',
                'outline-none transition-all bg-gray-50',
                // fontSize 16px prevents iOS zoom, set via style below
                digit
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-900',
                error
                  ? 'border-red-300 bg-red-50'
                  : 'focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50',
                verifying ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
              ].filter(Boolean).join(' ')}
              style={{ fontSize: '24px', caretColor: 'transparent' }}
            />
          ))}
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
