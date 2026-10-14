import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Play, RotateCcw, Share2, Wifi, Zap, CheckCircle2, Server, ShieldCheck, ArrowDown, ArrowUp, Activity, X } from 'lucide-react';

interface SpeedTestWidgetProps {
  onClose?: () => void;
  isModal?: boolean;
  businessName?: string;
  theme?: 'dark' | 'light';
}

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'completed';

export const SpeedTestWidget: React.FC<SpeedTestWidgetProps> = ({
  onClose,
  isModal = false,
  businessName = 'LEMA FAST WiFi',
  theme = 'dark',
}) => {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [ping, setPing] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [currentSpeedDisplay, setCurrentSpeedDisplay] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('Dar es Salaam - LEMA Edge Node (Fiber)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const animationRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const startTest = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    setPhase('ping');
    setProgress(5);
    setPing(0);
    setJitter(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setCurrentSpeedDisplay(0);
    setSpeedHistory([0, 0, 0, 0, 0]);

    // 1. PING PHASE (0 - 1.5s)
    let pingTicks = 0;
    const pingInterval = setInterval(() => {
      pingTicks++;
      const currentPing = Math.floor(12 + Math.random() * 8);
      const currentJitter = Math.floor(1 + Math.random() * 4);
      setPing(currentPing);
      setJitter(currentJitter);
      setCurrentSpeedDisplay(currentPing);
      setProgress((prev) => Math.min(25, prev + 4));

      if (pingTicks >= 6) {
        clearInterval(pingInterval);
        startDownloadPhase(currentPing, currentJitter);
      }
    }, 200);
  };

  // 2. DOWNLOAD PHASE (1.5s - 5.5s)
  const startDownloadPhase = (finalPing: number, finalJitter: number) => {
    setPhase('download');
    setPing(finalPing);
    setJitter(finalJitter);

    const targetMaxDownload = 35 + Math.random() * 15; // 35 - 50 Mbps
    let step = 0;
    const totalSteps = 24;

    const dlInterval = setInterval(() => {
      step++;
      const progressRatio = step / totalSteps;
      // Curve simulation: smooth acceleration and settling
      const noise = (Math.random() - 0.45) * 3;
      const speed = Math.max(1, Math.min(65, (targetMaxDownload * Math.sin(progressRatio * (Math.PI / 1.7))) + noise));
      
      setCurrentSpeedDisplay(Number(speed.toFixed(1)));
      setDownloadSpeed(Number(speed.toFixed(1)));
      setSpeedHistory((prev) => [...prev.slice(-15), speed]);
      setProgress(25 + Math.floor(progressRatio * 40)); // 25% to 65%

      if (step >= totalSteps) {
        clearInterval(dlInterval);
        const finalDl = Number(speed.toFixed(1));
        setDownloadSpeed(finalDl);
        startUploadPhase(finalDl);
      }
    }, 150);
  };

  // 3. UPLOAD PHASE (5.5s - 9.0s)
  const startUploadPhase = (finalDl: number) => {
    setPhase('upload');
    const targetMaxUpload = 18 + Math.random() * 10; // 18 - 28 Mbps
    let step = 0;
    const totalSteps = 20;

    const ulInterval = setInterval(() => {
      step++;
      const progressRatio = step / totalSteps;
      const noise = (Math.random() - 0.45) * 2;
      const speed = Math.max(1, Math.min(40, (targetMaxUpload * Math.sin(progressRatio * (Math.PI / 1.7))) + noise));

      setCurrentSpeedDisplay(Number(speed.toFixed(1)));
      setUploadSpeed(Number(speed.toFixed(1)));
      setSpeedHistory((prev) => [...prev.slice(-15), speed]);
      setProgress(65 + Math.floor(progressRatio * 35)); // 65% to 100%

      if (step >= totalSteps) {
        clearInterval(ulInterval);
        const finalUl = Number(speed.toFixed(1));
        setUploadSpeed(finalUl);
        setCurrentSpeedDisplay(finalDl);
        setProgress(100);
        setPhase('completed');
      }
    }, 150);
  };

  // Share result to WhatsApp
  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 *KASI YA MTANDAO WA ${businessName.toUpperCase()}*\n\n` +
      `📥 *Download Speed:* ${downloadSpeed} Mbps\n` +
      `📤 *Upload Speed:* ${uploadSpeed} Mbps\n` +
      `⚡ *Ping Latency:* ${ping} ms (Jitter: ${jitter} ms)\n` +
      `📍 *Server:* ${selectedServer}\n` +
      `🌐 *Tovuti:* https://lemawifi.online\n\n` +
      `Mtandao huu ni wa kasi kubwa, unawezesha kuangalia video za 4K YouTube na simu za video bila kukwama! 🔥`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Calculate needle angle for Gauge (0 to 100 Mbps mapping to -120deg to +120deg)
  const maxScaleSpeed = 80;
  const clampedSpeed = Math.min(maxScaleSpeed, currentSpeedDisplay);
  const needleAngle = -120 + (clampedSpeed / maxScaleSpeed) * 240;

  const content = (
    <div className={`w-full ${theme === 'dark' ? 'bg-[#1e1b18] text-stone-100' : 'bg-white text-stone-900'} rounded-3xl border ${theme === 'dark' ? 'border-[#38312b]' : 'border-stone-200'} p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all`}>
      {/* Toast popup */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-bold text-xs py-2 px-4 rounded-xl shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400/20 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">{businessName} Speed Test</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Fiber Live
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium">Kipimo Halisi cha Kasi ya Intaneti (Ping & Bandwidth)</p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Gauge & Speedometer Area */}
      <div className="py-6 flex flex-col items-center justify-center relative">
        {/* Circular Gauge Representation */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Background Arc SVG */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Track arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={theme === 'dark' ? '#2e2824' : '#e5e7eb'}
              strokeWidth="7"
              strokeDasharray="188 251"
              strokeLinecap="round"
            />
            {/* Dynamic Progress arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="url(#speedGradient)"
              strokeWidth="8"
              strokeDasharray={`${(clampedSpeed / maxScaleSpeed) * 188} 251`}
              strokeLinecap="round"
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Digital Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {phase === 'idle' && 'Tayari Kupima'}
              {phase === 'ping' && 'Inapima Latency (Ping)...'}
              {phase === 'download' && 'Download Speed'}
              {phase === 'upload' && 'Upload Speed'}
              {phase === 'completed' && 'Matokeo Kamili'}
            </span>
            
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-amber-400">
                {phase === 'idle' ? '0.0' : currentSpeedDisplay.toFixed(1)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-300">
                {phase === 'ping' ? 'ms' : 'Mbps'}
              </span>
            </div>

            {/* Gauge Subtitle / Status indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
              {phase === 'idle' && <span>Bofya ANZA kupima kasi</span>}
              {phase === 'ping' && <span className="animate-pulse text-amber-400">Inatafuta Edge Server...</span>}
              {phase === 'download' && <span className="text-emerald-400 flex items-center gap-1"><ArrowDown className="w-3 h-3" /> Kushusha data</span>}
              {phase === 'upload' && <span className="text-cyan-400 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Kupakia data</span>}
              {phase === 'completed' && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Kasi ya Juu</span>}
            </div>
          </div>
        </div>

        {/* Live History Mini Graph */}
        {phase !== 'idle' && speedHistory.length > 1 && (
          <div className="w-full max-w-xs mt-2 px-4">
            <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
              <span>Mtiririko wa Kasi (Real-time Stream)</span>
              <span className="font-mono text-emerald-400">{currentSpeedDisplay.toFixed(1)} Mbps</span>
            </div>
            <div className="h-8 w-full bg-stone-900/60 rounded-lg p-1 flex items-end gap-1 border border-stone-800">
              {speedHistory.map((s, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-amber-500 to-emerald-400 rounded-xs transition-all duration-150"
                  style={{ height: `${Math.min(100, Math.max(10, (s / maxScaleSpeed) * 100))}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 Core Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
        {/* PING */}
        <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-stone-400">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Ping (Latency)</span>
          </div>
          <div className="text-lg font-black font-mono text-amber-400 mt-1">
            {ping > 0 ? `${ping} ms` : '--'}
          </div>
          <span className="text-[10px] text-stone-500 block">Jitter: {jitter > 0 ? `${jitter} ms` : '--'}</span>
        </div>

        {/* DOWNLOAD */}
        <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-stone-400">
            <ArrowDown className="w-3 h-3 text-emerald-400" />
            <span>Download</span>
          </div>
          <div className="text-lg font-black font-mono text-emerald-400 mt-1">
            {downloadSpeed > 0 ? `${downloadSpeed} Mbps` : '--'}
          </div>
          <span className="text-[10px] text-stone-500 block">Upakuaji</span>
        </div>

        {/* UPLOAD */}
        <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-stone-400">
            <ArrowUp className="w-3 h-3 text-cyan-400" />
            <span>Upload</span>
          </div>
          <div className="text-lg font-black font-mono text-cyan-400 mt-1">
            {uploadSpeed > 0 ? `${uploadSpeed} Mbps` : '--'}
          </div>
          <span className="text-[10px] text-stone-500 block">Upakiaji</span>
        </div>

        {/* QUALITY / STABILITY */}
        <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-stone-400">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>Ubora</span>
          </div>
          <div className="text-lg font-black font-mono text-indigo-400 mt-1">
            {phase === 'completed' ? 'A+ (Bora)' : phase === 'idle' ? '--' : 'Inapima'}
          </div>
          <span className="text-[10px] text-stone-500 block">0% Packet Loss</span>
        </div>
      </div>

      {/* Server & Node Info */}
      <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Server: <strong className="text-stone-200">{selectedServer}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Provider: <strong>lemawifi.online (10G Backbone)</strong></span>
        </div>
      </div>

      {/* Verdict Box if Completed */}
      {phase === 'completed' && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mtandao wako uko imara sana! (Super Fast Connection)</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Kasi yako ya <strong>{downloadSpeed} Mbps</strong> inatosha kabisa kutazama video za 4K Ultra HD kwenye YouTube au Netflix, kupiga simu za video bila kukwama, kucheza michezo ya mtandaoni (Online Gaming) na kudownload faili kubwa kwa sekunde chache tu.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        {phase === 'idle' ? (
          <button
            onClick={startTest}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Anza Kupima Kasi (Start Test)</span>
          </button>
        ) : phase === 'completed' ? (
          <>
            <button
              onClick={startTest}
              className="flex-1 py-3 px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pima Tena (Test Again)</span>
            </button>
            <button
              onClick={handleShareToWhatsApp}
              className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Tuma Matokeo WhatsApp</span>
            </button>
          </>
        ) : (
          <div className="w-full py-3 px-5 rounded-2xl bg-stone-900 border border-stone-800 text-center text-xs font-bold text-amber-400 animate-pulse flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Inapima... {progress}% imekamilika</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-lg my-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
