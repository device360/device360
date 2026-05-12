import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
  Video,
  Zap,
  Share2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StepProps, AddressFields } from '../../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

export const Confirmation: React.FC<StepProps> = ({ formData }) => {
  const navigate = useNavigate();
  const isLive = formData.issue?.liveRepair;
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rawBookingId = formData.bookingId || '';
  const bookingCode = toShortBookingCode(rawBookingId);

  useEffect(() => {
    if (!isLive || !rawBookingId) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/leads/${rawBookingId}`);
        const data = await res.json();
        if (data.lead?.videoLink) {
          setVideoLink(data.lead.videoLink);
          clearInterval(id);
        }
      } catch {
        /* silent */
      }
    }, 15000);

    return () => clearInterval(id);
  }, [isLive, rawBookingId]);

  const addrStr = (() => {
    const a = formData.address;
    if (typeof a === 'object') {
      const f = a as AddressFields;
      return `${f.doorNumber}, ${f.floor ? f.floor + ', ' : ''}${f.street}, ${f.city} - ${f.pincode}`;
    }
    return a as string;
  })();

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! My booking is confirmed.\n\n` +
        `📋 Booking ID: #${bookingCode}\n` +
        `📱 Device: ${formData.brand?.name} ${formData.model}\n` +
        `🔧 Issue: ${formData.issue?.name}\n` +
        `🕐 Pickup: Within 60 minutes\n` +
        `📍 Address: ${addrStr}`,
    );
    window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
  };

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(`#${bookingCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const shareBooking = async () => {
    try {
      await navigator.share({
        title: 'My Repair Booking',
        text: `Track my repair: #${bookingCode}`,
        url: `${window.location.origin}/dashboard/${rawBookingId}`,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="space-y-4">
      {/* Success animation */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="inline-flex"
        >
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl shadow-green-200">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-green-300"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <h2 className="text-2xl font-black text-gray-900">Booking Confirmed! 🎉</h2>
          <p className="mt-1 text-sm text-gray-400">
            Thank you, <span className="font-bold text-gray-700">{formData.name}</span>. We've got your request!
          </p>
        </motion.div>
      </div>

      {/* Booking ID card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white sm:p-6"
      >
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Booking ID
            </p>
            <p
              className="max-w-full break-all text-2xl font-black leading-tight tracking-tight sm:text-4xl"
              data-testid="booking-id"
            >
              #{bookingCode}
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={copyBookingId}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
              title="Copy booking ID"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-300" />
              )}
            </button>
            <button
              onClick={shareBooking}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
              title="Share booking"
            >
              <Share2 className="h-4 w-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Live repair */}
        {isLive && (
          <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/20 p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-green-500">
                <Video className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-green-300">
                  LIVE Repair Eligible
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                </p>
                {videoLink ? (
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-600"
                  >
                    <Video className="h-3 w-3" /> Watch Live Repair
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-green-400/80">
                    Live link will appear via SMS & WhatsApp once repair starts.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
              <Phone className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">We'll call you soon</p>
              <p className="text-xs text-gray-400">Confirmation via {formData.phone} within 15 min</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
              <MapPin className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Pickup within 60 minutes</p>
              <p className="break-words text-xs leading-relaxed text-gray-400">{addrStr}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/20">
              <Clock className="h-3.5 w-3.5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Estimated: {formData.pricing?.time}</p>
              <p className="text-xs text-gray-400">
                {formData.issue?.name} on {formData.brand?.name} {formData.model}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <button
          onClick={handleWhatsApp}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 text-sm font-black text-white shadow-lg shadow-green-200 transition-all hover:bg-[#1fb855] active:scale-95"
          data-testid="whatsapp-chat-button"
        >
          <MessageCircle className="h-5 w-5" />
          Chat on WhatsApp
        </button>

        {rawBookingId && (
          <button
            onClick={() => navigate(`/dashboard/${rawBookingId}`)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 py-3.5 text-sm font-black text-blue-600 transition-all hover:bg-blue-50 active:scale-95"
            data-testid="track-repair-button"
          >
            <ExternalLink className="h-4 w-4" />
            Track Repair Status
          </button>
        )}

        <a
          href="tel:+919876543210"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" /> +91 9164405840
        </a>
      </motion.div>
    </div>
  );
};