import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, ShieldCheck, Sparkles, Video, Zap, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { issues, getPriceForRepair } from '../../data/mockData';
import type { StepProps, Issue } from '../../types';

const formatMoney = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.startsWith('₹') ? value : `₹${value}`;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.currentPrice ?? obj.price ?? obj.amount ?? obj.finalPrice ?? obj.value;

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return `₹${Math.round(candidate).toLocaleString('en-IN')}`;
    }

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.startsWith('₹') ? candidate : `₹${candidate}`;
    }
  }

  return null;
};

const getStrikePrice = (value: unknown): string | null => {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.oldPrice ?? obj.mrp ?? obj.regularPrice ?? obj.originalPrice;

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return `₹${Math.round(candidate).toLocaleString('en-IN')}`;
    }

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.startsWith('₹') ? candidate : `₹${candidate}`;
    }
  }

  return null;
};

const getNumericPrice = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.currentPrice ?? obj.price ?? obj.amount ?? obj.finalPrice ?? obj.value;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === 'string') {
      const parsed = Number(candidate.replace(/[^\d.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getNumericOldPrice = (value: unknown): number => {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.oldPrice ?? obj.mrp ?? obj.regularPrice ?? obj.originalPrice;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === 'string') {
      const parsed = Number(candidate.replace(/[^\d.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }

  return 0;
};

const iconMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

const IssuePill: React.FC<{ label: string; tone?: 'live' | 'default' }> = ({ label, tone = 'default' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
      tone === 'live'
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}
  >
    {tone === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    {label}
  </span>
);

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
      className={`group w-full text-left rounded-[24px] border p-4 sm:p-5 transition-all ${
        isSelected
          ? isLive
            ? 'border-red-200 bg-gradient-to-br from-red-50 via-white to-orange-50 shadow-[0_14px_34px_rgba(239,68,68,0.10)]'
            : 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-[0_14px_34px_rgba(59,130,246,0.10)]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]'
      }`}
      data-testid={`issue-option-${issue.id}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative shrink-0">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm ${
              isSelected
                ? isLive
                  ? 'bg-red-500 border-red-200'
                  : 'bg-blue-600 border-blue-200'
                : 'bg-white border-gray-200'
            }`}
          >
            {Icon ? (
              <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
            ) : (
              <Icons.CircleDashed className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            )}
          </div>

          {isLive && (
            <span className="absolute -top-2 -left-2">
              <IssuePill label="LIVE" tone="live" />
            </span>
          )}

          {isSelected && (
            <div
              className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                isLive ? 'bg-red-500' : 'bg-blue-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`text-[15px] sm:text-base font-black leading-tight truncate ${
                  isSelected ? (isLive ? 'text-red-900' : 'text-blue-900') : 'text-gray-950'
                }`}
              >
                {issue.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" /> {issue.time}
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold">
                    <Video className="w-3.5 h-3.5" /> Live stream
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-gray-500' : 'text-gray-300'}`} />
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {strikePrice && <span className="text-xs text-gray-400 line-through">{strikePrice}</span>}
                {priceLabel && (
                  <span className={`text-2xl font-black leading-none ${isLive ? 'text-red-700' : 'text-gray-950'}`}>
                    {priceLabel}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5" /> 6 months warranty
              </div>
            </div>

            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                isSelected
                  ? isLive
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-teal-700 border-teal-500 hover:bg-teal-50'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

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
        return {
          issue,
          pricing,
          priceLabel: formatMoney(pricing),
          strikePrice: getStrikePrice(pricing),
        };
      }),
    [formData.brand, formData.model, liveIssues],
  );

  const otherCards = useMemo(
    () =>
      otherIssues.map((issue) => {
        const pricing = formData.brand ? getPriceForRepair(formData.brand.id, formData.model, issue.id) : null;
        return {
          issue,
          pricing,
          priceLabel: formatMoney(pricing),
          strikePrice: getStrikePrice(pricing),
        };
      }),
    [formData.brand, formData.model, otherIssues],
  );

  const selectedPricingDetails = useMemo(() => {
    if (!formData.brand) return [];

    return selectedIssues.map((issue) => {
      const pricing = getPriceForRepair(formData.brand!.id, formData.model, issue.id);
      return {
        issue,
        pricing,
        price: getNumericPrice(pricing),
        oldPrice: getNumericOldPrice(pricing),
      };
    });
  }, [formData.brand, formData.model, selectedIssues]);

  const totalPrice = selectedPricingDetails.reduce((sum, item) => sum + item.price, 0);
  const totalOldPrice = selectedPricingDetails.reduce((sum, item) => sum + item.oldPrice, 0);

  useEffect(() => {
    const wasEmpty = prevSelectedCountRef.current === 0;
    const nowHasSelection = selectedIssues.length > 0;

    if (wasEmpty && nowHasSelection) {
      requestAnimationFrame(() => {
        actionsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }

    prevSelectedCountRef.current = selectedIssues.length;
  }, [selectedIssues.length]);

  const handleToggle = (issue: Issue) => {
    setSelectedIssues((prev) => {
      const exists = prev.some((i) => i.id === issue.id);
      if (exists) return prev.filter((i) => i.id !== issue.id);
      return [...prev, issue];
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

    updateFormData({
      issue: selectedIssues[0],
      issues: selectedIssues,
      pricing: combinedPricing,
    } as any);

    goToNextStep();
  };

  return (
    <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fd_100%)] shadow-[0_22px_70px_rgba(15,23,42,0.08)] overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-6 pb-5 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" /> Step 3 of 4
            </div>
            <h2 className="mt-3 text-[28px] font-black tracking-tight text-gray-950">Live Repairs</h2>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {formData.brand?.name} {formData.model}
            </p>
          </div>

          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors shrink-0">
            View Details
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <IssuePill label="60 Mins Repair" />
          <IssuePill label="Live Stream" tone="live" />
          <IssuePill label="Original Grade Part" />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* LIVE repairs */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center shadow-md shadow-red-200 shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-950 leading-none">LIVE Repairs</p>
                <p className="mt-1 text-[11px] text-gray-500">Watch your device being repaired in real time</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" /> Fast turnaround
            </div>
          </div>

          <div className="space-y-3">
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
          <div className="relative mx-auto w-fit rounded-full border border-gray-200 bg-white px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
            Standard Repairs
          </div>
        </div>

        {/* Standard repairs */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-gray-950">Other Repairs</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600">
              <Clock3 className="w-3.5 h-3.5" /> 2–5 hours
            </span>
          </div>

          <div className="space-y-3">
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
              className={`overflow-hidden rounded-[24px] border px-4 py-4 shadow-sm ${
                selectedIssues.some((s) => s.category === 'live')
                  ? 'border-red-100 bg-gradient-to-r from-red-50 to-orange-50'
                  : 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    selectedIssues.some((s) => s.category === 'live')
                      ? 'bg-red-500 shadow-red-200'
                      : 'bg-blue-600 shadow-blue-200'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      selectedIssues.some((s) => s.category === 'live') ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    Selected Repairs
                  </p>
                  <p
                    className={`mt-0.5 text-sm sm:text-base font-black truncate ${
                      selectedIssues.some((s) => s.category === 'live') ? 'text-red-900' : 'text-blue-900'
                    }`}
                  >
                    {selectedIssues.map((s) => s.name).join(', ')}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedIssues.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-full bg-white/80 border border-black/5 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-semibold ${
                      selectedIssues.some((s) => s.category === 'live') ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    Total Amount
                  </p>
                  <p
                    className={`text-lg font-black ${
                      selectedIssues.some((s) => s.category === 'live') ? 'text-red-800' : 'text-blue-800'
                    }`}
                  >
                    {formatMoney(totalPrice) || '₹0'}
                  </p>
                  {totalOldPrice > totalPrice && (
                    <p className="text-[11px] text-gray-500 line-through">{formatMoney(totalOldPrice)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div ref={actionsRef} className="flex gap-3 pt-1">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-1.5 px-5 py-3.5 rounded-[18px] border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-all shadow-sm"
            data-testid="back-button"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedIssues.length}
            className={`flex-1 py-3.5 rounded-[18px] font-bold text-sm transition-all shadow-sm active:scale-[0.99] ${
              selectedIssues.length
                ? selectedIssues.some((s) => s.category === 'live')
                  ? 'text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-200'
                  : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            data-testid="continue-button"
          >
            {selectedIssues.length ? `Continue` : 'Select an issue to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};