import React, { useState, useEffect } from 'react';
import { Language, SystemMode } from '../types';
import { SETUP_TIERS } from '../data/wifiGuideData';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Sliders,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface FinancialCalculatorProps {
  lang: Language;
  systemMode: SystemMode;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({ lang, systemMode }) => {
  const [currency, setCurrency] = useState<'tzs' | 'usd'>('tzs');
  const [selectedTierId, setSelectedTierId] = useState<'starter' | 'medium' | 'pro'>('starter');

  // Daily voucher sales volume estimates
  const [hourlyUsers, setHourlyUsers] = useState<number>(20); // 2-hour vouchers @ Tsh 500
  const [dailyUsers, setDailyUsers] = useState<number>(15);  // 24-hr vouchers @ Tsh 1,000
  const [weeklyUsers, setWeeklyUsers] = useState<number>(6);  // Weekly vouchers per month @ Tsh 5,000
  const [monthlyUsers, setMonthlyUsers] = useState<number>(3); // Monthly subscribers @ Tsh 25,000

  // Prices
  const [priceHourly, setPriceHourly] = useState<number>(500);
  const [priceDaily, setPriceDaily] = useState<number>(1000);
  const [priceWeekly, setPriceWeekly] = useState<number>(5000);
  const [priceMonthly, setPriceMonthly] = useState<number>(25000);

  // Operational Expenses
  const [ispMonthlyCost, setIspMonthlyCost] = useState<number>(120000); // 120k Tzs / month internet
  const [electricityRent, setElectricityRent] = useState<number>(25000); // 25k power/site rent
  const [commissionRate, setCommissionRate] = useState<number>(10); // 10% shop sales commission

  // Capital expenditure
  const currentTier = SETUP_TIERS.find((t) => t.id === selectedTierId) || SETUP_TIERS[0];
  const initialCap = systemMode === 'ap-only' ? 460000 : currentTier.estimatedCapitalTzs;
  const [customCapital, setCustomCapital] = useState<number>(initialCap);

  useEffect(() => {
    if (systemMode === 'ap-only' && selectedTierId === 'starter') {
      setCustomCapital(460000);
    } else if (systemMode !== 'ap-only' && selectedTierId === 'starter') {
      setCustomCapital(780000);
    }
  }, [systemMode, selectedTierId]);

  // Update capital when tier changes
  const handleTierChange = (tierId: 'starter' | 'medium' | 'pro') => {
    setSelectedTierId(tierId);
    const tier = SETUP_TIERS.find((t) => t.id === tierId);
    if (tier) {
      setCustomCapital(tier.estimatedCapitalTzs);
      if (tierId === 'starter') {
        setHourlyUsers(20);
        setDailyUsers(15);
        setWeeklyUsers(6);
        setMonthlyUsers(3);
        setIspMonthlyCost(120000);
      } else if (tierId === 'medium') {
        setHourlyUsers(45);
        setDailyUsers(35);
        setWeeklyUsers(15);
        setMonthlyUsers(8);
        setIspMonthlyCost(180000);
      } else {
        setHourlyUsers(110);
        setDailyUsers(80);
        setWeeklyUsers(35);
        setMonthlyUsers(25);
        setIspMonthlyCost(350000);
      }
    }
  };

  // Monthly Revenue Calculation
  // 30 days in a month
  const monthlyHourlyRevenue = hourlyUsers * priceHourly * 30;
  const monthlyDailyRevenue = dailyUsers * priceDaily * 30;
  // Weekly users renew roughly 4 times a month
  const monthlyWeeklyRevenue = weeklyUsers * priceWeekly * 4;
  const monthlyMonthlyRevenue = monthlyUsers * priceMonthly;

  const totalGrossMonthlyRevenue =
    monthlyHourlyRevenue + monthlyDailyRevenue + monthlyWeeklyRevenue + monthlyMonthlyRevenue;

  // Monthly Commission Cost
  const commissionExpense = (totalGrossMonthlyRevenue * commissionRate) / 100;

  // Total Expenses
  const totalMonthlyExpenses = ispMonthlyCost + electricityRent + commissionExpense;

  // Net Profit
  const netMonthlyProfit = Math.max(0, totalGrossMonthlyRevenue - totalMonthlyExpenses);
  const netAnnualProfit = netMonthlyProfit * 12;

  // Payback period (months to break-even)
  const paybackMonths =
    netMonthlyProfit > 0 ? (customCapital / netMonthlyProfit).toFixed(1) : '∞';

  const tzsToUsd = (tzs: number) => Math.round(tzs / 2500);

  const formatMoney = (tzsValue: number) => {
    if (currency === 'usd') {
      return `$${tzsToUsd(tzsValue).toLocaleString()}`;
    }
    return `Tsh ${tzsValue.toLocaleString()}`;
  };

  const [chartMode, setChartMode] = useState<'monthly' | 'cumulative'>('monthly');

  // Generate 12-month forward revenue forecast projection
  const forecastData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    // Real-world adoption curve: starts around 65% in month 1, hits full target by month 4, grows ~3.5% monthly with word-of-mouth
    let growthMultiplier = 1.0;
    if (month === 1) growthMultiplier = 0.65;
    else if (month === 2) growthMultiplier = 0.82;
    else if (month === 3) growthMultiplier = 0.94;
    else if (month === 4) growthMultiplier = 1.0;
    else {
      growthMultiplier = 1.0 + (month - 4) * 0.035;
    }

    const rawRevenue = Math.round(totalGrossMonthlyRevenue * growthMultiplier);
    const variableCommission = (rawRevenue * commissionRate) / 100;
    const rawExpenses = Math.round(ispMonthlyCost + electricityRent + variableCommission);
    const rawProfit = Math.max(0, rawRevenue - rawExpenses);

    return {
      monthNumber: month,
      monthLabel: lang === 'sw' ? `Mwezi ${month}` : `Mo ${month}`,
      revenue: currency === 'usd' ? tzsToUsd(rawRevenue) : rawRevenue,
      expenses: currency === 'usd' ? tzsToUsd(rawExpenses) : rawExpenses,
      profit: currency === 'usd' ? tzsToUsd(rawProfit) : rawProfit,
      rawRevenue,
      rawExpenses,
      rawProfit,
    };
  });

  // Year 1 totals
  const year1Gross = forecastData.reduce((acc, curr) => acc + curr.rawRevenue, 0);
  const year1Expenses = forecastData.reduce((acc, curr) => acc + curr.rawExpenses, 0);
  const year1Net = forecastData.reduce((acc, curr) => acc + curr.rawProfit, 0);

  // Cumulative data for break-even tracking
  let runningTotal = 0;
  const initialCapConverted = currency === 'usd' ? tzsToUsd(customCapital) : customCapital;
  const cumulativeData = forecastData.map((d) => {
    runningTotal += d.profit;
    return {
      ...d,
      cumulativeProfit: runningTotal,
      capitalInvested: initialCapConverted,
    };
  });

  const formatYAxisTick = (val: number) => {
    if (currency === 'usd') {
      return `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${Math.round(val / 1000)}k`;
    }
    return `${val}`;
  };

  return (
    <section id="calculator" className="py-16 md:py-20 bg-stone-50 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            <span>03. Mpango wa Fedha & Faida</span>
            <span aria-hidden="true">·</span>
            <span>Financial Feasibility & ROI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            {lang === 'sw'
              ? 'Kikokotoo cha Gharama za Mtaji & Faida ya Kila Mwezi'
              : 'Interactive Startup Capital & Profit Calculator'}
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            {lang === 'sw'
              ? 'Jaribu namba halisi kulingana na mtaa wako: weka bei za vocha, idadi ya wateja unaotarajia kuwahudumia, na uone faida yako safi ya kila mwezi na muda wa kurudisha mtaji wote.'
              : 'Model realistic neighborhood numbers: adjust voucher price points, expected daily traffic, and discover your estimated monthly net profit and capital payback timeline.'}
          </p>
        </div>

        {/* Currency & Preset Tier Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          {/* Preset Tiers */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SETUP_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierChange(tier.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedTierId === tier.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tier.name[lang]}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg">
            <button
              onClick={() => setCurrency('tzs')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                currency === 'tzs'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              TZS (Tsh)
            </button>
            <button
              onClick={() => setCurrency('usd')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                currency === 'usd'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Main Grid: Inputs vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Daily Sales Volume */}
            <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center justify-between">
                <span>{lang === 'sw' ? 'Mauzo ya Vocha kwa Siku / Mwezi' : 'Voucher Sales Volume'}</span>
                <span className="text-xs font-normal text-stone-500 lowercase">
                  {lang === 'sw' ? 'Wateja walengwa' : 'Target users'}
                </span>
              </h3>

              {/* Hourly Vouchers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {lang === 'sw' ? 'Vocha za Saa 2 (Tsh 500)' : '2-Hour Vouchers'}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {hourlyUsers} {lang === 'sw' ? 'kwa siku' : '/day'} (
                    {formatMoney(monthlyHourlyRevenue)}/{lang === 'sw' ? 'mwezi' : 'mo'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={hourlyUsers}
                  onChange={(e) => setHourlyUsers(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Daily Vouchers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {lang === 'sw' ? 'Vocha za Saa 24 / Siku 1 (Tsh 1,000)' : '24-Hour Vouchers'}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {dailyUsers} {lang === 'sw' ? 'kwa siku' : '/day'} (
                    {formatMoney(monthlyDailyRevenue)}/{lang === 'sw' ? 'mwezi' : 'mo'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={dailyUsers}
                  onChange={(e) => setDailyUsers(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Weekly Vouchers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {lang === 'sw' ? 'Vocha za Wiki 1 (Tsh 5,000)' : 'Weekly Vouchers'}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {weeklyUsers} {lang === 'sw' ? 'kwa mwezi' : '/month'} (
                    {formatMoney(monthlyWeeklyRevenue)}/{lang === 'sw' ? 'mwezi' : 'mo'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={weeklyUsers}
                  onChange={(e) => setWeeklyUsers(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Monthly Subscribers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {lang === 'sw' ? 'Wateja wa Mwezi Mzima (Tsh 25,000)' : 'Monthly Subscribers'}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {monthlyUsers} {lang === 'sw' ? 'kwa mwezi' : '/month'} (
                    {formatMoney(monthlyMonthlyRevenue)}/{lang === 'sw' ? 'mwezi' : 'mo'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={monthlyUsers}
                  onChange={(e) => setMonthlyUsers(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Monthly Operational Costs */}
            <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {lang === 'sw' ? 'Gharama za Uendeshaji (Operational Expenses)' : 'Monthly Operating Overhead'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* ISP Feed Cost */}
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {lang === 'sw' ? 'Malipo ya Intaneti ya Jumla (ISP)' : 'Wholesale Internet Subscription'}
                  </label>
                  <input
                    type="number"
                    value={ispMonthlyCost}
                    onChange={(e) => setIspMonthlyCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                  <span className="text-stone-400 mt-1 block">
                    {lang === 'sw' ? 'Fiber / Starlink ya mwezi' : 'Fiber / Starlink monthly'}
                  </span>
                </div>

                {/* Electricity / Site Space */}
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {lang === 'sw' ? 'Umeme & Pango la Mlingoti' : 'Power & Rooftop Rent'}
                  </label>
                  <input
                    type="number"
                    value={electricityRent}
                    onChange={(e) => setElectricityRent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                  <span className="text-stone-400 mt-1 block">
                    {lang === 'sw' ? 'Makadirio ya TANESCO / mlinzi' : 'Grid / Rooftop token'}
                  </span>
                </div>
              </div>

              {/* Commission */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-700">
                    {lang === 'sw' ? 'Kamisheni ya Maduka ya Vocha' : 'Retail Agent Commission'}
                  </span>
                  <span className="font-mono font-bold text-amber-700">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-stone-400 text-xs mt-1 block">
                  {lang === 'sw'
                    ? `Maduka hupata ${formatMoney(commissionExpense)} kwa mwezi kwa kuuza vocha zako.`
                    : `Agent shops earn ${formatMoney(commissionExpense)} / month in sales commissions.`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Financial Output & Break-Even Card */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <TrendingUp className="w-24 h-24" />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Matokeo ya Kifedha kwa Mwezi' : 'Net Financial Projections'}</span>
              </div>

              {/* Gross Revenue */}
              <div className="border-b border-stone-800 pb-3 mb-3">
                <p className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Jumla ya Mauzo ya Vocha (Gross Revenue)' : 'Gross Monthly Voucher Revenue'}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
                  {formatMoney(totalGrossMonthlyRevenue)}
                </p>
              </div>

              {/* Monthly Expenses */}
              <div className="border-b border-stone-800 pb-3 mb-3">
                <p className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Gharama Zote za Uendeshaji (Expenses)' : 'Total Monthly Operating Costs'}
                </p>
                <p className="text-lg font-semibold font-mono tabular-nums text-rose-400 mt-0.5">
                  - {formatMoney(totalMonthlyExpenses)}
                </p>
              </div>

              {/* Net Monthly Profit */}
              <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700 mb-4">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {lang === 'sw' ? 'Faida Safi ya Kila Mwezi (Net Profit)' : 'Net Monthly Profit'}
                </p>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400 mt-1">
                  {formatMoney(netMonthlyProfit)}
                </p>
                <p className="text-xs text-stone-300 mt-1 font-mono">
                  {lang === 'sw'
                    ? `Faida ya Mwaka: ~ ${formatMoney(netAnnualProfit)}`
                    : `Annual Net Run-Rate: ~ ${formatMoney(netAnnualProfit)}`}
                </p>
              </div>

              {/* Break-Even / Payback Period */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300">
                    {lang === 'sw' ? 'Muda wa Kurudisha Mtaji (Break-Even):' : 'Estimated Capital Payback:'}
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {paybackMonths} {lang === 'sw' ? 'Miezi' : 'Months'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {lang === 'sw'
                    ? `Kulingana na mtaji wa ${formatMoney(customCapital)}. Baada ya miezi hii, pesa zote ni faida tupu!`
                    : `Based on initial capital of ${formatMoney(customCapital)}. Everything after is pure free cash flow!`}
                </p>
              </div>
            </div>

            {/* Quick takeaway note */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 space-y-1">
              <p className="font-bold text-stone-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{lang === 'sw' ? 'Ukweli Kuhusu Biashara Hii:' : 'Realistic Field Reality:'}</span>
              </p>
              <p>
                {lang === 'sw'
                  ? 'Tofauti na biashara ya bidhaa zinazooza, intaneti haina hasara ya bidhaa kuharibika. Wateja wakinunua vocha nyingi, gharama yako ya intaneti (ISP) inabaki ile ile ya bei maalum ya mwezi!'
                  : 'Unlike perishable goods retail, internet bandwidth has fixed monthly wholesale costs. As your user base doubles or triples, your underlying carrier cost stays identical, expanding margins dramatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Revenue Forecast Graph Section (Recharts) */}
        <div className="mt-10 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'sw' ? 'Makadirio ya Kifedha ya Miezi 12' : '12-Month Financial Trajectory'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                {lang === 'sw'
                  ? 'Grafu ya Makadirio ya Mapato vs Gharama za Uendeshaji'
                  : 'Revenue Forecast vs. Operating Expenses Graph'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'sw'
                  ? 'Mwenendo wa mapato ya kila mwezi, gharama za jumla za ISP na umeme, na faida halisi inayobaki'
                  : 'Estimated monthly cash inflows, fixed overheads, and pure take-home margin'}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
              <button
                type="button"
                onClick={() => setChartMode('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'monthly'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'sw' ? 'Mwezi kwa Mwezi (Monthly)' : 'Monthly Inflow/Cost'}
              </button>
              <button
                type="button"
                onClick={() => setChartMode('cumulative')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'cumulative'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'sw' ? 'Kurudisha Mtaji (Break-Even)' : 'Break-Even Curve'}
              </button>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="w-full h-72 sm:h-80 select-none">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'monthly' ? (
                <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#78716c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e7e5e4' }}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    stroke="#78716c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e7e5e4' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-mono text-stone-200 min-w-44">
                            <p className="font-bold text-white text-xs border-b border-stone-800 pb-1 font-sans">
                              {label}
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div key={`tip-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="flex items-center gap-1.5 text-stone-300">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.name}:</span>
                                </span>
                                <span className="font-bold text-white">
                                  {currency === 'usd'
                                    ? `$${entry.value?.toLocaleString()}`
                                    : `Tsh ${entry.value?.toLocaleString()}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={lang === 'sw' ? 'Mapato ya Vocha' : 'Gross Revenue'}
                    fill="url(#revenueGrad)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                  />
                  <Bar
                    dataKey="expenses"
                    name={lang === 'sw' ? 'Gharama za Uendeshaji' : 'Operating Costs'}
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name={lang === 'sw' ? 'Faida Safi' : 'Net Margin'}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#ffffff' }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart data={cumulativeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#78716c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e7e5e4' }}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    stroke="#78716c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e7e5e4' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-mono text-stone-200 min-w-44">
                            <p className="font-bold text-white text-xs border-b border-stone-800 pb-1 font-sans">
                              {label}
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div key={`tip2-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="flex items-center gap-1.5 text-stone-300">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.name}:</span>
                                </span>
                                <span className="font-bold text-white">
                                  {currency === 'usd'
                                    ? `$${entry.value?.toLocaleString()}`
                                    : `Tsh ${entry.value?.toLocaleString()}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeProfit"
                    name={lang === 'sw' ? 'Jumla ya Faida Iliyopatikana' : 'Cumulative Profit'}
                    fill="url(#cumulGrad)"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="step"
                    dataKey="capitalInvested"
                    name={lang === 'sw' ? 'Kiwango cha Mtaji Uliowekezwa' : 'Initial Capital Baseline'}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* 3 Summary Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">
                {lang === 'sw' ? 'Makadirio ya Mapato ya Mwaka 1:' : 'Year 1 Projected Gross:'}
              </span>
              <span className="font-bold font-mono text-stone-900 text-sm mt-0.5 block">
                {formatMoney(year1Gross)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">
                {lang === 'sw' ? 'Gharama Zote za Mwaka 1 (ISP/Umeme):' : 'Year 1 Operating Overhead:'}
              </span>
              <span className="font-bold font-mono text-rose-600 text-sm mt-0.5 block">
                {formatMoney(year1Expenses)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="text-emerald-700 block text-[11px] font-semibold">
                {lang === 'sw' ? 'Faida Safi ya Mwaka 1 (Net Free Cash):' : 'Year 1 Cumulative Net Profit:'}
              </span>
              <span className="font-extrabold font-mono text-emerald-700 text-sm mt-0.5 block">
                {formatMoney(year1Net)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
