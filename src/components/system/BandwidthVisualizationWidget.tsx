import React, { useState, useEffect } from 'react';
import { Zap, Activity, Info, Play, RotateCcw, ShieldCheck } from 'lucide-react';

interface Props {
  burstSpeedMbps?: number;
  sustainedSpeedMbps?: number;
  burstDurationSec?: number;
  isCompact?: boolean;
}

export const BandwidthVisualizationWidget: React.FC<Props> = ({
  burstSpeedMbps = 15,
  sustainedSpeedMbps = 3,
  burstDurationSec = 10,
  isCompact = false
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          // While in burst period, speed is burst speed (+ jitter)
          if (next <= burstDurationSec) {
            const jitter = (Math.random() - 0.5) * 1.5;
            const speed = Math.max(burstSpeedMbps * 0.9, burstSpeedMbps + jitter);
            setCurrentSpeed(parseFloat(speed.toFixed(1)));
            setHistory((h) => [...h.slice(-19), speed]);
          } else {
            // Drops down to sustained speed limit
            const jitter = (Math.random() - 0.5) * 0.4;
            const speed = Math.max(sustainedSpeedMbps * 0.85, sustainedSpeedMbps + jitter);
            setCurrentSpeed(parseFloat(speed.toFixed(1)));
            setHistory((h) => [...h.slice(-19), speed]);
          }

          if (next >= burstDurationSec + 15) {
            setIsRunning(false);
            return 0;
          }
          return next;
        });
      }, 500);
    } else {
      setCurrentSpeed(0);
    }

    return () => clearInterval(interval);
  }, [isRunning, burstSpeedMbps, sustainedSpeedMbps, burstDurationSec]);

  const handleStartTest = () => {
    setElapsed(0);
    setHistory([]);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentSpeed(0);
    setHistory([]);
  };

  const isBurstActive = isRunning && elapsed <= burstDurationSec;
  const percentageOfMax = Math.min(100, Math.round((currentSpeed / (burstSpeedMbps * 1.2)) * 100));

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Kipima Spidi & MikroTik Burst Mode
              {isBurstActive && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  ⚡ BURST ACTIVE
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              Teknolojia ya kupakua haraka kurasa na video kabla ya kurejea kasi ya kawaida
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isRunning ? (
            <button
              onClick={handleStartTest}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Jaribu Spidi
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sitisha
            </button>
          )}
        </div>
      </div>

      {/* Main Metric Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {/* Current Dynamic Gauge */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Spidi ya Sasa:</span>
            <Activity className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
          </div>
          <div className="text-center py-2">
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline justify-center gap-1">
              {isRunning ? currentSpeed : sustainedSpeedMbps}
              <span className="text-xs text-amber-400 font-medium">Mbps</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {isBurstActive ? (
                <span className="text-amber-400 font-semibold">⚡ Sekunde {burstDurationSec - elapsed} za Burst zimebaki</span>
              ) : isRunning ? (
                <span className="text-emerald-400">Kasi ya Kawaida (Sustained)</span>
              ) : (
                'Bofya "Jaribu Spidi" kuona'
              )}
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isBurstActive ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${isRunning ? percentageOfMax : 20}%` }}
            />
          </div>
        </div>

        {/* Burst Cap Details */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Kasi ya Juu (Burst):</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {burstSpeedMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Inatoa mbio za haraka sekunde {burstDurationSec} za mwanzo kufungua YouTube, TikTok au tovuti papo hapo bila buffering.
          </p>
        </div>

        {/* Sustained Speed Details */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Kasi Halisi (Sustained):</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {sustainedSpeedMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Kiwango kisichoyumba cha kutumia intaneti bila kukatika baada ya muda wa burst kuisha.
          </p>
        </div>
      </div>

      {/* Live Graph Bars */}
      {isRunning && (
        <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl mb-3">
          <div className="text-[11px] font-medium text-slate-400 mb-2 flex justify-between items-center">
            <span>Grafu ya Mtiririko wa Kasi (Real-time Flow):</span>
            <span className="text-amber-400 font-mono text-[10px]">{currentSpeed} Mbps</span>
          </div>
          <div className="h-14 flex items-end gap-1.5 pt-2 px-1">
            {history.map((val, idx) => {
              const hPct = Math.min(100, Math.max(15, (val / burstSpeedMbps) * 100));
              const isBurstBar = val > sustainedSpeedMbps * 1.5;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isBurstBar
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                        : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    }`}
                    style={{ height: `${hPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanatory note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">MikroTik QoS Technology: </span>
          Router yetu inatumia mfumo maalum wa <span className="text-cyan-300 font-medium">Queue Bursting</span>. Hukupa kipaumbele cha spidi kubwa unapoanza kuperuzi ili kurasa na video zifunguke mara moja bila kusubiri.
        </div>
      </div>
    </div>
  );
};
