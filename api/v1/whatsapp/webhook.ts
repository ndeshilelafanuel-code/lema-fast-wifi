// Vercel Serverless Function for Meta WhatsApp Webhook
// Compatible with Vercel Node.js runtime
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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

function getSavedTokenAndPhone(): { token: string; phoneId: string; secret: string } {
  let token = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  let phoneId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '1348304901706270').trim();
  let secret = (process.env.WHATSAPP_APP_SECRET || '').trim();

  try {
    const cfgPath = path.resolve(process.cwd(), 'whatsapp-config.json');
    if (fs.existsSync(cfgPath)) {
      const data = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (data?.accessToken && !token) token = String(data.accessToken).trim();
      if (data?.phoneNumberId && phoneId === '1348304901706270') phoneId = String(data.phoneNumberId).trim();
      if (data?.appSecret && !secret) secret = String(data.appSecret).trim();
    }
  } catch (e) {
    // ignore
  }

  return { token, phoneId, secret };
}

export default async function handler(req: any, res: any) {
  // 1. GET: Meta Webhook Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedTokens = [
      process.env.WHATSAPP_VERIFY_TOKEN,
      'lema_wifi_webhook_token',
      'lema_wifi_webhook_toke',
      'lema_fast_wifi'
    ].filter(Boolean);

    if (mode === 'subscribe' && expectedTokens.includes(token)) {
      console.log('✅ [Vercel Meta Webhook Verified!] Sending challenge back to Meta.');
      return res.status(200).send(challenge);
    }

    return res.status(200).json({
      status: 'ok',
      service: 'Lema Fast WiFi WhatsApp Webhook (Vercel Serverless Ready)',
      active: true
    });
  }

  // 2. POST: Receiving messages from Meta WhatsApp Cloud API
  if (req.method === 'POST') {
    const body = req.body;
    console.log('[Vercel Webhook] Incoming POST payload:', JSON.stringify(body, null, 2));

    try {
      if (body?.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

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
            console.log(`[Vercel Bot] 📩 Incoming from ${senderPhone} (${senderName}): "${textMessage}"`);

            // Generate smart reply
            const cleanText = textMessage.trim().toLowerCase();
            let replyText = '';

            if (cleanText === '1' || cleanText.includes('saa 2') || cleanText === '500') {
              replyText = `🎯 *Umechagua: Saa 2 za Haraka - Bei: TZS 500*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina la Akaunti: *Jimmy Lema*\n\n✅ Ukimaliza kutuma pesa, andika neno: *NIMELIPA* hapa kupokea namba ya vocha yako mara moja!`;
            } else if (cleanText === '2' || cleanText.includes('saa 24') || cleanText.includes('siku 1') || cleanText === '1000') {
              replyText = `🎯 *Umechagua: Saa 24 (Siku 1) ⭐ - Bei: TZS 1,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina la Akaunti: *Jimmy Lema*\n\n✅ Ukimaliza kutuma pesa, andika neno: *NIMELIPA* hapa kupokea namba ya vocha yako mara moja!`;
            } else if (cleanText === '3' || cleanText.includes('wiki 1') || cleanText.includes('siku 7') || cleanText === '5000') {
              replyText = `🎯 *Umechagua: Siku 7 (Wiki 1) - Bei: TZS 5,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina la Akaunti: *Jimmy Lema*\n\n✅ Ukimaliza kutuma pesa, andika neno: *NIMELIPA* hapa kupokea namba ya vocha yako mara moja!`;
            } else if (cleanText === '4' || cleanText.includes('mwezi 1') || cleanText.includes('siku 30') || cleanText === '25000') {
              replyText = `🎯 *Umechagua: Siku 30 (Mwezi Mzima) - Bei: TZS 25,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina la Akaunti: *Jimmy Lema*\n\n✅ Ukimaliza kutuma pesa, andika neno: *NIMELIPA* hapa kupokea namba ya vocha yako mara moja!`;
            } else if (cleanText.includes('nimelipa') || cleanText.includes('tayari') || cleanText.includes('muamala') || cleanText.includes('pesa')) {
              const randomVoucher = Math.floor(1000 + Math.random() * 9000);
              replyText = `🎉 *HONGERA SANA! MALIPO YAMEPOKELEWA!*\n\n🎟️ *VOCHA YAKO NI:* \`${randomVoucher}\`\n⚡ *Mtandao:* Lema Fast WiFi\n📶 *Hali:* Imewashwa tayari!\n\n👉 *JINSI YA KUANZA:*\n1. Unganisha simu yako na: *Lema Fast WiFi*\n2. Ingiza namba ya vocha: *${randomVoucher}*\n3. Au tembelea: http://192.168.88.1\n\n_Msaada piga: 0653 578 184 (Jimmy Lema)._`;
            } else if (cleanText.includes('portal') || cleanText.includes('ukurasa') || cleanText.includes('haufunguki') || cleanText.includes('haifunguki')) {
              replyText = `🌐 *JINSI YA KUFUNGUA UKURASA WA VOCHA:*\n1. Fungua browser yako (Chrome au Safari).\n2. Kwenye URL andika: *192.168.88.1* au *neverssl.com*\n3. Ukurasa utatokea mara moja! Weka vocha yako au lipia moja kwa moja.\n4. Zima VPN zote kwanza kama Cloudflare WARP.`;
            } else if (cleanText.includes('ip') || cleanText.includes('obtaining') || cleanText.includes('haipati')) {
              replyText = `🔧 *UFUMBUZI WA OBTAINING IP:*\n1. Zima Wi-Fi ya simu kisha washa tena baada ya sekunde 5.\n2. Bonyeza "Forget Network" kwenye mtandao wetu kisha unganisha upya.\n3. Hakikisha simu haijaweka Static IP au VPN.`;
            } else {
              replyText = `Habari ${senderName}! 👋\nKaribu *Lema Fast WiFi* Smart Assistant.\n\n📶 *VIFURUSHI VYA INTANETI:*\n1️⃣ *Saa 2 za Haraka* - TZS 500 ➔ Jibu: *1*\n2️⃣ *Saa 24 (Siku 1)* - TZS 1,000 ⭐ ➔ Jibu: *2*\n3️⃣ *Siku 7 (Wiki 1)* - TZS 5,000 ➔ Jibu: *3*\n4️⃣ *Siku 30 (Mwezi 1)* - TZS 25,000 ➔ Jibu: *4*\n\n👉 *Jibu namba (1, 2, 3 au 4) kupata vocha sasa hivi!*\n👨‍💼 Kwa msaada wowote piga: *0653 578 184* (Jimmy Lema).`;
            }

            const { token, phoneId, secret } = getSavedTokenAndPhone();

            if (phoneId && token && token.length > 25 && !token.toLowerCase().includes('token string')) {
              try {
                const rawUrl = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
                const url = buildMetaGraphUrl(rawUrl, token, secret);
                console.log(`[Vercel Bot] 📤 Sending WhatsApp reply to +${senderPhone}...`);

                const metaRes = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: senderPhone,
                    type: 'text',
                    text: { preview_url: false, body: replyText }
                  })
                });
                const metaJson: any = await metaRes.json().catch(() => ({}));
                console.log('[Vercel Bot] Meta Graph Response:', metaJson);
              } catch (metaErr: any) {
                console.error('[Vercel Bot] Network error sending to Meta:', metaErr?.message);
              }
            } else {
              console.warn('[Vercel Bot] ⚠️ Cannot reply: WHATSAPP_ACCESS_TOKEN is missing or empty in Vercel environment variables.');
            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      }
    } catch (err: any) {
      console.error('[Vercel Webhook] Error processing webhook:', err);
    }
    return res.status(200).json({ status: 'ok', received: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
