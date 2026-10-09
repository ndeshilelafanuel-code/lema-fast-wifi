import React, { useState } from 'react';
import { Language } from '../types';
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ArrowRight,
  Server,
  Wifi,
  Smartphone,
  Webhook,
  FileCode,
  Layers,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface PaymentIntegrationGuideProps {
  lang: Language;
}

export const PaymentIntegrationGuide: React.FC<PaymentIntegrationGuideProps> = ({ lang }) => {
  const [selectedGateway, setSelectedGateway] = useState<'zeno' | 'snippe' | 'selcom' | 'mikrotik'>('zeno');
  const [selectedLanguage, setSelectedLanguage] = useState<'nodejs' | 'php' | 'python'>('nodejs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ZenoPay Snippets
  const zenoNodeCode = `// 1. TUMA OMBI LA STK-PUSH (Initiate ZenoPay Payment)
const axios = require('axios');

async function initiateZenoPayment(phoneNumber, amount, customerName) {
  try {
    const response = await axios.post('https://api.zeno.africa/order-create', {
      api_key: process.env.ZENOPAY_API_KEY,      // Kutoka Dashboard ya ZenoPay
      secret_key: process.env.ZENOPAY_SECRET_KEY,
      amount: amount,                            // e.g. 1000 kwa siku 1
      phone_number: phoneNumber,                 // e.g. "0754123456"
      customer_name: customerName || "Mteja WiFi",
      webhook_url: "https://wifi.yako.co.tz/api/zeno-callback"
    });

    console.log("STK-Push imetumwa:", response.data);
    return response.data; // { status: "success", order_id: "ZEN-9402" }
  } catch (error) {
    console.error("Hitilafu ya ZenoPay:", error.response?.data || error.message);
    throw error;
  }
}

// 2. POKEA MAJIBU YA MALIPO (Webhook Callback Listener)
app.post('/api/zeno-callback', async (req, res) => {
  const { order_id, payment_status, phone_number, amount, reference } = req.body;

  // Thibitisha kama malipo yamekamilika
  if (payment_status === 'COMPLETED' || payment_status === 'SUCCESS') {
    console.log(\`✅ Malipo ya Tsh \${amount} yamepokelewa kutoka \${phone_number}\`);

    // A: Tengeneza Vocha ya Muda
    const voucherCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // B: Washa Mtandao Moja kwa Moja kwenye MikroTik RouterOS
    await activateMikrotikUser(phone_number, voucherCode, amount);

    // C: Mtumie Mteja SMS ya Namba ya Vocha kama akiba
    await sendSmsBackup(phone_number, voucherCode);

    return res.status(200).json({ status: 'ACKNOWLEDGED' });
  }

  return res.status(400).json({ status: 'FAILED' });
});`;

  const zenoPhpCode = `<?php
// 1. TUMA OMBI LA STK-PUSH KWA ZENOPAY (PHP cURL)
function initiateZenoPayment($phoneNumber, $amount) {
    $apiKey = "YAKO_ZENOPAY_API_KEY";
    $secretKey = "YAKO_ZENOPAY_SECRET_KEY";

    $payload = [
        'api_key'       => $apiKey,
        'secret_key'    => $secretKey,
        'amount'        => (int)$amount,
        'phone_number'  => $phoneNumber,
        'webhook_url'   => "https://wifi.yako.co.tz/zeno_callback.php"
    ];

    $ch = curl_init('https://api.zeno.africa/order-create');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 2. POKEA WEBHOOK CALLBACK (zeno_callback.php)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['payment_status']) && $data['payment_status'] === 'COMPLETED') {
    $phone = $data['phone_number'];
    $amount = $data['amount'];
    
    // Washa mtumiaji kwenye MikroTik kupitia RouterOS API
    // activate_hotspot_user($phone, $amount);
    
    http_response_code(200);
    echo json_encode(['status' => 'OK']);
} else {
    http_response_code(400);
}
?>`;

  // Snippe Pay Snippet
  const snippeNodeCode = `// SNIPPE PAY INTEGRATION (Developer-First Gateway)
const crypto = require('crypto');
const axios = require('axios');

// 1. Tuma Ombi la Malipo (Create Charge)
async function triggerSnippeSTK(phone, amount) {
  const response = await axios.post('https://api.snippe.tech/v1/charges', {
    amount: amount,
    currency: "TZS",
    customer: {
      phone: phone
    },
    metadata: {
      hotspot_id: "mtaa-fast-wifi-01",
      plan: "1_day_unlimited"
    }
  }, {
    headers: {
      'Authorization': \`Bearer \${process.env.SNIPPE_SECRET_KEY}\`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

// 2. Webhook Callback yenye Uthibitisho wa HMAC Signature
app.post('/api/snippe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-snippe-signature'];
  const webhookSecret = process.env.SNIPPE_WEBHOOK_SECRET;

  // Thibitisha kuwa ujumbe umetoka Snippe kikweli (Anti-tamper)
  const computedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (computedHash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());

  if (event.type === 'charge.completed') {
    const { phone } = event.data.customer;
    const { amount } = event.data;

    console.log(\`Malipo yamekamilika kutoka: \${phone} - Kiasi: \${amount}\`);
    // Fungulia mteja mtandao kwenye router mara moja!
    activateClientSession(phone);
  }

  res.status(200).json({ received: true });
});`;

  const snippePhpCode = `<?php
// SNIPPE PAY INTEGRATION (PHP)

// 1. Tuma Ombi la Malipo (Create Charge)
function triggerSnippeSTK($phone, $amount) {
    $apiKey = "YAKO_SNIPPE_SECRET_KEY";
    
    $payload = [
        'amount' => (int)$amount,
        'currency' => "TZS",
        'customer' => [
            'phone' => $phone
        ],
        'metadata' => [
            'hotspot_id' => "mtaa-fast-wifi-01",
            'plan' => "1_day_unlimited"
        ]
    ];

    $ch = curl_init('https://api.snippe.tech/v1/charges');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 2. Webhook Callback yenye Uthibitisho wa HMAC Signature
$signature = $_SERVER['HTTP_X_SNIPPE_SIGNATURE'] ?? '';
$webhookSecret = "YAKO_SNIPPE_WEBHOOK_SECRET";

$rawBody = file_get_contents('php://input');
$computedHash = hash_hmac('sha256', $rawBody, $webhookSecret);

if ($computedHash !== $signature) {
    http_response_code(401);
    die("Sahihi siyo halali!");
}

$event = json_decode($rawBody, true);
if (isset($event['type']) && $event['type'] === 'charge.completed') {
    $phone = $event['data']['customer']['phone'];
    $amount = $event['data']['amount'];
    
    // Washa mtumiaji kwenye MikroTik Hotspot
    // activate_hotspot_user($phone, $amount);
    
    http_response_code(200);
    echo json_encode(['received' => true]);
} else {
    http_response_code(400);
}
?>`;

  // Selcom API Node.js Snippet
  const selcomNodeCode = `// SELCOM API INTEGRATION (Node.js STK-Push / Checkout)
const crypto = require('crypto');
const axios = require('axios');

// Selcom inatumia Signature ya HMAC-SHA256 kwa Usalama wa Hali ya Juu
function generateSelcomAuthHeaders(apiKey, apiSecret) {
  const timestamp = new Date().toISOString();
  const digestData = \`timestamp=\${timestamp}\`;
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(digestData)
    .digest('base64');

  return {
    'Content-Type': 'application/json',
    'Authorization': \`SELCOM \${Buffer.from(apiKey).toString('base64')}\`,
    'Digest-Method': 'HS256',
    'Digest': signature,
    'Timestamp': timestamp
  };
}

// 1. Tuma Ombi la USSD Push (M-Pesa, Tigo Pesa, Airtel Money n.k.)
async function initiateSelcomStkPush(phoneNumber, amount, transactionId) {
  const apiKey = process.env.SELCOM_API_KEY;
  const apiSecret = process.env.SELCOM_API_SECRET;
  
  const payload = {
    trans_id: transactionId,         // ID ya Muamala ya Kipekee ya Mfumo wako
    vendor_id: "9000",               // Vendor ID uliyopewa na Selcom
    amount: amount,                  // Kiasi cha Fedha (k.m 1000)
    phone_number: phoneNumber,       // Namba ya simu ya mteja (k.m 255754XXXXXX)
    payment_channel: "ANY",          // Au M-PESA, TIGO_PESA, AIRTEL_MONEY n.k.
    redirect_url: "https://wifi.yako.co.tz/api/selcom-redirect",
    webhook_url: "https://wifi.yako.co.tz/api/selcom-webhook"
  };

  const headers = generateSelcomAuthHeaders(apiKey, apiSecret);

  try {
    const response = await axios.post('https://api.selcommobile.com/v1/checkout/create-order-stk', payload, { headers });
    return response.data; // { result: "SUCCESS", message: "STK Push Initiated" }
  } catch (error) {
    console.error("Hitilafu ya Selcom STK-Push:", error.response?.data || error.message);
    throw error;
  }
}

// 2. Mapokezi ya Webhook kutoka Selcom (Selcom Webhook Listener)
app.post('/api/selcom-webhook', async (req, res) => {
  const incomingDigest = req.headers['digest'];
  const incomingTimestamp = req.headers['timestamp'];
  const apiSecret = process.env.SELCOM_API_SECRET;

  // Thibitisha usalama wa Webhook (Signature Verification)
  const rawBody = JSON.stringify(req.body);
  const expectedDigest = crypto
    .createHmac('sha256', apiSecret)
    .update(\`timestamp=\${incomingTimestamp}&body=\${rawBody}\`)
    .digest('base64');

  if (incomingDigest !== expectedDigest) {
    return res.status(401).send('Uthibitisho wa Webhook umefeli (Unauthorized)');
  }

  const { trans_id, payment_status, phone_number, amount } = req.body;

  if (payment_status === 'SUCCESSFUL' || payment_status === 'COMPLETED') {
    console.log(\`✅ Malipo ya Selcom ya Tsh \${amount} kutoka \${phone_number} yamekamilika.\`);
    
    // Washa mtandao kwa mteja sasa hivi kwenye MikroTik!
    await activateMikrotikUserByPhone(phone_number, amount);
  }

  return res.status(200).json({ result: "SUCCESS", message: "Webhook processed" });
});`;

  // Selcom API PHP Snippet
  const selcomPhpCode = `<?php
// SELCOM API INTEGRATION (PHP)

// 1. Tuma Ombi la STK-Push kwenda Selcom
function initiateSelcomPayment($phoneNumber, $amount, $transId) {
    $apiKey = "YAKO_SELCOM_API_KEY";
    $apiSecret = "YAKO_SELCOM_API_SECRET";
    $vendorId = "YAKO_VENDOR_ID";
    
    $timestamp = gmdate('Y-m-d\\TH:i:s\\Z');
    $digestData = "timestamp=" . $timestamp;
    $signature = base64_encode(hash_hmac('sha256', $digestData, $apiSecret, true));

    $payload = [
        'trans_id'        => $transId,
        'vendor_id'       => $vendorId,
        'amount'          => (int)$amount,
        'phone_number'    => $phoneNumber, // mfano: 255754XXXXXX
        'payment_channel' => "ANY",
        'webhook_url'     => "https://wifi.yako.co.tz/selcom_webhook.php"
    ];

    $headers = [
        "Content-Type: application/json",
        "Authorization: SELCOM " . base64_encode($apiKey),
        "Digest-Method: HS256",
        "Digest: " . $signature,
        "Timestamp: " . $timestamp
    ];

    $ch = curl_init('https://api.selcommobile.com/v1/checkout/create-order-stk');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 2. Mapokezi ya Webhook (selcom_webhook.php)
$incomingDigest = $_SERVER['HTTP_DIGEST'] ?? '';
$incomingTimestamp = $_SERVER['HTTP_TIMESTAMP'] ?? '';
$apiSecret = "YAKO_SELCOM_API_SECRET";

$rawBody = file_get_contents('php://input');

// Thibitisha Signature
$digestData = "timestamp=" . $incomingTimestamp . "&body=" . $rawBody;
$expectedDigest = base64_encode(hash_hmac('sha256', $digestData, $apiSecret, true));

if ($incomingDigest !== $expectedDigest) {
    http_response_code(401);
    die("Uthibitisho umefeli!");
}

$data = json_decode($rawBody, true);
if (isset($data['payment_status']) && $data['payment_status'] === 'SUCCESSFUL') {
    $phone = $data['phone_number'];
    $amount = $data['amount'];
    
    // Washa mteja kwenye MikroTik RouterOS
    // activate_mikrotik_hotspot_user($phone, $amount);
    
    http_response_code(200);
    echo json_encode(['result' => 'SUCCESS']);
} else {
    http_response_code(400);
}
?>`;

  // MikroTik RouterOS Activation Script
  const mikrotikActivationCode = `// JINSI YA KUWASHA MTEJA KWENYE MIKROTIK KUTOKA KWENYE WEBHOOK
const RouterOSAPI = require('node-routeros').RouterOSAPI;

async function activateMikrotikUser(clientMac, clientIp, voucherCode, timeLimitHours) {
  const conn = new RouterOSAPI({
    host: '192.168.88.1',   // IP ya Router ya MikroTik
    user: 'api_user',        // Mtumiaji mwenye ruhusa ya API
    password: 'SafePassword123!',
    port: 8728
  });

  try {
    await conn.connect();

    // 1. Ongeza mtumiaji kwenye Hotspot Users
    await conn.write('/ip/hotspot/user/add', [
      \`=name=\${voucherCode}\`,
      \`=password=\${voucherCode}\`,
      \`=profile=default\`,
      \`=limit-uptime=\${timeLimitHours}h\`,
      \`=comment=Automated Pay: \${clientMac}\`
    ]);

    // 2. (Hiari) Mwunganishe moja kwa moja kupitia IP Binding bila hata yeye ku-login!
    await conn.write('/ip/hotspot/ip-binding/add', [
      \`=mac-address=\${clientMac}\`,
      \`=address=\${clientIp}\`,
      \`=type=bypassed\`,
      \`=comment=Paid-\${voucherCode}\`
    ]);

    console.log(\`✅ Mteja \${clientMac} amewashwa mtandaoni kwa saa \${timeLimitHours}!\`);
    conn.close();
  } catch (err) {
    console.error("Hitilafu ya kuunganisha MikroTik:", err);
  }
}`;

  const getCodeSnippet = () => {
    if (selectedGateway === 'snippe') {
      return selectedLanguage === 'php' ? snippePhpCode : snippeNodeCode;
    }
    if (selectedGateway === 'selcom') {
      return selectedLanguage === 'php' ? selcomPhpCode : selcomNodeCode;
    }
    if (selectedGateway === 'mikrotik') {
      return mikrotikActivationCode;
    }
    return selectedLanguage === 'php' ? zenoPhpCode : zenoNodeCode;
  };

  const getLanguageButtonBg = () => {
    if (selectedGateway === 'snippe') return 'bg-emerald-400 text-stone-950 font-bold';
    if (selectedGateway === 'selcom') return 'bg-sky-400 text-stone-950 font-bold';
    return 'bg-amber-400 text-stone-950 font-bold';
  };

  return (
    <section id="payment-integration" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-stone-100">
      {/* Header */}
      <div className="border-b border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
          <Code2 className="w-4 h-4" />
          <span>Mwongozo wa Kiufundi (API Developer Guide)</span>
          <span aria-hidden="true">·</span>
          <span>Tanzania Mobile Payment Gateways</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {lang === 'sw'
            ? 'Jinsi ya Kuunganisha API za Malipo (ZenoPay, Snippe, Selcom) na MikroTik'
            : 'How to Integrate Local Payment Gateway APIs with MikroTik Hotspot'}
        </h2>
        <p className="mt-2 text-sm text-stone-300 max-w-3xl leading-relaxed">
          {lang === 'sw'
            ? 'Hatua kwa hatua jinsi mifumo ya malipo inavyowasiliana na simu za wateja (STK-Push), jinsi ya kupokea ujumbe wa uthibitisho (Webhooks), na jinsi kompyuta inavyomfungulia mteja mtandao mara moja bila wewe kuwepo.'
            : 'End-to-end integration architecture: Initiating automated USSD STK-pushes, handling cryptographically verified webhooks, and auto-provisioning MikroTik Hotspot sessions.'}
        </p>
      </div>

      {/* 5-Stage Visual Signal Flow */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
          <Layers className="w-4 h-4" />
          <span>Mzunguko Kamili wa Malipo (End-to-End API Signal Flow)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Simu ya Mteja</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Mteja anaunganisha WiFi, anachagua kifurushi (Tsh 1,000) na kuweka namba yake ya simu.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Backend Server / API</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Mfumo unatuma POST request kwenda ZenoPay / Snippe / Selcom ukiwa na namba ya simu na kiasi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>USSD STK-Push</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Vodacom / Tigo inamtumia mteja dirisha la PIN: <em>"Lipa Tsh 1,000 kwenda LEMA WIFI. Weka PIN"</em>.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-stone-950 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Webhook className="w-3.5 h-3.5 text-cyan-400" />
              <span>Webhook Callback</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Pesa ikikatwa, Gateway inatuma ujumbe (Callback) kwenye server yako: <code>payment_status = "COMPLETED"</code>.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>MikroTik Hotspot</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Server inawasiliana na router, inafungua MAC address ya mteja. Mtandao unawaka sekunde hiyo hiyo!
            </p>
          </div>
        </div>
      </div>

      {/* Code Playground & Tabs */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-950/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGateway('zeno')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGateway === 'zeno'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white bg-stone-850 hover:bg-stone-800'
              }`}
            >
              1. ZenoPay API
            </button>

            <button
              onClick={() => setSelectedGateway('snippe')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGateway === 'snippe'
                  ? 'bg-emerald-400 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white bg-stone-850 hover:bg-stone-800'
              }`}
            >
              2. Snippe Pay
            </button>

            <button
              onClick={() => setSelectedGateway('selcom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGateway === 'selcom'
                  ? 'bg-sky-400 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white bg-stone-850 hover:bg-stone-800'
              }`}
            >
              3. Selcom API
            </button>

            <button
              onClick={() => setSelectedGateway('mikrotik')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGateway === 'mikrotik'
                  ? 'bg-cyan-400 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white bg-stone-850 hover:bg-stone-800'
              }`}
            >
              4. MikroTik Auto-Activation
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(selectedGateway === 'zeno' || selectedGateway === 'snippe' || selectedGateway === 'selcom') && (
              <div className="flex items-center gap-1 bg-stone-850 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setSelectedLanguage('nodejs')}
                  className={`px-2 py-1 rounded font-mono ${
                    selectedLanguage === 'nodejs' ? getLanguageButtonBg() : 'text-stone-400'
                  }`}
                >
                  Node.js / Express
                </button>
                <button
                  onClick={() => setSelectedLanguage('php')}
                  className={`px-2 py-1 rounded font-mono ${
                    selectedLanguage === 'php' ? getLanguageButtonBg() : 'text-stone-400'
                  }`}
                >
                  PHP / Laravel
                </button>
              </div>
            )}

            <button
              onClick={() => handleCopy(getCodeSnippet(), 'main-snippet')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedKey === 'main-snippet' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Imenakiliwa!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Nakili Kodi (Copy)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-6 bg-stone-950 font-mono text-xs text-stone-200 overflow-x-auto leading-relaxed max-h-[500px]">
          <pre>{getCodeSnippet()}</pre>
        </div>
      </div>

      {/* 3 Golden Rules for Hotspot Payment Integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Rule 1: Walled Garden */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Weka Walled Garden Kwanza</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Mteja anapounganisha WiFi, anakuwa hana intaneti bado. Ni lazima uweke domain za gateway yako (k.m. <code>*.zeno.africa</code> au <code>*.snippe.tech</code>) kwenye <strong>/ip hotspot walled-garden</strong> ili simu yake iweze kuwasiliana na mfumo wa malipo kabla hajanunua vocha!
          </p>
        </div>

        {/* Rule 2: Webhook Security & Idempotency */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
            <Webhook className="w-4 h-4" />
            <span>2. Linda Callback (Webhook Security)</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Mitandao ya simu inaweza kurudia kutuma webhook zaidi ya mara moja (retries). Hakikisha unahifadhi <code>reference_number</code> au <code>order_id</code> kwenye database ili kuepuka kumpa mteja vocha mbili au kurefusha muda mara mbili kwa malipo moja.
          </p>
        </div>

        {/* Rule 3: SMS Fallback */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
            <Smartphone className="w-4 h-4" />
            <span>3. Tuma Vocha kwa SMS ya Akiba</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Kuna wakati mteja akishalipa, simu yake inaweza kuzima au akazima WiFi kwa bahati mbaya kabla ukurasa haujamwonyesha ameingia. Mfumo wako ukiunganisha SMS API (k.m. Beem SMS au Twilio), inamtumia SMS yenye code ya vocha yake kama akiba ya kuingia baadaye!
          </p>
        </div>
      </div>
    </section>
  );
};
