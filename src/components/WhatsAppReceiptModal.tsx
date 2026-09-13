import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Sprout, 
  Building2, 
  Truck, 
  Package, 
  QrCode, 
  Award,
  Phone
} from 'lucide-react';
import { Order } from '../types';
import { generateOrderBiltyWhatsApp, openWhatsAppShare } from '../utils/whatsappShare';

interface WhatsAppReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppReceiptModal: React.FC<WhatsAppReceiptModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const rawText = generateOrderBiltyWhatsApp(order);

  const handleShareWhatsApp = () => {
    openWhatsAppShare(rawText, recipientPhone);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="whatsapp-bilty-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden relative my-auto max-h-[94vh] flex flex-col font-['Plus_Jakarta_Sans']"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#061F16] via-[#0E3827] to-[#082419] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1E523D] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold font-['Outfit'] text-white">
                  राष्ट्रीय मंडी ई-बिल्टी व रसीद
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-400/30">
                  ONDC Node
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                सीधा खेत से मंडी खरीद तौल पर्ची • WhatsApp शेयरिंग
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-[#F9FAF9]">
          
          {/* Official Mandi Bilty Slip Paper Container */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-dashed border-[#A7D7B9] shadow-sm space-y-4 relative">
            
            {/* Watermark badge */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#1B523D]">
                  KHET LINK FARMGATE NETWORK
                </span>
                <h4 className="text-sm sm:text-base font-black text-neutral-900 font-['Outfit']">
                  डिजिटल तौल व डिस्पैच पर्ची (Bilty # {order.orderNumber})
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full block">
                  100% एस्क्रो सुरक्षित
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Consignor (Farmer) & Consignee (Buyer) Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F4F9F5] p-3 rounded-xl border border-[#D8EADB]">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>विक्रेता किसान (Consignor):</span>
                </span>
                <p className="font-bold text-neutral-900">{order.farmerName}</p>
                <p className="text-neutral-600 text-[11px]">{order.fpoName}</p>
                <span className="inline-block text-[9px] bg-white px-1.5 py-0.2 rounded border text-emerald-700 font-bold">
                  ✓ NABL लैब प्रमाणित
                </span>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l sm:pl-3 border-[#D8EADB]">
                <span className="text-[10px] text-neutral-600 font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>क्रेता संस्था (Consignee):</span>
                </span>
                <p className="font-bold text-neutral-900">{order.buyerName}</p>
                <p className="text-neutral-600 text-[11px]">{order.buyerType || 'हॉस्टल मेस / थोक खाद्य उद्योग'}</p>
                <p className="text-neutral-500 text-[10px] line-clamp-1">{order.deliveryAddress}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block">
                फसल लॉट व मात्रा विवरण:
              </span>
              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-600 text-[11px] font-bold uppercase">
                    <tr>
                      <th className="p-2.5">फसल व किस्म</th>
                      <th className="p-2.5 text-center">मात्रा</th>
                      <th className="p-2.5 text-right">दर</th>
                      <th className="p-2.5 text-right">कुल</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {order.items.map((it) => (
                      <tr key={it.crop.id} className="text-neutral-800">
                        <td className="p-2.5 font-medium">
                          <p className="font-bold">{it.crop.title}</p>
                          <span className="text-[10px] text-neutral-500">{it.crop.variety} • Grade {it.crop.grade}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          ₹{it.unit === 'quintal' ? it.crop.pricePerQuintal : it.crop.pricePerKg}/{it.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#1B523D]">
                          ₹{((it.unit === 'quintal' ? it.crop.pricePerQuintal : it.crop.pricePerKg) * it.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FAFBF9] p-3 rounded-xl border border-neutral-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>उपज मूल्य (Subtotal):</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>कोल्ड-चेन ढुलाई शुल्क (Logistics):</span>
                <span>₹{order.logisticsFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>मंडी शुल्क (APMC Cess Exempt):</span>
                <span className="text-emerald-700 font-bold">₹0 (छूट)</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-neutral-200 text-sm font-black text-neutral-900">
                <span>कुल एस्क्रो संरक्षित राशि:</span>
                <span className="text-emerald-700">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Simulated Barcode & Security Stamp */}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs p-1">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="text-[10px] text-neutral-500">
                  <p className="font-mono font-bold text-neutral-800">AUTH: KS-ESCROW-{order.orderNumber}</p>
                  <p>RBI Regulated Digital Escrow Vault</p>
                </div>
              </div>
              <div className="border border-emerald-600 text-emerald-700 text-[9px] font-black uppercase px-2 py-1 rounded rotate-[-3deg]">
                ✓ VERIFIED FARMGATE BILTY
              </div>
            </div>

          </div>

          {/* WhatsApp Direct Send Form */}
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>सीधे नंबर पर भेजें (वैकल्पिक):</span>
              </label>
              <span className="text-[10px] text-emerald-700">खाली छोड़ने पर चैट सूची खुलेगी</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-neutral-700 shrink-0">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                placeholder="उदा. 98765 43210 (किसान / मेस मैनेजर नंबर)"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="flex-1 py-2 px-3 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-600 text-neutral-800"
              />
            </div>
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">कॉपी हो गई!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>पर्ची टेक्स्ट कॉपी करें</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="प्रिंट या पीडीएफ सेव करें"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">प्रिंट</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-[#25D366] to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp पर पर्ची भेजें</span>
          </button>
        </div>

      </div>
    </div>
  );
};
