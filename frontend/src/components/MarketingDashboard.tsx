import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, IndianRupee, Users, Star, RefreshCw,
  LogOut, BarChart3, CheckCircle, Package, MessageCircle,
  ThumbsUp, Award, Zap, ArrowUpRight, Calendar, Shield, Wrench,
} from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000').replace(/\/$/, '');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const MOCK_REVIEWS = [
  { id: 1, name: 'Rahul Sharma',    rating: 5, text: 'Watched my iPhone screen repair LIVE! Done in 40 mins. Amazing!',       date: '2 days ago' },
  { id: 2, name: 'Priya Patel',     rating: 5, text: 'The live video feature is a game changer. Fully transparent service.',   date: '3 days ago' },
  { id: 3, name: 'Amit Kumar',      rating: 5, text: 'Professional team, doorstep pickup. Best repair service in Bengaluru!',  date: '5 days ago' },
  { id: 4, name: 'Deepa Nair',      rating: 4, text: 'Fast service and genuine parts. Battery lasts much longer now.',         date: '1 week ago' },
  { id: 5, name: 'Karthik Reddy',   rating: 5, text: 'Screen replaced in under an hour. Crystal clear display!',              date: '1 week ago' },
  { id: 6, name: 'Sneha Menon',     rating: 5, text: 'The porter was on time and the repair was flawless. Will recommend!',   date: '2 weeks ago' },
];

export const MarketingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/leads`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const logout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('techAuth');
    localStorage.removeItem('mktAuth');
    navigate('/admin/login');
  };

  // ─── Derived metrics ─────────────────────────────────────────────────────
  const now = Date.now();
  const cutoffs: Record<typeof period, number> = {
    '7d':  now - 7  * 86400000,
    '30d': now - 30 * 86400000,
    'all': 0,
  };

  const filtered = leads.filter((l) => new Date(l.createdAt).getTime() >= cutoffs[period]);
  const completed = filtered.filter((l) => l.status === 'completed');
  const revenue   = completed.reduce((s, l) => s + (l.price || 0), 0);
  const liveCount = filtered.filter((l) => l.isLiveRepair).length;
  const avgTicket = completed.length ? Math.round(revenue / completed.length) : 0;

  // Top issues
  const issueCounts: Record<string, number> = {};
  filtered.forEach((l) => { if (l.issue) issueCounts[l.issue] = (issueCounts[l.issue] || 0) + 1; });
  const topIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxIssue  = topIssues[0]?.[1] || 1;

  // Top brands
  const brandCounts: Record<string, number> = {};
  filtered.forEach((l) => { if (l.brand) brandCounts[l.brand] = (brandCounts[l.brand] || 0) + 1; });
  const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxBrand  = topBrands[0]?.[1] || 1;

  // Daily revenue (last 7 days)
  const dailyRevenue: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    dailyRevenue[d.toLocaleDateString('en-IN', { weekday: 'short' })] = 0;
  }
  completed.forEach((l) => {
    const d = new Date(l.createdAt);
    const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
    if (key in dailyRevenue) dailyRevenue[key] += l.price || 0;
  });
  const dailyMax = Math.max(...Object.values(dailyRevenue), 1);

  const COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-pink-500'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img
                src="/fabicon.png"
                alt="Device360 logo"
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-100 shadow-md shadow-green-100"
              />
              <div>
                <span className="font-black text-gray-900 text-sm">Device360</span>
                <span className="text-green-600 text-sm font-bold"> Marketing</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" /> Admin
              </button>
              <button
                onClick={() => navigate('/technician')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-all"
              >
                <Wrench className="w-3.5 h-3.5 text-orange-600" /> Technician
              </button>
              <button onClick={fetchLeads} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-all">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Period filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 mr-1">Period:</span>
          {(['7d','30d','all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
              {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'All time'}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Revenue',       val: INR(revenue),      change: '+12%',  color: 'text-green-600',  bg: 'bg-green-50',  icon: IndianRupee },
            { label: 'Total Bookings',val: filtered.length,   change: '+8%',   color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Package },
            { label: 'Completed',     val: completed.length,  change: '+15%',  color: 'text-emerald-600',bg: 'bg-emerald-50',icon: CheckCircle },
            { label: 'Avg Ticket',    val: INR(avgTicket),    change: '+3%',   color: 'text-violet-600', bg: 'bg-violet-50', icon: TrendingUp },
          ].map(({ label, val, change, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
              <p className="text-xs text-green-500 font-bold mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />{change} vs prev
              </p>
            </div>
          ))}
        </div>

        {/* Extra stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Live Repairs Booked', val: liveCount,  icon: Zap,          color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Unique Customers',    val: new Set(filtered.map((l) => l.phone)).size, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Avg Rating',          val: '4.9 ⭐',    icon: Star,         color: 'text-amber-600',  bg: 'bg-amber-50'  },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-black ${color}`}>{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily revenue chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <h3 className="font-black text-gray-900 text-sm">Daily Revenue (last 7 days)</h3>
            </div>
            <div className="flex items-end gap-2 h-32">
              {Object.entries(dailyRevenue).map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] text-gray-500 font-medium">{val > 0 ? INR(val) : ''}</p>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-green-400 transition-all"
                    style={{ height: `${Math.max(4, (val / dailyMax) * 100)}%` }} />
                  <p className="text-[10px] text-gray-400 font-semibold">{day}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top issues */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-gray-900 text-sm">Top Repair Issues</h3>
            </div>
            {topIssues.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topIssues.map(([issue, count], i) => (
                  <div key={issue}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700 truncate flex-1 mr-2">{issue}</p>
                      <p className="text-xs font-black text-gray-900">{count}</p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all`}
                        style={{ width: `${(count / maxIssue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top brands */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-violet-600" />
              <h3 className="font-black text-gray-900 text-sm">Top Brands Repaired</h3>
            </div>
            {topBrands.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topBrands.map(([brand, count], i) => (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{brand}</p>
                      <p className="text-xs font-black text-gray-900">{count} jobs</p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all`}
                        style={{ width: `${(count / maxBrand) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversion funnel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-gray-900 text-sm">Booking Funnel</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Total Leads',  count: filtered.length,                                                   color: 'bg-blue-500' },
                { label: 'Confirmed',    count: filtered.filter((l) => l.status !== 'pending').length,             color: 'bg-violet-500' },
                { label: 'In Progress',  count: filtered.filter((l) => ['in_progress','completed'].includes(l.status)).length, color: 'bg-orange-500' },
                { label: 'Completed',    count: completed.length,                                                  color: 'bg-green-500' },
              ].map(({ label, count, color }) => {
                const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{label}</p>
                      <p className="text-xs font-black text-gray-900">{count} <span className="text-gray-400">({pct}%)</span></p>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-gray-900 text-sm">Customer Reviews</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black text-amber-700">4.9 / 5</span>
              <span className="text-xs text-amber-500">(2,847 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_REVIEWS.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{r.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{r.date}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-1 mt-2">
                  <ThumbsUp className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-500 font-medium">Verified Booking</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Customer','Device','Issue','Amount','Status','Date'].map((h) => (
                    <th key={h} className="text-left text-gray-400 font-semibold pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.slice(0, 10).map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-4 font-semibold text-gray-800">{l.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{l.brand} {l.model}</td>
                    <td className="py-2 pr-4 text-gray-600">{l.issue}</td>
                    <td className="py-2 pr-4 font-bold text-gray-900">{INR(l.price || 0)}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        l.status === 'in_progress' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {l.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">{new Date(l.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No bookings in this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
