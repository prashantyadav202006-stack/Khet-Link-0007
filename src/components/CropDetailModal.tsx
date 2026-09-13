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
  Phone,
  Send
} from 'lucide-react';
import { CropProduct } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateCropShareWhatsApp, openWhatsAppShare } from '../utils/whatsappShare';

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

  const lotIdentifier = `#LOT-${(crop.locationState || 'IN').slice(0, 2).toUpperCase()}-${crop.id.toUpperCase().slice(0, 6)}`;

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={crop.title}
    >
      <div 
        id="crop-detail-modal-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-md max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-300 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-sm bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center transition cursor-pointer border border-slate-700 shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* Left: Image & NABL Assaying Sheet */}
          <div className="md:col-span-5 bg-slate-50 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-4">
              
              {/* Product Photo with Angled NABL Rubber Stamp */}
              <div className="relative rounded-sm overflow-hidden h-60 shadow-xs border border-slate-200 bg-slate-900">
                <img 
                  src={crop.imageUrl} 
                  alt={crop.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Lot ID Badge */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                  <span className="text-[10px] font-mono font-bold bg-slate-950/90 text-amber-300 px-2 py-0.5 rounded-sm border border-slate-700 shadow-xs">
                    {lotIdentifier}
                  </span>
                  {crop.isOrganic && (
                    <span className="text-[9px] font-mono font-bold bg-[#138808] text-white px-2 py-0.5 rounded-sm border border-emerald-500/40 shadow-xs w-max">
                      🌿 {t('cropDetail.npopOrganic', 'NPOP Organic')}
                    </span>
                  )}
                </div>




                <div className="absolute bottom-2 left-2 right-2 bg-black/80 px-2 py-1 rounded-sm text-slate-300 text-[10px] font-mono flex items-center justify-between">
                  <span>{t('common.harvestDate', 'HARVEST')}: {crop.harvestDate}</span>
                  <span className="text-amber-300">{crop.quantityAvailableQuintals} {t('market.qtlAvail', 'Qtl Avail.')}</span>
                </div>
              </div>

              {/* Verified Digital Laboratory Quality Assaying Sheet (LandSync Inspired) */}
              <div className="bg-white rounded-sm p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#0B192C] flex items-center gap-1.5 font-['Outfit']">
                    <FileText className="w-4 h-4 text-[#1B3F75]" />
                    <span>{t('cropDetail.nablCertTitle', 'NABL Digital Assaying Certificate')}</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-300">
                    {t('cropDetail.nablPassed', 'NABL PASSED')}
                  </span>
                </div>

                {/* Tabular Assay Parameters */}
                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">{t('common.moistureContent', 'Moisture Content')}:</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {crop.moisturePercent}% <span className="text-[10px] font-normal text-emerald-700">({t('cropDetail.moistureLimit', 'Limit <12.0%')})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">{t('common.foreignMatter', 'Foreign Matter')}:</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      &lt; 0.2% <span className="text-[10px] font-normal text-emerald-700">({t('cropDetail.destoned', 'Destoned')})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">{t('cropDetail.assayLabRef', 'Assay Lab Ref')}:</span>
                    <span className="font-mono font-semibold text-slate-700 text-[11px]">
                      #NABL-TC-8891 / Karnal
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 text-[11px]">{t('common.shelfLife', 'Shelf Life')}:</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {crop.shelfLifeDays} {t('common.days', 'Days')}
                    </span>
                  </div>
                </div>

                {crop.organicCertNumber && (
                  <div className="pt-2 text-[10px] font-mono text-slate-600 border-t border-slate-200">
                    <span className="text-slate-400">APEDA / NPOP CERT:</span> {crop.organicCertNumber}
                  </div>
                )}
              </div>

              {/* Farmer & FPO Origin Box */}
              <div className="bg-white rounded-sm p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{t('common.farmOrigin', 'Farm Origin & Collective')}</span>
                  <button
                    onClick={() => onViewFarmer(crop.farmerId)}
                    className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {t('common.viewFullProfile', 'View Profile')} &rarr;
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[#0B2E21] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-[#1E523D]">
                    {crop.farmerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-['Outfit']">{crop.farmerName}</h4>
                    <p className="text-xs text-slate-600">{crop.fpoName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
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
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E65A00]">
                  {crop.category} • {crop.variety}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-['Outfit'] mt-1">
                  {crop.title}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  {crop.description}
                </p>
              </div>

              {/* Pricing Cards in Tabular Numbers Format */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-sm border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-medium">{t('common.retailSample', 'Retail / Sample Rate')}</span>
                  <div className="text-2xl font-extrabold text-[#0B192C] font-mono mt-0.5">
                    ₹{crop.pricePerKg} <span className="text-xs font-normal text-slate-500">/ {t('cropDetail.kg', 'kg')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{t('cropDetail.minOrder', 'Min Order')}: {crop.minOrderKg} {t('cropDetail.kg', 'kg')}</span>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[11px] text-slate-500 uppercase font-medium">{t('common.bulkRate', 'Wholesale Quintal Rate')}</span>
                  <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-0.5">
                    ₹{crop.pricePerQuintal} <span className="text-xs font-normal text-slate-500">/ {t('cropDetail.qtl', 'Qtl')}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    {t('common.mandiMsp', 'MSP Benchmark')}: ₹{crop.mandiMspPrice}/{t('cropDetail.qtl', 'Qtl')}
                  </span>
                </div>
              </div>

              {/* Packaging & Logistics Note */}
              <div className="space-y-2 text-xs text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#1B3F75]" />
                  <span><strong>{t('common.packaging', 'Packaging')}:</strong> {crop.packagingType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1B3F75]" />
                  <span><strong>{t('common.logistics', 'Logistics')}:</strong> {t('cropDetail.logisticsDesc', 'Available for direct farmgate pickup or KrishiLogix reefer transport')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B3F75]" />
                  <span><strong>{t('common.escrowProtection', 'Escrow Protection')}:</strong> {t('cropDetail.escrowDesc', 'Payment released to farmer only after buyer quality sign-off')}</span>
                </div>
              </div>

              {/* Quantity Selector & Live Total */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Outfit']">
                    {t('common.selectQuantity', 'Procurement Quantity')}:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-sm border border-slate-200">
                    <button
                      onClick={() => setUnit('quintal')}
                      className={`px-3 py-1 text-xs font-bold rounded-sm transition cursor-pointer ${
                        unit === 'quintal' ? 'bg-[#0B2E21] text-white shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      {t('common.quintals', 'Quintals (100 kg)')}
                    </button>
                    <button
                      onClick={() => setUnit('kg')}
                      className={`px-3 py-1 text-xs font-bold rounded-sm transition cursor-pointer ${
                        unit === 'kg' ? 'bg-[#0B2E21] text-white shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      {t('common.kilograms', 'Kilograms')}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-sm overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-base font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
                      className="px-3 py-2 text-base font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-[11px] text-slate-500 font-medium">{t('common.estimatedTotal', 'Estimated Total (Ex-Farmgate)')}:</span>
                    <div className="text-2xl font-black text-[#0B192C] font-mono">
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
                  className="flex-1 py-3 px-5 rounded-sm bg-[#144231] hover:bg-[#1C5B44] text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-[#2B7354]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('common.addToCartQuantity', 'Add to Cart')} {quantity} {unit === 'quintal' ? t('cropDetail.quintalUnit', 'Quintal(s)') : t('cropDetail.kg', 'Kg')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsAppShare(generateCropShareWhatsApp(crop))}
                  className="py-3 px-4 rounded-sm bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-600"
                  title="WhatsApp पर फसल पर्ची शेयर करें (Share Harvest Lot on WhatsApp)"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('orders.biltySlip', 'WhatsApp पर्ची')}</span>
                </button>
              </div>

              {/* Direct Inquiry to FPO */}
              <div className="bg-slate-50 rounded-sm p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1B3F75]" />
                    {t('common.bulkInquiries', 'Bulk Inquiries & Custom Specifications')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{t('cropDetail.responseTime', 'Response within 2h')}</span>
                </div>

                {showInquirySent ? (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-sm font-medium flex items-center gap-2 border border-emerald-200">
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
