/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, SystemMode, AppView } from './types';
import { HotspotProvider } from './context/HotspotContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AutomatedPaymentGuide } from './components/AutomatedPaymentGuide';
import { PaymentIntegrationGuide } from './components/PaymentIntegrationGuide';
import { ApOnlyModeGuide } from './components/ApOnlyModeGuide';
import { EquipmentChecklist } from './components/EquipmentChecklist';
import { NetworkArchitecture } from './components/NetworkArchitecture';
import { FinancialCalculator } from './components/FinancialCalculator';
import { CaptivePortalPreview } from './components/CaptivePortalPreview';
import { RoadmapSteps } from './components/RoadmapSteps';
import { LegalAndCompliance } from './components/LegalAndCompliance';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

// Operational System Components
import { AdminDashboard } from './components/system/AdminDashboard';
import { CustomerPortal } from './components/system/CustomerPortal';
import { AdminLogin } from './components/system/AdminLogin';
import { LandingPage } from './components/LandingPage';

export default function App() {
  const [lang, setLang] = useState<Language>('sw');
  const [systemMode, setSystemMode] = useState<SystemMode>('ap-only');
  // Default to 'landing' so users arrive at the high-converting landing page
  const [appView, setAppView] = useState<AppView>('landing');

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return (
      localStorage.getItem('hotspot_admin_auth') === 'true' ||
      sessionStorage.getItem('hotspot_admin_auth') === 'true'
    );
  });

  const handleAdminLogout = () => {
    localStorage.removeItem('hotspot_admin_auth');
    sessionStorage.removeItem('hotspot_admin_auth');
    setIsAdminLoggedIn(false);
  };

  const scrollToSection = (id: string) => {
    // If not in guide view, switch to guide first
    if (appView !== 'guide') {
      setAppView('guide');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <HotspotProvider>
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
        {/* Top Bar Header */}
        <Header
          lang={lang}
          systemMode={systemMode}
          appView={appView}
          onViewChange={setAppView}
          onModeToggle={setSystemMode}
          onLanguageToggle={setLang}
          onScrollTo={scrollToSection}
          onPrint={handlePrint}
        />

        {/* Dynamic Main Body based on appView */}
        <main className="flex-1">
          {appView === 'landing' && (
            <LandingPage lang={lang} onNavigate={setAppView} />
          )}

          {appView === 'admin-dashboard' &&
            (!isAdminLoggedIn ? (
              <AdminLogin
                lang={lang}
                onSuccess={() => setIsAdminLoggedIn(true)}
                onBackToHome={() => setAppView('landing')}
              />
            ) : (
              <AdminDashboard
                lang={lang}
                onOpenCustomerPortal={() => setAppView('customer-portal')}
                onLogout={handleAdminLogout}
                onOpenApiGuide={() => {
                  setAppView('guide');
                  setTimeout(() => {
                    const el = document.getElementById('payment-integration');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              />
            ))}

          {appView === 'customer-portal' && (
            <CustomerPortal lang={lang} />
          )}

          {appView === 'guide' && (
            <>
              {/* Hero Section */}
              <HeroSection
                lang={lang}
                systemMode={systemMode}
                onModeToggle={setSystemMode}
                onExploreChecklist={() => scrollToSection('checklist')}
                onOpenCalculator={() => scrollToSection('calculator')}
              />

              {/* Dedicated AP-Only Guide */}
              <ApOnlyModeGuide lang={lang} />

              {/* Automated Self-Service Payment & STK-Push Guide */}
              <AutomatedPaymentGuide lang={lang} />

              {/* Developer Payment API Integration Guide (ZenoPay, Snippe, InstantPay, MikroTik) */}
              <PaymentIntegrationGuide lang={lang} />

              {/* 1. Equipment & Hardware Checklist with Real Prices and Live Budget */}
              <EquipmentChecklist lang={lang} systemMode={systemMode} />

              {/* 2. Interactive Network Architecture & Signal Flow */}
              <NetworkArchitecture lang={lang} systemMode={systemMode} />

              {/* 3. Financial Feasibility & Profit / Break-Even Calculator */}
              <FinancialCalculator lang={lang} systemMode={systemMode} />

              {/* 4. Live Simulated Customer Experience & Captive Portal */}
              <CaptivePortalPreview lang={lang} />

              {/* 5. 6-Stage Implementation Roadmap */}
              <RoadmapSteps lang={lang} />

              {/* 6. Legal, Permits, TCRA & Compliance Guidelines */}
              <LegalAndCompliance lang={lang} />

              {/* 7. Pragmatic FAQs */}
              <FaqSection lang={lang} />
            </>
          )}
        </main>

        {/* Footer */}
        <Footer
          lang={lang}
          onPrint={handlePrint}
          onScrollToTop={scrollToTop}
        />
      </div>
    </HotspotProvider>
  );
}
