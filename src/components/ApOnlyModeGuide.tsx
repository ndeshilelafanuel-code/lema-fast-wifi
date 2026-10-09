import React, { useState } from 'react';
import { Language } from '../types';
import { AP_ONLY_BRANDS, COMPARISON_METRICS } from '../data/wifiGuideData';
import {
  Radio,
  CheckCircle2,
  Smartphone,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Award,
  Check,
  X,
  HelpCircle
} from 'lucide-react';

interface ApOnlyModeGuideProps {
  lang: Language;
  onSelectBrand?: (brandId: string) => void;
}

export const ApOnlyModeGuide: React.FC<ApOnlyModeGuideProps> = ({ lang }) => {
  const [activeBrandId, setActiveBrandId] = useState<string>('ruijie-reyee');
  const [demoVouchers, setDemoVouchers] = useState<string[]>(['RY-8291', 'RY-4519', 'RY-7730']);
  const [selectedDuration, setSelectedDuration] = useState<string>('24h');

  const selectedBrand = AP_ONLY_BRANDS.find((b) => b.id === activeBrandId) || AP_ONLY_BRANDS[0];

  const generateNewVouchers = () => {
    const prefix = activeBrandId === 'ruijie-reyee' ? 'RY' : 'OM';
    const newCodes = [
      `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
    ];
    setDemoVouchers(newCodes);
  };

  return (
    <section id="ap-only" className="py-16 md:py-20 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span>Suluhisho Maalum</span>
            <span aria-hidden="true">·</span>
            <span>AP-Only Hotspot Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
            {lang === 'sw' ? (
              <>
                Kutumia <span className="text-amber-400">AP Tu Bila MikroTik</span>: Mwongozo Kamili
              </>
            ) : (
              <>
                Running with <span className="text-amber-400">Only an Access Point (No MikroTik)</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-base text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Ndiyo! Unaweza kuanzisha biashara yako ya WiFi bila kununua router ya MikroTik kwa kutumia "Smart Outdoor AP" zenye mfumo wa ndani wa Cloud Hotspot na Vocha unaoendeshwa moja kwa moja kutoka kwenye simu yako.'
              : 'Yes! You can launch your street WiFi business without buying a MikroTik router by using Smart Outdoor APs that run built-in Cloud Hotspots and voucher generators directly from your mobile phone.'}
          </p>
        </div>

        {/* The 3 Things You Need in AP-Only Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'sw' ? '1. Modemu ya ISP / Starlink' : '1. ISP Modem or Starlink'}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Hufanya kazi ya kutoa intaneti na anwani za IP (DHCP Server). Waya unatoka moja kwa moja kwenye modemu hii kwenda kwenye PoE Injector.'
                : 'Acts as your internet feed and gateway DHCP server. A direct LAN cable feeds from this modem into the PoE injector.'}
            </p>
          </div>

          <div className="bg-stone-850 rounded-xl p-6 border border-amber-500/40 space-y-3 ring-1 ring-amber-400/30">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'sw' ? '2. Smart Outdoor AP' : '2. Smart Outdoor AP'}</span>
              <span className="text-[10px] bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded font-bold uppercase">
                {lang === 'sw' ? 'Moyo wa Mfumo' : 'Core'}
              </span>
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Lazima iwe AP yenye Cloud Hotspot (k.m. Ruijie Reyee au TP-Link Omada). Ndiyo inayorusha mawimbi, kuonyesha ukurasa wa vocha, na kupunguza spidi ya wateja.'
                : 'Must feature native Cloud Hotspot (Ruijie Reyee or TP-Link Omada). Broadcasts RF signals, handles captive logins, and limits speed.'}
            </p>
          </div>

          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'sw' ? '3. Simu Yako ya Mkononi' : '3. Your Smartphone'}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Hakuna kompyuta wala Winbox! Unatumia app ya bure (Reyee App au Omada App) kutengeneza vocha, kuona idadi ya wateja, na kugawa vifurushi.'
                : 'Zero laptop or Winbox scripts needed! Use the free vendor app to batch generate vouchers, track clients, and set validity hours.'}
            </p>
          </div>
        </div>

        {/* Visual Architecture Diagram for AP-Only */}
        <div className="bg-stone-950 rounded-2xl p-6 sm:p-8 border border-stone-800 mb-12">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {lang === 'sw' ? 'Mchoro wa Mtandao wa AP Tu (Bila MikroTik)' : 'AP-Only Network Diagram'}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'sw'
                  ? 'Mfumo rahisi wenye vifaa 2 tu vya kielektroniki'
                  : 'Minimalist architecture with only 2 physical powered devices'}
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              {lang === 'sw' ? 'Rahisi & Nafuu' : 'Plug & Play'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            {/* Box 1 */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-center">
              <p className="text-xs font-mono text-amber-400 font-bold mb-1">01. INGRESS</p>
              <h4 className="text-sm font-bold text-white">Modemu ya ISP / Starlink</h4>
              <p className="text-[11px] text-stone-400 mt-1">Inatoa intaneti & anwani za IP (DHCP)</p>
            </div>

            {/* Connection Arrow */}
            <div className="hidden sm:flex justify-center text-stone-600">
              <ArrowRight className="w-5 h-5 text-amber-500" />
            </div>

            {/* Box 2 */}
            <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/40 text-center ring-1 ring-amber-400/20">
              <p className="text-xs font-mono text-amber-400 font-bold mb-1">02. POWER & DATA</p>
              <h4 className="text-sm font-bold text-white">PoE Injector (48V)</h4>
              <p className="text-[11px] text-stone-400 mt-1">Waya mmoja wa Cat6 FTP kwenda mnarani</p>
            </div>

            {/* Connection Arrow */}
            <div className="hidden sm:flex justify-center text-stone-600">
              <ArrowRight className="w-5 h-5 text-amber-500" />
            </div>

            {/* Box 3 */}
            <div className="p-4 rounded-xl bg-stone-900 border border-emerald-500/40 text-center ring-1 ring-emerald-400/20">
              <p className="text-xs font-mono text-emerald-400 font-bold mb-1">03. SMART AP</p>
              <h4 className="text-sm font-bold text-white">Ruijie Reyee / TP-Link EAP</h4>
              <p className="text-[11px] text-stone-400 mt-1">Cloud Hotspot + Vocha za QR + Spidi</p>
            </div>
          </div>
        </div>

        {/* Brand Showcase & Mobile Voucher Generator Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          {/* Left Column: Brand Options */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{lang === 'sw' ? 'Chagua AP Inayofaa Zaidi Bila MikroTik' : 'Best APs for Non-MikroTik Hotspot'}</span>
            </h3>

            <div className="space-y-3">
              {AP_ONLY_BRANDS.map((brand) => {
                const isSelected = brand.id === activeBrandId;
                return (
                  <div
                    key={brand.id}
                    onClick={() => setActiveBrandId(brand.id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-850 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{brand.name}</h4>
                        {brand.isTopPick && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.5 rounded">
                            {lang === 'sw' ? 'Chaguo Namba 1' : 'Top Recommendation'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Tsh {brand.costTzs.toLocaleString()} (~${brand.costUsd})
                      </span>
                    </div>

                    <p className="text-xs text-amber-300 font-semibold mb-2">
                      Model: {brand.recommendedModel}
                    </p>

                    <p className="text-xs text-stone-300 leading-relaxed mb-3">
                      {brand.whyBestForApOnly[lang]}
                    </p>

                    <div className="pt-2 border-t border-stone-800">
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                        {lang === 'sw' ? 'Sifa Kuu:' : 'Key Capabilities:'}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300">
                        {brand.keyFeatures[lang].map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Mobile App Voucher Simulator */}
          <div className="lg:col-span-5 bg-stone-950 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'sw' ? 'Kijaribu cha Vocha Kwenye Simu' : 'Mobile Cloud Voucher Generator'}
                </h4>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                {selectedBrand.appPlatform.split(' ')[0]} App
              </span>
            </div>

            <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  {lang === 'sw' ? 'Muda wa Vocha:' : 'Voucher Duration:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedDuration('2h')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      selectedDuration === '2h'
                        ? 'bg-amber-400 text-stone-900 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    2 Hours
                  </button>
                  <button
                    onClick={() => setSelectedDuration('24h')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      selectedDuration === '24h'
                        ? 'bg-amber-400 text-stone-900 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => setSelectedDuration('7d')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      selectedDuration === '7d'
                        ? 'bg-amber-400 text-stone-900 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    7 Days
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-300 font-semibold">
                    {lang === 'sw' ? 'Kikomo cha Spidi kwa Mteja:' : 'Per-User Speed Limiter:'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">2.5 Mbps Down / 1 Mbps Up</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-2/5" />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  {lang === 'sw'
                    ? 'Inatosha video za TikTok & YouTube bila kukwama huku ikiokoa intaneti.'
                    : 'Optimal for HD streaming while preserving global link capacity.'}
                </span>
              </div>

              <button
                onClick={generateNewVouchers}
                className="w-full py-2.5 px-4 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'sw' ? 'Tengeneza Vocha Mpya (Generate Vouchers)' : 'Generate Fresh Vouchers'}</span>
              </button>
            </div>

            {/* Generated demo vouchers */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                {lang === 'sw' ? 'Vocha Zilizotolewa (Tayari Kuuza):' : 'Active Batch Generated:'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {demoVouchers.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-stone-800 border border-stone-700 text-center space-y-0.5"
                  >
                    <p className="text-xs font-bold font-mono text-amber-300">{code}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{selectedDuration} / 2.5M</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-2 text-center">
                {lang === 'sw'
                  ? 'Unaweza kuzituma kwa WhatsApp au kuzichapisha kwenye karatasi na kuzigawa madukani!'
                  : 'Send instantly via WhatsApp or print directly onto paper slips for retail sales!'}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Setup for AP-Only */}
        <div className="bg-stone-850 rounded-2xl p-6 sm:p-8 border border-stone-700/80 mb-14">
          <h3 className="text-lg font-bold text-white mb-6">
            {lang === 'sw'
              ? 'Hatua 4 za Kusanidi Mfumo Huu Ndani ya Dakika 10:'
              : '4 Fast Steps to Set Up AP-Only in 10 Minutes:'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-2xl font-bold font-mono text-amber-400">01</span>
              <h4 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Unganisha Waya' : 'Physical Cabling'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'sw'
                  ? 'Chomeka waya kutoka modemu yako ya ISP/Starlink kwenda kwenye "LAN" ya PoE Injector, na waya wa kwenda mnarani kwenye "PoE".'
                  : 'Run an ethernet cable from your ISP/Starlink modem into the PoE Injector LAN port, and the outdoor cable to the PoE port.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-2xl font-bold font-mono text-amber-400">02</span>
              <h4 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Fungua App ya Simu' : 'Launch Mobile App'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'sw'
                  ? 'Fungua Ruijie Reyee App au TP-Link Omada App kwenye simu yako. Scan QR code iliyo nyuma ya AP kuiongeza kwenye akaunti yako ya bure.'
                  : 'Open the free Reyee or Omada App on your phone. Scan the QR code on the back of the AP to adopt it into your cloud profile.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-2xl font-bold font-mono text-amber-400">03</span>
              <h4 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Washa Hotspot & Vocha' : 'Enable Voucher Portal'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'sw'
                  ? 'Kwenye app, nenda kwenye "WiFi Management" -> Chagua "Guest Network" -> Washa "Captive Portal" na uweke chagua la "Voucher".'
                  : 'Inside the app, navigate to Guest Network settings, activate the Captive Portal, and set authentication mode to "Voucher".'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-2xl font-bold font-mono text-amber-400">04</span>
              <h4 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Tengeneza Vocha & Anza' : 'Print & Distribute'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'sw'
                  ? 'Tengeneza vocha 50 au 100 za saa 2 (Tsh 500) na siku 1 (Tsh 1,000), wape maduka ya jirani, na uanze kukusanya pesa!'
                  : 'Generate a batch of 50 vouchers for 2 hours and 24 hours, partner with neighborhood shops, and start taking cash!'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table: AP Only vs MikroTik + AP */}
        <div className="bg-stone-950 rounded-2xl p-6 sm:p-8 border border-stone-800">
          <div className="max-w-2xl mb-6">
            <h3 className="text-lg font-bold text-white">
              {lang === 'sw'
                ? 'Ulinganifu: "AP Tu" Dhidi ya "MikroTik + AP"'
                : 'Decision Matrix: "AP Only" vs "MikroTik + AP"'}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'sw'
                ? 'Kuelewa faida na vikwazo vya kila njia ili ufanye uamuzi sahihi kulingana na mtaji na malengo yako.'
                : 'Understand trade-offs and limits so you can make the smartest economic and engineering choice.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                    {lang === 'sw' ? 'Kipengele' : 'Feature'}
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-amber-400">
                    {lang === 'sw' ? 'AP Tu (Bila MikroTik)' : 'AP Only (No MikroTik)'}
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-stone-300">
                    {lang === 'sw' ? 'Mfumo Kamili (MikroTik + AP)' : 'Full System (MikroTik + AP)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850">
                {COMPARISON_METRICS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {row.feature[lang]}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      {row.apOnly[lang]}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {row.mikrotikPlusAp[lang]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <strong>{lang === 'sw' ? 'Ushauri wa Mwisho: ' : 'Key Takeaway: '}</strong>
            {lang === 'sw'
              ? 'Kama una mtaji mdogo sana (chini ya Tsh 500,000) au haupendi mambo magumu ya networking, ANZA NA AP TU (hasa Ruijie Reyee RG-RAP6202G). Ukishapata wateja zaidi ya 50 na kukuza mtaji, unaweza kuongeza MikroTik wakati wowote bila kutupa AP yako!'
              : 'If you have low starting capital (under $200) or want zero networking configuration headache, START WITH AP ONLY (especially Ruijie Reyee RG-RAP6202G). Once you grow beyond 50 regular users, you can effortlessly introduce a MikroTik router later without replacing your AP!'}
          </div>
        </div>
      </div>
    </section>
  );
};
