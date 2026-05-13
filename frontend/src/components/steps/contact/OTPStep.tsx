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
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const isVerifyingRef = useRef(false);
  const hasSentRef = useRef(false);

  const digits = otp.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
  const isComplete = otp.length === OTP_LENGTH;
  const activeBox = Math.min(otp.length, OTP_LENGTH - 1);

  // ── Countdown ─────────────────────────────────────────────────────────
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

  // ── Verify ────────────────────────────────────────────────────────────
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
      setOtp('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setVerifying(false);
      isVerifyingRef.current = false;
    }
  }, [onVerify]);

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
    try { webOtpAbortRef.current?.abort(); } catch { /* ignore */ }
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
          const clean = credential.code.replace(/\D/g, '').slice(0, OTP_LENGTH);
          setOtp(clean);
        }
      })
      .catch(() => { /* aborted or unsupported */ });
  }, []);

  // ── Send OTP ──────────────────────────────────────────────────────────
  const sendOTP = useCallback(async () => {
    setLoading(true);
    setError('');
    setSent(false);
    setOtp('');
    // Start Web OTP listener BEFORE sending — must be awaiting when SMS arrives
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
      try { webOtpAbortRef.current?.abort(); } catch { /* ignore */ }
    };
  }, [sendOTP]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(clean);
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

        /*
          Why this works when nothing else did:
          ─────────────────────────────────────
          Every previous approach hid the input using opacity:0, visibility:hidden,
          or positioned it off-screen. All of these cause iOS Safari and Android
          Chrome/WebViews to skip SMS autofill — the browser's autofill engine
          validates that the target input is visible and interactable before
          offering or completing a fill.

          This approach keeps ONE real <input> fully in the document flow and
          makes it invisible by setting its text color, background, border, and
          caret color all to transparent — while leaving opacity at 0.01 (not 0)
          and keeping it absolutely positioned ON TOP of the visual digit boxes.

          The visual boxes are pointer-events:none divs. They show digits from
          React state. The real input captures all typing, paste, and autofill.

          The <form autoComplete="on"> wrapper is required by iOS Safari ≤16 to
          surface the "From Messages" keyboard suggestion.

          overflow-x:hidden on ANY ancestor kills this — fixed in Layout.tsx.
          overflow:hidden on ANY ancestor kills this — fixed in LeadCapture.tsx.
        */
        .otp-real-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: transparent !important;
          caret-color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          font-size: 16px;
          opacity: 0.01;
          z-index: 20;
          cursor: text;
          padding: 0;
          margin: 0;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          /* NO pointer-events:none  — autofill taps must reach this element  */
          /* NO disabled             — browser won't autofill disabled inputs  */
          /* NO visibility:hidden    — removes element from autofill scan tree */
          /* NO display:none         — same                                    */
        }
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
              ? <> OTP sent to <span className="font-bold text-gray-700">{phone}</span> </>
              : 'Getting ready…'}
        </p>
      </div>

      {/*
        FORM — required by iOS Safari to show "From Messages" above keyboard.
        autoComplete="on" must be on the form, not just the input.
      */}
      <form autoComplete="on" onSubmit={(e) => e.preventDefault()}>
        <div
          className="relative flex justify-center"
          style={{ height: '56px' }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* THE REAL INPUT — styled transparent but fully visible to browser */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            name="one-time-code"
            id="one-time-code"
            pattern="\d*"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="One-time password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="otp-real-input"
          />

          {/* Visual digit boxes — pointer-events:none, purely decorative */}
          <div className="flex gap-2 sm:gap-3 pointer-events-none">
            {digits.map((digit, i) => {
              const isActive = focused && i === activeBox;
              return (
                <div
                  key={i}
                  className={[
                    'h-14 w-11 sm:w-12 rounded-2xl border-2',
                    'flex items-center justify-center text-2xl font-black transition-all select-none',
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-900',
                    isActive && !digit ? 'border-blue-400 bg-white ring-4 ring-blue-50' : '',
                    error ? 'border-red-300 bg-red-50' : '',
                    verifying ? 'opacity-50' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {digit
                    ? digit
                    : isActive
                      ? <span style={{
                          display: 'inline-block',
                          width: '2px',
                          height: '28px',
                          backgroundColor: '#60a5fa',
                          animation: 'otp-blink 1s step-end infinite',
                        }} />
                      : null}
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