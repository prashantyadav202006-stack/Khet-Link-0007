import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ShoppingCart, 
  Eye, 
  TrendingUp, 
  Droplets, 
  PackageCheck 
} from 'lucide-react';
import { CropProduct } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CropCardProps {
  crop: CropProduct;
  onSelect: (crop: CropProduct) => void;
  onAddToCart: (crop: CropProduct, quantity: number, unit: 'kg' | 'quintal') => void;
  onViewFarmer: (farmerId: string) => void;
}

export const CropCard: React.FC<CropCardProps> = ({
  crop,
  onSelect,
  onAddToCart,
  onViewFarmer
}) => {
  const { t } = useLanguage();
  const percentAboveMsp = Math.round(((crop.pricePerQuintal - crop.mandiMspPrice) / crop.mandiMspPrice) * 100);

  return (
    <div 
      id={`crop-card-${crop.id}`}
      className="bg-white rounded-2xl border border-[#E2E8E2] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-[#6B8E4E]/50"
    >
      {/* Top Image Banner */}
      <div className="relative h-52 overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => onSelect(crop)}>
        <img 
          src={crop.imageUrl} 
          alt={crop.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
          <div className="flex flex-wrap gap-1.5">
            {crop.isOrganic && (
              <span className="text-[10px] font-bold bg-[#3C5148] text-[#B2C5B2] px-2.5 py-1 rounded-full border border-[#6B8E4E]/40 shadow-xs flex items-center gap-1">
                <span>🌿</span> {t('common.organic', 'NPOP Organic')}
              </span>
            )}
            <span className="text-[10px] font-semibold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
              {crop.grade}
            </span>
          </div>

          {crop.readyForDispatch && (
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <PackageCheck className="w-3 h-3" />
              {t('common.ready', 'Ready')}
            </span>
          )}
        </div>

        {/* Bottom Details on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#B2C5B2]" />
            <span className="font-medium text-neutral-200">{crop.locationDistrict}, {crop.locationState}</span>
          </div>
          <div className="text-[11px] font-mono bg-[#1B2727]/80 px-2 py-0.5 rounded border border-white/20">
            {crop.quantityAvailableQuintals} {t('market.qtlAvail', 'Qtl Avail.')}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Category & Variety */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#6B8E4E] uppercase tracking-wider">
              {crop.category} • {crop.variety}
            </span>
            <span className="text-neutral-500 font-medium flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-500" />
              {crop.moisturePercent}% {t('market.moist', 'Moist.')}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(crop)}
            className="font-bold text-[#1B2727] text-base leading-snug hover:text-[#6B8E4E] cursor-pointer line-clamp-1 transition-colors"
          >
            {crop.title}
          </h3>

          {/* Farmer & FPO attribution with Profile link */}
          <div className="flex items-center justify-between text-xs text-neutral-600 pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewFarmer(crop.farmerId);
              }}
              className="hover:text-[#3C5148] hover:underline flex items-center gap-1 text-left font-medium truncate max-w-[190px] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B8E4E] shrink-0" />
              <span className="truncate">{crop.farmerName}</span>
            </button>
            <span className="text-[10px] bg-[#E8EFE8] text-[#3C5148] font-bold px-1.5 py-0.5 rounded">
              {t('common.fpoVerified', 'FPO Verified')}
            </span>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="bg-[#F8FAF8] rounded-xl p-3 border border-[#E3EBE3] space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">{t('common.retailSample', 'Retail/Sample')}</span>
              <div className="text-xl font-extrabold text-[#1B2727] font-mono leading-none">
                ₹{crop.pricePerKg} <span className="text-xs font-normal text-neutral-500">/ kg</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">{t('common.bulkRate', 'Bulk Rate')}</span>
              <div className="text-sm font-bold text-[#6B8E4E] font-mono leading-none">
                ₹{crop.pricePerQuintal} <span className="text-[10px] font-normal text-neutral-500">/ Qtl</span>
              </div>
            </div>
          </div>

          {/* Mandi MSP Benchmark Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-200/60">
            <span className="text-neutral-500">{t('common.mandiMsp', 'Mandi MSP')}: ₹{crop.mandiMspPrice}/Qtl</span>
            <span className="font-bold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {percentAboveMsp >= 0 ? `+${percentAboveMsp}%` : `${percentAboveMsp}%`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id={`btn-view-${crop.id}`}
            onClick={() => onSelect(crop)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1B2727] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            <span>{t('common.assaySheet', 'Lab Assay')}</span>
          </button>

          <button
            id={`btn-add-cart-${crop.id}`}
            onClick={() => onAddToCart(crop, 1, 'quintal')}
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-[#6B8E4E] hover:bg-[#5a7942] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>+ 1 Qtl</span>
          </button>
        </div>

      </div>
    </div>
  );
};
