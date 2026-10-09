import React from 'react';
import { Language, SystemMode, AppView } from '../types';
import { LemaLogo } from './common/LemaLogo';
import {
  Wifi,
  Globe,
  Calculator,
  Printer,
  Radio,
  Zap,
  LayoutDashboard,
  Smartphone,
  BookOpen,
  Home,
  Lock
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  systemMode: SystemMode;
  appView: AppView;
  onViewChange: (view: AppView) => void;
  onModeToggle: (mode: SystemMode) => void;
  onLanguageToggle: (lang: Language) => void;
  onScrollTo: (sectionId: string) => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  systemMode,
  appView,
  onViewChange,
  onModeToggle,
  onLanguageToggle,
  onScrollTo,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('landing');
            }}
            className="flex items-center text-stone-100 hover:opacity-90 transition-opacity group py-1"
          >
            <LemaLogo variant="horizontal" size="sm" theme="dark" showSlogan={false} />
          </a>

          {/* Primary View Switcher: Landing vs Customer Portal vs Admin vs Guide */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-800 rounded-xl border border-stone-700 text-xs">
            <button
              onClick={() => onViewChange('landing')}
              className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                appView === 'landing'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Mwanzo' : 'Home'}</span>
            </button>

            <button
              onClick={() => onViewChange('customer-portal')}
              className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                appView === 'customer-portal'
                  ? 'bg-emerald-400 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Portal ya Wateja' : 'Customer Portal'}</span>
            </button>

            <button
              onClick={() => onViewChange('admin-dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                appView === 'admin-dashboard'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Admin' : 'Admin'}</span>
            </button>

            <button
              onClick={() => onViewChange('guide')}
              className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                appView === 'guide'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Mwongozo' : 'Blueprint'}</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links for Guide view */}
        {appView === 'guide' && (
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-stone-300">
            <button
              onClick={() => onScrollTo('self-service')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Malipo ya STK</span>
            </button>
            <button
              onClick={() => onScrollTo('ap-only')}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                systemMode === 'ap-only' ? 'text-amber-400 font-bold' : 'hover:text-amber-400'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>AP Tu</span>
            </button>
            <button
              onClick={() => onScrollTo('checklist')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Vifaa
            </button>
            <button
              onClick={() => onScrollTo('topology')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Muundo
            </button>
            <button
              onClick={() => onScrollTo('calculator')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Kikokotoo
            </button>
          </nav>
        )}

        {/* Zone 3: Actions & Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile view switchers if screen is small */}
          <div className="flex sm:hidden items-center gap-1 p-0.5 bg-stone-800 rounded-lg text-[11px]">
            <button
              onClick={() => onViewChange('admin-dashboard')}
              className={`px-2 py-1 rounded font-bold ${
                appView === 'admin-dashboard' ? 'bg-amber-400 text-stone-950' : 'text-stone-300'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => onViewChange('customer-portal')}
              className={`px-2 py-1 rounded font-bold ${
                appView === 'customer-portal' ? 'bg-emerald-400 text-stone-950' : 'text-stone-300'
              }`}
            >
              Portal
            </button>
            <button
              onClick={() => onViewChange('guide')}
              className={`px-2 py-1 rounded ${
                appView === 'guide' ? 'bg-stone-700 text-white' : 'text-stone-400'
              }`}
            >
              Guide
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageToggle(lang === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-stone-300 bg-stone-800/80 hover:bg-stone-750 border border-stone-700 rounded-md transition-colors"
            title={lang === 'sw' ? 'Badili lugha kuwa Kiingereza' : 'Switch to Swahili'}
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider">{lang === 'sw' ? 'EN' : 'SW'}</span>
          </button>

          {/* Quick Print Button */}
          <button
            onClick={onPrint}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors whitespace-nowrap"
            title={lang === 'sw' ? 'Chapisha au Hifadhi PDF' : 'Print or Save PDF'}
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </header>
  );
};
