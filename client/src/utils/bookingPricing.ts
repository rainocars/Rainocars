import { AppSettings, PickupDropMode } from '@/types';

export function getDeliveryCharges(
  pickupMode: PickupDropMode,
  dropMode: PickupDropMode,
  settings: AppSettings
) {
  return {
    pickupCharge: pickupMode === 'SELF' ? 0 : settings.pickupDeliveryCharge,
    dropCharge: dropMode === 'SELF' ? 0 : settings.dropDeliveryCharge,
  };
}

export function calculateBookingTotals(
  baseAmount: number,
  pickupCharge: number,
  dropCharge: number
) {
  const subtotal = baseAmount + pickupCharge + dropCharge;
  const tax = subtotal * 0.18;
  return {
    subtotal,
    tax,
    grandTotal: Math.round(subtotal + tax),
  };
}
