import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  BadgeCheck, 
  Coins, 
  Store, 
  Sparkles,
  Users,
  Award,
  ChevronRight,
  BarChart3,
  Scale,
  CheckCircle2,
  SlidersHorizontal,
  BellRing,
  HelpCircle,
  Clock,
  Layers,
  Building2,
  Activity,
  Zap,
  Search
} from 'lucide-react';
import { AppView, CropProduct, Order } from '../types';
import { MANDI_TICKER, MOCK_PRICE_PREDICTIONS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { calculateSettledTradeValue, formatINRValue, countSettledOrders } from '../utils/tradeCalculations';

interface LandingHeroProps {
  crops?: CropProduct[];
  orders?: Order[];
  setCurrentView?: (view: AppView) => void;
  onNavigate?: (view: AppView) => void;
  openAuthModal?: (role: 'farmer' | 'buyer') => void;
  onFarmerJoin?: () => void;
  onBuyerJoin?: () => void;
  onExploreMarketplace?: () => void;
  onViewAIPredictions?: () => void;
  onSelectCrop?: (crop: CropProduct) => void;
  onAddToCart?: (crop: CropProduct, qty: number, unit: 'kg' | 'quintal') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  crops = [],
  orders = [],
  setCurrentView,
  onNavigate,
  openAuthModal,
  onFarmerJoin,
  onBuyerJoin,
  onExploreMarketplace,
  onViewAIPredictions,
  onSelectCrop,
  onAddToCart
}) => {
  const { t, language } = useLanguage();

  // Dynamic trade value calculated from settled orders
  const settledValue = calculateSettledTradeValue(orders);
  const settledCount = countSettledOrders(orders);
  const formattedValue = formatINRValue(settledValue);

  // Dynamic harvest lots from listed crops
  const totalHarvestQtl = crops.reduce((sum, c) => sum + (c.quantityAvailableQuintals || 0), 0);
  const formattedHarvestQtl = totalHarvestQtl > 0 ? totalHarvestQtl.toLocaleString('en-IN') : '0';

  // Navigation & auth helper
  const navigate = (view: AppView) => {
    if (onNavigate) onNavigate(view);
    else if (setCurrentView) setCurrentView(view);
    else if (view === 'marketplace' && onExploreMarketplace) onExploreMarketplace();
    else if (view === 'ai-predictions' && onViewAIPredictions) onViewAIPredictions();
  };

  const handleAuth = (role: 'farmer' | 'buyer') => {
    if (openAuthModal) openAuthModal(role);
    else if (role === 'farmer' && onFarmerJoin) onFarmerJoin();
    else if (role === 'buyer' && onBuyerJoin) onBuyerJoin();
  };

  // State for Produce Lots Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Filter crops for direct farmgate harvest section
  const sourceCrops = crops || [];
  const filteredCrops = selectedCategory === 'All' 
    ? sourceCrops.slice(0, 4) 
    : sourceCrops.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 4);

  // Main screen cursor-reactive animations
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [spotlightCoords, setSpotlightCoords] = useState<{ x: number; y: number }>({ x: 400, y: 200 });

  // Physics springs for organic parallax on main screen
  const heroMouseX = useMotionValue(0.5);
  const heroMouseY = useMotionValue(0.5);
  const springX = useSpring(heroMouseX, { stiffness: 140, damping: 22 });
  const springY = useSpring(heroMouseY, { stiffness: 140, damping: 22 });

  // Parallax offsets for background elements
  const sproutParallaxX = useTransform(springX, [0, 1], [-24, 24]);
  const sproutParallaxY = useTransform(springY, [0, 1], [-20, 20]);
  const sproutParallaxRotate = useTransform(springX, [0, 1], [-5, 5]);

  const orb1X = useTransform(springX, [0, 1], [-35, 35]);
  const orb1Y = useTransform(springY, [0, 1], [-25, 25]);

  const orb2X = useTransform(springX, [0, 1], [30, -30]);
  const orb2Y = useTransform(springY, [0, 1], [20, -20]);

  const badgeShiftX = useTransform(springX, [0, 1], [15, -15]);
  const badgeShiftY = useTransform(springY, [0, 1], [10, -10]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroContainerRef.current) return;
    const rect = heroContainerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    heroMouseX.set(relX);
    heroMouseY.set(relY);
    setSpotlightCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
    if (!isHoveringHero) setIsHoveringHero(true);
  };

  const handleHeroMouseLeave = () => {
    setIsHoveringHero(false);
    heroMouseX.set(0.5);
    heroMouseY.set(0.5);
  };

  return (
    <div className="space-y-7 pb-14 font-['Plus_Jakarta_Sans']">
      
      {/* 1. Live Farmgate Network Activity Stream with Continuous Marquee Animation */}
      <div className="bg-[#0B192C] border-b border-[#1E3A5F] text-slate-200 overflow-hidden py-2 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 shrink-0 bg-[#E65A00] text-white px-2.5 py-0.5 rounded-sm font-mono font-bold tracking-wide shadow-xs text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="uppercase tracking-wider">{t('hero.mandiFeed', 'MANDI FEED')}</span>
          </div>
          
          <div className="overflow-hidden relative w-full flex-1">
            <div className="animate-mandi-ticker flex items-center gap-8 whitespace-nowrap">
              {[
                { lot: '#LOT-PB-8941', title: t('hero.tickerItem1', '40 Qtl Sharbati Wheat Dispatched'), detail: t('hero.tickerDetail1', 'Sehore FPO → IIT Delhi Hostel Mess'), badge: 'GPS Active' },
                { lot: '#LOT-RJ-4210', title: t('hero.tickerItem2', '₹2,85,400 Instant DBT Settled'), detail: t('hero.tickerDetail2', 'Direct to Sardar Gurpreet Singh'), badge: 'T+0 Settled' },
                { lot: '#LOT-HR-1121', title: t('hero.tickerItem3', '₹3,40,000 RBI Escrow Locked'), detail: t('hero.tickerDetail3', 'Karnal 1121 Basmati Lot #77'), badge: 'Escrow Secured' },
                { lot: '#LOT-UP-3502', title: t('hero.tickerItem4', 'NIT Kurukshetra Mess Booked 35 Qtl'), detail: t('hero.tickerDetail4', 'Direct Monthly Hostel Mess Procurement'), badge: 'Direct Order' },
                { lot: '#LOT-RJ-9923', title: t('hero.tickerItem5', 'NABL Assaying: Grade-A Verified'), detail: t('hero.tickerDetail5', 'Alwar Mustard (42.1% oil content)'), badge: 'Lab Certified' },
                { lot: '#LOT-MH-0814', title: t('hero.tickerItem6', '85 Qtl Nashik Onions Listed'), detail: t('hero.tickerDetail6', 'Sahyadri FPO • Section 43 Exempted'), badge: 'Farmgate Ready' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-default">
                  <span className="font-mono text-[11px] font-bold text-amber-300 px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700">
                    {item.lot}
                  </span>
                  <span className="font-medium text-slate-100 tracking-tight">{item.title}</span>
                  <span className="text-slate-400 text-[11px]">({item.detail})</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-sm bg-[#166534]/70 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                  <span className="text-slate-600 text-xs">|</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Architectural Institutional Theme Inspired by LandSync */}
      <section className="relative pt-2 sm:pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          className="relative rounded-lg bg-gradient-to-b from-[#0B2E21] via-[#09241A] to-[#061811] text-white border border-[#1E523D] shadow-md p-6 sm:p-8 lg:p-10 overflow-hidden"
        >
          {/* Subtle Institutional Grid Background Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="max-w-4xl space-y-5 relative z-10">
            
            {/* National Mission Eyebrow with Saffron Accent Bar */}
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-[2.5px] bg-[#FF9933] rounded-xs" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[#FF9933] uppercase">
                {t('hero.nationalGrid', 'NATIONAL DIRECT FARMGATE PROCUREMENT & MANDI GRID')}
              </span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            </div>

            {/* Authoritative National Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.2] font-['Outfit']">
              <span>{t('hero.titleLine1', 'Direct From Bharat’s Soil:')}</span>{' '}
              <span className="text-[#52B788] block sm:inline">
                {t('hero.titleHighlight', 'Zero Middlemen. Fair Mandi Rates.')}
              </span>
            </h1>

            {/* Statutory & Operational Subtitle */}
            <p className="text-xs sm:text-[15px] lg:text-base text-emerald-100/85 max-w-3xl leading-relaxed font-normal">
              {t('hero.subtitle', 'Empowering smallholder farmers & FPOs to connect directly with bulk food processors, retailers, and conscious consumers with AI-driven price predictions, digitized quality assaying, and 100% escrow bank protection.')}
            </p>

            {/* Structured Institutional Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-explore-marketplace-btn"
                onClick={() => navigate('marketplace')}
                className="px-6 py-3 rounded-sm bg-[#E65A00] hover:bg-[#C44D00] text-white font-bold text-sm shadow-sm border border-amber-400/40 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Store className="w-4 h-4 text-white" />
                <span>{t('hero.exploreMarket', 'Explore Crop Marketplace')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-farmer-portal-btn"
                onClick={() => handleAuth('farmer')}
                className="px-5 py-3 rounded-sm bg-[#144231] hover:bg-[#1C5B44] text-emerald-100 font-semibold text-sm border border-[#2B7354] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sprout className="w-4 h-4 text-[#74C69D]" />
                <span>{t('hero.joinFarmer', 'Farmer / FPO Registration (Kisan DBT)')}</span>
              </button>

              <button
                id="hero-ai-preview-btn"
                onClick={() => navigate('ai-predictions')}
                className="px-4 py-3 rounded-sm bg-slate-900/90 hover:bg-slate-800 text-amber-200 font-mono font-semibold text-xs border border-amber-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('hero.aiForecasts', 'AI Mandi Forecasts')}</span>
              </button>
            </div>

            {/* Operational Badges with Monospace & Legal Context */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1C4E3A] text-xs text-emerald-200/90 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#52B788] shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs text-slate-200">{t('banner.escrow', '100% Escrow Bank Secured')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[#52B788] shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs text-slate-200">{t('hero.statEscrow', 'NABL Quality Assayed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#52B788] shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs text-slate-200">{t('hero.statEscrowSub', 'Instant T+0 Aadhaar DBT')}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. LandSync-Inspired 4-Column "Mandi Terminal" Stats Bar */}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden mt-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Box 1: Prototype Trade Value (Dynamic from settled orders) */}
            <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col justify-between hover:bg-slate-50/70 transition-colors">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{t('hero.terminalStat1Title', 'PROTOTYPE TRADE VALUE')}</span>
                <span className={`w-2 h-2 rounded-full ${settledCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
              <div className="my-2.5 text-3xl font-extrabold text-[#0B192C] font-mono flex items-baseline gap-1">
                <span className="text-[#E65A00]">₹</span>{formattedValue.display}{formattedValue.unit && <>{' '}<span className="text-sm font-semibold text-slate-600">{formattedValue.unit}</span></>}
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                {settledCount > 0
                  ? t('hero.terminalStat1Sub', `Calculated from ${settledCount} completed demo transaction${settledCount !== 1 ? 's' : ''}.`)
                  : t('hero.terminalStat1Empty', 'No completed demo transactions yet.')
                }
              </div>
            </div>

            {/* Box 2: Assayed Produce Batches (Dynamic from listed crops) */}
            <div className="p-5 sm:p-6 border-b sm:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between hover:bg-slate-50/70 transition-colors">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{t('hero.terminalStat2Title', 'ASSAYED HARVEST LOTS')}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1 rounded font-bold">NABL</span>
              </div>
              <div className="my-2.5 text-3xl font-extrabold text-[#0B192C] font-mono flex items-baseline gap-1">
                {formattedHarvestQtl}<span className="text-[#E65A00]">{totalHarvestQtl > 0 ? '+' : ''}</span> <span className="text-sm font-semibold text-slate-600">Qtl</span>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                {totalHarvestQtl > 0
                  ? t('hero.terminalStat2Sub', `From ${crops.length} listed produce lots on the marketplace.`)
                  : t('hero.terminalStat2Empty', 'No harvest lots listed yet.')
                }
              </div>
            </div>

            {/* Box 3: 0% Dalali */}
            <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col justify-between hover:bg-slate-50/70 transition-colors">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{t('hero.terminalStat3Title', 'MIDDLEMAN DALALI CUT')}</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1 rounded font-bold">SEC 43</span>
              </div>
              <div className="my-2.5 text-3xl font-extrabold text-[#0B192C] font-mono flex items-baseline gap-1">
                0.0<span className="text-[#E65A00]">%</span>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                {t('hero.terminalStat3Sub', 'Section 43 APMC Direct Procurement exemption compliant.')}
              </div>
            </div>

            {/* Box 4: Escrow Release */}
            <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50/70 transition-colors">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{t('hero.terminalStat4Title', 'ESCROW SETTLEMENT')}</span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 rounded font-bold">T+0</span>
              </div>
              <div className="my-2.5 text-3xl font-extrabold text-[#0B192C] font-mono flex items-baseline gap-1">
                {t('hero.terminalStat4Val', 'T+0 Release')}
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                {t('hero.terminalStat4Sub', 'Funds held in RBI-monitored escrow, paid upon weighbridge receipt.')}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Connected 5-Step Process Pipeline (LandSync Sequential Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-xs">
          
          {/* Pipeline Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-[2px] bg-[#E65A00]" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E65A00]">
                  {t('hero.lifecycleEyebrow', 'OPERATIONAL TRADE LIFECYCLE')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B192C] font-['Outfit']">
                {t('hero.lifecycleTitle', 'End-to-End Assayed Mandi Settlement')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {t('hero.lifecycleSub', 'From farmgate harvest registration to direct Aadhaar bank credit with zero middleman dalali or hidden market deductions.')}
            </p>
          </div>

          {/* 5 Connected Step Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-6 relative">
            {[
              {
                step: '01',
                title: t('hero.step1Title', 'Farmgate Listing'),
                sub: t('hero.stage1Desc', 'Kisan / FPO uploads harvest batch with moisture photo and GPS village tag.'),
                badge: `${t('hero.stage', 'Stage')} 1`
              },
              {
                step: '02',
                title: t('hero.step2Title', 'Digital Assaying'),
                sub: t('hero.stage2Desc', 'NABL accredited digital assay test verifies grain moisture, size & Agmark grade.'),
                badge: `${t('hero.stage', 'Stage')} 2`
              },
              {
                step: '03',
                title: t('hero.step3Title', 'Escrow Lock'),
                sub: t('hero.stage3Desc', 'Institutional mess or bulk buyer deposits 100% funds into RBI escrow.'),
                badge: `${t('hero.stage', 'Stage')} 3`
              },
              {
                step: '04',
                title: t('hero.step4Title', 'Weighbridge Pass'),
                sub: t('hero.stage4Desc', 'Automated electronic weighbridge slip generates verified e-Way dispatch bill.'),
                badge: `${t('hero.stage', 'Stage')} 4`
              },
              {
                step: '05',
                title: t('hero.step5Title', 'T+0 DBT Payout'),
                sub: t('hero.stage5Desc', 'Instant digital bank release directly to farmer Aadhaar account upon gate delivery.'),
                badge: `${t('hero.stage', 'Stage')} 5`
              }
            ].map((node, i) => (
              <div key={i} className="flex flex-col relative group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-sm bg-[#0B2E21] text-[#52B788] font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-[#1E523D]">
                    {node.step}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    {node.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0B192C] font-['Outfit'] mb-1">
                  {node.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {node.sub}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Fresh Produce & Direct Farmgate Harvest Lots */}
      <section id="middle-down-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="space-y-5">
          
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-3.5"
          >
            <div>
              <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('banner.tagline', 'Verified Farmgate Harvests')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Outfit'] mt-0.5">
                {t('hero.produceLotsTitle', 'Direct Mandi Produce Lots')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                {t('hero.produceLotsSub', 'Lab-tested moisture, zero dalali, ready for immediate dispatch from verified FPOs & collectives.')}
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { key: 'All', label: t('market.allCategories', 'All') },
                { key: 'Grains', label: t('market.grains', 'Grains') },
                { key: 'Pulses', label: t('market.pulses', 'Pulses') },
                { key: 'Oilseeds', label: t('market.oilseeds', 'Oilseeds') },
                { key: 'Spices', label: t('market.spices', 'Spices') }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#144231] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 4-Column Full-Width Crop Cards Grid or Clean Empty State */}
          {filteredCrops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-10 text-center space-y-3.5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#144231] mx-auto flex items-center justify-center">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-['Outfit']">
                {t('hero.noCropsListed', 'No Crop Lots Listed Yet')}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                {t('hero.noCropsSub', 'Farmers and FPOs can register and publish their fresh harvest batches directly to receive verified bulk procurement bids.')}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => handleAuth('farmer')}
                  className="px-5 py-2.5 bg-[#144231] hover:bg-[#1C5B44] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sprout className="w-4 h-4" />
                  <span>{t('hero.listCropBtn', 'List Harvest Batch (Farmer Onboarding)')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredCrops.map((crop) => (
                <div 
                  key={crop.id}
                  className="bg-white rounded-md border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5 duration-200"
                >
                  <div 
                    onClick={() => onSelectCrop && onSelectCrop(crop)}
                    className="relative h-44 overflow-hidden bg-neutral-100 cursor-pointer"
                  >
                    <img 
                      src={crop.imageUrl} 
                      alt={crop.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {crop.isOrganic && (
                        <span className="text-[10px] font-bold bg-[#138808] text-white px-2 py-0.5 rounded-sm shadow-xs font-mono">
                          🌿 {t('common.organic', 'Organic')}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold bg-[#0B2E21]/95 text-emerald-200 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                        {crop.grade}
                      </span>
                    </div>
                    
                    {/* Official Lot Monospace Badge */}
                    <div className="absolute top-2 right-2 bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border border-slate-700 shadow-xs">
                      #{crop.id.toUpperCase().slice(0, 10)}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-sm">
                      {t('market.moisture', 'Moisture')}: {crop.moisturePercent}%
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase text-[#E65A00] tracking-wider">
                        {crop.category} • {crop.locationState}
                      </div>
                      <h4 
                        onClick={() => onSelectCrop && onSelectCrop(crop)}
                        className="font-bold text-sm text-neutral-900 hover:text-emerald-800 cursor-pointer truncate mt-0.5 font-['Outfit']"
                      >
                        {crop.title}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {t('hero.byFarmer', 'By')} {crop.farmerName} ({crop.fpoName})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">{t('common.farmgateRate', 'Farmgate Rate')}</div>
                        <div className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{crop.pricePerKg} <span className="text-xs font-normal text-slate-500">/{t('market.perKg', 'kg')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">{t('common.bulkRate', 'Bulk Qtl Rate')}</div>
                        <div className="text-xs font-bold text-emerald-800 font-mono">
                          ₹{crop.pricePerQuintal}/{t('market.perQuintal', 'Qtl')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onSelectCrop && onSelectCrop(crop)}
                        className="py-1.5 px-2 text-xs font-semibold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300"
                      >
                        {t('common.assaySheet', 'Assay Sheet')}
                      </button>
                      <button
                        onClick={() => onAddToCart && onAddToCart(crop, 1, 'quintal')}
                        className="py-1.5 px-2 text-xs font-bold rounded-sm bg-[#144231] hover:bg-[#1C5B44] text-white transition shadow-xs cursor-pointer border border-[#2B7354]"
                      >
                        {t('common.addBatch', '+ Add Batch')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom link to view full marketplace */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-500 font-medium">
              {t('hero.showingLots', 'Showing')} {filteredCrops.length} {t('hero.ofLots', 'of')} {sourceCrops.length} {t('hero.directLotsLabel', 'direct farmgate lots')}
            </span>
            <button
              onClick={() => navigate('marketplace')}
              className="text-xs sm:text-sm font-bold text-[#144231] hover:text-emerald-700 transition flex items-center gap-1.5 group cursor-pointer"
            >
              <span>{t('hero.browseAllMarket', 'Browse All Harvest Lots in Marketplace')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. Stakeholder Dual Section: For Farmers & For Bulk Buyers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Section Header with Live Rate Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#1B523D] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                {t('hero.directEcosystem', 'Direct Farmgate Ecosystem')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-['Outfit']">
              {t('hero.gatewayTitle', 'Choose Your Gateway on Khet Link')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
            {t('hero.gatewaySub', 'Whether you are harvesting crops in Punjab & MP or managing bulk food procurement for a college hostel mess or food brand.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: For Farmers & FPOs */}
          <div 
            className="rounded-md bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            {/* Relatable Farmer Image Banner */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80" 
                alt="Indian Farmers in agricultural fields harvesting high grade produce" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300 opacity-90 grayscale-[25%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E21] via-[#0B2E21]/60 to-transparent" />
              
              {/* Badges Over Image */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#0B2E21]/90 backdrop-blur-md border border-emerald-500/50 text-emerald-200 text-[11px] font-mono font-bold shadow-xs flex items-center gap-1.5">
                  <Sprout className="w-3 h-3 text-emerald-400" />
                  {t('hero.kisanCollectiveBadge', 'Kisan & FPO Collective')}
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-[#E65A00] text-white text-[10px] font-mono font-bold uppercase shadow-xs">
                  {t('hero.statCommission', '0% Dalali Cut')}
                </span>
              </div>

              {/* Title & Subtitle Over Banner */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  {t('hero.forFarmersTitle', 'For Farmers & FPOs')}
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs text-emerald-100/85 line-clamp-1">
                  {t('hero.forFarmersSub', 'Connect directly with verified corporate & hostel mess buyers')}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {t('hero.farmerCardDesc', 'Transform from local price-takers to national market-makers. Aggregate produce with neighboring farmers, receive digital NABL assay certificates, and get guaranteed T+0 bank payouts via Aadhaar DBT.')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium pt-1">
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.farmerBullet1', 'Instant SMS OTP & Aadhaar DBT')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.farmerBullet2', 'Free digital moisture testing')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.farmerBullet3', 'FPO truckload pooling')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.farmerBullet4', '100% Escrow safe payment')}</span>
                  </div>
                </div>
              </div>

              {/* Login / Registration Button for Farmer */}
              <div className="pt-3 space-y-2 border-t border-slate-100">
                <button
                  id="farmer-signup-action-btn"
                  onClick={() => handleAuth('farmer')}
                  className="w-full py-3 px-4 rounded-sm bg-[#144231] hover:bg-[#1C5B44] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-[#2B7354]"
                >
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span>{t('hero.farmerSignupBtn', 'Sign Up as Farmer or FPO')}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>{t('common.returningFarmer', 'Returning farmer?')}</span>
                  <button
                    onClick={() => handleAuth('farmer')}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('common.quickLoginOtp', 'Quick Login with OTP')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: For Bulk Buyers & Institutional */}
          <div 
            className="rounded-md bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            {/* Relatable Bulk User / Mess Buyer Image Banner */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" 
                alt="Bulk buyer and hostel mess procurement user inspecting fresh food produce" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300 opacity-90 grayscale-[25%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/60 to-transparent" />
              
              {/* Badges Over Image */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#0B192C]/90 backdrop-blur-md border border-blue-400/40 text-blue-200 text-[11px] font-mono font-bold shadow-xs flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-300" />
                  {t('hero.messBrandsBadge', 'Hostel Mess, Brands & Retail')}
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-[#1B3F75] text-white text-[10px] font-mono font-bold uppercase shadow-xs border border-blue-400/40">
                  {t('hero.savePercent', 'Save 14% to 18%')}
                </span>
              </div>

              {/* Title & Subtitle Over Banner */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  {t('hero.forBuyersTitle', 'For Bulk Buyers & Hostel Mess')}
                  <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />
                </h3>
                <p className="text-xs text-blue-100/85 line-clamp-1">
                  {t('hero.forBuyersSub', 'Direct grain, pulse & produce procurement with APMC cess exemption')}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {t('hero.buyerCardDesc', 'Procure directly from farmgates with unified GST e-Way bills, standardized moisture assay certificates, and end-to-end refrigerated transport. Ideal for college mess, university hostels, hotel chains, and millers.')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium pt-1">
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.buyerBullet1', 'Hostel & Mess monthly grain contracts')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.buyerBullet2', 'Zero APMC cess & direct tax invoices')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.buyerBullet3', 'NABL certified moisture & foreign matter')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px]">{t('hero.buyerBullet4', 'RBI Escrow: pay only on verified delivery')}</span>
                  </div>
                </div>
              </div>

              {/* Login / Registration Button for Buyer / Hostel Mess */}
              <div className="pt-3 space-y-2 border-t border-slate-100">
                <button
                  id="buyer-signup-action-btn"
                  onClick={() => handleAuth('buyer')}
                  className="w-full py-3 px-4 rounded-sm bg-[#1B3F75] hover:bg-[#14315C] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-blue-400/40"
                >
                  <Building2 className="w-4 h-4 text-blue-200" />
                  <span>{t('hero.buyerSignupBtn', 'Sign Up as Bulk Buyer / Hostel Mess')}</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>{t('common.returningBuyer', 'Hostel mess or registered buyer?')}</span>
                  <button
                    onClick={() => handleAuth('buyer')}
                    className="font-semibold text-blue-800 hover:text-blue-950 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('common.loginGstin', 'Login with GSTIN / Mobile')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
