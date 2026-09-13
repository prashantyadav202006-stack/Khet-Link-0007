import { Order, CropProduct } from '../types';

/**
 * Generate official Indian Farmgate Mandi Bilty receipt text for WhatsApp sharing
 */
export function generateOrderBiltyWhatsApp(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const itemsList = order.items
    .map(
      (it, idx) =>
        `  ${idx + 1}. *${it.crop.title}* (${it.crop.variety})\n     • मात्रा (Qty): ${it.quantity} ${it.unit}\n     • दर (Rate): ₹${
          it.unit === 'quintal' ? it.crop.pricePerQuintal : it.crop.pricePerKg
        }/${it.unit}`
    )
    .join('\n');

  return `📜 *खेत लिंक - राष्ट्रीय मंडी ई-बिल्टी व तौल पर्ची*
🏛️ *e-NAM व ONDC कृषि नोड प्रमाणित*
━━━━━━━━━━━━━━━━━━━━━━━━
🔢 *बिल्टी संख्या (Order #)*: ${order.orderNumber}
📅 *दिनांक (Date)*: ${dateStr}

👨‍🌾 *विक्रेता किसान / एफपीओ (Consignor)*:
• नाम: *${order.farmerName}*
• FPO समिति: ${order.fpoName}

🏢 *क्रेता / हॉस्टल मेस (Consignee)*:
• संस्था: *${order.buyerName}*
• प्रकार: ${order.buyerType || 'थोक संस्थान / हॉस्टल मेस'}

🌾 *फसल लॉट व तौल विवरण (Harvest Lots)*:
${itemsList}

💰 *भुगतान व एस्क्रो गारंटी (Financials)*:
• फसल मूल्य (Subtotal): ₹${order.subtotal.toLocaleString('en-IN')}
• कोल्ड-चेन ढुलाई (Logistics): ₹${order.logisticsFee.toLocaleString('en-IN')}
• मंडी शुल्क (APMC Cess): ₹0 (फार्मगेट सीधा व्यापार छूट)
• *कुल एस्क्रो राशि (Total)*: *₹${order.totalAmount.toLocaleString('en-IN')}*

🛡️ *एस्क्रो सुरक्षा स्थिति*: 🔒 ${order.escrowStatus}
🚚 *डिलीवरी स्थिति*: ${order.deliveryStatus} (${order.estimatedDelivery})
📍 *गंतव्य (Destination)*: ${order.deliveryAddress}

━━━━━━━━━━━━━━━━━━━━━━━━
✅ *यह पर्ची खेत लिंक डिजिटल एस्क्रो अनुबंध के तहत 100% सुरक्षित है।*
🌐 लाइव ट्रैकिंग: https://prashantyadav202006-stack.github.io/Khet-Link-0007/`;
}

/**
 * Generate harvest lot share message for WhatsApp
 */
export function generateCropShareWhatsApp(crop: CropProduct): string {
  return `🌾 *खेत लिंक - सीधा खेत से ताज़ा फसल लॉट उपलब्ध!*
━━━━━━━━━━━━━━━━━━━━━━━━
🌱 *फसल*: *${crop.title}* (${crop.variety})
📍 *स्थान*: ${crop.locationDistrict}, ${crop.locationState}

👨‍🌾 *किसान / FPO*: *${crop.farmerName}* (${crop.fpoName})
📦 *उपलब्ध मात्रा*: *${crop.quantityAvailableQuintals} क्विंटल*
🌿 *गुणवत्ता*: ${crop.grade} • ${crop.isOrganic ? 'प्रमाणित जैविक (NPOP Organic)' : 'प्राकृतिक खेती'}
💧 *नमी (Moisture Assay)*: ${crop.moisturePercent}%

💰 *फार्मगेट सीधा भाव*:
• थोक भाव: *₹${crop.pricePerQuintal}/क्विंटल*
• खुदरा/सैंपल: ₹${crop.pricePerKg}/किलो
• सरकारी MSP बेंचमार्क: ₹${crop.mandiMspPrice}/क्विंटल

🛡️ 100% एस्क्रो बैंक सुरक्षा एवं फार्मगेट लैब जांच गारंटी!
🔗 तुरंत आर्डर बुक करें: https://prashantyadav202006-stack.github.io/Khet-Link-0007/`;
}

/**
 * Open native WhatsApp or WhatsApp Web with prefilled message
 */
export function openWhatsAppShare(text: string, phone: string = '') {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
