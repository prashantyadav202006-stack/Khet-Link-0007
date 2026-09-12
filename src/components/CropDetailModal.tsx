import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Droplets, 
  Calendar, 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Truck, 
  MessageSquare, 
  Sparkles, 
  Phone 
} from 'lucide-react';
import { CropProduct } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CropDetailModalProps {
  crop: CropProduct | null;
  onClose: () => void;
  onAddToCart: (crop: CropProduct, quantity: number, unit: 'kg' | 'quintal') => void;
  onViewFarmer: (farmerId: string) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  onClose,
  onAddToCart,
  onViewFarmer
}) => {
  if (!crop) return null;

  const { t } = useLanguage();
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'kg' | 'quintal'>('quintal');
  const [showInquirySent, setShowInquirySent] = useState(false);
  const [inquiryText, setInquiryText] = useState('');

  const calculatedTotal = unit === 'kg' 
    ? crop.pricePerKg * quantity 
    : crop.pricePerQuintal * quantity;

  const handleAddToCart = () => {
    onAddToCart(crop, quantity, unit);
    onClose();
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInquirySent(true);
    setTimeout(() => {
      setShowInquirySent(false);
      setInquiryText('');
    }, 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="crop-detail-modal-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* Left: Image & Assaying Specs */}
          <div className="md:col-span-5 bg-[#F5F8F5] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E2EBE2]">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-md">
                <img 
                  src={crop.imageUrl} 
                  alt={crop.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="text-xs font-bold bg-[#1B2727]/90 text-white px-3 py-1 rounded-full">
                    {crop.grade}
                  </span>
                  {crop.isOrganic && (
                    <span className="text-xs font-bold bg-[#3C5148] text-[#B2C5B2] px-3 py-1 rounded-full border border-[#6B8E4E]/40">
                      🌿 {t('cropDetail.npopOrganic', 'NPOP Organic')}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Digital Assay Card */}
              <div className="bg-white rounded-xl p-4 border border-[#D5E1D5] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                  <span className="font-bold text-[#1B2727] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#6B8E4E]" />
                    {t('common.labAssayCert', 'Lab Assay Certificate')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {t('common.verified', 'VERIFIED').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500">{t('common.moistureContent', 'Moisture Content')}:</span>
                    <p className="font-bold text-[#1B2727]">{crop.moisturePercent}% ({t('cropDetail.optimum', 'Optimum')})</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">{t('common.foreignMatter', 'Foreign Matter')}:</span>
                    <p className="font-bold text-[#1B2727]">&lt; 0.2% {t('cropDetail.destoned', 'Destoned')}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">{t('common.harvestDate', 'Harvest Date')}:</span>
                    <p className="font-bold text-[#1B2727]">{crop.harvestDate}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">{t('common.shelfLife', 'Shelf Life')}:</span>
                    <p className="font-bold text-[#1B2727]">{crop.shelfLifeDays} {t('common.days', 'Days')}</p>
                  </div>
                </div>

                {crop.organicCertNumber && (
                  <div className="pt-1 text-[11px] text-neutral-600 border-t border-neutral-100">
                    <span className="text-neutral-400">{t('cropDetail.apedaCert', 'APEDA Cert No')}:</span> {crop.organicCertNumber}
                  </div>
                )}
              </div>

              {/* Farmer & FPO Origin Box */}
              <div className="bg-white rounded-xl p-4 border border-[#D5E1D5] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('common.farmOrigin', 'Farm Origin')}</span>
                  <button
                    onClick={() => onViewFarmer(crop.farmerId)}
                    className="text-xs font-bold text-[#6B8E4E] hover:underline cursor-pointer"
                  >
                    {t('common.viewFullProfile', 'View Full Profile')} &rarr;
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3C5148] text-white flex items-center justify-center font-bold text-sm">
                    {crop.farmerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1B2727]">{crop.farmerName}</h4>
                    <p className="text-xs text-neutral-600">{crop.fpoName}</p>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#6B8E4E]" />
                      {crop.locationDistrict}, {crop.locationState}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Pricing, Packaging & Order Controls */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E4E]">
                  {crop.category} • {crop.variety}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2727] font-['Outfit'] mt-1">
                  {crop.title}
                </h2>
                <p className="text-neutral-600 text-sm mt-2 leading-relaxed">
                  {crop.description}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF8] p-4 rounded-2xl border border-[#E0EAE0]">
                <div>
                  <span className="text-xs text-neutral-500">{t('common.retailSample', 'Retail / Sample Price')}</span>
                  <div className="text-2xl font-extrabold text-[#1B2727] font-mono">
                    ₹{crop.pricePerKg} <span className="text-xs font-normal text-neutral-500">/ {t('cropDetail.kg', 'kg')}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{t('cropDetail.minOrder', 'Min Order')}: {crop.minOrderKg} {t('cropDetail.kg', 'kg')}</span>
                </div>

                <div className="border-l border-neutral-200 pl-4">
                  <span className="text-xs text-neutral-500">{t('common.bulkRate', 'Wholesale Quintal Rate')}</span>
                  <div className="text-2xl font-extrabold text-[#6B8E4E] font-mono">
                    ₹{crop.pricePerQuintal} <span className="text-xs font-normal text-neutral-500">/ {t('cropDetail.qtl', 'Qtl')}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {t('common.mandiMsp', 'MSP Benchmark')}: ₹{crop.mandiMspPrice}/{t('cropDetail.qtl', 'Qtl')}
                  </span>
                </div>
              </div>

              {/* Packaging & Logistics Note */}
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#6B8E4E]" />
                  <span><strong>{t('common.packaging', 'Packaging')}:</strong> {crop.packagingType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6B8E4E]" />
                  <span><strong>{t('common.logistics', 'Logistics')}:</strong> {t('cropDetail.logisticsDesc', 'Available for direct farmgate pickup or KrishiLogix reefer transport')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#6B8E4E]" />
                  <span><strong>{t('common.escrowProtection', 'Escrow Protection')}:</strong> {t('cropDetail.escrowDesc', 'Payment released to farmer only after buyer quality sign-off')}</span>
                </div>
              </div>

              {/* Quantity Selector & Live Total */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    {t('common.selectQuantity', 'Select Procurement Quantity')}:
                  </span>
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                    <button
                      onClick={() => setUnit('quintal')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                        unit === 'quintal' ? 'bg-[#3C5148] text-white' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {t('common.quintals', 'Quintals (100 kg)')}
                    </button>
                    <button
                      onClick={() => setUnit('kg')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                        unit === 'kg' ? 'bg-[#3C5148] text-white' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {t('common.kilograms', 'Kilograms')}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-base font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center font-bold font-mono text-sm py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-base font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-xs text-neutral-500">{t('common.estimatedTotal', 'Estimated Total (Ex-Farmgate)')}:</span>
                    <div className="text-2xl font-black text-[#1B2727] font-mono">
                      ₹{calculatedTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order / Add to Cart Action */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#6B8E4E] hover:bg-[#5a7942] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('common.addToCartQuantity', 'Add to Cart')} {quantity} {unit === 'quintal' ? t('cropDetail.quintalUnit', 'Quintal(s)') : t('cropDetail.kg', 'Kg')}</span>
                </button>
              </div>

              {/* Direct Inquiry to FPO */}
              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#3C5148]" />
                    {t('common.bulkInquiries', 'Bulk Inquiries & Custom Specifications')}
                  </span>
                  <span className="text-[11px] text-neutral-400">{t('cropDetail.responseTime', 'Response within 2h')}</span>
                </div>

                {showInquirySent ? (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('cropDetail.inquirySent', 'Inquiry sent to')} {crop.farmerName}! {t('cropDetail.inquirySentDesc', 'Their FPO coordinator will contact you.')}
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('cropDetail.inquiryPlaceholder', 'e.g. Need 50 Qtl sample delivered to Delhi NCR...')}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      required
                      className="flex-1 text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6B8E4E]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#3C5148] hover:bg-[#253630] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {t('common.sendRfq', 'Send RFQ')}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
