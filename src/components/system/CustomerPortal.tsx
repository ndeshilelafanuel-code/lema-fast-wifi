import React, { useState } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import { MixxByYasLogo } from '../common/MixxByYasLogo';
import {
  Wifi,
  Smartphone,
  Lock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  LogOut,
  Sparkles,
  MessageSquare,
  Bot
} from 'lucide-react';

interface CustomerPortalProps {
  lang: Language;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ lang }) => {
  const {
    settings,
    processMobilePayment,
    redeemVoucher,
    currentClientSession,
    disconnectSession,
  } = useHotspot();

  const [activeTab, setActiveTab] = useState<'mobile-stk' | 'voucher' | 'trial'>('mobile-stk');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(settings.packages[1]?.id || settings.packages[0]?.id);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);
  const [simulatedPin, setSimulatedPin] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');

  // Live real-time Billing & Session Expiry tracking states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [simulatedDataLimitMb, setSimulatedDataLimitMb] = useState<number>(1000); // 1 GB allocation
  const [simulatedDataUsedMb, setSimulatedDataUsedMb] = useState<number>(0);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState<boolean>(false);
  const [showAiPortalHelp, setShowAiPortalHelp] = useState<boolean>(false);

  const toggleVoiceGuide = () => {
    if (isSpeakingVoice) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeakingVoice(false);
      return;
    }

    const narration =
      lang === 'sw'
        ? `Karibu kwenye mtandao wa Lema Fast WiFi. Kujihudumia ni rahisi: Chagua kifurushi chako hapo chini, kisha gusa kitufe cha Vodacom M-Pesa au Mixx by Yas, na weka namba yako ya simu. Baada ya kuweka namba yako ya siri ya mtandao, intaneti itawaka papo hapo bila kuhitaji nenosiri.`
        : `Welcome to Lema Fast WiFi. Self-service is quick: Select your bundle, choose M-Pesa or Mixx by Yas, and enter your phone number to receive instant payment prompt.`;

    if ('speechSynthesis' in window) {
      setIsSpeakingVoice(true);
      const utter = new SpeechSynthesisUtterance(narration);
      utter.lang = lang === 'sw' ? 'sw-TZ' : 'en-US';
      utter.rate = 0.92;
      utter.pitch = 1.05;

      utter.onend = () => setIsSpeakingVoice(false);
      utter.onerror = () => setIsSpeakingVoice(false);

      window.speechSynthesis.speak(utter);
    } else {
      setIsSpeakingVoice(true);
      setTimeout(() => setIsSpeakingVoice(false), 5000);
    }
  };

  // Live Expiry & Dynamic Data depletion thread
  React.useEffect(() => {
    if (!currentClientSession) return;

    // Set initial values
    const targetTimeMs = new Date(currentClientSession.expiresAt || Date.now() + 3600000).getTime();
    const calculateSecondsLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((targetTimeMs - now) / 1000));
    };

    setTimeLeftSec(calculateSecondsLeft());

    const billingInterval = setInterval(() => {
      const secLeft = calculateSecondsLeft();
      setTimeLeftSec(secLeft);

      // Simulate live random device download consumption (drains 0.4 MB to 1.8 MB per second)
      setSimulatedDataUsedMb((prev) => {
        const nextUsed = prev + (0.4 + Math.random() * 1.4);
        if (nextUsed >= simulatedDataLimitMb) {
          clearInterval(billingInterval);
          // Zero balance disconnect trigger!
          disconnectSession(currentClientSession.id);
          setStatusMessage({
            type: 'error',
            text: lang === 'sw'
              ? 'Bando lako la MB limeisha kikamilifu! Unganisha kifurushi kipya kuendelea kuvinjari.'
              : 'Your data balance has reached zero! Purchase a new profile package to resume browsing.'
          });
          return simulatedDataLimitMb;
        }
        return nextUsed;
      });

      // Auto-disconnect if session time is depleted
      if (secLeft <= 0) {
        clearInterval(billingInterval);
        disconnectSession(currentClientSession.id);
        setStatusMessage({
          type: 'error',
          text: lang === 'sw'
            ? 'Muda wa bando lako umeisha (Auto-disconnected)! Bonyeza LIPA NA UNGANISHA kupata muda zaidi.'
            : 'Your voucher session has expired (Auto-disconnected)! Pay again to top up your time.'
        });
      }
    }, 1000);

    return () => clearInterval(billingInterval);
  }, [currentClientSession, simulatedDataLimitMb, lang]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (val: number) => String(val).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const selectedPkg = settings.packages.find((p) => p.id === selectedPackageId) || settings.packages[0];

  // Initiate Mobile STK Push
  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Tafadhali weka namba yako ya simu kwanza.' });
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);

    // Simulate STK push prompt arrival after 600ms
    setTimeout(() => {
      setIsProcessing(false);
      setShowUssdPrompt(true);
    }, 600);
  };

  // Confirm PIN on USSD Prompt
  const handleConfirmUssd = async () => {
    setShowUssdPrompt(false);
    setIsProcessing(true);
    try {
      const result = await processMobilePayment(phoneNumber, selectedPackageId);
      setIsProcessing(false);
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setIsProcessing(false);
      setStatusMessage({ type: 'error', text: 'Hitilafu imetokea wakati wa malipo.' });
    }
  };

  // Redeem manual voucher
  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    const result = redeemVoucher(voucherCode, phoneNumber);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setVoucherCode('');
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Free trial
  const handleFreeTrial = () => {
    const result = redeemVoucher('7492', phoneNumber);
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Majaribio ya dakika 15 yameanza!' });
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Banner Notice */}
      <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {lang === 'sw'
              ? 'Huu ndio ukurasa halisi (Captive Portal) unaofunguka kwenye simu ya mteja anapounganisha WiFi yako!'
              : 'This is the live customer-facing Captive Portal that automatically launches on client smartphones!'}
          </span>
        </div>
        <span className="font-mono font-bold text-amber-400 uppercase">
          {lang === 'sw' ? 'Mteja Kujihudumia' : 'Self-Service'}
        </span>
      </div>

      {/* Main Simulated Phone / Portal Screen */}
      <div className="max-w-md mx-auto bg-[#fcfaf2] border border-[#e6e2d3] rounded-[32px] p-6 sm:p-7 shadow-2xl relative overflow-hidden text-[#3a3431] ring-4 ring-[#e6e2d3]/50">
        {/* USSD STK-Push Overlay Modal */}
        {showUssdPrompt && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-5 z-30 animate-in fade-in duration-200">
            <div className="w-full bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 text-stone-900 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                <span>Ombi la Malipo (M-Pesa / Mixx by Yas)</span>
              </div>

              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  Tuma <strong>Tsh {selectedPkg.price.toLocaleString()}</strong> kwenda kwa <strong>{settings.accountOwnerName || 'Jimmy Lema'}</strong> ({(settings.payoutAccount || '5849201').split(' ')[0]}).
                </p>
                <div className="p-2 bg-stone-100 rounded-lg text-[11px] text-stone-600">
                  Akaunti Inayopokea: <strong>{settings.accountOwnerName || 'Jimmy Lema'}</strong> · Kifurushi: {selectedPkg.name}
                </div>
                <p className="font-semibold text-stone-900 pt-1">
                  Weka Namba Yako ya Siri (PIN):
                </p>
              </div>

              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={simulatedPin}
                onChange={(e) => setSimulatedPin(e.target.value)}
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUssdPrompt(false)}
                  className="py-2.5 px-3 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUssd}
                  className="py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                >
                  Thibitisha (Send PIN)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-20 text-white space-y-3">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-center">
              Inatuma taarifa kwenye mfumo wa malipo...
            </p>
          </div>
        )}

        {/* Header Branding */}
        <div className="text-center pb-4 border-b border-stone-200/50 flex flex-col items-center">
          <LemaLogo variant="full" size="md" theme="light" showSlogan={true} className="mb-2" />
          <p className="text-[11px] text-stone-500 font-medium tracking-wide">{settings.tagline || 'Intaneti ya Kasi ya Fiber & Starlink'}</p>

          {/* Voice AI Audio Guide & WhatsApp Bot Pill Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceGuide}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isSpeakingVoice
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 animate-pulse font-black'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-amber-400'
              }`}
            >
              <span className="text-xs">{isSpeakingVoice ? '🔊' : '🎙️'}</span>
              <span>{isSpeakingVoice ? 'Inaongea... (Kusitisha)' : 'Mwongozo wa Sauti'}</span>
            </button>

            <a
              href={`https://wa.me/${(settings.supportPhone || '255653578184').replace(/[^0-9]/g, '')}?text=Habari!+Nahitaji+msaada+wa+vocha+au+bando+kwenye+WiFi`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
              <span>WhatsApp Bot (Msaada 24/7)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </a>
          </div>
        </div>

        {/* ACTIVE SESSION DASHBOARD (If User Is Connected) */}
        {currentClientSession ? (
          <div className="py-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Umeunganishwa Mtandaoni!' : 'You Are Online!'}
              </h3>
              <p className="text-xs text-emerald-300">
                Kifurushi Chako: <strong>{currentClientSession.packageName}</strong>
              </p>
            </div>

            {/* REAL-TIME TIMESTAMPS & BALANCE METERS */}
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Card 1: Time Left */}
              <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-xl space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Muda Uliobaki</span>
                <span className="text-sm font-black font-mono text-amber-400 block animate-pulse">
                  {formatTime(timeLeftSec)}
                </span>
              </div>

              {/* Card 2: Simulated Data Balance */}
              <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-xl space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Bando la MB</span>
                <span className="text-sm font-black font-mono text-emerald-400 block">
                  {Math.max(0, Math.round(simulatedDataLimitMb - simulatedDataUsedMb))} MB
                </span>
              </div>
            </div>

            {/* Simulated Live Data Usage Progress Bar */}
            <div className="bg-stone-850 rounded-xl p-4 border border-stone-800 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-400">Matumizi ya Data (Simulated Usage):</span>
                <span className="text-white font-mono font-bold">
                  {simulatedDataUsedMb.toFixed(1)} MB / {simulatedDataLimitMb} MB
                </span>
              </div>
              <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (simulatedDataUsedMb / simulatedDataLimitMb) * 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-stone-500 italic text-right">
                Inakula MB kiotomatiki kutokana na michezo & video za nyuma.
              </p>
            </div>

            <div className="bg-stone-850 rounded-xl p-4 border border-stone-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Namba ya Vocha / Code:</span>
                <span className="font-mono font-bold text-amber-400">{currentClientSession.voucherCode}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Anwani ya IP (IP Address):</span>
                <span className="font-mono text-stone-300">{currentClientSession.ipAddress}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Spidi ya Mtandao:</span>
                <span className="font-mono text-stone-300">{currentClientSession.speedLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Hali ya Token (Accounting):</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syncing Active
                </span>
              </div>
            </div>

            <button
              onClick={() => disconnectSession(currentClientSession.id)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Tenganisha Mtandao (Disconnect)</span>
            </button>
          </div>
        ) : (
          /* NOT CONNECTED: LOGIN & PAYMENT FORMS */
          <div className="py-5 space-y-4">
            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('mobile-stk')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'mobile-stk'
                    ? 'bg-[#cca43b] text-white shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Lipa kwa Simu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voucher')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'voucher'
                    ? 'bg-[#cca43b] text-white shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Weka Vocha
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trial')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'trial'
                    ? 'bg-[#cca43b] text-white shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Bure (Trial)
              </button>
            </div>

            {/* TAB 1: Mobile Money STK-Push */}
            {activeTab === 'mobile-stk' && (
              <form onSubmit={handleStartPayment} className="space-y-4">
                {/* Lema AI Live Signal Quality Badge */}
                <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-[11px] flex items-center justify-between text-indigo-950 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lema AI:</span>
                    </span>
                    <span className="text-emerald-700 font-extrabold truncate">Spidi Bora (15 Mbps)</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                    Ping 11ms · 4K Ready
                  </span>
                </div>

                {/* Select Package */}
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1.5">
                    Chagua Kifurushi:
                  </label>
                  <div className="space-y-1.5">
                    {settings.packages.map((pkg, idx) => {
                      const isSelected = pkg.id === selectedPackageId;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/5 border-[#cca43b] text-stone-900 ring-1 ring-[#cca43b]'
                              : 'bg-white border-[#e6e2d3] hover:border-stone-400 text-stone-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                              <span>{pkg.name}</span>
                              {idx === 1 && (
                                <span className="text-[9px] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 shadow-xs">
                                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                                  <span>AI Choice</span>
                                </span>
                              )}
                              {pkg.isPopular && idx !== 1 && (
                                <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                                  Bora
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              Muda: {pkg.durationHours} Hours · Spidi: {pkg.speedDownload}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#cca43b]">
                            Tsh {pkg.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Corporate Mobile Money Selector Grid (M-Pesa, Tigo Pesa, Airtel Money, Halopesa) */}
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-2">
                    Chagua Mtandao wa Simu (Mobile Money Network):
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Vodacom M-Pesa */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('mpesa')}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between h-[75px] ${
                        selectedNetwork === 'mpesa'
                          ? 'bg-red-600/10 border-red-500 text-white ring-1 ring-red-500 scale-[1.02] shadow-lg shadow-red-600/10'
                          : 'bg-stone-850 border-stone-800 hover:border-stone-750 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black tracking-widest text-red-500 font-sans uppercase">Vodacom</span>
                        {selectedNetwork === 'mpesa' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>
                      <div className="flex items-end justify-between w-full">
                        <strong className={`text-xs font-black tracking-tight font-sans uppercase transition-colors ${
                          selectedNetwork === 'mpesa' ? 'text-stone-950' : 'text-stone-200'
                        }`}>
                          M-PESA
                        </strong>
                        <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-black text-white">M</span>
                      </div>
                    </button>

                    {/* Mixx by Yas */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('tigopesa')}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between h-[75px] ${
                        selectedNetwork === 'tigopesa'
                          ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500 scale-[1.02] shadow-lg shadow-blue-600/10'
                          : 'bg-stone-850 border-stone-800 hover:border-stone-750 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <MixxByYasLogo size={26} showText={false} />
                        {selectedNetwork === 'tigopesa' && (
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                        )}
                      </div>
                      <div className="flex items-end justify-between w-full">
                        <strong className={`text-xs font-black tracking-tight font-sans uppercase transition-colors ${
                          selectedNetwork === 'tigopesa' ? 'text-stone-950' : 'text-stone-200'
                        }`}>
                          MIXX BY YAS
                        </strong>
                      </div>
                    </button>

                    {/* Airtel Money */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('airtel')}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between h-[75px] ${
                        selectedNetwork === 'airtel'
                          ? 'bg-rose-600/10 border-rose-500 text-white ring-1 ring-rose-500 scale-[1.02] shadow-lg shadow-rose-600/10'
                          : 'bg-stone-850 border-stone-800 hover:border-stone-750 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black tracking-widest text-rose-500 font-sans uppercase">Airtel</span>
                        {selectedNetwork === 'airtel' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                      </div>
                      <div className="flex items-end justify-between w-full">
                        <strong className={`text-xs font-black tracking-tight font-sans uppercase transition-colors ${
                          selectedNetwork === 'airtel' ? 'text-stone-950' : 'text-stone-200'
                        }`}>
                          airtel money
                        </strong>
                        <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] font-black text-white">a</span>
                      </div>
                    </button>

                    {/* Halopesa */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('halopesa')}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between h-[75px] ${
                        selectedNetwork === 'halopesa'
                          ? 'bg-orange-500/10 border-orange-500 text-white ring-1 ring-orange-400 scale-[1.02] shadow-lg shadow-orange-500/10'
                          : 'bg-stone-850 border-stone-800 hover:border-stone-750 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black tracking-widest text-orange-400 font-sans uppercase">Halotel</span>
                        {selectedNetwork === 'halopesa' && (
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                        )}
                      </div>
                      <div className="flex items-end justify-between w-full">
                        <strong className={`text-xs font-black tracking-tight font-sans uppercase transition-colors ${
                          selectedNetwork === 'halopesa' ? 'text-stone-950' : 'text-stone-200'
                        }`}>
                          halopesa
                        </strong>
                        <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-black text-white">h</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">
                    Namba Yako ya Simu:
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={
                      selectedNetwork === 'mpesa'
                        ? '0754 xxx xxx / 0768 xxx xxx'
                        : selectedNetwork === 'tigopesa'
                        ? '0714 xxx xxx / 0713 xxx xxx'
                        : selectedNetwork === 'airtel'
                        ? '0784 xxx xxx / 0685 xxx xxx'
                        : '0622 xxx xxx / 0629 xxx xxx'
                    }
                    className={`w-full px-3 py-2.5 text-xs font-mono border rounded-xl bg-white text-stone-900 focus:outline-none focus:ring-1 ${
                      selectedNetwork === 'mpesa'
                        ? 'border-red-600/40 focus:ring-red-500'
                        : selectedNetwork === 'tigopesa'
                        ? 'border-blue-600/40 focus:ring-blue-500'
                        : selectedNetwork === 'airtel'
                        ? 'border-rose-600/40 focus:ring-rose-500'
                        : 'border-orange-500/40 focus:ring-orange-400'
                    }`}
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Hakikisha una salio la kutosha kwenye {
                      selectedNetwork === 'mpesa'
                        ? 'M-Pesa ya Vodacom'
                        : selectedNetwork === 'tigopesa'
                        ? 'Mixx by Yas'
                        : selectedNetwork === 'airtel'
                        ? 'Airtel Money'
                        : 'Halopesa'
                    } kupokea ujumbe wa PIN (STK Push).
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e6e2d3] text-[11px] text-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Akaunti Inayolipwa:</span>
                    <strong className="text-emerald-600">{settings.accountOwnerName || 'Jimmy Lema'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Lipa Namba / Akaunti:</span>
                    <strong className="font-mono text-stone-800">{settings.payoutAccount || '5849201 (Lipa Namba)'}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 text-xs font-black text-white rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    selectedNetwork === 'mpesa'
                      ? 'bg-red-600 hover:bg-red-500'
                      : selectedNetwork === 'tigopesa'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : selectedNetwork === 'airtel'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-orange-500 hover:bg-orange-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>LIPA NA UNGANISHA PAPO HAPO</span>
                </button>

                {/* Lema AI Instant Customer Help Accordion */}
                <div className="pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setShowAiPortalHelp(!showAiPortalHelp)}
                    className="w-full text-left p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-stone-700 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Msaada wa Papo Hapo wa Lema AI</span>
                    </span>
                    <span className="text-[10px] text-stone-500">{showAiPortalHelp ? '▲ Funga' : '▼ Maswali ya Malipo'}</span>
                  </button>

                  {showAiPortalHelp && (
                    <div className="mt-2 p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 space-y-2 animate-fadeIn shadow-xs">
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <strong className="text-stone-900 block font-bold">1. Je, umelipa na hujaunganishwa?</strong>
                        <p className="text-stone-600 text-[10px] mt-0.5 leading-relaxed">
                          Lema AI inakagua miamala ya M-Pesa na Mixx by Yas kila sekunde 3. Ukikwama, subiri sekunde 10 au weka namba yako tena kutuma upya.
                        </p>
                      </div>
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <strong className="text-stone-900 block font-bold">2. Je, unataka vocha ya karatasi?</strong>
                        <p className="text-stone-600 text-[10px] mt-0.5 leading-relaxed">
                          Gusa kichupo cha "Weka Vocha" hapo juu na uingize tarakimu 4 zilizopo kwenye risiti ya karatasi uliyonunua dukani.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: Enter Scratch Voucher */}
            {activeTab === 'voucher' && (
              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">
                    Weka Nambari ya Vocha Uliyonunua:
                  </label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mfano: 7492 au 8319"
                    className="w-full px-3 py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-[#e6e2d3] rounded-xl bg-white text-[#cca43b] focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block text-center font-medium">
                    Vocha zinapatikana maduka yote ya karibu.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-black text-white bg-[#cca43b] hover:bg-[#b89332] rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>UNGANISHA VOCHA</span>
                </button>
              </form>
            )}

            {/* TAB 3: Free Trial */}
            {activeTab === 'trial' && (
              <div className="py-4 text-center space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Pata dakika 15 za bure kupima spidi ya intaneti yetu kabla ya kufanya malipo yoyote!
                </p>
                <button
                  type="button"
                  onClick={handleFreeTrial}
                  className="w-full py-2.5 px-4 text-xs font-black text-white bg-[#cca43b] hover:bg-[#b89332] rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  ANZA DAKIKA 15 ZA BURE
                </button>
              </div>
            )}
          </div>
        )}

        {/* Support Footer */}
        <div className="pt-4 border-t border-stone-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div>
            Msaada wa Wateja: <strong className="text-stone-800">{settings.supportPhone || '0653 578 184'}</strong>
          </div>
          <a
            href={`https://wa.me/255622443249?text=Habari!+Nahitaji+msaada+wa+haraka+kwenye+WiFi`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat na Bot ya WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
