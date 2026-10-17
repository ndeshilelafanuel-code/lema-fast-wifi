// Vercel Serverless Function: /api/v1/whatsapp/test-send
import crypto from 'crypto';

function getAppSecretProof(token: string, secret?: string): string | null {
  const s = (secret || process.env.WHATSAPP_APP_SECRET || '').trim();
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

export default async function handler(req: any, res: any) {
  // Support CORS for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { phone, message, useTemplate, accessToken, appSecret, phoneNumberId } = req.body || {};

    const rawTarget = (phone || '').trim();
    const digits = rawTarget.replace(/[^0-9]/g, '');
    const normalizedTarget = digits.startsWith('0') ? '255' + digits.slice(1) : digits;

    if (!rawTarget) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Tafadhali weka namba ya simu ya mpokeaji (mfano: 0755123456 au 0653578184).'
      });
    }

    if (normalizedTarget === '255621311137') {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Huwezi kutuma ujumbe kwenda namba ile ile ya Bot (+255 621 311 137). Weka namba yako binafsi ya WhatsApp.'
      });
    }

    const token = (accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
    const phoneId = (phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '1348304901706270').trim();
    const secret = (appSecret || process.env.WHATSAPP_APP_SECRET || '').trim();

    if (!token || token.length < 25 || token.toLowerCase().includes('token string')) {
      return res.json({
        success: false,
        error: true,
        targetPhone: rawTarget,
        result: {
          simulated: true,
          warning: 'Access Token ya Meta haijawekwa au haijakamilika. Tafadhali weka Token inayoanza na EAA... kwenye Mipangilio ya Meta.'
        }
      });
    }

    const rawUrl = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const url = buildMetaGraphUrl(rawUrl, token, secret);

    const requestBody = useTemplate
      ? {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTarget,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' }
          }
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTarget,
          type: 'text',
          text: { preview_url: false, body: message || 'Jaribio la Lema Fast WiFi Bot 🤖: Mtandao unafanya kazi kikamilifu!' }
        };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data: any = await response.json().catch(() => ({}));

    if (data?.error) {
      const code = data.error.code;
      const msg = data.error.message || 'Hitilafu ya Meta API';
      let userTip = msg;

      if (code === 131047 || msg.toLowerCase().includes('24 hours')) {
        userTip = 'Dirisha la Masaa 24 Limefungwa (#131047): Mteja lazima amwandikie bot kwanza (wa.me/255621311137) au tumia Template ya hello_world kufika simuni mara moja.';
      } else if (code === 133010) {
        userTip = 'Namba haijasajiliwa Meta (Code 133010). Bonyeza Sajili Namba Meta kwanza.';
      } else if (data.error.type === 'OAuthException') {
        userTip = 'Token ya Meta imekwisha muda wake. Tengeneza token mpya kutoka Meta Developers ukurasa wa API Setup.';
      }

      return res.json({
        success: false,
        error: true,
        targetPhone: rawTarget,
        result: {
          error: true,
          code,
          message: msg,
          userTip,
          isAccountNotRegistered: code === 133010,
          isOAuthException: data.error.type === 'OAuthException',
          isAppSecretProof: msg.toLowerCase().includes('appsecret_proof')
        }
      });
    }

    return res.json({
      success: true,
      targetPhone: rawTarget,
      result: data,
      useTemplate: Boolean(useTemplate)
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err?.message || 'Serverless execution error'
    });
  }
}
