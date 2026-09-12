import React from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Star, 
  FileCheck, 
  Phone, 
  Sprout, 
  Package 
} from 'lucide-react';
import { FarmerProfile, CropProduct } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FarmerProfileModalProps {
  farmer: FarmerProfile | null;
  farmerCrops: CropProduct[];
  onClose: () => void;
  onSelectCrop: (crop: CropProduct) => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({
  farmer,
  farmerCrops,
  onClose,
  onSelectCrop
}) => {
  if (!farmer) return null;

  const { t } = useLanguage();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="farmer-profile-modal-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 relative p-6 sm:p-8 space-y-6"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Farmer Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={farmer.avatarUrl}
            alt={farmer.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#6B8E4E] shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-[#1B2727] font-['Outfit']">{farmer.name}</h2>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t('farmerProfile.verifiedLeader', 'Verified FPO Leader')}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#3C5148]">{farmer.fpoName}</p>
            
            <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6B8E4E]" />
              {farmer.village}, {farmer.district}, {farmer.state}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-neutral-600">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {farmer.rating} ({farmer.reviewsCount} {t('common.reviews', 'reviews')})
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                {farmer.completedOrders} {t('common.ordersFulfilled', 'Orders Fulfilled')}
              </span>
            </div>
          </div>
        </div>

        {/* Bio Story */}
        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E5EDE5] text-xs text-neutral-700 leading-relaxed">
          <span className="font-bold text-[#1B2727] block mb-1">{t('farmerProfile.farmStory', 'Farm & Collective Story')}:</span>
          {farmer.bio}
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <span className="text-neutral-400 block text-[10px]">{t('common.landHolding', 'Land Holding')}</span>
            <span className="font-bold font-mono text-[#1B2727] text-base">{farmer.landAcres} {t('common.acres', 'Acres')}</span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <span className="text-neutral-400 block text-[10px]">{t('farmerProfile.collectivePool', 'Collective Pool')}</span>
            <span className="font-bold font-mono text-[#1B2727] text-base">{farmer.memberCount || 1} {t('farmerProfile.farmerUnit', 'Farmer')}{farmer.memberCount && farmer.memberCount > 1 ? 's' : ''}</span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <span className="text-neutral-400 block text-[10px]">{t('common.experience', 'Experience')}</span>
            <span className="font-bold font-mono text-[#1B2727] text-base">{farmer.experienceYears} {t('common.years', 'Years')}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-800">
            <span className="block text-[10px] text-emerald-600 font-bold">{t('common.soilHealthCard', 'Soil Health Card')}</span>
            <span className="font-bold text-xs flex items-center justify-center gap-1 mt-1">
              <FileCheck className="w-3.5 h-3.5" />
              {t('common.verified', 'Verified')}
            </span>
          </div>
        </div>

        {/* Farm Location, Irrigation & KYC Verification Badge (if available) */}
        {(farmer.kycDetails || farmer.bankDetails || farmer.nearestMandi) && (
          <div className="bg-[#F4F9F5] p-3.5 rounded-2xl border border-[#D0E5D7] space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-[#184533]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('farmerProfile.verifiedCredentials', 'Verified Agricultural Registry Credentials')}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {t('common.verifiedKyc', '100% KYC Verified')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
              {farmer.nearestMandi && (
                <div>
                  <span className="text-neutral-400 block">{t('farmerProfile.nearestMandi', 'Nearest APMC Mandi')}:</span>
                  <span className="font-bold text-neutral-800">{farmer.nearestMandi}</span>
                </div>
              )}
              {farmer.irrigationType && (
                <div>
                  <span className="text-neutral-400 block">{t('farmerProfile.irrigation', 'Irrigation System')}:</span>
                  <span className="font-bold text-neutral-800">{farmer.irrigationType}</span>
                </div>
              )}
              {farmer.bankDetails && (
                <div>
                  <span className="text-neutral-400 block">{t('farmerProfile.bankEscrow', 'Bank Escrow Account')}:</span>
                  <span className="font-bold text-neutral-800">
                    {farmer.bankDetails.bankName} (IFSC: {farmer.bankDetails.ifscCode}) • {farmer.bankDetails.dbtLinked ? t('farmerProfile.dbtLinked', 'DBT Linked ✓') : t('common.verified', 'Verified')}
                  </span>
                </div>
              )}
              {farmer.kycDetails && (
                <div>
                  <span className="text-neutral-400 block">{t('farmerProfile.landProof', 'Land Ownership Proof')}:</span>
                  <span className="font-bold text-neutral-800">
                    {farmer.kycDetails.landRecordType} ({farmer.kycDetails.landRecordNumber})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certifications List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            {t('farmerProfile.certifications', 'Accreditations & Certifications')}:
          </span>
          <div className="flex flex-wrap gap-2">
            {farmer.certifications.map((cert, idx) => (
              <span key={idx} className="text-xs bg-[#E8EFE8] text-[#3C5148] font-bold px-3 py-1 rounded-lg border border-[#D0E0D0] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#6B8E4E]" />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Active Produce from this Farmer */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              {t('farmerProfile.availableLots', 'Available Harvest Lots')} ({farmerCrops.length})
            </span>
          </div>

          <div className="space-y-2">
            {farmerCrops.map((crop) => (
              <div 
                key={crop.id}
                onClick={() => {
                  onClose();
                  onSelectCrop(crop);
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-[#6B8E4E] hover:bg-neutral-50 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={crop.imageUrl} 
                    alt={crop.title} 
                    className="w-10 h-10 rounded-lg object-cover" 
                  />
                  <div>
                    <h4 className="font-bold text-[#1B2727]">{crop.title}</h4>
                    <p className="text-[11px] text-neutral-500">
                      {crop.quantityAvailableQuintals} {t('farmerProfile.quintalsAvailable', 'Quintals available')} • {t('market.moisture', 'Moisture')}: {crop.moisturePercent}%
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold font-mono text-[#6B8E4E] text-sm">
                    ₹{crop.pricePerQuintal}/{t('cropDetail.qtl', 'Qtl')}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">{t('common.assaySheet', 'View Assay')} &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <a
            href={`tel:${farmer.phone}`}
            className="w-full py-3 bg-[#3C5148] hover:bg-[#253630] text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>{t('common.callDesk', 'Call FPO Coordination Desk')} ({farmer.phone})</span>
          </a>
        </div>

      </div>
    </div>
  );
};
