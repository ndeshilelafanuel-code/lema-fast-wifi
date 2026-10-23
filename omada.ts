import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

export interface OmadaAuthParams {
  clientMac: string;
  apMac: string;
  ssidName: string;
  radioId: number | string;
  clientIp?: string;
  durationMs: number;
  downKbps?: number;
  upKbps?: number;
}

export interface OmadaConfig {
  omadaUrl: string;
  controllerId: string;
  operatorUser: string;
  operatorPass: string;
  strictTls: boolean;
}

const CONFIG_FILE = path.resolve(process.cwd(), 'omada-config.json');

// In-memory config initialized from disk and environment variables
let currentConfig: OmadaConfig = loadInitialConfig();

function loadInitialConfig(): OmadaConfig {
  let disk: Partial<OmadaConfig> = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      disk = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (err: any) {
    console.warn('[Omada] Could not load omada-config.json:', err.message);
  }

  return {
    omadaUrl: (disk.omadaUrl || process.env.OMADA_URL || '').trim().replace(/\/$/, ''),
    controllerId: (disk.controllerId || process.env.OMADA_ID || '').trim(),
    operatorUser: (disk.operatorUser || process.env.OMADA_OPERATOR || '').trim(),
    operatorPass: (disk.operatorPass || process.env.OMADA_OPERATOR_PASSWORD || '').trim(),
    strictTls: disk.strictTls !== undefined ? Boolean(disk.strictTls) : process.env.OMADA_STRICT_TLS === '1',
  };
}

export function getOmadaConfig(): OmadaConfig {
  return { ...currentConfig };
}

export function updateOmadaConfig(patch: Partial<OmadaConfig>): OmadaConfig {
  currentConfig = {
    ...currentConfig,
    ...patch,
  };
  if (currentConfig.omadaUrl) {
    currentConfig.omadaUrl = currentConfig.omadaUrl.trim().replace(/\/$/, '');
  }
  if (currentConfig.controllerId) {
    currentConfig.controllerId = currentConfig.controllerId.trim();
  }

  // Update process.env for compatibility with existing references
  if (currentConfig.omadaUrl) process.env.OMADA_URL = currentConfig.omadaUrl;
  if (currentConfig.controllerId) process.env.OMADA_ID = currentConfig.controllerId;
  if (currentConfig.operatorUser) process.env.OMADA_OPERATOR = currentConfig.operatorUser;
  if (currentConfig.operatorPass) process.env.OMADA_OPERATOR_PASSWORD = currentConfig.operatorPass;

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log('[Omada] Updated omada-config.json successfully.');
  } catch (err: any) {
    console.warn('[Omada] Failed to persist omada-config.json:', err.message);
  }

  // Reset current session so next request authenticates with new config
  cookie = '';
  csrf = '';
  loggedAt = 0;

  return { ...currentConfig };
}

let cookie = '';
let csrf = '';
let loggedAt = 0;

interface CallResponse {
  json: any;
  raw: string;
  setCookie: string[];
  statusCode?: number;
  headers: Record<string, string | string[] | undefined>;
}

function call(method: string, reqPath: string, body?: any, extra: Record<string, string> = {}): Promise<CallResponse> {
  return new Promise((resolve, reject) => {
    const base = currentConfig.omadaUrl;
    if (!base) {
      return reject(new Error('OMADA_URL haijawekwa kwenye mfumo. Weka anwani ya Omada Controller au Ngrok kwenye Mipangilio.'));
    }

    let u: URL;
    try {
      u = new URL(base + reqPath);
    } catch (e: any) {
      return reject(new Error(`Anwani ya OMADA_URL si sahihi (${base}): ${e.message}`));
    }

    const isHttps = u.protocol === 'https:';
    const client = isHttps ? https : http;
    const agent = isHttps
      ? new https.Agent({ rejectUnauthorized: currentConfig.strictTls })
      : undefined;

    const data = body ? JSON.stringify(body) : undefined;
    const req = client.request(
      {
        method,
        agent,
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + u.search,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'ngrok-skip-browser-warning': '1', // Bypass ngrok free warning interstitial
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LemaFastWiFi/1.0',
          ...(cookie ? { 'Cookie': cookie } : {}),
          ...extra,
          ...(data ? { 'Content-Length': String(Buffer.byteLength(data)) } : {}),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let json: any = {};
          try {
            json = JSON.parse(buf);
          } catch {
            json = { raw: buf };
          }
          resolve({
            json,
            raw: buf,
            setCookie: (res.headers['set-cookie'] as string[]) || [],
            statusCode: res.statusCode,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', (err) => {
      reject(new Error(`Hitilafu ya mtandao na Omada Controller (${u.hostname}): ${err.message}`));
    });

    req.setTimeout(12000, () => {
      req.destroy(new Error('Omada Controller imechelewa kujibu (Timeout ya sekunde 12)'));
    });

    if (data) req.write(data);
    req.end();
  });
}

/**
 * Extract 32-character hex ID (e.g., 41c8d50bf6d2466f97ef709d02008b8b) from strings
 */
function extractHexId(text: string): string | null {
  if (!text) return null;
  // Match 32 continuous hex characters
  const m = text.match(/[0-9a-fA-F]{32}/);
  return m ? m[0].toLowerCase() : null;
}

/**
 * Attempt to automatically detect OMADA_ID (omadacId) from multiple Controller endpoints
 */
export async function resolveControllerId(): Promise<string> {
  if (currentConfig.controllerId && extractHexId(currentConfig.controllerId)) {
    return currentConfig.controllerId;
  }

  console.log('[Omada] Inaanza kutafuta OMADA_ID kiotomatiki kutoka kwenye Controller...');

  // 1. Try GET /api/info (Official TP-Link Omada Controller discovery endpoint)
  try {
    const res = await call('GET', '/api/info');
    const resultObj = res.json?.result || res.json || {};
    // Note: Omada v5/v6 uses omadacId (lowercase c) or controllerId
    const foundId =
      resultObj.omadacId ||
      resultObj.omadaCId ||
      resultObj.controllerId ||
      resultObj.omadaId ||
      resultObj.id ||
      extractHexId(res.raw);

    if (foundId && extractHexId(String(foundId))) {
      const resolved = extractHexId(String(foundId))!;
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka /api/info: ${resolved}`);
      updateOmadaConfig({ controllerId: resolved });
      return resolved;
    }
  } catch (err: any) {
    console.warn('[Omada] /api/info notice:', err.message);
  }

  // 2. Try GET / (Omada root redirects to /<omadacId>/login)
  try {
    const res = await call('GET', '/');
    const locHeader = String(res.headers.location || '');
    const headerId = extractHexId(locHeader);
    if (headerId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka Location redirect header: ${headerId}`);
      updateOmadaConfig({ controllerId: headerId });
      return headerId;
    }

    const bodyId = extractHexId(res.raw);
    if (bodyId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka kwenye ukurasa wa mzizi (/): ${bodyId}`);
      updateOmadaConfig({ controllerId: bodyId });
      return bodyId;
    }
  } catch (err: any) {
    console.warn('[Omada] GET / notice:', err.message);
  }

  // 3. Try GET /login
  try {
    const res = await call('GET', '/login');
    const locHeader = String(res.headers.location || '');
    const headerId = extractHexId(locHeader);
    if (headerId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka /login redirect: ${headerId}`);
      updateOmadaConfig({ controllerId: headerId });
      return headerId;
    }

    const bodyId = extractHexId(res.raw);
    if (bodyId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka ukurasa wa /login: ${bodyId}`);
      updateOmadaConfig({ controllerId: bodyId });
      return bodyId;
    }
  } catch (err: any) {
    console.warn('[Omada] GET /login notice:', err.message);
  }

  throw new Error(
    'OMADA_ID haikuweza kupatikana kiotomatiki. Tafadhali fungua Omada Controller kwenye browser yako (k.m. https://127.0.0.1:8043/), nakili herufi 32 zilizopo kwenye URL (https://...:8043/[HERUFI_32]/login) na ubandike kwenye Mipangilio ya Dashboard.'
  );
}

/**
 * Log in to Omada Controller as Hotspot Operator
 * Route in Omada Controller v5.x / v6.x: POST /<controllerId>/api/v2/hotspot/login
 */
export async function omadaLogin(): Promise<{ csrf: string; cookie: string }> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser || !currentConfig.operatorPass) {
    throw new Error(
      'Mipangilio ya Omada (OMADA_URL, OMADA_OPERATOR, OMADA_OPERATOR_PASSWORD) haijakamilika kwenye mfumo.'
    );
  }

  const id = await resolveControllerId();

  cookie = '';
  csrf = '';
  console.log(`[Omada Controller] Logging in as Operator "${currentConfig.operatorUser}" to controller ${id}...`);

  const r = await call('POST', `/${id}/api/v2/hotspot/login`, {
    name: currentConfig.operatorUser,
    password: currentConfig.operatorPass,
  });

  if (r.json?.errorCode !== 0) {
    const msg = r.json?.msg || r.json?.message || (r.raw ? r.raw.slice(0, 120) : 'Unknown error');
    throw new Error(`Omada login imeshindikana (Kosa ${r.json?.errorCode || r.statusCode}): ${msg}`);
  }

  csrf = r.json?.result?.token || '';
  const cookiesList = r.setCookie || [];
  cookie = cookiesList.map((c) => c.split(';')[0]).join('; ');
  loggedAt = Date.now();

  console.log('[Omada Controller] ✅ Login successful! Operator session active.');
  return { csrf, cookie };
}

/**
 * Standardize MAC addresses to hyphenated uppercase (e.g. AA-BB-CC-DD-EE-FF) as expected by Omada
 */
function formatMac(m: string): string {
  const raw = (m || '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (raw.length === 12) {
    return raw.match(/.{1,2}/g)!.join('-');
  }
  return (m || '').trim().toUpperCase();
}

/**
 * Authorize client device on Omada Controller (External Portal)
 * Route in Omada Controller v5.x / v6.x: POST /<controllerId>/api/v2/hotspot/extPortal/auth
 */
export async function omadaAuthorize(p: OmadaAuthParams) {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    throw new Error('Mipangilio ya Omada Controller (OMADA_URL, OMADA_OPERATOR) haijakamilika.');
  }

  const id = await resolveControllerId();
  const clientMacFormatted = formatMac(p.clientMac);
  const apMacFormatted = formatMac(p.apMac);

  const send = () =>
    call(
      'POST',
      `/${id}/api/v2/hotspot/extPortal/auth`,
      {
        clientMac: clientMacFormatted,
        clientIp: p.clientIp || '',
        apMac: apMacFormatted,
        ssidName: p.ssidName || 'Lema Fast WiFi',
        radioId: Number(p.radioId) || 0,
        time: Math.round(p.durationMs), // Duration in milliseconds
        authType: 4, // External Portal Authentication
        originUrl: '',
        totalTrafficLimitBytes: 0,
        downloadRateLimitKbps: p.downKbps || 0,
        uploadRateLimitKbps: p.upKbps || 0,
      },
      { 'Csrf-Token': csrf }
    );

  // If not logged in or session older than 15 minutes, perform fresh login
  if (!cookie || !csrf || Date.now() - loggedAt > 15 * 60 * 1000) {
    await omadaLogin();
  }

  let r = await send();

  // If authorization returned session expiration or token error, attempt re-login once and retry
  if (r.json?.errorCode !== 0 || r.statusCode === 401 || r.statusCode === 403) {
    console.log(
      `[Omada Controller] First auth attempt returned errorCode: ${r.json?.errorCode} (HTTP ${r.statusCode}), re-authenticating operator session...`
    );
    try {
      await omadaLogin();
      r = await send();
    } catch (reLoginErr: any) {
      console.warn('[Omada Controller] Re-login attempt failed:', reLoginErr.message);
    }
  }

  if (r.json?.errorCode !== 0) {
    throw new Error(
      `Omada auth imeshindikana (Error ${r.json?.errorCode}): ${r.json?.msg || r.json?.message || JSON.stringify(r.json)}`
    );
  }

  console.log(
    `[Omada Controller] ✅ Client ${clientMacFormatted} authorized on AP ${apMacFormatted} for ${Math.round(p.durationMs / 60000)} minutes!`
  );
  return r.json;
}

/**
 * Comprehensive connectivity check and operator test
 */
export async function testOmadaConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const id = await resolveControllerId();
    const loginRes = await omadaLogin();
    return {
      success: true,
      message: `Muunganisho umefanikiwa kikamilifu! Controller ID "${id}" inafanya kazi na Operator "${currentConfig.operatorUser}" ameingia kwa ufanisi.`,
      details: {
        controllerId: id,
        operatorUser: currentConfig.operatorUser,
        tokenReceived: Boolean(loginRes.csrf),
        cookieReceived: Boolean(loginRes.cookie),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
      details: {
        currentUrl: currentConfig.omadaUrl,
        operatorUser: currentConfig.operatorUser,
        controllerId: currentConfig.controllerId || '(Haijawekwa)',
      },
    };
  }
}
