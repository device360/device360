import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock3,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

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

export const LandingPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredPhones = useMemo(() => {
    return phones.filter((phone) =>
      `${phone.brand} ${phone.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

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
        {/* Navbar */}

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
                {' '}Mobile Repair
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300 sm:text-lg">
              Search your device model instantly and book premium doorstep repair service with live tracking, original parts, and same-day repair.
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
    </div>
  );
};