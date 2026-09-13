import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { CropDetailModal } from './components/CropDetailModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { CartDrawer } from './components/CartDrawer';
import { NotificationsPopover } from './components/NotificationsPopover';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DemoWalkthrough } from './components/DemoWalkthrough';
import {
  PageLoadingSkeleton,
  MarketplaceSkeleton,
  DashboardSkeleton,
  PredictionsSkeleton
} from './components/Skeletons';
import { subscribeToAuthState } from './firebase/authService';
import { fetchCropsFromDb, fetchFarmersFromDb, fetchOrdersFromDb, saveCropToDb, saveOrderToDb, subscribeToOrders } from './firebase/dbService';
import { ErrorBoundary } from './components/ErrorBoundary';

// Code-split heavy page components for faster initial load
const Marketplace = lazy(() => import('./components/Marketplace').then(m => ({ default: m.Marketplace })));
const FarmerDashboard = lazy(() => import('./components/FarmerDashboard').then(m => ({ default: m.FarmerDashboard })));
const BuyerDashboard = lazy(() => import('./components/BuyerDashboard').then(m => ({ default: m.BuyerDashboard })));
const AIPredictions = lazy(() => import('./components/AIPredictions').then(m => ({ default: m.AIPredictions })));
const OrderManagement = lazy(() => import('./components/OrderManagement').then(m => ({ default: m.OrderManagement })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then(m => ({ default: m.AIAssistant })));

import { CropProduct, FarmerProfile, CartItem, Order, BulkRFQ, AppNotification, UserRole, AppView } from './types';
import { getCropImageUrl } from './utils/cropImages';

import { 
  MOCK_RFQS, 
  MOCK_ORDERS,
  MANDI_TICKER 
} from './data/mockData';

import { 
  Sprout, 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  TrendingUp, 
  Building2, 
  Heart, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Truck,
  Award,
  Smartphone,
  Download
} from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { isInstalled, promptInstall } = usePWAInstall();

  // Navigation & Role State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [userRole, setUserRole] = useState<UserRole>('guest');

  // Default fallback farmer profile template for new users
  const DEFAULT_FARMER: FarmerProfile = {
    id: 'farmer-registered',
    name: 'Kisan Producer',
    phone: '+91 98765 43210',
    fpoName: 'Direct Farmgate Producer',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Raikot Kalan',
    landAcres: 0,
    cropsGrown: [],
    certifications: ['Direct Farmgate Producer'],
    rating: 5.0,
    reviewsCount: 0,
    completedOrders: 0,
    bankAccountVerified: false,
    soilHealthCardVerified: false,
    bio: 'Register your farmer profile to list fresh harvests and sell directly to verified bulk buyers.'
  };

  // Application Data States (Clean, live database connected)
  const [crops, setCrops] = useState<CropProduct[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [rfqs, setRfqs] = useState<BulkRFQ[]>(MOCK_RFQS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Cart State (Empty initially)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Active Profiles
  const [activeFarmer, setActiveFarmer] = useState<FarmerProfile>(DEFAULT_FARMER);
  const [activeBuyerName, setActiveBuyerName] = useState<string>('Procurement Buyer');

  // Modal / Drawer Overlays
  const [selectedCropForDetail, setSelectedCropForDetail] = useState<CropProduct | null>(null);
  const [selectedFarmerForModal, setSelectedFarmerForModal] = useState<FarmerProfile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<'farmer' | 'buyer'>('farmer');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Sync with Firebase Auth & Cloud Firestore
  useEffect(() => {
    // Track loading state
    let loadCount = 0;
    const checkDone = () => { loadCount++; if (loadCount >= 3) setIsDataLoading(false); };

    // 1. Fetch live crops from Firestore
    fetchCropsFromDb().then((dbCrops) => {
      if (dbCrops && dbCrops.length > 0) {
        setCrops(dbCrops);
      }
    }).finally(checkDone);

    // 2. Fetch live farmers from Firestore
    fetchFarmersFromDb().then((dbFarmers) => {
      if (dbFarmers && dbFarmers.length > 0) {
        setFarmers(dbFarmers);
        setActiveFarmer(dbFarmers[0]);
      }
    }).finally(checkDone);

    // 3. Fetch live orders from Firestore (merge with demo seed data)
    fetchOrdersFromDb().then((dbOrders) => {
      if (dbOrders && dbOrders.length > 0) {
        // Merge: Firestore orders take priority, append demo orders that aren't duplicates
        const dbOrderIds = new Set(dbOrders.map((o) => o.id));
        const uniqueDemoOrders = MOCK_ORDERS.filter((o) => !dbOrderIds.has(o.id));
        setOrders([...dbOrders, ...uniqueDemoOrders]);
      }
    }).finally(checkDone);

    // 4. Live real-time Firestore order updates
    const unsubOrders = subscribeToOrders((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        const liveOrderIds = new Set(liveOrders.map((o) => o.id));
        setOrders((prev) => {
          const localOnly = prev.filter((o) => !liveOrderIds.has(o.id));
          return [...liveOrders, ...localOnly];
        });
      }
    });

    // 5. Listen to Firebase auth changes to restore user session
    const unsubscribe = subscribeToAuthState((user, profile) => {
      if (user && profile) {
        setUserRole(profile.role);
        if (profile.role === 'farmer') {
          if (profile.farmerProfile) {
            setActiveFarmer(profile.farmerProfile);
          }
        } else if (profile.role === 'buyer') {
          setActiveBuyerName(profile.buyerOrgName || profile.name || 'Procurement Buyer');
        }
      }
    });

    return () => {
      unsubscribe();
      unsubOrders();
    };
  }, []);

  // -------------------------------------------------------------
  // Cart Actions
  // -------------------------------------------------------------
  const handleAddToCart = (crop: CropProduct, quantity: number, unit: 'kg' | 'quintal') => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.crop.id === crop.id && item.unit === unit);
      if (existing) {
        return prev.map((item) =>
          item.crop.id === crop.id && item.unit === unit
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { crop, quantity, unit }];
    });

    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Produce Added to Procurement Cart',
      message: `${quantity} ${unit} of ${crop.title} added to your procurement cart.`,
      time: 'Just now',
      type: 'system',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleBuyNow = (crop: CropProduct, quantity: number, unit: 'kg' | 'quintal') => {
    handleAddToCart(crop, quantity, unit);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cropId: string, quantity: number, unit: 'kg' | 'quintal') => {
    if (quantity <= 0) {
      handleRemoveCartItem(cropId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.crop.id === cropId ? { ...item, quantity, unit } : item
      )
    );
  };

  const handleRemoveCartItem = (cropId: string) => {
    setCartItems((prev) => prev.filter((item) => item.crop.id !== cropId));
  };

  const handleCheckoutComplete = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToDb(newOrder);
    setCartItems([]);
    setCurrentView('order-tracking');

    const orderNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Escrow Funded for Order #${newOrder.orderNumber}`,
      message: `₹${newOrder.totalAmount.toLocaleString('en-IN')} deposited in Escrow Guarantee. Direct farmgate pickup scheduled.`,
      time: 'Just now',
      type: 'escrow',
      read: false,
      badge: 'Escrow Locked'
    };
    setNotifications((prev) => [orderNotif, ...prev]);
  };

  // -------------------------------------------------------------
  // Farmer Actions
  // -------------------------------------------------------------
  const handleAddCrop = (newCropData: Partial<CropProduct>) => {
    const newCrop: CropProduct = {
      id: `crop-${Date.now()}`,
      title: newCropData.title || 'Fresh Harvest Batch',
      category: newCropData.category || 'Grains',
      variety: newCropData.variety || 'Certified High-Yield',
      pricePerQuintal: newCropData.pricePerQuintal || 3000,
      pricePerKg: newCropData.pricePerKg || 30,
      mandiMspPrice: newCropData.mandiMspPrice || 2500,
      quantityAvailableQuintals: newCropData.quantityAvailableQuintals || 50,
      grade: newCropData.grade || 'Grade A Mandi',
      isOrganic: newCropData.isOrganic || false,
      moisturePercent: newCropData.moisturePercent || 11.0,
      farmerId: activeFarmer.id,
      farmerName: activeFarmer.name,
      fpoName: activeFarmer.fpoName,
      locationState: activeFarmer.state,
      locationDistrict: activeFarmer.district,
      minOrderKg: 50,
      harvestDate: 'Current Season 2026',
      imageUrl: newCropData.imageUrl || getCropImageUrl(newCropData.title, newCropData.variety, newCropData.category),
      description: newCropData.description || 'Assayed farmgate produce ready for dispatch.',
      shelfLifeDays: 365,
      packagingType: '50kg Jute Bags',
      readyForDispatch: true,
      rating: 5.0,
      reviewCount: 1,
    };

    setCrops((prev) => [newCrop, ...prev]);
    saveCropToDb(newCrop);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Harvest Batch Published',
      message: `Your listing for "${newCrop.title}" is live to 4,500+ institutional buyers.`,
      time: 'Just now',
      type: 'system',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleUpdateOrderStatus = (
    orderId: string, 
    deliveryStatus: Order['deliveryStatus'], 
    escrowStatus: Order['escrowStatus']
  ) => {
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;

        const statusToIndex: Record<string, number> = {
          'Order Placed': 0,
          'FPO Accepted': 1,
          'Sample Collected': 2,
          'Quality Verified': 3,
          'Dispatched': 4,
          'In Transit': 5,
          'Delivered & Verified': 6,
          'Escrow Released': 7
        };

        const targetIdx = statusToIndex[deliveryStatus] ?? -1;
        let updatedSteps = o.trackingSteps;

        if (targetIdx !== -1 && o.trackingSteps.length > 0) {
          updatedSteps = o.trackingSteps.map((step, idx) => {
            if (idx < targetIdx) {
              return { ...step, completed: true, current: false };
            }
            if (idx === targetIdx) {
              return { ...step, completed: targetIdx === 7, current: targetIdx !== 7, date: 'Just now' };
            }
            return { ...step, completed: false, current: false };
          });
        }

        const notif: AppNotification = {
          id: `notif-farmer-step-${Date.now()}`,
          title: `Order #${o.orderNumber} Status Updated`,
          message: `FPO updated status to: ${deliveryStatus}`,
          time: 'Just now',
          type: 'escrow',
          read: false
        };
        setNotifications((n) => [notif, ...n]);

        return {
          ...o,
          deliveryStatus,
          escrowStatus,
          trackingSteps: updatedSteps
        };
      });

      // Persist to Firestore
      const updatedOrder = updated.find((o) => o.id === orderId);
      if (updatedOrder) saveOrderToDb(updatedOrder);
      return updated;
    });
  };

  const handleAdvanceOrderStep = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentIdx = o.trackingSteps.findIndex((s) => s.current);
        if (currentIdx === -1 || currentIdx >= o.trackingSteps.length - 1) return o;

        const updatedSteps = o.trackingSteps.map((step, idx) => {
          if (idx < currentIdx + 1) return { ...step, completed: true, current: false };
          if (idx === currentIdx + 1) return { ...step, current: true, date: 'Just now' };
          return step;
        });

        let newDeliveryStatus: Order['deliveryStatus'] = o.deliveryStatus;
        let newEscrowStatus: Order['escrowStatus'] = o.escrowStatus;

        // 8-step lifecycle: step indices 0-7
        const nextIdx = currentIdx + 1;
        if (nextIdx === 1) newDeliveryStatus = 'FPO Accepted';
        if (nextIdx === 2) newDeliveryStatus = 'Sample Collected';
        if (nextIdx === 3) newDeliveryStatus = 'Quality Verified';
        if (nextIdx === 4) newDeliveryStatus = 'Dispatched';
        if (nextIdx === 5) newDeliveryStatus = 'In Transit';
        if (nextIdx === 6) newDeliveryStatus = 'Delivered & Verified';
        if (nextIdx === 7) {
          newDeliveryStatus = 'Escrow Released';
          newEscrowStatus = 'Escrow Released / Farmer Paid';
        }

        // Push notification for step change
        const stepLabel = updatedSteps[nextIdx]?.label || newDeliveryStatus;
        const notif: AppNotification = {
          id: `notif-step-${Date.now()}`,
          title: `Order #${o.orderNumber} Updated`,
          message: `Status: ${stepLabel}`,
          time: 'Just now',
          type: 'escrow',
          read: false
        };
        setNotifications((n) => [notif, ...n]);

        return {
          ...o,
          deliveryStatus: newDeliveryStatus,
          escrowStatus: newEscrowStatus,
          trackingSteps: updatedSteps
        };
      });

      // Persist the updated order to Firestore
      const updatedOrder = updated.find((o) => o.id === orderId);
      if (updatedOrder) saveOrderToDb(updatedOrder);

      return updated;
    });
  };

  // Buyer confirms delivery → advances to step 7 (Delivered & Verified) then auto-releases escrow (step 8)
  const handleConfirmDelivery = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        // Only allow if currently In Transit (step 6 is current)
        if (o.deliveryStatus !== 'In Transit') return o;

        const updatedSteps = o.trackingSteps.map((step, idx) => {
          if (idx <= 6) return { ...step, completed: true, current: false };
          if (idx === 7) return { ...step, completed: true, current: true, date: 'Just now' };
          return step;
        });

        // Push notification
        const notif: AppNotification = {
          id: `notif-delivery-${Date.now()}`,
          title: `Order #${o.orderNumber} — Delivery Confirmed`,
          message: `Escrow of ₹${o.totalAmount.toLocaleString('en-IN')} released to farmer/FPO.`,
          time: 'Just now',
          type: 'escrow',
          read: false
        };
        setNotifications((n) => [notif, ...n]);

        return {
          ...o,
          deliveryStatus: 'Escrow Released' as Order['deliveryStatus'],
          escrowStatus: 'Escrow Released / Farmer Paid' as Order['escrowStatus'],
          trackingSteps: updatedSteps
        };
      });

      const updatedOrder = updated.find((o) => o.id === orderId);
      if (updatedOrder) saveOrderToDb(updatedOrder);

      return updated;
    });
  };

  // -------------------------------------------------------------
  // Buyer Actions
  // -------------------------------------------------------------
  const handlePostRFQ = (newRfqData: Partial<BulkRFQ>) => {
    const newRfq: BulkRFQ = {
      id: `rfq-${Date.now()}`,
      buyerName: newRfqData.buyerName || activeBuyerName,
      cropName: newRfqData.cropName || 'Commodity Batch',
      category: newRfqData.category || 'Grains',
      requiredQuantityQuintals: newRfqData.requiredQuantityQuintals || 100,
      targetPricePerQuintal: newRfqData.targetPricePerQuintal || 3200,
      targetDate: newRfqData.targetDate || '2026-10-15',
      deliveryState: newRfqData.deliveryState || 'Delhi NCR',
      qualitySpecs: newRfqData.qualitySpecs || 'Cleaned, moisture under 11%',
      responsesCount: 0,
      status: 'Open'
    };

    setRfqs((prev) => [newRfq, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Bulk RFQ Broadcasted',
      message: `Your requirement for ${newRfq.requiredQuantityQuintals} Qtl ${newRfq.cropName} broadcasted to 1,200+ FPOs.`,
      time: 'Just now',
      type: 'rfq',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // -------------------------------------------------------------
  // Farmer Profile Modal Opener
  // -------------------------------------------------------------
  const handleOpenFarmerProfile = (farmerId: string) => {
    const found = farmers.find((f) => f.id === farmerId) || activeFarmer;
    setSelectedFarmerForModal(found);
  };

  // -------------------------------------------------------------
  // Authentication & Role Switching
  // -------------------------------------------------------------
  const handleOpenAuth = (role: 'farmer' | 'buyer') => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (
    role: UserRole, 
    profileIdOrName: string, 
    newFarmer?: FarmerProfile, 
    newCrop?: Partial<CropProduct>
  ) => {
    setUserRole(role);
    if (role === 'farmer') {
      if (newFarmer) {
        setFarmers(prev => [newFarmer, ...prev]);
        setActiveFarmer(newFarmer);
      } else {
        const found = farmers.find((f) => f.id === profileIdOrName) || activeFarmer;
        setActiveFarmer(found);
      }
      
      if (newCrop) {
        handleAddCrop(newCrop);
      }
      
      setCurrentView('farmer-dashboard');
    } else if (role === 'buyer') {
      setActiveBuyerName(profileIdOrName);
      setCurrentView('buyer-dashboard');
    }
  };

  const handleRoleSwitchFromNav = (role: UserRole) => {
    setUserRole(role);
    if (role === 'farmer') {
      setCurrentView('farmer-dashboard');
    } else if (role === 'buyer') {
      setCurrentView('buyer-dashboard');
    } else {
      setCurrentView('marketplace');
    }
  };

  // Filter crops belonging to active farmer
  const activeFarmerCrops = crops.filter((c) => c.farmerId === activeFarmer.id || c.farmerName === activeFarmer.name);
  const activeFarmerOrders = orders.filter((o) => o.farmerName === activeFarmer.name || o.fpoName === activeFarmer.fpoName);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1B2727] flex flex-col font-['Outfit'] selection:bg-[#6B8E4E]/20 selection:text-[#1B2727]">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNavigate={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
        onSwitchRole={handleRoleSwitchFromNav}
        cartCount={cartItems.length}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        openCart={() => setIsCartOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        openNotifications={() => setIsNotificationsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        openAuthModal={handleOpenAuth}
        onOpenAuthModal={handleOpenAuth}
        activeFarmerProfile={activeFarmer}
        activeBuyerName={activeBuyerName}
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
      />

      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1B2727] focus:text-white focus:font-bold focus:rounded-xl focus:border-2 focus:border-[#6B8E4E] focus:shadow-xl focus:outline-hidden"
      >
        Skip to main content
      </a>

      {/* 2. Main Routed View Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 pb-20 sm:pb-0 outline-hidden">
        {currentView === 'home' && (
          <div>
            <LandingHero
              crops={crops}
              orders={orders}
              setCurrentView={setCurrentView}
              onNavigate={setCurrentView}
              openAuthModal={handleOpenAuth}
              onFarmerJoin={() => handleOpenAuth('farmer')}
              onBuyerJoin={() => handleOpenAuth('buyer')}
              onExploreMarketplace={() => setCurrentView('marketplace')}
              onViewAIPredictions={() => setCurrentView('ai-predictions')}
              onSelectCrop={(crop) => setSelectedCropForDetail(crop)}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {currentView === 'marketplace' && (
          <ErrorBoundary fallbackTitle="Marketplace Temporarily Unavailable">
            <Suspense fallback={<MarketplaceSkeleton />}>
              <Marketplace
                crops={crops}
                onSelectCrop={(crop) => setSelectedCropForDetail(crop)}
                onAddToCart={handleAddToCart}
                onViewFarmer={handleOpenFarmerProfile}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'farmer-dashboard' && (
          <ErrorBoundary fallbackTitle="Farmer Dashboard Temporarily Unavailable">
            <Suspense fallback={<DashboardSkeleton />}>
              <FarmerDashboard
              farmer={activeFarmer}
              farmerCrops={activeFarmerCrops}
              farmerOrders={activeFarmerOrders}
              onAddCrop={handleAddCrop}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenProfile={() => setSelectedFarmerForModal(activeFarmer)}
            />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'buyer-dashboard' && (
          <ErrorBoundary fallbackTitle="Buyer Dashboard Temporarily Unavailable">
            <Suspense fallback={<DashboardSkeleton />}>
              <BuyerDashboard
              buyerName={activeBuyerName}
              orders={orders}
              rfqs={rfqs}
              farmers={farmers}
              onPostRFQ={handlePostRFQ}
              onViewOrderDetails={() => setCurrentView('order-tracking')}
              onViewFarmer={handleOpenFarmerProfile}
              onConfirmDelivery={handleConfirmDelivery}
            />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'ai-predictions' && (
          <ErrorBoundary fallbackTitle="AI Predictions Temporarily Unavailable">
            <Suspense fallback={<PredictionsSkeleton />}>
              <AIPredictions />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'order-tracking' && (
          <ErrorBoundary fallbackTitle="Order Management Temporarily Unavailable">
            <Suspense fallback={<PageLoadingSkeleton />}>
              <OrderManagement
              orders={orders}
              onAdvanceOrderStep={handleAdvanceOrderStep}
              onConfirmDelivery={handleConfirmDelivery}
              userRole={userRole}
            />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'fpo-collective' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="bg-[#1B2727] text-white p-8 rounded-3xl border border-[#3C5148] space-y-4 shadow-xl">
              <span className="text-xs font-bold uppercase text-[#6B8E4E] tracking-wider">
                {t('fpo.badge', 'Farmer Producer Collective')}
              </span>
              <h1 className="text-3xl font-bold font-['Outfit']">
                {t('fpo.title', 'FPO Aggregation & Smallholder Pooling')}
              </h1>
              <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
                {t('fpo.subtitle', 'Empowering small and marginal farmers (< 5 acres) to pool verified harvest volumes into 20-ton truckloads, command +18% higher institutional prices, and bypass unorganized local middlemen.')}
              </p>
            </div>

            {/* FPO Directory */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((f) => (
                <div 
                  key={f.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 hover:shadow-md transition"
                >
                  <div className="flex gap-4 items-start">
                    <img 
                      src={f.avatarUrl} 
                      alt={f.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#6B8E4E] shrink-0" 
                    />
                    <div>
                      <h3 className="font-bold text-base text-[#1B2727]">{f.fpoName}</h3>
                      <p className="text-xs text-neutral-500 font-medium">{t('fpo.head', 'Head')}: {f.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{f.district}, {f.state}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs flex justify-between">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">{t('fpo.members', 'Member Farmers')}</span>
                      <span className="font-bold text-[#1B2727]">{f.memberCount} {t('fpo.families', 'Kisan Families')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">{t('fpo.holding', 'Holding')}</span>
                      <span className="font-bold text-[#1B2727]">{f.landAcres} {t('common.acres', 'Acres')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">{t('fpo.rating', 'Rating')}</span>
                      <span className="font-bold text-amber-600">{f.rating} ★</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {f.bio}
                  </p>

                  <button
                    onClick={() => setSelectedFarmerForModal(f)}
                    className="w-full py-2.5 bg-[#3C5148] hover:bg-[#253630] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {t('fpo.viewHarvests', 'View Collective Harvest Lots')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 2.5. Dedicated Install App Section on Bottom of Website */}
      {!isInstalled && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
          <div className="bg-gradient-to-r from-[#0B192C] via-[#0D263D] to-[#0B2E21] border border-[#FF9933]/50 rounded-md p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
            <div className="space-y-2 text-center sm:text-left z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#FF9933]/20 border border-[#FF9933]/40 text-[#FF9933] font-mono font-bold text-xs uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t('install.bannerTag', 'Direct Mandi Mobile PWA')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Outfit'] tracking-tight">
                {t('install.bannerTitle', 'Access Khet Link Directly on Your Smartphone')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {t('install.bannerDesc', 'Install the official Khet Link app for instant Mandi MSP price alerts, NABL assay verification, and direct farmgate trade with zero dalali.')}
              </p>
            </div>

            <button
              type="button"
              onClick={promptInstall}
              className="shrink-0 px-6 py-3.5 bg-[#E65A00] hover:bg-[#C44D00] text-white font-extrabold text-sm sm:text-base rounded-sm shadow-lg border border-amber-300 transition-all transform hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer uppercase tracking-wide z-10"
              title="Install Khet Link Application"
            >
              <Download className="w-5 h-5 text-amber-200" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Global Footer */}
      <footer className="bg-[#141E1E] text-white border-t border-[#263730] mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Ministry Affiliation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6B8E4E] flex items-center justify-center text-white">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight font-['Outfit']">
                  Khet Link
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t('footer.brandDesc', "Bharat's unified direct farmgate marketplace bridging FPOs, smallholders, and institutional buyers with AI price discovery, smart contract escrow, and refrigerated logistics.")}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('footer.ondcNode', 'e-NAM & ONDC Agriculture Node')}</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3 text-xs">
              <span className="font-bold uppercase text-neutral-400 tracking-wider block">{t('footer.modules', 'Platform Modules')}</span>
              <ul className="space-y-2 text-neutral-300">
                <li>
                  <button onClick={() => setCurrentView('marketplace')} className="hover:text-white cursor-pointer">
                    {t('footer.cropMarket', 'Crop & Harvest Marketplace')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('ai-predictions')} className="hover:text-white cursor-pointer">
                    {t('footer.aiForecast', 'AI Price & Demand Predictions')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('order-tracking')} className="hover:text-white cursor-pointer">
                    {t('footer.telemetry', 'Cold-Chain Order Telemetry')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('fpo-collective')} className="hover:text-white cursor-pointer">
                    {t('footer.fpoAgg', 'FPO Collective Aggregator')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Role Portals */}
            <div className="space-y-3 text-xs">
              <span className="font-bold uppercase text-neutral-400 tracking-wider block">{t('footer.portals', 'User Portals')}</span>
              <ul className="space-y-2 text-neutral-300">
                <li>
                  <button onClick={() => handleOpenAuth('farmer')} className="hover:text-white cursor-pointer">
                    {t('footer.farmerOnboard', 'Farmer & FPO Onboarding')}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenAuth('buyer')} className="hover:text-white cursor-pointer">
                    {t('footer.messProcure', 'Hostel Mess & Bulk Procurement')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('farmer-dashboard')} className="hover:text-white cursor-pointer">
                    {t('footer.kisanEscrow', 'Kisan Escrow & Soil Dashboard')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('buyer-dashboard')} className="hover:text-white cursor-pointer">
                    {t('footer.bulkBidding', 'Bulk RFQs & Bidding Console')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Kisan Helpline & Government */}
            <div className="space-y-3 text-xs">
              <span className="font-bold uppercase text-neutral-400 tracking-wider block">{t('footer.helplineTitle', 'Toll-Free Support')}</span>
              <div className="bg-[#1C2B25] p-3.5 rounded-2xl border border-[#2B3E36] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>1800-180-1551</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t('footer.helplineDesc', 'Kisan Call Centre (24x7 in 22 Official Regional Languages)')}
                </p>
              </div>
              <p className="text-[11px] text-neutral-400">
                {t('footer.ministryCompliant', 'Compliant with Ministry of Agriculture & Farmers Welfare, GoI.')}
              </p>

              {/* Install App in Footer */}
              {!isInstalled && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={promptInstall}
                    className="w-full py-2.5 px-3 bg-[#E65A00] hover:bg-[#C44D00] text-white font-bold text-xs rounded-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition border border-amber-400 uppercase tracking-wide"
                    title="Install Khet Link Application"
                  >
                    <Download className="w-4 h-4 text-amber-200" />
                    <span>Install App</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#263730] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-400">
            <div>
              {t('footer.copyright', '© 2026 Khet Link Technologies. Direct Farmgate Empowerment Initiative.')}
            </div>
            <div className="flex items-center gap-4">
              <span>{t('footer.privacy', 'Privacy Policy')}</span>
              <span>•</span>
              <span>{t('footer.escrowPolicy', 'Escrow Dispute Resolution')}</span>
              <span>•</span>
              <span>{t('footer.apmcRules', 'APMC Cess Exempt Rules')}</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 4. Modals & Drawers */}
      
      {/* Crop Detail Modal */}
      <CropDetailModal
        crop={selectedCropForDetail}
        onClose={() => setSelectedCropForDetail(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onViewFarmer={(farmerId) => {
          setSelectedCropForDetail(null);
          handleOpenFarmerProfile(farmerId);
        }}
      />

      {/* Farmer Profile Modal */}
      <FarmerProfileModal
        farmer={selectedFarmerForModal}
        farmerCrops={crops.filter((c) => c.farmerId === selectedFarmerForModal?.id || c.farmerName === selectedFarmerForModal?.name)}
        onClose={() => setSelectedFarmerForModal(null)}
        onSelectCrop={(crop) => {
          setSelectedFarmerForModal(null);
          setSelectedCropForDetail(crop);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutComplete={handleCheckoutComplete}
        buyerName={activeBuyerName}
      />

      {/* Notifications Popover */}
      <NotificationsPopover
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onSelectNotification={(notif) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
          );
          if (notif.type === 'escrow') setCurrentView('order-tracking');
          if (notif.type === 'rfq') setCurrentView('buyer-dashboard');
          if (notif.type === 'mandi') setCurrentView('ai-predictions');
          setIsNotificationsOpen(false);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 5. Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleAIAssistant={() => setIsAIAssistantOpen((prev) => !prev)}
        userRole={userRole}
        onOpenAuth={handleOpenAuth}
      />

      {/* 6. AI Assistant Floating Widget */}
      <ErrorBoundary fallbackTitle="AI Assistant Temporarily Unavailable">
        <Suspense fallback={null}>
          <AIAssistant 
            onNavigate={setCurrentView}
            onOpenAuth={handleOpenAuth}
            isOpenControlled={isAIAssistantOpen}
            onToggleControlled={() => setIsAIAssistantOpen((prev) => !prev)}
          />
        </Suspense>
      </ErrorBoundary>

      {/* 7. Demo Walkthrough Guide */}
      <DemoWalkthrough
        onNavigate={setCurrentView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

    </div>
  );
}

