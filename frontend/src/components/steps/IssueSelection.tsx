import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, ShieldCheck, Video, Zap, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { issues, getPriceForRepair } from '../../data/mockData';
import type { StepProps, Issue } from '../../types';

/* ─────────────────────────── helpers ─────────────────────────── */

const formatMoney = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value))
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  if (typeof value === 'string' && value.trim())
    return value.startsWith('₹') ? value : `₹${value}`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const c = obj.currentPrice ?? obj.price ?? obj.amount ?? obj.finalPrice ?? obj.value;
    if (typeof c === 'number' && Number.isFinite(c))
      return `₹${Math.round(c).toLocaleString('en-IN')}`;
    if (typeof c === 'string' && c.trim())
      return c.startsWith('₹') ? c : `₹${c}`;
  }
  return null;
};

const getStrikePrice = (value: unknown): string | null => {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const c = obj.oldPrice ?? obj.mrp ?? obj.regularPrice ?? obj.originalPrice;
    if (typeof c === 'number' && Number.isFinite(c))
      return `₹${Math.round(c).toLocaleString('en-IN')}`;
    if (typeof c === 'string' && c.trim())
      return c.startsWith('₹') ? c : `₹${c}`;
  }
  return null;
};

const getNumericPrice = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const c = obj.currentPrice ?? obj.price ?? obj.amount ?? obj.finalPrice ?? obj.value;
    if (typeof c === 'number' && Number.isFinite(c)) return c;
    if (typeof c === 'string') { const p = Number(c.replace(/[^\d.-]/g, '')); return Number.isFinite(p) ? p : 0; }
  }
  if (typeof value === 'string') { const p = Number(value.replace(/[^\d.-]/g, '')); return Number.isFinite(p) ? p : 0; }
  return 0;
};

const getNumericOldPrice = (value: unknown): number => {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const c = obj.oldPrice ?? obj.mrp ?? obj.regularPrice ?? obj.originalPrice;
    if (typeof c === 'number' && Number.isFinite(c)) return c;
    if (typeof c === 'string') { const p = Number(c.replace(/[^\d.-]/g, '')); return Number.isFinite(p) ? p : 0; }
  }
  return 0;
};

const iconMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

/* ─────────────────────────── IssuePill ─────────────────────────── */

const IssuePill: React.FC<{ label: string; tone?: 'live' | 'default' }> = ({ label, tone = 'default' }) => (
  <span
    className={`inline-flex items-center border font-bold ${
      tone === 'live'
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}
    style={{
      gap: 'clamp(3px, 0.8vw, 6px)',
      padding: 'clamp(3px, 0.6vw, 6px) clamp(8px, 2vw, 12px)',
      borderRadius: 'clamp(10px, 2.5vw, 999px)',
      fontSize: 'clamp(9px, 2.2vw, 11px)',
    }}
  >
    {tone === 'live' && (
      <span
        className="rounded-full bg-red-500 animate-pulse"
        style={{ width: 'clamp(5px, 1.3vw, 8px)', height: 'clamp(5px, 1.3vw, 8px)', flexShrink: 0 }}
      />
    )}
    {label}
  </span>
);

/* ─────────────────────────── IssueRow ─────────────────────────── */

const IssueRow: React.FC<{
  issue: Issue;
  isSelected: boolean;
  isLive?: boolean;
  priceLabel: string | null;
  strikePrice: string | null;
  onSelect: () => void;
}> = ({ issue, isSelected, isLive, priceLabel, strikePrice, onSelect }) => {
  const Icon = iconMap[issue.icon];

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`group w-full text-left border transition-all ${
        isSelected
          ? isLive
            ? 'border-red-200 bg-gradient-to-br from-red-50 via-white to-orange-50 shadow-[0_14px_34px_rgba(239,68,68,0.10)]'
            : 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-[0_14px_34px_rgba(59,130,246,0.10)]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]'
      }`}
      style={{
        borderRadius: 'clamp(14px, 4vw, 24px)',
        padding: 'clamp(10px, 3vw, 20px)',
      }}
      data-testid={`issue-option-${issue.id}`}
    >
      <div className="flex items-center min-w-0" style={{ gap: 'clamp(8px, 3vw, 16px)' }}>
        {/* Icon box */}
        <div className="relative shrink-0">
          <div
            className={`flex items-center justify-center border shadow-sm ${
              isSelected
                ? isLive
                  ? 'bg-red-500 border-red-200'
                  : 'bg-blue-600 border-blue-200'
                : 'bg-white border-gray-200'
            }`}
            style={{
              width: 'clamp(40px, 10vw, 56px)',
              height: 'clamp(40px, 10vw, 56px)',
              borderRadius: 'clamp(10px, 2.5vw, 16px)',
            }}
          >
            {Icon ? (
              <div style={{ width: 'clamp(16px, 4vw, 24px)', height: 'clamp(16px, 4vw, 24px)' }}>
                <Icon
                  className={isSelected ? 'text-white' : 'text-gray-500'}
                />
              </div>
            ) : (
              <div style={{ width: 'clamp(16px, 4vw, 24px)', height: 'clamp(16px, 4vw, 24px)' }}>
                <Icons.CircleDashed
                  className={isSelected ? 'text-white' : 'text-gray-400'}
                />
              </div>
            )}
          </div>

          {isLive && (
            <span className="absolute -top-2 -left-2">
              <IssuePill label="LIVE" tone="live" />
            </span>
          )}

          {isSelected && (
            <div
              className={`absolute -bottom-2 -right-2 flex items-center justify-center border-2 border-white shadow-md ${
                isLive ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{
                width: 'clamp(18px, 4vw, 24px)',
                height: 'clamp(18px, 4vw, 24px)',
                borderRadius: '50%',
              }}
            >
              <CheckCircle2
                className="text-white"
                style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between" style={{ gap: 'clamp(6px, 2vw, 12px)' }}>
            <div className="min-w-0">
              <p
                className={`font-black leading-tight truncate ${
                  isSelected ? (isLive ? 'text-red-900' : 'text-blue-900') : 'text-gray-950'
                }`}
                style={{ fontSize: 'clamp(12px, 3.5vw, 15px)' }}
              >
                {issue.name}
              </p>
              <div
                className="flex flex-wrap items-center text-gray-500"
                style={{
                  marginTop: 'clamp(2px, 0.8vw, 4px)',
                  gap: 'clamp(6px, 1.5vw, 12px)',
                  fontSize: 'clamp(9px, 2.2vw, 11px)',
                }}
              >
                <span className="inline-flex items-center" style={{ gap: 'clamp(3px, 0.8vw, 6px)' }}>
                  <Clock3 style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }} />
                  {issue.time}
                </span>
                {isLive && (
                  <span
                    className="inline-flex items-center text-red-600 font-semibold"
                    style={{ gap: 'clamp(3px, 0.8vw, 6px)' }}
                  >
                    <Video style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }} />
                    Live stream
                  </span>
                )}
              </div>
            </div>

            <ChevronRight
              className={isSelected ? 'text-gray-500' : 'text-gray-300'}
              style={{
                width: 'clamp(12px, 3vw, 16px)',
                height: 'clamp(12px, 3vw, 16px)',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
          </div>

          {/* Price row */}
          <div
            className="flex flex-wrap items-end justify-between"
            style={{ marginTop: 'clamp(8px, 2.5vw, 16px)', gap: 'clamp(6px, 1.5vw, 12px)' }}
          >
            <div className="min-w-0">
              <div className="flex items-center flex-wrap" style={{ gap: 'clamp(4px, 1vw, 8px)' }}>
                {strikePrice && (
                  <span
                    className="text-gray-400 line-through"
                    style={{ fontSize: 'clamp(9px, 2.2vw, 12px)' }}
                  >
                    {strikePrice}
                  </span>
                )}
                {priceLabel && (
                  <span
                    className={`font-black leading-none ${isLive ? 'text-red-700' : 'text-gray-950'}`}
                    style={{ fontSize: 'clamp(18px, 5.5vw, 24px)' }}
                  >
                    {priceLabel}
                  </span>
                )}
              </div>
              <div
                className="flex items-center text-gray-500"
                style={{
                  marginTop: 'clamp(2px, 0.5vw, 4px)',
                  gap: 'clamp(3px, 0.8vw, 6px)',
                  fontSize: 'clamp(9px, 2.2vw, 11px)',
                }}
              >
                <ShieldCheck style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }} />
                6 months warranty
              </div>
            </div>

            <button
              type="button"
              className={`inline-flex items-center font-bold transition-all border ${
                isSelected
                  ? isLive
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-teal-700 border-teal-500 hover:bg-teal-50'
              }`}
              style={{
                gap: 'clamp(4px, 1vw, 6px)',
                padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 3vw, 16px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(11px, 2.8vw, 14px)',
              }}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

/* ─────────────────────────── Main Component ─────────────────────────── */

export const IssueSelection: React.FC<StepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>(formData.issue ? [formData.issue] : []);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedCountRef = useRef(selectedIssues.length);

  const liveIssues = issues.filter((i) => i.category === 'live');
  const otherIssues = issues.filter((i) => i.category === 'other');

  const liveCards = useMemo(
    () =>
      liveIssues.map((issue) => {
        const pricing = formData.brand ? getPriceForRepair(formData.brand.id, formData.model, issue.id) : null;
        return { issue, pricing, priceLabel: formatMoney(pricing), strikePrice: getStrikePrice(pricing) };
      }),
    [formData.brand, formData.model, liveIssues],
  );

  const otherCards = useMemo(
    () =>
      otherIssues.map((issue) => {
        const pricing = formData.brand ? getPriceForRepair(formData.brand.id, formData.model, issue.id) : null;
        return { issue, pricing, priceLabel: formatMoney(pricing), strikePrice: getStrikePrice(pricing) };
      }),
    [formData.brand, formData.model, otherIssues],
  );

  const selectedPricingDetails = useMemo(() => {
    if (!formData.brand) return [];
    return selectedIssues.map((issue) => {
      const pricing = getPriceForRepair(formData.brand!.id, formData.model, issue.id);
      return { issue, pricing, price: getNumericPrice(pricing), oldPrice: getNumericOldPrice(pricing) };
    });
  }, [formData.brand, formData.model, selectedIssues]);

  const totalPrice = selectedPricingDetails.reduce((sum, item) => sum + item.price, 0);
  const totalOldPrice = selectedPricingDetails.reduce((sum, item) => sum + item.oldPrice, 0);

  useEffect(() => {
    const wasEmpty = prevSelectedCountRef.current === 0;
    const nowHasSelection = selectedIssues.length > 0;
    if (wasEmpty && nowHasSelection) {
      requestAnimationFrame(() => {
        actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    prevSelectedCountRef.current = selectedIssues.length;
  }, [selectedIssues.length]);

  const handleToggle = (issue: Issue) => {
    setSelectedIssues((prev) => {
      const exists = prev.some((i) => i.id === issue.id);
      return exists ? prev.filter((i) => i.id !== issue.id) : [...prev, issue];
    });
  };

  const handleContinue = () => {
    if (!selectedIssues.length || !formData.brand) return;
    const breakdown = selectedPricingDetails.map((item) => ({
      id: item.issue.id,
      name: item.issue.name,
      time: item.issue.time,
      price: item.price,
      oldPrice: item.oldPrice,
    }));
    const combinedPricing = {
      name: selectedIssues.map((i) => i.name).join(' + '),
      time: selectedIssues.length === 1 ? selectedIssues[0].time : `${selectedIssues.length} repairs selected`,
      price: totalPrice,
      oldPrice: totalOldPrice > totalPrice ? totalOldPrice : undefined,
      breakdown,
    };
    updateFormData({ issue: selectedIssues[0], issues: selectedIssues, pricing: combinedPricing } as any);
    goToNextStep();
  };

  const hasLiveSelected = selectedIssues.some((s) => s.category === 'live');

  return (
    <div
      className="border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fd_100%)] overflow-hidden"
      style={{
        borderRadius: 'clamp(16px, 5vw, 30px)',
        boxShadow: '0 22px 70px rgba(15,23,42,0.08)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80"
        style={{ padding: 'clamp(14px, 4vw, 24px) clamp(14px, 4vw, 24px) clamp(12px, 3vw, 20px)' }}
      >
        <div className="flex items-start justify-between" style={{ gap: 'clamp(8px, 3vw, 16px)' }}>
          <div className="min-w-0">
            <div
              className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-700"
              style={{
                gap: 'clamp(4px, 1vw, 8px)',
                padding: 'clamp(3px, 0.6vw, 4px) clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(9px, 2.2vw, 11px)',
              }}
            >
              <span
                className="rounded-full bg-slate-500 animate-pulse"
                style={{ width: 'clamp(4px, 1vw, 6px)', height: 'clamp(4px, 1vw, 6px)', flexShrink: 0 }}
              />
              Step 3 of 4
            </div>
            <h2
              className="font-black tracking-tight text-gray-950"
              style={{
                marginTop: 'clamp(6px, 1.5vw, 12px)',
                fontSize: 'clamp(20px, 6vw, 28px)',
              }}
            >
              Live Repairs
            </h2>
            <p
              className="text-gray-500 truncate"
              style={{
                marginTop: 'clamp(2px, 0.5vw, 4px)',
                fontSize: 'clamp(11px, 2.8vw, 14px)',
              }}
            >
              {formData.brand?.name} {formData.model}
            </p>
          </div>

          <button
            className="font-semibold text-teal-600 hover:text-teal-700 transition-colors shrink-0"
            style={{ fontSize: 'clamp(11px, 2.8vw, 14px)' }}
          >
            View Details
          </button>
        </div>

        <div
          className="flex flex-wrap items-center"
          style={{
            marginTop: 'clamp(8px, 2.5vw, 16px)',
            gap: 'clamp(4px, 1.5vw, 12px)',
          }}
        >
          <IssuePill label="60 Mins Repair" />
          <IssuePill label="Live Stream" tone="live" />
          <IssuePill label="Original Grade Part" />
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          padding: 'clamp(12px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px, 4vw, 24px)',
        }}
      >
        {/* LIVE repairs */}
        <section>
          <div
            className="flex flex-wrap items-center justify-between"
            style={{ marginBottom: 'clamp(8px, 2vw, 12px)', gap: 'clamp(6px, 2vw, 12px)' }}
          >
            <div className="flex items-center min-w-0" style={{ gap: 'clamp(8px, 2.5vw, 12px)' }}>
              <div
                className="bg-red-500 flex items-center justify-center shrink-0"
                style={{
                  width: 'clamp(34px, 9vw, 44px)',
                  height: 'clamp(34px, 9vw, 44px)',
                  borderRadius: 'clamp(10px, 2.5vw, 16px)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                }}
              >
                <Video
                  className="text-white"
                  style={{ width: 'clamp(14px, 3.5vw, 20px)', height: 'clamp(14px, 3.5vw, 20px)' }}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="font-black text-gray-950 leading-none"
                  style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
                >
                  LIVE Repairs
                </p>
                <p
                  className="text-gray-500"
                  style={{
                    marginTop: 'clamp(2px, 0.5vw, 4px)',
                    fontSize: 'clamp(9px, 2.2vw, 11px)',
                  }}
                >
                  Watch your device being repaired in real time
                </p>
              </div>
            </div>

            <div
              className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold"
              style={{
                gap: 'clamp(4px, 1vw, 8px)',
                padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(9px, 2.2vw, 12px)',
              }}
            >
              <Zap style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }} />
              Fast turnaround
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)' }}>
            {liveCards.map(({ issue, priceLabel, strikePrice }, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <IssueRow
                  issue={issue}
                  isLive
                  isSelected={selectedIssues.some((s) => s.id === issue.id)}
                  priceLabel={priceLabel}
                  strikePrice={strikePrice}
                  onSelect={() => handleToggle(issue)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
          <div
            className="relative mx-auto w-fit rounded-full border border-gray-200 bg-white font-black uppercase tracking-[0.18em] text-gray-500"
            style={{
              padding: 'clamp(3px, 0.6vw, 4px) clamp(10px, 3vw, 16px)',
              fontSize: 'clamp(8px, 2vw, 11px)',
            }}
          >
            Standard Repairs
          </div>
        </div>

        {/* Standard repairs */}
        <section>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 'clamp(8px, 2vw, 12px)', gap: 'clamp(6px, 2vw, 12px)' }}
          >
            <p
              className="font-black text-gray-950"
              style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
            >
              Other Repairs
            </p>
            <span
              className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 font-bold text-gray-600"
              style={{
                gap: 'clamp(4px, 1vw, 6px)',
                padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(9px, 2.2vw, 11px)',
              }}
            >
              <Clock3 style={{ width: 'clamp(10px, 2.5vw, 14px)', height: 'clamp(10px, 2.5vw, 14px)' }} />
              2–5 hours
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)' }}>
            {otherCards.map(({ issue, priceLabel, strikePrice }, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.12 }}
              >
                <IssueRow
                  issue={issue}
                  isSelected={selectedIssues.some((s) => s.id === issue.id)}
                  priceLabel={priceLabel}
                  strikePrice={strikePrice}
                  onSelect={() => handleToggle(issue)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Selected preview */}
        <AnimatePresence>
          {selectedIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`overflow-hidden border shadow-sm ${
                hasLiveSelected
                  ? 'border-red-100 bg-gradient-to-r from-red-50 to-orange-50'
                  : 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}
              style={{
                borderRadius: 'clamp(14px, 4vw, 24px)',
                padding: 'clamp(10px, 3vw, 16px)',
              }}
            >
              <div className="flex items-start" style={{ gap: 'clamp(8px, 2.5vw, 12px)' }}>
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    hasLiveSelected ? 'bg-red-500 shadow-red-200' : 'bg-blue-600 shadow-blue-200'
                  }`}
                  style={{
                    width: 'clamp(34px, 9vw, 44px)',
                    height: 'clamp(34px, 9vw, 44px)',
                    borderRadius: 'clamp(10px, 2.5vw, 16px)',
                    boxShadow: hasLiveSelected
                      ? '0 4px 12px rgba(239,68,68,0.3)'
                      : '0 4px 12px rgba(59,130,246,0.3)',
                  }}
                >
                  <CheckCircle2
                    className="text-white"
                    style={{ width: 'clamp(14px, 3.5vw, 20px)', height: 'clamp(14px, 3.5vw, 20px)' }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold ${hasLiveSelected ? 'text-red-500' : 'text-blue-500'}`}
                    style={{ fontSize: 'clamp(9px, 2.2vw, 12px)' }}
                  >
                    Selected Repairs
                  </p>
                  <p
                    className={`font-black truncate ${hasLiveSelected ? 'text-red-900' : 'text-blue-900'}`}
                    style={{
                      marginTop: 'clamp(2px, 0.5vw, 4px)',
                      fontSize: 'clamp(12px, 3.2vw, 15px)',
                    }}
                  >
                    {selectedIssues.map((s) => s.name).join(', ')}
                  </p>
                  <div
                    className="flex flex-wrap"
                    style={{ marginTop: 'clamp(4px, 1vw, 8px)', gap: 'clamp(4px, 1vw, 8px)' }}
                  >
                    {selectedIssues.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-full bg-white/80 border border-black/5 font-semibold text-gray-700"
                        style={{
                          padding: 'clamp(3px, 0.6vw, 4px) clamp(7px, 1.8vw, 10px)',
                          fontSize: 'clamp(9px, 2.2vw, 11px)',
                        }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold ${hasLiveSelected ? 'text-red-500' : 'text-blue-500'}`}
                    style={{ fontSize: 'clamp(9px, 2.2vw, 12px)' }}
                  >
                    Total Amount
                  </p>
                  <p
                    className={`font-black ${hasLiveSelected ? 'text-red-800' : 'text-blue-800'}`}
                    style={{
                      fontSize: 'clamp(15px, 4vw, 20px)',
                    }}
                  >
                    {formatMoney(totalPrice) || '₹0'}
                  </p>
                  {totalOldPrice > totalPrice && (
                    <p
                      className="text-gray-500 line-through"
                      style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                    >
                      {formatMoney(totalOldPrice)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div
          ref={actionsRef}
          className="flex"
          style={{ gap: 'clamp(8px, 2vw, 12px)', paddingTop: 'clamp(2px, 0.5vw, 4px)' }}
        >
          <button
            onClick={goToPreviousStep}
            className="flex items-center border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all shadow-sm"
            style={{
              gap: 'clamp(4px, 1vw, 6px)',
              padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3.5vw, 20px)',
              borderRadius: 'clamp(12px, 3vw, 18px)',
              fontSize: 'clamp(11px, 2.8vw, 14px)',
            }}
            data-testid="back-button"
          >
            <ChevronLeft style={{ width: 'clamp(12px, 3vw, 16px)', height: 'clamp(12px, 3vw, 16px)' }} />
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedIssues.length}
            className={`flex-1 font-bold transition-all shadow-sm active:scale-[0.99] ${
              selectedIssues.length
                ? hasLiveSelected
                  ? 'text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-200'
                  : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={{
              padding: 'clamp(10px, 2.5vw, 14px)',
              borderRadius: 'clamp(12px, 3vw, 18px)',
              fontSize: 'clamp(11px, 2.8vw, 14px)',
            }}
            data-testid="continue-button"
          >
            {selectedIssues.length ? 'Continue' : 'Select an issue to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};