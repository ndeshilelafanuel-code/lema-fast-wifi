import React, { useState } from 'react';
import { Language } from '../types';
import { LemaLogo } from './common/LemaLogo';
import { Smartphone, Wifi, CheckCircle2, Ticket, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface CaptivePortalPreviewProps {
  lang: Language;
}

export const CaptivePortalPreview: React.FC<CaptivePortalPreviewProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'mobile' | 'trial'>('voucher');
  const [voucherCode, setVoucherCode] = useState<string>('9482');
  const [phoneNumber, setPhoneNumber] = useState<string>('0653 578 184');
  const [selectedPlan, setSelectedPlan] = useState<string>('1day');
  const [simulatedStatus, setSimulatedStatus] = useState<string | null>(null);

  const handleConnectVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setSimulatedStatus(
      lang === 'sw'
        ? `Umefanikiwa kuunganishwa! Vocha ya "${voucherCode}" inafanya kazi (Masaa 24 yamesalia).`
        : `Connected successfully! Voucher "${voucherCode}" active (24 hours remaining).`
    );
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedStatus(
      lang === 'sw'
        ? `Ujumbe wa malipo (USSD Push) umetumwa kwenda ${phoneNumber}. Baada ya kuweka PIN, mtandao utawaka kiotomatiki!`
        : `USSD STK-Push sent to ${phoneNumber}. Enter your Mobile Money PIN to activate instant access!`
    );
  };

  const handleFreeTrial = () => {
    setSimulatedStatus(
      lang === 'sw'
        ? 'Majaribio ya dakika 15 yameanza! Furahia intaneti ya kasi.'
        : '15-minute free trial session initiated! Enjoy high-speed surfing.'
    );
  };

  return (
    <section className="py-16 md:py-20 bg-stone-100 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Educational Text */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
              <span>04. Uzoefu wa Mteja</span>
              <span aria-hidden="true">·</span>
              <span>Captive Portal Experience</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 text-balance">
              {lang === 'sw'
                ? 'Jinsi Mteja Anavyoingia Kwenye WiFi Yako'
                : 'How Customers Experience Your Street WiFi'}
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {lang === 'sw'
                ? 'Wateja hawapewi nenosiri la kawaida (kama 12345678). Badala yake, mtandao wako hauna nenosiri la mwanzo (Open WiFi), lakini pindi wanapounganisha, simu yao inafungua Ukurasa wa Kuingia (Captive Portal) papo hapo.'
                : 'Customers never share a single static password. Instead, the WiFi broadcast is open without initial encryption, but upon connection, their smartphone automatically launches your branded captive login screen.'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-stone-200 shadow-xs">
                <Ticket className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    {lang === 'sw' ? 'Njia 1: Vocha za Karatasi Mtaani' : 'Option 1: Printed Street Vouchers'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {lang === 'sw'
                      ? 'Maduka ya jirani huuza vikaratasi vya vocha (namba 4 au msimbo wa QR). Mteja anaweka namba na mtandao unafunguka.'
                      : 'Neighborhood retail kiosks sell physical scratch vouchers with 4-digit codes or QR scans.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-stone-200 shadow-xs">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    {lang === 'sw' ? 'Njia 2: Malipo ya Moja kwa Moja ya Simu' : 'Option 2: Direct Mobile Money (M-Pesa)'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {lang === 'sw'
                      ? 'Mteja analipa mwenyewe kwa M-Pesa, Mixx by Yas, au Airtel Money. Simu inapokea taarifa na kumuunganisha bila msaada wa mtu yeyote.'
                      : 'Customers purchase access autonomously via integrated mobile money USSD push without any manual intervention.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Mobile Phone Screen */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-stone-900 p-4 border-4 border-stone-800 shadow-2xl">
              {/* Phone Speaker Notch */}
              <div className="flex justify-center mb-3">
                <div className="w-24 h-4 bg-stone-800 rounded-full" />
              </div>

              {/* Screen Area */}
              <div className="bg-stone-50 rounded-[2rem] overflow-hidden p-5 text-stone-900 min-h-[460px] flex flex-col justify-between border border-stone-200">
                <div>
                  {/* Top Bar of phone */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pb-3 border-b border-stone-200">
                    <span className="font-mono">10:42 AM</span>
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-amber-600" />
                      <strong>Lema_Fast_WiFi</strong>
                    </span>
                  </div>

                  {/* Brand Branding in Portal */}
                  <div className="text-center py-4 flex flex-col items-center">
                    <LemaLogo variant="full" size="sm" theme="light" showSlogan={true} className="mb-2" />
                    <p className="text-[11px] text-stone-500 font-medium">
                      {lang === 'sw' ? 'Unganisha Intaneti ya Kasi ya 4G/Fiber' : 'Connect to High Speed Fiber WiFi'}
                    </p>
                  </div>

                  {/* Segmented Mode Selector */}
                  <div className="flex items-center gap-1 p-1 bg-stone-200 rounded-lg text-xs font-semibold mb-4">
                    <button
                      onClick={() => {
                        setActiveTab('voucher');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        activeTab === 'voucher'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Weka Vocha' : 'Voucher'}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('mobile');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        activeTab === 'mobile'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Lipa kwa Simu' : 'Pay Mobile'}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('trial');
                        setSimulatedStatus(null);
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        activeTab === 'trial'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'sw' ? 'Bure' : 'Trial'}
                    </button>
                  </div>

                  {/* Mode 1: Voucher Form */}
                  {activeTab === 'voucher' && (
                    <form onSubmit={handleConnectVoucher} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">
                          {lang === 'sw' ? 'Nambari ya Vocha (Voucher Code):' : 'Voucher Code:'}
                        </label>
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Mfano: 8492"
                          className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg text-stone-900 bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {lang === 'sw' ? 'UNGANISHA MTANDAO' : 'CONNECT TO INTERNET'}
                      </button>
                    </form>
                  )}

                  {/* Mode 2: Mobile Money Form */}
                  {activeTab === 'mobile' && (
                    <form onSubmit={handleSimulatePayment} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">
                          {lang === 'sw' ? 'Chagua Kifurushi:' : 'Select Package:'}
                        </label>
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg text-stone-900 bg-white"
                        >
                          <option value="2hrs">Saa 2 (2 Hours) - Tsh 500</option>
                          <option value="1day">Saa 24 (1 Day) - Tsh 1,000</option>
                          <option value="1week">Siku 7 (1 Week) - Tsh 5,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">
                          {lang === 'sw' ? 'Namba ya Simu (M-Pesa / Mixx by Yas / Airtel):' : 'Phone Number:'}
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="0754 xxx xxx"
                          className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg text-stone-900 bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {lang === 'sw' ? 'LIPA NA UNGANISHA PAPO HAPO' : 'PAY & CONNECT INSTANTLY'}
                      </button>
                    </form>
                  )}

                  {/* Mode 3: Free Trial */}
                  {activeTab === 'trial' && (
                    <div className="space-y-3 text-center py-2">
                      <p className="text-xs text-stone-600">
                        {lang === 'sw'
                          ? 'Pata dakika 15 za bure kupima spidi ya mtandao wetu kabla hujanunua kifurushi!'
                          : 'Get 15 complimentary minutes to test our high-speed network before purchasing!'}
                      </p>
                      <button
                        onClick={handleFreeTrial}
                        className="w-full py-2.5 px-4 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {lang === 'sw' ? 'ANZA DAKIKA 15 BURE' : 'START 15 FREE MINUTES'}
                      </button>
                    </div>
                  )}

                  {/* Live Simulation Alert */}
                  {simulatedStatus && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{simulatedStatus}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200 text-center text-[10px] text-stone-400">
                  Powered by MikroTik & Mikhmon Engine
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
