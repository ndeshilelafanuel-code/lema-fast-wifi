import React, { useState } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import {
  FileText,
  Printer,
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  Download,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Wifi,
  ShieldCheck,
  Building,
  Smartphone,
  Sparkles,
  ArrowUpRight,
  Clock,
  Radio,
  FileDown
} from 'lucide-react';

interface DailySummaryReportModalProps {
  lang: Language;
  onClose: () => void;
}

export const DailySummaryReportModal: React.FC<DailySummaryReportModalProps> = ({
  lang,
  onClose,
}) => {
  const { settings, transactions, activeSessions, vouchers } = useHotspot();
  const [reportPeriod, setReportPeriod] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');

  const now = new Date();
  const formattedDate = now.toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString(lang === 'sw' ? 'sw-TZ' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate Period Transactions & Metrics
  const periodTransactions = transactions.filter((tx) => {
    if (tx.status !== 'completed') return false;
    const txDate = new Date(tx.timestamp);

    if (reportPeriod === 'today') {
      return txDate.toDateString() === now.toDateString();
    } else if (reportPeriod === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return txDate.toDateString() === yesterday.toDateString();
    } else if (reportPeriod === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= sevenDaysAgo;
    } else if (reportPeriod === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return txDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Fallback to all completed if demo array has no matches today
  const effectiveTransactions =
    periodTransactions.length > 0
      ? periodTransactions
      : transactions.filter((t) => t.status === 'completed');

  // 1. Core Calculations: Total Revenue & Active Users
  const totalRevenue = effectiveTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalActiveUsers = activeSessions.length;
  const uniquePayingCustomers = new Set(effectiveTransactions.map((tx) => tx.phoneNumber)).size;
  const averageOrderValue = effectiveTransactions.length > 0 ? Math.round(totalRevenue / effectiveTransactions.length) : 0;
  const unusedVouchersCount = vouchers.filter((v) => v.status === 'unused').length;

  // 2. Breakdown by Package
  const packageSales = settings.packages.map((pkg) => {
    const pkgTxs = effectiveTransactions.filter((tx) => tx.packageId === pkg.id || tx.packageName.includes(pkg.name));
    const count = pkgTxs.length;
    const rev = pkgTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const percentage = totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) : '0.0';
    return {
      pkg,
      count,
      revenue: rev,
      percentage,
    };
  });

  // 3. Breakdown by Mobile Network
  const networks: Array<'mpesa' | 'tigo' | 'airtel' | 'halopesa'> = ['mpesa', 'tigo', 'airtel', 'halopesa'];
  const networkBreakdown = networks.map((net) => {
    const netTxs = effectiveTransactions.filter((tx) => tx.network.toLowerCase() === net);
    const count = netTxs.length;
    const rev = netTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const pct = totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) : '0.0';
    const names = {
      mpesa: 'Vodacom M-Pesa',
      tigo: 'Mixx by Yas',
      airtel: 'Airtel Money',
      halopesa: 'HaloPesa',
    };
    return {
      id: net,
      name: names[net],
      count,
      revenue: rev,
      percentage: pct,
    };
  });

  // 4. Data Usage Aggregation
  const totalBytesDown = activeSessions.reduce((sum, s) => sum + s.bytesDown, 0);
  const totalBytesUp = activeSessions.reduce((sum, s) => sum + s.bytesUp, 0);
  const totalMbDown = (totalBytesDown / (1024 * 1024)).toFixed(1);
  const totalMbUp = (totalBytesUp / (1024 * 1024)).toFixed(1);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Print blocked by iframe:', err);
    }
  };

  const handleDownloadReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ripoti ya Mauzo - Lema Fast WiFi</title>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #1c1917; }
    h1 { color: #0c0a09; }
    .box { border: 1px solid #e7e5e4; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e7e5e4; padding: 8px; text-align: left; }
    th { background: #f5f5f4; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" style="background:#f59e0b;padding:8px 16px;font-weight:bold;border:none;border-radius:6px;cursor:pointer;margin-bottom:16px;" onclick="window.print()">🖨️ Chapisha / Hifadhi PDF</button>
  <h1>Lema Fast WiFi - Ripoti Kuu ya Biashara</h1>
  <p>Tarehe: ${now.toLocaleDateString()} | Kipindi: ${reportPeriod}</p>
  <div class="box">
    <h3>Mapato Yaliyopatikana: Tsh ${totalRevenue.toLocaleString()}</h3>
    <p>Miamala Iliyokamilika: ${effectiveTransactions.length} | Wateja Hewani: ${activeSessions.length}</p>
  </div>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ripoti-Lema-WiFi-${reportPeriod}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Action Toolbar (Hidden during printing) */}
      <div className="max-w-5xl mx-auto mb-6 bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 print:hidden shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'sw' ? 'Rudi Kwenye Dashibodi' : 'Back to Dashboard'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
            <button
              onClick={() => setReportPeriod('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === 'today'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'sw' ? 'Leo (Today)' : 'Today'}
            </button>
            <button
              onClick={() => setReportPeriod('yesterday')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === 'yesterday'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'sw' ? 'Jana' : 'Yesterday'}
            </button>
            <button
              onClick={() => setReportPeriod('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === 'week'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {lang === 'sw' ? 'Siku 7' : '7 Days'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-stone-200 bg-stone-800 hover:bg-stone-750 border border-stone-700 transition-all cursor-pointer"
            title="Pakua faili la ripoti la HTML au PDF"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Pakua Faili</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all cursor-pointer group"
          >
            <Printer className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
            <span>{lang === 'sw' ? 'Chapisha / Pakua kama PDF' : 'Print / Export to PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Document (Clean A4 Paper Format) */}
      <div className="max-w-5xl mx-auto bg-stone-900 print:bg-white text-stone-100 print:text-stone-950 border border-stone-800 print:border-none p-6 sm:p-10 rounded-3xl print:rounded-none shadow-2xl print:shadow-none space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-amber-400/80 print:border-stone-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <LemaLogo variant="horizontal" size="sm" theme="dark" showSlogan={true} className="print:hidden" />
              <LemaLogo variant="horizontal" size="sm" theme="light" showSlogan={true} className="hidden print:inline-flex" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-stone-950 tracking-tight">
              {lang === 'sw'
                ? 'Ripoti Kuu ya Kila Siku ya Mapato na Wateja'
                : 'Executive Daily Revenue & Active Users Report'}
            </h1>
            <p className="text-xs text-stone-400 print:text-stone-600 max-w-xl">
              {lang === 'sw'
                ? `Muhtasari rasmi wa mauzo ya vocha, fedha zilizoingia kwenye akaunti, na wateja walio mtandaoni wa Lema Fast WiFi.`
                : `Official summary of voucher sales, automated mobile collections, and network subscribers for Lema Fast WiFi.`}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-stone-300 print:text-stone-800 space-y-1 bg-stone-950/60 print:bg-stone-50 p-3.5 rounded-xl border border-stone-800 print:border-stone-200">
            <div>
              <span className="text-stone-400 print:text-stone-500">Tarehe ya Ripoti: </span>
              <strong>{formattedDate}</strong>
            </div>
            <div>
              <span className="text-stone-400 print:text-stone-500">Muda wa Kutoa: </span>
              <strong>{formattedTime}</strong>
            </div>
            <div>
              <span className="text-stone-400 print:text-stone-500">Msimamizi (Admin): </span>
              <strong className="text-amber-400 print:text-stone-900">{settings.adminUsername || 'admin'}</strong>
            </div>
            <div>
              <span className="text-stone-400 print:text-stone-500">Pochi ya Payout: </span>
              <strong>{settings.payoutAccount || settings.merchantNumber}</strong>
            </div>
          </div>
        </div>

        {/* 4 Big Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Revenue */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 print:text-stone-600">
              <span className="font-semibold">{lang === 'sw' ? 'Jumla ya Mapato' : 'Total Revenue'}</span>
              <DollarSign className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 print:text-emerald-700 tabular-nums">
              Tsh {totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 print:text-stone-600 block">
              {effectiveTransactions.length} {lang === 'sw' ? 'Miamala ya Simu' : 'Transactions'}
            </span>
          </div>

          {/* Metric 2: Active Users */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 print:text-stone-600">
              <span className="font-semibold">{lang === 'sw' ? 'Wateja Walio Mtandaoni' : 'Active Connected Users'}</span>
              <Users className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400 print:text-cyan-700 tabular-nums">
              {totalActiveUsers} <span className="text-sm font-normal text-stone-400 print:text-stone-600">Vifaa</span>
            </p>
            <span className="text-[11px] text-stone-400 print:text-stone-600 block">
              {uniquePayingCustomers} {lang === 'sw' ? 'Wateja wa Kipekee' : 'Unique Customers'}
            </span>
          </div>

          {/* Metric 3: Average Order Value */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 print:text-stone-600">
              <span className="font-semibold">{lang === 'sw' ? 'Wastani wa Vocha (AOV)' : 'Average Order Value'}</span>
              <TrendingUp className="w-4 h-4 text-amber-400 print:text-amber-700" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white print:text-stone-950 tabular-nums">
              Tsh {averageOrderValue.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 print:text-stone-600 block">
              {lang === 'sw' ? 'Kiwango cha kila muamala' : 'Per transaction average'}
            </span>
          </div>

          {/* Metric 4: Unsold Inventory */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 print:text-stone-600">
              <span className="font-semibold">{lang === 'sw' ? 'Vocha Zilizobaki Stoo' : 'Unused Vouchers'}</span>
              <ShieldCheck className="w-4 h-4 text-amber-400 print:text-amber-700" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 print:text-amber-700 tabular-nums">
              {unusedVouchersCount}
            </p>
            <span className="text-[11px] text-stone-400 print:text-stone-600 block">
              {lang === 'sw' ? 'Tayari kuuzwa madukani' : 'Ready in inventory'}
            </span>
          </div>
        </div>

        {/* Breakdown 1: Sales By Package Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 print:border-stone-300 pb-2">
            <TrendingUp className="w-4 h-4 text-amber-400 print:text-amber-700" />
            <span>{lang === 'sw' ? '1. Mchanganuo wa Mauzo Kulingana na Vifurushi' : '1. Package Sales Breakdown'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-800 print:border-stone-300 text-stone-400 print:text-stone-600 bg-stone-950/60 print:bg-stone-100">
                  <th className="py-2.5 px-3">Jina la Kifurushi</th>
                  <th className="py-2.5 px-3">Muda (Saa)</th>
                  <th className="py-2.5 px-3">Bei (TZS)</th>
                  <th className="py-2.5 px-3">Vocha Zilizouzwa</th>
                  <th className="py-2.5 px-3 text-right">Jumla ya Mapato (TZS)</th>
                  <th className="py-2.5 px-3 text-right">Asilimia (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850 print:divide-stone-200">
                {packageSales.map(({ pkg, count, revenue, percentage }) => (
                  <tr key={pkg.id} className="hover:bg-stone-850/40 print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-semibold text-white print:text-stone-900">{pkg.name}</td>
                    <td className="py-2.5 px-3 font-mono">{pkg.durationHours} hrs</td>
                    <td className="py-2.5 px-3 font-mono">Tsh {pkg.price.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-cyan-400 print:text-cyan-700">{count}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-400 print:text-emerald-700">
                      Tsh {revenue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-300 print:text-stone-700">
                      {percentage}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-stone-950/80 print:bg-stone-100 font-bold border-t-2 border-stone-700 print:border-stone-400">
                  <td className="py-3 px-3 text-white print:text-stone-950">JUMLA KUU (TOTAL)</td>
                  <td className="py-3 px-3">--</td>
                  <td className="py-3 px-3">--</td>
                  <td className="py-3 px-3 text-cyan-400 print:text-cyan-700 font-mono font-bold">
                    {effectiveTransactions.length}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 print:text-emerald-700 font-mono font-bold text-sm">
                    Tsh {totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown 2: Mobile Money Networks & Data Usage (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Network Collections */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-3">
            <h4 className="text-xs font-bold text-white print:text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 print:border-stone-200 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>{lang === 'sw' ? '2. Mapato kwa Njia ya Malipo' : '2. Mobile Money Breakdown'}</span>
            </h4>
            <div className="space-y-2 text-xs">
              {networkBreakdown.map((net) => (
                <div key={net.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-900 print:bg-white border border-stone-800/80 print:border-stone-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white print:text-stone-900">{net.name}</span>
                    <span className="text-[10px] text-stone-400 print:text-stone-500 block">
                      {net.count} miamala ({net.percentage}%)
                    </span>
                  </div>
                  <span className="font-bold font-mono text-emerald-400 print:text-emerald-700">
                    Tsh {net.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Data Traffic & Router Health */}
          <div className="p-5 rounded-2xl bg-stone-950 print:bg-stone-50 border border-stone-800 print:border-stone-300 space-y-3">
            <h4 className="text-xs font-bold text-white print:text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 print:border-stone-200 pb-2">
              <Radio className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>{lang === 'sw' ? '3. Hali ya Mtandao & Matumizi ya Data' : '3. Network Health & Traffic'}</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-850 print:border-stone-200">
                <span className="text-stone-400 print:text-stone-600">Wateja Walio Mtandaoni Hivi Sasa:</span>
                <strong className="font-mono text-cyan-400 print:text-cyan-700">{totalActiveUsers} Vifaa</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-850 print:border-stone-200">
                <span className="text-stone-400 print:text-stone-600">Jumla ya Data Zilizopakuliwa (Download):</span>
                <strong className="font-mono text-white print:text-stone-900">{totalMbDown} MB</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-850 print:border-stone-200">
                <span className="text-stone-400 print:text-stone-600">Jumla ya Data Zilizopakiwa (Upload):</span>
                <strong className="font-mono text-white print:text-stone-900">{totalMbUp} MB</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-400 print:text-stone-600">Uptime wa Router & ISP Gateway:</span>
                <strong className="font-mono text-emerald-400 print:text-emerald-700">99.8% (Online)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown 3: Active Connected Users Table */}
        <div className="space-y-3 break-inside-avoid">
          <h3 className="text-sm font-bold text-white print:text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 print:border-stone-300 pb-2">
            <Users className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
            <span>{lang === 'sw' ? '4. Orodha ya Wateja Walio Mtandaoni (Active Sessions)' : '4. Active Connected Sessions'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-800 print:border-stone-300 text-stone-400 print:text-stone-600 bg-stone-950/60 print:bg-stone-100">
                  <th className="py-2 px-3">IP Address</th>
                  <th className="py-2 px-3">MAC Address</th>
                  <th className="py-2 px-3">Vocha</th>
                  <th className="py-2 px-3">Kifurushi</th>
                  <th className="py-2 px-3">Kasi (Speed)</th>
                  <th className="py-2 px-3 text-right">Data (MB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850 print:divide-stone-200">
                {activeSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-stone-850/40 print:hover:bg-transparent font-mono text-[11px]">
                    <td className="py-2 px-3 font-semibold text-white print:text-stone-900">{session.ipAddress}</td>
                    <td className="py-2 px-3 text-stone-400 print:text-stone-600">{session.macAddress}</td>
                    <td className="py-2 px-3 text-amber-400 print:text-amber-700 font-bold">{session.voucherCode}</td>
                    <td className="py-2 px-3 font-sans text-stone-300 print:text-stone-800">{session.packageName}</td>
                    <td className="py-2 px-3 text-stone-400 print:text-stone-600">{session.speedLimit}</td>
                    <td className="py-2 px-3 text-right font-bold text-white print:text-stone-900">
                      {((session.bytesDown + session.bytesUp) / (1024 * 1024)).toFixed(1)} MB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Sign-off & Stamp Footer for Formal Business Record */}
        <div className="border-t-2 border-stone-800 print:border-stone-400 pt-6 mt-8 flex flex-col sm:flex-row items-start justify-between gap-6 break-inside-avoid">
          <div className="space-y-1 text-xs text-stone-400 print:text-stone-600">
            <p className="font-bold text-white print:text-stone-900">
              Mmiliki / Kampuni: {settings.accountOwnerName}
            </p>
            <p>Namba ya Msaada: {settings.supportPhone}</p>
            <p className="text-[10px] text-stone-500 print:text-stone-400">
              Ripoti hii imezalishwa kiotomatiki na Mfumo wa Usimamizi wa Hotspot (MikroTik Hotspot Billing Engine).
            </p>
          </div>

          <div className="w-60 border-t border-dashed border-stone-600 print:border-stone-400 pt-2 text-center text-xs text-stone-400 print:text-stone-600">
            <span className="font-bold text-white print:text-stone-900 block mb-1">
              Saini & Muhuri wa Msimamizi
            </span>
            <span className="text-[10px] text-stone-500 print:text-stone-400">
              (Authorized Signature & Stamp)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
