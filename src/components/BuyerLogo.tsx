import React from 'react';
import { Building2, ShieldCheck, ShoppingBag, GraduationCap, Leaf } from 'lucide-react';

interface BuyerLogoProps {
  logo?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  buyerName?: string;
}

export const PRESET_BUYER_LOGOS = [
  {
    id: 'preset-iit',
    name: 'IIT Delhi Hostel Mess & Canteen Co-op',
    type: 'College Hostel Mess',
    shortName: 'IITD Mess',
    tagline: 'Student Welfare & Dining Board',
    themeColor: 'from-[#6B1724] to-[#2B0E14]',
    accentColor: '#F59E0B'
  },
  {
    id: 'preset-aditi',
    name: 'Aditi Organic Foods Pvt Ltd',
    type: 'Wholesale Food Processor',
    shortName: 'Aditi Agro',
    tagline: 'Farmgate Organic Supply',
    themeColor: 'from-[#1B4D3E] to-[#0A261C]',
    accentColor: '#52B788'
  },
  {
    id: 'preset-freshmart',
    name: 'FreshMart Supermarkets Retail',
    type: 'Supermarket Retail Chain',
    shortName: 'FreshMart',
    tagline: 'Direct Daily Produce Supply',
    themeColor: 'from-[#C2410C] to-[#7C2D12]',
    accentColor: '#FB923C'
  }
];

export const BuyerLogo: React.FC<BuyerLogoProps> = ({
  logo = 'preset-aditi',
  className = '',
  size = 'md',
  buyerName = 'Buyer'
}) => {
  // Determine if logo is custom image URL (data URL or http link)
  const isCustomImage = logo && (logo.startsWith('data:image') || logo.startsWith('http') || logo.startsWith('blob:'));

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-18 h-18 sm:w-20 sm:h-20 text-2xl'
  };

  if (isCustomImage) {
    return (
      <div className={`relative shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-[#52B788]/60 bg-white flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <img 
          src={logo} 
          alt={buyerName} 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  // Detect preset from logo string or buyer name
  const isIIT = logo === 'preset-iit' || /iit|hostel|mess|canteen/i.test(buyerName);
  const isFreshMart = logo === 'preset-freshmart' || /freshmart|retail|supermarket/i.test(buyerName);
  // Default to Aditi Organic if not IIT or FreshMart
  const isAditi = !isIIT && !isFreshMart;

  if (isIIT) {
    return (
      <div 
        className={`relative shrink-0 rounded-2xl shadow-md border-2 border-amber-400/50 bg-gradient-to-br from-[#741525] via-[#4A0D17] to-[#2B080E] text-amber-300 flex flex-col items-center justify-center p-1 font-bold ${sizeClasses[size]} ${className}`}
        title="IIT Delhi Hostel Mess & Canteen Co-op"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
        <GraduationCap className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-8 h-8'} />
        {size === 'xl' && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 mt-1 font-mono">
            IITD MESS
          </span>
        )}
      </div>
    );
  }

  if (isFreshMart) {
    return (
      <div 
        className={`relative shrink-0 rounded-2xl shadow-md border-2 border-orange-400/50 bg-gradient-to-br from-[#C2410C] via-[#9A3412] to-[#431407] text-orange-200 flex flex-col items-center justify-center p-1 font-bold ${sizeClasses[size]} ${className}`}
        title="FreshMart Supermarkets Retail"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400/25 via-transparent to-transparent pointer-events-none rounded-2xl" />
        <ShoppingBag className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-8 h-8'} />
        {size === 'xl' && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200 mt-1 font-mono">
            FRESHMART
          </span>
        )}
      </div>
    );
  }

  // Aditi Organic Foods
  return (
    <div 
      className={`relative shrink-0 rounded-2xl shadow-md border-2 border-emerald-400/50 bg-gradient-to-br from-[#1B523D] via-[#123E2D] to-[#082218] text-emerald-200 flex flex-col items-center justify-center p-1 font-bold ${sizeClasses[size]} ${className}`}
      title="Aditi Organic Foods Pvt Ltd"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/25 via-transparent to-transparent pointer-events-none rounded-2xl" />
      <Leaf className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-8 h-8 text-[#74C69D]'} />
      {size === 'xl' && (
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 mt-1 font-mono">
          ADITI AGRO
        </span>
      )}
    </div>
  );
};
