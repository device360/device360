import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Shield, TrendingUp, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

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

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'role' | 'credentials' | 'otp'>('role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    setError(''); setInfo('');
    setOtp(['', '', '', '', '', '']);
    setUsername(''); setPassword('');
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

  // ── Step 2: verify credentials + ask backend to send OTP ─────────────────
  const requestOTP = async (roleKey: Role): Promise<boolean> => {
    setLoading(true);
    setLoadingMsg('Sending OTP to admin phone…');
    try {
      const res = await fetch(`${BACKEND}/api/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setInfo(data.message || 'OTP sent to the registered admin phone.');
      setTimer(30);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not send OTP. Please try again.');
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

    const ok = await requestOTP(selectedRole);
    if (ok) setStep('otp');
  };

  const handleResend = async () => {
    if (!selectedRole) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    await requestOTP(selectedRole);
  };

  // ── Step 3: submit OTP to backend for verification ────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole) return;
    const code = otp.join('');
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    setLoadingMsg('Verifying…');
    try {
      const res = await fetch(`${BACKEND}/api/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem(role.storageKey, 'true');
      navigate(role.redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
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

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
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
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className={`w-full py-3 rounded-xl ${role.btnColor} text-white font-bold transition disabled:opacity-60 text-sm flex items-center justify-center gap-2`}>
                  Send OTP to Admin Phone →
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
                Enter the 6-digit code sent to the admin phone
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
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-lg font-black border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
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
                  disabled={otp.join('').length !== 6 || loading}
                  className={`w-full py-3 rounded-xl ${role.btnColor} text-white font-bold transition disabled:opacity-40 text-sm`}>
                  Verify &amp; Login
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          OTP delivered via SMS to the registered admin phone
        </p>
      </div>
    </div>
  );
};