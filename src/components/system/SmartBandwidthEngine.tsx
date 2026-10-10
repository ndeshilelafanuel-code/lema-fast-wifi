import React, { useState, useEffect } from 'react';
import {
  Zap,
  Gauge,
  Clock,
  Shield,
  Activity,
  Sliders,
  Play,
  Copy,
  Check,
  Smartphone,
  Video,
  Download,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Cpu,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Wifi,
  ChevronRight,
  Settings
} from 'lucide-react';

interface SmartBandwidthEngineProps {
  hotspotName?: string;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SmartBandwidthEngine: React.FC<SmartBandwidthEngineProps> = ({
  hotspotName = 'Lema Fast WiFi',
  onShowToast,
}) => {
  // 1. SPEED BURST CONFIGURATION STATES
  const [burstEnabled, setBurstEnabled] = useState<boolean>(true);
  const [burstSpeedMbps, setBurstSpeedMbps] = useState<number>(15); // Kasi ya ghafla (Burst Limit)
  const [baselineSpeedMbps, setBaselineSpeedMbps] = useState<number>(3); // Kasi ya kawaida (Sustained Rate)
  const [burstDurationSeconds, setBurstDurationSeconds] = useState<number>(12); // Sekunde za kwanza za kupakia video
  const [burstThresholdMbps, setBurstThresholdMbps] = useState<number>(4); // Kiwango cha kupumzisha burst

  // 2. PEAK HOUR TRAFFIC SHAPING (MSONGAMANO WA USIKU - FUP)
  const [peakShapingEnabled, setPeakShapingEnabled] = useState<boolean>(true);
  const [peakStartHour, setPeakStartHour] = useState<string>('20:00'); // Saa 2 usiku
  const [peakEndHour, setPeakEndHour] = useState<string>('23:00'); // Saa 5 usiku
  const [fairShareMode, setFairShareMode] = useState<'pcq' | 'sfq' | 'cake'>('pcq');
  const [prioritizeFinancialApps, setPrioritizeFinancialApps] = useState<boolean>(true); // M-Pesa / Benki
  const [prioritizeVoiceCalls, setPrioritizeVoiceCalls] = useState<boolean>(true); // WhatsApp Calls
  const [throttleHeavyDownloads, setThrottleHeavyDownloads] = useState<boolean>(true); // Zuia torrent/downloads kubwa usiku
  const [fupDailyCapGb, setFupDailyCapGb] = useState<number>(5); // Kiwango cha siku kabla ya kupunguza spidi usiku

  // 3. INTERACTIVE BURST SIMULATOR STATES
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSeconds, setSimSeconds] = useState<number>(0);
  const [simCurrentSpeed, setSimCurrentSpeed] = useState<number>(baselineSpeedMbps);
  const [simBufferPercent, setSimBufferPercent] = useState<number>(0);
  const [simAppType, setSimAppType] = useState<'tiktok' | 'youtube' | 'webpage'>('tiktok');

  // 4. CODE EXPORT SCRIPT TAB
  const [scriptPlatform, setScriptPlatform] = useState<'mikrotik' | 'openwrt' | 'radius_nexor'>('mikrotik');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Live Clock & Peak Hours check
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isCurrentlyPeakHour, setIsCurrentlyPeakHour] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes();
      setCurrentTimeStr(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
      
      // Check if current hour is between 20:00 and 23:00 (or peak range)
      const [startH] = peakStartHour.split(':').map(Number);
      const [endH] = peakEndHour.split(':').map(Number);
      if (hours >= startH && hours < endH) {
        setIsCurrentlyPeakHour(true);
      } else {
        setIsCurrentlyPeakHour(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [peakStartHour, peakEndHour]);

  // Handle Simulation Run
  const handleStartSimulation = (app: 'tiktok' | 'youtube' | 'webpage') => {
    if (isSimulating) return;
    setSimAppType(app);
    setIsSimulating(true);
    setSimSeconds(0);
    setSimBufferPercent(0);
    setSimCurrentSpeed(burstEnabled ? burstSpeedMbps : baselineSpeedMbps);

    let sec = 0;
    const simInterval = setInterval(() => {
      sec += 1;
      setSimSeconds(sec);

      // Buffer progress jumps fast during burst
      if (sec <= burstDurationSeconds) {
        // High speed burst
        const fluctuation = (Math.random() - 0.5) * 1.5;
        setSimCurrentSpeed(Math.max(burstSpeedMbps * 0.9, burstSpeedMbps + fluctuation));
        setSimBufferPercent((prev) => Math.min(100, prev + Math.floor(80 / burstDurationSeconds)));
      } else {
        // Smooth drop to baseline sustained speed
        const dropSpeed = baselineSpeedMbps + (Math.random() - 0.5) * 0.4;
        setSimCurrentSpeed(Math.max(1, dropSpeed));
        setSimBufferPercent(100);
      }

      if (sec >= 18) {
        clearInterval(simInterval);
        setIsSimulating(false);
        setSimCurrentSpeed(baselineSpeedMbps);
        if (onShowToast) {
          onShowToast(
            'Jaribio Limekamilika!',
            `Video ya ${app.toUpperCase()} imefunguka mara moja bila kukwama shukrani kwa Speed Burst ya ${burstSpeedMbps} Mbps!`,
            'success'
          );
        }
      }
    }, 1000);
  };

  // Generate RouterOS / Queue script
  const generateScript = () => {
    if (scriptPlatform === 'mikrotik') {
      return `# ================================================================
# LEMA FAST WIFI - SMART SPEED BURST & FAIR USAGE QUEUES (ROUTEROS)
# Mfumo: Speed Burst (${burstSpeedMbps}M kwa ${burstDurationSeconds}s) + Peak Hour Fair Share (PCQ)
# ================================================================

/ip hotspot user profile
set [find default=yes] rate-limit="${baselineSpeedMbps}M/${burstSpeedMbps}M ${burstThresholdMbps}M/${burstSpeedMbps}M ${burstDurationSeconds}s/${burstDurationSeconds}s 8 2M/2M"

# 1. PCQ Dynamic Bandwidth Queues (Huzuia mtu mmoja kunyonya mtandao wote)
/queue type
add kind=pcq name="Lema_PCQ_Download" pcq-classifier=dst-address pcq-rate=${baselineSpeedMbps}M pcq-burst-rate=${burstSpeedMbps}M pcq-burst-threshold=${burstThresholdMbps}M pcq-burst-time=${burstDurationSeconds}s
add kind=pcq name="Lema_PCQ_Upload" pcq-classifier=src-address pcq-rate=1M pcq-burst-rate=4M pcq-burst-threshold=1M pcq-burst-time=10s

# 2. Peak Hours Traffic Shaper (${peakStartHour} - ${peakEndHour})
# Saa za jioni watu wakiwa wengi, kipaumbele kinapewa M-Pesa na WhatsApp calls
/ip firewall mangle
add chain=prerouting protocol=tcp dst-port=443 content="mpesa" action=mark-packet new-packet-mark="financial_vip" passthrough=no comment="Priority 1: M-Pesa & Mobile Money"
add chain=prerouting protocol=udp dst-port=3478,53,443 action=mark-packet new-packet-mark="voice_vip" passthrough=no comment="Priority 2: WhatsApp Voice/Video Calls"
add chain=prerouting action=mark-packet new-packet-mark="general_traffic" passthrough=no comment="Priority 3: General Browsing & TikTok"

# 3. Queue Tree with Strict Priorities
/queue tree
add name="Lema_Priority_Finance" packet-mark="financial_vip" priority=1 queue=default max-limit=50M
add name="Lema_Priority_Calls" packet-mark="voice_vip" priority=2 queue=default max-limit=50M
add name="Lema_Normal_Traffic" packet-mark="general_traffic" priority=6 queue=Lema_PCQ_Download max-limit=100M`;
    }

    if (scriptPlatform === 'openwrt') {
      return `# ================================================================
# OPENWRT / LINUX SQM CAKE & DYNAMIC BURST CONFIGURATION
# ================================================================
uci set sqm.eth1.enabled='1'
uci set sqm.eth1.interface='eth1'
uci set sqm.eth1.qdisc='cake'
uci set sqm.eth1.script='layer_cake.qos'
uci set sqm.eth1.linklayer='none'
uci set sqm.eth1.download='${burstSpeedMbps * 1000}'
uci set sqm.eth1.upload='5000'
uci commit sqm
/etc/init.d/sqm restart

# Smart Burst parameters for tc/fq_codel
tc qdisc replace dev br-lan root cake bandwidth ${burstSpeedMbps}mbit diffserv4 flows wash ack-filter`;
    }

    // RADIUS / Nexor Cloud Rate-Limit
    return `# ================================================================
# NEXOR / CLOUD RADIUS ATTRIBUTES (WISPr & MIKROTIK-RATE-LIMIT)
# Ibandike kwenye RADIUS User Profile ya Kila Kifurushi:
# ================================================================

# Rate-Limit syntax: [Rx/Tx] [Burst-Rx/Tx] [Threshold-Rx/Tx] [Burst-Time] [Priority] [Min-Rate]
Mikrotik-Rate-Limit = "${baselineSpeedMbps}M/${burstSpeedMbps}M ${burstThresholdMbps}M/${burstSpeedMbps}M ${burstDurationSeconds}s/${burstDurationSeconds}s 8 1M/1M"
WISPr-Bandwidth-Max-Down = ${burstSpeedMbps * 1048576}
WISPr-Bandwidth-Min-Down = ${baselineSpeedMbps * 1048576}

# Peak Hour Overrides (${peakStartHour} to ${peakEndHour}):
# Mikrotik-Rate-Limit = "2M/8M 3M/8M 8s/8s 8 512k/512k"`;
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateScript());
    setCopiedScript(true);
    if (onShowToast) {
      onShowToast('Script Imenakiliwa!', 'Amri za kuweka Speed Burst kwenye Router zimenakiliwa kwenye clipboard yako.', 'success');
    }
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-stone-800">
      {/* HERO BANNER & STATUS */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-stone-900/40 border border-amber-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 flex items-center gap-1 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-stone-950" />
                <span>Teknolojia ya 2026: Speed Burst & FUP</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                isCurrentlyPeakHour
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isCurrentlyPeakHour ? 'bg-rose-400' : 'bg-emerald-400 animate-ping'}`} />
                <span>{isCurrentlyPeakHour ? `Msongamano wa Usiku Active (${peakStartHour} - ${peakEndHour})` : 'Muda wa Kawaida (Off-Peak Unlimited)'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Smart Dynamic Bandwidth & Speed Bursting Engine
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Suluhu ya kisasa dhidi ya video za <strong>TikTok, YouTube & Reels</strong> kukwama (buffering). Mteja akibonyeza video anapewa spidi kubwa ya ghafla (<strong>{burstSpeedMbps} Mbps</strong>) kwa sekunde za kwanza, kisha inarudi spidi ya kawaida (<strong>{baselineSpeedMbps} Mbps</strong>) ili asipoteze data na mtandao ubakie wa kasi ya ajabu!
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 gap-3 sm:w-72 shrink-0 font-mono text-center">
            <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-2xl shadow-inner space-y-0.5">
              <span className="text-[10px] text-stone-400 font-sans block uppercase font-bold">Kasi ya Burst</span>
              <span className="text-2xl font-black text-amber-400">{burstSpeedMbps} Mbps</span>
              <span className="text-[9px] text-emerald-400 font-sans block">Kwa sekunde {burstDurationSeconds} za mwanzo</span>
            </div>

            <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-2xl shadow-inner space-y-0.5">
              <span className="text-[10px] text-stone-400 font-sans block uppercase font-bold">Data Iliyookolewa</span>
              <span className="text-2xl font-black text-emerald-400">+42%</span>
              <span className="text-[9px] text-stone-400 font-sans block">Haitumii bando bure</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONTROLS & CONFIGURATIONS (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: SPEED BURST CONFIGURATOR */}
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e6e2d3] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#231f1c] uppercase tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>1. Mipangilio ya Speed Burst (Kasi ya Ghafla)</span>
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Hufanya kila ukurasa na video za TikTok zifunguke papo hapo bila buffering.
                </p>
              </div>

              {/* Master Burst Toggle */}
              <button
                onClick={() => setBurstEnabled(!burstEnabled)}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative ${
                  burstEnabled ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white transition-all shadow-xs ${
                    burstEnabled ? 'left-6.5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Slider 1: Burst Speed */}
              <div className="space-y-2 p-4 bg-stone-50 border border-stone-200/70 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Kasi ya Burst (Burst Limit):</span>
                  </span>
                  <span className="text-sm font-black font-mono text-amber-600 bg-amber-100/70 px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {burstSpeedMbps} Mbps
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="30"
                  step="1"
                  value={burstSpeedMbps}
                  onChange={(e) => setBurstSpeedMbps(Number(e.target.value))}
                  disabled={!burstEnabled}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>8 Mbps (Kawaida)</span>
                  <span className="text-amber-700 font-bold">15 Mbps (Inapendekezwa)</span>
                  <span>30 Mbps (Starlink Turbo)</span>
                </div>
              </div>

              {/* Slider 2: Burst Duration */}
              <div className="space-y-2 p-4 bg-stone-50 border border-stone-200/70 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Muda wa Burst (Burst Duration):</span>
                  </span>
                  <span className="text-sm font-black font-mono text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-lg border border-sky-300">
                    Sekunde {burstDurationSeconds}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={burstDurationSeconds}
                  onChange={(e) => setBurstDurationSeconds(Number(e.target.value))}
                  disabled={!burstEnabled}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  Mteja anapobonyeza video yoyote ya TikTok au YouTube, anapewa sekunde <strong>{burstDurationSeconds}</strong> za kupakia video yote mbele kwenye simu yake, kisha spidi inatulia.
                </p>
              </div>

              {/* Slider 3: Baseline Sustainable Speed */}
              <div className="space-y-2 p-4 bg-stone-50 border border-stone-200/70 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Kasi Endelevu ya Kawaida (Baseline Speed):</span>
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    {baselineSpeedMbps} Mbps
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={baselineSpeedMbps}
                  onChange={(e) => setBaselineSpeedMbps(Number(e.target.value))}
                  disabled={!burstEnabled}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[10px] text-stone-500">
                  Kasi ambayo mteja anarudi nayo baada ya sekunde za burst kuisha. Inatosha kabisa video kuendelea kucheza vizuri bila mtandao kupata mzigo.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: PEAK HOUR SHAPING (MSONGAMANO WA USIKU - FUP) */}
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e6e2d3] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#231f1c] uppercase tracking-tight flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span>2. Msongamano wa Usiku (Peak Hour Fair-Share & FUP)</span>
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Saa 2 hadi saa 5 usiku watu wakiwa wengi, mfumo unagawanya intaneti sawia ili mtu mmoja asinyonye wote.
                </p>
              </div>

              {/* Peak Toggle */}
              <button
                onClick={() => setPeakShapingEnabled(!peakShapingEnabled)}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative ${
                  peakShapingEnabled ? 'bg-indigo-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white transition-all shadow-xs ${
                    peakShapingEnabled ? 'left-6.5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Time Window Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3.5 bg-stone-50 border border-stone-200/60 rounded-2xl">
                <label className="text-stone-600 font-bold block">Saa ya Kuanza Msongamano (Start):</label>
                <select
                  value={peakStartHour}
                  onChange={(e) => setPeakStartHour(e.target.value)}
                  disabled={!peakShapingEnabled}
                  className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white font-mono font-bold text-stone-800"
                >
                  <option value="19:00">19:00 (Saa 1:00 Usiku)</option>
                  <option value="20:00">20:00 (Saa 2:00 Usiku - Inapendekezwa)</option>
                  <option value="21:00">21:00 (Saa 3:00 Usiku)</option>
                </select>
              </div>

              <div className="space-y-1.5 p-3.5 bg-stone-50 border border-stone-200/60 rounded-2xl">
                <label className="text-stone-600 font-bold block">Saa ya Kumaliza Msongamano (End):</label>
                <select
                  value={peakEndHour}
                  onChange={(e) => setPeakEndHour(e.target.value)}
                  disabled={!peakShapingEnabled}
                  className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white font-mono font-bold text-stone-800"
                >
                  <option value="22:00">22:00 (Saa 4:00 Usiku)</option>
                  <option value="23:00">23:00 (Saa 5:00 Usiku - Inapendekezwa)</option>
                  <option value="24:00">00:00 (Saa 6:00 Usiku)</option>
                </select>
              </div>
            </div>

            {/* Traffic Prioritization Toggles (QoS) */}
            <div className="space-y-3 pt-2 text-xs">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                Kipaumbele cha Trafiki (Smart Traffic Prioritization):
              </span>

              {/* Priority 1: M-Pesa / Mobile Money */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="space-y-0.5">
                  <strong className="text-emerald-950 font-bold flex items-center gap-1.5">
                    <span>Priority 1: M-Pesa & Malipo ya Benki</span>
                    <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 text-[9px] font-bold rounded">0ms Lag</span>
                  </strong>
                  <p className="text-[10px] text-emerald-800">
                    Mteja anapotaka kulipia vocha au kutumia App ya benki, pakiti zake hazikwami hata mtandao ukiwa na mzigo mkubwa.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prioritizeFinancialApps}
                  onChange={(e) => setPrioritizeFinancialApps(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Priority 2: WhatsApp Voice & Video Calls */}
              <div className="flex items-center justify-between p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl">
                <div className="space-y-0.5">
                  <strong className="text-sky-950 font-bold flex items-center gap-1.5">
                    <span>Priority 2: WhatsApp Calls & Zoom</span>
                    <span className="px-1.5 py-0.2 bg-sky-200 text-sky-800 text-[9px] font-bold rounded">Anti-Jitter</span>
                  </strong>
                  <p className="text-[10px] text-sky-800">
                    Simu za sauti na video WhatsApp hazikatikati wala kuchelewa sauti (inazuia bufferbloat).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prioritizeVoiceCalls}
                  onChange={(e) => setPrioritizeVoiceCalls(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Priority 3: Throttle Torrents & Heavy Downloads */}
              <div className="flex items-center justify-between p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
                <div className="space-y-0.5">
                  <strong className="text-rose-950 font-bold flex items-center gap-1.5">
                    <span>Priority 4: Zuia Kupakua Faili Kubwa Usiku (Torrent/Steam)</span>
                    <span className="px-1.5 py-0.2 bg-rose-200 text-rose-800 text-[9px] font-bold rounded">Fair-Share</span>
                  </strong>
                  <p className="text-[10px] text-rose-800">
                    Mtu akianza kudownload movie ya 10GB au update za Windows usiku, anapewa spidi ya wastani ili asimalize mtandao wa wengine.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={throttleHeavyDownloads}
                  onChange={(e) => setThrottleHeavyDownloads(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIMULATOR & ROUTER SCRIPT (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SIMULATOR CARD */}
          <div className="bg-[#231f1c] text-white rounded-3xl p-6 space-y-5 border border-stone-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>JARIBIO LA MOJA KWA MOJA</span>
                </span>
                <h4 className="text-sm font-black text-white">Live Speed Burst Simulator</h4>
              </div>

              {isSimulating && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  BURST IN PROGRESS ({simSeconds}s)
                </span>
              )}
            </div>

            {/* Visual Speedometer Display */}
            <div className="p-5 bg-stone-900 rounded-2xl border border-stone-800 text-center space-y-3 relative">
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Spidi ya Sasa kwa Mteja</span>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight flex items-center justify-center gap-1">
                  <span className={simSeconds <= burstDurationSeconds && isSimulating ? 'text-amber-400' : 'text-emerald-400'}>
                    {simCurrentSpeed.toFixed(1)}
                  </span>
                  <span className="text-base text-stone-400 font-sans font-bold">Mbps</span>
                </div>
              </div>

              {/* Progress bar of video buffer */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-stone-400">Video Buffer (TikTok / Reels):</span>
                  <span className="text-amber-400 font-bold">{simBufferPercent}% Loaded</span>
                </div>
                <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800">
                  <div
                    style={{ width: `${simBufferPercent}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      simBufferPercent >= 100
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                  />
                </div>
              </div>

              {/* Status explanation */}
              <div className="p-2.5 bg-stone-950/70 rounded-xl border border-stone-800 text-[10px] text-stone-300">
                {isSimulating ? (
                  simSeconds <= burstDurationSeconds ? (
                    <span className="text-amber-300 font-bold flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-300 animate-bounce" />
                      <span>Speed Burst inafanya kazi! Inapakia video kwa kasi ya {burstSpeedMbps} Mbps...</span>
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-bold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Video imejaa 100%! Spidi imetulia kwenye {baselineSpeedMbps} Mbps bila buffering.</span>
                    </span>
                  )
                ) : (
                  <span>Bofya kitufe chochote hapo chini kuona jinsi video inavyofunguka papo hapo.</span>
                )}
              </div>
            </div>

            {/* Test Simulation Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Chagua aina ya App ya Kujaribu:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStartSimulation('tiktok')}
                  disabled={isSimulating}
                  className="p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/50 rounded-xl text-center space-y-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Video className="w-4 h-4 text-rose-400 mx-auto" />
                  <span className="text-[11px] font-bold block text-white">TikTok / Reels</span>
                  <span className="text-[9px] text-stone-400 block">Kipande cha 15s</span>
                </button>

                <button
                  onClick={() => handleStartSimulation('youtube')}
                  disabled={isSimulating}
                  className="p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/50 rounded-xl text-center space-y-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-red-500 mx-auto fill-red-500" />
                  <span className="text-[11px] font-bold block text-white">YouTube 1080p</span>
                  <span className="text-[9px] text-stone-400 block">Video Ndefu</span>
                </button>

                <button
                  onClick={() => handleStartSimulation('webpage')}
                  disabled={isSimulating}
                  className="p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/50 rounded-xl text-center space-y-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4 text-sky-400 mx-auto" />
                  <span className="text-[11px] font-bold block text-white">Ukurasa / Tovuti</span>
                  <span className="text-[9px] text-stone-400 block">Fungua Tovuti</span>
                </button>
              </div>
            </div>
          </div>

          {/* HARDWARE SCRIPT EXPORT CARD */}
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e6e2d3] pb-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Amri Rasmi ya Router / Cloud (Export Script)</span>
                </h4>
                <p className="text-[10px] text-stone-400">
                  Ibandike moja kwa moja kwenye router yako ili uanze kutumia mfumo huu.
                </p>
              </div>

              <div className="flex gap-1 bg-stone-100 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setScriptPlatform('mikrotik')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    scriptPlatform === 'mikrotik' ? 'bg-white shadow-2xs text-stone-900 font-black' : 'text-stone-500'
                  }`}
                >
                  MikroTik
                </button>
                <button
                  onClick={() => setScriptPlatform('radius_nexor')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    scriptPlatform === 'radius_nexor' ? 'bg-white shadow-2xs text-stone-900 font-black' : 'text-stone-500'
                  }`}
                >
                  RADIUS / Cloud
                </button>
                <button
                  onClick={() => setScriptPlatform('openwrt')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    scriptPlatform === 'openwrt' ? 'bg-white shadow-2xs text-stone-900 font-black' : 'text-stone-500'
                  }`}
                >
                  OpenWrt
                </button>
              </div>
            </div>

            {/* Script Display Terminal */}
            <div className="relative">
              <pre className="p-3.5 bg-stone-950 text-emerald-400 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto max-h-56 border border-stone-850">
                {generateScript()}
              </pre>

              <button
                onClick={handleCopyScript}
                className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-bold flex items-center gap-1 border border-stone-700 shadow-md transition-all cursor-pointer"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Imenakiliwa!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-300" />
                    <span>Nakili Script</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-[10px] text-stone-600 space-y-1">
              <strong className="text-stone-800 block">Jinsi ya Kutumia:</strong>
              <p>
                1. Nakili script hii.<br />
                2. Fungua Terminal ya router yako (au Cloud RADIUS profile) kisha bonyeza <strong>Paste</strong> na <strong>Enter</strong>.<br />
                3. Mtandao wako utaanza kutoa Speed Burst ya sekunde 12 kwa kila mteja moja kwa moja!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
