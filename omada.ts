import https from 'https';

const BASE = (process.env.OMADA_URL || '').replace(/\/$/, '');
const OP_USER = process.env.OMADA_OPERATOR || '';
const OP_PASS = process.env.OMADA_OPERATOR_PASSWORD || '';
let controllerId = process.env.OMADA_ID || '';

// Controller usually has a self-signed HTTPS certificate; rejectUnauthorized is false unless OMADA_STRICT_TLS === '1'
const agent = new https.Agent({
  rejectUnauthorized: process.env.OMADA_STRICT_TLS === '1'
});

let cookie = '';
let csrf = '';
let loggedAt = 0;

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

function call(method: string, path: string, body?: any, extra: Record<string, string> = {}) {
  return new Promise<{ json: any; setCookie: string[]; statusCode?: number }>((resolve, reject) => {
    if (!BASE) {
      return reject(new Error('OMADA_URL haijawekwa kwenye mazingira (env) ya server'));
    }

    let u: URL;
    try {
      u = new URL(BASE + path);
    } catch (e: any) {
      return reject(new Error(`Anwani ya OMADA_URL si sahihi: ${e.message}`));
    }

    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      {
        method,
        agent,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
            setCookie: (res.headers['set-cookie'] as string[]) || [],
            statusCode: res.statusCode
          });
        });
      }
    );

    req.on('error', (err) => {
      reject(new Error(`Hitilafu ya mtandao na Omada Controller: ${err.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy(new Error('Omada Controller imechelewa kujibu (Timeout ya sekunde 10)'));
    });

    if (data) req.write(data);
    req.end();
  });
}

/**
 * Log in to Omada Controller as Hotspot Operator
 * Route in Omada Controller v5.x / v6.x: POST /<controllerId>/api/v2/hotspot/login
 */
export async function omadaLogin(): Promise<{ csrf: string; cookie: string }> {
  if (!BASE || !OP_USER || !OP_PASS) {
    throw new Error('Mipangilio ya Omada (OMADA_URL, OMADA_OPERATOR, OMADA_OPERATOR_PASSWORD) haijajazwa.');
  }

  // Attempt to auto-fetch controller ID from /api/info if not set
  if (!controllerId) {
    try {
      const info = await call('GET', '/api/info');
      controllerId = info.json?.result?.omadaCId || info.json?.result?.controllerId || '';
      if (controllerId) {
        console.log(`[Omada Controller] Auto-detected OMADA_ID: ${controllerId}`);
      }
    } catch (e: any) {
      console.warn('[Omada Controller] Could not auto-detect OMADA_ID:', e.message);
    }

    if (!controllerId) {
      throw new Error('OMADA_ID haijawekwa na haikuweza kupatikana kiotomatiki kutoka kwenye /api/info.');
    }
  }

  cookie = '';
  console.log(`[Omada Controller] Logging in as Operator "${OP_USER}" to controller ${controllerId}...`);
  const r = await call('POST', `/${controllerId}/api/v2/hotspot/login`, {
    name: OP_USER,
    password: OP_PASS,
  });

  if (r.json?.errorCode !== 0) {
    throw new Error(`Omada login imeshindikana (Error ${r.json?.errorCode || r.statusCode}): ${r.json?.msg || JSON.stringify(r.json)}`);
  }

  csrf = r.json?.result?.token || '';
  const cookiesList = r.setCookie || [];
  cookie = cookiesList.map((c) => c.split(';')[0]).join('; ');
  loggedAt = Date.now();

  console.log('[Omada Controller] Login successful! Session token active.');
  return { csrf, cookie };
}

/**
 * Authorize client device on Omada Controller (External Portal)
 * Route in Omada Controller v5.x / v6.x: POST /<controllerId>/api/v2/hotspot/extPortal/auth
 */
export async function omadaAuthorize(p: OmadaAuthParams) {
  if (!BASE || !OP_USER) {
    throw new Error('Mipangilio ya Omada Controller (OMADA_URL, OMADA_OPERATOR) haijakamilika.');
  }

  // Standardize MAC addresses to colon format or uppercase as expected by Omada
  const formatMac = (m: string) => {
    const raw = (m || '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (raw.length === 12) {
      return raw.match(/.{1,2}/g)!.join('-');
    }
    return m.trim().toUpperCase();
  };

  const clientMacFormatted = formatMac(p.clientMac);
  const apMacFormatted = formatMac(p.apMac);

  const send = () =>
    call(
      'POST',
      `/${controllerId}/api/v2/hotspot/extPortal/auth`,
      {
        clientMac: clientMacFormatted,
        clientIp: p.clientIp || '',
        apMac: apMacFormatted,
        ssidName: p.ssidName || '',
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

  // If not logged in or session older than 20 minutes, perform fresh login
  if (!cookie || !csrf || Date.now() - loggedAt > 20 * 60 * 1000) {
    await omadaLogin();
  }

  let r = await send();

  // If authorization returned any error or expired session, attempt re-login once and retry
  if (r.json?.errorCode !== 0 || r.statusCode === 401 || r.statusCode === 403) {
    console.log(`[Omada Controller] First auth attempt returned errorCode: ${r.json?.errorCode} (HTTP ${r.statusCode}), re-authenticating operator session...`);
    try {
      await omadaLogin();
      r = await send();
    } catch (reLoginErr: any) {
      console.warn('[Omada Controller] Re-login attempt failed:', reLoginErr.message);
    }
  }

  if (r.json?.errorCode !== 0) {
    throw new Error(
      `Omada auth imeshindikana (Error ${r.json?.errorCode}): ${r.json?.msg || JSON.stringify(r.json)}`
    );
  }

  console.log(`[Omada Controller] ✅ Client ${clientMacFormatted} authorized on AP ${apMacFormatted} for ${Math.round(p.durationMs / 60000)} minutes!`);
  return r.json;
}
