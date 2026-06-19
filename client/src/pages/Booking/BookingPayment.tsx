import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const BookingPayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBookingDraft, getCarById, createBooking, setBookingDraft } = useData();
  const draft = getBookingDraft();
  const car = draft ? getCarById(draft.carId) : undefined;

  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (!draft || !car) {
      navigate('/cars');
    }
  }, [draft, car, navigate]);

  // Dynamically load Razorpay Checkout script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!draft || !car) return null;

  const handlePayment = async () => {
    if (!user) return;
    setPaymentStatus('processing');

    try {
      // 1. Create unpaid booking in the backend
      const booking = await createBooking(draft, user.id);

      // 2. Request Razorpay Order details from backend
      const orderRes = await api.post('/payments/create-order', {
        bookingId: (booking as any)._id || booking.id,
      });
      const order = orderRes.data.data.order;

      // 3. Open Razorpay checkout modal
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid',
        amount: order.amount,
        currency: order.currency,
        name: 'Raino Cars',
        description: `Rental Booking for ${car.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setPaymentStatus('processing');
            // 4. Verify signature on backend
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: (booking as any)._id || booking.id,
            });

            // Clear local draft and set state
            setBookingDraft(null);
            setBookingId((booking as any)._id || booking.id);
            setPaymentStatus('success');
            toast.success('Payment received & booking confirmed!');
          } catch (err: any) {
            setPaymentStatus('idle');
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#ef4444',
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentStatus('idle');
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary px-6 pt-16">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-6 text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-off-white">Payment Successful</h1>
          <p className="text-off-white/60">
            Your booking is confirmed! You can manage it from your dashboard.
          </p>
          <Card className="p-6">
            <p className="text-sm text-off-white/40">Booking ID</p>
            <p className="font-mono text-xl font-bold text-off-white">{bookingId}</p>
          </Card>
          <Button variant="primary" className="w-full py-4" asChild>
            <Link to="/dashboard/bookings">View My Bookings</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 py-12">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link to="/booking/confirm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <Card className="space-y-6">
          <h1 className="font-display text-2xl font-bold text-off-white">Complete Payment</h1>
          <div className="flex gap-4">
            {car.images[0] && <img src={car.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover" />}
            <div>
              <p className="font-bold text-off-white">{car.name}</p>
              <p className="text-sm text-off-white/60">{draft.totalDays} days rental</p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-accent/15 bg-primary/50 p-4 text-sm">
            <div className="flex justify-between text-off-white/60"><span>Rental</span><span>₹{draft.baseAmount.toLocaleString()}</span></div>
            <div className="flex justify-between text-off-white/60"><span>Pickup</span><span>₹{draft.pickupCharge}</span></div>
            <div className="flex justify-between text-off-white/60"><span>Drop</span><span>₹{draft.dropCharge}</span></div>
            <div className="flex justify-between text-off-white/60"><span>GST</span><span>₹{Math.round(draft.tax).toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-accent/10 pt-2 text-lg font-bold text-accent">
              <span>Amount due</span>
              <span>₹{draft.grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-accent/10 p-4 text-off-white/60">
            <CreditCard className="h-8 w-8 text-accent" />
            <p className="text-sm">Pay securely via Razorpay payment gateway options.</p>
          </div>
          <Button
            variant="primary"
            className="w-full py-4 text-lg"
            onClick={handlePayment}
            disabled={paymentStatus === 'processing'}
          >
            {paymentStatus === 'processing' ? 'Processing...' : `Pay ₹${Math.round(draft.grandTotal).toLocaleString()}`}
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default BookingPayment;
