import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Shield, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
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
    username: 'Marketing',
    password: 'Mkt@device360',
    storageKey: 'mktAuth',
    redirectTo: '/marketing',
  },
};

// Module-level verifier singleton — never recreated
declare global {
  interface Window {
    __admin_verifier?: RecaptchaVerifier;
    __admin_verifier_ready?: boolean;
  }
}

async function ensureVerifier(): Promise<RecaptchaVerifier> {
  if (window.__admin_verifier && window.__admin_verifier_ready) {
    return window.__admin_verifier;
  }
  if (!window.__admin_verifier) {
    window.__admin_verifier = new RecaptchaVerifier(auth, 'admin-recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { window.__admin_verifier_ready = false; },
    });
  }
  if (!window.__admin_verifier_ready) {
    await window.__admin_verifier.render();
    window.__admin_verifier_ready = true;
  }
  return window.__admin_verifier;
}

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
  const hasSentRef = useRef(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const role = selectedRole ? ROLES[selectedRole] : null;

  // Timer countdown
  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const reset = () => {
    setError(''); setInfo(''); setOtp(['','','','','','']);
    setUsername(''); setPassword('');
    setConfirmation(null); hasSentRef.current = false;
  };

  const goBack = () => {
    reset();
    if (step === 'otp') { setStep('credentials'); return; }
    setStep('role'); setSelectedRole(null);
  };

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setStep('credentials');
    setError('');
  };

  // Step 2: verify credentials then trigger Firebase Phone Auth
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole) return;
    setError('');

    if (username !== role.username || password !== role.password) {
      setError('Invalid username or password.');
      return;
    }

    setLoading(true);
    try {
      // Ask backend for the phone number associated with this role
      const res = await fetch(`${BACKEND}/api/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const phone = data.phone;

      // Now trigger Firebase Phone Auth — sends real SMS
      const verifier = await ensureVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);
      hasSentRef.current = true;
      setInfo(`OTP sent to ${phone.slice(0, 6)}****${phone.slice(-2)}`);
      setStep('otp');
      setTimer(30);
    } catch (err: any) {
      window.__admin_verifier_ready = false;
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Wait a few minutes.');
      } else {
        setError(err.message || 'Could not send OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!role || !selectedRole || !confirmation) return;
    hasSentRef.current = false;
    setOtp(['','','','','','']);
    setConfirmation(null);
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      window.__admin_verifier_ready = false;
      const verifier = await ensureVerifier();
      const result = await signInWithPhoneNumber(auth, data.phone, verifier);
      setConfirmation(result);
      setTimer(30);
      setInfo('OTP resent.');
    } catch (err: any) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: confirm OTP → verify idToken on backend
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole || !confirmation) return;
    const code = otp.join('');
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      // Confirm with Firebase
      const cred = await confirmation.confirm(code);
      const idToken = await cred.user.getIdToken();

      // Verify on backend (checks phone matches role)
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
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-10">
      {/* reCAPTCHA anchor outside React root */}
      <div id="admin-recaptcha-root" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, width: 0, height: 0, overflow: 'hidden' }} />

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

          {/* ── Step: Role selection ───────────────────────────────────────── */}
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

          {/* ── Step: Credentials ─────────────────────────────────────────── */}
          {step === 'credentials' && role && (
            <div className="p-6 sm:p-8">
              <button onClick={goBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className={`flex items-center gap-3 p-3 rounded-2xl ${role.bg} border ${role.border} mb-6`}>
                <role.icon className={`w-5 h-5 ${role.accentColor} flex-shrink-0`} />
                <p className={`font-bold text-sm ${role.accentColor}`}>Logging in as {role.label}</p>
              </div>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder={`${role.label} username`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60 text-sm">
                  {loading ? 'Sending OTP…' : 'Send OTP via Firebase →'}
                </button>
              </form>
            </div>
          )}

          {/* ── Step: OTP ─────────────────────────────────────────────────── */}
          {step === 'otp' && role && (
            <div className="p-6 sm:p-8">
              <button onClick={goBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {info && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-5">
                  <p className="text-sm text-blue-700 font-medium">{info}</p>
                </div>
              )}
              <h2 className="text-lg font-black text-gray-900 mb-1">Enter OTP</h2>
              <p className="text-sm text-gray-400 mb-5">
                Check your phone for the 6-digit code sent via Firebase SMS
              </p>
              <form onSubmit={handleOtp} className="space-y-5">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((d, i) => (
                    <input key={i} ref={(el) => (inputRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      disabled={loading || !confirmation}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-lg font-black border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all disabled:opacity-40" />
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                <p className="text-sm text-center text-gray-400">
                  {timer > 0 ? `Resend in ${timer}s` : (
                    <button type="button" onClick={handleResend} disabled={loading}
                      className="text-blue-600 font-semibold underline disabled:opacity-50">
                      Resend OTP
                    </button>
                  )}
                </p>
                <button type="submit" disabled={otp.join('').length !== 6 || loading || !confirmation}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60 text-sm">
                  {loading ? 'Verifying…' : 'Verify & Login'}
                </button>
              </form>
            </div>
          )}

        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          OTP is sent via Firebase to the registered admin phone number
        </p>
      </div>
    </div>
  );
};