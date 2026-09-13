import React from 'react';
import { 
  Lock, 
  Award, 
  Truck, 
  CheckCircle2, 
  Coins, 
  ShieldCheck, 
  ArrowRight,
  Check,
  Clock
} from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EscrowFlowDiagramProps {
  order: Order;
}

export const EscrowFlowDiagram: React.FC<EscrowFlowDiagramProps> = ({ order }) => {
  const { t } = useLanguage();

  // Determine active escrow stage (1 to 5)
  // 1: Order Placed
  // 2: FPO Accepted, Sample Collected, Quality Verified
  // 3: Dispatched, In Transit
  // 4: Delivered & Verified
  // 5: Escrow Released / Farmer Paid
  let currentStage = 1;
  const status = order.deliveryStatus;

  if (status === 'Order Placed') {
    currentStage = 1;
  } else if (status === 'FPO Accepted' || status === 'Sample Collected' || status === 'Quality Verified') {
    currentStage = 2;
  } else if (status === 'Dispatched' || status === 'In Transit') {
    currentStage = 3;
  } else if (status === 'Delivered & Verified') {
    currentStage = 4;
  } else if (status === 'Escrow Released' || order.escrowStatus === 'Escrow Released / Farmer Paid') {
    currentStage = 5;
  }

  const isCompleted = order.escrowStatus === 'Escrow Released / Farmer Paid' || status === 'Escrow Released';

  const stages = [
    {
      id: 1,
      title: t('escrow.stage1Title', 'Buyer Funded'),
      subtitle: t('escrow.stage1Sub', '100% Upfront in Nodal Vault'),
      icon: Lock,
      actor: t('escrow.stage1Actor', 'Buyer / Gateway')
    },
    {
      id: 2,
      title: t('escrow.stage2Title', 'Quality Verified'),
      subtitle: t('escrow.stage2Sub', 'NABL / Assay Grade Locked'),
      icon: Award,
      actor: t('escrow.stage2Actor', 'FPO / Assayer')
    },
    {
      id: 3,
      title: t('escrow.stage3Title', 'GPS Transit'),
      subtitle: t('escrow.stage3Sub', 'Telemetry & E-Way Bill Active'),
      icon: Truck,
      actor: t('escrow.stage3Actor', 'Logistics Partner')
    },
    {
      id: 4,
      title: t('escrow.stage4Title', 'Warehouse Receipt'),
      subtitle: t('escrow.stage4Sub', 'Physical Inspection & OTP'),
      icon: CheckCircle2,
      actor: t('escrow.stage4Actor', 'Buyer Receiving')
    },
    {
      id: 5,
      title: t('escrow.stage5Title', 'T+0 Settlement'),
      subtitle: t('escrow.stage5Sub', 'Instant Bank Payout to Kisan'),
      icon: Coins,
      actor: t('escrow.stage5Actor', 'Escrow Multi-Sig')
    }
  ];

  return (
    <div className="bg-[#1B2727] text-white rounded-3xl p-6 sm:p-7 border border-[#3C5148] space-y-6 shadow-md overflow-hidden relative">
      {/* Decorative subtle background gradient */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#6B8E4E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C3E3E] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#6B8E4E]/20 text-[#6B8E4E]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B2C5B2]">
              {t('escrow.diagramBadge', 'Automated Multi-Party Escrow Protocol')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">
            {t('escrow.diagramTitle', 'Farmgate-to-Warehouse Escrow Liquidity Journey')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
          }`}>
            {isCompleted ? '✓ Funds Fully Disbursed' : '🛡️ Funds Vault Protected'}
          </span>
        </div>
      </div>

      {/* Visual Stepper Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isPast = stage.id < currentStage || (stage.id === 5 && isCompleted);
          const isCurrent = stage.id === currentStage && !isCompleted;
          const isPending = stage.id > currentStage;

          return (
            <div 
              key={stage.id} 
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                isPast
                  ? 'bg-[#243535] border-[#445E54] text-white shadow-xs'
                  : isCurrent
                    ? 'bg-[#2E423E] border-[#6B8E4E] ring-2 ring-[#6B8E4E]/40 text-white shadow-md'
                    : 'bg-[#162020]/60 border-[#253636] text-neutral-400'
              }`}
            >
              {/* Header node */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                  isPast 
                    ? 'bg-emerald-900/60 text-emerald-300' 
                    : isCurrent 
                      ? 'bg-amber-900/60 text-amber-300 font-bold' 
                      : 'bg-neutral-800 text-neutral-400'
                }`}>
                  Step 0{stage.id}
                </span>

                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                  isPast
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                      ? 'bg-[#6B8E4E] text-white animate-bounce'
                      : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <h4 className={`text-xs font-bold leading-tight ${
                  isPast || isCurrent ? 'text-white' : 'text-neutral-400'
                }`}>
                  {stage.title}
                </h4>
                <p className="text-[11px] text-neutral-300 leading-snug line-clamp-2">
                  {stage.subtitle}
                </p>
              </div>

              {/* Actor attribution */}
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="truncate">{stage.actor}</span>
                {isCurrent && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Data Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="bg-[#141E1E] p-3 rounded-xl border border-[#2B3E36]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t('escrow.escrowId', 'Vault ID')}</span>
          <span className="font-mono font-bold text-white">ESC-2026-{order.orderNumber}</span>
        </div>

        <div className="bg-[#141E1E] p-3 rounded-xl border border-[#2B3E36]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t('escrow.vaultLocked', 'Protected Capital')}</span>
          <span className="font-mono font-bold text-emerald-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-[#141E1E] p-3 rounded-xl border border-[#2B3E36]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t('escrow.apmcCut', 'APMC Mandi Cess')}</span>
          <span className="font-mono font-bold text-emerald-300">₹0 (100% Direct)</span>
        </div>

        <div className="bg-[#141E1E] p-3 rounded-xl border border-[#2B3E36]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t('escrow.payoutTarget', 'Beneficiary FPO')}</span>
          <span className="font-semibold text-white truncate block">{order.fpoName}</span>
        </div>
      </div>
    </div>
  );
};
