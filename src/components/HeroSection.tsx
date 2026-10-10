import React from 'react';
import { Language, SystemMode } from '../types';
import { LemaLogo } from './common/LemaLogo';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Radio, Server, Receipt, Smartphone } from 'lucide-react';
import heroWifiNetworkImg from '../assets/images/hero_wifi_network_1791031760999.jpg';

interface HeroSectionProps {
  lang: Language;
  systemMode: SystemMode;
  onModeToggle: (mode: SystemMode) => void;
  onExploreChecklist: () => void;
  onOpenCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  systemMode,
  onModeToggle,
  onExploreChecklist,
  onOpenCalculator,
}) => {
  const isApOnly = systemMode === 'ap-only';

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 border-b border-stone-800">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-18 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition & Direct Answer */}
          <div className="lg:col-span-7 space-y-5">
            <div className="mb-2">
              <LemaLogo variant="horizontal" size="sm" theme="dark" showSlogan={true} />
            </div>

            {/* Mode selection banner badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                {lang === 'sw' ? 'Hali Iliyochaguliwa:' : 'Active Architecture:'}
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-stone-800 border border-stone-700 text-xs">
                <button
                  onClick={() => onModeToggle('ap-only')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    isApOnly
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {lang === 'sw' ? '⚡ AP Tu (Bila MikroTik)' : '⚡ AP Only (No MikroTik)'}
                </button>
                <button
                  onClick={() => onModeToggle('standard')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    !isApOnly
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {lang === 'sw' ? 'MikroTik + AP' : 'MikroTik + AP'}
                </button>
              </div>
            </div>

            {/* Direct Answer Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight text-balance">
              {isApOnly ? (
                lang === 'sw' ? (
                  <>
                    Ndio! Unaweza Kuanza na <span className="text-amber-400">AP Tu Bila MikroTik</span>
                  </>
                ) : (
                  <>
                    Yes! You Can Run on <span className="text-amber-400">Only an AP (Zero MikroTik)</span>
                  </>
                )
              ) : (
                lang === 'sw' ? (
                  <>
                    Hivi Ndivyo Vitu <span className="text-amber-400">5 Muhimu</span> vya Kuanzisha Biashara ya WiFi
                  </>
                ) : (
                  <>
                    The <span className="text-amber-400">5 Core Pillars</span> to Launch a WiFi Hotspot Business
                  </>
                )
              )}
            </h1>

            {/* Subtitle / Direct Answer */}
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              {isApOnly ? (
                lang === 'sw'
                  ? 'Ikiwa unataka mfumo mwepesi usio na MikroTik, unachohitaji ni "Smart Outdoor Access Point" yenye mfumo wa ndani wa Cloud Hotspot (k.m. Ruijie Reyee RG-RAP6202G au TP-Link Omada EAP225). Inachomekwa moja kwa moja kwenye modemu ya ISP au Starlink, na inatoa vocha za QR na kudhibiti spidi kupitia app ya bure kwenye simu yako bila kuhitaji PC wala MikroTik!'
                  : 'If you want a lean setup without a MikroTik router, all you need is a Smart Outdoor AP featuring onboard Cloud Hotspot firmware (Ruijie Reyee or TP-Link Omada). It plugs directly into your ISP or Starlink modem, generating QR vouchers and rate-limiting users from your smartphone.'
              ) : (
                lang === 'sw'
                  ? 'Kuanzisha biashara ya kuuza WiFi ya vocha mtaani hakuhitaji mamilioni ya kutisha. Unahitaji mambo makuu matano: chanzo cha intaneti ya jumla, router ya kibiashara ya MikroTik, kifaa cha kurushia mawimbi nje (Access Point), mfumo wa vocha (Mikhmon), na umeme thabiti wa sola au UPS.'
                  : 'Starting a street voucher WiFi hotspot does not require millions in venture funding. You only need five concrete components: uncapped wholesale bandwidth, a MikroTik gateway router, a high-gain outdoor access point, automated voucher software, and dependable power backup.'
              )}
            </p>

            {/* Fast Quick Scan Cards depending on mode */}
            {isApOnly ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-2.5">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '1. Smart Outdoor AP' : '1. Smart Outdoor AP'}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'sw' ? 'Ruijie Reyee / TP-Link EAP225' : 'Ruijie Reyee or Omada AP'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-2.5">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '2. ISP / Starlink Modem' : '2. ISP / Starlink Feed'}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'sw' ? 'Hutoa intaneti & IP moja kwa moja' : 'Direct DHCP & uncapped bandwidth'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-2.5">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '3. App ya Simu (Reyee)' : '3. Vendor Mobile App'}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'sw' ? 'Kutoa vocha & kuweka spidi' : 'Generate vouchers & speed limit'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '1. Router ya MikroTik' : '1. MikroTik Router'}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {lang === 'sw' ? 'Kugawanya spidi, IP & ukurasa wa vocha' : 'Bandwidth throttling & captive gateway'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '2. Outdoor Access Point' : '2. Outdoor Access Point'}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {lang === 'sw' ? 'Kurusha mawimbi mita 150 - 400 mtaani' : 'Weatherproof 360° street signal broadcast'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '3. Intaneti (Fiber / Starlink)' : '3. Internet (Fiber / Starlink)'}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {lang === 'sw' ? 'Kifurushi cha Unlimited cha 30Mbps+' : 'Uncapped commercial wholesale feed'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/70 border border-stone-700/80 flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                      {lang === 'sw' ? '4. Mfumo wa Vocha (Mikhmon)' : '4. Mikhmon & Billing'}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {lang === 'sw' ? 'Kutengeneza vocha & malipo ya simu' : 'QR code vouchers & mobile money push'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onExploreChecklist}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{lang === 'sw' ? 'Tazama Vifaa Vinavyohitajika' : 'Review Equipment List'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenCalculator}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'sw' ? 'Kikokotoo cha Faida & Gharama' : 'Calculate Costs & ROI'}
              </button>
            </div>

            {/* Editorial trust markers */}
            <div className="flex items-center gap-4 pt-1 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isApOnly
                    ? (lang === 'sw' ? 'Inaokoa Tsh 250,000 za router' : 'Saves ~$100 in hardware')
                    : (lang === 'sw' ? 'Uzoefu wa vitendo Afrika Mashariki' : 'Field tested in East Africa')}
                </span>
              </div>
              <span aria-hidden="true" className="text-stone-700">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isApOnly
                    ? (lang === 'sw' ? 'Usanidi wa dakika 5 kwenye simu' : '5-min mobile app setup')
                    : (lang === 'sw' ? 'Hakuna vocha feki / usalama wa mtandao' : 'Secure MikroTik firewall standards')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Anchor with Real Generated Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-stone-700/80 bg-stone-800 shadow-2xl">
              <img
                src={heroWifiNetworkImg}
                onError={(e) => {
                  e.currentTarget.src = '/images/hero_wifi_network_1791031760999.jpg';
                }}
                alt="Outdoor telecom tower with wireless antennas in East African town"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-80 lg:h-88 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

              {/* Informational overlay badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-stone-700/60">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      {isApOnly
                        ? (lang === 'sw' ? 'Mtaji wa Kuanzia (AP Tu)' : 'Starting Capital (AP Only)')
                        : (lang === 'sw' ? 'Makadirio ya Mtaji (Kamili)' : 'Full Starting Capital')}
                    </p>
                    <p className="text-lg font-bold text-white font-mono tabular-nums">
                      {isApOnly
                        ? (lang === 'sw' ? 'Tsh 380,000 – 620,000' : '$150 – $250 USD')
                        : (lang === 'sw' ? 'Tsh 650,000 – 1,200,000' : '$260 – $480 USD')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400">
                      {isApOnly
                        ? (lang === 'sw' ? 'Usanidi wa Winbox?' : 'Winbox required?')
                        : (lang === 'sw' ? 'Wateja kwa Siku' : 'Daily User Footprint')}
                    </p>
                    <p className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
                      {isApOnly
                        ? (lang === 'sw' ? 'HAPANA (Simu Tu)' : 'NO (Phone Only)')
                        : '30 – 80 Users'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
