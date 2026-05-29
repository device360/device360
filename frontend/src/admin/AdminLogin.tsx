import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Shield, TrendingUp, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../firebaseClient';

const BACKEND = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000').replace(/\/$/, '');

type Role = 'admin' | 'technician' | 'marketing';

interface RoleConfig {
  label: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  bg: string;
  border: string;
  btnColor: string;
  username: string;
  password: string;
  storageKey: string;
  redirectTo: string;
}

const ROLES: Record<Role, RoleConfig> = {
  admin: {
    label: 'Admin',
    description: 'Full access — bookings, pricing, catalog, analytics, settings',
    icon: Shield,
    accentColor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    username: 'Admin',
    password: 'Admin@device360',
    storageKey: 'adminAuth',
    redirectTo: '/admin',
  },
  technician: {
    label: 'Technician',
    description: 'View assigned repairs, update status, start live stream',
    icon: Wrench,
    accentColor: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    btnColor: 'bg-orange-500 hover:bg-orange-600',
    username: 'Technician',
    password: 'Tech@device360',
    storageKey: 'techAuth',
    redirectTo: '/technician',
  },
  marketing: {
    label: 'Marketing',
    description: 'Sales stats, reviews, revenue charts, campaign tracking',
    icon: TrendingUp,
    accentColor: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    btnColor: 'bg-green-600 hover:bg-green-700',
    username: 'Marketing',
    password: 'Mkt@device360',
    storageKey: 'mktAuth',
    redirectTo: '/marketing',
  },
};

// ─── Verifier singleton — one per page load, never recreated ──────────────────
declare global {
  interface Window {
    __admin_verifier?: RecaptchaVerifier;
    __admin_verifier_ready?: boolean;
  }
}

// Pre-renders the invisible reCAPTCHA widget once at module load time
// so it's ready before the user even clicks "Send OTP"
function preWarmVerifier() {
  if (window.__admin_verifier_ready) return;
  if (window.__admin_verifier) return; // already in progress

  // Wait for DOM to be ready
  const init = () => {
    const el = document.getElementById('admin-recaptcha-root');
    if (!el) return;
    window.__admin_verifier = new RecaptchaVerifier(auth, 'admin-recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { window.__admin_verifier_ready = false; },
    });
    window.__admin_verifier.render().then(() => {
      window.__admin_verifier_ready = true;
    }).catch(() => {
      window.__admin_verifier = undefined;
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 200);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
  }
}

// Call immediately when module loads
preWarmVerifier();

async function getVerifier(): Promise<RecaptchaVerifier> {
  // Already rendered — fastest path
  if (window.__admin_verifier && window.__admin_verifier_ready) {
    return window.__admin_verifier;
  }

  // Create fresh if missing
  if (!window.__admin_verifier) {
    window.__admin_verifier = new RecaptchaVerifier(auth, 'admin-recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { window.__admin_verifier_ready = false; },
    });
  }

  // Render if not yet done
  if (!window.__admin_verifier_ready) {
    await window.__admin_verifier.render();
    window.__admin_verifier_ready = true;
  }

  return window.__admin_verifier;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'role' | 'credentials' | 'otp'>('role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const role = selectedRole ? ROLES[selectedRole] : null;

  // Countdown timer
  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const resetForm = () => {
    setError(''); setInfo(''); setOtp(['', '', '', '', '', '']);
    setUsername(''); setPassword(''); setConfirmation(null);
    setLoadingMsg('');
  };

  const goBack = () => {
    resetForm();
    if (step === 'otp') { setStep('credentials'); return; }
    setStep('role'); setSelectedRole(null);
  };

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setStep('credentials');
    setError('');
  };

  // ── Credentials → send OTP via Firebase Phone Auth ────────────────────────
  const sendOTP = async (roleKey: Role): Promise<boolean> => {
    const cfg = ROLES[roleKey];
    setLoading(true);
    setLoadingMsg('Preparing secure channel…');
    try {
      // Step 1: get phone from backend + generate server-side OTP for logging
      setLoadingMsg('Contacting server…');
      const res = await fetch(`${BACKEND}/api/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      const phone: string = data.phone;
      if (!phone) throw new Error('No phone returned from server');

      // Step 2: get pre-warmed verifier (fast — already rendered)
      setLoadingMsg('Initialising reCAPTCHA…');
      const verifier = await getVerifier();

      // Step 3: trigger Firebase SMS
      setLoadingMsg('Sending OTP via Firebase…');
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);

      setInfo(`OTP sent to ${phone.slice(0, 5)}*****${phone.slice(-2)}`);
      setTimer(30);
      return true;
    } catch (err: any) {
      // Reset verifier on error so next attempt gets a fresh one
      window.__admin_verifier_ready = false;

      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number configured for this role.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('Security check failed. Please refresh the page (Ctrl+Shift+R) and try again.');
      } else {
        setError(err.message || 'Could not send OTP. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole) return;
    setError('');

    if (username !== role.username || password !== role.password) {
      setError('Invalid username or password.');
      return;
    }

    const ok = await sendOTP(selectedRole);
    if (ok) setStep('otp');
  };

  const handleResend = async () => {
    if (!selectedRole) return;
    setOtp(['', '', '', '', '', '']);
    setConfirmation(null);
    setError('');
    await sendOTP(selectedRole);
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole || !confirmation) return;
    const code = otp.join('');
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    setLoadingMsg('Verifying…');
    try {
      const cred = await confirmation.confirm(code);
      const idToken = await cred.user.getIdToken();

      const res = await fetch(`${BACKEND}/api/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem(role.storageKey, 'true');
      navigate(role.redirectTo, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please resend.');
      } else {
        setError(err.message || 'Verification failed.');
      }
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  // OTP input helpers
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otp]; updated[i] = val.slice(-1); setOtp(updated);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) { setOtp(p.split('')); inputRefs.current[5]?.focus(); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-10">
      {/* Invisible reCAPTCHA anchor — outside React tree */}
      <div id="admin-recaptcha-root"
        style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, width: 0, height: 0, overflow: 'hidden' }} />

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-white font-semibold text-sm tracking-wide">{loadingMsg || 'Please wait…'}</p>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center shadow-xl shadow-blue-900/40 mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Device360</h1>
          <p className="text-gray-400 text-sm mt-1">Staff Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ── Role selection ─────────────────────────────────────────────── */}
          {step === 'role' && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-1">Choose your role</h2>
              <p className="text-sm text-gray-400 mb-6">Select how you're logging in today</p>
              <div className="space-y-3">
                {(Object.keys(ROLES) as Role[]).map((r) => {
                  const cfg = ROLES[r];
                  const Icon = cfg.icon;
                  return (
                    <button key={r} onClick={() => handleRoleSelect(r)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${cfg.border} ${cfg.bg} hover:shadow-md transition-all text-left group`}>
                      <div className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.accentColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm ${cfg.accentColor}`}>{cfg.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cfg.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Credentials ────────────────────────────────────────────────── */}
          {step === 'credentials' && role && (
            <div className="p-6 sm:p-8">
              <button onClick={goBack}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className={`flex items-center gap-3 p-3 rounded-2xl ${role.bg} border ${role.border} mb-6`}>
                <role.icon className={`w-5 h-5 ${role.accentColor} flex-shrink-0`} />
                <p className={`font-bold text-sm ${role.accentColor}`}>Logging in as {role.label}</p>
              </div>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <input type="text" value={username}
                    onChange={(e) => { setError(''); setUsername(e.target.value); }}
                    placeholder={`${role.label} username`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoComplete="username" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={password}
                    onChange={(e) => { setError(''); setPassword(e.target.value); }}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoComplete="current-password" required />
                </div>
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className={`w-full py-3 rounded-xl ${role.btnColor} text-white font-bold transition disabled:opacity-60 text-sm flex items-center justify-center gap-2`}>
                  Send OTP via Firebase →
                </button>
              </form>
            </div>
          )}

          {/* ── OTP ────────────────────────────────────────────────────────── */}
          {step === 'otp' && role && (
            <div className="p-6 sm:p-8">
              <button onClick={goBack}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {info && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-5">
                  <p className="text-sm text-blue-700 font-medium">{info}</p>
                </div>
              )}

              <h2 className="text-lg font-black text-gray-900 mb-1">Enter OTP</h2>
              <p className="text-sm text-gray-400 mb-5">
                Enter the 6-digit code sent to your phone via Firebase SMS
              </p>

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((d, i) => (
                    <input key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      disabled={!confirmation}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-lg font-black border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all disabled:opacity-40 disabled:bg-gray-50"
                    />
                  ))}
                </div>

                {!confirmation && (
                  <p className="text-center text-xs text-gray-400 animate-pulse">Waiting for OTP to arrive…</p>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <p className="text-sm text-center text-gray-400">
                  {timer > 0 ? (
                    `Resend in ${timer}s`
                  ) : (
                    <button type="button" onClick={handleResend} disabled={loading}
                      className="text-blue-600 font-semibold underline disabled:opacity-50">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button type="submit"
                  disabled={otp.join('').length !== 6 || !confirmation}
                  className={`w-full py-3 rounded-xl ${role.btnColor} text-white font-bold transition disabled:opacity-40 text-sm flex items-center justify-center gap-2`}>
                  Verify &amp; Login
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          OTP delivered via Firebase to the registered admin phone
        </p>
      </div>
    </div>
  );
};