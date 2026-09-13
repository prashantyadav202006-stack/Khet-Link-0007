import React, { useState } from 'react';
import { 
  Play, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Store, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  TrendingUp,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DemoWalkthroughProps {
  onNavigate: (view: AppView) => void;
  onOpenCart: () => void;
  onOpenAuth: (role: 'farmer' | 'buyer') => void;
}

interface WalkthroughStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  highlight: string;
}

export const DemoWalkthrough: React.FC<DemoWalkthroughProps> = ({
  onNavigate,
  onOpenCart,
  onOpenAuth
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: WalkthroughStep[] = [
    {
      id: 0,
      icon: <Store className="w-5 h-5" />,
      title: 'Browse the Marketplace',
      description: 'Explore fresh harvest lots listed directly by verified farmers and FPOs. Each listing includes grade, moisture assay, and farmgate pricing.',
      action: () => { onNavigate('marketplace'); markDone(0); },
      actionLabel: 'Open Marketplace',
      highlight: 'See real crop listings with quality certificates'
    },
    {
      id: 1,
      icon: <ShoppingCart className="w-5 h-5" />,
      title: 'Add to Cart & Checkout',
      description: 'Select a produce lot, choose your quantity, and proceed to checkout. Funds are locked in a secure escrow — not released to the farmer until delivery.',
      action: () => { onNavigate('marketplace'); markDone(1); },
      actionLabel: 'Go to Marketplace',
      highlight: 'Click any crop card to add it to your cart'
    },
    {
      id: 2,
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Track Escrow & Order',
      description: 'Watch your order progress through 5 stages: Escrow Funded → Quality Assayed → Dispatched → In Transit → Delivered & Released.',
      action: () => { onNavigate('order-tracking'); markDone(2); },
      actionLabel: 'View Order Tracking',
      highlight: 'Advance demo orders through each stage'
    },
    {
      id: 3,
      icon: <Truck className="w-5 h-5" />,
      title: 'Farmer Dashboard',
      description: 'Switch to the farmer view to see listed inventory, incoming orders, and escrow settlement stats. Farmers can mark orders as delivered to trigger DBT release.',
      action: () => { onOpenAuth('farmer'); markDone(3); },
      actionLabel: 'Sign In as Farmer',
      highlight: 'Manage inventory and fulfill orders'
    },
    {
      id: 4,
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'AI Price Predictions',
      description: 'View ML-powered mandi price forecasts with confidence scores, optimal sell windows, and channel comparison analysis for major commodities.',
      action: () => { onNavigate('ai-predictions'); markDone(4); },
      actionLabel: 'View AI Predictions',
      highlight: 'Interactive charts with 30/60-day projections'
    }
  ];

  const markDone = (stepId: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
    if (stepId < steps.length - 1) {
      setCurrentStep(stepId + 1);
    }
  };

  const progressPercent = (completedSteps.size / steps.length) * 100;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E65A00] to-[#C44D00] text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border border-amber-400/40"
        title="Start guided demo"
      >
        <Play className="w-4 h-4" />
        <span className="hidden sm:inline">Start Demo</span>
        <span className="sm:hidden">Demo</span>
      </button>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-40 w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1B2727] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm font-['Outfit']">KhetLink Demo Walkthrough</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div 
            className="h-full bg-gradient-to-r from-[#6B8E4E] to-[#52B788] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step indicator pills */}
        <div className="px-4 pt-3 flex gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep 
                  ? 'bg-[#E65A00]' 
                  : completedSteps.has(idx) 
                    ? 'bg-[#52B788]' 
                    : 'bg-neutral-200'
              }`}
              title={`Step ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              completedSteps.has(currentStep)
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-[#E65A00]/10 text-[#E65A00]'
            }`}>
              {completedSteps.has(currentStep) 
                ? <CheckCircle2 className="w-5 h-5" />
                : step.icon
              }
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B2727]">
                Step {currentStep + 1}: {step.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlight tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-[11px] text-amber-800 font-medium">
              {step.highlight}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={step.action}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E65A00] hover:bg-[#C44D00] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <span>{step.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Completion state */}
        {completedSteps.size === steps.length && (
          <div className="px-4 pb-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-800">
                Demo walkthrough complete!
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                You have explored all key features of KhetLink.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
