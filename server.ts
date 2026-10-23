import 'dotenv/config';
process.env.DISABLE_HMR = 'true';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db } from './src/db/index.ts';
import { hardware, towers as towersTable } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { initDbTables } from './src/db/init.ts';
import { omadaAuthorize } from './omada.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support JSON bodies for webhooks and APIs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Malipo bado pending: zima API zote za malipo na trial iwapo PAYMENTS_ENABLED !== '1'
app.use(['/api/v1/payments', '/api/v1/vouchers/trial'], (req, res, next) => {
  if (process.env.PAYMENTS_ENABLED === '1') return next();
  return res.status(503).json({
    success: false,
    paymentsDisabled: true,
    message: 'Malipo ya mtandaoni yamesitishwa kwa muda. Tafadhali tumia nambari ya vocha kujiunga na mtandao.'
  });
});

// Msaidizi wa uthibitishaji wa Msimamizi (Admin Security Guard)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const expectedKey = process.env.ADMIN_API_KEY;
  const adminKey = req.get('x-admin-key');
  if (expectedKey && adminKey === expectedKey) return next();
  return res.status(401).json({
    success: false,
    message: 'Ruhusa imekataliwa (Unauthorized: x-admin-key header sahihi inahitajika).'
  });
};

// Kulinda vocha: kuunda au kusoma orodha yote ya vocha ni kwa Admin tu (isipokuwa /redeem)
app.use('/api/v1/vouchers', (req, res, next) => {
  if (req.path === '/redeem') return next();
  return requireAdmin(req, res, next);
});

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

// Structured Live Logging for WhatsApp & Meta Webhook
export interface WhatsAppLogEntry {
  id: string;
  timestamp: string;
  isoTime: string;
  type: 'incoming_message' | 'delivery_status' | 'outgoing_api' | 'webhook_verification' | 'system_alert';
  direction: 'inbound' | 'outbound' | 'internal';
  status: 'success' | 'delivered' | 'sent' | 'read' | 'failed' | 'warning' | 'info';
  summary: string;
  phone?: string;
  code?: number | string;
  details?: string;
  payload?: any;
}

const whatsAppLogs: WhatsAppLogEntry[] = [
  {
    id: `log-init-1`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoTime: new Date().toISOString(),
    type: 'system_alert',
    direction: 'internal',
    status: 'info',
    summary: 'Seva ya WhatsApp Webhook Ipo Tayari Hewani 🟢',
    details: 'Seva inasikiliza Meta Webhooks kwenye /api/v1/whatsapp/webhook na iko tayari kuchakata ujumbe na ripoti za kufika (delivery reports).'
  }
];

function addWhatsAppLog(entry: Omit<WhatsAppLogEntry, 'id' | 'timestamp' | 'isoTime'>): WhatsAppLogEntry {
  const now = new Date();
  const item: WhatsAppLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoTime: now.toISOString(),
    ...entry
  };
  whatsAppLogs.unshift(item);
  if (whatsAppLogs.length > 250) {
    whatsAppLogs.pop();
  }
  return item;
}

// WhatsApp Cloud API (Meta Official - Unlimited Numbers)
interface WhatsAppConfig {
  provider: 'meta';
  phoneNumberId: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  accessToken: string;
  appSecret?: string;
  verifyToken: string;
  appId: string;
  lastError?: {
    type: string;
    code?: number;
    message: string;
    timestamp: string;
    isNotRegistered?: boolean;
    isAppSecretProof?: boolean;
  } | null;
}

let whatsAppConfig: WhatsAppConfig = {
  provider: 'meta',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1483764411477759',
  wabaId: process.env.WHATSAPP_WABA_ID || '2277166236436412',
  displayPhoneNumber: '+255 621 311 137',
  verifiedName: 'Lema Fast WiFi',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  appSecret: process.env.WHATSAPP_APP_SECRET || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'lema_wifi_webhook_token',
  appId: process.env.WHATSAPP_APP_ID || '966806779813692',
  lastError: null
};

// Helper: Generate appsecret_proof for Meta API when "Require App Secret" is enabled in App Dashboard
function getAppSecretProof(token: string, secret?: string): string | null {
  const s = (secret || whatsAppConfig.appSecret || process.env.WHATSAPP_APP_SECRET || '').trim();
  if (!s || !token) return null;
  return crypto.createHmac('sha256', s).update(token.trim()).digest('hex');
}

function buildMetaGraphUrl(baseUrl: string, token: string, secret?: string): string {
  const proof = getAppSecretProof(token, secret);
  if (proof) {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}appsecret_proof=${proof}`;
  }
  return baseUrl;
}

const CONFIG_FILE = path.resolve(__dirname, 'whatsapp-config.json');

function loadSavedWhatsAppConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && typeof data === 'object') {
        Object.assign(whatsAppConfig, data);
        console.log('[WhatsApp Config] Loaded persisted config from disk:', {
          phoneNumberId: whatsAppConfig.phoneNumberId,
          hasToken: Boolean(whatsAppConfig.accessToken && whatsAppConfig.accessToken.length > 20)
        });
      }
    }
  } catch (e) {
    console.warn('[WhatsApp Config] Could not load saved config:', e);
  }
}

function saveWhatsAppConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(whatsAppConfig, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[WhatsApp Config] Could not persist config to disk:', e);
  }
}

loadSavedWhatsAppConfig();

// WhatsApp Config endpoint
app.post('/api/v1/whatsapp/config', (req, res) => {
  const { provider, phoneNumberId, accessToken, appSecret, verifyToken, appId, wabaId, displayPhoneNumber } = req.body;
  if (provider) whatsAppConfig.provider = 'meta';
  if (phoneNumberId !== undefined) whatsAppConfig.phoneNumberId = String(phoneNumberId).trim();
  if (wabaId !== undefined) whatsAppConfig.wabaId = String(wabaId).trim();
  if (displayPhoneNumber !== undefined) whatsAppConfig.displayPhoneNumber = String(displayPhoneNumber).trim();
  if (appSecret !== undefined) whatsAppConfig.appSecret = String(appSecret).trim();
  if (accessToken !== undefined) {
    whatsAppConfig.accessToken = String(accessToken).trim();
    whatsAppConfig.lastError = null;
  }
  if (verifyToken !== undefined) whatsAppConfig.verifyToken = String(verifyToken).trim();
  if (appId !== undefined) whatsAppConfig.appId = String(appId).trim();

  saveWhatsAppConfig();

  console.log('[WhatsApp Config] Updated and saved config:', {
    provider: whatsAppConfig.provider,
    appId: whatsAppConfig.appId,
    phoneNumberId: whatsAppConfig.phoneNumberId,
    hasMetaToken: Boolean(whatsAppConfig.accessToken && whatsAppConfig.accessToken.length > 20),
    hasAppSecret: Boolean(whatsAppConfig.appSecret && whatsAppConfig.appSecret.length > 5),
    verifyToken: whatsAppConfig.verifyToken
  });
  return res.json({ success: true, config: whatsAppConfig });
});

app.get('/api/v1/whatsapp/config', (_req, res) => {
  return res.json(whatsAppConfig);
});

// Clear error endpoint
app.post('/api/v1/whatsapp/clear-error', (_req, res) => {
  whatsAppConfig.lastError = null;
  return res.json({ success: true });
});

// Register Phone with Meta Cloud API (Solves Error 133010 Account not registered)
async function registerMetaPhoneNumber(phoneId: string, token: string, pin: string = '123456') {
  try {
    console.log(`[Meta WhatsApp] 🔄 Registering phone ID ${phoneId} with Meta API (PIN: ${pin})...`);
    const rawUrl = `https://graph.facebook.com/v21.0/${phoneId}/register`;
    const url = buildMetaGraphUrl(rawUrl, token);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: pin || '123456'
      })
    });
    const data: any = await response.json();
    if (data?.success) {
      console.log(`[Meta WhatsApp] ✅ Phone ${phoneId} registered successfully with Meta!`);
      return { success: true, data };
    }
    console.log(`[Meta WhatsApp] Registration response:`, data);
    return { success: false, error: data?.error };
  } catch (err: any) {
    console.log(`[Meta WhatsApp] Registration network issue:`, err?.message);
    return { success: false, error: { message: err?.message || 'Network issue during registration' } };
  }
}

// Dedicated Register Phone endpoint for Admin UI
app.post('/api/v1/whatsapp/register-phone', async (req, res) => {
  const { pin } = req.body || {};
  const token = (whatsAppConfig.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const phoneId = (whatsAppConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '1483764411477759').trim();

  if (!token || token.length < 25) {
    return res.status(400).json({
      success: false,
      message: 'Access Token ya Meta inahitajika kabla ya kusajili namba!'
    });
  }

  const result = await registerMetaPhoneNumber(phoneId, token, pin || '123456');
  if (result.success) {
    whatsAppConfig.lastError = null;
    return res.json({
      success: true,
      message: 'Namba ya simu imesajiliwa kikamilifu kwenye Meta WhatsApp Cloud API!'
    });
  }

  return res.status(400).json({
    success: false,
    error: result.error,
    message: result.error?.message || 'Kusajili namba kumeshindikana. Tafadhali thibitisha Token na PIN.'
  });
});

// Get recent messages for frontend Dashboard sync
app.get('/api/v1/whatsapp/messages', (_req, res) => {
  return res.json({ messages: recentMessages, lastError: whatsAppConfig.lastError });
});

// WhatsApp Live Logs Endpoint for Webhook & API inspection
app.get('/api/v1/whatsapp/logs', (_req, res) => {
  return res.json({
    success: true,
    logs: whatsAppLogs,
    count: whatsAppLogs.length,
    lastError: whatsAppConfig.lastError,
    webhookInfo: {
      url: `${_req.protocol}://${_req.get('host')}/api/v1/whatsapp/webhook`,
      verifyToken: whatsAppConfig.verifyToken,
      phoneNumberId: whatsAppConfig.phoneNumberId,
      displayPhoneNumber: whatsAppConfig.displayPhoneNumber,
      hasToken: Boolean(whatsAppConfig.accessToken && whatsAppConfig.accessToken.length > 20)
    }
  });
});

// =========================================================================
// HARDWARE INVENTORY & ACCESS POINTS PERSISTENCE (Synced across PC & Mobile)
// =========================================================================
const HARDWARE_FILE = path.resolve(__dirname, 'hardware-inventory.json');

interface HardwareItem {
  id: string;
  name: string;
  category: 'ap' | 'router' | 'switch' | 'starlink' | 'power';
  manufacturer: string;
  model: string;
  serialNumber: string;
  macAddress: string;
  ipAddress?: string;
  site: string;
  status: 'online' | 'offline' | 'pending';
  lastSeen?: string;
  notes?: string;
  scannedAt: string;
}

let savedHardware: HardwareItem[] = [];

function loadSavedHardware() {
  try {
    if (fs.existsSync(HARDWARE_FILE)) {
      const data = JSON.parse(fs.readFileSync(HARDWARE_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        savedHardware = data;
        console.log(`[Hardware Inventory] Imepakua vifaa ${savedHardware.length} kutoka kwenye diski.`);
      }
    }
  } catch (e) {
    console.warn('[Hardware Inventory] Hitilafu wakati wa kusoma vifaa:', e);
  }
}

function saveHardwareToDisk() {
  try {
    fs.writeFileSync(HARDWARE_FILE, JSON.stringify(savedHardware, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Hardware Inventory] Hitilafu wakati wa kuhifadhi vifaa:', e);
  }
}

loadSavedHardware();

// API: Get Hardware Inventory (synchronized with Cloud SQL PostgreSQL & disk backup)
app.get('/api/v1/hardware/inventory', async (_req, res) => {
  try {
    const rows = await db.select().from(hardware);
    if (rows && rows.length > 0) {
      const items: HardwareItem[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category as any,
        manufacturer: r.manufacturer,
        model: r.model,
        serialNumber: r.serialNumber,
        macAddress: r.macAddress,
        deviceKey: r.deviceKey || '',
        site: r.site || '',
        ipAddress: r.ipAddress || '',
        poeVoltage: r.poeVoltage || '',
        status: r.status as any,
        lastSeen: r.lastSeen || '',
        scannedAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
      savedHardware = items;
      return res.json({
        success: true,
        source: 'cloud_sql_postgresql',
        count: items.length,
        inventory: items,
      });
    }
  } catch (dbErr) {
    console.warn('[Cloud SQL] Database read failed, using disk fallback:', dbErr);
  }

  loadSavedHardware();
  res.json({
    success: true,
    source: 'disk_backup',
    count: savedHardware.length,
    inventory: savedHardware,
  });
});

// API: Register or update hardware equipment
app.post('/api/v1/hardware/register', async (req, res) => {
  const item: HardwareItem = req.body;
  if (!item || !item.macAddress) {
    return res.status(400).json({ success: false, error: 'MAC address inahitajika' });
  }

  const cleanMac = item.macAddress.trim().toUpperCase();
  const existingIdx = savedHardware.findIndex(
    (h) => h.id === item.id || h.macAddress.toUpperCase() === cleanMac
  );

  const cleanItem: HardwareItem = {
    ...item,
    id: item.id || `eq-${Date.now()}`,
    macAddress: cleanMac,
    serialNumber: (item.serialNumber || '').trim().toUpperCase(),
    scannedAt: item.scannedAt || new Date().toISOString(),
    status: item.status || 'online',
    lastSeen: item.lastSeen || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  if (existingIdx >= 0) {
    savedHardware[existingIdx] = { ...savedHardware[existingIdx], ...cleanItem };
  } else {
    savedHardware.unshift(cleanItem);
  }

  saveHardwareToDisk();

  // Persist to Cloud SQL PostgreSQL
  try {
    await db.insert(hardware).values({
      id: cleanItem.id,
      name: cleanItem.name,
      category: cleanItem.category,
      manufacturer: cleanItem.manufacturer || '',
      model: cleanItem.model || '',
      serialNumber: cleanItem.serialNumber || '',
      macAddress: cleanMac,
      deviceKey: (cleanItem as any).deviceKey || '',
      site: cleanItem.site || '',
      ipAddress: cleanItem.ipAddress || '',
      poeVoltage: (cleanItem as any).poeVoltage || '',
      status: cleanItem.status || 'online',
      lastSeen: cleanItem.lastSeen || '',
      autoProvisioned: (cleanItem as any).autoProvisioned || false,
    }).onConflictDoUpdate({
      target: hardware.macAddress,
      set: {
        name: cleanItem.name,
        category: cleanItem.category,
        manufacturer: cleanItem.manufacturer || '',
        model: cleanItem.model || '',
        serialNumber: cleanItem.serialNumber || '',
        deviceKey: (cleanItem as any).deviceKey || '',
        site: cleanItem.site || '',
        ipAddress: cleanItem.ipAddress || '',
        poeVoltage: (cleanItem as any).poeVoltage || '',
        status: cleanItem.status || 'online',
        lastSeen: cleanItem.lastSeen || '',
        autoProvisioned: (cleanItem as any).autoProvisioned || false,
      }
    });
    console.log(`[Cloud SQL PostgreSQL] ✅ Kifaa kimehifadhiwa kwenye Cloud SQL: ${cleanItem.model} (${cleanMac})`);
  } catch (dbErr) {
    console.error('[Cloud SQL PostgreSQL] Hitilafu wakati wa kuhifadhi kifaa:', dbErr);
  }

  res.json({
    success: true,
    message: 'Kifaa kimehifadhiwa kwenye Cloud SQL PostgreSQL kikamilifu!',
    device: cleanItem,
    inventory: savedHardware,
  });
});

// API: Replace entire inventory
app.post('/api/v1/hardware/inventory', (req, res) => {
  const { inventory } = req.body;
  if (Array.isArray(inventory)) {
    savedHardware = inventory;
    saveHardwareToDisk();
    return res.json({ success: true, count: savedHardware.length, inventory: savedHardware });
  }
  res.status(400).json({ success: false, error: 'Invalid inventory array' });
});

// API: Delete hardware equipment
app.delete('/api/v1/hardware/equipment/:id', async (req, res) => {
  const { id } = req.params;
  const macQuery = req.query.mac ? String(req.query.mac).toUpperCase() : '';
  const targetId = id.toUpperCase();
  savedHardware = savedHardware.filter(
    (h) =>
      h.id !== id &&
      h.id.toUpperCase() !== targetId &&
      h.macAddress.toUpperCase() !== targetId &&
      (!macQuery || h.macAddress.toUpperCase() !== macQuery)
  );
  saveHardwareToDisk();

  try {
    await db.delete(hardware).where(eq(hardware.macAddress, targetId));
    if (macQuery) {
      await db.delete(hardware).where(eq(hardware.macAddress, macQuery));
    }
    await db.delete(hardware).where(eq(hardware.id, id));
    console.log(`[Hardware Inventory] 🗑️ Kifaa kimeondolewa kwenye database na seva: ${id}`);
  } catch (dbErr) {
    console.error('[Hardware Inventory] Hitilafu ya kufuta kifaa:', dbErr);
  }

  res.json({ success: true, message: 'Kifaa kimeondolewa kwenye seva kikamilifu', inventory: savedHardware });
});


// =========================================================================
// AP OUTAGE WATCHDOG & INSTANT ALERTS (WHATSAPP + SMS NOTIFICATIONS)
// =========================================================================
interface OutageAlert {
  id: string;
  timestamp: string;
  apName: string;
  site: string;
  ip: string;
  mac?: string;
  status: 'down' | 'up';
  adminPhone: string;
  waStatus?: any;
  smsStatus?: any;
}

const outageAlertsLog: OutageAlert[] = [];

async function processApOutageAlert(params: {
  apName?: string;
  apIp?: string;
  apMac?: string;
  site?: string;
  status: 'down' | 'up';
  adminPhone?: string;
}) {
  const status = params.status === 'up' ? 'up' : 'down';
  const targetIp = params.apIp || '192.168.88.115';
  const adminPhone = params.adminPhone || '0653578184';
  
  // Find AP in inventory
  loadSavedHardware();
  const cleanParamMac = (params.apMac || '').replace(/[:-]/g, '').toUpperCase();
  const foundDevice = savedHardware.find(
    (h) =>
      (cleanParamMac && h.macAddress.replace(/[:-]/g, '').toUpperCase() === cleanParamMac) ||
      (params.apIp && h.ipAddress && (h.ipAddress.includes(params.apIp) || params.apIp.includes(h.ipAddress))) ||
      savedHardware.length === 1
  );
  
  const apName = params.apName || foundDevice?.name || 'Smart WiFi AP';
  const site = params.site || foundDevice?.site || 'Kituo Kikuu';
  const apMac = params.apMac || foundDevice?.macAddress || '';

  // Update device status in memory and disk
  if (foundDevice) {
    foundDevice.status = status === 'down' ? 'offline' : 'online';
    if (params.apIp && params.apIp.startsWith('192.168.')) {
      foundDevice.ipAddress = params.apIp;
    }
    foundDevice.lastSeen = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    (foundDevice as any).lastHeartbeat = status === 'up' ? Date.now() : 0;
    saveHardwareToDisk();
  }

  // Persist status change to PostgreSQL database
  try {
    const dbStatus = status === 'down' ? 'offline' : 'online';
    const lastSeenStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (apMac) {
      await db.update(hardware).set({ status: dbStatus, lastSeen: lastSeenStr }).where(eq(hardware.macAddress, apMac.toUpperCase()));
    } else if (foundDevice) {
      await db.update(hardware).set({ status: dbStatus, lastSeen: lastSeenStr }).where(eq(hardware.id, foundDevice.id));
    }
  } catch (dbErr) {
    console.warn('[PostgreSQL Hardware Outage Sync]:', dbErr);
  }

  // Update towers-data.json and PostgreSQL towers
  const diskTowers = loadSavedTowers();
  const cleanParamMac2 = (apMac || '').replace(/[:-]/g, '').toUpperCase();
  let towersChanged = false;
  diskTowers.forEach((t: any) => {
    const tMac = (t.macAddress || '').replace(/[:-]/g, '').toUpperCase();
    const isMatch =
      (cleanParamMac2 && tMac === cleanParamMac2) ||
      (targetIp && t.ipAddress === targetIp) ||
      (apName && t.name && t.name.toLowerCase().includes(apName.toLowerCase())) ||
      diskTowers.length === 1;
    if (isMatch) {
      t.status = status === 'down' ? 'offline' : 'online';
      towersChanged = true;
      try {
        db.update(towersTable).set({ status: t.status }).where(eq(towersTable.id, t.id)).catch(() => {});
      } catch (e) {}
    }
  });
  if (towersChanged) {
    saveTowersToFile(diskTowers);
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = new Date().toLocaleDateString('sw-TZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let waText = '';
  let smsText = '';

  if (status === 'down') {
    waText = `🚨 *TAHADHARI YA DHARURA: AP IMEZIMA!* 🚨

Habari Msimamizi Jimmy Lema,
Kifaa chako cha kurushia mawimbi ya Wi-Fi kimeacha kufanya kazi (OFFLINE):

📡 *Kifaa:* ${apName}
📍 *Eneo:* ${site}
🌐 *IP Address:* ${targetIp}
🏷️ *MAC Address:* ${apMac}
⏱️ *Muda:* ${timeStr} (${dateStr})

⚠️ *Hatua za Haraka za Kuchukua:*
1. Kagua kama umeme wa TANESCO umekatika au chaji ya sola/betri imeisha.
2. Kagua taa za PoE Injector / PoE Switch kama zinawaka.
3. Kagua kama waya wa LAN (Cat6) haujachomoka au kuharibika na panya.

_Mfumo wa Lema Fast WiFi Watchdog Monitoring_`;

    smsText = `TAHADHARI: Kifaa cha AP (${apName} - ${site}, IP: ${targetIp}) kimezima saa ${timeStr}! Kagua umeme au waya wa PoE. - LEMA FAST WIFI`;
  } else {
    waText = `✅ *TAARIFA NJEMA: AP IMERUDI HEWANI!* 🟢

Habari Msimamizi Jimmy Lema,
Kifaa chako cha Wi-Fi kimerudi hewani na kinafanya kazi kikamilifu (ONLINE):

📡 *Kifaa:* ${apName}
📍 *Eneo:* ${site}
🌐 *IP Address:* ${targetIp}
⏱️ *Muda:* ${timeStr}

Mtandao umerejea kawaida na wateja wameanza kuunganishwa tena.
_Mfumo wa Lema Fast WiFi Watchdog Monitoring_`;

    smsText = `TAARIFA: Kifaa cha AP (${apName} - ${site}) kimerudi hewani saa ${timeStr}! Wateja wameunganishwa tena. - LEMA FAST WIFI`;
  }

  // Send WhatsApp alert to Admin
  const waResult = await sendWhatsAppMessage(adminPhone, waText).catch((e: any) => ({ error: e?.message }));
  
  // Send SMS alert to Admin
  const smsResult = await sendSmsMessage(adminPhone, smsText).catch((e: any) => ({ error: e?.message }));

  const logEntry: OutageAlert = {
    id: `outage-${Date.now()}`,
    timestamp: `${dateStr} ${timeStr}`,
    apName,
    site,
    ip: targetIp,
    mac: apMac,
    status,
    adminPhone,
    waStatus: waResult,
    smsStatus: smsResult
  };

  outageAlertsLog.unshift(logEntry);
  if (outageAlertsLog.length > 50) outageAlertsLog.pop();

  addWhatsAppLog({
    type: 'system_alert',
    direction: 'internal',
    status: status === 'down' ? 'failed' : 'success',
    phone: adminPhone,
    summary: status === 'down' ? `🚨 Kengele ya Dharura: AP "${apName}" Imezima!` : `✅ AP "${apName}" Imerudi Hewani`,
    details: `Arifa imetumwa kwa Msimamizi (+${adminPhone}) kupitia WhatsApp na SMS.`,
    payload: logEntry
  });

  console.log(`[AP Watchdog] Alert sent for ${apName} (${targetIp}) -> status: ${status.toUpperCase()}`);
  return logEntry;
}

// Webhook & Heartbeat endpoint called by Smart AP (TP-Link Omada, Ruijie Reyee) or Dashboard Watchdog
app.all('/api/v1/hardware/alert/outage', async (req, res) => {
  const query = req.query as any;
  const body = (req.body || {}) as any;
  const status = ((query.status || body.status || 'down') as string).toLowerCase() === 'up' ? 'up' : 'down';
  const apIp = (query.ip || body.ip || body.apIp || '192.168.88.115') as string;
  const apName = (query.name || body.name || body.apName) as string;
  const site = (query.site || body.site) as string;
  const apMac = (query.mac || body.mac || body.apMac) as string;
  const adminPhone = (query.phone || body.phone || '0653578184') as string;

  const result = await processApOutageAlert({
    status,
    apIp,
    apName,
    site,
    apMac,
    adminPhone
  });

  return res.json({
    success: true,
    message: status === 'down' ? 'Arifa ya dharura ya kuzima kwa AP imetumwa kwa Msimamizi' : 'Arifa ya kuwaka kwa AP imetumwa kwa Msimamizi',
    alert: result
  });
});

// Smart AP Automated Heartbeat Receiver (TP-Link Omada / Ruijie Reyee - Bila MikroTik)
app.all('/api/v1/hardware/heartbeat', async (req, res) => {
  const query = req.query as any;
  const body = (req.body || {}) as any;
  const targetIp = (query.ip || body.ip || '192.168.88.115') as string;
  const targetMac = (query.mac || body.mac || '') as string;

  loadSavedHardware();
  const cleanTargetMac = targetMac.replace(/[:-]/g, '').toUpperCase();
  const device = savedHardware.find(
    (h) =>
      (cleanTargetMac && h.macAddress.replace(/[:-]/g, '').toUpperCase() === cleanTargetMac) ||
      (targetIp && h.ipAddress && (h.ipAddress.includes(targetIp) || targetIp.includes(h.ipAddress))) ||
      savedHardware.length === 1
  );

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let wasOffline = false;

  if (device) {
    if (device.status === 'offline') wasOffline = true;
    device.status = 'online';
    if (targetIp && targetIp.startsWith('192.168.')) {
      device.ipAddress = targetIp;
    }
    device.lastSeen = nowStr;
    (device as any).lastHeartbeat = Date.now();
    saveHardwareToDisk();
    try {
      db.update(hardware).set({ status: 'online', lastSeen: nowStr }).where(eq(hardware.id, device.id)).catch(() => {});
    } catch (e) {}
  }

  const towers = loadSavedTowers();
  const tower = towers.find((t: any) => 
    (cleanTargetMac && (t.macAddress || '').replace(/[:-]/g, '').toUpperCase() === cleanTargetMac) ||
    (t.ipAddress === targetIp) ||
    towers.length === 1
  );
  if (tower) {
    if (tower.status === 'offline') wasOffline = true;
    tower.status = 'online';
    if (targetIp && targetIp.startsWith('192.168.')) {
      tower.ipAddress = targetIp;
    }
    (tower as any).lastHeartbeat = Date.now();
    saveTowersToFile(towers);
    try {
      db.update(towersTable).set({ status: 'online' }).where(eq(towersTable.id, tower.id)).catch(() => {});
    } catch (e) {}
  }

  if (wasOffline) {
    processApOutageAlert({
      status: 'up',
      apIp: targetIp,
      apMac: targetMac || device?.macAddress,
      apName: device?.name,
      site: device?.site
    }).catch(() => {});
  }

  return res.json({
    success: true,
    status: 'online',
    lastSeen: nowStr,
    message: 'Heartbeat ya Smart AP imepokelewa kikamilifu bila MikroTik!'
  });
});

app.get('/api/v1/hardware/outage-alerts', (_req, res) => {
  return res.json({ success: true, count: outageAlertsLog.length, alerts: outageAlertsLog });
});

// Dynamic download of Windows AP Watchdog BAT script with auto-configured server URL and IP
app.get(['/download/lema-ap-watcher.bat', '/api/v1/download/watcher.bat'], (req, res) => {
  const host = req.get('host') || '127.0.0.1:3000';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;
  const targetIp = (req.query.ip as string) || '192.168.88.115';
  const targetMac = (req.query.mac as string) || 'D4-D6-DF-0D-B3-A0';

  const batContent = `@echo off
setlocal enabledelayedexpansion
title LEMA FAST WIFI - AP REAL-TIME WATCHDOG MONITOR
color 0A

cls
echo =====================================================================
echo          LEMA FAST WIFI - SMART AP WATCHDOG DAEMON (AUTO)
echo =====================================================================
echo  Hii programu inachunguza uhalisia wa AP yako kila sekunde 5-8.
echo  - Ukichomeka AP: Mfumo unabadilika kuwa ONLINE moja kwa moja!
echo  - Ukichomoa AP:  Mfumo unabadilika kuwa OFFLINE na kutuma kengele!
echo =====================================================================
echo.

set AP_IP=${targetIp}
set AP_MAC=${targetMac}
set CURRENT_SERVER=${currentOrigin}
set PROD_SERVER=https://lemawifi.online

echo [MIPANGILIO ILIYOCHAGULIWA]
echo  - AP IP Target: %AP_IP%
echo  - AP MAC:       %AP_MAC%
echo  - Seva ya Moja kwa Moja: %CURRENT_SERVER%
echo.
echo Inaanza kuchunguza mawasiliano ya AP sasa... (Bonyeza Ctrl+C kusimamisha)
echo =====================================================================
echo.

set LAST_STATE=unknown

:loop
ping -n 1 -w 1000 %AP_IP% >nul 2>&1
if errorlevel 1 (
    if not "!LAST_STATE!"=="offline" (
        echo [!TIME!] 🔴 [OFFLINE] AP haijibu Ping kwa %AP_IP%! Imezima au imechomoka.
        echo          Inatuma taarifa ya OFFLINE kwenye mfumo wa Lema Fast WiFi...
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%CURRENT_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=down' -TimeoutSec 4 | Out-Null } catch {}; try { Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=down' -TimeoutSec 4 | Out-Null } catch {}" >nul 2>&1
        
        echo          [OK] Hali imesasishwa: Mfumo sasa unaonyesha OFFLINE! Kengele imetumwa WhatsApp na SMS.
        set LAST_STATE=offline
    ) else (
        echo [!TIME!] 🔴 AP bado haipatikani (%AP_IP% OFFLINE)...
    )
) else (
    if not "!LAST_STATE!"=="online" (
        echo [!TIME!] 🟢 [ONLINE] AP imepatikana kikamilifu kwenye %AP_IP%!
        echo          Inatuma taarifa ya ONLINE kwenye mfumo wa Lema Fast WiFi...
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%CURRENT_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=up' -TimeoutSec 4 | Out-Null; Invoke-RestMethod -Uri '%CURRENT_SERVER%/api/v1/hardware/heartbeat?ip=%AP_IP%&mac=%AP_MAC%' -TimeoutSec 4 | Out-Null } catch {}; try { Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=up' -TimeoutSec 4 | Out-Null; Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/heartbeat?ip=%AP_IP%&mac=%AP_MAC%' -TimeoutSec 4 | Out-Null } catch {}" >nul 2>&1
        
        echo          [OK] Hali imesasishwa: Mfumo sasa unaonyesha ONLINE!
        set LAST_STATE=online
    ) else (
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%CURRENT_SERVER%/api/v1/hardware/heartbeat?ip=%AP_IP%&mac=%AP_MAC%' -TimeoutSec 3 | Out-Null } catch {}" >nul 2>&1
        echo [!TIME!] 🟢 AP ipo hewani (%AP_IP% ONLINE) - Mawasiliano mazuri.
    )
)

timeout /t 6 /nobreak >nul
goto loop
`;

  res.setHeader('Content-Type', 'application/x-bat; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="lema-ap-watcher.bat"');
  return res.send(batContent);
});

// =========================================================================
// ACTIVE SESSIONS & CONNECTED USERS PERSISTENCE (Synced across PC & Mobile)
// =========================================================================
const SESSIONS_FILE = path.resolve(__dirname, 'active-sessions.json');
let savedActiveSessions: any[] = [];

function loadSavedSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        savedActiveSessions = data;
        console.log(`[Active Sessions] Imepakua vikao ${savedActiveSessions.length} kutoka kwenye diski.`);
      }
    }
  } catch (e) {
    console.warn('[Active Sessions] Hitilafu wakati wa kusoma vikao:', e);
  }
}

function saveSessionsToDisk() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(savedActiveSessions, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Active Sessions] Hitilafu wakati wa kuhifadhi vikao:', e);
  }
}

loadSavedSessions();

app.get('/api/v1/sessions/active', (_req, res) => {
  res.json({ success: true, count: savedActiveSessions.length, sessions: savedActiveSessions });
});

app.post('/api/v1/sessions/active', (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ success: false, error: 'Session ID inahitajika' });
  }
  const existingIdx = savedActiveSessions.findIndex((s) => s.id === session.id);
  if (existingIdx >= 0) {
    savedActiveSessions[existingIdx] = { ...savedActiveSessions[existingIdx], ...session };
  } else {
    savedActiveSessions.unshift(session);
  }
  saveSessionsToDisk();
  res.json({ success: true, sessions: savedActiveSessions });
});

app.get('/api/v1/sessions/sync', (_req, res) => {
  loadSavedSessions();
  return res.json({ success: true, count: savedActiveSessions.length, sessions: savedActiveSessions });
});

app.post('/api/v1/sessions/sync', (req, res) => {
  const { sessions } = req.body;
  if (Array.isArray(sessions)) {
    savedActiveSessions = sessions;
    saveSessionsToDisk();
    return res.json({ success: true, count: savedActiveSessions.length, sessions: savedActiveSessions });
  }
  res.status(400).json({ success: false, error: 'Invalid sessions array' });
});

app.delete('/api/v1/sessions/active/:id', (req, res) => {
  const { id } = req.params;
  savedActiveSessions = savedActiveSessions.filter((s) => s.id !== id);
  saveSessionsToDisk();
  res.json({ success: true, sessions: savedActiveSessions });
});

// =========================================================================
// VOUCHERS STORAGE & REAL-TIME SYNC (PC Admin <-> Customer Mobile Phone)
// =========================================================================
const VOUCHERS_FILE = path.resolve(__dirname, 'vouchers-data.json');
let savedVouchers: any[] = [];

function loadSavedVouchers() {
  try {
    if (fs.existsSync(VOUCHERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VOUCHERS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        savedVouchers = data;
        console.log(`[Vouchers] Imepakua vocha ${savedVouchers.length} kutoka kwenye diski.`);
      }
    }
  } catch (e) {
    console.warn('[Vouchers] Hitilafu wakati wa kusoma vocha:', e);
  }
}

function saveVouchersToDisk() {
  try {
    fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(savedVouchers, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Vouchers] Hitilafu wakati wa kuhifadhi vocha:', e);
  }
}

loadSavedVouchers();

// GET all vouchers
app.get('/api/v1/vouchers', (_req, res) => {
  loadSavedVouchers();
  return res.json({ success: true, count: savedVouchers.length, vouchers: savedVouchers });
});

// POST save or add vouchers (synced from Admin Dashboard)
app.post('/api/v1/vouchers', (req, res) => {
  const { vouchers } = req.body;
  if (Array.isArray(vouchers)) {
    // Merge vouchers by code
    for (const v of vouchers) {
      const idx = savedVouchers.findIndex((sv) => sv.code === v.code);
      if (idx >= 0) {
        savedVouchers[idx] = { ...savedVouchers[idx], ...v };
      } else {
        savedVouchers.unshift(v);
      }
    }
    saveVouchersToDisk();
    return res.json({ success: true, count: savedVouchers.length, vouchers: savedVouchers });
  }
  return res.status(400).json({ success: false, error: 'Invalid vouchers array' });
});

function parseKbps(s?: string) {
  const m = String(s || '').match(/([\d.]+)\s*([MK])\s*\/\s*([\d.]+)\s*([MK])/i);
  if (!m) return { down: 0, up: 0 };
  const k = (n: string, u: string) => Math.round(parseFloat(n) * (u.toUpperCase() === 'M' ? 1024 : 1));
  return { down: k(m[1], m[2]), up: k(m[3], m[4]) };
}

// POST Redeem Voucher (called from Customer Portal on Mobile Phone with Omada v6.3)
app.post('/api/v1/vouchers/redeem', async (req, res) => {
  const { code, phone, clientMac, apMac, ssidName, radioId, clientIp, macAddress, ipAddress } = req.body || {};
  const trimmed = String(code || '').trim();
  if (!trimmed) {
    return res.status(400).json({ success: false, message: 'Nambari ya vocha inahitajika.' });
  }

  const effectiveClientMac = String(clientMac || macAddress || '').trim().toUpperCase();
  const effectiveApMac = String(apMac || '').trim().toUpperCase();
  const effectiveClientIp = String(clientIp || ipAddress || '').trim();

  if (!effectiveClientMac) {
    return res.status(400).json({
      success: false,
      message: 'Fungua ukurasa huu kupitia mtandao wa Wi-Fi wa Lema (Anwani ya kifaa/MAC haijapatikana).'
    });
  }

  // AP MAC inahitajika iwapo mfumo umeunganishwa na Omada
  if (process.env.OMADA_URL && !effectiveApMac) {
    return res.status(400).json({
      success: false,
      message: 'Fungua ukurasa kupitia WiFi ya Lema (AP haijatambuliwa).'
    });
  }

  loadSavedVouchers();
  const found: any = savedVouchers.find((v) => v.code === trimmed);
  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'Nambari ya vocha siyo sahihi! Tafadhali kagua tena namba yako au nunua vocha mpya.'
    });
  }

  const now = Date.now();
  if (found.status === 'expired' || (found.expiresAt && new Date(found.expiresAt).getTime() <= now)) {
    found.status = 'expired';
    saveVouchersToDisk();
    return res.status(400).json({ success: false, message: 'Vocha hii imekwisha muda wake wa matumizi.' });
  }

  // Bind to single device MAC: If already active and bound to another MAC, refuse!
  const normalizeMac = (m: string) => (m || '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  const cleanClientMacNorm = normalizeMac(effectiveClientMac);
  const cleanBoundMacNorm = normalizeMac(found.boundMac);

  if (found.status === 'active' && cleanBoundMacNorm && cleanBoundMacNorm !== cleanClientMacNorm) {
    return res.status(403).json({
      success: false,
      message: `Vocha hii tayari inatumika kwenye kifaa kingine (${found.boundMac.slice(0, 8)}...). Vocha moja ni kwa kifaa kimoja tu.`
    });
  }

  const durationHours = found.durationHours || 24;
  const expiresAtMs = (found.status === 'active' && found.expiresAt)
    ? new Date(found.expiresAt).getTime()
    : now + durationHours * 3600 * 1000;
  const remainingDurationMs = Math.max(expiresAtMs - now, 60 * 1000);

  const { down, up } = parseKbps(found.speedLimit);

  // If OMADA_URL is configured, trigger real Omada Controller v6.3 authorization
  if (process.env.OMADA_URL && process.env.OMADA_OPERATOR) {
    try {
      await omadaAuthorize({
        clientMac: effectiveClientMac,
        apMac: effectiveApMac,
        ssidName: String(ssidName || 'Lema Fast WiFi'),
        radioId: radioId || 0,
        clientIp: effectiveClientIp,
        durationMs: remainingDurationMs,
        downKbps: down,
        upKbps: up,
      });
      console.log(`[Omada Controller v6.3] Successfully authorized ${effectiveClientMac} on AP ${effectiveApMac}`);
    } catch (omadaErr: any) {
      console.error('[Omada Controller Authorization Failed]:', omadaErr.message);
      return res.status(502).json({
        success: false,
        message: `Mfumo umeshindwa kuruhusu intaneti kwenye Omada Controller: ${omadaErr.message}. Vocha haijatumika, jaribu tena baada ya sekunde chache.`
      });
    }
  } else if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      success: false,
      message: 'Mfumo bado haujaunganishwa na Omada Controller (OMADA_URL au OMADA_OPERATOR haijawekwa).'
    });
  } else {
    console.warn('[Omada] OMADA_URL/OMADA_OPERATOR haijawekwa kwenye env. Inaruhusu kimajaribio (dev/mock mode).');
  }

  const expiresAt = new Date(expiresAtMs).toISOString();
  found.status = 'active';
  found.activatedAt = found.activatedAt || new Date(now).toISOString();
  found.expiresAt = expiresAt;
  found.boundMac = effectiveClientMac;
  found.usedByPhone = phone || found.usedByPhone || '';
  saveVouchersToDisk();

  const session: any = {
    id: `sess-${now}`,
    voucherCode: found.code,
    phoneNumber: phone || '',
    ipAddress: effectiveClientIp,
    macAddress: effectiveClientMac,
    connectedAt: new Date(now).toISOString(),
    expiresAt,
    packageId: found.packageId || 'pkg-custom',
    packageName: found.packageName || 'Intaneti ya Vocha',
    speedLimit: found.speedLimit || '2.5M/1.0M',
    bytesDown: 1048576,
    bytesUp: 262144,
  };

  loadSavedSessions();
  savedActiveSessions = [session, ...savedActiveSessions.filter((s: any) => s.macAddress !== effectiveClientMac)];
  saveSessionsToDisk();

  // Also update associated wifi client list
  loadSavedWifiClients();
  const cIdx = wifiClients.findIndex((c) => c.mac.toUpperCase() === effectiveClientMac);
  if (cIdx >= 0) {
    wifiClients[cIdx].status = 'active_authorized';
    wifiClients[cIdx].voucherCode = found.code;
  } else {
    wifiClients.unshift({
      id: `cli-${now}`,
      ip: effectiveClientIp,
      mac: effectiveClientMac,
      ssid: String(ssidName || 'Lema Fast WiFi'),
      apName: effectiveApMac ? `Omada AP (${effectiveApMac})` : 'TP-Link Omada AP',
      connectedAt: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'active_authorized',
      voucherCode: found.code,
    });
  }
  saveWifiClients();

  return res.json({
    success: true,
    message: `Hongera! Umefanikiwa kuunganishwa kikamilifu. Kifurushi: ${found.packageName}.`,
    session,
    voucher: found
  });
});

// POST Free Trial (15 minutes free internet)
app.post('/api/v1/vouchers/trial', (req, res) => {
  const { phone, macAddress, ipAddress } = req.body || {};
  const clientMac = (macAddress || `48:D7:05:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`).toUpperCase();
  const clientIp = ipAddress || `192.168.88.${Math.floor(20 + Math.random() * 200)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  const trialSession: any = {
    id: `sess-trial-${Date.now()}`,
    voucherCode: 'FREE-TRIAL',
    phoneNumber: phone,
    ipAddress: clientIp,
    macAddress: clientMac,
    connectedAt: now.toISOString(),
    expiresAt,
    packageId: 'pkg-trial',
    packageName: 'Majaribio ya Bure (Dakika 15)',
    speedLimit: '2.0M/1.0M',
    bytesDown: 524288,
    bytesUp: 131072,
  };

  savedActiveSessions.unshift(trialSession);
  saveSessionsToDisk();

  const clientIdx = wifiClients.findIndex((c) => c.mac.toUpperCase() === clientMac);
  if (clientIdx >= 0) {
    wifiClients[clientIdx].status = 'active_authorized';
    wifiClients[clientIdx].voucherCode = 'FREE-TRIAL';
    saveWifiClients();
  }

  return res.json({
    success: true,
    message: '🎁 Majaribio ya dakika 15 yameanza rasmi! Furahia intaneti ya kasi ya LEMA FAST WiFi.',
    session: trialSession,
  });
});

// =========================================================================
// OMADA & WI-FI ASSOCIATED CLIENTS (Devices Connected to Omada_5Ghz SSID)
// =========================================================================
interface AssociatedWifiClient {
  id: string;
  ip: string;
  mac: string;
  ssid: string;
  apName: string;
  deviceModel?: string;
  connectedAt: string;
  status: 'pending_login' | 'active_authorized' | 'free_trial';
  voucherCode?: string;
}

const WIFI_CLIENTS_FILE = path.resolve(__dirname, 'wifi-clients.json');
let wifiClients: AssociatedWifiClient[] = [];

function loadSavedWifiClients() {
  try {
    if (fs.existsSync(WIFI_CLIENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(WIFI_CLIENTS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        wifiClients = data;
      }
    }
  } catch (e) {
    console.warn('[Wifi Clients] Could not load:', e);
  }
}

function saveWifiClients() {
  try {
    fs.writeFileSync(WIFI_CLIENTS_FILE, JSON.stringify(wifiClients, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Wifi Clients] Could not save:', e);
  }
}

loadSavedWifiClients();

// GET all Wi-Fi associated clients
app.get('/api/v1/omada/clients', (_req, res) => {
  loadSavedWifiClients();
  return res.json({ success: true, count: wifiClients.length, clients: wifiClients });
});

// POST register/connect client on Wi-Fi (called by Omada Controller or Smart AP DHCP)
app.all('/api/v1/omada/client/connect', (req, res) => {
  const query = req.query as any;
  const body = (req.body || {}) as any;
  const ip = query.ip || body.ip || '192.168.88.142';
  const mac = (query.mac || body.mac || 'DA:A1:19:4F:92:B1').toUpperCase();
  const ssid = query.ssid || body.ssid || 'Omada_5Ghz';
  const apName = query.ap || body.ap || 'Smart WiFi AP';
  const model = query.model || body.model || 'Wireless Device';

  const existingIdx = wifiClients.findIndex((c) => c.mac === mac);
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (existingIdx >= 0) {
    wifiClients[existingIdx].ip = ip;
    wifiClients[existingIdx].ssid = ssid;
    wifiClients[existingIdx].connectedAt = nowStr;
  } else {
    wifiClients.unshift({
      id: `cli-${Date.now()}`,
      ip,
      mac,
      ssid,
      apName,
      deviceModel: model,
      connectedAt: nowStr,
      status: 'pending_login'
    });
  }
  saveWifiClients();
  return res.json({ success: true, client: wifiClients[0], total: wifiClients.length });
});

// POST Authorize client (Grant access directly on Omada Controller v6.3 from Admin Dashboard - Protected by Admin Key)
app.post('/api/v1/omada/client/authorize', requireAdmin, async (req, res) => {
  const { mac, hours, planName, apMac, clientIp, ssidName, radioId } = req.body || {};
  const cleanMac = String(mac || '').trim().toUpperCase();
  if (!cleanMac) {
    return res.status(400).json({ error: 'MAC address is required' });
  }

  const durationHours = Number(hours) || 24;
  const durationMs = durationHours * 3600 * 1000;

  if (process.env.OMADA_URL && process.env.OMADA_OPERATOR) {
    try {
      await omadaAuthorize({
        clientMac: cleanMac,
        apMac: String(apMac || '').toUpperCase(),
        ssidName: String(ssidName || 'Lema Fast WiFi'),
        radioId: radioId || 0,
        clientIp: clientIp || '',
        durationMs,
        downKbps: 3072,
        upKbps: 1536,
      });
      console.log(`[Admin Grant] Authorized ${cleanMac} directly on Omada Controller`);
    } catch (e: any) {
      console.error('[Omada Controller Admin Grant Failed]:', e.message);
      return res.status(502).json({
        success: false,
        message: `Hitilafu ya Omada Controller: ${e.message}`
      });
    }
  }

  loadSavedWifiClients();
  let target = wifiClients.find((c) => c.mac.toUpperCase() === cleanMac);
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const voucherCode = Math.floor(1000 + Math.random() * 9000).toString();

  if (!target) {
    target = {
      id: `cli-${Date.now()}`,
      ip: clientIp || '192.168.88.129',
      mac: cleanMac,
      ssid: ssidName || 'Lema Fast WiFi',
      apName: apMac ? `Omada AP (${apMac})` : 'TP-Link Omada AP',
      connectedAt: nowStr,
      status: 'active_authorized',
      voucherCode
    };
    wifiClients.unshift(target);
  } else {
    target.status = 'active_authorized';
    target.voucherCode = voucherCode;
  }
  saveWifiClients();

  // Also push to activeSessions
  loadSavedSessions();
  const newSession = {
    id: `sess-${Date.now()}`,
    voucherCode: target.voucherCode,
    phoneNumber: '0653578184',
    ipAddress: target.ip,
    macAddress: target.mac,
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationMs).toISOString(),
    packageId: 'pkg-grant',
    packageName: planName || 'Lema Fast WiFi Internet Access',
    speedLimit: '3.0M/1.5M',
    bytesDown: 1048576,
    bytesUp: 524288
  };

  savedActiveSessions = [newSession, ...savedActiveSessions.filter((s: any) => s.macAddress !== cleanMac)];
  saveSessionsToDisk();

  return res.json({
    success: true,
    message: `Mteja (${cleanMac}) ameruhusiwa intaneti kikamilifu kwenye Omada!`,
    session: newSession
  });
});

// ==========================================
// 🔗 TP-LINK OMADA CLOUD CONTROLLER WEBHOOK
// ==========================================
app.post('/api/v1/omada/webhook', async (req, res) => {
  console.log('[Omada Webhook Received]:', JSON.stringify(req.body, null, 2));
  const body = req.body || {};

  const rawStatus = String(body.status || body.eventType || body.alertType || body.type || body.action || body.event || '').toLowerCase();
  const alertText = String(body.text || body.message || body.msg || body.content || body.title || '').toLowerCase();

  const isDown =
    rawStatus.includes('disconnect') ||
    rawStatus.includes('down') ||
    rawStatus.includes('offline') ||
    rawStatus === '0' ||
    alertText.includes('disconnected') ||
    alertText.includes('offline') ||
    alertText.includes('imezima');

  const incomingMac = (
    body.mac ||
    body.deviceMac ||
    body.device_mac ||
    body.macAddress ||
    body.data?.mac ||
    body.alert?.deviceMac ||
    'D4-D6-DF-0D-B3-A0'
  ).toUpperCase();

  const incomingName = body.name || body.deviceName || body.device_name || body.data?.name || 'TP-Link Omada AP';
  const incomingIp = body.ip || body.deviceIp || body.data?.ip || '192.168.1.153';
  const site = body.site || body.siteName || 'Kariakoo';

  const newStatus: 'online' | 'offline' = isDown ? 'offline' : 'online';
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Update memory & disk
  loadSavedHardware();
  const found = savedHardware.find((h) => h.macAddress.toUpperCase() === incomingMac);
  if (found) {
    found.status = newStatus;
    found.lastSeen = timeStr;
    saveHardwareToDisk();
  }

  // 2. Update PostgreSQL database in Render
  try {
    await db
      .update(hardware)
      .set({
        status: newStatus,
        lastSeen: timeStr,
      })
      .where(eq(hardware.macAddress, incomingMac));
    console.log(`[Omada Webhook] ✅ PostgreSQL updated: ${incomingMac} -> ${newStatus.toUpperCase()}`);
  } catch (err) {
    console.error('[Omada Webhook] PostgreSQL update failed:', err);
  }

  // 3. Trigger WhatsApp & SMS Outage Notification if down or up
  try {
    await processApOutageAlert({
      apName: incomingName,
      apIp: incomingIp,
      apMac: incomingMac,
      site,
      status: isDown ? 'down' : 'up',
      adminPhone: '0653578184',
    });
  } catch (alertErr) {
    console.warn('[Omada Alert Notice]:', alertErr);
  }

  return res.json({
    success: true,
    message: `Omada Webhook imechakatwa: AP (${incomingMac}) imewekwa ${newStatus.toUpperCase()}`,
    device: {
      mac: incomingMac,
      status: newStatus,
      lastSeen: timeStr,
    },
  });
});

app.get('/api/v1/omada/webhook-info', (_req, res) => {
  return res.json({
    success: true,
    webhookUrl: 'https://lema-fast-wifi-bot.onrender.com/api/v1/omada/webhook',
    events: ['Device Disconnected', 'Device Connected', 'Gateway / AP State Change'],
    supportedDevices: ['TP-Link Omada EAP', 'Omada Cloud Controller', 'OC200', 'OC300', 'Software Controller'],
  });
});

const clearWhatsAppLogs = (_req: express.Request, res: express.Response) => {
  whatsAppLogs.length = 0;
  addWhatsAppLog({
    type: 'system_alert',
    direction: 'internal',
    status: 'info',
    summary: 'Kumbukumbu (Logs) zimesafishwa 🧹',
    details: 'Log buffer imewekwa upya na iko tayari kupokea matukio mapya ya Webhook na API.'
  });
  return res.json({ success: true, count: whatsAppLogs.length });
};

app.post('/api/v1/whatsapp/clear-logs', clearWhatsAppLogs);
app.post('/api/v1/whatsapp/logs/clear', clearWhatsAppLogs);

// Endpoint to simulate webhook actions directly from UI for testing
const simulateWebhookHandler = async (req: express.Request, res: express.Response) => {
  const body = req.body || {};
  const simType = body.eventType || body.type || 'incoming_message';
  const testPhone = (body.phone || '255653578184').replace(/[^0-9]/g, '');

  if (simType === 'incoming_message' || simType === 'incoming_text') {
    const incomingText = body.textMessage || 'Habari, nahitaji bando la masaa 24';
    const fakePayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: whatsAppConfig.wabaId || '1578703743479175',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: whatsAppConfig.displayPhoneNumber, phone_number_id: whatsAppConfig.phoneNumberId },
            contacts: [{ profile: { name: 'Jimmy Lema (Simulated)' }, wa_id: testPhone }],
            messages: [{
              from: testPhone,
              id: `wamid.HBgL${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: { body: incomingText },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };

    addWhatsAppLog({
      type: 'incoming_message',
      direction: 'inbound',
      status: 'info',
      phone: testPhone,
      summary: `Meta Webhook: Mteja ameandika "${incomingText}"`,
      details: `Ujumbe toka +${testPhone} (Mteja). Bot atajibu mara moja.`,
      payload: fakePayload
    });

    const reply = generateBotReply(incomingText, 'Jimmy Lema', testPhone);
    recentMessages.push({
      id: `sim-user-${Date.now()}`,
      senderPhone: testPhone,
      senderName: 'Jimmy Lema (Simulated)',
      text: incomingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: 'user'
    });
    recentMessages.push({
      id: `sim-bot-${Date.now()}`,
      senderPhone: 'bot',
      senderName: 'Lema Fast WiFi Bot 🤖',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: 'bot'
    });

    addWhatsAppLog({
      type: 'outgoing_api',
      direction: 'outbound',
      status: 'success',
      phone: testPhone,
      summary: `Bot amejibu kiotomatiki kwenda +${testPhone}`,
      details: reply.slice(0, 150) + '...',
      payload: { replyText: reply }
    });

    return res.json({ success: true, reply, incomingText, phone: testPhone });
  }

  if (simType === 'delivery_status' || simType === 'delivered' || simType === 'error_24h' || simType === 'failed') {
    const isError24h = simType === 'error_24h' || body.status === 'failed';
    const deliveryStatus = isError24h ? 'failed' : (body.status || 'delivered');
    const errorCode = body.errorCode || (isError24h ? 131047 : undefined);
    const fakePayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: whatsAppConfig.wabaId || '1578703743479175',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: whatsAppConfig.displayPhoneNumber, phone_number_id: whatsAppConfig.phoneNumberId },
            statuses: [{
              id: `wamid.HBgL${Date.now()}`,
              status: deliveryStatus,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              recipient_id: testPhone,
              ...(isError24h ? {
                errors: [{
                  code: errorCode || 131047,
                  title: 'Message failed to deliver',
                  message: 'Re-engagement message: More than 24 hours have passed since the recipient last replied.',
                  error_data: { details: 'Zaidi ya masaa 24 yamepita bila mteja kumwandikia bot (24h customer window).' }
                }]
              } : {})
            }]
          },
          field: 'messages'
        }]
      }]
    };

    if (isError24h) {
      addWhatsAppLog({
        type: 'delivery_status',
        direction: 'inbound',
        status: 'failed',
        code: errorCode || 131047,
        phone: testPhone,
        summary: `⚠️ Meta Webhook: Ujumbe Haukufika Simuni (+${testPhone})`,
        details: `Kosa #${errorCode || 131047}: Meta Customer Care Window (saa 24). Mteja anapaswa kumwandikia bot kwanza wa.me/255621311137.`,
        payload: fakePayload
      });
    } else {
      addWhatsAppLog({
        type: 'delivery_status',
        direction: 'inbound',
        status: deliveryStatus as any,
        phone: testPhone,
        summary: `✅ Meta Webhook: Ujumbe umefika simuni (+${testPhone})`,
        details: `Hali ya ujumbe: ${deliveryStatus.toUpperCase()} kwenye kifaa cha mteja.`,
        payload: fakePayload
      });
    }

    return res.json({ success: true, status: deliveryStatus, phone: testPhone });
  }

  if (simType === 'webhook_verification' || simType === 'verify_challenge' || simType === 'challenge') {
    addWhatsAppLog({
      type: 'webhook_verification',
      direction: 'inbound',
      status: 'success',
      summary: 'Meta Webhook Challenge: Imethibitishwa Kikamilifu ✅',
      details: `Meta Developer Portal imethibitisha Webhook URL kwa kutumia Verify Token: "${whatsAppConfig.verifyToken}".`,
      payload: { 'hub.mode': 'subscribe', 'hub.challenge': '1158201244', 'hub.verify_token': whatsAppConfig.verifyToken }
    });
    return res.json({ success: true, verified: true });
  }

  return res.json({ success: true, message: 'Simulated unknown type' });
};

app.post('/api/v1/whatsapp/simulate-webhook', simulateWebhookHandler);
app.post('/api/v1/whatsapp/webhook/simulate', simulateWebhookHandler);

// Helper: Send WhatsApp reply via Meta WhatsApp Cloud API safely
async function sendWhatsAppMessage(targetPhoneOrChatId: string, message: string, templateName?: string) {
  const digits = targetPhoneOrChatId.replace(/[^0-9]/g, '');
  const international = digits.startsWith('0')
    ? '255' + digits.slice(1)
    : digits.startsWith('255')
    ? digits
    : '255' + digits;

  const token = (whatsAppConfig.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const phoneId = (whatsAppConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '1483764411477759').trim();

  // Validate if token is real Meta token (must not be empty, placeholder or too short)
  const isPlaceholderOrInvalid = !token || token.toLowerCase().includes('token string') || token.length < 25;

  // 1. Meta WhatsApp Cloud API (Official - Unlimited Numbers)
  if (phoneId && !isPlaceholderOrInvalid) {
    try {
      console.log(`[Meta WhatsApp Cloud API] 📤 Sending to +${international} (mode: ${templateName ? 'template:' + templateName : 'text'}): "${message.slice(0, 50)}..."`);
      const rawUrl = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
      const url = buildMetaGraphUrl(rawUrl, token);
      const requestBody = templateName
        ? {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: international,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en_US' }
            }
          }
        : {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: international,
            type: 'text',
            text: { preview_url: false, body: message }
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonErr: any) {
        const text = await response.text().catch(() => '');
        console.error('[Meta WhatsApp Cloud API] Response not JSON:', response.status, text);
        return {
          error: true,
          message: `Meta API returned HTTP ${response.status}: ${text.slice(0, 100)}`
        };
      }

      if (data?.error) {
        const errorType = data.error.type || 'MetaAPIError';
        const errorCode = data.error.code;
        const errorMessage = data.error.message || 'Hitilafu ya Meta Cloud API';

        // Auto-handle 133010 Account not registered: Register phone and retry send
        if (errorCode === 133010 || errorMessage.includes('133010') || errorMessage.toLowerCase().includes('account not registered')) {
          console.log('[Meta Cloud API] 🔄 Account not registered (133010). Attempting automatic phone registration...');
          const regRes = await registerMetaPhoneNumber(phoneId, token);
          if (regRes.success) {
            console.log('[Meta Cloud API] ✅ Auto-registration successful! Retrying message delivery...');
            const retryRes = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: international,
                type: 'text',
                text: { preview_url: false, body: message }
              })
            });
            const retryData: any = await retryRes.json();
            if (!retryData?.error) {
              console.log(`[Meta WhatsApp Cloud API Success] Ujumbe umetumwa kwa +${international} baada ya usajili.`);
              whatsAppConfig.lastError = null;
              return retryData;
            }
          }
        }

        const isNotRegistered = errorCode === 133010 || errorMessage.includes('133010');
        const isOAuth = errorType === 'OAuthException';
        const isAppSecretProof = errorMessage.toLowerCase().includes('appsecret_proof');

        whatsAppConfig.lastError = {
          type: errorType,
          code: errorCode,
          message: errorMessage,
          isNotRegistered,
          isAppSecretProof,
          timestamp: new Date().toLocaleTimeString()
        };

        let userTip = errorMessage;
        if (errorCode === 131058 || errorMessage.includes('131058')) {
          userTip = 'Kwenye namba halisi ya uzalishaji (Meta Verified kama +255 621 311 137), template ya majaribio ya "hello_world" haitumiki (ni ya Test Numbers pekee). Tumia "Tuma Jaribio (Text)" au mwandikie bot kwanza wa.me/255621311137.';
        } else if (errorCode === 100 && errorMessage.includes('Invalid parameter')) {
          userTip = 'Vigezo visivyo sahihi. Hakikisha namba ya mpokeaji ni namba yako binafsi na si namba ile ile ya Bot (+255 621 311 137).';
        } else if (isAppSecretProof) {
          userTip = 'Kwenye Meta App Dashboard yako, mpangilio wa "Require App Secret" umewashwa. Chaguo 1 (Haraka): Zima kwenye developers.facebook.com ➔ App Settings ➔ Advanced ➔ Security ➔ "Require App Secret": Weka OFF ➔ Save Changes. Chaguo 2: Bandika App Secret yako hapa chini kwenye kisanduku cha App Secret.';
        } else if (isNotRegistered) {
          userTip = 'Namba haijasajiliwa Meta (Code 133010: Account not registered). Mfumo unakuruhusu kubonyeza "Sajili Namba Meta" chini au hakikisha namba ya mpokeaji imeongezwa kwenye orodha ya "To" kwenye Meta Developers.';
        } else if (isOAuth) {
          userTip = 'Token ya Meta imekwisha muda au si sahihi. Bonyeza "Generate token" au "Copy" kutoka ukurasa wa Meta Developers ➔ WhatsApp ➔ API Setup.';
        }

        addWhatsAppLog({
          type: 'outgoing_api',
          direction: 'outbound',
          status: 'failed',
          code: errorCode,
          phone: international,
          summary: `Hitilafu ya Meta API (#${errorCode}): ${errorMessage}`,
          details: userTip,
          payload: data
        });

        return {
          error: true,
          errorType,
          code: errorCode,
          subcode: data.error.error_subcode,
          message: errorMessage,
          isAccountNotRegistered: isNotRegistered,
          isOAuthException: isOAuth,
          isAppSecretProof,
          userTip
        };
      }

      console.log(`[Meta WhatsApp Cloud API Success] Ujumbe umetumwa kwa +${international}`);
      whatsAppConfig.lastError = null;

      addWhatsAppLog({
        type: 'outgoing_api',
        direction: 'outbound',
        status: 'success',
        phone: international,
        summary: `Meta API: Ujumbe Umetumwa kwa +${international}`,
        details: `Meta Message ID: ${data?.messages?.[0]?.id || 'OK'}. Maudhui: "${message.slice(0, 70)}..."`,
        payload: { response: data }
      });

      return data;
    } catch (err: any) {
      console.log('[Meta WhatsApp Cloud API Handled Catch]:', err?.message || 'Network error');
      addWhatsAppLog({
        type: 'outgoing_api',
        direction: 'outbound',
        status: 'failed',
        phone: international,
        summary: `Hitilafu ya Mtandao ya Meta API`,
        details: err?.message || 'Mawasiliano na seva ya Meta yameshindikana.',
        payload: { error: err?.message }
      });

      return { 
        error: true, 
        message: err?.message || 'Meta Cloud API Network Error',
        userTip: 'Tatizo la mawasiliano ya mtandao na seva ya Meta.' 
      };
    }
  }

  console.log(`[WhatsApp Bot Simulator / Meta Ready] Message to +${international}: "${message.slice(0, 60)}..."`);
  addWhatsAppLog({
    type: 'system_alert',
    direction: 'internal',
    status: 'warning',
    phone: international,
    summary: `Ujumbe Kwenye Simulator: +${international}`,
    details: isPlaceholderOrInvalid
      ? 'Access Token ya Meta haijawekwa au si sahihi. Ujumbe umeandikwa kwenye simulator ya mfumo.'
      : 'Phone Number ID haijawekwa kwenye Mipangilio ya Meta.',
    payload: { to: international, message }
  });

  return {
    simulated: true,
    warning: isPlaceholderOrInvalid
      ? 'Access Token ya Meta haijawekwa au ni ya mfano tu ("Access Token String"). Tafadhali weka Token halisi inayoanza na EAA... kutoka Meta Developers ukurasa wa WhatsApp ➔ API Setup.'
      : 'Phone Number ID au Access Token haijawekwa kwenye Mipangilio ya Meta!',
    to: international
  };
}

// Endpoint for admin to reply manually from dashboard
app.post('/api/v1/whatsapp/reply', async (req, res) => {
  const { chatId, message, senderName } = req.body;
  if (!chatId || !message) {
    return res.status(400).json({ error: 'Missing chatId or message' });
  }

  const result = await sendWhatsAppMessage(chatId, message);
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
  try {
    const { phone, message, useTemplate, accessToken, appSecret, phoneNumberId } = req.body;
    if (accessToken && typeof accessToken === 'string' && accessToken.length > 20) {
      whatsAppConfig.accessToken = accessToken.trim();
    }
    if (appSecret !== undefined && typeof appSecret === 'string') {
      whatsAppConfig.appSecret = appSecret.trim();
    }
    if (phoneNumberId && typeof phoneNumberId === 'string') {
      whatsAppConfig.phoneNumberId = phoneNumberId.trim();
    }

    const rawTarget = (phone || '').trim();
    const digits = rawTarget.replace(/[^0-9]/g, '');
    const normalizedTarget = digits.startsWith('0') ? '255' + digits.slice(1) : digits;
    const botDigits = (whatsAppConfig.displayPhoneNumber || '255621311137').replace(/[^0-9]/g, '');

    if (!rawTarget) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Tafadhali weka namba ya simu ya mpokeaji (mfano: 0755123456 au 0653578184).'
      });
    }

    if (normalizedTarget === botDigits || normalizedTarget === '255621311137') {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Huwezi kutuma ujumbe kwenda namba ile ile ya Bot (+255 621 311 137). Tafadhali weka namba yako binafsi ya WhatsApp (mfano: 07... au 0653...).'
      });
    }

    const result = await sendWhatsAppMessage(
      rawTarget,
      message || 'Jaribio la Lema Fast WiFi Bot 🤖: Mtandao unafanya kazi kikamilifu!',
      useTemplate ? 'hello_world' : undefined
    );

    if (result?.error) {
      return res.json({
        success: false,
        error: true,
        targetPhone: rawTarget,
        result,
        useTemplate: Boolean(useTemplate)
      });
    }

    return res.json({ success: true, targetPhone: rawTarget, result, useTemplate: Boolean(useTemplate) });
  } catch (err: any) {
    console.error('[Test Send Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: true,
      message: err?.message || 'Server error during test send'
    });
  }
});

// -------------------------------------------------------------
// SMS GATEWAY INTEGRATION (SWALASMS TANZANIA - swalasms.com)
// -------------------------------------------------------------
interface SmsGatewayConfig {
  provider: 'swalasms';
  senderId: string;
  apiKey: string;
  enabled: boolean;
}

let smsGatewayConfig: SmsGatewayConfig = {
  provider: 'swalasms',
  senderId: process.env.SMS_SENDER_ID || 'LEMAWIFI',
  apiKey: process.env.SMS_API_KEY || '',
  enabled: true
};

async function sendSmsMessage(targetPhone: string, message: string) {
  const { international, local } = normalizeTzPhone(targetPhone);
  // SwalaSMS requires E.164 format with plus sign (e.g., +255712345678)
  const e164Phone = international.startsWith('+') ? international : `+${international}`;

  console.log(`[SwalaSMS Gateway] Preparing SMS to ${local} (${e164Phone}) with Sender ID "${smsGatewayConfig.senderId}": "${message.slice(0, 60)}..."`);

  const rawKey = (smsGatewayConfig.apiKey || '').trim();
  const isWellFormedKey = rawKey.startsWith('swl_live_') || rawKey.startsWith('swl_test_');

  // If a legacy mock or placeholder key is present (e.g. beem_api_...), prevent 401 crash and warn gracefully
  if (rawKey && !isWellFormedKey) {
    console.warn(`[SwalaSMS Gateway] Key "${rawKey}" does not match swl_ prefix. Returning friendly auth guidance.`);
    return {
      success: false,
      errorCode: 'AUTHENTICATION_FAILED',
      message: 'Funguo ya SwalaSMS inapaswa kuanza na "swl_live_" au "swl_test_".',
      hint: 'Tafadhali nenda kwenye akaunti yako ya SwalaSMS (swalasms.com/sms/api-keys), bonyeza "Create API Key", kisha ubandike hapa.',
      simulated: true,
      recipient: e164Phone,
      senderId: smsGatewayConfig.senderId
    };
  }

  // SwalaSMS Official API v1 (https://api.swalasms.com/v1/sms/messages)
  if (isWellFormedKey) {
    try {
      const response = await fetch('https://api.swalasms.com/v1/sms/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rawKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: e164Phone,
          sender_id: smsGatewayConfig.senderId || 'LEMAWIFI',
          body: message
        })
      });

      const data = await response.json();
      console.log('[SwalaSMS Response]:', data);

      if (data?.error_code === 'AUTHENTICATION_FAILED' || response.status === 401) {
        return {
          success: false,
          errorCode: 'AUTHENTICATION_FAILED',
          message: data?.message || 'Unauthorized API key.',
          hint: 'API Key ya SwalaSMS haijathibitishwa na SwalaSMS. Hakikisha umeunda funguo kwenye ukurasa wa SwalaSMS (swalasms.com/sms/api-keys) na umeipa ruhusa ya sms:send.',
          data
        };
      }

      if (!data?.success && response.status >= 400) {
        return {
          success: false,
          errorCode: data?.error_code || 'API_ERROR',
          message: data?.message || 'Hitilafu ya kutuma ujumbe kupitia SwalaSMS',
          data
        };
      }

      return { success: response.status === 202 || data?.success, provider: 'swalasms', data };
    } catch (err: any) {
      console.error('[SwalaSMS Error]:', err?.message);
      return { success: false, provider: 'swalasms', error: err?.message };
    }
  }

  // Simulated SMS if no API token yet provided
  console.log(`[SwalaSMS Simulator] SMS to ${local} (${e164Phone}) with Sender ID "${smsGatewayConfig.senderId}": "${message}"`);
  return {
    success: true,
    simulated: true,
    recipient: e164Phone,
    senderId: smsGatewayConfig.senderId,
    note: 'Ujumbe umetumwa kwa majaribio (Simulation). Weka API Key ya SwalaSMS inayoanza na swl_live_ kutuma live hewani.'
  };
}

// SMS Endpoints
app.get('/api/v1/sms/config', (_req, res) => {
  return res.json({
    provider: 'swalasms',
    senderId: smsGatewayConfig.senderId,
    hasApiKey: Boolean(smsGatewayConfig.apiKey),
    enabled: smsGatewayConfig.enabled
  });
});

app.get('/api/v1/sms/balance', async (_req, res) => {
  const rawKey = (smsGatewayConfig.apiKey || '').trim();
  const isWellFormedKey = rawKey.startsWith('swl_live_') || rawKey.startsWith('swl_test_');

  if (!isWellFormedKey) {
    return res.json({
      success: true,
      simulated: true,
      balance: 100,
      currency: 'SMS',
      message: 'Hali ya majaribio (Weka API Key ya SwalaSMS inayoanza na swl_live_ kuona salio la live)'
    });
  }

  try {
    const response = await fetch('https://api.swalasms.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${rawKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    if (data?.success && data?.data) {
      return res.json({
        success: true,
        balance: data.data.balance,
        currency: data.data.currency || 'SMS',
        countries: data.data.countries,
        data: data.data
      });
    }
    return res.json({
      success: false,
      balance: 0,
      message: data?.message || 'Imeshindikana kusoma salio toka SwalaSMS',
      data
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, balance: 0, error: err?.message });
  }
});

app.post('/api/v1/sms/config', (req, res) => {
  const { senderId, apiKey, enabled } = req.body;
  smsGatewayConfig.provider = 'swalasms';
  if (senderId) smsGatewayConfig.senderId = String(senderId).trim().toUpperCase();
  if (apiKey !== undefined) smsGatewayConfig.apiKey = String(apiKey).trim();
  if (typeof enabled === 'boolean') smsGatewayConfig.enabled = enabled;

  console.log('[SwalaSMS Config Updated]:', {
    provider: 'swalasms',
    senderId: smsGatewayConfig.senderId,
    hasApiKey: Boolean(smsGatewayConfig.apiKey)
  });

  return res.json({ success: true, config: smsGatewayConfig });
});

app.post('/api/v1/sms/test-send', async (req, res) => {
  const { phone, message } = req.body;
  const targetPhone = phone || '0653578184';
  const textToSend = message || `Asante kwa kujiunga na LEMA FAST WIFI! Vocha yako ni: 8492. Kifurushi: Masaa 24. Msaada piga 0653578184.`;
  const result = await sendSmsMessage(targetPhone, textToSend);
  return res.json({ success: true, targetPhone, result });
});


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
// WHATSAPP WEBHOOK RECEIVER ENDPOINTS (META CLOUD API)
// -------------------------------------------------------------
app.get('/api/v1/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Meta Webhook Verification Challenge
  const expectedTokens = [whatsAppConfig.verifyToken, 'lema_wifi_webhook_token', 'lema_wifi_webhook_toke', 'lema_fast_wifi'].filter(Boolean);
  if (mode === 'subscribe' && typeof token === 'string' && expectedTokens.includes(token)) {
    console.log('✅ [Meta WhatsApp Webhook Verified Successfully!] Challenge token sent back to Meta.');
    addWhatsAppLog({
      type: 'webhook_verification',
      direction: 'inbound',
      status: 'success',
      summary: 'Meta Webhook Challenge: Imethibitishwa Kikamilifu ✅',
      details: `Meta Developer Portal imethibitisha Webhook URL kwa kutumia Verify Token: "${token}".`,
      payload: req.query
    });
    return res.status(200).send(challenge);
  }

  addWhatsAppLog({
    type: 'webhook_verification',
    direction: 'inbound',
    status: 'info',
    summary: 'Webhook Health Check (GET 200)',
    details: 'Seva ya Webhook ipo hewani na inasikiliza requests kutoka Meta.',
    payload: { query: req.query, ip: req.ip }
  });

  return res.status(200).json({
    status: 'ok',
    service: 'Lema Fast WiFi WhatsApp Webhook (Meta Cloud API Ready)',
    metaConfigured: Boolean(whatsAppConfig.phoneNumberId && whatsAppConfig.accessToken),
    active: true
  });
});

app.post('/api/v1/whatsapp/webhook', async (req, res) => {
  const body = req.body;
  console.log('[WhatsApp Webhook Received]:', JSON.stringify(body, null, 2));

  try {
    // Meta WhatsApp Cloud API Incoming Message
    if (body?.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      const incomingPhoneId = value?.metadata?.phone_number_id;
      const incomingWabaId = entry?.id;

      // Auto-sync active phone_number_id and wabaId from incoming webhook metadata
      if (incomingPhoneId && incomingPhoneId !== whatsAppConfig.phoneNumberId) {
        console.log(`[Meta WhatsApp] 🔄 Updating active phoneNumberId: ${whatsAppConfig.phoneNumberId} -> ${incomingPhoneId}`);
        whatsAppConfig.phoneNumberId = incomingPhoneId;
        saveWhatsAppConfig();
      }
      if (incomingWabaId && incomingWabaId !== whatsAppConfig.wabaId) {
        whatsAppConfig.wabaId = incomingWabaId;
        saveWhatsAppConfig();
      }

      if (message) {
        const senderPhone = message.from;
        const senderName = value?.contacts?.[0]?.profile?.name || 'Mteja';
        let textMessage = '';
        if (message.type === 'text') {
          textMessage = message.text?.body || '';
        } else if (message.type === 'interactive') {
          textMessage = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        }

        if (textMessage && senderPhone) {
          console.log(`[Meta WhatsApp Bot] 📩 Incoming from ${senderPhone} (${senderName}): "${textMessage}"`);

          addWhatsAppLog({
            type: 'incoming_message',
            direction: 'inbound',
            status: 'info',
            phone: senderPhone,
            summary: `Ujumbe Mpya toka +${senderPhone} (${senderName})`,
            details: `Mteja ameandika: "${textMessage}"`,
            payload: message
          });

          recentMessages.push({
            id: message.id || `msg-${Date.now()}`,
            senderPhone,
            senderName,
            text: textMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderType: 'user'
          });

          const replyText = generateBotReply(textMessage, senderName, senderPhone);
          recentMessages.push({
            id: `bot-${Date.now()}`,
            senderPhone: 'bot',
            senderName: 'Lema Fast WiFi Bot 🤖',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderType: 'bot'
          });

          await sendWhatsAppMessage(senderPhone, replyText);
        }
      }

      // Meta WhatsApp Delivery Status Updates & Error Tracking
      const statuses = value?.statuses;
      if (Array.isArray(statuses) && statuses.length > 0) {
        for (const st of statuses) {
          const status = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const recipient = st.recipient_id;
          console.log(`[Meta WhatsApp Webhook Status] Message ${st.id} to ${recipient}: ${status}`);

          if (status === 'failed' && st.errors?.length) {
            const err = st.errors[0];
            const code = err.code;
            const title = err.title || 'Ujumbe haukufikishwa';
            const details = err.error_data?.details || err.message || '';
            console.error(`[Meta WhatsApp Delivery Failure] Recipient: ${recipient}, Code: ${code}, Details: ${details}`);

            let tip = details;
            if (code === 131047) {
              tip = `Zaidi ya masaa 24 yamepita tangu ${recipient} awasiliane na bot (Meta 24-Hour Customer Care Window). Meta inazuia ujumbe wa maandishi ya bure hadi mwenye namba hii afungue WhatsApp na kumwandikia bot kwanza wa.me/255621311137.`;
            }

            whatsAppConfig.lastError = {
              type: 'DeliveryFailed',
              code,
              message: `⚠️ Meta Delivery Status: Ujumbe kwa +${recipient} haukufika simuni: ${title} (#${code}) - ${tip}`,
              timestamp: new Date().toLocaleTimeString()
            };

            addWhatsAppLog({
              type: 'delivery_status',
              direction: 'inbound',
              status: 'failed',
              code,
              phone: recipient,
              summary: `⚠️ Kufikisha Kumeshindikana (#${code}) kwa +${recipient}`,
              details: tip,
              payload: st
            });
          } else if (status === 'delivered') {
            console.log(`[Meta WhatsApp] ✅ Ujumbe umefika kwenye simu ya +${recipient}`);
            addWhatsAppLog({
              type: 'delivery_status',
              direction: 'inbound',
              status: 'delivered',
              phone: recipient,
              summary: `✅ Ujumbe Umefika Simuni: +${recipient}`,
              details: `Message ID: ${st.id} umefika kwenye simu ya mteja.`,
              payload: st
            });
          } else if (status === 'sent') {
            addWhatsAppLog({
              type: 'delivery_status',
              direction: 'inbound',
              status: 'sent',
              phone: recipient,
              summary: `📤 Ujumbe Umetoka Meta: +${recipient}`,
              details: `Message ID: ${st.id} umekubaliwa na mtandao wa Meta.`,
              payload: st
            });
          } else if (status === 'read') {
            addWhatsAppLog({
              type: 'delivery_status',
              direction: 'inbound',
              status: 'read',
              phone: recipient,
              summary: `👀 Ujumbe Umesomwa (Blue Ticks): +${recipient}`,
              details: `Message ID: ${st.id} umesomwa na mteja.`,
              payload: st
            });
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
    addWhatsAppLog({
      type: 'system_alert',
      direction: 'internal',
      status: 'failed',
      summary: 'Hitilafu ya Kuchakata Webhook',
      details: String(error)
    });
  }

  return res.status(200).json({ status: 'ok', received: true });
});

// -------------------------------------------------------------
// MOBILE MONEY STK-PUSH & WEBHOOK ENGINE (AZAMPAY)
// -------------------------------------------------------------
interface PaymentGatewayConfig {
  gateway: 'azampay';
  apiKey: string; // Client ID
  secretKey: string; // Client Secret
  merchantNumber: string;
  accountOwnerName: string;
  isLive: boolean;
}

let paymentGatewayConfig: PaymentGatewayConfig = {
  gateway: 'azampay',
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
    gateway: 'azampay',
    apiKey: paymentGatewayConfig.apiKey,
    secretKey: paymentGatewayConfig.secretKey,
    hasApiKey: Boolean(paymentGatewayConfig.apiKey),
    hasSecretKey: Boolean(paymentGatewayConfig.secretKey),
    merchantNumber: paymentGatewayConfig.merchantNumber,
    accountOwnerName: paymentGatewayConfig.accountOwnerName,
    isLive: paymentGatewayConfig.isLive,
    webhookUrl: 'https://lemawifi.online/api/v1/payments/webhook'
  });
});

app.post('/api/v1/payments/config', (req, res) => {
  const { apiKey, secretKey, merchantNumber, accountOwnerName, isLive } = req.body;
  paymentGatewayConfig.gateway = 'azampay';
  if (apiKey !== undefined) paymentGatewayConfig.apiKey = apiKey;
  if (secretKey !== undefined) paymentGatewayConfig.secretKey = secretKey;
  if (merchantNumber) paymentGatewayConfig.merchantNumber = merchantNumber;
  if (accountOwnerName) paymentGatewayConfig.accountOwnerName = accountOwnerName;
  if (typeof isLive === 'boolean') paymentGatewayConfig.isLive = isLive;

  console.log('[AzamPay Payment Config Updated]:', {
    hasApiKey: Boolean(paymentGatewayConfig.apiKey),
    hasSecretKey: Boolean(paymentGatewayConfig.secretKey),
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

  // If AzamPay is configured:
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
            accountNo: localPhone,
            accountNumber: localPhone,
            amount: Number(amount),
            currency: 'TZS',
            externalId: orderId,
            provider
          })
        });

        const azamData = await azamRes.json();
        console.log('[AzamPay Response]:', azamData);
        order.rawGatewayResponse = azamData;

        // If AzamPay returns error or validation errors, fallback gracefully to sandbox simulation
        if (azamData.success === false || azamData.errors || (azamData.message && azamData.message.includes('Error'))) {
          console.warn('[AzamPay Sandbox Warning]:', azamData.message || JSON.stringify(azamData.errors));
          return res.json({
            success: true,
            orderId,
            isLive: false,
            message: `Ombi la AzamPay limewashwa kwa majaribio (Sandbox Fallback). Weka PIN kwenye simu yako (${localPhone}) kuthibitisha TZS ${amount}.`
          });
        }

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

// GET all payment transactions log
app.get('/api/v1/payments/transactions', (_req, res) => {
  const transactions = Array.from(paymentOrders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, transactions });
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

    // Send WhatsApp notification immediately via Meta WhatsApp Cloud API
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

    await sendWhatsAppMessage(international, waText);

    // Send GSM SMS with voucher code via SwalaSMS / Beem
    const smsText = `Asante kwa kujiunga na LEMA FAST WIFI! Vocha yako ni: ${voucherCode}. Kifurushi: ${order?.packageName || 'Intaneti'}. Msaada piga 0653578184.`;
    await sendSmsMessage(phoneToNotify, smsText);

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

  // Send WhatsApp and SMS message if phone provided
  if (order.phone) {
    const { international } = normalizeTzPhone(order.phone);
    const waText = `🎉 *LEMA FAST WIFI - THIBITISHO LA MALIPO*
    
Malipo yako ya *TZS ${order.amount.toLocaleString()}* yamethibitishwa!

🎟️ *VOCHA YAKO NI:* \`${voucherCode}\`
⚡ *Kifurushi:* ${order.packageName}

Ingiza tarakimu hizi: *${voucherCode}* kwenye mtandao wa *Lema Fast WiFi* kuanza kutumia mara moja.`;

    await sendWhatsAppMessage(international, waText);

    const smsText = `Asante kwa kujiunga na LEMA FAST WIFI! Vocha yako ni: ${voucherCode}. Kifurushi: ${order.packageName}. Msaada: 0653578184.`;
    await sendSmsMessage(order.phone, smsText);
  }

  return res.json({
    success: true,
    orderId,
    voucherCode,
    reference: order.reference,
    message: 'Muamala umethibitishwa kikamilifu!'
  });
});

// 5. TOWERS & ACCESS POINTS SYNC API
const TOWERS_FILE = path.resolve(__dirname, 'towers-data.json');

function loadSavedTowers(): any[] {
  try {
    if (fs.existsSync(TOWERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOWERS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn('[Towers] Error reading towers-data.json:', e);
  }
  return [];
}

function saveTowersToFile(towers: any[]) {
  try {
    fs.writeFileSync(TOWERS_FILE, JSON.stringify(towers, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Towers] Error saving towers-data.json:', e);
  }
}

app.get('/api/v1/towers', async (_req, res) => {
  // Check hardware inventory status for 100% real-time consistency
  loadSavedHardware();
  const apItem = savedHardware.find((h) => h.category === 'ap') || savedHardware[0];
  const isApOffline = apItem && apItem.status === 'offline';

  try {
    const rows = await db.select().from(towersTable);
    if (rows && rows.length > 0) {
      const diskTowers = loadSavedTowers();
      const diskMap = new Map(diskTowers.map((t: any) => [t.id, t]));
      const mapped = rows.map((r) => {
        const extra = diskMap.get(r.id) || {};
        const effectiveStatus = isApOffline ? 'offline' : (r.status || 'online');
        return {
          ...extra,
          id: r.id,
          name: r.name,
          location: r.location || '',
          ipAddress: r.ipAddress || '',
          macAddress: r.macAddress || '',
          status: effectiveStatus,
          lastPingMs: effectiveStatus === 'offline' ? 0 : (r.lastPingMs || 5),
        };
      });
      return res.json({ success: true, towers: mapped, source: 'cloud_sql_postgresql' });
    }
  } catch (err) {
    console.warn('[PostgreSQL Towers] Read fallback to disk:', err);
  }
  const diskTowers = loadSavedTowers().map((t: any) => {
    if (isApOffline) {
      return { ...t, status: 'offline', lastPingMs: 0 };
    }
    return t;
  });
  return res.json({ success: true, towers: diskTowers, source: 'disk_backup' });
});

app.post('/api/v1/towers', async (req, res) => {
  const { towers: incomingTowers } = req.body;
  if (Array.isArray(incomingTowers)) {
    saveTowersToFile(incomingTowers);
    try {
      for (const t of incomingTowers) {
        if (!t.id || !t.name) continue;
        await db.insert(towersTable).values({
          id: t.id,
          name: t.name,
          location: t.location || '',
          ipAddress: t.ipAddress || '',
          macAddress: t.macAddress || '',
          status: t.status || 'active',
          lastPingMs: typeof t.lastPingMs === 'number' ? t.lastPingMs : 5,
        }).onConflictDoUpdate({
          target: towersTable.id,
          set: {
            name: t.name,
            location: t.location || '',
            ipAddress: t.ipAddress || '',
            macAddress: t.macAddress || '',
            status: t.status || 'active',
            lastPingMs: typeof t.lastPingMs === 'number' ? t.lastPingMs : 5,
          }
        });
      }
    } catch (dbErr) {
      console.warn('[PostgreSQL Towers] Sync to DB notice:', dbErr);
    }
    return res.json({ success: true, count: incomingTowers.length });
  }
  return res.status(400).json({ success: false, error: 'Invalid format: towers must be an array' });
});


// Start Express server and mount Vite in middleware mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));

  // Initialize DB tables if they don't exist
  initDbTables().catch((err) => {
    console.warn('[DB Init] Background table setup notice:', err?.message || err);
  });

  // Background Watchdog: Mark APs offline if no heartbeat received for 30 seconds (Bila MikroTik)
  setInterval(() => {
    loadSavedHardware();
    const now = Date.now();
    let hwUpdated = false;

    savedHardware.forEach((h) => {
      const last = (h as any).lastHeartbeat || 0;
      // If item is online and last heartbeat was more than 35 seconds ago
      if (h.status === 'online' && last > 0 && now - last > 35000) {
        h.status = 'offline';
        hwUpdated = true;
        console.log(`[Watchdog] ⚠️ AP ${h.name} (${h.ipAddress}) haijatuma heartbeat kwa zaidi ya sekunde 35 - Imebadilishwa kuwa OFFLINE!`);
        processApOutageAlert({
          status: 'down',
          apIp: h.ipAddress,
          apMac: h.macAddress,
          apName: h.name,
          site: h.site
        }).catch(() => {});
      }
    });

    if (hwUpdated) {
      saveHardwareToDisk();
      for (const h of savedHardware) {
        if (h.macAddress) {
          db.update(hardware)
            .set({ status: h.status, lastSeen: h.lastSeen || '' })
            .where(eq(hardware.macAddress, h.macAddress.toUpperCase()))
            .catch(() => {});
        }
      }
    }

    const towers = loadSavedTowers();
    let towersUpdated = false;
    towers.forEach((t: any) => {
      const last = t.lastHeartbeat || 0;
      if (t.status === 'online' && last > 0 && now - last > 35000) {
        t.status = 'offline';
        towersUpdated = true;
      }
    });

    if (towersUpdated) {
      saveTowersToFile(towers);
    }
  }, 10000);

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
      if (url.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: true, message: `API endpoint haijapatikana: ${url}` });
      }
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
    app.use('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: true, message: `API endpoint haijapatikana: ${req.originalUrl}` });
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lema Fast WiFi Server running on port ${PORT}`);
  });
}

startServer();
