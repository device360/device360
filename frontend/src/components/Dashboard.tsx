import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Eye, CheckCircle, Clock, MapPin, Phone, ArrowLeft,
  Video, Zap, RefreshCw, MessageCircle, Share2, Wrench, Copy,
} from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// ── Same hashing function as Confirmation.tsx ─────────────────────────────
const toShortBookingCode = (value?: string | null) => {
  const raw = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!raw) return 'PENDING';
  if (raw.length === 7) return raw;

  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    hash |= 0;
  }

  const base36 = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0');
  return `D${base36.slice(-6)}`; // 7 chars total, alphanumeric
};

// ─────────────────────────────────────────────────────────────────────────────

const REPAIR_STEPS = [
  { id: 1, label: 'Booking Confirmed',  icon: CheckCircle, statuses: ['pending','confirmed','picked_up','in_progress','completed'] },
  { id: 2, label: 'Device Picked Up',   icon: Package,     statuses: ['picked_up','in_progress','completed'] },
  { id: 3, label: 'Repair in Progress', icon: Wrench,      statuses: ['in_progress','completed'] },
  { id: 4, label: 'Quality Check',      icon: Eye,         statuses: ['completed'] },
  { id: 5, label: 'Out for Delivery',   icon: MapPin,      statuses: ['delivered'] },
];

const STATUS_DOT: Record<string, string> = {
  completed: 'bg-emerald-500', in_progress: 'bg-orange-500',
  picked_up: 'bg-violet-500',  confirmed: 'bg-blue-500',
  pending: 'bg-amber-500',     cancelled: 'bg-red-500',
};

export const Dashboard: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive the same short code from the raw URL param / booking.id
  const rawId = booking?.id ? String(booking.id) : (bookingId || '');
  const bookingCode = toShortBookingCode(rawId);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/leads/${bookingId}`);
        const data = await res.json();
        if (res.ok) { setBooking(data.lead || data); setLastUpdated(new Date()); }
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchBooking();
    const id = setInterval(fetchBooking, 30000);
    return () => clearInterval(id);
  }, [bookingId]);

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(`#${bookingCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800">Loading your repair</p>
          <p className="text-sm text-gray-400 mt-0.5">Fetching latest status…</p>
        </div>
      </div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-2">
        <Package className="w-9 h-9 text-gray-300" />
      </div>
      <p className="text-gray-800 font-black text-xl">Booking not found</p>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        The booking ID may be incorrect or this booking has expired.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
      >
        Go Home
      </button>
    </div>
  );

  const isLive = ['Display Replacement','Screen Replacement','Battery Replacement','Back Glass'].includes(booking.issue);
  const currentStepIdx = REPAIR_STEPS.findIndex((x) => x.statuses.includes(booking.status));
  const progressPct = Math.round(((currentStepIdx + 1) / REPAIR_STEPS.length) * 100);

  const shareBooking = async () => {
    try {
      await navigator.share({
        title: 'My Repair Booking',
        text: `Track my phone repair: Booking #${bookingCode}`,
        url: window.location.href,
      });
    } catch { /* user cancelled */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wrench className="w-3 h-3 text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">Repair Tracker</span>
          </div>
          <button onClick={shareBooking} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Hero status card ─────────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20 overflow-hidden mb-3">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />

            <div className="relative">
              {/* Booking ID row — matches Confirmation.tsx exactly */}
              <div className="flex items-start justify-between mb-5">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Booking ID
                  </p>
                  <p
                    className="text-3xl font-black leading-tight tracking-tight sm:text-4xl"
                    data-testid="booking-id"
                  >
                    #{bookingCode}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  {/* Copy button */}
                  <button
                    onClick={copyBookingId}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
                    title="Copy booking ID"
                  >
                    {copied
                      ? <CheckCircle className="h-4 w-4 text-green-400" />
                      : <Copy className="h-4 w-4 text-gray-300" />
                    }
                  </button>
                  {/* Status badge */}
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status] || 'bg-white'}`} />
                    {booking.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Repair progress</span>
                  <span className="font-bold">{progressPct}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Device info grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                {[
                  { label: 'Device',  val: `${booking.brand} ${booking.model}` },
                  { label: 'Issue',   val: booking.issue },
                  { label: 'Pickup',  val: booking.timeSlot },
                  { label: 'Amount',  val: `₹${booking.price}` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="font-bold text-sm text-white leading-tight">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 60-min promise ───────────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-amber-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">60-Minute Repair Promise</p>
              <p className="text-xs text-gray-400">Done within 60 mins of reaching our lab.</p>
            </div>
          </div>

          {/* ── Live repair card ─────────────────────────────────── */}
          {isLive && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">Live Repair Stream</h3>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Watch your device get repaired in real time</p>
                </div>
              </div>
              {booking.videoLink ? (
                <a
                  href={booking.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  Watch Your Repair LIVE
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    Live stream link will appear here once your technician starts. Auto-refreshes every 30s.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Progress tracker ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 text-sm mb-5">Repair Timeline</h3>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-[17px] top-5 bottom-5 w-0.5 bg-gray-100 rounded-full" />
              <div
                className="absolute left-[17px] top-5 w-0.5 bg-blue-400 rounded-full transition-all duration-700"
                style={{ height: `${progressPct}%` }}
              />

              <div className="space-y-4">
                {REPAIR_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done   = s.statuses.includes(booking.status);
                  const active = i === currentStepIdx;
                  const upcoming = !done && !active;
                  return (
                    <div key={s.id} className="flex items-center gap-4 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all border-2 ${
                        done   ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-100' :
                        active ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100' :
                                 'bg-white border-gray-200'
                      }`}>
                        {done
                          ? <CheckCircle className="w-4 h-4 text-white" />
                          : <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-300'}`} />
                        }
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          done   ? 'text-emerald-700' :
                          active ? 'text-blue-700' :
                                   'text-gray-400'
                        }`}>{s.label}</p>
                        {active && (
                          <p className="text-xs text-blue-400 font-medium mt-0.5">Currently in this stage</p>
                        )}
                      </div>
                      {done   && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Done</span>}
                      {active && <span className="text-xs text-blue-600 font-bold animate-pulse bg-blue-50 px-2 py-0.5 rounded-full">● Active</span>}
                      {upcoming && i === currentStepIdx + 1 && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Next</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Auto-refresh ─────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refreshes every 30s</span>
            {lastUpdated && <span>· {lastUpdated.toLocaleTimeString()}</span>}
          </div>

          {/* ── Contact / CTA ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-sm font-bold text-gray-800 text-center">Need help with your repair?</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" /> Call Us
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-50 border border-green-100 text-green-700 font-bold text-sm hover:bg-green-100 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};