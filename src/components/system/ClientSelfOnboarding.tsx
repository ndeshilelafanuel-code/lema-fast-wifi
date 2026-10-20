import React, { useState } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language, TenantSubscriptionPlan } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import {
  Building2,
  User,
  Phone,
  MapPin,
  Radio,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Wallet
} from 'lucide-react';

interface ClientSelfOnboardingProps {
  lang: Language;
  onBackToHome: () => void;
  onOpenDashboard: () => void;
}

export const ClientSelfOnboarding: React.FC<ClientSelfOnboardingProps> = ({
  lang,
  onBackToHome,
  onOpenDashboard
}) => {
  const { addTenant, switchTenant } = useHotspot();

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [locationCity, setLocationCity] = useState('Dar es Salaam');
  const [locationArea, setLocationArea] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [routerType, setRouterType] = useState<'mikrotik' | 'omada' | 'ruijie' | 'generic'>('mikrotik');
  const [selectedPlan, setSelectedPlan] = useState<TenantSubscriptionPlan>('pro');
  const [payoutMethod, setPayoutMethod] = useState<'lipa_namba' | 'bank' | 'mobile_phone'>('lipa_namba');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [accountOwnerName, setAccountOwnerName] = useState('');

  // Post registration state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!businessName.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      setFormError('Tafadhali jaza jina la biashara, jina lako, na namba ya simu/WhatsApp.');
      return;
    }

    const planFees: Record<TenantSubscriptionPlan, { fee: number; name: string; routers: number; users: number }> = {
      starter: { fee: 30000, name: 'Starter Tier (Hotspot 1)', routers: 1, users: 50 },
      pro: { fee: 50000, name: 'Business Pro Tier (Hotspot 3)', routers: 3, users: 200 },
      enterprise: { fee: 100000, name: 'Enterprise Tier (Matawi Mengi)', routers: 10, users: 1000 }
    };

    const targetPlan = planFees[selectedPlan];
    const now = new Date();
    // 14 days free trial for self-registered clients
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 3600 * 1000);

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || `wifi-${Date.now().toString().slice(-4)}`;

    const newTenantPayload = {
      subdomain: slug,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      locationCity,
      locationArea: locationArea.trim() || 'Katikati ya Mji',
      brandColor: '#cca43b',
      tagline: 'Internet ya Kasi & Vocha Nafuu',
      routerType,
      routerIpOrHost: '192.168.88.1',
      payoutAccount: payoutAccount.trim() || ownerPhone.trim(),
      payoutMethod,
      accountOwnerName: accountOwnerName.trim() || ownerName.trim(),
      subscription: {
        id: `sub-${Date.now()}`,
        plan: selectedPlan,
        planName: targetPlan.name,
        monthlyFee: targetPlan.fee,
        status: 'trial' as const, // Automatically starts with 14-day risk-free trial!
        startDate: now.toISOString().split('T')[0],
        nextBillingDate: trialEndDate.toISOString().split('T')[0],
        daysRemaining: 14,
        autoRenew: true,
        maxRouters: targetPlan.routers,
        maxConcurrentUsers: targetPlan.users,
        lastPaymentDate: now.toISOString().split('T')[0],
        lastPaymentRef: `TRIAL-${Math.floor(100000 + Math.random() * 900000)}`
      },
      settings: {
        hotspotName: wifiSsid.trim() || `${businessName.trim()} Fast WiFi`,
        tagline: 'Internet ya Kasi ya Fiber & Starlink',
        supportPhone: ownerPhone.trim(),
        currency: 'TZS' as const,
        paymentGateway: 'paypack' as const,
        merchantNumber: payoutAccount.trim() || ownerPhone.trim(),
        accountOwnerName: accountOwnerName.trim() || ownerName.trim(),
        payoutMethod,
        payoutAccount: payoutAccount.trim() || ownerPhone.trim(),
        payoutBankName: 'M-Pesa / Tigo Pesa / Selcom',
        payoutFrequency: 'instant' as const,
        packages: [
          { id: 'p1', name: 'Saa 2', price: 500, durationHours: 2, speedDownload: '2M', speedUpload: '1M' },
          { id: 'p2', name: 'Saa 24', price: 1000, durationHours: 24, speedDownload: '3M', speedUpload: '1M', isPopular: true },
          { id: 'p3', name: 'Siku 7', price: 5000, durationHours: 168, speedDownload: '4M', speedUpload: '2M' }
        ],
        adminUsername: slug.toLowerCase() || 'owner',
        adminPassword: 'password123'
      }
    };

    if (addTenant) {
      addTenant(newTenantPayload);
    }

    setCreatedTenantData({
      ...newTenantPayload,
      id: `tenant-${slug}`,
      slug
    });

    setIsSubmitted(true);
  };

  const generateMikrotikQuickScript = (slug: string, biz: string) => {
    return `/ip hotspot profile
set [ find default=yes ] html-directory=flash/hotspot login-by=http-chap,mac-cookie
add dns-name="${slug}.lemawifi.co.tz" hotspot-address=192.168.88.1 html-directory=flash/hotspot \\
    http-cookie-lifetime=1d name="${slug}_Profile" radius-accounting=yes use-radius=yes
/radius
add address=cloud.lemawifi.co.tz authentication-port=1812 accounting-port=1813 \\
    comment="Lema SaaS Cloud Server - ${biz}" secret="LemaSaaS2026_${slug}" service=hotspot timeout=3000ms
/system identity set name="${biz.replace(/[^a-zA-Z0-9]/g, '_')}_WiFi"`;
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleLaunchDashboard = () => {
    if (createdTenantData && switchTenant) {
      switchTenant(createdTenantData.id);
    }
    onOpenDashboard();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Rudi Nyuma</span>
          </button>

          <LemaLogo variant="full" size="sm" theme="dark" showSlogan={false} />
        </div>

        {!isSubmitted ? (
          <>
            {/* Header / Value Proposition */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold">
                <Gift className="w-3.5 h-3.5" />
                <span>Majaribio ya Bure ya Siku 14 (14-Day Risk-Free Trial)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Jisajili kama Mmiliki wa Hotspot
              </h1>

              <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
                Anza kugeuza intaneti ya biashara yako (Mkahawa, Hotel, Saluni, Baa, Stendi au Mtaani) kuwa chanzo cha pesa ya kila siku kwa M-Pesa na Mixx by Yas. <strong className="text-white">Bila kulipa chochote leo!</strong>
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <span className="text-base">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}
              {/* SECTION 1: BUSINESS & OWNER INFO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-stone-800 pb-2">
                  <Building2 className="w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    1. Taarifa za Biashara Yako
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Jina la Biashara / Hotspot Yako *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mfano: Victoria Hotel, Sinza Kahawa Point, Kibo Lounge"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (!wifiSsid) setWifiSsid(`${e.target.value} WiFi`);
                      }}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Jina Lako Kamili (Mmiliki / Meneja) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mfano: John Mwita"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Namba ya Simu / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="07XXXXXXXX au 06XXXXXXXX"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Jina la Wi-Fi Utakalorusha (SSID)</label>
                    <input
                      type="text"
                      placeholder="Mfano: Victoria_Hotel_Fast_WiFi"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Mji / Mkoa</label>
                    <select
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Dar es Salaam">Dar es Salaam</option>
                      <option value="Arusha">Arusha</option>
                      <option value="Mwanza">Mwanza</option>
                      <option value="Dodoma">Dodoma</option>
                      <option value="Mbeya">Mbeya</option>
                      <option value="Morogoro">Morogoro</option>
                      <option value="Tanga">Tanga</option>
                      <option value="Zanzibar">Zanzibar</option>
                      <option value="Moshi / Kilimanjaro">Moshi / Kilimanjaro</option>
                      <option value="Mkoa Mwingine">Mkoa Mwingine</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Eneo / Mtaa</label>
                    <input
                      type="text"
                      placeholder="Mfano: Sinza Mori, Kariakoo, Njiro"
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: HARDWARE SELECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sky-400 border-b border-stone-800 pb-2">
                  <Radio className="w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    2. Kifaa Unachotaka Kuunganisha (Router / Access Point)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'mikrotik',
                      title: 'MikroTik RouterOS',
                      sub: 'Inapendekezwa zaidi (hEX, hAP, RB750, Cloud Core)',
                      badge: 'Inayotumika Zaidi'
                    },
                    {
                      id: 'omada',
                      title: 'TP-Link Omada SDN',
                      sub: 'EAP225-Outdoor, EAP110, Controller',
                      badge: 'Outdoor Wi-Fi'
                    },
                    {
                      id: 'ruijie',
                      title: 'Ruijie Reyee Cloud',
                      sub: 'RG-RAP6201, Reyee Cloud Routers',
                      badge: 'Cloud Sync'
                    }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRouterType(r.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        routerType === r.id
                          ? 'bg-sky-500/10 border-sky-400 text-white shadow-md shadow-sky-500/10'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-white text-xs block">{r.title}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: SUBSCRIPTION PLAN WITH 14-DAY FREE TRIAL */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-stone-800 pb-2">
                  <Zap className="w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    3. Chagua Kifurushi Chako cha Mfumo
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'starter',
                      name: 'Starter Plan',
                      fee: 'Tsh 30,000 / mwezi',
                      capacity: 'Router 1 · Hadi Wateja 50',
                      desc: 'Inafaa kwa Saluni ndogo, Cafe, au duka la mtaani.'
                    },
                    {
                      id: 'pro',
                      name: 'Business Pro',
                      fee: 'Tsh 50,000 / mwezi',
                      capacity: 'Hadi Router 3 · Wateja 200',
                      popular: true,
                      desc: 'Inafaa kwa Hotel, Baa, Stendi au Mtaa wenye watu wengi.'
                    },
                    {
                      id: 'enterprise',
                      name: 'Enterprise Tier',
                      fee: 'Tsh 100,000 / mwezi',
                      capacity: 'Hadi Router 10 · Wateja 1,000',
                      desc: 'Inafaa kwa ISP wa Mtaa, Vyuo, au Matawi mengi.'
                    }
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id as any)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedPlan === p.id
                          ? 'bg-purple-900/20 border-purple-400 text-white shadow-xl shadow-purple-500/10'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Inayopendwa Zaidi
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-white text-sm font-bold">{p.name}</strong>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPlan === p.id ? 'border-purple-400 bg-purple-500' : 'border-stone-700'
                          }`}>
                            {selectedPlan === p.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-mono font-bold text-xs">{p.fee}</p>
                        <p className="text-[11px] text-stone-300 font-semibold">{p.capacity}</p>
                        <p className="text-[10px] text-stone-400 leading-relaxed">{p.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800/80 text-[10px] text-amber-300 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Siku 14 za Majaribio ya Bure Zimejumuishwa!</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: PAYOUT ACCOUNT - WHERE REVENUE GOES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-stone-800 pb-2">
                  <Wallet className="w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    4. Wapi Mapato Yako ya Vocha Yataingia? (Pesa Zako Moja kwa Moja)
                  </h2>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl text-xs space-y-1 text-emerald-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pesa Zote Zinaingia Kwenye Akaunti Yako Mwenyewe</span>
                  </p>
                  <p className="text-[11px] text-stone-300">
                    Mteja anaponunua vocha ya Tsh 500 au Tsh 1,000 kupitia M-Pesa au Mixx by Yas, fedha zinakwenda moja kwa moja kwenye Lipa Namba au Namba yako iliyopo hapa chini bila kupitia kwa mtu yeyote:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Aina ya Akaunti ya Kupokea Pesa</label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="lipa_namba">Lipa Namba (Vodacom / Mixx by Yas Till)</option>
                      <option value="mobile_phone">Namba ya Simu Binafsi (M-Pesa / Tigo Pesa)</option>
                      <option value="bank">Akaunti ya Benki (CRDB, NMB)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Namba ya Lipa au Simu *</label>
                    <input
                      type="text"
                      placeholder="Mfano: 581290 au 07XXXXXXXX"
                      value={payoutAccount}
                      onChange={(e) => setPayoutAccount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold block">Jina Lililosajiliwa Kwenye Namba Hiyo</label>
                    <input
                      type="text"
                      placeholder="Mfano: Kibo Cafe / Jimmy Lema"
                      value={accountOwnerName}
                      onChange={(e) => setAccountOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-stone-800 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kamilisha Usajili & Anza Siku 14 Bure Sasa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-stone-400 text-center">
                  Kwa kubonyeza kitufe hiki, unakubali kuanza majaribio ya bure ya mfumo wa Lema Fast WiFi kwa siku 14 bila masharti ya malipo ya awali.
                </p>
              </div>
            </form>
          </>
        ) : (
          /* REGISTRATION SUCCESS & PROVISIONING SCREEN */
          <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Hongera sana, {createdTenantData?.ownerName}!
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
                Akaunti ya <strong className="text-emerald-400">{createdTenantData?.businessName}</strong> imetengenezwa kikamilifu kwenye Wingu (Cloud SaaS). 
                Majaribio yako ya <strong className="text-amber-400">Siku 14 za Bure</strong> yameanza rasmi leo!
              </p>
            </div>

            {/* Quick Credentials Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans">Lango la Mteja (Subdomain):</span>
                <strong className="text-sky-400 block truncate">
                  {createdTenantData?.slug}.lemawifi.co.tz
                </strong>
                <span className="text-[9px] text-stone-400 font-sans">Ukurasa wa kuuzia vocha mtaani</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans">Hali ya Leseni (Status):</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Trial Active (Siku 14)
                </span>
                <span className="text-[9px] text-stone-400 font-sans block">Bili ya kwanza: Baada ya wiki 2</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans">Lipa Namba ya Mapato:</span>
                <strong className="text-amber-400 block font-mono">
                  {createdTenantData?.payoutAccount}
                </strong>
                <span className="text-[9px] text-stone-400 font-sans">Pesa zote zinaingia hapa</span>
              </div>
            </div>

            {/* MikroTik Auto Script Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span>Script ya Kuunganisha Router Yako (Copy & Paste)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Fungua WinBox kwenye MikroTik yako, bonyeza **New Terminal**, kisha paste script hii:
                  </p>
                </div>

                <button
                  onClick={() => handleCopyScript(generateMikrotikQuickScript(createdTenantData?.slug, createdTenantData?.businessName))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Imenakiliwa!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nakili Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                {generateMikrotikQuickScript(createdTenantData?.slug, createdTenantData?.businessName)}
              </pre>
            </div>

            {/* Next Steps Buttons */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Rudi Ukurasa Mkuu
              </button>

              <button
                onClick={handleLaunchDashboard}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Fungua Dashibodi Yangu Sasa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
