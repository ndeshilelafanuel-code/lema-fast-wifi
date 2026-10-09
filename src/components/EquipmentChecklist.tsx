import React, { useState, useEffect } from 'react';
import { Language, EquipmentItem, SystemMode } from '../types';
import { EQUIPMENT_ITEMS } from '../data/wifiGuideData';
import { Check, Info, AlertTriangle, Layers, DollarSign, RotateCcw, Radio } from 'lucide-react';

interface EquipmentChecklistProps {
  lang: Language;
  systemMode: SystemMode;
}

export const EquipmentChecklist: React.FC<EquipmentChecklistProps> = ({ lang, systemMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Initialize with appropriate items checked based on mode
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    EQUIPMENT_ITEMS.forEach((item) => {
      if (systemMode === 'ap-only' && item.id === 'core-router') {
        initial[item.id] = false;
      } else {
        initial[item.id] = true;
      }
    });
    return initial;
  });

  // Keep in sync if user toggles systemMode from header
  useEffect(() => {
    setCheckedItems((prev) => ({
      ...prev,
      'core-router': systemMode !== 'ap-only',
    }));
  }, [systemMode]);

  const categories = [
    { id: 'all', label: { sw: 'Vifaa Vyote', en: 'All Equipment' } },
    { id: 'core', label: { sw: 'Router & Mifumo', en: 'Core & Software' } },
    { id: 'wireless', label: { sw: 'Mawimbi ya Nje (AP)', en: 'Wireless APs' } },
    { id: 'power', label: { sw: 'Umeme & Sola', en: 'Power & Solar' } },
    { id: 'cabling', label: { sw: 'Waya & PoE', en: 'Cables & PoE' } },
    { id: 'structure', label: { sw: 'Mlingoti & Box', en: 'Mast & Enclosure' } },
  ];

  const filteredItems = EQUIPMENT_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    EQUIPMENT_ITEMS.forEach((item) => {
      next[item.id] = true;
    });
    setCheckedItems(next);
  };

  const clearAll = () => {
    const next: Record<string, boolean> = {};
    EQUIPMENT_ITEMS.forEach((item) => {
      next[item.id] = false;
    });
    setCheckedItems(next);
  };

  // Calculate totals
  const totalMinTzs = EQUIPMENT_ITEMS.reduce((sum, item) => {
    return checkedItems[item.id] ? sum + item.estimatedCostTzs.min : sum;
  }, 0);

  const totalMaxTzs = EQUIPMENT_ITEMS.reduce((sum, item) => {
    return checkedItems[item.id] ? sum + item.estimatedCostTzs.max : sum;
  }, 0);

  const totalMinUsd = EQUIPMENT_ITEMS.reduce((sum, item) => {
    return checkedItems[item.id] ? sum + item.estimatedCostUsd.min : sum;
  }, 0);

  const totalMaxUsd = EQUIPMENT_ITEMS.reduce((sum, item) => {
    return checkedItems[item.id] ? sum + item.estimatedCostUsd.max : sum;
  }, 0);

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section id="checklist" className="py-16 md:py-20 bg-stone-100 text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            <span>01. Orodha ya Vifaa</span>
            <span aria-hidden="true">·</span>
            <span>Hardware Procurement Checklist</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            {lang === 'sw'
              ? 'Vifaa Muhimu Vinavyohitajika Kuanzia'
              : 'Complete Hardware & Equipment Breakdown'}
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            {lang === 'sw'
              ? 'Chagua vifaa unavyopanga kununua au ambavyo tayari unavyo ili kuona makadirio kamili ya bajeti yako ya kuanzia. Kila kifaa kina spishi inayopendekezwa sokoni.'
              : 'Select the components you plan to buy or already own to calculate your customized initial hardware budget. Every item includes field-tested models and local price brackets.'}
          </p>
        </div>

        {/* Visual Showcase Card + Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Real studio hardware photograph */}
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-sm relative group">
            <img
              src="/src/assets/images/hardware_network_gear_1791031774960.jpg"
              alt="MikroTik RouterBOARD and outdoor access point hardware equipment"
              referrerPolicy="no-referrer"
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-5">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  {lang === 'sw' ? 'Vifaa Halisi vya Kazi' : 'Field-Ready Gear'}
                </span>
                <p className="text-sm text-stone-200 mt-1">
                  MikroTik hEX RB750Gr3 + TP-Link EAP225-Outdoor + Outdoor Cat6 FTP
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Budget Calculator Box */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {lang === 'sw' ? 'Makadirio ya Bajeti ya Vifaa Uliyochagua' : 'Selected Equipment Budget Summary'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lang === 'sw'
                      ? `Vifaa ${checkedCount} kati ya ${EQUIPMENT_ITEMS.length} vimechaguliwa`
                      : `${checkedCount} of ${EQUIPMENT_ITEMS.length} hardware items selected`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2 py-1 rounded bg-stone-100 transition-colors"
                  >
                    {lang === 'sw' ? 'Weka Vyote' : 'Select All'}
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs font-medium text-stone-500 hover:text-stone-700 px-2 py-1 rounded bg-stone-100 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'sw' ? 'Futa' : 'Clear'}</span>
                  </button>
                </div>
              </div>

              {/* Price Figures in Tabular Numerals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    {lang === 'sw' ? 'Gharama kwa Shilingi ya Kitanzania' : 'Estimated Cost (TZS)'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-stone-900 font-mono tabular-nums mt-1">
                    Tsh {totalMinTzs.toLocaleString()} – {totalMaxTzs.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === 'sw' ? 'Kulingana na maduka ya Kariakoo / mkoani' : 'Estimated local market vendor range'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    {lang === 'sw' ? 'Makadirio kwa Dola (USD)' : 'Estimated Cost (USD)'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
                    ${totalMinUsd.toLocaleString()} – ${totalMaxUsd.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === 'sw' ? 'Makadirio ya ununuzi wa kimataifa' : 'Global distributor pricing baseline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Note on avoiding low-cost pitfalls */}
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                {lang === 'sw'
                  ? 'Ushauri wa Kitaalamu: Kamwe usikate gharama kwa kutumia waya wa ndani (Indoor Cat5) nje, au router ya kawaida ya Tenda/TP-Link ya nyumbani. Router ya MikroTik na Access Point ya nje ndio msingi wa kudumu miaka mingi bila milango ya matatizo.'
                  : 'Pro Tip: Never cheap out on indoor patch cables or consumer home access points. A rugged MikroTik routerboard and weatherproof outdoor AP are the difference between seamless profit and daily technical headaches.'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar: Segmented interactive tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>

        {/* Equipment Items List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-xl p-5 border transition-all ${
                  isChecked
                    ? 'bg-white border-stone-300 shadow-sm'
                    : 'bg-stone-50/70 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-1 cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500 border-amber-600 text-white'
                          : 'bg-white border-stone-300 hover:border-stone-400'
                      }`}
                      aria-label={`Toggle ${item.name[lang]}`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900">
                          {item.name[lang]}
                        </h3>
                        {item.isEssential ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {lang === 'sw' ? 'Lazima' : 'Mandatory'}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {lang === 'sw' ? 'Inapendekezwa' : 'Recommended'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
                        {item.description[lang]}
                      </p>

                      {/* Recommended Models */}
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                          {lang === 'sw' ? 'Mifano Inayofaa (Recommended Gear):' : 'Recommended Models:'}
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-stone-600">
                          {item.recommendedModels.map((model, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{model}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Why it is needed */}
                      <div className="pt-2 text-xs text-stone-500 italic flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>{lang === 'sw' ? 'Kwanini ni muhimu: ' : 'Why needed: '}</strong>
                          {item.whyNeeded[lang]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Estimated Cost Card */}
                  <div className="md:text-right shrink-0 pl-9 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                      {lang === 'sw' ? 'Bei ya Sokoni' : 'Market Price'}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-stone-900 font-mono tabular-nums mt-0.5">
                      Tsh {item.estimatedCostTzs.min.toLocaleString()} – {item.estimatedCostTzs.max.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-stone-500 font-mono tabular-nums">
                      ${item.estimatedCostUsd.min} – ${item.estimatedCostUsd.max} USD
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
