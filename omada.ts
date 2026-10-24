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
  siteId?: string;
  customUnauthEndpoint?: string;
  slidingLeaseEnabled?: boolean;
  slidingLeaseMinutes?: number;
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
    siteId: (disk.siteId || process.env.OMADA_SITE_ID || 'Default').trim(),
    customUnauthEndpoint: (disk.customUnauthEndpoint || process.env.OMADA_CUSTOM_UNAUTH_ENDPOINT || '').trim(),
    slidingLeaseEnabled: disk.slidingLeaseEnabled !== undefined ? Boolean(disk.slidingLeaseEnabled) : process.env.OMADA_SLIDING_LEASE === '1',
    slidingLeaseMinutes: Number(disk.slidingLeaseMinutes) || 10,
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

export interface OmadaUnauthOptions {
  apMac?: string;
  ssidName?: string;
  radioId?: number | string;
}

/**
 * Unauthorize (disconnect) client device from Omada Controller
 * Uses multi-tier strategy:
 * 1. Immediate Expiration via extPortal/auth (time: 1ms) -> clears authorization cache in Omada Gateway/EAP
 * 2. Dedicated unauth endpoints (extPortal/unauth, hotspot/guests/unauth)
 * 3. 802.11 Deauthentication via site client cmd reconnect/kick (drops station from AP immediately)
 */
export async function omadaUnauthorize(
  clientMac: string,
  options?: OmadaUnauthOptions
): Promise<{ success: boolean; message: string; details?: any; omadaConfirmed?: boolean }> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    return {
      success: false,
      omadaConfirmed: false,
      message: 'OMADA_URL au OMADA_OPERATOR haijawekwa kwenye mfumo.'
    };
  }

  const clientMacFormatted = formatMac(clientMac);
  const apMacFormatted = formatMac(options?.apMac || '');
  console.log(`[Omada Controller] 🛑 Inaanza kukata intaneti na kufuta idhini ya kifaa ${clientMacFormatted} (AP: ${apMacFormatted || 'Yoyote'})...`);

  try {
    const id = await resolveControllerId();

    if (!cookie || !csrf || Date.now() - loggedAt > 15 * 60 * 1000) {
      await omadaLogin();
    }

    const results: Record<string, any> = {};

    // -------------------------------------------------------------
    // STRATEGY 0: Custom Endpoint captured via DevTools (F12)
    // -------------------------------------------------------------
    if (currentConfig.customUnauthEndpoint && currentConfig.customUnauthEndpoint.trim()) {
      try {
        let ep = currentConfig.customUnauthEndpoint.trim();
        const site = currentConfig.siteId || 'Default';
        ep = ep
          .replace('{id}', id)
          .replace('{controllerId}', id)
          .replace('{mac}', clientMacFormatted)
          .replace('{site}', site)
          .replace('{siteId}', site);

        if (!ep.startsWith('/')) ep = '/' + ep;
        if (!ep.startsWith(`/${id}`)) {
          ep = `/${id}` + (ep.startsWith('/') ? ep : `/${ep}`);
        }

        const customRes = await call(
          'POST',
          ep,
          {
            clientMac: clientMacFormatted,
            mac: clientMacFormatted,
            apMac: apMacFormatted,
          },
          { 'Csrf-Token': csrf }
        );
        results.customEndpoint = {
          endpoint: ep,
          statusCode: customRes.statusCode,
          errorCode: customRes.json?.errorCode,
          msg: customRes.json?.msg || customRes.json?.message
        };
        console.log(`[Omada Controller] Custom unauth endpoint result: errorCode=${customRes.json?.errorCode} (HTTP ${customRes.statusCode})`);
      } catch (ce: any) {
        results.customEndpoint = { error: ce.message };
      }
    }

    // -------------------------------------------------------------
    // STRATEGY 1: Official extPortal/auth expire lease (time: 0 / 1ms)
    // -------------------------------------------------------------
    try {
      const sendExpire = (timeVal: number) =>
        call(
          'POST',
          `/${id}/api/v2/hotspot/extPortal/auth`,
          {
            clientMac: clientMacFormatted,
            clientIp: '',
            apMac: apMacFormatted,
            ssidName: options?.ssidName || 'Lema Fast WiFi',
            radioId: Number(options?.radioId) || 0,
            time: timeVal,
            authType: 4,
            originUrl: '',
            totalTrafficLimitBytes: 0,
            downloadRateLimitKbps: 0,
            uploadRateLimitKbps: 0,
          },
          { 'Csrf-Token': csrf }
        );

      let r = await sendExpire(0);
      if (r.json?.errorCode !== 0) {
        r = await sendExpire(1);
      }
      if (r.json?.errorCode !== 0 && (r.statusCode === 401 || r.statusCode === 403)) {
        await omadaLogin();
        r = await sendExpire(0);
      }
      results.expireAuth = {
        statusCode: r.statusCode,
        errorCode: r.json?.errorCode,
        msg: r.json?.msg || r.json?.message
      };
      console.log(
        `[Omada Controller] ⏱️ Strategy 1 (extPortal/auth expire) result: errorCode=${r.json?.errorCode} (HTTP ${r.statusCode})`
      );
    } catch (e: any) {
      results.expireAuth = { error: e.message };
      console.warn('[Omada Controller] Strategy 1 notice:', e.message);
    }

    // -------------------------------------------------------------
    // STRATEGY 2: Legacy / Direct extPortal/unauth
    // -------------------------------------------------------------
    try {
      const sendUnauth = () =>
        call(
          'POST',
          `/${id}/api/v2/hotspot/extPortal/unauth`,
          { clientMac: clientMacFormatted, mac: clientMacFormatted },
          { 'Csrf-Token': csrf }
        );

      let r = await sendUnauth();
      if (r.json?.errorCode !== 0 && (r.statusCode === 401 || r.statusCode === 403)) {
        await omadaLogin();
        r = await sendUnauth();
      }
      results.extPortalUnauth = {
        statusCode: r.statusCode,
        errorCode: r.json?.errorCode,
        msg: r.json?.msg || r.json?.message
      };
    } catch (e: any) {
      results.extPortalUnauth = { error: e.message };
    }

    // -------------------------------------------------------------
    // STRATEGY 3: Hotspot Guests Unauth (/api/v2/hotspot/guests/unauth)
    // -------------------------------------------------------------
    try {
      const r = await call(
        'POST',
        `/${id}/api/v2/hotspot/guests/unauth`,
        { clientMac: clientMacFormatted, mac: clientMacFormatted },
        { 'Csrf-Token': csrf }
      );
      results.hotspotGuestsUnauth = {
        statusCode: r.statusCode,
        errorCode: r.json?.errorCode,
        msg: r.json?.msg || r.json?.message
      };
    } catch (e: any) {
      results.hotspotGuestsUnauth = { error: e.message };
    }

    // -------------------------------------------------------------
    // STRATEGY 4: Site-level client unauth & reconnect (Deauth 802.11)
    // -------------------------------------------------------------
    try {
      let siteIds: string[] = [];
      try {
        const sitesRes = await call('GET', `/${id}/api/v2/sites`, undefined, { 'Csrf-Token': csrf });
        const list = sitesRes.json?.result?.data || (Array.isArray(sitesRes.json?.result) ? sitesRes.json.result : []);
        if (Array.isArray(list)) {
          siteIds = list.map((s: any) => s.id || s.siteId).filter(Boolean);
        }
      } catch (e) {
        // Operator token might not have site listing access
      }

      if (currentConfig.siteId && !siteIds.includes(currentConfig.siteId)) {
        siteIds.unshift(currentConfig.siteId);
      }
      if (siteIds.length === 0) {
        siteIds = ['Default', 'default'];
      }

      for (const siteId of siteIds) {
        try {
          const uRes = await call(
            'POST',
            `/${id}/api/v2/hotspot/sites/${siteId}/cmd/clients/${clientMacFormatted}/unauth`,
            { clientMac: clientMacFormatted },
            { 'Csrf-Token': csrf }
          );
          if (uRes.json?.errorCode !== undefined) {
            results[`hotspot_sites_unauth_${siteId}`] = { errorCode: uRes.json?.errorCode, msg: uRes.json?.msg };
          }
        } catch (e: any) {}

        try {
          const r = await call(
            'POST',
            `/${id}/api/v2/sites/${siteId}/cmd/clients/${clientMacFormatted}/reconnect`,
            {},
            { 'Csrf-Token': csrf }
          );
          if (r.json?.errorCode !== undefined) {
            results[`reconnect_${siteId}`] = { errorCode: r.json?.errorCode, msg: r.json?.msg };
          }
        } catch (e: any) {}
      }
    } catch (e: any) {
      results.siteCmd = { error: e.message };
    }

    // Verify whether ANY strategy returned errorCode === 0
    const succeeded = Object.values(results).some(
      (res: any) => res && typeof res === 'object' && res.errorCode === 0
    );

    if (succeeded) {
      console.log(`[Omada Controller] ✅ Muunganisho wa ${clientMacFormatted} umekatwa kikamilifu kwenye Omada (errorCode: 0).`);
      return {
        success: true,
        omadaConfirmed: true,
        message: `Intaneti ya kifaa ${clientMacFormatted} imezimwa na idhini imefutwa kikamilifu kwenye Omada Controller (errorCode: 0).`,
        details: results
      };
    }

    console.warn(`[Omada Controller] ⚠️ Hakuna ombi lililorudisha errorCode === 0 kwa kifaa ${clientMacFormatted}:`, JSON.stringify(results));
    return {
      success: false,
      omadaConfirmed: false,
      message: `Omada Controller haikukata idhini ya kifaa ${clientMacFormatted}. Hakuna ombi lililorudisha errorCode: 0. Angalia tab ya Mipangilio ya Omada kuweka endpoint sahihi kutoka F12 Network tab.`,
      details: results
    };
  } catch (err: any) {
    console.error(`[Omada Controller] Hitilafu ya kukata intaneti kwa ${clientMacFormatted}:`, err.message);
    return {
      success: false,
      omadaConfirmed: false,
      message: `Hitilafu ya Omada Controller: ${err.message}`
    };
  }
}


/**
 * Block (Blacklist) client device on Omada Controller to physically drop and prevent reconnect
 */
export async function omadaBlockClient(
  clientMac: string,
  siteIdParam?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    return {
      success: false,
      message: 'OMADA_URL au OMADA_OPERATOR haijawekwa kwenye mfumo.'
    };
  }

  const clientMacFormatted = formatMac(clientMac);
  console.log(`[Omada Controller] 🚫 Kuzuia (Block/Blacklist) kifaa ${clientMacFormatted}...`);

  try {
    const id = await resolveControllerId();

    if (!cookie || !csrf || Date.now() - loggedAt > 15 * 60 * 1000) {
      await omadaLogin();
    }

    // Step 1: Unauthorize and kick first
    await omadaUnauthorize(clientMacFormatted);

    // Step 2: Call Omada Controller block command across sites
    const site = siteIdParam || currentConfig.siteId || 'Default';
    const blockRes = await call(
      'POST',
      `/${id}/api/v2/sites/${site}/cmd/clients/${clientMacFormatted}/block`,
      { mac: clientMacFormatted },
      { 'Csrf-Token': csrf }
    );

    const isOk = blockRes.json?.errorCode === 0;
    return {
      success: isOk,
      message: isOk
        ? `Kifaa ${clientMacFormatted} kimezuiwa (Blocked/Blacklisted) kikamilifu kwenye Omada Controller.`
        : `Omada Block response: ${blockRes.json?.msg || blockRes.json?.message || 'Error ' + blockRes.json?.errorCode}`,
      details: blockRes.json
    };
  } catch (err: any) {
    console.error(`[Omada Controller] Hitilafu ya kum-block ${clientMacFormatted}:`, err.message);
    return {
      success: false,
      message: `Hitilafu ya kum-block mteja kwenye Omada: ${err.message}`
    };
  }
}

/**
 * Unblock (Whitelist) client device on Omada Controller
 */
export async function omadaUnblockClient(
  clientMac: string,
  siteIdParam?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    return {
      success: false,
      message: 'OMADA_URL au OMADA_OPERATOR haijawekwa kwenye mfumo.'
    };
  }

  const clientMacFormatted = formatMac(clientMac);
  try {
    const id = await resolveControllerId();
    if (!cookie || !csrf || Date.now() - loggedAt > 15 * 60 * 1000) {
      await omadaLogin();
    }
    const site = siteIdParam || currentConfig.siteId || 'Default';
    const unblockRes = await call(
      'POST',
      `/${id}/api/v2/sites/${site}/cmd/clients/${clientMacFormatted}/unblock`,
      { mac: clientMacFormatted },
      { 'Csrf-Token': csrf }
    );
    const isOk = unblockRes.json?.errorCode === 0;
    return {
      success: isOk,
      message: isOk ? `Kifaa ${clientMacFormatted} kimefunguliwa (Unblocked).` : unblockRes.json?.msg,
      details: unblockRes.json
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
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

