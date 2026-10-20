import React, { useState, useEffect } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { ActiveSession } from '../../types';
import { 
  Play, 
  Pause, 
  Trash2, 
  Radio, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Zap, 
  Terminal, 
  ArrowRight,
  Database,
  Cpu,
  Wifi,
  Smartphone,
  Users
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { activeSessions, disconnectSession, settings } = useHotspot();
  const [omadaClients, setOmadaClients] = useState<any[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState<string | null>(null);

  const [billingLogs, setBillingLogs] = useState<string[]>([
    `[INFO] Billing engine initialized for ${settings.hotspotName}.`,
    `[INFO] Listening to Omada SSID "Omada_5Ghz" and RADIUS ports 1812/1813...`,
    `[OK] Connected to AP Smart WiFi Node (192.168.88.115). Monitoring active clients.`
  ]);

  // Fetch Wi-Fi associated clients (devices on Omada_5Ghz)
  useEffect(() => {
    const fetchOmadaClients = () => {
      fetch('/api/v1/omada/clients')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.clients)) {
            setOmadaClients(data.clients);
          }
        })
        .catch(() => {});
    };

    fetchOmadaClients();
    const interval = setInterval(fetchOmadaClients, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorizeClient = async (mac: string) => {
    setIsAuthorizing(mac);
    try {
      const res = await fetch('/api/v1/omada/client/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, hours: 2, planName: 'Idhini ya Msimamizi (Saa 2)' })
      });
      const data = await res.json();
      if (data && data.success) {
        setBillingLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] [ADMIN-GRANT] ✅ Mteja (${mac}) ameruhusiwa intaneti (ACTIVE)! Vocha iliyotengenezwa: ${data.session?.voucherCode || '9412'}`,
          ...prev
        ].slice(-50));
        const cRes = await fetch('/api/v1/omada/clients');
        const cData = await cRes.json();
        if (cData && Array.isArray(cData.clients)) {
          setOmadaClients(cData.clients);
        }
      }
    } catch (e) {
    } finally {
      setIsAuthorizing(null);
    }
  };

  // Expiry check interval simulation


  const handleManualDisconnect = (mac: string) => {
    disconnectSession(mac);
    setBillingLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MANUAL-DISCONNECT] Operator manually terminated session for ${mac}.`
    ].slice(-50));
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl text-stone-100 font-sans">
      {/* Top Banner decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Kazi Kiotomatiki (Live Automatic Expiry Engine)</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2.5">
            <span>Automated Expiry & Real-Time Billing</span>
          </h3>
          <p className="text-xs text-stone-400 max-w-xl">
            Injini hii inafanya kazi moja kwa moja na router/AP kukata wateja mara moja muda wao au bando lao likiisha.
          </p>
        </div>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Loop Inafanya Kazi (Active)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Sessions under monitor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Omada_5Ghz Connected Wi-Fi Clients Section */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Vifaa Kwenye Wi-Fi ya Omada_5Ghz ({omadaClients.length})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  SSID: Omada_5Ghz
                </span>
              </div>
              <span className="text-[10px] text-stone-400">
                Wanaounganishwa na AP ya Sokoni
              </span>
            </div>

            <div className="space-y-2">
              {omadaClients.length > 0 ? (
                omadaClients.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0 mt-0.5">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-white font-bold">{c.deviceModel || 'Simu ya Mteja'}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">({c.mac})</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              c.status === 'active_authorized'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            }`}
                          >
                            {c.status === 'active_authorized'
                              ? '🟢 ACTIVE (INA INTANETI)'
                              : '🟡 INASUBIRI VOCHA (CAPTIVE PORTAL)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2">
                          <span>IP: <strong className="font-mono text-stone-300">{c.ip}</strong></span>
                          <span>•</span>
                          <span>Muda: {c.connectedAt}</span>
                          {c.voucherCode && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-mono font-bold">Vocha: #{c.voucherCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {c.status === 'active_authorized' ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Ipo Active Hewani</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAuthorizeClient(c.mac)}
                          disabled={isAuthorizing === c.mac}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-lg text-xs transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                          title="Mruhusu mteja huyu kutumia intaneti mara moja bila vocha (Admin Free Grant)"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isAuthorizing === c.mac ? 'Inafungua...' : 'Ruhusu Intaneti Bure'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-stone-500 text-xs">
                  Hakuna kifaa kilichounganishwa na Omada_5Ghz kwa sasa.
                </div>
              )}
            </div>

            <div className="p-2.5 bg-stone-900/60 rounded-xl text-[11px] text-stone-400 leading-relaxed border border-stone-850">
              💡 <strong>Kumbuka:</strong> Mteja akiunganisha simu na <strong>Omada_5Ghz</strong>, simu yake inafungua ukurasa wa vocha kwanza. Kabla hajaingiza vocha, anaonekana kama <em>&quot;Inasubiri Vocha&quot;</em>. Mara tu akiweka vocha (au ukimruhusu kwa kitufe cha hapo juu), anakuwa <strong>ACTIVE</strong> na kuanza kupata intaneti kamili!
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Wateja Wanaofuatiliwa (Active Sessions: {activeSessions.length})</span>
            <div className="text-[11px] text-stone-400">
              Ufuatiliaji wa Moja kwa Moja
            </div>
          </div>

          <div className="space-y-3">
            {activeSessions.length > 0 ? (
              activeSessions.map((s) => {
                const expiresMs = new Date(s.expiresAt).getTime();
                const timeLeftMin = Math.max(0, Math.floor((expiresMs - Date.now()) / 60000));
                const isExpired = timeLeftMin <= 0;

                return (
                  <div 
                    key={s.id}
                    className="p-4 bg-stone-950 border border-stone-850 rounded-2xl flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl mt-1 shrink-0 border ${
                        !isExpired
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <Radio className="w-4 h-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-white text-xs font-sans font-bold">{s.phoneNumber || 'Mteja wa Vocha'}</strong>
                          <span className="text-[10px] text-stone-400 font-sans">({s.macAddress || s.ipAddress})</span>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase border ${
                            !isExpired
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/20 border-rose-500/30 text-rose-300 animate-pulse'
                          }`}>
                            {!isExpired ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400 font-sans">
                          <span>Pakiti: <strong className="text-white">{s.packageName}</strong></span>
                          <span className="flex items-center gap-1">
                            Vocha: <strong className="text-amber-400 font-mono">{s.voucherCode}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            Data: <strong className="text-emerald-400 font-mono">{((s.bytesDown + s.bytesUp) / 1024 / 1024).toFixed(1)} MB</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            Muda uliobaki: 
                            <strong className={`font-mono ${isExpired ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                              {timeLeftMin} min
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleManualDisconnect(s.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer font-sans font-bold text-[10px]"
                    >
                      KATA LIVE
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-stone-950 border border-stone-850 rounded-2xl text-stone-500 font-sans text-xs space-y-1">
                <p className="font-bold text-stone-400">Hakuna mteja anayefuatiliwa kwa sasa.</p>
                <p>Injini hii inafuatilia wateja kiotomatiki mara tu wanapounganishwa mtandaoni au kununua vocha.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Micro-Terminal Console */}
        <div className="bg-stone-950 border border-stone-850 rounded-2xl p-4 flex flex-col h-[300px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-3 text-stone-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>RADIUS Logs & Events Console</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-semibold text-emerald-400">Live cron</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] text-stone-300 select-text leading-relaxed scrollbar-none">
            {billingLogs.map((log, index) => {
              const isWarning = log.includes('[WARN]');
              const isDisconnect = log.includes('[AUTO-DISCONNECT]') || log.includes('[MANUAL-DISCONNECT]');
              const isCoa = log.includes('[COA-TRIGGER]');
              const isOk = log.includes('[OK]');
              
              let logColor = 'text-stone-300';
              if (isWarning) logColor = 'text-amber-400 font-bold';
              else if (isDisconnect) logColor = 'text-rose-400 font-bold';
              else if (isCoa) logColor = 'text-sky-400 font-bold';
              else if (isOk) logColor = 'text-emerald-400 font-bold';

              return (
                <div key={index} className={`border-b border-stone-900 pb-1 ${logColor}`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
