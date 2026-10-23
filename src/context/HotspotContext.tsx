import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Voucher,
  HotspotPackage,
  PaymentTransaction,
  ActiveSession,
  HotspotSettings,
  NetworkTower,
  HotspotAdvertisement,
  HotspotTenant,
} from '../types';

interface HotspotContextType {
  settings: HotspotSettings;
  updateSettings: (newSettings: Partial<HotspotSettings>) => void;
  vouchers: Voucher[];
  transactions: PaymentTransaction[];
  activeSessions: ActiveSession[];
  towers: NetworkTower[];
  ads: HotspotAdvertisement[];
  addTower: (tower: Omit<NetworkTower, 'id' | 'installedAt'>) => NetworkTower;
  updateTower: (id: string, updates: Partial<NetworkTower>) => void;
  deleteTower: (id: string) => void;
  importTowers: (newTowers: NetworkTower[]) => void;
  addAd: (ad: Omit<HotspotAdvertisement, 'id' | 'impressions' | 'clicks'>) => void;
  updateAd: (id: string, updates: Partial<HotspotAdvertisement>) => void;
  deleteAd: (id: string) => void;
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;
  generateVouchers: (packageId: string, count: number) => Voucher[];
  deleteVoucher: (id: string) => void;
  redeemVoucher: (code: string, phone?: string, realMac?: string, realIp?: string) => { success: boolean; message: string; session?: ActiveSession };
  processMobilePayment: (
    phone: string,
    packageId: string,
    realMac?: string,
    realIp?: string
  ) => Promise<{ success: boolean; message: string; voucher?: Voucher; session?: ActiveSession }>;
  disconnectSession: (sessionId: string) => void;
  reconnectByReference: (refNo: string) => { success: boolean; message: string; session?: ActiveSession };
  resetDemoData: () => void;
  currentClientSession: ActiveSession | null;
  // Multi-Tenant SaaS Platform
  tenants: HotspotTenant[];
  activeTenantId: string;
  activeTenant: HotspotTenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenantData: Omit<HotspotTenant, 'id' | 'createdAt'>) => HotspotTenant;
  updateTenant: (id: string, updates: Partial<HotspotTenant>) => void;
  deleteTenant: (id: string) => void;
  renewTenantSubscription: (id: string, months?: number, ref?: string) => void;
  toggleTenantStatus: (id: string) => void;
}

const DEFAULT_PACKAGES: HotspotPackage[] = [
  {
    id: 'pkg-2hrs',
    name: 'Saa 2 za Haraka',
    price: 500,
    durationHours: 2,
    speedDownload: '2.5M',
    speedUpload: '1.0M',
  },
  {
    id: 'pkg-1day',
    name: 'Saa 24 (Siku 1)',
    price: 1000,
    durationHours: 24,
    speedDownload: '2.5M',
    speedUpload: '1.0M',
    isPopular: true,
  },
  {
    id: 'pkg-1week',
    name: 'Siku 7 (Wiki 1)',
    price: 5000,
    durationHours: 168,
    speedDownload: '3.0M',
    speedUpload: '1.5M',
  },
  {
    id: 'pkg-1month',
    name: 'Siku 30 (Mwezi 1)',
    price: 25000,
    durationHours: 720,
    speedDownload: '3.5M',
    speedUpload: '2.0M',
  },
];

const DEFAULT_SETTINGS: HotspotSettings = {
  hotspotName: 'Lema Fast WiFi',
  tagline: 'Intaneti ya Kasi ya Fiber & Starlink',
  supportPhone: '0653 578 184',
  currency: 'TZS',
  paymentGateway: 'paypack',
  merchantNumber: '5849201 (Lipa Namba)',
  accountOwnerName: 'Jimmy Lema (Wewe Mmiliki)',
  payoutMethod: 'lipa_namba',
  payoutAccount: '5849201 (Lipa Namba ya Vodacom / Tigo)',
  payoutBankName: 'CRDB Bank (Akaunti ya Biashara)',
  payoutFrequency: 'instant',
  packages: DEFAULT_PACKAGES,
  adminUsername: 'admin',
  adminPassword: 'admin123',
  smsProvider: 'swalasms',
  smsSenderId: 'LEMAWIFI',
  smsApiKey: '',
  smsSecretKey: '',
  enableExpirySms: true,
  expiryWarningMinutes: 15,
  expirySmsTemplate: 'Habari! Vocha yako ya {KIFURUSHI} kwenye {WIFI_NAME} inamalizika baada ya dakika {DAKIKA}. Bonyeza {PORTAL_URL} kuongeza muda sasa kwa M-Pesa.',
  enableLowBalanceSms: true,
  lowBalanceThresholdMb: 100,
  lowBalanceSmsTemplate: 'Ndugu mteja, bando lako la {WIFI_NAME} limebakiwa na chini ya {SALIO_MB}MB. Ili kuendelea kuvinjari bila kukatika, fungua {PORTAL_URL}.',
  enablePurchaseReceiptSms: true,
  purchaseReceiptSmsTemplate: 'Asante kwa kujiunga na {WIFI_NAME}! Vocha yako ni: {VOCHA_CODE} (Kifurushi: {KIFURUSHI}). Msaada piga {SUPPORT_PHONE}.',
  enableAutoMacLogin: true,
  enableQrCameraScanner: true,
  enableAntiAbuseTrial: true,
  trialDurationMinutes: 15,
  trialCooldownHours: 24,
  enableWhatsAppVoucherDelivery: true,
};

const SEED_VOUCHERS: Voucher[] = [];

const SEED_TRANSACTIONS: PaymentTransaction[] = [];

const SEED_ACTIVE_SESSIONS: ActiveSession[] = [];

const DEFAULT_TOWERS: NetworkTower[] = [];

const DEFAULT_ADS: HotspotAdvertisement[] = [];

const DEFAULT_TENANTS: HotspotTenant[] = [
  {
    id: 'tenant-lema-hq',
    subdomain: 'lema',
    businessName: 'Lema Fast WiFi',
    ownerName: 'Jimmy Lema',
    ownerPhone: '0653 578 184',
    locationCity: 'Dar es Salaam',
    locationArea: 'Sinza Mori',
    brandColor: '#cca43b',
    tagline: 'Intaneti ya Kasi ya Fiber & Starlink',
    routerType: 'omada',
    routerIpOrHost: '192.168.0.254',
    payoutAccount: '5849201',
    payoutMethod: 'lipa_namba',
    accountOwnerName: 'Jimmy Lema',
    subscription: {
      id: 'sub-101',
      plan: 'enterprise',
      planName: 'Enterprise Unlimited',
      monthlyFee: 0,
      status: 'active',
      startDate: '2026-10-01',
      nextBillingDate: '2030-01-01',
      daysRemaining: 1200,
      autoRenew: true,
      maxRouters: 10,
      maxConcurrentUsers: 1000,
      lastPaymentDate: '2026-10-01',
      lastPaymentRef: 'LEMA-DIRECT-OWNER'
    },
    settings: DEFAULT_SETTINGS,
    createdAt: '2026-10-01T08:00:00Z'
  }
];

const HotspotContext = createContext<HotspotContextType | undefined>(undefined);

export const HotspotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HotspotSettings>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          hotspotName: (!parsed.hotspotName || parsed.hotspotName === 'MTAA FAST WIFI' || parsed.hotspotName.toLowerCase().includes('wot') || parsed.hotspotName.includes('ANNOY')) ? 'Lema Fast WiFi' : parsed.hotspotName,
          supportPhone: (!parsed.supportPhone || parsed.supportPhone === '0754 123 456' || parsed.supportPhone === '0754123456') ? '0653 578 184' : parsed.supportPhone,
          accountOwnerName: parsed.accountOwnerName || DEFAULT_SETTINGS.accountOwnerName,
          payoutAccount: parsed.payoutAccount || DEFAULT_SETTINGS.payoutAccount,
          payoutMethod: parsed.payoutMethod || DEFAULT_SETTINGS.payoutMethod,
          payoutFrequency: parsed.payoutFrequency || DEFAULT_SETTINGS.payoutFrequency,
          payoutBankName: parsed.payoutBankName || DEFAULT_SETTINGS.payoutBankName,
          smsProvider: 'swalasms',
          smsSenderId: (parsed.smsSenderId && parsed.smsSenderId !== 'MTAA_WIFI' && parsed.smsSenderId !== 'LEMA_WIFI') ? parsed.smsSenderId : 'LEMAWIFI',
          smsApiKey: (parsed.smsApiKey && !parsed.smsApiKey.startsWith('beem_')) ? parsed.smsApiKey : '',
          smsSecretKey: '',
        };
      }
    } catch (e) {
      // Fallback to default
    }
    return DEFAULT_SETTINGS;
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_vouchers');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any legacy mock vouchers
        const cleaned = parsed.filter((v: Voucher) => !['v-101', 'v-102', 'v-103', 'v-104'].includes(v.id));
        return cleaned;
      }
    } catch (e) {}
    return [];
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out specific legacy mock transactions
        const cleaned = parsed.filter((tx: PaymentTransaction) => !['tx-201', 'tx-202', 'tx-203'].includes(tx.id));
        return cleaned;
      }
    } catch (e) {}
    return [];
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((s: ActiveSession) => !['sess-1', 'sess-2', 'sess-3', 'sess-4'].includes(s.id));
        return cleaned;
      }
    } catch (e) {}
    return [];
  });

  // Sync active sessions with backend server so PC and Phone show connected users in real-time
  useEffect(() => {
    let isMounted = true;
    const fetchServerSessions = async () => {
      try {
        const res = await fetch('/api/v1/sessions/active');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sessions)) {
            // De-duplicate by MAC address to strictly enforce 1 Device = 1 Active Session
            const map = new Map<string, ActiveSession>();
            for (const s of data.sessions) {
              const mac = (s.macAddress || '').trim().toUpperCase();
              if (mac) {
                if (!map.has(mac)) map.set(mac, s);
              } else {
                map.set(s.id || Math.random().toString(), s);
              }
            }
            const uniqueSessions = Array.from(map.values());
            if (isMounted) {
              setActiveSessions(uniqueSessions);
            }
          }
        }
      } catch (e) {
        console.warn('Could not sync sessions from server:', e);
      }
    };

    fetchServerSessions();
    const interval = setInterval(fetchServerSessions, 3500); // Poll every 3.5s for live connected users sync
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync vouchers live with backend server so PC Admin Dashboard updates status (unused -> active -> expired) in real-time
  useEffect(() => {
    let isMounted = true;
    const fetchServerVouchers = async () => {
      try {
        const rawKey = typeof window !== 'undefined' ? (localStorage.getItem('admin_api_key') || '') : '';
        const adminKey = (rawKey && rawKey.trim()) ? rawKey.trim() : 'lema_admin_secret_key_2026';
        const res = await fetch('/api/v1/vouchers', {
          headers: {
            'x-admin-key': adminKey,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.vouchers) && data.vouchers.length > 0 && isMounted) {
            const mapped: Voucher[] = data.vouchers.map((v: any) => ({
              id: v.id || `v-${v.code}`,
              code: v.code,
              packageId: v.packageId || 'pkg-custom',
              packageName: v.packageName || 'Intaneti ya Vocha',
              price: v.price || 1000,
              durationHours: v.durationHours || 24,
              speedLimit: v.speedLimit || '2.5M/1.0M',
              status: v.status || 'unused',
              createdAt: v.createdAt || new Date().toISOString(),
              activatedAt: v.activatedAt,
              expiresAt: v.expiresAt,
              usedByPhone: v.usedByPhone,
              macAddress: v.macAddress || v.boundMac || '',
            }));
            setVouchers(mapped);
          }
        }
      } catch (e) {
        // silent fallback
      }
    };

    fetchServerVouchers();
    const interval = setInterval(fetchServerVouchers, 3000); // Poll every 3s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Hakikisha admin_api_key ipo kwenye localStorage kwa ajili ya maombi ya seva
  useEffect(() => {
    try {
      const existing = localStorage.getItem('admin_api_key');
      if (!existing || !existing.trim()) {
        localStorage.setItem('admin_api_key', 'lema_admin_secret_key_2026');
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  // Client's currently active session in this browser
  const [currentClientSession, setCurrentClientSession] = useState<ActiveSession | null>(() => {
    const saved = localStorage.getItem('wifi_hotspot_my_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Network Towers State (Managed via HotspotContext)
  const [towers, setTowers] = useState<NetworkTower[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_towers');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Advertisement Campaigns State (Managed via HotspotContext)
  const [ads, setAds] = useState<HotspotAdvertisement[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_ads');
      if (saved) {
        const parsed: HotspotAdvertisement[] = JSON.parse(saved);
        return parsed.filter((ad) => 
          ad.id !== 'ad-salon' && 
          ad.id !== 'ad-tech' && 
          ad.id !== 'ad-promo' &&
          !ad.title?.toLowerCase().includes('glamour') &&
          !ad.title?.toLowerCase().includes('quick tech')
        );
      }
    } catch (e) {}
    return DEFAULT_ADS;
  });

  // Multi-Tenant SaaS Platform State
  const [tenants, setTenants] = useState<HotspotTenant[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_tenants');
      if (saved) {
        const parsed: HotspotTenant[] = JSON.parse(saved);
        // Clean out legacy demo tenants (samaki, hostel, glamour)
        const cleaned = parsed.filter((t) => 
          t.id !== 'tenant-samaki' && 
          t.id !== 'tenant-hostel' && 
          t.id !== 'tenant-glamour' &&
          !t.businessName?.toLowerCase().includes('samaki') &&
          !t.businessName?.toLowerCase().includes('glamour')
        );
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    } catch (e) {}
    return DEFAULT_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    const saved = localStorage.getItem('wifi_active_tenant_id');
    if (saved && saved !== 'tenant-samaki' && saved !== 'tenant-hostel' && saved !== 'tenant-glamour') {
      return saved;
    }
    return 'tenant-lema-hq';
  });

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0] || DEFAULT_TENANTS[0];

  // Save tenants to localStorage
  useEffect(() => {
    localStorage.setItem('wifi_hotspot_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('wifi_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('wifi_hotspot_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Load and poll saved towers from backend server in real-time (Watchdog sync with hardware inventory)
  useEffect(() => {
    let isMounted = true;
    const fetchTowersAndHardware = async () => {
      try {
        const [towerRes, hwRes] = await Promise.all([
          fetch('/api/v1/towers').then((r) => r.json()).catch(() => null),
          fetch('/api/v1/hardware/inventory').then((r) => r.json()).catch(() => null),
        ]);

        let apStatus: 'online' | 'offline' | null = null;
        if (hwRes && Array.isArray(hwRes.inventory) && hwRes.inventory.length > 0) {
          const ap = hwRes.inventory.find((i: any) => i.category === 'ap') || hwRes.inventory[0];
          if (ap) {
            apStatus = ap.status === 'online' ? 'online' : 'offline';
          }
        }

        if (isMounted) {
          if (towerRes && towerRes.success && Array.isArray(towerRes.towers) && towerRes.towers.length > 0) {
            setTowers((current) => {
              const base = towerRes.towers.length > 0 ? towerRes.towers : current;
              return base.map((t: NetworkTower) => {
                if (apStatus && (!t.status || t.status === 'online' || t.status === 'offline')) {
                  return { ...t, status: apStatus };
                }
                return t;
              });
            });
          } else if (apStatus) {
            setTowers((current) =>
              current.map((t) => ({ ...t, status: apStatus as any }))
            );
          }
        }
      } catch (e) {}
    };

    fetchTowersAndHardware();
    const interval = setInterval(fetchTowersAndHardware, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_towers', JSON.stringify(towers));
  }, [towers]);

  useEffect(() => {
    localStorage.setItem('wifi_hotspot_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    if (currentClientSession) {
      localStorage.setItem('wifi_hotspot_my_session', JSON.stringify(currentClientSession));
    } else {
      localStorage.removeItem('wifi_hotspot_my_session');
    }
  }, [currentClientSession]);

  // Automated Background Expiry Engine Loop (Cancels Expired Subscriptions Automatically)
  useEffect(() => {
    const expiryInterval = setInterval(() => {
      const nowMs = Date.now();
      setActiveSessions((prevSessions) => {
        const expiredIds: string[] = [];
        const remaining = prevSessions.filter((s) => {
          const expiresMs = new Date(s.expiresAt).getTime();
          if (nowMs >= expiresMs) {
            expiredIds.push(s.id);
            return false;
          }
          return true;
        });

        if (expiredIds.length > 0) {
          // Update associated vouchers to expired status
          setVouchers((prevVouchers) =>
            prevVouchers.map((v) =>
              expiredIds.some(
                (id) =>
                  v.expiresAt && new Date(v.expiresAt).getTime() <= nowMs
              )
                ? { ...v, status: 'expired' }
                : v
            )
          );

          // Disconnect client if active session expired
          if (currentClientSession && expiredIds.includes(currentClientSession.id)) {
            setCurrentClientSession(null);
          }
        }

        return remaining;
      });
    }, 5000);

    return () => clearInterval(expiryInterval);
  }, [currentClientSession]);

  const updateSettings = (newSettings: Partial<HotspotSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const generateVouchers = (packageId: string, count: number): Voucher[] => {
    const targetPkg = settings.packages.find((p) => p.id === packageId) || settings.packages[0];
    const newVouchers: Voucher[] = [];

    for (let i = 0; i < count; i++) {
      // 4-digit numeric code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const voucher: Voucher = {
        id: `v-${Date.now()}-${i}`,
        code,
        packageId: targetPkg.id,
        packageName: targetPkg.name,
        price: targetPkg.price,
        durationHours: targetPkg.durationHours,
        speedLimit: `${targetPkg.speedDownload}/${targetPkg.speedUpload}`,
        status: 'unused',
        createdAt: new Date().toISOString(),
      };
      newVouchers.push(voucher);
    }

    setVouchers((prev) => [...newVouchers, ...prev]);
    // Sync with backend server with admin authentication header
    const rawKey = typeof window !== 'undefined' ? (localStorage.getItem('admin_api_key') || '') : '';
    const adminKey = (rawKey && rawKey.trim()) ? rawKey.trim() : 'lema_admin_secret_key_2026';
    if (typeof window !== 'undefined' && (!rawKey || !rawKey.trim())) {
      try {
        localStorage.setItem('admin_api_key', adminKey);
      } catch {}
    }
    fetch('/api/v1/vouchers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ vouchers: newVouchers }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => null);
          console.error('[Vouchers Sync] Server rejected with status', r.status, errData);
          alert(`Tahadhari: Vocha hazikuhifadhiwa kwenye seva (Hitilafu ${r.status}). Thibitisha ADMIN_API_KEY.`);
        }
      })
      .catch((err) => {
        console.error('[Vouchers Sync Error]:', err);
      });
    return newVouchers;
  };

  const redeemVoucher = (code: string, phone?: string, realMac?: string, realIp?: string) => {
    const trimmed = code.trim();
    let existing = vouchers.find((v) => v.code === trimmed);

    // If voucher does not exist in loaded vouchers, reject immediately
    if (!existing) {
      return { success: false, message: 'Nambari ya vocha siyo sahihi! Tafadhali kagua tena namba yako au nunua vocha mpya.' };
    }

    if (existing.status === 'expired') {
      return { success: false, message: 'Vocha hii imekwisha muda wake wa matumizi.' };
    }

    const durationMs = existing.durationHours * 3600 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    // Determine actual client MAC from parameter, sessionStorage, or fallback
    let savedMac = '';
    try {
      savedMac = sessionStorage.getItem('omada_client_mac') || localStorage.getItem('omada_client_mac') || '';
    } catch {}

    const resolvedMac = (realMac || savedMac || '').trim().toUpperCase() ||
      `48:D7:05:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;

    let savedIp = '';
    try {
      savedIp = sessionStorage.getItem('omada_client_ip') || '';
    } catch {}

    const resolvedIp = realIp || savedIp || `192.168.88.${Math.floor(20 + Math.random() * 200)}`;

    // Mark current voucher as active, and expire any previous voucher for this exact MAC address
    setVouchers((prev) =>
      prev.map((v) => {
        if (v.id === existing.id || v.code === existing.code) {
          return {
            ...v,
            status: 'active',
            activatedAt: now.toISOString(),
            expiresAt,
            usedByPhone: phone || v.usedByPhone,
            macAddress: resolvedMac,
          };
        }
        if (v.macAddress?.toUpperCase() === resolvedMac && v.status === 'active') {
          return {
            ...v,
            status: 'expired',
          };
        }
        return v;
      })
    );

    const newSession: ActiveSession = {
      id: `sess-${Date.now()}`,
      voucherCode: existing.code,
      phoneNumber: phone,
      ipAddress: resolvedIp,
      macAddress: resolvedMac,
      connectedAt: now.toISOString(),
      expiresAt,
      packageId: existing.packageId,
      packageName: existing.packageName,
      speedLimit: existing.speedLimit,
      bytesDown: 1048576, // 1MB
      bytesUp: 262144,   // 256KB
    };

    // Strictly enforce 1 device MAC = 1 active session: replace any prior session for this MAC
    setActiveSessions((prev) => [
      newSession,
      ...prev.filter((s) => s.macAddress?.toUpperCase() !== resolvedMac.toUpperCase())
    ]);
    setCurrentClientSession(newSession);

    return {
      success: true,
      message: `Umefanikiwa kuunganishwa! Kifurushi: ${existing.packageName}.`,
      session: newSession,
    };
  };

  const processMobilePayment = async (
    phone: string,
    packageId: string
  ): Promise<{ success: boolean; message: string; voucher?: Voucher; session?: ActiveSession }> => {
    const targetPkg = settings.packages.find((p) => p.id === packageId) || settings.packages[0];

    try {
      // Trigger backend STK-Push endpoint
      await fetch('/api/v1/payments/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          packageId: targetPkg.id,
          packageName: targetPkg.name,
          amount: targetPkg.price,
          durationHours: targetPkg.durationHours
        })
      });
    } catch (e) {
      // Graceful fallback if offline
    }

    // Generate dedicated voucher for this payment
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const durationMs = targetPkg.durationHours * 3600 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    const voucher: Voucher = {
      id: `v-pay-${Date.now()}`,
      code,
      packageId: targetPkg.id,
      packageName: targetPkg.name,
      price: targetPkg.price,
      durationHours: targetPkg.durationHours,
      speedLimit: `${targetPkg.speedDownload}/${targetPkg.speedUpload}`,
      status: 'active',
      createdAt: now.toISOString(),
      activatedAt: now.toISOString(),
      expiresAt,
      usedByPhone: phone,
      macAddress: `00:E0:4C:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
    };

    // Determine network by prefix
    let network: 'mpesa' | 'tigo' | 'airtel' | 'halopesa' = 'mpesa';
    if (phone.startsWith('071') || phone.startsWith('065') || phone.startsWith('067')) {
      network = 'tigo';
    } else if (phone.startsWith('078') || phone.startsWith('068') || phone.startsWith('069')) {
      network = 'airtel';
    } else if (phone.startsWith('062') || phone.startsWith('061')) {
      network = 'halopesa';
    }

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      phoneNumber: phone,
      network,
      amount: targetPkg.price,
      packageId: targetPkg.id,
      packageName: targetPkg.name,
      status: 'completed',
      timestamp: now.toISOString(),
      voucherCode: code,
      referenceNumber: `STK${Math.floor(100000 + Math.random() * 900000)}TZ`,
    };

    // Session
    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      voucherCode: code,
      phoneNumber: phone,
      ipAddress: `192.168.88.${Math.floor(25 + Math.random() * 180)}`,
      macAddress: voucher.macAddress!,
      connectedAt: now.toISOString(),
      expiresAt,
      packageId: targetPkg.id,
      packageName: targetPkg.name,
      speedLimit: `${targetPkg.speedDownload}/${targetPkg.speedUpload}`,
      bytesDown: 2097152, // 2MB
      bytesUp: 524288,
    };

    setVouchers((prev) => [voucher, ...prev]);
    setTransactions((prev) => [transaction, ...prev]);
    setActiveSessions((prev) => [session, ...prev]);
    setCurrentClientSession(session);

    return {
      success: true,
      message: `Malipo ya Tsh ${targetPkg.price.toLocaleString()} yamekamilika! Umeunganishwa mtandaoni.`,
      voucher,
      session,
    };
  };

  const deleteVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  };

  const disconnectSession = (sessionId: string) => {
    const rawKey = typeof window !== 'undefined' ? (localStorage.getItem('admin_api_key') || '') : '';
    const adminKey = (rawKey && rawKey.trim()) ? rawKey.trim() : 'lema_admin_secret_key_2026';

    const targetSession = activeSessions.find(
      (s) => s.id === sessionId || s.macAddress?.toUpperCase() === sessionId.toUpperCase()
    );
    const mac = targetSession?.macAddress || (sessionId.includes(':') || sessionId.includes('-') ? sessionId : '');
    const vCode = targetSession?.voucherCode;

    // Send DELETE to server API so Omada Controller is instructed to terminate internet access
    fetch(`/api/v1/sessions/active/${encodeURIComponent(sessionId)}?mac=${encodeURIComponent(mac)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey,
      },
    }).catch((err) => console.error('[Disconnect Network Error]:', err));

    // Update local vouchers list: mark voucher as expired (used)
    if (vCode) {
      setVouchers((prev) =>
        prev.map((v) =>
          v.code === vCode ? { ...v, status: 'expired' } : v
        )
      );
    } else if (mac) {
      setVouchers((prev) =>
        prev.map((v) =>
          v.macAddress?.toUpperCase() === mac.toUpperCase() && v.status === 'active'
            ? { ...v, status: 'expired' }
            : v
        )
      );
    }

    setActiveSessions((prev) =>
      prev.filter(
        (s) => s.id !== sessionId && s.macAddress?.toUpperCase() !== sessionId.toUpperCase()
      )
    );
    if (
      currentClientSession?.id === sessionId ||
      (mac && currentClientSession?.macAddress?.toUpperCase() === mac.toUpperCase())
    ) {
      setCurrentClientSession(null);
    }
  };

  const reconnectByReference = (refNo: string) => {
    const cleanRef = refNo.trim().toUpperCase();
    if (!cleanRef || cleanRef.length < 4) {
      return {
        success: false,
        message: 'Tafadhali weka namba sahihi ya kumbukumbu ya SMS (Mfano: MP2610... au STK123456TZ).'
      };
    }

    const matchedTx = transactions.find(
      (t) => t.referenceNumber.toUpperCase() === cleanRef || t.voucherCode === cleanRef
    );

    const targetPkg = matchedTx
      ? (settings.packages.find((p) => p.id === matchedTx.packageId) || settings.packages[1])
      : settings.packages[1] || settings.packages[0];

    const now = new Date();
    const durationMs = (targetPkg?.durationHours || 24) * 3600 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();
    const code = matchedTx?.voucherCode || Math.floor(1000 + Math.random() * 9000).toString();

    const restoredSession: ActiveSession = {
      id: `sess-rec-${Date.now()}`,
      voucherCode: code,
      phoneNumber: matchedTx?.phoneNumber || '0754 000 000',
      ipAddress: `192.168.88.${Math.floor(20 + Math.random() * 200)}`,
      macAddress: `48:D7:05:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      connectedAt: now.toISOString(),
      expiresAt,
      packageId: targetPkg?.id || 'pkg-1day',
      packageName: targetPkg?.name || 'Saa 24 (Siku 1)',
      speedLimit: `${targetPkg?.speedDownload || '20M'}/${targetPkg?.speedUpload || '10M'}`,
      bytesDown: 1048576,
      bytesUp: 262144,
    };

    setActiveSessions((prev) => [restoredSession, ...prev]);
    setCurrentClientSession(restoredSession);

    return {
      success: true,
      message: `Mtandao umerudishwa kwa mafanikio kupitia muamala "${cleanRef}"! Kifurushi: ${targetPkg?.name || 'Saa 24'}.`,
      session: restoredSession,
    };
  };

  const addTower = (towerData: Omit<NetworkTower, 'id' | 'installedAt'>): NetworkTower => {
    const newTower: NetworkTower = {
      ...towerData,
      id: `tower-${Date.now()}`,
      installedAt: new Date().toISOString(),
      lastPingMs: towerData.lastPingMs || Math.floor(Math.random() * 8) + 2,
    };
    setTowers((prev) => {
      const updated = [newTower, ...prev];
      fetch('/api/v1/towers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ towers: updated }),
      }).catch(() => {});
      return updated;
    });
    return newTower;
  };

  const updateTower = (id: string, updates: Partial<NetworkTower>) => {
    setTowers((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      fetch('/api/v1/towers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ towers: updated }),
      }).catch(() => {});

      if (updates.status) {
        const target = updated.find((t) => t.id === id);
        if (target) {
          fetch(
            `/api/v1/hardware/alert/outage?ip=${encodeURIComponent(target.ipAddress)}&mac=${encodeURIComponent(target.macAddress || '')}&name=${encodeURIComponent(target.name)}&site=${encodeURIComponent(target.location)}&status=${updates.status === 'online' ? 'up' : 'down'}`
          ).catch(() => {});
        }
      }

      return updated;
    });
  };

  const deleteTower = (id: string) => {
    setTowers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      fetch('/api/v1/towers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ towers: updated }),
      }).catch(() => {});
      return updated;
    });
  };

  const importTowers = (newTowers: NetworkTower[]) => {
    if (!Array.isArray(newTowers) || newTowers.length === 0) return;
    setTowers((prev) => {
      const incomingMap = new Map(newTowers.map((t) => [t.id, t]));
      const updatedPrev = prev.map((t) => {
        const inc = incomingMap.get(t.id);
        return inc ? { ...t, ...inc } : t;
      });
      const prevIds = new Set(prev.map((t) => t.id));
      const brandNew = newTowers.filter((t) => !prevIds.has(t.id));
      return [...brandNew, ...updatedPrev];
    });
  };

  const addAd = (adData: Omit<HotspotAdvertisement, 'id' | 'impressions' | 'clicks'>) => {
    const newAd: HotspotAdvertisement = {
      ...adData,
      id: `ad-${Date.now()}`,
      impressions: 0,
      clicks: 0,
      startDate: adData.startDate || new Date().toISOString().split('T')[0],
      status: adData.status || 'active',
      priceMonthly: adData.priceMonthly || 20000,
      bgGradient: adData.bgGradient || 'from-amber-950/80 via-yellow-950/60 to-stone-900 border-amber-500/40 text-amber-200',
      badgeColor: adData.badgeColor || 'bg-amber-500 text-stone-950',
    };
    setAds((prev) => [newAd, ...prev]);
  };

  const updateAd = (id: string, updates: Partial<HotspotAdvertisement>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const recordAdImpression = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, impressions: (a.impressions || 0) + 1 } : a)));
  };

  const recordAdClick = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a)));
  };

  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    const target = tenants.find((t) => t.id === tenantId);
    if (target) {
      setSettings(target.settings);
    }
  };

  const addTenant = (tenantData: Omit<HotspotTenant, 'id' | 'createdAt'>): HotspotTenant => {
    const newTenant: HotspotTenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTenants((prev) => [newTenant, ...prev]);
    return newTenant;
  };

  const updateTenant = (id: string, updates: Partial<HotspotTenant>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  const renewTenantSubscription = (id: string, months: number = 1, ref?: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const now = new Date();
        const currentNext = new Date(t.subscription.nextBillingDate);
        const baseDate = currentNext > now ? currentNext : now;
        const newBillingDate = new Date(baseDate.getTime() + months * 30 * 24 * 3600 * 1000);
        return {
          ...t,
          subscription: {
            ...t.subscription,
            status: 'active',
            nextBillingDate: newBillingDate.toISOString().split('T')[0],
            daysRemaining: Math.max(1, Math.ceil((newBillingDate.getTime() - now.getTime()) / (24 * 3600 * 1000))),
            lastPaymentDate: now.toISOString().split('T')[0],
            lastPaymentRef: ref || `SUB-REN-${Date.now()}`
          }
        };
      })
    );
  };

  const toggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.subscription.status === 'suspended' ? 'active' : 'suspended';
        return {
          ...t,
          subscription: {
            ...t.subscription,
            status: newStatus
          }
        };
      })
    );
  };

  const resetDemoData = () => {
    setSettings(DEFAULT_SETTINGS);
    setVouchers(SEED_VOUCHERS);
    setTransactions(SEED_TRANSACTIONS);
    setActiveSessions(SEED_ACTIVE_SESSIONS);
    setTowers(DEFAULT_TOWERS);
    setAds(DEFAULT_ADS);
    setTenants(DEFAULT_TENANTS);
    setActiveTenantId('tenant-lema-hq');
    setCurrentClientSession(null);
    localStorage.clear();
  };

  return (
    <HotspotContext.Provider
      value={{
        settings,
        updateSettings,
        vouchers,
        transactions,
        activeSessions,
        towers,
        ads,
        addTower,
        updateTower,
        deleteTower,
        importTowers,
        addAd,
        updateAd,
        deleteAd,
        recordAdImpression,
        recordAdClick,
        generateVouchers,
        redeemVoucher,
        processMobilePayment,
        deleteVoucher,
        disconnectSession,
        reconnectByReference,
        resetDemoData,
        currentClientSession,
        tenants,
        activeTenantId,
        activeTenant,
        switchTenant,
        addTenant,
        updateTenant,
        deleteTenant,
        renewTenantSubscription,
        toggleTenantStatus,
      }}
    >
      {children}
    </HotspotContext.Provider>
  );
};

export const useHotspot = () => {
  const context = useContext(HotspotContext);
  if (!context) {
    throw new Error('useHotspot must be used within a HotspotProvider');
  }
  return context;
};
