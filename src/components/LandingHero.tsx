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
import { AppView, CropProduct } from '../types';
import { MANDI_TICKER, MOCK_CROPS, MOCK_PRICE_PREDICTIONS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface LandingHeroProps {
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
  const filteredCrops = selectedCategory === 'All' 
    ? MOCK_CROPS.slice(0, 4) 
    : MOCK_CROPS.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 4);

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
      <div className="bg-[#03140D] border-b border-[#0D3123] text-neutral-200 overflow-hidden py-2.5 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-[#11402F] to-[#1A543E] text-white px-3 py-1 rounded-full font-bold tracking-wide border border-[#52B788]/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] tracking-wider uppercase text-emerald-100">{t('hero.liveMandiTicker', 'Live Farmgate Stream')}</span>
          </div>
          
          <div className="overflow-hidden relative w-full flex-1">
            <div className="animate-mandi-ticker flex items-center gap-8 whitespace-nowrap">
              {[
                { icon: '🚚', title: '40 Qtl Sharbati Wheat Dispatched', detail: 'Sehore FPO → IIT Delhi Hostel Mess', badge: 'GPS Active' },
                { icon: '⚡', title: '₹2,85,400 Instant DBT Released', detail: 'To Sardar Gurpreet Singh upon digital assay', badge: 'T+0 Settled' },
                { icon: '🛡️', title: '₹3,40,000 RBI Escrow Locked', detail: 'Karnal 1121 Basmati Lot #77', badge: 'Escrow Secured' },
                { icon: '🏢', title: 'NIT Kurukshetra Mess Booked 35 Qtl', detail: 'Direct Monthly Hostel Mess Procurement', badge: 'Direct Order' },
                { icon: '🧪', title: 'NABL Assaying: Grade-A Verified', detail: 'Alwar Mustard (42.1% oil content)', badge: 'Lab Certified' },
                { icon: '🌾', title: '85 Qtl Nashik Onions Listed', detail: 'Sahyadri FPO • Zero Middleman Dalali', badge: 'Farmgate Ready' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white transition-colors cursor-default">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-semibold text-white tracking-tight">{item.title}</span>
                  <span className="text-emerald-200/70 text-[11px]">({item.detail})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                    {item.badge}
                  </span>
                  <span className="text-emerald-800 text-xs">✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Refined Botanical Jade Theme with Cursor-Reactive Screen Animations */}
      <section className="relative overflow-hidden pt-2 sm:pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          ref={heroContainerRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#052318] via-[#0D3828] to-[#04160F] text-white border border-[#1C533E] shadow-2xl p-6 sm:p-8 lg:p-10 overflow-hidden transition-all duration-300"
        >
          {/* Dynamic Cursor-Reactive Spotlight */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
            style={{
              opacity: isHoveringHero ? 1 : 0.5,
              background: isHoveringHero
                ? `radial-gradient(650px circle at ${spotlightCoords.x}px ${spotlightCoords.y}px, rgba(82, 183, 136, 0.32), rgba(245, 158, 11, 0.09) 35%, transparent 72%)`
                : 'radial-gradient(600px circle at 50% 30%, rgba(82, 183, 136, 0.18), transparent 70%)',
            }}
          />

          {/* Ambient Botanical Glows with Cursor Parallax Motion */}
          <motion.div 
            style={{ x: orb1X, y: orb1Y }}
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#52B788]/20 blur-3xl pointer-events-none" 
          />
          <motion.div 
            style={{ x: orb2X, y: orb2Y }}
            className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-amber-400/8 blur-3xl pointer-events-none" 
          />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#74C69D]/15 blur-3xl pointer-events-none" />

          {/* Decorative Sprout Silhouette with Cursor-Driven 3D Parallax */}
          <motion.div 
            style={{ x: sproutParallaxX, y: sproutParallaxY, rotate: sproutParallaxRotate }}
            className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block select-none"
          >
            <Sprout className="w-80 h-80 text-[#D8F3DC]" />
          </motion.div>

          {/* Cursor-Shifted Interactive Live Status Pill */}
          <motion.div
            style={{ x: badgeShiftX, y: badgeShiftY }}
            className="absolute top-6 right-6 hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#092B1D]/80 border border-[#245D46] backdrop-blur-md text-xs pointer-events-none shadow-lg z-10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-200 font-medium font-mono text-[11px]">{t('banner.tagline', 'Farmgate Network Live')}</span>
          </motion.div>

          <div className="max-w-4xl space-y-5 sm:space-y-6 relative z-10 py-2">
            
            {/* Main Content */}
            <div className="space-y-4 sm:space-y-5">
              
              {/* Innovation Badge with Subtle Glow & Entrance */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E3626]/90 border border-[#52B788]/50 text-xs font-semibold shadow-md backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="font-bold text-amber-200">{t('banner.sih', 'SIH 2026 AgriTech Innovation')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-100 font-medium">{t('hero.statCommission', '0% Middleman Commission')}</span>
              </motion.div>

              {/* Main Headline with Staggered Entrance & Editorial Formatting */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-extrabold tracking-tight text-white leading-[1.14] font-['Outfit']">
                <motion.span 
                  className="block text-white"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                >
                  {t('hero.titleLine1', 'Direct From Bharat’s Soil:')}
                </motion.span>
                <motion.span 
                  className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#95D5B2] via-[#F4E285] to-[#52B788] drop-shadow-xs"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                >
                  {t('hero.titleHighlight', 'Zero Middlemen. Fair Mandi Rates.')}
                </motion.span>
              </h1>

              {/* Subtitle with Animated Reveal and Key Phrase Highlights */}
              <motion.p 
                className="text-sm sm:text-[15px] lg:text-base text-emerald-100/90 max-w-3xl leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
              >
                {t('hero.subtitle', 'Empowering smallholder farmers & FPOs to connect directly with bulk food processors, retailers, and conscious consumers with AI-driven price predictions, digitized quality assaying, and 100% escrow bank protection.')}
              </motion.p>

              {/* Dual Action CTAs with Micro-interactions */}
              <motion.div 
                className="flex flex-wrap items-center gap-3 pt-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.42 }}
              >
                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-explore-marketplace-btn"
                  onClick={() => navigate('marketplace')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2D6A4F] via-[#3A8462] to-[#40916C] hover:from-[#245740] hover:to-[#357B5A] text-white font-bold text-sm shadow-lg shadow-emerald-950/50 border border-[#52B788]/60 transition flex items-center gap-2 group cursor-pointer"
                >
                  <Store className="w-4 h-4 text-emerald-200" />
                  <span>{t('hero.exploreMarket', 'Explore Crop Marketplace')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-farmer-portal-btn"
                  onClick={() => handleAuth('farmer')}
                  className="px-5 py-3 rounded-xl bg-[#0F3526]/90 hover:bg-[#164634] text-emerald-100 font-semibold text-sm border border-[#2B6D51] transition flex items-center gap-2 cursor-pointer shadow-xs backdrop-blur-xs"
                >
                  <Sprout className="w-4 h-4 text-[#74C69D]" />
                  <span>{t('hero.joinFarmer', 'Farmer / FPO Registration')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-ai-preview-btn"
                  onClick={() => navigate('ai-predictions')}
                  className="px-4 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-bold text-xs border border-amber-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs backdrop-blur-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{t('hero.aiForecasts', 'AI Mandi Forecasts')}</span>
                </motion.button>
              </motion.div>

              {/* Verification Badges with Staggered Fade */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1C4E3A]/80 text-xs text-emerald-200/90 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.52 }}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#52B788] shrink-0" />
                  <span className="font-medium text-white text-[11px] sm:text-xs">{t('banner.escrow', '100% Escrow Secured')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-[#52B788] shrink-0" />
                  <span className="font-medium text-white text-[11px] sm:text-xs">{t('hero.statEscrow', 'NABL Quality Assayed')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#52B788] shrink-0" />
                  <span className="font-medium text-white text-[11px] sm:text-xs">{t('hero.statEscrowSub', 'Instant T+0 Payout')}</span>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Middle Section: How Khet Link Connects Farmers Directly with Staggered Animations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {[
            {
              step: 'Step 01',
              title: t('hero.step1Title', 'Farmgate Listing'),
              desc: t('hero.step1Desc', 'Farmer or FPO uploads harvest lot with moisture % and photo. Free assaying support.'),
              icon: Sprout,
              iconColor: 'text-[#74C69D]'
            },
            {
              step: 'Step 02',
              title: t('hero.step2Title', 'AI Price Guidance'),
              desc: t('hero.step2Desc', 'AI predicts whether to sell now or store in warehouse for upcoming festival rate surges.'),
              icon: TrendingUp,
              iconColor: 'text-amber-400'
            },
            {
              step: 'Step 03',
              title: t('hero.step3Title', 'Direct Bulk Bidding'),
              desc: t('hero.step3Desc', 'Wholesalers & food brands place binding purchase orders with upfront escrow deposit.'),
              icon: Store,
              iconColor: 'text-[#74C69D]'
            },
            {
              step: 'Step 04',
              title: t('hero.step4Title', 'T+0 Bank Settlement'),
              desc: t('hero.step4Desc', 'Produce is weighed at farmgate; funds release directly into Kisan Aadhaar bank account.'),
              icon: ShieldCheck,
              iconColor: 'text-emerald-400'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#144231] to-[#1D5842] text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="text-[11px] font-bold text-emerald-800/60 uppercase tracking-widest">{item.step}</div>
              <h3 className="text-base font-bold text-neutral-900 font-['Outfit'] mt-0.5 tracking-tight">{item.title}</h3>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed font-normal">
                {item.desc}
              </p>
            </motion.div>
          ))}

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

          {/* 4-Column Full-Width Crop Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCrops.map((crop) => (
              <div 
                key={crop.id}
                className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group hover:-translate-y-1 duration-200"
              >
                <div 
                  onClick={() => onSelectCrop && onSelectCrop(crop)}
                  className="relative h-44 overflow-hidden bg-neutral-100 cursor-pointer"
                >
                  <img 
                    src={crop.imageUrl} 
                    alt={crop.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {crop.isOrganic && (
                      <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        🌿 {t('common.organic', 'Organic')}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-[#0B2E21]/90 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {crop.grade}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {t('market.moisture', 'Moisture')}: {crop.moisturePercent}%
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
                      {crop.category} • {crop.locationState}
                    </div>
                    <h4 
                      onClick={() => onSelectCrop && onSelectCrop(crop)}
                      className="font-bold text-sm text-neutral-900 hover:text-emerald-800 cursor-pointer truncate mt-0.5"
                    >
                      {crop.title}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate">
                      By {crop.farmerName} ({crop.fpoName})
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400">{t('common.farmgateRate', 'Farmgate Rate')}</div>
                      <div className="text-base font-extrabold text-neutral-900 font-mono">
                        ₹{crop.pricePerKg} <span className="text-xs font-normal text-neutral-500">/{t('market.perKg', 'kg')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400">{t('common.bulkRate', 'Bulk Qtl Rate')}</div>
                      <div className="text-xs font-bold text-emerald-700 font-mono">
                        ₹{crop.pricePerQuintal}/{t('market.perQuintal', 'Qtl')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onSelectCrop && onSelectCrop(crop)}
                      className="py-2 px-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                    >
                      {t('common.assaySheet', 'Assay Sheet')}
                    </button>
                    <button
                      onClick={() => onAddToCart && onAddToCart(crop, 1, 'quintal')}
                      className="py-2 px-2 text-xs font-bold rounded-xl bg-[#144231] hover:bg-[#1C5B44] text-white transition shadow-xs cursor-pointer"
                    >
                      {t('common.addBatch', '+ Add Batch')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom link to view full marketplace */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-500 font-medium">
              Showing {filteredCrops.length} of {MOCK_CROPS.length} direct farmgate lots
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
                Direct Farmgate Ecosystem
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-3xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Relatable Farmer Image Banner */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900">
              <img 
                src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80" 
                alt="Indian Farmers in agricultural fields harvesting high grade produce" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E21] via-[#0B2E21]/50 to-transparent" />
              
              {/* Badges Over Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#144231]/90 backdrop-blur-md border border-[#52B788]/60 text-emerald-200 text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  Kisan & FPO Collective
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-400/95 text-[#0B2E21] text-[11px] font-black tracking-wider uppercase shadow-md">
                  {t('hero.statCommission', '0% Dalali Cut')}
                </span>
              </div>

              {/* Title & Subtitle Over Banner */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2 drop-shadow-sm">
                  {t('hero.forFarmersTitle', 'For Farmers & FPOs')}
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs text-emerald-100/90 drop-shadow-xs line-clamp-1">
                  {t('hero.forFarmersSub', 'Connect directly with 4,500+ verified corporate & hostel mess buyers')}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  Transform from local price-takers to national market-makers. Aggregate produce with neighboring farmers, receive digital NABL assay certificates, and get <strong>guaranteed T+0 bank payouts</strong> via Aadhaar DBT.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 font-medium pt-1">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant SMS OTP & Aadhaar DBT</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free digital moisture testing</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>FPO truckload pooling</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Escrow safe payment</span>
                  </div>
                </div>
              </div>

              {/* Login / Registration Button for Farmer */}
              <div className="pt-3 space-y-2.5 border-t border-neutral-100">
                <motion.button
                  id="farmer-signup-action-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleAuth('farmer')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#144231] via-[#1B5641] to-[#256E54] hover:from-[#0F3526] hover:to-[#1E5A44] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2 border border-[#40916C]/40"
                >
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span>{t('hero.farmerSignupBtn', 'Sign Up as Farmer or FPO')}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </motion.button>

                <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                  <span>Returning farmer?</span>
                  <button
                    onClick={() => handleAuth('farmer')}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Quick Login with OTP</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: For Bulk Buyers & Institutional */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-3xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Relatable Bulk User / Mess Buyer Image Banner */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" 
                alt="Bulk buyer and hostel mess procurement user inspecting fresh food produce" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17382B] via-[#17382B]/50 to-transparent" />
              
              {/* Badges Over Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1B4332]/90 backdrop-blur-md border border-[#74C69D]/60 text-emerald-200 text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                  Hostel Mess, Brands & Retail
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-400/95 text-[#0B2E21] text-[11px] font-black tracking-wider uppercase shadow-md">
                  Save 14% to 18%
                </span>
              </div>

              {/* Title & Subtitle Over Banner */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2 drop-shadow-sm">
                  {t('hero.forBuyersTitle', 'For Bulk Buyers & Hostel Mess')}
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs text-emerald-100/90 drop-shadow-xs line-clamp-1">
                  {t('hero.forBuyersSub', 'Direct grain, pulse & produce procurement with APMC cess exemption')}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  Procure directly from farmgates with <strong>unified GST e-Way bills</strong>, standardized moisture assay certificates, and end-to-end refrigerated transport. Ideal for <strong>college mess, university hostels, hotel chains, and millers</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 font-medium pt-1">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hostel & Mess monthly grain contracts</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero APMC cess & direct tax invoices</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>NABL certified moisture & foreign matter</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>RBI Escrow: pay only on verified delivery</span>
                  </div>
                </div>
              </div>

              {/* Login / Registration Button for Buyer / Hostel Mess */}
              <div className="pt-3 space-y-2.5 border-t border-neutral-100">
                <motion.button
                  id="buyer-signup-action-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleAuth('buyer')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#205A42] via-[#2A7556] to-[#388E6B] hover:from-[#1A4B37] hover:to-[#24674C] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2 border border-[#52B788]/40"
                >
                  <Building2 className="w-4 h-4 text-emerald-200" />
                  <span>{t('hero.buyerSignupBtn', 'Sign Up as Bulk Buyer / Hostel Mess')}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                </motion.button>

                <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                  <span>Hostel mess or registered buyer?</span>
                  <button
                    onClick={() => handleAuth('buyer')}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Login with GSTIN / Mobile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};
