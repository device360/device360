import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wrench,
  Video,
  Shield,
  Eye,
  ShieldCheck,
  BellOff,
  Star,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

const bgImage = '/src/assets/images/lab_repair_back_1779953326469.png';
import ModelSelector from '../components/ModelSelector';
import LiveDashboard from '../components/LiveDashboard';

export interface PhoneModel {
  id: string;
  name: string;
  generation: string;
}

export interface RepairIssue {
  id: string;
  name: string;
  iconName: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
}

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  time?: string;
}

export const PHONE_MODELS: PhoneModel[] = [
  { id: 'ip15pm', name: 'iPhone 15 Pro Max', generation: '15' },
  { id: 'ip15p', name: 'iPhone 15 Pro', generation: '15' },
  { id: 'ip15', name: 'iPhone 15', generation: '15' },
  { id: 'ip14pm', name: 'iPhone 14 Pro Max', generation: '14' },
  { id: 'ip14p', name: 'iPhone 14 Pro', generation: '14' },
  { id: 'ip14', name: 'iPhone 14', generation: '14' },
  { id: 'ip13pm', name: 'iPhone 13 Pro Max', generation: '13' },
  { id: 'ip13p', name: 'iPhone 13 Pro', generation: '13' },
  { id: 'ip13', name: 'iPhone 13', generation: '13' },
  { id: 'ip12p', name: 'iPhone 12 Pro', generation: '12' },
  { id: 'ip12', name: 'iPhone 12', generation: '12' },
  { id: 'ip11p', name: 'iPhone 11 Pro', generation: '11' },
  { id: 'ip11', name: 'iPhone 11', generation: '11' },
];

export const REPAIR_ISSUES: RepairIssue[] = [
  {
    id: 'screen',
    name: 'Front Screen Glass & OLED',
    iconName: 'Smartphone',
    description:
      'Cracked outer glass, display lines, or unresponsive touch. Replaced with genuine ultra-retina panel.',
    basePrice: 199,
    durationMinutes: 45,
  },
  {
    id: 'battery',
    name: 'OEM Battery Replacement',
    iconName: 'Battery',
    description:
      'Battery health degraded under 80%, swelling, or rapid draining. Replaced with original cell & cycle reset.',
    basePrice: 79,
    durationMinutes: 30,
  },
  {
    id: 'backglass',
    name: 'Rear Back Glass Shattered',
    iconName: 'Layers',
    description:
      'Spiderweb cracks on the back panel. Removed cleanly via high-precision laser separation and custom glass refit.',
    basePrice: 109,
    durationMinutes: 60,
  },
  {
    id: 'camera',
    name: 'Main / Ultrawide Camera Module',
    iconName: 'Camera',
    description:
      'Shaking optical stabilization lens, dark spots, or cracked zoom modules. Swapped with authentic optics.',
    basePrice: 149,
    durationMinutes: 40,
  },
  {
    id: 'charging',
    name: 'Charging Port & Connectors',
    iconName: 'Zap',
    description:
      'Loose connection or zero charger detection. High-precision solder replacement of target port sub-board.',
    basePrice: 89,
    durationMinutes: 35,
  },
];

export default function AdLandingPage() {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();

  const [viewState, setViewState] = useState<'landing' | 'calculator' | 'streaming'>('landing');

  const [activeBooking, setActiveBooking] = useState<{
    model: any;
    issue: any;
    price: number;
    name: string;
    phone: string;
    address: string;
  } | null>(null);

  const quoteBoxRef = useRef<HTMLDivElement>(null);

  const brandPagePath = location ? `/${location}/repair` : '/repair';

  const goToBrandPage = () => {
    navigate(brandPagePath);
  };

  const scrollToQuote = () => {
    setViewState('calculator');
    setTimeout(() => {
      quoteBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleBookingCompleted = (details: any) => {
    setActiveBooking(details);
    setViewState('streaming');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-[#00bdff]/30 selection:text-white">
      {viewState === 'streaming' && (
        <div className="border-b border-[#00bdff]/20 bg-gradient-to-r from-green-500/10 via-[#00bdff]/10 to-green-500/10 px-4 py-2 text-center text-[11px] font-mono text-[#00bdff] sm:text-xs">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
            <span>
              🎉 <strong>Simulation Active:</strong> You successfully booked a pickup!
            </span>
            <span className="hidden sm:inline">|</span>
            <span>
              Click <strong>&quot;Advance State&quot;</strong> on the Process Timeline panel to see the live
              micro-soldering laser video feed!
            </span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/90 px-4 py-3 backdrop-blur-md sm:px-6 md:px-10 md:py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex cursor-pointer items-center gap-2 self-start"
            onClick={() => setViewState('landing')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00bdff] to-[#01e0c9] p-0.5 shadow-[0_0_15px_rgba(0,189,255,0.3)]">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#030712]">
                <Wrench className="h-4 w-4 text-[#00bdff]" />
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-white">
              Device<span className="text-[#00bdff]">360</span>
            </span>
          </div>

          <div className="flex w-fit items-center gap-1.5 self-start rounded-full border border-[#00bdff]/20 bg-[#00bdff]/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#00bdff] sm:self-auto">
            <span>4.9/5</span>
            <Star className="h-3.5 w-3.5 fill-current text-[#00bdff]" />
          </div>
        </div>
      </header>

      <main className="pb-16 sm:pb-20">
        <AnimatePresence mode="wait">
          {viewState === 'landing' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 sm:space-y-16"
            >
              <section
                className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.98) 100%), url(${bgImage})`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 select-none bg-grid-overlay opacity-25" />

                <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center space-y-6 text-center sm:space-y-8">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300 sm:text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#00bdff]" />
                    <span>Watch live from your device</span>
                  </div>

                  <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-6xl">
                    Instant 60-Min Lab Repair for your <span className="text-[#00bdff]">iPhone</span>
                  </h1>

                  <p className="max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg">
                    Watch your phone get fixed LIVE on camera. 100% Data-Secure. Free 15-min doorstep pickup in your area.
                  </p>

                  <div className="flex max-w-3xl flex-wrap justify-center gap-2.5 text-[11px] font-mono sm:text-xs">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-gray-300 sm:px-4">
                      <Video className="h-3.5 w-3.5 text-[#00bdff]" />
                      <span>Live Streamed</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-gray-300 sm:px-4">
                      <Wrench className="h-3.5 w-3.5 text-[#00bdff]" />
                      <span>OEM Parts</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-gray-300 sm:px-4">
                      <Shield className="h-3.5 w-3.5 text-[#00bdff]" />
                      <span>100% Data-Secure</span>
                    </div>
                  </div>

                  <div className="mt-8 w-full max-w-md overflow-hidden rounded-2xl border border-[#1b2b5a] bg-[#070c20]/90 shadow-2xl backdrop-blur-md">
                    <div className="border-b border-[#1b2b5a] bg-gradient-to-r from-[#091535] to-[#070e28] p-4 text-center sm:p-5">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#00bdff] sm:text-base md:text-lg">
                        Select Your Model &amp; Check Price
                      </h3>
                    </div>

                    <div className="flex flex-col items-center p-4 sm:p-6">
                      <button
                        onClick={goToBrandPage}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bdff] px-5 py-3.5 text-sm font-bold text-[#070c20] shadow-lg shadow-cyan-500/20 transition duration-150 hover:bg-[#00d6ff] active:scale-[0.99] sm:py-4 sm:text-base"
                      >
                        <span>Go to Brand Page</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                      <p className="mt-3 text-xs font-medium text-gray-400 sm:mt-4">
                        Takes 60 seconds. No upfront payment.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 md:px-10">
                <div className="space-y-3 text-center">
                  <h2 className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
                    We don't keep your phone overnight. Here is how it works:
                  </h2>
                </div>

                <div className="relative mx-auto max-w-2xl space-y-10 pl-8 sm:pl-10 md:pl-16">
                  <div className="absolute bottom-5 left-[15px] top-5 w-[2px] bg-[#14224c] sm:left-[20px] md:left-[32px]" />

                  <div className="relative">
                    <div className="absolute -left-[27px] top-0 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-sky-400 bg-[#030712] shadow-[0_0_12px_#00bdff] transition group-hover:scale-110 sm:-left-[32px] md:-left-[50px]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00bdff]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold tracking-wide text-white sm:text-lg">
                        Secure 15-Min Pickup
                      </h4>
                      <p className="text-sm leading-relaxed font-light text-gray-400">
                        Hand your phone in a tamper-proof bag directly to our logistics partner.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[27px] top-0 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-green-400 bg-[#030712] shadow-[0_0_15px_rgba(34,197,94,0.7)] transition sm:-left-[32px] md:-left-[50px]">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="flex items-center gap-2 text-base font-bold tracking-wide text-green-400 sm:text-lg">
                        <span>Lab Repair &amp; Live Stream</span>
                      </h4>
                      <p className="text-sm leading-relaxed font-normal text-gray-300">
                        Watch our techs fix it live with OEM parts through our secure customer dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[27px] top-0 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-sky-400 bg-[#030712] shadow-[0_0_12px_#00bdff] transition sm:-left-[32px] md:-left-[50px]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00bdff]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold tracking-wide text-white sm:text-lg">
                        Express Drop-off
                      </h4>
                      <p className="text-sm leading-relaxed font-light text-gray-400">
                        Repaired and returned to your location within the hour, guaranteed.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 md:px-10">
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Why 10,000+ customers trust our Dark Labs.
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-[#111c47] bg-[#070c20]/60 p-5 transition duration-300 hover:border-sky-500/30 sm:p-6">
                    <div className="w-fit rounded-xl border border-[#00bdff]/20 bg-[#00bdff]/10 p-3 text-[#00bdff]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-wide text-white sm:text-lg">
                      Zero Data Theft Risk
                    </h3>
                    <p className="text-sm leading-relaxed font-light text-gray-400">
                      Advanced protocols ensure your private data stays private.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-[#111c47] bg-[#070c20]/60 p-5 transition duration-300 hover:border-sky-500/30 sm:p-6">
                    <div className="w-fit rounded-xl border border-[#00bdff]/20 bg-[#00bdff]/10 p-3 text-[#00bdff]">
                      <Eye className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-wide text-white sm:text-lg">
                      Total Transparency
                    </h3>
                    <p className="text-sm leading-relaxed font-light text-gray-400">
                      Every screw and component recorded on high-def video.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-[#111c47] bg-[#070c20]/60 p-5 transition duration-300 hover:border-sky-500/30 sm:p-6">
                    <div className="w-fit rounded-xl border border-[#00bdff]/20 bg-[#00bdff]/10 p-3 text-[#00bdff]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-wide text-white sm:text-lg">
                      6-Month Warranty
                    </h3>
                    <p className="text-sm leading-relaxed font-light text-gray-400">
                      No-questions-asked protection on all parts and labor.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-[#111c47] bg-[#070c20]/60 p-5 transition duration-300 hover:border-sky-500/30 sm:p-6">
                    <div className="w-fit rounded-xl border border-[#00bdff]/20 bg-[#00bdff]/10 p-3 text-[#00bdff]">
                      <BellOff className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-wide text-white sm:text-lg">
                      No Daily Disruptions
                    </h3>
                    <p className="text-sm leading-relaxed font-light text-gray-400">
                      Fastest turnaround in the industry. Back in an hour.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
                <div className="rounded-3xl border border-[#1b2b5a]/40 bg-gradient-to-r from-[#050a1d] via-[#091535] to-[#050a1d] px-5 py-10 text-center sm:px-8 sm:py-12">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Ready to book your livestream repair?
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-sm font-light text-gray-400">
                    Tap below to jump straight to the brand selection page and start your repair quote.
                  </p>
                  <button
                    onClick={goToBrandPage}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bdff] px-6 py-3.5 text-sm font-bold text-[#030712] shadow-md transition hover:bg-[#00d6ff] sm:w-auto"
                  >
                    <span>Select Brand &amp; Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {viewState === 'calculator' && (
            <motion.div
              ref={quoteBoxRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-10 sm:px-6 sm:py-12"
            >
              <div className="mx-auto mb-8 max-w-xl space-y-2 text-center">
                <h2 className="text-2xl font-extrabold tracking-wide text-white md:text-3xl">
                  Check Diagnostic Estimate
                </h2>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-mono">
                  Real-Time Mechanical Pricing Matrix
                </p>
              </div>

              <ModelSelector onBack={() => setViewState('landing')} onBooked={handleBookingCompleted} />
            </motion.div>
          )}

          {viewState === 'streaming' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="px-4 py-6 sm:px-6"
            >
              <div className="mx-auto mb-6 flex max-w-6xl flex-col items-start justify-between gap-4 border-b border-[#1b2b5a]/40 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-1 font-mono text-xs font-medium text-amber-400">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                    <span>SECURE PASSCODE STREAM SESSION</span>
                  </div>
                  <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">
                    {activeBooking?.model?.name} Live Stream Dashboard
                  </h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to stop telemetry monitoring and return to the main gate?'
                        )
                      ) {
                        setActiveBooking(null);
                        setViewState('landing');
                      }
                    }}
                    className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/15"
                  >
                    Disconnect Feed
                  </button>
                </div>
              </div>

              {activeBooking && (
                <LiveDashboard
                  booking={activeBooking}
                  onReset={() => {
                    setActiveBooking(null);
                    setViewState('landing');
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto mt-14 max-w-6xl border-t border-[#1b2b5a]/20 px-4 py-8 text-center text-[11px] text-gray-500 sm:px-6 sm:text-xs">
        <p>© 2026 Device360 Inc. All repairs carried out live in class-100 dark clean laboratories.</p>
        <p className="mt-1">All brands, symbols or designations are registered marks of their respective patent holders.</p>
      </footer>
    </div>
  );
}
