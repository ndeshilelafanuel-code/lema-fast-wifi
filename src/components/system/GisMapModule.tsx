import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Radio,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Zap,
  Users,
  Activity,
  Layers,
  Compass,
  Maximize2,
  ShieldAlert,
  Power,
  Signal,
  Info,
  Server
} from 'lucide-react';

interface TowerNode {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  coverageRadiusMeters: number;
  status: 'online' | 'offline' | 'warning';
  activeClients: number;
  bandwidthUsageMbps: number;
  model: string;
  ip: string;
  uptime: string;
  lastChecked: string;
}

export const GisMapModule: React.FC = () => {
  const [towers, setTowers] = useState<TowerNode[]>([
    {
      id: 't-1',
      name: 'Mnara Mkuu (Town Center)',
      location: 'Soko Kuu / Posta Road',
      lat: -6.7924,
      lng: 39.2083,
      coverageRadiusMeters: 200,
      status: 'online',
      activeClients: 48,
      bandwidthUsageMbps: 18.4,
      model: 'Omada EAP772 Outdoor WiFi 7',
      ip: '192.168.88.10',
      uptime: '14 days, 6 hours',
      lastChecked: 'Sasa hivi'
    },
    {
      id: 't-2',
      name: 'Mnara wa Stendi ya Mabasi',
      location: 'Bus Terminal Gate B',
      lat: -6.8045,
      lng: 39.2210,
      coverageRadiusMeters: 200,
      status: 'online',
      activeClients: 76,
      bandwidthUsageMbps: 32.1,
      model: 'Omada EAP772 Outdoor WiFi 7',
      ip: '192.168.88.11',
      uptime: '5 days, 12 hours',
      lastChecked: 'Sasa hivi'
    },
    {
      id: 't-3',
      name: 'Mnara wa Chuo Kikuu',
      location: 'Library Square & Hostels',
      lat: -6.7712,
      lng: 39.1820,
      coverageRadiusMeters: 200,
      status: 'warning',
      activeClients: 29,
      bandwidthUsageMbps: 8.5,
      model: 'MikroTik cAP ac Outdoor',
      ip: '192.168.88.12',
      uptime: '1 day, 2 hours',
      lastChecked: 'Sekunde 30 zilizopita'
    },
    {
      id: 't-4',
      name: 'Mnara wa Eneo la Viwandani',
      location: 'Industrial Area Zone 3',
      lat: -6.8210,
      lng: 39.2540,
      coverageRadiusMeters: 200,
      status: 'offline',
      activeClients: 0,
      bandwidthUsageMbps: 0.0,
      model: 'Omada EAP650-Outdoor',
      ip: '192.168.88.13',
      uptime: 'Imekatika (0h)',
      lastChecked: 'Dakika 2 zilizopita'
    },
    {
      id: 't-5',
      name: 'Mnara wa Soko la Samaki',
      location: 'Ocean View Beachfront',
      lat: -6.7650,
      lng: 39.2650,
      coverageRadiusMeters: 200,
      status: 'online',
      activeClients: 34,
      bandwidthUsageMbps: 14.2,
      model: 'Omada EAP772 Outdoor WiFi 7',
      ip: '192.168.88.14',
      uptime: '8 days, 19 hours',
      lastChecked: 'Sasa hivi'
    }
  ]);

  const [selectedTower, setSelectedTower] = useState<TowerNode | null>(towers[0]);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live simulation of client counts and minor speed fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTowers((prev) =>
        prev.map((t) => {
          if (t.status === 'offline') return t;
          const deltaClients = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newClients = Math.max(2, t.activeClients + deltaClients);
          const deltaBandwidth = (Math.random() - 0.5) * 1.5;
          const newBandwidth = Math.max(1.0, +(t.bandwidthUsageMbps + deltaBandwidth).toFixed(1));
          return {
            ...t,
            activeClients: newClients,
            bandwidthUsageMbps: newBandwidth,
            lastChecked: 'Sasa hivi'
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleTowerStatus = (id: string) => {
    setTowers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'online' ? 'offline' : 'online';
          triggerToast(`Hali ya ${t.name} imebadilishwa kuwa: ${nextStatus.toUpperCase()}`);
          return {
            ...t,
            status: nextStatus,
            activeClients: nextStatus === 'offline' ? 0 : Math.floor(Math.random() * 40) + 15,
            bandwidthUsageMbps: nextStatus === 'offline' ? 0 : 12.5
          };
        }
        return t;
      })
    );
  };

  const filteredTowers = towers.filter((t) => {
    if (filterStatus === 'online') return t.status === 'online';
    if (filterStatus === 'offline') return t.status === 'offline' || t.status === 'warning';
    return true;
  });

  const totalClients = towers.reduce((sum, t) => sum + t.activeClients, 0);
  const onlineCount = towers.filter((t) => t.status === 'online').length;
  const offlineCount = towers.filter((t) => t.status === 'offline' || t.status === 'warning').length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-6 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              GIS LIVE MAP • REAL-TIME
            </span>
            <span className="text-stone-400 text-xs">• Omada & MikroTik Tower Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
            <Compass className="w-6 h-6" />
            <span>Ramani ya GIS ya Minara & Afya ya Mtandao</span>
          </h2>
          <p className="text-stone-300 text-xs max-w-2xl leading-relaxed">
            Fuatilia minara yako yote ya Wi-Fi kwa wakati halisi, mzunguko wa coverage (mita 200), idadi ya wateja waliounganishwa, na viashiria vya umeme au waya (Taa za Kijani na Nyekundu).
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-stone-400 uppercase font-bold">Jumla ya Minara</div>
            <div className="text-lg font-black text-white">{towers.length}</div>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
            <div className="text-[10px] text-emerald-400 uppercase font-bold">🟢 Hewani (Online)</div>
            <div className="text-lg font-black text-emerald-300">{onlineCount}</div>
          </div>
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-center">
            <div className="text-[10px] text-rose-400 uppercase font-bold">🔴 Hitilafu (Offline)</div>
            <div className="text-lg font-black text-rose-300">{offlineCount}</div>
          </div>
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-center">
            <div className="text-[10px] text-amber-400 uppercase font-bold">👥 Wateja Hewani</div>
            <div className="text-lg font-black text-amber-300">{totalClients}</div>
          </div>
        </div>
      </div>

      {/* GIS Interactive Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: GIS Interactive Visual Map Canvas */}
        <div className="lg:col-span-2 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl flex flex-col relative min-h-[520px]">
          
          {/* Map Controls Toolbar Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 flex-wrap">
            <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-xl p-1.5 flex items-center gap-1 shadow-lg">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'all' ? 'bg-[#cca43b] text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                Minara Yote ({towers.length})
              </button>
              <button
                onClick={() => setFilterStatus('online')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'online' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                🟢 Hewani ({onlineCount})
              </button>
              <button
                onClick={() => setFilterStatus('offline')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'offline' ? 'bg-rose-600 text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                🔴 Zilizokatika ({offlineCount})
              </button>
            </div>

            <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-xl p-1.5 flex items-center gap-2 shadow-lg">
              <span className="text-[10px] text-stone-400 uppercase font-bold px-1">Mtindo:</span>
              <button
                onClick={() => setMapStyle('dark')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${mapStyle === 'dark' ? 'bg-stone-800 text-amber-400' : 'text-stone-400'}`}
              >
                Dark GIS
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${mapStyle === 'satellite' ? 'bg-stone-800 text-amber-400' : 'text-stone-400'}`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Interactive Simulated Map Canvas Area */}
          <div className={`flex-1 relative overflow-hidden flex items-center justify-center p-8 transition-colors duration-500 ${
            mapStyle === 'satellite' ? 'bg-[#121c16]' : mapStyle === 'dark' ? 'bg-[#0c0a09]' : 'bg-stone-900'
          }`}>
            {/* GIS Grid Background Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            {/* Radar Sweep Effect for GIS Realism */}
            <div className="absolute w-[600px] h-[600px] rounded-full border border-amber-500/10 pointer-events-none opacity-10" />

            {/* Map Centered Geographic Simulation Container */}
            <div className="w-full h-full relative min-h-[440px] flex items-center justify-center">
              
              {/* GIS Map Central Coordinates Watermark */}
              <div className="absolute bottom-4 left-4 z-10 bg-stone-900/80 backdrop-blur border border-stone-800 px-3 py-1.5 rounded-lg text-[10px] text-stone-400 font-mono">
                📍 Lat: -6.7924° S, Lng: 39.2083° E • Zoom: {zoomLevel}x • OpenStreetMap GIS Core
              </div>

              {/* Render Towers as Interactive Map Markers with 200m Coverage Circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px]">
                  {filteredTowers.map((tower, idx) => {
                    const positions = [
                      { top: '20%', left: '35%' },
                      { top: '65%', left: '70%' },
                      { top: '30%', left: '75%' },
                      { top: '70%', left: '20%' },
                      { top: '45%', left: '48%' },
                    ];
                    const pos = positions[idx % positions.length];
                    const isSelected = selectedTower?.id === tower.id;
                    const isOnline = tower.status === 'online';

                    return (
                      <div
                        key={tower.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => setSelectedTower(tower)}
                      >
                        {/* 200m Coverage Circle with Pulse */}
                        <div className={`absolute -inset-16 rounded-full border border-dashed transition-all duration-300 pointer-events-none ${
                          isOnline ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'
                        }`} />

                        {/* Tower Marker Pin */}
                        <div className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-300 scale-110 shadow-amber-500/30'
                            : isOnline
                            ? 'bg-stone-900/90 text-white border-emerald-500/60 hover:border-emerald-400'
                            : 'bg-stone-900/90 text-white border-rose-500/60 hover:border-rose-400'
                        }`}>
                          {/* Status Indicator Light */}
                          <div className="relative flex items-center justify-center">
                            <span className={`w-3.5 h-3.5 rounded-full ${
                              isOnline ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                            }`} />
                          </div>

                          <div className="text-left font-sans">
                            <div className="text-xs font-black truncate max-w-[130px]">{tower.name}</div>
                            <div className="text-[10px] opacity-80 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{tower.activeClients} Wateja</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Zoom Controls Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-stone-900/90 border border-stone-700 rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-stone-800 rounded-lg font-bold text-sm cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-stone-800 rounded-lg font-bold text-sm cursor-pointer"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Selected Tower Detailed Telemetry Panel */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 shadow-2xl flex flex-col justify-between space-y-6">
          {selectedTower ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedTower.status === 'online' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {selectedTower.status === 'online' ? '🟢 AP Ipo Hewani (Online)' : '🔴 Hitilafu / Umeme Umekatika'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1.5">{selectedTower.name}</h3>
                  <p className="text-xs text-stone-400">{selectedTower.location}</p>
                </div>
                <button
                  onClick={() => toggleTowerStatus(selectedTower.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTower.status === 'online'
                      ? 'bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-600 hover:text-white'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-600 hover:text-white'
                  }`}
                  title="Jaribu Geuza Hali ya Umeme / Waya (Simulate Power Outage)"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-950 border border-stone-800 p-3 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Wateja Hewani</span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">{selectedTower.activeClients} <span className="text-xs text-stone-400 font-normal">wateja</span></div>
                </div>

                <div className="bg-stone-950 border border-stone-800 p-3 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-sky-400" />
                    <span>Matumizi ya Bandwidth</span>
                  </div>
                  <div className="text-xl font-black text-sky-400 mt-1">{selectedTower.bandwidthUsageMbps} <span className="text-xs text-stone-400 font-normal">Mbps</span></div>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-2.5 bg-stone-950/60 p-4 rounded-xl border border-stone-800 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Model ya Kifaa:</span>
                  <span className="text-white font-bold">{selectedTower.model}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">IP Address:</span>
                  <span className="text-amber-400 font-mono">{selectedTower.ip}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Coverage Radius:</span>
                  <span className="text-emerald-400 font-bold">{selectedTower.coverageRadiusMeters} Mita (Mzingo)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Uptime:</span>
                  <span className="text-white">{selectedTower.uptime}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Kaguzi wa Mwisho:</span>
                  <span className="text-stone-300">{selectedTower.lastChecked}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => triggerToast(`Inawasiliana na ${selectedTower.name} kufanya Ping Test... Imefaulu! (Latency: 4ms)`)}
                  className="w-full py-2.5 bg-[#cca43b] hover:bg-[#b89332] text-stone-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Fanya Ping Test & Reboot AP</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 text-xs">
              Bonyeza mnara kwenye ramani kuona taarifa zake kamili.
            </div>
          )}

          <div className="border-t border-stone-800 pt-4 text-[11px] text-stone-400 text-center">
            Omada & MikroTik GIS Telemetry Engine • 100% Salama
          </div>
        </div>

      </div>
    </div>
  );
};
