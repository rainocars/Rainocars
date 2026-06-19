import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PickupDropSelector from '@/components/PickupDropSelector';
import { useData } from '@/context/DataContext';
import { PickupDropMode } from '@/types';
import { getDeliveryCharges, calculateBookingTotals } from '@/utils/bookingPricing';

const BookingConfirm = () => {
  const navigate = useNavigate();
  const { getBookingDraft, setBookingDraft, getCarById, settings } = useData();
  const draft = getBookingDraft();
  const car = draft ? getCarById(draft.carId) : undefined;

  const [pickupMode, setPickupMode] = useState<PickupDropMode>(draft?.pickupMode || 'DELIVERY');
  const [dropMode, setDropMode] = useState<PickupDropMode>(draft?.dropMode || 'DELIVERY');
  const [pickup, setPickup] = useState(draft?.pickupLocation || '');
  const [drop, setDrop] = useState(draft?.dropLocation || '');
  const [requests, setRequests] = useState(draft?.specialRequests || '');

  const pricing = useMemo(() => {
    if (!draft) return null;
    const { pickupCharge, dropCharge } = getDeliveryCharges(pickupMode, dropMode, settings);
    const { tax, grandTotal } = calculateBookingTotals(draft.baseAmount, pickupCharge, dropCharge);
    return { pickupCharge, dropCharge, tax, grandTotal };
  }, [draft, pickupMode, dropMode, settings]);

  useEffect(() => {
    if (!draft || !car) {
      toast.error('No booking in progress');
      navigate('/cars');
    }
  }, [draft, car, navigate]);

  if (!draft || !car || !pricing) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const pickupLoc = pickupMode === 'SELF' ? settings.hubAddress : pickup.trim();
    const dropLoc = dropMode === 'SELF' ? settings.hubAddress : drop.trim();

    if (pickupMode === 'DELIVERY' && !pickup.trim()) {
      toast.error('Enter pickup delivery address');
      return;
    }
    if (dropMode === 'DELIVERY' && !drop.trim()) {
      toast.error('Enter drop-off delivery address');
      return;
    }

    setBookingDraft({
      ...draft,
      pickupMode,
      dropMode,
      pickupLocation: pickupLoc,
      dropLocation: dropLoc,
      pickupCharge: pricing.pickupCharge,
      dropCharge: pricing.dropCharge,
      tax: pricing.tax,
      grandTotal: pricing.grandTotal,
      specialRequests: requests.trim(),
    });
    navigate('/booking/payment');
  };

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-off-white/60">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link to="/cars" className="hover:text-accent">Cars</Link>
          <span>/</span>
          <span className="text-off-white">Confirm Booking</span>
        </div>

        <form onSubmit={handleContinue} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <h1 className="font-display text-3xl font-bold text-off-white">Finalize Your Booking</h1>

            <PickupDropSelector
              label="Pickup"
              mode={pickupMode}
              onModeChange={setPickupMode}
              deliveryCharge={settings.pickupDeliveryCharge}
              hubAddress={settings.hubAddress}
              location={pickup}
              onLocationChange={setPickup}
              locationLabel="Delivery address for pickup"
            />

            <PickupDropSelector
              label="Drop-off"
              mode={dropMode}
              onModeChange={setDropMode}
              deliveryCharge={settings.dropDeliveryCharge}
              hubAddress={settings.hubAddress}
              location={drop}
              onLocationChange={setDrop}
              locationLabel="Delivery address for return"
            />

            <Card className="space-y-2">
              <label className="text-sm text-off-white/60">Special requests</label>
              <textarea
                rows={3}
                value={requests}
                onChange={e => setRequests(e.target.value)}
                className="w-full rounded-xl border border-accent/15 bg-primary p-4 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
              />
            </Card>

            <Card className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
                <CheckCircle2 className="h-5 w-5 text-accent" /> Policy
              </h3>
              <p className="text-sm text-off-white/60">
                Self pickup/drop at our hub is free. Doorstep delivery charges apply per admin rates.
                Booking needs admin approval after payment.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 space-y-6">
              <h3 className="text-xl font-bold text-off-white">Order Summary</h3>
              <div className="flex gap-4">
                {car.images[0] && (
                  <img src={car.images[0]} alt={car.name} className="h-20 w-20 rounded-lg object-cover border border-accent/10" />
                )}
                <div>
                  <p className="font-bold text-off-white">{car.name}</p>
                  <p className="text-sm text-off-white/60">{draft.totalDays} days</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-off-white/60">
                  <span>Rental</span>
                  <span>₹{draft.baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-off-white/60">
                  <span>Pickup {pickupMode === 'SELF' ? '(self)' : '(delivery)'}</span>
                  <span>{pricing.pickupCharge === 0 ? '₹0' : `₹${pricing.pickupCharge}`}</span>
                </div>
                <div className="flex justify-between text-off-white/60">
                  <span>Drop {dropMode === 'SELF' ? '(self)' : '(delivery)'}</span>
                  <span>{pricing.dropCharge === 0 ? '₹0' : `₹${pricing.dropCharge}`}</span>
                </div>
                <div className="flex justify-between text-off-white/60">
                  <span>GST (18%)</span>
                  <span>₹{Math.round(pricing.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-accent/10 pt-3 font-bold text-accent">
                  <span>Total</span>
                  <span>₹{pricing.grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="primary" className="w-full py-4" type="submit">
                Proceed to Payment
              </Button>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BookingConfirm;
