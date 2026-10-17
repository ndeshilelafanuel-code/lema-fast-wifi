import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  Smartphone,
  PhoneCall,
  Check,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  Zap,
  BellRing,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Copy,
  Settings,
  Sparkles,
  Wifi,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Key,
  Globe,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Activity,
  Pause,
  Play,
  Trash2,
  Filter,
  Server,
  Code,
  Cpu
} from 'lucide-react';
import { useHotspot } from '../../context/HotspotContext';
import { HotspotPackage, Voucher } from '../../types';

export interface WhatsAppLogEntry {
  id: string;
  timestamp: string;
  isoTime: string;
  type: 'incoming_message' | 'delivery_status' | 'outgoing_api' | 'webhook_verification' | 'system_alert';
  direction: 'inbound' | 'outbound' | 'internal';
  status: 'success' | 'delivered' | 'sent' | 'read' | 'failed' | 'warning' | 'info' | 'verified';
  summary: string;
  phone?: string;
  code?: number | string;
  details?: string;
  payload?: any;
}

export interface WhatsAppIncomingMessage {
  id: string;
  senderPhone: string;
  senderName: string;
  text: string;
  timestamp: string;
  senderType: 'user' | 'bot' | 'admin';
  category?: 'buy' | 'troubleshoot' | 'status' | 'general' | 'error_report';
  errorDetails?: {
    code?: string;
    description?: string;
    solutionProvided?: string;
  };
  voucherIssued?: {
    code: string;
    packageName: string;
    amount: number;
  };
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  customerName: string;
  status: 'active' | 'resolved' | 'escalated_to_admin';
  lastActivity: string;
  unreadCount: number;
  messages: WhatsAppIncomingMessage[];
  pendingAction?: 'waiting_for_mno_pin' | 'verifying_payment' | null;
  selectedPackage?: HotspotPackage | null;
}

interface WhatsAppBotSuiteProps {
  onShowToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onSendAdminAlert?: (title: string, message: string, severity?: 'warning' | 'error' | 'info') => void;
}

// Built-in intelligent knowledge base for automatic WiFi troubleshooting
const TROUBLESHOOTING_AI_KB = [
  {
    keywords: ['ip', 'obtaining ip', 'haipati ip', 'haiunganishi', 'haiji', 'ip configuration failure', 'connecting...'],
    problemTitle: 'Simu inagoma kupata IP Address (Obtaining IP Address Failure)',
    botReply: `🔧 *UFUMBUZI WA OBTAINING IP ADDRESS:*
1. Zima Wi-Fi ya simu yako kisha washa tena baada ya sekunde 5.
2. Nenda kwenye Wi-Fi settings ya simu, chagua mtandao wetu, kisha bonyeza *"Sahau Mtandao" (Forget Network)* halafu unganisha upya.
3. Hakikisha simu haijaweka 'Static IP' au VPN yoyote.
4. Kama bado haipati, sogea karibu kidogo na antenna (Access Point) uone kama signal imekuwa na nguvu.

_Bado inagoma? Andika neno *ADMIN* ili nikuunganishe na Msimamizi wetu moja kwa moja!_`
  },
  {
    keywords: ['login', 'portal', 'ukurasa', 'haufunguki', 'haitokei', 'haifunguki', 'haiji portal', 'haiangaliki'],
    problemTitle: 'Ukurasa wa Kuingiza Vocha / Malipo Haufunguki (Captive Portal Not Popping)',
    botReply: `🌐 *JINSI YA KUFUNGUA UKURASA WA VOCHA:*
Ukurasa usipofunguka wenyewe kwenye simu yako:
1. Fungua browser yako (Chrome au Safari au Opera).
2. Kwenye sehemu ya kuandika website (URL), andika:
👉 *192.168.88.1* au *neverssl.com* au *hotspot.lema*
3. Ukurasa utatokea mara moja! Weka vocha yako au lipia kwa M-Pesa/Mixx by Yas.
4. *Zingatia:* Zima VPN zote kwanza kama vile Cloudflare WARP au HA Tunnel.`
  },
  {
    keywords: ['haifanyi kazi', 'haisomi', 'code mbovu', 'inakataa', 'invalid voucher', 'haijakubali', 'vocha feki'],
    problemTitle: 'Vocha Inasema "Invalid Username or Password" au "Haijakubali"',
    botReply: `🎟️ *TATIZO LA VOCHA KUKATAA:*
1. Hakikisha hujaweka nafasi (space) mbele au nyuma ya namba za vocha.
2. Angalia namba *0* na herufi *O*, au herufi *I* na namba *1*.
3. Kumbuka: Vocha moja inatumika kwenye *kifaa kimoja tu* kwa wakati mmoja! Kama ulishaiweka kwenye simu nyingine, itakataa kwenye hii mpya mpaka ile ya kwanza izimwe.
4. Nitumie hapa namba ya vocha uliyonunua nikukagulie kwenye mfumo sasa hivi!`
  },
  {
    keywords: ['polepole', 'kasi ndogo', 'slow', 'inaganda', 'inagoma kucheza', 'inazunguka', 'inastuck'],
    problemTitle: 'Kasi Ndogo ya Mtandao / Inaganda',
    botReply: `⚡ *KUREKEBISHA KASI YA MTANDAO:*
1. Angalia kama kifurushi chako hakijaisha muda wake.
2. Angalia wingi wa milia (Signal Bars) za Wi-Fi kwenye simu yako. Zikiwa 1 au 2, sogea karibu na kifaa chetu.
3. Kwenye simu yako, funga Apps zote zilizofunguliwa chini (Background Apps kama updates za Play Store/iOS).
4. Zima Wi-Fi na uwashe tena ili upewe channel yenye kasi zaidi.`
  },
  {
    keywords: ['nimelipa', 'pesa imekatwa', 'sijapata vocha', 'muamala', 'nimekatwa', 'pesa yangu', 'sijapewa'],
    problemTitle: 'Mteja Amelipa Lakini Bado Hajapokea Vocha / Hajaunganishwa',
    botReply: `💰 *UKAGUZI WA MALIPO YA PAPO HAPO:*
Usiwe na wasiwasi! Pesa yako iko salama 100%.
Tafadhali nitumie:
1. Namba yako ya simu uliyolipia (Mfano: 0754xxxxxx au 0712xxxxxx)
2. Au namba ya kumbukumbu ya muamala (Transaction ID ya M-Pesa / Mixx by Yas / Airtel).

_Naisoma database sasa hivi na kukutumia vocha yako mara moja!_`
  }
];

export const WhatsAppBotSuite: React.FC<WhatsAppBotSuiteProps> = ({
  onShowToast,
  onSendAdminAlert
}) => {
  const { settings, vouchers, generateVouchers, redeemVoucher } = useHotspot();

  // Active subtab inside WhatsApp module
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'inbox' | 'setup_guide' | 'ai_kb' | 'webhook_tester' | 'live_logs'>('simulator');

  // WhatsApp Gateway Configuration states - Meta Cloud API (Official - Unlimited Numbers)
  const [gatewayType] = useState<'meta_cloud'>('meta_cloud');
  
  // Meta WhatsApp Cloud API credentials
  const [metaAppId, setMetaAppId] = useState<string>(() => localStorage.getItem('lema_meta_app_id') || '1860632731565594');
  const [metaWabaId, setMetaWabaId] = useState<string>(() => localStorage.getItem('lema_meta_waba_id') || '1578703743479175');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState<string>(() => {
    const saved = localStorage.getItem('lema_meta_phone_number_id');
    return (!saved || saved === '1424208230767782') ? '1348304901706270' : saved;
  });
  const [metaDisplayPhone, setMetaDisplayPhone] = useState<string>(() => localStorage.getItem('lema_meta_display_phone') || '+255 621 311 137');
  const [metaAccessToken, setMetaAccessToken] = useState<string>(() => localStorage.getItem('lema_meta_access_token') || '');
  const [metaAppSecret, setMetaAppSecret] = useState<string>(() => localStorage.getItem('lema_meta_app_secret') || '');
  const [metaVerifyToken, setMetaVerifyToken] = useState<string>(() => localStorage.getItem('lema_meta_verify_token') || 'lema_wifi_webhook_token');
  const [testRecipientPhone, setTestRecipientPhone] = useState<string>('0653578184');

  const [botPhoneNumber, setBotPhoneNumber] = useState<string>('0621 311 137');
  const [adminNotificationPhone, setAdminNotificationPhone] = useState<string>('0653578184');
  const [isBotConnected, setIsBotConnected] = useState<boolean>(true);
  const [isTestingSend, setIsTestingSend] = useState<boolean>(false);
  const [testSendResult, setTestSendResult] = useState<{ message: string; isError: boolean; isOAuth?: boolean; isNotRegistered?: boolean; isAppSecretProof?: boolean } | null>(null);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [metaLastError, setMetaLastError] = useState<{ type: string; code?: number; message: string; timestamp: string; isNotRegistered?: boolean; isAppSecretProof?: boolean } | null>(null);
  const [isRegisteringPhone, setIsRegisteringPhone] = useState<boolean>(false);
  const [registerPin, setRegisterPin] = useState<string>('123456');
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);
  const [autoSellPackages, setAutoSellPackages] = useState<boolean>(true);
  const [autoResolveErrors, setAutoResolveErrors] = useState<boolean>(true);
  const [sendDashboardAlertOnEscalate, setSendDashboardAlertOnEscalate] = useState<boolean>(true);

  // Live Logs States
  const [liveLogs, setLiveLogs] = useState<WhatsAppLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState<boolean>(true);
  const [logFilter, setLogFilter] = useState<'all' | 'webhook' | 'outgoing' | 'errors' | 'delivered'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState<boolean>(false);
  const [showRenderComparison, setShowRenderComparison] = useState<boolean>(false);

  // Copied states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Conversations State
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(() => {
    return [
      {
        id: 'conv-1',
        phone: '255714200900',
        customerName: 'Amina Hamisi',
        status: 'active',
        lastActivity: 'Sekunde 45 zilizopita',
        unreadCount: 0,
        messages: [
          {
            id: 'm-1',
            senderPhone: '255714200900',
            senderName: 'Amina Hamisi',
            text: 'Habari, nahitaji bando la masaa 24',
            timestamp: '10:14 AM',
            senderType: 'user',
            category: 'buy'
          },
          {
            id: 'm-2',
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `Habari Amina! Karibu ${settings.hotspotName || 'Lema Fast WiFi'}. Hivi ndivyo vifurushi vilivyopo:

1️⃣ Saa 2 za Haraka - TZS 500
2️⃣ Saa 24 (Siku 1) - TZS 1,000 ⭐
3️⃣ Siku 7 (Wiki 1) - TZS 5,000
4️⃣ Siku 30 (Mwezi 1) - TZS 25,000

Jibu namba ya kifurushi unachotaka (Mfano: *2*)`,
            timestamp: '10:14 AM',
            senderType: 'bot'
          },
          {
            id: 'm-3',
            senderPhone: '255714200900',
            senderName: 'Amina Hamisi',
            text: '2',
            timestamp: '10:15 AM',
            senderType: 'user',
            category: 'buy'
          },
          {
            id: 'm-4',
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `Umechagua: *Saa 24 (Siku 1) - TZS 1,000* 🎉
Tafadhali thibitisha namba ya kulipia. Je, utalipia kwa namba hii *0714200900*?
Jibu *NDIYO* au andika namba nyingine unayotaka kutumia.`,
            timestamp: '10:15 AM',
            senderType: 'bot'
          }
        ]
      },
      {
        id: 'conv-2',
        phone: '255755333444',
        customerName: 'Baraka Mushi',
        status: 'escalated_to_admin',
        lastActivity: 'Dakika 12 zilizopita',
        unreadCount: 1,
        messages: [
          {
            id: 'm-201',
            senderPhone: '255755333444',
            senderName: 'Baraka Mushi',
            text: 'Nimenunua vocha lakini inasema Invalid Username or Password nifanyeje?',
            timestamp: '09:55 AM',
            senderType: 'user',
            category: 'error_report'
          },
          {
            id: 'm-202',
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `Habari ndugu Baraka! 
1. Hakikisha hujaweka nafasi (space) mbele au nyuma ya vocha.
2. Vocha moja inatumika kwa kifaa kimoja tu.
Je unaweza kunitumia tarakimu za vocha yako hapa nikague?`,
            timestamp: '09:55 AM',
            senderType: 'bot'
          },
          {
            id: 'm-203',
            senderPhone: '255755333444',
            senderName: 'Baraka Mushi',
            text: 'Vocha ni V-99014 lakini bado inakataa kabisa nahitaji msaada wa haraka!',
            timestamp: '09:56 AM',
            senderType: 'user',
            category: 'error_report'
          },
          {
            id: 'm-204',
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `🚨 *TAARIFA IMEPELEKWA KWA MSIMAMIZI:*
Nimekutumia tahadhari kwa Msimamizi wetu na nimeweka suala lako kwenye Dashboard. Anapitia vocha yako sasa hivi na atakujibu punde!`,
            timestamp: '09:56 AM',
            senderType: 'bot'
          }
        ]
      }
    ];
  });

  // Selected conversation in inbox
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');

  // Customer simulator interactive states
  const [simPhone, setSimPhone] = useState<string>('0765987123');
  const [simName, setSimName] = useState<string>('Mteja wa Mtaani');
  const [simInput, setSimInput] = useState<string>('');
  const [simMessages, setSimMessages] = useState<WhatsAppIncomingMessage[]>([
    {
      id: 'sim-init',
      senderPhone: 'bot',
      senderName: 'Lema Fast WiFi Bot 🤖',
      text: `Habari! Karibu ${settings.hotspotName || 'Lema Fast WiFi'} Smart Assistant. 👋

📶 *VIFURUSHI VYA INTANETI:*
1️⃣ *Saa 2 za Haraka* - TZS 500 ➔ Jibu: *1*
2️⃣ *Saa 24 (Siku 1)* - TZS 1,000 ⭐ ➔ Jibu: *2*
3️⃣ *Siku 7 (Wiki 1)* - TZS 5,000 ➔ Jibu: *3*
4️⃣ *Siku 30 (Mwezi 1)* - TZS 25,000 ➔ Jibu: *4*

👉 *Andika namba (1, 2, 3 au 4) kupata vocha sasa hivi!*
🛠️ Una shida? Eleza tatizo (Mfano: "Ukurasa haufunguki", "Haipati IP", "Vocha inakataa")
👨‍💼 Unahitaji msaada? Andika *ADMIN* au piga *0653 578 184*.`,
      timestamp: 'Sasa hivi',
      senderType: 'bot'
    }
  ]);
  const [simPendingFlow, setSimPendingFlow] = useState<{
    step: 'idle' | 'awaiting_payment_confirm' | 'processing_payment';
    pkg?: HotspotPackage;
    phone?: string;
  }>({ step: 'idle' });

  // Webhook tester input
  const [testWebhookPayload, setTestWebhookPayload] = useState<string>(
    JSON.stringify(
      {
        event: 'messages.upsert',
        data: {
          key: { remoteJid: '255712999000@s.whatsapp.net', fromMe: false },
          pushName: 'Kelvin Temu',
          message: { conversation: 'Ukurasa wa vocha haufunguki kwenye simu yangu' }
        }
      },
      null,
      2
    )
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegisterPhone = async (pinToUse?: string) => {
    setIsRegisteringPhone(true);
    setRegisterSuccessMessage(null);
    try {
      const res = await fetch('/api/v1/whatsapp/register-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToUse || registerPin || '123456' })
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      setIsRegisteringPhone(false);
      if (data?.success) {
        setMetaLastError(null);
        setRegisterSuccessMessage('✅ Namba imesajiliwa kikamilifu kwenye Meta WhatsApp Cloud API! Sasa ujumbe unaweza kutoka.');
        if (onShowToast) onShowToast('Usajili Umefaulu! 🎉', 'Namba ya simu imesajiliwa Meta Cloud API', 'success');
      } else {
        const errMsg = data?.error?.message || data?.message || 'Hitilafu ya kusajili namba Meta au seva inawaka.';
        if (onShowToast) onShowToast('Hitilafu ya Usajili', errMsg, 'error');
      }
    } catch (err: any) {
      setIsRegisteringPhone(false);
      if (onShowToast) onShowToast('Hitilafu ya Mtandao', 'Haikuweza kuungana na seva', 'error');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [simMessages]);

  // Load active server config & sync real WhatsApp messages
  useEffect(() => {
    // 1. Fetch current server config
    fetch('/api/v1/whatsapp/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg?.appId) {
          setMetaAppId(cfg.appId);
          localStorage.setItem('lema_meta_app_id', cfg.appId);
        }
        if (cfg?.wabaId) {
          setMetaWabaId(cfg.wabaId);
          localStorage.setItem('lema_meta_waba_id', cfg.wabaId);
        }
        if (cfg?.phoneNumberId) {
          setMetaPhoneNumberId(cfg.phoneNumberId);
          localStorage.setItem('lema_meta_phone_number_id', cfg.phoneNumberId);
        }
        if (cfg?.displayPhoneNumber) {
          setMetaDisplayPhone(cfg.displayPhoneNumber);
          localStorage.setItem('lema_meta_display_phone', cfg.displayPhoneNumber);
        }
        if (cfg?.accessToken) {
          setMetaAccessToken(cfg.accessToken);
          localStorage.setItem('lema_meta_access_token', cfg.accessToken);
        } else {
          // If server was restarted and has empty token, re-hydrate server with browser's saved token
          const localToken = localStorage.getItem('lema_meta_access_token');
          const localSecret = localStorage.getItem('lema_meta_app_secret');
          const localPhoneId = localStorage.getItem('lema_meta_phone_number_id');
          const localAppId = localStorage.getItem('lema_meta_app_id');
          const localWabaId = localStorage.getItem('lema_meta_waba_id');
          const localDisplayPhone = localStorage.getItem('lema_meta_display_phone');
          if (localToken && localToken.length > 20) {
            fetch('/api/v1/whatsapp/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'meta',
                appId: localAppId || '1860632731565594',
                wabaId: localWabaId || '1578703743479175',
                displayPhoneNumber: localDisplayPhone || '+255 621 311 137',
                phoneNumberId: localPhoneId || '1348304901706270',
                accessToken: localToken,
                appSecret: localSecret || '',
                verifyToken: 'lema_wifi_webhook_token'
              })
            }).catch(() => {});
          }
        }
        if (cfg?.appSecret) {
          setMetaAppSecret(cfg.appSecret);
          localStorage.setItem('lema_meta_app_secret', cfg.appSecret);
        }
        if (cfg?.verifyToken) {
          setMetaVerifyToken(cfg.verifyToken);
          localStorage.setItem('lema_meta_verify_token', cfg.verifyToken);
        }
        if (cfg?.lastError) {
          setMetaLastError(cfg.lastError);
        }
      })
      .catch(() => {});

    // 2. Poll recent incoming/outgoing messages from WhatsApp webhook
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/whatsapp/messages');
        const data = await res.json();
        if (data?.lastError !== undefined) {
          setMetaLastError(data.lastError);
        }
        if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          // Group incoming messages by customer phone
          const serverMsgs: any[] = data.messages;
          const userMsgs = serverMsgs.filter((m) => m.senderType === 'user' && m.senderPhone);
          
          if (userMsgs.length > 0) {
            setConversations((prev) => {
              const updated = [...prev];
              userMsgs.forEach((uMsg) => {
                const phone = uMsg.senderPhone;
                const existingIndex = updated.findIndex((c) => c.phone === phone);
                const relatedMsgs = serverMsgs.filter(
                  (m) => m.senderPhone === phone || (m.senderPhone === 'bot' && m.timestamp === uMsg.timestamp)
                );

                const mappedMsgs: WhatsAppIncomingMessage[] = relatedMsgs.map((m) => ({
                  id: m.id,
                  senderPhone: m.senderPhone,
                  senderName: m.senderName,
                  text: m.text,
                  timestamp: m.timestamp,
                  senderType: m.senderType
                }));

                if (existingIndex >= 0) {
                  // Merge if new
                  const currentMsgIds = new Set(updated[existingIndex].messages.map((m) => m.id));
                  const newOnes = mappedMsgs.filter((m) => !currentMsgIds.has(m.id));
                  if (newOnes.length > 0) {
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      lastActivity: 'Sasa hivi',
                      messages: [...updated[existingIndex].messages, ...newOnes]
                    };
                  }
                } else {
                  // Create new conversation entry in inbox
                  updated.unshift({
                    id: `conv-live-${phone}`,
                    phone: phone,
                    customerName: uMsg.senderName || `Mteja ${phone}`,
                    status: 'active',
                    lastActivity: 'Sasa hivi',
                    unreadCount: 1,
                    messages: mappedMsgs
                  });
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        // quiet polling error
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Fetch live logs from server
  const fetchLiveLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/v1/whatsapp/logs');
      const data = await res.json();
      if (data && Array.isArray(data.logs)) {
        setLiveLogs(data.logs);
      }
    } catch (e) {
      // quiet
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Poll logs when live logs tab is active and autoRefreshLogs is true
  useEffect(() => {
    if (activeSubTab !== 'live_logs') return;
    fetchLiveLogs();
    if (!autoRefreshLogs) return;

    const logInterval = setInterval(() => {
      fetchLiveLogs();
    }, 2500);

    return () => clearInterval(logInterval);
  }, [activeSubTab, autoRefreshLogs]);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/v1/whatsapp/logs/clear', { method: 'POST' });
      setLiveLogs([]);
      if (onShowToast) {
        onShowToast('Imefutwa', 'Kumbukumbu za Live Logs zimetiwa safi.', 'success');
      }
    } catch (e) {
      if (onShowToast) {
        onShowToast('Hitilafu', 'Imeshindwa kufuta kumbukumbu.', 'error');
      }
    }
  };

  const handleSimulateWebhook = async (simType: string) => {
    try {
      setIsSimulatingWebhook(true);
      const res = await fetch('/api/v1/whatsapp/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: simType, phone: testRecipientPhone || '255653578184' })
      });
      const data = await res.json();
      if (data.success) {
        if (onShowToast) {
          onShowToast('Imeigizwa!', `Webhook (${simType}) imetumwa na kuingia kwenye logi.`, 'success');
        }
        fetchLiveLogs();
      } else {
        if (onShowToast) {
          onShowToast('Hitilafu', data.error || 'Imeshindwa kuiga webhook.', 'error');
        }
      }
    } catch (e) {
      if (onShowToast) {
        onShowToast('Hitilafu', 'Hitilafu ya mtandao wakati wa kuiga webhook.', 'error');
      }
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    if (onShowToast) {
      onShowToast('Imenakiliwa!', `${label} imenakiliwa kwenye clipboard.`, 'success');
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // The Heart of the WhatsApp Bot: Process Customer Messages Automatically
  const handleSimSend = (textToSend?: string) => {
    const rawText = textToSend || simInput;
    if (!rawText.trim()) return;

    const userMsg: WhatsAppIncomingMessage = {
      id: `sim-u-${Date.now()}`,
      senderPhone: simPhone,
      senderName: simName,
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: 'user'
    };

    setSimMessages((prev) => [...prev, userMsg]);
    setSimInput('');

    // Let the Bot Think and Respond like in Real Life
    setTimeout(() => {
      const lower = rawText.toLowerCase().trim();

      // FLOW 1: Payment Awaiting confirmation
      if (simPendingFlow.step === 'awaiting_payment_confirm') {
        if (lower === 'ndiyo' || lower === 'yes' || lower === 'ndio' || lower === '1') {
          const selectedPkg = simPendingFlow.pkg || settings.packages[1] || settings.packages[0];
          
          // Step 1: Tell user push is coming
          const pushMsg: WhatsAppIncomingMessage = {
            id: `sim-b-${Date.now()}-push`,
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `📲 *OMBI LA MALIPO LIMETUMWA!*
Tafadhali angalia screen ya simu yako (*${simPhone}*). 
Ingiza PIN ya M-Pesa / Tigo Pesa kukamilisha malipo ya *TZS ${selectedPkg.price.toLocaleString()}*.
Inachukua sekunde 5 tu... ⏳`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderType: 'bot'
          };
          setSimMessages((prev) => [...prev, pushMsg]);
          setSimPendingFlow({ step: 'processing_payment', pkg: selectedPkg, phone: simPhone });

          // Step 2: Auto-Generate Real Voucher and Deliver
          setTimeout(() => {
            const newVouchers = generateVouchers(selectedPkg.id, 1);
            const issuedVoucher = newVouchers[0];

            const successMsg: WhatsAppIncomingMessage = {
              id: `sim-b-${Date.now()}-done`,
              senderPhone: 'bot',
              senderName: 'Lema Fast WiFi Bot 🤖',
              text: `🎉 *MALIPO YAMEPOKELEWA KWA MAFANIKIO!*
Asante sana! Kifurushi chako kimefunguliwa.

🎫 *Vocha Yako:* \`${issuedVoucher.code}\`
📦 *Kifurushi:* ${selectedPkg.name}
⏱️ *Muda:* Masaa ${selectedPkg.durationHours}
⚡ *Kasi:* ${selectedPkg.speedDownload} Down / ${selectedPkg.speedUpload} Up

👉 *JINSI YA KUUNGANISHA:*
1. Fungua Wi-Fi yako, unganisha na *${settings.hotspotName || 'Lema Fast WiFi'}*.
2. Ukurasa utatokea, weka tarakimu hizi: *${issuedVoucher.code}*
3. Au bofya kiunganishi hiki moja kwa moja:
http://192.168.88.1/login?username=${issuedVoucher.code}

_Msaada zaidi piga: ${settings.supportPhone || '0653 578 184'}._ Furahia intaneti ya kasi!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              senderType: 'bot',
              voucherIssued: {
                code: issuedVoucher.code,
                packageName: selectedPkg.name,
                amount: selectedPkg.price
              }
            };

            setSimMessages((prev) => [...prev, successMsg]);
            setSimPendingFlow({ step: 'idle' });

            // Notify Dashboard in real-time
            if (onSendAdminAlert) {
              onSendAdminAlert(
                '💰 Vocha Imeuzwa Kupitia WhatsApp Bot!',
                `Mteja ${simName} (${simPhone}) amenunua ${selectedPkg.name} kwa TZS ${selectedPkg.price.toLocaleString()}. Vocha: ${issuedVoucher.code}`,
                'info'
              );
            }
          }, 2500);

          return;
        } else {
          // Changed mind or typed another number
          setSimPendingFlow({ step: 'idle' });
          const cancelMsg: WhatsAppIncomingMessage = {
            id: `sim-b-${Date.now()}-c`,
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: `Hakuna shida. Andika *1* kuanza upya au andika tatizo lolote la mtandao unalokutana nalo nikusaidie!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderType: 'bot'
          };
          setSimMessages((prev) => [...prev, cancelMsg]);
          return;
        }
      }

      // FLOW 2: Menu / Buy packages
      if (lower === 'vifurushi' || lower === 'bando' || lower === 'kifurushi' || lower === 'bei' || lower === 'nunua' || lower === 'menu' || lower === 'orodha') {
        const pkgs = settings.packages || [];
        let listText = `📶 *CHAGUA KIFURUSHI CHA MTANDAO:*\n\n`;
        pkgs.forEach((p, idx) => {
          listText += `*${idx + 1}️⃣ ${p.name}*\n   💰 Bei: TZS ${p.price.toLocaleString()} | Masaa ${p.durationHours} | Kasi: ${p.speedDownload}\n\n`;
        });
        listText += `Jibu namba ya kifurushi unachotaka (Mfano: *1*, *2*, au *3*).`;

        const botReply: WhatsAppIncomingMessage = {
          id: `sim-b-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: listText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot'
        };
        setSimMessages((prev) => [...prev, botReply]);
        return;
      }

      // Check if user selected package index (1, 2, 3, 4)
      const pkgIndex = parseInt(lower) - 1;
      if (!isNaN(pkgIndex) && settings.packages && settings.packages[pkgIndex]) {
        const pkg = settings.packages[pkgIndex];
        setSimPendingFlow({ step: 'awaiting_payment_confirm', pkg, phone: simPhone });

        const confirmMsg: WhatsAppIncomingMessage = {
          id: `sim-b-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: `🎯 Umechagua: *${pkg.name}*
💰 Kiasi: *TZS ${pkg.price.toLocaleString()}*
⚡ Kasi: *${pkg.speedDownload}*
⏱️ Muda: *Masaa ${pkg.durationHours}*

Je, utalipia kwa namba hii *${simPhone}* kupitia M-Pesa / Tigo Pesa?
👉 Jibu *NDIYO* kutumiwa popup ya kuweka PIN mara moja!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot'
        };
        setSimMessages((prev) => [...prev, confirmMsg]);
        return;
      }

      // FLOW 3: Intelligent Knowledge Base matching for customer errors & troubleshooting
      const matchedKnowledge = TROUBLESHOOTING_AI_KB.find((item) =>
        item.keywords.some((k) => lower.includes(k))
      );

      if (matchedKnowledge) {
        const kbReply: WhatsAppIncomingMessage = {
          id: `sim-b-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: matchedKnowledge.botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot',
          category: 'troubleshoot',
          errorDetails: {
            description: matchedKnowledge.problemTitle,
            solutionProvided: 'AI Instant Troubleshooting Guide Sent'
          }
        };

        setSimMessages((prev) => [...prev, kbReply]);

        // If error is high severity or user expressed frustration, notify admin
        if (
          lower.includes('haijakubali') ||
          lower.includes('pesa imekatwa') ||
          lower.includes('feki') ||
          lower.includes('msaada') ||
          lower.includes('admin')
        ) {
          if (sendDashboardAlertOnEscalate && onSendAdminAlert) {
            onSendAdminAlert(
              `⚠️ Mteja Kwenye WhatsApp: ${matchedKnowledge.problemTitle}`,
              `Mteja ${simName} (${simPhone}) amerepoti: "${rawText}". Bot imempatia mwongozo wa kwanza na kumshauri atume vocha/muamala.`,
              'warning'
            );
          }
        }
        return;
      }

      // FLOW 4: Admin Escalation request
      if (lower.includes('admin') || lower.includes('ongea na mtu') || lower.includes('msimamizi') || lower.includes('piga')) {
        const adminEscalateMsg: WhatsAppIncomingMessage = {
          id: `sim-b-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: `👨‍💼 *TUMEPOKEA OMBI LAKO LA KUONGEA NA MSIMAMIZI:*
Nimepeleka taarifa mara moja kwenye Dashboard ya Admin. 
Pia unaweza kumpigia au kumtumia ujumbe wa kawaida moja kwa moja namba:
📞 *${settings.supportPhone || '0653 578 184'}* (Jimmy Lema).
Subiri kidogo atajibu hapa hapa WhatsApp!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot'
        };
        setSimMessages((prev) => [...prev, adminEscalateMsg]);

        if (onSendAdminAlert) {
          onSendAdminAlert(
            '🚨 WhatsApp Escalation: Mteja Anahitaji Msaada wa Admin!',
            `Mteja ${simName} (${simPhone}) ameomba kuunganishwa na Msimamizi. Ujumbe wake: "${rawText}"`,
            'error'
          );
        }
        return;
      }

      // DEFAULT FALLBACK: Intelligent Polite Menu
      const fallbackMsg: WhatsAppIncomingMessage = {
        id: `sim-b-${Date.now()}`,
        senderPhone: 'bot',
        senderName: 'Lema Fast WiFi Bot 🤖',
        text: `Habari! Nimepokea ujumbe wako: _"${rawText}"_

Kama unataka:
1️⃣ *Kununua Vocha:* Andika namba *1*
2️⃣ *Kutatua Tatizo la Mtandao:* Eleza tatizo (Mfano: "Haipati IP", "Ukurasa haufunguki", "Vocha inakataa")
3️⃣ *Kuongea na Mmiliki:* Andika *ADMIN* au piga *${settings.supportPhone || '0653 578 184'}*

Niko hapa kuhakikisha unapata huduma bora saa 24/7 bila kukatika! 🙌`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderType: 'bot'
      };

      setSimMessages((prev) => [...prev, fallbackMsg]);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-stone-800">
      {/* 1. TOP HERO BANNER: 100% AUTOMATED WHATSAPP BOT ENGINE */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#1f3629] to-stone-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold font-mono">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>100% WhatsApp Hotspot Bot & Auto-Care Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hudumia Wateja <span className="text-emerald-400">100% Kwenye WhatsApp</span> Bila Wewe Kuwepo!
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Wateja wanaweza <strong>kuchagua bando, kulipa kwa M-Pesa/Mixx by Yas, na kupokea vocha zao papo hapo</strong> kwenye WhatsApp. Pia wakipata hitilafu (kama <em>Obtaining IP</em>, <em>Captive portal kutofunguka</em> au <em>Invalid Vocha</em>), bot inawapa majibu ya kitaalamu mara moja na kukutumia <strong>Notification kwenye Dashboard yako</strong>!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className="p-3.5 bg-black/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Hali ya Bot:</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Bot Iko Hewani (Active 24/7)
                </span>
              </div>
            </div>

            <div className="p-3 bg-black/30 border border-white/10 rounded-2xl text-[11px] text-stone-300 flex items-center justify-between gap-4">
              <span className="text-stone-400">Namba ya Biashara:</span>
              <strong className="text-white font-mono">{botPhoneNumber}</strong>
            </div>
          </div>
        </div>

        {/* Quick Subtab Pills */}
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'simulator'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulator ya Simu ya Mteja (Jaribu Hapa)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'inbox'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mawasiliano ya Wateja (Live Inbox)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">1 Alert</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_kb')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ai_kb'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ubongo wa Bot (Troubleshooting AI Knowledge Base)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('setup_guide')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'setup_guide'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Sanidi WhatsApp Gateway Yako (Kazi ya Dakika 3)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('live_logs')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'live_logs'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'bg-white/10 text-stone-300 hover:bg-white/15'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Kumbukumbu za Live (Terminal Logs) 🟢</span>
          </button>
        </div>
      </div>

      {/* 2B. SUBTAB CONTENT: LIVE LOGS & WEBHOOK INSPECTOR (Terminal View) */}
      {activeSubTab === 'live_logs' && (
        <div className="space-y-6">
          {/* Header Card with Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl text-stone-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                    WhatsApp & Meta Webhook Live Terminal
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    LIVE MONITOR (Hapa Hapa)
                  </span>
                </div>
                <p className="text-stone-400 text-sm mt-1">
                  Tazama matukio yote ya Meta Webhook, jumbe zinazoingia, majibu ya API, na hitilafu za 24hr window kwa wakati halisi bila haja ya kuhamia Render!
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-3">
                <button
                  onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                    autoRefreshLogs 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                  title={autoRefreshLogs ? 'Auto-refresh imewashwa (kila sekunde 2.5)' : 'Auto-refresh imesitishwa'}
                >
                  {autoRefreshLogs ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoRefreshLogs ? 'Auto-Refresh (ON)' : 'Imesitishwa'}</span>
                </button>

                <button
                  onClick={fetchLiveLogs}
                  disabled={isLoadingLogs}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-stone-700"
                >
                  <Activity className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Burudisha (Refresh)</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Futa Logi</span>
                </button>

                <button
                  onClick={() => setShowRenderComparison(!showRenderComparison)}
                  className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-sky-500/30"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Google Cloud Run vs Render</span>
                </button>
              </div>
            </div>

            {/* Cloud Run vs Render Comparison Banner */}
            {showRenderComparison && (
              <div className="mt-6 bg-sky-950/40 border border-sky-500/30 rounded-xl p-5 text-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-400" />
                    Kwanini Google Cloud Run (Ambapo tupo sasa) ni Bora zaidi kuliko Render kwa WhatsApp Bot:
                  </h4>
                  <button 
                    onClick={() => setShowRenderComparison(false)}
                    className="text-xs text-sky-400 hover:underline cursor-pointer font-bold"
                  >
                    Ficha
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-sky-900/30 p-3 rounded-lg border border-sky-500/20 space-y-1.5">
                    <span className="font-bold text-emerald-400 block">✓ Google Cloud Run (Hapa Hapa)</span>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Hakuna "Spin-down" kutokana na kutotumika (Always On). Webhook za Meta hazitawahi kukosa (No 504 Gateway Timeout).</li>
                      <li>Live terminal logs zote zinaonekana hapa hapa kwenye Dashboard yako papo hapo.</li>
                      <li>Ina scalability ya kipekee ya Google bila kikomo cha CPU.</li>
                    </ul>
                  </div>
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-700 space-y-1.5">
                    <span className="font-bold text-amber-400 block">⚠️ Render Free Tier (Kama tulivyoshauriwa)</span>
                    <ul className="list-disc list-inside space-y-1 text-stone-400">
                      <li>Inasota/Inazima (Spin-down) baada ya dakika 15 za kutokuwa na HTTP request.</li>
                      <li>Meta Webhook ikipiga simu wakati Render imezima, Meta inakata na kutoa hitilafu ya "Webhook Delivery Failed".</li>
                      <li>Unahitaji kulipia $7+/mwezi ili iwe Always On.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Webhook Simulator Actions */}
            <div className="mt-6 pt-6 border-t border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Jaribu Kuiga Webhook (Simulator):</span>
                <span className="text-[11px] text-stone-500">Iga ujumbe unaoingia kutoka kwa Meta moja kwa moja kwenye seva yako</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleSimulateWebhook('incoming_text')}
                  disabled={isSimulatingWebhook}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Iga Ujumbe ("Habari")</span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('verify_challenge')}
                  disabled={isSimulatingWebhook}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border border-stone-700 disabled:opacity-50"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Iga Webhook Verify (GET)</span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('delivery_status')}
                  disabled={isSimulatingWebhook}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border border-stone-700 disabled:opacity-50"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Iga Delivery (Delivered/Read)</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-300">Chuja Logi:</span>
                <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  {(['all', 'webhook', 'outgoing', 'errors', 'delivered'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        logFilter === f
                          ? 'bg-emerald-500 text-stone-950 shadow'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' && 'Zote'}
                      {f === 'webhook' && 'Webhooks'}
                      {f === 'outgoing' && 'Outgoing API'}
                      {f === 'errors' && 'Hitilafu (Errors)'}
                      {f === 'delivered' && 'Uwasilishaji'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-stone-400 font-mono">
                Jumla: <span className="font-bold text-white">{liveLogs.length}</span> matukio yamerekodiwa
              </div>
            </div>
          </div>

          {/* Terminal Logs Stream List */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-stone-900 px-6 py-3 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="ml-2 font-bold text-white">/api/v1/whatsapp/logs — Terminal Stream</span>
              </div>
              <span className="text-emerald-400">🟢 Real-time JSON Stream</span>
            </div>

            <div className="divide-y divide-stone-900 max-h-[600px] overflow-y-auto font-mono text-xs">
              {liveLogs.length === 0 ? (
                <div className="py-16 text-center text-stone-500 space-y-3">
                  <Activity className="w-10 h-10 mx-auto text-stone-700 animate-pulse" />
                  <p className="font-bold text-sm">Hakuna kumbukumbu za WhatsApp zilizorekodiwa bado.</p>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    Jaribu kutuma ujumbe kwenye Simulator au ubonyeze kitufe cha "Iga Ujumbe" hapo juu ili kuona jinsi Webhook na API zinavyoingia papo hapo.
                  </p>
                </div>
              ) : (
                liveLogs
                  .filter((log) => {
                    if (logFilter === 'all') return true;
                    if (logFilter === 'webhook') return log.type === 'incoming_message' || log.type === 'webhook_verification';
                    if (logFilter === 'outgoing') return log.type === 'outgoing_api';
                    if (logFilter === 'errors') return log.status === 'failed' || !!log.code;
                    if (logFilter === 'delivered') return log.status === 'delivered' || log.status === 'read';
                    return true;
                  })
                  .map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const isErr = log.status === 'failed' || !!log.code;
                    const isSucc = log.status === 'success' || log.status === 'verified' || log.status === 'delivered';

                    return (
                      <div 
                        key={log.id} 
                        className={`p-4 transition-all hover:bg-stone-900/80 cursor-pointer ${
                          isErr ? 'bg-rose-950/20 border-l-4 border-rose-500' : 
                          isSucc ? 'bg-emerald-950/10 border-l-4 border-emerald-500' : 'bg-stone-950 border-l-4 border-stone-700'
                        }`}
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-stone-500 text-[11px]">{log.isoTime || log.timestamp}</span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.type === 'incoming_message' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              log.type === 'webhook_verification' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                              log.type === 'delivery_status' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {log.type}
                            </span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.direction === 'inbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {log.direction}
                            </span>

                            {log.phone && (
                              <span className="text-stone-300 font-bold">📱 {log.phone}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {log.code && (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded font-bold">
                                Error #{log.code}
                              </span>
                            )}

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSucc ? 'bg-emerald-500/20 text-emerald-400' :
                              isErr ? 'bg-rose-500/20 text-rose-400' : 'bg-stone-800 text-stone-300'
                            }`}>
                              {log.status}
                            </span>

                            <span className="text-stone-500 text-[10px]">
                              {isExpanded ? 'Ficha Payload ▲' : 'Onyesha JSON ▼'}
                            </span>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="mt-2 text-stone-200 text-xs font-sans">
                          {log.summary}
                        </div>

                        {/* Expanded Full JSON Payload */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-stone-800 space-y-3 font-mono">
                            <div className="flex items-center justify-between text-[11px] text-stone-400">
                              <span>Meta Webhook / API Payload (Full JSON):</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                  if (onShowToast) onShowToast('Imenakiliwa', 'JSON payload imenakiliwa kwenye clipboard.', 'success');
                                }}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded text-[10px] cursor-pointer"
                              >
                                Nakili JSON
                              </button>
                            </div>
                            <pre className="bg-stone-900 p-4 rounded-xl text-emerald-400 text-[11px] overflow-x-auto max-h-80">
                              {JSON.stringify(log, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB CONTENT: SIMULATOR (Real Live WhatsApp UI Simulator) */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Phone Screen (Span 7) */}
          <div className="lg:col-span-7 bg-[#0b141a] border-4 border-stone-850 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[680px] relative">
            {/* Phone Top Notch Bar */}
            <div className="bg-[#202c33] px-5 py-3 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-emerald-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{settings.hotspotName || 'Lema Fast WiFi'} Smart Bot</span>
                    <span className="w-3.5 h-3.5 bg-emerald-500 text-stone-950 rounded-full flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">online • bot huduma kwa wateja</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                  24/7 AUTO
                </span>
              </div>
            </div>

            {/* Chat Body Wallpaper & Flow */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 relative"
              style={{
                backgroundColor: '#0b141a',
                backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            >
              {simMessages.map((msg) => {
                const isUser = msg.senderType === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-stone-200 rounded-tl-none border border-stone-750'
                      }`}
                    >
                      {!isUser && (
                        <div className="text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3" />
                          <span>{msg.senderName}</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-sans text-[12px]">{msg.text}</div>

                      {/* If Voucher was issued in this message, highlight it */}
                      {msg.voucherIssued && (
                        <div className="mt-3 p-3 bg-stone-950/80 border border-emerald-400/40 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">Vocha Yako:</span>
                            <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                              {msg.voucherIssued.code}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.voucherIssued!.code, 'Vocha Code')}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg font-black text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Nakili Namba ya Vocha</span>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 text-[9px] text-stone-400 mt-1 font-mono">
                        <span>{msg.timestamp}</span>
                        {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips for Fast Testing */}
            <div className="bg-[#111b21] px-4 py-2 border-t border-stone-850 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
              <span className="text-[9px] text-stone-400 uppercase font-mono shrink-0">Jaribu Haraka:</span>
              <button
                onClick={() => handleSimSend('1')}
                className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-lg shrink-0 transition-colors cursor-pointer border border-emerald-700/60 font-bold"
              >
                1️⃣ Saa 2 (TZS 500)
              </button>
              <button
                onClick={() => handleSimSend('2')}
                className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 rounded-lg shrink-0 transition-colors cursor-pointer border border-amber-700/60 font-bold"
              >
                2️⃣ Saa 24 (TZS 1,000) ⭐
              </button>
              <button
                onClick={() => handleSimSend('3')}
                className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 rounded-lg shrink-0 transition-colors cursor-pointer border border-indigo-700/60 font-bold"
              >
                3️⃣ Wiki 1 (TZS 5,000)
              </button>
              <button
                onClick={() => handleSimSend('Ndio')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs font-black"
              >
                ✅ Thibitisha & Toa Vocha (Ndio)
              </button>
              <button
                onClick={() => handleSimSend('Ukurasa wa vocha haufunguki kwenye simu yangu')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg shrink-0 transition-colors cursor-pointer border border-stone-700"
              >
                🌐 Captive Portal haifunguki
              </button>
              <button
                onClick={() => handleSimSend('Simu inagoma inasema Obtaining IP address')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg shrink-0 transition-colors cursor-pointer border border-stone-700"
              >
                ⚠️ Obtaining IP Error
              </button>
              <button
                onClick={() => handleSimSend('Vocha niliyoweka inasema haitambuliki')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg shrink-0 transition-colors cursor-pointer border border-stone-700"
              >
                🎟️ Invalid Vocha
              </button>
              <button
                onClick={() => handleSimSend('Nahitaji kuongea na Admin tafadhali')}
                className="px-2.5 py-1 bg-rose-900/40 hover:bg-rose-900 text-rose-300 rounded-lg shrink-0 transition-colors cursor-pointer border border-rose-700/50"
              >
                🚨 Msaada wa Admin
              </button>
            </div>

            {/* Message Input Bar */}
            <div className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-stone-800 shrink-0">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimSend()}
                placeholder="Andika ujumbe kama mteja wa mtaani hapa..."
                className="flex-1 px-4 py-2 bg-[#2a3942] text-white placeholder-stone-400 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSimSend()}
                className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Bot Settings & Live Telemetry Panel (Span 5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Simulator Client Identity Config */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Wasifu wa Mteja wa Majaribio (Simulator Profile)</span>
                  </h4>
                  <p className="text-[10px] text-stone-500">Badili namba au jina hapa chini kupima jinsi bot inavyomtendea:</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-500 font-bold block mb-1">Jina la Mteja:</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e6e2d3] rounded-xl bg-stone-50 text-stone-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-stone-500 font-bold block mb-1">Namba ya Simu:</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e6e2d3] rounded-xl bg-stone-50 font-mono text-stone-800 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 leading-relaxed font-sans flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Jinsi Inavyofanya Kazi 100%:</strong> Mteja akiandika <em>"1"</em> bot inaleta orodha ya vifurushi vya mtandao wako vilivyopo kwenye database. Akichagua <em>"2"</em> inatuma push ya M-Pesa, na baada ya sekunde 3 inatengeneza vocha halisi na kumtumia papo hapo!
                </div>
              </div>
            </div>

            {/* 2. Automation Controls */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Kanuni za Kujiendesha za Bot (Auto-Rules)</span>
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <strong className="text-stone-800 block">Uza Vifurushi Kiotomatiki (Auto-Sell)</strong>
                    <span className="text-[10px] text-stone-500">Toa vocha na kiunganishi bila kukuamsha usingizini</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSellPackages}
                      onChange={(e) => setAutoSellPackages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <strong className="text-stone-800 block">Tatua Matatizo ya Wi-Fi (Auto-Troubleshoot)</strong>
                    <span className="text-[10px] text-stone-500">Mteja akituma error, bot inatuma suluhu mara moja</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoResolveErrors}
                      onChange={(e) => setAutoResolveErrors(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <strong className="text-stone-800 block">Tuma Alert Kwenye Dashboard (Admin Notification)</strong>
                    <span className="text-[10px] text-stone-500">Kengele inalia mteja akikutana na tatizo au akilalamika</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendDashboardAlertOnEscalate}
                      onChange={(e) => setSendDashboardAlertOnEscalate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Real-Time Admin Emergency Dispatcher */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3 text-white shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Namba Yako ya Kupokea Alerts</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] bg-amber-400/20 text-amber-300 font-mono font-bold">
                  ADMIN SMS / WA
                </span>
              </div>

              <p className="text-[11px] text-stone-400">
                Mteja anaposhindikana au akituma malalamiko makubwa, mfumo unakutumia ujumbe wa dharura kwenye namba hii:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminNotificationPhone}
                  onChange={(e) => setAdminNotificationPhone(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-300 font-mono text-xs font-bold"
                />
                <button
                  onClick={() => {
                    if (onSendAdminAlert) {
                      onSendAdminAlert(
                        '🔔 Jaribio la Alert ya WhatsApp Bot!',
                        `Msimamizi, mtandao wako wa ${settings.hotspotName} una bot inayofanya kazi 100%. Hakuna mteja atakayekosa huduma!`,
                        'info'
                      );
                    }
                    if (onShowToast) {
                      onShowToast('Alert Imetumwa!', `Ujumbe wa majaribio umepelekwa kwenye dashboard yako.`, 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#cca43b] hover:bg-[#b89332] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shrink-0"
                >
                  Pima Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB CONTENT: LIVE INBOX & ERROR ESCALATION */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Conversation List (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-[#e6e2d3] rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#e6e2d3] bg-stone-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">Mawasiliano ya Wateja</h4>
                <p className="text-[10px] text-stone-500">Meseji zote zinazopokelewa kupitia bot</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {conversations.length} Active
              </span>
            </div>

            <div className="divide-y divide-stone-100 max-h-[550px] overflow-y-auto">
              {conversations.map((c) => {
                const isSelected = selectedConvId === c.id;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected ? 'bg-emerald-500/10 font-bold border-l-4 border-emerald-500' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {c.customerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-stone-800 truncate">{c.customerName}</strong>
                        <span className="text-[9px] text-stone-400 font-mono">{lastMsg?.timestamp}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 block">{c.phone}</span>
                      <p className="text-[11px] text-stone-600 truncate mt-0.5 font-sans font-medium">
                        {lastMsg?.text}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        {c.status === 'escalated_to_admin' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-black animate-pulse">
                            ⚠️ Inahitaji Admin
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-700 font-bold">
                            🤖 Bot Imemaliza
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Detail & Reply (Span 8) */}
          <div className="lg:col-span-8 bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
            {(() => {
              const current = conversations.find((c) => c.id === selectedConvId) || conversations[0];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        {current.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-800 flex items-center gap-2">
                          <span>{current.customerName}</span>
                          <span className="text-xs font-mono text-stone-400 font-normal">({current.phone})</span>
                        </h4>
                        <span className="text-[11px] text-stone-500">Mawasiliano kupitia WhatsApp Bot</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const telUrl = `https://wa.me/${current.phone}?text=Habari+${encodeURIComponent(current.customerName)}+kutoka+${encodeURIComponent(settings.hotspotName || 'Lema Fast WiFi')}`;
                          window.open(telUrl, '_blank');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Fungua WhatsApp Yake</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Flow */}
                  <div className="p-4 bg-[#fbf9f4] border border-stone-200 rounded-2xl max-h-[380px] overflow-y-auto space-y-3">
                    {current.messages.map((m) => {
                      const isClient = m.senderType === 'user';
                      return (
                        <div key={m.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isClient
                                ? 'bg-white border border-[#e6e2d3] rounded-tl-none text-stone-800'
                                : 'bg-[#cca43b] text-white rounded-tr-none font-medium'
                            }`}
                          >
                            <div className="text-[10px] font-bold opacity-75 mb-1 font-mono">{m.senderName}</div>
                            <div className="whitespace-pre-line">{m.text}</div>
                            <span className="text-[9px] block text-right opacity-60 mt-1 font-mono">{m.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Direct Admin Reply Box */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="admin-reply-input"
                      type="text"
                      placeholder="Andika jibu la msimamizi litakalotumwa moja kwa moja WhatsApp kwa mteja huyu..."
                      className="flex-1 px-4 py-2 border border-[#e6e2d3] rounded-xl text-xs bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const replyText = target.value.trim();
                          if (!replyText) return;

                          const newMsg: WhatsAppIncomingMessage = {
                            id: `m-adm-${Date.now()}`,
                            senderPhone: 'admin',
                            senderName: 'Jimmy Lema (Msimamizi) 👨‍💼',
                            text: replyText,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            senderType: 'admin'
                          };

                          setConversations((prev) =>
                            prev.map((c) => (c.id === current.id ? { ...c, messages: [...c.messages, newMsg] } : c))
                          );
                          target.value = '';

                          try {
                            await fetch('/api/v1/whatsapp/reply', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                chatId: current.phone,
                                message: replyText,
                                senderName: 'Jimmy Lema (Msimamizi) 👨‍💼'
                              })
                            });
                          } catch (err) {}

                          if (onShowToast) {
                            onShowToast('Jibu Limetumwa!', `Ujumbe umetumwa moja kwa moja kwa WhatsApp ya ${current.customerName}.`, 'success');
                          }
                        }
                      }}
                    />
                    <button
                      onClick={async () => {
                        const inputEl = document.getElementById('admin-reply-input') as HTMLInputElement | null;
                        const replyText = inputEl?.value.trim();
                        if (!replyText) return;

                        const newMsg: WhatsAppIncomingMessage = {
                          id: `m-adm-${Date.now()}`,
                          senderPhone: 'admin',
                          senderName: 'Jimmy Lema (Msimamizi) 👨‍💼',
                          text: replyText,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          senderType: 'admin'
                        };

                        setConversations((prev) =>
                          prev.map((c) => (c.id === current.id ? { ...c, messages: [...c.messages, newMsg] } : c))
                        );
                        if (inputEl) inputEl.value = '';

                        try {
                          await fetch('/api/v1/whatsapp/reply', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              chatId: current.phone,
                              message: replyText,
                              senderName: 'Jimmy Lema (Msimamizi) 👨‍💼'
                            })
                          });
                        } catch (err) {}

                        if (onShowToast) {
                          onShowToast('Jibu Limetumwa!', `Ujumbe umetumwa moja kwa moja kwa WhatsApp ya ${current.customerName}.`, 'success');
                        }
                      }}
                      className="px-5 py-2 bg-[#cca43b] hover:bg-[#b89332] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Tuma Jibu
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. SUBTAB CONTENT: AI TROUBLESHOOTING KNOWLEDGE BASE */}
      {activeSubTab === 'ai_kb' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  <span>Kamusi ya Matatizo & Majibu ya Bot (Automated AI Knowledge Base)</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Bot inapotambua maneno haya kwenye meseji ya mteja, inajibu suluhisho hili mara moja bila wewe kugusa chochote:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TROUBLESHOOTING_AI_KB.map((kb, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-xs font-black text-stone-850 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{kb.problemTitle}</span>
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Maneno Yanayotazamwa (Keywords):</span>
                    <div className="flex flex-wrap gap-1">
                      {kb.keywords.map((kw, kIdx) => (
                        <span key={kIdx} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 text-[10px] font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Jibu la Bot kwa Mteja:</span>
                    <div className="p-3 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-700 whitespace-pre-line leading-relaxed font-sans font-medium">
                      {kb.botReply}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB CONTENT: SETUP GUIDE & REAL INTEGRATION */}
      {activeSubTab === 'setup_guide' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-stone-200 pb-4 space-y-1">
              <h3 className="text-base font-black text-stone-850 uppercase tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <span>Mwongozo wa Kuunganisha Namba Yako ya WhatsApp (Hatua 3 Tu!)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Huhitaji kulipa dola wala vibali vya Meta/Facebook! Unaweza kutumia line yako ya kawaida kwa kufuata hatua hizi:
              </p>
            </div>

            {/* Gateway Information Header */}
            <div className="p-4 rounded-2xl border border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-black text-stone-850 flex items-center gap-1.5">
                  <span>Meta WhatsApp Cloud API (Rasmi & Bila Kikomo cha Namba)</span>
                </strong>
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-600 text-white font-bold font-mono">
                  Rasmi ⭐️ (Meta Developers)
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Huduma rasmi ya moja kwa moja kutoka Meta (developers.facebook.com). <strong>Haina kikomo cha namba</strong>, inatuma kwa mteja yeyote yule nchini, na inakupa mazungumzo 1,000 ya bure kila mwezi.
              </p>
            </div>

            {/* Meta Cloud API Configuration Fields */}
            {gatewayType === 'meta_cloud' && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 text-xs animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-stone-850 uppercase tracking-wider flex items-center gap-2">
                      <span>🚀 Mipangilio ya Meta Cloud API (App: LEMA)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Unganisha App yako ya Meta Developers (App ID: <code>{metaAppId}</code>) ili uweze kutuma vocha kwa namba yoyote bila kikomo:
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-300">
                    ● UNLIMITED NUMBERS
                  </span>
                </div>

                {/* Registration Success Message */}
                {registerSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{registerSuccessMessage}</span>
                    </div>
                    <button
                      onClick={() => setRegisterSuccessMessage(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 px-1.5 py-0.5 rounded bg-emerald-200/60"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Error Alert Banner if 133010 Not Registered or token expired */}
                {metaLastError && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl space-y-2 text-stone-800 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span className="font-black text-xs text-amber-900 uppercase tracking-tight">
                          {metaLastError.isNotRegistered || metaLastError.code === 133010 || metaLastError.message?.includes('133010')
                            ? '⚠️ Hitilafu ya Usajili wa Namba Meta (#133010 Account Not Registered)'
                            : metaLastError.type === 'OAuthException'
                            ? '⚠️ Hitilafu ya Token ya Meta (OAuthException / Expired Token)'
                            : `⚠️ Hitilafu ya Meta: ${metaLastError.type}`}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          setMetaLastError(null);
                          await fetch('/api/v1/whatsapp/clear-error', { method: 'POST' }).catch(() => {});
                        }}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 rounded bg-amber-200/60"
                      >
                        Ondoa Arifa ✕
                      </button>
                    </div>

                    {(metaLastError.isAppSecretProof || metaLastError.message?.toLowerCase().includes('appsecret_proof')) ? (
                      <div className="space-y-3 pt-1">
                        <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-amber-950 font-medium">
                          <strong>Hitilafu ya Meta:</strong> <code>appsecret_proof is required but not provided</code>
                          <p className="text-[11px] text-stone-700 mt-1 leading-relaxed">
                            Kwenye dashibodi yako ya Meta App (<strong>LEMA</strong>), umewasha kipengele cha usalama kinacholazimisha <strong>App Secret Proof</strong> kwenye kila ombi la API. Una njia 2 rahisi sana za kulitatua:
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 bg-white rounded-xl border-2 border-emerald-500/50 space-y-2 shadow-xs">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <span>⚡ Njia 1 (Rahisi & Haraka Zaidi - Sekunde 20):</span>
                            </div>
                            <p className="text-[11px] text-stone-600">Zima ulinzi wa kulazimisha app secret kwenye Meta:</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-700 leading-relaxed font-sans">
                              <li>Fungua <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">developers.facebook.com</a> kisha chagua App yako (<strong>LEMA</strong>).</li>
                              <li>Kwenye menyu ya kushoto: <strong>App Settings ➔ Advanced</strong>.</li>
                              <li>Tembeza chini kwenye kipengele cha <strong>Security</strong>.</li>
                              <li>Kwenye <strong>"Require App Secret"</strong>, ibadili iwe <strong>NO (OFF)</strong>.</li>
                              <li>Bonyeza kitufe cha bluu cha <strong>Save Changes</strong> chini kabisa!</li>
                            </ol>
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-stone-300 space-y-2 shadow-xs">
                            <div className="flex items-center gap-1.5 text-stone-850 font-bold">
                              <span>🔒 Njia 2 (Weka App Secret Hapa):</span>
                            </div>
                            <p className="text-[11px] text-stone-600">Mfumo utajihesabia appsecret_proof kiotomatiki:</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-700 leading-relaxed font-sans">
                              <li>Fungua Meta Developers ➔ <strong>App Settings ➔ Basic</strong>.</li>
                              <li>Pembeni ya <strong>App Secret</strong>, bonyeza <em>"Show"</em> kisha uinakili.</li>
                              <li>Bandika kwenye kisanduku cha <strong>Meta App Secret</strong> hapa chini.</li>
                              <li>Bonyeza <strong>"Hifadhi Mipangilio ya Meta"</strong>.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    ) : (metaLastError.isNotRegistered || metaLastError.code === 133010 || metaLastError.message?.includes('133010')) ? (
                      <div className="space-y-2.5 pt-1">
                        <p className="text-xs text-amber-900 leading-relaxed">
                          Namba ya simu ya Meta <strong>haijasajiliwa rasmi (Code 133010: Account not registered)</strong>.
                          Kwenye Meta WhatsApp Cloud API, namba mpya inatakiwa kusajiliwa mara moja kwa kuweka PIN ya tarakimu 6 (chaguomsingi ni <code>123456</code>).
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={registerPin}
                            onChange={(e) => setRegisterPin(e.target.value)}
                            placeholder="123456"
                            className="w-24 px-2 py-1.5 border border-amber-300 rounded-lg text-xs font-mono text-center font-bold bg-white"
                          />
                          <button
                            disabled={isRegisteringPhone}
                            onClick={() => handleRegisterPhone()}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {isRegisteringPhone ? 'Inasajili...' : 'Sajili Namba Meta Sasa (Register Phone) 📲'}
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          💡 <em>Pia hakikisha kwenye ukurasa wa Meta Developers (<strong>WhatsApp ➔ API Setup</strong>), namba yako ya simu ya mpokeaji (<code>+255...</code>) imeongezwa kwenye uwanja wa <strong>"To" (Recipient phone number)</strong>.</em>
                        </p>
                      </div>
                    ) : metaLastError.type === 'OAuthException' ? (
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Token ya Meta uliyoiweka <strong>imekwisha muda wake (Masaa 24 yamepita)</strong> au haikunakiliwa kwa ukamilifu.
                        <br />
                        <strong>Jinsi ya Kurekebisha Haraka (Sekunde 30):</strong>
                        <br />
                        1. Fungua ukurasa wako wa Meta: <strong>developers.facebook.com ➔ WhatsApp ➔ API Setup</strong>.
                        <br />
                        2. Bonyeza kitufe cha <strong>"Generate token"</strong> au <strong>"Copy"</strong> chini ya <em>Temporary access token</em> (huanza na herufi <code>EAA...</code>).
                        <br />
                        3. Bandika hapa chini kwenye kisanduku cha <strong>WhatsApp Access Token</strong> kisha bonyeza <strong>"Hifadhi Mipangilio ya Meta"</strong>.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-800 leading-relaxed">{metaLastError.message}</p>
                    )}
                  </div>
                )}

                {/* Official Meta Verified Phone Number Badge */}
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{metaDisplayPhone || '+255 621 311 137'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white tracking-wide uppercase">
                          VERIFIED CLOUD API
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Jina Lililothibitishwa: <strong className="text-emerald-950">Lema Fast WiFi</strong> • WhatsApp Business Account: <strong className="font-mono text-stone-800">{metaWabaId || '1578703743479175'}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 font-bold">
                    <span>Phone ID: {metaPhoneNumberId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-stone-700 font-bold block mb-1">Meta App ID (developers.facebook.com):</label>
                    <input
                      type="text"
                      value={metaAppId}
                      onChange={(e) => setMetaAppId(e.target.value)}
                      placeholder="1860632731565594"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-700 font-bold block mb-1">
                      WABA Account ID (WhatsApp Business Account):
                    </label>
                    <input
                      type="text"
                      value={metaWabaId}
                      onChange={(e) => setMetaWabaId(e.target.value)}
                      placeholder="1578703743479175"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-700 font-bold block mb-1">
                      Phone Number ID (Kutoka WhatsApp ➔ API Setup):
                    </label>
                    <input
                      type="text"
                      value={metaPhoneNumberId}
                      onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      placeholder="1348304901706270"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-700 font-bold block mb-1">
                      Namba ya Simu Iliyothibitishwa (Display Phone Number):
                    </label>
                    <input
                      type="text"
                      value={metaDisplayPhone}
                      onChange={(e) => setMetaDisplayPhone(e.target.value)}
                      placeholder="+255 621 311 137"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-stone-700 font-bold block">
                        WhatsApp Access Token (Inaanza na EAAG... kutoka Meta Developers):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showToken ? 'Ficha Token' : 'Onyesha Token'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={metaAccessToken}
                        onChange={(e) => {
                          setMetaAccessToken(e.target.value);
                          if (metaLastError) setMetaLastError(null);
                        }}
                        placeholder="EAA... (Nakili token ndefu kutoka Meta ukurasa wa API Setup)"
                        className="w-full px-3 py-2 pr-20 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                      {metaAccessToken && (
                        <button
                          type="button"
                          onClick={() => setMetaAccessToken('')}
                          className="absolute right-2 top-2 text-[10px] px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-bold"
                        >
                          Futa
                        </button>
                      )}
                    </div>

                    {/* Token Format Status Feedback */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {!metaAccessToken ? (
                        <span className="text-stone-400 italic">Bado hujaweka token.</span>
                      ) : metaAccessToken.toLowerCase().includes('token string') || metaAccessToken.length < 25 ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hii si token kamili (inaonekana ni maandishi ya mfano). Token halisi ya Meta huwa ndefu sana na huanza na "EAA...".
                        </span>
                      ) : metaAccessToken.startsWith('EAA') ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Muundo sahihi wa Meta Access Token (Herufi {metaAccessToken.length})
                        </span>
                      ) : (
                        <span className="text-stone-600 font-medium">
                          Token imewekwa (Herufi {metaAccessToken.length})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-stone-700 font-bold block">
                          Meta App Secret (Hiari - Hukokotoa appsecret_proof kiotomatiki):
                        </label>
                        <span className="text-[10px] text-stone-500">
                          Kutoka Meta Developers ➔ App Settings ➔ Basic ➔ App Secret (au zima "Require App Secret" kwenye App Settings ➔ Advanced)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showSecret ? 'Ficha Secret' : 'Onyesha Secret'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={metaAppSecret}
                        onChange={(e) => {
                          setMetaAppSecret(e.target.value);
                          if (metaLastError) setMetaLastError(null);
                        }}
                        placeholder="Bandika App Secret hapa kutatua 'appsecret_proof is required'"
                        className="w-full px-3 py-2 pr-20 border border-stone-300 rounded-xl bg-white font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                      {metaAppSecret && (
                        <button
                          type="button"
                          onClick={() => setMetaAppSecret('')}
                          className="absolute right-2 top-2 text-[10px] px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-bold"
                        >
                          Futa
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500">
                      💡 <em>Ukiweka hii, seva itaunda saini ya siri ya <code>appsecret_proof</code> kwa kila ujumbe unaotoka bila kuhitaji kubadili kitu Meta.</em>
                    </p>
                  </div>
                </div>

                {/* Permanent Token Tip Box */}
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl space-y-1.5 text-[11px] text-stone-700">
                  <div className="font-bold flex items-center gap-1.5 text-stone-850">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>Jinsi ya Kupata Token ya Kudumu Isiyoisha Muda Kamwe (Permanent System User Token):</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Temporary Token ya Meta huisha kila baada ya masaa 24 (huleta <em>OAuthException</em>). Ukipenda isiishe kamwe:
                    Fungua <strong>Meta Business Settings ➔ System Users ➔ Add ➔ Generate Token</strong>, weka muda kuwa <em>Never expire</em> na uchague ruhusa za <code>whatsapp_business_messaging</code>.
                  </p>
                </div>

                {/* Webhook Configuration for Meta */}
                <div className="p-4 bg-emerald-950/5 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
                    📋 Hatua za Kuweka Webhook Kwenye Meta Developers (developers.facebook.com):
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-600">
                    <li>Kwenye dashibodi yako ya Meta (App: <strong>LEMA</strong>), bonyeza <strong>WhatsApp ➔ Configuration</strong> kwenye menyu ya kushoto.</li>
                    <li>Kwenye kipengele cha <strong>Webhook</strong>, bonyeza <em>Edit</em> na ubandike Callback URL na Verify Token hizi hapa chini:</li>
                  </ol>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-white border border-stone-250 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">Callback URL:</div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[11px] text-emerald-700 font-mono truncate select-all">
                          {window.location.origin}/api/v1/whatsapp/webhook
                        </code>
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/api/v1/whatsapp/webhook`, 'Callback URL')}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-stone-250 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">Verify Token:</div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[11px] text-emerald-700 font-mono select-all">
                          {metaVerifyToken}
                        </code>
                        <button
                          onClick={() => handleCopy(metaVerifyToken, 'Verify Token')}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    *Kumbuka kuwasha (Subscribe) kwenye uwanja wa <strong>messages</strong> ili ujumbe wa wateja uweze kufika hapa kwenye seva kiotomatiki.
                  </p>
                </div>

                {/* Meta 24h Window Guide & Direct Chat */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <strong className="text-xs text-emerald-950">Namba ya Bot: +255 621 311 137 (Lema Fast WiFi)</strong>
                    </div>
                    <a
                      href="https://wa.me/255621311137?text=Habari%20Lema%20Fast%20WiFi"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Mtumie bot ujumbe sasa hivi ili kufungua dirisha la masaa 24"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Fungua WhatsApp & Anza Chat 💬</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                    💡 <strong>Kanuni ya Meta Cloud API:</strong> Ili ujumbe wa maandishi (Text) ufike kwenye simu yako, <strong>mteja lazima amwandikie bot ujumbe ndani ya masaa 24 yaliyopita</strong> (24-Hour Customer Care Window). Ikiwa hujaandika kwa bot bado, bofya kitufe cha kijani hapo juu kutuma "Habari", na bot itakujibu papo hapo!
                  </p>
                </div>

                {/* Save & Test Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={testRecipientPhone}
                        onChange={(e) => setTestRecipientPhone(e.target.value)}
                        placeholder="Namba yako (07... au 06...)"
                        className="px-3 py-1.5 border border-stone-300 rounded-xl bg-white font-mono text-xs w-48 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <button
                      disabled={isTestingSend}
                      onClick={async () => {
                        const cleanPhone = testRecipientPhone.replace(/[^0-9]/g, '');
                        if (!cleanPhone || cleanPhone.length < 9) {
                          if (onShowToast) onShowToast('Weka Namba ya Simu', 'Tafadhali andika namba yako ya WhatsApp kupokea jaribio', 'warning');
                          return;
                        }
                        if (cleanPhone === '0621311137' || cleanPhone === '255621311137') {
                          if (onShowToast) onShowToast('Namba ya Bot', 'Huwezi kutuma kwenda namba ile ile ya Bot! Weka namba yako binafsi.', 'warning');
                          setTestSendResult({
                            message: '⚠️ Huwezi kutuma ujumbe kwenda namba ile ile ya Bot (+255 621 311 137). Tafadhali weka namba yako binafsi ya simu (mfano: 07... au 0653...).',
                            isError: true
                          });
                          return;
                        }

                        setIsTestingSend(true);
                        setTestSendResult(null);
                        try {
                          let res = await fetch('/api/v1/whatsapp/test-send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              phone: testRecipientPhone,
                              accessToken: metaAccessToken,
                              appSecret: metaAppSecret,
                              phoneNumberId: metaPhoneNumberId,
                              message: `🤖 *LEMA FAST WIFI BOT (META CLOUD API)*\n\nHabari! Ujumbe huu umetumwa kutoka Meta WhatsApp Cloud API ya Lema Fast WiFi.\nMfumo wako wa kugawa vocha na kupokea maswali uko tayari kwa 100% bila kikomo cha namba!`
                            })
                          });

                          let rawText = '';
                          try {
                            rawText = await res.text();
                          } catch {
                            rawText = '';
                          }

                          let data: any = null;
                          try {
                            data = rawText ? JSON.parse(rawText) : null;
                          } catch {
                            data = null;
                          }

                          // Auto-retry once after 1s if server was momentarily restarting (502/503 or HTML response)
                          if (!data && (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || res.status === 502 || res.status === 503)) {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            try {
                              res = await fetch('/api/v1/whatsapp/test-send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  phone: testRecipientPhone,
                                  accessToken: metaAccessToken,
                                  appSecret: metaAppSecret,
                                  phoneNumberId: metaPhoneNumberId,
                                  message: `🤖 *LEMA FAST WIFI BOT (META CLOUD API)*\n\nHabari! Ujumbe huu umetumwa kutoka Meta WhatsApp Cloud API ya Lema Fast WiFi.\nMfumo wako wa kugawa vocha na kupokea maswali uko tayari kwa 100% bila kikomo cha namba!`
                                })
                              });
                              rawText = await res.text();
                              data = rawText ? JSON.parse(rawText) : null;
                            } catch {
                              data = null;
                            }
                          }

                          setIsTestingSend(false);

                          if (!data) {
                            if (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || res.status === 502 || res.status === 503) {
                              setTestSendResult({
                                message: '🔄 Seva imekamilisha kuwaka. Bonyeza tena "Tuma Jaribio (Text)" sasa.',
                                isError: true
                              });
                            } else {
                              setTestSendResult({
                                message: `⚠️ Seva (${res.status}): Tafadhali hakikisha umebofya "Hifadhi Mipangilio ya Meta" kisha bonyeza tena jaribio.`,
                                isError: true
                              });
                            }
                            return;
                          }

                          if (data?.result?.messages || (data?.success && data?.result?.messages)) {
                            const msgId = data?.result?.messages?.[0]?.id || '';
                            setTestSendResult({
                              message: `✅ Ujumbe umekubaliwa na Meta Cloud API (ID: ${msgId.slice(0, 16)}...)! Kumbuka: Ikiwa haujatokea simuni, fungua WhatsApp na umtumie bot ujumbe "Habari" kupitia kitufe cha juu ili kufungua dirisha la masaa 24.`,
                              isError: false
                            });
                            if (onShowToast) onShowToast('Jaribio Limetumwa!', `Meta imekubali ujumbe kwenda ${testRecipientPhone}`, 'success');
                          } else if (data?.result?.isAccountNotRegistered || data?.result?.code === 133010 || data?.result?.message?.includes('133010')) {
                            const tip = data?.result?.userTip || 'Namba ya Meta inatakiwa kusajiliwa mara moja kwa kuweka PIN (123456). Tumia kitufe cha "Sajili Namba Meta Sasa" hapo juu.';
                            setTestSendResult({
                              message: `⚠️ Namba Haijasajiliwa Meta (#133010): ${tip}`,
                              isError: true,
                              isNotRegistered: true
                            });
                            if (onShowToast) onShowToast('Namba Haijasajiliwa Meta', 'Bonyeza Sajili Namba Meta', 'warning');
                          } else if (data?.result?.isAppSecretProof || data?.result?.message?.toLowerCase().includes('appsecret_proof')) {
                            setTestSendResult({
                              message: `⚠️ Hitilafu ya appsecret_proof: Kwenye Meta Developers (App Settings ➔ Advanced), zima "Require App Secret" iwe OFF, au weka App Secret kwenye kisanduku hapo juu.`,
                              isError: true,
                              isAppSecretProof: true
                            });
                          } else if (data?.result?.isOAuthException || data?.result?.errorType === 'OAuthException' || data?.result?.error?.type === 'OAuthException') {
                            const userTip = data?.result?.userTip || 'Token ya Meta imekwisha muda wake (Session expired). Tafadhali bonyeza "Generate token" kwenye Meta ukurasa wa API Setup na ubandike hapa.';
                            setTestSendResult({
                              message: `⚠️ Hitilafu ya Token (OAuthException): ${userTip}`,
                              isError: true,
                              isOAuth: true
                            });
                            if (onShowToast) onShowToast('Token ya Meta Imekwisha Muda', 'Tafadhali nakili token mpya kutoka Meta', 'error');
                          } else if (data?.result?.error || data?.error) {
                            const metaErrMsg = data?.message || data?.result?.userTip || data?.result?.message || data?.result?.error?.message || JSON.stringify(data?.result?.error);
                            setTestSendResult({
                              message: `⚠️ Hitilafu kutoka Meta: ${metaErrMsg}`,
                              isError: true
                            });
                            if (onShowToast) onShowToast('Hitilafu ya Meta', metaErrMsg, 'error');
                          } else if (data?.result?.simulated) {
                            const warn = data?.result?.warning || 'Bado hujaweka Phone Number ID na Access Token hapo juu.';
                            setTestSendResult({
                              message: `ℹ️ Taarifa: ${warn}`,
                              isError: true
                            });
                            if (onShowToast) onShowToast('Mipangilio haijakamilika', warn, 'warning');
                          } else {
                            setTestSendResult({
                              message: '✅ Ujumbe umetumwa Meta WhatsApp Cloud API! Kama haujafika simuni, mtumie bot ujumbe "Habari" kupitia kitufe cha kijani hapo juu.',
                              isError: false
                            });
                          }
                        } catch (err: any) {
                          setIsTestingSend(false);
                          setTestSendResult({
                            message: `⚠️ Hitilafu: ${err?.message || 'Mawasiliano na seva yameshindikana'}. Bonyeza tena "Tuma Jaribio" sasa.`,
                            isError: true
                          });
                        }
                      }}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isTestingSend ? 'Inatuma...' : 'Tuma Jaribio (Text) 📲'}
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      localStorage.setItem('lema_meta_app_id', metaAppId);
                      localStorage.setItem('lema_meta_waba_id', metaWabaId);
                      localStorage.setItem('lema_meta_phone_number_id', metaPhoneNumberId);
                      localStorage.setItem('lema_meta_display_phone', metaDisplayPhone);
                      localStorage.setItem('lema_meta_access_token', metaAccessToken);
                      localStorage.setItem('lema_meta_app_secret', metaAppSecret);
                      localStorage.setItem('lema_meta_verify_token', metaVerifyToken);

                      try {
                        await fetch('/api/v1/whatsapp/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            provider: 'meta',
                            appId: metaAppId,
                            wabaId: metaWabaId,
                            displayPhoneNumber: metaDisplayPhone,
                            phoneNumberId: metaPhoneNumberId,
                            accessToken: metaAccessToken,
                            appSecret: metaAppSecret,
                            verifyToken: metaVerifyToken
                          })
                        });
                        setMetaLastError(null);
                        if (onShowToast) {
                          onShowToast('Imehifadhiwa!', 'Mipangilio ya Meta WhatsApp Cloud API imehifadhiwa kikamilifu!', 'success');
                        }
                      } catch (e) {
                        if (onShowToast) {
                          onShowToast('Imehifadhiwa!', 'Imehifadhiwa kwenye kivinjari (localStorage).', 'success');
                        }
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Hifadhi Mipangilio ya Meta
                  </button>
                </div>
              </div>
            )}

            {testSendResult && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
                  testSendResult.isError
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-900'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {testSendResult.isError ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testSendResult.message}</span>
                </div>
                <button
                  onClick={() => setTestSendResult(null)}
                  className="text-stone-500 hover:text-stone-800 px-1 font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Microtik Fetch Alert Script for WhatsApp */}
            <div className="bg-[#1f2937] border border-stone-700 rounded-2xl p-5 space-y-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <strong className="text-xs font-mono uppercase tracking-wider">MikroTik WhatsApp Instant Alert Script</strong>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `/tool fetch http-method=post http-header-field="Content-Type: application/json" http-data="{\\"phone\\":\\"${adminNotificationPhone}\\",\\"message\\":\\"🚨 Hotspot Alert: Mteja anashea mtandao au mfumo una hitilafu!\\"}" url="${window.location.origin}/api/v1/whatsapp/test-send" keep-result=no`,
                      'MikroTik WhatsApp Script'
                    )
                  }
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Nakili Script ya MikroTik</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-300">
                Weka amri hii kwenye <em>System &gt; Scripts</em> au kwenye <em>Netwatch</em> kwenye MikroTik yako ili ikitokea internet imekatika au mtu anajaribu kutoa hotspot, ikutumie WhatsApp papo hapo:
              </p>

              <pre className="p-3 bg-stone-950 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`/tool fetch http-method=post http-header-field="Content-Type: application/json" http-data="{\\"phone\\":\\"${adminNotificationPhone}\\",\\"message\\":\\"🚨 Hotspot Alert: Mteja anashea mtandao au mfumo una hitilafu!\\"}" url="${window.location.origin}/api/v1/whatsapp/test-send" keep-result=no`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

