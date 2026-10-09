import React from 'react';
import { Language } from '../types';
import { ShieldCheck, FileText, Scale, Lock, AlertCircle, Building2 } from 'lucide-react';

interface LegalAndComplianceProps {
  lang: Language;
}

export const LegalAndCompliance: React.FC<LegalAndComplianceProps> = ({ lang }) => {
  return (
    <section id="compliance" className="py-16 md:py-20 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span>06. Sheria & Vibali</span>
            <span aria-hidden="true">·</span>
            <span>Legal Framework & Licensing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
            {lang === 'sw'
              ? 'Mambo ya Kisheria, Vibali na Leseni za Kuzingatia'
              : 'Regulatory Compliance & Licensing Roadmap'}
          </h2>
          <p className="mt-3 text-base text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Ili uendeshe biashara yako kwa amani bila kusumbuliwa na mamlaka, lazima uelewe kanuni za usajili, utozaji kodi, na sheria za mawasiliano.'
              : 'Operating with lasting peace of mind requires navigating business registration, municipal permits, tax guidelines, and telecom regulatory compliance.'}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Business Registration & Tax */}
          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'sw' ? '1. Usajili wa Biashara & TIN (BRELA & TRA)' : '1. Business Entity & Tax ID (BRELA & TRA)'}
                </h3>
                <span className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Msingi wa kisheria wa biashara' : 'Legal business foundation'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Sajili jina la biashara yako mtandaoni kupitia mfumo wa BRELA (ORS). Baada ya hapo, pata Cheti cha Nambari ya Utambulisho wa Mlipakodi (TIN) kutoka Mamlaka ya Mapato (TRA). Kwa biashara ndogo za mtaani, kodi ya awali huwa ni ya kiwango cha makadirio (presumptive tax) na ni nafuu sana.'
                : 'Register your trade name online via BRELA (Business Registrations and Licensing Agency). Obtain your Taxpayer Identification Number (TIN) from TRA. Micro-hotspot operations qualify for simplified presumptive tax brackets.'}
            </p>
          </div>

          {/* 2. Municipal Trading License */}
          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'sw' ? '2. Leseni ya Halmashauri ya Wilaya' : '2. Municipal Trading Permit'}
                </h3>
                <span className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Kibali cha kuendesha biashara eneo husika' : 'Local council trading authorization'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Nenda ofisi ya Halmashauri ya Manispaa au Wilaya ilipo biashara yako na uombe Leseni ya Biashara (Kundi la Huduma za Mawasiliano / Maduka ya TEHAMA). Hii inakupa uhalali wa kuweka mabango na kufanya kazi bila kusumbuliwa na mgambo wa jiji.'
                : 'Acquire your municipal commercial permit from the local district council under ICT & Telecommunications services. This authorizes signage placement and municipal commercial operations without friction.'}
            </p>
          </div>

          {/* 3. Telecom Regulator (TCRA / CAK) Position */}
          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'sw' ? '3. Mwongozo wa TCRA (Mamlaka ya Mawasiliano)' : '3. Telecom Regulatory Stance (TCRA)'}
                </h3>
                <span className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Kanuni za kugawa intaneti' : 'Bandwidth distribution regulations'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Unaponunua intaneti ya jumla kutoka kwa kampuni yenye leseni kamili ya TCRA (k.m. TTCL, Liquid, Zuku), hakikisha mkataba wako ni wa Kibiashara (SME / Commercial Plan) unaokuruhusu kisheria kugawa intaneti kama "Value-Added Hotspot". Unapokua na kuwa WISP mkubwa mwenye minara na link za mbali za Point-to-Point, unapaswa kusajili Leseni ya "Application Services".'
                : 'When buying wholesale bandwidth from licensed carriers (TTCL, Liquid, Zuku), contract under an SME/Commercial rate card that explicitly authorizes multi-client hotspot redistribution. As you scale into long-range PtP links, graduate into a formal TCRA Application Service Provider class license.'}
            </p>
          </div>

          {/* 4. Cybercrime & Session Log Retention */}
          <div className="bg-stone-850 rounded-xl p-6 border border-stone-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'sw' ? '4. Usalama wa Mtandao & Kumbukumbu (Logs)' : '4. Cybersecurity & Log Retention'}
                </h3>
                <span className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Kujilinda dhidi ya makosa ya wateja' : 'Indemnity against user abuse'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Sheria ya Makosa ya Mtandao (Cybercrimes Act) inamtaka mtoa huduma kurekodi anwani za IP na muda ambao watumiaji walikuwa mtandaoni. RouterOS ya MikroTik hufanya hili kiotomatiki kwa kuhifadhi kumbukumbu (Log files) za kila vocha iliyounganishwa na nambari ya simu au MAC address. Hii inakulinda kama mteja atafanya uhalifu akiwa kwenye WiFi yako!'
                : 'Cybersecurity laws require network providers to record user connection logs. MikroTik RouterOS automates this by maintaining timestamped logs pairing each voucher session to its hardware MAC address and allocated IP, safeguarding you from legal liability if an end-user misbehaves.'}
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {lang === 'sw'
              ? 'Tahadhari Muhimu: Usitumie laini ya kawaida ya simu ya simcard ya kawaida ya mtu binafsi au kifurushi cha intaneti ya nyumbani (Home Fiber) kugawa kibiashara. Watoa huduma wakigundua matumizi makubwa ya gigabytes watafunga laini yako. Daima omba mkataba rasmi wa kibiashara (Business SME Broadband).'
              : 'Critical Advisory: Avoid reselling unmetered consumer home packages. Service providers audit bandwidth flow; upon identifying hundreds of unique MAC addresses, residential accounts get severed for terms violations. Always request a legitimate SME Business line.'}
          </p>
        </div>
      </div>
    </section>
  );
};
