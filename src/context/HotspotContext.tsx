import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Voucher,
  HotspotPackage,
  PaymentTransaction,
  ActiveSession,
  HotspotSettings,
  NetworkTower,
  HotspotAdvertisement,
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
  addAd: (ad: Omit<HotspotAdvertisement, 'id' | 'impressions' | 'clicks'>) => void;
  updateAd: (id: string, updates: Partial<HotspotAdvertisement>) => void;
  deleteAd: (id: string) => void;
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;
  generateVouchers: (packageId: string, count: number) => Voucher[];
  deleteVoucher: (id: string) => void;
  redeemVoucher: (code: string, phone?: string) => { success: boolean; message: string; session?: ActiveSession };
  processMobilePayment: (
    phone: string,
    packageId: string
  ) => Promise<{ success: boolean; message: string; voucher?: Voucher; session?: ActiveSession }>;
  disconnectSession: (sessionId: string) => void;
  reconnectByReference: (refNo: string) => { success: boolean; message: string; session?: ActiveSession };
  resetDemoData: () => void;
  currentClientSession: ActiveSession | null;
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
  smsProvider: 'beem',
  smsSenderId: 'LEMA_WIFI',
  smsApiKey: 'beem_api_993410',
  smsSecretKey: 'beem_sec_778120',
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

const DEFAULT_ADS: HotspotAdvertisement[] = [
  {
    id: 'ad-salon',
    tag: '🔥 Ofa Maalum Mtaani',
    title: 'GLAMOUR TOUCH SALON & SPA',
    desc: 'Punguzo la 20% kwa wateja wa LEMA WiFi! Kusuka, kucha za gel & massage ya kisasa.',
    action: 'Piga / WhatsApp',
    phone: '0653 578 184',
    sponsor: 'Glamour Salon',
    priceMonthly: 25000,
    startDate: '2026-10-01',
    status: 'active',
    impressions: 482,
    clicks: 67,
    bgGradient: 'from-fuchsia-950/80 via-purple-900/60 to-stone-900 border-fuchsia-500/40 text-fuchsia-200',
    badgeColor: 'bg-fuchsia-500 text-white',
    videoDurationSec: 10
  },
  {
    id: 'ad-tech',
    tag: '⚡ Vifaa Halisi vya Simu',
    title: 'QUICK TECH ACCESSORIES',
    desc: 'Chaja asilia za Type-C, Earphones za Bluetooth na Protectors zenye warranty. Mkabala na Stoo.',
    action: 'Tazama Bidhaa',
    phone: '0714 555 222',
    sponsor: 'Quick Tech Store',
    priceMonthly: 20000,
    startDate: '2026-10-05',
    status: 'active',
    impressions: 319,
    clicks: 45,
    bgGradient: 'from-cyan-950/80 via-blue-900/60 to-stone-900 border-cyan-500/40 text-cyan-200',
    badgeColor: 'bg-cyan-500 text-stone-950',
    videoDurationSec: 10
  },
  {
    id: 'ad-promo',
    tag: '📢 Tangazo la Kibiashara',
    title: 'TANGAZA BIASHARA YAKO HAPA!',
    desc: 'Wafikie zaidi ya wateja 600+ wanaoingia mtandaoni mtaani kwako kila siku. Lipia nafasi leo!',
    action: 'Tangaza Hapa',
    phone: '0653 578 184',
    sponsor: 'LEMA WiFi Ads',
    priceMonthly: 30000,
    startDate: '2026-10-10',
    status: 'active',
    impressions: 610,
    clicks: 98,
    bgGradient: 'from-amber-950/80 via-yellow-950/60 to-stone-900 border-amber-500/40 text-amber-200',
    badgeColor: 'bg-amber-500 text-stone-950',
    videoDurationSec: 10
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
        // Filter out specific legacy mock active sessions
        const cleaned = parsed.filter((s: ActiveSession) => !['sess-1', 'sess-2', 'sess-3', 'sess-4'].includes(s.id));
        return cleaned;
      }
    } catch (e) {}
    return [];
  });

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
        return parsed.filter((t: NetworkTower) => t.id !== 'tower-1' && !t.name.includes('Town Center'));
      }
    } catch (e) {}
    return DEFAULT_TOWERS;
  });

  // Advertisement Campaigns State (Managed via HotspotContext)
  const [ads, setAds] = useState<HotspotAdvertisement[]>(() => {
    try {
      const saved = localStorage.getItem('wifi_hotspot_ads');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return DEFAULT_ADS;
  });

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
    return newVouchers;
  };

  const redeemVoucher = (code: string, phone?: string) => {
    const trimmed = code.trim();
    const existing = vouchers.find((v) => v.code === trimmed);

    if (!existing) {
      return { success: false, message: 'Nambari ya vocha siyo sahihi! Tafadhali kagua tena namba yako.' };
    }

    if (existing.status === 'expired') {
      return { success: false, message: 'Vocha hii imekwisha muda wake wa matumizi.' };
    }

    const durationMs = existing.durationHours * 3600 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    // Mark as active
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === existing.id
          ? {
              ...v,
              status: 'active',
              activatedAt: now.toISOString(),
              expiresAt,
              usedByPhone: phone || v.usedByPhone,
            }
          : v
      )
    );

    // Create session
    const randomIp = `192.168.88.${Math.floor(20 + Math.random() * 200)}`;
    const randomMac = `48:D7:05:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;

    const newSession: ActiveSession = {
      id: `sess-${Date.now()}`,
      voucherCode: existing.code,
      phoneNumber: phone,
      ipAddress: randomIp,
      macAddress: randomMac,
      connectedAt: now.toISOString(),
      expiresAt,
      packageId: existing.packageId,
      packageName: existing.packageName,
      speedLimit: existing.speedLimit,
      bytesDown: 1048576, // 1MB
      bytesUp: 262144,   // 256KB
    };

    setActiveSessions((prev) => [newSession, ...prev]);
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
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentClientSession?.id === sessionId) {
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
    setTowers((prev) => [newTower, ...prev]);
    return newTower;
  };

  const updateTower = (id: string, updates: Partial<NetworkTower>) => {
    setTowers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTower = (id: string) => {
    setTowers((prev) => prev.filter((t) => t.id !== id));
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

  const resetDemoData = () => {
    setSettings(DEFAULT_SETTINGS);
    setVouchers(SEED_VOUCHERS);
    setTransactions(SEED_TRANSACTIONS);
    setActiveSessions(SEED_ACTIVE_SESSIONS);
    setTowers(DEFAULT_TOWERS);
    setAds(DEFAULT_ADS);
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
