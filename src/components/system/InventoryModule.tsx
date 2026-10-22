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
  Clock,
  Wifi,
  X
} from 'lucide-react';

interface InventoryModuleProps {
  inventory: ScannedEquipment[];
  onOpenScanner: () => void;
  onRemoveEquipment: (id: string, macAddress?: string) => void;
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
  const [deviceToDelete, setDeviceToDelete] = useState<ScannedEquipment | null>(null);

  // Manual Add Modal State
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  const [manualForm, setManualForm] = useState({
    name: 'AP Kariakoo 01',
    category: 'ap' as ScannedEquipment['category'],
    manufacturer: 'TP-Link',
    model: 'Omada EAP Series',
    serialNumber: '',
    macAddress: 'D4-D6-DF-0D-B3-A0',
    ipAddress: '192.168.1.153',
    site: 'Kariakoo',
    status: 'online' as ScannedEquipment['status'],
  });

  const handleApplyPresetOmada = () => {
    setManualForm({
      name: 'AP Kariakoo 01 (Omada)',
      category: 'ap',
      manufacturer: 'TP-Link',
      model: 'Omada Outdoor EAP',
      serialNumber: 'SN-OMADA-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      macAddress: 'D4-D6-DF-0D-B3-A0',
      ipAddress: '192.168.1.153',
      site: 'Kariakoo',
      status: 'online',
    });
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.macAddress.trim()) {
      showToast('Kosa', 'Tafadhali ingiza MAC address ya kifaa.', 'warning');
      return;
    }
    const cleanMac = manualForm.macAddress.trim().toUpperCase();
    const newEquipment: ScannedEquipment = {
      id: `eq-${Date.now()}`,
      name: manualForm.name.trim() || `Kifaa cha ${manualForm.site || 'Mtandao'}`,
      category: manualForm.category,
      manufacturer: manualForm.manufacturer.trim() || 'TP-Link',
      model: manualForm.model.trim() || 'Omada EAP',
      serialNumber: manualForm.serialNumber.trim() || cleanMac.replace(/[^A-Z0-9]/g, ''),
      macAddress: cleanMac,
      deviceKey: `KEY-${cleanMac.slice(-6)}`,
      site: manualForm.site.trim() || 'Kariakoo',
      ipAddress: manualForm.ipAddress.trim() || '192.168.1.153',
      poeVoltage: '24V Passive / 802.3af',
      status: manualForm.status,
      registeredAt: new Date().toISOString(),
      autoProvisioned: true,
    };

    onAddManual(newEquipment);
    setShowManualModal(false);
  };

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
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span>+ Ongeza Kifaa kwa Mkono</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-yellow-300" />
              <span>Skani QR ya Kifaa</span>
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
                  <td colSpan={7} className="p-10 text-center text-stone-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center mx-auto text-xl">
                        📡
                      </div>
                      <p className="font-bold text-white text-sm">Hakuna kifaa kilichosajiliwa bado.</p>
                      <p className="text-xs text-stone-400">
                        Sajili Access Point yako (kama TP-Link Omada uliyonayo) au Router kwenye mfumo ili data zihifadhiwe moja kwa moja kwenye PostgreSQL ya Render.
                      </p>
                      <div className="flex items-center justify-center gap-2.5 pt-2">
                        <button
                          onClick={() => setShowManualModal(true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ongeza Kifaa kwa Mkono</span>
                        </button>
                        <button
                          onClick={onOpenScanner}
                          className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-stone-750 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Skani QR ya Kifaa</span>
                        </button>
                      </div>
                    </div>
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
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStatus = device.status === 'online' ? 'offline' : 'online';
                          const updated = {
                            ...device,
                            status: nextStatus as any,
                            lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          };
                          onAddManual(updated);
                          try {
                            await fetch(
                              `/api/v1/hardware/alert/outage?mac=${encodeURIComponent(device.macAddress)}&status=${nextStatus === 'online' ? 'up' : 'down'}&ip=${encodeURIComponent(device.ipAddress)}&name=${encodeURIComponent(device.name)}&site=${encodeURIComponent(device.site)}`
                            );
                          } catch (e) {}
                          showToast(
                            nextStatus === 'online' ? '🟢 AP Imewashwa (Online)' : '🔴 AP Imezimwa (Offline)',
                            nextStatus === 'online'
                              ? `${device.name} sasa iko hewani na inahifadhiwa kwenye PostgreSQL.`
                              : `Kengele: ${device.name} imezimwa (Arifa ya dharura imetumwa).`,
                            nextStatus === 'online' ? 'success' : 'warning'
                          );
                        }}
                        title="Bofya hapa kubadilisha hali (Online / Offline) na kutuma kengele"
                        className="cursor-pointer transition-transform active:scale-95 text-left"
                      >
                        {device.status === 'online' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>🟢 Online (Bofya Kuzima)</span>
                          </span>
                        ) : device.status === 'standby' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <span>🟡 Standby</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>🔴 Offline (Bofya Kuwasha)</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDeviceForQr(device)}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-indigo-500/50 text-indigo-400 hover:text-white transition-colors cursor-pointer"
                          title="Tazama Lebo ya QR / Print Asset Label"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            showToast(
                              'Taarifa ya Mawasiliano',
                              `Kifaa: ${device.name} (IP: ${device.ipAddress}). Hali kwenye Database: ${device.status.toUpperCase()}.`,
                              'info'
                            );
                          }}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-emerald-500/50 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                          title="Kagua Taarifa za Kifaa"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeviceToDelete(device)}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-rose-500/50 text-rose-400 hover:text-white transition-colors cursor-pointer"
                          title="Ondoa Kifaa kwenye Stoo na Seva"
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
      {/* OMADA CLOUD CONTROLLER LIVE SYNC CARD */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-indigo-950/30 border border-stone-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">
              🔗
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>TP-Link Omada Cloud Controller Live Link</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Uhalisia wa AP 100%
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Unganisha moja kwa moja na Omada Controller yako (<span className="text-indigo-300 font-mono">euw1-omada-cloud.tplinkcloud.com</span>) ili AP ikizima kule, mfumo utambue mara moja.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 bg-stone-950 border border-stone-850 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px]">1</span>
              <span>Kwenye Omada Cloud</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Kwenye skrini yako ya Omada, nenda chini kwenye <strong>Settings (⚙️) ➔ Controller / Maintenance ➔ Webhook Notification</strong> (au <strong>Alerts ➔ Webhook</strong>).
            </p>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-850 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">2</span>
              <span>Weka Webhook URL Hii</span>
            </div>
            <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl font-mono text-[10px] text-emerald-300 break-all select-all">
              https://lema-fast-wifi-bot.onrender.com/api/v1/omada/webhook
            </div>
            <p className="text-stone-400 text-[11px]">
              Chagua arifa za: <strong>Device Disconnected</strong> na <strong>Device Connected</strong>.
            </p>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-850 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">3</span>
              <span>Pima Mara Moja Hapa</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Unaweza kupima mara moja jinsi Omada inavyotuma taarifa AP ikizima au ikiwaka:
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/v1/omada/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventType: 'device_disconnected',
                      mac: 'D4-D6-DF-0D-B3-A0',
                      name: 'AP Kariakoo 01 (Omada)',
                      ip: '192.168.1.153',
                      status: 'disconnected',
                    }),
                  });
                  showToast(
                    '🔴 Omada Alert: AP Imezima!',
                    'Taarifa imepokelewa toka Omada: AP imewekwa OFFLINE na kengele imetumwa WhatsApp/SMS.',
                    'warning'
                  );
                }}
                className="flex-1 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer"
              >
                Pima: AP Imezima
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/v1/omada/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventType: 'device_connected',
                      mac: 'D4-D6-DF-0D-B3-A0',
                      name: 'AP Kariakoo 01 (Omada)',
                      ip: '192.168.1.153',
                      status: 'connected',
                    }),
                  });
                  showToast(
                    '🟢 Omada Alert: AP Imewaka!',
                    'Taarifa imepokelewa toka Omada: AP imerejea ONLINE kikamilifu.',
                    'success'
                  );
                }}
                className="flex-1 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer"
              >
                Pima: AP Imewaka
              </button>
            </div>
          </div>
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
      {/* POPUP: Manual Hardware Registration Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-8 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-stone-950 text-stone-400 hover:text-white border border-stone-800 hover:border-stone-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Wifi className="w-3 h-3" />
                <span>PostgreSQL Cloud Database Sync</span>
              </div>
              <h3 className="font-black text-xl text-white">Sajili Kifaa kwa Mkono</h3>
              <p className="text-xs text-stone-400">
                Weka taarifa za Access Point, Router au Switch ili zihifadhiwe moja kwa moja kwenye Render.
              </p>
            </div>

            {/* Preset 1-Click Button for Omada TP-Link */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-indigo-300 block">
                  💡 Umefungua TP-Link Omada (Kariakoo)?
                </span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  MAC: D4-D6-DF-0D-B3-A0 · IP: 192.168.1.153
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyPresetOmada}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors shrink-0 shadow-sm"
              >
                Jaza Haraka ⚡
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">Jina la Kifaa (Device Name) *</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="mfano: AP Kariakoo 01"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Aina ya Kifaa (Category)</label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ap">📡 Access Point (AP / Antena)</option>
                    <option value="router">⚡ Router / Gateway (MikroTik)</option>
                    <option value="switch">🔌 PoE Switch</option>
                    <option value="starlink">🛰️ Starlink Kit</option>
                    <option value="power">🔋 Solar / UPS Backup</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Kituo / Eneo (Site) *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.site}
                    onChange={(e) => setManualForm({ ...manualForm, site: e.target.value })}
                    placeholder="mfano: Kariakoo"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Mtengenezaji (Brand)</label>
                  <input
                    type="text"
                    value={manualForm.manufacturer}
                    onChange={(e) => setManualForm({ ...manualForm, manufacturer: e.target.value })}
                    placeholder="TP-Link, MikroTik, Ubiquiti"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Modeli (Model)</label>
                  <input
                    type="text"
                    value={manualForm.model}
                    onChange={(e) => setManualForm({ ...manualForm, model: e.target.value })}
                    placeholder="EAP110-Outdoor, EAP225, nk."
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">MAC Address *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.macAddress}
                    onChange={(e) => setManualForm({ ...manualForm, macAddress: e.target.value })}
                    placeholder="D4-D6-DF-0D-B3-A0"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-emerald-400 font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">IP Address</label>
                  <input
                    type="text"
                    value={manualForm.ipAddress}
                    onChange={(e) => setManualForm({ ...manualForm, ipAddress: e.target.value })}
                    placeholder="192.168.1.153"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">Hali ya Kifaa (Status)</label>
                <div className="flex gap-2">
                  {[
                    { id: 'online', label: '🟢 Online (Kiko Hewani)' },
                    { id: 'standby', label: '🟡 Standby (Kipo Stoo)' },
                    { id: 'offline', label: '🔴 Offline' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, status: s.id as any })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        manualForm.status === s.id
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hifadhi Kwenye PostgreSQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL YA KUTHIBITISHA KUFUTA KIFAA (IN-APP MODAL - HAITUMII WINDOW.CONFIRM) */}
      {deviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl shadow-rose-950/40">
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Thibitisha Kufuta Kifaa</h4>
                  <p className="text-[11px] text-stone-400">Ondoa kifaa hiki kabisa kwenye mfumo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeviceToDelete(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Jina la Kifaa:</span>
                <span className="text-white font-bold">{deviceToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Aina / Mfano:</span>
                <span className="text-stone-300 font-mono text-[11px]">{deviceToDelete.manufacturer} · {deviceToDelete.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">MAC Address:</span>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">{deviceToDelete.macAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Kituo (Site):</span>
                <span className="text-stone-300">{deviceToDelete.site || 'Kariakoo'}</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Je, una uhakika unataka kuondoa <strong>{deviceToDelete.name}</strong>? Kifaa hiki kitafutwa mara moja kwenye stoo ya vifaa na seva.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setDeviceToDelete(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = deviceToDelete.id;
                  const mac = deviceToDelete.macAddress;
                  const name = deviceToDelete.name;
                  setDeviceToDelete(null);
                  onRemoveEquipment(id, mac);
                  showToast('Kifaa Kimeondolewa', `"${name}" kimefutwa kwenye stoo na seva.`, 'warning');
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ndio, Futa Kifaa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

