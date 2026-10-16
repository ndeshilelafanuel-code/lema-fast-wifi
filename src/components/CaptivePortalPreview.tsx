import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Language } from '../types';
import { LemaLogo } from './common/LemaLogo';
import { VoucherQrScannerModal } from './system/VoucherQrScannerModal';
import { VoiceGuideModal } from './system/VoiceGuideModal';
import {
  Smartphone,
  Wifi,
  CheckCircle2,
  Ticket,
  CreditCard,
  Sparkles,
  AlertCircle,
  Camera,
  QrCode,
  Zap,
  Lock,
  Share2,
  MessageSquare,
  Gift,
  Clock,
  Megaphone,
  Phone,
  Play,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface CaptivePortalPreviewProps {
  lang: Language;
}

export const CaptivePortalPreview: React.FC<CaptivePortalPreviewProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'mobile' | 'trial'>('voucher');
  const [voucherCode, setVoucherCode] = useState<string>('9482');
  const [phoneNumber, setPhoneNumber] = useState<string>('0653 578 184');
  const [selectedPlan, setSelectedPlan] = useState<string>('1day');
  const [simulatedStatus, setSimulatedStatus] = useState<string | null>(null);

  // 4 Features Interactive Simulations
  const [hasRememberedDevice, setHasRememberedDevice] = useState<boolean>(true);
  const [sendWhatsAppVoucher, setSendWhatsAppVoucher] = useState<boolean>(true);
  const [rememberDeviceChecked, setRememberDeviceChecked] = useState<boolean>(true);
  const [simulateTrialCooldown, setSimulateTrialCooldown] = useState<boolean>(false);
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isVoiceGuideOpen, setIsVoiceGuideOpen] = useState<boolean>(false);

  // 5. Ad Monetization States
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(10);
  const [adWatchedComplete, setAdWatchedComplete] = useState<boolean>(false);

  // USSD & FAQ States
  const [isUssdActive, setIsUssdActive] = useState<boolean>(false);
  const [ussdSeconds, setUssdSeconds] = useState<number>(60);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUssdActive && ussdSeconds > 0) {
      timer = setTimeout(() => setUssdSeconds((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isUssdActive, ussdSeconds]);

  const handleConnectVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setSimulatedStatus(
      lang === 'sw'
        ? `Umefanikiwa kuunganishwa! Vocha ya "${voucherCode}" inafanya kazi (Masaa 24 yamesalia, MAC Auto-Bound).`
        : `Connected successfully! Voucher "${voucherCode}" active (24 hours remaining, MAC Auto-Bound).`
    );
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUssdActive(true);
    setUssdSeconds(60);
    setSimulatedStatus(null);
  };

  const handleConfirmSimulatedUssd = () => {
    setIsUssdActive(false);
    setSimulatedStatus(
      lang === 'sw'
        ? `🎉 Malipo yamethibitishwa! Umeunganishwa mtandaoni kwa vocha #9482 (MAC Auto-Bound). Vocha imetumwa pia WhatsApp!`
        : `🎉 Payment confirmed! Connected via voucher #9482 (MAC Auto-Bound). Receipt sent to WhatsApp!`
    );
  };

  const previewDirectCameraRef = useRef<HTMLInputElement | null>(null);

  const handleDirectPreviewPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSimulatedStatus('Inasoma picha ya vocha kutoka kwenye kamera...');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            const raw = code.data.trim();
            const cleaned = raw.replace(/^.*[=:/#]/, '').trim() || raw;
            setVoucherCode(cleaned);
            setSimulatedStatus(
              lang === 'sw'
                ? `🎉 Picha ya vocha #${cleaned} imesomwa kwa kamera na kuunganishwa!`
                : `🎉 Voucher #${cleaned} photo scanned and connected!`
            );
          } else {
            setVoucherCode('8841');
            setSimulatedStatus(
              lang === 'sw'
                ? '📷 Picha imepigwa kwa kamera! Vocha ya mfano #8841 imeingizwa na kuunganishwa.'
                : '📷 Photo taken with camera! Sample voucher #8841 applied.'
            );
          }
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAutoConnect = () => {
    setSimulatedStatus(
      lang === 'sw'
        ? '⚡ Umeunganishwa kiotomatiki kwa MAC Binding (Samsung Galaxy - 48:D7:05:88:12)! Huna haja ya kuandika vocha tena.'
        : '⚡ Connected instantly via MAC Binding (48:D7:05:88:12)! No voucher code typing needed.'
    );
  };

  const handleFreeTrial = () => {
    if (simulateTrialCooldown) {
      setSimulatedStatus(
        lang === 'sw'
          ? '🔒 Kizuizi cha Anti-Abuse: Kifaa hiki tayari kilitumia dakika 15 leo. Jaribio lijalo: Masaa 14 yamesalia.'
          : '🔒 Anti-Abuse Protected: Free trial used today. Cooldown: 14 hours remaining.'
      );
      return;
    }
    setSimulatedStatus(
      lang === 'sw'
        ? 'Majaribio ya dakika 15 yameanza! Kifaa kimehifadhiwa kuzuia udanganyifu (Anti-Abuse protection).'
        : '15-minute free trial session initiated with 24-hr MAC anti-abuse cooldown active.'
    );
  };

  const handleStartWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(10);
    setAdWatchedComplete(false);
    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdWatchedComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishAdReward = () => {
    setIsWatchingAd(false);
    setSimulatedStatus(
      lang === 'sw'
        ? '🎉 Umepata Dakika 15 Bure kwa kutazama tangazo la GLAMOUR SALON! Mmiliki ameingiza malipo ya tangazo na mteja yuko hewani.'
        : '🎉 Earned 15 free internet minutes after watching GLAMOUR SALON sponsor ad!'
    );
  };

  return (
    <section className="py-16 md:py-20 bg-stone-100 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Educational Text */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
              <span>04. Maboresho ya Kisasa ya Captive Portal</span>
              <span aria-hidden="true">·</span>
              <span>Omada & Cloud Best Practices</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 text-balance">
              {lang === 'sw'
                ? 'Mambo 5 Muhimu Yaliyoboreshwa Kwenye Lango la WiFi (Yakiwemo Matangazo)'
                : '5 Essential Enhancements Built Into Your Captive Portal'}
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {lang === 'sw'
                ? 'Tumechukua teknolojia za kisasa zaidi za TP-Link Omada EAP 772, Ruijie Reyee na MikroTik Cloud Portals ili kumwondolea mteja kero zote na kukupa mfumo unaoingiza faida kwa njia mbili (Vocha + Matangazo):'
                : 'We incorporated modern best practices from TP-Link Omada, Ruijie Reyee, and MikroTik Cloud portals to guarantee a frictionless self-service customer experience and dual monetization:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wide">
                  <Zap className="w-4 h-4" />
                  <span>1. MAC Auto-Login</span>
                </div>
                <p className="text-xs text-stone-600">
                  {lang === 'sw'
                    ? 'Mfumo unakumbuka anwani ya MAC ya simu ya mteja. Akizima WiFi na kuwasha tena, anaunganishwa bila kurudia vocha.'
                    : 'Remembers client MAC address so returning guests reconnect in 1 tap without re-entering codes.'}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wide">
                  <Camera className="w-4 h-4" />
                  <span>2. Scan Vocha kwa Kamera</span>
                </div>
                <p className="text-xs text-stone-600">
                  {lang === 'sw'
                    ? 'Kamera ya ndani inasoma msimbo wa QR kwenye kikaratasi cha vocha mara moja. Hakuna makosa ya kuandika namba!'
                    : 'Built-in in-browser QR camera scanner reads paper tickets in 1 second, eliminating typing errors.'}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <Lock className="w-4 h-4" />
                  <span>3. Anti-Abuse Free Trial</span>
                </div>
                <p className="text-xs text-stone-600">
                  {lang === 'sw'
                    ? 'Majaribio ya bure ya dakika 15 yanaruhusiwa mara 1 tu kwa masaa 24 kwa kila simu, kuzuia udanganyifu.'
                    : '15-minute test drive with 24-hour hardware cooldown prevents bandwidth abuse while converting users.'}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wide">
                  <MessageSquare className="w-4 h-4" />
                  <span>4. Risiti & Msaada WhatsApp</span>
                </div>
                <p className="text-xs text-stone-600">
                  {lang === 'sw'
                    ? 'Mteja anapokea vocha yake WhatsApp, na akipata shida, anabofya msaada unaotuma MAC na IP yake moja kwa moja kwako.'
                    : 'WhatsApp voucher delivery plus automated diagnostic telemetry (MAC + IP) for 10-second admin troubleshooting.'}
                </p>
              </div>

              {/* Feature 5 - Ad Monetization & Watch-to-Surf */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-purple-50 border border-purple-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wide">
                    <Megaphone className="w-4 h-4" />
                    <span>5. Mapato ya Matangazo (Ad Monetization & Watch-to-Surf)</span>
                  </div>
                  <span className="text-[10px] font-black text-purple-900 bg-purple-200/90 px-2 py-0.5 rounded-full uppercase">
                    Pesa ya Ziada
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {lang === 'sw'
                    ? 'Lipisha maduka, salon na migahawa ya mtaani (TSh 20,000 - 50,000 kwa mwezi) kuweka mabango yanayozunguka kwenye WiFi. Na wateja wasio na hela wanatazama tangazo la sekunde 10 ili kupewa dakika 15 za bure (Watch-to-Surf).'
                    : 'Monetize local businesses (TSh 20k-50k/month per sponsor) via rotating ads. Guests without money watch a 10s sponsored video to unlock 15 minutes of free Wi-Fi!'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Mobile Phone Screen */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-stone-900 p-4 border-4 border-stone-800 shadow-2xl relative">
              {/* Phone Speaker Notch */}
              <div className="flex justify-center mb-3">
                <div className="w-24 h-4 bg-stone-800 rounded-full" />
              </div>

              {/* Screen Area */}
              <div className="bg-stone-50 rounded-[2rem] overflow-hidden p-5 text-stone-900 min-h-[500px] flex flex-col justify-between border border-stone-200 relative">
                <div>
                  {/* Top Bar of phone */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pb-3 border-b border-stone-200">
                    <span className="font-mono">10:42 AM</span>
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-amber-600" />
                      <strong>Lema_Fast_WiFi</strong>
                    </span>
                  </div>

                  {/* Brand Branding in Portal: Top-Left Logo with Slogan in front */}
                  <div className="pb-2 border-b border-stone-200/60 flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <LemaLogo variant="horizontal" size="xs" theme="light" showSlogan={false} className="shrink-0" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200/70 truncate">
                        Connecting You Faster
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVoiceGuideOpen(true)}
                      className="px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-stone-950 text-[9px] font-black flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 shrink-0"
                    >
                      <span>🎙️</span>
                      <span>Mwongozo Sauti</span>
                    </button>
                  </div>

                  {/* 1. AUTO-LOGIN BANNER (MAC BINDING) */}
                  {hasRememberedDevice && (
                    <div className="mb-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <strong className="text-stone-900 block text-[10px] leading-tight">Simu Yako Inatambulika (MAC)</strong>
                          <span className="text-[9px] text-stone-500 font-mono">Vocha: 9482 · Masaa 18</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoConnect}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] rounded-lg shrink-0 cursor-pointer shadow-xs active:scale-95"
                      >
                        ⚡ Unganisha
                      </button>
                    </div>
                  )}

                  {/* 5. SPONSORED AD BANNER (COMPACT SPACE-SAVING BAR) */}
                  <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-purple-950 via-purple-900 to-stone-900 border border-purple-500/40 text-white shadow-xs text-left">
                    <div className="flex items-center justify-between text-[9px] mb-1">
                      <span className="bg-purple-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Megaphone className="w-2.5 h-2.5" /> Tangazo: Glamour Salon
                      </span>
                      <button
                        type="button"
                        onClick={handleStartWatchAd}
                        className="py-0.5 px-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-[9px] rounded-md transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Play className="w-2 h-2 fill-current" />
                        <span>Tazama (10s) Upate Bure 🎬</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-300 leading-tight truncate">
                      Punguzo la 20% wiki hii mtaa wa 3 · WhatsApp: 0653578184
                    </p>
                  </div>

                  {/* Segmented Mode Selector */}
                  <div className="flex items-center gap-1 p-1 bg-stone-200 rounded-lg text-xs font-semibold mb-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('voucher');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'voucher'
                          ? 'bg-white text-stone-900 shadow-xs font-black'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Weka Vocha' : 'Voucher'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('mobile');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'mobile'
                          ? 'bg-white text-stone-900 shadow-xs font-black'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Lipa Simu' : 'Pay Mobile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('trial');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'trial'
                          ? 'bg-white text-stone-900 shadow-xs font-black'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Bure' : 'Trial'}
                    </button>
                  </div>

                  {/* Mode 1: Voucher Form with Single Clean QR Scanner Button */}
                  {activeTab === 'voucher' && (
                    <form onSubmit={handleConnectVoucher} className="space-y-2">
                      {/* Single Direct Scan Button */}
                      <button
                        type="button"
                        onClick={() => setIsQrScannerOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
                      >
                        <Camera className="w-4 h-4 text-stone-950" />
                        <span>📷 SCAN VOCHA KWA KAMERA (QR)</span>
                      </button>
                      <p className="text-[10px] text-stone-500 text-center font-medium -mt-1">
                        Elekeza kamera kwenye QR code — inasoma kiotomatiki
                      </p>

                      <div>
                        <label className="text-[10px] font-bold text-stone-700 block mb-0.5">
                          {lang === 'sw' ? 'Au Andika Namba ya Vocha:' : 'Or Enter Voucher Code:'}
                        </label>
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Mfano: 9482"
                          className="w-full px-3 py-1.5 text-sm font-mono text-center font-bold border border-stone-300 rounded-lg text-stone-900 bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* MAC Binding Checkbox */}
                      <label className="flex items-center gap-1.5 text-[10px] text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberDeviceChecked}
                          onChange={(e) => setRememberDeviceChecked(e.target.checked)}
                          className="rounded text-amber-500"
                        />
                        <span>Kumbuka kifaa hiki (Auto-Login MAC)</span>
                      </label>

                      <button
                        type="submit"
                        className="w-full py-2 px-4 text-xs font-black text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {lang === 'sw' ? 'UNGANISHA MTANDAO' : 'CONNECT TO INTERNET'}
                      </button>
                    </form>
                  )}

                  {/* Mode 2: Mobile Money Form with WhatsApp Delivery */}
                  {activeTab === 'mobile' && (
                    <form onSubmit={handleSimulatePayment} className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {lang === 'sw' ? 'Chagua Kifurushi:' : 'Select Package:'}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          {[
                            { id: '2hrs', name: 'Saa 2', price: '500', time: '2h' },
                            { id: '1day', name: 'Siku 1', price: '1,000', time: '24h' },
                            { id: '1week', name: 'Wiki 1', price: '5,000', time: '7d' },
                            { id: '1month', name: 'Mwezi 1', price: '25,000', time: '30d' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPlan(p.id)}
                              className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                selectedPlan === p.id
                                  ? 'bg-amber-500/15 border-amber-500 text-stone-900 ring-1 ring-amber-500'
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-900">{p.name}</span>
                                <span className="text-[10px] font-black text-amber-600 font-mono">{p.price}</span>
                              </div>
                              <span className="text-[8px] text-emerald-600 font-semibold mt-0.5">⏱️ {p.time} • Bila Kikomo</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-0.5">
                          {lang === 'sw' ? 'Namba ya Simu (M-Pesa / Mixx by Yas):' : 'Phone Number:'}
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="0754 xxx xxx"
                          className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg text-stone-900 bg-white"
                        />
                      </div>

                      {/* 4. WhatsApp Receipt Checkbox */}
                      <label className="flex items-center gap-1.5 text-[10px] text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendWhatsAppVoucher}
                          onChange={(e) => setSendWhatsAppVoucher(e.target.checked)}
                          className="rounded text-emerald-500"
                        />
                        <span>Tuma nakala ya risiti kwenye WhatsApp yangu</span>
                      </label>

                      {/* Inline USSD Waiting Card */}
                      {isUssdActive ? (
                        <div className="p-3 rounded-2xl bg-stone-900 border-2 border-emerald-500/80 text-white space-y-2 text-center animate-in fade-in duration-200">
                          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            • USSD Push Imetumwa
                          </span>
                          <div>
                            <strong className="block text-xs font-mono text-white">{phoneNumber}</strong>
                            <p className="text-[10px] text-stone-300">
                              Weka PIN ya mtandao wako kuthibitisha malipo ya <strong>Tsh 1,000</strong>.
                            </p>
                          </div>
                          <div className="py-1 px-2 rounded-lg bg-stone-950 text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Inasubiri PIN... ({ussdSeconds}s)</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleConfirmSimulatedUssd}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[10px] rounded-lg shadow-xs cursor-pointer active:scale-95"
                          >
                            ✓ Thibitisha PIN Papo Hapo
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsUssdActive(false)}
                            className="text-[9px] text-stone-400 hover:text-white underline"
                          >
                            Badilisha Nambari
                          </button>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          className="w-full py-2 px-4 text-xs font-black text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          {lang === 'sw' ? 'LIPA NA UNGANISHA PAPO HAPO' : 'PAY & CONNECT INSTANTLY'}
                        </button>
                      )}
                    </form>
                  )}

                  {/* Mode 3: Smart Anti-Abuse Free Trial */}
                  {activeTab === 'trial' && (
                    <div className="space-y-2.5 text-center py-1">
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-[10px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Ulinzi wa Kuzuia Udanganyifu</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSimulateTrialCooldown(!simulateTrialCooldown)}
                            className="text-[9px] underline text-amber-700 cursor-pointer"
                          >
                            {simulateTrialCooldown ? 'Jaribu: Wazi' : 'Jaribu: Imetumika (Locked)'}
                          </button>
                        </div>
                        <p className="text-stone-600">
                          {simulateTrialCooldown
                            ? 'Majaribio ya bure yameshatumika leo kwenye simu hii (Locked kwa masaa 24).'
                            : 'Dakika 15 za bure kupima spidi. Kifaa hiki kinaruhusiwa mara 1 kwa masaa 24.'}
                        </p>
                      </div>

                      <button
                        onClick={handleFreeTrial}
                        className={`w-full py-2 px-4 text-xs font-black rounded-lg shadow-xs transition-colors cursor-pointer ${
                          simulateTrialCooldown
                            ? 'bg-stone-200 text-stone-500'
                            : 'text-amber-900 bg-amber-300 hover:bg-amber-400'
                        }`}
                      >
                        {simulateTrialCooldown ? '🔒 MAJARIBIO YAMESHATUMIKA LEO' : '⚡ ANZA DAKIKA 15 BURE'}
                      </button>
                    </div>
                  )}

                  {/* Live Simulation Alert */}
                  {simulatedStatus && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-900 flex items-start gap-1.5 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{simulatedStatus}</span>
                    </div>
                  )}

                  {/* 3 Essential Reassurance FAQs (Maswali ya Wateja) */}
                  <div className="mt-3 pt-2.5 border-t border-stone-200 text-left space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-700 uppercase flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-600" />
                      <span>Maswali Yanayoulizwa (FAQ):</span>
                    </span>

                    <div className="border border-stone-200 rounded-lg bg-white overflow-hidden text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                        className="w-full p-2 text-left font-bold text-stone-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>1. Je, nitaunganishwa mara tu baada ya kulipa?</span>
                        <ChevronRight className={`w-3 h-3 text-stone-400 transition-transform ${openFaqIndex === 0 ? 'rotate-90' : ''}`} />
                      </button>
                      {openFaqIndex === 0 && (
                        <div className="p-2 pt-0 text-[9px] text-stone-600 border-t border-stone-100 bg-stone-50">
                          Ndiyo! Mara tu unapoweka PIN ya simu yako na kukatwa, mfumo unakuunganisha ndani ya sekunde 3 bila kuandika vocha.
                        </div>
                      )}
                    </div>

                    <div className="border border-stone-200 rounded-lg bg-white overflow-hidden text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                        className="w-full p-2 text-left font-bold text-stone-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>2. Nikizima WiFi au kuondoka nitarudi vipi?</span>
                        <ChevronRight className={`w-3 h-3 text-stone-400 transition-transform ${openFaqIndex === 1 ? 'rotate-90' : ''}`} />
                      </button>
                      {openFaqIndex === 1 && (
                        <div className="p-2 pt-0 text-[9px] text-stone-600 border-t border-stone-100 bg-stone-50">
                          Simu yako inatambuliwa kiotomatiki kwa MAC Address. Ukirudi unawasha tu WiFi na kuendelea bila kulipa tena.
                        </div>
                      )}
                    </div>

                    <div className="border border-stone-200 rounded-lg bg-white overflow-hidden text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                        className="w-full p-2 text-left font-bold text-stone-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>3. Vocha yangu inaweza kutumika simu nyingine?</span>
                        <ChevronRight className={`w-3 h-3 text-stone-400 transition-transform ${openFaqIndex === 2 ? 'rotate-90' : ''}`} />
                      </button>
                      {openFaqIndex === 2 && (
                        <div className="p-2 pt-0 text-[9px] text-stone-600 border-t border-stone-100 bg-stone-50">
                          Hapana. Vocha inatumika simu moja tu kwa wakati mmoja ili kuzuia wizi na kuhakikisha unapata kasi kamili.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. WhatsApp Diagnostic Telemetry Footer */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-500">
                  <span className="font-mono">MAC: 48:D7:05:88:12</span>
                  <a
                    href="https://wa.me/255653578184?text=Habari!+Nahitaji+msaada+wa+kujiunga+na+WiFi.+Kifaa:48:D7:05:88:12+IP:192.168.88.104"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>Msaada WhatsApp (MAC)</span>
                  </a>
                </div>

                {/* 5. WATCH-TO-SURF REWARDED AD OVERLAY MODAL */}
                {isWatchingAd && (
                  <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-xs z-30 p-4 flex flex-col justify-between text-white rounded-[2rem] animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="text-[10px] font-mono text-amber-400 font-black uppercase tracking-wider flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-amber-400" />
                        <span>Tangazo la Mfadhili</span>
                      </span>
                      <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        {adCountdown > 0 ? `${adCountdown}s` : '✓ Tayari'}
                      </span>
                    </div>

                    <div className="my-auto p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-stone-900 border border-purple-500/50 space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500 text-white inline-block">
                        🔥 Ofa ya Mtaani
                      </span>
                      <h4 className="text-sm font-black text-white">GLAMOUR TOUCH SALON & SPA</h4>
                      <p className="text-xs text-stone-200 leading-relaxed font-normal">
                        Huduma bora ya saloon, kucha, scrub na massage kwa bei nafuu mtaani! Pata punguzo la 20% ukisema uliona tangazo kwenye LEMA FAST WiFi.
                      </p>
                      <div className="pt-2">
                        <a
                          href="https://wa.me/255653578184?text=Habari!+Nimeona+tangazo+la+GLAMOUR+kwenye+WiFi"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[11px] rounded-xl shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp Mfadhili</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${Math.min(100, Math.max(0, ((10 - adCountdown) / 10) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {adCountdown > 0
                          ? `Subiri sekunde ${adCountdown} kupokea dakika 15 za bure...`
                          : 'Hongera! Tangazo limekamilika.'}
                      </p>

                      {adWatchedComplete ? (
                        <button
                          type="button"
                          onClick={handleFinishAdReward}
                          className="w-full py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          🎉 WASHA DAKIKA 15 ZA BURE SASA!
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsWatchingAd(false)}
                          className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                        >
                          Ghairi (Funga Tangazo)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real In-Browser & Phone Camera Voucher QR Scanner Modal */}
      <VoucherQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={(code) => {
          setVoucherCode(code);
          setSimulatedStatus(
            lang === 'sw'
              ? `🎉 Vocha ya QR #${code} imesomwa kwa kamera na kuingizwa kiotomatiki!`
              : `🎉 QR Voucher #${code} scanned via camera and authenticated!`
          );
          setIsQrScannerOpen(false);
        }}
      />

      {/* Step-by-Step Interactive Voice Guide Modal */}
      <VoiceGuideModal
        isOpen={isVoiceGuideOpen}
        onClose={() => setIsVoiceGuideOpen(false)}
        onSelectTab={(tab) => {
          if (tab === 'mobile-stk') setActiveTab('mobile');
          else if (tab === 'voucher') setActiveTab('voucher');
          else if (tab === 'trial') setActiveTab('trial');
        }}
      />
    </section>
  );
};
