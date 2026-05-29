import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Battery,
  Layers,
  Camera,
  Zap,
  ChevronRight,
  Info,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PHONE_MODELS, REPAIR_ISSUES, type PhoneModel, type RepairIssue } from '../../types';

interface BookingDetails {
  model: PhoneModel;
  issue: RepairIssue;
  price: number;
  name: string;
  phone: string;
  address: string;
}

interface ModelSelectorProps {
  onBack: () => void;
  onBooked: (details: BookingDetails) => void;
}

export default function ModelSelector({ onBack, onBooked }: ModelSelectorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<RepairIssue | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!selectedIssue) return 0;

    let modifier = 0;
    if (selectedModel) {
      if (selectedModel.generation === '15') modifier = 20;
      if (selectedModel.generation === '14') modifier = 10;
      if (selectedModel.generation === '12') modifier = -10;
      if (selectedModel.generation === '11') modifier = -20;
    }

    return selectedIssue.basePrice + modifier;
  };

  const currentPrice = calculateTotal();

  const handleModelSelect = (model: PhoneModel) => {
    setSelectedModel(model);
    setStep(2);
  };

  const handleIssueSelect = (issue: RepairIssue) => {
    setSelectedIssue(issue);
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel || !selectedIssue || !name || !phone || !address) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onBooked({
        model: selectedModel,
        issue: selectedIssue,
        price: currentPrice,
        name,
        phone,
        address,
      });
    }, 1200);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Battery':
        return <Battery className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <div
      id="price-calculator"
      className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#1b2b5a] bg-[#070c20]/95 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[#1b2b5a] bg-[#091130] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else onBack();
            }}
            className="rounded-lg p-2 text-[#00bdff] transition hover:bg-white/5"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h3 className="text-md font-bold text-white">Diagnostic Lab Quote</h3>
            <p className="text-xs text-gray-400">
              Step {step} of 3: {step === 1 ? 'Select Device' : step === 2 ? 'Identify Defect' : 'Doorstep Logistics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-[#00bdff]/10 px-3 py-1 text-xs font-mono font-semibold text-[#00bdff]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>INSTANT ESTIMATE</span>
        </div>
      </div>

      <div className="h-1 w-full bg-[#0f1d43]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00bdff] to-[#01e0c9]"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-5 sm:p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white">Which model needs lab repair?</h4>
              <p className="text-sm text-gray-400">
                We source certified OEM components calibrated specifically for each generation.
              </p>
            </div>

            <div className="grid max-h-[340px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {PHONE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition duration-200 ${
                    selectedModel?.id === model.id
                      ? 'border-[#00bdff] bg-[#00bdff]/10 text-white'
                      : 'border-[#1b2b5a] bg-[#0c1638]/50 text-gray-300 hover:border-[#2f4991] hover:bg-[#0c1638]'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{model.name}</p>
                  <p className="mt-1 text-[11px] font-mono text-gray-400">Calibrated Repair Profile</p>
                </button>
              ))}
            </div>

            <p className="mt-2 text-center text-xs italic text-gray-500">
              Don't see your version? Select the closest generation for real-time pricing.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-white">What mechanical issue is present?</h4>
                <p className="text-sm text-gray-400">Select the primary symptom to adjust equipment parameters.</p>
              </div>

              <div className="max-w-[120px] text-right">
                <span className="text-xs text-gray-400">Targeting</span>
                <p className="truncate text-xs font-bold text-[#00bdff]">{selectedModel?.name}</p>
              </div>
            </div>

            <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
              {REPAIR_ISSUES.map((issue) => {
                const issuePrice =
                  issue.basePrice +
                  (selectedModel?.generation === '15'
                    ? 20
                    : selectedModel?.generation === '14'
                      ? 10
                      : selectedModel?.generation === '12'
                        ? -10
                        : selectedModel?.generation === '11'
                          ? -20
                          : 0);

                return (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueSelect(issue)}
                    className={`flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition duration-200 ${
                      selectedIssue?.id === issue.id
                        ? 'border-[#00bdff] bg-[#00bdff]/10 text-white'
                        : 'border-[#1b2b5a] bg-[#0c1638]/50 text-gray-300 hover:border-[#2f4991] hover:bg-[#0c1638]'
                    }`}
                  >
                    <div
                      className={`rounded-lg border p-2.5 ${
                        selectedIssue?.id === issue.id
                          ? 'border-[#00bdff] bg-[#00bdff]/20 text-[#00bdff]'
                          : 'border-[#253f88] bg-[#142352] text-gray-400'
                      }`}
                    >
                      {renderIcon(issue.iconName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">{issue.name}</p>
                        <span className="font-mono text-sm font-bold text-[#00bdff]">
                          ${selectedModel ? (selectedIssue?.id === issue.id ? currentPrice : issuePrice) : issue.basePrice}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-400 md:line-clamp-none">{issue.description}</p>

                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                        <Clock className="h-3 w-3 text-[#00bdff]" />
                        <span>{issue.durationMinutes} Min Process Timeline</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-lg font-bold text-white">Book Courier Dispatch</h4>
              <p className="text-sm text-gray-400">
                Our courier arrives in a secure, tamper-proof lock-box within 15 minutes of booking.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-[#1b2b5a] bg-[#091130] p-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Selected Device:</span>
                <span className="font-semibold text-white">{selectedModel?.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Repair Service:</span>
                <span className="flex items-center gap-1 font-semibold text-white">
                  {selectedIssue && renderIcon(selectedIssue.iconName)}
                  {selectedIssue?.name}
                </span>
              </div>

              <div className="my-2 h-px bg-[#1b2b5a]" />

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Doorstep Courier Fee:</span>
                <span className="font-mono font-semibold text-green-400">FREE (Covered)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Diagnostics & Camera Stream:</span>
                <span className="font-mono font-semibold text-green-400">FREE</span>
              </div>

              <div className="my-2 h-px bg-[#1b2b5a]" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-white">Full Estimated Total:</span>
                <div className="text-right">
                  <p className="text-xl font-extrabold font-mono text-[#00bdff]">${currentPrice}</p>
                  <p className="text-[10px] text-gray-400">Pay only AFTER dynamic fix is completed</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-[#1b2b5a] bg-[#0a122c] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Callback Mobile Number"
                  className="w-full rounded-xl border border-[#1b2b5a] bg-[#0a122c] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your Complete Address (Doorstep pickup)"
                  className="w-full rounded-xl border border-[#1b2b5a] bg-[#0a122c] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-xs leading-relaxed text-green-400">
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <span>
                  <strong>Security Guarantee:</strong> Your camera livestream dashboard requires temporary
                  passcode authorization. Data stands strictly protected under military-grade privacy vaults.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00bdff] px-6 py-4 text-md font-bold text-[#070c20] transition duration-150 hover:bg-[#00d6ff] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#070c20] border-t-transparent" />
                ) : (
                  <>
                    <span>Confirm & Book Free 15-Min Pickup</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-[#1b2b5a] bg-[#050a1b] p-4 text-center text-xs text-gray-500">
        <Info className="h-3.5 w-3.5 text-[#00bdff]" />
        <span>Watch the camera feed livestream as soon as the phone enters the lab!</span>
      </div>
    </div>
  );
}