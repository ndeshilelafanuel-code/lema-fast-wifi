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
  Globe
} from 'lucide-react';
import { useHotspot } from '../../context/HotspotContext';
import { HotspotPackage, Voucher } from '../../types';

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
  onShowToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
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
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'inbox' | 'setup_guide' | 'ai_kb' | 'webhook_tester'>('simulator');

  // WhatsApp Gateway Configuration states
  const [gatewayType, setGatewayType] = useState<'evolution' | 'green_api' | 'meta_cloud' | 'baileys'>('green_api');
  const [botInstanceName, setBotInstanceName] = useState<string>('710722761324');
  const [botPhoneNumber, setBotPhoneNumber] = useState<string>('255622443249');
  const [adminNotificationPhone, setAdminNotificationPhone] = useState<string>('255622443249');
  const [apiKey, setApiKey] = useState<string>('7020ea773e5f4fcaba87f75cbc21d77f525acbd75f84437db2');
  const [serverUrl, setServerUrl] = useState<string>('https://7107.api.greenapi.com');
  const [isBotConnected, setIsBotConnected] = useState<boolean>(true);
  const [isTestingSend, setIsTestingSend] = useState<boolean>(false);
  const [testSendResult, setTestSendResult] = useState<string | null>(null);
  const [autoSellPackages, setAutoSellPackages] = useState<boolean>(true);
  const [autoResolveErrors, setAutoResolveErrors] = useState<boolean>(true);
  const [sendDashboardAlertOnEscalate, setSendDashboardAlertOnEscalate] = useState<boolean>(true);

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

  useEffect(() => {
    scrollToBottom();
  }, [simMessages]);

  // Load active server config & sync real WhatsApp messages
  useEffect(() => {
    // 1. Fetch current server config
    fetch('/api/v1/whatsapp/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg?.idInstance) setBotInstanceName(cfg.idInstance);
        if (cfg?.apiToken) setApiKey(cfg.apiToken);
        if (cfg?.apiUrl) setServerUrl(cfg.apiUrl);
      })
      .catch(() => {});

    // 2. Poll recent incoming/outgoing messages from Green-API webhook
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/whatsapp/messages');
        const data = await res.json();
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
        </div>
      </div>

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

            {/* Gateway Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setGatewayType('evolution')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  gatewayType === 'evolution'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-stone-850">1. Evolution API (Bure & Open-Source)</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">Inapendekezwa ⭐️</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Unaiweka kwenye VPS (kama DigitalOcean ya $4 au Raspberry Pi yako). Unachanganua QR code na WhatsApp Web kwenye simu yako mara moja tu!
                </p>
              </div>

              <div
                onClick={() => setGatewayType('green_api')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  gatewayType === 'green_api'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-stone-850">2. Green-API (Cloud Hosted)</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-sky-100 text-sky-800 font-bold">Rahisi Zaidi</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Huhitaji kusimamia seva mwenyewe. Unafungua akaunti ya bure kwenye green-api.com, unapewa Instance ID na Token, una-scan QR code.
                </p>
              </div>

              <div
                onClick={() => setGatewayType('meta_cloud')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  gatewayType === 'meta_cloud'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-stone-850">3. Meta Cloud API (Official)</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-stone-200 text-stone-700 font-mono">Rasmi Meta</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Akaunti rasmi ya biashara ya WhatsApp kupitia developers.facebook.com yenye green tick (inahitaji biashara iliyosajiliwa na Meta).
                </p>
              </div>
            </div>

            {/* Config Fields */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 text-xs">
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                Mipangilio ya Uunganisho (API Credentials):
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-600 font-bold block mb-1">Server URL (Webhook Endpoint):</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-350 rounded-xl bg-white font-mono text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-stone-600 font-bold block mb-1">Instance Name / ID:</label>
                  <input
                    type="text"
                    value={botInstanceName}
                    onChange={(e) => setBotInstanceName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-350 rounded-xl bg-white font-mono text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-stone-600 font-bold block mb-1">API Key / Token:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1 px-3 py-2 border border-stone-350 rounded-xl bg-white font-mono text-stone-800"
                    />
                    <button
                      onClick={() => handleCopy(apiKey, 'API Key')}
                      className="p-2 border border-stone-300 rounded-xl bg-white hover:bg-stone-100 cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-stone-600 font-bold block mb-1">Namba ya Simu ya Bot:</label>
                  <input
                    type="text"
                    value={botPhoneNumber}
                    onChange={(e) => setBotPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-350 rounded-xl bg-white font-mono text-stone-800 font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <span className="text-[11px] text-stone-500">
                  Webhook ya Green-API: <code>https://ais-dev-ud5tgex5sbbrpdt7iyuxdu-384135275183.europe-west2.run.app/api/v1/whatsapp/webhook</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isTestingSend}
                    onClick={async () => {
                      setIsTestingSend(true);
                      setTestSendResult(null);
                      try {
                        const res = await fetch('/api/v1/whatsapp/test-send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            phone: botPhoneNumber,
                            message: `🤖 *LEMA FAST WIFI BOT INAFANYA KAZI KIKAMILIFU!*\n\nNamba ya Instance: ${botInstanceName}\nMuda: ${new Date().toLocaleTimeString()}\n\nMfumo wako uko tayari kuhudumia wateja kwa 100% bila kukatika.`
                          })
                        });
                        const data = await res.json();
                        setIsTestingSend(false);
                        setTestSendResult(data?.result?.idMessage ? `✅ Ujumbe umetumwa! ID: ${data.result.idMessage}` : '✅ Ombi la jaribio limeenda.');
                        if (onShowToast) {
                          onShowToast('Jaribio Limetumwa!', 'Angalia WhatsApp yako kuona ujumbe.', 'success');
                        }
                      } catch (err) {
                        setIsTestingSend(false);
                        setTestSendResult('⚠️ Hitilafu ya mawasiliano.');
                      }
                    }}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isTestingSend ? 'Inatuma Jaribio...' : 'Tuma Ujumbe wa Jaribio 📲'}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/v1/whatsapp/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            idInstance: botInstanceName,
                            apiToken: apiKey,
                            apiUrl: serverUrl
                          })
                        });
                        if (onShowToast) {
                          onShowToast('Mipangilio Imehifadhiwa!', 'Green-API imeunganishwa na seva ya Lema Fast WiFi kikamilifu. Bot iko tayari kujibu!', 'success');
                        }
                      } catch (e) {
                        if (onShowToast) {
                          onShowToast('Imeshindwa!', 'Tatizo la kuwasiliana na seva.', 'warning');
                        }
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Hifadhi Mipangilio
                  </button>
                </div>
              </div>

              {testSendResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-between">
                  <span>{testSendResult}</span>
                  <button onClick={() => setTestSendResult(null)} className="text-emerald-600 hover:text-emerald-900">×</button>
                </div>
              )}
            </div>

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
                      `/tool fetch http-method=post http-header-field="Content-Type: application/json, apikey: ${apiKey}" http-data="{\\"number\\":\\"${adminNotificationPhone}\\",\\"text\\":\\"🚨 Hotspot Alert: Mteja anashea mtandao au mfumo una hitilafu!\\"}" url="${serverUrl}/message/sendText/${botInstanceName}" keep-result=no`,
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
{`/tool fetch http-method=post http-header-field="Content-Type: application/json, apikey: ${apiKey}" http-data="{\\"number\\":\\"${adminNotificationPhone}\\",\\"text\\":\\"🚨 Hotspot Alert: Mteja anashea mtandao au mfumo una hitilafu!\\"}" url="${serverUrl}/message/sendText/${botInstanceName}" keep-result=no`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
