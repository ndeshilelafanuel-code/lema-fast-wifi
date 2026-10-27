import React, { useState } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import {
  Language,
  HotspotTenant,
  TenantSubscriptionStatus,
  TenantSubscriptionPlan
} from '../../types';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  RotateCw,
  Copy,
  Check,
  FileText,
  Printer,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Server,
  Radio,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Briefcase,
  Layers,
  Sliders,
  Calendar,
  Lock,
  Download,
  Share2
} from 'lucide-react';
import { LemaLogo } from '../common/LemaLogo';

interface SaasResellerModuleProps {
  lang: Language;
  onOpenCustomerPortal?: () => void;
  onBackToDashboard?: () => void;
  onOpenSelfOnboarding?: () => void;
}

export const SaasResellerModule: React.FC<SaasResellerModuleProps> = ({
  lang,
  onOpenCustomerPortal,
  onBackToDashboard,
  onOpenSelfOnboarding
}) => {
  const {
    tenants = [],
    addTenant,
    updateTenant,
    deleteTenant,
    renewTenantSubscription,
    toggleTenantStatus,
    switchTenant
  } = useHotspot();

  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'due' | 'suspended' | 'trial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantForContract, setSelectedTenantForContract] = useState<HotspotTenant | null>(null);
  const [selectedTenantForScript, setSelectedTenantForScript] = useState<HotspotTenant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'calculator' | 'pitch' | 'sla'>('tenants');

  // Calculator State
  const [calcClients, setCalcClients] = useState<number>(20);
  const [calcMonthlyFee, setCalcMonthlyFee] = useState<number>(50000); // 50k TZS/mo

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [calcVpsCost, setCalcVpsCost] = useState<number>(25000); // 25k TZS/mo VPS (Hetzner/DO)
  const [calcSmsCostPerClient, setCalcSmsCostPerClient] = useState<number>(3000); // 3k TZS SMS

  // New Tenant Form State
  const [newBizName, setNewBizName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newCity, setNewCity] = useState('Dar es Salaam');
  const [newArea, setNewArea] = useState('');
  const [newRouterType, setNewRouterType] = useState<'omada' | 'ruijie' | 'gateway' | 'generic'>('omada');
  const [newPlan, setNewPlan] = useState<TenantSubscriptionPlan>('pro');

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesFilter =
      filterTab === 'all' || t.subscription.status === filterTab;
    const matchesSearch =
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.locationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Calculate MRR & Stats
  const activeTenants = tenants.filter(
    (t) => t.subscription.status === 'active' || t.subscription.status === 'due'
  );
  const totalMrr = activeTenants.reduce((sum, t) => sum + t.subscription.monthlyFee, 0);
  const projectedArr = totalMrr * 12;
  const dueTenantsCount = tenants.filter((t) => t.subscription.status === 'due').length;
  const suspendedCount = tenants.filter((t) => t.subscription.status === 'suspended').length;
  const trialCount = tenants.filter((t) => t.subscription.status === 'trial').length;

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newOwnerName.trim() || !newOwnerPhone.trim()) {
      showToast('Tafadhali jaza jina la biashara, jina la mmiliki na namba ya simu.', 'error');
      return;
    }

    const planFees: Record<TenantSubscriptionPlan, { fee: number; name: string; routers: number; users: number }> = {
      starter: { fee: 30000, name: 'Starter Tier (Hotspot 1)', routers: 1, users: 50 },
      pro: { fee: 50000, name: 'Business Pro Tier (Hotspot 3)', routers: 3, users: 200 },
      enterprise: { fee: 100000, name: 'Enterprise Tier (Matawi Mengi)', routers: 10, users: 1000 }
    };

    const targetPlan = planFees[newPlan];
    const now = new Date();
    const nextDate = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    const slug = newBizName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);

    if (addTenant) {
      addTenant({
        subdomain: slug || `client-${Date.now()}`,
        businessName: newBizName.trim(),
        ownerName: newOwnerName.trim(),
        ownerPhone: newOwnerPhone.trim(),
        locationCity: newCity,
        locationArea: newArea.trim() || 'Katikati ya Mji',
        brandColor: '#cca43b',
        tagline: 'Internet ya Kasi & Vocha Nafuu',
        routerType: newRouterType,
        routerIpOrHost: '192.168.88.1',
        payoutAccount: newOwnerPhone.trim(),
        payoutMethod: 'lipa_namba',
        accountOwnerName: newOwnerName.trim(),
        subscription: {
          id: `sub-${Date.now()}`,
          plan: newPlan,
          planName: targetPlan.name,
          monthlyFee: targetPlan.fee,
          status: 'active',
          startDate: now.toISOString().split('T')[0],
          nextBillingDate: nextDate.toISOString().split('T')[0],
          daysRemaining: 30,
          autoRenew: true,
          maxRouters: targetPlan.routers,
          maxConcurrentUsers: targetPlan.users,
          lastPaymentDate: now.toISOString().split('T')[0],
          lastPaymentRef: `SUB${84920194}TZ`
        },
        settings: {
          hotspotName: newBizName.trim(),
          tagline: 'Internet ya Kasi ya Fiber & Starlink',
          supportPhone: newOwnerPhone.trim(),
          currency: 'TZS',
          paymentGateway: 'paypack',
          merchantNumber: newOwnerPhone.trim(),
          accountOwnerName: newOwnerName.trim(),
          payoutMethod: 'lipa_namba',
          payoutAccount: newOwnerPhone.trim(),
          payoutBankName: 'M-Pesa / Tigo Pesa',
          payoutFrequency: 'instant',
          packages: [
            { id: 'p1', name: 'Saa 2', price: 500, durationHours: 2, speedDownload: '2M', speedUpload: '1M' },
            { id: 'p2', name: 'Saa 24', price: 1000, durationHours: 24, speedDownload: '3M', speedUpload: '1M', isPopular: true },
            { id: 'p3', name: 'Siku 7', price: 5000, durationHours: 168, speedDownload: '4M', speedUpload: '2M' }
          ],
          adminUsername: 'admin',
          adminPassword: 'password123',
          smsProvider: 'beem',
          smsSenderId: 'HOTSPOT',
          smsApiKey: 'key_demo',
          smsSecretKey: 'sec_demo',
          enableExpirySms: true,
          expiryWarningMinutes: 15,
          expirySmsTemplate: 'Bando lako linakaribia kwisha. Nunua jipya sasa!',
          enableLowBalanceSms: false,
          lowBalanceThresholdMb: 50,
          lowBalanceSmsTemplate: '',
          enablePurchaseReceiptSms: true,
          purchaseReceiptSmsTemplate: 'Asante kwa kununua vocha: {VOCHA_CODE}',
          enableAutoMacLogin: true,
          enableQrCameraScanner: true,
          enableAntiAbuseTrial: true,
          trialDurationMinutes: 10,
          trialCooldownHours: 24,
          enableWhatsAppVoucherDelivery: true
        }
      });
    }

    setShowAddModal(false);
    setNewBizName('');
    setNewOwnerName('');
    setNewOwnerPhone('');
    setNewArea('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const generateGatewayScript = (tenant: HotspotTenant) => {
    const cloudUrl = window.location.origin;
    return `# ====================================================================
# LEMA FAST WIFI - CLOUD SAAS CLIENT ONBOARDING SCRIPT
# Hotspot Client: ${tenant.businessName} (${tenant.ownerName})
# Tenant ID: ${tenant.id} | Router: ${tenant.routerType.toUpperCase()}
# ====================================================================

# 1. Hotspot Profile inayoelekeza kwenye Cloud Portal
dns-name: "hotspot.${tenant.subdomain}.local"
hotspot-address: 192.168.0.1
rate-limit: "10M/10M"

# 2. Ruhusu Walled Garden kwa M-Pesa, Tigo Pesa, na Cloud Portal
allowed-hosts:
  - "${window.location.hostname}"
  - "*.vodacom.co.tz"
  - "*.tigo.co.tz"
  - "*.airtel.co.tz"
  - "*.halotel.co.tz"

# 3. Pakua faili za kisasa za login.html kutoka Cloud Server
portal-url: "${cloudUrl}/portal?tenant=${tenant.id}"
auth-endpoint: "${cloudUrl}/api/gateway/authorize"
`;
  };

  // Profit calculation logic
  const grossMonthlyRevenue = calcClients * calcMonthlyFee;
  const totalVariableSmsCost = calcClients * calcSmsCostPerClient;
  const netMonthlyProfit = grossMonthlyRevenue - (calcVpsCost + totalVariableSmsCost);
  const annualNetProfit = netMonthlyProfit * 12;

  return (
    <div className="space-y-6 text-stone-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-purple-950/80 to-stone-900 border border-purple-500/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold tracking-wide border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>SUPER-ADMIN & SAAS RESELLER SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Uza Mfumo kwa Usajili wa Kila Mwezi</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-400 text-stone-950 font-black">
                RESELLER
              </span>
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              Simamia wateja wako wanaonunua mfumo wa Hotspot, fuatilia nani amelipa na nani hajalipa kila mwezi, zima/washa router kiotomatiki, toa mikataba ya kisheria (SLA), na kusanya ada za mwezi kwa M-Pesa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Sajili Mteja Mpya</span>
            </button>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-sm border border-stone-700 transition-all cursor-pointer"
              >
                <span>Rudi Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-fadeIn ${
            toast.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : toast.type === 'info'
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top-Level MRR & Business Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR */}
        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Mapato ya Kila Mwezi (MRR)</p>
            <p className="text-xl sm:text-2xl font-black text-white">
              Tsh {totalMrr.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>ARR: Tsh {projectedArr.toLocaleString()} kwa mwaka</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active Clients */}
        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Wateja Wanaolipa (Hotspots)</p>
            <p className="text-xl sm:text-2xl font-black text-white">
              {activeTenants.length} <span className="text-xs text-stone-400 font-normal">kati ya {tenants.length}</span>
            </p>
            <p className="text-[11px] text-purple-300 font-medium">
              {trialCount > 0 ? `${trialCount} wapo kwenye Free Trial` : 'Wote wako thabiti'}
            </p>
          </div>
        </div>

        {/* Card 3: Due for Payment */}
        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Wanaodaiwa Mwezi Huu</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400">
              {dueTenantsCount} <span className="text-xs text-stone-400 font-normal">wateja</span>
            </p>
            <p className="text-[11px] text-stone-400 font-medium">
              Siku 3 za neema kabla ya kusitisha
            </p>
          </div>
        </div>

        {/* Card 4: Suspended / Inactive */}
        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Waliositishwa (Hawajalipa)</p>
            <p className="text-xl sm:text-2xl font-black text-rose-400">
              {suspendedCount} <span className="text-xs text-stone-400 font-normal">wateja</span>
            </p>
            <p className="text-[11px] text-rose-300 font-medium">
              Portal yao imefungwa kiotomatiki
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-700/80 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'tenants'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Orodha ya Wateja & Leseni ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Vifurushi vya Leseni (Pricing Tiers)</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'calculator'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kikokotoo cha Faida ya SaaS</span>
        </button>

        <button
          onClick={() => setActiveTab('pitch')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pitch'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Mbinu za Kupata Wateja Mtaani</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sla'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mkataba wa Huduma (SLA Generator)</span>
        </button>
      </div>

      {/* 4. CONTENT SECTIONS */}

      {/* TAB 1: TENANTS LIST & MANAGEMENT */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Public Self-Onboarding Link Banner for Clients */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-stone-900 to-stone-900 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                  Ukurasa wa Kujisajili Wenyewe (Client Self-Service Onboarding)
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Wape wateja wako wapya link hii wajisajili wenyewe mtandaoni na kuanza majaribio ya <strong className="text-amber-400">Siku 14 Bure</strong>:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <code className="px-2.5 py-1 rounded-lg bg-stone-950 border border-purple-500/30 text-[11px] font-mono text-purple-300">
                  https://lemawifi.co.tz/join
                </code>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    'Habari! Jiunge na mfumo wa kisasa wa Lema Fast WiFi kuuza intaneti ya Hotspot kwenye biashara yako (Hotel, Cafe, Saluni, Baa, Stendi au Mtaani) na kupokea malipo kwa M-Pesa. Anza majaribio ya Siku 14 Bure hapa: https://lemawifi.co.tz/join'
                  );
                  setCopiedPublicLink(true);
                  setTimeout(() => setCopiedPublicLink(false), 2500);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold border border-stone-700 transition-all cursor-pointer"
              >
                {copiedPublicLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Imenakiliwa!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nakili Link ya WhatsApp</span>
                  </>
                )}
              </button>

              {onOpenSelfOnboarding && (
                <button
                  type="button"
                  onClick={onOpenSelfOnboarding}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Angalia Ukurasa Wao (Preview)</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-800/60 p-3 rounded-xl border border-stone-700">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Wote', count: tenants.length },
                  { id: 'active', label: 'Waliolipa', count: activeTenants.length - dueTenantsCount },
                  { id: 'due', label: 'Wanaodaiwa', count: dueTenantsCount },
                  { id: 'trial', label: 'Free Trial', count: trialCount },
                  { id: 'suspended', label: 'Waliositishwa', count: suspendedCount },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-stone-300 hover:bg-stone-700/60'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta jina, namba, eneo..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tenants Table / Cards */}
          <div className="space-y-3">
            {filteredTenants.length === 0 ? (
              <div className="p-12 text-center bg-stone-800/40 rounded-2xl border border-stone-700/50">
                <Building2 className="w-12 h-12 text-stone-500 mx-auto mb-3" />
                <p className="text-base font-bold text-stone-300">Hakuna mteja aliyepatikana</p>
                <p className="text-xs text-stone-500 mt-1">
                  Badilisha kichujio au bonyeza "Sajili Mteja Mpya" kuanza.
                </p>
              </div>
            ) : (
              filteredTenants.map((tenant) => {
                const sub = tenant.subscription;
                const statusStyles: Record<
                  TenantSubscriptionStatus,
                  { bg: string; text: string; label: string; icon: any }
                > = {
                  active: {
                    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                    text: 'text-emerald-400',
                    label: 'Amelipa (Active)',
                    icon: CheckCircle2
                  },
                  due: {
                    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                    text: 'text-amber-400',
                    label: 'Madai ya Mwezi (Due)',
                    icon: AlertTriangle
                  },
                  suspended: {
                    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
                    text: 'text-rose-400',
                    label: 'Amezimwa (Suspended)',
                    icon: Ban
                  },
                  trial: {
                    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                    text: 'text-blue-400',
                    label: 'Jaribio (Free Trial)',
                    icon: Clock
                  }
                };

                const currentStatus = statusStyles[sub.status];
                const StatusIcon = currentStatus.icon;

                return (
                  <div
                    key={tenant.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-800/80 border border-stone-700/70 hover:border-purple-500/40 transition-all shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5 min-w-[280px]">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base sm:text-lg font-black text-white">
                            {tenant.businessName}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentStatus.bg}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{currentStatus.label}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300">
                          <span>
                            Mmiliki: <strong className="text-white">{tenant.ownerName}</strong>
                          </span>
                          <span>
                            Simu: <strong className="text-amber-400">{tenant.ownerPhone}</strong>
                          </span>
                          <span>
                            Eneo: <span className="text-stone-400">{tenant.locationArea}, {tenant.locationCity}</span>
                          </span>
                          <span>
                            Router: <span className="font-mono text-purple-300 uppercase">{tenant.routerType}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle: Subscription Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-900/80 p-3 rounded-xl border border-stone-700/60 text-xs">
                        <div>
                          <p className="text-[10px] text-stone-400">Kifurushi / Ada</p>
                          <p className="font-bold text-white">
                            Tsh {sub.monthlyFee.toLocaleString()}
                            <span className="text-[10px] text-stone-400">/mwezi</span>
                          </p>
                          <p className="text-[10px] text-purple-400 uppercase font-semibold">{sub.plan}</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-stone-400">Tarehe ya Malipo</p>
                          <p className="font-bold text-amber-300">{sub.nextBillingDate}</p>
                          <p className="text-[10px] text-stone-400">
                            {sub.daysRemaining > 0
                              ? `Zimebaki siku ${sub.daysRemaining}`
                              : 'Muda umepita!'}
                          </p>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-stone-400">Uwezo wa Mfumo</p>
                          <p className="font-bold text-stone-200">
                            Hadi Routers {sub.maxRouters}
                          </p>
                          <p className="text-[10px] text-emerald-400">
                            Watumiaji {sub.maxConcurrentUsers}+
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 0. View Client Dashboard */}
                        <button
                          onClick={() => {
                            if (switchTenant) {
                              switchTenant(tenant.id);
                            }
                            if (onBackToDashboard) {
                              onBackToDashboard();
                            }
                          }}
                          title={`Fungua Dashboard ya ${tenant.businessName} (Tazama kama Mteja)`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition-all cursor-pointer shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
                          <span>Fungua Dashboard Yake</span>
                        </button>

                        {/* 1. Generate Router Script */}
                        <button
                          onClick={() => setSelectedTenantForScript(tenant)}
                          title="Tengeneza Script ya Router ya Cloud Hotspot"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-purple-400" />
                          <span>Script ya Router</span>
                        </button>

                        {/* 2. Record Payment / Renew 30 Days */}
                        <button
                          onClick={() => {
                            if (renewTenantSubscription) {
                              renewTenantSubscription(tenant.id, 1);
                              showToast(`Malipo ya mwezi yamerekodiwa kwa ${tenant.businessName}! Leseni imeongezwa siku 30 mbele.`, 'success');
                            }
                          }}
                          title="Rekodi malipo ya ada ya mwezi"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Weka Malipo (Siku +30)</span>
                        </button>

                        {/* 3. Toggle Suspend / Active */}
                        <button
                          onClick={() => {
                            if (toggleTenantStatus) {
                              toggleTenantStatus(tenant.id);
                            }
                          }}
                          title={sub.status === 'suspended' ? 'Washa Hotspot' : 'Zima Hotspot kwa kutolipa'}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            sub.status === 'suspended'
                              ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
                              : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60'
                          }`}
                        >
                          {sub.status === 'suspended' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Washa Hotspot</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Sitisha (Zima)</span>
                            </>
                          )}
                        </button>

                        {/* 4. WhatsApp Billing Reminder */}
                        <a
                          href={`https://wa.me/255${tenant.ownerPhone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                            `Habari ndugu ${tenant.ownerName} (${tenant.businessName}), hii ni taarifa ya ada ya mfumo wako wa Hotspot WiFi kwa mwezi unaoanza tarehe ${sub.nextBillingDate}. Ada ni Tsh ${sub.monthlyFee.toLocaleString()}. Tafadhali fanya malipo mapema ili kuepuka usumbufu wa mfumo kujifunga. Asante!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 transition-all cursor-pointer"
                          title="Tuma Ujumbe wa WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {/* 5. SLA Agreement */}
                        <button
                          onClick={() => setSelectedTenantForContract(tenant)}
                          title="Fungua Mkataba wa SLA"
                          className="p-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: PRICING PLANS & LICENSE TIERS */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Explanation Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-stone-900 to-stone-900 border border-purple-500/40 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400 tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Muundo wa Bei za Leseni za Kila Mwezi (SaaS Pricing Blueprint)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Vifurushi 3 Unavyowatoza Wamiliki wa Hotspot Kila Mwezi
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Hizi ndizo ada za usajili wa programu (**Monthly Recurring Fee**) unazotoza kwa wamiliki wa biashara (Mkahawa, Hotel, Saluni, Baa, Stendi au Mtaani) ili mtandao wao uendelee kuwa hewani kwenye Wingu (Cloud). <strong className="text-amber-400">Pesa hizi ni mapato yako binafsi ya uendeshaji</strong>, tofauti kabisa na vocha za kawaida za Tsh 500 au Tsh 1,000 wanazouziwa wateja wa mtaani.
            </p>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Starter Tier */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider">
                    Starter Tier
                  </span>
                  <span className="text-stone-400 text-xs">Hotspot 1</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Tsh 30,000</span>
                    <span className="text-xs text-stone-400">/ kwa mwezi</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Inafaa kwa Saluni ndogo, Vinyozi, Migahawa midogo, au vibanda vya huduma.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-stone-800 text-xs">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Inasaidia <strong>Router / AP 1</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Hadi <strong>Wateja 50</strong> waliounganishwa</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Captive Portal yenye nembo ya mteja</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Malipo ya M-Pesa & Tigo Pesa moja kwa moja</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Kutengeneza na kuprint vocha</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewPlan('starter');
                  setShowAddModal(true);
                }}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs transition-all cursor-pointer border border-stone-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sajili Mteja Kwenye Starter</span>
              </button>
            </div>

            {/* 2. Business Pro Tier (Featured) */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-purple-950/30 border-2 border-purple-500 flex flex-col justify-between space-y-6 shadow-2xl shadow-purple-500/10">
              <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                Inayopendwa Zaidi ⭐
              </span>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-wider">
                    Business Pro
                  </span>
                  <span className="text-purple-300 text-xs font-semibold">Hadi Router 3</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Tsh 50,000</span>
                    <span className="text-xs text-stone-400">/ kwa mwezi</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Inafaa kwa Hoteli, Baa, Lounge, Stendi, Mabasi, Hosteli, na Maeneo ya Watu Wengi.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-stone-800 text-xs">
                  <div className="flex items-center gap-2 text-stone-200 font-semibold">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Inasaidia hadi <strong>Router / APs 3</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-200 font-semibold">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Hadi <strong>Wateja 200</strong> kwa wakati mmoja</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Anti-Tethering Engine</strong> (kuzuia wateja ku-share bando)</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>WhatsApp Billing Alerts</strong> (Vikumbusho vya bili kiotomatiki)</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Smart Bandwidth & FUP (kuzuia mtandao kukwama)</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cloud Daily Backup & Ripoti za Mwezi</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewPlan('pro');
                  setShowAddModal(true);
                }}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sajili Mteja Kwenye Pro (Tsh 50k)</span>
              </button>
            </div>

            {/* 3. Enterprise Tier */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider">
                    Enterprise Tier
                  </span>
                  <span className="text-stone-400 text-xs">Matawi Mengi</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Tsh 100,000</span>
                    <span className="text-xs text-stone-400">/ kwa mwezi</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Inafaa kwa WISP wa Mtaa, Vyuo, Minara, na Makampuni yenye Matawi mengi.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-stone-800 text-xs">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Inasaidia hadi <strong>Router / Minara 10</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Hadi <strong>Wateja 1,000+</strong> kwa wakati mmoja</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-Site Central Controller & Roaming</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom Domain (mf. wifi.hotel.co.tz)</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mkataba wa SLA wenye Usaidizi wa Saa 24/7</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewPlan('enterprise');
                  setShowAddModal(true);
                }}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs transition-all cursor-pointer border border-stone-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sajili Mteja Kwenye Enterprise</span>
              </button>
            </div>
          </div>

          {/* Quick FAQ / Summary Info */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sheria na Masharti ya Bili za Kila Mwezi (Billing Rules)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-stone-400 text-[11px] leading-relaxed">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 space-y-1">
                <strong className="text-white block font-sans">1. Siku 14 za Majaribio (Free Trial):</strong>
                Mteja mpya akijiunga, anapewa siku 14 za bure ili athibitishe kuwa mfumo unafanya kazi na pesa zinaingia kabla ya kutoa ada ya kwanza.
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 space-y-1">
                <strong className="text-white block font-sans">2. Siku 3 za Neema (Grace Period):</strong>
                Tarehe ya bili ikifika na mteja asipolipa, mfumo unampa siku 3 za maongezi huku ukimtumia ukumbusho wa WhatsApp kila asubuhi.
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 space-y-1">
                <strong className="text-white block font-sans">3. Kusitisha Huduma (Auto-Suspend):</strong>
                Mteja asipolipa baada ya siku za neema, lango lake la captive portal linajifunga na kumuonyesha ujumbe wa kufanya malipo ya leseni.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAAS PROFIT & REVENUE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Kikokotoo cha Mapato na Faida Halisi ya SaaS (Recurring Income)</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Kadiria kiwango cha faida utakayopata kila mwezi kulingana na idadi ya wateja unaowauzia mfumo huu mtaani.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Number of Clients */}
              <div className="space-y-2 bg-stone-900/60 p-4 rounded-xl border border-stone-700/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-semibold">Idadi ya Wateja (Hotspots):</span>
                  <span className="text-purple-400 font-black text-sm">{calcClients} Wateja</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={calcClients}
                  onChange={(e) => setCalcClients(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>1 Mteja</span>
                  <span>50 Wateja</span>
                  <span>100 Wateja</span>
                </div>
              </div>

              {/* Slider 2: Monthly Fee per Client */}
              <div className="space-y-2 bg-stone-900/60 p-4 rounded-xl border border-stone-700/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-semibold">Ada ya Mwezi kwa Mteja:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    Tsh {calcMonthlyFee.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="100000"
                  step="5000"
                  value={calcMonthlyFee}
                  onChange={(e) => setCalcMonthlyFee(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Tsh 20,000</span>
                  <span>Tsh 50,000</span>
                  <span>Tsh 100,000</span>
                </div>
              </div>

              {/* Slider 3: Cloud VPS Hosting Cost */}
              <div className="space-y-2 bg-stone-900/60 p-4 rounded-xl border border-stone-700/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-semibold">Gharama ya Cloud Server (VPS):</span>
                  <span className="text-amber-400 font-black text-sm">
                    Tsh {calcVpsCost.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="100000"
                  step="5000"
                  value={calcVpsCost}
                  onChange={(e) => setCalcVpsCost(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Tsh 15,000 ($6)</span>
                  <span>Tsh 50,000</span>
                  <span>Tsh 100,000</span>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown Result */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-stone-900 to-emerald-950/80 border border-purple-500/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-stone-400">Mapato Ghafi (Gross Revenue)</p>
                <p className="text-2xl font-black text-white mt-1">
                  Tsh {grossMonthlyRevenue.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">kila mwezi</p>
              </div>

              <div>
                <p className="text-xs text-stone-400">Gharama za Kuendesha (Costs)</p>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  Tsh {(calcVpsCost + totalVariableSmsCost).toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">VPS + SMS za wateja</p>
              </div>

              <div>
                <p className="text-xs text-emerald-300 font-bold">Faida Halisi ya Mwezi (Net Profit)</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  Tsh {netMonthlyProfit.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-300 mt-0.5">faida safi mfukoni mwako</p>
              </div>

              <div>
                <p className="text-xs text-amber-300 font-bold">Makadirio ya Mwaka (Annual)</p>
                <p className="text-3xl font-black text-amber-400 mt-1">
                  Tsh {annualNetProfit.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200 mt-0.5">kipato cha kudumu kila mwaka</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PITCH SCRIPTS & SALES STRATEGY */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <span>Mbinu na Maeneo ya Kupata Wateja wa Kuwauzia Mfumo Huu</span>
            </h2>
            <p className="text-xs text-stone-300">
              Hapa kuna maeneo 5 makuu yenye wateja wanaotafuta mfumo huu na jinsi ya kuongea nao (Pitch Script):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Pitch 1: Hosteli za Wanafunzi */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Hosteli za Wanafunzi wa Vyuo</span>
                </div>
                <p className="text-xs text-stone-300">
                  <strong>Tatizo lao:</strong> Mmiliki wa hosteli amelipia Fiber au Starlink lakini haingizi hela, na wanafunzi wanabanana bila udhibiti wa spidi.
                </p>
                <div className="p-2.5 rounded-lg bg-stone-800 text-[11px] text-amber-300 italic">
                  "Mzee, badala ya kulipia intaneti peke yako kila mwezi, tukuwekee mfumo wa kisasa wa vocha na M-Pesa. Kila mwanafunzi atajilipia mwenyewe Tsh 500 au 1,000 kwa siku. Utafunika gharama ya bili na kubaki na faida ya zaidi ya laki 5 kila mwezi!"
                </div>
              </div>

              {/* Pitch 2: Saluni na Vinyozi vya Kisasa */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Saluni za Kike na Vinyozi (Barbershops)</span>
                </div>
                <p className="text-xs text-stone-300">
                  <strong>Tatizo lao:</strong> Wateja wanakaa masaa 2 wakisubiri huduma lakini hawawezi kutumia intaneti kwa usalama.
                </p>
                <div className="p-2.5 rounded-lg bg-stone-800 text-[11px] text-amber-300 italic">
                  "Wateja wako wanaweza kupata intaneti ya bure kwa dakika 10 za kwanza, kisha wanaanza kulipia Tsh 500 kwa masaa 2. Pia portal inatangaza huduma zako za saluni moja kwa moja kwenye simu zao!"
                </div>
              </div>

              {/* Pitch 3: Baa, Lounge na Migahawa */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Baa, Lounge & Migahawa (Sports Bars)</span>
                </div>
                <p className="text-xs text-stone-300">
                  <strong>Tatizo lao:</strong> Watu wanaomba password ya WiFi ya bure na kukaa siku nzima wakipakua sinema bila kuagiza vinywaji vya kutosha.
                </p>
                <div className="p-2.5 rounded-lg bg-stone-800 text-[11px] text-amber-300 italic">
                  "Ondoa kero ya kugawa password ya WiFi kwa kila mtu. Weka mfumo huu wa kisasa: Mteja anayeagiza chakula anapewa vocha ya bure, na mwingine yeyote anajilipia kwa M-Pesa papo hapo."
                </div>
              </div>

              {/* Pitch 4: Vituo vya Mabasi na Masoko */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
                  <span>Stendi za Mabasi, Vituo vya Daladala na Masoko</span>
                </div>
                <p className="text-xs text-stone-300">
                  <strong>Fursa:</strong> Eneo lenye mzunguko mkubwa wa watu wanaosubiri usafiri na wanaohitaji bando la bei nafuu la haraka.
                </p>
                <div className="p-2.5 rounded-lg bg-stone-800 text-[11px] text-amber-300 italic">
                  "Hapa stendi watu wanatumia intaneti masaa yote. Tukiweka antenna ya masafa marefu na mfumo huu, tutakuwa tunauza vocha 300+ kwa siku za Tsh 500 na Tsh 1,000 moja kwa moja bila msimamizi!"
                </div>
              </div>
            </div>

            {/* Free Trial Tip */}
            <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold text-sm">Mbinu ya Dhahabu: Wape Siku 14 za Bure (Risk-Free Trial)</strong>
                Usimwambie mteja alipe ada ya mfumo mara ya kwanza. Mwambie: *"Nitakuwekea mfumo huu bure kwa siku 14. Ukiona mauzo yameingia vizuri, ndipo utaanza kulipa ada yangu ya Tsh 30,000 au 50,000 kwa mwezi unaofuata."* Asilimia 95% ya wateja huendelea kwa sababu wanaona pesa ikiingia kwenye simu zao kila siku!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE LEVEL AGREEMENT (SLA) CONTRACT GENERATOR */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Mkataba wa Makubaliano ya Kutoa Huduma ya Mfumo (SLA Template)</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Mkataba rasmi wa kisheria unaompa mteja wako ulinzi, unaoeleza wajibu wa kila upande na utaratibu wa ada ya kila mwezi.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha Mkataba (Print / PDF)</span>
              </button>
            </div>

            {/* Contract Body Document */}
            <div className="p-8 rounded-2xl bg-white text-stone-900 space-y-6 font-serif shadow-xl print:p-0 print:shadow-none">
              <div className="text-center border-b border-stone-300 pb-4">
                <h3 className="text-xl font-black tracking-tight uppercase font-sans text-stone-900">
                  MKATABA WA MAKUBALIANO YA KUTOA NA KUSIMAMIA MFUMO WA HOTSPOT WIFI (SAAS)
                </h3>
                <p className="text-xs font-sans text-stone-600 mt-1">
                  (SERVICE LEVEL AGREEMENT & SOFTWARE SUBSCRIPTION CONTRACT)
                </p>
              </div>

              <div className="text-xs space-y-3 font-sans leading-relaxed text-stone-800">
                <p>
                  Mkataba huu unafanyika siku ya leo kati ya:
                </p>
                <div className="p-3 rounded-lg bg-stone-100 border border-stone-300 space-y-1">
                  <p><strong>UPANDE WA KWANZA (MTOA HUDUMA YA MFUMO):</strong> LEMA TECHNOLOGIES / MSAFI WA MFUMO (Hapa ataitwa "Mtoa Huduma")</p>
                  <p><strong>UPANDE WA PILI (MMILIKI WA HOTSPOT / MTEJA):</strong> [Jina la Mmiliki / Biashara] (Hapa ataitwa "Mteja")</p>
                </div>

                <h4 className="font-bold text-stone-900 font-sans uppercase pt-2">1. LENGO LA MKATABA</h4>
                <p>
                  Mtoa Huduma anakubali kutoa leseni ya matumizi ya mfumo wa wingu (Cloud Hotspot Portal & Billing Engine), kusanidi router ya Mteja, kuwezesha ukusanyaji wa malipo ya kidijitali (M-Pesa, Tigo Pesa, Airtel Money, Halopesa) na utoaji wa vocha za intaneti kwa wateja wa eneo la Mteja.
                </p>

                <h4 className="font-bold text-stone-900 font-sans uppercase pt-2">2. WAJIBU WA MTOA HUDUMA</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Kuhakikisha mfumo wa wingu (Cloud Portal) unakuwa hewani kwa kiwango cha 99.5% kila mwezi.</li>
                  <li>Kutoa msaada wa kiufundi (Technical Support) pindi mfumo unapotokea changamoto ya kiufundi.</li>
                  <li>Kufanya maboresho ya kiusalama (Security Updates) na kulinda mfumo dhidi ya majaribio ya udukuzi au wizi wa bando.</li>
                  <li>Kutoa ripoti kamili za miamala ya kila siku na kila mwezi kwa mteja.</li>
                </ul>

                <h4 className="font-bold text-stone-900 font-sans uppercase pt-2">3. WAJIBU WA MTEJA (MMILIKI WA HOTSPOT)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Kununua na kulinda usalama wa vifaa vyake halisi (Gateway Router, Access Points, nyaya, na umeme thabiti).</li>
                  <li>Kulipia kifurushi cha intaneti kutoka kwa kampuni ya simu au ISP (TTCL, Zuku, Starlink, n.k.) kwenye eneo lake.</li>
                  <li>Kulipa ada ya leseni ya mfumo ya kila mwezi kabla au ifikapo tarehe ya makubaliano.</li>
                </ul>

                <h4 className="font-bold text-stone-900 font-sans uppercase pt-2">4. ADA YA MWEZI NA UTARATIBU WA KUSITISHA HUDUMA</h4>
                <p>
                  Mteja atalipa ada iliyokubaliwa ya <strong>Tsh 30,000 / 50,000 / 100,000</strong> kila mwezi. Ikitokea mteja hajalipia ada hiyo ndani ya siku tatu (3) za neema tangu tarehe ya bili kuiva, mfumo una haki ya kujizima kiotomatiki (Auto-Suspension) hadi pale malipo yatakapofanyika.
                </p>

                <h4 className="font-bold text-stone-900 font-sans uppercase pt-2">5. USIRI NA ULINZI WA DATA</h4>
                <p>
                  Pande zote zinakubaliana kulinda taarifa za namba za simu na miamala ya wateja wa mwisho kwa mujibu wa Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania ya mwaka 2022.
                </p>

                {/* Signatures Block */}
                <div className="pt-8 grid grid-cols-2 gap-8 border-t border-stone-300">
                  <div className="space-y-4">
                    <p className="font-bold">KWA NIABA YA MTOA HUDUMA:</p>
                    <p className="text-stone-500 text-[11px]">Saini: ___________________________</p>
                    <p className="text-stone-500 text-[11px]">Jina: Jimmy Lema</p>
                    <p className="text-stone-500 text-[11px]">Tarehe: _____ / _____ / 2026</p>
                    <p className="text-stone-500 text-[11px]">Muhuri: [ LEMA FAST WIFI ]</p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-bold">KWA NIABA YA MTEJA (HOTSPOT OWNER):</p>
                    <p className="text-stone-500 text-[11px]">Saini: ___________________________</p>
                    <p className="text-stone-500 text-[11px]">Jina: ___________________________</p>
                    <p className="text-stone-500 text-[11px]">Tarehe: _____ / _____ / 2026</p>
                    <p className="text-stone-500 text-[11px]">Simu: ___________________________</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODALS */}

      {/* MODAL 1: ADD NEW CLIENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Sajili Mteja Mpya wa Hotspot (SaaS)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">Jina la Biashara / Hotspot</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Posta WiFi au Sokoni Hotspot"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Jina la Mmiliki</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Juma Rashid"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Namba ya Simu (M-Pesa)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Mfano: 0754 123 456"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Jiji / Mkoa</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Mbeya">Mbeya</option>
                    <option value="Morogoro">Morogoro</option>
                    <option value="Tanga">Tanga</option>
                    <option value="Zanzibar">Zanzibar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Eneo / Mtaa</label>
                  <input
                    type="text"
                    placeholder="Mfano: Sinza Mori, Njiro"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Aina ya Router</label>
                  <select
                    value={newRouterType}
                    onChange={(e) => setNewRouterType(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs"
                  >
                    <option value="omada">TP-Link Omada SDN (Inayopendekezwa)</option>
                    <option value="gateway">Core Gateway Router</option>
                    <option value="ruijie">Ruijie Reyee Cloud Gateway</option>
                    <option value="generic">Generic Router / Captive Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Kifurushi cha Leseni</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs"
                  >
                    <option value="starter">Starter - Tsh 30,000 / mwezi (Router 1)</option>
                    <option value="pro">Pro - Tsh 50,000 / mwezi (Hadi Router 3)</option>
                    <option value="enterprise">Enterprise - Tsh 100,000 / mwezi (Matawi Mengi)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Sajili & Tengeneza Leseni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ROUTER PROVISIONING SCRIPT */}
      {selectedTenantForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Radio className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Script ya Router ya {selectedTenantForScript.businessName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTenantForScript(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300">
              Nakili (*copy*) script hii ya router kisha i-paste kwenye Terminal ya router ya mteja. Router itaunganishwa papo hapo na Cloud SaaS:
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                {generateGatewayScript(selectedTenantForScript)}
              </pre>

              <button
                onClick={() => copyToClipboard(generateGatewayScript(selectedTenantForScript))}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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

            <div className="pt-2 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedTenantForScript(null)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SLA CONTRACT FOR A SPECIFIC TENANT */}
      {selectedTenantForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Mkataba wa {selectedTenantForContract.businessName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTenantForContract(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Contract Body with filled data */}
            <div className="p-6 rounded-xl bg-white text-stone-900 space-y-4 font-sans text-xs leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="text-center border-b pb-3">
                <h4 className="font-black text-sm uppercase">
                  MKATABA WA HUDUMA YA MFUMO WA HOTSPOT (SLA)
                </h4>
                <p className="text-[11px] text-stone-600">
                  Mkataba Na: LEMA-SLA-{selectedTenantForContract.id.slice(-6).toUpperCase()}
                </p>
              </div>

              <p>
                Mkataba huu unafanyika siku ya leo kati ya <strong>LEMA TECHNOLOGIES</strong> (Mtoa Huduma) na{' '}
                <strong>{selectedTenantForContract.businessName}</strong>, akiwakilishwa na{' '}
                <strong>{selectedTenantForContract.ownerName}</strong>, Simu: {selectedTenantForContract.ownerPhone}, Eneo:{' '}
                {selectedTenantForContract.locationArea}, {selectedTenantForContract.locationCity} (Mteja).
              </p>

              <div className="p-3 bg-stone-100 rounded-lg space-y-1">
                <p><strong>Kifurushi:</strong> {selectedTenantForContract.subscription.planName}</p>
                <p><strong>Ada ya Kila Mwezi:</strong> Tsh {selectedTenantForContract.subscription.monthlyFee.toLocaleString()}</p>
                <p><strong>Tarehe ya Bili:</strong> Tarehe {selectedTenantForContract.subscription.nextBillingDate} ya kila mwezi</p>
                <p><strong>Aina ya Router:</strong> {selectedTenantForContract.routerType.toUpperCase()}</p>
              </div>

              <p>
                Mtoa Huduma atatoa leseni ya mfumo wa wingu (Cloud Hotspot Portal), kuhakikisha huduma ipo hewani 99.5%, kusimamia muunganisho wa M-Pesa, na kutoa msaada wa kiufundi. Mteja anawajibika kulipia intaneti ya fiber/Starlink yake na kulipa ada ya leseni ya kila mwezi.
              </p>

              <div className="pt-6 grid grid-cols-2 gap-6 border-t">
                <div>
                  <p className="font-bold">MTOA HUDUMA:</p>
                  <p className="text-stone-500 mt-6">Saini & Muhuri: Jimmy Lema</p>
                </div>
                <div>
                  <p className="font-bold">MTEJA ({selectedTenantForContract.ownerName}):</p>
                  <p className="text-stone-500 mt-6">Saini: ____________________</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Hifadhi kama PDF</span>
              </button>

              <button
                onClick={() => setSelectedTenantForContract(null)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
