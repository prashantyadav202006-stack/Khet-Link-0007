import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Download, 
  ChevronRight, 
  Sparkles, 
  PhoneCall, 
  RotateCcw, 
  Check 
} from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface OrderManagementProps {
  orders: Order[];
  onAdvanceOrderStep: (orderId: string) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onAdvanceOrderStep
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const { t } = useLanguage();

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B8E4E] mb-1">
            <Truck className="w-4 h-4" />
            {t('orders.badge', 'Live Cold-Chain Telemetry')}
          </div>
          <h1 className="text-3xl font-bold text-[#1B2727] font-['Outfit']">
            {t('common.orderLifecycle', 'Order Lifecycle & Escrow Settlement')}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {t('common.orderLifecycleSub', 'Real-time farmgate-to-warehouse tracking with automated T+0 escrow release upon delivery verification.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#E8EFE8] text-[#3C5148] font-bold px-3 py-1.5 rounded-xl border border-[#D5E1D5]">
            🛡️ {t('orders.protection', '100% Escrow Protection Active')}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1B2727]">{t('orders.noOrders', 'No active orders found')}</h3>
          <p className="text-neutral-500 text-sm">
            {t('orders.noOrdersDesc', 'Visit the marketplace to place a procurement order or test a farmgate batch.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Orders List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
              Procurement Orders ({orders.length})
            </h3>
            
            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = ord.id === selectedOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B2727] text-white border-[#3C5148] shadow-md'
                        : 'bg-white text-[#1B2727] border-neutral-200 hover:border-neutral-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">#{ord.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-[#6B8E4E] text-white' 
                          : 'bg-[#E8EFE8] text-[#3C5148]'
                      }`}>
                        {ord.deliveryStatus}
                      </span>
                    </div>

                    <p className={`text-xs mt-1 truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {ord.farmerName} • {ord.fpoName}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-200/20 text-xs">
                      <span className={`font-mono font-bold ${isSelected ? 'text-[#B2C5B2]' : 'text-[#6B8E4E]'}`}>
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tracking Visualizer & Controls (8 Cols) */}
          {selectedOrder && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#1B2727] font-['Outfit']">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                      {selectedOrder.escrowStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Direct Farmgate Origin: <strong>{selectedOrder.fpoName}</strong> ({selectedOrder.farmerName})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInvoiceModalOrder(selectedOrder)}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span>{t('orders.viewInvoice', 'View Invoice / E-Way Bill')}</span>
                  </button>

                  <button
                    id="btn-advance-simulation-step"
                    onClick={() => onAdvanceOrderStep(selectedOrder.id)}
                    className="px-4 py-2 bg-[#6B8E4E] hover:bg-[#5a7942] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('orders.simulateNext', 'Simulate Next Step')}</span>
                  </button>
                </div>
              </div>

              {/* Items Purchased in Consignment */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('orders.consignment', 'Consignment Manifest')}</span>
                <div className="divide-y divide-neutral-100 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img 
                          src={item.crop.imageUrl} 
                          alt={item.crop.title} 
                          className="w-8 h-8 rounded-lg object-cover" 
                        />
                        <span className="font-bold text-[#1B2727]">
                          {item.quantity} {item.unit}(s) - {item.crop.title}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-neutral-700">
                        ₹{(item.unit === 'quintal' ? item.crop.pricePerQuintal * item.quantity : item.crop.pricePerKg * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Step Visual Tracking Timeline */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Shipment & Escrow Verification Milestones
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    Est Delivery: {selectedOrder.estimatedDelivery}
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {selectedOrder.trackingSteps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 text-xs">
                      
                      {/* Step node icon */}
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        step.completed 
                          ? 'bg-[#3C5148] border-[#3C5148] text-white' 
                          : step.current 
                            ? 'bg-amber-400 border-amber-500 text-white animate-pulse' 
                            : 'bg-white border-neutral-300 text-neutral-400'
                      }`}>
                        {step.completed ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-sm ${step.completed || step.current ? 'text-[#1B2727]' : 'text-neutral-400'}`}>
                            {step.label}
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400">{step.date}</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Driver & Telemetry Card */}
              {selectedOrder.vehicleNumber && (
                <div className="p-4 rounded-2xl bg-[#EBF3EB] border border-[#CDE1CD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-[#1B2727] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#3C5148]" />
                      Assigned Transporter: {selectedOrder.transporterName}
                    </div>
                    <p className="text-neutral-600 mt-0.5">
                      Vehicle: <strong>{selectedOrder.vehicleNumber}</strong> • GPS Speed: 52 km/h
                    </p>
                  </div>
                  <a
                    href="tel:+919876500000"
                    className="px-3.5 py-2 bg-[#3C5148] hover:bg-[#253630] text-white font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {t('orders.callTransporter', 'Call Transporter')}
                  </a>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Invoice & Tax Modal */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-neutral-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B8E4E]">{t('orders.govCompliant', 'Government Compliant')}</span>
                <h3 className="text-xl font-bold text-[#1B2727]">{t('orders.invoiceTitle', 'Digital Tax Invoice & E-Way Bill')}</h3>
              </div>
              <button 
                onClick={() => setInvoiceModalOrder(null)}
                className="text-neutral-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 font-mono">
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span className="font-bold">INV-KS-2026-{invoiceModalOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(invoiceModalOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Consignor (Farmer):</span>
                <span>{invoiceModalOrder.farmerName} ({invoiceModalOrder.fpoName})</span>
              </div>
              <div className="flex justify-between">
                <span>Consignee (Buyer):</span>
                <span>{invoiceModalOrder.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mandi Cess (APMC):</span>
                <span className="text-emerald-700 font-bold">0.0% (Farmgate Direct Exemption)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm text-[#1B2727]">
                <span>Total Escrow Amount:</span>
                <span>₹{invoiceModalOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Downloaded Invoice #INV-KS-2026-${invoiceModalOrder.orderNumber}.pdf`);
                setInvoiceModalOrder(null);
              }}
              className="w-full py-3 bg-[#3C5148] hover:bg-[#253630] text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('orders.downloadPdf', 'Download Digital Signed PDF')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
