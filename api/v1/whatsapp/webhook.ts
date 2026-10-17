// Vercel Serverless Function for Meta WhatsApp Webhook
// Compatible with Vercel Node.js runtime

export default async function handler(req: any, res: any) {
  // 1. GET: Meta Webhook Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedTokens = [
      process.env.WHATSAPP_VERIFY_TOKEN,
      'lema_wifi_webhook_token',
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

            if (cleanText === '1' || cleanText.includes('saa 2') || cleanText.includes('500')) {
              replyText = `🎯 *Umechagua: Saa 2 za Haraka - Bei: TZS 500*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina: *Jimmy Lema*\n\n✅ Ukimaliza andika *NIMELIPA* upate vocha yako papo hapo!`;
            } else if (cleanText === '2' || cleanText.includes('siku 1') || cleanText.includes('1000')) {
              replyText = `🎯 *Umechagua: Saa 24 (Siku 1) - Bei: TZS 1,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina: *Jimmy Lema*\n\n✅ Ukimaliza andika *NIMELIPA* upate vocha yako papo hapo!`;
            } else if (cleanText === '3' || cleanText.includes('wiki 1') || cleanText.includes('5000')) {
              replyText = `🎯 *Umechagua: Wiki 1 (Siku 7) - Bei: TZS 5,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina: *Jimmy Lema*\n\n✅ Ukimaliza andika *NIMELIPA* upate vocha yako papo hapo!`;
            } else if (cleanText === '4' || cleanText.includes('mwezi 1') || cleanText.includes('25000')) {
              replyText = `🎯 *Umechagua: Mwezi 1 (Siku 30) - Bei: TZS 25,000*\n\n💳 *LIPA KWA M-PESA / TIGO PESA:*\n👉 Lipa Namba: *5849201* au Tuma: *0653 578 184*\n👉 Jina: *Jimmy Lema*\n\n✅ Ukimaliza andika *NIMELIPA* upate vocha yako papo hapo!`;
            } else if (cleanText.includes('nimelipa') || cleanText.includes('tayari') || cleanText.includes('muamala')) {
              const randomVoucher = Math.floor(1000 + Math.random() * 9000);
              replyText = `🎉 *HONGERA! MALIPO YAMEPOKELEWA!*\n\n🎟️ *VOCHA YAKO:* \`${randomVoucher}\`\n⚡ *Mtandao:* Lema Fast WiFi\n\n👉 Unganisha simu yako kisha ingiza vocha hii au fungua http://192.168.88.1\n\n_Msaada: 0653 578 184 (Jimmy Lema)_`;
            } else {
              replyText = `Habari ${senderName}! 👋\nKaribu *Lema Fast WiFi* Smart Assistant.\n\n📶 *VIFURUSHI VYA INTANETI:*\n1️⃣ Saa 2 (TZS 500) ➔ Jibu: *1*\n2️⃣ Siku 1 (TZS 1,000) ➔ Jibu: *2*\n3️⃣ Wiki 1 (TZS 5,000) ➔ Jibu: *3*\n4️⃣ Mwezi 1 (TZS 25,000) ➔ Jibu: *4*\n\nAndika namba kupata vocha mara moja au andika *ADMIN* kuwasiliana na Jimmy Lema (0653 578 184).`;
            }

            const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '1348304901706270').trim();
            const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();

            if (phoneNumberId && accessToken && accessToken.length > 25 && !accessToken.toLowerCase().includes('token string')) {
              try {
                const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
                const metaRes = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: senderPhone,
                    type: 'text',
                    text: { body: replyText }
                  })
                });
                const metaJson: any = await metaRes.json();
                if (metaJson?.error) {
                  console.log('[Vercel Webhook Handled Status]:', metaJson.error.message || 'Meta API error');
                }
              } catch (metaErr: any) {
                console.log('[Vercel Webhook Network Notice]:', metaErr?.message || 'Meta network issue');
              }
            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      }
    } catch (err: any) {
      console.log('[Vercel Webhook Handled Catch]:', err?.message || 'Webhook catch');
    }
    return res.status(200).json({ status: 'ok', received: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
