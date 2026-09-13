import { Order } from '../types';

/**
 * Statuses that represent a fully completed/settled transaction.
 * An order is considered "settled" when:
 *  - deliveryStatus is 'Delivered'  AND/OR
 *  - escrowStatus is 'Released to Farmer'
 *
 * We use escrowStatus as the primary signal because it directly
 * represents money having been transferred to the farmer.
 */
const SETTLED_ESCROW_STATUSES: string[] = ['Released to Farmer', 'Escrow Released / Farmer Paid'];
const SETTLED_DELIVERY_STATUSES: string[] = ['Delivered', 'Delivered & Verified', 'Escrow Released'];

/**
 * Calculates the total trade value from settled/completed orders.
 * An order counts as settled if its escrowStatus is 'Released to Farmer'
 * OR its deliveryStatus is 'Delivered'.
 *
 * @param orders - Array of Order objects from the application state
 * @returns The total settled trade value in INR (number)
 */
export function calculateSettledTradeValue(orders: Order[]): number {
  return orders
    .filter(
      (order) =>
        SETTLED_ESCROW_STATUSES.includes(order.escrowStatus) ||
        SETTLED_DELIVERY_STATUSES.includes(order.deliveryStatus)
    )
    .reduce((total, order) => total + (order.totalAmount || 0), 0);
}

/**
 * Formats an INR value into a human-readable string with appropriate unit.
 *  - Values >= 1 Crore  →  "₹X.XX Cr"
 *  - Values >= 1 Lakh   →  "₹X.XX Lakh"
 *  - Values >= 1000     →  "₹X,XXX"  (with Indian locale formatting)
 *  - Values < 1000      →  "₹X"
 *  - Zero               →  "₹0"
 *
 * @param value - The numeric INR value
 * @returns An object with { display, unit } for flexible rendering
 */
export function formatINRValue(value: number): {
  display: string;
  unit: string;
  rawDisplay: string;
} {
  if (value === 0) {
    return { display: '0', unit: '', rawDisplay: '₹0' };
  }

  const crore = 10000000;
  const lakh = 100000;

  if (value >= crore) {
    const croreVal = value / crore;
    // Show up to 2 decimal places, strip trailing zeros
    const formatted = croreVal % 1 === 0
      ? croreVal.toFixed(0)
      : parseFloat(croreVal.toFixed(2)).toString();
    return { display: formatted, unit: 'Cr', rawDisplay: `₹${formatted} Cr` };
  }

  if (value >= lakh) {
    const lakhVal = value / lakh;
    const formatted = lakhVal % 1 === 0
      ? lakhVal.toFixed(0)
      : parseFloat(lakhVal.toFixed(2)).toString();
    return { display: formatted, unit: 'Lakh', rawDisplay: `₹${formatted} Lakh` };
  }

  const formatted = value.toLocaleString('en-IN');
  return { display: formatted, unit: '', rawDisplay: `₹${formatted}` };
}

/**
 * Returns the count of settled orders.
 */
export function countSettledOrders(orders: Order[]): number {
  return orders.filter(
    (order) =>
      SETTLED_ESCROW_STATUSES.includes(order.escrowStatus) ||
      SETTLED_DELIVERY_STATUSES.includes(order.deliveryStatus)
  ).length;
}
