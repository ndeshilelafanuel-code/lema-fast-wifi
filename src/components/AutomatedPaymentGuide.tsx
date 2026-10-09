import React, { useState } from 'react';
import { Language } from '../types';
import { LemaLogo } from './common/LemaLogo';
import {
  Smartphone,
  CreditCard,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BellRing
} from 'lucide-react';

interface AutomatedPaymentGuideProps {
  lang: Language;
}

export const AutomatedPaymentGuide: React.FC<AutomatedPaymentGuideProps> = ({ lang }) => {
  // Simulator State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number; duration: string }>({
    id: '1day',
    name: 'Saa 24 / Siku 1',
    price: 1000,
    duration: '24 Hours'
  });
  const [customerPhone, setCustomerPhone] = useState<string>('0653 578 184');
  const [customerPin, setCustomerPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<string>('8492');

  const plans = [
    { id: '2hrs', name: lang === 'sw' ? 'Saa 2 za Haraka' : '2 Hours High-Speed', price: 500, duration: '2 Hours' },
    { id: '1day', name: lang === 'sw' ? 'Saa 24 (Siku 1)' : '24 Hours (Full Day)', price: 1000, duration: '24 Hours' },
    { id: '1week', name: lang === 'sw' ? 'Siku 7 (Wiki 1)' : '7 Days (Weekly Plan)', price: 5000, duration: '7 Days' },
    { id: '1month', name: lang === 'sw' ? 'Siku 30 (Mwezi 1)' : '30 Days (Monthly Plan)', price: 25000, duration: '30 Days' },
  ];

  // Initiate USSD Push simulation
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowUssdPrompt(true);
    }, 700);
  };

  // Submit simulated PIN
  const handleConfirmPin = () => {
    setShowUssdPrompt(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setGeneratedVoucher(Math.floor(1000 + Math.random() * 9000).toString());
      setCurrentStep(3); // success step
    }, 1000);
  };

  const handleResetSimulator = () => {
    setCurrentStep(1);
    setShowUssdPrompt(false);
    setIsProcessing(false);
    setCustomerPin('');
  };

  return (
    <section id="self-service" className="py-16 md:py-20 bg-stone-950 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Mfumo wa Kujihudumia Kiotomatiki' : 'Autonomous Self-Service System'}</span>
            <span aria-hidden="true">·</span>
            <span>STK-Push M-Pesa Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
            {lang === 'sw' ? (
              <>
                Mteja Anavyojihudumia: <span className="text-amber-400">Chagua Kifurushi ➔ Weka Namba ➔ Weka PIN ➔ Unganishwa Papo Hapo!</span>
              </>
            ) : (
              <>
                Autonomous Customer Flow: <span className="text-amber-400">Select Plan ➔ Mobile Number ➔ Enter PIN ➔ Instant Access!</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-base text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Hapa hakuna haja ya mteja kukuamsha usiku au kwenda dukani kutafuta vocha ya karatasi. Mteja anapounganisha WiFi, simu yake inamletea machaguo ya vifurushi, anaweka namba yake ya simu, anapokea ujumbe wa PIN (M-Pesa / Tigo Pesa / Airtel Money), na akishaweka namba yake ya siri, mtandao unawaka kiotomatiki sekunde ile ile!'
              : 'Zero human labor required. Customers select their bundle on the login screen, enter their phone number, confirm the automated USSD PIN prompt on their phone, and get connected instantly.'}
          </p>
        </div>

        {/* Live Simulator & Technical Explanation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Left Column: Interactive Smartphone STK-Push Simulator */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-stone-900 p-4 border-4 border-stone-800 shadow-2xl relative">
              {/* Phone Speaker Notch */}
              <div className="flex justify-center mb-3">
                <div className="w-24 h-3.5 bg-stone-800 rounded-full" />
              </div>

              {/* Screen Area */}
              <div className="bg-stone-50 rounded-[2rem] overflow-hidden p-5 text-stone-900 min-h-[510px] flex flex-col justify-between border border-stone-200 relative">
                {/* Simulated USSD Modal Overlay when STK push arrives */}
                {showUssdPrompt && (
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-in fade-in duration-200">
                    <div className="w-full bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 text-stone-900 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                        <Lock className="w-3.5 h-3.5" />
                        <span>M-Pesa / Mixx by Yas Prompt</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-stone-700 leading-relaxed">
                          Tuma <strong>Tsh {selectedPlan.price.toLocaleString()}</strong> kwenda kwa <strong>JIMMY LEMA</strong> (Lipa Namba 5849201 · LEMA FAST WIFI).
                        </p>
                        <div className="p-1.5 bg-stone-100 rounded text-[10px] text-stone-600">
                          Akaunti Inayopokea: <strong>Jimmy Lema (Wewe Mmiliki)</strong>
                        </div>
                        <p className="text-xs font-semibold text-stone-900 pt-0.5">
                          {lang === 'sw' ? 'Weka Namba ya Siri (PIN):' : 'Enter Secret Mobile PIN:'}
                        </p>
                      </div>

                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={customerPin}
                        onChange={(e) => setCustomerPin(e.target.value)}
                        className="w-full text-center text-lg tracking-widest font-mono py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowUssdPrompt(false)}
                          className="py-2 px-3 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                          {lang === 'sw' ? 'Ghairi (Cancel)' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmPin}
                          className="py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                        >
                          {lang === 'sw' ? 'Thibitisha (Send)' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading / Spinner State */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-20 text-white space-y-3">
                    <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-center">
                      {lang === 'sw' ? 'Inatuma ombi la USSD kwenye simu yako...' : 'Triggering mobile payment prompt...'}
                    </p>
                  </div>
                )}

                {/* Top Status Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pb-3 border-b border-stone-200">
                    <span className="font-mono">10:45 AM</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <span>WiFi: Lema_Fast_WiFi</span>
                    </span>
                  </div>

                  {/* Header Title */}
                  <div className="text-center py-3 flex flex-col items-center">
                    <LemaLogo variant="full" size="sm" theme="light" showSlogan={false} className="mb-1" />
                    <p className="text-[11px] text-stone-500">
                      {lang === 'sw' ? 'Huduma ya Kujihudumia ya Papo Hapo' : 'Instant Self-Service Portal'}
                    </p>
                  </div>

                  {/* STEP 1: Select Package & Enter Phone Number */}
                  {currentStep === 1 && (
                    <form onSubmit={handleInitiatePayment} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">
                          {lang === 'sw' ? '1. Chagua Kifurushi Chako:' : '1. Select Your Plan:'}
                        </label>
                        <div className="space-y-1.5">
                          {plans.map((plan) => {
                            const isSelected = selectedPlan.id === plan.id;
                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan)}
                                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500/10 border-amber-600 text-stone-900 ring-1 ring-amber-500'
                                    : 'bg-white border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                <div>
                                  <p className="text-xs font-bold">{plan.name}</p>
                                  <p className="text-[10px] text-stone-500">Spidi: 2.5 Mbps Unlimited</p>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-800">
                                  Tsh {plan.price.toLocaleString()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-1">
                          {lang === 'sw' ? '2. Weka Namba Yako ya Simu:' : '2. Enter Your Mobile Number:'}
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="0754 xxx xxx / 0712 xxx xxx"
                          className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                        <span className="text-[10px] text-stone-500 mt-1 block">
                          M-Pesa, Mixx by Yas (Tigo Pesa), Airtel Money, au HaloPesa
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{lang === 'sw' ? 'LIPA NA UNGANISHA PAPO HAPO' : 'PAY & CONNECT NOW'}</span>
                      </button>
                    </form>
                  )}

                  {/* STEP 3: Successful Connection & Active Voucher */}
                  {currentStep === 3 && (
                    <div className="space-y-4 py-2">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-bold text-emerald-900">
                          {lang === 'sw' ? 'Hongera! Umefanikiwa Kuunganishwa' : 'Connected Successfully!'}
                        </h4>
                        <p className="text-xs text-emerald-800">
                          {lang === 'sw'
                            ? `Malipo ya Tsh ${selectedPlan.price.toLocaleString()} yamepokelewa.`
                            : `Payment of Tsh ${selectedPlan.price.toLocaleString()} received.`}
                        </p>
                      </div>

                      {/* Active Session Info */}
                      <div className="bg-white rounded-lg p-3 border border-stone-200 text-xs space-y-2">
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-500">{lang === 'sw' ? 'Kifurushi:' : 'Active Plan:'}</span>
                          <span className="font-bold text-stone-900">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-500">{lang === 'sw' ? 'Muda Uliobaki:' : 'Time Remaining:'}</span>
                          <span className="font-mono font-bold text-emerald-700">23h 59m 40s</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-500">{lang === 'sw' ? 'Vocha ya Akiba (SMS):' : 'Backup Code:'}</span>
                          <span className="font-mono font-bold text-amber-800">{generatedVoucher}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">{lang === 'sw' ? 'Kasi ya Mtandao:' : 'Speed:'}</span>
                          <span className="font-mono text-stone-700">2.5 Mbps Down / 1.0 Mbps Up</span>
                        </div>
                      </div>

                      {/* Simulated SMS Notification Preview */}
                      <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-300 text-[11px] text-stone-700 space-y-1">
                        <div className="flex items-center gap-1 font-bold text-stone-900">
                          <BellRing className="w-3 h-3 text-amber-600" />
                          <span>Ujumbe wa SMS Uliotumwa:</span>
                        </div>
                        <p className="italic">
                          "LEMA-WIFI: Asante! Umelipia kifurushi cha {selectedPlan.name}. Nambari yako ya vocha ni {generatedVoucher}."
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetSimulator}
                        className="w-full py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{lang === 'sw' ? 'Jaribu Tena (Test Again)' : 'Test Again'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer text in phone */}
                <div className="pt-2 border-t border-stone-200 text-center text-[10px] text-stone-400">
                  Automated Mobile Money STK-Push Gateway
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-3 text-center">
              {lang === 'sw'
                ? 'Jaribu kuingiza namba na uone jinsi ujumbe wa PIN unavyojitokeza kwenye simu ya mteja!'
                : 'Interactive preview: Enter a phone number and experience the customer PIN prompt.'}
            </p>
          </div>

          {/* Right Column: Step-by-Step Technical Setup */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'sw' ? 'Jinsi Mfumo Huu Unavyofanya Kazi' : 'How the Autonomous Engine Operates'}</span>
              </h3>

              <div className="space-y-3 text-xs text-stone-300">
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Mteja Anachomeka Kwenye WiFi:</strong>
                    Simu yake inafungua ukurasa wa mtandao wako (Captive Portal) unaoonyesha vifurushi vya bei.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Anajaza Namba & Kubonyeza Lipa:</strong>
                    Ukurasa unatuma ombi (API Request) kwenda kwenye Seva ya Malipo (kama Paypack / Beem / Selcom).
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-850 border border-amber-500/30 flex items-start gap-3 ring-1 ring-amber-400/20">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-amber-400 block mb-0.5">STK-Push Inatokea Kwenye Kioo cha Simu Yake:</strong>
                    Simu ya mteja inawaka papo hapo na kumuuliza nambari yake ya siri (PIN). Mteja anathibitisha malipo.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">Seva Inamruhusu Kuingia Mara Moja:</strong>
                    Malipo yakishapokelewa, seva inawasiliana na router ya MikroTik au AP yako kupitia API, inamtengenezea mteja nambari ya vocha na kumuunganisha papo hapo bila wewe kufanya kitu chochote!
                  </div>
                </div>
              </div>
            </div>

            {/* Crucial Technical Secret: Walled Garden */}
            <div className="bg-stone-900 rounded-2xl p-6 border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Siri Kuu ya Kiufundi: "Walled Garden"</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {lang === 'sw'
                  ? 'Kwanini "Walled Garden" ni Muhimu Kwenye Malipo ya Simu?'
                  : 'Why "Walled Garden" Is Crucial for Mobile Payments?'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'sw'
                  ? 'Kumbuka mteja kabla hajanunua vocha HANA intaneti. Ili simu yake iweze kuwasiliana na seva ya M-Pesa / Tigo Pesa na kutuma pesa, router yako au AP lazima iwe na "Walled Garden" (Kurasa zilizoruhusiwa kupita bure bila vocha). Unaruhusu anwani za seva ya malipo pekee (Payment Gateway Domains), ili mteja aweze kulipa bila intaneti kufunguka kwa mambo mengine!'
                  : 'Before buying a voucher, the client has zero internet access. For their phone to communicate with M-Pesa/Tigo API endpoints, your router/AP must whitelist payment domains under the "Walled Garden" IP list.'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Gateways Available in Tanzania / East Africa */}
        <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-white">
              {lang === 'sw' ? 'Watoa Huduma wa Malipo (Payment Gateways) Unaoweza Kutumia:' : 'Recommended Payment Gateways for WiFi Hotspots:'}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'sw'
                ? 'Hawa ndio watoa huduma wanaounganisha mitandao yote ya simu (Vodacom, Tigo, Airtel, Halopesa) na kutuma fedha moja kwa moja kwenye namba yako au benki:'
                : 'Trusted local payment aggregators supporting M-Pesa, Tigo Pesa, Airtel Money, and HaloPesa with instant webhook callbacks:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Chaguo 1: Paypack / Hotspot Integrators</span>
              <h4 className="text-sm font-bold text-white">Paypack / Swahilies</h4>
              <p className="text-xs text-stone-400">
                {lang === 'sw'
                  ? 'Inafaa sana kwa biashara za WiFi Hotspot. Wanatoa template ya ukurasa wa login tayari, unaipakua na kuiweka kwenye MikroTik au AP yako ndani ya dakika 20.'
                  : 'Turnkey hotspot billing engine with pre-styled login templates and automated MikroTik/AP user generation.'}
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-mono">
                Ada ya Muamala: ~1.5% - 2% kwa mauzo
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Chaguo 2: Corporate Aggregator</span>
              <h4 className="text-sm font-bold text-white">Beem Africa / Selcom</h4>
              <p className="text-xs text-stone-400">
                {lang === 'sw'
                  ? 'Kampuni kubwa zilizoidhinishwa na Benki Kuu ya Tanzania (BOT). Zina uwezo mkubwa sana wa API, STK push ya haraka, na fedha zinaenda kwenye akaunti ya benki au Lipa Namba.'
                  : 'Enterprise-grade payment gateway licensed by central banks, handling massive transactional concurrency.'}
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-mono">
                Inahitaji TIN & Usajili wa Biashara
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Chaguo 3: Bure (Zero Budget)</span>
              <h4 className="text-sm font-bold text-white">Android SMS Gateway</h4>
              <p className="text-xs text-stone-400">
                {lang === 'sw'
                  ? 'Unatumia simu ndogo ya Android yenye app ya kusoma SMS za kawaida za M-Pesa. Mteja akilipa kwenye namba yako ya kawaida, simu inatuma uthibitisho kwenye MikroTik na kumpa vocha bure bila ada ya kampuni ya malipo!'
                  : 'Use a spare Android device with SMS gateway listener to verify P2P mobile money alerts with zero aggregator fee.'}
              </p>
              <div className="pt-2 text-[11px] text-amber-400 font-mono">
                Ada: Tsh 0 (Bure)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
