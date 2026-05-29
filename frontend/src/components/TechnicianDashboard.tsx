import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Video, Phone, MapPin, Clock, CheckCircle,
  Wrench, AlertCircle, Search, LogOut, Play, ExternalLink,
  Package, XCircle, Zap, Copy, Shield, BarChart3,
} from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000').replace(/\/$/, '');

const STATUS_OPTIONS = ['pending','confirmed','picked_up','in_progress','completed','cancelled'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_META: Record<Status, { color: string; dot: string; label: string }> = {
  pending:     { color: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-400',   label: 'Pending'     },
  confirmed:   { color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500',    label: 'Confirmed'   },
  picked_up:   { color: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-500',  label: 'Picked Up'   },
  in_progress: { color: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500',  label: 'In Progress' },
  completed:   { color: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500', label: 'Completed'   },
  cancelled:   { color: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-400',     label: 'Cancelled'   },
};

export const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [videoInputs, setVideoInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [copied, setCopied] = useState<string | null>(null);

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

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      await fetch(`${BACKEND}/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchLeads();
    } catch { alert('Update failed. Please try again.'); }
    finally { setUpdating((u) => ({ ...u, [id]: false })); }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('techAuth');
    localStorage.removeItem('mktAuth');
    navigate('/admin/login');
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const displayed = leads
    .filter((l) => filter === 'active' ? !['completed','cancelled'].includes(l.status) : true)
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return [l.name, l.phone, l.brand, l.model, l.issue, l.id]
        .some((v) => (v || '').toLowerCase().includes(q));
    });

  const stats = {
    active:    leads.filter((l) => ['confirmed','picked_up','in_progress'].includes(l.status)).length,
    pending:   leads.filter((l) => l.status === 'pending').length,
    completed: leads.filter((l) => l.status === 'completed').length,
    live:      leads.filter((l) => l.isLiveRepair && l.status === 'in_progress').length,
  };

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
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-100 shadow-md shadow-orange-100"
              />
              <div>
                <span className="font-black text-gray-900 text-sm">Device360</span>
                <span className="text-orange-500 text-sm font-bold"> Technician</span>
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
                onClick={() => navigate('/marketing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 text-green-600" /> Marketing
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
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Jobs',  val: stats.active,    color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Package },
            { label: 'Pending',      val: stats.pending,   color: 'text-amber-600',  bg: 'bg-amber-50',  icon: AlertCircle },
            { label: 'Completed',    val: stats.completed, color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle },
            { label: 'Live Repairs', val: stats.live,      color: 'text-orange-600', bg: 'bg-orange-50', icon: Video },
          ].map(({ label, val, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {(['active', 'all'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-orange-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                {f === 'active' ? 'Active Jobs' : 'All Jobs'}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, device…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
          </div>
        </div>

        {/* Job cards */}
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No jobs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((lead) => {
              const meta = STATUS_META[lead.status as Status] || STATUS_META.pending;
              return (
                <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-gray-900">{lead.name}</p>
                        {lead.isLiveRepair && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                          </span>
                        )}
                      </div>
                      <button onClick={() => copyId(lead.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        <Copy className="w-3 h-3" />
                        {copied === lead.id ? 'Copied!' : `#${lead.id.slice(-8).toUpperCase()}`}
                      </button>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${meta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" />{lead.phone}</div>
                    <div className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-orange-500" />{lead.brand} {lead.model}</div>
                    <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-500" />{lead.issue}</div>
                    <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" /><span className="truncate">{lead.address}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{lead.timeSlot || 'ASAP'}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-50">
                    {/* Status updater */}
                    <select value={lead.status}
                      onChange={(e) => updateLead(lead.id, { status: e.target.value as Status })}
                      disabled={updating[lead.id]}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 focus:border-orange-400 outline-none disabled:opacity-50 bg-white">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>

                    {/* Quick status buttons */}
                    {lead.status === 'confirmed' && (
                      <button onClick={() => updateLead(lead.id, { status: 'picked_up' })}
                        disabled={updating[lead.id]}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all disabled:opacity-50">
                        <Package className="w-3.5 h-3.5" /> Mark Picked Up
                      </button>
                    )}
                    {lead.status === 'picked_up' && (
                      <button onClick={() => updateLead(lead.id, { status: 'in_progress' })}
                        disabled={updating[lead.id]}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all disabled:opacity-50">
                        <Play className="w-3.5 h-3.5" /> Start Repair
                      </button>
                    )}
                    {lead.status === 'in_progress' && (
                      <button onClick={() => updateLead(lead.id, { status: 'completed' })}
                        disabled={updating[lead.id]}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                      </button>
                    )}
                    {updating[lead.id] && (
                      <span className="text-xs text-orange-500 font-medium animate-pulse">Updating…</span>
                    )}
                  </div>

                  {/* Live stream section */}
                  {lead.isLiveRepair && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-bold text-green-800">Live Repair Stream</p>
                      </div>
                      {lead.videoLink ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={lead.videoLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /> View Stream
                          </a>
                          <span className="text-xs text-green-700 truncate max-w-xs">{lead.videoLink}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-green-700">
                            Start a YouTube Live stream, then paste the link below to share with the customer.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://youtube.com/live/..."
                              value={videoInputs[lead.id] || ''}
                              onChange={(e) => setVideoInputs((v) => ({ ...v, [lead.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 rounded-xl border border-green-300 text-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                            <button
                              onClick={() => {
                                const link = videoInputs[lead.id];
                                if (link) updateLead(lead.id, { videoLink: link, status: 'in_progress' });
                              }}
                              disabled={updating[lead.id] || !videoInputs[lead.id]}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                              <Video className="w-3.5 h-3.5" /> Go Live
                            </button>
                          </div>
                          <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-green-700 underline hover:text-green-900">
                            <ExternalLink className="w-3 h-3" /> Open YouTube Studio
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
