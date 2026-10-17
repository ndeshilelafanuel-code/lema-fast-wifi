// Vercel Serverless Function: /api/v1/sms/test-send
export default async function handler(req: any, res: any) {
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
    const { phone, message, apiKey, senderId } = req.body || {};
    const rawTarget = (phone || '0653578184').trim();
    const digits = rawTarget.replace(/[^0-9]/g, '');
    const international = digits.startsWith('0') ? '255' + digits.slice(1) : digits.startsWith('255') ? digits : '255' + digits;
    const e164Phone = `+${international}`;

    const rawKey = (apiKey || process.env.SMS_API_KEY || '').trim();
    const targetSenderId = (senderId || process.env.SMS_SENDER_ID || 'LEMAWIFI').trim().toUpperCase();
    const textToSend = message || `Asante kwa kujiunga na LEMA FAST WIFI! Vocha yako ni: ${Math.floor(1000 + Math.random() * 9000)}. Msaada piga 0653578184.`;

    const isWellFormedKey = rawKey.startsWith('swl_live_') || rawKey.startsWith('swl_test_');

    if (rawKey && isWellFormedKey) {
      const swalaRes = await fetch('https://api.swalasms.com/v1/sms/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rawKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: e164Phone,
          sender_id: targetSenderId,
          body: textToSend
        })
      });

      const data: any = await swalaRes.json().catch(() => ({}));

      if (swalaRes.status === 401 || data?.error_code === 'AUTHENTICATION_FAILED') {
        return res.json({
          success: false,
          targetPhone: rawTarget,
          result: {
            success: false,
            errorCode: 'AUTHENTICATION_FAILED',
            message: data?.message || 'Unauthorized API key.',
            hint: 'API Key ya SwalaSMS haijathibitishwa. Hakikisha umeunda funguo kwenye ukurasa wa SwalaSMS (swalasms.com/sms/api-keys) na umeipa ruhusa ya sms:send.'
          }
        });
      }

      return res.json({
        success: swalaRes.status === 202 || data?.success,
        targetPhone: rawTarget,
        result: {
          success: swalaRes.status === 202 || data?.success,
          provider: 'swalasms',
          data
        }
      });
    }

    // Simulation response if key not yet provided or invalid prefix
    return res.json({
      success: true,
      targetPhone: rawTarget,
      result: {
        success: true,
        simulated: true,
        recipient: e164Phone,
        senderId: targetSenderId,
        note: rawKey && !isWellFormedKey
          ? 'Funguo ya SwalaSMS inapaswa kuanza na "swl_live_". Mfumo umefanya majaribio (Simulation).'
          : 'Ujumbe umetumwa kwa majaribio (Simulation). Weka API Key ya SwalaSMS inayoanza na swl_live_ kutuma live simuni.'
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err?.message || 'Server error during SMS test send'
    });
  }
}
