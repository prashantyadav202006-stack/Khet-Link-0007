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
import { getCropImageUrl } from '../utils/cropImages';

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
  const lotIdentifier = `#LOT-${(crop.locationState || 'IN').slice(0, 2).toUpperCase()}-${crop.id.toUpperCase().slice(0, 6)}`;

  return (
    <div 
      id={`crop-card-${crop.id}`}
      className="bg-white rounded-md border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-[#1E523D]"
    >
      {/* Top Image Banner */}
      <div className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(crop)}>
        <img 
          src={getCropImageUrl(crop.title, crop.variety, crop.category)} 
          alt={crop.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />


        {/* Bottom Details on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white z-10">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3 text-emerald-300" />
            <span className="font-medium text-slate-200 text-[11px] truncate max-w-[140px]">{crop.locationDistrict}, {crop.locationState}</span>
          </div>
          <div className="text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded-sm text-slate-200 border border-white/20">
            {crop.quantityAvailableQuintals} {t('market.qtlAvail', 'Qtl')}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1">
          {/* Category & Variety */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold text-[#E65A00] uppercase tracking-wider">
              {crop.category} • {crop.variety}
            </span>
            <span className="text-slate-600 font-mono text-[11px] font-semibold flex items-center gap-1 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
              <Droplets className="w-3 h-3 text-sky-600" />
              {crop.moisturePercent}% {t('market.moist', 'Moist.')}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(crop)}
            className="font-bold text-[#0B192C] text-base leading-snug hover:text-emerald-800 cursor-pointer line-clamp-1 transition-colors font-['Outfit'] mt-0.5"
          >
            {crop.title}
          </h3>

          {/* Farmer & FPO attribution with Profile link */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewFarmer(crop.farmerId);
              }}
              className="hover:text-emerald-800 hover:underline flex items-center gap-1 text-left font-medium truncate max-w-[190px] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate text-slate-700">{crop.farmerName}</span>
            </button>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
              {t('common.fpoVerified', 'FPO Assayed')}
            </span>
          </div>
        </div>

        {/* Pricing Box in Tabular Monospace Format */}
        <div className="bg-slate-50 rounded-sm p-3 border border-slate-200 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium">{t('common.retailSample', 'Farmgate Rate')}</span>
              <div className="text-xl font-extrabold text-[#0B192C] font-mono leading-none">
                ₹{crop.pricePerKg} <span className="text-xs font-normal text-slate-500">/ {t('cropDetail.kg', 'kg')}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-medium">{t('common.bulkRate', 'Bulk Qtl Rate')}</span>
              <div className="text-sm font-bold text-emerald-800 font-mono leading-none">
                ₹{crop.pricePerQuintal} <span className="text-[10px] font-normal text-slate-500">/ {t('cropDetail.qtl', 'Qtl')}</span>
              </div>
            </div>
          </div>

          {/* Mandi MSP Benchmark Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/80 font-mono">
            <span className="text-slate-500 text-[10px]">{t('common.mandiMsp', 'MSP Benchmark')}: ₹{crop.mandiMspPrice}/{t('cropDetail.qtl', 'Qtl')}</span>
            <span className="font-bold text-emerald-700 flex items-center gap-0.5 text-[11px]">
              <TrendingUp className="w-3 h-3" />
              {percentAboveMsp >= 0 ? `+${percentAboveMsp}%` : `${percentAboveMsp}%`}
            </span>
          </div>
        </div>

        {/* Action Buttons with Crisp Rounded-sm Corners */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            id={`btn-view-${crop.id}`}
            onClick={() => onSelect(crop)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-sm bg-white hover:bg-slate-100 text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('common.assaySheet', 'Lab Assay')}</span>
          </button>

          <button
            id={`btn-add-cart-${crop.id}`}
            onClick={() => onAddToCart(crop, 1, 'quintal')}
            className="w-full py-2 px-3 text-xs font-bold rounded-sm bg-[#144231] hover:bg-[#1C5B44] text-white shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#2B7354]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t('common.addOneQtl', '+ 1 Qtl')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
