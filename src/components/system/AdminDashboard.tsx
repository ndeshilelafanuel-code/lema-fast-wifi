import React, { useState, useEffect } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language, Voucher, ActiveSession, PaymentTransaction } from '../../types';
import {
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  Plus,
  Printer,
  Terminal,
  Settings,
  Trash2,
  Copy,
  Check,
  Radio,
  Wifi,
  Clock,
  Shield,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Building,
  Wallet,
  CreditCard,
  ArrowRight,
  Lock,
  BadgeCheck,
  Code2,
  Activity,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  Bell,
  BellRing,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  CheckCircle2,
  Info,
  ShieldAlert,
  CheckCheck,
  Filter,
  FileText,
  Download,
  Percent,
  Megaphone,
  UserCheck,
  Tv,
  MessageSquare,
  Bot,
  ListFilter,
  QrCode
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { VoucherPrintSheet } from './VoucherPrintSheet';
import { MikrotikScriptModal } from './MikrotikScriptModal';
import { SmsTemplateConfigPanel } from './SmsTemplateConfigPanel';
import { DailySummaryReportModal } from './DailySummaryReportModal';
import { BillingModule } from './BillingModule';
import { CustomerPortal } from './CustomerPortal';
import { LemaAiSuite } from './LemaAiSuite';
import { QrEquipmentScannerModal, ScannedEquipment } from './QrEquipmentScannerModal';
import { InventoryModule } from './InventoryModule';
import { AntiTetheringManager } from './AntiTetheringManager';
import { WhatsAppBotSuite } from './WhatsAppBotSuite';
import { LemaLogo } from '../common/LemaLogo';

export interface SystemAlert {
  id: string;
  type: 'bandwidth' | 'payment_failed' | 'payment_success' | 'system' | 'security';
  severity: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    phone?: string;
    amount?: number;
    bandwidthUsage?: string;
    ip?: string;
  };
}

interface SessionRowProps {
  session: ActiveSession;
  onDisconnect: (id: string) => void;
}

const SessionRow: React.FC<SessionRowProps> = ({ session, onDisconnect }) => {
  const [downSpeed, setDownSpeed] = useState<number>(() => Math.random() * 5 + 1.2);
  const [upSpeed, setUpSpeed] = useState<number>(() => Math.random() * 0.8 + 0.15);
  const [uptimeStr, setUptimeStr] = useState<string>('');

  useEffect(() => {
    // Fluctuate download/upload speeds like a real live connection
    const interval = setInterval(() => {
      setDownSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 2; // -1 to +1 Mbps
        const next = Math.max(0.1, prev + delta);
        return next > 25 ? 12 : next; // Cap max speed
      });
      setUpSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 0.3; // -0.15 to +0.15 Mbps
        const next = Math.max(0.05, prev + delta);
        return next > 3 ? 1.1 : next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateUptime = () => {
      const diffMs = Date.now() - new Date(session.connectedAt).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      
      let str = '';
      if (hours > 0) str += `${hours}h `;
      str += `${mins}m ${secs}s`;
      setUptimeStr(str);
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    return () => clearInterval(interval);
  }, [session.connectedAt]);

  // Determine total data cap based on package
  const getDataCapMB = (pkgName: string) => {
    const lower = pkgName.toLowerCase();
    if (lower.includes('2 za') || lower.includes('2h') || lower.includes('saa 2')) return 1500; // 1.5 GB
    if (lower.includes('24') || lower.includes('1day') || lower.includes('siku 1')) return 5000; // 5 GB
    if (lower.includes('siku 7') || lower.includes('wiki 1') || lower.includes('1week')) return 25000; // 25 GB
    return 10000; // 10 GB Default
  };

  const capMB = getDataCapMB(session.packageName);
  const usedMB = session.bytesDown / 1024 / 1024;
  const usagePercent = Math.min(100, Math.round((usedMB / capMB) * 100));
  const isHighUsage = usagePercent >= 80;

  return (
    <tr className="hover:bg-stone-850/30 border-b border-stone-850 transition-colors">
      {/* Voucher Code & Status */}
      <td className="p-4 font-mono font-bold text-amber-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{session.voucherCode}</span>
        </div>
      </td>

      {/* IP & MAC Addresses */}
      <td className="p-4">
        <div className="space-y-0.5">
          <div className="text-sky-400 font-bold font-mono">{session.ipAddress}</div>
          <div className="text-[10px] text-stone-500 font-mono uppercase">{session.macAddress}</div>
        </div>
      </td>

      {/* Connection Uptime */}
      <td className="p-4 font-sans text-stone-300">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <span className="text-[9px] uppercase bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded font-sans">Uptime</span>
            <span>{uptimeStr}</span>
          </div>
          <div className="text-[10px] text-stone-400">Inaisha: {new Date(session.expiresAt).toLocaleTimeString()}</div>
        </div>
      </td>

      {/* Package Info */}
      <td className="p-4 font-sans text-stone-200">
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-white">{session.packageName}</div>
          <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/30 w-fit">
            Limit: {session.speedLimit}
          </div>
        </div>
      </td>

      {/* Live Bandwidth Speedometer (Flactuating like Dennis's Bitwave video) */}
      <td className="p-4 font-mono">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 text-stone-300 text-xs font-bold">
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="text-[10px] text-stone-500">↓</span>
              <span>{downSpeed.toFixed(1)} Mbps</span>
            </div>
            <div className="flex items-center gap-1 text-sky-400">
              <span className="text-[10px] text-stone-500 font-bold">↑</span>
              <span>{upSpeed.toFixed(2)} Mbps</span>
            </div>
          </div>
          {/* Visual Mini Equalizer */}
          <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
              const randHeight = Math.floor(Math.random() * 100);
              return (
                <div 
                  key={bar} 
                  style={{ height: `${Math.max(15, randHeight)}%` }} 
                  className={`w-1 rounded-t-sm transition-all duration-300 ${isHighUsage ? 'bg-rose-500' : 'bg-emerald-500/70'}`}
                />
              );
            })}
          </div>
        </div>
      </td>

      {/* Package Data Progress Bar with red glowing alert */}
      <td className="p-4 font-sans text-xs">
        <div className="space-y-1.5 max-w-[150px]">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-stone-300 font-bold">{(usedMB / 1024).toFixed(2)} GB</span>
            <span className="text-stone-400">/ {(capMB / 1024).toFixed(1)} GB</span>
          </div>
          
          <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-850">
            <div 
              style={{ width: `${usagePercent}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${
                isHighUsage 
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold ${isHighUsage ? 'text-rose-400 animate-pulse' : 'text-stone-400'}`}>
              {usagePercent}% used
            </span>
            {isHighUsage && (
              <span className="text-[9px] bg-rose-500/20 border border-rose-500/40 px-1 py-0.2 rounded font-bold text-rose-300 animate-bounce uppercase">
                Karibu kuisha!
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Action to disconnect */}
      <td className="p-4">
        <button
          onClick={() => onDisconnect(session.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-500 hover:text-white border border-rose-800 hover:border-rose-600 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>KATA INTANETI</span>
        </button>
      </td>
    </tr>
  );
};

interface AdminDashboardProps {
  lang: Language;
  onOpenCustomerPortal: () => void;
  onOpenApiGuide?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  onOpenCustomerPortal,
  onOpenApiGuide,
  onLogout,
}) => {
  const {
    settings,
    updateSettings,
    vouchers,
    transactions,
    activeSessions,
    generateVouchers,
    deleteVoucher,
    disconnectSession,
    resetDemoData,
    currentClientSession,
  } = useHotspot();

  // Active navigation tab (matching exactly RodLink and Wotefy modules!)
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'lema_ai'
    | 'wakala'
    | 'customers'
    | 'settings'
    | 'vouchers'
    | 'pppoe'
    | 'hotspot_portal'
    | 'adverts'
    | 'sessions'
    | 'users_devices'
    | 'routers'
    | 'aps'
    | 'sites'
    | 'equipment'
    | 'inventory'
    | 'invoices'
    | 'transactions'
    | 'notifications'
    | 'payout'
    | 'chat'
    | 'whatsapp_bot'
    | 'binding'
    | 'anti_tethering'
    | 'ssid_lan'
    | 'saas_management'
  >('dashboard');

  const [selectedPkgForGen, setSelectedPkgForGen] = useState<string>(settings.packages[1]?.id || settings.packages[0]?.id);
  const [generateCount, setGenerateCount] = useState<number>(25);
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'unused' | 'active'>('all');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Wotefy custom styling presets for Captive Portal Preview
  const [selectedApFilter, setSelectedApFilter] = useState<string>('all');
  const [portalThemePreset, setPortalThemePreset] = useState<'wotefy' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'minimal'>('wotefy');
  const [portalCardDesign, setPortalCardDesign] = useState<'clay' | 'grid' | 'halo' | 'lagoon' | 'linen' | 'lumen' | 'boutique' | 'showcase'>('clay');
  const [portalWelcomeMessage, setPortalWelcomeMessage] = useState<string>('Vyovyote mteja anavyopenda: intaneti ya kasi zaidi bila usumbufu.');
  const [portalBusinessName, setPortalBusinessName] = useState<string>(settings.hotspotName || 'Lema Fast WiFi');
  const [captiveSubTab, setCaptiveSubTab] = useState<'brand' | 'style' | 'legal' | 'save_preview'>('brand');
  const [useCustomPortal, setUseCustomPortal] = useState<boolean>(true);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState<boolean>(false);
  const [confirmClearSessions, setConfirmClearSessions] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  // Wotefy Interactive Chat & Auto-Reply state variables
  const [isChatAutoReplyOn, setIsChatAutoReplyOn] = useState<boolean>(true);
  const [autoReplyMessageText, setAutoReplyMessageText] = useState<string>('Tafadhali subiri kidogo, Msimamizi atajibu hivi punde au bando lako litafunguka pindi muamala utakapokamilika.');
  const [selectedChatMessageId, setSelectedChatMessageId] = useState<string>('');
  const [chatConversations, setChatConversations] = useState<any[]>([]);

  // Wotefy Bypass MAC Bindings state variables
  const [macBindings, setMacBindings] = useState<any[]>([]);
  const [newBindMacAddress, setNewBindMacAddress] = useState<string>('');
  const [newBindDeviceName, setNewBindDeviceName] = useState<string>('');
  const [newBindPackageId, setNewBindPackageId] = useState<string>(settings.packages[1]?.id || settings.packages[0]?.id);

  // SSID & LAN configuration variables
  const [wifiSsidName, setWifiSsidName] = useState<string>(settings.hotspotName || 'Lema Fast WiFi');
  const [wifiFrequencyBand, setWifiFrequencyBand] = useState<string>('2.4GHz & 5GHz (Dual Band)');
  const [wifiClientIsolation, setWifiClientIsolation] = useState<boolean>(true);

  // New modules interactive states
  const [wakalas, setWakalas] = useState<any[]>([]);
  const [newWakalaName, setNewWakalaName] = useState('');
  const [newWakalaLocation, setNewWakalaLocation] = useState('');
  const [newWakalaComm, setNewWakalaCommission] = useState(10);

  const [pppoeUsers, setPppoeSecrets] = useState<any[]>([]);
  const [newPppoeUser, setNewPppoeUser] = useState('');
  const [newPppoePass, setNewPppoePass] = useState('');
  const [newPppoeProfile, setNewPppoeProfile] = useState('Home_5Mbps');

  const [adverts, setAdverts] = useState<any[]>([]);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSponsor, setNewAdSponsor] = useState('');

  // Interactive Routers & Access Points States (RodLink Style)
  const [routers, setRouters] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lema_wifi_routers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'r-1',
        name: 'Lema Core Gateway',
        type: 'TP-Link Omada',
        site: 'Mshikamano Block B',
        status: 'connected',
        nasIp: '192.168.88.1',
        controllerUrl: 'https://omada.lemawifi.net',
      }
    ];
  });

  const [accessPoints, setAccessPoints] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lema_wifi_aps');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        mac: '50:C7:BF:70:E2:B0',
        name: 'Mnara Kuu - Ruijie AX3000',
        model: 'Ruijie RG-RAP62-OD AX3000',
        site: 'Mshikamano Site',
        status: 'connected',
        uptime: 'Online tangu jana',
        ip: '192.168.88.10'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lema_wifi_routers', JSON.stringify(routers));
  }, [routers]);

  useEffect(() => {
    localStorage.setItem('lema_wifi_aps', JSON.stringify(accessPoints));
  }, [accessPoints]);

  // Equipment Inventory & QR Scanner States
  const [showQrEquipmentModal, setShowQrEquipmentModal] = useState<boolean>(false);
  const [equipmentInventory, setEquipmentInventory] = useState<ScannedEquipment[]>([]);

  // Wizard States
  const [showAddRouterForm, setShowAddRouterForm] = useState<boolean>(false);
  const [newRouterType, setNewRouterType] = useState<'omada' | 'mikrotik' | 'openwrt'>('omada');
  const [newRouterName, setNewRouterName] = useState<string>('');
  const [newRouterSite, setNewRouterSite] = useState<string>('Sokoni Area');
  const [newRouterControllerUrl, setNewRouterControllerUrl] = useState<string>('https://omada.mtaawifi.net');
  const [newRouterNasIp, setNewRouterNasIp] = useState<string>('');
  const [isFindingSites, setIsFindingSites] = useState<boolean>(false);
  const [siteFound, setSiteFound] = useState<boolean>(false);

  // AP Claim States
  const [showClaimApForm, setShowClaimApForm] = useState<boolean>(false);
  const [claimApMac, setClaimApMac] = useState<string>('');
  const [claimApModel, setClaimApModel] = useState<string>('EAP225-Outdoor');
  const [claimApSite, setClaimApSite] = useState<string>('Mshikamano Site');
  const [isClaimingAp, setIsClaimingAp] = useState<boolean>(false);
  const [apClaimStep, setApClaimStep] = useState<string>('');

  // Lema AI AP Adoption Wizard States
  const [showAiApWizard, setShowAiApWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<'brand' | 'capture' | 'analyze' | 'results' | 'success'>('brand');
  const [wizardBrand, setWizardBrand] = useState<'omada' | 'unifi' | 'ruijie'>('omada');
  const [capturedStickerImg, setCapturedStickerImg] = useState<string | null>(null);
  const [wizardLogs, setWizardLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(0);
  const [wizardExtractedDetails, setWizardExtractedDetails] = useState<any>({
    manufacturer: 'TP-Link',
    model: 'EAP225-Outdoor',
    serialNumber: '22611SK004068',
    deviceKey: '12BA-E1EF-7DAA-19DE-9000',
    macAddress: '20:E1:5D:44:16:D2'
  });
  const [wizardNewSsid, setWizardNewSsid] = useState<string>('DUKANI KWA ALI 5G WIFI');

  const [sites, setSites] = useState<any[]>([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLoc, setNewSiteLoc] = useState('');

  // System Notifications/Alerts State
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  // SaaS Multi-Tenant Manager States
  const [saasTenants, setSaasTenants] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lema_saas_tenants');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'tenant-1',
        businessName: 'Kassim Mtaani WiFi',
        ownerName: 'Kassim Rashidi',
        phone: '0712345678',
        location: 'Kariakoo, DSM',
        apCount: 3,
        routerCount: 1,
        monthlyFee: 10000,
        status: 'active',
        nextRenewal: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('sw-TZ'), // 15 days from now
        joinedDate: '2026-08-15',
        lastPaymentRef: 'MPESA-TX9284',
        paymentHistory: [
          { date: '2026-09-15', amount: 10000, ref: 'MPESA-TX9284', status: 'completed' },
          { date: '2026-08-15', amount: 10000, ref: 'AIRTEL-AX8172', status: 'completed' }
        ]
      },
      {
        id: 'tenant-2',
        businessName: 'Juma Kibanda Hotspot',
        ownerName: 'Juma Selemani',
        phone: '0754888222',
        location: 'Mwananyamala, DSM',
        apCount: 1,
        routerCount: 1,
        monthlyFee: 10000,
        status: 'overdue',
        nextRenewal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('sw-TZ'), // 2 days ago
        joinedDate: '2026-09-01',
        lastPaymentRef: 'TIGOPESA-TM1934',
        paymentHistory: [
          { date: '2026-09-01', amount: 10000, ref: 'TIGOPESA-TM1934', status: 'completed' }
        ]
      },
      {
        id: 'tenant-3',
        businessName: 'Zainab Starlink Station',
        ownerName: 'Zainab Abdallah',
        phone: '0765111000',
        location: 'Mbezi Beach, DSM',
        apCount: 4,
        routerCount: 1,
        monthlyFee: 10000,
        status: 'suspended',
        nextRenewal: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString('sw-TZ'), // 12 days ago
        joinedDate: '2026-07-10',
        lastPaymentRef: 'MPESA-TX1014',
        paymentHistory: [
          { date: '2026-08-10', amount: 10000, ref: 'MPESA-TX1014', status: 'completed' },
          { date: '2026-07-10', amount: 10000, ref: 'MPESA-TX0182', status: 'completed' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lema_saas_tenants', JSON.stringify(saasTenants));
  }, [saasTenants]);

  // Selected Tenant details state
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-1');
  const [showAddTenantForm, setShowAddTenantForm] = useState<boolean>(false);
  const [newTenantBusinessName, setNewTenantBusinessName] = useState('');
  const [newTenantOwnerName, setNewTenantOwnerName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantLocation, setNewTenantLocation] = useState('Tegeta, DSM');
  const [newTenantApCount, setNewTenantApCount] = useState(1);
  const [newTenantRouterCount, setNewTenantRouterCount] = useState(1);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateVouchers(selectedPkgForGen, generateCount);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherFilter === 'all') return true;
    return v.status === voucherFilter;
  });

  // Financial Calculations
  const totalRevenue = transactions.reduce((sum, tx) => (tx.status === 'completed' ? sum + tx.amount : sum), 0);
  const todayRevenue = transactions
    .filter((tx) => {
      const txDate = new Date(tx.timestamp).toDateString();
      const today = new Date().toDateString();
      return txDate === today && tx.status === 'completed';
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Dynamic baseline for active visualization
  const effectiveTodayRevenue = todayRevenue;
  const effectiveActiveCount = activeSessions.length;

  // Real-time hourly trend for Today (06:00 to 22:00)
  const hourlySummaryData = [
    { time: '06:00', revenue: Math.round(effectiveTodayRevenue * 0.08), connections: Math.round(effectiveActiveCount * 0.25) },
    { time: '08:00', revenue: Math.round(effectiveTodayRevenue * 0.18), connections: Math.round(effectiveActiveCount * 0.5) },
    { time: '10:00', revenue: Math.round(effectiveTodayRevenue * 0.28), connections: Math.round(effectiveActiveCount * 0.75) },
    { time: '12:00', revenue: Math.round(effectiveTodayRevenue * 0.44), connections: Math.round(effectiveActiveCount * 0.9) },
    { time: '14:00', revenue: Math.round(effectiveTodayRevenue * 0.58), connections: Math.round(effectiveActiveCount * 0.8) },
    { time: '16:00', revenue: Math.round(effectiveTodayRevenue * 0.72), connections: Math.round(effectiveActiveCount * 1.1) },
    { time: '18:00', revenue: Math.round(effectiveTodayRevenue * 0.88), connections: Math.round(effectiveActiveCount * 1.35) },
    { time: '20:00', revenue: Math.round(effectiveTodayRevenue * 0.96), connections: Math.round(effectiveActiveCount * 1.4) },
    { time: 'Sasa (Live)', revenue: effectiveTodayRevenue, connections: effectiveActiveCount },
  ];

  const formatRevenueTick = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return `${val}`;
  };

  const getApFilteredMetrics = () => {
    return {
      todayRevenue: todayRevenue,
      thisWeekRevenue: totalRevenue,
      monthRevenue: totalRevenue,
      apTotalRevenue: totalRevenue,
      onlineUsers: activeSessions.length,
      apCountOnline: `${accessPoints.filter(a => a.status === 'connected').length}/${accessPoints.length}`,
      dataUsage: activeSessions.length > 0 ? `${(activeSessions.reduce((sum, s) => sum + s.bytesDown, 0) / 1024 / 1024 / 1024).toFixed(2)} GB` : '0.00 GB',
    };
  };
  const activeMetrics = getApFilteredMetrics();

  const mobileTxList = transactions.filter(t => t.status === 'completed');
  const mobileRevenue = mobileTxList.reduce((sum, t) => sum + t.amount, 0);
  const voucherRevenue = vouchers.filter(v => v.status === 'active' || v.status === 'expired').reduce((sum, v) => sum + v.price, 0);
  const usedVouchersCount = vouchers.filter(v => v.status === 'active' || v.status === 'expired').length;
  const expiredVouchersCount = vouchers.filter(v => v.status === 'expired').length;
  const onlineApsCount = accessPoints.filter(a => a.status === 'connected').length;
  const offlineApsCount = accessPoints.filter(a => a.status !== 'connected').length;
  const totalPackagesList = settings.packages || [];

  return (
    <div className="flex min-h-screen bg-[#f5f2eb] text-[#3a3431] font-sans">
      {/* PROFESSIONAL SIDEBAR (Premium Espresso Theme) */}
      <aside className="w-64 bg-[#231f1c] text-stone-200 border-r border-[#e6e2d3] flex flex-col shrink-0 select-none">
        {/* Sidebar Header / Brand */}
        <div className="p-4 border-b border-[#352f2c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LemaLogo variant="horizontal" size="sm" theme="dark" showSlogan={false} />
          </div>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-sky-500 text-white uppercase tracking-wider">ISP</span>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none text-xs">
          {/* Main / Dashboards */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Main Portal</span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#cca43b] text-white shadow-md shadow-[#cca43b]/10'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('lema_ai')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'lema_ai'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Lema AI Engine</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-500 text-white uppercase tracking-wider">7 Apps</span>
            </button>
            <button
              onClick={() => setActiveTab('wakala')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'wakala'
                  ? 'bg-[#cca43b] text-white shadow-md shadow-[#cca43b]/10'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Lema Fast Wakala</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500 text-white animate-pulse">New</span>
            </button>
            <button
              onClick={() => setActiveTab('saas_management')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'saas_management'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Uza Mfumo (SaaS 10k)</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider">SAAS</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp_bot')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'whatsapp_bot'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 font-black'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Bot (100% Care)</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider animate-pulse">
                BOT
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#cca43b] text-white shadow-md shadow-[#cca43b]/10'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Chat & Assistant</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#cca43b] text-white">Live</span>
            </button>
          </div>

          {/* Network Modules */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Network</span>
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Packages & Profiles</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Vouchers</span>
            </button>
            <button
              onClick={() => setActiveTab('binding')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'binding'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bypass Binding</span>
            </button>
            <button
              onClick={() => setActiveTab('anti_tethering')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'anti_tethering'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Anti-Tethering & Fingerprint</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                PRO
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ssid_lan')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'ssid_lan'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>SSID / LAN Status</span>
            </button>
            <button
              onClick={() => setActiveTab('pppoe')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'pppoe'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>PPPoE Secrets</span>
            </button>
            <button
              onClick={() => setActiveTab('hotspot_portal')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'hotspot_portal'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Hotspot Portal Config</span>
            </button>
            <button
              onClick={() => setActiveTab('adverts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'adverts'
                  ? 'bg-[#cca43b] text-white shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#352f2c] hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Wi-Fi Adverts</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Online Users (Live)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab('users_devices')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'users_devices'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Users & Devices</span>
            </button>
          </div>

          {/* Infrastructure Modules */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Infrastructure</span>
            <button
              onClick={() => setActiveTab('routers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'routers'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Routers</span>
            </button>
            <button
              onClick={() => setActiveTab('aps')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'aps'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Access Points</span>
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'sites'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Sites / Locations</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'equipment' || activeTab === 'inventory'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Stoo & QR Equipment</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold">SCAN</span>
            </button>
          </div>

          {/* Finance Modules */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Finance</span>
            <button
              onClick={() => setActiveTab('payout')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'payout'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Payout Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-stone-800 text-white border-l-2 border-amber-400 font-bold'
                  : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Transactions</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-stone-800 text-xs space-y-2 bg-stone-950/40">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-semibold">User:</span>
            <span className="text-amber-400 font-mono">lemajimmy</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              Toka (Logout)
            </button>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA (Right of sidebar) */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#fbf9f4] p-6 sm:p-8 space-y-8 text-[#3a3431]">
        {/* Top Floating Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d3] pb-5">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#231f1c] uppercase tracking-tight flex items-center gap-2.5">
              <span>{activeTab.replace('_', ' ').toUpperCase()} MODULE</span>
            </h1>
            
            {/* Lema Fast WiFi Access Point Dropdown Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Kituo cha WiFi (AP Selector):</span>
              <select
                value={selectedApFilter}
                onChange={(e) => setSelectedApFilter(e.target.value)}
                className="bg-white border border-[#e6e2d3] text-stone-800 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b] shadow-xs cursor-pointer"
              >
                <option value="all">
                  {accessPoints.length > 0 ? `📍 Vituo Vyote (${accessPoints.length} APs)` : '📍 Hakuna AP Iliyounganishwa (0 APs)'}
                </option>
                {accessPoints.map((ap) => (
                  <option key={ap.mac || ap.name} value={ap.name || ap.mac}>
                    {ap.name || ap.model} ({ap.location || ap.ip || 'Online'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('whatsapp_bot')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-emerald-800 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Fungua WhatsApp 100% Care Bot Module"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Bot (100%)</span>
              {alerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setShowQrEquipmentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Skani Lebo ya QR / Barcode ya vifaa vya WiFi kusajili kwenye stoo"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skani QR ya Kifaa</span>
            </button>

            <button
              onClick={() => setShowScriptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5 text-[#cca43b]" />
              <span>Kodi za Router (Script)</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#cca43b]" />
              <span>Chapisha Vocha</span>
            </button>

            <button
              onClick={() => setShowDailyReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ripoti ya Siku (PDF)</span>
            </button>

            <button
              onClick={onOpenCustomerPortal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-[#cca43b] hover:bg-[#b89332] rounded-lg shadow-sm transition-all cursor-pointer animate-pulse"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Portal Preview</span>
            </button>
          </div>
        </div>

        {/* 1. MODULE: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn text-[#3a3431] font-sans pb-10">
            
            {/* 2. ACCESS POINT FILTER BAR */}
            <div className="bg-[#f5f2eb] border border-[#e6e2d3] rounded-2xl p-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full">
                <button className="px-4 py-2 bg-white border border-[#e6e2d3] rounded-xl text-xs font-black text-stone-700 shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0">
                  <span className="text-amber-500">📥</span>
                  <span>ALL</span>
                </button>
                
                {/* AP Selector Dropdown with Wifi Icon */}
                <div className="relative flex-1 max-w-md">
                  <select
                    value={selectedApFilter}
                    onChange={(e) => setSelectedApFilter(e.target.value)}
                    className="w-full bg-white border border-[#e6e2d3] text-stone-850 text-xs rounded-xl pl-9 pr-8 py-2 font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b] shadow-xs cursor-pointer appearance-none"
                  >
                    <option value="all">
                      {accessPoints.length > 0 ? `Vituo Vyote (${accessPoints.length} APs)` : 'Hakuna AP iliyounganishwa (0 APs)'}
                    </option>
                    {accessPoints.map((ap) => (
                      <option key={ap.mac || ap.name} value={ap.name || ap.mac}>
                        {ap.name || ap.model} ({ap.location || ap.ip || 'Online'})
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">📡</span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* 3. DASHBOARD TITLE & QUICK NAVIGATION PILLS ROW */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#e6e2d3] pb-4">
              <div className="flex items-center gap-3">
                <LemaLogo variant="icon" size={34} />
                <div>
                  <h1 className="text-xl font-black text-[#231f1c] uppercase tracking-tight leading-none">
                    Lema Fast WiFi Dashboard
                  </h1>
                  <span className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">Live ISP Cloud Controller</span>
                </div>
              </div>

              {/* Navigation Pills list matching screenshot exactly */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowQrEquipmentModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-indigo-750 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Skani QR Code</span>
                </button>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>📦 Stoo & Vifaa ({equipmentInventory.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>📦 Packages</span>
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>📊 Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('ssid_lan')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>📶 SSID / LAN</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>🎚️ Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('users_devices')}
                  className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-850 cursor-pointer"
                >
                  <span>Devices ↗</span>
                </button>
                <button
                  onClick={() => setActiveTab('payout')}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-black text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>💳 Withdraw</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="p-1.5 bg-white border border-[#e6e2d3] rounded-lg text-stone-600 relative hover:text-stone-850 transition-colors cursor-pointer"
                >
                  <span>🔔</span>
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-amber-500 text-stone-950 font-mono font-bold text-[8px] px-1 rounded-full">
                      {alerts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 4. THE 4 GORGEOUS DETAILED REVENUE CARDS WITH DUAL COLUMNS GRIDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CARD 1: Revenue Today */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-[#231f1c] font-sans">
                    TZS {activeMetrics.todayRevenue.toLocaleString()}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                </div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider -mt-2">
                  Revenue today
                </div>

                {/* Inner Grid columns: Mobile vs Voucher */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Mobile</span>
                    <strong className="text-stone-800 font-bold block">📱 TZS {mobileRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{mobileTxList.length} malipo · TZS {mobileRevenue.toLocaleString()}</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Voucher</span>
                    <strong className="text-stone-800 font-bold block">🎫 TZS {voucherRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{usedVouchersCount} zimetumika</span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium pt-1">
                  Mauzo ya jumla leo
                </div>
              </div>

              {/* CARD 2: This Week */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-[#231f1c] font-sans">
                    TZS {activeMetrics.thisWeekRevenue.toLocaleString()}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                    📈
                  </div>
                </div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider -mt-2">
                  This week
                </div>

                {/* Inner Grid columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Mobile</span>
                    <strong className="text-stone-800 font-bold block">📱 TZS {mobileRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{mobileTxList.length} malipo</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Voucher</span>
                    <strong className="text-stone-800 font-bold block">🎫 TZS {voucherRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{usedVouchersCount} zimetumika</span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium pt-1">
                  Jumapili–leo · simu & vocha
                </div>
              </div>

              {/* CARD 3: Month Revenue */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-[#231f1c] font-sans">
                    TZS {activeMetrics.monthRevenue.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-black text-[8px] uppercase tracking-wide">Month</span>
                    <span className="text-xs">💳</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider -mt-2">
                  Money in this month
                </div>

                {/* Inner Grid columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Mobile</span>
                    <strong className="text-stone-800 font-bold block">📱 TZS {mobileRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{mobileTxList.length} malipo</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Voucher</span>
                    <strong className="text-stone-800 font-bold block">🎫 TZS {voucherRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">{usedVouchersCount} zimetumika</span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium pt-1">
                  Malipo ya simu + fedha za vocha
                </div>
              </div>

              {/* CARD 4: Wallet Balance */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-[#231f1c] font-sans">
                    TZS {activeMetrics.apTotalRevenue.toLocaleString()}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs">
                    💼
                  </div>
                </div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider -mt-2">
                  Wallet balance
                </div>

                {/* Inner Grid columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Total Earned</span>
                    <strong className="text-stone-800 font-bold block">🪙 TZS {totalRevenue.toLocaleString()}</strong>
                    <span className="text-[9px] text-stone-400 block truncate">Fee 0%</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">In Payout</span>
                    <strong className="text-stone-800 font-bold block">💸 TZS 0</strong>
                    <span className="text-[9px] text-stone-400 block truncate">Hakuna iliyosubiri</span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium pt-1">
                  Kutoa malipo ya simu
                </div>
              </div>
            </div>

            {/* 5. THE ROW OF 3 MONITORING DETAILS PANELS (Live Wi-Fi, APs, Active packages) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* PANEL 1: Live on Wi-Fi */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-3xl font-black text-stone-850">{activeSessions.length}</span>
                    <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Live on Wi-Fi</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-lg">
                    👥
                  </div>
                </div>

                {/* Sub-details columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">New This Month</span>
                    <strong className="text-stone-800 font-bold block">👤 +{activeSessions.length}</strong>
                    <span className="text-[9px] text-stone-400">wateja hewani</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Suspended</span>
                    <strong className="text-stone-800 font-bold block">⚡ 0</strong>
                    <span className="text-[9px] text-stone-400">{expiredVouchersCount} zimeisha</span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium">
                  {activeSessions.length} active subscriptions
                </div>
              </div>

              {/* PANEL 2: Access Points Online */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-3xl font-black text-stone-850">
                      {accessPoints.length > 0 ? `${onlineApsCount}/${accessPoints.length}` : '0/0'}
                    </span>
                    <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Access points online</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-lg">
                    📡
                  </div>
                </div>

                {/* Sub-details columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Online</span>
                    <strong className="text-stone-800 font-bold block">🟢 {onlineApsCount}</strong>
                    <span className="text-[9px] text-stone-400">
                      {accessPoints.length > 0 ? `${Math.round((onlineApsCount / accessPoints.length) * 100)}% up` : '0% up'}
                    </span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Offline</span>
                    <strong className="text-stone-800 font-bold block">🔴 {offlineApsCount}</strong>
                    <span className="text-[9px] text-stone-400">
                      {accessPoints.length === 0 ? 'Hakuna AP' : `${offlineApsCount} offline`}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium">
                  {accessPoints.length === 0
                    ? 'Hakuna AP / Router iliyounganishwa'
                    : onlineApsCount === accessPoints.length
                    ? '100% online right now'
                    : `${onlineApsCount} kati ya ${accessPoints.length} ziko online`}
                </div>
              </div>

              {/* PANEL 3: Active Packages */}
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-3xl font-black text-stone-850">{totalPackagesList.length}</span>
                    <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Active packages</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-150 flex items-center justify-center text-lg">
                    📦
                  </div>
                </div>

                {/* Sub-details columns */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">In Catalog</span>
                    <strong className="text-stone-800 font-bold block">📦 {totalPackagesList.length}</strong>
                    <span className="text-[9px] text-stone-400">{totalPackagesList.length} vifurushi vipo</span>
                  </div>
                  <div className="space-y-0.5 border-l border-stone-100 pl-2.5">
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Top Plan Live</span>
                    <strong className="text-stone-800 font-bold block">🔥 {totalPackagesList.length > 0 ? totalPackagesList[0].name : 'Hakuna'}</strong>
                    <span className="text-[9px] text-stone-400">
                      {totalPackagesList.length > 0 ? `${totalPackagesList[0].durationHours}h · TZS ${totalPackagesList[0].price.toLocaleString()}` : '-'}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-medium">
                  {totalPackagesList.length} in catalog
                </div>
              </div>
            </div>

            {/* 6. LARGE CAPTIVE PORTAL QUICK REDIRECT CARD */}
            <div className="bg-gradient-to-r from-amber-500 to-[#cca43b] text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-400/20 relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Captive Portal Interactive Editor</span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                  Hariri Chapa na Muonekano wa Captive Portal ya Mteja!
                </h3>
                <p className="text-xs text-amber-50 max-w-2xl leading-relaxed">
                  Badilisha nembo ya bendi yako, andika ujumbe wa ukaribisho kama unavyopenda, na ujaribu upakiaji wa fomu za malipo ya simu live upande wa kulia!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto z-10">
                <button
                  onClick={() => setActiveTab('hotspot_portal')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#231f1c] hover:bg-stone-900 text-amber-400 font-black text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5 border border-stone-800"
                >
                  <Settings className="w-4 h-4" />
                  <span>Sanidi Portal Sasa</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Billing Engine (Auto-Disconnect & Session Verification Terminal) */}
            <BillingModule />

            {/* Notification alert panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Tahadhari & Taarifa za Mtandao (Live Alerts)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {alerts.length === 0 ? (
                    <div className="p-4 bg-stone-950/60 border border-stone-850 rounded-xl text-center text-stone-500">
                      Hakuna tahadhari yoyote kwa sasa. Vifaa vyote na mfumo viko salama (Healthy).
                    </div>
                  ) : (
                    alerts.map((a) => (
                      <div key={a.id} className="p-3.5 bg-stone-950 border border-stone-850 rounded-xl flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-xs">{a.title}</h4>
                          <p className="text-stone-400 text-[11px] leading-relaxed">{a.message}</p>
                          <span className="text-[10px] text-stone-500 block">{a.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lipa Namba Details Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>Payout Verification & Target (Lipa Namba)</span>
                </h3>
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-xl space-y-4 text-xs">
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Hali ya Kupokea Malipo:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live & Active
                    </span>
                  </div>
                  <div className="space-y-2 border-t border-stone-850 pt-3">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Akaunti ya Payout:</span>
                      <strong className="text-white font-mono">{settings.payoutAccount || '5849201'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Mmiliki wa Akaunti:</span>
                      <strong className="text-white">{settings.accountOwnerName || 'Jimmy Lema'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Namba ya Msaada (Support):</span>
                      <strong className="text-white font-mono">{settings.supportPhone}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Telemetry Recharts Chart */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Takwimu za Wakati Halisi (Live Telemetry)</span>
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Mwenendo wa Mapato ya Siku & Wateja</span>
                  </h2>
                </div>
              </div>

              <div className="w-full h-72 sm:h-80 select-none text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourlySummaryData} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis dataKey="time" stroke="#78716c" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="revAxis" tickFormatter={formatRevenueTick} stroke="#10b981" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="revAxis" type="monotone" dataKey="revenue" name="Mapato (Tsh)" fill="url(#adminRevGrad)" stroke="#10b981" strokeWidth={2.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* MODULE: LEMA AI SUITE (7 AUTONOMOUS ENGINES) */}
        {activeTab === 'lema_ai' && (
          <LemaAiSuite
            lang={lang}
            onDeployPackage={(name, price, durationHours) => {
              const newPkg = {
                id: `pkg-ai-${Date.now()}`,
                name,
                price,
                durationHours,
                speedDownload: '15 Mbps',
                speedUpload: '10 Mbps',
                userLimit: 1,
                isPopular: true
              };
              updateSettings({ packages: [...settings.packages, newPkg] });
            }}
            showToast={showToast}
          />
        )}

        {/* 2. MODULE: LEMA FAST WAKALA (AGENT MANAGEMENT) */}
        {activeTab === 'wakala' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <span>Sajili Wakala Mpya wa Lema Fast WiFi</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">Sajili mawakala wako mtaani (kama wenye maduka au saluni) ili wakuuzie bando na wapate kamisheni.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Jina la Wakala:</label>
                  <input
                    type="text"
                    placeholder="Mama Sharo Duka la Nguo"
                    value={newWakalaName}
                    onChange={(e) => setNewWakalaName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Eneo / Site:</label>
                  <input
                    type="text"
                    placeholder="Mshikamano Block B"
                    value={newWakalaLocation}
                    onChange={(e) => setNewWakalaLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-stone-400 block mb-1">Kamisheni (Commission %):</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newWakalaComm}
                      onChange={(e) => setNewWakalaCommission(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newWakalaName) return;
                      const nw = {
                        id: `w-${Date.now()}`,
                        name: newWakalaName,
                        location: newWakalaLocation || 'Mtaani',
                        salesCount: 0,
                        balance: 0,
                        commissionRate: newWakalaComm,
                        status: 'active'
                      };
                      setWakalas([...wakalas, nw]);
                      setNewWakalaName('');
                      setNewWakalaLocation('');
                    }}
                    className="px-4 py-2 font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px]"
                  >
                    Sajili Wakala
                  </button>
                </div>
              </div>
            </div>

            {/* Wakala list database */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-stone-800">
                <h3 className="font-bold text-white text-sm">Orodha ya Mawakala Wako Mtaani</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Jina</th>
                      <th className="p-4">Eneo</th>
                      <th className="p-4">Mauzo (Sales)</th>
                      <th className="p-4">Kamisheni (%)</th>
                      <th className="p-4">Salio la Kamisheni (Balance)</th>
                      <th className="p-4">Hali (Status)</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {wakalas.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-850/30">
                        <td className="p-4 font-bold text-white font-sans">{w.name}</td>
                        <td className="p-4 text-stone-300 font-sans">{w.location}</td>
                        <td className="p-4 text-amber-400 font-bold">{w.salesCount} tickets</td>
                        <td className="p-4 text-white">{w.commissionRate}%</td>
                        <td className="p-4 font-bold text-emerald-400">Tsh {w.balance.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold">Active</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setWakalas(wakalas.filter((item) => item.id !== w.id))}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          >
                            Ondoa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODULE: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Wi-Fi Hotspot Customers List</span>
              </h3>
              <p className="text-xs text-stone-400">
                Orodha ya wateja waliowahi kujiunga au waliopo sasa kwenye database ya Mtaa WiFi.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">MAC Address</th>
                      <th className="p-4">Last Connected Site</th>
                      <th className="p-4">Connected At</th>
                      <th className="p-4">Voucher Redemptions</th>
                      <th className="p-4">Hali (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {transactions.length > 0 || activeSessions.length > 0 ? (
                      Array.from(new Set([
                        ...transactions.map(t => t.phoneNumber).filter(Boolean),
                        ...activeSessions.map(s => s.phoneNumber).filter(Boolean)
                      ])).map((phone) => {
                        const txCount = transactions.filter(t => t.phoneNumber === phone).length;
                        const session = activeSessions.find(s => s.phoneNumber === phone);
                        return (
                          <tr key={phone as string} className="hover:bg-stone-850/30">
                            <td className="p-4 font-bold text-white font-sans">{phone}</td>
                            <td className="p-4 text-sky-400 font-bold font-mono">{session?.macAddress || 'N/A'}</td>
                            <td className="p-4 font-sans text-stone-300">{session?.ipAddress || 'Hotspot Core'}</td>
                            <td className="p-4">{session ? 'Sasa hivi' : 'Hivi karibuni'}</td>
                            <td className="p-4 text-amber-400 font-bold">{txCount} mara</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${
                                session 
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                                  : 'bg-stone-800 text-stone-400'
                              }`}>
                                {session ? 'Active' : 'Offline'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-500 font-sans">
                          Hakuna historia ya wateja bado. Wateja wataonekana hapa punde watakaponunua vocha au kujiunga.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODULE: PACKAGES & PROFILES (SETTINGS) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Packages setup cards */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Wi-Fi Package & Speed Profiles</span>
              </h3>
              <p className="text-xs text-stone-400">
                Hariri bei na spidi ya kupakia/kupakua (Download/Upload speed limits) kwa kila kifurushi kinachoonekana kwenye portal ya malipo ya mteja.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="p-4 bg-stone-950 border border-stone-850 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                      <strong className="text-white text-xs font-bold">{pkg.name}</strong>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">Saa {pkg.durationHours}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-stone-400 block mb-0.5">Bei (TZS):</label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => {
                            const updatedPkgs = [...settings.packages];
                            updatedPkgs[idx] = { ...pkg, price: parseInt(e.target.value) || 0 };
                            updateSettings({ packages: updatedPkgs });
                          }}
                          className="w-full px-2.5 py-1.5 border border-stone-700 rounded-lg bg-stone-850 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-0.5">Download Limit:</label>
                        <input
                          type="text"
                          value={pkg.speedDownload}
                          onChange={(e) => {
                            const updatedPkgs = [...settings.packages];
                            updatedPkgs[idx] = { ...pkg, speedDownload: e.target.value };
                            updateSettings({ packages: updatedPkgs });
                          }}
                          className="w-full px-2.5 py-1.5 border border-stone-700 rounded-lg bg-stone-850 text-white font-mono text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-0.5">Upload Limit:</label>
                        <input
                          type="text"
                          value={pkg.speedUpload}
                          onChange={(e) => {
                            const updatedPkgs = [...settings.packages];
                            updatedPkgs[idx] = { ...pkg, speedUpload: e.target.value };
                            updateSettings({ packages: updatedPkgs });
                          }}
                          className="w-full px-2.5 py-1.5 border border-stone-700 rounded-lg bg-stone-850 text-white font-mono text-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General System & SMS Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Wi-Fi General Settings</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1">SSID Jina la Wi-Fi:</label>
                    <input
                      type="text"
                      value={settings.hotspotName}
                      onChange={(e) => updateSettings({ hotspotName: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Tagline / Slogan:</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => updateSettings({ tagline: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Namba ya Payout (Mobile Wallet):</label>
                    <input
                      type="text"
                      value={settings.payoutAccount}
                      onChange={(e) => updateSettings({ payoutAccount: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs font-mono text-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Automated SMS Templates */}
              <SmsTemplateConfigPanel lang={lang} />
            </div>

            {/* Restore / Delete Data */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Futa Data za Majaribio (System reset)</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Ukipenda kuanza upya kabla ya kuuza rasmi bando kwa wateja, bonyeza hapa ili kuweka upya database na kufuta miamala yote ya dharura.
              </p>
              <button
                onClick={resetDemoData}
                className="py-2.5 px-4 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-colors cursor-pointer"
              >
                Reset Data & Clear Storage
              </button>
            </div>
          </div>
        )}

        {/* 5. MODULE: VOUCHERS */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Voucher generation wizard */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>Tengeneza Vocha Mpya kwa Mnene / Kundi (Bulk Generator)</span>
              </h3>

              <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Chagua Kifurushi (Package):</label>
                  <select
                    value={selectedPkgForGen}
                    onChange={(e) => setSelectedPkgForGen(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  >
                    {settings.packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Tsh {p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Idadi ya Vocha (Count):</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={generateCount}
                    onChange={(e) => setGenerateCount(parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tengeneza Bando</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Voucher database list */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden space-y-4 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Orodha ya Vocha Zote Kwenye Mfumo</h3>
                  <p className="text-[11px] text-stone-400 mt-1">Unaweza kukata, kuchuja au kuchapisha hapa.</p>
                </div>

                {/* Filter controls */}
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                  <button
                    onClick={() => setVoucherFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${voucherFilter === 'all' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
                  >
                    Zote ({vouchers.length})
                  </button>
                  <button
                    onClick={() => setVoucherFilter('unused')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${voucherFilter === 'unused' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
                  >
                    Hazijatumika ({vouchers.filter((v) => v.status === 'unused').length})
                  </button>
                  <button
                    onClick={() => setVoucherFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${voucherFilter === 'active' ? 'bg-amber-400 text-stone-950' : 'text-stone-400'}`}
                  >
                    Zilizo Active ({vouchers.filter((v) => v.status === 'active').length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Voucher Code</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Phone Used</th>
                      <th className="p-4">Expires At</th>
                      <th className="p-4">MAC Address</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {filteredVouchers.slice(0, 100).map((v) => (
                      <tr key={v.id} className="hover:bg-stone-850/30">
                        <td className="p-4 font-bold text-amber-400 text-sm select-all">{v.code}</td>
                        <td className="p-4 font-sans text-white font-bold">{v.packageName}</td>
                        <td className="p-4 text-emerald-400 font-bold">Tsh {v.price.toLocaleString()}</td>
                        <td className="p-4 font-sans text-stone-300">{v.durationHours} masaa</td>
                        <td className="p-4 font-sans">{v.usedByPhone || '—'}</td>
                        <td className="p-4 text-stone-400 font-sans">{v.expiresAt ? new Date(v.expiresAt).toLocaleTimeString() : '—'}</td>
                        <td className="p-4 uppercase">{v.macAddress || '—'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                            v.status === 'unused'
                              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                              : v.status === 'active'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-stone-800 border-stone-700 text-stone-400'
                          }`}>
                            {v.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteVoucher(v.id)}
                            className="p-1 text-stone-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. MODULE: PPPOE SECRETS */}
        {activeTab === 'pppoe' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <span>Sanidi Mteja wa PPPoE (Home Fiber secrets)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Kama unawafungia wateja nyumbani (Home users) kwa router za mikononi au LAN, unaweza kuwawekea PPPoE dial-in secret badala ya vocha ya Wi-Fi!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Username ya PPPoE:</label>
                  <input
                    type="text"
                    placeholder="kassim_home"
                    value={newPppoeUser}
                    onChange={(e) => setNewPppoeUser(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Nenosiri (Password):</label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={newPppoePass}
                    onChange={(e) => setNewPppoePass(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Package/Profile:</label>
                  <select
                    value={newPppoeProfile}
                    onChange={(e) => setNewPppoeProfile(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  >
                    <option value="Home_5Mbps">Home Fiber 5 Mbps (Tsh 15,000/Mwezi)</option>
                    <option value="Home_10Mbps">Home Fiber 10 Mbps (Tsh 25,000/Mwezi)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPppoeUser) return;
                      const nu = {
                        id: `pppoe-${Date.now()}`,
                        username: newPppoeUser,
                        password: newPppoePass || 'password881',
                        profile: newPppoeProfile,
                        remoteIp: `10.10.10.${Math.floor(20 + Math.random() * 80)}`,
                        status: 'disconnected'
                      };
                      setPppoeSecrets([...pppoeUsers, nu]);
                      setNewPppoeUser('');
                      setNewPppoePass('');
                    }}
                    className="w-full py-2 font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px]"
                  >
                    Sajili PPPoE Secret
                  </button>
                </div>
              </div>
            </div>

            {/* PPPoE list */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-stone-800">
                <h3 className="font-bold text-white text-sm">Secrets za PPPoE Active Kwenye Router</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Username</th>
                      <th className="p-4">Password</th>
                      <th className="p-4">Profile Limit</th>
                      <th className="p-4">Remote IP Address</th>
                      <th className="p-4">Hali (Status)</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {pppoeUsers.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-850/30">
                        <td className="p-4 font-bold text-white">{p.username}</td>
                        <td className="p-4 font-sans text-stone-300">{p.password}</td>
                        <td className="p-4 font-sans text-amber-400 font-bold">{p.profile}</td>
                        <td className="p-4 text-sky-400 font-bold">{p.remoteIp}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                            p.status === 'connected'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-stone-800 border-stone-700 text-stone-400'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setPppoeSecrets(pppoeUsers.filter((item) => item.id !== p.id))}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          >
                            Ondoa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. MODULE: HOTSPOT PORTAL CONFIG (Wotefy Look & Brand Split-Screen Engine) */}
        {activeTab === 'hotspot_portal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn text-[#3a3431]">
            
            {/* Left Column: Configuration Settings (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Premium Top Container with Header Actions (Preview & Live portal) */}
              <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d3] pb-4">
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-black text-[#231f1c] uppercase tracking-tight">Captive portal</h2>
                    <p className="text-[11px] text-stone-500 font-medium">Design the guest Wi-Fi page for <span className="font-bold text-amber-600">HQ1 - ANNOYPAYPOINT</span>.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenCustomerPortal}
                      className="px-3.5 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-[#e6e2d3] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={onOpenCustomerPortal}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#cca43b] hover:bg-[#b89332] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Live portal</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tab Bar matching the screenshot */}
                <div className="flex items-center gap-1 border-b border-[#e6e2d3] pb-0.5 text-xs font-bold">
                  {[
                    { id: 'brand', label: 'Brand' },
                    { id: 'style', label: 'Style' },
                    { id: 'legal', label: 'Legal' },
                    { id: 'save_preview', label: 'Save Preview' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCaptiveSubTab(tab.id as any)}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
                        captiveSubTab === tab.id
                          ? 'border-[#cca43b] text-[#cca43b] font-black'
                          : 'border-transparent text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Custom Portal Toggle Control */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-stone-800 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${useCustomPortal ? 'bg-amber-500 animate-pulse' : 'bg-stone-400'}`} />
                        <span>Use custom portal for this access point</span>
                      </label>
                      <p className="text-[10px] text-stone-500 leading-relaxed">
                        When off, guests on HQ1 see your default portal. When on, the design below applies to this AP only.
                      </p>
                    </div>
                    <button
                      onClick={() => setUseCustomPortal(!useCustomPortal)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        useCustomPortal ? 'bg-amber-500' : 'bg-stone-300'
                      }`}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        useCustomPortal ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500 pt-1.5 border-t border-stone-200/50">
                    <button
                      onClick={() => {
                        setPortalBusinessName('Lema Fast WiFi');
                        setPortalWelcomeMessage('Karibu Lema Fast WiFi! Lipia kifurushi chako ufurahie intaneti ya kasi ya Fiber na Starlink.');
                        setPortalThemePreset('wotefy');
                        setPortalCardDesign('clay');
                        showToast('Portal Reset', 'Lango limerejeshwa kwa usanidi wa Lema Fast WiFi.', 'info');
                      }}
                      className="hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      Reset to default portal
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => showToast('Default Template', 'Inahariri template inayotumika kwenye Access Points 14 za Lema Fast WiFi.', 'info')}
                      className="hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      Edit default portal (All APs)
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Tab Content Rendering */}
              {captiveSubTab === 'brand' && (
                <div className="space-y-6">
                  {/* Form Box 1: Look & Brand */}
                  <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="border-b border-[#e6e2d3] pb-2">
                      <h3 className="text-xs font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#cca43b]" />
                        <span>Look & Brand</span>
                      </h3>
                      <p className="text-[9px] text-stone-400">Name, welcome message, and default portal languages.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-bold block">BUSINESS NAME:</label>
                        <input
                          type="text"
                          value={portalBusinessName}
                          onChange={(e) => setPortalBusinessName(e.target.value)}
                          placeholder="ANNOYPAYPOINT"
                          className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-stone-500 font-bold block">PORTAL LANGUAGE:</label>
                        <select
                          className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                        >
                          <option value="sw">Kiswahili (Tanzania)</option>
                          <option value="en">English (US)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-stone-500 font-bold block">WELCOME MESSAGE:</label>
                      <textarea
                        rows={3}
                        value={portalWelcomeMessage}
                        onChange={(e) => setPortalWelcomeMessage(e.target.value)}
                        placeholder="Vyovyote mwenyewe changamoto au alie toka kabla ya muda wake kuisha anicheki 0785230712"
                        className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#cca43b] text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Form Box 2: Image Uploaders matching Wotefy layout */}
                  <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="border-b border-[#e6e2d3] pb-2">
                      <h3 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">Logos & Wallpapers</h3>
                      <p className="text-[9px] text-stone-400">Custom brand branding assets.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Logo Upload Box */}
                      <div className="p-4 border-2 border-dashed border-[#e6e2d3] rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 bg-stone-50/50">
                        <span className="text-[10px] font-black uppercase text-stone-500">NEMBO RASMI (OFFICIAL LOGO)</span>
                        <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200">
                          <LemaLogo variant="horizontal" size="sm" theme="light" showSlogan={false} />
                        </div>
                        <p className="text-[9px] text-emerald-600 font-bold max-w-[160px]">✓ Nembo Rasmi ya Lema Fast WiFi Imewashwa</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setUploadedLogo(URL.createObjectURL(file));
                          }}
                          className="hidden"
                          id="logo-upload-input"
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="logo-upload-input"
                            className="px-3 py-1.5 bg-[#cca43b] text-white font-bold rounded-lg cursor-pointer hover:bg-[#b89332]"
                          >
                            Badili Nembo
                          </label>
                          {uploadedLogo && (
                            <button
                              onClick={() => setUploadedLogo(null)}
                              className="px-3 py-1.5 bg-rose-500/10 text-rose-600 font-bold rounded-lg"
                            >
                              Rudisha
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Background Wallpaper Upload Box */}
                      <div className="p-4 border-2 border-dashed border-[#e6e2d3] rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 bg-stone-50/50">
                        <span className="text-[10px] font-black uppercase text-stone-500">BACKGROUND IMAGE (UPLOAD)</span>
                        <p className="text-[9px] text-stone-400 max-w-[150px]">PNG, WebP, or JPG · max 2 MB. Saved as WebP wallpaper (1280px).</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setUploadedBg(URL.createObjectURL(file));
                          }}
                          className="hidden"
                          id="bg-upload-input"
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="bg-upload-input"
                            className="px-3 py-1.5 bg-[#cca43b] text-white font-bold rounded-lg cursor-pointer hover:bg-[#b89332]"
                          >
                            Choose File
                          </label>
                          {uploadedBg && (
                            <button
                              onClick={() => setUploadedBg(null)}
                              className="px-3 py-1.5 bg-rose-500/10 text-rose-600 font-bold rounded-lg"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {captiveSubTab === 'style' && (
                <div className="space-y-6">
                  {/* Theme Presets */}
                  <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="border-b border-[#e6e2d3] pb-2">
                      <h3 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">Theme Preset (Rangi na Chapa)</h3>
                      <p className="text-[9px] text-stone-500">Chagua mchanganyiko wa rangi wa kuvutia kwa urahisi.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'wotefy', name: 'Lema Fast WiFi Gold', swatch: '#cca43b' },
                        { id: 'ocean', name: 'Ocean Blue', swatch: '#0284c7' },
                        { id: 'forest', name: 'Forest', swatch: '#047857' },
                        { id: 'sunset', name: 'Sunset Gradient', swatch: '#ea580c' },
                        { id: 'midnight', name: 'Midnight Pro', swatch: '#1c1917' },
                        { id: 'minimal', name: 'Minimal Light', swatch: '#78716c' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPortalThemePreset(p.id as any)}
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            portalThemePreset === p.id
                              ? 'border-[#cca43b] ring-1 ring-[#cca43b] bg-amber-500/5'
                              : 'border-[#e6e2d3] bg-[#fbf9f4] hover:bg-[#f5f2eb]'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-stone-200 shrink-0" style={{ backgroundColor: p.swatch }} />
                          <span className="text-[11px] font-bold text-stone-800 truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Designs */}
                  <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="border-b border-[#e6e2d3] pb-2">
                      <h3 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">Card Design (Muundo wa Kadi)</h3>
                      <p className="text-[9px] text-stone-500">Kila kadi inabadilisha jinsi vifurushi vinavyojitokeza kwenye lango.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'clay', name: 'Clay Layout' },
                        { id: 'grid', name: 'Grid Layout' },
                        { id: 'halo', name: 'Halo Style' },
                        { id: 'lagoon', name: 'Lagoon theme' },
                        { id: 'linen', name: 'Linen pattern' },
                        { id: 'lumen', name: 'Lumen gloss' },
                        { id: 'boutique', name: 'Boutique elegant' },
                        { id: 'showcase', name: 'Showcase grid' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setPortalCardDesign(d.id as any)}
                          className={`p-2 py-3 rounded-xl border text-center transition-all cursor-pointer text-[10px] font-bold ${
                            portalCardDesign === d.id
                              ? 'border-[#cca43b] bg-amber-500/5 text-[#cca43b]'
                              : 'border-[#e6e2d3] bg-[#fbf9f4] text-stone-600 hover:bg-[#f5f2eb]'
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {captiveSubTab === 'legal' && (
                <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs text-xs">
                  <div className="border-b border-[#e6e2d3] pb-2">
                    <h3 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">Legal and Compliance (Sheria & Masharti)</h3>
                    <p className="text-[9px] text-stone-400">Manage terms of service and compliance rules on login.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-[#e6e2d3] rounded-xl">
                      <div>
                        <strong className="text-stone-800 block">Require T&C Agreement</strong>
                        <span className="text-[9px] text-stone-400">Mteja lazima akubali sheria kabla ya kuvinjari</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#cca43b]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-stone-500 font-bold block">Terms of Service Content:</label>
                      <textarea
                        rows={4}
                        defaultValue="Karibu kwenye huduma yetu ya Wi-Fi ya Kasi. Kwa kutumia mtandao huu, unakubali kwamba utatumia mtandao huu kwa njia halali kulingana na sheria za TCRA nchini Tanzania. Wi-Fi sharing haijaruhusiwa..."
                        className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-700 leading-relaxed font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {captiveSubTab === 'save_preview' && (
                <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-6 shadow-xs text-center flex flex-col items-center justify-center min-h-[250px]">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black text-stone-800 uppercase tracking-wide">Portal Design is Ready to Install!</h3>
                  <p className="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed">
                    Umetengeneza chapa na muundo mzuri wa kisasa kwa ajili ya lango la mteja. Bonyeza kitufe hapa chini ili kuhifadhi na kusakinisha kwenye AP zako!
                  </p>
                  <button
                    onClick={() => {
                      updateSettings({ hotspotName: portalBusinessName });
                      showToast('Hongera!', `Muundo mpya wa ${portalBusinessName} umesakinishwa na kupelekwa kwenye Access Points 14 kwa ufanisi halisi!`, 'success');
                    }}
                    className="mt-5 px-8 py-3 bg-[#cca43b] hover:bg-[#b89332] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#cca43b]/20 cursor-pointer"
                  >
                    Save & Install Template
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Live Mobile Preview Device Simulator (Span 5) - FULLY INTERACTIVE CUSTOMER PORTAL */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-center p-4 bg-[#cca43b]/10 border border-[#cca43b]/20 rounded-2xl">
                <span className="text-xs font-black text-[#cca43b] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 animate-bounce" />
                  <span>Interactive Captive Portal Simulator</span>
                </span>
                <p className="text-[10px] text-stone-500 mt-1">
                  Hili ni lango halisi la malipo. Unaweza kugusa na kufanya majaribio ya malipo, kuingiza vocha, au trial hapa hapa kama mteja wa mtaani!
                </p>
              </div>

              {/* Directly render the Interactive CustomerPortal component */}
              <div className="scale-95 origin-top bg-white border border-[#e6e2d3] rounded-[38px] p-2 shadow-2xl relative overflow-hidden">
                <CustomerPortal lang={lang} />
              </div>
            </div>
          </div>
        )}

        {/* LEMA FAST WIFI CHAT & AUTOMATIC ASSISTANT MODULE */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-stone-800">
            {/* Left Column: Chat Assistant Configuration */}
            <div className="lg:col-span-1 bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-5 shadow-xs">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-[#cca43b] animate-pulse" />
                  <span>Chat Auto-Reply</span>
                </h3>
                <p className="text-[10px] text-stone-500">Sanidi jibu la kiotomatiki (Bot response) kwa wateja wanaosubiri malipo kukamilika.</p>
              </div>

              {/* Toggle Auto Reply */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-[#e6e2d3] rounded-2xl text-xs">
                <div>
                  <strong className="text-stone-800 block">Washa Auto-Reply</strong>
                  <span className="text-[9px] text-stone-400">Tuma jibu la dharura sekunde ile ile</span>
                </div>
                <button
                  onClick={() => setIsChatAutoReplyOn(!isChatAutoReplyOn)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                    isChatAutoReplyOn ? 'bg-[#cca43b]' : 'bg-stone-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    isChatAutoReplyOn ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Auto Reply text input */}
              <div className="space-y-1.5 text-xs">
                <label className="text-stone-500 font-bold block">Ujumbe utakaotumwa (Auto-Bot Text):</label>
                <textarea
                  rows={4}
                  value={autoReplyMessageText}
                  onChange={(e) => setAutoReplyMessageText(e.target.value)}
                  disabled={!isChatAutoReplyOn}
                  className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#cca43b] leading-relaxed text-[11px]"
                />
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl text-[10px] text-amber-800 leading-relaxed font-sans">
                <strong>Siri ya Kibiashara:</strong> Wateja wanapopata jibu la haraka kuwa malipo yanashughulikiwa, wanatulia na hawakati tamaa wala kukimbia mtandao wako!
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('whatsapp_bot')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Fungua WhatsApp 100% Care Bot ➔</span>
                </button>
              </div>
            </div>

            {/* Right Column: Simulated WhatsApp Messenger split screen (Span 2) */}
            <div className="lg:col-span-2 bg-white border border-[#e6e2d3] rounded-3xl shadow-xs overflow-hidden flex h-[500px]">
              {/* Active Conversations list pane (Left) */}
              <div className="w-1/3 border-r border-[#e6e2d3] bg-[#fbf9f4] flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-[#e6e2d3] bg-white">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Mawasiliano (Inbox)</span>
                </div>

                <div className="flex-1 divide-y divide-stone-200/60">
                  {chatConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChatMessageId(conv.id)}
                      className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                        selectedChatMessageId === conv.id ? 'bg-[#cca43b]/10 font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      <div className="p-2 bg-white border border-stone-200 rounded-xl text-[#cca43b]">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-stone-800 truncate">{conv.phone}</strong>
                          {conv.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                        <span className="text-[9px] text-stone-400 block truncate font-mono">{conv.mac}</span>
                        <p className="text-[10px] text-stone-500 block truncate font-sans font-medium mt-0.5">
                          {conv.messages[conv.messages.length - 1]?.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Conversation window pane (Right) */}
              <div className="flex-1 flex flex-col justify-between bg-white h-full">
                {(() => {
                  const currentConv = chatConversations.find(c => c.id === selectedChatMessageId) || chatConversations[0];
                  return (
                    <>
                      {/* Active Chat Header */}
                      <div className="p-4 border-b border-[#e6e2d3] flex items-center justify-between">
                        <div>
                          <strong className="text-xs text-stone-800 block">{currentConv.phone}</strong>
                          <span className="text-[9px] font-mono text-stone-400">MAC: {currentConv.mac}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 border border-emerald-200 text-emerald-700">Online</span>
                      </div>

                      {/* Chat Messages flow thread */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbf9f4]/60">
                        {currentConv.messages.map((msg: any, i: number) => {
                          const isClient = msg.sender === 'client';
                          return (
                            <div key={i} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[75%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-xs ${
                                isClient
                                  ? 'bg-white border border-[#e6e2d3] rounded-tl-none text-stone-800 font-medium'
                                  : 'bg-[#cca43b] rounded-tr-none text-white font-bold'
                              }`}>
                                <p>{msg.text}</p>
                                <span className={`text-[8px] font-mono block text-right mt-1 ${
                                  isClient ? 'text-stone-400' : 'text-amber-100'
                                }}`}>{msg.time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Send reply message box */}
                      <div className="p-3 border-t border-[#e6e2d3] bg-white flex gap-2">
                        <input
                          type="text"
                          placeholder="Andika jibu la haraka la msimamizi hapa..."
                          className="flex-1 px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-xs focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (!input.value.trim()) return;
                              
                              setChatConversations(prev => 
                                prev.map(c => c.id === currentConv.id ? {
                                  ...c,
                                  messages: [...c.messages, { sender: 'assistant', text: input.value, time: 'Sasa hivi' }]
                                } : c)
                              );
                              input.value = '';
                            }
                          }}
                        />
                        <button className="px-4 py-2 bg-[#cca43b] hover:bg-[#b89332] text-white rounded-xl text-xs font-black transition-colors cursor-pointer">
                          Send
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* LEMA FAST WIFI 100% AUTOMATED WHATSAPP BOT SUITE */}
        {activeTab === 'whatsapp_bot' && (
          <div className="space-y-6 animate-fadeIn">
            <WhatsAppBotSuite
              onShowToast={showToast}
              onSendAdminAlert={(title, message, severity = 'warning') => {
                const newAlert: SystemAlert = {
                  id: `al-${Date.now()}`,
                  type: 'system',
                  severity,
                  title,
                  message,
                  timestamp: 'Hivi Sasa',
                  read: false
                };
                setAlerts((prev) => [newAlert, ...prev]);
                showToast(title, message, severity === 'error' ? 'warning' : 'info');
              }}
            />
          </div>
        )}

        {/* LEMA FAST WIFI BYPASS MAC BINDING DASHBOARD */}
        {activeTab === 'binding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-stone-800">
            {/* Left Column: New Binding bypass form */}
            <div className="lg:col-span-1 bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-[#cca43b]" />
                  <span>Bind New Device</span>
                </h3>
                <p className="text-[10px] text-stone-500">Ongeza kifaa (kama Smart TV au kishikwambi) kipite captive portal bila kuandika vocha kila siku.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newBindMacAddress || !newBindDeviceName) return;
                const nb = {
                  id: `b-${Date.now()}`,
                  deviceName: newBindDeviceName,
                  mac: newBindMacAddress,
                  status: 'bound',
                  packageName: settings.packages.find(p => p.id === newBindPackageId)?.name || 'Mwezi 1'
                };
                setMacBindings([...macBindings, nb]);
                setNewBindMacAddress('');
                setNewBindDeviceName('');
              }} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-stone-500 font-bold block">Jina la Kifaa (Device Owner/Name):</label>
                  <input
                    type="text"
                    placeholder="LG Smart TV (Sebuleni)"
                    value={newBindDeviceName}
                    onChange={(e) => setNewBindDeviceName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-500 font-bold block">MAC Address ya Kifaa:</label>
                  <input
                    type="text"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={newBindMacAddress}
                    onChange={(e) => setNewBindMacAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-500 font-bold block">Package Allocation Profile:</label>
                  <select
                    value={newBindPackageId}
                    onChange={(e) => setNewBindPackageId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  >
                    {settings.packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Tsh {p.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="w-full py-3 bg-[#cca43b] hover:bg-[#b89332] text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs">
                  Sajili na Bypass Portal
                </button>
              </form>
            </div>

            {/* Right Column: Current Active MAC Bindings (Span 2) */}
            <div className="lg:col-span-2 bg-white border border-[#e6e2d3] rounded-3xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider">Bypass Active MAC Addresses</h3>
                  <p className="text-[10px] text-stone-500">Mtawala anaweza kuzuia au kuondoa kifaa chochote kilichounganishwa hapa.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#cca43b]/10 text-[#cca43b]">
                  {macBindings.length} Devices
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-4">Kifaa / Mmiliki</th>
                      <th className="p-4">MAC Address</th>
                      <th className="p-4">Package Allocated</th>
                      <th className="p-4 text-center">Bypass State</th>
                      <th className="p-4 text-right">Kitendo (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {macBindings.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <strong className="text-stone-800 text-xs block">{item.deviceName}</strong>
                        </td>
                        <td className="p-4 font-mono font-bold text-stone-600 uppercase">{item.mac}</td>
                        <td className="p-4 font-bold text-[#cca43b]">{item.packageName}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setMacBindings(prev => prev.map(b => b.id === item.id ? {
                                ...b,
                                status: b.status === 'bound' ? 'pending' : b.status === 'pending' ? 'blocked' : 'bound'
                              } : b));
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize transition-all cursor-pointer ${
                              item.status === 'bound'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : item.status === 'pending'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                : 'bg-red-50 border-red-200 text-red-700 font-bold'
                            }`}
                          >
                            {item.status}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setMacBindings(macBindings.filter(b => b.id !== item.id))}
                            className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Unbind
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LEMA FAST WIFI SSID & LAN Radio configuration module */}
        {activeTab === 'ssid_lan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn text-stone-800">
            {/* SSID Wireless Network card */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-5 shadow-xs">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-5 h-5 text-[#cca43b] animate-bounce" />
                  <span>Wi-Fi Wireless config (SSID)</span>
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-stone-500 font-bold block">SSID Name (Jina la Wi-Fi mtaani):</label>
                  <input
                    type="text"
                    value={wifiSsidName}
                    onChange={(e) => setWifiSsidName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-black focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">Hili ndilo jina ambalo simu za wateja mtaani wanaliunganisha.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-500 font-bold block">Frequency Band (Nguvu ya Antena):</label>
                  <select
                    value={wifiFrequencyBand}
                    onChange={(e) => setWifiFrequencyBand(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-[#fbf9f4] text-stone-800 font-bold focus:outline-none"
                  >
                    <option value="2.4GHz & 5GHz (Dual Band)">2.4GHz & 5GHz (Dual Band - Fast & Long Range)</option>
                    <option value="2.4GHz Only">2.4GHz Only (Long Range Only)</option>
                    <option value="5GHz Only">5GHz Only (Super Fast Only)</option>
                  </select>
                </div>

                {/* Client Isolation Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-[#e6e2d3] rounded-2xl text-xs">
                  <div>
                    <strong className="text-stone-800 block">Washa Client Isolation (Ulinzi)</strong>
                    <span className="text-[9px] text-stone-400">Zuia wateja kuibiana bando au hotspot</span>
                  </div>
                  <button
                    onClick={() => setWifiClientIsolation(!wifiClientIsolation)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                      wifiClientIsolation ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      wifiClientIsolation ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* LAN subnet pool card */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider">Subnets & IP Pool routing</h3>
                <p className="text-[10px] text-stone-500">Mlipuko wa IP za Router kwa wateja waliopo.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-stone-50 border border-[#e6e2d3] rounded-xl space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold block">IP GATEWAY ADRESS</span>
                  <strong className="font-mono text-stone-700 text-xs">192.168.88.1</strong>
                </div>

                <div className="p-3 bg-stone-50 border border-[#e6e2d3] rounded-xl space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold block">DHCP POOL ALLOCATION</span>
                  <strong className="font-mono text-stone-700 text-xs">192.168.88.10 - 192.168.88.254 (Subnet 24)</strong>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-emerald-800">
                  <span className="text-[10px] font-bold block">DNS ROUTING ACTIVE</span>
                  <strong className="font-mono text-xs block">Cloudflare Primary (1.1.1.1) · Google (8.8.8.8)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEMA FAST WIFI ANTI-TETHERING & DEVICE FINGERPRINTING MODULE */}
        {activeTab === 'anti_tethering' && (
          <AntiTetheringManager
            hotspotName={settings.hotspotName || 'Lema Fast WiFi'}
            onShowToast={showToast}
          />
        )}

        {/* 8. MODULE: ADVERTS */}
        {activeTab === 'adverts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span>Kampeni ya Matangazo Kwenye Portal (WiFi Ads)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Pata hela za ziada! Weka matangazo ya wafanyabiashara wa mtaani kwako (kama mabango ya maduka au biashara za chakula) ambayo yataonekana kabla ya mteja kuunganishwa kwenye mtandao.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Jina la Kampeni (Campaign Title):</label>
                  <input
                    type="text"
                    placeholder="Mchele Safi kutoka Kyela"
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Mfadhili (Sponsor/Business Name):</label>
                  <input
                    type="text"
                    placeholder="Duka la Chakula Kyela"
                    value={newAdSponsor}
                    onChange={(e) => setNewAdSponsor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAdTitle) return;
                      const na = {
                        id: `ad-${Date.now()}`,
                        title: newAdTitle,
                        sponsor: newAdSponsor || 'Sponsor',
                        impressions: 0,
                        views: 0,
                        status: 'active',
                        banner: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&q=80&w=400'
                      };
                      setAdverts([...adverts, na]);
                      setNewAdTitle('');
                      setNewAdSponsor('');
                    }}
                    className="w-full py-2 font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px]"
                  >
                    Weka Tangazo
                  </button>
                </div>
              </div>
            </div>

            {/* Ad campaigns list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {adverts.map((ad) => (
                <div key={ad.id} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex gap-4">
                  <img
                    src={ad.banner}
                    alt={ad.title}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs font-bold block truncate">{ad.title}</strong>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase text-[9px] shrink-0">Live</span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-sans">Business: <strong className="text-white font-sans">{ad.sponsor}</strong></p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                      <div className="p-1.5 bg-stone-950 border border-stone-850 rounded text-center">
                        <span className="text-stone-400 block text-[9px] font-sans">Impressions</span>
                        <strong className="text-white text-xs">{ad.impressions}</strong>
                      </div>
                      <div className="p-1.5 bg-stone-950 border border-stone-850 rounded text-center">
                        <span className="text-stone-400 block text-[9px] font-sans">Clicks/Views</span>
                        <strong className="text-amber-400 text-xs">{ad.views}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. MODULE: ONLINE USERS (LIVE SESSIONS) */}
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>Wateja Waliopo Kwenye Mtandao Sekunde Hii (Live Sessions)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Unaweza kukata muunganisho wa mteja yeyote hapa punde tu unapohitaji.</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase font-mono">
                      <th className="p-4">Vocha</th>
                      <th className="p-4">IP / MAC Address</th>
                      <th className="p-4">Muda uliounganishwa (Uptime)</th>
                      <th className="p-4">Kifurushi / Kikomo</th>
                      <th className="p-4">Kasi ya Live (Download / Upload)</th>
                      <th className="p-4">Kifurushi cha Data (Used / Limit)</th>
                      <th className="p-4">Kitendo (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {activeSessions.length > 0 ? (
                      activeSessions.map((s) => (
                        <SessionRow 
                          key={s.id} 
                          session={s} 
                          onDisconnect={disconnectSession} 
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 font-sans">
                          Hakuna mteja aliyounganishwa mtaani kwa sekunde hii.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 10. MODULE: USERS & DEVICES */}
        {activeTab === 'users_devices' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>Orodha ya Vifaa & Simu za Wateja (Users & Devices)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Uchambuzi wa kihistoria wa vifaa ambavyo vimeshajiunga kwenye mtandao wako, ikionyesha Hostnames na chapa za simu.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Device Hostname</th>
                      <th className="p-4">MAC Address</th>
                      <th className="p-4">Last Active Site</th>
                      <th className="p-4">Bandwidth Consumed</th>
                      <th className="p-4">Hali (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {activeSessions.length > 0 ? (
                      activeSessions.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-850/30">
                          <td className="p-4 font-bold text-white font-sans">{s.phoneNumber ? `Mteja (${s.phoneNumber})` : `Kifaa (${s.voucherCode})`}</td>
                          <td className="p-4 text-sky-400 font-bold">{s.macAddress}</td>
                          <td className="p-4 font-sans text-stone-300">{s.ipAddress}</td>
                          <td className="p-4 text-emerald-400 font-bold">{(s.bytesDown / 1024 / 1024).toFixed(1)} MB</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold">Active Now</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500 font-sans">
                          Hakuna vifaa vilivyounganishwa kwenye mtandao kwa sasa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 11. MODULE: ROUTERS */}
        {activeTab === 'routers' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Linked Routers / Controllers Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-sky-400" />
                  <span>Routers & Controllers ({routers.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQrEquipmentModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Skani QR ya Router</span>
                  </button>
                  <button
                    onClick={() => setShowAddRouterForm(!showAddRouterForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Unganisha Router Mpya</span>
                  </button>
                </div>
              </div>

              {/* Add Router Wizard Form */}
              {showAddRouterForm && (
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-4 text-xs">
                  <h4 className="font-bold text-white text-xs border-b border-stone-800 pb-2">
                    Hatua ya 1: Chagua Chapa ya Router/Controller
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRouterType('omada')}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                        newRouterType === 'omada'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                      }`}
                    >
                      TP-Link Omada
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRouterType('mikrotik')}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                        newRouterType === 'mikrotik'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                      }`}
                    >
                      MikroTik
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRouterType('openwrt')}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                        newRouterType === 'openwrt'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-stone-800 text-stone-400 hover:bg-stone-900'
                      }`}
                    >
                      OpenWrt / Linux
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1">Jina ya Kifaa (Router Name):</label>
                      <input
                        type="text"
                        placeholder="Mshikamano AP Main"
                        value={newRouterName}
                        onChange={(e) => setNewRouterName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Eneo (Site/Location):</label>
                      <input
                        type="text"
                        placeholder="Mshikamano Site"
                        value={newRouterSite}
                        onChange={(e) => setNewRouterSite(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                      />
                    </div>
                  </div>

                  {newRouterType === 'omada' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-stone-400 block mb-1">Omada Controller URL / Domain:</label>
                        <input
                          type="text"
                          value={newRouterControllerUrl}
                          onChange={(e) => setNewRouterControllerUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs font-mono text-blue-400"
                        />
                      </div>
                      <div className="flex items-end gap-2.5">
                        <div className="flex-1">
                          <label className="text-stone-400 block mb-1">RADIUS NAS IP Address (Autodetected):</label>
                          <input
                            type="text"
                            disabled
                            placeholder="Kagua sites kwanza..."
                            value={newRouterNasIp}
                            className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-900 text-stone-300 text-xs font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFindingSites(true);
                            setTimeout(() => {
                              setIsFindingSites(false);
                              setNewRouterNasIp('102.223.14.88');
                              setSiteFound(true);
                            }, 1500);
                          }}
                          className="px-4 py-2 font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px] flex items-center justify-center min-w-[120px]"
                        >
                          {isFindingSites ? (
                            <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Find Sites</span>
                          )}
                        </button>
                      </div>
                      {siteFound && (
                        <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Site imepatikana kwenye controller yako! RADIUS NAS IP imesanidiwa.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRouterForm(false);
                        setSiteFound(false);
                      }}
                      className="px-3 py-1.5 text-stone-400 hover:text-white"
                    >
                      Ghairi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRouterName) return;
                        const nr = {
                          id: `r-${Date.now()}`,
                          name: newRouterName,
                          type: newRouterType === 'omada' ? 'TP-Link Omada' : newRouterType === 'mikrotik' ? 'MikroTik' : 'OpenWrt',
                          site: newRouterSite,
                          status: 'connected',
                          nasIp: newRouterNasIp || '192.168.88.1',
                          controllerUrl: newRouterControllerUrl,
                        };
                        setRouters([...routers, nr]);
                        setShowAddRouterForm(false);
                        setNewRouterName('');
                        setSiteFound(false);
                        setNewRouterNasIp('');
                      }}
                      className="px-4 py-1.5 font-bold text-stone-950 bg-sky-400 hover:bg-sky-300 rounded-lg"
                    >
                      Unganisha Kifaa
                    </button>
                  </div>
                </div>
              )}

              {/* Routers List */}
              <div className="space-y-3">
                {routers.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-stone-950 border border-stone-850 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 mt-1">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs">{r.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active & Connected
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400 font-mono">
                          <span>Chapa: <strong className="text-white font-sans">{r.type}</strong></span>
                          <span>Eneo: <strong className="text-white font-sans">{r.site}</strong></span>
                          <span>RADIUS NAS IP: <strong className="text-white">{r.nasIp}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setRouters(routers.filter((item) => item.id !== r.id))}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors"
                      title="Futa kifaa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 12. MODULE: ACCESS POINTS */}
        {activeTab === 'aps' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Claimed Access Points (APs) Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>Access Points / Antennas ({accessPoints.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQrEquipmentModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <QrCode className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Skani QR ya AP</span>
                  </button>
                  <button
                    onClick={() => {
                      setWizardStep('brand');
                      setCapturedStickerImg(null);
                      setWizardLogs([]);
                      setShowAiApWizard(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
                    <span>Sajili AP kwa Lema AI ✨</span>
                  </button>
                  <button
                    onClick={() => setShowClaimApForm(!showClaimApForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adopt Manually</span>
                  </button>
                </div>
              </div>

              {/* Claim AP Form */}
              {showClaimApForm && (
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-4 text-xs">
                  <h4 className="font-bold text-white text-xs border-b border-stone-800 pb-2">
                    Sajili Access Point Mpya Kwenye Controller (SaaS Claim)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1">Andika MAC Address ya Kifaa:</label>
                      <input
                        type="text"
                        placeholder="50:C7:BF:70:E2:B0"
                        value={claimApMac}
                        onChange={(e) => setClaimApMac(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white font-mono text-xs uppercase"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">Inapatikana nyuma ya lebo ya antenna au AP yako.</span>
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Model / Chapa:</label>
                      <select
                        value={claimApModel}
                        onChange={(e) => setClaimApModel(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                      >
                        <option value="EAP225-Outdoor">TP-Link EAP225-Outdoor</option>
                        <option value="EAP110-Outdoor">TP-Link EAP110-Outdoor</option>
                        <option value="EAP610-Outdoor">TP-Link EAP610-Outdoor (Wi-Fi 6)</option>
                        <option value="Ruijie RG-RAP6201">Ruijie RAP6201 Outdoor</option>
                      </select>
                    </div>
                  </div>

                  {isClaimingAp ? (
                    <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span className="font-semibold text-emerald-400 animate-pulse">{apClaimStep}</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full" style={{ width: '70%', transition: 'width 2s' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setShowClaimApForm(false)}
                        className="px-3 py-1.5 text-stone-400 hover:text-white"
                      >
                        Ghairi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!claimApMac) return;
                          setIsClaimingAp(true);
                          setApClaimStep('1. Inatafuta vifaa vilivyopo kwenye mtandao...');
                          
                          setTimeout(() => {
                            setApClaimStep('2. Inasajili MAC Address kwenye Controller ya Mtaa WiFi...');
                          }, 1000);

                          setTimeout(() => {
                            setApClaimStep('3. Inasubiri AP ikubali (Adopting Device)...');
                          }, 2200);

                          setTimeout(() => {
                            const newAp = {
                              mac: claimApMac,
                              model: claimApModel,
                              site: claimApSite,
                              status: 'connected',
                              uptime: 'Sekunde chache zilizopita'
                            };
                            setAccessPoints([...accessPoints, newAp]);
                            setIsClaimingAp(false);
                            setShowClaimApForm(false);
                            setClaimApMac('');
                          }, 3500);
                        }}
                        className="px-4 py-1.5 font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
                      >
                        Anza Claim & Adopt
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* APs List */}
              <div className="space-y-3">
                {accessPoints.map((ap) => (
                  <div
                    key={ap.mac}
                    className="p-4 bg-stone-950 border border-stone-850 rounded-xl flex items-center justify-between gap-4 text-xs font-mono"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1 font-sans">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-sans">
                          <h4 className="font-bold text-white text-xs">{ap.model}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Adopted & Active
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400">
                          <span>MAC Address: <strong className="text-white uppercase">{ap.mac}</strong></span>
                          <span>Eneo: <strong className="text-white font-sans">{ap.site}</strong></span>
                          <span>Muda Halisi (Uptime): <strong className="text-white font-sans">{ap.uptime}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setAccessPoints(accessPoints.filter((item) => item.mac !== ap.mac))}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors"
                      title="Ondoa AP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 13. MODULE: SITES / LOCATIONS */}
        {activeTab === 'sites' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>Simamia Maeneo Yako ya WiFi (Sites Management)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Panga mtandao wako katika maeneo tofauti ya kibiashara (Sites) mfano: Mshikamano, Kariakoo, au Sokoni. Hii inaruhusu kuona mauzo ya kila eneo peke yake!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Jina la Site:</label>
                  <input
                    type="text"
                    placeholder="Kariakoo Sokoni"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Anwani ya Kijiografia (Location):</label>
                  <input
                    type="text"
                    placeholder="Msimbazi Street Ghorofa ya 2"
                    value={newSiteLoc}
                    onChange={(e) => setNewSiteLoc(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSiteName) return;
                      const ns = {
                        id: `site-${Date.now()}`,
                        name: newSiteName,
                        location: newSiteLoc || 'Location',
                        apCount: 0,
                        userCount: 0,
                        status: 'active'
                      };
                      setSites([...sites, ns]);
                      setNewSiteName('');
                      setNewSiteLoc('');
                    }}
                    className="w-full py-2 font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer h-[38px]"
                  >
                    Tengeneza Site
                  </button>
                </div>
              </div>
            </div>

            {/* Sites list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {sites.map((s) => (
                <div key={s.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div>
                      <strong className="text-white text-sm block">{s.name}</strong>
                      <span className="text-[10px] text-stone-400 font-sans mt-0.5 block">{s.location}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold uppercase text-[9px]">Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                    <div className="p-2.5 bg-stone-950 border border-stone-850 rounded-xl">
                      <span className="text-stone-400 block font-sans">Access Points</span>
                      <strong className="text-white text-sm font-sans">{s.apCount} APs</strong>
                    </div>
                    <div className="p-2.5 bg-stone-950 border border-stone-850 rounded-xl">
                      <span className="text-stone-400 block font-sans">Wateja Active</span>
                      <strong className="text-amber-400 text-sm font-sans">{s.userCount} users</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. MODULE: EQUIPMENT & INVENTORY */}
        {(activeTab === 'equipment' || (activeTab as string) === 'inventory') && (
          <div className="space-y-6 animate-fadeIn">
            <InventoryModule
              inventory={equipmentInventory}
              onOpenScanner={() => setShowQrEquipmentModal(true)}
              onRemoveEquipment={(id) => {
                setEquipmentInventory((prev) => prev.filter((i) => i.id !== id));
                showToast('Kifaa Kimeondolewa', 'Kifaa kimefutwa kwenye stoo ya vifaa.', 'info');
              }}
              onAddManual={(item) => {
                setEquipmentInventory((prev) => [item, ...prev]);
                showToast('Kifaa Kimesajiliwa', `${item.name} kimesajiliwa kwenye stoo.`, 'success');
              }}
              showToast={showToast}
            />

            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Mwongozo wa Vifaa Vinavyopendekezwa (Recommended Hardware Guide)</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Tathmini ya vifaa muhimu vya kuunganisha mtaani kwako ili kuendesha biashara ya Wi-Fi kwa ufanisi wa 100%:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs">1. Access Point (Antenna):</strong>
                    <span className="text-amber-400 font-bold">Inashauriwa (Essential)</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    TP-Link EAP110-Outdoor au EAP225-Outdoor. Hii inarusha mawimbi ya Wi-Fi kwa mita 100-200 na kuleta ukurasa wa vocha/malipo (Captive Portal).
                  </p>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs">2. Mfumo wa Power / UPS Backup:</strong>
                    <span className="text-amber-400 font-bold">Inashauriwa (Essential)</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Inahakikisha mtandao wako hauzimiki punde umeme wa gridi mtaani unapokatika. Hii inatunza uaminifu wa mtandao wako kwa wateja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 15. MODULE: INVOICES */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Historia ya Ankara / Receipts za Wateja (Invoices)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Orodha ya receipts zote za malipo zilizotengenezwa na mfumo baada ya mteja kulipia vocha.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Invoice Number</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Package Select</th>
                      <th className="p-4">Expiry date</th>
                      <th className="p-4">Hali (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    <tr className="hover:bg-stone-850/30">
                      <td className="p-4 font-bold text-white">INV-HOTSPOT-09941A</td>
                      <td className="p-4 font-sans text-stone-300">Hotspot Customer</td>
                      <td className="p-4 text-emerald-400 font-bold">Tsh 1,000</td>
                      <td className="p-4 font-sans text-white font-bold">Saa 24 (Siku 1)</td>
                      <td className="p-4 text-stone-400">06 Oct 2026, 08:00 AM</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold">PAID</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-850/30">
                      <td className="p-4 font-bold text-white">INV-HOTSPOT-08812D</td>
                      <td className="p-4 font-sans text-stone-300">Hotspot Customer</td>
                      <td className="p-4 text-emerald-400 font-bold">Tsh 500</td>
                      <td className="p-4 font-sans text-white font-bold">Saa 2 za Haraka</td>
                      <td className="p-4 text-stone-400">05 Oct 2026, 06:12 PM</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold">PAID</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 16. MODULE: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span>Miamala ya Malipo ya Simu (Transactions History)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Miamala yote iliyolipwa moja kwa moja kupitia M-Pesa, Mixx by Yas (Tigo Pesa) na Airtel Money.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold text-[11px] uppercase">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Network</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Vocha Code</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-stone-850/30">
                          <td className="p-4 font-bold text-white">{t.referenceNumber}</td>
                          <td className="p-4 font-sans text-stone-300">{t.phoneNumber}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                              t.network === 'mpesa' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                            }`}>
                              {t.network}
                            </span>
                          </td>
                          <td className="p-4 text-emerald-400 font-bold">Tsh {t.amount.toLocaleString()}</td>
                          <td className="p-4 font-sans text-white font-bold">{t.packageName}</td>
                          <td className="p-4 font-bold text-amber-400">{t.voucherCode}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold">Completed</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 font-sans">
                          Hakuna muamala uliolipiwa bado kwenye database yako ya majaribio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 17. MODULE: PAYOUT ACCOUNTS (FINANCE DEPOSIT) */}
        {activeTab === 'payout' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Clarification Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Jibu la Moja kwa Moja: Pesa Inakwenda kwa Nani?</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Pesa Zote Zinaingia Moja kwa Moja Kwenye <span className="text-emerald-400">Akaunti Yako Mwenyewe</span>!
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                Mteja anapolipa kwa M-Pesa, Mixx by Yas, au Airtel Money, fedha <strong>hazipiti kwa mtu wa kati wala hazibaki kwenye mfumo</strong>. Zinaingia papo hapo kwenye <strong>Lipa Namba (Till)</strong> yako ya Vodacom/Mixx by Yas au kwenye <strong>Akaunti yako ya Benki</strong> uliyoiweka hapa chini!
              </p>
            </div>

            {/* Payout accounts manager */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>Sanidi Akaunti yako ya Kupokelea Malipo</span>
              </h3>
              <p className="text-xs text-stone-400">
                Ingiza anwani halali ili Selcom au Beem Africa iweze kuelekeza malipo ya wateja kwenye akaunti yako kila malipo yanapokamilika mtaani:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Mbinu ya Kupokelea Pesa (Payout Method):</label>
                  <select
                    value={settings.payoutMethod}
                    onChange={(e) => updateSettings({ payoutMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="lipa_namba">Lipa Namba ya Vodacom / Mixx by Yas (Merchant Till)</option>
                    <option value="bank">Akaunti ya Benki (CRDB, NMB, NBC)</option>
                    <option value="mobile_phone">Namba ya Simu Binafsi (M-Pesa / Mixx by Yas / Airtel Money)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Jina Kamili la Mmiliki wa Akaunti:</label>
                  <input
                    type="text"
                    value={settings.accountOwnerName}
                    onChange={(e) => updateSettings({ accountOwnerName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Nambari ya Akaunti / Lipa Namba:</label>
                  <input
                    type="text"
                    value={settings.payoutAccount}
                    onChange={(e) => updateSettings({ payoutAccount: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white font-mono text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {settings.payoutMethod === 'bank' && (
                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Jina la Benki:</label>
                    <input
                      type="text"
                      value={settings.payoutBankName || ''}
                      onChange={(e) => updateSettings({ payoutBankName: e.target.value })}
                      placeholder="Mfano: CRDB Bank"
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-850 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 18. MODULE: SaaS MULTI-TENANT & SUBSCRIPTION MANAGEMENT */}
        {activeTab === 'saas_management' && (
          <div className="space-y-8 animate-fadeIn text-[#3a3431]">
            
            {/* Top Clarification SaaS Header */}
            <div className="bg-gradient-to-r from-emerald-950 to-stone-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Lema Fast WiFi - SaaS Engine (Uza Mfumo wako)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Anzisha Biashara ya Kukodisha Mfumo Wako kwa <span className="text-emerald-400">Wamiliki Wengine wa WiFi</span>!
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-4xl">
                Ukiwa na mfumo wako wa <strong>Lema Fast WiFi</strong>, unaweza kufanya biashara kubwa zaidi ya kuwa <strong>SaaS Provider</strong>. Badala ya kuuza bando mtaani tu, unaweza kuwaweka wamiliki wengine wa WiFi (Hotspot Operators) kwenye mfumo wako, na kila mmoja akawa na Dashboard yake na kukulipa <strong>TZS 10,000 kila mwezi</strong>. Wasipolipa, mfumo unajifunga kiotomatiki!
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold font-mono">
                  SaaS Model: Multi-Tenancy
                </span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold font-mono">
                  Subscription: TZS 10,000 / mwezi
                </span>
                <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg text-xs font-bold font-mono">
                  Auto-Cutoff: RADIUS & OpenAPI Block
                </span>
              </div>
            </div>

            {/* SaaS Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-1.5 shadow-xs">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">Wateja wa Mfumo (SaaS Tenants)</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#231f1c] font-sans">{saasTenants.length}</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-stone-500 block">Wamiliki wa Hotspot waliosajiliwa</span>
              </div>

              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-1.5 shadow-xs">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">Ingizo kwa Mwezi (MRR)</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#231f1c] font-sans">
                    TZS {(saasTenants.length * 10000).toLocaleString()}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block">✓ 100% Uhakika wa Kila Mwezi</span>
              </div>

              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-1.5 shadow-xs">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">Wanaolipa vizuri (Active)</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">
                    {saasTenants.filter(t => t.status === 'active').length}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    🟢
                  </div>
                </div>
                <span className="text-[10px] text-stone-500 block">Wanapata huduma bila usumbufu</span>
              </div>

              <div className="bg-white border border-[#e6e2d3] rounded-2xl p-5 space-y-1.5 shadow-xs">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">Zilizofungwa / Overdue</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 font-sans">
                    {saasTenants.filter(t => t.status !== 'active').length}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    🔴
                  </div>
                </div>
                <span className="text-[10px] text-rose-600 font-bold block">Wamefungiwa kupata wateja</span>
              </div>
            </div>

            {/* Split Screen Control Area: Left Tenant List, Right Simulator & Config */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: TENANT LIST & MANAGER (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-6 shadow-xs">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d3] pb-4">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-black text-[#231f1c] uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span>Orodha ya SaaS Tenants</span>
                      </h3>
                      <p className="text-[11px] text-stone-500 font-medium">Bofya jina la mteja ili kuona wasifu wake na kusimulia malipo yake.</p>
                    </div>

                    <button
                      onClick={() => setShowAddTenantForm(!showAddTenantForm)}
                      className="px-3.5 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sajili Mteja Mpya</span>
                    </button>
                  </div>

                  {/* Add Tenant Form */}
                  {showAddTenantForm && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newTenantBusinessName || !newTenantOwnerName || !newTenantPhone) return;
                        const nt = {
                          id: `tenant-${Date.now()}`,
                          businessName: newTenantBusinessName,
                          ownerName: newTenantOwnerName,
                          phone: newTenantPhone,
                          location: newTenantLocation,
                          apCount: newTenantApCount,
                          routerCount: newTenantRouterCount,
                          monthlyFee: 10000,
                          status: 'active',
                          nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('sw-TZ'),
                          joinedDate: new Date().toISOString().split('T')[0],
                          lastPaymentRef: 'MPESA-REG-' + Math.floor(1000 + Math.random() * 9000),
                          paymentHistory: [
                            { date: new Date().toISOString().split('T')[0], amount: 10000, ref: 'MPESA-INIT', status: 'completed' }
                          ]
                        };
                        setSaasTenants([nt, ...saasTenants]);
                        setSelectedTenantId(nt.id);
                        setShowAddTenantForm(false);
                        setNewTenantBusinessName('');
                        setNewTenantOwnerName('');
                        setNewTenantPhone('');
                        showToast('Mteja Aliyesajiliwa', `Mteja ${nt.businessName} amefanikiwa kuongezwa kwenye SaaS!`, 'success');
                      }} 
                      className="p-5 bg-stone-50 border border-[#e6e2d3] rounded-2xl space-y-4 text-xs"
                    >
                      <h4 className="font-bold text-[#231f1c] text-xs uppercase border-b border-stone-200 pb-2">
                        Fomu ya Kusajili Operator Mpya (New Tenant)
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">JINA LA BIASHARA YA WIFI:</label>
                          <input
                            type="text"
                            placeholder="Mfano: Mwenge High Speed WiFi"
                            value={newTenantBusinessName}
                            onChange={(e) => setNewTenantBusinessName(e.target.value)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">JINA LA MMILIKI:</label>
                          <input
                            type="text"
                            placeholder="Mfano: Kassim Selemani"
                            value={newTenantOwnerName}
                            onChange={(e) => setNewTenantOwnerName(e.target.value)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">NAMBA YA SIMU (WHATSAPP):</label>
                          <input
                            type="text"
                            placeholder="Mfano: 0712345678"
                            value={newTenantPhone}
                            onChange={(e) => setNewTenantPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">ENEO (LOCATION):</label>
                          <input
                            type="text"
                            placeholder="Mfano: Sinza, DSM"
                            value={newTenantLocation}
                            onChange={(e) => setNewTenantLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">IDADI YA ACCESS POINTS (APs):</label>
                          <input
                            type="number"
                            min={1}
                            value={newTenantApCount}
                            onChange={(e) => setNewTenantApCount(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-bold block">IDADI YA ROUTERS:</label>
                          <input
                            type="number"
                            min={1}
                            value={newTenantRouterCount}
                            onChange={(e) => setNewTenantRouterCount(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-[#e6e2d3] rounded-xl bg-white text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setShowAddTenantForm(false)}
                          className="px-4 py-2 text-stone-500 font-bold hover:text-stone-800"
                        >
                          Ghairi
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                        >
                          Hifadhi Mteja
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tenant Database Table */}
                  <div className="overflow-x-auto border border-[#e6e2d3] rounded-2xl bg-stone-50/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100 border-b border-[#e6e2d3] text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                          <th className="p-4">Biashara / WiFi Name</th>
                          <th className="p-4">Msimamizi</th>
                          <th className="p-4">Mwezi / Fee</th>
                          <th className="p-4">Siku ya Kulipia</th>
                          <th className="p-4">Hali (Status)</th>
                          <th className="p-4">Vifaa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6e2d3]">
                        {saasTenants.map((tenant) => {
                          const isSelected = selectedTenantId === tenant.id;
                          return (
                            <tr 
                              key={tenant.id} 
                              onClick={() => setSelectedTenantId(tenant.id)}
                              className={`hover:bg-stone-100/70 transition-all cursor-pointer ${
                                isSelected ? 'bg-emerald-500/5 font-bold border-l-4 border-emerald-500' : ''
                              }`}
                            >
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <div className="text-stone-850 font-bold text-xs">{tenant.businessName}</div>
                                  <div className="text-[10px] text-stone-400 font-mono">{tenant.location}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <div className="text-stone-700">{tenant.ownerName}</div>
                                  <div className="text-[10px] text-stone-400 font-mono">{tenant.phone}</div>
                                </div>
                              </td>
                              <td className="p-4 text-emerald-600 font-bold font-mono">
                                TZS {tenant.monthlyFee.toLocaleString()}
                              </td>
                              <td className="p-4 text-stone-600">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{tenant.nextRenewal}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                  tenant.status === 'active'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : tenant.status === 'overdue'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                }`}>
                                  {tenant.status === 'active' ? '🟢 Active' : tenant.status === 'overdue' ? '⚠️ Overdue' : '🔴 Suspended'}
                                </span>
                              </td>
                              <td className="p-4 text-stone-500 font-mono text-[10px]">
                                📡 {tenant.apCount} APs | 💻 {tenant.routerCount} Rtr
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SELECTED TENANT DETAILS & BILLING HISTORY (Visible when selected) */}
                {(() => {
                  const tenant = saasTenants.find(t => t.id === selectedTenantId);
                  if (!tenant) return null;
                  return (
                    <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-6 shadow-xs animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider font-mono">Wasifu wa Tenant aliyechaguliwa</span>
                          <h4 className="text-lg font-black text-[#231f1c]">{tenant.businessName} ({tenant.ownerName})</h4>
                          <p className="text-xs text-stone-400">Nambari ya simu: <span className="font-mono text-stone-600 font-bold">{tenant.phone}</span> | Enzi: {tenant.location}</p>
                        </div>

                        {/* Subscriber Operations Actions Box */}
                        <div className="flex flex-wrap items-center gap-2">
                          {tenant.status !== 'active' && (
                            <button
                              onClick={() => {
                                const updated = saasTenants.map(t => {
                                  if (t.id === tenant.id) {
                                    const nextRenewalParts = t.nextRenewal.split('/');
                                    // Set renewal 30 days from now
                                    const renewDate = new Date();
                                    renewDate.setDate(renewDate.getDate() + 30);
                                    
                                    const mockPay = {
                                      date: new Date().toISOString().split('T')[0],
                                      amount: 10000,
                                      ref: 'MPESA-TX' + Math.floor(100000 + Math.random() * 900000),
                                      status: 'completed'
                                    };
                                    return {
                                      ...t,
                                      status: 'active',
                                      nextRenewal: renewDate.toLocaleDateString('sw-TZ'),
                                      paymentHistory: [mockPay, ...t.paymentHistory],
                                      lastPaymentRef: mockPay.ref
                                    };
                                  }
                                  return t;
                                });
                                setSaasTenants(updated);
                                showToast('Sub Iliyolipiwa', `Mteja ${tenant.businessName} amefanikiwa kulipia TZS 10,000! Mfumo umefunguka kiotomatiki.`, 'success');
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Kuza muamala wa 10,000 na kusogeza muda wa subscription"
                            >
                              <BadgeCheck className="w-3.5 h-3.5 text-white" />
                              <span>Pokea Malipo (Lipa 10k)</span>
                            </button>
                          )}

                          {tenant.status === 'active' && (
                            <button
                              onClick={() => {
                                const updated = saasTenants.map(t => {
                                  if (t.id === tenant.id) {
                                    return { ...t, status: 'suspended' };
                                  }
                                  return t;
                                });
                                setSaasTenants(updated);
                                showToast('Huduma Imefungwa', `Mfumo wa ${tenant.businessName} umefungwa kwa dharura!`, 'warning');
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Zuia watumiaji wote wasipate intaneti kupitia AP za operator huyu"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Funga Huduma (Cut-Off)</span>
                            </button>
                          )}

                          {tenant.status === 'suspended' && (
                            <button
                              onClick={() => {
                                const updated = saasTenants.map(t => {
                                  if (t.id === tenant.id) {
                                    return { ...t, status: 'active' };
                                  }
                                  return t;
                                });
                                setSaasTenants(updated);
                                showToast('Huduma Imerejeshwa', `Mfumo wa ${tenant.businessName} umefunguliwa na umerudi online!`, 'success');
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Rudisha Online</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSaasTenants(saasTenants.filter(t => t.id !== tenant.id));
                              showToast('Mteja Amefutwa', `Mteja ${tenant.businessName} amefutwa kwenye mfumo.`, 'info');
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-rose-600 rounded-lg"
                            title="Futa Tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Device Assets & Billing Details Split Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Device Assets registered under this Operator */}
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
                          <h5 className="text-[10px] font-black text-stone-500 uppercase tracking-widest block border-b border-stone-100 pb-1">Vifaa vya Kituo (Adopted Gear)</h5>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-100 shadow-2xs">
                              <div>
                                <strong className="font-semibold text-stone-800 block">Router Kuu (Gateway)</strong>
                                <span className="text-[10px] font-mono text-stone-400">TP-Link Omada ER605</span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-100 text-sky-700 font-bold">adopted</span>
                            </div>

                            {Array.from({ length: tenant.apCount }).map((_, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-100 shadow-2xs">
                                <div>
                                  <strong className="font-semibold text-stone-800 block">AP {idx + 1} ({idx === 0 ? 'Mnara Kuu' : 'Extension'})</strong>
                                  <span className="text-[10px] font-mono text-stone-400">RG-RAP62-OD AX3000 (0{idx + 1}:5A:BC:E0)</span>
                                </div>
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 font-bold">online</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Logs Database */}
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
                          <h5 className="text-[10px] font-black text-stone-500 uppercase tracking-widest block border-b border-stone-100 pb-1">Historia ya Malipo (Sub Invoices)</h5>
                          
                          <div className="space-y-2 text-xs">
                            {tenant.paymentHistory.map((invoice: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-100 shadow-2xs font-mono">
                                <div>
                                  <div className="text-stone-800 text-xs font-bold font-sans">TZS {invoice.amount.toLocaleString()}</div>
                                  <div className="text-[10px] text-stone-400">{invoice.date} · Ref: {invoice.ref}</div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 border border-emerald-200 text-emerald-700 font-sans font-bold">
                                  PAID
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* RIGHT COLUMN: SIMULATION LOCK & TECH EXPLANATION (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. INTERACTIVE PORTAL LOCK SCREEN SIMULATOR */}
                <div className="bg-[#231f1c] text-white rounded-3xl p-6 space-y-5 border border-stone-800 shadow-2xl relative overflow-hidden">
                  
                  {/* Neon Glow status depending on active tenant status */}
                  {(() => {
                    const tenant = saasTenants.find(t => t.id === selectedTenantId) || saasTenants[0];
                    const isSuspended = tenant.status === 'suspended';
                    const isOverdue = tenant.status === 'overdue';
                    
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                          <div>
                            <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest font-mono">Simulisha Kwenye Simu ya Guest</span>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>Lango la {tenant.businessName}</span>
                            </h4>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block font-bold font-mono">TENANT STATUS:</span>
                            <span className={`text-[10px] font-black uppercase ${
                              isSuspended ? 'text-red-400' : isOverdue ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {tenant.status}
                            </span>
                          </div>
                        </div>

                        {/* Simulated Phone Frame Container */}
                        <div className="mx-auto w-[250px] bg-stone-900 border-[6px] border-stone-750 rounded-[2.2rem] h-[450px] relative overflow-hidden shadow-2xl flex flex-col justify-between">
                          
                          {/* Top Camera Notch */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-stone-950 rounded-full z-30 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40 ml-4" />
                          </div>

                          {/* Top Signal Bar */}
                          <div className="p-3.5 pt-7 pb-1 bg-stone-950 flex items-center justify-between text-[9px] font-bold text-stone-400 z-10 font-mono">
                            <span>07:49 AM</span>
                            <div className="flex items-center gap-1">
                              <span>📶 Starlink</span>
                              <span>🔋 98%</span>
                            </div>
                          </div>

                          {/* Dynamic Screen Content: Active vs Suspended */}
                          <div className="flex-1 flex flex-col justify-between p-4 bg-[#fbf9f4] text-stone-800 text-center relative">
                            
                            {isSuspended ? (
                              /* SUSPENDED SCREEN TEMPLATE */
                              <div className="my-auto space-y-5 animate-scaleUp text-center flex flex-col items-center justify-center h-full">
                                <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center text-3xl animate-bounce">
                                  🔒
                                </div>
                                <div className="space-y-1.5">
                                  <h5 className="text-sm font-black text-rose-700 uppercase tracking-tight">HUDUMA IMEFUNGWA</h5>
                                  <p className="text-[10px] text-stone-500 leading-relaxed font-sans font-semibold">
                                    Huduma ya Wi-Fi kwenye kituo hiki cha <strong>{tenant.businessName}</strong> imesitishwa kwa dharura kwa sababu ya malipo ya mwezi kutofanyika.
                                  </p>
                                </div>

                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[9px] text-rose-800 leading-relaxed font-semibold">
                                  ⚠️ Wasiliana na mmiliki <strong>{tenant.ownerName}</strong> au lipia kiotomatiki hapa chini kufungua sasa hivi.
                                </div>

                                {/* Lipa Sasa simulated button inside phone */}
                                <button
                                  onClick={() => {
                                    const updated = saasTenants.map(t => {
                                      if (t.id === tenant.id) {
                                        const renewDate = new Date();
                                        renewDate.setDate(renewDate.getDate() + 30);
                                        const mockPay = {
                                          date: new Date().toISOString().split('T')[0],
                                          amount: 10000,
                                          ref: 'MPESA-AUTO-' + Math.floor(1000 + Math.random() * 9000),
                                          status: 'completed'
                                        };
                                        return {
                                          ...t,
                                          status: 'active',
                                          nextRenewal: renewDate.toLocaleDateString('sw-TZ'),
                                          paymentHistory: [mockPay, ...t.paymentHistory],
                                          lastPaymentRef: mockPay.ref
                                        };
                                      }
                                      return t;
                                    });
                                    setSaasTenants(updated);
                                    showToast('SaaS Imefunguliwa', `Webhook Imepokelewa! Mfumo wa ${tenant.businessName} umerudi hewani.`, 'success');
                                  }}
                                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                                  <span>LIPA TZS 10,000 PUSH</span>
                                </button>
                              </div>
                            ) : (
                              /* ACTIVE/OVERDUE PORTAL SCREEN TEMPLATE */
                              <div className="my-auto space-y-4 animate-fadeIn flex flex-col justify-between h-full py-2">
                                {isOverdue && (
                                  <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-1.5 text-[8px] font-black uppercase tracking-wider animate-pulse font-sans">
                                    ⚠️ Warning: Siku ya Malipo Imepita!
                                  </div>
                                )}
                                
                                <div className="space-y-1">
                                  <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    <span>Kituo kiko Active</span>
                                  </div>
                                  <div className="p-1.5 bg-[#231f1c] rounded-lg text-white font-black text-[10px] uppercase w-fit mx-auto">
                                    {tenant.businessName}
                                  </div>
                                </div>

                                <div className="p-3 bg-white border border-[#e6e2d3] rounded-2xl space-y-1.5 text-center shadow-2xs">
                                  <span className="text-[10px] font-black uppercase text-[#cca43b] tracking-wider block">INGIZA VOCHA YAKO</span>
                                  <input
                                    type="text"
                                    placeholder="Andika Namba hapa..."
                                    className="w-full text-center px-2 py-1.5 border border-[#e6e2d3] rounded-lg font-mono text-xs text-stone-800 placeholder-stone-300"
                                    disabled
                                  />
                                  <button className="w-full py-1.5 bg-[#cca43b] text-white font-black text-[10px] rounded-lg tracking-wider" disabled>
                                    UNGANISHA MTANDAO
                                  </button>
                                </div>

                                <div className="border-t border-[#e6e2d3] pt-2 text-[8px] text-stone-400 font-medium">
                                  Mteja anaweza kulipia bando la TZS 500 kwa simu hapa na kuunganishwa kiotomatiki!
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Simulated Bottom Home Line */}
                          <div className="p-2.5 bg-stone-950 flex justify-center items-center z-10">
                            <div className="w-20 h-1 bg-stone-700 rounded-full" />
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-400 text-center leading-relaxed font-sans px-2">
                          {isSuspended 
                            ? '💡 Kwa kuwa mteja huyu amefungiwa, portal inazuia wageni kununua bando au kuandika vocha, ikimtaka mmiliki alipe elfu 10 kwanza!' 
                            : '🟢 Mteja huyu ana mtandao hewani! Wageni wanaweza kuandika vocha zao au kulipia bando vizuri bila usumbufu.'}
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* 2. THE SAAS ARCHITECTURE & ANSWERS GUIDE CARD */}
                <div className="bg-[#fcfbf7] border border-[#e6e2d3] rounded-3xl p-6 space-y-5 shadow-xs text-xs">
                  <div className="border-b border-stone-200 pb-2">
                    <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1">
                      <Code2 className="w-4 h-4 text-emerald-600" />
                      <span>Siri ya Kiufundi: Mfumo Unawekaje Cut-Off?</span>
                    </h4>
                    <p className="text-[9px] text-stone-400">Mwongozo wa mambo ya kusanidi kwenye database na router zako.</p>
                  </div>

                  <div className="space-y-4 text-stone-700 leading-relaxed font-sans">
                    <div className="space-y-1">
                      <strong className="text-stone-850 block font-bold">1. Multi-Tenant Database Isolation:</strong>
                      <p className="text-[11px]">
                        Kila mteja anayesajiliwa anapata kitambulisho cha kipekee (<code>tenant_id</code>). Kila muamala, bando, na vocha zinazotengenezwa zitakuwa na <code>tenant_id</code> ya huyo mmiliki, ili wasiweze kuingiliana wala kuona data za wengine.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-stone-850 block font-bold">2. Midnight Cron Job (Mlinzi wa Usiku):</strong>
                      <p className="text-[11px]">
                        Utahitaji kusanidi Script inayojiendesha yenyewe kila siku saa 6:00 usiku (Scheduled Cloud Function au Cron Job). Script hii inakagua wateja wote ambao tarehe yao ya <code>subscription_expires_at</code> imepita, na inabadilisha hali yao kuwa <code>"suspended"</code>.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-stone-850 block font-bold">3. Jinsi ya Kuzuia Huduma (The Cut-Off Logic):</strong>
                      <p className="text-[11px] font-bold text-stone-850">
                        Inategemea na aina ya AP anayotumia huyo mteja:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 pl-1.5 text-[11px] text-stone-600 font-medium">
                        <li>
                          <span className="font-bold text-stone-800">Ruijie / Omada AP Only:</span> Mteja anapojaribu kufungua Captive Portal kupitia AP ya huyo Tenant, portal (iliyopo kwenye cloud yako) inaangalia kwanza kama huyo Tenant amezuiwa. Kama ndiyo, badala ya kuonyesha fomu ya kuandika vocha au kulipia, portal inatoa ukurasa wa block uliorandishwa nyekundu!
                        </li>
                        <li>
                          <span className="font-bold text-stone-800">MikroTik Router Mode:</span> Kama mtumiaji anatumia MikroTik inayoongea na RADIUS server yako binafsi, mteja anapoandika vocha MikroTik inatuma maombi RADIUS. Server inakataa papo hapo kwa kurudisha <code>Access-Reject</code> ikiwa <code>tenant_status === "suspended"</code>.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-stone-850 block font-bold">4. Mapokezi ya Malipo ya Auto (Webhook Webhook):</strong>
                      <p className="text-[11px]">
                        Mteja akilipa TZS 10,000 kwa Lipa Namba yako kiotomatiki kupitia AzamPay/ZenoPay/Selcom, gateway inatuma webhook kwenye API yako (Mfano: <code>/api/v1/saas/renew-callback</code>). API inauisha tarehe ya kulipia <code>+30 days</code> na kufungua mtambo mara moja bila wewe kugusa kitu!
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* Printable Sheet Modal */}
      {showPrintModal && (
        <VoucherPrintSheet
          vouchers={vouchers.filter((v) => v.status === 'unused')}
          settings={settings}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* MikroTik Script Modal */}
      {showScriptModal && (
        <MikrotikScriptModal
          settings={settings}
          onClose={() => setShowScriptModal(false)}
        />
      )}

      {/* Daily Summary Report Printable Modal */}
      {showDailyReportModal && (
        <DailySummaryReportModal
          lang={lang}
          onClose={() => setShowDailyReportModal(false)}
        />
      )}

      {/* QR EQUIPMENT SCANNER & INVENTORY MODAL */}
      {showQrEquipmentModal && (
        <QrEquipmentScannerModal
          isOpen={showQrEquipmentModal}
          onClose={() => setShowQrEquipmentModal(false)}
          onEquipmentRegistered={(newEq) => {
            // 1. Add to equipment inventory
            setEquipmentInventory((prev) => [newEq, ...prev]);

            // 2. If it's an AP, automatically add to accessPoints list
            if (newEq.category === 'ap') {
              setAccessPoints((prev) => [
                {
                  mac: newEq.macAddress,
                  model: newEq.model,
                  site: newEq.site,
                  status: 'connected',
                  uptime: 'Hivi Sasa (Online)'
                },
                ...prev
              ]);
            }

            // 3. If it's a router, automatically add to routers list
            if (newEq.category === 'router') {
              setRouters((prev) => [
                {
                  id: newEq.id,
                  name: newEq.name,
                  ip: newEq.ipAddress || '192.168.88.1',
                  model: newEq.model,
                  status: 'online',
                  version: 'RouterOS v7.14',
                  uptime: 'Masaa 0 (Mpya)',
                  cpu: '2%'
                },
                ...prev
              ]);
            }

            showToast(
              'Kifaa Kimesajiliwa!',
              `${newEq.name} (${newEq.model}) kimesajiliwa na kusanidiwa kiotomatiki kwenye Stoo (Inventory) na Mtandao!`,
              'success'
            );
          }}
          showToast={showToast}
        />
      )}

      {/* LEMA AI ACCESS POINT ADOPTION WIZARD (As seen in the video) */}
      {showAiApWizard && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative text-stone-200">
            {/* Background glowing accents */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between relative z-10 bg-stone-900/60 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">Lema AI AP Adoption Wizard</h3>
                  <p className="text-[10px] text-stone-400">Adopt and preconfigure any Access Point without MikroTik</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiApWizard(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Wizard Body content based on step */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 relative z-10">
              
              {/* STEP 1: Brand Selection */}
              {wizardStep === 'brand' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-bold text-white">1. Chagua Chapa ya Access Point (Choose Brand)</h4>
                    <p className="text-xs text-stone-400 max-w-md mx-auto">
                      Lema AI inasaidia usanidi wa moja kwa moja wa wingu (Cloud Controller Handshake) kwa ajili ya kupokea wateja na malipo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* TP-Link Omada */}
                    <button
                      onClick={() => {
                        setWizardBrand('omada');
                        setWizardStep('capture');
                        setWizardExtractedDetails({
                          manufacturer: 'TP-Link',
                          model: 'EAP225-Outdoor',
                          serialNumber: '22611SK004068',
                          deviceKey: '12BA-E1EF-7DAA-19DE-9000',
                          macAddress: '20:E1:5D:44:16:D2'
                        });
                      }}
                      className="p-5 rounded-2xl border border-stone-800 hover:border-indigo-500/50 bg-stone-950/50 hover:bg-indigo-600/5 transition-all text-center space-y-3 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        📡
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block">TP-Link Omada</strong>
                        <span className="text-[10px] text-stone-400">EAP Series (e.g. EAP225)</span>
                      </div>
                    </button>

                    {/* Ruijie Reyee */}
                    <button
                      onClick={() => {
                        setWizardBrand('ruijie');
                        setWizardStep('capture');
                        setWizardExtractedDetails({
                          manufacturer: 'Ruijie Reyee',
                          model: 'RG-RAP6202G',
                          serialNumber: '22811RJ003921',
                          deviceKey: '34CF-F2AB-90AA-21EE-7000',
                          macAddress: '00:D0:F8:8C:31:1A'
                        });
                      }}
                      className="p-5 rounded-2xl border border-stone-800 hover:border-indigo-500/50 bg-stone-950/50 hover:bg-indigo-600/5 transition-all text-center space-y-3 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        📶
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block">Ruijie Reyee</strong>
                        <span className="text-[10px] text-stone-400">RAP Series (e.g. RAP6202)</span>
                      </div>
                    </button>

                    {/* UniFi */}
                    <button
                      onClick={() => {
                        setWizardBrand('unifi');
                        setWizardStep('capture');
                        setWizardExtractedDetails({
                          manufacturer: 'Ubiquiti UniFi',
                          model: 'U6-Mesh-Outdoor',
                          serialNumber: 'U6M092144',
                          deviceKey: '55FF-90CC-31AA-18BB-2000',
                          macAddress: 'F4:92:BF:E1:92:44'
                        });
                      }}
                      className="p-5 rounded-2xl border border-stone-800 hover:border-indigo-500/50 bg-stone-950/50 hover:bg-indigo-600/5 transition-all text-center space-y-3 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        ⚡
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block">Ubiquiti UniFi</strong>
                        <span className="text-[10px] text-stone-400">U6 / AC Series Mesh</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Capture / Scan Sticker */}
              {wizardStep === 'capture' && (
                <div className="space-y-5 animate-fadeIn text-xs">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-bold text-white">2. Skani Stika ya Access Point (Scan Sticker)</h4>
                    <p className="text-stone-400 max-w-md mx-auto">
                      Piga picha lebo yenye maelezo ya Serial Number na Device Key iliyopo nyuma ya kifaa kama ilivyoonyeshwa kwenye video!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Feed / Simulator Container */}
                    <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden p-4 relative flex flex-col items-center justify-center min-h-[220px]">
                      {/* Laser red scan line */}
                      <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-red-500 shadow-md shadow-red-500/50 animate-bounce z-10" />
                      
                      <div className="text-center space-y-3 relative z-10 flex flex-col items-center">
                        <span className="text-3xl">📷</span>
                        <span className="font-bold text-stone-300">Live AI Scanner Camera</span>
                        <p className="text-[10px] text-stone-500 max-w-[180px] leading-relaxed">Sogeza karibu stika ya kifaa ili mfumo uisome yenyewe.</p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCapturedStickerImg('simulated-sticker');
                              setWizardStep('analyze');
                              // Run simulated analyzing logs
                              setWizardLogs([]);
                              const logs = [
                                '🔍 Identifying manufacturer...',
                                '📍 Locating Serial Number...',
                                '⚙️ Extracting Device Key & MAC...',
                                '🔒 Verifying Cloud adoption handshake...',
                                '⚡ Registering from sticker...',
                                '⚙️ Controller preconfiguration...'
                              ];
                              let i = 0;
                              const interval = setInterval(() => {
                                if (i < logs.length) {
                                  setWizardLogs((prev) => [...prev, logs[i]]);
                                  i++;
                                } else {
                                  clearInterval(interval);
                                  setTimeout(() => {
                                    setWizardStep('results');
                                  }, 800);
                                }
                              }, 700);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg cursor-pointer transition-colors"
                          >
                            Capture Photo
                          </button>
                          
                          <label className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-lg cursor-pointer transition-colors">
                            Upload File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={() => {
                                setCapturedStickerImg('uploaded-sticker');
                                setWizardStep('analyze');
                                setWizardLogs([]);
                                const logs = [
                                  '🔍 Scanning uploaded photo with OCR...',
                                  '📍 Parsing metadata and barcodes...',
                                  '⚙️ Extracting Device Key...',
                                  '🔒 Contacting Cloud gateway...',
                                  '⚡ Confirming active site adoption...'
                                ];
                                let i = 0;
                                const interval = setInterval(() => {
                                  if (i < logs.length) {
                                    setWizardLogs((prev) => [...prev, logs[i]]);
                                    i++;
                                  } else {
                                    clearInterval(interval);
                                    setTimeout(() => {
                                      setWizardStep('results');
                                    }, 800);
                                  }
                                }, 600);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Stencil / Target example (Showing what's scanned, matching EAP225 from video) */}
                    <div className="bg-white border border-[#e6e2d3] rounded-2xl p-4 text-stone-900 space-y-3 flex flex-col justify-between">
                      <div className="border-b border-stone-200 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-indigo-600">STIKA YA MAJARIBIO (Reference Label)</span>
                      </div>
                      
                      <div className="space-y-1.5 font-mono text-[9px] text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-200">
                        <p className="font-bold text-stone-950">Model: {wizardExtractedDetails.model}</p>
                        <p>S/N: {wizardExtractedDetails.serialNumber}</p>
                        <p>MAC: {wizardExtractedDetails.macAddress}</p>
                        <p>Device Key: {wizardExtractedDetails.deviceKey}</p>
                        
                        <div className="flex justify-between items-center pt-1 border-t border-stone-200 mt-2">
                          <span className="text-[8px] text-stone-500 font-sans">Soma QR na Maelezo kiotomatiki</span>
                          <span className="text-xl">🔲</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCapturedStickerImg('demo-stika');
                          setWizardStep('analyze');
                          setWizardLogs([]);
                          const logs = [
                            '🔍 Identifying manufacturer...',
                            '📍 Locating Serial Number...',
                            '⚙️ Extracting Device Key & MAC...',
                            '🔒 Verifying Cloud adoption handshake...',
                            '⚡ Registering from sticker...',
                            '⚙️ Controller preconfiguration...'
                          ];
                          let i = 0;
                          const interval = setInterval(() => {
                            if (i < logs.length) {
                              setWizardLogs((prev) => [...prev, logs[i]]);
                              i++;
                            } else {
                              clearInterval(interval);
                              setTimeout(() => {
                                setWizardStep('results');
                              }, 800);
                            }
                          }, 750);
                        }}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-center cursor-pointer transition-colors block text-[11px]"
                      >
                        Jaribu kwa Stika hii ya Majaribio ➔
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Lema AI Analysis Logs (Pulsing step logs from the video) */}
              {wizardStep === 'analyze' && (
                <div className="space-y-6 animate-fadeIn py-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full border-3 border-indigo-400 border-t-transparent animate-spin mx-auto" />
                    <h4 className="text-base font-black text-white tracking-tight">Lema AI Inachambua Lebo</h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">Inasoma stika ya kifaa chako na kuwasiliana na Cloud Controller...</p>
                  </div>

                  {/* Log console matching the video */}
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 font-mono text-xs space-y-2 max-w-md mx-auto h-[180px] overflow-y-auto">
                    {wizardLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-2 text-emerald-400 animate-fadeIn">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <span>Lema AI is processing...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Results verification */}
              {wizardStep === 'results' && (
                <div className="space-y-5 animate-fadeIn text-xs text-stone-300">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-bold text-white">3. Thibitisha Taarifa Zilizosomwa na AI</h4>
                    <p className="text-stone-400">Lema AI imefaulu kusoma stika ya kifaa. Unaweza kuhariri taarifa hizi kama kuna makosa:</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2 max-w-md mx-auto">
                    <span>✓</span>
                    <span>OCR imesoma kwa usahihi wa 99.8% (Safi na Inasomeka)</span>
                  </div>

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-500 block mb-1">MANUFACTURER (CHAPA):</label>
                        <input
                          type="text"
                          value={wizardExtractedDetails.manufacturer}
                          onChange={(e) => setWizardExtractedDetails({ ...wizardExtractedDetails, manufacturer: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-700 rounded-xl bg-stone-900 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-500 block mb-1">MODEL / KIKUNDI:</label>
                        <input
                          type="text"
                          value={wizardExtractedDetails.model}
                          onChange={(e) => setWizardExtractedDetails({ ...wizardExtractedDetails, model: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-700 rounded-xl bg-stone-900 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-stone-500 block mb-1">SERIAL NUMBER (S/N):</label>
                        <input
                          type="text"
                          value={wizardExtractedDetails.serialNumber}
                          onChange={(e) => setWizardExtractedDetails({ ...wizardExtractedDetails, serialNumber: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-700 rounded-xl bg-stone-900 text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-stone-500 block mb-1">DEVICE KEY / MAC ADDRESS:</label>
                        <input
                          type="text"
                          value={wizardExtractedDetails.deviceKey}
                          onChange={(e) => setWizardExtractedDetails({ ...wizardExtractedDetails, deviceKey: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-700 rounded-xl bg-stone-900 text-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-850">
                    <button
                      onClick={() => setWizardStep('capture')}
                      className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl cursor-pointer hover:bg-stone-750 transition-colors"
                    >
                      Piga Picha Tena
                    </button>
                    <button
                      onClick={() => {
                        setWizardStep('success');
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl cursor-pointer hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/10"
                    >
                      Thibitisha na Kusajili ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success & SSID naming (Matches success flow in video) */}
              {wizardStep === 'success' && (
                <div className="space-y-5 animate-fadeIn text-xs text-stone-300">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                      ✓
                    </div>
                    <h4 className="text-base font-black text-white">Access Point Imesajiliwa kwa Mafanikio!</h4>
                    <p className="text-stone-400">AP yako imeunganishwa moja kwa moja kwenye Lema Controller. Hatua ya mwisho:</p>
                  </div>

                  {/* Step list with green checkmarks */}
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 max-w-sm mx-auto space-y-2">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <span>✓</span>
                      <span>Omada Cloud Controller is Ready</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <span>✓</span>
                      <span>Lema Fast WiFi Site adopted</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <span>✓</span>
                      <span>Device Key registration successful</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <span>✓</span>
                      <span>Controller preconfiguration applied</span>
                    </div>
                  </div>

                  {/* SSID Name setup */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 max-w-sm mx-auto space-y-3">
                    <div className="space-y-1">
                      <label className="text-stone-400 block font-bold">WEKA JINA LA WIFI (SSID Name):</label>
                      <input
                        type="text"
                        value={wizardNewSsid}
                        onChange={(e) => setWizardNewSsid(e.target.value)}
                        placeholder="DUKANI KWA ALI 5G WIFI"
                        className="w-full px-3 py-2 border border-stone-700 rounded-xl bg-stone-950 text-white font-black uppercase text-center tracking-wide focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-[10px] text-stone-500 text-center block">Hili ndilo jina mteja atakaloona kwenye simu yake.</span>
                    </div>

                    <button
                      onClick={() => {
                        const newAp = {
                          mac: wizardExtractedDetails.macAddress || '20:E1:5D:44:16:D2',
                          model: wizardExtractedDetails.model || 'EAP225-Outdoor',
                          site: 'Mshikamano Site',
                          status: 'connected',
                          uptime: 'Hivi Sasa (Online)'
                        };
                        setAccessPoints([...accessPoints, newAp]);
                        setWifiSsidName(wizardNewSsid); // Sync configured SSID
                        setShowAiApWizard(false);
                        showToast(
                          'Adoption Imekamilika!', 
                          `WiFi ya "${wizardNewSsid}" sasa ipo hai na inaongozwa na Lema AI Cloud Controller!`, 
                          'success'
                        );
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-center cursor-pointer transition-colors shadow-lg shadow-emerald-500/20 text-xs uppercase"
                    >
                      Washa na Uanze Biashara 🚀
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FLOATING QUICK ACTIONS MENU */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded menu options */}
        {showQuickActionMenu && (
          <div className="absolute bottom-16 right-0 w-64 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-3 space-y-2 animate-in slide-in-from-bottom-5 duration-200 text-stone-100">
            <div className="p-2 border-b border-stone-800 text-[10px] font-black uppercase tracking-wider text-stone-400">
              ISP Quick Management
            </div>

            {/* Option 0: Scan Equipment QR */}
            <button
              onClick={() => {
                setShowQrEquipmentModal(true);
                setShowQuickActionMenu(false);
              }}
              className="w-full text-left p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Skani QR ya Kifaa (Inventory)</span>
            </button>
            
            {/* Option 1: Generate Vouchers */}
            <button
              onClick={() => {
                generateVouchers(selectedPkgForGen, 25);
                setShowQuickActionMenu(false);
                showToast("Vocha Zimetengenezwa!", "Vocha 25 mpya zimetengenezwa kiotomatiki na zipo tayari kuchapishwa chini ya Vouchers!", "success");
              }}
              className="w-full text-left p-2.5 hover:bg-stone-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>🎫</span>
              <span>Generate 25 Vouchers</span>
            </button>

            {/* Option 2: Clear Active Sessions */}
            <button
              onClick={() => {
                if (activeSessions.length === 0) {
                  showToast("Hakuna Wateja", "Hakuna mteja anayetumia intaneti kwa sasa hivi.", "info");
                  setShowQuickActionMenu(false);
                  return;
                }
                if (!confirmClearSessions) {
                  setConfirmClearSessions(true);
                  return;
                }
                const count = activeSessions.length;
                activeSessions.forEach((s) => disconnectSession(s.id));
                setConfirmClearSessions(false);
                setShowQuickActionMenu(false);
                showToast("Sessions Cleared", `Wateja wote ${count} waliokuwa hewani wametenganishwa kwa ufanisi!`, "warning");
              }}
              className={`w-full text-left p-2.5 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer border ${
                confirmClearSessions
                  ? 'bg-rose-900/60 text-white border-rose-500 animate-pulse'
                  : 'hover:bg-rose-950/40 hover:text-rose-300 border-transparent hover:border-rose-900/30 text-rose-300'
              }`}
            >
              <span>🚫</span>
              <span>{confirmClearSessions ? `Bofya Kuthibitisha (${activeSessions.length})` : `Clear Active Sessions (${activeSessions.length})`}</span>
            </button>

            {/* Option 3: Download Router Script */}
            <button
              onClick={() => {
                setShowScriptModal(true);
                setShowQuickActionMenu(false);
              }}
              className="w-full text-left p-2.5 hover:bg-stone-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>📜</span>
              <span>MikroTik Setup Script</span>
            </button>

            {/* Option 4: Print Vouchers */}
            <button
              onClick={() => {
                setShowPrintModal(true);
                setShowQuickActionMenu(false);
              }}
              className="w-full text-left p-2.5 hover:bg-stone-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print Voucher Sheets</span>
            </button>

            {/* Option 5: View Daily Summary */}
            <button
              onClick={() => {
                setShowDailyReportModal(true);
                setShowQuickActionMenu(false);
              }}
              className="w-full text-left p-2.5 hover:bg-stone-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>📊</span>
              <span>Download Sales Report</span>
            </button>
          </div>
        )}

        {/* Floating FAB Trigger Button */}
        <button
          onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
            showQuickActionMenu 
              ? 'bg-stone-800 hover:bg-stone-750 rotate-45 border border-stone-700' 
              : 'bg-[#cca43b] hover:bg-amber-500 shadow-amber-500/20'
          }`}
          title="Quick Actions Menu"
        >
          {showQuickActionMenu ? (
            <span className="text-xl font-bold">✕</span>
          ) : (
            <span className="text-2xl font-black animate-pulse">⚡</span>
          )}
        </button>
      </div>

      {/* Modern In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm bg-stone-900/95 backdrop-blur-md border border-[#cca43b]/40 rounded-2xl shadow-2xl p-4 text-stone-100 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
            toastMessage.type === 'warning' ? 'bg-rose-500/20 text-rose-400' :
            toastMessage.type === 'info' ? 'bg-sky-500/20 text-sky-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {toastMessage.type === 'warning' ? '⚠️' : toastMessage.type === 'info' ? 'ℹ️' : '✓'}
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-xs font-black text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
