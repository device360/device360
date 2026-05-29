import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Zap,
  CheckCircle2,
  Thermometer,
  Cpu,
  Tv,
  ArrowRight,
  Shield,
  Activity,
  User,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { PhoneModel, RepairIssue, Step } from '../types';

interface BookingDetails {
  model: PhoneModel;
  issue: RepairIssue;
  price: number;
  name: string;
  phone: string;
  address: string;
}

interface LiveDashboardProps {
  booking: BookingDetails;
  onReset: () => void;
}

export default function LiveDashboard({ booking, onReset }: LiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'telemetry'>('stream');
  const [isAudioLive, setIsAudioLive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'microscope' | 'wideshot'>('microscope');
  
  // Custom interactive messages
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'tech'; text: string; time: string }>>([
    { sender: 'tech', text: `Hi ${booking.name}, I am Mihai (Senior Tech #12). I've received your ${booking.model.name}. Perfect tamper-lock verify. Ready to start?`, time: 'Just details' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTechTyping, setIsTechTyping] = useState(false);

  // Time tracker state (simulation timeline progress)
  const [timelineStep, setTimelineStep] = useState(0); 
  // 0: Dispatching Courier, 1: Logistics Transit, 2: Lab Unboxing, 3: Laser/Unscrew Repair, 4: Calibration & QC, 5: Return Trip

  const [microscopeHeat, setMicroscopeHeat] = useState(25);
  const [voltMeasure, setVoltMeasure] = useState(3.82);
  const [hzMeasure, setHzMeasure] = useState(59.9);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Telemetry history
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "07:27:54 [SYSTEM] Booking Confirmed.",
    "07:28:10 [LOGISTICS] Tamper bag #9942 allocated to courier payload.",
    "07:28:45 [LOGISTICS] Courier dispatched.",
  ]);

  // Handle timeline simulation and periodic updates
  useEffect(() => {
    const timelineTimer = setInterval(() => {
      setTimelineStep((prev) => {
        if (prev < 5) {
          const next = prev + 1;
          // Add custom log when step changes
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          let newLog = '';
          let techMsg = '';

          switch (next) {
            case 1:
              newLog = `[LOGISTICS] Courier picked up ${booking.model.name} in tamper bag. Safe lock verified.`;
              techMsg = `I see the logistics team has locked the bag. In 5 minutes it will arrive in the clean room chamber!`;
              break;
            case 2:
              newLog = `[LAB] Package received at Clean Chamber #04. Laser sterilizer decontamination active.`;
              techMsg = `Unboxed. No cosmetic damage besides specified defect. Grounding myself to ESD workbench.`;
              break;
            case 3:
              newLog = `[REPAIR] Starting ${booking.issue.name} procedure. Microscope zoom: 45x. Laser alignment active.`;
              techMsg = `Starting repairs. Watch the live screen - heating frame to release adhesive gasket. Data lines isolated.`;
              break;
            case 4:
              newLog = `[REPAIR] ${booking.issue.name} completed successfully. Running diagnostic calibration checklist...`;
              techMsg = `Component installed! Initiating automated diagnostic sequence. Display calibration has matching serialization.`;
              break;
            case 5:
              newLog = `[QC] Quality control sequence passed, 100/100 calibration index. Packed into return courier envelope.`;
              techMsg = `Perfect fix! No issues found. Returning your device with full 6 months warranty! See you soon.`;
              break;
          }

          if (newLog) {
            setTelemetryLogs((logs) => [...logs, `${timeStr} ${newLog}`]);
          }
          if (techMsg) {
            setIsTechTyping(true);
            setTimeout(() => {
              setMessages((msgs) => [...msgs, { sender: 'tech', text: techMsg, time: timeStr }]);
              setIsTechTyping(false);
            }, 2500);
          }
          return next;
        }
        return prev;
      });
    }, 15000); // Progress every 15s to keep dashboard highly reactive

    return () => clearInterval(timelineTimer);
  }, [booking]);

  // Periodic random fluctuations inside live dashboard
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      if (timelineStep >= 3) {
        setMicroscopeHeat((h) => Math.min(390, Math.max(310, +(h + (Math.random() - 0.5) * 8).toFixed(1))));
        setVoltMeasure((v) => Math.min(4.2, Math.max(3.6, +(v + (Math.random() - 0.5) * 0.1).toFixed(2))));
        setHzMeasure((hz) => Math.min(60.1, Math.max(59.8, +(hz + (Math.random() - 0.5) * 0.05).toFixed(2))));
      } else {
        setMicroscopeHeat(25);
        setVoltMeasure(0);
        setHzMeasure(0);
      }
    }, 1500);

    return () => clearInterval(telemetryInterval);
  }, [timelineStep]);

  // Auto scroll
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [telemetryLogs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTechTyping]);

  // Quick tech simulator answers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = newMessage.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setNewMessage('');
    setIsTechTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes('data') || lower.includes('safe') || lower.includes('photo') || lower.includes('privacy')) {
        reply = "Our main protocol is zero-access data security. We do not require PIN codes; repairs are made purely over localized diagnostic channels. Rest assured, your storage drive is completely physically shielded.";
      } else if (lower.includes('screen') || lower.includes('part') || lower.includes('original') || lower.includes('oem')) {
        reply = `Yes, we use brand-new original certified Apple display aggregates which preserve original liquid retinas, multi-touch panels, and hardware true-tones perfectly.`;
      } else if (lower.includes('how long') || lower.includes('time') || lower.includes('when')) {
        reply = `I will complete this active component replacement in about ${booking.issue.durationMinutes - 10} minutes. It will go straight into full QC testing and dispatch!`;
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        reply = `Hello! Glad to have you online on the camera dashboard. Let me know if you want targeted video angles of the main connector sockets!`;
      } else {
        reply = `Got it! Understood. Proceeding with surgical repair steps now on the clean room table. Feel free to monitor the active power calibration graphs, they are updated in real time.`;
      }

      setMessages((prev) => [...prev, { sender: 'tech', text: reply, time: timeStr }]);
      setIsTechTyping(false);
    }, 2000);
  };

  const stepsList: Step[] = [
    { id: '0', title: '15-Min Doorstep Pickup', subtitle: 'Courier with mechanical lockbag in transit', status: timelineStep === 0 ? 'in-progress' : timelineStep > 0 ? 'completed' : 'pending' },
    { id: '1', title: 'Transit to Lab', subtitle: 'Secure logistics enroute to clean chamber', status: timelineStep === 1 ? 'in-progress' : timelineStep > 1 ? 'completed' : 'pending' },
    { id: '2', title: 'Laser Alignment', subtitle: 'Precision diagnostics overlay scanning chassis', status: timelineStep === 2 ? 'in-progress' : timelineStep > 2 ? 'completed' : 'pending' },
    { id: '3', title: 'Microscopic Clean Repair', subtitle: 'Tech installing certified OEM replacement components', status: timelineStep === 3 ? 'in-progress' : timelineStep > 3 ? 'completed' : 'pending' },
    { id: '4', title: 'Diagnostic Calibration Check', subtitle: 'Automating structural seal and serialization link', status: timelineStep === 4 ? 'in-progress' : timelineStep > 4 ? 'completed' : 'pending' },
    { id: '5', title: 'Express Return Trip', subtitle: 'Courier returning device directly to your door', status: timelineStep === 5 ? 'in-progress' : 'pending' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-[#030712] text-white rounded-3xl border border-[#1b2b5a]/40 shadow-3xl overflow-hidden relative">
      
      {/* Decorative vector background lines represent camera coordinates */}
      <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-gray-600 select-none pointer-events-none flex flex-col items-end gap-0.5">
        <span>CAM: #04_MAC_SYS_REPAIR_ON</span>
        <span>LATENCY: 42ms</span>
        <span>VAULT: SECURE</span>
      </div>

      {/* Main Stream & Interactive Telemetry Content Area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Streaming Video Container */}
        <div className="bg-[#020617] rounded-2xl overflow-hidden border border-[#1e293b] relative group aspect-video">
          
          {/* Microscope View Simulator */}
          <div className="absolute inset-0 w-full h-full bg-[#050a1d]">
            {cameraMode === 'microscope' ? (
              // Microscopic Repair Simulator
              <div className="w-full h-full relative overflow-hidden bg-grid-overlay flex items-center justify-center">
                
                {/* Circuit board silhouette SVG */}
                <svg className="w-4/5 h-4/5 opacity-25 text-cyan-400 absolute self-center" viewBox="0 0 100 100">
                  <path d="M 10 10 H 90 V 90 H 10 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 30 10 V 90 M 70 10 V 90 M 10 30 H 90 M 10 70 H 90" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
                  
                  {/* IC chips */}
                  <rect x="25" y="35" width="20" height="20" rx="2" fill="currentColor" opacity="0.15" />
                  <rect x="55" y="45" width="25" height="15" rx="1" fill="currentColor" opacity="0.15" />
                  
                  {/* Paths */}
                  <path d="M 15 15 L 25 35 M 40 40 L 55 45 M 70 60 L 90 90 M 80 15 L 75 45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                </svg>

                {/* Live animation of repair pointer */}
                {timelineStep === 3 && (
                  <motion.div 
                    className="absolute z-10 w-32 h-32 flex items-center justify-center pointer-events-none"
                    animate={{
                      x: [0, 40, -60, 20, -10, 0],
                      y: [0, -30, 20, -50, 40, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 12,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Glowing point represent heat gun, soldering tip or scanner */}
                    <div className="w-[10px] h-[10px] bg-red-500 rounded-full glow-cyan flex items-center justify-center">
                      <div className="absolute w-8 h-8 rounded-full border border-red-500/20 bg-red-400/10 animate-ping" />
                      <div className="absolute w-24 h-24 rounded-full border border-red-400/10 border-dashed" />
                    </div>
                    {/* Heat/Soldering guide lines */}
                    <div className="left-1/2 top-0 h-32 w-[1px] bg-red-500/10 absolute" />
                    <div className="top-1/2 left-0 w-32 h-[1px] bg-red-500/10 absolute" />
                  </motion.div>
                )}

                {/* Scanning Laser Beam (Timeline step 2) */}
                {timelineStep === 2 && (
                  <motion.div 
                    className="absolute left-0 right-0 h-1 bg-[#00bdff] blur-[2px] glow-cyan shadow-[0_0_25px_#00bdff]"
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  />
                )}

                {/* Dynamic Screen Visual Overlays representing Microscope alignment */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                  {/* Center scope circle */}
                  <div className="w-56 h-56 rounded-full border border-dashed border-[#00bdff]/30 flex items-center justify-center">
                    <div className="w-52 h-52 rounded-full border border-solid border-[#00bdff]/10 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-red-500/40 relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Scope quadrants lines */}
                  <div className="w-4/5 h-[1px] border-t border-white/5 absolute ml-auto mr-auto" />
                  <div className="h-4/5 w-[1px] border-l border-white/5 absolute mt-auto mb-auto" />

                  {/* Corner bounds markers */}
                  <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-cyan-400/60" />
                  <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-cyan-400/60" />
                  <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-cyan-400/60" />
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-cyan-400/60" />
                </div>

                {/* Sub-state simulated microscope camera feeds */}
                <div className="absolute bottom-4 left-4 p-3 bg-[#020617]/90 border border-slate-700/50 rounded-xl max-w-[280px]">
                  <p className="text-[10px] font-mono text-gray-400 tracking-wider">MICROSCOPE ACTIVE SENSOR</p>
                  <p className="text-xs font-bold text-[#00bdff] mt-0.5">{booking.issue.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span>{microscopeHeat}°C</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ESD Safe</span>
                    </div>
                  </div>
                </div>

                {/* Standard screen text if still in courier phase */}
                {timelineStep < 2 && (
                  <div className="absolute inset-0 bg-[#060b1e]/95 flex flex-col items-center justify-center text-center p-6 bg-grid-overlay">
                    <div className="p-4 rounded-full bg-[#00bdff]/10 text-[#00bdff] mb-4 relative">
                      <Activity className="w-10 h-10 animate-pulse-slow" />
                      <div className="absolute inset-0 border-2 border-dashed border-[#00bdff]/30 rounded-full animate-spin [animation-duration:15s]" />
                    </div>
                    <h4 className="text-md font-bold text-white tracking-wide">Waiting for Device Delivery</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1.5 leading-relaxed">
                      Courier is transporting your <strong className="text-[#00bdff]">{booking.model.name}</strong> securely inside our lock-box payload. Stream calibration will start automatically immediately on clean bench arrival.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-[#00bdff] rounded-full text-[11px] font-mono font-medium">
                      <span className="w-2 h-2 bg-[#00bdff] rounded-full animate-ping" />
                      <span>LOGISTICS TRANSIT ENROUTE</span>
                    </div>
                  </div>
                )}

                {/* Complete / Return phase overlay */}
                {timelineStep === 5 && (
                  <div className="absolute inset-0 bg-[#060b1e]/95 flex flex-col items-center justify-center text-center p-6">
                    <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-4 animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-md font-bold text-white">Repair Finalized & Quality Standard Approved</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      Calibration verified at 100%. Your display, battery and core system checks are logged green. Device packed and dispatched back to your address!
                    </p>
                    <button 
                      onClick={onReset}
                      className="mt-5 px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-slate-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Return To Home Screen</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            ) : (
              // Laboratory High-Def Wideshot Screen
              <div className="w-full h-full bg-[#0b1434] relative flex items-center justify-center bg-grid-overlay">
                <svg className="w-1/2 h-1/2 opacity-10 text-white" viewBox="0 0 100 100">
                  <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M 10 50 H 90 M 50 10 V 90" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                
                {/* Simulated Technician avatar video */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#070c1e]/85">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1b2b5a] to-[#00bdff] border border-cyan-400/40 p-1 flex items-center justify-center shadow-lg mb-3">
                    <div className="w-full h-full rounded-full bg-[#0d1637] flex items-center justify-center text-white">
                      <User className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold">Clean Room Bench Camera #04</h4>
                  <p className="text-xs text-slate-400 mt-1">Mihai senior technician (Authorized Operator)</p>
                  
                  {timelineStep >= 2 && timelineStep < 5 && (
                    <div className="mt-4 flex items-center gap-2 bg-[#00bdff]/10 px-3 py-1 border border-[#00bdff]/20 rounded-lg text-[11px] font-mono text-[#00bdff]">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span>Surgical Repair Active on Table 4</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Camera Feed Stream Overlays */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center pointer-events-none z-20">
            <div className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 px-3 py-1 rounded-full text-white text-[11px] font-mono font-extrabold shadow-lg select-none">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
            <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-gray-300 text-[10px] font-mono shadow-md select-none">
              {cameraMode === 'microscope' ? 'MICROSCOPE SENSOR 45X' : 'CHAMBER OVERVIEW'}
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-1.5 z-20">
            {/* Audio Toggle button */}
            <button
              onClick={() => setIsAudioLive(!isAudioLive)}
              className={`p-2.5 rounded-full backdrop-blur-md border shadow-lg transition duration-200 cursor-pointer ${
                isAudioLive
                  ? 'bg-green-500/95 text-slate-900 border-green-400'
                  : 'bg-black/60 text-gray-300 border-[#1b2b5a] hover:bg-black/80'
              }`}
              title={isAudioLive ? 'Mute ambient microphone' : 'Unmute laboratory microphone'}
            >
              {isAudioLive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
            {/* Camera feed angle toggler */}
            <button
              onClick={() => setCameraMode(cameraMode === 'microscope' ? 'wideshot' : 'microscope')}
              className="px-3.5 py-1.5 text-[11px] font-mono font-bold rounded-lg bg-black/70 hover:bg-black/90 text-white border border-[#1b2b5a] shadow-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-[#00bdff]" />
              <span>Switch Camera</span>
            </button>
          </div>

          {/* Dynamic calibration stats bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2 overflow-x-auto select-none pointer-events-none md:pointer-events-auto [scrollbar-width:none]">
            {/* Filled via useEffect when repairing */}
          </div>

        </div>

        {/* Dynamic Telemetry Graph Controls and System Log Section */}
        <div className="bg-[#050a1d] rounded-2xl border border-[#111c47] p-5">
          <div className="flex border-b border-[#111c47] pb-3 mb-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('stream')}
                className={`text-sm font-bold pb-2 transition relative justify-center items-center flex gap-1.5 cursor-pointer ${
                  activeTab === 'stream' ? 'text-[#00bdff]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Micro-Diagnostic Feed Log</span>
                {activeTab === 'stream' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00bdff]" />}
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`text-sm font-bold pb-2 transition relative justify-center items-center flex gap-1.5 cursor-pointer ${
                  activeTab === 'telemetry' ? 'text-[#00bdff]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Live Lab Telemetry</span>
                {activeTab === 'telemetry' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00bdff]" />}
              </button>
            </div>

            {/* Quick calibration status index */}
            <div className="flex items-center gap-1 bg-[#01e0c9]/10 px-2.5 py-0.5 border border-[#01e0c9]/20 rounded text-[10px] font-mono text-[#01e0c9]">
              <Shield className="w-3 h-3" />
              <span>SECURITY CODES DETACHED</span>
            </div>
          </div>

          {activeTab === 'stream' ? (
            <div className="space-y-3">
              <div className="h-44 overflow-y-auto bg-black/60 rounded-xl p-4 border border-[#111c47] font-mono text-xs text-gray-300 space-y-1.5 shadow-inner">
                {telemetryLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed flex items-start gap-1">
                    <span className="text-cyan-500/80 shrink-0">~</span>
                    <span className={log.includes('[REPAIR]') ? 'text-cyan-400' : log.includes('[QC]') ? 'text-[#01e0c9]' : log.includes('[LOGISTICS]') ? 'text-amber-300' : 'text-gray-300'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Calibration sequence validates component identifiers against main motherboard logic circuits to prevent aftermarket lock warnings. Everything matches authentic serialization catalog indexes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 border border-[#111c47] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Microscope Laser Heat</span>
                  <p className="text-2xl font-mono font-bold text-[#00bdff] mt-1">{microscopeHeat}°C</p>
                </div>
                <div className="w-full h-1 bg-[#111c47] rounded mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-red-500 transition-all duration-500" style={{ width: `${(microscopeHeat / 400) * 100}%` }} />
                </div>
              </div>

              <div className="p-4 bg-black/40 border border-[#111c47] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Motherboard Core Input Volt</span>
                  <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{voltMeasure} V</p>
                </div>
                <div className="w-full h-1 bg-[#111c47] rounded mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${(voltMeasure / 5) * 100}%` }} />
                </div>
              </div>

              <div className="p-4 bg-black/40 border border-[#111c47] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Automated Signal Pulse</span>
                  <p className="text-2xl font-mono font-bold text-violet-400 mt-1">{hzMeasure} Hz</p>
                </div>
                <div className="w-full h-1 bg-[#111c47] rounded mt-3 overflow-hidden">
                  <div className="h-full bg-violet-400 transition-all duration-300" style={{ width: `${((hzMeasure - 59) / 2.1) * 100}%` }} />
                </div>
              </div>

              <div className="md:col-span-3 text-xs text-gray-500 font-mono p-3 bg-[#0a122c] border border-[#1b2b5a] rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#00bdff]" />
                  <span>Chamber Pressure: 1,013 hPa (Calibrated Class 100 Cleanroom Vacuum)</span>
                </span>
                <span className="text-green-400 select-none">● CHAMBER READY</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Sidebar: Step status, logistics tracking & Live Tech Chat */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* Dynamic Repair Progress Timeline */}
        <div className="bg-[#050a1d] border border-[#111c47] p-5 rounded-2xl">
          <h4 className="font-bold text-sm text-white mb-4 flex items-center justify-between">
            <span>Process Timeline</span>
            <span className="text-[10px] font-mono text-[#00bdff] border border-[#00bdff]/20 bg-[#00bdff]/5 px-2 py-0.5 rounded-full uppercase">
              {timelineStep === 5 ? 'Done' : `Stage ${timelineStep + 1}/6`}
            </span>
          </h4>

          <div className="space-y-4">
            {stepsList.map((stepItem, idx) => (
              <div key={stepItem.id} className="flex gap-3 position-relative">
                {/* Timeline connector circle dots */}
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition ${
                    stepItem.status === 'completed'
                      ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                      : stepItem.status === 'in-progress'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse glow-cyan'
                      : 'bg-[#0e1635] border-[#223977] text-gray-400'
                  }`}>
                    {stepItem.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  {/* Vertical branch lines */}
                  {idx < stepsList.length - 1 && (
                    <div className={`w-[1px] h-10 mt-1 transition ${
                      parseInt(stepItem.id) < timelineStep ? 'bg-green-500/40' : 'bg-[#1b2b5a]'
                    }`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold transition-colors ${
                    stepItem.status === 'in-progress' ? 'text-cyan-400' : stepItem.status === 'completed' ? 'text-white' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5 line-clamp-1">{stepItem.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick simulation acceleration buttons so the reviewer doesn't have to wait 15 seconds per stage! */}
          <div className="mt-5 p-3 bg-[#0a122c] border border-slate-700/40 rounded-xl">
            <p className="text-[10px] font-mono text-center text-gray-400 tracking-wider">REPAIR SIMULATOR CONTROLLERS</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                disabled={timelineStep === 5}
                onClick={() => setTimelineStep((prev) => Math.min(5, prev + 1))}
                className="py-1.5 text-[10px] font-bold rounded-lg border border-[#1b2b5a] bg-black/40 hover:bg-[#0c1638] text-white transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span>Advance State</span>
                <ArrowRight className="w-3 h-3 text-[#00bdff]" />
              </button>
              <button
                onClick={() => {
                  setTimelineStep(0);
                  setTelemetryLogs([
                    "07:27:54 [SYSTEM] Booking Confirmed.",
                    "07:28:10 [LOGISTICS] Tamper bag #9942 allocated to courier payload.",
                    "07:28:45 [LOGISTICS] Courier dispatched.",
                  ]);
                }}
                className="py-1.5 text-[10px] font-bold rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition cursor-pointer"
              >
                Re-dispatch
              </button>
            </div>
          </div>
        </div>

        {/* Live Lab Chat Panel with Mihai */}
        <div className="bg-[#050a1d] border border-[#111c47] rounded-2xl flex flex-col h-[340px] shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#111c47] bg-[#0a1133] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
              <span className="text-xs font-bold text-white">Secure Lab Chat</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Tech #12 (Senior operator)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:thin]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#00bdff] text-slate-950 rounded-tr-none'
                    : 'bg-[#1b2b5a] text-white rounded-tl-none border border-slate-700/30'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {isTechTyping && (
              <div className="flex items-center gap-1.5 py-1 px-3 bg-[#1b2b5a] border border-slate-700/30 rounded-xl rounded-tl-none w-[70px]">
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-[#0a1133] border-t border-[#111c47] flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask the technician anything..."
              className="flex-1 bg-[#111c47] border border-[#1b2b5a] focus:outline-none focus:border-[#00bdff] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#00bdff] text-slate-950 hover:bg-[#00d6ff] transition cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
