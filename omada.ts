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
  adminUser?: string;
  adminPass?: string;
  strictTls: boolean;
  siteId?: string;
  customUnauthEndpoint?: string;
  slidingLeaseEnabled?: boolean;
  slidingLeaseMinutes?: number;
}

const CONFIG_FILE = path.resolve(process.cwd(), 'omada-config.json');

/**
 * Standardize and normalize Omada URL:
 * - If protocol missing, default to https:// (especially for ports 8043, 8443, 443, ngrok)
 * - If port is 8043 or 8443 and user entered http://, automatically upgrade to https://
 *   to avoid "Bad Request: This combination of host and port requires TLS."
 */
export function normalizeOmadaUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!url) return '';

  // Port 8043 and 8443 are SSL/TLS-only ports on TP-Link Omada Controller.
  if (url.startsWith('http://') && (url.includes(':8043') || url.includes(':8443'))) {
    url = url.replace(/^http:\/\//i, 'https://');
  }

  // Prepend https:// if no protocol was supplied
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  return url;
}

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

  const opUser = (disk.operatorUser || process.env.OMADA_OPERATOR || '').trim();
  const opPass = (disk.operatorPass || process.env.OMADA_OPERATOR_PASSWORD || '').trim();

  return {
    omadaUrl: normalizeOmadaUrl(disk.omadaUrl || process.env.OMADA_URL || ''),
    controllerId: (disk.controllerId || process.env.OMADA_ID || '').trim(),
    operatorUser: opUser,
    operatorPass: opPass,
    adminUser: (disk.adminUser || process.env.OMADA_ADMIN_USER || opUser).trim(),
    adminPass: (disk.adminPass || process.env.OMADA_ADMIN_PASSWORD || opPass).trim(),
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
    currentConfig.omadaUrl = normalizeOmadaUrl(currentConfig.omadaUrl);
  }
  if (currentConfig.controllerId) {
    currentConfig.controllerId = currentConfig.controllerId.trim();
  }

  // Update process.env for compatibility with existing references
  if (currentConfig.omadaUrl) process.env.OMADA_URL = currentConfig.omadaUrl;
  if (currentConfig.controllerId) process.env.OMADA_ID = currentConfig.controllerId;
  if (currentConfig.operatorUser) process.env.OMADA_OPERATOR = currentConfig.operatorUser;
  if (currentConfig.operatorPass) process.env.OMADA_OPERATOR_PASSWORD = currentConfig.operatorPass;
  if (currentConfig.adminUser) process.env.OMADA_ADMIN_USER = currentConfig.adminUser;
  if (currentConfig.adminPass) process.env.OMADA_ADMIN_PASSWORD = currentConfig.adminPass;

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log('[Omada] Updated omada-config.json successfully.');
  } catch (err: any) {
    console.warn('[Omada] Failed to persist omada-config.json:', err.message);
  }

  // Reset active sessions so next requests authenticate with new credentials
  operatorSession = { cookie: '', csrf: '', loggedAt: 0 };
  adminSession = { cookie: '', csrf: '', loggedAt: 0 };

  return { ...currentConfig };
}

export interface OmadaSession {
  cookie: string;
  csrf: string;
  loggedAt: number;
}

let operatorSession: OmadaSession = { cookie: '', csrf: '', loggedAt: 0 };
let adminSession: OmadaSession = { cookie: '', csrf: '', loggedAt: 0 };

interface CallResponse {
  json: any;
  raw: string;
  setCookie: string[];
  statusCode?: number;
  headers: Record<string, string | string[] | undefined>;
}

function call(
  method: string,
  reqPath: string,
  body?: any,
  extra: Record<string, string> = {},
  sessionOverride?: OmadaSession,
  cfgOverride?: OmadaConfig
): Promise<CallResponse> {
  return new Promise((resolve, reject) => {
    const cfg = cfgOverride || currentConfig;
    const base = normalizeOmadaUrl(cfg.omadaUrl);
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
      ? new https.Agent({ rejectUnauthorized: cfg.strictTls })
      : undefined;

    const data = body ? JSON.stringify(body) : undefined;
    const activeCookie = sessionOverride ? sessionOverride.cookie : operatorSession.cookie;

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
          ...(activeCookie ? { 'Cookie': activeCookie } : {}),
          ...extra,
          ...(data ? { 'Content-Length': String(Buffer.byteLength(data)) } : {}),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          // If server returns "Bad Request This combination of host and port requires TLS."
          // Automatically upgrade currentConfig.omadaUrl to https:// and retry!
          if ((res.statusCode === 400 || res.statusCode === 403) && buf.toLowerCase().includes('requires tls')) {
            console.warn('[Omada] Server returned "requires TLS" - automatically upgrading to HTTPS and retrying...');
            const upgradedBase = base.replace(/^http:\/\//i, 'https://');
            if (upgradedBase !== base || !isHttps) {
              const secureUrl = upgradedBase.startsWith('https://') ? upgradedBase : `https://${upgradedBase}`;
              updateOmadaConfig({ omadaUrl: secureUrl });
              return call(method, reqPath, body, extra, sessionOverride, { ...cfg, omadaUrl: secureUrl })
                .then(resolve)
                .catch(reject);
            }
          }

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
  const m = text.match(/[0-9a-fA-F]{32}/);
  return m ? m[0].toLowerCase() : null;
}

/**
 * Attempt to automatically detect OMADA_ID (omadacId) from multiple Controller endpoints
 */
export async function resolveControllerId(cfgParam?: OmadaConfig): Promise<string> {
  const cfg = cfgParam || currentConfig;
  if (cfg.controllerId && extractHexId(cfg.controllerId)) {
    return cfg.controllerId;
  }

  console.log('[Omada] Inaanza kutafuta OMADA_ID kiotomatiki kutoka kwenye Controller...');

  // 1. Try GET /api/info (Official TP-Link Omada discovery endpoint)
  try {
    const res = await call('GET', '/api/info', undefined, {}, undefined, cfg);
    const resultObj = res.json?.result || res.json || {};
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
      if (!cfgParam) updateOmadaConfig({ controllerId: resolved });
      return resolved;
    }
  } catch (err: any) {
    console.warn('[Omada] /api/info notice:', err.message);
  }

  // 2. Try GET / (Omada root redirects to /<omadacId>/login)
  try {
    const res = await call('GET', '/', undefined, {}, undefined, cfg);
    const locHeader = String(res.headers.location || '');
    const headerId = extractHexId(locHeader);
    if (headerId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka Location redirect header: ${headerId}`);
      if (!cfgParam) updateOmadaConfig({ controllerId: headerId });
      return headerId;
    }

    const bodyId = extractHexId(res.raw);
    if (bodyId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka ukurasa wa mzizi (/): ${bodyId}`);
      if (!cfgParam) updateOmadaConfig({ controllerId: bodyId });
      return bodyId;
    }
  } catch (err: any) {
    console.warn('[Omada] GET / notice:', err.message);
  }

  // 3. Try GET /login
  try {
    const res = await call('GET', '/login', undefined, {}, undefined, cfg);
    const locHeader = String(res.headers.location || '');
    const headerId = extractHexId(locHeader);
    if (headerId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka /login redirect: ${headerId}`);
      if (!cfgParam) updateOmadaConfig({ controllerId: headerId });
      return headerId;
    }

    const bodyId = extractHexId(res.raw);
    if (bodyId) {
      console.log(`[Omada] ✅ OMADA_ID imepatikana kutoka ukurasa wa /login: ${bodyId}`);
      if (!cfgParam) updateOmadaConfig({ controllerId: bodyId });
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
export async function getOperatorSession(cfgParam?: OmadaConfig, forceFresh = false): Promise<OmadaSession> {
  const cfg = cfgParam || currentConfig;
  const isGlobal = !cfgParam;

  if (isGlobal && !forceFresh && operatorSession.cookie && operatorSession.csrf && Date.now() - operatorSession.loggedAt < 15 * 60 * 1000) {
    return operatorSession;
  }

  if (!cfg.omadaUrl || !cfg.operatorUser || !cfg.operatorPass) {
    throw new Error('Mipangilio ya Hotspot Operator (OMADA_URL, OMADA_OPERATOR, OMADA_OPERATOR_PASSWORD) haijakamilika.');
  }

  const id = await resolveControllerId(cfg);
  console.log(`[Omada Operator Session] Logging in as Operator "${cfg.operatorUser}" to controller ${id}...`);

  const endpoints = [
    `/${id}/api/v2/hotspot/login`,
    `/${id}/api/v2/login`,
    '/api/v2/hotspot/login',
    '/api/v2/login',
    `/${id}/api/v2/hotspot/extPortal/login`,
  ];

  let lastErrorCode: number | undefined;
  let lastErrorMsg = '';

  for (const ep of endpoints) {
    try {
      const r = await call('POST', ep, {
        name: cfg.operatorUser,
        username: cfg.operatorUser,
        password: cfg.operatorPass,
      }, {}, undefined, cfg);

      if (r.json?.errorCode === 0) {
        const csrfToken = r.json?.result?.token || r.json?.token || (r.headers['csrf-token'] as string) || '';
        const cookiesList = r.setCookie || [];
        const cookieStr = cookiesList.map((c) => c.split(';')[0]).join('; ');
        const session: OmadaSession = {
          csrf: csrfToken,
          cookie: cookieStr,
          loggedAt: Date.now(),
        };
        if (isGlobal) {
          operatorSession = session;
        }
        console.log(`[Omada Operator Session] ✅ Hotspot Operator session active via ${ep}!`);
        return session;
      } else if (r.json?.errorCode !== undefined) {
        lastErrorCode = r.json.errorCode;
        lastErrorMsg = r.json.msg || r.json.message || '';
      }
    } catch (e: any) {
      console.warn(`[Omada Operator Session] Endpoint ${ep} failed:`, e.message);
    }
  }

  if (lastErrorCode === -30109) {
    throw new Error(
      `Omada Operator login imeshindikana (Kosa -30109): Invalid username or password.\n\n` +
      `💡 Hakikisha akaunti imetengenezwa chini ya: Hotspot Manager > Operators > + Add Operator.`
    );
  }

  throw new Error(`Omada Operator login imeshindikana (Kosa ${lastErrorCode ?? 'N/A'}): ${lastErrorMsg || 'Invalid credentials'}`);
}

/**
 * Log in to Omada Controller as Controller Administrator
 * Route in Omada Controller v5.x / v6.x: POST /<controllerId>/api/v2/login
 * Required for site client management commands: /cmd/clients/{mac}/unauth and /block
 */
export async function getAdminSession(cfgParam?: OmadaConfig, forceFresh = false): Promise<OmadaSession> {
  const cfg = cfgParam || currentConfig;
  const isGlobal = !cfgParam;

  if (isGlobal && !forceFresh && adminSession.cookie && adminSession.csrf && Date.now() - adminSession.loggedAt < 15 * 60 * 1000) {
    return adminSession;
  }

  const adminUser = (cfg.adminUser || cfg.operatorUser || '').trim();
  const adminPass = (cfg.adminPass || cfg.operatorPass || '').trim();

  if (!cfg.omadaUrl || !adminUser || !adminPass) {
    throw new Error('Mipangilio ya Controller Admin (OMADA_ADMIN_USER, OMADA_ADMIN_PASSWORD) haijakamilika.');
  }

  const id = await resolveControllerId(cfg);
  console.log(`[Omada Admin Session] Logging in as Admin "${adminUser}" to controller ${id}...`);

  const endpoints = [
    `/${id}/api/v2/login`,
    '/api/v2/login',
  ];

  let lastErrorCode: number | undefined;
  let lastErrorMsg = '';

  for (const ep of endpoints) {
    try {
      const r = await call('POST', ep, {
        username: adminUser,
        name: adminUser,
        password: adminPass,
      }, {}, undefined, cfg);

      if (r.json?.errorCode === 0) {
        const csrfToken = r.json?.result?.token || r.json?.token || (r.headers['csrf-token'] as string) || '';
        const cookiesList = r.setCookie || [];
        const cookieStr = cookiesList.map((c) => c.split(';')[0]).join('; ');
        const session: OmadaSession = {
          csrf: csrfToken,
          cookie: cookieStr,
          loggedAt: Date.now(),
        };
        if (isGlobal) {
          adminSession = session;
        }
        console.log(`[Omada Admin Session] ✅ Controller Admin session active via ${ep}!`);
        return session;
      } else if (r.json?.errorCode !== undefined) {
        lastErrorCode = r.json.errorCode;
        lastErrorMsg = r.json.msg || r.json.message || '';
      }
    } catch (e: any) {
      console.warn(`[Omada Admin Session] Endpoint ${ep} failed:`, e.message);
    }
  }

  if (lastErrorCode === -30138) {
    throw new Error('Akaunti ya Admin ina Ulinzi wa Hatua Mbili (Two-Factor Authentication / 2FA). TP-Link Omada inahitaji utengeneze akaunti mpya ya Local Admin isiyo na 2FA (Settings > Users/Admins > Add Local Admin) ili kuwezesha amri za kukata intaneti sekunde hiyo hiyo.');
  }

  throw new Error(`Omada Admin login imeshindikana (Kosa ${lastErrorCode ?? 'N/A'}): ${lastErrorMsg || 'Invalid admin credentials'}`);
}

/**
 * Backward compatibility login helper
 */
export async function omadaLogin(): Promise<{ csrf: string; cookie: string }> {
  const sess = await getOperatorSession();
  return { csrf: sess.csrf, cookie: sess.cookie };
}

/**
 * Standardize MAC addresses to hyphenated uppercase (e.g. AA-BB-CC-DD-EE-FF) as expected by Omada
 */
export function formatMac(m: string): string {
  const raw = (m || '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (raw.length === 12) {
    return raw.match(/.{1,2}/g)!.join('-');
  }
  return (m || '').trim().toUpperCase();
}

/**
 * Authorize client device on Omada Controller (External Portal)
 * Uses Hotspot Operator session.
 * Supports sliding lease duration if enabled.
 */
export async function omadaAuthorize(p: OmadaAuthParams) {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    throw new Error('Mipangilio ya Omada Controller (OMADA_URL, OMADA_OPERATOR) haijakamilika.');
  }

  const id = await resolveControllerId();
  const clientMacFormatted = formatMac(p.clientMac);
  const apMacFormatted = formatMac(p.apMac);

  // If sliding lease is enabled, grant short lease (e.g. 10 minutes) that auto-renews while active
  const effectiveDurationMs = currentConfig.slidingLeaseEnabled
    ? Math.min(p.durationMs, (currentConfig.slidingLeaseMinutes || 10) * 60 * 1000)
    : p.durationMs;

  let session = await getOperatorSession();

  const send = (sess: OmadaSession) =>
    call(
      'POST',
      `/${id}/api/v2/hotspot/extPortal/auth`,
      {
        clientMac: clientMacFormatted,
        clientIp: p.clientIp || '',
        apMac: apMacFormatted,
        ssidName: p.ssidName || 'Lema Fast WiFi',
        radioId: Number(p.radioId) || 0,
        time: Math.round(effectiveDurationMs), // Duration in milliseconds
        authType: 4, // External Portal Authentication
        originUrl: '',
        totalTrafficLimitBytes: 0,
        downloadRateLimitKbps: p.downKbps || 0,
        uploadRateLimitKbps: p.upKbps || 0,
      },
      { 'Csrf-Token': sess.csrf },
      sess
    );

  let r = await send(session);

  // If authorization returned session expiration or token error, attempt re-login once and retry
  if (r.json?.errorCode !== 0 || r.statusCode === 401 || r.statusCode === 403) {
    console.log(
      `[Omada Controller] First auth attempt returned errorCode: ${r.json?.errorCode} (HTTP ${r.statusCode}), re-authenticating operator session...`
    );
    try {
      session = await getOperatorSession(undefined, true);
      r = await send(session);
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
    `[Omada Controller] ✅ Client ${clientMacFormatted} authorized on AP ${apMacFormatted} for ${Math.round(effectiveDurationMs / 60000)} minutes!`
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
 * Dual-Session multi-tier strategy:
 * 1. Dedicated extPortal/unauth & hotspot/guests/unauth via Operator Session
 * 2. Site command unauth via Admin Session (/sites/{siteId}/cmd/clients/{mac}/unauth)
 * 3. 802.11 Deauth via site client cmd reconnect (kick from AP)
 * CRITICAL: Reconnect alone is NOT counted towards confirmation. Confirmation requires an unauth/block command with errorCode 0.
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
  console.log(`[Omada Controller] 🛑 Inaanza kukata intaneti na kufuta idhini ya kifaa ${clientMacFormatted}...`);

  try {
    const id = await resolveControllerId();
    const results: Record<string, any> = {};

    // 1. Get Operator session for Portal unauth endpoints
    let opSess: OmadaSession | null = null;
    try {
      opSess = await getOperatorSession();
    } catch (oe: any) {
      console.warn('[Omada Unauthorize] Operator session warning:', oe.message);
    }

    // 2. Short Lease Override (Instant Disconnect via External Portal Auth)
    // Sending time: 1 ms overrides the active lease and forces the AP to immediately expire guest access!
    if (opSess) {
      try {
        console.log(`[Omada Controller v6.3] ⚡ Attempting Short Lease Override for ${clientMacFormatted} on AP ${apMacFormatted || 'any'}...`);
        const shortAuthRes = await call(
          'POST',
          `/${id}/api/v2/hotspot/extPortal/auth`,
          {
            clientMac: clientMacFormatted,
            clientIp: '',
            apMac: apMacFormatted,
            ssidName: options?.ssidName || 'Lema Fast WiFi',
            radioId: Number(options?.radioId) || 0,
            time: 1, // 1 ms expiration immediately drops the authorized state on AP
            authType: 4,
            originUrl: '',
            totalTrafficLimitBytes: 0,
            downloadRateLimitKbps: 0,
            uploadRateLimitKbps: 0,
          },
          { 'Csrf-Token': opSess.csrf },
          opSess
        );
        results.shortLeaseOverride = {
          statusCode: shortAuthRes.statusCode,
          errorCode: shortAuthRes.json?.errorCode,
          msg: shortAuthRes.json?.msg || shortAuthRes.json?.message
        };
        if (shortAuthRes.json?.errorCode === 0) {
          console.log(`[Omada Controller v6.3] ✅ Short Lease Override succeeded for ${clientMacFormatted} (portal lease invalidated)!`);
        }

        if (shortAuthRes.json?.errorCode === -41501) {
          console.log(`[Omada Controller v6.3] ℹ️ Kifaa ${clientMacFormatted} tayari kimeshakatwa au hakipo mtandaoni (errorCode: -41501).`);
          return {
            success: true,
            omadaConfirmed: true,
            message: `Kifaa ${clientMacFormatted} tayari kilikuwa kimekatwa au hakipo mtandaoni kwenye AP.`,
            details: results
          };
        }
      } catch (sle: any) {
        results.shortLeaseOverride = { error: sle.message };
      }
    }

    // 2. Custom Endpoint captured via DevTools (if configured)
    if (currentConfig.customUnauthEndpoint && currentConfig.customUnauthEndpoint.trim() && opSess) {
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
          { 'Csrf-Token': opSess.csrf },
          opSess
        );
        results.customEndpoint = {
          endpoint: ep,
          statusCode: customRes.statusCode,
          errorCode: customRes.json?.errorCode,
          msg: customRes.json?.msg || customRes.json?.message
        };
      } catch (ce: any) {
        results.customEndpoint = { error: ce.message };
      }
    }

    // 3. Direct extPortal/unauth and extPortal/logout (Operator Session)
    if (opSess) {
      try {
        const r = await call(
          'POST',
          `/${id}/api/v2/hotspot/extPortal/unauth`,
          { clientMac: clientMacFormatted, mac: clientMacFormatted },
          { 'Csrf-Token': opSess.csrf },
          opSess
        );
        results.extPortalUnauth = {
          statusCode: r.statusCode,
          errorCode: r.json?.errorCode,
          msg: r.json?.msg || r.json?.message
        };
      } catch (e: any) {
        results.extPortalUnauth = { error: e.message };
      }

      try {
        const r = await call(
          'POST',
          `/${id}/api/v2/hotspot/extPortal/logout`,
          { clientMac: clientMacFormatted, mac: clientMacFormatted, apMac: apMacFormatted },
          { 'Csrf-Token': opSess.csrf },
          opSess
        );
        results.extPortalLogout = {
          statusCode: r.statusCode,
          errorCode: r.json?.errorCode,
          msg: r.json?.msg || r.json?.message
        };
      } catch (e: any) {
        results.extPortalLogout = { error: e.message };
      }

      // 4. Hotspot Guests Unauth
      try {
        const r = await call(
          'POST',
          `/${id}/api/v2/hotspot/guests/unauth`,
          { clientMac: clientMacFormatted, mac: clientMacFormatted },
          { 'Csrf-Token': opSess.csrf },
          opSess
        );
        results.hotspotGuestsUnauth = {
          statusCode: r.statusCode,
          errorCode: r.json?.errorCode,
          msg: r.json?.msg || r.json?.message
        };
      } catch (e: any) {
        results.hotspotGuestsUnauth = { error: e.message };
      }
    }

    // 5. Site-level Administrative unauth & reconnect (Admin Session)
    let admSess: OmadaSession | null = null;
    try {
      admSess = await getAdminSession();
    } catch (ae: any) {
      console.warn('[Omada Unauthorize] Admin session warning:', ae.message);
    }

    if (admSess) {
      const sessionForSiteCmd = admSess;
      let siteIds: string[] = [];
      try {
        const sitesRes = await call('GET', `/${id}/api/v2/sites`, undefined, { 'Csrf-Token': sessionForSiteCmd.csrf }, sessionForSiteCmd);
        const list = sitesRes.json?.result?.data || (Array.isArray(sitesRes.json?.result) ? sitesRes.json.result : []);
        if (Array.isArray(list)) {
          for (const s of list) {
            if (s.id) siteIds.push(s.id);
            if (s.siteId && !siteIds.includes(s.siteId)) siteIds.push(s.siteId);
            if (s.name && !siteIds.includes(s.name)) siteIds.push(s.name);
          }
        }
      } catch (e) {}

      if (currentConfig.siteId && !siteIds.includes(currentConfig.siteId)) {
        siteIds.unshift(currentConfig.siteId);
      }
      if (siteIds.length === 0) {
        siteIds = ['Mbezi', 'mbezi', 'Default', 'default'];
      }

      for (const siteId of siteIds) {
        // Admin Site Command: Unauth (Single & Batch endpoints)
        if (admSess) {
          try {
            const adminUnauthRes = await call(
              'POST',
              `/${id}/api/v2/sites/${siteId}/cmd/clients/${clientMacFormatted}/unauth`,
              { mac: clientMacFormatted },
              { 'Csrf-Token': admSess.csrf },
              admSess
            );
            if (adminUnauthRes.json?.errorCode !== undefined) {
              results[`admin_site_unauth_${siteId}`] = {
                errorCode: adminUnauthRes.json?.errorCode,
                msg: adminUnauthRes.json?.msg
              };
            }
          } catch (e: any) {}

          try {
            const adminBatchUnauth = await call(
              'POST',
              `/${id}/api/v2/sites/${siteId}/cmd/clients/unauth`,
              { macs: [clientMacFormatted] },
              { 'Csrf-Token': admSess.csrf },
              admSess
            );
            if (adminBatchUnauth.json?.errorCode !== undefined) {
              results[`admin_batch_unauth_${siteId}`] = {
                errorCode: adminBatchUnauth.json?.errorCode,
                msg: adminBatchUnauth.json?.msg
              };
            }
          } catch (e: any) {}
        }

        // Hotspot Site Command: Unauth
        if (opSess) {
          try {
            const uRes = await call(
              'POST',
              `/${id}/api/v2/hotspot/sites/${siteId}/cmd/clients/${clientMacFormatted}/unauth`,
              { clientMac: clientMacFormatted },
              { 'Csrf-Token': opSess.csrf },
              opSess
            );
            if (uRes.json?.errorCode !== undefined) {
              results[`hotspot_sites_unauth_${siteId}`] = {
                errorCode: uRes.json?.errorCode,
                msg: uRes.json?.msg
              };
            }
          } catch (e: any) {}
        }

        // 802.11 Deauth Kick (Drops WiFi radio link immediately)
        try {
          const r = await call(
            'POST',
            `/${id}/api/v2/sites/${siteId}/cmd/clients/${clientMacFormatted}/reconnect`,
            {},
            { 'Csrf-Token': sessionForSiteCmd.csrf },
            sessionForSiteCmd
          );
          if (r.json?.errorCode !== undefined) {
            results[`reconnect_${siteId}`] = {
              errorCode: r.json?.errorCode,
              msg: r.json?.msg
            };
          }
        } catch (e: any) {}
      }
    }

    // CRITICAL: Filter out keys starting with "reconnect". Reconnect only drops the station radio,
    // Omada will still authorize the client if the lease has not been invalidated via unauth!
    const unauthResults = Object.entries(results).filter(([key]) => !key.startsWith('reconnect'));
    const succeeded = unauthResults.some(
      ([_, res]: any) => res && typeof res === 'object' && res.errorCode === 0
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

    console.warn(`[Omada Controller] ⚠️ Hakuna amri ya unauth iliyorudisha errorCode === 0 kwa ${clientMacFormatted}:`, JSON.stringify(results));
    return {
      success: false,
      omadaConfirmed: false,
      message: `Omada Controller haikukata idhini ya kifaa ${clientMacFormatted}. Hakuna amri ya unauth iliyorudisha errorCode: 0. Angalia akaunti ya Admin kwenye Mipangilio.`,
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
 * Requires Controller Admin session.
 */
export async function omadaBlockClient(
  clientMac: string,
  siteIdParam?: string
): Promise<{ success: boolean; omadaConfirmed: boolean; message: string; details?: any }> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    return {
      success: false,
      omadaConfirmed: false,
      message: 'OMADA_URL au OMADA_OPERATOR haijawekwa kwenye mfumo.'
    };
  }

  const clientMacFormatted = formatMac(clientMac);
  console.log(`[Omada Controller] 🚫 Kuzuia (Block/Blacklist) kifaa ${clientMacFormatted}...`);

  try {
    const id = await resolveControllerId();
    const admSess = await getAdminSession();

    // Step 1: Unauthorize and kick first
    await omadaUnauthorize(clientMacFormatted);

    // Step 2: Call Omada Controller block command across site
    const site = siteIdParam || currentConfig.siteId || 'Default';
    const blockRes = await call(
      'POST',
      `/${id}/api/v2/sites/${site}/cmd/clients/${clientMacFormatted}/block`,
      { mac: clientMacFormatted },
      { 'Csrf-Token': admSess.csrf },
      admSess
    );

    const isOk = blockRes.json?.errorCode === 0;
    return {
      success: isOk,
      omadaConfirmed: isOk,
      message: isOk
        ? `Kifaa ${clientMacFormatted} kimezuiwa (Blocked/Blacklisted) kikamilifu kwenye Omada Controller.`
        : `Omada Block response: ${blockRes.json?.msg || blockRes.json?.message || 'Error ' + blockRes.json?.errorCode}`,
      details: blockRes.json
    };
  } catch (err: any) {
    console.error(`[Omada Controller] Hitilafu ya kum-block ${clientMacFormatted}:`, err.message);
    return {
      success: false,
      omadaConfirmed: false,
      message: `Hitilafu ya kum-block mteja kwenye Omada: ${err.message}`
    };
  }
}

/**
 * Unblock (Whitelist) client device on Omada Controller
 * Requires Controller Admin session.
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
    const admSess = await getAdminSession();
    const site = siteIdParam || currentConfig.siteId || 'Default';

    const unblockRes = await call(
      'POST',
      `/${id}/api/v2/sites/${site}/cmd/clients/${clientMacFormatted}/unblock`,
      { mac: clientMacFormatted },
      { 'Csrf-Token': admSess.csrf },
      admSess
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
 * Comprehensive connectivity check and operator/admin credential test
 * Non-mutating: Uses isolated test configuration without overwriting runtime state on failure
 */
export async function testOmadaConnection(
  overrides?: Partial<OmadaConfig>
): Promise<{ success: boolean; message: string; details?: any }> {
  const testCfg: OmadaConfig = {
    ...currentConfig,
    ...(overrides || {}),
  };

  if (testCfg.omadaUrl) {
    testCfg.omadaUrl = normalizeOmadaUrl(testCfg.omadaUrl);
  }
  if (testCfg.controllerId) {
    testCfg.controllerId = testCfg.controllerId.trim();
  }
  if (testCfg.operatorUser) {
    testCfg.operatorUser = testCfg.operatorUser.trim();
  }
  if (testCfg.operatorPass) {
    testCfg.operatorPass = testCfg.operatorPass.trim();
  }
  if (testCfg.adminUser) {
    testCfg.adminUser = testCfg.adminUser.trim();
  }
  if (testCfg.adminPass) {
    testCfg.adminPass = testCfg.adminPass.trim();
  }

  if (!testCfg.omadaUrl) {
    return {
      success: false,
      message: 'Tafadhali weka Anwani ya Omada (URL au Ngrok) kabla ya kupima muunganisho.'
    };
  }
  if (!testCfg.operatorUser || !testCfg.operatorPass) {
    return {
      success: false,
      message: 'Tafadhali weka Jina na Nenosiri la Hotspot Operator kabla ya kupima muunganisho.'
    };
  }

  try {
    const id = await resolveControllerId(testCfg);
    const opSess = await getOperatorSession(testCfg, true);

    let adminSessResult: { success: boolean; message?: string } | null = null;
    if (testCfg.adminUser && testCfg.adminPass) {
      try {
        await getAdminSession(testCfg, true);
        adminSessResult = { success: true, message: 'Admin login imefaulu' };
      } catch (ae: any) {
        adminSessResult = { success: false, message: ae.message };
      }
    }

    return {
      success: true,
      message: `Muunganisho umefanikiwa kikamilifu! Controller ID "${id}" inafanya kazi na Operator "${testCfg.operatorUser}" ameingia kwa ufanisi.${
        adminSessResult ? ` (Admin: ${adminSessResult.success ? '✅ Sahihi' : '⚠️ ' + adminSessResult.message})` : ''
      }`,
      details: {
        controllerId: id,
        operatorUser: testCfg.operatorUser,
        adminUser: testCfg.adminUser || '(Haikuwekwa)',
        tokenReceived: Boolean(opSess.csrf),
        cookieReceived: Boolean(opSess.cookie),
        adminResult: adminSessResult,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
      details: {
        currentUrl: testCfg.omadaUrl,
        operatorUser: testCfg.operatorUser,
        controllerId: testCfg.controllerId || '(Haijawekwa)',
      },
    };
  }
}

/**
 * Real-Time Device Monitoring: Fetch live AP status directly from Omada Controller
 */
export async function getOmadaDevices(): Promise<Array<{ mac: string; name: string; model: string; ip: string; status: 'online' | 'offline'; rawStatus: any }>> {
  if (!currentConfig.omadaUrl || !currentConfig.operatorUser) {
    return [];
  }

  try {
    const id = await resolveControllerId();
    let sess: OmadaSession | null = null;
    try {
      sess = await getOperatorSession();
    } catch {
      return [];
    }

    let siteIds = ['Default', 'default'];
    if (currentConfig.siteId) {
      siteIds.unshift(currentConfig.siteId);
    }

    try {
      const sitesRes = await call('GET', `/${id}/api/v2/sites`, undefined, { 'Csrf-Token': sess.csrf }, sess);
      const list = sitesRes.json?.result?.data || (Array.isArray(sitesRes.json?.result) ? sitesRes.json.result : []);
      if (Array.isArray(list)) {
        for (const s of list) {
          if (s.id && !siteIds.includes(s.id)) siteIds.push(s.id);
          if (s.siteId && !siteIds.includes(s.siteId)) siteIds.push(s.siteId);
          if (s.name && !siteIds.includes(s.name)) siteIds.push(s.name);
        }
      }
    } catch (e) {}

    const devicesList: Array<{ mac: string; name: string; model: string; ip: string; status: 'online' | 'offline'; rawStatus: any }> = [];

    for (const site of siteIds) {
      try {
        const endpoints = [
          `/${id}/api/v2/sites/${site}/devices`,
          `/${id}/api/v2/devices`,
          `/api/v2/sites/${site}/devices`,
          `/api/v2/devices`,
        ];

        for (const ep of endpoints) {
          const res = await call('GET', ep, undefined, { 'Csrf-Token': sess.csrf }, sess);
          const rawDevices = res.json?.result?.data || (Array.isArray(res.json?.result) ? res.json.result : []);
          if (Array.isArray(rawDevices) && rawDevices.length > 0) {
            for (const d of rawDevices) {
              const mac = (d.mac || d.macAddress || '').trim().toUpperCase();
              if (mac) {
                const isOnline =
                  d.status === 1 ||
                  d.statusCategory === 1 ||
                  String(d.status).toLowerCase() === 'online' ||
                  String(d.status).toLowerCase() === 'connected' ||
                  String(d.status).toLowerCase() === 'running';

                devicesList.push({
                  mac,
                  name: d.name || d.model || 'Omada AP',
                  model: d.model || 'EAP',
                  ip: d.ip || d.ipAddress || '',
                  status: isOnline ? 'online' : 'offline',
                  rawStatus: d.status,
                });
              }
            }
            if (devicesList.length > 0) break;
          }
        }
      } catch (e) {}
      if (devicesList.length > 0) break;
    }

    return devicesList;
  } catch (err: any) {
    console.warn('[Omada Devices Sync] Could not query Omada devices:', err.message);
    return [];
  }
}
