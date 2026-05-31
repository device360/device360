/**
 * ModelSelection.tsx — Static data version (no Firebase dependency)
 *
 * CHANGES:
 *  - Removed useFirebaseData() hook
 *  - Models come directly from STATIC_BRANDS imported from BrandSelection
 *  - Brand logo shown for every model row instead of phone image thumbnails
 *  - No loading state / no error state needed — data is instant
 *  - Everything else (UI, animations, interactions) kept the same
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATIC_BRANDS } from './BrandSelection';
import type { StepProps } from '../../types';

// ── Brand colour map (cosmetic) ────────────────────────────────────
const BRAND_COLORS: Record<string, string> = {
  apple: '#1d1d1f',
  samsung: '#1428A0',
  oneplus: '#eb0029',
  xiaomi: '#ff6900',
  vivo: '#415fff',
  oppo: '#1d7d52',
  realme: '#f5a623',
  motorola: '#E1140A',
  pixel: '#4285F4',
  poco: '#f5d20a',
  iqoo: '#5b30e9',
  nothing: '#111111',
  nokia: '#124191',
  honor: '#CF0A2C',
  tecno: '#007fff',
};

// ── Brand logo thumbnails ──────────────────────────────────────────
const BRAND_LOGOS: Record<
  string,
  {
    bg: string;
    selectedBg: string;
    render: (selected: boolean) => ReactNode;
  }
> = {
  apple: {
    bg: '#f5f5f7',
    selectedBg: '#1d1d1f',
    render: (selected) => (
      <svg viewBox="0 0 170 170" className="w-7 h-7" fill={selected ? '#ffffff' : '#1d1d1f'}>
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.241z" />
      </svg>
    ),
  },

  samsung: {
    bg: '#e8edf8',
    selectedBg: '#1428A0',
    render: (selected) => (
      <svg viewBox="0 0 300 60" className="w-16 h-6">
        <text
          x="150"
          y="48"
          textAnchor="middle"
          fontFamily="'Samsung Sharp Sans', 'Arial Black', sans-serif"
          fontWeight="700"
          fontSize="52"
          letterSpacing="-1"
          fill={selected ? '#ffffff' : '#1428A0'}
        >
          SAMSUNG
        </text>
      </svg>
    ),
  },

  oneplus: {
    bg: '#fff5f5',
    selectedBg: '#eb0029',
    render: (selected) => (
      <svg viewBox="0 0 64 64" className="w-8 h-8" aria-label="OnePlus logo">
        <rect
          x="8"
          y="8"
          width="42"
          height="42"
          fill="none"
          stroke={selected ? '#ffffff' : '#eb0029'}
          strokeWidth="5"
        />
        <text
          x="28"
          y="39"
          textAnchor="middle"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="26"
          fill={selected ? '#ffffff' : '#eb0029'}
        >
          1
        </text>
        <rect x="40" y="8" width="6" height="18" fill={selected ? '#ffffff' : '#eb0029'} />
        <rect x="34" y="14" width="18" height="6" fill={selected ? '#ffffff' : '#eb0029'} />
      </svg>
    ),
  },

  xiaomi: {
    bg: '#fff4ec',
    selectedBg: '#ff6900',
    render: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="10" fill="#ff6900" />
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="22"
          letterSpacing="1"
          fill="#ffffff"
        >
          MI
        </text>
      </svg>
    ),
  },

  realme: {
    bg: '#FFF5BF',
    selectedBg: '#FFD400',
    render: () => (
      <span
        className="font-black tracking-tight lowercase leading-none text-gray-900"
        style={{ fontSize: '0.95rem', letterSpacing: '-0.04em' }}
      >
        realme
      </span>
    ),
  },

  pixel: {
    bg: '#e8f0fe',
    selectedBg: '#4285F4',
    render: (selected) => (
      <svg viewBox="0 0 24 24" className="w-7 h-7">
        {selected ? (
          <path
            fill="#ffffff"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          />
        ) : (
          <>
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
          </>
        )}
      </svg>
    ),
  },

  vivo: {
    bg: '#eef1ff',
    selectedBg: '#415FFF',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-14 h-7">
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontFamily="'Arial', sans-serif"
          fontWeight="700"
          fontSize="52"
          letterSpacing="2"
          fill={selected ? '#ffffff' : '#415FFF'}
        >
          vivo
        </text>
      </svg>
    ),
  },

  oppo: {
    bg: '#edf5f0',
    selectedBg: '#1D7D52',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-14 h-7">
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontFamily="'Arial', sans-serif"
          fontWeight="700"
          fontSize="52"
          letterSpacing="1"
          fill={selected ? '#ffffff' : '#1D7D52'}
        >
          OPPO
        </text>
      </svg>
    ),
  },

  motorola: {
    bg: '#feefef',
    selectedBg: '#E1140A',
    render: (selected) => (
      <svg viewBox="0 0 64 64" className="w-8 h-8" aria-label="Motorola logo">
        <circle cx="32" cy="32" r="26" fill={selected ? '#ffffff' : '#E1140A'} />
        <path d="M20 42V22l12 11 12-11v20h-5V32l-7 6-7-6v10z" fill={selected ? '#E1140A' : '#ffffff'} />
      </svg>
    ),
  },

  poco: {
    bg: '#FFD000',
    selectedBg: '#FFD000',
    render: () => (
      <svg viewBox="0 0 64 64" className="w-8 h-8">
        <rect width="64" height="64" rx="14" fill="#FFD000" />
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', sans-serif"
          fontWeight="900"
          fontSize="24"
          letterSpacing="-0.5"
          fill="#111111"
        >
          POCO
        </text>
      </svg>
    ),
  },

  iqoo: {
    bg: '#f0ecfd',
    selectedBg: '#5b30e9',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-14 h-7">
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="50"
          fill={selected ? '#ffffff' : '#5b30e9'}
        >
          iQOO
        </text>
      </svg>
    ),
  },

  nothing: {
    bg: '#f5f5f5',
    selectedBg: '#111111',
    render: (selected) => (
      <svg viewBox="0 0 56 56" className="w-8 h-8">
        <rect width="56" height="56" rx="12" fill={selected ? '#111111' : '#f5f5f5'} />
        {[
          [10, 10], [10, 18], [10, 26], [10, 34], [10, 42],
          [18, 18],
          [26, 26],
          [34, 34],
          [42, 10], [42, 18], [42, 26], [42, 34], [42, 42],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.8" fill={selected ? '#ffffff' : '#111111'} />
        ))}
      </svg>
    ),
  },

  nokia: {
    bg: '#e8edf8',
    selectedBg: '#124191',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-14 h-7">
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontFamily="'Arial', sans-serif"
          fontWeight="700"
          fontSize="50"
          letterSpacing="2"
          fill={selected ? '#ffffff' : '#124191'}
        >
          NOKIA
        </text>
      </svg>
    ),
  },

  honor: {
    bg: '#f7fbff',
    selectedBg: '#ffffff',
    render: () => (
      <svg viewBox="0 0 260 90" className="w-16 h-8" aria-label="Honor logo">
        <text
          x="130"
          y="58"
          textAnchor="middle"
          fontFamily="'Aptos', 'Arial Rounded MT Bold', 'Segoe UI', sans-serif"
          fontWeight="700"
          fontSize="48"
          letterSpacing="-1.5"
          fill="#28a8e0"
        >
          honor
        </text>
      </svg>
    ),
  },

  tecno: {
    bg: '#e6f3ff',
    selectedBg: '#007fff',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-14 h-7">
        <text
          x="100"
          y="46"
          textAnchor="middle"
          fontFamily="'Arial', sans-serif"
          fontWeight="700"
          fontSize="48"
          letterSpacing="1"
          fill={selected ? '#ffffff' : '#007fff'}
        >
          TECNO
        </text>
      </svg>
    ),
  },
};

const getBrandLogo = (brandId: string) => BRAND_LOGOS[brandId.toLowerCase()];

const BrandLogoThumb: React.FC<{ brandId: string; brandName: string; selected?: boolean }> = ({
  brandId,
  brandName,
  selected = false,
}) => {
  const logo = getBrandLogo(brandId);

  if (!logo) {
    return (
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm"
        style={{
          backgroundColor: selected ? '#111827' : '#f3f4f6',
          color: selected ? '#fff' : '#6b7280',
        }}
      >
        {brandName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 overflow-hidden"
      style={{ backgroundColor: selected ? logo.selectedBg : logo.bg }}
    >
      {logo.render(selected)}
    </div>
  );
};

const BrandChip: React.FC<{ brandName?: string }> = ({ brandName }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-700">
      {brandName?.slice(0, 1).toUpperCase() ?? '•'}
    </span>
    <span className="truncate max-w-[140px]">{brandName ?? 'Brand'}</span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────
export const ModelSelection: React.FC<StepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(formData.model || '');
  const [query, setQuery] = useState('');

  // Auto-scroll on mount
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const id = window.setTimeout(() => {
      const scrollContainer =
        (el.closest('[data-scroll-container]') as HTMLElement | null) ||
        (document.scrollingElement as HTMLElement | null) ||
        document.documentElement;

      if (scrollContainer instanceof HTMLElement) {
        const targetTop =
          el.getBoundingClientRect().top +
          scrollContainer.scrollTop -
          scrollContainer.clientHeight * 0.18;

        scrollContainer.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
        return;
      }

      window.scrollTo({
        top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.18),
        behavior: 'smooth',
      });
    }, 250);

    return () => window.clearTimeout(id);
  }, []);

  // Find brand models from static data
  const currentBrand = STATIC_BRANDS.find((b) => b.id === formData.brand?.id);
  const availableModels = useMemo(() => currentBrand?.models ?? [], [currentBrand]);
  const filteredModels = availableModels.filter((m) => m.toLowerCase().includes(query.toLowerCase()));
  const brandColor = BRAND_COLORS[(formData.brand?.id ?? '').toLowerCase()] ?? '#6366f1';

  const handleContinue = () => {
    if (!selected) return;
    updateFormData({ model: selected, issue: null, pricing: null });
    goToNextStep();
  };

  return (
    <div
      ref={sectionRef}
      className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f7fb_100%)] rounded-[28px] border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100/80 bg-white/70 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-600 tracking-wide">Step 2 of 4</span>
        </div>
        <div className="flex items-center justify-center mb-3">
          <BrandChip brandName={formData.brand?.name} />
        </div>
        <h2 className="text-[28px] font-black tracking-tight text-gray-950">Select Your Model</h2>
        <p className="mt-1 text-sm text-gray-500">Choose the exact device for repair support</p>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${formData.brand?.name ?? ''} models…`}
            className="w-full pl-11 pr-4 py-3.5 rounded-[18px] border border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Model list */}
        <div className="rounded-[24px] border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredModels.map((model, i) => {
                const isSelected = selected === model;
                const pro = /pro|ultra|max|plus|fold/i.test(model);
                const compact = /mini|se|lite|\bc\b|\ba\b/i.test(model);

                return (
                  <motion.button
                    key={model}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: i * 0.012, type: 'spring', stiffness: 320, damping: 28 }}
                    onClick={() => {
                      setSelected(model);
                      updateFormData({ model, issue: null, pricing: null });
                      goToNextStep();
                    }}
                    className={`w-full px-4 sm:px-5 py-3.5 flex items-center gap-4 text-left transition-all border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50/80' : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    data-testid={`model-option-${model.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {/* Thumbnail: brand logo */}
                    <div className="shrink-0 relative">
                      <BrandLogoThumb
                        brandId={formData.brand?.id ?? ''}
                        brandName={formData.brand?.name ?? 'Brand'}
                        selected={isSelected}
                      />
                      {pro && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[7px] font-black text-amber-900 shadow-sm">
                          P
                        </span>
                      )}
                      {compact && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-400 border border-white flex items-center justify-center text-[7px] font-black text-white shadow-sm">
                          S
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-base font-semibold leading-tight truncate ${
                          isSelected ? 'text-blue-800' : 'text-gray-900'
                        }`}
                      >
                        {model}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                        {formData.brand?.name} · Tap to select
                      </p>
                    </div>

                    {/* Check / chevron */}
                    <div className="shrink-0 flex items-center gap-3">
                      {isSelected ? (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: brandColor }}
                        >
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {filteredModels.length === 0 && (
              <div className="py-10 text-center text-gray-500">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium">No models match "{query}"</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected banner */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[22px] border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-500">Selected Device</p>
                <p className="text-sm font-bold text-blue-900 truncate">
                  {formData.brand?.name} {selected}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={goToPreviousStep}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-[18px] border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-all shadow-sm"
            data-testid="back-button"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`flex-1 py-3.5 rounded-[18px] font-bold text-sm transition-all shadow-sm ${
              selected
                ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            data-testid="continue-button"
          >
            {selected ? 'Continue' : 'Select a model to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};