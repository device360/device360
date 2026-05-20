import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Quote,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Video,
  Wrench,
  Zap,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testimonials } from '../data/mockData';

const LOCATION_STORAGE_KEY = 'device360Location';
const LOCATION_CONFIRMED_KEY = 'device360LocationConfirmed';

const normalizeLocationText = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/[_/]+/g, ' ')
    .replace(/\s+/g, ' ');

  const withoutPrefix = cleaned
    .replace(/^(mobile\s+repair\s+)+/i, '')
    .replace(/^(repair\s+)+/i, '');

  const words = withoutPrefix.split(' ').filter(Boolean);

  const deduped: string[] = [];
  for (const word of words) {
    if (!deduped.length || deduped[deduped.length - 1].toLowerCase() !== word.toLowerCase()) {
      deduped.push(word);
    }
  }

  return deduped.join(' ').trim();
};

const toPrettyLocation = (slug?: string) => {
  if (!slug) return 'Bengaluru';

  const cleanSlug =
    slug
      .split('/')
      .filter(Boolean)
      .slice(-1)[0]
      ?.toLowerCase()
      .replace(/^(mobile-repair-)+/i, '')
      .replace(/^(repair-)+/i, '')
      .replace(/^-+|-+$/g, '') || '';

  const pretty = cleanSlug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return normalizeLocationText(pretty) || 'Bengaluru';
};

const toSlug = (v: string) =>
  normalizeLocationText(v)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^(mobile-repair-)+/i, '')
    .replace(/^(repair-)+/i, '')
    .replace(/^-+|-+$/g, '');

const buildWhatsAppUrl = (location: string, phoneModel = '') => {
  const message = encodeURIComponent(
    `Hi! I want to book a mobile repair in ${location}. ${phoneModel ? `My model is ${phoneModel}. ` : ''}Please share the price and available slots.`,
  );
  return `https://wa.me/919876543210?text=${message}`;
};


const BRAND_LIST = [
  { id: 'apple', name: 'Apple', color: '#1d1d1f', models: 12 },
  { id: 'samsung', name: 'Samsung', color: '#1428A0', models: 10 },
  { id: 'oneplus', name: 'OnePlus', color: '#eb0029', models: 8 },
  { id: 'xiaomi', name: 'Xiaomi', color: '#ff6900', models: 11 },
  { id: 'realme', name: 'realme', color: '#f5a623', models: 15 },
  { id: 'pixel', name: 'Google', color: '#4285F4', models: 19 },
  { id: 'vivo', name: 'vivo', color: '#415fff', models: 11 },
  { id: 'oppo', name: 'OPPO', color: '#1d7d52', models: 10 },
  { id: 'motorola', name: 'Motorola', color: '#4356e0', models: 9 },
  { id: 'huawei', name: 'Huawei', color: '#cf0a2c', models: 7 },
];

const BRAND_ICONS: Record<string, { path: string; bg: string; light: string }> = {
  apple: {
    path: `M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701`,
    bg: '#1d1d1f',
    light: '#f5f5f7',
  },
  samsung: {
    path: `M19.8166 10.2808l.0459 2.6934h-.023l-.7793-2.6934h-1.2837v3.3925h.8481l-.0458-2.785h.023l.8366 2.785h1.2264v-3.3925zm-16.149 0l-.6418 3.427h.9284l.4699-3.1175h.0229l.4585 3.1174h.9169l-.6304-3.4269zm5.1805 0l-.424 2.6132h-.023l-.424-2.6132H6.5788l-.0688 3.427h.8596l.023-3.0832h.0114l.573 3.0831h.8711l.5731-3.083h.023l.0228 3.083h.8596l-.0802-3.4269zm-7.2664 2.4527c.0343.0802.0229.1949.0114.2522-.0229.1146-.1031.2292-.3324.2292-.2177 0-.3438-.126-.3438-.3095v-.3323H0v.2636c0 .7679.6074.9971 1.2493.9971.6189 0 1.1346-.2178 1.2149-.7794.0458-.298.0114-.4928 0-.5616-.1605-.722-1.467-.9283-1.5588-1.3295-.0114-.0688-.0114-.1375 0-.1834.023-.1146.1032-.2292.3095-.2292.2063 0 .321.126.321.3095v.2063h.8595v-.2407c0-.745-.6762-.8596-1.1576-.8596-.6074 0-1.1117.2063-1.2034.7564-.023.149-.0344.2866.0114.4585.1376.7106 1.364.9169 1.5358 1.3524m11.152 0c.0343.0803.0228.1834.0114.2522-.023.1146-.1032.2292-.3324.2292-.2178 0-.3438-.126-.3438-.3095v-.3323h-.917v.2636c0 .7564.596.9857 1.2379.9857.6189 0 1.1232-.2063 1.2034-.7794.0459-.298.0115-.4814 0-.5616-.1375-.7106-1.4327-.9284-1.5243-1.318-.0115-.0688-.0115-.1376 0-.1835.0229-.1146.1031-.2292.3094-.2292.1948 0 .321.126.321.3095v.2063h.848v-.2407c0-.745-.6647-.8596-1.146-.8596-.6075 0-1.1004.1948-1.192.7564-.023.149-.023.2866.0114.4585.1376.7106 1.341.9054 1.513 1.3524m2.8882.4585c.2407 0 .3094-.1605.3323-.2522.0115-.0343.0115-.0917.0115-.126v-2.533h.871v2.4642c0 .0688 0 .1948-.0114.2292-.0573.6419-.5616.8482-1.192.8482-.6303 0-1.1346-.2063-1.192-.8482 0-.0344-.0114-.1604-.0114-.2292v-2.4642h.871v2.533c0 .0458 0 .0916.0115.126 0 .0917.0688.2522.3095.2522m7.1518-.0344c.2522 0 .3324-.1605.3553-.2522.0115-.0343.0115-.0917.0115-.126v-.4929h-.3553v-.5043H24v.917c0 .0687 0 .1145-.0115.2292-.0573.6303-.596.8481-1.2034.8481-.6075 0-1.1461-.2178-1.2034-.8481-.0115-.1147-.0115-.1605-.0115-.2293v-1.444c0-.0574.0115-.172.0115-.2293.0802-.6419.596-.8482 1.2034-.8482s1.1347.2063 1.2034.8482c.0115.1031.0115.2292.0115.2292v.1146h-.8596v-.1948s0-.0803-.0115-.1261c-.0114-.0802-.0802-.2521-.3438-.2521-.2521 0-.321.1604-.3438.2521-.0115.0458-.0115.1032-.0115.1605v1.5702c0 .0458 0 .0916.0115.126 0 .0917.0917.2522.3323.2522`,
    bg: '#1428A0',
    light: '#e8edf8',
  },
  oneplus: {
    path: `M0 3.74V24h20.26V12.428h-2.256v9.317H2.254V5.995h9.318V3.742zM18.004 0v3.74h-3.758v2.256h3.758v3.758h2.255V5.996H24V3.74h-3.758V0zm-6.45 18.756V8.862H9.562c0 .682-.228 1.189-.577 1.504-.367.297-.91.437-1.556.437h-.245v1.625h2.133v6.31h2.237z`,
    bg: '#F5010C',
    light: '#fef0f0',
  },
  xiaomi: {
    path: `M12 0C8.016 0 4.756.255 2.493 2.516.23 4.776 0 8.033 0 12.012c0 3.98.23 7.235 2.494 9.497C4.757 23.77 8.017 24 12 24c3.983 0 7.243-.23 9.506-2.491C23.77 19.247 24 15.99 24 12.012c0-3.984-.233-7.243-2.502-9.504C19.234.252 15.978 0 12 0zM4.906 7.405h5.624c1.47 0 3.007.068 3.764.827.746.746.827 2.233.83 3.676v4.54a.15.15 0 0 1-.152.147h-1.947a.15.15 0 0 1-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15 0 0 0-.151.147v6.98a.15.15 0 0 1-.152.148H4.906a.15.15 0 0 1-.15-.148V7.554a.15.15 0 0 1 .15-.149zm12.131 0h1.949a.15.15 0 0 1 .15.15v8.892a.15.15 0 0 1-.15.148h-1.949a.15.15 0 0 1-.151-.148V7.554a.15.15 0 0 1 .151-.149zM8.92 10.948h2.046c.083 0 .15.066.15.147v5.352a.15.15 0 0 1-.15.148H8.92a.15.15 0 0 1-.152-.148v-5.352a.15.15 0 0 1 .152-.147Z`,
    bg: '#FF6900',
    light: '#fff4ec',
  },
  motorola: {
    path: `M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12C24.002 5.375 18.632.002 12.007 0H12zm7.327 18.065s-.581-2.627-1.528-4.197c-.514-.857-1.308-1.553-2.368-1.532-.745 0-1.399.423-2.2 1.553-.469.77-.882 1.573-1.235 2.403 0 0-.29-.675-.63-1.343a8.038 8.038 0 0 0-.605-1.049c-.804-1.13-1.455-1.539-2.2-1.553-1.049-.021-1.854.675-2.364 1.528-.948 1.574-1.528 4.197-1.528 4.197h-.864l4.606-15.12 3.56 11.804.024.021.024-.021 3.56-11.804 4.61 15.113h-.862z`,
    bg: '#E1140A',
    light: '#feefef',
  },
  oppo: {
    path: `M2.85 12.786h-.001C1.639 12.774.858 12.2.858 11.321s.781-1.452 1.99-1.465c1.21.013 1.992.588 1.992 1.465s-.782 1.453-1.99 1.465zm.034-3.638h-.073C1.156 9.175 0 10.068 0 11.32s1.156 2.147 2.811 2.174h.073c1.655-.027 2.811-.921 2.811-2.174S4.54 9.175 2.885 9.148zm18.27 3.638c-1.21-.012-1.992-.587-1.992-1.465s.782-1.452 1.991-1.465c1.21.013 1.991.588 1.991 1.465s-.781 1.453-1.99 1.465zm.035-3.638h-.073c-1.655.027-2.811.92-2.811 2.173s1.156 2.147 2.81 2.174h.074C22.844 13.468 24 12.574 24 11.32s-1.156-2.146-2.811-2.173zm-6.126 3.638c-1.21-.012-1.99-.587-1.99-1.465s.78-1.452 1.99-1.465c1.21.013 1.991.588 1.991 1.465s-.781 1.453-1.99 1.465zm.036-3.638h-.073c-.789.013-1.464.222-1.955.574v-.37h-.857v5.5h.857v-1.931c.49.351 1.166.56 1.954.574h.074c1.655-.027 2.81-.921 2.81-2.174s-1.155-2.146-2.81-2.173zm-6.144 3.638c-1.21-.012-1.99-.587-1.99-1.465s.78-1.452 1.99-1.465c1.21.013 1.991.588 1.991 1.465s-.781 1.453-1.99 1.465zm.037-3.638H8.92c-.789.013-1.464.222-1.955.574v-.37h-.856v5.5h.856v-1.931c.491.351 1.166.56 1.955.574a3.728 3.728 0 0 0 .073 0c1.655-.027 2.811-.921 2.811-2.174s-1.156-2.146-2.81-2.173z`,
    bg: '#1D7D52',
    light: '#edf5f0',
  },
  vivo: {
    path: `M19.604 14.101c-1.159 0-1.262-.95-1.262-1.24 0-.29.103-1.242 1.262-1.242h2.062c1.16 0 1.263.951 1.263 1.242 0 .29-.104 1.24-1.263 1.24m-2.062-3.527c-2.142 0-2.333 1.752-2.333 2.287 0 .535.19 2.286 2.333 2.286h2.062c2.143 0 2.334-1.751 2.334-2.286 0-.535-.19-2.287-2.334-2.287m-5.477.107c-.286 0-.345.05-.456.213-.11.164-2.022 3.082-2.022 3.082-.06.09-.126.126-.206.126-.08 0-.145-.036-.206-.126 0 0-1.912-2.918-2.022-3.082-.11-.164-.17-.213-.456-.213h-.668c-.154 0-.224.12-.127.267l2.283 3.467c.354.521.614.732 1.196.732s.842-.21 1.196-.732l2.284-3.467c.096-.146.026-.267-.128-.267m-8.876.284c0-.203.08-.284.283-.284h.505c.203 0 .283.08.283.283v3.9c0 .202-.08.283-.283.283h-.505c-.203 0-.283-.08-.283-.283zm-1.769-.285c-.287 0-.346.05-.456.213-.11.164-2.022 3.082-2.022 3.082-.061.09-.126.126-.206.126-.08 0-.145-.036-.206-.126 0 0-1.912-2.918-2.023-3.082-.11-.164-.169-.213-.455-.213H.175c-.171 0-.224.12-.127.267l2.283 3.467c.355.521.615.732 1.197.732.582 0 .842-.21 1.196-.732l2.283-3.467c.097-.146.044-.267-.127-.267m1.055-.893c-.165-.164-.165-.295 0-.46l.351-.351c.165-.165.296-.165.46 0l.352.351c.165.165.165.296 0 .46l-.352.352c-.164.165-.295.165-.46 0z`,
    bg: '#415FFF',
    light: '#eef1ff',
  },
  google: {
    path: `M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z`,
    bg: '#4285F4',
    light: '#e8f0fe',
  },
  huawei: {
    path: `M3.67 6.14S1.82 7.91 1.72 9.78v.35c.08 1.51 1.22 2.4 1.22 2.4 1.83 1.79 6.26 4.04 7.3 4.55 0 0 .06.03.1-.01l.02-.04v-.04C7.52 10.8 3.67 6.14 3.67 6.14zM9.65 18.6c-.02-.08-.1-.08-.1-.08l-7.38.26c.8 1.43 2.15 2.53 3.56 2.2.96-.25 3.16-1.78 3.88-2.3.06-.05.04-.09.04-.09zm.08-.78C6.49 15.63.21 12.28.21 12.28c-.15.46-.2.9-.21 1.3v.07c0 1.07.4 1.82.4 1.82.8 1.69 2.34 2.2 2.34 2.2.7.3 1.4.31 1.4.31.12.02 4.4 0 5.54 0 .05 0 .08-.05.08-.05v-.06c0-.03-.03-.05-.03-.05zM9.06 3.19a3.42 3.42 0 00-2.57 3.15v.41c.03.6.16 1.05.16 1.05.66 2.9 3.86 7.65 4.55 8.65.05.05.1.03.1.03a.1.1 0 00.06-.1c1.06-10.6-1.11-13.42-1.11-13.42-.32.02-1.19.23-1.19.23zm8.299 2.27s-.49-1.8-2.44-2.28c0 0-.57-.14-1.17-.22 0 0-2.18 2.81-1.12 13.43.01.07.06.08.06.08.07.03.1-.03.1-.03.72-1.03 3.9-5.76 4.55-8.64 0 0 .36-1.4.02-2.34zm-2.92 13.07s-.07 0-.09.05c0 0-.01.07.03.1.7.51 2.85 2 3.88 2.3 0 0 .16.05.43.06h.14c.69-.02 1.9-.37 3-2.26l-7.4-.25zm7.83-8.41c.14-2.06-1.94-3.97-1.94-3.98 0 0-3.85 4.66-6.67 10.8 0 0-.03.08.02.13l.04.01h.06c1.06-.53 5.46-2.77 7.28-4.54 0 0 1.15-.93 1.21-2.42zm1.52 2.14s-6.28 3.37-9.52 5.55c0 0-.05.04-.03.11 0 0 .03.06.07.06 1.16 0 5.56 0 5.67-.02 0 0 .57-.02 1.27-.29 0 0 1.56-.5 2.37-2.27 0 0 .73-1.45.17-3.14z`,
    bg: '#CF0A2C',
    light: '#fff0f0',
  },
}

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const isRealme = (id: string, name: string) => {
  const key = normalizeKey(id + name);
  return key.includes('realme');
};

const isGooglePixel = (id: string, name: string) => {
  const key = normalizeKey(id + name);
  return key.includes('googlepixel') || key.includes('pixel');
};

// ── Brand Logo Component ──────────────────────────────────────────────────────
const BrandLogo: React.FC<{ id: string; name: string; selected?: boolean }> = ({
  id,
  name,
  selected,
}) => {
  const icon = BRAND_ICONS[id];

  if (isRealme(id, name)) {
    return (
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200"
        style={{ backgroundColor: selected ? '#FFD400' : '#FFF5BF' }}
      >
        <span
          className="font-black tracking-tight lowercase leading-none"
          style={{
            color: '#111827',
            fontSize: '0.98rem',
            letterSpacing: '-0.04em',
            transform: 'translateY(1px)',
          }}
        >
          realme
        </span>
      </div>
    );
  }

  if (isGooglePixel(id, name)) {
    return (
      <div
        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-sm transition-all duration-200"
        style={{ backgroundColor: selected ? '#ffffff' : '#f8fafc' }}
      >
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#4285F4"
              transform="scale(0.62) translate(5 5)"
            />
          </svg>
          <span
            className="font-semibold leading-none"
            style={{
              fontSize: '0.6rem',
              color: selected ? '#111827' : '#6b7280',
              letterSpacing: '-0.03em',
            }}
          >
            Pixel
          </span>
        </div>
        <span
          className="font-bold leading-none"
          style={{
            fontSize: '0.48rem',
            color: '#9ca3af',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Google
        </span>
      </div>
    );
  }

  if (icon) {
    return (
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm"
        style={{ backgroundColor: selected ? icon.bg : icon.light }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 transition-all duration-200"
          style={{ fill: selected ? '#ffffff' : icon.bg }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={icon.path} />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all"
      style={{ backgroundColor: selected ? '#1d4ed8' : '#eff6ff', color: selected ? '#fff' : '#1d4ed8' }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};


const MOBILE_BRANDS = [
  { id: 'apple', name: 'Apple', slug: 'apple', accent: '#f5f5f7', logo: '' },
  { id: 'samsung', name: 'Samsung', slug: 'samsung', accent: '#1428A0', logo: 'S' },
  { id: 'oneplus', name: 'OnePlus', slug: 'oneplus', accent: '#eb0029', logo: '1+' },
  { id: 'google', name: 'Google', slug: 'google', accent: '#4285F4', logo: 'G' },
  { id: 'xiaomi', name: 'Xiaomi', slug: 'xiaomi', accent: '#ff6900', logo: 'X' },
  { id: 'vivo', name: 'vivo', slug: 'vivo', accent: '#415fff', logo: 'V' },
  { id: 'oppo', name: 'OPPO', slug: 'oppo', accent: '#1d7d52', logo: 'O' },
  { id: 'realme', name: 'realme', slug: 'realme', accent: '#f5a623', logo: 'R' },
  { id: 'motorola', name: 'Motorola', slug: 'motorola', accent: '#4356e0', logo: 'M' },
  { id: 'huawei', name: 'Huawei', slug: 'huawei', accent: '#cf0a2c', logo: 'H' },
];

const SERVE_LOCATIONS = [
  { name: 'Indiranagar', slug: 'indiranagar' },
  { name: 'Koramangala', slug: 'koramangala' },
  { name: 'Whitefield', slug: 'whitefield' },
  { name: 'Marathahalli', slug: 'marathahalli' },
  { name: 'HSR Layout', slug: 'hsr-layout' },
  { name: 'Electronic City', slug: 'electronic-city' },
  { name: 'Bannerghatta Road', slug: 'bannerghatta-road' },
  { name: 'Jayanagar', slug: 'jayanagar' },
  { name: 'Malleshwaram', slug: 'malleshwaram' },
  { name: 'Yelahanka', slug: 'yelahanka' },
  { name: 'Sarjapur Road', slug: 'sarjapur-road' },
  { name: 'Hoskote', slug: 'hoskote' },
];

const SERVICE_CENTERS = [
  { name: 'Whitefield', slug: 'whitefield', lat: 12.9698, lon: 77.75, radiusKm: 8 },
  { name: 'Marathahalli', slug: 'marathahalli', lat: 12.9561, lon: 77.7015, radiusKm: 6 },
  { name: 'Indiranagar', slug: 'indiranagar', lat: 12.9719, lon: 77.6412, radiusKm: 6 },
  { name: 'Koramangala', slug: 'koramangala', lat: 12.9352, lon: 77.6245, radiusKm: 6 },
  { name: 'HSR Layout', slug: 'hsr-layout', lat: 12.9116, lon: 77.6412, radiusKm: 6 },
  { name: 'Electronic City', slug: 'electronic-city', lat: 12.8452, lon: 77.66, radiusKm: 8 },
  { name: 'Bannerghatta Road', slug: 'bannerghatta-road', lat: 12.9, lon: 77.6, radiusKm: 7 },
  { name: 'Jayanagar', slug: 'jayanagar', lat: 12.925, lon: 77.5938, radiusKm: 6 },
  { name: 'Malleshwaram', slug: 'malleshwaram', lat: 13.003, lon: 77.566, radiusKm: 7 },
  { name: 'Yelahanka', slug: 'yelahanka', lat: 13.1, lon: 77.5963, radiusKm: 8 },
  { name: 'Sarjapur Road', slug: 'sarjapur-road', lat: 12.9141, lon: 77.707, radiusKm: 7 },
  { name: 'Hoskote', slug: 'hoskote', lat: 13.07, lon: 77.789, radiusKm: 10 },
];

const OFFERS = [
  {
    title: 'Screen Replacement Offer',
    desc: 'Save up to 15% on selected screen repairs this week.',
    bullets: ['Premium display options', 'Same-day service', '6-month warranty'],
    icon: Smartphone,
    gradient: 'from-fuchsia-500 via-violet-500 to-indigo-600',
  },
  {
    title: 'Battery Deal',
    desc: 'Flat discount on battery replacements for popular models.',
    bullets: ['High-capacity cells', 'Fast turnaround', 'Quality tested'],
    icon: BatteryCharging,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
  },
  {
    title: 'Complete Care Bundle',
    desc: 'Book multiple issues together and unlock a better price.',
    bullets: ['Screen + battery combo', 'Priority pickup', 'Expert diagnostics'],
    icon: Wrench,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
  },
];

const FAQ_ITEMS = [
  {
    q: '1. Which locations do you serve?',
    a: 'We currently serve selected areas across Bangalore.',
  },
  {
    q: '2. Do you provide free pickup and delivery?',
    a: 'Yes, free pickup & delivery is available in supported locations.',
  },
  {
    q: '3. How fast can my device be repaired?',
    a: 'Most repairs are completed within 60 minutes.',
  },
  {
    q: '4. Can I watch the repair live?',
    a: 'Yes, you can track your repair through live video support.',
  },
  {
    q: '5. Do you use original parts?',
    a: 'We use high-quality genuine replacement parts.',
  },
  {
    q: '6. Is there a warranty on repairs?',
    a: 'Yes, all eligible repairs come with up to 6 months warranty.',
  },
  {
    q: '7. How do I book a repair?',
    a: 'Select your phone model, check the price, and confirm your booking.',
  },
  {
    q: '8. Can I track my booking after confirmation?',
    a: 'Yes, you’ll receive live updates after your booking is confirmed.',
  },
];

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const detectNearbyLocation = (lat: number, lon: number) => {
  const ranked = SERVICE_CENTERS
    .map((center) => ({
      ...center,
      distanceKm: haversineDistanceKm(lat, lon, center.lat, center.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const best = ranked[0];
  if (!best) return null;

  if (best.distanceKm <= best.radiusKm) {
    return {
      name: best.name,
      slug: best.slug,
      distanceKm: best.distanceKm,
    };
  }

  return null;
};

const resolveStoredLocation = (value: string | null) => {
  if (!value) return null;

  const normalized = normalizeLocationText(value).toLowerCase();

  return (
    SERVE_LOCATIONS.find(
      (loc) =>
        loc.slug === normalized ||
        loc.name.toLowerCase() === normalized ||
        toSlug(loc.name) === normalized,
    ) || null
  );
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const SectionTitle = ({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) => (
  <div className="mb-12 text-center">
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] ${
        dark
          ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
          : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {eyebrow}
    </span>
    <h2 className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-gray-950'}`}>
      {title}
    </h2>
    <p className={`mx-auto mt-3 max-w-2xl text-sm leading-7 sm:text-base ${dark ? 'text-white/60' : 'text-gray-500'}`}>
      {description}
    </p>
  </div>
);

const Counter: React.FC<{ to: number; suffix?: string; prefix?: string }> = ({
  to,
  suffix = '',
  prefix = '',
}) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(to / 50);
    const id = window.setInterval(() => {
      cur += step;
      if (cur >= to) {
        setVal(to);
        window.clearInterval(id);
      } else {
        setVal(cur);
      }
    }, 20);
    return () => window.clearInterval(id);
  }, [to]);

  return (
    <span>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

const AnimatedCtaButton = ({
  children,
  onClick,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}) => {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cta-glow group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-4 font-black text-black shadow-[0_18px_40px_rgba(34,211,238,0.22)] ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />
      <span className="absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute inset-y-0 left-[-40%] w-1/2 skew-x-[-18deg] bg-white/30 blur-sm transition-transform duration-700 group-hover:translate-x-[280%]" />
      </span>
      <span className="absolute inset-[1px] rounded-[15px] bg-gradient-to-r from-cyan-400 to-blue-500" />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

const CurrentLocationChip = ({
  currentLocation,
  onClick,
}: {
  currentLocation: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-white/10"
  >
    <MapPin className="h-3.5 w-3.5 text-cyan-300" />
    {currentLocation}
  </button>
);

const MobileBrandGrid = ({
  navigate,
  repairPath,
}: {
  navigate: (to: string) => void;
  repairPath: string;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {MOBILE_BRANDS.map((brand) => (
        <motion.button
          key={brand.slug}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(repairPath)}
          className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white p-4 text-left shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all hover:border-cyan-400/25 hover:bg-gray-50"
        >
          <div
            className="absolute inset-x-0 top-0 h-1 opacity-90"
            style={{
              background: `linear-gradient(90deg, ${brand.accent}, rgba(255,255,255,0.08))`,
            }}
          />
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-lg font-black text-gray-900 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))',
              }}
            >
              {brand.logo}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-950">{brand.name}</p>
              <p className="text-xs text-gray-500">Tap to repair</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

const OfferBanner = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % OFFERS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-[#05080f] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_32%)]" />

          <div className="relative grid min-h-[320px] grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                <Zap className="h-3.5 w-3.5" />
                Limited Time Offers
              </span>

              <motion.div
                key={OFFERS[active].title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {OFFERS[active].title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                  {OFFERS[active].desc}
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {OFFERS[active].bullets.map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                    >
                      <CheckCircle className="h-4 w-4 text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <AnimatedCtaButton className="text-black">
                    <span>Claim Offer</span>
                    <ArrowRight className="h-4 w-4" />
                  </AnimatedCtaButton>
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white/90 transition-all hover:bg-white/10">
                    View Pricing
                  </button>
                </div>
              </motion.div>
            </div>

            <div className={`relative flex items-center justify-center bg-gradient-to-br ${OFFERS[active].gradient} p-8 lg:p-10`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute h-52 w-52 rounded-full bg-white/10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-6 rounded-full border border-dashed border-white/35"
                />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/20 bg-black/20 text-white shadow-2xl">
                  {(() => {
                    const Icon = OFFERS[active].icon;
                    return <Icon className="h-12 w-12" />;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActive((p) => (p - 1 + OFFERS.length) % OFFERS.length)}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/35 p-3 text-white backdrop-blur-xl transition-all hover:bg-black/50"
            aria-label="Previous offer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActive((p) => (p + 1) % OFFERS.length)}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/35 p-3 text-white backdrop-blur-xl transition-all hover:bg-black/50"
            aria-label="Next offer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {OFFERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === active ? 'w-8 bg-white' : 'w-2.5 bg-white/35'
                }`}
                aria-label={`Go to offer ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#05080f] py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything customers usually ask before booking a repair."
          dark
        />

        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <span className="text-sm font-bold text-white sm:text-base">{item.q}</span>

                  <ChevronRight
                    className={`h-5 w-5 shrink-0 text-cyan-300 transition-transform duration-300 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <p className="text-sm leading-7 text-white/65">{item.a}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


const BrandSection = ({
  repairPath,
  navigate,
  search,
}: {
  repairPath: string;
  navigate: (to: string) => void;
  search: string;
}) => {
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return BRAND_LIST;
    const q = search.toLowerCase();
    return BRAND_LIST.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <section
      id="brands"
      className="relative isolate overflow-hidden bg-[#05080f] py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="All Major Brands"
          title="We Repair All Major Brands"
          description="From Apple to Xiaomi — every premium and budget phone covered with genuine parts."
          dark
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {filteredBrands.map((brand) => (
            <motion.a
              key={brand.id}
              variants={fadeUp}
              href={repairPath}
              onClick={(e) => {
                e.preventDefault();
                navigate(repairPath);
              }}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 text-left shadow-[0_16px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-[0_20px_70px_rgba(0,0,0,0.4)] sm:p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, ${brand.color}, rgba(255,255,255,0.18))`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex items-start gap-4 sm:items-center">
                <div className="shrink-0 rounded-[22px] bg-white p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.18)] ring-1 ring-white/10">
                  <BrandLogo id={brand.id} name={brand.name} />
                </div>

                <div className="min-w-0 flex-1 pt-1 sm:pt-0">
                  <p className="truncate text-sm font-bold text-white sm:text-[15px]">
                    {brand.name}
                  </p>
                  <p className="mt-1 text-xs text-white/50 sm:text-[13px]">
                    {brand.models} models
                  </p>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-white/55 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-300">
                View models <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorks = ({
  navigate,
  repairPath,
}: {
  navigate: (to: string) => void;
  repairPath: string;
}) => {
  const steps = [
    { n: 1, icon: Smartphone, title: 'Select Model', desc: 'Pick your device & issue' },
    { n: 2, icon: Package, title: 'Free Pickup', desc: 'We collect from your door' },
    { n: 3, icon: Video, title: 'Watch LIVE', desc: 'Real-time video stream' },
    { n: 4, icon: ThumbsUp, title: 'Quality Check', desc: 'Tested before dispatch' },
    { n: 5, icon: ShieldCheck, title: 'Complete Payment', desc: 'Pay the service amount securely' },
    { n: 6, icon: Truck, title: 'Delivered', desc: 'Device back to you' },
  ];

  return (
    <section id="how-it-works" className="bg-[#05080f] py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Simple Process"
          title="Select Model → See Price Instantly"
          description="From booking to delivery — transparent, fast, and streamed live."
          dark
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-[24px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-white/7"
              >
                <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-xs font-black text-black">
                  {s.n}
                </div>
                <Icon className="mx-auto mt-3 h-7 w-7 text-cyan-300" />
                <h3 className="mt-4 text-sm font-bold">{s.title}</h3>
                <p className="mt-1 text-xs leading-6 text-white/50">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute -right-2.5 top-1/2 hidden h-0.5 w-5 bg-gradient-to-r from-cyan-400/40 to-transparent lg:block" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <AnimatedCtaButton onClick={() => navigate(repairPath)}>
            <Smartphone className="h-4 w-4" />
            Check Your Price Now
            <ArrowRight className="h-4 w-4" />
          </AnimatedCtaButton>
        </div>
      </div>
    </section>
  );
};

const LocationSection = ({
  navigate,
  repairPath,
}: {
  navigate: (to: string) => void;
  repairPath: string;
}) => (
  <section id="locations" className="border-y border-white/10 bg-[#05080f] py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Where We Serve"
        title="Mobile Repair Near You in Bengaluru"
        description="Same-day pickup & repair available across all major Bengaluru areas."
        dark
      />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      >
        {SERVE_LOCATIONS.map((loc) => (
          <motion.a
            key={loc.slug}
            variants={fadeUp}
            href={`/${loc.slug}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${loc.slug}`);
            }}
            className="group flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/10"
          >
            <MapPin className="h-4 w-4 shrink-0 text-cyan-300" />
            <div className="min-w-0">
              <p className="font-bold leading-tight text-white">{loc.name}</p>
              <p className="text-[10px] font-medium text-white/40">Mobile Repair</p>
            </div>
          </motion.a>
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-white/45">
        Don&apos;t see your area?{' '}
        <button onClick={() => navigate(repairPath)} className="font-semibold text-cyan-300 hover:underline">
          We likely serve it — check now →
        </button>
      </p>
    </div>
  </section>
);

const ReviewsSection = () => (
  <section id="reviews" className="bg-[#05080f] py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Customer Reviews"
        title="Trusted by Thousands"
        description="Real feedback from real customers."
        dark
      />

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-white">Rated 4.3 on Google</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <Shield className="h-4 w-4 text-emerald-300" />
          <span className="text-sm font-semibold text-white">Rated 4.9 on Trustpilot</span>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        {testimonials.map((t: any) => (
          <motion.div
            key={t.id}
            variants={fadeUp}
            className="rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/8"
          >
            <Quote className="mb-4 h-8 w-8 text-cyan-200" />
            <p className="mb-3 text-base font-bold leading-snug text-white">
              “{t.text.split(' ').slice(0, 8).join(' ')}…“
            </p>
            <p className="mb-5 text-sm leading-6 text-white/60">{t.text}</p>
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <img
                src={t.image}
                alt={t.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-cyan-200/30"
              />
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs text-white/45">Verified repair</span>
                </div>
              </div>
              <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                <CheckCircle className="h-3 w-3 text-emerald-300" />
                Verified
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

const LocationPickerModal = ({
  show,
  onClose,
  detectedLabel,
  locationSearch,
  setLocationSearch,
  filteredLocations,
  onSelect,
}: {
  show: boolean;
  onClose: () => void;
  detectedLabel: string;
  locationSearch: string;
  setLocationSearch: (value: string) => void;
  filteredLocations: { name: string; slug: string }[];
  onSelect: (location: { name: string; slug: string }) => void;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-full overflow-hidden rounded-t-[32px] border border-white/10 bg-[#0b1020] shadow-2xl shadow-black/40 sm:max-w-2xl sm:rounded-[32px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
                  Location Permission
                </p>
                <h2 className="mt-1 text-xl font-black text-white">Confirm your area</h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Close location picker"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pb-2 pt-4 sm:px-6">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                {detectedLabel || 'Allow location access or choose your area to continue.'}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="relative mb-5">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search location..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400/40"
                />
              </div>

              <div className="grid max-h-[52vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.slug}
                    onClick={() => onSelect(location)}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:border-cyan-400/30 hover:bg-white/10"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{location.name}</p>
                      <p className="text-xs text-gray-400">Mobile Repair</p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
                  </button>
                ))}
              </div>

              {filteredLocations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-gray-400">
                  No matching location found.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();
  const [search, setSearch] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [detectedLabel, setDetectedLabel] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Bengaluru');
  const hasResolvedLocation = useRef(false);

  const repairPath = useMemo(() => {
    const slug = toSlug(currentLocation);
    return slug === 'bengaluru' ? '/repair' : `/${slug}/repair`;
  }, [currentLocation]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(currentLocation, search.trim()),
    [currentLocation, search],
  );

  const filteredLocations = useMemo(() => {
    return SERVE_LOCATIONS.filter((locationItem) =>
      `${locationItem.name} ${locationItem.slug}`
        .toLowerCase()
        .includes(locationSearch.toLowerCase()),
    );
  }, [locationSearch]);

  useEffect(() => {
    const sync = () => {
      if (location) {
        const pretty = normalizeLocationText(toPrettyLocation(location));
        setCurrentLocation(pretty);
        localStorage.setItem(LOCATION_STORAGE_KEY, pretty);
        window.dispatchEvent(new Event('device360-location-change'));
        return;
      }

      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        setCurrentLocation(normalizeLocationText(saved));
      }
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('device360-location-change', sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('device360-location-change', sync as EventListener);
    };
  }, [location]);

  useEffect(() => {
    if (hasResolvedLocation.current) return;
    hasResolvedLocation.current = true;

    const confirmed = localStorage.getItem(LOCATION_CONFIRMED_KEY) === 'true';
    const storedLocation = resolveStoredLocation(localStorage.getItem(LOCATION_STORAGE_KEY));

    if (confirmed && storedLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, storedLocation.name);
      navigate(`/mobile-repair-${storedLocation.slug}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Mobile Repair in Bengaluru | Live Repair, Free Pickup & WhatsApp Booking';
    const description =
      'Book mobile repair in Bengaluru with live repair video, free pickup, same-day service, and WhatsApp booking. Search your model, check price instantly, and choose your location.';

    const existing = document.querySelector('meta[name="description"]');
    if (existing) {
      existing.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, []);

  const handleLocationSelect = (locationItem: { name: string; slug: string }) => {
    const normalizedName = normalizeLocationText(locationItem.name);

    localStorage.setItem(LOCATION_STORAGE_KEY, normalizedName);
    localStorage.setItem(LOCATION_CONFIRMED_KEY, 'true');
    setCurrentLocation(normalizedName);
    setShowLocationPicker(false);
    navigate(`/mobile-repair-${locationItem.slug}`);
  };

  const openLocationFlow = () => {
    const confirmed = localStorage.getItem(LOCATION_CONFIRMED_KEY) === 'true';
    const storedLocation = resolveStoredLocation(localStorage.getItem(LOCATION_STORAGE_KEY));

    if (confirmed && storedLocation) {
      navigate(`/mobile-repair-${storedLocation.slug}`);
      return;
    }

    if (!navigator.geolocation) {
      setDetectedLabel('Location access is not supported on this device.');
      setShowLocationPicker(true);
      return;
    }

    setDetectedLabel('');
    setLocationSearch('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = detectNearbyLocation(
          position.coords.latitude,
          position.coords.longitude,
        );

        setIsLocating(false);

        if (detected) {
          localStorage.setItem(LOCATION_STORAGE_KEY, detected.name);
          localStorage.setItem(LOCATION_CONFIRMED_KEY, 'true');
          setCurrentLocation(normalizeLocationText(detected.name));
          navigate(`/mobile-repair-${detected.slug}`);
          return;
        }

        setDetectedLabel('We could not confirm your exact area. Please choose your location.');
        setShowLocationPicker(true);
      },
      () => {
        setIsLocating(false);
        setDetectedLabel('Location permission was not granted. Please choose your area.');
        setShowLocationPicker(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 300000,
      },
    );
  };

  const heroBadge = 'Best Mobile Repair in Bangalore';
  const mobileBrandCount = MOBILE_BRANDS.length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05080f] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        .cta-glow {
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
        }
        .cta-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(255, 255, 255, 0.32) 48%,
            rgba(255, 255, 255, 0.08) 54%,
            transparent 80%
          );
          transform: translateX(-140%) skewX(-18deg);
          transition: transform 0.85s ease;
        }
        .cta-glow:hover::before {
          transform: translateX(140%) skewX(-18deg);
        }
      `}</style>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#05080f]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-12 lg:px-8">
          <div className="w-full">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 backdrop-blur-xl">
                  <Zap className="h-3.5 w-3.5" />
                  {heroBadge}
                </div>
                <CurrentLocationChip currentLocation={currentLocation} onClick={openLocationFlow} />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="mx-auto max-w-4xl text-center"
            >
              <h1 className="text-4xl font-black leading-[0.94] tracking-tight text-white sm:text-5xl lg:text-7xl">
                Fix Your Device Today!
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                Search your model instantly, compare service offers, and book premium repair with live tracking, free pickup, and fast turnaround.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mx-auto mt-10 max-w-3xl px-1 sm:px-0"
            >

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/45">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                  60 min repairs
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                  6 months warranty
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Video className="h-3.5 w-3.5 text-cyan-300" />
                  Live repair support
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="mx-auto mt-10 max-w-6xl"
            >
              <BrandSection repairPath={repairPath} navigate={navigate} search={search} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <AnimatedCtaButton onClick={() => navigate(repairPath)} className="w-full text-black sm:w-auto">
                <Video className="h-4 w-4" />
                Check Instant Price
                <ArrowRight className="h-4 w-4" />
              </AnimatedCtaButton>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-6 py-4 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15 sm:w-auto"
              >
                <ShieldCheck className="h-4 w-4" />
                WhatsApp Support
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <OfferBanner />

      <section className="border-y border-white/10 bg-[#05080f] py-7">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { to: 50000, suffix: '+', label: 'Repairs Completed' },
            { to: 4, suffix: '.9★', label: 'Average Rating' },
            { to: mobileBrandCount, suffix: '+', label: 'Mobile Brands' },
            { to: 60, suffix: ' min', label: 'Average Repair Time' },
          ].map(({ to, suffix, label }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
              <p className="text-xl font-black text-white sm:text-3xl">
                <Counter to={to} suffix={suffix} />
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks navigate={navigate} repairPath={repairPath} />

      <LocationSection navigate={navigate} repairPath={repairPath} />

      <ReviewsSection />

      <FAQSection />

      <section className="relative overflow-hidden bg-[#05080f] py-12 text-white sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute left-1/2 top-0 h-[280px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[90px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            <Zap className="h-3.5 w-3.5" /> Instant Pricing · Same Day Repair
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Fix Your Phone Today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Get an instant quote in 30 seconds. Free pickup from your door. Watch the repair live.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AnimatedCtaButton onClick={() => navigate(repairPath)} className="w-full text-black sm:w-auto">
              Get Instant Quote
              <ArrowRight className="h-4 w-4" />
            </AnimatedCtaButton>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-8 py-4 text-base font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15 sm:w-auto"
            >
              <ShieldCheck className="h-4 w-4" />
              WhatsApp Support
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-white/45">
            {[
              '6-Month Warranty',
              'Free Pickup & Delivery',
              'Live Repair Stream',
              'No Fix = No Charge',
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <nav className="sticky bottom-0 z-40 border-t border-white/10 bg-[#05080f]/95 backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-4 text-[11px] font-semibold text-white/65">
          {[
            { label: 'Book', href: repairPath },
            { label: 'Brands', href: '#brands' },
            { label: 'Areas', href: '#locations' },
            { label: 'Reviews', href: '#reviews' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('#')) return;
                e.preventDefault();
                navigate(repairPath);
              }}
              className="flex flex-col items-center justify-center gap-1 px-2 py-3 hover:text-cyan-300"
            >
              <Sparkles className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <LocationPickerModal
        show={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        detectedLabel={detectedLabel}
        locationSearch={locationSearch}
        setLocationSearch={setLocationSearch}
        filteredLocations={filteredLocations}
        onSelect={handleLocationSelect}
      />
    </div>
  );
};