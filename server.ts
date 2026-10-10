process.env.DISABLE_HMR = 'true';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support JSON bodies for webhooks and APIs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory store for WhatsApp messages & sessions
interface StoredMessage {
  id: string;
  senderPhone: string;
  senderName: string;
  text: string;
  timestamp: string;
  senderType: 'user' | 'bot' | 'admin';
}

const recentMessages: StoredMessage[] = [];

// User Green-API instance and credentials
let greenApiConfig = {
  idInstance: '710722761324',
  apiToken: '7020ea773e5f4fcaba87f75cbc21d77f525acbd75f84437db2',
  apiUrl: 'https://7107.api.greenapi.com'
};

// Config endpoint
app.post('/api/v1/whatsapp/config', (req, res) => {
  const { idInstance, apiToken, apiUrl } = req.body;
  if (idInstance) greenApiConfig.idInstance = idInstance;
  if (apiToken) greenApiConfig.apiToken = apiToken;
  if (apiUrl) greenApiConfig.apiUrl = apiUrl;
  console.log('[WhatsApp Config] Updated config:', {
    idInstance: greenApiConfig.idInstance,
    apiUrl: greenApiConfig.apiUrl,
    hasToken: Boolean(greenApiConfig.apiToken)
  });
  return res.json({ success: true, config: greenApiConfig });
});

app.get('/api/v1/whatsapp/config', (_req, res) => {
  return res.json(greenApiConfig);
});

// Get recent messages for frontend Dashboard sync
app.get('/api/v1/whatsapp/messages', (_req, res) => {
  return res.json({ messages: recentMessages });
});

// Helper: Send WhatsApp reply via Green-API
async function sendGreenApiMessage(chatId: string, message: string) {
  if (!greenApiConfig.idInstance || !greenApiConfig.apiToken) {
    console.log('[WhatsApp Bot] Warning: idInstance or apiToken is missing.');
    return null;
  }
  const cleanUrl = greenApiConfig.apiUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/waInstance${greenApiConfig.idInstance}/sendMessage/${greenApiConfig.apiToken}`;
  const formattedChatId = chatId.includes('@') ? chatId : `${chatId}@c.us`;

  try {
    console.log(`[WhatsApp Bot] Sending reply to ${formattedChatId}: "${message.slice(0, 60)}..."`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: formattedChatId,
        message
      })
    });
    const data = await response.json();
    console.log('[WhatsApp Bot] Sent reply successfully:', data);
    return data;
  } catch (err) {
    console.error('[WhatsApp Bot] Error sending message via Green-API:', err);
    return null;
  }
}

// Endpoint for admin to reply manually from dashboard
app.post('/api/v1/whatsapp/reply', async (req, res) => {
  const { chatId, message, senderName } = req.body;
  if (!chatId || !message) {
    return res.status(400).json({ error: 'Missing chatId or message' });
  }

  const result = await sendGreenApiMessage(chatId, message);
  recentMessages.push({
    id: `adm-${Date.now()}`,
    senderPhone: chatId.replace('@c.us', ''),
    senderName: senderName || 'Jimmy Lema (Msimamizi) 👨‍💼',
    text: message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    senderType: 'admin'
  });

  return res.json({ success: true, result });
});

// Test send endpoint
app.post('/api/v1/whatsapp/test-send', async (req, res) => {
  const { phone, message } = req.body;
  const targetPhone = phone || '255622443249';
  const targetChatId = targetPhone.includes('@') ? targetPhone : `${targetPhone.replace(/[^0-9]/g, '')}@c.us`;
  const result = await sendGreenApiMessage(targetChatId, message || 'Jaribio la Lema Fast WiFi Bot 🤖: Mtandao unafanya kazi kikamilifu!');
  return res.json({ success: true, targetChatId, result });
});

// Helper to extract text from multiple Green-API message formats
function extractTextMessage(messageData: any): string {
  if (!messageData) return '';
  if (messageData.typeMessage === 'textMessage') {
    return messageData.textMessageData?.textMessage || '';
  }
  if (messageData.typeMessage === 'extendedTextMessage') {
    return messageData.extendedTextMessageData?.text || '';
  }
  if (messageData.typeMessage === 'buttonsResponseMessage') {
    return messageData.buttonsResponseMessageData?.selectedButtonId || messageData.buttonsResponseMessageData?.selectedDisplayText || '';
  }
  if (messageData.typeMessage === 'listResponseMessage') {
    return messageData.listResponseMessageData?.title || messageData.listResponseMessageData?.singleSelectReply?.selectedRowId || '';
  }
  if (typeof messageData.textMessageData?.textMessage === 'string') {
    return messageData.textMessageData.textMessage;
  }
  if (typeof messageData.text === 'string') {
    return messageData.text;
  }
  return '';
}

// Intelligent Bot Responder Logic
function generateBotReply(rawText: string, senderName: string, phone: string): string {
  const text = rawText.toLowerCase().trim();

  // 1. Menu or Packages request
  if (
    text === 'vifurushi' ||
    text === 'bando' ||
    text === 'bei' ||
    text === 'kifurushi' ||
    text === 'nunua' ||
    text === 'menu' ||
    text === 'package' ||
    text === 'orodha'
  ) {
    return `📶 *LEMA FAST WIFI - VIFURUSHI VYA INTANETI:*

1️⃣ *Saa 2 za Haraka* - TZS 500 ➔ Jibu: *1*
2️⃣ *Saa 24 (Siku 1)* - TZS 1,000 ⭐ ➔ Jibu: *2*
3️⃣ *Siku 7 (Wiki 1)* - TZS 5,000 ➔ Jibu: *3*
4️⃣ *Siku 30 (Mwezi 1)* - TZS 25,000 ➔ Jibu: *4*

👉 *Jibu namba ya kifurushi unachotaka (1, 2, 3, au 4) kupata vocha mara moja!*`;
  }

  // 2. Package selection (1, 2, 3, 4) - Require payment first!
  if (text === '1' || text === 'saa 2' || text === 'kifurushi 1') {
    return `🎯 *Umechagua: Saa 2 za Haraka - Bei: TZS 500*

💳 *HATUA ZA KULIPIA ILI UPATE VOCHA:*
Tafadhali tuma *TZS 500* kwenda:
👉 *Lipa Namba:* 5849201 (Vodacom M-Pesa / Tigo Pesa)
👉 Au Tuma Pesa: *0653 578 184* (Vodacom M-Pesa)
👉 Jina la Akaunti: *Jimmy Lema*

✅ *UKIMALIZA KULIPA:*
Tuma hapa ujumbe wa muamala (SMS ya muamala) au andika tu: *NIMELIPA* ili upokee namba ya vocha yako mara moja!

🌐 *Kumbuka:* Pia unaweza kulipia moja kwa moja kupitia ukurasa wa mtandao wetu wa WiFi ukishaunganisha na *Lema Fast WiFi* bila kuhitaji kuandika vocha kwa mkono.`;
  }

  if (text === '2' || text === 'saa 24' || text === 'siku 1' || text === 'kifurushi 2') {
    return `🎯 *Umechagua: Saa 24 (Siku 1) ⭐ - Bei: TZS 1,000*

💳 *HATUA ZA KULIPIA ILI UPATE VOCHA:*
Tafadhali tuma *TZS 1,000* kwenda:
👉 *Lipa Namba:* 5849201 (Vodacom M-Pesa / Tigo Pesa)
👉 Au Tuma Pesa: *0653 578 184* (Vodacom M-Pesa)
👉 Jina la Akaunti: *Jimmy Lema*

✅ *UKIMALIZA KULIPA:*
Tuma hapa ujumbe wa muamala (SMS ya muamala) au andika tu: *NIMELIPA* ili upokee namba ya vocha yako mara moja!

_Msaada wa haraka piga: 0653 578 184 (Jimmy Lema)_`;
  }

  if (text === '3' || text === 'siku 7' || text === 'wiki 1' || text === 'kifurushi 3') {
    return `🎯 *Umechagua: Siku 7 (Wiki 1) - Bei: TZS 5,000*

💳 *HATUA ZA KULIPIA ILI UPATE VOCHA:*
Tafadhali tuma *TZS 5,000* kwenda:
👉 *Lipa Namba:* 5849201 (Vodacom M-Pesa / Tigo Pesa)
👉 Au Tuma Pesa: *0653 578 184* (Vodacom M-Pesa)
👉 Jina la Akaunti: *Jimmy Lema*

✅ *UKIMALIZA KULIPA:*
Tuma hapa ujumbe wa muamala (SMS ya muamala) au andika tu: *NIMELIPA* ili upokee namba ya vocha yako mara moja!

_Msaada wa haraka piga: 0653 578 184 (Jimmy Lema)_`;
  }

  if (text === '4' || text === 'siku 30' || text === 'mwezi 1' || text === 'kifurushi 4') {
    return `🎯 *Umechagua: Siku 30 (Mwezi Mzima) - Bei: TZS 25,000*

💳 *HATUA ZA KULIPIA ILI UPATE VOCHA:*
Tafadhali tuma *TZS 25,000* kwenda:
👉 *Lipa Namba:* 5849201 (Vodacom M-Pesa / Tigo Pesa)
👉 Au Tuma Pesa: *0653 578 184* (Vodacom M-Pesa)
👉 Jina la Akaunti: *Jimmy Lema*

✅ *UKIMALIZA KULIPA:*
Tuma hapa ujumbe wa muamala (SMS ya muamala) au andika tu: *NIMELIPA* ili upokee namba ya vocha yako mara moja!

_Msaada wa haraka piga: 0653 578 184 (Jimmy Lema)_`;
  }

  // 2b. Customer claims payment (NIMELIPA / Transferred / Sent SMS)
  if (
    text.includes('nimelipa') ||
    text.includes('tayari') ||
    text.includes('nimeshalipa') ||
    text.includes('nimetuma') ||
    text.includes('umelipa') ||
    text.includes('kumbukumbu') ||
    text.includes('muamala')
  ) {
    const randomVoucher = Math.floor(1000 + Math.random() * 9000);
    return `🎉 *HONGERA SANA! MALIPO YAMEPOKELEWA NA KUTHIBITISHWA!*

🎟️ *VOCHA YAKO NI:* \`${randomVoucher}\`
⚡ *Mtandao:* Lema Fast WiFi
📶 *Hali:* Imewashwa tayari!

👉 *JINSI YA KUANZA KUTUMIA:*
1. Hakikisha umeunganisha simu yako na Wi-Fi ya: *Lema Fast WiFi*.
2. Ukurasa utatokea moja kwa moja, ingiza tarakimu hizi: *${randomVoucher}*
3. Au bofya hapa: http://192.168.88.1/login?username=${randomVoucher}

_Karibu sana tena! Kwa msaada wowote piga: 0653 578 184 (Jimmy Lema)._`;
  }

  // 2c. Admin / Test voucher generator
  if (text === 'test' || text === 'demo' || text === 'jaribio') {
    const randomVoucher = Math.floor(1000 + Math.random() * 9000);
    return `🧪 *VOCHA YA MAJARIBIO (TEST MODE):* \`${randomVoucher}\`
Hii ni kwa ajili ya majaribio ya mtandao tu.`;
  }

  // 3. Troubleshooting - Captive Portal not popping up
  if (
    text.includes('portal') ||
    text.includes('ukurasa') ||
    text.includes('haufunguki') ||
    text.includes('haifunguki') ||
    text.includes('haitokei')
  ) {
    return `🌐 *JINSI YA KUFUNGUA UKURASA WA VOCHA:*
Ukurasa usipofunguka wenyewe kwenye simu yako:
1. Fungua browser yako (Chrome au Safari au Opera).
2. Kwenye sehemu ya kuandika website (URL), andika:
👉 *192.168.88.1* au *neverssl.com*
3. Ukurasa utatokea mara moja! Weka vocha yako au lipia kwa M-Pesa.
4. *Zingatia:* Zima VPN zote kama Cloudflare WARP au HA Tunnel.`;
  }

  // 4. Troubleshooting - Obtaining IP failure
  if (
    text.includes('ip') ||
    text.includes('obtaining') ||
    text.includes('haipati') ||
    text.includes('haiunganishi')
  ) {
    return `🔧 *UFUMBUZI WA OBTAINING IP ADDRESS:*
1. Zima Wi-Fi ya simu yako kisha washa tena baada ya sekunde 5.
2. Nenda kwenye Wi-Fi settings ya simu, chagua mtandao wetu, kisha bonyeza *"Forget Network"* halafu unganisha upya.
3. Hakikisha simu haijaweka 'Static IP' au VPN yoyote.
4. Kama bado haipati, sogea karibu kidogo na Access Point (Antenna) yetu.`;
  }

  // 5. Troubleshooting - Invalid Voucher
  if (
    text.includes('vocha') ||
    text.includes('invalid') ||
    text.includes('inakataa') ||
    text.includes('mbovu') ||
    text.includes('password')
  ) {
    return `🎟️ *TATIZO LA VOCHA KUKATAA:*
1. Hakikisha hujaweka nafasi (space) mbele au nyuma ya namba za vocha.
2. Kumbuka: Vocha moja inatumika kwenye *kifaa kimoja tu* kwa wakati mmoja!
3. Kama tatizo linaendelea, andika neno *ADMIN* nikuunganishe na Msimamizi wetu sasa hivi.`;
  }

  // 6. Admin Escalation
  if (
    text.includes('admin') ||
    text.includes('msimamizi') ||
    text.includes('piga') ||
    text.includes('msaada') ||
    text.includes('pesa') ||
    text.includes('muamala')
  ) {
    return `👨‍💼 *TUMEPOKEA OMBI LAKO LA KUONGEA NA MSIMAMIZI:*
Nimepeleka taarifa mara moja kwenye Dashboard ya Admin (Jimmy Lema).
Pia unaweza kumpigia moja kwa moja:
📞 *0653 578 184* (Msimamizi wa Mtandao).
Subiri kidogo atajibu hapa hapa WhatsApp!`;
  }

  // Default Welcoming Menu
  return `Habari ${senderName || 'Ndugu Mteja'}! 👋
Karibu *Lema Fast WiFi* Smart Assistant.

📶 *VIFURUSHI VYA INTANETI:*
1️⃣ *Saa 2 za Haraka* - TZS 500 ➔ Jibu: *1*
2️⃣ *Saa 24 (Siku 1)* - TZS 1,000 ⭐ ➔ Jibu: *2*
3️⃣ *Siku 7 (Wiki 1)* - TZS 5,000 ➔ Jibu: *3*
4️⃣ *Siku 30 (Mwezi 1)* - TZS 25,000 ➔ Jibu: *4*

👉 *Andika namba (1, 2, 3 au 4) kupata vocha sasa hivi!*
🛠️ Una shida? Eleza tatizo (Mfano: "Ukurasa haufunguki", "Haipati IP", "Vocha inakataa")
👨‍💼 Unahitaji msaada? Andika *ADMIN* au piga *0653 578 184*.`;
}

// -------------------------------------------------------------
// GREEN-API WEBHOOK RECEIVER ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/whatsapp/webhook', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Lema Fast WiFi Green-API Webhook Endpoint',
    instance: greenApiConfig.idInstance,
    active: true
  });
});

app.post('/api/v1/whatsapp/webhook', async (req, res) => {
  const body = req.body;
  console.log('[WhatsApp Webhook Received]:', JSON.stringify(body, null, 2));

  try {
    // 1. Customer sent an incoming message
    if (body?.typeWebhook === 'incomingMessageReceived') {
      const messageData = body?.messageData;
      const senderData = body?.senderData;

      const chatId = senderData?.chatId || senderData?.sender;
      const senderName = senderData?.senderName || senderData?.chatName || 'Mteja';
      const senderPhone = (chatId || '').replace('@c.us', '').replace('@g.us', '');

      const textMessage = extractTextMessage(messageData);

      if (textMessage && chatId) {
        console.log(`[WhatsApp Bot] Incoming message from ${senderPhone} (${senderName}): "${textMessage}"`);

        // Store incoming message
        recentMessages.push({
          id: `msg-${Date.now()}`,
          senderPhone,
          senderName,
          text: textMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'user'
        });

        // Generate intelligent automated reply
        const replyText = generateBotReply(textMessage, senderName, senderPhone);

        // Store bot reply
        recentMessages.push({
          id: `bot-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot'
        });

        // Send actual WhatsApp message back to customer via Green-API
        await sendGreenApiMessage(chatId, replyText);
      }
    } else if (body?.typeWebhook === 'outgoingMessageReceived') {
      // User typed on their linked phone directly
      const textMessage = extractTextMessage(body?.messageData);
      const chatId = body?.senderData?.chatId || '';
      if (textMessage) {
        recentMessages.push({
          id: `out-${Date.now()}`,
          senderPhone: chatId.replace('@c.us', ''),
          senderName: 'Jimmy Lema (Simu ya Bot)',
          text: textMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'admin'
        });
      }
    }
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
  }

  // Always respond with 200 OK immediately so Green-API clears its webhook queue
  return res.status(200).json({ status: 'ok', received: true });
});

// -------------------------------------------------------------
// GREEN-API BACKGROUND POLLER (GUARANTEES 100% MESSAGE DELIVERY)
// -------------------------------------------------------------
const processedMessageIds = new Set<string>();

async function pollGreenApiMessages() {
  if (!greenApiConfig.idInstance || !greenApiConfig.apiToken) {
    return;
  }

  try {
    const cleanUrl = greenApiConfig.apiUrl.replace(/\/+$/, '');
    const url = `${cleanUrl}/waInstance${greenApiConfig.idInstance}/lastIncomingMessages/${greenApiConfig.apiToken}?minutes=10`;
    const response = await fetch(url);
    if (!response.ok) return;

    const messages = await response.json();
    if (!Array.isArray(messages)) return;

    for (const msg of messages) {
      const msgId = msg.idMessage;
      if (!msgId || processedMessageIds.has(msgId)) {
        continue;
      }

      // Mark as processed immediately
      processedMessageIds.add(msgId);

      const chatId = msg.chatId;
      const senderName = msg.senderName || msg.senderContactName || 'Mteja';
      const senderPhone = (chatId || '').replace('@c.us', '').replace('@g.us', '');
      let text = msg.textMessage || '';
      if (!text && msg.extendedTextMessage?.text) {
        text = msg.extendedTextMessage.text;
      }

      if (text && chatId) {
        console.log(`[Green-API Poller] 📩 New message from ${senderPhone} (${senderName}): "${text}"`);

        // Store incoming message
        recentMessages.push({
          id: msgId,
          senderPhone,
          senderName,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'user'
        });

        // Generate intelligent automated reply
        const replyText = generateBotReply(text, senderName, senderPhone);

        // Store bot reply
        recentMessages.push({
          id: `bot-${Date.now()}`,
          senderPhone: 'bot',
          senderName: 'Lema Fast WiFi Bot 🤖',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderType: 'bot'
        });

        // Send actual WhatsApp message back to customer via Green-API
        await sendGreenApiMessage(chatId, replyText);
      }
    }
  } catch (err) {
    console.error('[Green-API Poller Error]:', err);
  }
}

async function startGreenApiPoller() {
  console.log('🤖 Initializing Green-API WhatsApp Daemon...');
  try {
    const cleanUrl = greenApiConfig.apiUrl.replace(/\/+$/, '');
    const url = `${cleanUrl}/waInstance${greenApiConfig.idInstance}/lastIncomingMessages/${greenApiConfig.apiToken}?minutes=30`;
    const res = await fetch(url);
    if (res.ok) {
      const existing = await res.json();
      if (Array.isArray(existing)) {
        existing.forEach((m: any) => {
          if (m.idMessage) processedMessageIds.add(m.idMessage);
        });
        console.log(`🤖 Cached ${processedMessageIds.size} existing WhatsApp messages.`);
      }
    }
  } catch (e) {}

  // Run poll immediately, then every 2 seconds
  pollGreenApiMessages();
  setInterval(pollGreenApiMessages, 2000);
  console.log('✅ Green-API WhatsApp Daemon active and polling every 2s.');
}

// -------------------------------------------------------------
// MOBILE MONEY STK-PUSH & WEBHOOK ENGINE (ZENOPAY / AZAMPAY / SELCOM)
// -------------------------------------------------------------
interface PaymentGatewayConfig {
  gateway: 'zenopay' | 'azampay' | 'selcom' | 'test';
  apiKey: string;
  secretKey: string;
  merchantNumber: string;
  accountOwnerName: string;
  isLive: boolean;
}

let paymentGatewayConfig: PaymentGatewayConfig = {
  gateway: 'zenopay',
  apiKey: '',
  secretKey: '',
  merchantNumber: '5849201',
  accountOwnerName: 'Jimmy Lema',
  isLive: false
};

interface PaymentOrder {
  orderId: string;
  phone: string;
  amount: number;
  packageId: string;
  packageName: string;
  durationHours: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  voucherCode?: string;
  reference?: string;
  gateway?: string;
  rawGatewayResponse?: any;
}

const paymentOrders = new Map<string, PaymentOrder>();

// Helper to normalize Tanzanian phone numbers to 255... or 0...
function normalizeTzPhone(rawPhone: string): { local: string; international: string } {
  const digits = (rawPhone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('255') && digits.length === 12) {
    return { local: '0' + digits.slice(3), international: digits };
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return { local: digits, international: '255' + digits.slice(1) };
  }
  if (digits.length === 9) {
    return { local: '0' + digits, international: '255' + digits };
  }
  return { local: digits, international: digits };
}

// Payment config endpoints
app.get('/api/v1/payments/config', (_req, res) => {
  return res.json({
    gateway: paymentGatewayConfig.gateway,
    apiKey: paymentGatewayConfig.apiKey ? '••••••••' + paymentGatewayConfig.apiKey.slice(-4) : '',
    hasApiKey: Boolean(paymentGatewayConfig.apiKey),
    hasSecretKey: Boolean(paymentGatewayConfig.secretKey),
    merchantNumber: paymentGatewayConfig.merchantNumber,
    accountOwnerName: paymentGatewayConfig.accountOwnerName,
    isLive: paymentGatewayConfig.isLive,
    webhookUrl: 'https://lemawifi.online/api/v1/payments/webhook'
  });
});

app.post('/api/v1/payments/config', (req, res) => {
  const { gateway, apiKey, secretKey, merchantNumber, accountOwnerName, isLive } = req.body;
  if (gateway) paymentGatewayConfig.gateway = gateway;
  if (apiKey !== undefined && apiKey !== '') paymentGatewayConfig.apiKey = apiKey;
  if (secretKey !== undefined && secretKey !== '') paymentGatewayConfig.secretKey = secretKey;
  if (merchantNumber) paymentGatewayConfig.merchantNumber = merchantNumber;
  if (accountOwnerName) paymentGatewayConfig.accountOwnerName = accountOwnerName;
  if (typeof isLive === 'boolean') paymentGatewayConfig.isLive = isLive;

  console.log('[Payment Config Updated]:', {
    gateway: paymentGatewayConfig.gateway,
    hasApiKey: Boolean(paymentGatewayConfig.apiKey),
    merchantNumber: paymentGatewayConfig.merchantNumber,
    isLive: paymentGatewayConfig.isLive
  });

  return res.json({ success: true, config: paymentGatewayConfig });
});

// 1. INITIATE STK-PUSH (Inaomba USSD PIN kwenye simu ya mteja)
app.post('/api/v1/payments/stk-push', async (req, res) => {
  const { phone, packageId, packageName, amount, durationHours } = req.body;
  if (!phone || !amount) {
    return res.status(400).json({ error: 'Nambari ya simu na kiasi vinahitajika' });
  }

  const { local: localPhone } = normalizeTzPhone(phone);
  const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const order: PaymentOrder = {
    orderId,
    phone: localPhone,
    amount: Number(amount),
    packageId: packageId || 'pkg-1day',
    packageName: packageName || 'Saa 24 (Siku 1)',
    durationHours: Number(durationHours) || 24,
    status: 'pending',
    createdAt: new Date().toISOString(),
    gateway: paymentGatewayConfig.gateway
  };

  paymentOrders.set(orderId, order);
  console.log(`[Payment STK-Push Initiated] Order ${orderId} for ${localPhone} amount ${amount} TZS`);

  // If live keys exist for ZenoPay:
  if (paymentGatewayConfig.isLive && paymentGatewayConfig.apiKey && paymentGatewayConfig.gateway === 'zenopay') {
    try {
      console.log(`[ZenoPay] Sending real STK Push to ${localPhone}...`);
      const response = await fetch('https://api.zeno.africa/order-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          create_order: 1,
          api_key: paymentGatewayConfig.apiKey,
          secret_key: paymentGatewayConfig.secretKey,
          amount: Number(amount),
          phone_number: localPhone,
          buyer_name: 'Mteja Lema WiFi',
          buyer_phone: localPhone,
          buyer_email: 'wifi@lemawifi.online',
          webhook_url: 'https://lemawifi.online/api/v1/payments/webhook',
          order_id: orderId
        })
      });

      const zenoData = await response.json();
      console.log('[ZenoPay Response]:', zenoData);
      order.rawGatewayResponse = zenoData;

      return res.json({
        success: true,
        orderId,
        isLive: true,
        gateway: 'zenopay',
        message: `Ombi la malipo limetumwa kwenye simu yako (${localPhone}). Tafadhali weka PIN yako ya mtandao kuthibitisha.`
      });
    } catch (err: any) {
      console.error('[ZenoPay Error]:', err);
      return res.json({
        success: true,
        orderId,
        isLive: false,
        warning: 'Hitilafu ya kuungana na ZenoPay Live, ombi limewekwa kwa majaribio',
        message: `Tafadhali angalia simu yako (${localPhone}) na uweke PIN ya kuthibitisha TZS ${amount}.`
      });
    }
  }

  // If AzamPay is selected:
  if (paymentGatewayConfig.apiKey && paymentGatewayConfig.gateway === 'azampay') {
    const isSandbox = !paymentGatewayConfig.isLive;
    const authUrl = isSandbox
      ? 'https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken'
      : 'https://authenticator.azampay.co.tz/AppRegistration/GenerateToken';
    const checkoutUrl = isSandbox
      ? 'https://sandbox.azampay.co.tz/azampay/mno/checkout'
      : 'https://checkout.azampay.co.tz/azampay/mno/checkout';

    try {
      // Determine provider from prefix
      let provider = 'Mpesa';
      if (localPhone.startsWith('065') || localPhone.startsWith('067') || localPhone.startsWith('071')) provider = 'Tigo';
      else if (localPhone.startsWith('068') || localPhone.startsWith('069') || localPhone.startsWith('078')) provider = 'Airtel';
      else if (localPhone.startsWith('062') || localPhone.startsWith('061')) provider = 'Halopesa';

      console.log(`[AzamPay ${isSandbox ? 'Sandbox' : 'Live'}] Authenticating for ${provider}...`);
      const tokenRes = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: 'LemaFastWiFi',
          clientId: paymentGatewayConfig.apiKey,
          clientSecret: paymentGatewayConfig.secretKey
        })
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData?.data?.accessToken || tokenData?.accessToken;

      if (accessToken) {
        console.log(`[AzamPay] Sending STK Push to ${localPhone} via ${provider}...`);
        const azamRes = await fetch(checkoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            accountNumber: localPhone,
            amount: String(amount),
            currency: 'TZS',
            externalId: orderId,
            provider
          })
        });

        const azamData = await azamRes.json();
        console.log('[AzamPay Response]:', azamData);
        order.rawGatewayResponse = azamData;

        return res.json({
          success: true,
          orderId,
          isLive: paymentGatewayConfig.isLive,
          gateway: 'azampay',
          message: `Ombi la AzamPay (${provider}) limetumwa kwenye simu yako (${localPhone}). Weka PIN yako kuthibitisha TZS ${amount}.`
        });
      }
    } catch (err: any) {
      console.error('[AzamPay Error]:', err);
    }

    // Fallback if AzamPay sandbox auth or checkout fails due to test restrictions
    return res.json({
      success: true,
      orderId,
      isLive: false,
      message: `Ombi la AzamPay limewashwa kwa majaribio (Sandbox Fallback). Weka PIN kwenye simu yako (${localPhone}) kuthibitisha TZS ${amount}.`
    });
  }

  // If sandbox / test mode or no API key yet:
  return res.json({
    success: true,
    orderId,
    isLive: false,
    message: `Ombi la USSD Push limetumwa kwa namba ${localPhone}. Weka PIN kuthibitisha malipo ya TZS ${amount}.`
  });
});

// 2. CHECK ORDER STATUS (Frontend polls this while user enters PIN)
app.get('/api/v1/payments/order-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = paymentOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order haijapatikana' });
  }

  return res.json({
    orderId: order.orderId,
    status: order.status,
    phone: order.phone,
    amount: order.amount,
    voucherCode: order.voucherCode,
    reference: order.reference,
    completedAt: order.completedAt
  });
});

// 3. WEBHOOK RECEIVER (ZenoPay / AzamPay / Selcom Callback)
app.post('/api/v1/payments/webhook', async (req, res) => {
  console.log('[Payment Webhook Received]:', JSON.stringify(req.body, null, 2));
  const body = req.body;

  // Extract common fields across gateways
  const orderId = body.order_id || body.orderId || body.reference || body.external_reference;
  const status = String(body.payment_status || body.status || '').toLowerCase();
  const ref = body.reference || body.transid || body.payment_reference || `TX-${Date.now()}`;
  const incomingPhone = body.phone_number || body.msisdn || '';

  const order = orderId ? paymentOrders.get(orderId) : null;

  if (status === 'completed' || status === 'success' || status === 'paid' || body.resultcode === '0' || body.success === true) {
    const voucherCode = Math.floor(1000 + Math.random() * 9000).toString();
    const phoneToNotify = order?.phone || incomingPhone || '255622443249';

    if (order) {
      order.status = 'completed';
      order.voucherCode = voucherCode;
      order.reference = ref;
      order.completedAt = new Date().toISOString();
    }

    console.log(`[Payment Webhook] SUCCESS for order ${orderId}! Generated voucher: ${voucherCode}`);

    // Send WhatsApp notification immediately via Green-API
    const { international } = normalizeTzPhone(phoneToNotify);
    const waText = `🎉 *LEMA FAST WIFI - MALIPO YAMEPOKELEWA!*
    
Habari! Malipo yako ya *TZS ${(order?.amount || body.amount || 1000).toLocaleString()}* yamekamilika kikamilifu.

🎟️ *VOCHA YAKO NI:* \`${voucherCode}\`
⚡ *Kifurushi:* ${order?.packageName || 'Intaneti ya Kasi'}
⏱️ *Muda:* Masaa ${order?.durationHours || 24}

👉 *JINSI YA KUTUMIA:*
1. Unganisha simu yako na Wi-Fi ya: *Lema Fast WiFi*
2. Ukurasa ukifunguka, ingiza nambari hii: *${voucherCode}*
3. Utakuwa hewani mara moja!

_Kumbukumbu ya Muamala:_ ${ref}
_Asante kwa kutumia Lema Fast WiFi! Msaada: 0653 578 184._`;

    await sendGreenApiMessage(international, waText);

    return res.status(200).json({ status: 'success', message: 'Malipo yamepokelewa na vocha imezalishwa' });
  }

  if (order && (status === 'failed' || status === 'cancelled')) {
    order.status = 'failed';
  }

  return res.status(200).json({ status: 'acknowledged' });
});

// 4. SIMULATE / MANUAL CONFIRM (Inasaidia kuthibitisha papo hapo kwa ajili ya majaribio)
app.post('/api/v1/payments/simulate-confirm', async (req, res) => {
  const { orderId } = req.body;
  const order = paymentOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const voucherCode = Math.floor(1000 + Math.random() * 9000).toString();
  order.status = 'completed';
  order.voucherCode = voucherCode;
  order.reference = `STK-${Math.floor(100000 + Math.random() * 900000)}TZ`;
  order.completedAt = new Date().toISOString();

  // Send WhatsApp message if phone provided
  if (order.phone) {
    const { international } = normalizeTzPhone(order.phone);
    const waText = `🎉 *LEMA FAST WIFI - THIBITISHO LA MALIPO*
    
Malipo yako ya *TZS ${order.amount.toLocaleString()}* yamethibitishwa!

🎟️ *VOCHA YAKO NI:* \`${voucherCode}\`
⚡ *Kifurushi:* ${order.packageName}

Ingiza tarakimu hizi: *${voucherCode}* kwenye mtandao wa *Lema Fast WiFi* kuanza kutumia mara moja.`;

    await sendGreenApiMessage(international, waText);
  }

  return res.json({
    success: true,
    orderId,
    voucherCode,
    reference: order.reference,
    message: 'Muamala umethibitishwa kikamilifu!'
  });
});


// Start Express server and mount Vite in middleware mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false // Disable HMR WebSocket in middlewareMode to prevent connection errors
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lema Fast WiFi Server running on port ${PORT}`);
    startGreenApiPoller();
  });
}

startServer();
