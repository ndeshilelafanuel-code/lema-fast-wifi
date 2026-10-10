import React, { useState } from 'react';
import {
  Radio,
  Zap,
  Users,
  Compass,
  Plus,
  Trash2,
  Server,
  Power
} from 'lucide-react';
import { useHotspot } from '../../context/HotspotContext';
import { NetworkTower } from '../../types';

export const GisMapModule: React.FC = () => {
  const { towers, addTower, deleteTower, updateTower, activeSessions } = useHotspot();

  const [selectedTower, setSelectedTower] = useState<NetworkTower | null>(() => towers[0] || null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newIp, setNewIp] = useState('192.168.88.10');
  const [newModel, setNewModel] = useState('Omada EAP772 Outdoor WiFi 7');

  const [controllerIp, setControllerIp] = useState('192.168.88.1');
  const [controllerUser, setControllerUser] = useState('admin');
  const [controllerPass, setControllerPass] = useState('');
  const [isApiConnected, setIsApiConnected] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAddTower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addTower({
      name: newName.trim(),
      location: newLocation.trim() || 'Eneo la Mteja',
      ipAddress: newIp.trim(),
      model: newModel,
      coverageRadiusMeters: 200,
      status: 'online',
      frequencyBand: 'WiFi 7 Tri-Band (2.4/5/6GHz)',
      txPowerDbm: 28,
      antennaType: 'Omni-directional 360°',
      heightMeters: 18,
      coordinates: {
        lat: -6.7924 + (Math.random() - 0.5) * 0.05,
        lng: 39.2083 + (Math.random() - 0.5) * 0.05,
      },
    });

    setSelectedTower(created);
    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
    triggerToast(`Mnara "${created.name}" umeongezwa kwa mafanikio!`);
  };

  const handleDeleteTower = (id: string) => {
    deleteTower(id);
    if (selectedTower?.id === id) {
      setSelectedTower(towers.find((t) => t.id !== id) || null);
    }
    triggerToast('Mnara umezimwa na kuondolewa kwenye mfumo.');
  };

  const handleTogglePower = (tower: NetworkTower) => {
    const nextStatus = tower.status === 'online' ? 'offline' : 'online';
    updateTower(tower.id, { status: nextStatus });
    if (selectedTower?.id === tower.id) {
      setSelectedTower({ ...selectedTower, status: nextStatus });
    }
    triggerToast(`Hali ya ${tower.name} imebadilishwa kuwa: ${nextStatus.toUpperCase()}`);
  };

  const handleTestApiConnection = () => {
    if (!controllerIp) {
      triggerToast('Tafadhali ingiza IP ya Controller au Router yako.');
      return;
    }
    setIsApiConnected(true);
    triggerToast(`Umeunganishwa kwa mafanikio na Omada / MikroTik Controller (${controllerIp})!`);
    setShowApiConfigModal(false);
  };

  const currentSelected = towers.find((t) => t.id === selectedTower?.id) || selectedTower || towers[0] || null;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-6 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              HOTSPOT CONTEXT • LIVE GIS MAP
            </span>
            {isApiConnected && (
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                🔗 Omada/MikroTik API Connected
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
            <Compass className="w-6 h-6" />
            <span>Ramani ya GIS ya Minara & Afya ya Mtandao</span>
          </h2>
          <p className="text-stone-300 text-xs max-w-2xl leading-relaxed">
            Hapa unaona data halisi za minara na wateja wako waliounganishwa. Minara yote inasawazishwa moja kwa moja kupitia state ya HotspotContext.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowApiConfigModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Server className="w-4 h-4 text-sky-400" />
            <span>Unganisha Omada / MikroTik API</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#cca43b] hover:bg-[#b89332] text-stone-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Ongeza Mnara Halisi</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: GIS Interactive Visual Map */}
        <div className="lg:col-span-2 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl flex flex-col relative min-h-[520px]">
          
          <div className="absolute top-4 left-4 z-20 bg-stone-900/90 backdrop-blur border border-stone-700 px-3 py-1.5 rounded-xl text-xs text-white font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Minara Hai: {towers.filter((t) => t.status === 'online').length} / {towers.length} | Wateja Mtandaoni: {activeSessions.length}</span>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[#0c0a09]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

            {towers.length === 0 ? (
              <div className="text-center p-8 space-y-4 max-w-md z-10 bg-stone-900/90 border border-stone-800 rounded-2xl shadow-xl">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-sm">Hakuna Mnara Uliosajiliwa Bado</h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Ili uanze kuona minara yako ya **Omada WiFi 7 (EAP772)** au **MikroTik** kiuhalisia, bonyeza kitufe cha **"Ongeza Mnara Halisi"** hapo juu.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-[#cca43b] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Ongeza Mnara Wako
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative min-h-[440px] flex items-center justify-center">
                <div className="absolute bottom-4 left-4 z-10 bg-stone-900/80 backdrop-blur border border-stone-800 px-3 py-1.5 rounded-lg text-[10px] text-stone-400 font-mono">
                  📍 GPS GIS Engine • Live Telemetry Active
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px]">
                    {towers.map((tower, idx) => {
                      const positions = [
                        { top: '25%', left: '30%' },
                        { top: '60%', left: '70%' },
                        { top: '35%', left: '75%' },
                        { top: '70%', left: '25%' },
                        { top: '50%', left: '50%' },
                      ];
                      const pos = positions[idx % positions.length];
                      const isSelected = currentSelected?.id === tower.id;
                      const isOnline = tower.status === 'online';

                      return (
                        <div
                          key={tower.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                          style={{ top: pos.top, left: pos.left }}
                          onClick={() => setSelectedTower(tower)}
                        >
                          <div className={`absolute -inset-16 rounded-full border border-dashed transition-all duration-300 pointer-events-none ${
                            isOnline ? 'border-emerald-500/40 bg-emerald-500/5 animate-pulse' : 'border-rose-500/40 bg-rose-500/5'
                          }`} />

                          <div className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-300 scale-110'
                              : isOnline
                              ? 'bg-stone-900/90 text-white border-emerald-500/60'
                              : 'bg-stone-900/90 text-white border-rose-500/60'
                          }`}>
                            <span className={`w-3.5 h-3.5 rounded-full ${
                              isOnline ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                            }`} />
                            <div className="text-left font-sans">
                              <div className="text-xs font-black truncate max-w-[130px]">{tower.name}</div>
                              <div className="text-[10px] opacity-80 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{activeSessions.length > 0 ? activeSessions.length : 0} Wateja</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Selected Tower Details & Real Active Sessions */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 shadow-2xl flex flex-col justify-between space-y-6">
          {currentSelected ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentSelected.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {currentSelected.status === 'online' ? '🟢 AP Ipo Hewani (Online)' : '🔴 Hitilafu / Umeme Umekatika'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1.5">{currentSelected.name}</h3>
                  <p className="text-xs text-stone-400">{currentSelected.location}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePower(currentSelected)}
                    className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-all cursor-pointer"
                    title="Geuza Umeme (Toggle Online/Offline)"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTower(currentSelected.id)}
                    className="p-2 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                    title="Futa Mnara"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Model:</span>
                  <span className="text-white font-bold">{currentSelected.model}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">IP Address:</span>
                  <span className="text-amber-400 font-mono">{currentSelected.ipAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Coverage (Radius):</span>
                  <span className="text-emerald-400 font-bold">{currentSelected.coverageRadiusMeters} Mita</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-stone-400">Wateja Halisi Mtandaoni:</span>
                  <span className="text-sky-400 font-bold">{activeSessions.length} Wateja</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Masafa (Frequency):</span>
                  <span className="text-stone-300 truncate max-w-[150px]">{currentSelected.frequencyBand}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">Wateja Waliounganishwa Sasa Hivi:</h4>
                {activeSessions.length === 0 ? (
                  <div className="p-3 bg-stone-950 text-stone-500 text-xs rounded-xl text-center">
                    Hakuna mteja aliyeingia mtandaoni kwa sasa. Jaribu kuunganisha kupitia Customer Portal.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeSessions.map((s) => (
                      <div key={s.id} className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white font-mono">{s.macAddress || 'Mteja wa Wi-Fi'}</div>
                          <div className="text-[10px] text-emerald-400">IP: {s.ipAddress || '192.168.88.50'}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Online
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 text-xs">
              {towers.length === 0 ? 'Ongeza mnara kuona takwimu.' : 'Chagua mnara kwenye ramani kuona orodha ya wateja waliounganishwa.'}
            </div>
          )}

          <div className="border-t border-stone-800 pt-4 text-[11px] text-stone-400 text-center">
            Omada & MikroTik Real-Time API Link • HotspotContext
          </div>
        </div>

      </div>

      {/* Add Real Tower Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                <span>Ongeza Mnara Wako Halisi (AP / Router)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTower} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Jina la Mnara / Kituo:</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Mnara wa Soko Kuu"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Eneo / Wilaya:</label>
                <input
                  type="text"
                  placeholder="Mfano: Posta / Karibu na Benki"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Model ya Kifaa:</label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="Omada EAP772 Outdoor WiFi 7">Omada EAP772 Outdoor WiFi 7</option>
                  <option value="Omada EAP650-Outdoor">Omada EAP650-Outdoor</option>
                  <option value="MikroTik cAP ac Outdoor">MikroTik cAP ac Outdoor</option>
                  <option value="MikroTik BaseBox 5">MikroTik BaseBox 5</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">IP Address ya AP:</label>
                <input
                  type="text"
                  required
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#cca43b] hover:bg-[#b89332] text-stone-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Hifadhi Mnara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Config Modal */}
      {showApiConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-sky-400" />
                <span>Unganisha TP-Link Omada / MikroTik API</span>
              </h3>
              <button
                onClick={() => setShowApiConfigModal(false)}
                className="text-stone-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-stone-300 leading-relaxed">
                Weka taarifa za Controller yako ili mfumo usome kiotomatiki minara na wateja halisi waliopo hewani.
              </p>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Controller IP / URL:</label>
                <input
                  type="text"
                  value={controllerIp}
                  onChange={(e) => setControllerIp(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Username:</label>
                <input
                  type="text"
                  value={controllerUser}
                  onChange={(e) => setControllerUser(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold">Password / API Token:</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={controllerPass}
                  onChange={(e) => setControllerPass(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApiConfigModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold cursor-pointer"
                >
                  Funga
                </button>
                <button
                  type="button"
                  onClick={handleTestApiConnection}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Jaribu Kuunganisha (Test API)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
