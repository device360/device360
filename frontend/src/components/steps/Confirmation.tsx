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

export const Confirmation: React.FC<StepProps> = ({ formData }) => {
  const navigate = useNavigate();
  const isLive = formData.issue?.liveRepair;
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLive || !formData.bookingId) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/leads/${formData.bookingId}`);
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
  }, [isLive, formData.bookingId]);

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
        `📋 Booking ID: #${formData.bookingId}\n` +
        `📱 Device: ${formData.brand?.name} ${formData.model}\n` +
        `🔧 Issue: ${formData.issue?.name}\n` +
        `🕐 Pickup: Within 60 minutes\n` +
        `📍 Address: ${addrStr}`,
    );
    window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
  };

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(`#${formData.bookingId}`);
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
        text: `Track my repair: #${formData.bookingId}`,
        url: `${window.location.origin}/dashboard/${formData.bookingId}`,
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200">
              <CheckCircle className="w-12 h-12 text-white" />
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
          <p className="text-gray-400 mt-1 text-sm">
            Thank you, <span className="font-bold text-gray-700">{formData.name}</span>. We've got your request!
          </p>
        </motion.div>
      </div>

      {/* Booking ID card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-4 sm:p-6 text-white"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5">
          <div className="min-w-0">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Booking ID
            </p>
            <p
              className="text-2xl sm:text-4xl font-black tracking-tight break-all leading-tight max-w-full"
              data-testid="booking-id"
            >
              #{formData.bookingId || 'PENDING'}
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={copyBookingId}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              title="Copy booking ID"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <button
              onClick={shareBooking}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              title="Share booking"
            >
              <Share2 className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* 60-min badge */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-5">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300 font-medium">
            60-minute repair promise. Pickup & drop not included.
          </p>
        </div>

        {/* Live repair */}
        {isLive && (
          <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/30 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Video className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-green-300 text-sm flex items-center gap-2 flex-wrap">
                  LIVE Repair Eligible
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </p>
                {videoLink ? (
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all"
                  >
                    <Video className="w-3 h-3" /> Watch Live Repair
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-xs text-green-400/80 mt-1">
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
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">We'll call you soon</p>
              <p className="text-xs text-gray-400">Confirmation via {formData.phone} within 15 min</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm">Pickup within 60 minutes</p>
              <p className="text-xs text-gray-400 leading-relaxed break-words">{addrStr}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Estimated: {formData.pricing?.time}</p>
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
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm hover:bg-[#1fb855] transition-all shadow-lg shadow-green-200 active:scale-95"
          data-testid="whatsapp-chat-button"
        >
          <MessageCircle className="w-5 h-5" />
          Chat on WhatsApp
        </button>

        {formData.bookingId && (
          <button
            onClick={() => navigate(`/dashboard/${formData.bookingId}`)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-blue-200 text-blue-600 font-black text-sm hover:bg-blue-50 transition-all active:scale-95"
            data-testid="track-repair-button"
          >
            <ExternalLink className="w-4 h-4" />
            Track Repair Status
          </button>
        )}

        <a
          href="tel:+919876543210"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <Phone className="w-4 h-4" /> +91 98765 43210
        </a>
      </motion.div>
    </div>
  );
};