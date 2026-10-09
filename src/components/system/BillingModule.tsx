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
  Cpu
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { activeSessions, disconnectSession, settings } = useHotspot();
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simulatedSessions, setSimulatedSessions] = useState<any[]>([]);

  const [billingLogs, setBillingLogs] = useState<string[]>([
    `[INFO] Billing engine initialized for ${settings.hotspotName}.`,
    `[INFO] Listening to RADIUS Accounting ports 1812/1813...`,
    `[OK] Connected to Controller API. Ready for active sessions.`
  ]);

  // Expiry check interval simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      
      setSimulatedSessions((prev) => {
        let updatedLogs: string[] = [];
        const checked = prev.map((s) => {
          // Accelerate simulated time/balance drain
          if (s.status === 'active') {
            const nextMinutes = Math.max(0, s.timeLeftMinutes - 5);
            const nextBalance = Math.max(0, s.balanceTsh - 50);
            const isZero = nextBalance === 0 || nextMinutes === 0;

            if (isZero) {
              updatedLogs.push(`[WARN] Session ${s.mac} reached ZERO balance/time. Flagged for disconnection.`);
              return { ...s, timeLeftMinutes: 0, balanceTsh: 0, status: 'pending_disconnect' };
            }
            return { ...s, timeLeftMinutes: nextMinutes, balanceTsh: nextBalance };
          }
          return s;
        });

        // Trigger auto-disconnect simulation for pending disconnects
        const autoDisconnected = checked.map((s) => {
          if (s.status === 'pending_disconnect') {
            updatedLogs.push(`[AUTO-DISCONNECT] Zero balance detected for ${s.mac} (${s.phone}).`);
            updatedLogs.push(`[COA-TRIGGER] Sending RFC 3576 Disconnect-Request to AP...`);
            updatedLogs.push(`[OK] Client ${s.mac} disconnected successfully. Code marked as EXPIRED.`);
            return { ...s, status: 'disconnected' };
          }
          return s;
        });

        if (updatedLogs.length > 0) {
          setBillingLogs((prevLogs) => [
            ...prevLogs,
            ...updatedLogs.map(log => `[${now}] ${log}`)
          ].slice(-50)); // Keep last 50 logs
        } else {
          setBillingLogs((prevLogs) => [
            ...prevLogs,
            `[${now}] [INFO] Billing engine checked active sessions. All balances healthy.`
          ].slice(-50));
        }

        return autoDisconnected;
      });

    }, 4000);

    return () => clearInterval(interval);
  }, [isRunning, settings]);

  const handleManualDisconnect = (mac: string) => {
    const now = new Date().toLocaleTimeString();
    setSimulatedSessions(prev => 
      prev.map(s => s.mac === mac ? { ...s, status: 'disconnected', balanceTsh: 0, timeLeftMinutes: 0 } : s)
    );
    setBillingLogs(prev => [
      ...prev,
      `[${now}] [MANUAL-DISCONNECT] Operator manually terminated session for ${mac}.`,
      `[${now}] [COA-TRIGGER] Sent Disconnect packet to Access Point.`
    ].slice(-50));
  };

  const handleAccelerateTimer = () => {
    const now = new Date().toLocaleTimeString();
    setSimulatedSessions(prev => 
      prev.map(s => s.status === 'active' ? { ...s, balanceTsh: 0, timeLeftMinutes: 0, status: 'pending_disconnect' } : s)
    );
    setBillingLogs(prev => [
      ...prev,
      `[${now}] [ACTION] Accelerated expiration timer triggered by administrator.`
    ].slice(-50));
  };

  const handleResetSimulation = () => {
    const now = new Date().toLocaleTimeString();
    setSimulatedSessions([]);
    setBillingLogs([
      `[${now}] [INFO] Active session monitoring active.`,
      `[${now}] [INFO] Waiting for customer sessions.`
    ]);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl text-stone-100 font-sans">
      {/* Top Banner decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Kazi Kiotomatiki (Automatic Expiry Loop)</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2.5">
            <span>Automated Expiry & Billing Simulation</span>
          </h3>
          <p className="text-xs text-stone-400 max-w-xl">
            Tazama injini ya kiotomatiki inayofanya kazi na router mtaani kukata wateja mara moja masaa yao au bando lao likiisha au salio kufikia sifuri.
          </p>
        </div>

        {/* Engine Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isRunning 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Simamisha Loop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Washa Loop</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetSimulation}
            className="px-3 py-1.5 rounded-xl font-semibold text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 border border-stone-750 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Sessions under monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Wateja Wanaofuatiliwa (Active Monitor)</span>
            <button
              onClick={handleAccelerateTimer}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              title="Maliza salio la wateja wote ili uone auto-disconnect"
            >
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              <span>Harakisha Malipo/Muda (Trigger Expiry)</span>
            </button>
          </div>

          <div className="space-y-3">
            {simulatedSessions.length > 0 ? (
              simulatedSessions.map((s) => (
                <div 
                  key={s.id}
                  className="p-4 bg-stone-950 border border-stone-850 rounded-2xl flex items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-1 shrink-0 border ${
                      s.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : s.status === 'pending_disconnect'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      <Radio className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-xs font-sans font-bold">{s.phone}</strong>
                        <span className="text-[10px] text-stone-400 font-sans">({s.mac})</span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase border ${
                          s.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : s.status === 'pending_disconnect'
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 animate-pulse'
                            : 'bg-stone-800 border-stone-750 text-stone-400'
                        }`}>
                          {s.status === 'pending_disconnect' ? 'ZERO BALANCE' : s.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400 font-sans">
                        <span>Pakiti: <strong className="text-white">{s.packageName}</strong></span>
                        <span className="flex items-center gap-1">
                          Salio: 
                          <strong className={`font-mono ${s.balanceTsh === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            Tsh {s.balanceTsh}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          Muda uliobaki: 
                          <strong className={`font-mono ${s.timeLeftMinutes === 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                            {s.timeLeftMinutes} min
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {s.status !== 'disconnected' && (
                    <button
                      onClick={() => handleManualDisconnect(s.mac)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer font-sans font-bold text-[10px]"
                    >
                      KATA LIVE
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-stone-950 border border-stone-850 rounded-2xl text-stone-500 font-sans text-xs space-y-1">
                <p className="font-bold text-stone-400">Hakuna mteja anayefuatiliwa kwa sasa.</p>
                <p>Injini hii inafuatilia wateja kiotomatiki mara tu wanapounganishwa mtandaoni.</p>
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
