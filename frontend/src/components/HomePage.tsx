import { motion } from 'framer-motion';
import video from '../assets/v2.mp4';
import {
  Clock,
  Eye,
  Truck,
  Star,
  ArrowRight,
  Shield,
  CheckCircle,
  Package,
  Settings,
  ThumbsUp,
  Phone,
  MapPin,
  Zap,
  Sparkles,
  Play,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testimonials, brands } from '../data/mockData';

const toPrettyLocation = (slug?: string) => {
  if (!slug) return 'Bengaluru';
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();
  const [currentLocation, setCurrentLocation] = useState('Bengaluru');

  useEffect(() => {
    const syncLocation = () => {
      if (location) {
        const pretty = toPrettyLocation(location);
        setCurrentLocation(pretty);
        localStorage.setItem('device360Location', pretty);
        window.dispatchEvent(new Event('device360-location-change'));
        return;
      }

      setCurrentLocation(localStorage.getItem('device360Location') || 'Bengaluru');
    };

    syncLocation();
    window.addEventListener('storage', syncLocation);
    window.addEventListener('device360-location-change', syncLocation as EventListener);

    return () => {
      window.removeEventListener('storage', syncLocation);
      window.removeEventListener('device360-location-change', syncLocation as EventListener);
    };
  }, [location]);

  const usps = [
    { icon: Eye, title: 'Watch Repair LIVE', desc: 'Real-time video stream of your repair in progress' },
    { icon: Clock, title: '60-Minute Repairs', desc: 'Most repairs finished under an hour in our lab' },
    { icon: Truck, title: 'Free Doorstep Pickup', desc: 'We collect and deliver at your convenience' },
    { icon: Shield, title: '6-Month Warranty', desc: 'Every repair backed by our quality guarantee' },
  ];

  const steps = [
    { n: 1, icon: Settings, title: 'Select Repair', desc: 'Choose your device & issue' },
    { n: 2, icon: Package, title: 'Free Pickup', desc: 'Pickup from your doorstep' },
    { n: 3, icon: Eye, title: 'Watch LIVE', desc: 'See the repair in real-time' },
    { n: 4, icon: ThumbsUp, title: 'Quality Check', desc: 'Tested before delivery' },
    { n: 5, icon: Truck, title: 'Delivered Back', desc: 'Device returned to you' },
  ];

  const popularLocations = [
    'Indiranagar',
    'Koramangala',
    'Whitefield',
    'Marathahalli',
    'HSR Layout',
    'Electronic City',
    'Hoskote',
    'Jayanagar',
  ];

  const orderedLocations = useMemo(() => {
    const list = [currentLocation, ...popularLocations.filter((loc) => loc !== currentLocation)];
    return list;
  }, [currentLocation]);

  const currentSlug = toSlug(currentLocation);
  const homePath = currentSlug === 'bengaluru' ? '/' : `/${currentSlug}`;
  const repairPath = currentSlug === 'bengaluru' ? '/repair' : `/${currentSlug}/repair`;

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)] py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-10 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-sm font-medium text-blue-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9 Rating · 1,000+ Repairs</span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {currentLocation}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-950 leading-none tracking-tight">
                  REPAIR
                  <br />
                  <span className="text-blue-600">RENEW</span>
                  <br />
                  RELAX
                  <br />
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl shadow-[0_6px_20px_rgba(37,99,235,0.35)]">
                    {currentLocation}
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-gray-500 font-medium max-w-xl">
                  India&apos;s most trusted <span className="text-gray-900 font-bold">360° live repair experience</span>.
                  Free pickup, fast repair, transparent pricing, and real-time video updates.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Currently serving {currentLocation}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Free pickup and doorstep repair support tailored for your area.
                </p>
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                {[
                  { value: '42 min', label: 'Avg. repair time' },
                  { value: '6 mo', label: 'Warranty' },
                  { value: '100%', label: 'Live tracking' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-xl p-4 shadow-sm">
                    <p className="text-2xl font-black text-gray-950">{item.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div> */}

              <ul className="space-y-2">
                {[
                  'Instant transparent pricing',
                  'Free doorstep pickup & delivery',
                  'Live video of your repair',
                  'No fix = No charge',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(repairPath)}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                  data-testid="check-price-button"
                >
                  Check Price Instantly
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-base hover:border-blue-300 hover:text-blue-600 transition-all hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  Call Us Now
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">Serving:</span>
                <span className="text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-full shadow-sm">
                  {currentLocation}
                </span>
                <button
                  onClick={() => navigate(repairPath)}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  +more
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="relative"
            >
              <div className="relative rounded-[32px] overflow-hidden border border-white/70 shadow-[0_30px_80px_rgba(15,23,42,0.18)] bg-black">
                <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.10)_0%,rgba(2,6,23,0.03)_40%,rgba(2,6,23,0.18)_100%)]" />

                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]"
                  poster="https://images.unsplash.com/photo-1651493706899-72a59df915ac?w=1200&h=900&fit=crop"
                >
                  <source src={video} type="video/mp4" />
                </video>

                <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-red-600 font-bold text-xs shadow-md border border-white/70">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE Repair Stream
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
                  <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/92 backdrop-blur-md px-4 py-3 shadow-xl border border-white/70 max-w-[72%]">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-bold">Cinematic repair video</p>
                      <p className="text-sm font-bold text-gray-950 truncate">Premium service experience</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-5 -right-3 sm:-right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Service quality</p>
                  <p className="font-bold text-gray-950 text-sm">Premium care</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand logos */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">We repair all major brands</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {brands.map((b) => (
              <span
                key={b.id}
                className="text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors cursor-default"
                data-testid={`brand-logo-${b.id}`}
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Why Device360</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Why thousands choose us</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A repair experience designed to feel premium, transparent, and effortless.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {usps.map((u, i) => {
              const Icon = u.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-default"
                  data-testid={`usp-card-${i}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{u.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{u.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">Five simple steps to get your phone back — better than new.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
                  data-testid={`how-it-works-step-${s.n}`}
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
                    {s.n}
                  </div>
                  <Icon className="w-7 h-7 mx-auto mb-3 text-blue-500 mt-2" />
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Where We Serve</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Repair near {currentLocation}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {orderedLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => navigate(`/${toSlug(loc)}`)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  loc === currentLocation
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                }`}
              >
                <MapPin className="w-3 h-3" /> {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Loved by customers</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="font-bold text-gray-800">4.9 / 5</span>
              <span className="text-gray-400 text-sm">(2,847 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                data-testid={`testimonial-${i}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <div className="flex">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" /> Most repairs done same day
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to get your phone fixed in {currentLocation}?
          </h2>
          <p className="text-blue-100 text-lg mb-8">Check your price in 30 seconds. No commitments.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(repairPath)}
              className="px-10 py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5"
              data-testid="get-quote-button"
            >
              Get Instant Quote →
            </button>
            <a
              href="tel:+919876543210"
              className="px-10 py-4 rounded-2xl bg-white/10 border border-white/30 text-white font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" /> Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};