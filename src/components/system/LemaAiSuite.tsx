import React, { useState, useEffect } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language } from '../../types';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Bot,
  TrendingUp,
  BatteryCharging,
  Radio,
  Volume2,
  VolumeX,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  MapPin,
  Clock,
  Smartphone,
  Eye,
  Sliders,
  Play,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface LemaAiSuiteProps {
  lang: Language;
  onDeployPackage?: (name: string, price: number, durationHours: number) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LemaAiSuite: React.FC<LemaAiSuiteProps> = ({
  lang,
  onDeployPackage,
  showToast,
}) => {
  const { settings, transactions, activeSessions, updateSettings } = useHotspot();
  const [activeAiTab, setActiveAiTab] = useState<
    'fraud' | 'shaper' | 'whatsapp' | 'pricing' | 'maintenance' | 'voice' | 'heatmap'
  >('fraud');

  // ==========================================
  // 1. FRAUD GUARD STATE
  // ==========================================
  const [fraudScore, setFraudScore] = useState<number>(0);
  const [antiSpoofEnabled, setAntiSpoofEnabled] = useState<boolean>(true);
  const [vpnBlockEnabled, setVpnBlockEnabled] = useState<boolean>(true);
  const [replayBlockEnabled, setReplayBlockEnabled] = useState<boolean>(true);
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);

  const runFraudTest = () => {
    showToast('AI Fraud Shield', 'Inachambua mfumo wa miamala na kagua ulinzi wa Walled Garden...', 'info');
    setTimeout(() => {
      const newLog = {
        id: `f-${Date.now()}`,
        time: 'Sasa hivi',
        phone: '0766 554 122',
        mac: '78:AB:11:90:33:01',
        type: 'SMS Forgery Simulator',
        risk: 'High (94%)',
        action: 'INSTANTLY BLOCKED',
        details: 'Simu ilijaribu kughushi ujumbe wa Vodacom M-Pesa bila saini halali ya USSD.',
      };
      setFraudLogs([newLog, ...fraudLogs]);
      showToast('Udukuzi Umezuiwa!', 'Lema AI imegundua na kuzuia jaribio la muamala feki papo hapo!', 'success');
    }, 1200);
  };

  // ==========================================
  // 2. BANDWIDTH SHAPER STATE
  // ==========================================
  const [shaperMode, setShaperMode] = useState<'adaptive' | 'fair_share' | 'boost_priority'>('adaptive');
  const [p2pThrottle, setP2pThrottle] = useState<boolean>(true);
  const [videoSmoothing, setVideoSmoothing] = useState<boolean>(true);
  const [lowLatencyVoip, setLowLatencyVoip] = useState<boolean>(true);
  const [bufferbloatReduction, setBufferbloatReduction] = useState<number>(88);

  const trafficBreakdown = [
    { name: 'WhatsApp & Web Browsing', mbps: 18.4, priority: 'Ultra High (Kipaumbele)', color: '#10b981' },
    { name: 'YouTube & TikTok Video', mbps: 26.2, priority: 'Smooth Adaptive (Kupunguza Mgandamizo)', color: '#3b82f6' },
    { name: 'Mitihani & Chuo Portals', mbps: 8.5, priority: 'Guaranteed Bandwidth', color: '#8b5cf6' },
    { name: 'P2P / Torrent Downloads', mbps: 3.1, priority: 'Auto-Throttled (Imepunguzwa)', color: '#ef4444' },
  ];

  // ==========================================
  // 3. WHATSAPP BOT STATE
  // ==========================================
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'user',
      text: 'Habari, nimetuma buku kwa M-Pesa lakini simu yangu haijaunganishwa kwenye WiFi.',
      time: '10:42 AM',
    },
    {
      sender: 'bot',
      text: 'Habari ndugu mteja! Lema AI Msaidizi imepokea ujumbe wako. Nimefanya ukaguzi wa namba yako kwenye Vodacom M-Pesa: Muamala wako wa Tsh 1,000 (Ref: QK91820) umethibitishwa! ✅\n\nNimeiunganisha simu yako moja kwa moja bila kuhitaji nenosiri. Vocha yako ya dharura ni: 9482 (Masaa 24). Karibu sana!',
      time: '10:42 AM',
    },
    {
      sender: 'user',
      text: 'Asante sana, mtandao umewaka vizuri sasa hivi!',
      time: '10:43 AM',
    },
    {
      sender: 'bot',
      text: 'Karibu tena Lema Fast WiFi! Furahia intaneti ya kasi ya Fiber & Starlink. Ukihitaji msaada wowote, nipo hapa 24/7 kukuhudumia papo hapo. 🚀',
      time: '10:43 AM',
    },
  ]);
  const [botInput, setBotInput] = useState<string>('');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  const handleSendBotMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botInput.trim()) return;

    const userText = botInput;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBotMessages((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setBotInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let reply = 'Lema AI Msaidizi: ';
      const lower = userText.toLowerCase();

      if (lower.includes('bando') || lower.includes('pesa') || lower.includes('lipa')) {
        reply += 'Nimekagua mtandao wetu wa malipo. Malipo ya M-Pesa na Mixx by Yas yanaunganisha ndani ya sekunde 3. Ukikwama, nitumie nambari ya muamala au piga picha ya SMS nikuhudumie moja kwa moja!';
      } else if (lower.includes('bei') || lower.includes('vifurushi') || lower.includes('gharama')) {
        reply += 'Vifurushi vya Lema Fast WiFi ni: Saa 1 (Tsh 500), Masaa 3 (Tsh 1,000), Masaa 24 (Tsh 2,000), na Wiki 1 (Tsh 7,000). Vina spidi ya hadi 15Mbps bila kikomo!';
      } else if (lower.includes('password') || lower.includes('nenosiri') || lower.includes('jina')) {
        reply += 'Mtandao wetu wa "Lema Fast WiFi" hauna password kwenye WiFi settings. Jiunge bure, kisha ukurasa wa kujihudumia utafunguka ambapo unaingiza vocha au kulipia!';
      } else {
        reply += `Nimepokea ujumbe wako kuhusu "${userText}". Mfumo wa Lema AI umerekodi taarifa zako na umekagua afya ya antenna za eneo lako; mtandao uko hewani 100%. Kuna chochote kingine ungependa nikusaidie?`;
      }

      setBotMessages((prev) => [...prev, { sender: 'bot', text: reply, time: now }]);
      setIsBotTyping(false);
    }, 1000);
  };

  // ==========================================
  // 4. DYNAMIC PRICING STATE
  // ==========================================
  const forecastData = [
    { day: 'Jtatu', actual: 45000, aiPredicted: 48000 },
    { day: 'Jnn', actual: 52000, aiPredicted: 55000 },
    { day: 'Jtano', actual: 61000, aiPredicted: 62000 },
    { day: 'Alh', actual: 58000, aiPredicted: 64000 },
    { day: 'Ijumaa', actual: 82000, aiPredicted: 85000 },
    { day: 'Jmosi', actual: 95000, aiPredicted: 102000 },
    { day: 'Jpili', actual: 88000, aiPredicted: 98000 },
  ];

  const aiPackageRecommendations = [
    {
      id: 'rec-1',
      title: 'EPL & Mechi za Jumamosi (Flash Pack)',
      price: 500,
      duration: 3,
      benefit: '+38% Mauzo ya Wikendi',
      reason: 'Wateja wengi vibandani wanaangalia mechi masaa 2-3 bila kuhitaji bando la siku nzima.',
      badge: 'High Demand',
    },
    {
      id: 'rec-2',
      title: 'Night Owl Student Pack (Mikesho ya Usiku)',
      price: 1000,
      duration: 6,
      benefit: '+24% Faida ya Usiku',
      reason: 'Wanafunzi na vijana wanapakua filamu saa 6 usiku hadi saa 12 asubuhi wakati mtandao hauna msongamano.',
      badge: 'Off-Peak Booster',
    },
    {
      id: 'rec-3',
      title: 'Kifurushi cha Siku 3 (Weekend Binge)',
      price: 4000,
      duration: 72,
      benefit: '+18% Customer Retention',
      reason: 'Inafaa kwa wageni wanaokuja wikendi na hawataki vocha fupi za masaa 24.',
      badge: 'Popular',
    },
  ];

  // ==========================================
  // 5. PREDICTIVE MAINTENANCE STATE
  // ==========================================
  const apHealthUnits: any[] = [];

  // ==========================================
  // 6. VOICE AI STATE
  // ==========================================
  const [voiceDialect, setVoiceDialect] = useState<'sanifu' | 'kijanja' | 'tulivu'>('sanifu');
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  const testVoiceSample = () => {
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const narration =
      voiceDialect === 'kijanja'
        ? 'Niaje mteja wetu wa Lema Fast WiFi! Unataka kupiga intaneti ya spidi kali? Bonyeza Vodacom M-Pesa au Mixx by Yas, weka namba yako ya simu, na mtandao unawaka chap kwa haraka bila password!'
        : voiceDialect === 'tulivu'
        ? 'Habari za wakati huu. Karibu kwenye huduma ya Lema Fast WiFi. Tafadhali chagua kifurushi chako, kisha weka namba yako ya simu ya Vodacom au Mixx by Yas ili kupokea ujumbe wa kulipia.'
        : 'Karibu Lema Fast WiFi! Kujihudumia ni rahisi: Chagua kifurushi, gusa kitufe cha M-Pesa au Mixx by Yas, na weka namba yako ya simu. Mtandao utawaka kiotomatiki mara baada ya kuweka PIN.';

    if ('speechSynthesis' in window) {
      setIsPlayingVoice(true);
      const utter = new SpeechSynthesisUtterance(narration);
      utter.lang = 'sw-TZ';
      utter.rate = 0.95;
      utter.pitch = 1.05;

      utter.onend = () => setIsPlayingVoice(false);
      utter.onerror = () => setIsPlayingVoice(false);

      window.speechSynthesis.speak(utter);
    } else {
      showToast('Sauti ya Lema AI', narration, 'info');
    }
  };

  // ==========================================
  // 7. HEATMAP & COVERAGE OPTIMIZER STATE
  // ==========================================
  const [antennaElevation, setAntennaElevation] = useState<number>(6.5); // meters
  const [antennaTilt, setAntennaTilt] = useState<number>(12); // degrees down
  const [coverageRadius, setCoverageRadius] = useState<number>(185); // meters

  return (
    <div className="space-y-6 animate-fadeIn text-stone-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-stone-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>Lema AI Autonomous Intelligence Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Injini 7 Janja Zinazoiendesha Lema Fast WiFi Kiotomatiki
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Kuanzia kuzuia udukuzi wa miamala, kugawa spidi za intaneti kwa usawa, mhudumu wa WhatsApp masaa 24, hadi kutabiri hitilafu za umeme wa sola na ramani ya mawimbi mtaani.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="p-3 bg-stone-900/80 border border-indigo-500/20 rounded-2xl text-center">
              <span className="text-2xl font-black text-indigo-400 font-mono">100%</span>
              <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Ulinzi wa AI</span>
            </div>
            <div className="p-3 bg-stone-900/80 border border-emerald-500/20 rounded-2xl text-center">
              <span className="text-2xl font-black text-emerald-400 font-mono">24/7</span>
              <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Mhudumu wa Wateja</span>
            </div>
          </div>
        </div>

        {/* 7 Interactive Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-stone-800/80 mt-6 scrollbar-none">
          <button
            onClick={() => setActiveAiTab('fraud')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'fraud'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>1. Ulinzi wa Miamala (Fraud Guard)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('shaper')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'shaper'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>2. Mgawanyo wa Spidi (Traffic Shaper)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('whatsapp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'whatsapp'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>3. WhatsApp Bot (Mhudumu 24/7)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'pricing'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>4. Utabiri wa Mauzo (Smart Pricing)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('maintenance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'maintenance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>5. Afya ya Antena & Sola (Predictive)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('voice')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'voice'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <Volume2 className="w-4 h-4 text-yellow-400" />
            <span>6. Msaada wa Sauti (Voice AI)</span>
          </button>

          <button
            onClick={() => setActiveAiTab('heatmap')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAiTab === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span>7. Ramani ya Mawimbi (Heatmap)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FRAUD & SECURITY SHIELD */}
      {/* ========================================================================= */}
      {activeAiTab === 'fraud' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Ulinzi wa AI dhidi ya Udukuzi</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-400">Shield Active</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <div>
                  <strong className="text-white block">Anti-Replay Protection</strong>
                  <span className="text-[10px] text-stone-400">Zuia kutumia SMS ya M-Pesa mara mbili</span>
                </div>
                <button
                  onClick={() => setReplayBlockEnabled(!replayBlockEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                    replayBlockEnabled ? 'bg-indigo-600' : 'bg-stone-700'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${replayBlockEnabled ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <div>
                  <strong className="text-white block">MAC Clone & Spoof Shield</strong>
                  <span className="text-[10px] text-stone-400">Zuia kuiga kitambulisho cha simu</span>
                </div>
                <button
                  onClick={() => setAntiSpoofEnabled(!antiSpoofEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                    antiSpoofEnabled ? 'bg-indigo-600' : 'bg-stone-700'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${antiSpoofEnabled ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                <div>
                  <strong className="text-white block">VPN / DNS Tunnel Block</strong>
                  <span className="text-[10px] text-stone-400">Zuia udukuzi wa Port 53 bila vocha</span>
                </div>
                <button
                  onClick={() => setVpnBlockEnabled(!vpnBlockEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                    vpnBlockEnabled ? 'bg-indigo-600' : 'bg-stone-700'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${vpnBlockEnabled ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <button
                onClick={runFraudTest}
                className="w-full py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Simulate / Kagua Udukuzi Sasa</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Logi za Miamala na Vitisho Vilivyozuiwa na Lema AI</span>
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Miamala yote inachunguzwa kabla intaneti haijawashwa.</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Mtandao uko salama 100%</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {fraudLogs.length > 0 ? (
                fraudLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold font-mono text-[10px]">
                          {log.action}
                        </span>
                        <strong className="text-white">{log.type}</strong>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{log.time}</span>
                    </div>

                    <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/60">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1">
                      <span>Simu: <strong className="text-stone-200">{log.phone}</strong></span>
                      <span>MAC: <strong className="text-stone-200">{log.mac}</strong></span>
                      <span>Hatari: <strong className="text-rose-400">{log.risk}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-stone-950 border border-stone-800 rounded-2xl text-stone-500 font-sans text-xs space-y-1">
                  <p className="font-bold text-stone-400">Hakuna tishio lolote lililogunduliwa.</p>
                  <p>Miamala yote inachunguzwa na kulindwa 24/7 dhidi ya udanganyifu wa SMS au MAC spoofing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SMART BANDWIDTH & TRAFFIC SHAPER */}
      {/* ========================================================================= */}
      {activeAiTab === 'shaper' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 text-xs">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Traffic Shaping Strategy</span>
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">Gawa intaneti kiotomatiki ili kuzuia mtandao kukwama.</p>
            </div>

            <div className="space-y-2">
              <label className="text-stone-400 font-bold block">Mfumo wa Kugawa Spidi:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'adaptive', name: 'Lema AI Adaptive (Inabadilika kulingana na wateja)', badge: 'Recommended' },
                  { id: 'fair_share', name: 'Equal Fair Share (Kila mteja anapata sehemu sawa)', badge: 'Strict' },
                  { id: 'boost_priority', name: 'VoIP & WhatsApp Priority (Simu na Messages kwanza)', badge: 'Fast calls' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setShaperMode(mode.id as any)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      shaperMode === mode.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span>{mode.name}</span>
                    <span className="text-[9px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">{mode.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span>P2P / Torrent Auto-Throttle</span>
                <input
                  type="checkbox"
                  checked={p2pThrottle}
                  onChange={(e) => setP2pThrottle(e.target.checked)}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span>Smart Video Buffer Smoothing</span>
                <input
                  type="checkbox"
                  checked={videoSmoothing}
                  onChange={(e) => setVideoSmoothing(e.target.checked)}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <div className="flex justify-between">
                  <span>Bufferbloat Reduction Score</span>
                  <strong className="text-emerald-400">{bufferbloatReduction}%</strong>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${bufferbloatReduction}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Mgawo wa Trafiki ya Sasa (Live Traffic Classification)</h3>
                <p className="text-[10px] text-stone-400">Lema AI inachambua kila pakiti ya data bila kufungua siri za mteja.</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">Jumla: 56.2 Mbps</span>
            </div>

            <div className="space-y-4">
              {trafficBreakdown.map((item, idx) => (
                <div key={idx} className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{item.name}</strong>
                    <span className="font-mono font-bold text-stone-200">{item.mbps} Mbps</span>
                  </div>

                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.mbps / 56.2) * 100}%`, backgroundColor: item.color }} />
                  </div>

                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>Hatua ya AI: <strong style={{ color: item.color }}>{item.priority}</strong></span>
                    <span>{((item.mbps / 56.2) * 100).toFixed(0)}% ya bandwidth</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WHATSAPP 24/7 AI SUPPORT BOT */}
      {/* ========================================================================= */}
      {activeAiTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Chat Simulator */}
          <div className="lg:col-span-7 bg-[#0b141a] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[540px]">
            {/* WhatsApp Header */}
            <div className="p-4 bg-[#202c33] text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-base text-white">
                  L
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none">Lema Fast WiFi Support Bot</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Online (Inajibu papo hapo 24/7)</span>
                  </span>
                </div>
              </div>
              <span className="text-xs bg-stone-700/60 px-2.5 py-1 rounded-lg text-stone-300 font-mono">
                {settings.supportPhone || '0653 578 184'}
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] text-xs">
              <div className="text-center">
                <span className="px-3 py-1 bg-[#182229] text-[10px] rounded-full text-stone-400">
                  Ujumbe umesimbwa kwa njia ya siri ya mwisho-hadi-mwisho (End-to-End Encrypted)
                </span>
              </div>

              {botMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl space-y-1 shadow-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                        : 'bg-[#202c33] text-stone-100 rounded-tl-none border border-stone-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs">{msg.text}</p>
                    <span className="text-[9px] text-stone-300 block text-right font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="p-2.5 bg-[#202c33] text-emerald-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                    <span className="text-[10px] text-stone-400">Lema AI inaandika jibu...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendBotMessage} className="p-3 bg-[#202c33] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                placeholder="Andika swali au namba yako ya simu kujaribu bot..."
                className="flex-1 px-4 py-2 bg-[#2a3942] text-white rounded-xl text-xs focus:outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Bot Control Panel */}
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 text-xs">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Sanidi WhatsApp AI Msaidizi</span>
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">Inaunganishwa na WhatsApp Cloud API au namba yako ya biashara.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone-400 block mb-1">Namba ya WhatsApp ya Biashara:</label>
                <input
                  type="text"
                  value={settings.supportPhone || '+255 653 578 184'}
                  onChange={(e) => updateSettings({ supportPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <strong className="text-white block">Uwezo wa Bot uliowashwa:</strong>
                <div className="space-y-1.5 text-stone-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kuthibitisha miamala ya M-Pesa & Mixx by Yas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kutuma vocha mbadala mteja anapokwama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kujibu maswali ya bei na jinsi ya kujiunga</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kuamsha router (Auto-Reconnect) usiku</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => showToast('WhatsApp AI', 'Mipangilio ya WhatsApp API imesasishwa kwa ufanisi!', 'success')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer transition-colors"
              >
                Hifadhi Mipangilio ya Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DYNAMIC PRICING & REVENUE FORECASTER */}
      {/* ========================================================================= */}
      {activeAiTab === 'pricing' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue Chart */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Utabiri wa Mauzo ya Siku 7 Zijazo (Lema AI Predictive Run-rate)</span>
                </h3>
                <p className="text-[10px] text-stone-400">Inalinganisha mapato halisi (kijani) na utabiri wa AI (sky blue) kulingana na wateja mtaani.</p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                Utabiri wa Mwezi: Tsh 2,450,000
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="day" stroke="#a8a29e" fontSize={11} />
                  <YAxis stroke="#a8a29e" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: 12, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={0.2} fill="#10b981" name="Mauzo Halisi (TZS)" />
                  <Area type="monotone" dataKey="aiPredicted" stroke="#38bdf8" fill="url(#aiGrad)" name="Utabiri wa AI (TZS)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiPackageRecommendations.map((rec) => (
              <div key={rec.id} className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-mono text-[9px] font-bold">
                      {rec.badge}
                    </span>
                    <strong className="text-white font-mono text-sm">Tsh {rec.price.toLocaleString()}</strong>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">{rec.title}</h4>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{rec.reason}</p>
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 block">{rec.benefit}</span>
                  <button
                    onClick={() => {
                      if (onDeployPackage) {
                        onDeployPackage(rec.title, rec.price, rec.duration);
                      }
                      showToast('Kifurushi Kimeongezwa!', `"${rec.title}" sasa kipo hewani kwenye Captive Portal ya wateja!`, 'success');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Washa Kwenye Portal Sasa ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PREDICTIVE AP MAINTENANCE & SOLAR HEALTH */}
      {/* ========================================================================= */}
      {activeAiTab === 'maintenance' && (
        <div className="space-y-6 animate-fadeIn">
          {apHealthUnits.length === 0 ? (
            <div className="p-10 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
              <Radio className="w-10 h-10 text-stone-600 mx-auto" />
              <h4 className="text-white font-bold text-sm">Hakuna Access Point / Antenna Iliyounganishwa</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                Moduli hii ya AI itafuatilia joto, volti ya sola, na ubora wa mawimbi mara tu utakaposajili Access Point yako kwenye mtandao (kupitia SSID / LAN au Router).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {apHealthUnits.map((ap, idx) => (
              <div
                key={idx}
                className={`bg-stone-900 border rounded-3xl p-5 space-y-4 text-xs ${
                  ap.status === 'warning' ? 'border-amber-500/50 bg-amber-950/10' : 'border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{ap.name}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">{ap.model}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                      ap.status === 'warning' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {ap.status === 'warning' ? 'Tahadhari ya Sola' : 'Healthy'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-stone-950 rounded-xl">
                    <span className="text-stone-500 block text-[9px]">Joto (Temp):</span>
                    <strong className="text-stone-200">{ap.temp}</strong>
                  </div>
                  <div className="p-2 bg-stone-950 rounded-xl">
                    <span className="text-stone-500 block text-[9px]">Volti ya PoE:</span>
                    <strong className="text-stone-200">{ap.voltage}</strong>
                  </div>
                  <div className="p-2 bg-stone-950 rounded-xl col-span-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-500">Betri ya Sola / UPS:</span>
                      <strong className={ap.solarBattery < 40 ? 'text-amber-400' : 'text-emerald-400'}>{ap.solarBattery}%</strong>
                    </div>
                    <div className="w-full bg-stone-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${ap.solarBattery < 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${ap.solarBattery}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 text-[10px] text-stone-300 leading-relaxed">
                  {ap.prediction}
                </div>

                <button
                  onClick={() => showToast('Uchunguzi wa AI', `Kifaa cha ${ap.name} kimefanyiwa uchunguzi kamili wa pings, memory, na anteni. Hakuna hitilafu iliyozuiwa.`, 'info')}
                  className="w-full py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold rounded-xl cursor-pointer transition-colors text-[11px]"
                >
                  Fanya Deep Health Scan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* ========================================================================= */}
      {/* 6. VOICE AI ASSISTANCE (KISWAHILI AUDIO GUIDE) */}
      {/* ========================================================================= */}
      {activeAiTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 text-xs">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-yellow-400" />
                <span>Msaada wa Sauti ya Kiswahili kwa Wateja</span>
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">Inaelekeza wateja mtaani kwa sauti jinsi ya kulipa au kuingiza vocha bila kupiga simu.</p>
            </div>

            <div className="space-y-3">
              <label className="text-stone-400 font-bold block">Mtindo wa Sauti (Voice Style):</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sanifu', name: 'Kiswahili Sanifu' },
                  { id: 'kijanja', name: 'Sauti ya Mtaani' },
                  { id: 'tulivu', name: 'Sauti Tulivu' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setVoiceDialect(item.id as any)}
                    className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      voiceDialect === item.id
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Ujumbe unaosomwa kwa sauti:</span>
                <p className="text-stone-200 italic leading-relaxed text-[11px]">
                  {voiceDialect === 'kijanja'
                    ? '"Niaje mteja wetu wa Lema Fast WiFi! Unataka kupiga intaneti ya spidi kali? Bonyeza Vodacom M-Pesa au Mixx by Yas, weka namba yako ya simu, na mtandao unawaka chap kwa haraka bila password!"'
                    : voiceDialect === 'tulivu'
                    ? '"Habari za wakati huu. Karibu kwenye huduma ya Lema Fast WiFi. Tafadhali chagua kifurushi chako, kisha weka namba yako ya simu ya Vodacom au Mixx by Yas ili kupokea ujumbe wa kulipia."'
                    : '"Karibu Lema Fast WiFi! Kujihudumia ni rahisi: Chagua kifurushi, gusa kitufe cha M-Pesa au Mixx by Yas, na weka namba yako ya simu. Mtandao utawaka kiotomatiki mara baada ya kuweka PIN."'}
                </p>
              </div>

              <button
                onClick={testVoiceSample}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
              >
                {isPlayingVoice ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingVoice ? 'Simamisha Sauti' : 'Sikiliza Sauti ya Lema AI Sasa'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-white">Jinsi Inavyofanya Kazi Kwenye Captive Portal</h4>
            <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                  🎙️
                </div>
                <div>
                  <strong className="text-white block">Kitufe cha Kipaza Sauti</strong>
                  <span className="text-[10px] text-stone-400">Kinapatikana juu ya ukurasa wa wateja</span>
                </div>
              </div>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                Wateja wasiojua kusoma au wazee wanapogusa kipaza sauti, simu zao zinasoma kwa sauti ya Kiswahili safi namna ya kuchagua vifurushi na kulipa kwa simu, jambo linalopunguza maswali kwa 90%!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. STREET WIFI HEATMAP & COVERAGE OPTIMIZER */}
      {/* ========================================================================= */}
      {activeAiTab === 'heatmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Controls */}
          <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 text-xs">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>Usanidi wa Antenna & Mawimbi</span>
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">Lema AI inakokotoa urefu na uelekeo wa antenna.</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Urefu wa Mlingoti (Elevation):</span>
                  <strong className="text-indigo-400 font-mono">{antennaElevation} Mita</strong>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={0.5}
                  value={antennaElevation}
                  onChange={(e) => setAntennaElevation(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Mu直し wa Antenna (Tilt Down Angle):</span>
                  <strong className="text-indigo-400 font-mono">{antennaTilt}° chini</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={antennaTilt}
                  onChange={(e) => setAntennaTilt(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Umbali Uliokadiriwa wa Mawimbi:</span>
                  <strong className="text-emerald-400 font-mono">{coverageRadius} Mita (360°)</strong>
                </div>
                <input
                  type="range"
                  min={50}
                  max={350}
                  step={10}
                  value={coverageRadius}
                  onChange={(e) => setCoverageRadius(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1.5 text-[11px]">
                <strong className="text-white block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Ushauri wa Lema AI kwa Mtaa Huu:</span>
                </strong>
                <p className="text-stone-300 leading-relaxed text-[10px]">
                  Kwenye urefu wa <strong>{antennaElevation}m</strong> na mwinamo wa <strong>{antennaTilt}°</strong>, mawimbi yataruka juu ya mabati na kufika kijiwe cha bodaboda na maduka ya sokoni bila kizuizi cha matofali.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Heatmap Radar Display */}
          <div className="lg:col-span-8 bg-stone-950 border border-stone-800 rounded-3xl p-6 relative flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
            {/* Radar Grid Circles */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-stone-800/80 pointer-events-none" />
            <div className="absolute w-[260px] h-[260px] rounded-full border border-indigo-500/20 pointer-events-none" />
            <div className="absolute w-[160px] h-[160px] rounded-full border border-emerald-500/30 pointer-events-none" />

            {/* Sweep radar arm */}
            <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-transparent via-transparent to-indigo-500/10 animate-spin pointer-events-none" />

            {/* Simulated Street landmarks */}
            <div className="absolute top-12 left-16 text-[10px] font-mono text-stone-500 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
              🏬 Maduka ya Mtaa (Rssi -58dBm)
            </div>
            <div className="absolute bottom-16 right-16 text-[10px] font-mono text-stone-500 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
              🛵 Kijiwe cha Bodaboda (Rssi -64dBm)
            </div>
            <div className="absolute top-20 right-24 text-[10px] font-mono text-stone-500 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
              🏫 Shule / Chuo (Rssi -69dBm)
            </div>

            {/* Center Access Point Icon */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 text-2xl border-2 border-indigo-400">
                📡
              </div>
              <strong className="text-white text-xs block">Outdoor EAP225 AP</strong>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Radius: {coverageRadius}m Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
