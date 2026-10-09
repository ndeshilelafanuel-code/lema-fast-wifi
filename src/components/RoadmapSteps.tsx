import React from 'react';
import { Language } from '../types';
import { ROADMAP_STEPS } from '../data/wifiGuideData';
import { Clock, CheckCircle, Lightbulb } from 'lucide-react';

interface RoadmapStepsProps {
  lang: Language;
}

export const RoadmapSteps: React.FC<RoadmapStepsProps> = ({ lang }) => {
  return (
    <section id="roadmap" className="py-16 md:py-20 bg-stone-50 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            <span>05. Hatua kwa Hatua</span>
            <span aria-hidden="true">·</span>
            <span>Execution Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            {lang === 'sw'
              ? 'Hatua 6 za Kutoka Sifuri Mpaka Kuzindua'
              : '6-Stage Implementation Roadmap: Zero to Live'}
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            {lang === 'sw'
              ? 'Fuata mwongozo huu wa vitendo ili kuepuka kupoteza pesa au kufanya makosa ya kawaida yanayowarudisha nyuma wengi wanaoanza.'
              : 'Follow this proven blueprint to avoid costly trial-and-error and launch a high-performance community hotspot within 2 weeks.'}
          </p>
        </div>

        {/* Roadmap Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROADMAP_STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-400/80 transition-colors"
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <span className="text-2xl font-bold font-mono text-amber-600">
                    {step.number}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{step.duration[lang]}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-stone-900 leading-snug mb-2">
                  {step.title[lang]}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {step.summary[lang]}
                </p>

                {/* Checklist sub-items */}
                <ul className="space-y-2 mb-6">
                  {step.details[lang].map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tip Box */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip: </strong>
                  {step.proTip[lang]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
