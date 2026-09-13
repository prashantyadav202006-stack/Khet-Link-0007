import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  ShoppingCart, 
  Bell, 
  User, 
  Menu, 
  X, 
  TrendingUp, 
  Store, 
  Truck, 
  PhoneCall, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Globe,
  Smartphone
} from 'lucide-react';
import { AppView, UserRole, FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentView: AppView;
  setCurrentView?: (view: AppView) => void;
  onNavigate?: (view: AppView) => void;
  userRole: UserRole;
  setUserRole?: (role: UserRole) => void;
  onSwitchRole?: (role: UserRole) => void;
  cartCount: number;
  unreadNotificationsCount: number;
  openCart?: () => void;
  onOpenCart?: () => void;
  openNotifications?: () => void;
  onOpenNotifications?: () => void;
  openAuthModal?: (role: 'farmer' | 'buyer') => void;
  onOpenAuthModal?: (role: 'farmer' | 'buyer') => void;
  activeFarmerProfile?: FarmerProfile;
  activeBuyerName?: string;
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onNavigate,
  userRole,
  setUserRole,
  onSwitchRole,
  cartCount,
  unreadNotificationsCount,
  openCart,
  onOpenCart,
  openNotifications,
  onOpenNotifications,
  openAuthModal,
  onOpenAuthModal,
  activeFarmerProfile = {
    id: 'f1',
    name: 'Sardar Gurpreet Singh',
    phone: '+91 98721 44521',
    kisanCreditCardNo: 'KCC-PB-2024-8991',
    village: 'Bhagta Bhai Ka',
    district: 'Bathinda',
    state: 'Punjab',
    fpoName: 'Malwa Organic Farmers Producer Co.',
    fpoRegNo: 'FPO-PB-BAT-0412',
    landAcreage: 18.5,
    primaryCrops: ['Sharbati Wheat', 'Basmati 1121 Paddy', 'Mustard Seed'],
    bankAccountVerified: true,
    soilHealthCardVerified: true,
    organicCertified: true,
    rating: 4.9,
    totalBatchesSold: 34,
    certifications: ['NPOP Certified Organic', 'Jaivik Bharat']
  },
  activeBuyerName = 'Aditi Organic Foods Pvt Ltd',
  selectedLanguage: propSelectedLang,
  onSelectLanguage
}) => {
  const { language, setLanguage, currentLangOption, availableLanguages, t, uiScale, setUiScale } = useLanguage();
  const { isInstalled, promptInstall } = usePWAInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close open dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleNavClick = (view: AppView) => {
    if (onNavigate) onNavigate(view);
    else if (setCurrentView) setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleAuthModal = (role: 'farmer' | 'buyer') => {
    if (onOpenAuthModal) onOpenAuthModal(role);
    else if (openAuthModal) openAuthModal(role);
  };

  const handleCartClick = () => {
    if (onOpenCart) onOpenCart();
    else if (openCart) openCart();
  };

  const handleNotificationsClick = () => {
    if (onOpenNotifications) onOpenNotifications();
    else if (openNotifications) openNotifications();
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (onSwitchRole) onSwitchRole(newRole);
    else if (setUserRole) setUserRole(newRole);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B2E21] text-white border-b border-[#1E523D] shadow-md">
      {/* Official National Agriculture Portal Top Strip (LandSync Inspired) */}
      <div className="bg-[#0B192C] text-xs py-1.5 px-3 sm:px-6 border-b-2 border-[#FF9933] select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Indian National & Ministry Insignia */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              {/* Indian Tricolor Accent Indicator */}
              <div className="w-1.5 h-4 rounded-xs overflow-hidden flex flex-col shrink-0 shadow-xs">
                <div className="h-1/3 bg-[#FF9933]" />
                <div className="h-1/3 bg-white" />
                <div className="h-1/3 bg-[#138808]" />
              </div>
              <span className="font-bold text-slate-100 tracking-wide text-[11px]">
                भारत सरकार <span className="text-slate-400 font-normal">| Govt. of India</span>
              </span>
            </div>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              कृषि एवं किसान कल्याण मंत्रालय (Ministry of Agriculture & Farmers Welfare)
            </span>
            <span className="hidden lg:inline text-slate-500">•</span>
            <span className="hidden lg:inline text-amber-300/90 font-mono text-[10px] uppercase tracking-wider bg-amber-950/60 px-2 py-0.2 rounded border border-amber-500/30">
              e-NAM / ONDC Agri Node
            </span>
          </div>

          {/* Right: Accessibility Controls & Kisan Helpline */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 text-xs">
            {/* Screen Content & Font Scale Adjuster */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold">{t('banner.fontSize', 'Size')}:</span>
              <button
                type="button"
                onClick={() => setUiScale('compact')}
                title="Compact View (90%)"
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition cursor-pointer ${
                  uiScale === 'compact' ? 'bg-[#FF9933] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setUiScale('normal')}
                title="Normal View (100%)"
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition cursor-pointer ${
                  uiScale === 'normal' ? 'bg-[#FF9933] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setUiScale('large')}
                title="Large View (112%)"
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition cursor-pointer ${
                  uiScale === 'large' ? 'bg-[#FF9933] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setUiScale('xlarge')}
                title="Field / Big View (125%)"
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition cursor-pointer ${
                  uiScale === 'xlarge' ? 'bg-[#FF9933] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t('banner.escrow', '100% Escrow Secured')}
            </span>

            <a href="tel:18001801551" className="hover:text-amber-300 transition flex items-center gap-1 font-medium text-[11px]">
              <PhoneCall className="w-3 h-3 text-[#FF9933]" />
              <span className="hidden xs:inline text-slate-400">{t('banner.helpline', 'Kisan Helpline:')}</span>{' '}
              <span className="text-[#FF9933] font-mono font-bold tracking-tight">1800-180-1551</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-17">
          
          {/* Left Container: Brand Logo + Primary Navigation Links Left-Aligned */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Brand Logo */}
            <div 
              id="brand-logo"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-md bg-[#0F3829] flex items-center justify-center shadow-md border border-[#2B7354] group-hover:border-[#52B788] transition-colors duration-200">
                <Sprout className="w-5.5 h-5.5 text-[#52B788]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Outfit']">
                    Khet<span className="text-[#52B788]">Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest px-1.5 py-0.2 rounded-sm bg-[#E65A00] text-white shadow-xs">
                    BHARAT
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 leading-tight tracking-wide font-medium">
                  {t('nav.tagline', 'National Direct Mandi Grid • 0% Dalali')}
                </p>
              </div>
            </div>

            {/* Visual Divider between Brand and Navigation Links */}
            <div className="hidden lg:block h-6 w-px bg-emerald-800/60" />

            {/* Left Navigation Links with LandSync-style crisp tab highlights */}
            <nav className="hidden lg:flex items-center gap-2">
              <button
                id="nav-marketplace-btn"
                onClick={() => handleNavClick('marketplace')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition cursor-pointer border-b-2 ${
                  currentView === 'marketplace' 
                    ? 'border-[#FF9933] text-white font-semibold bg-[#144231]/60 rounded-t-sm' 
                    : 'border-transparent text-emerald-100/80 hover:text-white hover:bg-[#154432]/40 rounded-sm'
                }`}
              >
                <Store className="w-4 h-4 text-[#74C69D]" />
                {t('nav.marketplace', 'Marketplace')}
              </button>

              <button
                id="nav-ai-btn"
                onClick={() => handleNavClick('ai-predictions')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition cursor-pointer border-b-2 ${
                  currentView === 'ai-predictions' 
                    ? 'border-[#FF9933] text-white font-semibold bg-[#144231]/60 rounded-t-sm' 
                    : 'border-transparent text-emerald-100/80 hover:text-white hover:bg-[#154432]/40 rounded-sm'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#52B788]" />
                <span>{t('nav.aiPredictions', 'AI Predictions')}</span>
                <span className="text-[9px] font-mono font-bold bg-[#E65A00]/30 text-amber-200 border border-[#E65A00]/50 px-1.5 py-0.2 rounded-sm shadow-xs">
                  {t('nav.smartBadge', 'LIVE')}
                </span>
              </button>

              <button
                id="nav-orders-btn"
                onClick={() => handleNavClick('order-tracking')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition cursor-pointer border-b-2 ${
                  currentView === 'order-tracking' || currentView === 'orders'
                    ? 'border-[#FF9933] text-white font-semibold bg-[#144231]/60 rounded-t-sm' 
                    : 'border-transparent text-emerald-100/80 hover:text-white hover:bg-[#154432]/40 rounded-sm'
                }`}
              >
                <Truck className="w-4 h-4 text-[#74C69D]" />
                {t('nav.orders', 'Orders & Escrow')}
              </button>

              <button
                id="nav-fpo-btn"
                onClick={() => handleNavClick('fpo-collective')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition cursor-pointer border-b-2 ${
                  currentView === 'fpo-collective' 
                    ? 'border-[#FF9933] text-white font-semibold bg-[#144231]/60 rounded-t-sm' 
                    : 'border-transparent text-emerald-100/80 hover:text-white hover:bg-[#154432]/40 rounded-sm'
                }`}
              >
                <Sprout className="w-4 h-4 text-[#74C69D]" />
                {t('nav.fpoCollective', 'FPO Collective')}
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown with Click-Outside Ref */}
            <div ref={langDropdownRef} className="relative hidden md:block">
              <button
                id="lang-dropdown-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-sm bg-[#144231] text-emerald-100 hover:bg-[#1A523D] border border-[#256149] transition cursor-pointer"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#52B788]" />
                <span>{currentLangOption.nativeLabel}</span>
                <ChevronDown className="w-3 h-3 text-emerald-300/70" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0B2E21] border border-[#256149] rounded-md shadow-2xl py-1 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-emerald-300/70 border-b border-[#1E523D] tracking-wider">
                    Language / भाषा
                  </div>
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        if (onSelectLanguage) onSelectLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#18533B] flex items-center justify-between cursor-pointer transition ${
                        language === l.code ? 'text-[#52B788] font-bold bg-[#144231]' : 'text-emerald-100'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{l.nativeLabel}</span>
                        <span className="text-[10px] text-emerald-300/60">{l.label}</span>
                      </div>
                      {language === l.code && <CheckCircle2 className="w-4 h-4 text-[#52B788]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              id="notifications-bell-btn"
              onClick={handleNotificationsClick}
              className="relative p-2 rounded-sm text-emerald-100 hover:text-white hover:bg-[#174B36] border border-transparent hover:border-[#256149] transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E65A00] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="cart-drawer-toggle-btn"
              onClick={handleCartClick}
              className="relative p-2 rounded-sm text-emerald-100 hover:text-white hover:bg-[#174B36] border border-transparent hover:border-[#256149] transition flex items-center gap-1 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#95D5B2]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-[#E65A00] text-white text-[11px] font-mono font-extrabold rounded-full flex items-center justify-center border-2 border-[#0B2E21] shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Portal Switcher with Click-Outside Ref */}
            <div ref={userDropdownRef} className="relative">
              {userRole === 'guest' ? (
                <div className="flex items-center gap-2">
                  <button
                    id="login-farmer-btn"
                    onClick={() => handleAuthModal('farmer')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#174B36] hover:bg-[#206146] text-emerald-100 border border-[#2B7354] transition shadow-xs cursor-pointer"
                  >
                    <Sprout className="w-3.5 h-3.5 text-[#74C69D]" />
                    {t('nav.farmerSignIn', 'Farmer Sign In')}
                  </button>
                  <button
                    id="login-buyer-btn"
                    onClick={() => handleAuthModal('buyer')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold bg-[#1B3F75] hover:bg-[#14315C] text-white shadow-sm border border-blue-400/40 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-blue-200" />
                    {t('nav.buyerLogin', 'Buyer Login')}
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    id="user-profile-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-sm bg-[#144231] hover:bg-[#1A523D] border border-[#256149] transition text-left shadow-xs cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center font-bold text-xs text-white shadow-inner">
                      {userRole === 'farmer' ? '🌾' : '🏢'}
                    </div>
                    <div className="hidden sm:block text-xs">
                      <div className="font-semibold text-white leading-tight truncate max-w-[110px]">
                        {userRole === 'farmer' ? activeFarmerProfile.name : activeBuyerName}
                      </div>
                      <div className="text-[10px] text-[#95D5B2] uppercase font-bold tracking-wider">
                        {userRole === 'farmer' ? t('nav.verifiedFarmer', 'Verified Farmer') : t('nav.wholesaleBuyer', 'Wholesale Buyer')}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-emerald-300/70" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0E3527] border border-[#256149] rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-[#1E523D] mb-1">
                        <p className="text-xs text-emerald-300/80">{t('nav.signedInAs', 'Signed in as')}</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {userRole === 'farmer' ? activeFarmerProfile.name : activeBuyerName}
                        </p>
                        <p className="text-[11px] text-[#52B788] font-medium">
                          {userRole === 'farmer' ? activeFarmerProfile.fpoName : 'GSTIN: 07AAACH2819K1Z4'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          handleRoleSwitch(userRole === 'farmer' ? 'buyer' : 'farmer');
                          handleNavClick(userRole === 'farmer' ? 'buyer-dashboard' : 'farmer-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#18533B] text-emerald-100 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>{t('nav.switchPortal', 'Switch to')} {userRole === 'farmer' ? t('nav.buyerView', 'Buyer View') : t('nav.farmerView', 'Farmer View')}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#1E523D] text-[#95D5B2] rounded font-bold">
                          {userRole === 'farmer' ? t('nav.buyer', 'Buyer') : t('nav.farmer', 'Farmer')}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick(userRole === 'farmer' ? 'farmer-dashboard' : 'buyer-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#18533B] text-emerald-100 transition cursor-pointer"
                      >
                        {t('nav.openDashboard', 'Open Full Dashboard')}
                      </button>

                      <div className="my-1 border-t border-[#1E523D]" />

                      <button
                        onClick={() => {
                          handleRoleSwitch('guest');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('nav.signOut', 'Sign Out')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-[#174B36] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with Backdrop for Click-Outside-to-Close */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click closes drawer */}
          <div 
            className="flex-1" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-label="Close navigation menu"
          />

          <div 
            className="bg-[#0A291E] border-t border-[#1E523D] px-4 pt-3 pb-6 space-y-2 max-h-[85vh] overflow-y-auto rounded-t-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E523D]">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{t('nav.mobileMenuTitle', 'KhetLink Bharat Menu')}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile PWA Install Button */}
            {!isInstalled && (
              <div className="py-2 border-b border-[#1E523D]">
                <button
                  type="button"
                  onClick={() => {
                    promptInstall();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📲 Install App</span>
                </button>
              </div>
            )}

            {/* Mobile Language Selector */}
            <div className="py-2 border-b border-[#1E523D]">
              <span className="text-[11px] font-semibold text-emerald-200/80 mb-1.5 block">{t('nav.languageLabel', 'Language / भाषा:')}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      if (onSelectLanguage) onSelectLanguage(l.code);
                    }}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border text-center transition cursor-pointer ${
                      language === l.code 
                        ? 'bg-[#52B788] text-[#0B2E21] border-[#52B788] font-bold' 
                        : 'bg-[#144231] text-emerald-100 border-[#1E523D]'
                    }`}
                  >
                    {l.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Screen Scale Selector */}
            <div className="py-2 border-b border-[#1E523D] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-200/80">{t('nav.contentSize', 'Content & Button Size:')}</span>
              <div className="flex gap-1 bg-[#144231] p-1 rounded-lg">
                <button
                  onClick={() => setUiScale('compact')}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${uiScale === 'compact' ? 'bg-[#52B788] text-[#0B2E21]' : 'text-emerald-200'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setUiScale('normal')}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${uiScale === 'normal' ? 'bg-[#52B788] text-[#0B2E21]' : 'text-emerald-200'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setUiScale('large')}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${uiScale === 'large' ? 'bg-[#52B788] text-[#0B2E21]' : 'text-emerald-200'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setUiScale('xlarge')}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${uiScale === 'xlarge' ? 'bg-[#52B788] text-[#0B2E21]' : 'text-emerald-200'}`}
                >
                  A++
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                currentView === 'home' || currentView === 'landing' ? 'bg-[#1E523D] text-white font-semibold' : 'text-emerald-100 hover:bg-[#144231]'
              }`}
            >
              {t('nav.home', 'Home Overview')}
            </button>
            <button
              onClick={() => handleNavClick('marketplace')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                currentView === 'marketplace' ? 'bg-[#1E523D] text-white font-semibold' : 'text-emerald-100 hover:bg-[#144231]'
              }`}
            >
              {t('nav.marketplace', 'Marketplace')}
            </button>
            <button
              onClick={() => handleNavClick('ai-predictions')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                currentView === 'ai-predictions' ? 'bg-[#1E523D] text-white font-semibold' : 'text-emerald-100 hover:bg-[#144231]'
              }`}
            >
              {t('nav.aiPredictions', 'AI Predictions')}
            </button>
            <button
              onClick={() => handleNavClick('order-tracking')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                currentView === 'order-tracking' || currentView === 'orders' ? 'bg-[#1E523D] text-white font-semibold' : 'text-emerald-100 hover:bg-[#144231]'
              }`}
            >
              {t('nav.orders', 'Orders & Escrow Tracking')}
            </button>
            <button
              onClick={() => handleNavClick('fpo-collective')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                currentView === 'fpo-collective' ? 'bg-[#1E523D] text-white font-semibold' : 'text-emerald-100 hover:bg-[#144231]'
              }`}
            >
              {t('nav.fpoCollective', 'FPO Collective')}
            </button>

            <div className="pt-3 border-t border-[#1E523D] flex items-center justify-between">
              <span className="text-xs text-emerald-200">{t('nav.currentMode', 'Current Mode:')}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleRoleSwitch('farmer');
                    handleNavClick('farmer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    userRole === 'farmer' ? 'bg-[#52B788] text-[#0B2E21] font-bold' : 'bg-[#144231] text-emerald-100'
                  }`}
                >
                  {t('nav.farmer', 'Farmer')}
                </button>
                <button
                  onClick={() => {
                    handleRoleSwitch('buyer');
                    handleNavClick('buyer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    userRole === 'buyer' ? 'bg-[#52B788] text-[#0B2E21] font-bold' : 'bg-[#144231] text-emerald-100'
                  }`}
                >
                  {t('nav.buyer', 'Buyer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
