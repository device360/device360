import { motion, useInView } from 'framer-motion';
import video from '../assets/v2.mp4';
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  Wallet,
  MessageCircle,
  MapPin,
  Package,
  Play,
  Quote,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Video,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testimonials } from '../data/mockData';

const toPrettyLocation = (slug?: string) => {
  if (!slug) return 'Bengaluru';

  const parts = slug.split('/').filter(Boolean);
  const cleanSlug = parts[parts.length - 1] ?? slug;

  return cleanSlug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const normalizeLocationText = (value: string) => {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');

  const deduped: string[] = [];
  for (const word of words) {
    if (!deduped.length || deduped[deduped.length - 1].toLowerCase() !== word.toLowerCase()) {
      deduped.push(word);
    }
  }

  return deduped.join(' ');
};

const toSlug = (v: string) => v.toLowerCase().replace(/\s+/g, '-');

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
const BrandLogo: React.FC<{ id: string; name: string; selected?: boolean }> = ({ id, name, selected }) => {
  const icon = BRAND_ICONS[id];

  // Realme: branded wordmark tile
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

  // Google Pixel: Google G + Pixel wordmark
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

  // Fallback for brands without a simple-icons entry
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all"
      style={{ backgroundColor: selected ? '#1d4ed8' : '#eff6ff', color: selected ? '#fff' : '#1d4ed8' }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

const POPULAR_MODELS = [
  'iPhone 16 Pro Max',
  'Galaxy S25 Ultra',
  'OnePlus 13',
  'Xiaomi 15 Ultra',
  'realme GT 7 Pro',
  'Pixel 9 Pro',
  'vivo X200 Pro',
  'OPPO Find X8 Pro',
  'motorola edge 50 pro',
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

const Counter: React.FC<{ to: number; suffix?: string; prefix?: string }> = ({
  to,
  suffix = '',
  prefix = '',
}) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
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
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const SectionTitle = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="mb-12 text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
      <Sparkles className="h-3.5 w-3.5" />
      {eyebrow}
    </span>
    <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
      {title}
    </h2>
    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
      {description}
    </p>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Quick answers to the most common questions about booking, repair, pricing, warranty, and service coverage."
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
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <span className="text-sm font-bold text-gray-900 sm:text-base">
                    {item.q}
                  </span>

                  <ChevronRight
                    className={`h-5 w-5 shrink-0 text-blue-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''
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
                    <p className="text-sm leading-7 text-gray-600">
                      {item.a}
                    </p>
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

const AnimatedHeroBullet = ({
  icon: Icon,
  text,
  index,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-red-500/15 bg-white/5 p-3 sm:p-4 backdrop-blur-xl"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage:
            'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 55%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative flex items-start gap-3">
        <motion.div
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.06, 1],
            boxShadow: [
              '0 0 0px rgba(239,68,68,0.20), 0 0 0px rgba(244,63,94,0.0)',
              '0 0 24px rgba(239,68,68,0.60), 0 0 42px rgba(244,63,94,0.28)',
              '0 0 0px rgba(239,68,68,0.20), 0 0 0px rgba(244,63,94,0.0)',
            ],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.18,
          }}
          className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-xl border border-white/20"
          />
          <motion.div
            animate={{
              opacity: [0.15, 0.45, 0.15],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.12,
            }}
            className="absolute inset-0 rounded-xl bg-white/10"
          />
          <Icon className="relative z-10 h-4 w-4" />
        </motion.div>

        <p className="text-sm leading-6 text-white/80">{text}</p>
      </div>
    </motion.div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();
  const [currentLocation, setCurrentLocation] = useState('Bengaluru');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const sync = () => {
      if (location) {
        const pretty = normalizeLocationText(toPrettyLocation(location));
        setCurrentLocation(pretty);
        localStorage.setItem('device360Location', pretty);
        window.dispatchEvent(new Event('device360-location-change'));
        return;
      }

      const stored = localStorage.getItem('device360Location');
      setCurrentLocation(stored ? normalizeLocationText(stored) : 'Bengaluru');
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
    document.title =
      'Mobile Repair in Bengaluru | Live Repair, Free Pickup & WhatsApp Booking';
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

  const currentSlug = toSlug(currentLocation);
  const repairPath = currentSlug === 'bengaluru' ? '/repair' : `/${currentSlug}/repair`;
  const whatsappUrl = useMemo(() => buildWhatsAppUrl(currentLocation), [currentLocation]);

  const filteredModels = useMemo(() => {
    if (!search.trim()) return POPULAR_MODELS;
    return POPULAR_MODELS.filter((model) =>
      model.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const steps = [
    { n: 1, icon: Smartphone, title: 'Select Model', desc: 'Pick your device & issue' },
    { n: 2, icon: Package, title: 'Free Pickup', desc: 'We collect from your door' },
    { n: 3, icon: Video, title: 'Watch LIVE', desc: 'Real-time video stream' },
    { n: 4, icon: ThumbsUp, title: 'Quality Check', desc: 'Tested before dispatch' },
    { n: 5, icon: Wallet, title: 'Complete Payment', desc: 'Pay the service amount securely' },
    { n: 6, icon: Truck, title: 'Delivered', desc: 'Device back to you' },
  ];

  const heroBullets = [
    { icon: Video, text: 'Watch your phone repair live with real-time video' },
    { icon: Clock, text: 'Get your device fixed in just 60 minutes' },
    { icon: Truck, text: 'Free doorstep pickup & delivery' },
    { icon: Shield, text: 'Genuine parts + 6-month warranty' },
  ];

  return (
    <div
      className="overflow-x-hidden bg-white text-gray-900"
      style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes scanLine {
          0% {
            transform: translateX(-120%) skewX(-18deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(260%) skewX(-18deg);
            opacity: 0;
          }
        }

        .scan-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .scan-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 18%,
            rgba(255, 255, 255, 0.28) 48%,
            rgba(255, 255, 255, 0.06) 54%,
            transparent 82%
          );
          animation: scanLine 2.4s linear infinite;
          z-index: 0;
        }

        .scan-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.14);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05080f]/80 backdrop-blur-xl">
        {/* <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left" aria-label="Go to home">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg shadow-cyan-500/10">
              <Smartphone className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">Device360</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Repair · Renew · Relax</p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 transition-transform hover:scale-105"
              aria-label="WhatsApp support"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <button
              onClick={() => navigate(repairPath)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
            >
              Book Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div> */}
      </header>

      <main>
        {/* HERO */}
        <section className="relative isolate min-h-screen overflow-hidden bg-[#05080f] sm:min-h-[92vh]">
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-35"
              poster="https://images.unsplash.com/photo-1651493706899-72a59df915ac?w=1400&h=900&fit=crop"
            >
              <source src={video} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#05080f]/70 via-[#05080f]/60 to-[#05080f]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-start px-4 pb-24 pt-16 sm:min-h-[92vh] sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-12 xl:items-center">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-6 sm:space-y-7 xl:col-span-7 xl:pr-4"
              >
                <motion.div variants={fadeUp}>
                  <div className="flex justify-center xl:justify-start">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] font-bold text-amber-300 shadow-lg shadow-amber-500/5 sm:text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-300" />
                      4.9 Rating · 1,000+ Repairs Done
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="max-w-4xl space-y-3 text-center xl:text-left">
                  <h1 className="mx-auto max-w-4xl text-[clamp(2rem,8vw,4rem)] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[clamp(2.5rem,6vw,5rem)] lg:text-[4.75rem] xl:mx-0 xl:text-[5rem]">
                    <span className="block">PREMIUM PHONE REPAIR</span>
                    <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                      DONE
                    </span>
                    <span className="block">TRANSPARENTLY</span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8 xl:mx-0">
                    premium mobile repair with live video support, free pickup, and same-day service.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {heroBullets.map(({ icon: Icon, text }, index) => (
                    <AnimatedHeroBullet key={text} icon={Icon} text={text} index={index} />
                  ))}
                </motion.div>

                <motion.button
                  onClick={() => navigate(repairPath)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="scan-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(244,63,94,0.35)] transition-all sm:w-auto sm:px-7 sm:py-4 sm:text-base"
                  aria-label="Check instant pricing"
                  data-testid="check-price-button"
                >
                  <Video className="relative z-10 h-4 w-4 shrink-0 text-white" />
                  <span className="relative z-10">Check Instant Pricing</span>
                  <ArrowRight className="relative z-10 h-4 w-4 shrink-0 text-white" />
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-full xl:col-span-5"
              >
                <div className="relative mx-auto w-full max-w-[560px] xl:max-w-none">
                  <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-3xl" />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-5 xl:col-span-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                            Instant pricing
                          </p>
                          <h3 className="mt-2 text-lg font-black tracking-tight sm:text-xl lg:text-2xl">
                            Select model → see price instantly
                          </h3>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                          <Smartphone className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                              <Play className="h-4 w-4 fill-current" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                Live repair stream
                              </p>
                              <p className="text-sm font-semibold text-white/85">
                                Real-time video on every booking
                              </p>
                            </div>
                          </div>
                          <div className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-300">
                            LIVE
                          </div>
                        </div>
                      </div>
                    </div>

                    {[
                      { label: '60 min', sub: 'Avg repair', icon: Clock },
                      { label: '4.9★', sub: 'Rating', icon: Star },
                    ].map(({ label, sub, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-[24px] border border-white/10 bg-white/8 p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-black tracking-tight">{label}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">
                              {sub}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-gray-200 bg-white py-7">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              { to: 50000, suffix: '+', label: 'Repairs Completed' },
              { to: 4, suffix: '.9★', label: 'Average Rating' },
              { to: 112, suffix: '+', label: 'Models Supported' },
              { to: 60, suffix: ' min', label: 'Average Repair Time' },
            ].map(({ to, suffix, label }) => (
              <div key={label} className="rounded-2xl bg-gray-50 px-4 py-4">
                <p className="text-xl font-black text-gray-950 sm:text-3xl">
                  <Counter to={to} suffix={suffix} />
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="bg-[#05080f] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Simple 5-Step Process"
              title="Select Model → See Price Instantly"
              description="From booking to delivery — transparent, fast, and streamed live."
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
              <button
                onClick={() => navigate(repairPath)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-base font-black text-black transition-transform hover:scale-[1.02]"
              >
                <Smartphone className="h-4 w-4" />
                Check Your Price Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* BRANDS */}
        <section id="brands" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="All Major Brands"
              title="We Repair All Major Brands"
              description="From Apple to Xiaomi — every premium and budget phone covered with genuine parts."
            />
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {BRAND_LIST.map((brand) => (
                <motion.a
                  key={brand.id}
                  variants={fadeUp}
                  href={repairPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(repairPath);
                  }}
                  className="group relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: brand.color }}
                  />

                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl">
                    <BrandLogo id={brand.id} name={brand.name} />
                  </div>

                  <p className="text-sm font-bold text-gray-950">{brand.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{brand.models} models</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-gray-900">
                    View models <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* AREAS */}
        <section id="locations" className="border-y border-gray-200 bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Where We Serve"
              title="Mobile Repair Near You in Bengaluru"
              description="Same-day pickup & repair available across all major Bengaluru areas."
            />
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            >
              {SERVE_LOCATIONS.map((loc) => {
                const isActive = toSlug(currentLocation) === loc.slug;
                return (
                  <motion.a
                    key={loc.slug}
                    variants={fadeUp}
                    href={`/${loc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/${loc.slug}`);
                    }}
                    className={`group flex items-center gap-3 rounded-[20px] border p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isActive
                      ? 'border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700'
                      }`}
                  >
                    <MapPin
                      className={`h-4 w-4 shrink-0 ${isActive
                        ? 'text-blue-200'
                        : 'text-gray-400 group-hover:text-blue-500'
                        }`}
                    />
                    <div className="min-w-0">
                      <p className="font-bold leading-tight">{loc.name}</p>
                      <p
                        className={`text-[10px] font-medium ${isActive ? 'text-blue-200' : 'text-gray-400'
                          }`}
                      >
                        Mobile Repair
                      </p>
                    </div>
                    {isActive && <CheckCircle className="ml-auto h-4 w-4 text-white" />}
                  </motion.a>
                );
              })}
            </motion.div>
            <p className="mt-8 text-center text-xs text-gray-500">
              Don&apos;t see your area?{' '}
              <button
                onClick={() => navigate(repairPath)}
                className="font-semibold text-blue-600 hover:underline"
              >
                We likely serve it — check now →
              </button>
            </p>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Customer Reviews"
              title="Loved by Customers"
              description="A premium repair experience that customers actually recommend."
            />
            <div className="mb-8 flex items-center justify-center gap-2 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
              <span className="ml-1 text-lg font-black text-gray-950">4.9</span>
              <span className="text-sm text-gray-500">/ 5 · 2,847 reviews</span>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              {testimonials.map((t) => (
                <motion.div
                  key={t.id}
                  variants={fadeUp}
                  className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <Quote className="mb-4 h-8 w-8 text-blue-100" />
                  <p className="mb-3 text-base font-bold leading-snug text-gray-950">
                    “{t.text.split(' ').slice(0, 8).join(' ')}…“
                  </p>
                  <p className="mb-5 text-sm leading-6 text-gray-500">{t.text}</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-950">{t.name}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-1 text-xs text-gray-400">Verified repair</span>
                      </div>
                    </div>
                    <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Verified
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <FAQSection />

        {/* CTA */}
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
              <button
                onClick={() => navigate(repairPath)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-base font-black text-black transition-transform hover:scale-[1.02] sm:w-auto"
              >
                Get Instant Quote →
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-8 py-4 text-base font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
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
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <nav className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-4 text-[11px] font-semibold text-gray-600">
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
              className="flex flex-col items-center justify-center gap-1 px-2 py-3 hover:text-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default LandingPage;