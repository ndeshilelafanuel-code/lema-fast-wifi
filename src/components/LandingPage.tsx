import React from 'react';
import { Language, AppView } from '../types';
import { useHotspot } from '../context/HotspotContext';
import { LemaLogo } from './common/LemaLogo';
import {
  Wifi,
  Zap,
  ShieldCheck,
  Smartphone,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
  Users,
  Star,
  PhoneCall,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Radio,
  Cpu,
  Check
} from 'lucide-react';

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const { settings } = useHotspot();

  const scrollToPricing = () => {
    const el = document.getElementById('landing-pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="text-stone-800 bg-[#fbf9f4] min-h-screen font-sans selection:bg-[#cca43b]/10 selection:text-[#cca43b]">
      
      {/* 1. HERO SECTION (Wotefy Style Header Split) */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-[#e6e2d3]">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Brand Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-900 text-xs font-bold uppercase tracking-wider">
                <LemaLogo variant="icon" size={18} />
                <span className="font-extrabold">Lema Fast WiFi Billing SaaS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#231f1c] leading-tight text-balance">
                Sell WiFi With{' '}
                <span className="text-[#cca43b]">Less Effort,</span>{' '}
                <span className="underline decoration-wavy decoration-[#cca43b]/50">
                  More Revenue
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
                Branded captive portal, mobile-money payments (M-Pesa, Tigo Pesa, Airtel Money, Halopesa), and full control of your access points - everything you need to run paid guest Wi-Fi from one dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="px-6 py-3.5 rounded-2xl bg-[#cca43b] hover:bg-[#b89332] text-white font-black text-sm transition-all shadow-lg shadow-[#cca43b]/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Anza Sasa Bure (Start Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs border border-[#e6e2d3] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#cca43b]" />
                  <span>Dhibiti Lango (Dashboard)</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <p className="text-[11px] text-stone-400 font-semibold tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#cca43b]" />
                <span>TRUSTED BY 229+ HOTSPOT RESELLERS ACROSS TANZANIA</span>
              </p>
            </div>

            {/* Right Mockup Phone Column */}
            <div className="lg:col-span-5 flex justify-center">
              {/* Custom Wotefy Captive Portal Mockup on Right */}
              <div className="w-[280px] h-[540px] bg-stone-900 border-8 border-stone-800 rounded-[36px] shadow-2xl overflow-hidden relative flex flex-col ring-4 ring-[#e6e2d3]">
                {/* Camera Notch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-3 bg-stone-900 rounded-full z-20" />
                
                {/* Screen Frame */}
                <div className="flex-1 bg-[#fcfaf2] p-4 pt-6 space-y-4 text-[11px] overflow-hidden flex flex-col justify-between">
                  {/* Portal Header */}
                  <div className="text-center border-b border-stone-200/50 pb-2.5 flex flex-col items-center">
                    <LemaLogo variant="full" size="sm" theme="light" showSlogan={false} className="mx-auto mb-1" />
                    <span className="text-[9px] text-stone-400">Lipia kwa M-Pesa uperuzi kwa kasi</span>
                  </div>

                  {/* Active Card Design Clay */}
                  <div className="bg-white border border-[#e6e2d3] p-3 rounded-2xl text-center space-y-1 shadow-xs">
                    <span className="text-[9px] uppercase font-bold text-[#cca43b] tracking-wider block">Majaribio ya Bure (Trial)</span>
                    <p className="text-[10px] text-stone-500 leading-relaxed font-medium">Pata dakika 15 za bure kupima spidi yetu mara moja!</p>
                    <button className="w-full mt-1.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-black text-[9px] uppercase">
                      ANZA MAJARIBIO
                    </button>
                  </div>

                  {/* Sample Package Cards */}
                  <div className="space-y-1.5">
                    <div className="p-2.5 bg-white border border-[#e6e2d3] rounded-xl flex items-center justify-between shadow-xs">
                      <div>
                        <strong className="text-stone-800 text-[10px]">Unlimited masaa 2</strong>
                        <span className="text-[8px] text-stone-400 block font-medium">Muda: 2 Hours · Spidi: 3Mbps</span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#cca43b] text-white rounded-lg font-black text-[9px] tracking-tight">Tsh 500</span>
                    </div>

                    <div className="p-2.5 bg-white border border-[#e6e2d3] rounded-xl flex items-center justify-between shadow-xs ring-1 ring-[#cca43b]">
                      <div>
                        <strong className="text-stone-800 text-[10px] flex items-center gap-1">
                          <span>Unlimited masaa 24</span>
                          <span className="text-[7px] bg-red-500 text-white px-1 rounded font-bold">HOT</span>
                        </strong>
                        <span className="text-[8px] text-stone-400 block font-medium">Muda: 24 Hours · Spidi: 3Mbps</span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#cca43b] text-white rounded-lg font-black text-[9px] tracking-tight">Tsh 1,000</span>
                    </div>
                  </div>

                  <div className="text-center text-[8px] text-stone-400 pt-1 border-t border-stone-200/50">
                    Msaada piga: <span className="font-bold text-stone-600">0653 578 184</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE DYNAMIC LIVE METRICS BAR (Wotefy Style Stats) */}
      <section className="bg-white border-b border-[#e6e2d3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-[#cca43b] font-mono block">229+</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1 block">Active Hotspot Resellers</span>
            </div>
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-stone-800 font-mono block">823+</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1 block">Configured Wi-Fi APs</span>
            </div>
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono block">99.9%</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1 block">SaaS Platform Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HARDWARE INTEGRATION: BUILT FOR REAL VENUES (TP-Link Omada & Access Points Grid) */}
      <section className="py-16 sm:py-24 bg-[#fbf9f4] border-b border-[#e6e2d3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#cca43b] uppercase tracking-wider">Adopted & Fully Integrated</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#231f1c]">Built for Real Venues</h2>
            <p className="text-sm text-stone-500">
              From indoor ceiling APs to high-power outdoor Wi-Fi antennas — Lema Fast WiFi pairs seamlessly with the entire TP-Link Omada and RouterOS family of products.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-bold">
            {[
              { id: '1', name: 'JetStream Switch', desc: 'Managed POE Switch', rating: '4.8', icon: <Cpu className="w-5 h-5 text-stone-500" /> },
              { id: '2', name: 'EAP245 Indoor', desc: 'Ceiling Access Point', rating: '4.9', icon: <Radio className="w-5 h-5 text-stone-500" /> },
              { id: '3', name: 'EAP610 Outdoor', desc: 'Wi-Fi 6 Outdoor AP', rating: '4.9', icon: <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" /> },
              { id: '4', name: 'EAP225 Outdoor', desc: 'Gigabit AC1200 AP', rating: '4.7', icon: <Radio className="w-5 h-5 text-stone-500" /> },
              { id: '5', name: 'EAP110 Outdoor', desc: 'AC300 Outdoor AP', rating: '4.6', icon: <Wifi className="w-5 h-5 text-stone-500" /> },
              { id: '6', name: 'ER605 Gateway', desc: 'Multi-WAN VPN Router', rating: '4.8', icon: <Cpu className="w-5 h-5 text-stone-500" /> },
            ].map((hw) => (
              <div
                key={hw.id}
                className="bg-white border border-[#e6e2d3] rounded-2xl p-4 space-y-3 hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
                    {hw.icon}
                  </div>
                  <strong className="text-xs font-black text-stone-800 block truncate">{hw.name}</strong>
                  <span className="text-[10px] text-stone-400 font-medium block truncate">{hw.desc}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[10px]">
                  <span className="text-amber-500 font-bold">★ {hw.rating}</span>
                  <span className="text-[8px] bg-stone-100 text-stone-500 px-1 rounded">Omada</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PRICING & SAAS SUBSCRIPTION PLANS (Wotefy Style Scaled Plans) */}
      <section id="landing-pricing" className="py-16 sm:py-24 border-b border-[#e6e2d3] bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#cca43b] uppercase tracking-wider block">Plans that scale with you</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#231f1c]">Plans That Scale With You</h2>
            <p className="text-sm text-stone-500">
              Chagua kifurushi cha kujiunga na mfumo wetu wa usimamizi (SaaS Profile) kulingana na ukubwa wa mtandao wako mtaani kwako.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Plan 1: SSD Starter */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#cca43b] transition-colors relative">
              <div className="space-y-4">
                <div>
                  <strong className="text-sm uppercase font-bold text-stone-400 block tracking-wider">SSD Starter</strong>
                  <h3 className="text-2xl font-black text-stone-800 pt-1">Free</h3>
                  <span className="text-[10px] text-stone-400 font-semibold block">Perfect for new resellers - 7 Days</span>
                </div>

                <ul className="space-y-2 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>1 Access point maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Unlimited active clients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Customizable captive branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Live client monitoring logs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-xl text-xs uppercase cursor-pointer"
              >
                Anza Sasa (Start Free)
              </button>
            </div>

            {/* Plan 2: SSD Growth (Most Popular) */}
            <div className="bg-white border-2 border-[#cca43b] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative scale-[1.03]">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#cca43b] text-white px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider">
                MOST POPULAR
              </div>

              <div className="space-y-4">
                <div>
                  <strong className="text-sm uppercase font-bold text-[#cca43b] block tracking-wider">SSD Growth</strong>
                  <h3 className="text-2xl font-black text-stone-800 pt-1">TSH 15,000 <span className="text-xs font-normal text-stone-400">/mo</span></h3>
                  <span className="text-[10px] text-stone-400 font-semibold block">Best for established hotspots</span>
                </div>

                <ul className="space-y-2 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>1 Site (Local access limits)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>5 Access points maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>SMS Notifications Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Interim update accounting logs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-[#cca43b] hover:bg-[#b89332] text-white font-black rounded-xl text-xs uppercase cursor-pointer shadow-md"
              >
                Gusa Upate (Get Started)
              </button>
            </div>

            {/* Plan 3: SSD Power */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#cca43b] transition-colors relative">
              <div className="space-y-4">
                <div>
                  <strong className="text-sm uppercase font-bold text-stone-400 block tracking-wider">SSD Power</strong>
                  <h3 className="text-2xl font-black text-stone-800 pt-1">TSH 25,000 <span className="text-xs font-normal text-stone-400">/mo</span></h3>
                  <span className="text-[10px] text-stone-400 font-semibold block">For larger multi-AP sites</span>
                </div>

                <ul className="space-y-2 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>1 Site structure maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>15 Access points maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Live Wi-Fi (Omada/Mikrotik)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Advanced developer API limits</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-xl text-xs uppercase cursor-pointer"
              >
                Gusa Upate (Get Started)
              </button>
            </div>

            {/* Plan 4: SSD Ultra */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#cca43b] transition-colors relative">
              <div className="space-y-4">
                <div>
                  <strong className="text-sm uppercase font-bold text-stone-400 block tracking-wider">SSD Ultra</strong>
                  <h3 className="text-2xl font-black text-stone-800 pt-1">TSH 50,000 <span className="text-xs font-normal text-stone-400">/mo</span></h3>
                  <span className="text-[10px] text-stone-400 font-semibold block">Unlimited multi-site networks</span>
                </div>

                <ul className="space-y-2 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Unlimited Sites / Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Unlimited Access points adopts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Full API integrations support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#cca43b] shrink-0" />
                    <span>Dedicated priority SMS server</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-xl text-xs uppercase cursor-pointer"
              >
                Gusa Upate (Get Started)
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 5. DYNAMIC FEATURES COMPARISON BLOCK */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#e6e2d3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Hotspot Advantages</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#231f1c]">Kwanini Kuchagua WiFi Yetu Mtaani?</h2>
            <p className="text-sm text-stone-500">Tofauti yetu kubwa na vifurushi vya dharura vya mitandao ya simu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#fbf9f4] border border-[#e6e2d3] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-[#cca43b]/20 flex items-center justify-center text-[#cca43b]">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-stone-800">No Data Cap Anxiety</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Vifurushi vya kawaida vya simu vinamalizika haraka sana ukiangalia video za HD. Kwenye WiFi yetu unanunua muda safi (Saa 2 au 24) usio na kikomo cha data!
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#fbf9f4] border border-[#e6e2d3] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-800">24/7 Power Security</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Vifaa vyetu vya mtaani vina betri maalum za dharura (Backup Batteries). Hata umeme wa TANESCO ukikatika mtaani, intaneti inaendelea kuwaka kwa utulivu!
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#fbf9f4] border border-[#e6e2d3] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 text-sky-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-800">Encrypted isolated browsing</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Teknolojia ya MikroTik & Omada Client Isolation inalinda taarifa na vifaa vyako dhidi ya kuingiliwa na kifaa kingine chochote kwenye mtandao wetu mkuu.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. HELP CALL TO ACTION FOOTER */}
      <section className="py-14 bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#231f1c] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black">Unahitaji Msaada au Vocha ya Mwezi?</h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl font-medium">
                Wasiliana nasi moja kwa moja kwa WhatsApp au Simu namba: {settings.supportPhone}. Tuko tayari kukuhudumia na kukupa muongozo bora zaidi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
                className="px-5 py-3 rounded-xl bg-[#cca43b] hover:bg-[#b89332] text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{settings.supportPhone}</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('guide')}
                className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-bold text-xs border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#cca43b]" />
                <span>Mwongozo wa Kiufundi</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
