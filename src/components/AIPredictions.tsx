import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Calendar, 
  Droplets, 
  Sun, 
  ArrowUpRight, 
  ShieldCheck, 
  Info,
  Layers,
  ChevronRight,
  Lightbulb,
  Building2,
  Users,
  CheckCircle2,
  DollarSign,
  PieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine,
  Cell,
  ComposedChart
} from 'recharts';
import { PricePredictionData, DemandPredictionData } from '../types';
import { MOCK_PRICE_PREDICTIONS, MOCK_DEMAND_PREDICTIONS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export const AIPredictions: React.FC = () => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'price' | 'middleman' | 'hostel' | 'regional'>('price');
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  
  // Interactive scenario simulation slider
  const [monsoonShift, setMonsoonShift] = useState<number>(0); // -20% to +20%
  const [festiveSurge, setFestiveSurge] = useState<number>(15); // %

  const activePrediction = MOCK_PRICE_PREDICTIONS[selectedCropIndex];
  const activeDemand = MOCK_DEMAND_PREDICTIONS[selectedCropIndex % MOCK_DEMAND_PREDICTIONS.length];

  // Dynamic price adjustment based on simulation
  const simulationFactor = (1 + (monsoonShift < 0 ? -monsoonShift * 0.003 : -monsoonShift * 0.001) + festiveSurge * 0.002);
  const simulatedProjected30d = Math.round(activePrediction.projectedPrice30d * simulationFactor);
  const simulatedProjected60d = Math.round(activePrediction.projectedPrice60d * simulationFactor);

  // Dynamic chart data reacting to sliders
  const dynamicTrendPoints = activePrediction.trendPoints.map(pt => {
    if (pt.predicted) {
      const adjusted = Math.round(pt.predicted * (1 + (monsoonShift < 0 ? -monsoonShift * 0.002 : -monsoonShift * 0.0008) + festiveSurge * 0.0015));
      return {
        ...pt,
        displayHistorical: pt.historical || null,
        displayPredicted: adjusted,
        lowerConfidence: Math.round(adjusted * 0.96),
        upperConfidence: Math.round(adjusted * 1.04),
      };
    }
    return {
      ...pt,
      displayHistorical: pt.historical || null,
      displayPredicted: null,
      lowerConfidence: null,
      upperConfidence: null,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-['Plus_Jakarta_Sans']">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{t('aiPred.badge', 'SIH 2026 AI Mandi Intelligence')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D2E22] font-['Outfit']">
            {t('aiPred.title', 'AI Mandi Price & Demand Forecasting')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
            {t('aiPred.desc', 'Grounded in 10 years of Agmarknet APMC arrivals, IMD rainfall indices, and college hostel & mess bulk procurement cycles.')}
          </p>
        </div>

        {/* Relatable Sub-tab Switchers */}
        <div className="flex items-center flex-wrap bg-neutral-100/90 border border-neutral-200 rounded-2xl p-1 shadow-inner gap-1">
          <button
            id="tab-price-forecast"
            onClick={() => setActiveSubTab('price')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'price' ? 'bg-[#0E3D2C] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('aiPred.tabPrice', 'Mandi Price Curve')}</span>
          </button>

          <button
            id="tab-middleman-forecast"
            onClick={() => setActiveSubTab('middleman')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'middleman' ? 'bg-[#0E3D2C] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{t('aiPred.tabMiddleman', 'Direct vs Middleman Profit')}</span>
          </button>

          <button
            id="tab-hostel-forecast"
            onClick={() => setActiveSubTab('hostel')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'hostel' ? 'bg-[#0E3D2C] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('aiPred.tabHostel', 'Hostel Mess Demand Cycle')}</span>
          </button>

          <button
            id="tab-demand-forecast"
            onClick={() => setActiveSubTab('regional')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'regional' ? 'bg-[#0E3D2C] text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('aiPred.tabRegional', 'Regional Hotspots')}</span>
          </button>
        </div>
      </div>

      {/* Crop Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {MOCK_PRICE_PREDICTIONS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCropIndex(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition shrink-0 flex items-center gap-2 cursor-pointer ${
              selectedCropIndex === idx
                ? 'bg-[#0E3D2C] text-white shadow-md border border-[#225742]'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>{p.cropName}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
              p.changePercentage >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
            }`}>
              {p.changePercentage >= 0 ? `+${p.changePercentage}%` : `${p.changePercentage}%`}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: RELATABLE MANDI PRICE & MSP TRAJECTORY */}
      {activeSubTab === 'price' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Chart & Forecast Overview (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {activePrediction.category} Commodity Neural Model
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0D2E22] font-['Outfit']">
                    {activePrediction.cropName} Price Trajectory
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Benchmark APMC Yard • Grounded in CACP Support Price & NABL Quality Assays
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{activePrediction.mspDifference}</span>
                </div>
              </div>

              {/* Price comparison numbers */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-2xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 font-medium block">{t('predictions.currentSpotMandi', 'Current Spot Mandi')}</span>
                  <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono mt-1">
                    ₹{activePrediction.currentMandiPrice}
                  </div>
                  <span className="text-[10px] text-neutral-400">{t('predictions.perQuintal', 'per Quintal')}</span>
                </div>

                <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-medium block">{t('predictions.ai30DayForecast', 'AI 30-Day Forecast')}</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
                    ₹{simulatedProjected30d}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    +{Math.round(((simulatedProjected30d - activePrediction.currentMandiPrice) / activePrediction.currentMandiPrice) * 100)}% {t('predictions.surge', 'Surge')}
                  </span>
                </div>

                <div className="bg-[#124230]/10 p-3.5 sm:p-4 rounded-2xl border border-[#124230]/20">
                  <span className="text-[11px] text-[#124230] font-medium block">{t('predictions.govtMspBaseline', 'Govt. MSP Baseline')}</span>
                  <div className="text-xl sm:text-2xl font-black text-[#124230] font-mono mt-1">
                    ₹{activePrediction.mspPrice || 2275}
                  </div>
                  <span className="text-[10px] text-neutral-500">{t('predictions.cacpGuaranteedFloor', 'CACP Guaranteed Floor')}</span>
                </div>
              </div>

              {/* RELATABLE RECHARTS AREA CHART */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('predictions.interactivePriceTrend', 'Interactive Price Trend: Historical Mandi Actuals vs. AI Predictive Window')}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-slate-500 rounded-full" /> {t('predictions.actual', 'Actual')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-emerald-500 rounded-full" /> {t('predictions.aiForecast', 'AI Forecast')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-rose-400 rounded-full" /> {t('predictions.govtMsp', 'Govt MSP')}
                    </span>
                  </div>
                </div>

                {/* Chart Frame */}
                <div className="h-72 w-full bg-gradient-to-b from-[#0A261C] to-[#041610] p-4 rounded-2xl border border-[#1B4E3A] shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicTrendPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52B788" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#52B788" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A3E2F" vertical={false} />
                      <XAxis dataKey="period" stroke="#74A892" fontSize={11} tickLine={false} />
                      <YAxis stroke="#74A892" fontSize={11} domain={['dataMin - 300', 'dataMax + 400']} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#07241A', 
                          borderColor: '#24614A', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }}
                        formatter={(val: any, name: any) => {
                          if (name === 'displayHistorical') return [`₹${val} / Qtl`, 'Historical Spot Price'];
                          if (name === 'displayPredicted') return [`₹${val} / Qtl`, 'AI Projected Price'];
                          if (name === 'upperConfidence') return [`₹${val}`, 'Confidence High'];
                          if (name === 'lowerConfidence') return [`₹${val}`, 'Confidence Low'];
                          return [val, name];
                        }}
                      />
                      {activePrediction.mspPrice && (
                        <ReferenceLine 
                          y={activePrediction.mspPrice} 
                          stroke="#F87171" 
                          strokeDasharray="4 4" 
                          label={{ value: `MSP ₹${activePrediction.mspPrice}`, fill: '#FCA5A5', fontSize: 10, position: 'insideBottomRight' }} 
                        />
                      )}
                      {/* Shaded confidence interval band */}
                      <Area type="monotone" dataKey="upperConfidence" stroke="none" fill="#52B788" fillOpacity={0.12} />
                      <Area type="monotone" dataKey="displayHistorical" stroke="#94A3B8" strokeWidth={2.5} fill="url(#colorHistorical)" />
                      <Area type="monotone" dataKey="displayPredicted" stroke="#52B788" strokeWidth={3} fill="url(#colorPredicted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Green shaded area highlights neural confidence interval band (95% CI)</span>
                  <span className="text-emerald-700 font-semibold">Model accuracy: {activePrediction.confidenceScore}%</span>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#0D2E22]">{t('predictions.farmerStrategy', 'Recommended Farmer Selling Strategy')}</h4>
                  <p className="text-xs text-neutral-700 leading-relaxed mt-1">
                    {activePrediction.recommendation}
                  </p>
                  <p className="text-xs font-bold text-emerald-800 mt-2">
                    {t('predictions.optimalSellWindow', 'Optimal Sell Window:')} <span className="underline decoration-emerald-500 font-extrabold">{activePrediction.bestSellWindow}</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Driving Market Factors */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#0D2E22] flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                {t('predictions.keyDrivers', 'Key Drivers Influencing This Price Forecast')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePrediction.drivingFactors.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-[#0E3D2C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Simulation Sandbox (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-6 sticky top-24">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">{t('predictions.stressSandbox', 'Live Stress-Test Sandbox')}</span>
              <h3 className="text-lg font-bold text-[#0D2E22] font-['Outfit'] mt-0.5">
                {t('predictions.simulateMarket', 'Simulate Market Conditions')}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {t('predictions.sandboxDesc', 'Slide to dynamically adjust rainfall anomalies and festival demand on the live price projection graph.')}
              </p>
            </div>

            {/* Slider 1: Monsoon Rainfall Anomaly */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  {t('predictions.monsoonDev', 'Monsoon Deviation:')}
                </span>
                <span className="font-mono text-emerald-800">{monsoonShift > 0 ? `+${monsoonShift}%` : `${monsoonShift}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="5"
                value={monsoonShift}
                onChange={(e) => setMonsoonShift(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>{t('predictions.deficit', 'Deficit (-20%)')}</span>
                <span>{t('predictions.normal', 'Normal')}</span>
                <span>{t('predictions.excess', 'Excess (+20%)')}</span>
              </div>
            </div>

            {/* Slider 2: Festive Demand Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-700 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {t('predictions.festivalProc', 'Festival Procurement:')}
                </span>
                <span className="font-mono text-emerald-800">+{festiveSurge}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={festiveSurge}
                onChange={(e) => setFestiveSurge(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>{t('predictions.normal', 'Normal')}</span>
                <span>{t('predictions.diwaliPeak', 'Diwali Peak (+40%)')}</span>
              </div>
            </div>

            {/* Simulation Result Output */}
            <div className="bg-[#0A261C] text-white p-4 rounded-2xl border border-[#1E523D] space-y-2 shadow-sm">
              <div className="text-xs text-neutral-300 font-medium">{t('predictions.modelAdjustedRate', 'Model-Adjusted 30d Rate:')}</div>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                ₹{simulatedProjected30d} <span className="text-xs text-neutral-400 font-normal">/ Qtl</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {monsoonShift < 0 ? (
                  <span>⚠️ Deficit rainfall reduces arrivals, driving farmgate spot rates higher.</span>
                ) : (
                  <span>✓ Steady supply stabilizes prices while festival buyers absorb produce at peak rates.</span>
                )}
              </p>
            </div>

            {/* Warehouse advisory button */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={() => alert(`Connecting with nearby WDRA accredited cold storage in ${activePrediction.bestSellWindow}`)}
                className="w-full py-2.5 px-4 bg-[#0E3D2C] hover:bg-[#14533C] text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
              >
                {t('predictions.bookWarehouse', 'Book WDRA Warehouse Space')}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: RELATABLE DIRECT VS MIDDLEMAN PROFIT BREAKDOWN */}
      {activeSubTab === 'middleman' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">{t('predictions.incomeComparison', 'Farmer Net Income Comparison')}</span>
              <h2 className="text-2xl font-bold text-[#0D2E22] font-['Outfit'] mt-0.5">
                {t('predictions.whereMoneyGoes', 'Where Does the Money Go? Traditional Mandi vs. Khet Link Direct')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-3xl leading-relaxed">
                {t('predictions.middlemanExplain', 'Demonstrating how direct procurement by college messes, university hostels, and food millers removes the 8-12% commission, unauthorized weighing cuts, and credit payment delays.')}
              </p>
            </div>

            {/* Bar Chart comparing net received */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 h-80 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <div className="text-xs font-bold text-neutral-700 mb-2 flex items-center justify-between">
                  <span>{t('predictions.netPriceReceived', 'Net Price Received by Farmer (₹ per Quintal)')}</span>
                  <span className="text-emerald-700 font-semibold">{t('predictions.zeroCommissionTag', 'Zero Commission via Khet Link')}</span>
                </div>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={activePrediction.channelComparison || []} 
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="channel" fontSize={11} interval={0} tickLine={false} />
                    <YAxis fontSize={11} tickFormatter={(v) => `₹${v}`} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [`₹${val} / Qtl`, name === 'netReceived' ? 'Net in Farmer Bank' : name]}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="grossPrice" name="Market Quoted Price" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="deductions" name="Middleman Cuts / Cess" fill="#F87171" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="netReceived" name="Net in Farmer Bank (DBT)" fill="#10B981" radius={[6, 6, 0, 0]}>
                      {(activePrediction.channelComparison || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#059669' : index === 1 ? '#64748B' : '#DC2626'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Channel Breakdown Cards */}
              <div className="lg:col-span-5 space-y-3">
                {(activePrediction.channelComparison || []).map((item, idx) => {
                  const isKhet = idx === 2;
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isKhet 
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isKhet ? 'text-emerald-900' : 'text-neutral-800'}`}>
                          {item.channel}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isKhet ? 'bg-emerald-200 text-emerald-900' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {item.settlementSpeed}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div>
                          <div className="text-xl font-black font-mono text-[#0D2E22]">
                            ₹{item.netReceived} <span className="text-[11px] font-normal text-neutral-500">/ Qtl Net</span>
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {item.deductions > 0 ? `-₹${item.deductions} lost in fees & dalali` : '₹0 Commission • 100% Retained'}
                          </div>
                        </div>

                        {isKhet && (
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                              +₹{item.netReceived - (activePrediction.channelComparison?.[0].netReceived || 0)} / Qtl Gain
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    On an average 100 Quintal farm lot, selling directly on Khet Link saves <strong>₹67,000 in unrecorded deductions</strong> and pays within 2 hours of electronic weighment.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: RELATABLE HOSTEL MESS & INSTITUTIONAL DEMAND CYCLE */}
      {activeSubTab === 'hostel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">{t('predictions.institutionalCalendar', 'Institutional Buyer Procurement Calendar')}</span>
              <h2 className="text-2xl font-bold text-[#0D2E22] font-['Outfit'] mt-0.5">
                {t('predictions.hostelIntakeVsHarvest', 'College & University Hostel Mess Intake vs. Harvest Arrivals')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-3xl leading-relaxed">
                {t('predictions.hostelForwardDesc', 'Why forward contracts with university hostels (IITs, NITs, Central Universities) guarantee stable farmgate prices even during peak harvest glut months.')}
              </p>
            </div>

            {/* Composed Chart */}
            <div className="h-80 w-full bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activePrediction.monthlyHostelMessDemand || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} tickFormatter={(v) => `${v} Qtl`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val} Quintals`, name === 'messDemandQuintals' ? 'Hostel Mess Demand' : 'Mandi Arrivals']}
                  />
                  <Legend />
                  <Bar dataKey="messDemandQuintals" name="Hostel Mess Consumption Demand (Qtl)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="mandiArrivals" name="APMC Mandi Arrival Glut (Qtl)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Key seasonal takeaways for farmers & mess managers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('predictions.julyAugustSpike', 'July - August Spike')}</span>
                <div className="text-base font-bold text-[#0D2E22]">{t('predictions.monsoonReopening', 'Monsoon Academic Reopening')}</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Hostel messes intake over 500+ quintals monthly as 10,000+ students return to campus. Ideal month to sign 6-month fixed farm contracts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">{t('predictions.aprilHarvestGlut', 'April Harvest Glut')}</span>
                <div className="text-base font-bold text-[#0D2E22]">{t('predictions.avoidDistressRates', 'Avoid Selling at Distress Rates')}</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Local mandis drop prices by 15% due to arrival glut. Khet Link connects directly to central university hostels with price guarantees.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">{t('predictions.octoberFestiveTerm', 'October Festive Term')}</span>
                <div className="text-base font-bold text-[#0D2E22]">{t('predictions.diwaliSpecialPremium', 'Diwali & Special Feast Premium')}</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Hostel committees allocate special budgets for Grade-A Basmati, Sharbati Atta, and Mustard Oil, delivering highest realization to farmers.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: REGIONAL DEMAND INDEX */}
      {activeSubTab === 'regional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_DEMAND_PREDICTIONS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">
                    {item.region}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    item.demandScore === 'Surging' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    🔥 {item.demandScore} Demand
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#0D2E22] font-['Outfit']">
                  {item.cropName}
                </h3>

                <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs">
                  <div>
                    <span className="text-neutral-500">Projected Surge:</span>
                    <p className="font-bold text-emerald-700 font-mono text-base">{item.projectedGrowth}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Festival Factor:</span>
                    <p className="font-bold text-[#0D2E22] font-mono text-base">{item.festivalMultiplier}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-neutral-600">
                  <p><strong>Weather Risk:</strong> {item.weatherFactor}</p>
                  <p><strong>Storage Advisory:</strong> {item.storageRecommendation}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-neutral-700 uppercase block mb-1">
                    Major Procuring Sectors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.targetIndustries.map((ind, i) => (
                      <span key={i} className="text-[11px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md border border-emerald-100">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Risk Assessment: <strong>{item.riskLevel}</strong></span>
                <button
                  onClick={() => alert(`Notified 14 FPOs producing ${item.cropName} to schedule harvesting`)}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Broadcast Sowing Advisory &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
