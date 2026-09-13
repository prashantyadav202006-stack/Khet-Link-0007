import React, { useState } from 'react';
import { 
  Sprout, 
  PlusCircle, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Users, 
  Wallet, 
  Truck, 
  AlertCircle, 
  Check, 
  X,
  FileCheck,
  Building2,
  Mic,
  Loader2
} from 'lucide-react';
import { CropProduct, FarmerProfile, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getCropImageUrl } from '../utils/cropImages';
import { parseVoiceListing } from '../services/geminiService';

interface FarmerDashboardProps {
  farmer: FarmerProfile;
  farmerCrops: CropProduct[];
  farmerOrders: Order[];
  onAddCrop: (newCrop: Partial<CropProduct>) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['deliveryStatus'], escrow: Order['escrowStatus']) => void;
  onOpenProfile: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  farmerCrops,
  farmerOrders,
  onAddCrop,
  onUpdateOrderStatus,
  onOpenProfile
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'wallet' | 'fpo-pooling'>('inventory');
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [poolingActive, setPoolingActive] = useState(true);

  // New crop form state
  const [newCropTitle, setNewCropTitle] = useState('Rice');
  const [newCropCategory, setNewCropCategory] = useState<CropProduct['category']>('Grains');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newCropPriceQuintal, setNewCropPriceQuintal] = useState<number>(3200);
  const [newCropQtyQuintals, setNewCropQtyQuintals] = useState<number>(50);
  const [newCropGrade, setNewCropGrade] = useState<CropProduct['grade']>('Grade A Mandi');
  const [newCropOrganic, setNewCropOrganic] = useState<boolean>(true);
  const [newCropMoisture, setNewCropMoisture] = useState<number>(10.5);

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const totalQuintalsListed = farmerCrops.reduce((acc, c) => acc + c.quantityAvailableQuintals, 0);
  const totalRevenueEscrow = farmerOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Default to Hindi, but works with Hinglish
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
    };
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setIsListening(false);
      
      try {
        const data = await parseVoiceListing(transcript);
        if (data.title) setNewCropTitle(data.title);
        if (data.variety) setNewCropVariety(data.variety);
        if (data.quantity) setNewCropQtyQuintals(Number(data.quantity));
        if (data.price) setNewCropPriceQuintal(Number(data.price));
      } catch (e) {
        console.error(e);
      }
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCrop({
      title: newCropTitle,
      category: newCropCategory,
      variety: newCropVariety,
      pricePerQuintal: newCropPriceQuintal,
      pricePerKg: Math.round(newCropPriceQuintal / 100),
      mandiMspPrice: Math.round(newCropPriceQuintal * 0.82),
      quantityAvailableQuintals: newCropQtyQuintals,
      grade: newCropGrade,
      isOrganic: newCropOrganic,
      moisturePercent: newCropMoisture,
      farmerId: farmer.id,
      farmerName: farmer.name,
      fpoName: farmer.fpoName,
      locationState: farmer.state,
      locationDistrict: farmer.district,
      minOrderKg: 25,
      harvestDate: 'Current Season 2026',
      imageUrl: getCropImageUrl(newCropTitle, newCropVariety, newCropCategory),
      description: `Freshly harvested ${newCropVariety} from ${farmer.village}, certified and moisture tested.`,
      shelfLifeDays: 360,
      packagingType: '50kg Hermetic Bags',
      readyForDispatch: true,
    });
    setIsAddCropModalOpen(false);
    setNewCropTitle('');
    setNewCropVariety('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Farmer Profile Hero Header */}
      <div className="bg-gradient-to-r from-[#1B2727] via-[#2A3B34] to-[#1E2E28] rounded-3xl p-6 sm:p-8 text-white border border-[#3C5148] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={farmer.avatarUrl} 
              alt={farmer.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#6B8E4E] shadow-md shrink-0" 
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit']">{farmer.name}</h1>
                <span className="text-xs font-bold bg-[#6B8E4E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('farmerDash.kisanVerified', 'Kisan ID Verified')}
                </span>
              </div>
              <p className="text-sm text-[#B2C5B2] font-medium mt-0.5">
                {farmer.fpoName} • {farmer.district}, {farmer.state}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 mt-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <FileCheck className="w-3.5 h-3.5" />
                  Soil Health Card #SHC-2026-90
                </span>
                <span>•</span>
                <span>{farmer.landAcres} Acres Holding</span>
                <span>•</span>
                <span>{farmer.memberCount} FPO Member Farmers</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              {t('farmerDash.publicProfile', 'Public Profile & Bio')}
            </button>
            <button
              id="btn-list-harvest-top"
              onClick={() => setIsAddCropModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#6B8E4E] hover:bg-[#5a7942] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('farmerDash.listNewHarvest', 'List New Harvest')}</span>
            </button>
          </div>

        </div>

        {/* Stats Strip */}
        <div className="mt-6 pt-6 border-t border-[#374C42] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{totalQuintalsListed} Qtl</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('farmerDash.activeInventory', 'Active Inventory')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">₹{totalRevenueEscrow.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('farmerDash.escrowTurnover', 'Escrow Turnover')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{farmerOrders.length}</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('farmerDash.activeOrders', 'Active Orders')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{farmer.rating} ★</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{farmer.reviewsCount} {t('farmerDash.reviews', 'Reviews')}</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('farmerDash.tabInventory', 'Produce Inventory')} ({farmerCrops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t('farmerDash.tabOrders', 'Received Orders & Bids')} ({farmerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'wallet'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('farmerDash.tabWallet', 'Escrow Payouts & Bank')}</span>
        </button>

        <button
          onClick={() => setActiveTab('fpo-pooling')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'fpo-pooling'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4 text-[#6B8E4E]" />
          <span>{t('farmerDash.tabPooling', 'FPO Collective Aggregator')}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
            Pooling Active
          </span>
        </button>
      </div>

      {/* Tab 1: Produce Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1B2727]">{t('farmer.listedBatches', 'Your Listed Harvest Batches')}</h3>
            <button
              id="btn-list-harvest"
              onClick={() => setIsAddCropModalOpen(true)}
              className="px-4 py-2 bg-[#6B8E4E] hover:bg-[#5a7942] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {t('farmer.addProduceListing', 'Add Produce Listing')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerCrops.map((crop) => (
              <div 
                key={crop.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex gap-3 items-start">
                  <img 
                    src={crop.imageUrl} 
                    alt={crop.title} 
                    className="w-18 h-18 rounded-xl object-cover shrink-0" 
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#6B8E4E]">
                      {crop.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#1B2727] line-clamp-1">{crop.title}</h4>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">
                      {crop.quantityAvailableQuintals} Quintals in Godown
                    </p>
                    <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded mt-1">
                      Moisture: {crop.moisturePercent}%
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-neutral-500 text-[10px]">{t('farmer.yourListingPrice', 'Your Listing Price')}</span>
                    <p className="font-bold font-mono text-base text-[#1B2727]">₹{crop.pricePerQuintal}/Qtl</p>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px]">{t('farmer.apmcMsp', 'APMC Mandi MSP')}</span>
                    <p className="font-bold font-mono text-xs text-neutral-600">₹{crop.mandiMspPrice}/Qtl</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('farmer.activeMarketplace', 'Active on Marketplace')}
                  </span>
                  <button 
                    onClick={() => alert(`Status updated for ${crop.title}. Live buyers are viewing your batch!`)}
                    className="text-xs font-semibold text-[#3C5148] hover:underline cursor-pointer"
                  >
                    Edit Price / Qty
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Received Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1B2727]">{t('farmer.ordersContracts', 'Procurement Orders & Buyer Contracts')}</h3>
            <span className="text-xs text-neutral-500">100% Escrow Funded by Buyer</span>
          </div>

          <div className="space-y-4">
            {farmerOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#1B2727]">Order #{order.orderNumber}</span>
                      <span className="text-xs bg-[#E8EFE8] text-[#3C5148] font-bold px-2.5 py-0.5 rounded-full">
                        {order.buyerType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Buyer: <strong>{order.buyerName}</strong> • Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-400">{t('farmer.totalEscrowVal', 'Total Escrow Value')}</span>
                    <div className="text-xl font-bold font-mono text-[#6B8E4E]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-neutral-50 p-2.5 rounded-xl">
                      <span className="font-semibold text-neutral-800">
                        {item.quantity} {item.unit}(s) of {item.crop.title}
                      </span>
                      <span className="font-mono font-bold text-neutral-700">
                        ₹{(item.unit === 'quintal' ? item.crop.pricePerQuintal * item.quantity : item.crop.pricePerKg * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery & Escrow Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Current Status:</span>
                    <span className="font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                      {order.deliveryStatus}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="font-semibold text-emerald-700">
                      🛡️ {order.escrowStatus}
                    </span>
                  </div>

                  {/* Actions to transition — FPO role steps */}
                  <div className="flex items-center gap-2">
                    {order.deliveryStatus === 'Order Placed' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'FPO Accepted', 'Held in Escrow')}
                        className="px-3 py-1.5 bg-[#3C5148] text-white font-bold rounded-lg hover:bg-[#253630] transition text-xs cursor-pointer"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.deliveryStatus === 'FPO Accepted' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Sample Collected', 'Held in Escrow')}
                        className="px-3 py-1.5 bg-[#3C5148] text-white font-bold rounded-lg hover:bg-[#253630] transition text-xs cursor-pointer"
                      >
                        Collect Quality Sample
                      </button>
                    )}
                    {order.deliveryStatus === 'Sample Collected' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Quality Verified', 'Held in Escrow')}
                        className="px-3 py-1.5 bg-[#6B8E4E] text-white font-bold rounded-lg hover:bg-[#5a7942] transition text-xs cursor-pointer"
                      >
                        Confirm Quality Verified
                      </button>
                    )}
                    {order.deliveryStatus === 'Quality Verified' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Dispatched', 'Held in Escrow')}
                        className="px-3 py-1.5 bg-[#6B8E4E] text-white font-bold rounded-lg hover:bg-[#5a7942] transition text-xs cursor-pointer"
                      >
                        Hand Over to Logistics
                      </button>
                    )}
                    {order.deliveryStatus === 'Dispatched' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'In Transit', 'Held in Escrow')}
                        className="px-3 py-1.5 bg-neutral-700 text-white font-bold rounded-lg transition text-xs cursor-pointer"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {(order.deliveryStatus === 'In Transit' || order.deliveryStatus === 'Delivered & Verified') && (
                      <span className="text-amber-700 font-bold flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Buyer Confirmation
                      </span>
                    )}
                    {(order.deliveryStatus === 'Escrow Released' || order.escrowStatus === 'Escrow Released / Farmer Paid') && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Payout Settled to Bank
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Escrow & Wallet */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-2">
              <span className="text-xs text-neutral-500 uppercase font-bold">Settled to Bank (Direct Payout)</span>
              <div className="text-3xl font-black text-emerald-700 font-mono">₹108,600</div>
              <p className="text-[11px] text-neutral-400">Transferred to HDFC Bank A/C ****4821</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-2">
              <span className="text-xs text-neutral-500 uppercase font-bold">{t('farmer.lockedEscrow', 'Locked in Buyer Escrow')}</span>
              <div className="text-3xl font-black text-amber-600 font-mono">₹194,650</div>
              <p className="text-[11px] text-neutral-400">{t('farmer.escrowReleaseInfo', 'Release immediately upon warehouse receipt verification')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-2">
              <span className="text-xs text-neutral-500 uppercase font-bold">{t('farmer.cessExemptionSaved', 'Mandi Cess Exemption Saved')}</span>
              <div className="text-3xl font-black text-[#1B2727] font-mono">₹4,860</div>
              <p className="text-[11px] text-neutral-400">Direct farmgate trading 0% local market fee</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <h4 className="font-bold text-base text-[#1B2727]">Linked Kisan Bank Account (PFMS Verified)</h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3C5148] text-white flex items-center justify-center font-bold">
                  🏦
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#1B2727]">HDFC Bank - Ludhiana Branch</h5>
                  <p className="text-xs text-neutral-500 font-mono">A/C: **********4821 • IFSC: HDFC0001892</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ✓ NPCI Aadhaar Seeding Active (Direct Benefit Transfer Ready)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => alert('Account verified through PFMS & Kisan Credit Card portal.')}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 self-start sm:self-auto cursor-pointer"
              >
                Change Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: FPO Collective Aggregation */}
      {activeTab === 'fpo-pooling' && (
        <div className="space-y-6">
          <div className="bg-[#EBF3EB] rounded-2xl p-6 border border-[#CDE1CD] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#3C5148]" />
                <h3 className="font-bold text-lg text-[#1B2727]">
                  {farmer.fpoName} - Collective Bulk Aggregation Pool
                </h3>
              </div>
              <button
                onClick={() => setPoolingActive(!poolingActive)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  poolingActive ? 'bg-[#3C5148] text-white' : 'bg-neutral-300 text-neutral-700'
                }`}
              >
                {poolingActive ? 'Pooling Enabled' : 'Enable Pooling'}
              </button>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              FPO Collective Aggregation allows small farmers with 1-5 acres to pool identical harvest varieties together. By offering a standardized 15-20 metric ton truckload, the collective commands a <strong>+18% higher price</strong> from FMCG processors.
            </p>

            {/* Aggregation progress */}
            <div className="bg-white p-4 rounded-xl border border-[#CDE1CD] space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#1B2727]">
                <span>Current Sharbati Wheat Truckload Pool:</span>
                <span className="font-mono text-[#6B8E4E]">18.4 / 20.0 Metric Tons (92% Full)</span>
              </div>
              <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
                <div className="bg-[#6B8E4E] h-full transition-all" style={{ width: '92%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>14 Smallholder Farmers Contributed</span>
                <span className="text-emerald-700 font-semibold">Target Dispatch: Tomorrow 09:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Listing Modal */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-neutral-200 shadow-2xl relative">
            <button
              onClick={() => setIsAddCropModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase text-[#6B8E4E]">{t('farmer.farmgateOnboarding', 'Farmgate Onboarding')}</span>
                <h3 className="text-xl font-bold text-[#1B2727] font-['Outfit']">{t('farmer.listNewBatch', 'List New Harvest Batch')}</h3>
                <p className="text-xs text-neutral-500">{t('farmer.listBatchSub', 'Instant publish to 4,500+ verified buyers with AI price discovery.')}</p>
              </div>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer border ${isListening ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-[#EBF3EB] border-[#CDE1CD] hover:bg-[#d8eed8] text-[#1B2727]'}`}
              >
                {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5 text-[#6B8E4E]" />}
                <span className="text-[9px] font-bold mt-1 tracking-wider">{isListening ? 'Listening...' : 'VOICE FILL'}</span>
              </button>
            </div>

            {voiceTranscript && !isListening && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs text-neutral-600 italic">
                "{voiceTranscript}" - fields updated via AI
              </div>
            )}

            <form onSubmit={handleCreateCrop} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.cropTitleLabel', 'Crop Name & Batch Title')}</label>
                <select
                  required
                  value={newCropTitle}
                  onChange={(e) => setNewCropTitle(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none focus:border-[#6B8E4E] cursor-pointer"
                >
                  <option value="Rice">Rice / Basmati</option>
                  <option value="Wheat">Wheat / Sharbati</option>
                  <option value="Mustard">Mustard / Sarson</option>
                  <option value="Chana">Chana / Chickpea</option>
                  <option value="Onion">Onion / Pyaz</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.categoryLabel', 'Category')}</label>
                  <select
                    value={newCropCategory}
                    onChange={(e) => setNewCropCategory(e.target.value as any)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="Grains">{t('categories.grains', 'Grains & Cereals')}</option>
                    <option value="Pulses">{t('categories.pulses', 'Pulses & Dal')}</option>
                    <option value="Vegetables">{t('categories.vegetables', 'Vegetables')}</option>
                    <option value="Spices">{t('categories.spices', 'Spices')}</option>
                    <option value="Oilseeds">{t('categories.oilseeds', 'Oilseeds')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.varietyLabel', 'Variety Name')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C-306 Heirloom"
                    value={newCropVariety}
                    onChange={(e) => setNewCropVariety(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.priceQuintalLabel', 'Price / Quintal (₹)')}</label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={newCropPriceQuintal}
                    onChange={(e) => setNewCropPriceQuintal(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.availableQuintals', 'Available Quintals')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCropQtyQuintals}
                    onChange={(e) => setNewCropQtyQuintals(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.qualityGradeLabel', 'Quality Grade')}</label>
                  <select
                    value={newCropGrade}
                    onChange={(e) => setNewCropGrade(e.target.value as any)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 cursor-pointer"
                  >
                    <option value="Grade A+ Export">{t('grades.gradeAPlus', 'Grade A+ Export')}</option>
                    <option value="Grade A Mandi">{t('grades.gradeA', 'Grade A Mandi')}</option>
                    <option value="Grade B Commercial">{t('grades.gradeB', 'Grade B Commercial')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">{t('farmer.moistureLabel', 'Moisture % (Assay)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCropMoisture}
                    onChange={(e) => setNewCropMoisture(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newCropOrganic}
                  onChange={(e) => setNewCropOrganic(e.target.checked)}
                  className="w-4 h-4 accent-[#6B8E4E]"
                />
                <span className="text-xs font-medium text-neutral-700">
                  Certified Organic (NPOP / Jaivik Bharat)
                </span>
              </label>

              {newCropQtyQuintals > 0 && newCropQtyQuintals < 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 mt-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Transport Pooling Available!</p>
                      <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                        Farmer Ramesh from your district has a truck going to buyers with {100 - newCropQtyQuintals} Qtl of space left.
                      </p>
                    </div>
                  </div>
                  <button type="button" className="mt-2.5 w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold rounded-lg transition cursor-pointer">
                    Join Pool & Save ₹4,500
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#6B8E4E] hover:bg-[#5a7942] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
              >
                Publish Harvest Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
