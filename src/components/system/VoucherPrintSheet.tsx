import React, { useState } from 'react';
import { Voucher, HotspotSettings } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import {
  Printer,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  ArrowLeft,
  Scissors,
  Receipt,
  Info,
  ExternalLink,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface VoucherPrintSheetProps {
  vouchers: Voucher[];
  settings: HotspotSettings;
  onClose: () => void;
}

export const VoucherPrintSheet: React.FC<VoucherPrintSheetProps> = ({
  vouchers,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [printAttempted, setPrintAttempted] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'a4' | 'pos'>('a4');
  const [filterPrice, setFilterPrice] = useState<number | 'all'>('all');

  const filteredVouchers = filterPrice === 'all'
    ? vouchers
    : vouchers.filter(v => v.price === filterPrice);

  // 1. Direct Print Execution with fallback handling
  const handlePrint = () => {
    setPrintAttempted(true);
    try {
      window.print();
    } catch (err) {
      console.warn('Browser direct print failed or restricted:', err);
    }
  };

  // 2. Download Standalone Printable HTML File (Works 100% on any device, browser, or print shop)
  const handleDownloadPrintableHtml = () => {
    const vouchersHtml = filteredVouchers.map((v) => `
      <div class="voucher-card">
        <div class="voucher-header">
          <div class="brand-title">
            <span class="brand-dot"></span>
            <strong>LEMA FAST WiFi</strong>
          </div>
          <span class="price-tag">Tsh ${v.price.toLocaleString()}</span>
        </div>
        
        <div class="code-section">
          <div class="code-label">NAMBARI YA VOCHA (PIN)</div>
          <div class="voucher-code">${v.code}</div>
          <div class="package-name">${v.packageName}</div>
        </div>

        <div class="instructions">
          1. Washa Wi-Fi: <strong>Lema Fast WiFi</strong><br/>
          2. Fungua browser & ingiza nambari hii
        </div>

        <div class="voucher-footer">
          <div>Muda: <strong>${v.durationHours}H</strong> | Spidi: <strong>${v.speedLimit}</strong></div>
          <div class="phone">Msaada: ${settings.supportPhone}</div>
        </div>
      </div>
    `).join('');

    const fullHtml = `<!DOCTYPE html>
<html lang="sw">
<head>
  <meta charset="UTF-8">
  <title>Vocha Rasmi za Lema Fast WiFi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
    }
    .no-print-bar {
      max-width: 900px;
      margin: 0 auto 20px auto;
      background: #1e293b;
      color: #fff;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn {
      background: #f59e0b;
      color: #000;
      border: none;
      font-weight: 800;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover { background: #d97706; }
    .sheet-container {
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .sheet-header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .sheet-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #0f172a;
    }
    .sheet-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .vouchers-grid {
      display: grid;
      grid-template-columns: repeat(${layoutMode === 'pos' ? '1' : '3'}, 1fr);
      gap: 14px;
    }
    .voucher-card {
      border: 2px dashed #94a3b8;
      border-radius: 10px;
      padding: 12px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .voucher-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 11px;
      font-weight: 800;
      color: #0284c7;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .brand-dot {
      width: 6px;
      height: 6px;
      background: #0284c7;
      border-radius: 50%;
      display: inline-block;
    }
    .price-tag {
      font-size: 11px;
      font-weight: 800;
      background: #fef3c7;
      color: #78350f;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    .code-section {
      text-align: center;
      padding: 6px 0;
    }
    .code-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .voucher-code {
      font-size: 24px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 3px;
      color: #0f172a;
      margin: 4px 0;
    }
    .package-name {
      font-size: 10px;
      font-weight: 700;
      color: #334155;
    }
    .instructions {
      font-size: 8.5px;
      color: #64748b;
      background: #f8fafc;
      padding: 4px 6px;
      border-radius: 4px;
      margin: 6px 0;
      line-height: 1.3;
    }
    .voucher-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 8.5px;
      color: #64748b;
    }
    .phone {
      margin-top: 2px;
      font-weight: 600;
      color: #475569;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print-bar { display: none !important; }
      .sheet-container { box-shadow: none; padding: 0; max-width: 100%; }
      .voucher-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>Lema Fast WiFi - Vocha Tayari za Kuchapishwa</strong>
      <div style="font-size: 12px; color: #94a3b8;">Jumla ya vocha: ${filteredVouchers.length} | Unaweza kuchapisha moja kwa moja au kuhifadhi kama PDF</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Bonyeza Hapa Kuchapisha (Print)</button>
  </div>

  <div class="sheet-container">
    <div class="sheet-header">
      <div class="sheet-title">Vocha Rasmi za Lema Fast WiFi</div>
      <div class="sheet-sub">Unganisha Mtandao: <strong>Lema Fast WiFi</strong> | Huduma kwa Wateja: <strong>${settings.supportPhone}</strong></div>
    </div>

    <div class="vouchers-grid">
      ${vouchersHtml}
    </div>
  </div>

  <script>
    // Jaribu kufungua print dialog kiotomatiki mara faili linapofunguka
    window.addEventListener('load', function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 500);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vocha-Lema-WiFi-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  // 3. Download CSV for Excel / Shop Records
  const handleDownloadCsv = () => {
    const headers = 'Nambari ya Vocha,Kifurushi,Bei (TZS),Muda (Masaa),Spidi,Simu ya Msaada\n';
    const rows = filteredVouchers
      .map(
        (v) =>
          `"${v.code}","${v.packageName}",${v.price},${v.durationHours},"${v.speedLimit}","${settings.supportPhone}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vocha-Lema-WiFi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Copy all voucher codes to clipboard
  const handleCopyCodes = () => {
    const textList = [
      `📶 VIFURUSHI VYA LEMA FAST WIFI (${filteredVouchers.length} Vocha)`,
      `Unganisha WiFi: Lema Fast WiFi | Simu: ${settings.supportPhone}`,
      '----------------------------------------',
      ...filteredVouchers.map(
        (v, i) => `${i + 1}. CODE: ${v.code} | Tsh ${v.price.toLocaleString()} (${v.packageName})`
      ),
      '----------------------------------------',
      'Ingiza kodi hii kwenye ukurasa wa WiFi ili kuanza kutumia intaneti.'
    ].join('\n');

    navigator.clipboard.writeText(textList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Top Action Toolbar (Hidden during printing) */}
      <div className="max-w-5xl mx-auto mb-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl print:hidden shadow-2xl space-y-3">
        {/* Row 1: Back Button, Title, and Direct Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Rudi Nyuma</span>
            </button>

            <span className="text-xs text-stone-400 hidden sm:inline">
              Vocha tayari: <strong className="text-white">{filteredVouchers.length}</strong>
            </span>
          </div>

          {/* Core Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopyCodes}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-750'
              }`}
              title="Nakili vocha zote kwenda WhatsApp au Notepad"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Zimenakiliwa!' : 'Nakili Vocha'}</span>
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 bg-stone-800 hover:text-white hover:bg-stone-750 border border-stone-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Pakua jedwali la Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pakua Excel/CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {/* 100% Reliable Download Printable HTML / Save PDF */}
            <button
              onClick={handleDownloadPrintableHtml}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              title="Pakua faili la HTML lililotayarishwa kwa A4 au PDF"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? 'Imepakuliwa!' : 'Pakua Faili la Kuchapisha (HTML/PDF)'}</span>
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-black text-stone-950 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Chapisha Vocha (Print)</span>
            </button>
          </div>
        </div>

        {/* Row 2: Controls & Format Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800 text-xs">
          {/* Format Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-[11px] font-medium">Umbizo la Karatasi:</span>
            <div className="inline-flex bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setLayoutMode('a4')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  layoutMode === 'a4'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Karatasi ya A4 (Gridi)</span>
              </button>
              <button
                onClick={() => setLayoutMode('pos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  layoutMode === 'pos'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Printa ya Risiti / POS</span>
              </button>
            </div>
          </div>

          {/* Quick Price Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-stone-400 text-[11px] font-medium">Chuja Bei:</span>
            {[
              { label: 'Zote', val: 'all' },
              { label: '500', val: 500 },
              { label: '1,000', val: 1000 },
              { label: '5,000', val: 5000 },
              { label: '20,000', val: 20000 },
            ].map((f) => (
              <button
                key={String(f.val)}
                onClick={() => setFilterPrice(f.val as any)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  filterPrice === f.val
                    ? 'bg-stone-700 text-white font-bold'
                    : 'bg-stone-850 text-stone-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Friendly Guidance Banner when in embedded or iframe environment */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200/90">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300">Kidokezo cha Kuchapisha:</strong> Ukibonyeza <em>"Chapisha Vocha"</em> na dirisha la print lisifunguke (kwa sababu browser inazuia print ndani ya dirisha lililofungwa/iframe au simuni), bofya kitufe cha dhahabu cha{' '}
            <strong className="text-white underline cursor-pointer" onClick={handleDownloadPrintableHtml}>
              "Pakua Faili la Kuchapisha (HTML/PDF)"
            </strong>
            . Faili litapakuliwa papo hapo; ukilifungua kwenye Chrome, Edge au simu yako, linafungua dirisha la kuchapisha na unaweza kulihifadhi kama <strong>PDF</strong> au kuliprinti kwa printer yoyote!
          </div>
        </div>
      </div>

      {/* Printable Sheet Container (Styled for clean A4 or POS receipt output) */}
      <div className={`max-w-5xl mx-auto bg-white text-stone-950 p-6 sm:p-8 rounded-2xl shadow-xl print:shadow-none print:p-0 print:rounded-none ${
        layoutMode === 'pos' ? 'max-w-md' : 'max-w-5xl'
      }`}>
        <div className="text-center border-b-2 border-stone-300 pb-4 mb-6 flex flex-col items-center">
          <LemaLogo variant="horizontal" size="md" theme="light" showSlogan={true} className="mb-1.5" />
          <h2 className="text-lg font-black tracking-tight text-stone-900 uppercase">
            VOCHA RASMI ZA WIFI
          </h2>
          <p className="text-xs text-stone-600 mt-0.5 font-medium">
            Unganisha WiFi: <strong>Lema Fast WiFi</strong> | Huduma kwa Wateja: <strong>{settings.supportPhone}</strong>
          </p>
        </div>

        {/* Voucher Cards Grid */}
        <div className={`grid gap-3 ${
          layoutMode === 'pos'
            ? 'grid-cols-1'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-3 print:gap-2'
        }`}>
          {filteredVouchers.map((v) => (
            <div
              key={v.id}
              className="border-2 border-dashed border-stone-400 rounded-xl p-3 flex flex-col justify-between bg-stone-50 print:bg-white text-stone-900 break-inside-avoid shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <LemaLogo variant="icon" size={18} />
                    <span className="text-[10px] font-black tracking-tight text-slate-900 truncate">LEMA FAST WiFi</span>
                  </div>
                  <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono">
                    Tsh {v.price.toLocaleString()}
                  </span>
                </div>

                <div className="py-3 text-center bg-white rounded-lg my-1.5 border border-stone-200/60">
                  <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block">
                    NAMBARI YA VOCHA (PIN)
                  </span>
                  <span className="text-2xl font-black font-mono tracking-widest text-stone-950 block mt-0.5">
                    {v.code}
                  </span>
                  <span className="text-[10px] text-stone-700 font-bold mt-0.5 block">
                    Kifurushi: {v.packageName}
                  </span>
                </div>

                <div className="bg-stone-100 rounded-md p-1.5 text-[8.5px] text-stone-600 leading-tight space-y-0.5 mb-1">
                  <p>1. Washa WiFi: <strong>Lema Fast WiFi</strong></p>
                  <p>2. Fungua browser & weka namba ya vocha</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 text-[9px] text-stone-500 space-y-0.5">
                <div className="flex items-center justify-between font-medium">
                  <span>Muda: <strong>{v.durationHours} Hours</strong></span>
                  <span>Spidi: <strong>{v.speedLimit}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-stone-700 pt-0.5 font-semibold">
                  <Phone className="w-2.5 h-2.5" />
                  <span>Msaada: {settings.supportPhone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12 text-stone-500 text-sm space-y-2">
            <p>Hakuna vocha zilizopatikana kwa chaguo hili.</p>
            <button
              onClick={() => setFilterPrice('all')}
              className="text-amber-600 font-bold underline cursor-pointer"
            >
              Onyesha vocha zote
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
          <span>Kila vocha inatumika kwa kifaa kimoja mara moja tu.</span>
          <span>Powered by Lema Fast WiFi Billing Engine</span>
        </div>
      </div>
    </div>
  );
};
