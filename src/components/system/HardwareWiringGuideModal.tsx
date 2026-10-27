import React, { useState } from 'react';
import {
  X,
  Radio,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  HelpCircle,
  Smartphone,
  Laptop,
  CheckCheck
} from 'lucide-react';
import { Language } from '../../types';

interface HardwareWiringGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  defaultTab?: 'cabling' | 'voltage' | 'tplink' | 'controller';
}

export const HardwareWiringGuideModal: React.FC<HardwareWiringGuideModalProps> = ({
  isOpen,
  onClose,
  lang = 'sw',
  defaultTab = 'voltage'
}) => {
  const [activeTab, setActiveTab] = useState<'voltage' | 'cabling' | 'tplink' | 'controller'>(defaultTab);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedUser, setCopiedUser] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Mwongozo Kamili wa Kufunga Waya & Usanidi wa Smart AP
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TP-Link Omada & PoE
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Kuanzia unboxing, voltage za PoE (24V vs 48V), waya za LAN, tplinkeap.net hadi Cloud Controller.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('voltage')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'voltage'
                ? 'border-rose-500 text-rose-400 font-bold bg-rose-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>1. Tahadhari ya Umeme (24V vs 48V)</span>
          </button>

          <button
            onClick={() => setActiveTab('cabling')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cabling'
                ? 'border-amber-400 text-amber-300 font-bold bg-amber-400/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>2. Muunganisho wa Waya (Modem ➔ PoE ➔ AP)</span>
          </button>

          <button
            onClick={() => setActiveTab('tplink')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tplink'
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-400/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>3. Usanidi Ndani ya Kifaa (tplinkeap.net)</span>
          </button>

          <button
            onClick={() => setActiveTab('controller')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'controller'
                ? 'border-emerald-400 text-emerald-300 font-bold bg-emerald-400/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>4. Cloud Inform URL & Claiming</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-300 text-xs sm:text-sm">
          
          {/* TAB 1: VOLTAGE WARNING */}
          {activeTab === 'voltage' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Critical Alert Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-600/70 text-rose-200 space-y-3 shadow-lg shadow-rose-950/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-600/30 text-rose-400 mt-0.5">
                    <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <span>TAHADHARI KUBWA YA UMEME: KAMWE USICHANGANYE PoE INJECTORS!</span>
                    </h4>
                    <p className="text-xs sm:text-xs text-rose-200 mt-1 leading-relaxed">
                      Kila kifaa cha TP-Link Omada kimetengenezwa kufanya kazi na kiwango maalum cha voltage. Ukitumia adapter isiyo sahihi, utaunguza bodi (mainboard) ya kifaa mara moja na hakitafaa tena!
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison Cards: 24V vs 48V */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EAP225 Card */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Model ya Kawaida (AC1200)</span>
                      <h4 className="text-base font-bold text-white">TP-Link EAP225-Outdoor</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      24V Passive PoE
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-stone-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>PoE Injector:</strong> Tumia ile nyeupe iliyoandikwa <strong>24V 0.5A Passive PoE</strong> iliyokuja ndani ya boksi lake.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Antenna:</strong> Inakuja na antenna 2 ndefu zinazozungushwa juu.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-rose-300"><strong>HATARI:</strong> Usichomeke adapter ya 48V (kama ya EAP610) hapa! Ukiweka 48V kifaa hiki kitaungua mara moja.</span>
                    </li>
                  </ul>
                </div>

                {/* EAP610/EAP650 Card */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Wi-Fi 6 ya Kisasa (AX1800/3000)</span>
                      <h4 className="text-base font-bold text-white">TP-Link EAP610 / EAP650</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      48V Passive / 802.3at
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-stone-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>PoE Injector:</strong> Inatumia adapter ya <strong>48V Passive PoE</strong> (mara nyingi ina stika nyekundu yenye tahadhari: "48V Passive PoE Output").</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Umbo:</strong> Ni pana zaidi, inafaa kwa wateja wengi kwa pamoja (high capacity Wi-Fi 6).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>Ukichomeka adapter ya 24V kwenye EAP610, kifaa hakitaungua lakini hakitapata umeme wa kutosha kuwaka.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Factory Reset Guidance */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-700/80 flex items-start gap-3.5">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 mt-0.5">
                  <RotateCcwIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-white text-xs">Jinsi ya Kufanya Factory Reset (Kurudisha Mipangilio ya Kiwandani):</h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Fungua kifuniko cha plastiki cha kuzuia maji kilicho chini ya AP. Pembeni ya port ya Ethernet (LAN) kuna kitufe kidogo cha <strong>Reset</strong>. Wakati AP imechomekwa umeme, bonyeza na ushikilie kitufe hicho kwa pini au sindano kwa sekunde <strong>5 hadi 8</strong> mpaka taa ya kijani (LED) izime na kuanza kuwaka tena kwa kasi. Kifaa kitakuwa kimerudi factory default tayari kusanidiwa upya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CABLING SETUP */}
          {activeTab === 'cabling' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <p className="font-bold text-sm text-white">Mpangilio Rahisi wa Waya 2 Pekee (Modem ➔ PoE Injector ➔ Antenna):</p>
                <p className="text-xs text-stone-300 mt-1">
                  Huna haja ya kupandisha nyaya mbili wala waya wa umeme wa 220V juu ya mnara. Waya mmoja tu wa Cat6 unatosha kupeleka umeme na intaneti pamoja.
                </p>
              </div>

              {/* Visual Step-by-Step Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 relative">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm">Chanzo cha Intaneti (ISP / Modem)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Chukua waya wa njano wa mtandao (Ethernet Patchcord). Chomeka kwenye <strong>LAN Port (k.m. LAN 1 au LAN 4)</strong> ya modem yako ya Airtel 5G, Fiber Router au Starlink.
                  </p>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-amber-300 font-mono">
                    Modem LAN ➔ Waya wa Njano
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 relative">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white text-sm">Kwenye PoE Injector (Adapter)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Chomeka mwisho wa waya wa njano kwenye tundu lililoandikwa <strong>"LAN"</strong>. Kwenye tundu la pili lililoandikwa <strong>"PoE"</strong>, chomeka waya mrefu mweusi wa nje (Outdoor Cat6).
                  </p>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-sky-300 font-mono">
                    LAN Port = Intaneti kutoka modem<br />
                    PoE Port = Umeme + Data kwenda AP
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-400 text-stone-950 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white text-sm">Kwenye Access Point (Juu ya Mnara)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Waya mrefu unaotoka kwenye PoE Port unapanda juu ya mnara au nguzo na kuchomekwa moja kwa moja kwenye <strong>Port ya Ethernet</strong> ya AP. Funga kifuniko cha kuzuia maji vizuri.
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
                    Taa ya Kijani (LED) inawaka papo hapo! 🟢
                  </div>
                </div>
              </div>

              {/* Practical Tip */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-700/80 text-xs text-stone-300 space-y-1">
                <span className="font-bold text-amber-400">💡 Ushauri wa Kitaalamu wa Waya:</span>
                <p>
                  Kwa matumizi ya nje kwenye nguzo au mnara, tumia waya wenye viwango vya <strong>Outdoor Double-Jacket Cat6 UTP/FTP</strong> ili waya usiharibiwe na jua kali au mvua. Waya wa ndani wa kawaida (Indoor Cat5e) hupoteza kasi au kukatika baada ya miezi michache.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TPLINKEAP.NET LOCAL CONFIGURATION */}
          {activeTab === 'tplink' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-200">
                <p className="font-bold text-sm text-white">Hatua kwa Hatua: Kusanidi Kifaa Ndani Kupitia tplinkeap.net</p>
                <p className="text-xs text-stone-300 mt-1">
                  Hii inafanywa mara moja tu baada ya kifaa kuwaka ili kukiweka kwenye AP Mode na kuondoa password ya Wi-Fi kwa ajili ya Captive Portal.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">1</span>
                    <h5 className="font-bold text-white text-xs">Unganisha Kompyuta/Simu yako na Wi-Fi ya Awali ya TP-Link</h5>
                  </div>
                  <p className="text-stone-400 pl-7">
                    Fungua Wi-Fi kwenye simu au laptop yako. Chagua jina la Wi-Fi ya wazi inayoanza na <code>TP-Link_2.4GHz_XXXX</code> au <code>TP-Link_5GHz_XXXX</code>. Haihitaji password kujiunga.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">2</span>
                    <h5 className="font-bold text-white text-xs">Fungua Kivinjari (Browser) na Uingie tplinkeap.net</h5>
                  </div>
                  <p className="text-stone-400 pl-7">
                    Kwenye Chrome au Safari, andika <strong>tplinkeap.net</strong> (au <strong>192.168.0.254</strong>). Ukiona onyo la usalama ("Your connection is not private"), bonyeza <em>Advanced ➔ Proceed to tplinkeap.net (unsafe)</em>.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">3</span>
                    <h5 className="font-bold text-white text-xs">Weka Login ya Awali</h5>
                  </div>
                  <p className="text-stone-400 pl-7">
                    Username: <strong>admin</strong> | Password: <strong>admin</strong>. Kama inakuomba kutengeneza username na password mpya (k.m. EAP650), weka username na password unazozikumbuka (k.m. <code>lema-admin</code> / <code>Lema@2026</code>).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">4</span>
                    <h5 className="font-bold text-white text-xs">Chagua Operation Mode: AP Mode</h5>
                  </div>
                  <p className="text-stone-400 pl-7">
                    Kwenye Quick Setup Wizard, chagua <strong>AP Mode</strong> (Access Point). Hii inaruhusu kifaa kusambaza intaneti kutoka kwenye router yako ya modem.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">5</span>
                    <h5 className="font-bold text-amber-300 text-xs">MUHIMU: Weka Jina la Wi-Fi na ONDOA PASSWORD!</h5>
                  </div>
                  <p className="text-stone-300 pl-7">
                    Kwenye Wireless Settings, weka SSID: <strong>Lema Fast WiFi</strong>. Kwenye <strong>Security Mode</strong>, chagua <strong>"None"</strong> (Open Network).<br />
                    <span className="text-amber-400 font-semibold">Kwanini "None"?</span> Kwa sababu wateja wanapaswa kuunganisha moja kwa moja bila password ya WPA ili wafunguliwe ukurasa wa Vocha / Malipo ya Simu (Captive Portal).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLLER INFORM URL & CLAIMING */}
          {activeTab === 'controller' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                <p className="font-bold text-sm text-white">Kuunganisha AP na Cloud Controller ya Lema Fast WiFi</p>
                <p className="text-xs text-stone-300 mt-1">
                  Kuelekeza AP kwenye anwani ya controller (Inform URL) ili iweze kuonekana kwenye Dashboard na kuruhusu Auto-Adoption.
                </p>
              </div>

              {/* Inform URL Credentials Card */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <h5 className="font-bold text-white text-xs border-b border-stone-800 pb-2">
                  Taarifa za Kuingiza Kwenye tplinkeap.net ➔ System ➔ Controller Settings:
                </h5>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                      <span>Controller Inform URL:</span>
                      <button
                        onClick={() => handleCopy('https://omada.lemawifi.online', setCopiedUrl)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'Imenakiliwa!' : 'Nakili URL'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-emerald-400 select-all">
                      https://omada.lemawifi.online
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                        <span>Controller Device Username:</span>
                        <button
                          onClick={() => handleCopy('lema-node-admin', setCopiedUser)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUser ? 'Imenakiliwa' : 'Nakili'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-stone-200">
                        lema-node-admin
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                        <span>Controller Device Password:</span>
                        <button
                          onClick={() => handleCopy('Lema@WiFi2026!', setCopiedPass)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPass ? 'Imenakiliwa' : 'Nakili'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-stone-200">
                        Lema@WiFi2026!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                  <p><strong>Njia ya Kuingiza:</strong></p>
                  <p>Kwenye ukurasa wa <code>tplinkeap.net</code> ➔ Bofya menyu ya <strong>System</strong> ➔ Bofya <strong>Controller Settings</strong> ➔ Washa <strong>Cloud-Based Controller Management</strong> (Weka ON/Enable) ➔ Bandika Inform URL hapo juu ➔ Bofya <strong>Save</strong>.</p>
                </div>
              </div>

              {/* Next step in dashboard */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-700/80 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Hatua ya Mwisho Kwenye Dashboard:</span>
                </h5>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-stone-300 leading-relaxed">
                  <li>Nenda kwenye tab ya <strong>Access Points</strong> kwenye menyu ya kushoto.</li>
                  <li>Bonyeza kitufe cha <strong>"Claim Access Point"</strong>.</li>
                  <li>Weka <strong>MAC Address</strong> ya AP yako (inapatikana kwenye stika nyuma ya AP au status ya tplinkeap.net).</li>
                  <li>Bofya <strong>Claim</strong> ➔ Hali itasoma <em>"Claimed — waiting for controller to see it"</em>.</li>
                  <li>Bofya kitufe cha <strong>"Adopt Now"</strong> ➔ Controller itaikubali na kubadilika kuwa <span className="text-emerald-400 font-bold">Adopted & Connected 🟢</span>!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Kila hatua imejaribiwa na inafanya kazi kikamilifu.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20"
          >
            Nimeelewa, Funga Mwongozo
          </button>
        </div>

      </div>
    </div>
  );
};

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
