import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, MessageCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { initiateRazorpayPayment } from '@/utils/payment';

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { bookings, getCarById, refresh } = useData();
  const [isProcessing, setIsProcessing] = useState(false);

  const booking = bookings.find((b: any) => b.id === id || b._id === id);
  const car = booking ? getCarById(booking.carId) : undefined;

  const handlePayNow = async () => {
    if (!user || !booking) return;
    setIsProcessing(true);
    try {
      await initiateRazorpayPayment({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'INR',
        carName: car?.name || 'Vehicle',
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        },
        onSuccess: async () => {
          setIsProcessing(false);
          toast.success('Payment received & booking confirmed!');
          await refresh();
        },
        onCancel: () => {
          setIsProcessing(false);
        },
        onError: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return (
      <div className="text-center text-off-white/60 py-12">
        <p>Booking not found</p>
        <Button variant="primary" asChild className="mt-4">
          <Link to="/dashboard/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/bookings" className="gap-2 text-off-white/60 hover:text-off-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold text-off-white">Booking Details</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="surface" size="sm" asChild>
            <Link to={`/dashboard/bookings/${booking.id}/chat`} className="gap-2">
              <MessageCircle className="h-4 w-4" /> Chat with Admin
            </Link>
          </Button>
          <Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'surface'}>
            {booking.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="space-y-6 lg:col-span-2">
          {car?.images[0] && (
            <img src={car.images[0]} alt={car.name} className="h-48 w-full rounded-xl object-cover border border-accent/10" />
          )}
          <h3 className="font-display text-2xl font-bold text-off-white">{car?.name || 'Vehicle'}</h3>
          {booking.status === 'PENDING' && (
            <p className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              Waiting for admin approval. You will receive a notification once confirmed.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-off-white/80">
              <Calendar className="h-5 w-5 text-accent" />
              <span>
                {format(new Date(booking.startDate), 'MMM d, yyyy')} – {format(new Date(booking.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-off-white/80">
              <MapPin className="h-5 w-5 text-accent" />
              <span>
                Pickup: {booking.pickupMode === 'SELF' ? 'Self at hub' : booking.pickupLocation}
                {' '}(₹{booking.pickupCharge})
              </span>
            </div>
            <div className="flex items-center gap-3 text-off-white/80 sm:col-span-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span>
                Drop: {booking.dropMode === 'SELF' ? 'Self at hub' : booking.dropLocation}
                {' '}(₹{booking.dropCharge})
              </span>
            </div>
          </div>
          {booking.specialRequests && (
            <p className="italic text-off-white/60">&quot;{booking.specialRequests}&quot;</p>
          )}
        </Card>

        <Card className="space-y-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
            <CreditCard className="h-5 w-5 text-accent" /> Payment
          </h3>
          <div className="space-y-2 text-sm text-off-white/60">
              <div className="flex justify-between"><span>Rental</span><span>₹{booking.baseAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Pickup fee</span><span>₹{booking.pickupCharge}</span></div>
              <div className="flex justify-between"><span>Drop fee</span><span>₹{booking.dropCharge}</span></div>
              <div className="flex justify-between"><span>GST</span><span>₹{booking.taxAmount.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between border-t border-accent/10 pt-3 font-bold text-accent text-2xl">
              <span>Total</span>
              <span>₹{booking.totalAmount.toLocaleString()}</span>
            </div>
          <div className="space-y-4 text-sm">
            {booking.paymentId && (
              <div className="flex justify-between text-off-white/50">
                <span>Payment ID</span>
                <span className="font-mono text-off-white">{booking.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between text-off-white/50">
              <span>Status</span>
              <span className={booking.paymentStatus === 'PAID' ? 'text-success font-semibold' : 'text-accent font-semibold'}>
                {booking.paymentStatus}
              </span>
            </div>
            {booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED' && (
              <Button
                variant="primary"
                className="w-full mt-4 gap-2"
                onClick={handlePayNow}
                disabled={isProcessing}
              >
                <CreditCard className="h-5 w-5" />
                {isProcessing ? 'Processing...' : `Pay ₹${booking.totalAmount.toLocaleString()}`}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetail;
