import React, { useState } from 'react';
import { HotspotSettings } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import { X, Copy, Check, Terminal, FileCode2, Download, Radio, Zap } from 'lucide-react';

interface SmartApScriptModalProps {
  settings: HotspotSettings;
  onClose: () => void;
}

export const SmartApScriptModal: React.FC<SmartApScriptModalProps> = ({ settings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'omada' | 'walled-garden' | 'openwrt' | 'saas-api' | 'architecture'>('omada');
  const [copied, setCopied] = useState<boolean>(false);

  // 1. TP-Link Omada External Portal & Cloud Hotspot (Omada Controller v6.3)
  const omadaScript = `# ==============================================================
# LEMA FAST WIFI - TP-LINK OMADA CONTROLLER V6.3 & EAP SETUP
# Jina la Mtandao (SSID): ${settings.hotspotName}
# Inafaa: TP-Link EAP772 (Wi-Fi 7), EAP610, EAP225, EAP110
# Hardware: [ ISP Modem / Starlink ] ➔ [ PoE Injector ] ➔ [ TP-Link EAP772 ]
# ==============================================================

SURA YA 1: MUUNDO NA MAELEKEZO YA OMADA CONTROLLER V6.3
1. EAP772 inahitaji kuunganishwa (Adopt) kwenye Omada Controller (v6.3.0.1.1.1).
   - Controller inaweza kuwa kwenye VPS yenye Public IP (inayofikiwa na server ya Render) au PC ya majaribio.
   - Hakikisha AP inaonekana "Connected" kwenye tovuti ya Controller.

SURA YA 2: HATUA YA KWANZA - TENGENEZA HOTSPOT OPERATOR
1. Kwenye Omada Controller v6.3:
   - Nenda: Hotspot Manager (au Settings ➔ Authentication ➔ Hotspot)
   - Chagua: "Operators" ➔ "+ Create New Operator"
   - Operator Name: Weka jina (mfano: lema_operator)
   - Password: Weka password kali
   - Privilege / Site: Chagua Site ya wateja wako (mfano: Default)

SURA YA 3: HATUA YA PILI - WEKA EXTERNAL PORTAL SERVER
1. Kwenye Omada Controller:
   - Nenda: Settings ➔ Authentication ➔ Portal ➔ "+ Create New Portal"
   - Portal Name: ${settings.hotspotName} Portal
   - Applies To: Chagua SSID ya wateja (mfano: "${settings.hotspotName}")
   - Authentication Type: Chagua "External Portal Server"
   - Portal URL: https://lemawifi.online/portal
   - IP / Hostname: lemawifi.online

2. PRE-AUTHENTICATION ACCESS (WALLED GARDEN):
   - Washa (Enable) "Pre-Authentication Access"
   - Ongeza:
     - lemawifi.online
     - www.lemawifi.online
     - fonts.googleapis.com
     - fonts.gstatic.com
     - cdn.jsdelivr.net

SURA YA 4: HATUA YA TATU - NUKUU CONTROLLER ID NA ENVS ZA SEVA
1. Ingia kwenye Controller yako kupitia kivinjari (https://IP-YA-CONTROLLER:8043).
2. Baada ya kuingia, tazama URL kwenye kivinjari:
   https://...:8043/<HERUFI 32 ZA CONTROLLER ID>/...
3. Weka vigezo hivi kwenye Environment Variables za Seva yako (kwenye Render au .env):
   OMADA_URL=https://omada.lemawifi.online:8043
   OMADA_ID=<Herufi 32 ulizozinakili>
   OMADA_OPERATOR=lema_operator
   OMADA_OPERATOR_PASSWORD=<Password uliyoweka>
   ADMIN_API_KEY=<Neno refu la siri la kulinda vocha>
   PAYMENTS_ENABLED=0

SURA YA 5: JINSI MFUMO UNAVYOFANYA KAZI AUTOMATIC
1. Mteja akichomeka simu kwenye Wi-Fi, anapelekwa https://lemawifi.online/portal.
2. Mteja akiingiza nambari ya vocha, seva inathibitisha vocha na kuita moja kwa moja:
   POST /<OMADA_ID>/api/v2/hotspot/extPortal/auth
3. Controller inamfungulia mtandao papo hapo na kuanza kuhesabu muda wake!`;

  // 2. Walled Garden Allowlist for Mobile Money
  const walledGardenScript = `# ==============================================================
# LEMA FAST WIFI - WALLED GARDEN & PAYMENT GATEWAYS ALLOWLIST
# Inafanya kazi kwenye: TP-Link Omada AP na Starlink / ISP Modem
# ==============================================================

# Orodha ya Vikoa (Domains) Vinavyotakiwa Kuruhusiwa Bila Vocha:
# Weka hizi kwenye sehemu ya "Auth-Free Whitelist" au "Pre-Auth Access":

lemawifi.online
api.lemawifi.online
*.vodacom.co.tz
*.tigo.co.tz
*.airtel.co.tz
*.halotel.co.tz
*.selcom.net
*.beem.africa
*.paypack.co
*.azampay.com
*.swalasms.com

# DNS Ports Zinazotakiwa Kuwa Wazi:
Port: 53 (UDP/TCP - Domain Name Resolution)
Port: 80 (HTTP - Captive Portal Redirection)
Port: 443 (HTTPS - Secure Payment Checkouts)`;

  // 3. OpenWrt / Linux Smart Gateway
  const openwrtScript = `# ==============================================================
# LEMA FAST WIFI - TP-LINK OMADA / OPENNDS CAPTIVE PORTAL CONFIGURATION
# Hotspot Name: ${settings.hotspotName}
# Works on: TP-Link Omada Gateway / OpenWrt AP
# ==============================================================

# 1. Install OpenNDS Captive Portal
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
list authenticated_users 'allow all to *.lemawifi.online'
list authenticated_users 'allow all to *.vodacom.co.tz'
list authenticated_users 'allow all to *.tigo.co.tz'
list authenticated_users 'allow all to *.airtel.co.tz'
list authenticated_users 'allow all to *.selcom.net'
EOF

# 3. Enable & Restart OpenNDS Service
/etc/init.d/opennds enable
/etc/init.d/opennds restart

# 4. Automatic Expiry Sync Daemon (Cron Script)
cat << 'EOF' > /usr/bin/hotspot-expiry-sync.sh
#!/bin/sh
EXPIRED_MACS=$(curl -s -X GET "https://www.lemawifi.online/api/v1/sessions/expired?hotspot_id=${settings.merchantNumber}")
for mac in $EXPIRED_MACS; do
  openndsctl deauth "$mac"
  echo "[HOTSPOT] Expired & Deauthorized MAC: $mac"
done
EOF

chmod +x /usr/bin/hotspot-expiry-sync.sh
(crontab -l 2>/dev/null; echo "* * * * * /usr/bin/hotspot-expiry-sync.sh") | crontab -
`;

  // 4. Cloud REST API Specifications for Hardware Controller
  const saasApiGuide = `{
  "platform": "Lema Fast WiFi Standalone TP-Link Omada AP SaaS Engine",
  "version": "v2.0.0 (Standalone Cloud AP Architecture)",
  "hotspot_name": "${settings.hotspotName}",
  "merchant_id": "${settings.merchantNumber}",
  "endpoints": {
    "1_authorize_user": {
      "method": "POST",
      "url": "https://www.lemawifi.online/api/v1/gateway/authorize",
      "headers": { "Authorization": "Bearer YOUR_HOTSPOT_SECRET_KEY" },
      "request_body": {
        "voucher_code": "8492",
        "mac_address": "AA:BB:CC:DD:EE:FF",
        "ip_address": "192.168.88.115"
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
      "url": "https://www.lemawifi.online/api/v1/gateway/expired-sessions",
      "response": {
        "expired_macs": ["AA:BB:CC:DD:EE:FF", "11:22:33:44:55:66"]
      }
    },
    "3_ap_heartbeat": {
      "method": "POST",
      "url": "https://www.lemawifi.online/api/v1/hardware/heartbeat",
      "request_body": {
        "ip": "192.168.1.153",
        "mac": "D4:D6:DF:0D:B3:A0",
        "active_clients_count": 14,
        "status": "online"
      }
    }
  }
}`;

  // 5. Architecture Comparison & Roadmap Guide
  const architectureGuide = `# ==============================================================
# BLUEPRINT YA USANIFU: TP-LINK OMADA AP + MODEM YA ISP (STANDALONE AP)
# ==============================================================

1. MFUMO WA TP-LINK OMADA AP + MODEM YA ISP (Architecture Rasmi ya Lema Fast WiFi)
   - Muundo wa Waya: [ Modemu ya ISP / Starlink ] ➔ [ PoE Injector ] ➔ [ TP-Link Omada AP ]
   - Modemu ya ISP (Airtel 5G, Halotel, Starlink au Fiber):
     • Inatoa intaneti ya kasi ya juu.
     • Inagawa IP addresses (DHCP) kwa wateja wote.
   - TP-Link Omada Outdoor AP:
     • Inarusha mawimbi yenye nguvu mtaani (mita 150 hadi 250).
     • Ina ukurasa wa vocha ndani yake (Captive Portal).
     • Inafunga na kufungulia wateja intaneti kulingana na malipo ya M-Pesa.
     • Inadhibiti spidi (Bandwidth Management) moja kwa moja kwenye AP!

2. KWA NINI TUNATUMIA TP-LINK OMADA AP PEKEE?
   ✓ Gharama Ndogo Sana: Huhitaji kununua router ya ziada ya gharama kubwa.
   ✓ Usanidi Rahisi: Kila kitu kinasanidiwa kwa simu kupitia Omada App au Omada Cloud.
   ✓ Uimara wa Umeme: Vifaa vichache vinavyotumia umeme (AP moja na Modemu moja tu).
   ✓ Matengenezo Machache: Hakuna tatizo la router kuganda au kujaza RAM.`;

  const getActiveCode = () => {
    if (activeTab === 'omada') return omadaScript;
    if (activeTab === 'walled-garden') return walledGardenScript;
    if (activeTab === 'openwrt') return openwrtScript;
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
      activeTab === 'omada'
        ? 'tp-link-omada-setup.txt'
        : activeTab === 'openwrt'
        ? 'openwrt-opennds-setup.sh'
        : activeTab === 'saas-api'
        ? 'saas-gateway-api.json'
        : activeTab === 'walled-garden'
        ? 'walled-garden-whitelist.txt'
        : 'ap-only-architecture.md';

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
            <span className="text-white font-bold text-xs sm:text-sm">TP-Link Omada AP Setup (Standalone AP)</span>
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
            onClick={() => setActiveTab('omada')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'omada'
                ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20'
                : 'text-blue-400 hover:bg-stone-850 border border-blue-500/30'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>TP-Link Omada AP</span>
          </button>

          <button
            onClick={() => setActiveTab('walled-garden')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'walled-garden'
                ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-stone-850 border border-emerald-500/30'
            }`}
          >
            Walled Garden (Malipo)
          </button>

          <button
            onClick={() => setActiveTab('openwrt')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'openwrt'
                ? 'bg-purple-500 text-white font-bold'
                : 'text-purple-400 hover:bg-stone-850 border border-purple-500/30'
            }`}
          >
            OpenWrt / Linux Gateway
          </button>

          <button
            onClick={() => setActiveTab('saas-api')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'saas-api'
                ? 'bg-stone-700 text-white font-bold'
                : 'text-stone-400 hover:bg-stone-850 border border-stone-700'
            }`}
          >
            Cloud API
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-stone-700 text-white font-bold'
                : 'text-stone-400 hover:bg-stone-850 border border-stone-700'
            }`}
          >
            Muundo (Blueprint)
          </button>
        </div>

        {/* Code display area */}
        <div className="p-4 flex-1 overflow-y-auto bg-stone-950 font-mono text-xs leading-relaxed text-stone-300">
          <pre className="whitespace-pre-wrap select-all font-mono">{getActiveCode()}</pre>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between bg-stone-900 gap-3">
          <div className="text-[11px] text-stone-400 hidden sm:block">
            {activeTab === 'omada' && 'TP-Link Omada External Portal & RADIUS Setup Guide'}
            {activeTab === 'walled-garden' && 'Vikoa vya malipo ya M-Pesa, Mixx by Yas, na Tigo bila vocha'}
            {activeTab === 'openwrt' && 'OpenWrt OpenNDS configuration script'}
            {activeTab === 'saas-api' && 'REST API schema ya kusawazisha na TP-Link Omada Cloud'}
            {activeTab === 'architecture' && 'Mwongozo wa kutumia TP-Link Omada AP + Modemu ya ISP moja kwa moja'}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Imenakiliwa!' : 'Nakili Maelekezo'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pakua Faili</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
