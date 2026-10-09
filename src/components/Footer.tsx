import React from 'react';
import { Language } from '../types';
import { LemaLogo } from './common/LemaLogo';
import { Wifi, Printer, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onPrint: () => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onPrint, onScrollToTop }) => {
  return (
    <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <div className="mb-2">
              <LemaLogo variant="horizontal" size="sm" theme="dark" showSlogan={true} />
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-md">
              {lang === 'sw'
                ? 'Mwongozo wa kiufundi, makadirio ya mtaji, na usanidi wa kuanzisha biashara ya kuuza intaneti na vocha za WiFi mtaani.'
                : 'Technical field guide, budget feasibility calculator, and setup blueprint for micro-ISP & street hotspot entrepreneurs.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sw' ? 'Chapisha Orodha Yote' : 'Print / Export Blueprint'}</span>
            </button>
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-md transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Juu' : 'Back to Top'}</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Mwongozo wa Biashara ya WiFi. Haki zote zimehifadhiwa.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>MikroTik RouterOS</span>
            <span aria-hidden="true">·</span>
            <span>Mikhmon Billing</span>
            <span aria-hidden="true">·</span>
            <span>Fiber & Starlink Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
