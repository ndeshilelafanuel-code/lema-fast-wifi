// Vercel Serverless Function: /api/v1/whatsapp/config
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const config = {
    provider: 'meta',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1348304901706270',
    wabaId: process.env.WHATSAPP_WABA_ID || '1578703743479175',
    displayPhoneNumber: '+255 621 311 137',
    verifiedName: 'Lema Fast WiFi',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'lema_wifi_webhook_token',
    appId: process.env.WHATSAPP_APP_ID || '1860632731565594',
    lastError: null
  };

  if (req.method === 'POST') {
    const body = req.body || {};
    return res.json({ success: true, config: { ...config, ...body } });
  }

  return res.json(config);
}
