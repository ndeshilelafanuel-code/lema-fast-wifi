import re

with open('server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add paymentOrdersTable to import from schema.ts
text = text.replace(
    "import { hardware, towers as towersTable, vouchers as vouchersTable, activeSessions as activeSessionsTable } from './src/db/schema.ts';",
    "import { hardware, towers as towersTable, vouchers as vouchersTable, activeSessions as activeSessionsTable, paymentOrders as paymentOrdersTable } from './src/db/schema.ts';"
)

# 2. Remove simulateWebhookHandler and simulate webhook routes
sim_block = """// Endpoint to simulate webhook actions directly from UI for testing
const simulateWebhookHandler = async (req: express.Request, res: express.Response) => {
  const body = req.body || {};
  const testPhone = String(body.phone || '255653578184').replace(/[^0-9]/g, '');
  const testMsg = String(body.message || body.text || 'Habari! Nahitaji vocha ya TZS 1000').trim();

  console.log(`[WhatsApp Webhook Simulation] Received test payload for +${testPhone}: "${testMsg}"`);

  const fakePayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: whatsAppConfig.wabaId || 'waba-test-id',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '255653578184',
                phone_number_id: whatsAppConfig.phoneNumberId || 'phone-test-id'
              },
              contacts: [{ profile: { name: 'Jimmy Lema (Simulated)' }, wa_id: testPhone }],
              messages: [
                {
                  from: testPhone,
                  id: `sim-${Date.now()}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: 'text',
                  text: { body: testMsg }
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  try {
    addWhatsAppLog({
      type: 'incoming_message',
      direction: 'inbound',
      status: 'info',
      phone: testPhone,
      summary: `Ujumbe wa Jaribio toka +${testPhone}`,
      details: `Mteja ameandika: "${testMsg}"`,
      payload: fakePayload
    });

    recentMessages.push({
      id: `msg-${Date.now()}`,
      senderPhone: testPhone,
      senderName: 'Jimmy Lema (Simulated)',
      text: testMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: 'user'
    });

    const replyText = generateBotReply(testMsg, 'Jimmy Lema (Simulated)', testPhone);
    recentMessages.push({
      id: `bot-${Date.now()}`,
      senderPhone: 'bot',
      senderName: whatsAppConfig.botName || 'Lema WiFi Bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: 'bot'
    });

    let sendStatus = 'success';
    let sendMsg = 'Jibu la mtandao limetolewa kikamilifu!';
    if (whatsAppConfig.accessToken && whatsAppConfig.phoneNumberId) {
      try {
        await sendWhatsAppMessage(testPhone, replyText);
      } catch (e: any) {
        sendStatus = 'warning';
        sendMsg = `Bot imejibu kwenye mfumo lakini kushindwa kutuma WhatsApp Cloud API: ${e.message}`;
      }
    } else {
      sendStatus = 'info';
      sendMsg = 'Bot imejibu kwenye dashboard. Sanidi Meta Access Token kutuma kwenye WhatsApp halisi.';
    }

    addWhatsAppLog({
      type: 'bot_reply',
      direction: 'outbound',
      status: sendStatus as any,
      phone: testPhone,
      summary: `Bot Imejibu: "${replyText.slice(0, 40)}..."`,
      details: sendMsg,
      payload: fakePayload
    });

    return res.json({
      success: true,
      message: 'Ujumbe wa jaribio umeingizwa na bot imejibu kikamilifu!',
      reply: replyText
    });
  } catch (err: any) {
    return res.json({ success: true, message: 'Simulated unknown type' });
  }
};

app.post('/api/v1/whatsapp/simulate-webhook', simulateWebhookHandler);
app.post('/api/v1/whatsapp/webhook/simulate', simulateWebhookHandler);"""

if sim_block in text:
    text = text.replace(sim_block, '')
    print('Removed WhatsApp simulation handlers')

# 3. Remove simulate-confirm route
sim_confirm_block = """// 4. SIMULATE / MANUAL CONFIRM (Inasaidia majaribio ya kimaendeleo tu chini ya ulinzi wa Admin)
app.post('/api/v1/payments/simulate-confirm', requireAdmin, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Njia ya simulate-confirm imezimwa kwenye uzalishaji (production). Malipo yanapaswa kupitia webhook rasmi tu.'
    });
  }

  const { orderId } = req.body || {};
  const order = paymentOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order haijapatikana' });
  }

  const voucherCode = crypto.randomInt(10000000, 99999999).toString();
  order.status = 'completed';
  order.voucherCode = voucherCode;
  order.reference = `STK-${crypto.randomInt(100000, 999999)}TZ`;
  order.completedAt = new Date().toISOString();

  loadSavedVouchers();
  savedVouchers.unshift({
    id: `v-pay-${Date.now()}`,
    code: voucherCode,
    packageId: order.packageId || 'pkg-default',
    packageName: 'Kifurushi cha Malipo ya Simu',
    price: order.amount,
    durationHours: 24,
    speedLimit: '2.5M/1.0M',
    status: 'unused',
    createdAt: new Date().toISOString(),
    usedByPhone: order.phone
  });
  saveVouchersToDisk();

  return res.json({
    success: true,
    message: 'Malipo yamethibitishwa kwa majaribio na vocha imetengenezwa!',
    order
  });
});"""

if sim_confirm_block in text:
    text = text.replace(sim_confirm_block, '')
    print('Removed simulate-confirm endpoint')

# 4. Update SMS fallback to remove "simulated: true"
text = text.replace(
    "console.log(`[SMS Simulation] To: ${phone}, Text: \"${text}\"`);\n    return { success: true, simulated: true, message: 'SMS ya jaribio imetengenezwa. Weka API credentials kutuma halisi.' };",
    "return { success: false, simulated: false, message: 'SMS haijatumwa: API za Beem/SMS hazijasanidiwa.' };"
)

# 5. Clean checkout fallback in AzamPay
old_azampay_fallback = """      return res.json({
        success: true,
        orderId,
        isLive: false,
        message: `Ombi la AzamPay limewashwa kwa majaribio (Sandbox Fallback). Weka PIN kwenye simu yako (${localPhone}) kuthibitisha TZS ${amount}.`
      });
    }

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
  });"""

new_azampay_fallback = """      return res.status(502).json({
        success: false,
        orderId,
        isLive: false,
        message: azamData.message || 'AzamPay hawajafanikiwa kuanzisha mchakato wa malipo kwenye mtandao wako wa simu.'
      });
    }

    return res.status(502).json({
      success: false,
      orderId,
      isLive: false,
      message: azamData.message || 'AzamPay hawajafanikiwa kuanzisha mchakato wa malipo.'
    });
  }

  return res.status(503).json({
    success: false,
    orderId,
    isLive: false,
    message: 'Mfumo wa malipo ya AzamPay/MNO haujawashwa. Tafadhali nunua vocha kutoka kwa Msimamizi.'
  });"""

if old_azampay_fallback in text:
    text = text.replace(old_azampay_fallback, new_azampay_fallback)
    print('Replaced AzamPay fake sandbox fallback with real error responses')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print('Server cleanup completed!')
