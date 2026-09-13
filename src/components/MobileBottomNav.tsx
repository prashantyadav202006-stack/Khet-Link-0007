import React from 'react';
import { 
  Sprout, 
  Store, 
  Bot, 
  Package, 
  ShoppingCart, 
  User
} from 'lucide-react';
import { AppView, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  cartCount: number;
  onOpenCart: () => void;
  onToggleAIAssistant: () => void;
  userRole: UserRole;
  onOpenAuth: (role: 'farmer' | 'buyer') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onToggleAIAssistant,
  userRole,
  onOpenAuth
}) => {
  const { t } = useLanguage();

  const handleAccountClick = () => {
    if (userRole === 'farmer') {
      onNavigate('farmer-dashboard');
    } else if (userRole === 'buyer') {
      onNavigate('buyer-dashboard');
    } else {
      onOpenAuth('farmer');
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#061F16]/95 backdrop-blur-md border-t border-[#1B523D] px-2 py-1.5 shadow-[0_-8px_20px_rgba(0,0,0,0.35)] select-none"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 items-center text-center">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'home' || currentView === 'landing'
              ? 'text-white'
              : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${currentView === 'home' ? 'bg-[#1E523D] text-[#52B788]' : ''}`}>
            <Sprout className="w-5 h-5" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${currentView === 'home' ? 'font-bold text-[#52B788]' : ''}`}>
            {t('nav.home', 'होम')}
          </span>
        </button>

        {/* 2. Marketplace */}
        <button
          type="button"
          onClick={() => onNavigate('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'marketplace'
              ? 'text-white'
              : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${currentView === 'marketplace' ? 'bg-[#1E523D] text-[#52B788]' : ''}`}>
            <Store className="w-5 h-5" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${currentView === 'marketplace' ? 'font-bold text-[#52B788]' : ''}`}>
            {t('nav.marketplace', 'मंडी')}
          </span>
        </button>

        {/* 3. KhetAI Assistant (Center Highlighted Icon) */}
        <button
          type="button"
          onClick={onToggleAIAssistant}
          className="flex flex-col items-center justify-center py-1 px-1 cursor-pointer group"
          title="KhetAI Sahayak"
        >
          <div className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-[#1B523D] via-[#2D6A4F] to-[#52B788] border-2 border-[#0B2E21] shadow-lg flex items-center justify-center text-white group-active:scale-95 transition-transform">
            <Bot className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold text-amber-300">
            खेतAI
          </span>
        </button>

        {/* 4. Orders & Escrow */}
        <button
          type="button"
          onClick={() => onNavigate('order-tracking')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'order-tracking' || currentView === 'orders'
              ? 'text-white'
              : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${currentView === 'order-tracking' ? 'bg-[#1E523D] text-[#52B788]' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${currentView === 'order-tracking' ? 'font-bold text-[#52B788]' : ''}`}>
            {t('nav.orders', 'ऑर्डर')}
          </span>
        </button>

        {/* 5. Account / Cart Hybrid */}
        {cartCount > 0 ? (
          <button
            type="button"
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative"
          >
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-3.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-neutral-900 font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-bold text-amber-300">
              कार्ट ({cartCount})
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
              currentView === 'farmer-dashboard' || currentView === 'buyer-dashboard'
                ? 'text-white'
                : 'text-emerald-200/60 hover:text-emerald-100'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${currentView === 'farmer-dashboard' || currentView === 'buyer-dashboard' ? 'bg-[#1E523D] text-[#52B788]' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${currentView === 'farmer-dashboard' || currentView === 'buyer-dashboard' ? 'font-bold text-[#52B788]' : ''}`}>
              {userRole === 'guest' ? t('nav.signIn', 'लॉगिन') : t('nav.profile', 'प्रोफ़ाइल')}
            </span>
          </button>
        )}

      </div>
    </nav>
  );
};
