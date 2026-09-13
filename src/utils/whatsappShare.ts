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
        `  ${idx + 1}. *${it.crop.title}* (${it.crop.variety})\n     Qty / मात्रा: ${it.quantity} ${it.unit}\n     Rate / दर: Rs.${
          it.unit === 'quintal' ? it.crop.pricePerQuintal : it.crop.pricePerKg
        }/${it.unit}`
    )
    .join('\n');

  return `*KHET LINK - DIGITAL MANDI e-BILTY / तौल पर्ची*
e-NAM & ONDC Agri Node Verified
--------------------------------------------
Order No. / बिल्टी संख्या: *${order.orderNumber}*
Date / दिनांक: ${dateStr}

*CONSIGNOR / विक्रेता किसान:*
Name: *${order.farmerName}*
FPO: ${order.fpoName}

*CONSIGNEE / क्रेता संस्था:*
Organisation: *${order.buyerName}*
Type: ${order.buyerType || 'Wholesale / Institutional Buyer'}

*HARVEST LOT DETAILS / फसल लॉट विवरण:*
${itemsList}

*PAYMENT & ESCROW SUMMARY / भुगतान विवरण:*
Produce Value (Subtotal): Rs.${order.subtotal.toLocaleString('en-IN')}
Cold-Chain Logistics: Rs.${order.logisticsFee.toLocaleString('en-IN')}
APMC Cess: Rs.0 (Farmgate Direct Trade Exempt)
*Total Escrow Amount: Rs.${order.totalAmount.toLocaleString('en-IN')}*

Escrow Status: ${order.escrowStatus}
Delivery Status: ${order.deliveryStatus} (${order.estimatedDelivery})
Destination: ${order.deliveryAddress}
--------------------------------------------
This receipt is issued under Khet Link Digital Escrow Agreement.
100% bank-secured settlement with Aadhaar-linked DBT.
Track live: https://prashantyadav202006-stack.github.io/Khet-Link-0007/`;
}

/**
 * Generate harvest lot share message for WhatsApp
 */
export function generateCropShareWhatsApp(crop: CropProduct): string {
  return `*KHET LINK - FRESH HARVEST LOT AVAILABLE*
Direct Farmgate Procurement
--------------------------------------------
Crop: *${crop.title}* (${crop.variety})
Location: ${crop.locationDistrict}, ${crop.locationState}

Farmer / FPO: *${crop.farmerName}* (${crop.fpoName})
Available Qty: *${crop.quantityAvailableQuintals} Quintals*
Quality Grade: ${crop.grade} | ${crop.isOrganic ? 'NPOP Certified Organic' : 'Natural Farming'}
Moisture Assay: ${crop.moisturePercent}%

*Farmgate Direct Pricing:*
Wholesale: *Rs.${crop.pricePerQuintal}/Quintal*
Retail / Sample: Rs.${crop.pricePerKg}/Kg
Govt. MSP Benchmark: Rs.${crop.mandiMspPrice}/Quintal

100% Escrow Bank Security & Farmgate Lab Assay Guarantee.
Order now: https://prashantyadav202006-stack.github.io/Khet-Link-0007/`;
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
