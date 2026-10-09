export type Language = 'sw' | 'en';

export type SystemMode = 'standard' | 'ap-only';

export type AppView = 'landing' | 'guide' | 'admin-dashboard' | 'customer-portal';

export interface HotspotPackage {
  id: string;
  name: string;
  price: number;
  durationHours: number;
  speedDownload: string; // e.g. "2.5M"
  speedUpload: string;   // e.g. "1.0M"
  isPopular?: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  packageId: string;
  packageName: string;
  price: number;
  durationHours: number;
  speedLimit: string;
  status: 'unused' | 'active' | 'expired';
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  usedByPhone?: string;
  macAddress?: string;
}

export interface PaymentTransaction {
  id: string;
  phoneNumber: string;
  network: 'mpesa' | 'tigo' | 'airtel' | 'halopesa';
  amount: number;
  packageId: string;
  packageName: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  voucherCode: string;
  referenceNumber: string;
}

export interface ActiveSession {
  id: string;
  voucherCode: string;
  phoneNumber?: string;
  ipAddress: string;
  macAddress: string;
  connectedAt: string;
  expiresAt: string;
  packageId: string;
  packageName: string;
  speedLimit: string;
  bytesDown: number;
  bytesUp: number;
}

export interface HotspotSettings {
  hotspotName: string;
  tagline: string;
  supportPhone: string;
  currency: 'TZS' | 'USD';
  paymentGateway: 'zenopay' | 'snippe' | 'instantpay' | 'paypack' | 'beem' | 'selcom' | 'direct_stk';
  apiKey?: string;
  apiSecret?: string;
  merchantNumber: string; // Lipa Namba or Phone
  accountOwnerName: string; // Jina la mmiliki wa akaunti inayopokea pesa
  payoutMethod: 'lipa_namba' | 'bank' | 'mobile_phone'; // Njia ya kuingiza pesa
  payoutAccount: string; // Namba ya Till au Akaunti
  payoutBankName?: string; // Mfano CRDB / NMB
  payoutFrequency: 'instant' | 'daily';
  packages: HotspotPackage[];
  adminUsername?: string;
  adminPassword?: string;

  // Automated SMS Notifications & Templates
  smsProvider?: 'beem' | 'africastalking' | 'twilio' | 'mtech' | 'custom_webhook';
  smsSenderId?: string;
  smsApiKey?: string;
  smsSecretKey?: string;
  enableExpirySms?: boolean;
  expiryWarningMinutes?: number;
  expirySmsTemplate?: string;
  enableLowBalanceSms?: boolean;
  lowBalanceThresholdMb?: number;
  lowBalanceSmsTemplate?: string;
  enablePurchaseReceiptSms?: boolean;
  purchaseReceiptSmsTemplate?: string;
}

export interface EquipmentItem {
  id: string;
  name: { sw: string; en: string };
  category: 'core' | 'wireless' | 'power' | 'cabling' | 'structure';
  description: { sw: string; en: string };
  recommendedModels: string[];
  estimatedCostTzs: { min: number; max: number };
  estimatedCostUsd: { min: number; max: number };
  whyNeeded: { sw: string; en: string };
  isEssential: boolean;
  isOptionalInApOnly?: boolean;
}

export interface SetupTier {
  id: 'starter' | 'medium' | 'pro';
  name: { sw: string; en: string };
  tagline: { sw: string; en: string };
  capacity: { sw: string; en: string };
  coverageRadius: { sw: string; en: string };
  idealFor: { sw: string; en: string };
  estimatedCapitalTzs: number;
  estimatedCapitalUsd: number;
  equipmentIds: string[];
}

export interface RoadmapStep {
  number: string;
  title: { sw: string; en: string };
  duration: { sw: string; en: string };
  summary: { sw: string; en: string };
  details: { sw: string[]; en: string[] };
  proTip: { sw: string; en: string };
}

export interface FaqItem {
  id: string;
  question: { sw: string; en: string };
  answer: { sw: string; en: string };
}
