import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Smartphone, 
  Radio, 
  Terminal, 
  Copy, 
  Check, 
  Lock, 
  Cpu, 
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Fingerprint,
  Zap,
  Sparkles,
  DollarSign,
  Globe,
  Wifi,
  Layers,
  AlertTriangle,
  Send,
  Share2,
  Sliders,
  Shield,
  Activity,
  BellRing
} from 'lucide-react';

interface AntiTetheringManagerProps {
  hotspotName?: string;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

interface TetheringIncident {
  id: string;
  time: string;
  primaryDevice: string;
  primaryMac: string;
  ipAddress: string;
  voucherCode: string;
  detectedSecondaryDevices: number;
  detectedSecondaryTypes: string[];
  ttlPattern: string;
  status: 'blocked' | 'throttled' | 'flagged';
  riskScore: number;
}

export const AntiTetheringManager: React.FC<AntiTetheringManagerProps> = ({
  hotspotName = 'Lema Fast WiFi',
  onShowToast,
}) => {
  // Anti-Tethering Controls State
  const [ttlLockEnabled, setTtlLockEnabled] = useState<boolean>(true);
  const [fixedTtlValue, setFixedTtlValue] = useState<number>(64);
  const [fingerprintBindingEnabled, setFingerprintBindingEnabled] = useState<boolean>(true);
  const [enforcementStrategy, setEnforcementStrategy] = useState<'block' | 'throttle' | 'redirect'>('throttle');
  const [throttleSpeedKbps, setThrottleSpeedKbps] = useState<number>(128);
  const [autoKillSecondaryEnabled, setAutoKillSecondaryEnabled] = useState<boolean>(true);
  const [strictUserAgentCheck, setStrictUserAgentCheck] = useState<boolean>(true);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState<'monitor' | 'rules' | 'fingerprints' | 'nextgen' | 'scripts'>('monitor');

  // Next-Gen 2026 Advanced Heuristics & Monetization States
  const [monetizeUpsellEnabled, setMonetizeUpsellEnabled] = useState<boolean>(true);
  const [addonPriceTzs, setAddonPriceTzs] = useState<number>(500);
  const [antiVpnShieldEnabled, setAntiVpnShieldEnabled] = useState<boolean>(true);
  const [blockDohDot, setBlockDohDot] = useState<boolean>(true);
  const [tcpClockSkewInspection, setTcpClockSkewInspection] = useState<boolean>(true);
  const [maxConcurrentTcpPerIp, setMaxConcurrentTcpPerIp] = useState<number>(70);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState<boolean>(true);
  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState<string>('0712 345 678');
  const [selfTransferAllowed, setSelfTransferAllowed] = useState<boolean>(true);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  // Simulated incidents list (Real-world cases in Tanzania street hotspots)
  const [incidents, setIncidents] = useState<TetheringIncident[]>([
    {
      id: 'inc-101',
      time: 'Dakika 2 zilizopita',
      primaryDevice: 'Samsung Galaxy A14 (Mteja)',
      primaryMac: '58:9C:FC:72:09:A4',
      ipAddress: '192.168.88.42',
      voucherCode: 'V-98214',
      detectedSecondaryDevices: 3,
      detectedSecondaryTypes: ['Tecno Spark 10', 'Infinix Hot 30', 'HP Laptop'],
      ttlPattern: 'TTL=63 & TTL=127 detected behind IP',
      status: 'blocked',
      riskScore: 98,
    },
    {
      id: 'inc-102',
      time: 'Dakika 18 zilizopita',
      primaryDevice: 'Redmi Note 12 Pro',
      primaryMac: '84:C7:EA:18:2B:F1',
      ipAddress: '192.168.88.67',
      voucherCode: 'V-44109',
      detectedSecondaryDevices: 2,
      detectedSecondaryTypes: ['iPhone 11', 'Smart TV Box'],
      ttlPattern: 'Mixed User-Agents (Darwin/iOS + Android WebKit)',
      status: 'throttled',
      riskScore: 84,
    },
    {
      id: 'inc-103',
      time: 'Saa 1 lililopita',
      primaryDevice: 'Itel A60',
      primaryMac: 'A0:B3:CC:89:12:44',
      ipAddress: '192.168.88.112',
      voucherCode: 'V-11029',
      detectedSecondaryDevices: 1,
      detectedSecondaryTypes: ['Tecno Pop 7'],
      ttlPattern: 'TTL decrement jump from 64 to 63',
      status: 'blocked',
      riskScore: 92,
    },
    {
      id: 'inc-104',
      time: 'Saa 2 zilizopita',
      primaryDevice: 'Infinix Smart 8',
      primaryMac: '1C:69:20:99:A1:EE',
      ipAddress: '192.168.88.88',
      voucherCode: 'V-77401',
      detectedSecondaryDevices: 4,
      detectedSecondaryTypes: ['Dell Latitude', 'Samsung A04', 'Tecno Spark', 'PlayStation 4'],
      ttlPattern: 'Multiple TCP window variations on single session',
      status: 'blocked',
      riskScore: 99,
    },
  ]);

  // Fingerprint database simulation
  const [fingerprintRecords, setFingerprintRecords] = useState([
    {
      id: 'fp-1',
      deviceModel: 'Samsung Galaxy A14 5G',
      realVendor: 'Samsung Electronics',
      macAddress: '58:9C:FC:72:09:A4',
      isMacRandomized: false,
      hardwareHash: 'FP-SHA256: 8a4f...39e1',
      canvasHash: '98d41a',
      webglRenderer: 'Mali-G68 MP2',
      boundVoucher: 'V-98214',
      status: 'Flagged (Tethering Host)',
    },
    {
      id: 'fp-2',
      deviceModel: 'iPhone 13 (iOS 17.4)',
      realVendor: 'Apple Inc.',
      macAddress: 'DA:12:88:FF:42:19',
      isMacRandomized: true, // Apple Private Wi-Fi Address!
      hardwareHash: 'FP-SHA256: c32a...91d2',
      canvasHash: '42b109',
      webglRenderer: 'Apple A15 GPU',
      boundVoucher: 'V-55102',
      status: 'Clean (Single Device Bound)',
    },
    {
      id: 'fp-3',
      deviceModel: 'Tecno Camon 20 Pro',
      realVendor: 'Transsion Holdings',
      macAddress: 'E4:A7:C5:10:99:66',
      isMacRandomized: true,
      hardwareHash: 'FP-SHA256: 7f12...44a0',
      canvasHash: '11e998',
      webglRenderer: 'Mali-G77 MC9',
      boundVoucher: 'V-31092',
      status: 'Clean (Single Device Bound)',
    },
  ]);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedScript(label);
    if (onShowToast) {
      onShowToast('Imenakiliwa!', `${label} imenakiliwa kikamilifu.`, 'success');
    }
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const handleResolveIncident = (id: string, action: 'allow' | 'block') => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: action === 'block' ? 'blocked' : 'flagged' } : inc))
    );
    if (onShowToast) {
      onShowToast(
        action === 'block' ? 'Kifaa Kimezuiwa' : 'Kifaa Kimeruhusiwa',
        `Kitendo cha usalama kimeidhinishwa kwenye session.`,
        'info'
      );
    }
  };

  // MikroTik RouterOS Anti-Tethering Rules (TTL Mangle + DNS Cache Defense)
  const mikrotikAntiTetheringScript = `# ==============================================================
# ${hotspotName.toUpperCase()} - ANTI-TETHERING & ANTI-HOTSPOT SHARING
# Kinga dhidi ya wateja wanaoshea vocha 1 kwa simu 5 mtaani
# ==============================================================

# 1. SET INCOMING & OUTGOING TTL TO CONSTANT VALUE (64)
# Mteja anapowasha hotspot kwenye simu yake, pakiti za simu ya pili
# zinapungua TTL kwa 1 (kutoka 64 hadi 63). Router yetu inawalazimisha wote
# wawe na TTL ya mwisho 1, hivyo pakiti za ziada zinatupwa papo hapo!

/ip firewall mangle
add action=change-ttl chain=postrouting comment="[${hotspotName}] Zuia Hotspot Sharing - Fixed TTL" new-ttl=set:${fixedTtlValue} out-interface=all-ethernet passthrough=no
add action=change-ttl chain=prerouting comment="[${hotspotName}] Detect Tethered Packets with Decreased TTL" in-interface=bridge new-ttl=set:${fixedTtlValue} passthrough=no

# 2. DROP PACKETS FROM DEVICES BEHIND PHONE HOTSPOT (TTL <= 1)
/ip firewall filter
add action=drop chain=forward comment="[${hotspotName}] Tupa Pakiti zote zilizotoka kwa simu iliyoshea (TTL=1)" ttl=equal:1
add action=drop chain=forward comment="[${hotspotName}] Tupa Pakiti zenye TTL zilizopungua (Zero-Hop)" ttl=equal:0

# 3. ZUIA DNS LEAK & ROGUE DNS PROXIES
/ip dns
set allow-remote-requests=yes cache-size=4096KiB max-udp-packet-size=4096
/ip firewall nat
add action=redirect chain=dstnat comment="Force All Hotspot Clients to Internal DNS" dst-port=53 protocol=udp to-ports=53
add action=redirect chain=dstnat comment="Force All TCP DNS to Internal DNS" dst-port=53 protocol=tcp to-ports=53

# 4. REJESTA LOGS ZA WATEJA WANAOJARIBU KUSHEA
/ip firewall mangle
add action=log chain=prerouting comment="Log Hotspot Sharing Attempt" log-prefix="[TETHERING_ALERT]" ttl=equal:63
`;

  // MikroTik Anti-VPN & Tunneling / HA Tunnel Bypass Script
  const mikrotikAntiTunnelingScript = `# ==============================================================
# ${hotspotName.toUpperCase()} - ANTI-VPN & TUNNELING BYPASS SHIELD (2026)
# Zuia HA Tunnel, HTTP Injector, DroidVPN, Cloudflare WARP & DoT
# ==============================================================

# 1. ZUIA DNS OVER TLS (DoT - Port 853) & QUIC/UDP-443 TUNNELING
/ip firewall filter
add action=drop chain=forward comment="[${hotspotName}] Zuia DoT (Port 853) Tunneling" dst-port=853 protocol=tcp
add action=drop chain=forward comment="[${hotspotName}] Zuia DoT (Port 853) Tunneling" dst-port=853 protocol=udp
add action=drop chain=forward comment="[${hotspotName}] Zuia QUIC/UDP-443 Tunnel Bypass" dst-port=443 protocol=udp

# 2. WEKA KIKOMO CHA MIUNGANISHO KWA KILA IP (TCP CONNECTION SPIKE LIMIT)
# Simu moja inatumia TCP sessions 30-60. Ikishea kwa simu 4-5, zinaruka 200+.
add action=drop chain=forward comment="[${hotspotName}] Zuia Hotspot Sharing Concurrency Spike" connection-limit=${maxConcurrentTcpPerIp},32 protocol=tcp tcp-flags=syn

# 3. ZUIA CUSTOM DROIDVPN / OPEN性的 TUNNEL PORTS KABLA YA KULIPIA VOCHA
add action=drop chain=forward comment="[${hotspotName}] Zuia UDP DNS Tunneling Ports" dst-port=5353,1194,51820 protocol=udp
`;

  // TP-Link Omada External Portal Device Binding & TTL Notes
  const omadaAntiTetheringGuide = `# ==============================================================
# TP-LINK OMADA CLOUD CONTROLLER - ANTI-SHARING BEST PRACTICES
# Mfumo: ${hotspotName}
# ==============================================================

1. WEZESHA "CLIENT ISOLATION" KWENYE WIRELESS NETWORK (SSID):
   - Fungua Omada Controller ➔ Wireless Networks ➔ WLAN
   - Chagua SSID ya biashara yako (mfano: "${hotspotName}")
   - Chini ya Advanced Settings: Washa [✓] "Client Isolation"
   - Faida: Simu ya mteja haitaweza kuwasiliana na simu ya jirani wala
     kutengeneza Wi-Fi Direct au Local Ad-hoc proxy!

2. RATE-LIMIT KWA KILA MTEJA (PER-CLIENT BANDWIDTH LIMIT):
   - Weka Rate Limit ya vocha kwa kila mteja kuwa 2.5 Mbps hadi 3.5 Mbps.
   - Hata mteja akijaribu kushea kwa Bluetooth au Wi-Fi Hotspot,
     intaneti itakuwa nzito sana kiasi kwamba marafiki zake watashindwa
     kuangalia video au kutumia WhatsApp vizuri, hivyo watalazimika
     kununua vocha zao wenyewe!

3. DEVICE FINGERPRINTING BINDING (PORTAL LEVEL):
   - Lango la Mtaa WiFi linasoma Browser Hardware Signature (Canvas + WebGL + Screen Res).
   - Vocha ikifunguliwa kwenye Tecno Spark 10, hata akitoa MAC au akibadili Random MAC,
     kifaa kingine kikiweka vocha hiyo hiyo kinakataliwa papo hapo kwa ujumbe:
     "Samahani! Vocha hii tayari inatumika na simu nyingine."
`;

  // Ruijie Reyee Cloud AP Configuration Script
  const ruijieAntiTetheringGuide = `# ==============================================================
# RUIJIE REYEE CLOUD (RG-RAP6262G / RAP2260) ANTI-TETHERING
# ==============================================================

1. WEKA L2 ISOLATION KWENYE AP RADIO SETTINGS:
   - Fungua Ruijie Cloud App au tovuti (cloud.ruijie.com)
   - Nenda: Project ➔ Configuration ➔ Wi-Fi ➔ Edit Wi-Fi
   - Washa kipengele cha "L2 Client Isolation = Enabled"
   - Hii inazima ARP sniffing na kushiriki mawimbi ya ndani ya mtandao.

2. WEKA LIMIT YA "ONE ACCOUNT ONE DEVICE":
   - Chini ya Captive Portal Settings ➔ Account / Voucher:
   - Weka "Concurrent Users = 1"
   - Vocha ikitumiwa, inafungwa kwa muda wote uliosalia.
`;

  return (
    <div className="space-y-6 animate-fadeIn text-[#3a3431]">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                    Anti-Tethering & Device Fingerprinting
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Guard
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Ulinzi wa hali ya juu: Zuia wateja kushea vocha 1 ya TZS 500 kwa simu 5 mtaani kupitia Hotspot au Bluetooth!
                </p>
              </div>
            </div>

            {/* Quick stats badges */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Wizi Uliozuiwa Leo</span>
                <span className="text-base font-black text-rose-400 font-mono">14 Matukio</span>
              </div>
              <div className="px-3.5 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Mapato Yaliyoookolewa</span>
                <span className="text-base font-black text-emerald-400 font-mono">+TZS 18,500</span>
              </div>
            </div>
          </div>

          {/* Quick Explanation Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-stone-950/60 border border-stone-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. TTL Lock (Network Layer)</span>
              </div>
              <p className="text-[10px] text-stone-300 leading-relaxed">
                Inalazimisha kila pakiti kuwa na TTL={fixedTtlValue}. Simu ya pili ikitaka kutumia intaneti kupitia simu ya kwanza, pakiti zake zinakufa router kabla hazijafika uwanjani.
              </p>
            </div>

            <div className="p-3 bg-stone-950/60 border border-stone-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-[11px]">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>2. Hardware Fingerprint (Device Layer)</span>
              </div>
              <p className="text-[10px] text-stone-300 leading-relaxed">
                Hata simu za kisasa (iPhone & Android 14) zikiwasha "Random MAC Address", mfumo unatambua GPU, Canvas, na Screen hash halisi na kuifunga vocha hapo!
              </p>
            </div>

            <div className="p-3 bg-stone-950/60 border border-stone-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5" />
                <span>3. Client Isolation (Wi-Fi Layer)</span>
              </div>
              <p className="text-[10px] text-stone-300 leading-relaxed">
                Inatenganisha wateja wote waliopo hewani kwenye Access Point (AP), kuzuia kusambaza intaneti kwa local proxy au Bluetooth PAN sharing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e6e2d3] pb-3">
        <button
          onClick={() => setSelectedSubTab('monitor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'monitor'
              ? 'bg-[#cca43b] text-white shadow-xs font-black'
              : 'bg-white border border-[#e6e2d3] text-stone-700 hover:bg-stone-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Matukio ya Moja kwa Moja (Live Tethering Radar)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-mono">
            {incidents.filter((i) => i.status === 'blocked').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedSubTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'rules'
              ? 'bg-[#cca43b] text-white shadow-xs font-black'
              : 'bg-white border border-[#e6e2d3] text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Mipangilio ya Kinga (Security Policies)</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('fingerprints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'fingerprints'
              ? 'bg-[#cca43b] text-white shadow-xs font-black'
              : 'bg-white border border-[#e6e2d3] text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Fingerprint Database (Random MAC Bypass Defense)</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('nextgen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            selectedSubTab === 'nextgen'
              ? 'bg-amber-500 text-stone-950 shadow-xs font-black'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 hover:from-amber-100 hover:to-orange-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Sifa za Kisasa za 2026 (Next-Gen AI & Defense)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-600 text-white font-black uppercase tracking-wider shadow-xs">
            Mpya
          </span>
        </button>

        <button
          onClick={() => setSelectedSubTab('scripts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'scripts'
              ? 'bg-[#cca43b] text-white shadow-xs font-black'
              : 'bg-white border border-[#e6e2d3] text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Router & AP Scripts (MikroTik / Omada / Ruijie)</span>
        </button>
      </div>

      {/* 1. MONITOR TAB: LIVE INCIDENTS */}
      {selectedSubTab === 'monitor' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Vifaa Vinavyotuhumiwa Kushea Mtandao (Live Tethering Detections)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Mfumo unakagua TTL hops, User-Agent collisions, na TCP window signatures kwa sekunde.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-600 font-mono">Radar: Active</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Muda & Vocha</th>
                    <th className="p-3.5">Kifaa Kikuu (Host)</th>
                    <th className="p-3.5">Simu Zinazoibia Nyuma (Leaked Devices)</th>
                    <th className="p-3.5">Ushahidi wa Kiufundi (Proof)</th>
                    <th className="p-3.5 text-center">Hatua ya Mfumo</th>
                    <th className="p-3.5 text-right">Msimamizi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Time & Voucher */}
                      <td className="p-3.5 font-mono">
                        <strong className="text-stone-800 text-xs block">{inc.voucherCode}</strong>
                        <span className="text-[10px] text-stone-400 font-sans">{inc.time}</span>
                      </td>

                      {/* Primary Device */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <strong className="text-stone-800 text-xs block font-sans">{inc.primaryDevice}</strong>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500">
                            <span>{inc.ipAddress}</span>
                            <span>·</span>
                            <span className="uppercase text-amber-700">{inc.primaryMac}</span>
                          </div>
                        </div>
                      </td>

                      {/* Detected secondary devices */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              {inc.detectedSecondaryDevices} Simu Zilizogundulika
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-600 flex flex-wrap gap-1">
                            {inc.detectedSecondaryTypes.map((t, idx) => (
                              <span key={idx} className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Technical Evidence */}
                      <td className="p-3.5 font-mono text-[10px] text-rose-600 font-semibold max-w-[200px]">
                        <div className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg">
                          {inc.ttlPattern}
                        </div>
                      </td>

                      {/* System action */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            inc.status === 'blocked'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : inc.status === 'throttled'
                              ? 'bg-amber-500 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {inc.status === 'blocked' ? 'Imefungwa (Blocked)' : 'Imepunguzwa Kasi (Throttled)'}
                        </span>
                      </td>

                      {/* Admin action */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inc.status === 'blocked' ? (
                            <button
                              onClick={() => handleResolveIncident(inc.id, 'allow')}
                              className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Fungulia
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResolveIncident(inc.id, 'block')}
                              className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Kata Mara Moja
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. RULES & SECURITY POLICIES TAB */}
      {selectedSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Rule 1: Fixed TTL enforcement */}
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#cca43b]" />
                  <span>Fixed TTL Mangle Lock</span>
                </h3>
                <p className="text-[10px] text-stone-500">Mbinu namba 1 ya dunia kuzuia Wi-Fi Hotspot Tethering.</p>
              </div>
              <button
                onClick={() => setTtlLockEnabled(!ttlLockEnabled)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                  ttlLockEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    ttlLockEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-500 font-bold block">Chaguo la Thamani ya TTL (Target TTL):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[64, 65, 128].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFixedTtlValue(val)}
                      className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all cursor-pointer ${
                        fixedTtlValue === val
                          ? 'border-[#cca43b] bg-amber-500/10 text-stone-900 font-black'
                          : 'border-[#e6e2d3] bg-[#fbf9f4] text-stone-600 hover:bg-[#f5f2eb]'
                      }`}
                    >
                      TTL = {val}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-400 block mt-1">
                  Kiwango cha kawaida cha Linux/Android na Apple iOS ni <strong>64</strong>.
                </span>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200/70 rounded-2xl space-y-1.5 text-[11px] text-stone-600 leading-relaxed font-sans">
                <strong className="text-stone-850 block">Jinsi inavyofanya kazi:</strong>
                Simu ya mteja inaporekebisha intaneti kwenda kwa simu nyingine (hotspot), simu hiyo inafanya kazi kama mini-router na kupunguza TTL ya pakiti (kwa mfano kutoka 64 kuwa 63). Router yetu ikiona pakiti ya 63 inatupa chini mara moja (Drop), hivyo intaneti inakata kwa simu iliyoibia tu huku mwenye vocha akiendelea bila shida!
              </div>
            </div>
          </div>

          {/* Rule 2: Browser & Hardware Fingerprint Lock */}
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-sky-600" />
                  <span>Device Hardware Fingerprinting</span>
                </h3>
                <p className="text-[10px] text-stone-500">Zuia wizi wa kubadili MAC Address (Randomized MAC).</p>
              </div>
              <button
                onClick={() => setFingerprintBindingEnabled(!fingerprintBindingEnabled)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                  fingerprintBindingEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    fingerprintBindingEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <strong className="text-stone-850 block">Kagua Multiple User-Agents</strong>
                  <span className="text-[10px] text-stone-400">Gundua simu ya pili ikituma maombi chini ya IP moja</span>
                </div>
                <input
                  type="checkbox"
                  checked={strictUserAgentCheck}
                  onChange={(e) => setStrictUserAgentCheck(e.target.checked)}
                  className="w-4 h-4 text-[#cca43b] accent-[#cca43b] rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-stone-850 text-xs block">Mbinu ya Hatua (Enforcement Action)</strong>
                    <span className="text-[10px] text-stone-500">Unataka mfumo ufanye nini ukigundua wizi wa Hotspot/Tethering?</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    enforcementStrategy === 'block' 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : enforcementStrategy === 'throttle' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                      : 'bg-sky-100 text-sky-700 border border-sky-200'
                  }`}>
                    {enforcementStrategy === 'block' ? 'Kata Kabisa' : enforcementStrategy === 'throttle' ? 'Punguza Kasi (Throttle)' : 'Ukurasa wa Vocha'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEnforcementStrategy('block');
                      if (onShowToast) onShowToast('Hali Imebadilishwa', 'Mfumo sasa utakata intaneti kabisa (100% Drop) kwa simu iliyoibia.', 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      enforcementStrategy === 'block'
                        ? 'border-rose-400 bg-rose-50/80 shadow-xs ring-1 ring-rose-400'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-rose-850 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                      <span>1. Zuia Kabisa (Drop)</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Kata intaneti 100% (0 Kbps) kwa simu zote za nyuma. Hawapati kitu!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEnforcementStrategy('throttle');
                      if (onShowToast) onShowToast('Hali Imebadilishwa', 'Mfumo sasa utapunguza kasi (Bandwidth Choke) kuwa 128kbps kwa wanaoibia.', 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      enforcementStrategy === 'throttle'
                        ? 'border-amber-400 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                      <span>2. Punguza Kasi (Throttle)</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Shusha kasi iwe 128kbps. Haikati, ila inakuwa nzito mno kiasi cha kulazimika kununua vocha!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEnforcementStrategy('redirect');
                      if (onShowToast) onShowToast('Hali Imebadilishwa', 'Simu za ziada sasa zitatupwa kwenye ukurasa wa vocha (Captive Portal).', 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      enforcementStrategy === 'redirect'
                        ? 'border-sky-400 bg-sky-50/80 shadow-xs ring-1 ring-sky-400'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                      <span>3. Ukurasa wa Vocha</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Simu ya pili ikifungua web, inatupwa ukurasa wa kulipia vocha yake yenyewe.
                    </p>
                  </button>
                </div>

                {enforcementStrategy === 'throttle' && (
                  <div className="p-2.5 bg-amber-100/50 border border-amber-200 rounded-xl flex items-center justify-between mt-2">
                    <span className="text-[11px] font-bold text-amber-950">Kasi ya Adhabu (Penalty Bandwidth):</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {[64, 128, 256].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setThrottleSpeedKbps(spd)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            throttleSpeedKbps === spd
                              ? 'bg-[#cca43b] text-stone-950 border-[#cca43b]'
                              : 'bg-white text-stone-700 border-stone-200'
                          }`}
                        >
                          {spd} Kbps
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-[10px] text-amber-900 leading-relaxed font-sans">
                <strong>Ukweli wa Simu za Kisasa:</strong> Simu zote za kuanzia Android 10 na iOS 14 zinatengeneza MAC address bandia kila siku ("Private Wi-Fi Address"). Ukitegemea MAC pekee, huwezi kuzuia wizi. Kwa kuwezesha Fingerprinting, mfumo unaitambua simu kwa vifaa vyake vya ndani (GPU, Screen Ratio, Canvas render).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FINGERPRINT DATABASE TAB */}
      {selectedSubTab === 'fingerprints' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#231f1c] uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#cca43b]" />
                  <span>Kumbukumbu ya Alama za Vifaa (Device Fingerprints Registry)</span>
                </h3>
                <p className="text-[10px] text-stone-500">
                  Vifaa vilivyofungwa na vocha zao kwa usalama kamili bila kutegemea MAC Address ya kubahatisha.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-stone-100 rounded-xl text-stone-600 font-mono text-[10px] font-bold">
                {fingerprintRecords.length} Vifaa Vilivyofungwa
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Chapa ya Kifaa & GPU</th>
                    <th className="p-3.5">MAC Address (Randomized?)</th>
                    <th className="p-3.5">Hardware Hash (SHA-256)</th>
                    <th className="p-3.5">Vocha Iliyofungwa</th>
                    <th className="p-3.5 text-right">Hali ya Kifaa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {fingerprintRecords.map((fp) => (
                    <tr key={fp.id} className="hover:bg-stone-50/50">
                      <td className="p-3.5">
                        <strong className="text-stone-800 text-xs block">{fp.deviceModel}</strong>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          <span>{fp.realVendor}</span>
                          <span>·</span>
                          <span className="text-sky-700 font-mono">{fp.webglRenderer}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className="text-stone-700 font-bold block uppercase">{fp.macAddress}</span>
                        {fp.isMacRandomized ? (
                          <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-sans font-bold">
                            ⚠️ Randomized (Bandia)
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-sans font-bold">
                            ✓ Real Hardware MAC
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[10px] text-stone-600">
                        <div>{fp.hardwareHash}</div>
                        <span className="text-[9px] text-stone-400 font-sans">Canvas: {fp.canvasHash}</span>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[#cca43b] font-black border border-amber-500/20">
                          {fp.boundVoucher}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            fp.status.includes('Flagged')
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {fp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. NEXT-GEN 2026 ADVANCED DEFENSE & MONETIZATION TAB */}
      {selectedSubTab === 'nextgen' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-stone-950 shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/20 text-stone-950 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Wi-Fi Security & Monetization (Toleo la 2026)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-stone-950">
                Sifa 6 za Kisasa Zaidi Duniani za Kulinda & Kuongeza Mapato
              </h3>
              <p className="text-xs sm:text-sm text-stone-900 font-medium max-w-3xl leading-relaxed">
                Mbali na TTL na Fingerprinting za kawaida, hizi ndizo teknolojia za kisasa zaidi zinazotumiwa na mifumo ya kimataifa kama Cisco Meraki na Nomadix ili kuzuia wizi wa kijanja (VPN/Tunneling, Rooted TTL changers) na kugeuza wizi kuwa biashara halali!
              </p>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Grid of Modern Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Monetized Multi-Device Upsell */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      1. Monetized Sharing ("Geuza Wizi Kuwa Mapato")
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Badala ya kumblock mteja anayeshea, mpe ofa ya kulipia "Duo/Family Pass"!
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetizeUpsellEnabled}
                    onChange={(e) => setMonetizeUpsellEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Kisaikolojia, wateja wengi wanaoiba hotspot hawana nia mbaya—wanataka tu kuunganisha Laptop ya chuo au simu ya pili ya mpenzi wao. Mfumo wetu ukigundua kifaa cha pili, unamfungulia pop-up yenye urafiki kumnunulia kifaa hicho kihalali.
                </p>

                <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div>
                    <strong className="text-xs text-stone-800 block font-bold">Gharama ya Kuongeza Kifaa cha 2 (Duo Add-on):</strong>
                    <span className="text-[11px] text-stone-500">Mteja atalipia kiasi hiki kuongeza kifaa cha pili</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-600">TZS</span>
                    <input
                      type="number"
                      value={addonPriceTzs}
                      onChange={(e) => setAddonPriceTzs(Number(e.target.value))}
                      className="w-20 px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-lg text-right bg-white"
                      step={100}
                      min={100}
                    />
                  </div>
                </div>

                {/* Preview of customer experience */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Muonekano kwa Mteja Anayejaribu Kushea (Live Pop-up):</span>
                  </span>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs text-xs space-y-2">
                    <div className="font-bold text-stone-850 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Umeunganisha Kifaa cha Pili? 💻📱</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Tumegundua unataka kutumia vocha hii kwenye vifaa 2. Bofya hapa chini kuongeza <strong>TZS {addonPriceTzs.toLocaleString()}</strong> upate Duo-Pass ya kutumia vyote kwa pamoja kwa kasi kamili!
                    </p>
                    <button
                      type="button"
                      className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer hover:bg-emerald-700 transition-colors"
                      onClick={() => onShowToast && onShowToast('Monetized Sharing', 'Mfumo umeruhusu kifaa cha pili kihalali!', 'success')}
                    >
                      Lipia TZS {addonPriceTzs.toLocaleString()} kwa M-Pesa / Tigo Pesa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Anti-VPN & Tunneling / HA Tunnel Blocker */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      2. Anti-VPN & Tunneling Shield (HA Tunnel Blocker)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Zuia HA Tunnel, HTTP Injector, DroidVPN & Cloudflare WARP!
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={antiVpnShieldEnabled}
                    onChange={(e) => setAntiVpnShieldEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Mbinu maarufu sana kwa vijana mtaani ni kutumia VPN za bure na DNS tunneling kuvunja captive portal ili kutumia internet bila kulipa au kuficha vifaa vilivyoshea. Mfumo wetu unaweka kinga mara tatu:
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-medium text-stone-700">Zuia DNS over TLS (Port 853) & QUIC/UDP-443</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">Blocked</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-medium text-stone-700">Zuia SNI Header Spoofing (Bypass Host injection)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">Enforced</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-medium text-stone-700">DNS Hijacking (Kulazimisha Local Cache pekee)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">Active</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleCopy(mikrotikAntiTunnelingScript, 'Anti-VPN Script')}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    {copiedScript === 'Anti-VPN Script' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Script ya Kuzuia VPN Imenakiliwa!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nakili MikroTik Script ya Kuzuia HA Tunnel & VPN Bypass</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. TCP Clock Skew & IP-ID Heuristics */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      3. TCP Clock Skew & IP-ID Deep Inspection
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Kuwashika wanaotumia simu zenye Root au "TTL Master" App!
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tcpClockSkewInspection}
                    onChange={(e) => setTcpClockSkewInspection(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Wateja wengine hutumia simu zilizo-root-iwa au app za kubadilisha TTL ili ionekane kama ni kifaa 1 (TTL=64). Lakini <strong>hawawezi kubadilisha saa ya ndani ya processor (Crystal Oscillator Clock Drift)!</strong>
                </p>

                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>Jinsi Inavyofanya Kazi Kiufundi:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-purple-800 space-y-1">
                    <li>Kila chip ya simu (Snapdragon, MediaTek, Exynos) inazalisha TCP Timestamps zenye frequency tofauti ya microsecond.</li>
                    <li>Mfumo ukiona IP moja inatuma pakiti zenye mitetemo 2 tofauti ya saa (Clock Skews), unajua kuna vifaa 2 vinatuma data.</li>
                    <li>Mteja ananaswa hata kama ametumia app kali ya kuficha hotspot!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Concurrency Spike Limiter */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      4. Kikomo cha Miunganisho ya Wazi (Max TCP Concurrency)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Kuzuia mtu mmoja asifungue connections 200+ kwa ajili ya wenzake.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Simu moja ya mteja anayetazama TikTok au WhatsApp huwa na TCP Sessions 30 hadi 50 pekee. Lakini simu ikishea kwa watu 4 au 5, sessions zinaruka kufikia 200+.
                </p>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">Kiwango cha Juu cha Miunganisho kwa Kila Simu:</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-stone-900 rounded font-black font-mono">
                      {maxConcurrentTcpPerIp} connections
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={150}
                    step={5}
                    value={maxConcurrentTcpPerIp}
                    onChange={(e) => setMaxConcurrentTcpPerIp(Number(e.target.value))}
                    className="w-full accent-[#cca43b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>40 (Ulinzi Mkali sana)</span>
                    <span>70 (Inashauriwa zaidi)</span>
                    <span>150 (Ulegevu)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Instant WhatsApp / Telegram Admin Alert Bot */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      5. Taarifa za Moja kwa Moja WhatsApp / SMS (Admin Alert)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Pata ujumbe wa dharura kwenye simu yako mtu anaposhea vibaya!
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlertsEnabled}
                    onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Iwapo simu moja inajaribu kushea kwa vifaa zaidi ya 3 au kuanzisha VPN tunnel, mfumo unakutumia ujumbe wa papo hapo ukiwa popote pale Tanzania.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={adminWhatsappNumber}
                    onChange={(e) => setAdminWhatsappNumber(e.target.value)}
                    placeholder="0712 345 678"
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                  <button
                    onClick={() => {
                      setTestNotificationSent(true);
                      if (onShowToast) {
                        onShowToast('Alert ya Jaribio Imetumwa!', `Ujumbe wa dharura umetumwa kwa ${adminWhatsappNumber}.`, 'success');
                      }
                      setTimeout(() => setTestNotificationSent(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testNotificationSent ? 'Imetumwa!' : 'Jaribu Kutuma Alert'}</span>
                  </button>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-mono text-[10px] text-stone-600 space-y-1">
                  <div className="font-bold text-stone-800">Mfano wa Ujumbe Uletwao:</div>
                  <p className="text-stone-700">
                    🚨 <strong>{hotspotName} ALERT:</strong> Simu ya Samsung A14 (Vocha V-98214) imegundulika kushea kwa vifaa 4. Mfumo umepunguza kasi yake hadi 128kbps kiotomatiki.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Voucher Self-Transfer & Re-Claim via SMS OTP */}
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#231f1c]">
                      6. Ukombozi wa Vocha kwa Simu Mpya (Self-Service Re-Claim)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Mteja akibadili simu kihalali, anaweza kuhamisha vocha yake bila kumpigia admin!
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfTransferAllowed}
                    onChange={(e) => setSelfTransferAllowed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Vipi kama simu ya mteja iliishiwa chaji na akachukua simu ya rafiki au akataka kuweka vocha kwenye laptop yake? Mfumo wetu unamruhusu kuingiza nambari yake ya malipo na kupokea SMS code ya bure. Kifaa cha kwanza kinazima, na kifaa kipya kinafunguka kihalali bila kumpotezea muda mmiliki wa mtandao.
                </p>

                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-teal-900">Ulinzi wa Kifaa 1 Wakati Wowote (Strict 1-Device Rule)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-200 text-teal-800 font-bold">Salama 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCRIPTS & DEPLOYMENT CODES TAB */}
      {selectedSubTab === 'scripts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* MikroTik Terminal Script Box */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  1. MikroTik RouterOS Script (TTL Lock & Anti-Hotspot Sharing)
                </h3>
              </div>
              <button
                onClick={() => handleCopy(mikrotikAntiTetheringScript, 'MikroTik Anti-Tethering')}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedScript === 'MikroTik Anti-Tethering' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Imenakiliwa!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nakili Script ya MikroTik</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-stone-950 rounded-2xl font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-stone-850">
              {mikrotikAntiTetheringScript}
            </pre>
          </div>

          {/* TP-Link Omada & Ruijie Dual Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">
                  2. TP-Link Omada AP Best Practices
                </h4>
                <button
                  onClick={() => handleCopy(omadaAntiTetheringGuide, 'Omada Anti-Tethering')}
                  className="text-stone-500 hover:text-stone-800 p-1 cursor-pointer"
                  title="Nakili mwongozo wa Omada"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-3 bg-[#fbf9f4] border border-[#e6e2d3] rounded-xl font-mono text-[10px] text-stone-700 overflow-x-auto leading-relaxed">
                {omadaAntiTetheringGuide}
              </pre>
            </div>

            <div className="bg-white border border-[#e6e2d3] rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="text-xs font-black text-[#231f1c] uppercase tracking-wider">
                  3. Ruijie Reyee Cloud AP Settings
                </h4>
                <button
                  onClick={() => handleCopy(ruijieAntiTetheringGuide, 'Ruijie Anti-Tethering')}
                  className="text-stone-500 hover:text-stone-800 p-1 cursor-pointer"
                  title="Nakili mwongozo wa Ruijie"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-3 bg-[#fbf9f4] border border-[#e6e2d3] rounded-xl font-mono text-[10px] text-stone-700 overflow-x-auto leading-relaxed">
                {ruijieAntiTetheringGuide}
              </pre>
            </div>
          </div>

          {/* 4. MikroTik Anti-VPN & Tunneling Shield */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  4. MikroTik Script: Zuia VPN, HA Tunnel, DoT & Concurrency Spikes (2026)
                </h3>
              </div>
              <button
                onClick={() => handleCopy(mikrotikAntiTunnelingScript, 'MikroTik Anti-VPN')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedScript === 'MikroTik Anti-VPN' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Imenakiliwa!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nakili Script ya Anti-VPN</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-stone-950 rounded-2xl font-mono text-[11px] text-rose-300 overflow-x-auto leading-relaxed border border-stone-850">
              {mikrotikAntiTunnelingScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
