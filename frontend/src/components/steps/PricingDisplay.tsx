import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Video, Shield, Truck, Star } from 'lucide-react';
import { useState } from 'react';
import type { StepProps } from '../../types';

const generateReferenceCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const timePart = Date.now().toString(36).toUpperCase().slice(-3);
  const randomPart = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${timePart}${randomPart}`.slice(0, 6);
};

export const PricingDisplay: React.FC<StepProps> = ({
  formData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const { brand, model, pricing, issue } = formData;
  const isLive = issue?.liveRepair;
  const savings = pricing?.oldPrice ? pricing.oldPrice - pricing.price : 0;
  const [referenceCode] = useState(() => generateReferenceCode());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-600 tracking-wide">Step 4 of 4</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Repair Quote</h2>
        <p className="text-sm text-gray-400 mt-1">Transparent pricing, no hidden charges</p>
      </div>

      {/* Reference code */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Reference ID</p>
            <p className="mt-1 text-lg font-black tracking-[0.25em] text-gray-900">
              {referenceCode}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right border border-blue-100">
            <p className="text-[11px] font-semibold text-blue-600">6-digit alphanumeric</p>
            <p className="text-xs text-blue-500 mt-0.5">Unique for this quote</p>
          </div>
        </div>
      </div>

      {/* ── Price hero card ───────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-12" />

        {/* Live repair badge */}
        {isLive && (
          <div className="relative flex items-center gap-2.5 p-3 rounded-2xl bg-green-500/20 border border-green-500/30 mb-5">
            <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-300 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE Repair Eligible
              </p>
              <p className="text-xs text-green-400/80 mt-0.5">Watch via real-time video stream</p>
            </div>
          </div>
        )}

        {/* Device & service */}
        <div className="relative space-y-3 mb-5 pb-5 border-b border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Device</p>
            <p className="font-bold text-sm">{brand?.name} {model}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Service</p>
            <div className="text-right">
              <p className="font-bold text-sm">{pricing?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Est. {pricing?.time}</p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="relative">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Total Amount</p>
          <div className="flex items-end gap-3 mb-1">
            {pricing?.oldPrice && (
              <span className="text-xl text-gray-500 line-through mb-0.5">₹{pricing.oldPrice}</span>
            )}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl font-black tracking-tight"
              data-testid="price-amount"
            >
              ₹{pricing?.price}
            </motion.span>
          </div>
          {savings > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <Star className="w-3 h-3 text-green-400" />
              <span className="text-xs font-bold text-green-400">You save ₹{savings}!</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Includes parts + labour + GST</p>
        </div>
      </div>

      {/* ── Included benefits ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-black text-gray-900 mb-4">What's Included</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: Shield, text: '6-month warranty on all repairs', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: CheckCircle, text: 'Genuine OEM parts guaranteed', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Truck, text: 'Free doorstep pickup & delivery', color: 'text-violet-600', bg: 'bg-violet-50' },
            ...(isLive
              ? [{ icon: Video, text: 'Real-time live video tracking included', color: 'text-green-600', bg: 'bg-green-50' }]
              : []),
          ].map(({ icon: Icon, text, color, bg }) => (
            <div key={text} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={goToPreviousStep}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          data-testid="back-button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={goToNextStep}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-sm hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95"
          data-testid="proceed-to-fix-button"
        >
          Repair →
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        No payment now — pay only after repair is done ✓
      </p>
    </div>
  );
};