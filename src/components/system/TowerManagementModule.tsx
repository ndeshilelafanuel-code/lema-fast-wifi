import React, { useState } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { NetworkTower } from '../../types';
import {
  Radio,
  Plus,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Info,
  Search,
  Filter,
  RefreshCw,
  Compass,
  MapPin,
  ExternalLink,
  Shield,
  Wifi,
  Users,
  Clock,
  Layers,
  Settings,
  X,
  Check,
  QrCode,
  Sparkles,
  Camera,
  Scan
} from 'lucide-react';

interface TowerManagementModuleProps {
  onOpenGisMap?: () => void;
  onOpenScanner?: () => void;
}

export const TowerManagementModule: React.FC<TowerManagementModuleProps> = ({ 
  onOpenGisMap,
  onOpenScanner 
}) => {
  const { towers, addTower, updateTower, deleteTower, activeSessions } = useHotspot();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [isScanningNetwork, setIsScanningNetwork] = useState(false);
  const [scanStepLog, setScanStepLog] = useState<string[]>([]);
  const [discoveredAps, setDiscoveredAps] = useState<Array<{
    id: string;
    mac: string;
    model: string;
    ip: string;
    siteSuggestion: string;
    status: 'pending' | 'adopted';
  }>>([
    {
      id: 'disc-1',
      mac: '50:C7:BF:70:E2:B0',
      model: 'TP-Link Omada EAP225-Outdoor v3',
      ip: '192.168.88.10',
      siteSuggestion: 'Kituo cha Sokoni (Ghorofani)',
      status: 'pending'
    },
    {
      id: 'disc-2',
      mac: 'B0:95:75:A1:33:DE',
      model: 'TP-Link Omada EAP610-Outdoor WiFi 6',
      ip: '192.168.88.12',
      siteSuggestion: 'Mnara wa Posta / Makutano',
      status: 'pending'
    },
    {
      id: 'disc-3',
      mac: '50:D4:F7:2C:19:8A',
      model: 'TP-Link Omada EAP110-Outdoor v3',
      ip: '192.168.88.15',
      siteSuggestion: 'Mtaa wa Mshikamano Block B',
      status: 'pending'
    }
  ]);
  const [editingTower, setEditingTower] = useState<NetworkTower | null>(null);
  const [viewingTechTower, setViewingTechTower] = useState<NetworkTower | null>(null);
  const [deletingTowerId, setDeletingTowerId] = useState<string | null>(null);

  const handleStartNetworkScan = () => {
    setIsScanningNetwork(true);
    setScanStepLog([]);
    const logs = [
      '📡 Inatuma Layer 2 Broadcast ping kwenye swichi (VLAN 10)...',
      '🔍 Inakagua subnet 192.168.88.0/24 kwa itifaki ya Omada & Reyee Discovery...',
      '📍 Vifaa 3 vya Access Point vimegunduliwa vikiwa na hali ya "Pending Adoption"!',
      '⚡ Data za MAC Address na IP zipo tayari kwa kuunganishwa.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setScanStepLog((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          setIsScanningNetwork(false);
        }
      }, (index + 1) * 500);
    });
  };

  const handleAdoptDiscoveredAp = (ap: {
    id: string;
    mac: string;
    model: string;
    ip: string;
    siteSuggestion: string;
    status: 'pending' | 'adopted';
  }) => {
    const created = addTower({
      name: ap.siteSuggestion,
      location: ap.siteSuggestion,
      ipAddress: ap.ip,
      macAddress: ap.mac,
      model: ap.model,
      coverageRadiusMeters: 200,
      status: 'online',
      frequencyBand: 'Dual-Band 2.4/5GHz (Auto-Adopted)',
      txPowerDbm: 27,
      antennaType: 'Omni-directional 360°',
      heightMeters: 16,
      notes: `Kifaa kilichosajiliwa kiotomatiki kupitia Network Discovery Scan (MAC: ${ap.mac})`,
      coordinates: {
        lat: -6.7924 + (Math.random() - 0.5) * 0.04,
        lng: 39.2083 + (Math.random() - 0.5) * 0.04,
      },
    });

    setDiscoveredAps((prev) =>
      prev.map((item) => (item.id === ap.id ? { ...item, status: 'adopted' } : item))
    );

    showToast(`Access Point "${ap.model}" imeunganishwa (Adopted) kwenye mnara mpya!`);
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add Tower form state
  const [addForm, setAddForm] = useState({
    name: '',
    location: '',
    ipAddress: '192.168.88.10',
    macAddress: '50:C7:BF:70:E2:B0',
    model: 'Omada EAP772 Outdoor WiFi 7',
    coverageRadiusMeters: 200,
    status: 'online' as 'online' | 'offline' | 'maintenance',
    frequencyBand: 'WiFi 7 Tri-Band (2.4/5/6GHz)',
    txPowerDbm: 28,
    antennaType: 'Omni-directional 360°',
    heightMeters: 18,
    notes: '',
  });

  // Edit Tower form state
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    ipAddress: '',
    macAddress: '',
    model: '',
    coverageRadiusMeters: 200,
    status: 'online' as 'online' | 'offline' | 'maintenance',
    frequencyBand: '',
    txPowerDbm: 28,
    antennaType: '',
    heightMeters: 18,
    notes: '',
  });

  const handleOpenEdit = (tower: NetworkTower) => {
    setEditingTower(tower);
    setEditForm({
      name: tower.name,
      location: tower.location,
      ipAddress: tower.ipAddress,
      macAddress: tower.macAddress || '',
      model: tower.model,
      coverageRadiusMeters: tower.coverageRadiusMeters,
      status: tower.status,
      frequencyBand: tower.frequencyBand,
      txPowerDbm: tower.txPowerDbm || 26,
      antennaType: tower.antennaType || 'Omni-directional 360°',
      heightMeters: tower.heightMeters || 15,
      notes: tower.notes || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTower) return;
    if (!editForm.name.trim() || !editForm.location.trim()) {
      showToast('Tafadhali jaza jina la mnara na eneo.');
      return;
    }

    updateTower(editingTower.id, {
      name: editForm.name.trim(),
      location: editForm.location.trim(),
      ipAddress: editForm.ipAddress.trim(),
      macAddress: editForm.macAddress.trim() || undefined,
      model: editForm.model,
      coverageRadiusMeters: Number(editForm.coverageRadiusMeters) || 200,
      status: editForm.status,
      frequencyBand: editForm.frequencyBand,
      txPowerDbm: Number(editForm.txPowerDbm) || 26,
      antennaType: editForm.antennaType,
      heightMeters: Number(editForm.heightMeters) || 15,
      notes: editForm.notes.trim() || undefined,
    });

    showToast(`Mnara "${editForm.name}" umesasishwa kwa mafanikio!`);
    setEditingTower(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.location.trim()) {
      showToast('Tafadhali jaza jina la mnara na eneo.');
      return;
    }

    const created = addTower({
      name: addForm.name.trim(),
      location: addForm.location.trim(),
      ipAddress: addForm.ipAddress.trim(),
      macAddress: addForm.macAddress.trim() || undefined,
      model: addForm.model,
      coverageRadiusMeters: Number(addForm.coverageRadiusMeters) || 200,
      status: addForm.status,
      frequencyBand: addForm.frequencyBand,
      txPowerDbm: Number(addForm.txPowerDbm) || 28,
      antennaType: addForm.antennaType,
      heightMeters: Number(addForm.heightMeters) || 18,
      notes: addForm.notes.trim() || undefined,
      coordinates: {
        lat: -6.7924 + (Math.random() - 0.5) * 0.04,
        lng: 39.2083 + (Math.random() - 0.5) * 0.04,
      },
    });

    showToast(`Mnara mpya "${created.name}" umeongezwa kwenye mfumo!`);
    setShowAddModal(false);
    // Reset form
    setAddForm({
      name: '',
      location: '',
      ipAddress: `192.168.88.${10 + towers.length + 1}`,
      macAddress: '50:C7:BF:70:E2:B0',
      model: 'Omada EAP772 Outdoor WiFi 7',
      coverageRadiusMeters: 200,
      status: 'online',
      frequencyBand: 'WiFi 7 Tri-Band (2.4/5/6GHz)',
      txPowerDbm: 28,
      antennaType: 'Omni-directional 360°',
      heightMeters: 18,
      notes: '',
    });
  };

  const handleConfirmDelete = (id: string) => {
    const target = towers.find((t) => t.id === id);
    deleteTower(id);
    setDeletingTowerId(null);
    showToast(`Mnara "${target?.name || id}" umefutwa kikamilifu.`);
  };

  const handleToggleStatus = (tower: NetworkTower) => {
    const nextStatus = tower.status === 'online' ? 'offline' : 'online';
    updateTower(tower.id, { status: nextStatus });
    showToast(`Hali ya mnara "${tower.name}" imebadilishwa kuwa: ${nextStatus.toUpperCase()}`);
  };

  // Filter towers
  const filteredTowers = towers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onlineTowersCount = towers.filter((t) => t.status === 'online').length;
  const offlineTowersCount = towers.filter((t) => t.status === 'offline').length;
  const maintenanceTowersCount = towers.filter((t) => t.status === 'maintenance').length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-6 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              HOTSPOT INFRASTRUCTURE • STATE CONTROL
            </span>
            <span className="text-stone-400 text-xs">• Usimamizi wa Minara na Vituo vya AP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-amber-400" />
            <span>Orodha & Usimamizi wa Minara (Tower Management)</span>
          </h2>
          <p className="text-stone-300 text-xs max-w-2xl leading-relaxed">
            Ongeza minara mipya, hariri maelezo (jina na eneo), na fuatilia taarifa za kiufundi kama vile IP, coverage ya mita 200, masafa ya frequency, na afya ya mawasiliano.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
              title="Skani QR Code au Barcode ya stika ya AP kwa kamera ya simu au kompyuta (Kama kwenye video)"
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Skani QR ya AP (Kamera)</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowDiscoveryModal(true);
              handleStartNetworkScan();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
            title="Tafuta vifaa vya AP vilivyochomekwa kwenye mtandao (Auto-Discovery)"
          >
            <Scan className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Scan Mtandao (Auto-Discovery)</span>
          </button>

          {onOpenGisMap && (
            <button
              onClick={onOpenGisMap}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Tazama kwenye Ramani (GIS)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#cca43b] hover:bg-[#b89332] text-stone-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ongeza Mnara Mpya</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e6e2d3] rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Jumla ya Minara</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{towers.length}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Iliyosajiliwa kwenye mfumo</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ipo Hewani (Online)</span>
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{onlineTowersCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Inatoa intaneti bila hitilafu</div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Hitilafu / Umeme (Offline)</span>
          </div>
          <div className="text-2xl font-black text-rose-800 mt-1">{offlineTowersCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Haijibu mawasiliano (Ping)</div>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-sky-600" />
            <span>Wateja Mtandaoni Sasa</span>
          </div>
          <div className="text-2xl font-black text-sky-800 mt-1">{activeSessions.length}</div>
          <div className="text-[10px] text-sky-600 mt-0.5">Wanaotumia intaneti moja kwa moja</div>
        </div>
      </div>

      {/* AP Addition & Scanning Methods Guide Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-indigo-900/60 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Njia za Ku-add AP Kwenye Mfumo (Kama Kwenye Video)</span>
              </span>
              <span className="text-stone-400 text-[11px] font-mono">Omada & Reyee Cloud Adoption</span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Ndio! Ku-scan AP kwa Kamera na Ku-scan Mtandao (Discovery) Kunawezekana 100%</span>
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed max-w-3xl">
              Kwenye video uliyoiona, mtumiaji hakujaza maneno mengi: alitumia <strong>Kamera ku-scan QR/Barcode</strong> ya stika iliyopo nyuma ya AP (inayonasa MAC na Serial papo hapo), au alitumia <strong>Scan ya Mtandao (Discovery)</strong> ambapo AP inapochomekwa kwenye swichi inatambuliwa yenyewe ikiwa &quot;Pending&quot; na kubonyeza kitufe kimoja tu cha <strong>&quot;Adopt&quot;</strong>!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Jaribu Skani Kamera</span>
              </button>
            )}
            <button
              onClick={() => {
                setShowDiscoveryModal(true);
                handleStartNetworkScan();
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" />
              <span>Jaribu Scan Mtandao</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e6e2d3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tafuta kwa jina, eneo au IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-[#cca43b] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Yote ({towers.length})
          </button>
          <button
            onClick={() => setFilterStatus('online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'online'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🟢 Online ({onlineTowersCount})
          </button>
          <button
            onClick={() => setFilterStatus('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'offline'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🔴 Offline ({offlineTowersCount})
          </button>
          <button
            onClick={() => setFilterStatus('maintenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'maintenance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🛠️ Matengenezo ({maintenanceTowersCount})
          </button>
        </div>
      </div>

      {/* Towers Table and Cards List */}
      <div className="bg-white border border-[#e6e2d3] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#e6e2d3] flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-stone-800 tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#cca43b]" />
            <span>Orodha ya Minara na Maeneo ({filteredTowers.length})</span>
          </h3>
          <span className="text-[11px] text-stone-500 font-semibold">
            Inasimamiwa kupitia HotspotContext State
          </span>
        </div>

        {filteredTowers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-800 text-sm">Hakuna Mnara Uliopatikana</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Hakuna mnara unaolingana na utafutaji wako. Jaribu neno lingine.'
                : 'Bado hujaongeza mnara wowote. Bonyeza kitufe cha "Ongeza Mnara Mpya" kuanza kusajili vituo vyako.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-4 py-2 bg-[#cca43b] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Ongeza Mnara Sasa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f2eb] border-b border-[#e6e2d3] text-stone-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">Mnara & Eneo</th>
                  <th className="p-4">Model & Firmware</th>
                  <th className="p-4">IP Address & Mawasiliano</th>
                  <th className="p-4">Coverage & Masafa</th>
                  <th className="p-4">Hali (Status)</th>
                  <th className="p-4 text-right">Vitendo (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d3]">
                {filteredTowers.map((tower) => {
                  const isOnline = tower.status === 'online';
                  const isMaintenance = tower.status === 'maintenance';

                  return (
                    <tr key={tower.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name & Location */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                            <span>{tower.name}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{tower.location}</span>
                          </div>
                        </div>
                      </td>

                      {/* Model & Antenna */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[11px] border border-stone-200">
                            {tower.model}
                          </span>
                          <div className="text-[10px] text-stone-400">
                            Nguzo: {tower.heightMeters || 15}m • {tower.antennaType || 'Omni 360°'}
                          </div>
                        </div>
                      </td>

                      {/* IP & Latency */}
                      <td className="p-4 font-mono">
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-800">{tower.ipAddress}</span>
                          <div className="text-[10px] text-stone-400 font-sans flex items-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-500" />
                            <span>Ping: {tower.lastPingMs || 4}ms</span>
                          </div>
                        </div>
                      </td>

                      {/* Coverage & Frequency */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[10px]">
                            <Compass className="w-3 h-3 text-amber-600" />
                            <span>Radius: {tower.coverageRadiusMeters} Mita</span>
                          </span>
                          <div className="text-[10px] text-stone-500 truncate max-w-[160px]">
                            {tower.frequencyBand}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>🟢 Hewani</span>
                          </span>
                        ) : isMaintenance ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>🛠️ Matengenezo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>🔴 Offline</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Technical details */}
                          <button
                            onClick={() => setViewingTechTower(tower)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="Tazama Taarifa za Kiufundi (Technical Specs)"
                          >
                            <Server className="w-4 h-4 text-sky-600" />
                          </button>

                          {/* Edit details */}
                          <button
                            onClick={() => handleOpenEdit(tower)}
                            className="p-1.5 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                            title="Hariri Taarifa za Mnara (Edit)"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* Toggle power/status */}
                          <button
                            onClick={() => handleToggleStatus(tower)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isOnline
                                ? 'bg-emerald-50 hover:bg-rose-100 text-emerald-700 hover:text-rose-700'
                                : 'bg-rose-50 hover:bg-emerald-100 text-rose-700 hover:text-emerald-700'
                            }`}
                            title={isOnline ? 'Zima / Geuza Offline' : 'Washa / Geuza Online'}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingTowerId(tower.id)}
                            className="p-1.5 bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Futa Mnara"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. MODAL: ONGEZA MNARA MPYA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl border border-stone-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Ongeza Mnara Mpya</h3>
                  <p className="text-[11px] text-stone-500">Sajili mnara mpya au kituo cha WiFi kwenye mtandao wako</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Jina la Mnara:</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Mnara wa Soko Kuu"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Eneo / Mtaa / Wilaya:</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Posta / Karibu na Benki"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Model ya Kifaa:</label>
                  <select
                    value={addForm.model}
                    onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b] cursor-pointer"
                  >
                    <option value="Omada EAP772 Outdoor WiFi 7">Omada EAP772 Outdoor WiFi 7</option>
                    <option value="Omada EAP650-Outdoor">Omada EAP650-Outdoor</option>
                    <option value="Omada EAP610-Outdoor">Omada EAP610-Outdoor</option>
                    <option value="Omada EAP225-Outdoor">Omada EAP225-Outdoor</option>
                    <option value="MikroTik cAP ac Outdoor">MikroTik cAP ac Outdoor</option>
                    <option value="MikroTik NetMetal ax">MikroTik NetMetal ax</option>
                    <option value="MikroTik BaseBox 5">MikroTik BaseBox 5</option>
                    <option value="Ubiquiti UniFi AC Mesh Pro">Ubiquiti UniFi AC Mesh Pro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">IP Address:</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.88.10"
                    value={addForm.ipAddress}
                    onChange={(e) => setAddForm({ ...addForm, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Coverage (Mita):</label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    value={addForm.coverageRadiusMeters}
                    onChange={(e) => setAddForm({ ...addForm, coverageRadiusMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Tx Power (dBm):</label>
                  <input
                    type="number"
                    value={addForm.txPowerDbm}
                    onChange={(e) => setAddForm({ ...addForm, txPowerDbm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Urefu Nguzo (M):</label>
                  <input
                    type="number"
                    value={addForm.heightMeters}
                    onChange={(e) => setAddForm({ ...addForm, heightMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Masafa (Frequency Band):</label>
                  <select
                    value={addForm.frequencyBand}
                    onChange={(e) => setAddForm({ ...addForm, frequencyBand: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b] cursor-pointer"
                  >
                    <option value="WiFi 7 Tri-Band (2.4/5/6GHz)">WiFi 7 Tri-Band (2.4/5/6GHz)</option>
                    <option value="Dual-Band (2.4GHz & 5GHz)">Dual-Band (2.4GHz & 5GHz)</option>
                    <option value="5GHz Only (High Speed)">5GHz Only (High Speed)</option>
                    <option value="2.4GHz Only (Long Range)">2.4GHz Only (Long Range)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Hali ya Kuanzia:</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b] cursor-pointer"
                  >
                    <option value="online">🟢 Hewani (Online)</option>
                    <option value="offline">🔴 Hitilafu (Offline)</option>
                    <option value="maintenance">🛠️ Matengenezo (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Maelezo ya Ziada (Notes):</label>
                <textarea
                  rows={2}
                  placeholder="Maelezo yoyote kuhusu mazingira au nguzo..."
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#cca43b] hover:bg-[#b89332] text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hifadhi Mnara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: HARIRI MNARA (EDIT TOWER) */}
      {editingTower && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl border border-stone-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Hariri Maelezo ya Mnara</h3>
                  <p className="text-[11px] text-stone-500">Badilisha jina, eneo au taarifa za uendeshaji</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTower(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Jina la Mnara:</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Eneo / Mtaa / Wilaya:</label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Model ya Kifaa:</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">IP Address:</label>
                  <input
                    type="text"
                    required
                    value={editForm.ipAddress}
                    onChange={(e) => setEditForm({ ...editForm, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Coverage (Mita):</label>
                  <input
                    type="number"
                    value={editForm.coverageRadiusMeters}
                    onChange={(e) => setEditForm({ ...editForm, coverageRadiusMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Tx Power (dBm):</label>
                  <input
                    type="number"
                    value={editForm.txPowerDbm}
                    onChange={(e) => setEditForm({ ...editForm, txPowerDbm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Hali (Status):</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#cca43b] cursor-pointer"
                  >
                    <option value="online">🟢 Hewani (Online)</option>
                    <option value="offline">🔴 Hitilafu (Offline)</option>
                    <option value="maintenance">🛠️ Matengenezo (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Maelezo (Notes):</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#cca43b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingTower(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#cca43b] hover:bg-[#b89332] text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Sasisha Mabadiliko</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: TAARIFA ZA KIUFUNDI (TECHNICAL DETAILS SPECIFICATIONS) */}
      {viewingTechTower && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-white animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    viewingTechTower.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : viewingTechTower.status === 'maintenance'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {viewingTechTower.status === 'online' ? '🟢 ONLINE' : viewingTechTower.status === 'maintenance' ? '🛠️ MAINTENANCE' : '🔴 OFFLINE'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">ID: {viewingTechTower.id}</span>
                </div>
                <h3 className="text-lg font-black text-amber-400 mt-1">{viewingTechTower.name}</h3>
                <p className="text-xs text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{viewingTechTower.location}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingTechTower(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hardware Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Model ya Kifaa</span>
                <strong className="text-white text-xs">{viewingTechTower.model}</strong>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">IP Address ya Mtandao</span>
                <strong className="text-amber-400 font-mono text-xs">{viewingTechTower.ipAddress}</strong>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Mzingo wa Coverage</span>
                <strong className="text-emerald-400 text-xs">{viewingTechTower.coverageRadiusMeters} Mita (Radius)</strong>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Tx Output Power</span>
                <strong className="text-sky-400 text-xs">{viewingTechTower.txPowerDbm || 28} dBm</strong>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Masafa ya Frequency</span>
                <strong className="text-white text-xs">{viewingTechTower.frequencyBand}</strong>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Aina ya Antenna</span>
                <strong className="text-white text-xs">{viewingTechTower.antennaType || 'Omni-directional 360°'}</strong>
              </div>
            </div>

            {/* Additional Network Metrics */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>MAC Address ya Kifaa:</span>
                <span className="text-white font-mono">{viewingTechTower.macAddress || '50:C7:BF:70:E2:B0'}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Urefu wa Nguzo ya Mnara:</span>
                <span className="text-white">{viewingTechTower.heightMeters || 18} Mita</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Muda wa Kufungwa (Installed):</span>
                <span className="text-white">{new Date(viewingTechTower.installedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Ping Latency / Afya:</span>
                <span className="text-emerald-400 font-bold">{viewingTechTower.lastPingMs || 4} ms (Excellent)</span>
              </div>
              {viewingTechTower.notes && (
                <div className="pt-2 border-t border-stone-850 text-stone-400">
                  <span className="font-bold text-stone-300 block mb-0.5">Maelezo:</span>
                  <p className="text-[11px] leading-relaxed">{viewingTechTower.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setViewingTechTower(null);
                  handleOpenEdit(viewingTechTower);
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Hariri Taarifa</span>
              </button>

              <button
                onClick={() => setViewingTechTower(null)}
                className="px-5 py-2 bg-[#cca43b] hover:bg-[#b89332] text-stone-950 font-black rounded-xl text-xs cursor-pointer shadow-md"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CONFIRM DELETE TOWER */}
      {deletingTowerId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-white animate-fadeIn">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black">Una uhakika unataka kufuta mnara huu?</h3>
              <p className="text-xs text-stone-400">
                Mnara huu utaondolewa kwenye mfumo na kwenye ramani ya GIS ya mtandao.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingTowerId(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingTowerId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
              >
                Futa Mnara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: NETWORK AUTO-DISCOVERY SCANNER (TP-LINK OMADA & RUIJIE AP SCANNER) */}
      {showDiscoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative text-white animate-fadeIn">
            {/* Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">
                    Network Auto-Discovery & Adoption (Scan ya Mtandao)
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    Huu ndio mfumo wa kiuhalisia: unagundua AP zilizochomekwa kwenye mtandao bila kuandika maneno kwa mkono!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiscoveryModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Scan Status Console */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-300 font-sans font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Hali ya Utafutaji (Broadcast Discovery 192.168.88.x)</span>
                  </div>
                  <button
                    onClick={handleStartNetworkScan}
                    disabled={isScanningNetwork}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-sans font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningNetwork ? 'animate-spin' : ''}`} />
                    <span>Rudia Scan</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-stone-850">
                  {scanStepLog.map((log, index) => (
                    <div key={index} className="flex items-center gap-2 text-emerald-400 animate-fadeIn">
                      <span className="text-emerald-500">✓</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {isScanningNetwork && (
                    <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Inachambua pakiti za Layer 2...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Discovered Devices List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Vifaa Vilivyogunduliwa Hewani ({discoveredAps.length})</span>
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Bofya kitufe cha <strong>&quot;Adopt&quot;</strong> kukiunganisha kwenye minara mara moja!
                  </span>
                </div>

                <div className="space-y-2.5">
                  {discoveredAps.map((ap) => {
                    const isAdopted = ap.status === 'adopted';
                    return (
                      <div
                        key={ap.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isAdopted
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-stone-950 border-stone-800 hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="space-y-1 font-sans">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-white text-xs font-bold">{ap.model}</strong>
                            {isAdopted ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                Adopted & Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold animate-pulse">
                                Pending Adoption
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400 font-mono">
                            <span>MAC: <strong className="text-stone-200">{ap.mac}</strong></span>
                            <span>IP: <strong className="text-stone-200">{ap.ip}</strong></span>
                            <span>Eneo Linalopendekezwa: <strong className="text-amber-300 font-sans">{ap.siteSuggestion}</strong></span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isAdopted ? (
                            <span className="text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10">
                              ✓ Ipo Kwenye Orodha
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAdoptDiscoveredAp(ap)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5 text-yellow-300" />
                              <span>⚡ Adopt Kwenye Mnara</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory note about Camera QR option */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 text-stone-300">
                  <strong className="text-white block font-bold">Unapendelea njia ya ku-scan kwa kamera?</strong>
                  <p className="text-[11px] text-stone-400">
                    Unaweza kuelekeza kamera ya simu kwenye stika iliyopo nyuma ya AP au kwenye boksi lake kusoma MAC Address na Serial papo hapo.
                  </p>
                </div>
                {onOpenScanner && (
                  <button
                    onClick={() => {
                      setShowDiscoveryModal(false);
                      onOpenScanner();
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Fungua Skani ya Kamera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-800 flex justify-end bg-stone-950/40">
              <button
                onClick={() => setShowDiscoveryModal(false)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Funga Dirisha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
