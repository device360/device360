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

const toPrettyLocation = (slug?: string) => {
  if (!slug) return 'Bengaluru';
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const toSlug = (v: string) => v.toLowerCase().replace(/\s+/g, '-');

const buildWhatsAppUrl = (location: string, phoneModel = '') => {
  const message = encodeURIComponent(
    `Hi! I want to book a mobile repair in ${location}. ${phoneModel ? `My model is ${phoneModel}. ` : ''}Please share the price and available slots.`,
  );
  return `https://wa.me/919876543210?text=${message}`;
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

  const normalized = value.toLowerCase().trim();

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
                  <span className="text-sm font-bold text-white sm:text-base">
                    {item.q}
                  </span>

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
    if (!search.trim()) return MOBILE_BRANDS;
    const q = search.toLowerCase();
    return MOBILE_BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <section id="brands" className="bg-[#05080f] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Popular Brands"
          title="Choose Your Brand"
          description="Brand logo cards only — clean, fast, and easy to scan."
          dark
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filteredBrands.map((brand) => (
            <motion.button
              key={brand.slug}
              variants={fadeUp}
              onClick={() => navigate(repairPath)}
              className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-80"
                style={{
                  background: `linear-gradient(90deg, ${brand.accent}, rgba(255,255,255,0.08))`,
                }}
              />
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-black text-white shadow-lg">
                  {brand.logo}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{brand.name}</p>
                  <p className="text-xs text-white/45">Tap to repair</p>
                </div>
              </div>
            </motion.button>
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
        const pretty = toPrettyLocation(location);
        setCurrentLocation(pretty);
        localStorage.setItem(LOCATION_STORAGE_KEY, pretty);
        window.dispatchEvent(new Event('device360-location-change'));
        return;
      }

      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) setCurrentLocation(saved);
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
    localStorage.setItem(LOCATION_STORAGE_KEY, locationItem.name);
    localStorage.setItem(LOCATION_CONFIRMED_KEY, 'true');
    setCurrentLocation(locationItem.name);
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
          setCurrentLocation(detected.name);
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
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">
                    <Search className="h-4 w-4 shrink-0 text-cyan-300" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your phone model..."
                      className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      aria-label="Search your phone model"
                    />
                  </div>

                  <AnimatedCtaButton
                    onClick={() => navigate(repairPath)}
                    className="w-full sm:min-w-[170px]"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </AnimatedCtaButton>
                </div>
              </div>

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
              <MobileBrandGrid navigate={navigate} repairPath={repairPath} />
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
