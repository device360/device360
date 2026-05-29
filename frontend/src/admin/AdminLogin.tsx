import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Shield, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';

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
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const role = selectedRole ? ROLES[selectedRole] : null;

  const resetForm = () => {
    setError('');
    setUsername('');
    setPassword('');
    setLoading(false);
  };

  const goBack = () => {
    resetForm();

    if (step === 'credentials') {
      setStep('role');
      setSelectedRole(null);
      return;
    }

    setStep('role');
    setSelectedRole(null);
  };

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setStep('credentials');
    setError('');
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !selectedRole) return;

    setError('');
    setLoading(true);

    try {
      if (username !== role.username || password !== role.password) {
        setError('Invalid username or password.');
        return;
      }

      localStorage.setItem(role.storageKey, 'true');
      navigate(role.redirectTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-10">
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
          {/* Role selection */}
          {step === 'role' && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-1">Choose your role</h2>
              <p className="text-sm text-gray-400 mb-6">Select how you're logging in today</p>

              <div className="space-y-3">
                {(Object.keys(ROLES) as Role[]).map((r) => {
                  const cfg = ROLES[r];
                  const Icon = cfg.icon;

                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${cfg.border} ${cfg.bg} hover:shadow-md transition-all text-left group`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.accentColor}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`font-bold text-sm ${cfg.accentColor}`}>{cfg.label}</p>
                          <ChevronRight className={`w-4 h-4 ${cfg.accentColor} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{cfg.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Credentials */}
          {step === 'credentials' && role && (
            <div className="p-6 sm:p-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className={`flex items-center gap-3 p-3 rounded-2xl ${role.bg} border ${role.border} mb-6`}>
                <role.icon className={`w-5 h-5 ${role.accentColor} flex-shrink-0`} />
                <p className={`font-bold text-sm ${role.accentColor}`}>Logging in as {role.label}</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setError('');
                      setUsername(e.target.value);
                    }}
                    placeholder={`${role.label} username`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setError('');
                      setPassword(e.target.value);
                    }}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl ${role.btnColor} text-white font-bold transition disabled:opacity-60 text-sm flex items-center justify-center gap-2`}
                >
                  {loading ? 'Logging in…' : 'Login Now'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Login uses username and password only for now.
        </p>
      </div>
    </div>
  );
};
