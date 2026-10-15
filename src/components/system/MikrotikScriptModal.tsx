import React, { useState } from 'react';
import { HotspotSettings } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import { X, Copy, Check, Terminal, FileCode2, Download } from 'lucide-react';

interface MikrotikScriptModalProps {
  settings: HotspotSettings;
  onClose: () => void;
}

export const MikrotikScriptModal: React.FC<MikrotikScriptModalProps> = ({ settings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mikrotik-html' | 'mikrotik' | 'omada' | 'openwrt' | 'walled-garden' | 'saas-api' | 'architecture'>('mikrotik-html');
  const [copied, setCopied] = useState<boolean>(false);

  // 1. TP-Link Omada External Portal & RADIUS Setup Guide (No MikroTik Required)
  const omadaScript = `# ==============================================================
# MTAA WIFI - TP-LINK OMADA CONTROLLER & ACCESS POINT SETUP
# Hotspot Name: ${settings.hotspotName}
# Works on: TP-Link EAP110-Outdoor, EAP225-Outdoor, EAP610, OC200 / Omada Cloud
# Physical Wiring: [ Airtel 4G/5G Router ] ➔ [ TP-Link Omada AP ] (HAPANA MIKROTIK INAYOHITAJIKA!)
# ==============================================================

SURA YA 1: JINSI INAVYOFANYA KAZI BILA MIKROTIK
- Vifaa vya TP-Link Omada vina "External Web Portal" na "RADIUS Client" ya ndani.
- Airtel Router inatoa intaneti tu kupitia LAN cable kwenda kwenye Omada AP.
- Mfumo wetu wa Cloud Billing unawasiliana moja kwa moja na Omada Controller.
- Mteja akilipa M-Pesa, mfumo unamruhusu; masaa 24 yakiisha, OMADA INAMKATA AUTOMATIC!

SURA YA 2: HATUA ZA KUSANIDI KWENYE OMADA CONTROLLER
1. FUNGUA OMADA CONTROLLER (Cloud au Software):
   - Nenda: Settings ➔ Authentication ➔ Hotspot
   - Bonyeza: "+ Create New Portal"
   - Portal Name: ${settings.hotspotName} Portal
   - Applies To: Chagua SSID ya Wi-Fi ya wateja (mfano: "${settings.hotspotName}")

2. CHAGUA PORTAL TYPE:
   - Weka: "External Web Portal"
   - Portal URL: https://wifi.mtaawifi.net/portal?merchant=${settings.merchantNumber}

3. RADIUS PROFILE (KWA AJILI YA AUTOMATIC EXPIRATION & SPEED LIMITS):
   - Nenda: Authentication ➔ RADIUS Profile ➔ "+ Create New RADIUS Profile"
   - Profile Name: Mtaa-WiFi-Radius
   - Authentication Server IP: 102.223.14.88
   - Authentication Port: 1812
   - Accounting Server IP: 102.223.14.88
   - Accounting Port: 1813
   - RADIUS Password/Secret: mtaa_secret_${settings.merchantNumber.replace(/[^0-9]/g, '') || '849201'}
   - Interim Update Interval: 60 seconds (Inamkata mteja mara moja muda ukimalizika)

4. PRE-AUTHENTICATION ACCESS (WALLED GARDEN - MALIPO YA M-PESA BILA VOCHA):
   Kwenye Hotspot Portal Settings, ongeza vikoa vifuatavyo kwenye "Pre-Authentication Access":
   - *.paypack.co
   - *.beem.africa
   - *.selcom.net
   - *.vodacom.co.tz
   - *.tigo.co.tz
   - *.airtel.co.tz

5. HONGERA!
   - Ukiwa na Router yako ya Airtel na AP ya TP-Link Omada, biashara inajiendesha 100% automatic bila gharama ya kununua MikroTik!`;

  // 1. OpenWrt / OpenNDS Captive Portal Script
  const openwrtScript = `# ==============================================================
# MTAA WIFI - OPENWRT / OPENNDS CAPTIVE PORTAL CONFIGURATION
# Hotspot Name: ${settings.hotspotName}
# Works on: Any OpenWrt Router, Raspberry Pi, Orange Pi, or Linux PC
# ==============================================================

# 1. Install OpenNDS Captive Portal on OpenWrt
opkg update
opkg install opennds

# 2. Configure OpenNDS Gateway (/etc/config/opennds)
cat << 'EOF' > /etc/config/opennds
config opennds
	option enabled '1'
	option fwd_daemon '1'
	option gatewayinterface 'br-lan'
	option gatewayname '${settings.hotspotName}'
	option maxclients '250'
	option preauthidle '15'
	option sessiontimeout '1440'
	option checkinterval '30'

# Allow Payment Gateway Endpoints (Walled Garden)
list authenticated_users 'allow all to 102.223.0.0/16'
list authenticated_users 'allow all to *.paypack.co'
list authenticated_users 'allow all to *.beem.africa'
list authenticated_users 'allow all to *.vodacom.co.tz'
list authenticated_users 'allow all to *.tigo.co.tz'
EOF

# 3. Enable & Restart OpenNDS Service
/etc/init.d/opennds enable
/etc/init.d/opennds restart

# 4. Automatic Expiry Sync Daemon (Cron Script)
# Runs every minute to disconnect expired MAC addresses from Cloud API
cat << 'EOF' > /usr/bin/hotspot-expiry-sync.sh
#!/bin/sh
# Polls SaaS API for expired sessions and revokes access via opennds-cli
EXPIRED_MACS=$(curl -s -X GET "https://api.mtaawifi.net/v1/sessions/expired?hotspot_id=${settings.merchantNumber}")
for mac in $EXPIRED_MACS; do
  openndsctl deauth "$mac"
  echo "[HOTSPOT] Expired & Deauthorized MAC: $mac"
done
EOF

chmod +x /usr/bin/hotspot-expiry-sync.sh
(crontab -l 2>/dev/null; echo "* * * * * /usr/bin/hotspot-expiry-sync.sh") | crontab -
`;

  // 2. Generate MikroTik RouterOS setup script
  const mikrotikScript = `# ==============================================================
# MTAA WIFI - MIKROTIK ROUTEROS HOTSPOT & QUEUES CONFIGURATION
# Hotspot Name: ${settings.hotspotName}
# ==============================================================

# 1. Hotspot User Profiles & Speed Queues
/ip hotspot user profile
set [ find default=yes ] idle-timeout=none keepalive-timeout=2m mac-cookie-timeout=3d name=default rate-limit=2.5M/1.0M shared-users=1 status-autorefresh=1m
add name="2hrs-profile" rate-limit=2.5M/1.0M session-timeout=2h shared-users=1
add name="1day-profile" rate-limit=2.5M/1.0M session-timeout=1d shared-users=1
add name="1week-profile" rate-limit=3.0M/1.5M session-timeout=7d shared-users=1
add name="1month-profile" rate-limit=3.5M/2.0M session-timeout=30d shared-users=1

# 2. Hotspot Server Profile & HTTP PAP Authentication
/ip hotspot profile
set [ find default=yes ] dns-name="wifi.mtaa.net" hotspot-address=192.168.88.1 html-directory=hotspot http-cookie-lifetime=3d login-by=http-chap,http-pap,mac-cookie name=hsprof1 use-radius=no

# 3. Enable Hotspot Server on Bridge / LAN
/ip hotspot
set [ find default=yes ] address-pool=hs-pool-1 disabled=no interface=bridge profile=hsprof1 name=hs-mtaa

# 4. Enable Fast Connection Tracking & Firewall Bypass for Portal
/ip firewall nat
add action=masquerade chain=srcnat comment="Hotspot Masquerade" src-address=192.168.88.0/24

# 5. Anti-Tethering & Anti-Hotspot-Sharing (Zuia Kushare Wi-Fi kwa QR/Hotspot)
/ip firewall mangle
add action=change-ttl chain=postrouting comment="Zuia Kushare Wi-Fi - Change Outgoing TTL to 64" new-ttl=set:64 out-interface=all-ethernet passive=no
add action=change-ttl chain=postrouting comment="Zuia Kushare Wi-Fi - Change Outgoing TTL to 64 (Wireless Bridge)" new-ttl=set:64 out-interface=bridge passive=no
`;

  // 3. Walled Garden Script for M-Pesa / Tigo Pesa / Payment Gateways
  const walledGardenScript = `# ==============================================================
# WALLED GARDEN - ALLOWING MOBILE MONEY & PAYMENTS WITHOUT VOUCHER
# ==============================================================

/ip hotspot walled-garden
add comment="Allow Payment Gateway API" dst-host="*.paypack.co"
add comment="Allow Beem Africa Payments" dst-host="*.beem.africa"
add comment="Allow Selcom Paytech" dst-host="*.selcom.net"
add comment="Allow AzamPay Gateway" dst-host="*.azampay.com"
add comment="Allow Vodacom M-Pesa Domains" dst-host="*.vodacom.co.tz"
add comment="Allow Tigo Pesa Domains" dst-host="*.tigo.co.tz"
add comment="Allow Airtel Money Domains" dst-host="*.airtel.co.tz"

/ip hotspot walled-garden ip
add action=accept comment="DNS resolution for captive portal" dst-port=53 protocol=udp
`;

  // 4. SaaS REST API Specifications for Any Custom Hardware Gateway
  const saasApiGuide = `{
  "platform": "Mtaa WiFi Hardware-Agnostic SaaS Engine",
  "version": "v1.0.0",
  "hotspot_name": "${settings.hotspotName}",
  "merchant_id": "${settings.merchantNumber}",
  "endpoints": {
    "1_authorize_user": {
      "method": "POST",
      "url": "https://api.mtaawifi.net/v1/gateway/authorize",
      "headers": { "Authorization": "Bearer YOUR_HOTSPOT_SECRET_KEY" },
      "request_body": {
        "voucher_code": "8492",
        "mac_address": "AA:BB:CC:DD:EE:FF",
        "ip_address": "192.168.1.105"
      },
      "response": {
        "status": "success",
        "session_id": "sess_991823",
        "duration_hours": 24,
        "expires_at": "2026-10-06T14:00:00Z",
        "rate_limit_kbps": { "upload": 1024, "download": 2560 }
      }
    },
    "2_poll_expired_sessions": {
      "method": "GET",
      "url": "https://api.mtaawifi.net/v1/gateway/expired-sessions",
      "response": {
        "expired_macs": ["AA:BB:CC:DD:EE:FF", "11:22:33:44:55:66"]
      }
    },
    "3_gateway_heartbeat": {
      "method": "POST",
      "url": "https://api.mtaawifi.net/v1/gateway/heartbeat",
      "request_body": {
        "active_clients_count": 14,
        "uptime_seconds": 86400,
        "bandwidth_usage_mb": 4210
      }
    }
  }
}`;

  // 5. Architecture Comparison & Roadmap Guide
  const architectureGuide = `# ==============================================================
# ARCHITECTURE GUIDE: HARDWARE-AGNOSTIC SAAS HOTSPOT BILLING
# ==============================================================

1. NINI TOFAUTI KATI YA AIRTEL ROUTER PEKEE VS LOCAL GATEWAY VS MIKROTIK?

   [ A. AIRTEL ROUTER PEKEE (Bila Gateway yoyote) ]
   - Architecture: Airtel Router ➔ AP ➔ Customers
   - Limit: Airtel Router haina captive portal wala firewall ya kutambua au kukata simu moja moja.
   - Matumizi: Inafaa kwa siku za mwanzo wakati unakusanya pesa kwa M-Pesa kwa mikono.

   [ B. OPENWRT / LINUX LOCAL GATEWAY (OpenNDS / Raspberry Pi / OpenWrt Router) ]
   - Architecture: Airtel Router ➔ OpenWrt Gateway (Tsh 40k-80k) ➔ AP ➔ Customers
   - Uwezo: KUKATA AUTOMATIC 100%! OpenNDS au iptables daemon inamzuia mteja mara tu muda wake ukipita kwenye Cloud Database!
   - Faida Kuu: Haufungwi na MikroTik. Unaweza kutumia router yoyote ya bei nafuu uliyoflash OpenWrt!

   [ C. MIKROTIK ROUTEROS GATEWAY (hEX / RB750Gr3) ]
   - Architecture: Airtel Router ➔ MikroTik hEX (Tsh 120k) ➔ AP ➔ Customers
   - Uwezo: KUKATA AUTOMATIC 100%! Hotspot Engine iliyotengenezwa tayari.

2. MBINU YA KUUZA MFUMO WAKO KAMA SAAS (SUBSCRIPTION SOFTWARE)
   - Kwa sababu tunajenga mfumo wa SaaS wa kuuzia wajasiriamali wengine:
   - Cloud Engine yako inawasiliana na Gateway ya Aina Yoyote kupitia REST API / Webhooks!
   - Mteja wako (Mnunuzi wa SaaS) anaweza kuchagua kutumia OpenWrt, MikroTik, au Linux Mini PC!`;

  // 6. Complete Production-Grade MikroTik login.html File
  const mikrotikLoginHtml = `<!DOCTYPE html>
<html lang="sw">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${settings.hotspotName} - Ingia Mtandaoni</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 22px; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; margin-bottom: 18px; }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
    h1 { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .packages { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; }
    .pkg-item { background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 12px; text-align: left; cursor: pointer; transition: all 0.2s; }
    .pkg-item:hover, .pkg-item.selected { border-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
    .pkg-title { font-size: 12px; font-weight: 700; color: #e2e8f0; }
    .pkg-price { font-size: 14px; font-weight: 900; color: #f59e0b; margin-top: 3px; }
    .pkg-info { font-size: 10px; color: #10b981; font-weight: 600; margin-top: 2px; }
    .input-group { margin-bottom: 12px; }
    label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
    input[type="text"], input[type="tel"] { width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #ffffff; font-size: 14px; font-weight: 600; outline: none; }
    input:focus { border-color: #f59e0b; }
    .btn-submit { width: 100%; padding: 13px; background: #f59e0b; color: #0f172a; border: none; border-radius: 12px; font-size: 13px; font-weight: 900; cursor: pointer; text-transform: uppercase; transition: background 0.2s; }
    .btn-submit:hover { background: #d97706; }
    .lipa-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 12px; margin: 14px 0; font-size: 11px; color: #a7f3d0; line-height: 1.5; }
    .faq-title { font-size: 11px; font-weight: 800; color: #94a3b8; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .faq-item { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px; margin-bottom: 6px; font-size: 11px; }
    .faq-q { font-weight: 700; color: #f1f5f9; }
    .faq-a { color: #94a3b8; font-size: 10px; margin-top: 4px; line-height: 1.4; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #64748b; }
    .footer a { color: #10b981; font-weight: 700; text-decoration: none; }
    .error-msg { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 12px; border-radius: 10px; font-size: 11px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">LEMA FAST WIFI • FIBER & STARLINK</span>
      <h1>${settings.hotspotName}</h1>
      <p class="sub">${settings.tagline || 'Intaneti ya Kasi ya Fiber & Starlink'}</p>
    </div>

    $(if error)
    <div class="error-msg">⚠️ $(error)</div>
    $(endif)

    <!-- 1. Voucher Input Form (MikroTik Standard Form POST) -->
    <form name="login" action="$(link-login-only)" method="post">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="hidden" name="popup" value="true" />

      <div class="input-group">
        <label>Una Vocha Mkononi? Weka Hapa:</label>
        <input type="text" name="username" id="voucher_code" placeholder="WIF- au Tarakimu 4" required />
        <input type="hidden" name="password" id="voucher_pass" />
      </div>

      <button type="submit" class="btn-submit" onclick="document.getElementById('voucher_pass').value = document.getElementById('voucher_code').value;">
        UNGANISHA MTANDAO SASA
      </button>
    </form>

    <!-- 2. Package Selector & Mobile Money (Lipa Namba) -->
    <div class="faq-title">Au Nunua Kifurushi cha Mtandao:</div>
    <div class="packages">
      <div class="pkg-item selected">
        <div class="pkg-title">Saa 2 za Haraka</div>
        <div class="pkg-price">TZS 500</div>
        <div class="pkg-info">✓ Bila Kikomo</div>
      </div>
      <div class="pkg-item">
        <div class="pkg-title">Saa 24 (Siku 1) ⭐</div>
        <div class="pkg-price">TZS 1,000</div>
        <div class="pkg-info">✓ Bora Zaidi</div>
      </div>
      <div class="pkg-item">
        <div class="pkg-title">Siku 7 (Wiki 1)</div>
        <div class="pkg-price">TZS 5,000</div>
        <div class="pkg-info">✓ Unlimited</div>
      </div>
      <div class="pkg-item">
        <div class="pkg-title">Siku 30 (Mwezi 1)</div>
        <div class="pkg-price">TZS 25,000</div>
        <div class="pkg-info">✓ Wateja wa Ndani</div>
      </div>
    </div>

    <!-- Lipa Namba Info Box -->
    <div class="lipa-box">
      <strong>💳 Malipo ya Simu (M-Pesa / Mixx by Yas / Airtel):</strong><br>
      Tuma kwenda Lipa Namba: <strong style="color:#ffffff; font-family:monospace;">${settings.payoutAccount || '5849201'}</strong> (${settings.accountOwnerName || 'Jimmy Lema'}).<br>
      Ukishatuma, weka namba ya muamala au piga <strong style="color:#ffffff;">${settings.supportPhone || '0653 578 184'}</strong> kuwashiwa mara moja!
    </div>

    <!-- 3 Essential FAQs -->
    <div class="faq-title">Maswali Yanayoulizwa (FAQ):</div>
    <div class="faq-item">
      <div class="faq-q">1. Je, nitaunganishwa moja kwa moja baada ya kulipa?</div>
      <div class="faq-a">Ndiyo! Mara tu malipo yanapokamilika unaunganishwa papo hapo.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">2. Nikizima WiFi au kuondoka nitarudi vipi?</div>
      <div class="faq-a">Simu yako inatambuliwa kiotomatiki kwa MAC Address. Ukirudi unawasha WiFi na kuendelea bila kulipa tena.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">3. Vocha yangu inaweza kutumika simu nyingine?</div>
      <div class="faq-a">Hapana. Vocha inatumika simu moja tu kwa wakati mmoja ili kuzuia wizi wa bando lako.</div>
    </div>

    <div class="footer">
      Msaada wa Haraka: <a href="https://wa.me/255653578184" target="_blank">${settings.supportPhone || '0653 578 184'} (WhatsApp)</a><br>
      <span style="font-size: 10px; color: #475569;">IP: $(ip) • MAC: $(mac)</span>
    </div>
  </div>
</body>
</html>`;

  const getActiveCode = () => {
    if (activeTab === 'mikrotik-html') return mikrotikLoginHtml;
    if (activeTab === 'omada') return omadaScript;
    if (activeTab === 'openwrt') return openwrtScript;
    if (activeTab === 'mikrotik') return mikrotikScript;
    if (activeTab === 'walled-garden') return walledGardenScript;
    if (activeTab === 'saas-api') return saasApiGuide;
    return architectureGuide;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    const filename =
      activeTab === 'mikrotik-html'
        ? 'login.html'
        : activeTab === 'omada'
        ? 'tp-link-omada-setup.txt'
        : activeTab === 'openwrt'
        ? 'openwrt-opennds-setup.sh'
        : activeTab === 'saas-api'
        ? 'saas-gateway-api.json'
        : activeTab === 'walled-garden'
        ? 'walled-garden.rsc'
        : activeTab === 'architecture'
        ? 'hotspot-saas-architecture.md'
        : 'mikrotik-hotspot.rsc';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LemaLogo variant="horizontal" size="xs" theme="dark" showSlogan={false} />
            <span className="text-stone-500 text-xs hidden sm:inline">|</span>
            <span className="text-white font-bold text-xs sm:text-sm">Router Setup & Portal Scripts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-950 border-b border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('mikrotik-html')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mikrotik-html'
                ? 'bg-amber-400 text-stone-950 font-black shadow-lg shadow-amber-400/20'
                : 'text-amber-400 hover:bg-stone-850 border border-amber-500/40'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>MikroTik login.html</span>
            <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black uppercase">
              Pakua
            </span>
          </button>
          <button
            onClick={() => setActiveTab('omada')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'omada'
                ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20'
                : 'text-blue-400 hover:bg-stone-850 border border-blue-500/30'
            }`}
          >
            TP-Link Omada (AP/Router)
          </button>
          <button
            onClick={() => setActiveTab('openwrt')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'openwrt'
                ? 'bg-emerald-400 text-stone-950 font-bold'
                : 'text-emerald-400 hover:bg-stone-850 border border-emerald-500/30'
            }`}
          >
            OpenWrt / Linux Gateway
          </button>
          <button
            onClick={() => setActiveTab('mikrotik')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'mikrotik'
                ? 'bg-amber-400 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            MikroTik RouterOS (.rsc)
          </button>
          <button
            onClick={() => setActiveTab('walled-garden')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'walled-garden'
                ? 'bg-amber-400 text-stone-950'
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            Walled Garden (Malipo)
          </button>
          <button
            onClick={() => setActiveTab('saas-api')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'saas-api'
                ? 'bg-cyan-400 text-stone-950 font-bold'
                : 'text-cyan-400 hover:bg-stone-850 border border-cyan-500/30'
            }`}
          >
            SaaS Gateway REST API
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-stone-100 text-stone-950 font-bold'
                : 'text-stone-400 hover:bg-stone-850'
            }`}
          >
            Mwongozo wa Architecture
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-950 font-mono text-xs text-stone-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{getActiveCode()}</pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">
            Nakili na ubandike (Paste) moja kwa moja kwenye Terminal ya MikroTik Winbox.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Imenakiliwa!' : 'Nakili (Copy)'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pakua Faili (Download)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
