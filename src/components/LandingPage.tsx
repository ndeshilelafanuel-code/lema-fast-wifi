import React from 'react';
import { Language, AppView } from '../types';
import { useHotspot } from '../context/HotspotContext';
import { LemaLogo } from './common/LemaLogo';
import {
  Wifi,
  Zap,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
  Users,
  Star,
  PhoneCall,
  LayoutDashboard,
  Radio,
  Cpu,
  Check,
  Compass,
  CreditCard,
  Gauge,
  Sparkles,
  Signal,
  ShieldAlert,
  Server
} from 'lucide-react';
import heroWifiSceneImg from '../assets/images/hero_wifi_scene_1791617825078.jpg';
import telecomTowerImg from '../assets/images/telecom_tower_antenna_1791617835995.jpg';
import mobileMoneyPayImg from '../assets/images/mobile_money_pay_1791617847899.jpg';
import networkOperationsDeskImg from '../assets/images/network_operations_desk_1791617859620.jpg';

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const { settings, towers, activeSessions } = useHotspot();

  const scrollToPricing = () => {
    const el = document.getElementById('landing-pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('landing-features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="text-stone-900 bg-[#faf8f5] min-h-screen font-sans selection:bg-amber-400 selection:text-stone-950">
      
      {/* 1. HERO SECTION: Ultra-Modern Split with Cinematic Photography & Interactive Pill-Free Accents */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-stone-200/80 bg-linear-to-b from-stone-900 via-stone-900 to-stone-950 text-white">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Provocative Headline & High Conversion CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Clean Sub-header kicker without pill box */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <span>LEMA FAST WIFI · MFUMO WA KISASA WA HOTSPOT & BILLING</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
                Biashara ya WiFi Mtaani Yenye{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-300 to-yellow-200">
                  Faida Kubwa na Udhibiti Kamili
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-stone-300 max-w-xl leading-relaxed font-normal">
                Badilisha mtandao wako wa TP-Link Omada na MikroTik kuwa mashine ya mapato ya kila siku. Portal ya kisasa ya wateja, malipo ya haraka ya M-Pesa na Tigo Pesa, na ramani ya GIS ya kusimamia minara yako popote ulipo.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('customer-portal')}
                  className="px-7 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm transition-all shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Smartphone className="w-4 h-4 text-stone-950" />
                  <span>Jaribu Portal ya Wateja</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="px-6 py-4 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-200 hover:text-white font-bold text-sm border border-stone-700/80 transition-all cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Fungua Admin Dashboard</span>
                </button>
              </div>

              {/* Value stats inline without pill enclosure */}
              <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center gap-6 text-xs text-stone-400 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hakuna ada za siri za kila mwezi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inafanya kazi na EAP225, EAP610 & MikroTik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>M-Pesa STK-Push & ZenoPay</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Resolution Photographic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-700/60 shadow-2xl shadow-black/60 group">
                <img
                  src={heroWifiSceneImg}
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero_wifi_scene_1791617825078.jpg';
                  }}
                  alt="Wateja wakifurahia mtandao wa haraka wa Lema Fast WiFi Dar es Salaam"
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/20 to-transparent" />

                {/* Floating Real-Time Indicator Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700/70 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <strong className="text-xs font-bold text-white">Mtandao Upo Hewani</strong>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">Spidi 50 Mbps</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Wateja wanaunganishwa moja kwa moja kupitia simu zao kwa kulipia vocha ya Tsh 500 au Tsh 1,000 papo hapo.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS TICKER (Sleek Minimal Typography) */}
      <section className="bg-white border-b border-stone-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div className="border-l-2 border-amber-400 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-stone-950 font-mono tracking-tight block">99.9%</span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1 block">Uimara wa Mfumo (Uptime)</span>
            </div>
            <div className="border-l-2 border-emerald-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-stone-950 font-mono tracking-tight block">&lt; 3 Sek</span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1 block">Muda wa Kupokea Vocha</span>
            </div>
            <div className="border-l-2 border-sky-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-stone-950 font-mono tracking-tight block">200m+</span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1 block">Mzingo wa Coverage kwa Mnara</span>
            </div>
            <div className="border-l-2 border-stone-900 pl-4">
              <span className="text-3xl sm:text-4xl font-black text-stone-950 font-mono tracking-tight block">Tsh 0</span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1 block">Gharama ya Kuanza Majaribio</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL FEATURE SHOWCASE 1: MINARA & RAMANI YA GIS (Telecommunication Hardware & Coverage) */}
      <section id="landing-features" className="py-20 sm:py-28 bg-[#faf8f5] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Image Card with Hardware Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xl group">
                <img
                  src={telecomTowerImg}
                  onError={(e) => {
                    e.currentTarget.src = '/images/telecom_tower_antenna_1791617835995.jpg';
                  }}
                  alt="Mnara wa TP-Link Omada Outdoor na antena za wireless"
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Outdoor Hardware Ready</span>
                  </div>
                  <h4 className="text-lg font-bold">TP-Link Omada EAP & MikroTik Metal</h4>
                  <p className="text-xs text-stone-300">Antena za mzingo wa mita 200 zenye nguvu ya kupenya kuta na kutoa huduma kwa wateja wengi kwa wakati mmoja.</p>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Teknolojia ya GIS & Live Map</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                Simamia Kila Mnara na Access Point Kwenye Ramani ya GIS
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Hakuna tena kubahatisha kama mnara wako una umeme au waya umeng'oka. Dashibodi yetu inakuonyesha ramani ya GIS yenye duara la mita 200, taa za kijani au nyekundu za afya ya kifaa, na idadi ya wateja waliopo hewani kwa sekunde hiyo hiyo.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Taa za Hali ya Mtandao (Live Status)</strong>
                    <span className="text-stone-500 text-xs">Taa ya kijani inamaanisha AP ipo hewani; nyekundu inakuonya umeme umekatika au waya umechomoka mara moja.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Mzingo wa Coverage wa Mita 200</strong>
                    <span className="text-stone-500 text-xs">Ona eneo kamili ambalo mtandao wako unafika mtaani ili ujue wapi pa kuongeza mnara mpya.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Idadi ya Wateja Halisi (Live Connected Clients)</strong>
                    <span className="text-stone-500 text-xs">Jua ni wateja wangapi wapo hewani kwa kila mnara ili udhibiti msongamano na kasi ya mtandao.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <span>Angalia Ramani ya GIS Kwenye Dashibodi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. VISUAL FEATURE SHOWCASE 2: MALIPO YA SIMU (M-Pesa, Tigo, Airtel, Halopesa) */}
      <section className="py-20 sm:py-28 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Content Details */}
            <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Malipo ya Papo kwa Hapo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                Mteja Analipia Vocha kwa M-Pesa na Kuunganishwa Mara Moja
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Ondoa usumbufu wa kugawa vocha za karatasi na kutoa chenji. Mteja anapounganisha simu yake kwenye WiFi, ukurasa wa malipo unajitokeza. Anaingiza namba yake ya simu, anapokea ombi la PIN ya M-Pesa (STK Push), na vocha inafunguka kiotomatiki.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 text-sm font-bold block mb-1">M-Pesa & Tigo Pesa</strong>
                  <span className="text-stone-500 text-xs">Uunganishaji wa moja kwa moja kupitia Vodacom & Tigo APIs.</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 text-sm font-bold block mb-1">Airtel & HaloPesa</strong>
                  <span className="text-stone-500 text-xs">Inasaidia mitandao yote 4 mikubwa ya simu Tanzania.</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 text-sm font-bold block mb-1">SMS ya Vocha</strong>
                  <span className="text-stone-500 text-xs">Mteja anapokea ujumbe mfupi wa namba ya vocha kwa dharura.</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 text-sm font-bold block mb-1">Pesa Moja kwa Moja</strong>
                  <span className="text-stone-500 text-xs">Mapato yote yanaingia kwenye akaunti yako au Till namba yako.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('customer-portal')}
                  className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Tazama Jinsi Mteja Anavyonunua Vocha</span>
                </button>
              </div>
            </div>

            {/* Visual Image Card with Smartphone Payment Screen */}
            <div className="lg:col-span-6 relative order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xl group">
                <img
                  src={mobileMoneyPayImg}
                  onError={(e) => {
                    e.currentTarget.src = '/images/mobile_money_pay_1791617847899.jpg';
                  }}
                  alt="Uthibitisho wa malipo ya simu ya M-Pesa kwa vocha ya Wi-Fi"
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">STK Push Technology</span>
                  </div>
                  <h4 className="text-lg font-bold">Malipo ya Haraka Bila Foleni</h4>
                  <p className="text-xs text-stone-300">Mfumo unafanya kazi masaa 24 hata ukiwa umelala au uko safarini.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. VISUAL FEATURE SHOWCASE 3: DASHIBODI YA USIMAMIZI & BANDWIDTH SHAPING */}
      <section className="py-20 sm:py-28 bg-[#faf8f5] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Image Card: Operations Center / Network Desk */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xl group">
                <img
                  src={networkOperationsDeskImg}
                  onError={(e) => {
                    e.currentTarget.src = '/images/network_operations_desk_1791617859620.jpg';
                  }}
                  alt="Msimamizi wa mtandao akitazama dashibodi ya bandwidth na takwimu za hotspot"
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Bandwidth Shaper Engine</span>
                  </div>
                  <h4 className="text-lg font-bold">Udhibiti wa Kasi na Mgawanyo Sawa</h4>
                  <p className="text-xs text-stone-300">Zuia mteja mmoja asimalize bando au asilete spidi ndogo kwa watumiaji wengine.</p>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
                <Gauge className="w-4 h-4" />
                <span>Usimamizi wa Kitaalamu</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                Udhibiti Kamili wa Bandwidth, Vifurushi, na Wateja Waliounganishwa
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Kila mteja anapewa spidi maalum (kama 3Mbps au 5Mbps) na muda halisi unaohesabiwa kiotomatiki. Muda wake ukiisha, mtandao unakatika papo hapo hadi anunue vocha mpya.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0 mt-0.5">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Smart Bandwidth Shaper</strong>
                    <span className="text-stone-500 text-xs">Punguza spidi kwa wateja wanaopakua mafaili makubwa ili YouTube na WhatsApp za wengine ziendelee kwa kasi.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Orodha ya Wateja Walio Hewani (Live Sessions)</strong>
                    <span className="text-stone-500 text-xs">Ona IP, MAC address, na kiasi cha MBs kilichotumiwa na kila simu au kompyuta iliyounganishwa.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-bold block">Uzalishaji na Uchapishaji wa Vocha</strong>
                    <span className="text-stone-500 text-xs">Tengeneza na chapisha vocha za karatasi (Batch Print) zenye QR Code kwa ajili ya maduka na vibanda vya mtaani.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dhibiti Mtandao Wako Sasa</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. HARDWARE COMPATIBILITY: TP-LINK OMADA & MIKROTIK */}
      <section className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Vifaa Vinavyoungwa Mkono</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950">Inafanya Kazi na Vifaa Vyako Vyote vya Hotspot</h2>
            <p className="text-sm text-stone-500">
              Hakuna haja ya kubadilisha vifaa vyako ulivyonavyo. Mfumo wetu unaunganishwa moja kwa moja na mifumo ya TP-Link Omada na MikroTik RouterOS.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-bold">
            {[
              { id: '1', name: 'TP-Link EAP225', desc: 'Outdoor AC1200 AP', type: 'Access Point', badge: 'Omada' },
              { id: '2', name: 'TP-Link EAP610', desc: 'Outdoor Wi-Fi 6 AP', type: 'Access Point', badge: 'Wi-Fi 6' },
              { id: '3', name: 'TP-Link EAP110', desc: 'Outdoor 300Mbps AP', type: 'Access Point', badge: 'Budget' },
              { id: '4', name: 'MikroTik hEX', desc: 'Gigabit Core Router', type: 'Router', badge: 'RouterOS' },
              { id: '5', name: 'MikroTik RB4011', desc: 'High Bandwidth Router', type: 'Core Gateway', badge: 'Heavy Load' },
              { id: '6', name: 'TP-Link ER605', desc: 'Omada Multi-WAN VPN', type: 'Gateway', badge: 'Dual WAN' },
            ].map((hw) => (
              <div
                key={hw.id}
                className="bg-[#faf8f5] border border-stone-200/90 rounded-2xl p-4 space-y-3 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-stone-200 shadow-xs">
                    <Wifi className="w-5 h-5 text-amber-500" />
                  </div>
                  <strong className="text-xs font-black text-stone-900 block truncate">{hw.name}</strong>
                  <span className="text-[10px] text-stone-500 font-medium block truncate">{hw.desc}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-200/80 pt-2 text-[10px]">
                  <span className="text-stone-400">{hw.type}</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">{hw.badge}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. PRICING & SUBSCRIPTION PACKAGES */}
      <section id="landing-pricing" className="py-20 sm:py-28 border-b border-stone-200/80 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Vifurushi vya Usimamizi</span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950">Chagua Kifurushi Kinacholingana na Mtandao Wako</h2>
            <p className="text-sm text-stone-500">
              Anza bure kujaribu mfumo, au jiunge na vifurushi vyenye uwezo mkubwa kadri mtandao wako unavyotanuka mtaani.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            
            {/* Plan 1: Starter Free */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-amber-400 transition-colors">
              <div className="space-y-4">
                <div>
                  <strong className="text-xs uppercase font-bold text-stone-400 block tracking-wider">Majaribio (Starter)</strong>
                  <h3 className="text-2xl font-black text-stone-900 pt-1">Bure</h3>
                  <span className="text-[11px] text-stone-500 font-semibold block">Siku 7 za majaribio bila malipo</span>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Access Point 1</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Wateja wasio na kikomo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Portal ya Kisasa ya Lema</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Ramani ya Majaribio</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs uppercase cursor-pointer transition-colors"
              >
                Anza Sasa Bure
              </button>
            </div>

            {/* Plan 2: Growth (Most Popular) */}
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 px-3 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider">
                KIFURUSHI BORA
              </div>

              <div className="space-y-4">
                <div>
                  <strong className="text-xs uppercase font-bold text-amber-600 block tracking-wider">Growth</strong>
                  <h3 className="text-2xl font-black text-stone-900 pt-1">Tsh 15,000 <span className="text-xs font-normal text-stone-400">/mwezi</span></h3>
                  <span className="text-[11px] text-stone-500 font-semibold block">Inafaa minara 1 hadi 5 mtaani</span>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-700 border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hadi Minara / APs 5</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ramani ya GIS ya Minara Live</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Malipo ya M-Pesa & Tigo STK</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SMS za Vocha kwa Wateja</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Smart Bandwidth Limiter</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs uppercase cursor-pointer shadow-md transition-colors"
              >
                Chagua Kifurushi Hiki
              </button>
            </div>

            {/* Plan 3: Pro */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-amber-400 transition-colors">
              <div className="space-y-4">
                <div>
                  <strong className="text-xs uppercase font-bold text-stone-400 block tracking-wider">Pro Business</strong>
                  <h3 className="text-2xl font-black text-stone-900 pt-1">Tsh 25,000 <span className="text-xs font-normal text-stone-400">/mwezi</span></h3>
                  <span className="text-[11px] text-stone-500 font-semibold block">Mtandao mkubwa wa mtaa mzima</span>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Hadi Minara / APs 15</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Multi-site Network Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Ripoti za Fedha & Faida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Kikokotoo cha ROI & Break-even</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs uppercase cursor-pointer transition-colors"
              >
                Chagua Pro
              </button>
            </div>

            {/* Plan 4: Ultra Enterprise */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-amber-400 transition-colors">
              <div className="space-y-4">
                <div>
                  <strong className="text-xs uppercase font-bold text-stone-400 block tracking-wider">Ultra Enterprise</strong>
                  <h3 className="text-2xl font-black text-stone-900 pt-1">Tsh 50,000 <span className="text-xs font-normal text-stone-400">/mwezi</span></h3>
                  <span className="text-[11px] text-stone-500 font-semibold block">Minara isiyo na idadi maalum</span>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Minara na APs bila kikomo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Dedicated SMS Gateway</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Usaidizi wa kipaumbele 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Custom Brand & Subdomain</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs uppercase cursor-pointer transition-colors"
              >
                Chagua Ultra
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FOOTER CALL TO ACTION */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Anza Leo Hii Mtaani Kwako</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">Je, Uko Tayari Kuanza Kuuza WiFi Yenye Faida?</h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl font-normal leading-relaxed">
                Wasiliana nasi au piga simu namba <span className="font-bold text-amber-400">{settings.supportPhone}</span> kwa msaada wa kusanidi vifaa vyako na kuanza kupokea malipo moja kwa moja.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Piga {settings.supportPhone}</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('admin-dashboard')}
                className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs border border-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Fungua Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
