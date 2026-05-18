import { useEffect, useRef, useState } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Initializing');
  const [fadeOut, setFadeOut] = useState(false);

  const starsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const labelTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const doneRef = useRef(false);

  const labels = ['Initializing', 'Scanning', 'Calibrating', 'Connecting'];

  useEffect(() => {
    const starsEl = starsRef.current;
    const particlesEl = particlesRef.current;

    if (starsEl) {
      starsEl.innerHTML = '';
      for (let i = 0; i < 56; i += 1) {
        const s = document.createElement('div');
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const dur = 1.8 + Math.random() * 3.2;
        const delay = Math.random() * 4;

        s.style.cssText = `
          position:absolute;
          border-radius:50%;
          background:white;
          opacity:0;
          width:${size}px;
          height:${size}px;
          top:${top}%;
          left:${left}%;
          animation:d360twinkle ${dur}s ease-in-out ${delay}s infinite;
          --op:${0.25 + Math.random() * 0.55};
        `;
        starsEl.appendChild(s);
      }
    }

    if (particlesEl) {
      particlesEl.innerHTML = '';
      const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#06b6d4', '#818cf8'];
      for (let i = 0; i < 12; i += 1) {
        const p = document.createElement('div');
        const size = (2 + Math.random() * 2.5).toFixed(1);
        const color = colors[Math.floor(Math.random() * colors.length)];

        p.style.cssText = `
          position:absolute;
          border-radius:50%;
          opacity:0;
          width:${size}px;
          height:${size}px;
          background:${color};
          left:${28 + Math.random() * 44}%;
          bottom:${10 + Math.random() * 26}%;
          animation:d360floatUp ${2.4 + Math.random() * 2.4}s ${Math.random() * 2.2}s ease-in infinite;
        `;
        particlesEl.appendChild(p);
      }
    }

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const duration = reduceMotion ? 1200 : 3600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(raw);
      const nextProgress = Math.min(Math.round(eased * 100), 100);

      setProgress(nextProgress);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setFadeOut(true);
        window.setTimeout(() => onComplete(), 420);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    let li = 0;
    labelTimerRef.current = window.setInterval(() => {
      li = (li + 1) % labels.length;
      setLabel(labels[li]);
    }, reduceMotion ? 1400 : 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (labelTimerRef.current) window.clearInterval(labelTimerRef.current);
    };
  }, [onComplete]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap');

        :root {
          --loader-bg: #06091a;
        }

        * {
          box-sizing: border-box;
        }

        @keyframes d360twinkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50%      { opacity: var(--op, 0.7); transform: scale(1); }
        }

        @keyframes d360rotateRing {
          from { transform: rotate(0deg) rotateX(65deg); }
          to   { transform: rotate(360deg) rotateX(65deg); }
        }

        @keyframes d360rotateDots {
          from { transform: rotate(0deg) rotateX(65deg); }
          to   { transform: rotate(360deg) rotateX(65deg); }
        }

        @keyframes d360antigravity {
          0%   { transform: translateY(0px) rotate(-1deg); }
          25%  { transform: translateY(-12px) rotate(0.5deg); }
          50%  { transform: translateY(-18px) rotate(1.2deg); }
          75%  { transform: translateY(-12px) rotate(0.5deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }

        @keyframes d360shadowPulse {
          0%   { transform: scaleX(1) scaleY(1); opacity: 0.45; }
          50%  { transform: scaleX(0.6) scaleY(0.6); opacity: 0.2; }
          100% { transform: scaleX(1) scaleY(1); opacity: 0.45; }
        }

        @keyframes d360floatUp {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          18%  { opacity: 0.8; }
          80%  { opacity: 0.35; }
          100% { opacity: 0; transform: translateY(-80px) scale(0.3); }
        }

        @keyframes d360glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%      { transform: scale(1.12); opacity: 1; }
        }

        @keyframes d360blink {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        .d360-orbit-ring-1 { animation: d360rotateRing 4.8s linear infinite; }
        .d360-orbit-ring-2 { animation: d360rotateRing 7.5s linear infinite reverse; }
        .d360-orbit-ring-3 { animation: d360rotateRing 12s linear infinite; }

        .d360-dot-orbit-1 { animation: d360rotateDots 4.8s linear infinite; }
        .d360-dot-orbit-2 { animation: d360rotateDots 7.5s linear infinite reverse; }

        .d360-logo-float {
          animation: d360antigravity 3.5s ease-in-out infinite;
          filter: drop-shadow(0 0 18px rgba(37,99,235,0.7)) drop-shadow(0 20px 40px rgba(37,99,235,0.25));
          will-change: transform;
        }

        .d360-shadow-ground { animation: d360shadowPulse 3.5s ease-in-out infinite; }
        .d360-glow-bg { animation: d360glowPulse 3.5s ease-in-out infinite; }
        .d360-loading-text { animation: d360blink 1.7s ease-in-out infinite; letter-spacing: 0.18em; }
        .d360-progress-bar {
          transform-origin: left center;
          will-change: transform;
          transition: transform 120ms linear;
          box-shadow: 0 0 10px rgba(59,130,246,0.75);
        }

        .d360-shell {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background:
            radial-gradient(circle at 50% 30%, rgba(37,99,235,0.12) 0%, transparent 35%),
            var(--loader-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.4s ease;
          opacity: ${fadeOut ? 0 : 1};
          pointer-events: ${fadeOut ? 'none' : 'all'};
          overflow: hidden;
          padding: 16px;
        }

        .d360-stars,
        .d360-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .d360-glow {
          position: absolute;
          width: min(300px, 55vw);
          height: min(300px, 55vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .d360-scene {
          position: relative;
          width: min(200px, 62vw);
          height: min(200px, 62vw);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateZ(0);
        }

        .d360-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(59, 130, 246, 0.15);
        }

        .d360-ring-1 {
          width: min(180px, 56vw);
          height: min(180px, 56vw);
          border-style: dashed;
          border-color: rgba(59,130,246,0.25);
        }

        .d360-ring-2 {
          width: min(220px, 68vw);
          height: min(220px, 68vw);
          border-color: rgba(99,179,255,0.15);
        }

        .d360-ring-3 {
          width: min(260px, 80vw);
          height: min(260px, 80vw);
          border-style: dotted;
          border-color: rgba(59,130,246,0.1);
        }

        .d360-orbit {
          position: absolute;
          border-radius: 50%;
        }

        .d360-dot {
          position: absolute;
          top: -4px;
          left: calc(50% - 4px);
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .d360-dot-blue {
          background: radial-gradient(circle at 30% 30%, #93c5fd, #2563eb);
          box-shadow: 0 0 8px #3b82f6, 0 0 16px rgba(59,130,246,0.4);
        }

        .d360-dot-cyan {
          width: 6px;
          height: 6px;
          top: -3px;
          left: calc(50% - 3px);
          background: radial-gradient(circle at 30% 30%, #a5f3fc, #0891b2);
          box-shadow: 0 0 8px #06b6d4, 0 0 16px rgba(6,182,212,0.4);
        }

        .d360-brand {
          margin-top: 26px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 10;
          text-align: center;
        }

        .d360-brand-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(22px, 6vw, 28px);
          font-weight: 700;
          letter-spacing: clamp(2px, 0.9vw, 4px);
          color: white;
          text-transform: uppercase;
          line-height: 1;
        }

        .d360-brand-name span {
          color: #3b82f6;
        }

        .d360-progress-wrap {
          width: min(180px, 68vw);
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 2px;
        }

        .d360-loading-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(10px, 3vw, 11px);
          color: rgba(147,197,253,0.72);
          text-transform: uppercase;
        }

        .d360-progress-bar-inner {
          width: 100%;
          height: 100%;
          transform: scaleX(${Math.max(progress, 0) / 100});
          transform-origin: left center;
          background: linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd);
          border-radius: 999px;
        }

        @media (max-width: 640px) {
          .d360-shell {
            justify-content: center;
            padding: 18px 14px 26px;
          }

          .d360-scene {
            width: min(210px, 78vw);
            height: min(210px, 78vw);
          }

          .d360-ring-1 {
            width: min(180px, 66vw);
            height: min(180px, 66vw);
          }

          .d360-ring-2 {
            width: min(224px, 82vw);
            height: min(224px, 82vw);
          }

          .d360-ring-3 {
            width: min(260px, 94vw);
            height: min(260px, 94vw);
          }

          .d360-brand {
            margin-top: 22px;
            gap: 8px;
          }

          .d360-progress-wrap {
            width: min(150px, 72vw);
          }

          .d360-glow {
            width: min(240px, 78vw);
            height: min(240px, 78vw);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .d360-orbit-ring-1,
          .d360-orbit-ring-2,
          .d360-orbit-ring-3,
          .d360-dot-orbit-1,
          .d360-dot-orbit-2,
          .d360-logo-float,
          .d360-shadow-ground,
          .d360-glow-bg,
          .d360-loading-text,
          .d360-progress-bar,
          .d360-progress-bar-inner {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="d360-shell">
        <div ref={starsRef} className="d360-stars" />

        <div className="d360-glow" />

        <div className="d360-scene">
          <div className="d360-ring d360-ring-1 d360-orbit-ring-1" />
          <div className="d360-ring d360-ring-2 d360-orbit-ring-2" />
          <div className="d360-ring d360-ring-3 d360-orbit-ring-3" />

          <div
            className="d360-orbit d360-dot-orbit-1"
            style={{ width: 'min(180px, 56vw)', height: 'min(180px, 56vw)' }}
          >
            <div className="d360-dot d360-dot-blue" />
          </div>

          <div
            className="d360-orbit d360-dot-orbit-2"
            style={{ width: 'min(220px, 68vw)', height: 'min(220px, 68vw)' }}
          >
            <div className="d360-dot d360-dot-cyan" />
          </div>

          <div ref={particlesRef} className="d360-particles" />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              className="d360-logo-float"
              width="90"
              height="90"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 'clamp(96px, 28vw, 120px)', height: 'clamp(96px, 28vw, 120px)' }}
            >
              <defs>
                <linearGradient id="d360dGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="d360orbitGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0" />
                  <stop offset="40%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.6" />
                </linearGradient>
                <filter id="d360glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect x="62" y="18" width="76" height="164" rx="16" fill="#0f172a" stroke="#1e3a8a" strokeWidth="3" />
              <rect x="68" y="28" width="64" height="144" rx="10" fill="#0c1a3a" />
              <rect x="88" y="21" width="24" height="4" rx="2" fill="#1e3a8a" />
              <rect x="84" y="170" width="32" height="5" rx="2.5" fill="#1e3a8a" />

              <text
                x="75"
                y="130"
                fontFamily="Arial Black, sans-serif"
                fontSize="88"
                fontWeight="900"
                fill="url(#d360dGrad)"
                filter="url(#d360glow)"
              >
                D
              </text>

              <path
                d="M30 135 Q100 95 175 60"
                stroke="url(#d360orbitGrad)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                filter="url(#d360glow)"
              />
              <circle cx="175" cy="60" r="6" fill="#93c5fd" filter="url(#d360glow)" />

              <path
                d="M25 80 Q100 130 175 140"
                stroke="rgba(59,130,246,0.35)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="4 6"
              />
            </svg>

            <div
              className="d360-shadow-ground"
              style={{
                position: 'absolute',
                bottom: -28,
                width: 72,
                height: 16,
                background: 'radial-gradient(ellipse, rgba(37,99,235,0.35) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>

        <div className="d360-brand">
          <div className="d360-brand-name">
            Device<span>360</span>
          </div>

          <div className="d360-progress-wrap">
            <div className="d360-progress-bar-inner" />
          </div>

          <div className="d360-loading-text">{label}</div>

          <div
            style={{
              marginTop: 2,
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'rgba(147,197,253,0.45)',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {progress}%
          </div>
        </div>
      </div>
    </>
  );
};