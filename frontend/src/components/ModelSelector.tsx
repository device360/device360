import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Sparkles
} from 'lucide-react';
import { PHONE_MODELS, REPAIR_ISSUES, PhoneModel, RepairIssue } from '../types';

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
  
  // Form details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic calculations
  const calculateTotal = () => {
    if (!selectedIssue) return 0;
    // Base price + premium if it is 15 series, or discount for older devices
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
    // Simulate API call before generating the live dynamic dashboard
    setTimeout(() => {
      setLoading(false);
      onBooked({
        model: selectedModel,
        issue: selectedIssue,
        price: currentPrice,
        name,
        phone,
        address
      });
    }, 1200);
  };

  // Icon mapping
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
    <div id="price-calculator" className="w-full max-w-lg mx-auto bg-[#070c20]/95 border border-[#1b2b5a] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="p-5 border-b border-[#1b2b5a] bg-[#091130] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else onBack();
            }}
            className="p-2 transition rounded-lg hover:bg-white/5 text-[#00bdff]"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-white text-md">Diagnostic Lab Quote</h3>
            <p className="text-xs text-gray-400">Step {step} of 3: {step === 1 ? 'Select Device' : step === 2 ? 'Identify Defect' : 'Doorstep Logistics'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-[#00bdff]/10 text-[#00bdff] rounded-full text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>INSTANT ESTIMATE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#0f1d43]">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#00bdff] to-[#01e0c9]" 
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Form Fields / Selector Panels */}
      <div className="p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white">Which model needs lab repair?</h4>
              <p className="text-sm text-gray-400">We source certified OEM components calibrated specifically for each generation.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {PHONE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`p-4 rounded-xl border text-left transition duration-200 cursor-pointer ${
                    selectedModel?.id === model.id
                      ? 'bg-[#00bdff]/10 border-[#00bdff] text-white'
                      : 'border-[#1b2b5a] bg-[#0c1638]/50 text-gray-300 hover:border-[#2f4991] hover:bg-[#0c1638]'
                  }`}
                >
                  <p className="font-medium text-sm text-white">{model.name}</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">Calibrated Repair Profile</p>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 italic mt-2">
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
            <div className="flex items-center gap-3 justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">What mechanical issue is present?</h4>
                <p className="text-sm text-gray-400">Select the primary symptom to adjust equipment parameters.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Targeting</span>
                <p className="text-xs font-bold text-[#00bdff] truncate max-w-[120px]">{selectedModel?.name}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {REPAIR_ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue)}
                  className={`w-full p-4 rounded-xl border text-left flex gap-4 items-start transition duration-200 cursor-pointer ${
                    selectedIssue?.id === issue.id
                      ? 'bg-[#00bdff]/10 border-[#00bdff] text-white'
                      : 'border-[#1b2b5a] bg-[#0c1638]/50 text-gray-300 hover:border-[#2f4991] hover:bg-[#0c1638]'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    selectedIssue?.id === issue.id 
                    ? 'bg-[#00bdff]/20 border-[#00bdff] text-[#00bdff]' 
                    : 'bg-[#142352] border-[#253f88] text-gray-400'
                  }`}>
                    {renderIcon(issue.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold text-sm text-white truncate">{issue.name}</p>
                      <span className="font-mono text-sm text-[#00bdff] font-bold">
                        ${selectedModel ? selectedIssue?.id === issue.id ? currentPrice : issue.basePrice + (selectedModel.generation === '15' ? 20 : selectedModel.generation === '14' ? 10 : selectedModel.generation === '12' ? -10 : selectedModel.generation === '11' ? -20 : 0) : issue.basePrice}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 md:line-clamp-none">{issue.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3 h-3 text-[#00bdff]" />
                      <span>{issue.durationMinutes} Min Process Timeline</span>
                    </div>
                  </div>
                </button>
              ))}
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
              <p className="text-sm text-gray-400">Our courier arrives in a secure, tamper-proof lock-box within 15 minutes of booking.</p>
            </div>

            {/* Price Quote Summary Mini-Card */}
            <div className="p-4 rounded-xl bg-[#091130] border border-[#1b2b5a] space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Selected Device:</span>
                <span className="text-white font-semibold">{selectedModel?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Repair Service:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  {selectedIssue && renderIcon(selectedIssue.iconName)}
                  {selectedIssue?.name}
                </span>
              </div>
              <div className="h-[1px] bg-[#1b2b5a] my-2" />
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Doorstep Courier Fee:</span>
                <span className="text-green-400 font-mono font-semibold">FREE (Covered)</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Diagnostics & Camera Stream:</span>
                <span className="text-green-400 font-mono font-semibold">FREE</span>
              </div>
              <div className="h-[1px] bg-[#1b2b5a] my-2" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-white">Full Estimated Total:</span>
                <div className="text-right">
                  <p className="text-xl font-mono font-extrabold text-[#00bdff]">${currentPrice}</p>
                  <p className="text-[10px] text-gray-400">Pay only AFTER dynamic fix is completed</p>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a122c] border border-[#1b2b5a] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Callback Mobile Number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a122c] border border-[#1b2b5a] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your Complete Address (Doorstep pickup)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a122c] border border-[#1b2b5a] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00bdff] focus:ring-1 focus:ring-[#00bdff]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs leading-relaxed">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span><strong>Security Guarantee:</strong> Your camera livestream dashboard requires temporary passcode authorization. Data stands strictly protected under military-grade privacy vaults.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold bg-[#00bdff] text-[#070c20] hover:bg-[#00d6ff] active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 text-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#070c20] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Book Free 15-Min Pickup</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Info footer */}
      <div className="p-4 bg-[#050a1b] border-t border-[#1b2b5a] flex items-center gap-2 text-center text-xs text-gray-500 justify-center">
        <Info className="w-3.5 h-3.5 text-[#00bdff]" />
        <span>Watch the camera feed livestream as soon as the phone enters the lab!</span>
      </div>
    </div>
  );
}
