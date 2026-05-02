import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { brands } from '../../data/mockData';
import type { StepProps } from '../../types';

const REAL_MODELS: Record<string, string[]> = {
  apple: [
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16 Plus',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15 Plus',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14',
    'iPhone SE (3rd gen)',
  ],
  samsung: [
    'Galaxy S25 Ultra',
    'Galaxy S25+',
    'Galaxy S25',
    'Galaxy Z Fold6',
    'Galaxy Z Flip6',
    'Galaxy A55 5G',
    'Galaxy A35 5G',
    'Galaxy A25 5G',
    'Galaxy M35 5G',
    'Galaxy M55 5G',
  ],
  oneplus: [
    'OnePlus 13',
    'OnePlus 13R',
    'OnePlus 12',
    'OnePlus 12R',
    'OnePlus Open',
    'OnePlus Nord 4',
    'OnePlus Nord CE 4',
    'OnePlus Nord CE 4 Lite',
  ],
  xiaomi: [
    'Xiaomi 15 Ultra',
    'Xiaomi 15',
    'Xiaomi 14 Ultra',
    'Xiaomi 14',
    'Redmi Note 14 Pro+',
    'Redmi Note 14 Pro',
    'Redmi Note 14',
    'Redmi 13C',
    'POCO X7 Pro',
    'POCO X7',
    'POCO M7 Pro',
  ],
  realme: [
    'realme GT 7 Pro',
    'realme GT 7',
    'realme GT 7T',
    'realme 14 Pro+',
    'realme 14 Pro',
    'realme 13 Pro+',
    'realme 13 Pro',
    'realme 12 Pro+',
    'realme 12 Pro',
    'realme 12x 5G',
    'realme C75',
    'realme C65 5G',
    'realme P3 Pro',
    'realme P2 Pro',
    'realme Narzo 70 Turbo 5G',
  ],
  pixel: [
    'Pixel 10 Pro Fold',
    'Pixel 10 Pro XL',
    'Pixel 10 Pro',
    'Pixel 10',
    'Pixel 9 Pro Fold',
    'Pixel 9 Pro XL',
    'Pixel 9 Pro',
    'Pixel 9',
    'Pixel 9a',
    'Pixel 8 Pro',
    'Pixel 8',
    'Pixel 8a',
    'Pixel 7 Pro',
    'Pixel 7',
    'Pixel 7a',
    'Pixel Fold',
    'Pixel 6 Pro',
    'Pixel 6',
    'Pixel 6a',
  ],
  vivo: [
    'vivo X200 Pro',
    'vivo X200',
    'vivo X100 Pro',
    'vivo X100',
    'vivo V40 Pro',
    'vivo V40',
    'vivo V30 Pro',
    'vivo V30',
    'vivo T3 Ultra',
    'vivo T3 Pro',
    'vivo Y200 Pro',
  ],
  oppo: [
    'OPPO Find X8 Pro',
    'OPPO Find X8',
    'OPPO Find X7 Ultra',
    'OPPO Reno12 Pro 5G',
    'OPPO Reno12 5G',
    'OPPO Reno11 Pro 5G',
    'OPPO Reno11 5G',
    'OPPO F27 Pro+ 5G',
    'OPPO A3 Pro 5G',
    'OPPO A79 5G',
  ],
  motorola: [
    'motorola edge 50 ultra',
    'motorola edge 50 pro',
    'motorola edge 50 fusion',
    'motorola razr 50 ultra',
    'motorola razr 50',
    'motorola g85 5G',
    'motorola g64 5G',
    'motorola g54 5G',
    'motorola edge 40 neo',
  ],
  huawei: [
    'HUAWEI Pura 70 Ultra',
    'HUAWEI Pura 70 Pro',
    'HUAWEI Pura 70',
    'HUAWEI Mate X5',
    'HUAWEI nova 12 Pro',
    'HUAWEI nova 12',
    'HUAWEI Mate 60 Pro',
  ],
};

const BRAND_COLORS: Record<string, string> = {
  apple: '#1d1d1f',
  samsung: '#1428A0',
  oneplus: '#eb0029',
  xiaomi: '#ff6900',
  vivo: '#415fff',
  oppo: '#1d7d52',
  realme: '#f5a623',
  motorola: '#4356e0',
  pixel: '#4285F4',
  poco: '#f5d20a',
  iqoo: '#5b30e9',
  huawei: '#cf0a2c',
};

/*
  ─────────────────────────────────────────────────────────────────
  EXACT filename map: model display name → filename (no extension)
  Files live at:  /phone_images/{brandFolder}/{filename}.png
  Base URL:       /phone_images   (serve this folder as static assets)
  ─────────────────────────────────────────────────────────────────
*/
const MODEL_FILE_MAP: Record<string, Record<string, string>> = {
  apple: {
    'iPhone 16 Pro Max': 'iPhone_16_Pro_Max',
    'iPhone 16 Pro': 'iPhone_16_Pro',
    'iPhone 16 Plus': 'iPhone_16_Plus',
    'iPhone 16': 'iPhone_16',
    'iPhone 15 Pro Max': 'iPhone_15_Pro_Max',
    'iPhone 15 Pro': 'iPhone_15_Pro',
    'iPhone 15 Plus': 'iPhone_15_Plus',
    'iPhone 15': 'iPhone_15',
    'iPhone 14 Pro Max': 'iPhone_14_Pro_Max',
    'iPhone 14 Pro': 'iPhone_14_Pro',
    'iPhone 14': 'iPhone_14',
    'iPhone SE (3rd gen)': 'iPhone_SE_(3rd_gen)',
  },
  samsung: {
    'Galaxy S25 Ultra': 'Galaxy_S25_Ultra',
    'Galaxy S25+': 'Galaxy_S25Plus',
    'Galaxy S25': 'Galaxy_S25',
    'Galaxy Z Fold6': 'Galaxy_Z_Fold6',
    'Galaxy Z Flip6': 'Galaxy_Z_Flip6',
    'Galaxy A55 5G': 'Galaxy_A55_5G',
    'Galaxy A35 5G': 'Galaxy_A35_5G',
    'Galaxy A25 5G': 'Galaxy_A25_5G',
    'Galaxy M35 5G': 'Galaxy_M35_5G',
    'Galaxy M55 5G': 'Galaxy_M55_5G',
  },
  oneplus: {
    'OnePlus 13': 'OnePlus_13',
    'OnePlus 13R': 'OnePlus_13R',
    'OnePlus 12': 'OnePlus_12',
    'OnePlus 12R': 'OnePlus_12R',
    'OnePlus Open': 'OnePlus_Open',
    'OnePlus Nord 4': 'OnePlus_Nord_4',
    'OnePlus Nord CE 4': 'OnePlus_Nord_CE_4',
    'OnePlus Nord CE 4 Lite': 'OnePlus_Nord_CE_4_Lite',
  },
  xiaomi: {
    'Xiaomi 15 Ultra': 'Xiaomi_15_Ultra',
    'Xiaomi 15': 'Xiaomi_15',
    'Xiaomi 14 Ultra': 'Xiaomi_14_Ultra',
    'Xiaomi 14': 'Xiaomi_14',
    'Redmi Note 14 Pro+': 'Redmi_Note_14_ProPlus',
    'Redmi Note 14 Pro': 'Redmi_Note_14_Pro',
    'Redmi Note 14': 'Redmi_Note_14',
    'Redmi 13C': 'Redmi_13C',
    'POCO X7 Pro': 'POCO_X7_Pro',
    'POCO X7': 'POCO_X7',
    'POCO M7 Pro': 'POCO_M7_Pro',
  },
  realme: {
    'realme GT 7 Pro': 'realme_GT_7_Pro',
    'realme GT 7': 'realme_GT_7',
    'realme GT 7T': 'realme_GT_7T',
    'realme 14 Pro+': 'realme_14_ProPlus',
    'realme 14 Pro': 'realme_14_Pro',
    'realme 13 Pro+': 'realme_13_ProPlus',
    'realme 13 Pro': 'realme_13_Pro',
    'realme 12 Pro+': 'realme_12_ProPlus',
    'realme 12 Pro': 'realme_12_Pro',
    'realme 12x 5G': 'realme_12x_5G',
    'realme C75': 'realme_C75',
    'realme C65 5G': 'realme_C65_5G',
    'realme P3 Pro': 'realme_P3_Pro',
    'realme P2 Pro': 'realme_P2_Pro',
    'realme Narzo 70 Turbo 5G': 'realme_Narzo_70_Turbo_5G',
  },
  pixel: {
    'Pixel 10 Pro Fold': 'Pixel_10_Pro_Fold',
    'Pixel 10 Pro XL': 'Pixel_10_Pro_XL',
    'Pixel 10 Pro': 'Pixel_10_Pro',
    'Pixel 10': 'Pixel_10',
    'Pixel 9 Pro Fold': 'Pixel_9_Pro_Fold',
    'Pixel 9 Pro XL': 'Pixel_9_Pro_XL',
    'Pixel 9 Pro': 'Pixel_9_Pro',
    'Pixel 9': 'Pixel_9',
    'Pixel 9a': 'Pixel_9a',
    'Pixel 8 Pro': 'Pixel_8_Pro',
    'Pixel 8': 'Pixel_8',
    'Pixel 8a': 'Pixel_8a',
    'Pixel 7 Pro': 'Pixel_7_Pro',
    'Pixel 7': 'Pixel_7',
    'Pixel 7a': 'Pixel_7a',
    'Pixel Fold': 'Pixel_Fold',
    'Pixel 6 Pro': 'Pixel_6_Pro',
    'Pixel 6': 'Pixel_6',
    'Pixel 6a': 'Pixel_6a',
  },
  vivo: {
    'vivo X200 Pro': 'vivo_X200_Pro',
    'vivo X200': 'vivo_X200',
    'vivo X100 Pro': 'vivo_X100_Pro',
    'vivo X100': 'vivo_X100',
    'vivo V40 Pro': 'vivo_V40_Pro',
    'vivo V40': 'vivo_V40',
    'vivo V30 Pro': 'vivo_V30_Pro',
    'vivo V30': 'vivo_V30',
    'vivo T3 Ultra': 'vivo_T3_Ultra',
    'vivo T3 Pro': 'vivo_T3_Pro',
    'vivo Y200 Pro': 'vivo_Y200_Pro',
  },
  oppo: {
    'OPPO Find X8 Pro': 'OPPO_Find_X8_Pro',
    'OPPO Find X8': 'OPPO_Find_X8',
    'OPPO Find X7 Ultra': 'OPPO_Find_X7_Ultra',
    'OPPO Reno12 Pro 5G': 'OPPO_Reno12_Pro_5G',
    'OPPO Reno12 5G': 'OPPO_Reno12_5G',
    'OPPO Reno11 Pro 5G': 'OPPO_Reno11_Pro_5G',
    'OPPO Reno11 5G': 'OPPO_Reno11_5G',
    'OPPO F27 Pro+ 5G': 'OPPO_F27_ProPlus_5G',
    'OPPO A3 Pro 5G': 'OPPO_A3_Pro_5G',
    'OPPO A79 5G': 'OPPO_A79_5G',
  },
  motorola: {
    'motorola edge 50 ultra': 'motorola_edge_50_ultra',
    'motorola edge 50 pro': 'motorola_edge_50_pro',
    'motorola edge 50 fusion': 'motorola_edge_50_fusion',
    'motorola razr 50 ultra': 'motorola_razr_50_ultra',
    'motorola razr 50': 'motorola_razr_50',
    'motorola g85 5G': 'motorola_g85_5G',
    'motorola g64 5G': 'motorola_g64_5G',
    'motorola g54 5G': 'motorola_g54_5G',
    'motorola edge 40 neo': 'motorola_edge_40_neo',
  },
  huawei: {
    'HUAWEI Pura 70 Ultra': 'HUAWEI_Pura_70_Ultra',
    'HUAWEI Pura 70 Pro': 'HUAWEI_Pura_70_Pro',
    'HUAWEI Pura 70': 'HUAWEI_Pura_70',
    'HUAWEI Mate X5': 'HUAWEI_Mate_X5',
    'HUAWEI nova 12 Pro': 'HUAWEI_nova_12_Pro',
    'HUAWEI nova 12': 'HUAWEI_nova_12',
    'HUAWEI Mate 60 Pro': 'HUAWEI_Mate_60_Pro',
  },
};

const getModelImageUrl = (brandId: string, model: string): string | null => {
  const id = (brandId || '').toLowerCase();
  const filename = MODEL_FILE_MAP[id]?.[model];
  if (!filename) return null;
  return `/phone_images/${id}/${filename}.jpg`;
};

const getRealModelsForBrand = (brandId?: string, brandName?: string, fallback: string[] = []) => {
  const key = `${brandId || ''} ${brandName || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (key.includes('pixel')) return REAL_MODELS.pixel;
  if (key.includes('realme')) return REAL_MODELS.realme;
  if (key.includes('oneplus')) return REAL_MODELS.oneplus;
  if (key.includes('samsung')) return REAL_MODELS.samsung;
  if (key.includes('xiaomi') || key.includes('redmi') || key.includes('poco')) return REAL_MODELS.xiaomi;
  if (key.includes('apple') || key.includes('iphone')) return REAL_MODELS.apple;
  if (key.includes('vivo')) return REAL_MODELS.vivo;
  if (key.includes('oppo')) return REAL_MODELS.oppo;
  if (key.includes('motorola')) return REAL_MODELS.motorola;
  if (key.includes('huawei')) return REAL_MODELS.huawei;
  return fallback;
};

const isProModel = (model: string) => /pro|ultra|max|plus|fold/i.test(model);
const isCompactModel = (model: string) => /mini|se|lite|\bc\b|\ba\b/i.test(model);

const ModelThumbnail: React.FC<{ brandId: string; model: string }> = ({ brandId, model }) => {
  const [failed, setFailed] = useState(false);
  const src = getModelImageUrl(brandId, model);

  return (
    <div className="relative w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden shrink-0">
      {src && !failed ? (
        <img
          alt={model}
          src={src}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-black text-sm">
          {model.slice(0, 1).toUpperCase()}
        </div>
      )}
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

export const ModelSelection: React.FC<StepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(formData.model || '');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const id = window.requestAnimationFrame(() => {
      const targetY =
        el.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.18;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  const currentBrand = brands.find((b) => b.id === formData.brand?.id);
  const availableModels = useMemo(
    () => getRealModelsForBrand(formData.brand?.id, formData.brand?.name, currentBrand?.models || []),
    [currentBrand?.models, formData.brand?.id, formData.brand?.name],
  );

  const filteredModels = availableModels.filter((m) =>
    m.toLowerCase().includes(query.toLowerCase()),
  );

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

        <div className="rounded-[24px] border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredModels.map((model, i) => {
                const isSelected = selected === model;
                const pro = isProModel(model);
                const compact = isCompactModel(model);

                return (
                  <motion.button
                    key={model}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: i * 0.015, type: 'spring', stiffness: 320, damping: 28 }}
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
                    <div className="shrink-0 relative">
                      <ModelThumbnail brandId={formData.brand?.id ?? ''} model={model} />
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

                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] sm:text-base font-semibold leading-tight truncate ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                        {model}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                        {formData.brand?.name} · Tap to select
                      </p>
                    </div>

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
                <p className="text-sm font-medium">No models match &quot;{query}&quot;</p>
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
            {selected ? `Continue` : 'Select a model to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};