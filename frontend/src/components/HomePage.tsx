import { motion, useInView } from 'framer-motion';
import video from '../assets/v2.mp4';
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testimonials } from '../data/mockData';

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

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
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
  <div className="text-center mb-12">
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
      <Sparkles className="h-3.5 w-3.5" />
      {eyebrow}
    </span>
    <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
      {title}
    </h2>
    <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-7 text-gray-500">
      {description}
    </p>
  </div>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();
  const [currentLocation, setCurrentLocation] = useState('Bengaluru');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const sync = () => {
      if (location) {
        const pretty = toPrettyLocation(location);
        setCurrentLocation(pretty);
        localStorage.setItem('device360Location', pretty);
        window.dispatchEvent(new Event('device360-location-change'));
        return;
      }
      setCurrentLocation(localStorage.getItem('device360Location') || 'Bengaluru');
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
    document.title = 'Mobile Repair in Bengaluru | Live Repair, Free Pickup & WhatsApp Booking';
    const description = 'Book mobile repair in Bengaluru with live repair video, free pickup, same-day service, and WhatsApp booking. Search your model, check price instantly, and choose your location.';

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
    return POPULAR_MODELS.filter((model) => model.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const steps = [
    { n: 1, icon: Smartphone, title: 'Select Model', desc: 'Pick your device & issue' },
    { n: 2, icon: Package, title: 'Free Pickup', desc: 'We collect from your door' },
    { n: 3, icon: Video, title: 'Watch LIVE', desc: 'Real-time video stream' },
    { n: 4, icon: ThumbsUp, title: 'Quality Check', desc: 'Tested before dispatch' },
    { n: 5, icon: Truck, title: 'Delivered', desc: 'Device back to you' },
  ];

  const heroBullets = [
    { icon: Video, text: 'Watch your phone repair live with real-time video' },
    { icon: Clock, text: 'Get your device fixed in just 60 minutes' },
    { icon: Truck, text: 'Free doorstep pickup & delivery' },
    { icon: Shield, text: 'Genuine parts + 6-month warranty' },
  ];

  return (
    <div className="overflow-x-hidden bg-white text-gray-900" style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

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
        <section className="relative isolate min-h-[92vh] overflow-hidden bg-[#05080f]">
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

          <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="lg:col-span-7 space-y-6 sm:space-y-7"
              >
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] sm:text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/5">
                    <Star className="h-3.5 w-3.5 fill-amber-300" />
                    4.9 Rating · 1,000+ Repairs Done
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="max-w-4xl space-y-3">
                  <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.9rem]">
                    <span className="block">REPAIR</span>
                    <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                      RENEW
                    </span>
                    <span className="block">RELAX</span>
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                    Search your phone model instantly, check price, and book a premium repair with live video support, free pickup, and same-day service.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
                  {heroBullets.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-white/80">{text}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="pt-1">
                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white/7 px-4 text-white ring-1 ring-white/8">
                        <Search className="h-4 w-4 shrink-0 text-cyan-300" />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search your phone model..."
                          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                          aria-label="Search your phone model"
                        />
                      </div>
                      <button
                        onClick={() => navigate(repairPath)}
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 font-bold text-black transition-transform hover:scale-[1.02]"
                      >
                        Check Price
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {filteredModels.slice(0, 6).map((model) => (
                      <button
                        key={model}
                        onClick={() => navigate(repairPath)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-all hover:border-cyan-400/40 hover:text-cyan-200"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate(repairPath)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-base font-black text-black shadow-[0_18px_40px_rgba(56,189,248,0.22)] transition-transform hover:scale-[1.02]"
                    data-testid="check-price-button"
                  >
                    <Video className="h-4 w-4" />
                    Check Price + Live Video
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-6 py-4 text-base font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Now
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5"
              >
                <div className="relative mx-auto max-w-xl">
                  <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-3xl" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:col-span-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Instant pricing</p>
                          <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Select model → see price instantly</h3>
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
                              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Live repair stream</p>
                              <p className="text-sm font-semibold text-white/85">Real-time video on every booking</p>
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
                      <div key={label} className="rounded-[24px] border border-white/10 bg-white/8 p-5 text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-black tracking-tight">{label}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{sub}</p>
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
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              { to: 50000, suffix: '+', label: 'Repairs Completed' },
              { to: 4, suffix: '.9★', label: 'Average Rating' },
              { to: 112, suffix: '+', label: 'Models Supported' },
              { to: 60, suffix: ' min', label: 'Average Repair Time' },
            ].map(({ to, suffix, label }) => (
              <div key={label} className="rounded-2xl bg-gray-50 px-4 py-4">
                <p className="text-2xl font-black text-gray-950 sm:text-3xl">
                  <Counter to={to} suffix={suffix} />
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">{label}</p>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                      <div className="hidden lg:block absolute top-1/2 -right-2.5 h-0.5 w-5 bg-gradient-to-r from-cyan-400/40 to-transparent" />
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
                  <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: brand.color }} />
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ background: brand.color }}>
                    {brand.name.slice(0, 1)}
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
                    className={`group flex items-center gap-3 rounded-[20px] border p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? 'border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    <MapPin className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-200' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <div className="min-w-0">
                      <p className="font-bold leading-tight">{loc.name}</p>
                      <p className={`text-[10px] font-medium ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>Mobile Repair</p>
                    </div>
                    {isActive && <CheckCircle className="ml-auto h-4 w-4 text-white" />}
                  </motion.a>
                );
              })}
            </motion.div>
            <p className="mt-8 text-center text-xs text-gray-500">
              Don&apos;t see your area?{' '}
              <button onClick={() => navigate(repairPath)} className="font-semibold text-blue-600 hover:underline">
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
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
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
              {testimonials.map((t, i) => (
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
                    <img src={t.image} alt={t.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-blue-100" />
                    <div>
                      <p className="text-sm font-bold text-gray-950">{t.name}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
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

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#05080f] py-16 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-0 left-1/2 h-[280px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[90px]" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              <Zap className="h-3.5 w-3.5" /> Instant Pricing · Same Day Repair
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Fix Your Phone Today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Get an instant quote in 30 seconds. Free pickup from your door. Watch the repair live.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate(repairPath)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-base font-black text-black transition-transform hover:scale-[1.02]"
              >
                Get Instant Quote →
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-8 py-4 text-base font-semibold text-emerald-300 transition-all hover:bg-emerald-500/15"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-white/45">
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
