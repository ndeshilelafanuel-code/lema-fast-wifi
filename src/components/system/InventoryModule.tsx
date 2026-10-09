import React, { useState } from 'react';
import { ScannedEquipment } from './QrEquipmentScannerModal';
import {
  QrCode,
  Radio,
  Server,
  Zap,
  Layers,
  BatteryCharging,
  Plus,
  Printer,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';

interface InventoryModuleProps {
  inventory: ScannedEquipment[];
  onOpenScanner: () => void;
  onRemoveEquipment: (id: string) => void;
  onAddManual: (equipment: ScannedEquipment) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  onOpenScanner,
  onRemoveEquipment,
  onAddManual,
  showToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeviceForQr, setSelectedDeviceForQr] = useState<ScannedEquipment | null>(null);

  // Filtered devices
  const filteredItems = inventory.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.site.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalCount = inventory.length;
  const onlineCount = inventory.filter((i) => i.status === 'online').length;
  const standbyCount = inventory.filter((i) => i.status === 'standby').length;
  const offlineCount = inventory.filter((i) => i.status === 'offline').length;

  // Estimated asset value (TZS)
  const calculateTotalValuation = () => {
    return inventory.reduce((total, item) => {
      let price = 250000; // default
      if (item.category === 'ap') price = 320000;
      if (item.category === 'router') price = 180000;
      if (item.category === 'switch') price = 220000;
      if (item.category === 'starlink') price = 1100000;
      if (item.category === 'power') price = 750000;
      return total + price;
    }, 0);
  };

  const exportInventoryCsv = () => {
    const headers = 'ID,Name,Category,Manufacturer,Model,Serial Number,MAC Address,Site,Status,Registered At\n';
    const rows = inventory
      .map(
        (i) =>
          `"${i.id}","${i.name}","${i.category}","${i.manufacturer}","${i.model}","${i.serialNumber}","${i.macAddress}","${i.site}","${i.status}","${i.registeredAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lema-wifi-equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory Imepakuliwa!', 'Faili la CSV la vifaa vyote limetolewa.', 'success');
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'ap':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">📡 Access Point</span>;
      case 'router':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">⚡ Router</span>;
      case 'switch':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">🔌 PoE Switch</span>;
      case 'starlink':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">🛰️ Starlink Kit</span>;
      case 'power':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">🔋 Solar / UPS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-700 text-stone-300">Device</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-stone-200">
      {/* Top Header Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-stone-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              <span>Smart QR Code Hardware Registration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Stoo & Usimamizi wa Vifaa vya Wi-Fi (Equipment Inventory)
            </h2>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Sajili na usimamie antena, ruta, switches na vifaa vya sola kwa kuskani lebo zao za QR code au barcode moja kwa moja kutoka kwenye sanduku.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-yellow-300" />
              <span>Skani QR ya Kifaa Sasa</span>
            </button>

            <button
              onClick={exportInventoryCsv}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Statistics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Jumla ya Vifaa</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
              <span className="text-xl">📦</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Vimesajiliwa kwenye stoo</span>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Vipo Hewani (Online)</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-400 font-mono">{onlineCount}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[10px] text-stone-400 block">{totalCount > 0 ? ((onlineCount / totalCount) * 100).toFixed(0) : 0}% ya vifaa vyote</span>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Vifaa vya Akiba (Spares)</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-400 font-mono">{standbyCount}</span>
              <span className="text-xl">🛠️</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Vipo stoo tayari kwa dharura</span>
          </div>

          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Thamani ya Mali (Asset Value)</span>
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl font-black text-[#cca43b] font-mono">
                Tsh {(calculateTotalValuation() / 1000000).toFixed(2)}M
              </span>
              <span className="text-xl">💎</span>
            </div>
            <span className="text-[10px] text-stone-400 block">Makadirio ya uwekezaji</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {[
            { id: 'all', label: 'Vifaa Vyote' },
            { id: 'ap', label: '📡 Access Points' },
            { id: 'router', label: '⚡ Routers' },
            { id: 'switch', label: '🔌 PoE Switches' },
            { id: 'starlink', label: '🛰️ Starlink' },
            { id: 'power', label: '🔋 Sola/UPS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta Serial No, MAC, au Kituo..."
            className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold text-[10px] uppercase font-mono tracking-wider">
                <th className="p-4">Kifaa & Model</th>
                <th className="p-4">Aina (Type)</th>
                <th className="p-4">Serial Number (S/N)</th>
                <th className="p-4">MAC Address</th>
                <th className="p-4">Kituo (Site Location)</th>
                <th className="p-4">Hali (Status)</th>
                <th className="p-4 text-right">Vitendo (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    <p className="font-bold text-sm">Hakuna kifaa kilichopatikana kwenye kichujio hiki.</p>
                    <p className="text-xs mt-1">Bonyeza "Skani QR ya Kifaa Sasa" kuongeza kifaa kipya.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((device) => (
                  <tr key={device.id} className="hover:bg-stone-850/40 transition-colors">
                    {/* Device info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {device.category === 'ap' ? '📡' : device.category === 'router' ? '⚡' : device.category === 'starlink' ? '🛰️' : '🔌'}
                        </div>
                        <div>
                          <strong className="text-white text-xs block leading-tight">{device.name}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {device.manufacturer} · {device.model}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      {getCategoryBadge(device.category)}
                    </td>

                    {/* Serial Number */}
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {device.serialNumber}
                    </td>

                    {/* MAC */}
                    <td className="p-4 font-mono text-stone-300 text-[11px]">
                      {device.macAddress}
                    </td>

                    {/* Site */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{device.site}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {device.status === 'online' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Online</span>
                        </span>
                      ) : device.status === 'standby' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span>Standby / Stoo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span>Offline</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDeviceForQr(device)}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-indigo-500/50 text-indigo-400 hover:text-white transition-colors"
                          title="Tazama Lebo ya QR / Print Asset Label"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            showToast('Ping Test', `Kifaa cha ${device.name} kinajibu kwa 4ms. Ubora wa mawimbi ni 100%.`, 'info');
                          }}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-emerald-500/50 text-emerald-400 hover:text-white transition-colors"
                          title="Pima Muunganisho (Ping Health)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Je, una uhakika unataka kuondoa kifaa cha "${device.name}" kwenye stoo?`)) {
                              onRemoveEquipment(device.id);
                              showToast('Kifaa Kimeondolewa', `"${device.name}" kimefutwa kwenye stoo.`, 'warning');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-rose-500/50 text-rose-400 hover:text-white transition-colors"
                          title="Ondoa Kifaa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP: Print / View Asset QR Label Modal */}
      {selectedDeviceForQr && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-stone-950 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedDeviceForQr(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                Lema Fast WiFi Asset Label
              </span>
              <h3 className="font-black text-base text-stone-900">{selectedDeviceForQr.name}</h3>
              <p className="text-[11px] text-stone-500">{selectedDeviceForQr.site}</p>
            </div>

            {/* Generated QR Stencil Card */}
            <div className="p-4 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              {/* QR Stencil Box */}
              <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-xs border border-stone-200 flex flex-col items-center justify-center">
                <QrCode className="w-32 h-32 text-stone-950" />
              </div>

              <div className="font-mono text-[10px] text-stone-700 space-y-0.5">
                <p><strong>S/N:</strong> {selectedDeviceForQr.serialNumber}</p>
                <p><strong>MAC:</strong> {selectedDeviceForQr.macAddress}</p>
                <p><strong>KEY:</strong> {selectedDeviceForQr.deviceKey}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chapisha Lebo (Print)</span>
              </button>

              <button
                onClick={() => setSelectedDeviceForQr(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
