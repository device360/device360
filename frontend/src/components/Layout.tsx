import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import logo from '../assets/logo3.png';

interface LayoutProps {
  children: React.ReactNode;
}

const POPULAR_LOCATIONS = [
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'Marathahalli',
  'HSR Layout',
  'Bannerghatta Road',
  'Electronic City',
  'Hoskote',
  'Jayanagar',
  'Malleshwaram',
  'Yelahanka',
  'Sarjapur Road',
];

const TOP_BANNER_ITEMS = [
  '⚡ Same-day repair',
  '🚗 Free pickup & delivery',
  '🛡️ 6-month warranty on all repairs',
  '📍 Serving all of Bengaluru',
];

const LOCATION_STORAGE_KEY = 'device360Location';

const setSelectedLocation = (location: string) => {
  localStorage.setItem(LOCATION_STORAGE_KEY, location);
  window.dispatchEvent(new Event('device360-location-change'));
};

const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

const getLocationBasePath = (location: string) => {
  const slug = toSlug(location);
  return slug === 'bengaluru' ? '/' : `/mobile-repair-${slug}`;
};

const getRepairPath = (location: string) => {
  const slug = toSlug(location);
  return slug === 'bengaluru' ? '/repair' : `/mobile-repair-${slug}/repair`;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Bengaluru');
  const navigate = useNavigate();

  useEffect(() => {
    const syncLocation = () => {
      setCurrentLocation(localStorage.getItem(LOCATION_STORAGE_KEY) || 'Bengaluru');
    };

    syncLocation();
    window.addEventListener('storage', syncLocation);
    window.addEventListener('device360-location-change', syncLocation as EventListener);

    return () => {
      window.removeEventListener('storage', syncLocation);
      window.removeEventListener('device360-location-change', syncLocation as EventListener);
    };
  }, []);

  const homePath = getLocationBasePath(currentLocation);
  const repairPath = getRepairPath(currentLocation);

  const handleLocationClick = (loc: string) => {
    const path = getLocationBasePath(loc);

    setSelectedLocation(loc);
    setMobileMenuOpen(false);

    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @keyframes device360-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .device360-marquee {
          display: flex;
          width: max-content;
          animation: device360-marquee 18s linear infinite;
          will-change: transform;
        }

        .device360-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .device360-marquee {
            animation: none;
            transform: none;
          }
        }
      `}</style>

      {/* Top announcement bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white text-xs py-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-blue-700 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-indigo-600 to-transparent" />

        <div className="overflow-hidden">
          <div className="device360-marquee gap-10 px-4 font-medium tracking-wide whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-6 shrink-0 pr-10">
                {TOP_BANNER_ITEMS.map((item, idx) => (
                  <span key={`${item}-${idx}`} className="inline-flex items-center gap-4">
                    <span>{item}</span>
                    {idx !== TOP_BANNER_ITEMS.length - 1 && <span className="opacity-40">|</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={homePath} className="flex items-center shrink-0" data-testid="logo-link">
              <img
                src={logo}
                alt="Device360"
                className="h-10 object-contain brightness-0 invert transition-transform duration-300 hover:scale-105"
              />
            </Link>

            <div className="flex items-center gap-2">
              <a
                href="tel:+919876543210"
                title="Call us"
                data-testid="nav-call-button"
                className="flex items-center justify-center w-10 h-10 rounded-full text-cyan-400 border border-white/20 hover:border-cyan-400 hover:text-white transition-all duration-200"
              >
                <FiPhone className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/9164405840"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp us"
                data-testid="nav-whatsapp-button"
                className="flex items-center justify-center w-10 h-10 rounded-full text-green-400 border border-white/20 hover:border-green-400 hover:text-white transition-all duration-200"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black" data-testid="mobile-menu">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <Link
                to={homePath}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to={repairPath}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get a Quote
              </Link>
              <Link
                to={repairPath}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Track Repair
              </Link>
            </div>

            <div className="px-4 pb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Select location
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLocationClick(loc)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium border transition-all text-left ${
                      currentLocation === loc
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main data-scroll-container>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Device360" className="h-9 object-contain brightness-0 invert opacity-90" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Next-Gen Phone Repairs with <span className="text-white font-medium">Live Repair</span>.
                Transparent pricing, free pickup &amp; delivery, 6-month warranty.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Youtube, href: '#', label: 'YouTube' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Popular Locations
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLocationClick(loc)}
                    className={`text-left text-xs transition-colors leading-relaxed ${
                      currentLocation === loc ? 'text-blue-400 font-semibold' : 'text-gray-500 hover:text-blue-400'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Our Services</h4>
              <ul className="space-y-2">
                {[
                  'Screen Replacement',
                  'Battery Replacement',
                  'Charging Port Repair',
                  'Camera Fix',
                  'Water Damage Repair',
                  'Back Glass Repair',
                  'Laptop Repair',
                  'iPad Repair',
                ].map((s) => (
                  <li key={s}>
                    <Link to={repairPath} className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:+919876543210" className="flex items-start gap-3 group">
                    <Phone className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                      +91 9164405840
                    </span>
                  </a>
                </li>
                <li>
                  <a href="mailto:support@device360.com" className="flex items-start gap-3 group">
                    <Mail className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                      support@device360.com
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Indiranagar, Bengaluru,<br />
                    Karnataka – 560038
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Mon–Sat: 9 AM – 9 PM<br />
                    Sunday: 10 AM – 6 PM
                  </span>
                </li>
              </ul>

              <a
                href="https://wa.me/919164405840"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-all"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 Device360. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((l) => (
                <Link key={l} to="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};