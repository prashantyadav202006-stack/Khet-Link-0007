import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  MapPin, 
  Building2, 
  Lock,
  Send
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { WhatsAppReceiptModal } from './WhatsAppReceiptModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cropId: string, quantity: number, unit: 'kg' | 'quintal') => void;
  onRemoveItem: (cropId: string) => void;
  onCheckoutComplete: (newOrder: Order) => void;
  buyerName: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
  buyerName
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Plot 44, Food Processing Park, Sector 58, Mohali, Punjab - 160059');
  const [paymentMode, setPaymentMode] = useState<'escrow' | 'upi' | 'netbanking'>('escrow');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [isBiltyModalOpen, setIsBiltyModalOpen] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const rate = item.unit === 'quintal' ? item.crop.pricePerQuintal : item.crop.pricePerKg;
    return sum + rate * item.quantity;
  }, 0);

  // Total quintals
  const totalQuintals = items.reduce((sum, item) => {
    return sum + (item.unit === 'quintal' ? item.quantity : item.quantity / 100);
  }, 0);

  // Logistics fee (standard: ₹120 per quintal, min ₹500)
  const logisticsFee = items.length === 0 ? 0 : Math.max(500, Math.round(totalQuintals * 120));

  // Escrow protection fee (0.5%)
  const platformEscrowFee = Math.round(subtotal * 0.005);

  // Direct farmer mandi cess exemption savings (normally 1.5% in APMC)
  const mandiCessSaved = Math.round(subtotal * 0.015);

  const grandTotal = subtotal + logisticsFee + platformEscrowFee;

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const firstItem = items[0];
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `KS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      buyerName: buyerName || 'Bulk Procurement Partner',
      buyerType: 'FMCG Wholesaler',
      farmerName: firstItem ? firstItem.crop.farmerName : 'Assigned Collective',
      fpoName: firstItem ? firstItem.crop.fpoName : 'Malwa Kisan Producer Org',
      items: [...items],
      subtotal,
      logisticsFee,
      platformEscrowFee,
      totalAmount: grandTotal,
      escrowStatus: 'Held in Escrow',
      deliveryStatus: 'Order Placed',
      deliveryAddress,
      estimatedDelivery: 'Within 48-72 Hours',
      trackingSteps: [
        { step: '1', label: 'Order Placed & Escrow Funded', date: 'Just now', completed: true, current: true, description: `Rs.${grandTotal.toLocaleString('en-IN')} securely locked in KhetLink Escrow.` },
        { step: '2', label: 'FPO Order Accepted', date: 'Pending', completed: false, current: false, description: `Awaiting confirmation from ${firstItem ? firstItem.crop.fpoName : 'FPO'}.` },
        { step: '3', label: 'Quality Sample Collected', date: 'Pending', completed: false, current: false, description: 'Representative sample to be collected at FPO collection point for quality testing.' },
        { step: '4', label: 'Quality Verified', date: 'Pending', completed: false, current: false, description: 'Sample undergoing quality verification.' },
        { step: '5', label: 'Dispatched from FPO/Farmgate', date: 'Pending', completed: false, current: false, description: 'Awaiting quality approval before dispatch.' },
        { step: '6', label: 'In Transit', date: 'Pending', completed: false, current: false, description: 'Logistics tracking will activate after dispatch.' },
        { step: '7', label: 'Delivered & Delivery Verified', date: 'Pending', completed: false, current: false, description: 'Digital delivery verification pending.' },
        { step: '8', label: 'Escrow Released / Farmer Paid', date: 'Pending', completed: false, current: false, description: 'T+0 settlement after verified delivery.' },
      ]
    };

    setLastCreatedOrder(newOrder);
    onCheckoutComplete(newOrder);
    setIsSuccess(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-neutral-200 relative"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-[#1B2727] text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-['Outfit']">{t('cart.title', 'Procurement Cart')}</span>
            <span className="text-xs bg-[#6B8E4E] text-white px-2 py-0.5 rounded-full font-mono font-bold">
              {items.length} {t('common.batches', 'Batches')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success animation on checkout */}
        {isSuccess ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-[#1B2727] font-['Outfit']">
              {t('cart.escrowSuccess', 'Escrow Funded Successfully!')}
            </h3>
            <p className="text-sm text-neutral-600 max-w-xs">
              ₹{grandTotal.toLocaleString('en-IN')} {t('cart.escrowSuccessDesc', 'has been securely deposited into Khet Link Escrow. Transporter and FPO notified!')}
            </p>

            <div className="pt-3 flex flex-col gap-2.5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setIsBiltyModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-[#25D366] to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
              >
                <Send className="w-4 h-4" />
                <span>📱 {t('cart.shareBiltyWhatsApp', 'Share Mandi Receipt on WhatsApp')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                {t('common.done', 'Done')}
              </button>
            </div>
          </div>
        ) : isCheckingOut ? (
          /* Checkout View */
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1B2727]">{t('cart.confirmCheckout', 'Confirm Escrow Checkout')}</h3>
              <button 
                onClick={() => setIsCheckingOut(false)}
                className="text-xs text-[#6B8E4E] hover:underline font-semibold cursor-pointer"
              >
                &larr; {t('cart.backToCart', 'Back to Cart')}
              </button>
            </div>

            <form onSubmit={handleProcessOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {t('cart.deliveryDest', 'Delivery Destination Warehouse / Hostel Mess Canteen')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 focus:outline-none focus:border-[#6B8E4E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {t('cart.paymentMethod', 'Payment & Escrow Guarantee Method')}
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                    paymentMode === 'escrow' ? 'border-[#6B8E4E] bg-emerald-50/50' : 'border-neutral-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMode === 'escrow'}
                      onChange={() => setPaymentMode('escrow')}
                      className="accent-[#6B8E4E]"
                    />
                    <div>
                      <span className="font-bold text-[#1B2727] block">{t('cart.bankEscrow', 'Khet Link Bank Escrow Account')}</span>
                      <span className="text-[11px] text-neutral-500">{t('cart.bankEscrowDesc', 'Funds released only after warehouse quality verification')}</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                    paymentMode === 'upi' ? 'border-[#6B8E4E] bg-emerald-50/50' : 'border-neutral-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMode === 'upi'}
                      onChange={() => setPaymentMode('upi')}
                      className="accent-[#6B8E4E]"
                    />
                    <div>
                      <span className="font-bold text-[#1B2727] block">{t('cart.upiPayment', 'Corporate UPI / RuPay Commercial')}</span>
                      <span className="text-[11px] text-neutral-500">{t('cart.upiPaymentDesc', 'Instant T+0 credit authentication')}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bill preview */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.totalHarvestValue', 'Total Harvest Value')}:</span>
                  <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.farmgateLogistics', 'Farmgate Logistics (Reefer)')}:</span>
                  <span className="font-mono font-semibold">₹{logisticsFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{t('cart.escrowFee', 'Escrow Protection Fee (0.5%)')}:</span>
                  <span className="font-mono font-semibold">₹{platformEscrowFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('cart.mandiCessExempt', 'Mandi Cess Exemption (0%)')}:</span>
                  <span>-₹{mandiCessSaved.toLocaleString('en-IN')} {t('cart.saved', 'saved')}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-[#1B2727]">
                  <span>{t('cart.totalEscrow', 'Total Escrow Deposit')}:</span>
                  <span className="font-mono text-base text-[#6B8E4E]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('cart.escrowGuarantee', '100% Escrow Guarantee: Payment held by RBI regulated partner bank.')}</span>
              </div>

              <button
                type="submit"
                id="btn-confirm-escrow-payment"
                className="w-full py-3.5 bg-[#6B8E4E] hover:bg-[#5a7942] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{t('cart.depositLock', 'Deposit & Lock')} ₹{grandTotal.toLocaleString('en-IN')}</span>
              </button>
            </form>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-2xl">
              🛒
            </div>
            <h3 className="font-bold text-lg text-[#1B2727]">{t('cart.emptyTitle', 'Your procurement cart is empty')}</h3>
            <p className="text-xs text-neutral-500 max-w-xs">
              {t('cart.emptyDesc', "Explore Bharat's verified harvest lots and add direct produce or test samples.")}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#3C5148] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('cart.browseCrops', 'Browse Crop Marketplace')}
            </button>
          </div>
        ) : (
          /* Item List */
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {items.map((item) => {
              const rate = item.unit === 'quintal' ? item.crop.pricePerQuintal : item.crop.pricePerKg;
              const itemTotal = rate * item.quantity;

              return (
                <div 
                  key={item.crop.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex gap-3 items-start">
                    <img
                      src={item.crop.imageUrl}
                      alt={item.crop.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-[#1B2727] truncate">
                          {item.crop.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.crop.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        {item.crop.fpoName} • {item.crop.locationState}
                      </p>
                      <div className="text-xs font-mono font-bold text-[#6B8E4E] mt-1">
                        ₹{rate} / {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Unit controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-[10px]">
                      <button
                        onClick={() => onUpdateQuantity(item.crop.id, item.quantity, 'quintal')}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          item.unit === 'quintal' ? 'bg-[#3C5148] text-white' : 'text-neutral-600'
                        }`}
                      >
                        Qtl
                      </button>
                      <button
                        onClick={() => onUpdateQuantity(item.crop.id, item.quantity, 'kg')}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          item.unit === 'kg' ? 'bg-[#3C5148] text-white' : 'text-neutral-600'
                        }`}
                      >
                        Kg
                      </button>
                    </div>

                    <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.crop.id, Math.max(1, item.quantity - 1), item.unit)}
                        className="px-2 py-1 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold font-mono text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.crop.id, item.quantity + 1, item.unit)}
                        className="px-2 py-1 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">{t('cart.batchTotal', 'Batch Total')}</span>
                      <span className="font-bold font-mono text-xs text-[#1B2727]">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Checkout Summary */}
        {!isSuccess && !isCheckingOut && items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>{t('cart.produceValue', 'Produce Value')} ({totalQuintals.toFixed(1)} {t('cropDetail.qtl', 'Qtl')}):</span>
                <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.reeferLogistics', 'Direct Reefer Logistics')}:</span>
                <span className="font-mono font-semibold">₹{logisticsFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t('cart.cessSaved', '0% Mandi Cess Saved')}:</span>
                <span>-₹{mandiCessSaved.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-[#1B2727]">
                <span>{t('cart.grandTotal', 'Total Escrow Amount')}:</span>
                <span className="font-mono text-base text-[#6B8E4E]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              id="proceed-to-escrow-checkout-btn"
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3.5 bg-[#6B8E4E] hover:bg-[#5a7942] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('cart.placeOrder', 'Proceed to Escrow Checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* WhatsApp Mandi Bilty Receipt Modal */}
      <WhatsAppReceiptModal
        order={lastCreatedOrder}
        isOpen={isBiltyModalOpen}
        onClose={() => setIsBiltyModalOpen(false)}
      />
    </div>
  );
};
