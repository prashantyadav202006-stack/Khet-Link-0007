import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Truck, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Clock, 
  MapPin, 
  X,
  Send,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';
import { Order, BulkRFQ, FarmerProfile } from '../types';
import { BuyerLogo } from './BuyerLogo';
import { useLanguage } from '../context/LanguageContext';

interface BuyerDashboardProps {
  buyerName: string;
  buyerLogo?: string;
  onUpdateBuyerLogo?: (logo: string) => void;
  orders: Order[];
  rfqs: BulkRFQ[];
  farmers?: FarmerProfile[];
  onPostRFQ: (newRfq: Partial<BulkRFQ>) => void;
  onViewOrderDetails: (order: Order) => void;
  onViewFarmer: (farmerId: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  buyerName,
  buyerLogo,
  onUpdateBuyerLogo,
  orders,
  rfqs,
  farmers = [],
  onPostRFQ,
  onViewOrderDetails,
  onViewFarmer
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'rfqs' | 'fpos' | 'invoices'>('orders');
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateBuyerLogo) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateBuyerLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // New RFQ form
  const [rfqCrop, setRfqCrop] = useState('');
  const [rfqCategory, setRfqCategory] = useState('Grains');
  const [rfqQty, setRfqQty] = useState<number>(100);
  const [rfqTargetPrice, setRfqTargetPrice] = useState<number>(3100);
  const [rfqDate, setRfqDate] = useState('2026-10-15');
  const [rfqState, setRfqState] = useState('Delhi NCR');
  const [rfqSpecs, setRfqSpecs] = useState('');

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    onPostRFQ({
      buyerName,
      cropName: rfqCrop,
      category: rfqCategory,
      requiredQuantityQuintals: rfqQty,
      targetPricePerQuintal: rfqTargetPrice,
      targetDate: rfqDate,
      deliveryState: rfqState,
      qualitySpecs: rfqSpecs || 'Grade A cleaned, moisture under 11%',
      responsesCount: 0,
      status: 'Open',
    });
    setIsRfqModalOpen(false);
    setRfqCrop('');
    setRfqSpecs('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Buyer Header Banner */}
      <div className="bg-gradient-to-r from-[#1B2727] via-[#243530] to-[#162120] rounded-3xl p-6 sm:p-8 text-white border border-[#3C5148] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <BuyerLogo logo={buyerLogo} buyerName={buyerName} size="xl" />
              {onUpdateBuyerLogo && (
                <label 
                  className="absolute -bottom-1.5 -right-1.5 bg-[#1B2727] hover:bg-[#2D6A4F] text-emerald-300 border border-[#6B8E4E] p-1.5 rounded-full cursor-pointer shadow-md transition group-hover:scale-110 flex items-center justify-center"
                  title="Upload Custom Logo / लोगो अपलोड करें"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                </label>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit']">{buyerName}</h1>
                <span className="text-xs font-bold bg-[#6B8E4E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('buyer.verifiedBadge', 'Corporate GST Verified')}
                </span>
              </div>
              <p className="text-sm text-[#B2C5B2] font-medium mt-0.5">
                {t('buyer.tagline', 'Institutional Bulk Procurement & Direct Farmgate Off-take')}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 mt-2">
                <span>GSTIN: 07AAACH2819K1Z4</span>
                <span>•</span>
                <span>Escrow Limit: ₹50,00,000</span>
                <span>•</span>
                <span>Mandi Cess Exempt Status: Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-post-rfq-top"
              onClick={() => setIsRfqModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#6B8E4E] hover:bg-[#5a7942] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('buyer.postRfq', 'Post Bulk RFQ')}</span>
            </button>
          </div>

        </div>

        {/* Quick metrics */}
        <div className="mt-6 pt-6 border-t border-[#374C42] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{orders.length}</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('buyer.activeOrders', 'Active Shipments')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{rfqs.length}</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('buyer.openRfqs', 'Open RFQs')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">100%</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('buyer.escrowSecurity', 'Escrow Security')}</div>
          </div>
          <div className="bg-[#141E1E]/60 p-3 rounded-xl border border-[#2B3E36]">
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">₹38,200</div>
            <div className="text-[11px] text-[#B2C5B2] uppercase font-bold tracking-wider">{t('buyer.cessSaved', 'Mandi Cess Saved')}</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t('buyer.ordersTab', 'Active Procurement Orders')} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rfqs')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'rfqs'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('buyer.rfqsTab', 'Custom Bulk RFQs')} ({rfqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fpos')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'fpos'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('buyer.fposTab', 'Verified FPOs Directory')}</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-[#6B8E4E] text-[#1B2727]'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{t('buyer.invoicesTab', 'GST E-Way Bills & Invoices')}</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1B2727]">Procurement Consignments & Tracking</h3>
            <span className="text-xs text-neutral-500 font-mono">Real-time GPS status</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#1B2727]">Order #{order.orderNumber}</span>
                      <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                        {order.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      FPO: <strong>{order.fpoName}</strong> ({order.farmerName})
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-400">Escrow Protected Total</span>
                    <div className="text-xl font-bold font-mono text-[#1B2727]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-neutral-50 p-2.5 rounded-xl">
                      <span className="font-medium text-neutral-800">
                        {item.quantity} {item.unit}(s) of {item.crop.title}
                      </span>
                      <span className="font-mono font-bold text-neutral-700">
                        ₹{(item.unit === 'quintal' ? item.crop.pricePerQuintal * item.quantity : item.crop.pricePerKg * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking Steps Preview */}
                <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E3EBE3] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-700">Shipment Timeline:</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      Est. Arrival: {order.estimatedDelivery}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                    {order.trackingSteps.map((step, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border ${
                          step.completed 
                            ? 'bg-[#3C5148] text-white border-[#3C5148]' 
                            : step.current 
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' 
                              : 'bg-white text-neutral-400 border-neutral-200'
                        }`}
                      >
                        <div className="font-bold text-[10px] uppercase">Step {idx + 1}</div>
                        <div className="font-semibold truncate text-[11px] mt-0.5">{step.label}</div>
                      </div>
                    ))}
                  </div>

                  {order.vehicleNumber && (
                    <div className="flex items-center justify-between text-xs text-neutral-600 pt-1 border-t border-neutral-200/60">
                      <span>Vehicle: <strong>{order.vehicleNumber}</strong></span>
                      <span>Transporter: <strong>{order.transporterName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => onViewOrderDetails(order)}
                    className="px-4 py-2 bg-[#3C5148] hover:bg-[#253630] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    View Full Live GPS Timeline
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Bulk RFQs */}
      {activeTab === 'rfqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#1B2727]">Your Open Requests for Quotation (RFQs)</h3>
              <p className="text-xs text-neutral-500">Farmers & FPOs submit direct competitive bids against your specifications.</p>
            </div>
            <button
              onClick={() => setIsRfqModalOpen(true)}
              className="px-4 py-2 bg-[#6B8E4E] hover:bg-[#5a7942] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Post New RFQ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfqs.map((rfq) => (
              <div 
                key={rfq.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#6B8E4E]">
                      {rfq.category}
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {rfq.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#1B2727]">{rfq.cropName}</h4>
                  
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Required Volume:</span>
                      <span className="font-bold font-mono text-[#1B2727]">{rfq.requiredQuantityQuintals} Quintals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Target Offer Price:</span>
                      <span className="font-bold font-mono text-[#6B8E4E]">₹{rfq.targetPricePerQuintal}/Qtl</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Delivery State:</span>
                      <span className="font-medium text-neutral-700">{rfq.deliveryState}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                    <strong>Specs:</strong> {rfq.qualitySpecs}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-500">
                    {rfq.responsesCount} FPO Bids Received
                  </span>
                  <button 
                    onClick={() => alert(`Reviewing ${rfq.responsesCount} bids from verified farmer producer collectives for ${rfq.cropName}`)}
                    className="text-xs font-bold text-[#3C5148] hover:underline cursor-pointer"
                  >
                    View Bids &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Verified FPOs Directory */}
      {activeTab === 'fpos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1B2727]">Top Verified Farmer Producer Organizations</h3>
            <span className="text-xs text-neutral-500">Ministry of Agriculture & NABARD Registered</span>
          </div>

          {farmers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#144231] mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#1B2727]">No Registered FPOs Yet</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                When Farmer Producer Organizations complete onboarding, their verified profiles, harvest crops, and member counts will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {farmers.map((f) => (
                <div 
                  key={f.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4 items-start">
                    <img 
                      src={f.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} 
                      alt={f.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#6B8E4E] shrink-0" 
                    />
                    <div>
                      <h4 className="font-bold text-base text-[#1B2727]">{f.fpoName}</h4>
                      <p className="text-xs text-neutral-500">Representative: {f.name}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#6B8E4E]" />
                        {f.district}, {f.state}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-[#E8EFE8] text-[#3C5148] font-bold px-2 py-0.5 rounded">
                          {f.memberCount || 1} Member Farmers
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          {f.rating || 5.0} ★ ({f.reviewsCount || 1})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {f.bio}
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-mono">Reg: {f.fpoRegNo || 'FPO-REG-VERIFIED'}</span>
                    <button
                      onClick={() => onViewFarmer(f.id)}
                      className="px-3 py-1.5 bg-[#3C5148] hover:bg-[#253630] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      View FPO Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Invoices & Tax Documents */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1B2727]">GST E-Way Bills & Mandi Cess Waivers</h3>
              <span className="text-xs text-neutral-500">Government Inter-State Trade Compliant</span>
            </div>

            <div className="divide-y divide-neutral-100">
              <div className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#1B2727]">E-Way Bill #9923819824 (Order #KS-2026-9941)</div>
                  <div className="text-neutral-500">Vehicle: PB 10 CQ 8812 • Consignor: Malwa Kisan FPO</div>
                </div>
                <button 
                  onClick={() => alert('Downloaded digital signed E-Way bill with QR code.')}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>

              <div className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#1B2727]">Tax Invoice #INV-2026-8842 (Order #KS-2026-8842)</div>
                  <div className="text-neutral-500">Total: ₹108,600 • 0% Mandi Cess applied under direct farmer clause</div>
                </div>
                <button 
                  onClick={() => alert('Downloaded tax invoice with HSN classification codes.')}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post RFQ Modal */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-neutral-200 shadow-2xl relative">
            <button
              onClick={() => setIsRfqModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase text-[#6B8E4E]">Bulk Procurement Request</span>
              <h3 className="text-xl font-bold text-[#1B2727] font-['Outfit']">Post Request For Quote (RFQ)</h3>
              <p className="text-xs text-neutral-500">Broadcast your requirement directly to 1,200+ FPOs.</p>
            </div>

            <form onSubmit={handleCreateRFQ} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Crop Name & Commodity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desi Chana Dal, Mustard Bold, Soybean"
                  value={rfqCrop}
                  onChange={(e) => setRfqCrop(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none focus:border-[#6B8E4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Category</label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 cursor-pointer"
                  >
                    <option value="Grains">Grains</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Oilseeds">Oilseeds</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Required Qty (Quintals)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={rfqQty}
                    onChange={(e) => setRfqQty(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Target Price / Quintal (₹)</label>
                  <input
                    type="number"
                    required
                    value={rfqTargetPrice}
                    onChange={(e) => setRfqTargetPrice(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Delivery Destination</label>
                  <input
                    type="text"
                    required
                    value={rfqState}
                    onChange={(e) => setRfqState(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Quality Specifications</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Moisture &lt; 10%, zero weevils, machine cleaned, 50kg bags"
                  value={rfqSpecs}
                  onChange={(e) => setRfqSpecs(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6B8E4E] hover:bg-[#5a7942] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast RFQ to FPOs</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
