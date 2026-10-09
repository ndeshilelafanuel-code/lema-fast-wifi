import React, { useState } from 'react';
import { Language, SystemMode } from '../types';
import { Network, ArrowRight, Shield, Activity, Wifi, Laptop, Server, Smartphone, Zap, FileCode2, Radio } from 'lucide-react';

interface NetworkArchitectureProps {
  lang: Language;
  systemMode: SystemMode;
}

interface TopologyNode {
  id: string;
  name: { sw: string; en: string };
  role: { sw: string; en: string };
  icon: string;
  hardware: string;
  tips: { sw: string; en: string };
  ports: string;
  isBypassedInApOnly?: boolean;
}

export const NetworkArchitecture: React.FC<NetworkArchitectureProps> = ({ lang, systemMode }) => {
  const isApOnly = systemMode === 'ap-only';
  const [activeNodeId, setActiveNodeId] = useState<string>(isApOnly ? 'ap' : 'router');

  const nodes: TopologyNode[] = [
    {
      id: 'isp',
      name: { sw: 'Chanzo cha Intaneti (ISP)', en: 'ISP Internet Ingress' },
      role: {
        sw: 'Hukuletea mkondo wa intaneti ya jumla kupitia waya wa Fiber Optic, dish ya Starlink, au Enterprise 4G router.',
        en: 'Delivers raw wholesale bandwidth into your premises via fiber optic line, Starlink terminal, or commercial 4G.'
      },
      icon: 'globe',
      hardware: 'Fiber ONU Modem / Starlink Dish & Ethernet Adapter',
      tips: {
        sw: 'Omba IP ya uhakika (Static IP au Public IP kama inawezekana) au uunganishe moja kwa moja kwenye Port 1 ya MikroTik.',
        en: 'Configure modem in Bridge Mode or connect directly to MikroTik WAN port 1 to avoid double NAT.'
      },
      ports: 'WAN (Ether1 in MikroTik)'
    },
    {
      id: 'router',
      name: { sw: 'Router Kuu (MikroTik)', en: 'MikroTik Core Gateway' },
      role: {
        sw: 'Kiongozi wa mfumo mzima. Hutoa anwani za IP (DHCP), kusimamia ukurasa wa kuingia (Hotspot Server), kupunguza spidi kwa kila mtu (Queues), na kulinda mtandao (Firewall).',
        en: 'The brain of the network. Manages DHCP pools, captive login server, per-user bandwidth speed queues, and security firewall.'
      },
      icon: 'server',
      hardware: 'MikroTik hEX (RB750Gr3) / RB4011',
      tips: {
        sw: 'Weka spidi ya mteja kuwa 2.5Mbps Download / 1Mbps Upload. Hii inatosha kabisa video za YouTube/TikTok bila kulemea mtandao wote.',
        en: 'Set user default profile to 2.5M/1M max-limit. This allows bufferless 1080p streaming without exhausting your total pipe.'
      },
      ports: 'Ether1 (WAN) / Ether2-Ether5 (Hotspot LAN)'
    },
    {
      id: 'billing',
      name: { sw: 'Mfumo wa Vocha (Mikhmon)', en: 'Mikhmon Voucher Engine' },
      role: {
        sw: 'Hutoa vocha zenye nambari fupi na QR code. Hufuatilia mapato ya kila siku, saa, na kuzuia wizi wa intaneti.',
        en: 'Generates user credentials and QR codes, tracks daily sales ledger, and interfaces with mobile money gateways.'
      },
      icon: 'code',
      hardware: 'Mikhmon Server (kwenye PC, Raspberry Pi, au Android Web Host)',
      tips: {
        sw: 'Tengeneza vifurushi vya muda: Saa 2 (Tsh 500), Saa 24 (Tsh 1,000), Wiki 1 (Tsh 5,000). Weka muda uhesabiwe kuanzia kuingia mara ya kwanza.',
        en: 'Set validity to trigger on first login. Batch-generate 200 vouchers in advance so you never run out of inventory.'
      },
      ports: 'API Port 8728 (MikroTik RouterOS)'
    },
    {
      id: 'power',
      name: { sw: 'Backup ya Sola & Umeme', en: '24/7 Solar & DC Power' },
      role: {
        sw: 'Hulinda vifaa visiungue na kuhakikisha huduma haizimiki hata umeme wa shirika ukikatika kwa masaa mengi.',
        en: 'Supplies continuous pure DC or AC power, insulating fragile electronics from power surges and grid failures.'
      },
      icon: 'zap',
      hardware: 'Paneli ya Jua 150W + Betri Deep Cycle 100Ah + MPPT au UPS 1500VA',
      tips: {
        sw: 'Weka vifaa vyote vya mtandao viwake moja kwa moja na 12V/24V DC kupitia PoE ili kuokoa umeme kuliko kutumia inverter kubwa.',
        en: 'Running DC-native gear through PoE eliminates inverter conversion losses, doubling battery runtime.'
      },
      ports: '12V / 24V / 48V PoE Injector'
    },
    {
      id: 'ap',
      name: { sw: 'Access Point ya Nje (AP)', en: 'Outdoor High-Gain AP' },
      role: {
        sw: 'Hurusha mawimbi ya WiFi kwa nguvu ya mduara (Omni 360°) au uelekeo (Sector) mita 150 hadi 500 kufikia wateja mtaani.',
        en: 'Broadcasts high-power radio frequency signals across 360 degrees, blanketing a 150m to 500m outdoor radius.'
      },
      icon: 'wifi',
      hardware: 'TP-Link EAP225-Outdoor / Ubiquiti UniFi AC Mesh',
      tips: {
        sw: 'Weka mnarani futi 20-30 juu ili iwe juu ya mabati ya nyumba. Tumia waya wa Cat6 wa nje pekee uliokingwa dhidi ya radi.',
        en: 'Mount 20-30ft elevated above surrounding metal rooftops for unobstructed clear Fresnel zone propagation.'
      },
      ports: 'Gigabit LAN (PoE In)'
    },
    {
      id: 'clients',
      name: { sw: 'Wateja Mtaani (End Users)', en: 'End-User Devices' },
      role: {
        sw: 'Wateja wanaunganisha simu (Android/iPhone), laptop, au TV zao. Ukurasa wa kuingia (Captive Portal) unajitokeza kiotomatiki.',
        en: 'End customers attach smartphones and laptops. The captive portal automatically triggers, prompting voucher entry.'
      },
      icon: 'smartphone',
      hardware: 'Smartphones, Tablets, Smart TVs, Laptops',
      tips: {
        sw: 'Ukurasa wa kuingia uwe mwepesi sana (chini ya 50KB) bila picha nzito ili ufunguke papo hapo kwenye simu zote hata zenye uwezo mdogo.',
        en: 'Keep your captive portal page under 50KB with zero heavy scripts so it pops open instantly on low-end budget smartphones.'
      },
      ports: '2.4GHz & 5GHz 802.11ac WiFi'
    }
  ];

  const selectedNode = nodes.find((n) => n.id === activeNodeId) || nodes[1];

  return (
    <section id="topology" className="py-16 md:py-20 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span>02. Muundo wa Kiufundi</span>
            <span aria-hidden="true">·</span>
            <span>Network Architecture Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
            {lang === 'sw'
              ? 'Mchoro wa Jinsi Mtandao Wote Unavyofanya Kazi'
              : 'End-to-End Network Topology & Signal Flow'}
          </h2>
          <p className="mt-3 text-base text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Kutoka kwa mtoa huduma wa intaneti hadi kwenye simu ya mteja wako mtaani: angalia mtiririko halisi wa vifaa na ubofye kila kifaa kuona siri za usanidi (Configuration).'
              : 'From your wholesale internet provider down to client smartphones: explore the verified physical data pipeline and tap each component to inspect configuration secrets.'}
          </p>
        </div>

        {/* Interactive Visual Signal Flow Banner */}
        <div className="bg-stone-950/80 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-xl mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
            {nodes.map((node, index) => {
              const isActive = node.id === activeNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNodeId(node.id)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg ring-1 ring-amber-400'
                      : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      0{index + 1}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>

                  <p className="text-sm font-bold text-white line-clamp-1">
                    {node.name[lang]}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                    {node.hardware}
                  </p>

                  <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
                    <span>{isActive ? (lang === 'sw' ? 'Inaangaliwa' : 'Selected') : (lang === 'sw' ? 'Bofya hapa' : 'Inspect')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspection Drawer for the Selected Component */}
        <div className="bg-stone-850 rounded-2xl p-6 sm:p-8 border border-stone-700/80 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Description & Role */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedNode.name[lang]}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    Hardware: {selectedNode.hardware}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {lang === 'sw' ? 'Kazi yake kwenye Mtandao (Role):' : 'System Role & Function:'}
                </p>
                <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
                  {selectedNode.role[lang]}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Siri ya Kiufundi (Pro Secret):' : 'Pro Engineering Tip:'}</span>
                </p>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {selectedNode.tips[lang]}
                </p>
              </div>
            </div>

            {/* Right Column: Key Technical Parameters */}
            <div className="lg:col-span-5 bg-stone-900 rounded-xl p-5 border border-stone-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 pb-2">
                {lang === 'sw' ? 'Vigezo vya Uunganishaji' : 'Connection Parameters'}
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-500 block">{lang === 'sw' ? 'Mlango wa Waya (Interface/Port):' : 'Physical Interface:'}</span>
                  <span className="text-stone-200 font-mono font-semibold">{selectedNode.ports}</span>
                </div>

                <div>
                  <span className="text-stone-500 block">{lang === 'sw' ? 'Usalama wa Mtandao (Security):' : 'Security Mode:'}</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    Captive Portal / Walled Garden / No open bridge
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">{lang === 'sw' ? 'Muda wa Kazi (Uptime target):' : 'Uptime Target:'}</span>
                  <span className="text-amber-400 font-mono font-semibold">99.9% 24/7 (Sola + UPS)</span>
                </div>

                <div>
                  <span className="text-stone-500 block">{lang === 'sw' ? 'Kipimo cha Spidi kwa Mtumiaji:' : 'Bandwidth Limiter:'}</span>
                  <span className="text-stone-200 font-mono">Download: 2.5 Mbps · Upload: 1.0 Mbps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
