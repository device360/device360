import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock3,
  Star,
  MapPin,
  X,
  Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const phones = [
  {
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    image: '/phone_images/apple/iPhone_16_Pro_Max.jpg',
  },
  {
    name: 'Galaxy S25 Ultra',
    brand: 'Samsung',
    image: '/phone_images/samsung/Galaxy_S25_Ultra.jpg',
  },
  {
    name: 'OnePlus 13',
    brand: 'OnePlus',
    image: '/phone_images/oneplus/OnePlus_13.jpg',
  },
  {
    name: 'Pixel 9 Pro',
    brand: 'Google',
    image: '/phone_images/pixel/Pixel_9_Pro.jpg',
  },
  {
    name: 'Xiaomi 15 Ultra',
    brand: 'Xiaomi',
    image: '/phone_images/xiaomi/Xiaomi_15_Ultra.jpg',
  },
  {
    name: 'vivo X200 Pro',
    brand: 'Vivo',
    image: '/phone_images/vivo/vivo_X200_Pro.jpg',
  },
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
  { name: 'Whitefield', slug: 'whitefield', lat: 12.9698, lon: 77.7500, radiusKm: 8 },
  { name: 'Marathahalli', slug: 'marathahalli', lat: 12.9561, lon: 77.7015, radiusKm: 6 },
  { name: 'Indiranagar', slug: 'indiranagar', lat: 12.9719, lon: 77.6412, radiusKm: 6 },
  { name: 'Koramangala', slug: 'koramangala', lat: 12.9352, lon: 77.6245, radiusKm: 6 },
  { name: 'HSR Layout', slug: 'hsr-layout', lat: 12.9116, lon: 77.6412, radiusKm: 6 },
  { name: 'Electronic City', slug: 'electronic-city', lat: 12.8452, lon: 77.6600, radiusKm: 8 },
  { name: 'Bannerghatta Road', slug: 'bannerghatta-road', lat: 12.9000, lon: 77.6000, radiusKm: 7 },
  { name: 'Jayanagar', slug: 'jayanagar', lat: 12.9250, lon: 77.5938, radiusKm: 6 },
  { name: 'Malleshwaram', slug: 'malleshwaram', lat: 13.0030, lon: 77.5660, radiusKm: 7 },
  { name: 'Yelahanka', slug: 'yelahanka', lat: 13.1000, lon: 77.5963, radiusKm: 8 },
  { name: 'Sarjapur Road', slug: 'sarjapur-road', lat: 12.9141, lon: 77.7070, radiusKm: 7 },
  { name: 'Hoskote', slug: 'hoskote', lat: 13.0700, lon: 77.7890, radiusKm: 10 },
];

const LOCATION_STORAGE_KEY = 'device360Location';
const LOCATION_CONFIRMED_KEY = 'device360LocationConfirmed';

const toSlug = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, '-');

const resolveStoredLocation = (value: string | null) => {
  if (!value) return null;

  const normalized = value.toLowerCase().trim();

  return (
    SERVE_LOCATIONS.find(
      (loc) =>
        loc.slug === normalized ||
        loc.name.toLowerCase() === normalized ||
        toSlug(loc.name) === normalized
    ) || null
  );
};

const haversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
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

export const LandingPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [detectedLabel, setDetectedLabel] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const hasResolvedLocation = useRef(false);

  const filteredPhones = useMemo(() => {
    return phones.filter((phone) =>
      `${phone.brand} ${phone.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const filteredLocations = useMemo(() => {
    return SERVE_LOCATIONS.filter((location) =>
      `${location.name} ${location.slug}`
        .toLowerCase()
        .includes(locationSearch.toLowerCase())
    );
  }, [locationSearch]);

  useEffect(() => {
    if (hasResolvedLocation.current) return;
    hasResolvedLocation.current = true;

    const confirmed = localStorage.getItem(LOCATION_CONFIRMED_KEY) === 'true';
    const storedLocation = resolveStoredLocation(
      localStorage.getItem(LOCATION_STORAGE_KEY)
    );

    if (confirmed && storedLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, storedLocation.name);
      navigate(`/mobile-repair-${storedLocation.slug}`, { replace: true });
    }
  }, [navigate]);

  const handleLocationSelect = (location: { name: string; slug: string }) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, location.name);
    localStorage.setItem(LOCATION_CONFIRMED_KEY, 'true');
    setShowLocationPicker(false);
    navigate(`/mobile-repair-${location.slug}`);
  };

  const openLocationFlow = () => {
    const confirmed = localStorage.getItem(LOCATION_CONFIRMED_KEY) === 'true';
    const storedLocation = resolveStoredLocation(
      localStorage.getItem(LOCATION_STORAGE_KEY)
    );

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
          position.coords.longitude
        );

        setIsLocating(false);

        if (detected) {
          localStorage.setItem(LOCATION_STORAGE_KEY, detected.name);
          localStorage.setItem(LOCATION_CONFIRMED_KEY, 'true');
          navigate(`/mobile-repair-${detected.slug}`);
          return;
        }

        setDetectedLabel(
          'We could not confirm your exact area. Please choose your location.'
        );
        setShowLocationPicker(true);
      },
      () => {
        setIsLocating(false);
        setDetectedLabel(
          'Location permission was not granted. Please choose your area.'
        );
        setShowLocationPicker(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 300000,
      }
    );
  };

  const handleRepairClick = () => {
    openLocationFlow();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [180, 90, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl"
        />

        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl"
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        {/* Hero */}
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                India’s Fastest Repair Platform
              </span>
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Premium
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {' '}
                Mobile Repair
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300 sm:text-lg">
              Search your device model instantly and book premium doorstep
              repair service with live tracking, original parts, and same-day
              repair.
            </p>

            {/* Search Bar */}
            <div className="relative mt-10">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-30 blur-xl" />

              <div className="relative flex items-center rounded-3xl border border-white/10 bg-white/10 p-2 backdrop-blur-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Search className="h-5 w-5 text-cyan-300" />
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your phone model..."
                  className="h-14 flex-1 bg-transparent px-4 text-white placeholder:text-gray-400 outline-none"
                />

                <button
                  onClick={() => navigate('/repair')}
                  className="flex h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-bold transition-all hover:scale-105"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openLocationFlow}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 font-bold text-white backdrop-blur-xl transition-all hover:bg-white/15"
              >
                {isLocating ? (
                  <>
                    Detecting
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Start
                    <MapPin className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleRepairClick}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-bold transition-all hover:scale-105"
              >
                Repair
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/repair')}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white/90 backdrop-blur-xl transition-all hover:bg-white/10"
              >
                Check Price
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                {
                  icon: Clock3,
                  label: '60 Min',
                  sub: 'Repair',
                },
                {
                  icon: ShieldCheck,
                  label: '6 Months',
                  sub: 'Warranty',
                },
                {
                  icon: Zap,
                  label: 'Live',
                  sub: 'Tracking',
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
                      <Icon className="h-6 w-6 text-cyan-300" />
                    </div>

                    <p className="text-lg font-black">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.sub}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-5">
              {filteredPhones.map((phone, index) => (
                <motion.div
                  key={phone.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                  }}
                  className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {phone.brand}
                      </span>

                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />
                        <span className="text-xs font-bold">4.9</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <motion.img
                        whileHover={{
                          rotate: -5,
                          scale: 1.08,
                        }}
                        src={phone.image}
                        alt={phone.name}
                        className="h-44 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
                      />
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-black text-white sm:text-base">
                        {phone.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Screen • Battery • Camera • Speaker
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Location chooser only when needed */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowLocationPicker(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1020] shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
                    Location Permission
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    Confirm your area
                  </h2>
                </div>

                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Close location picker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 pb-2 pt-4 sm:px-6">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  {detectedLabel ||
                    'Allow location access or choose your area to continue.'}
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
                      onClick={() => handleLocationSelect(location)}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:border-cyan-400/30 hover:bg-white/10"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {location.name}
                        </p>
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
    </div>
  );
};