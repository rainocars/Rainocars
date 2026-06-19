import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Fuel, User, Settings, Calendar,
  Star, CheckCircle2, ChevronLeft, ShieldCheck,
  ArrowRight, Clock, MapPin
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { getDeliveryCharges, calculateBookingTotals } from '@/utils/bookingPricing';

const CarDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getCarBySlug, setBookingDraft, settings } = useData();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      setIsLoading(true);
      const data = await getCarBySlug(slug || '');
      setCar(data);
      setIsLoading(false);
    };
    fetchCar();
  }, [slug, getCarBySlug]);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    if (!car || totalDays === 0) return 0;
    let rate = car.pricePerDay;
    if (totalDays >= 30) rate = car.monthlyDiscount;
    else if (totalDays >= 7) rate = car.weeklyDiscount;
    return totalDays * rate;
  }, [totalDays, car]);

  const handleProceedBooking = () => {
    if (!car) return;
    if (!startDate || !endDate || totalDays <= 0) {
      toast.error('Please select valid pickup and return dates');
      return;
    }
    if (!car.isAvailable) {
      toast.error('This vehicle is currently unavailable');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please sign in to book');
      navigate('/login', { state: { from: `/cars/${car.slug}` } });
      return;
    }
    const baseAmount = totalPrice;
    const pickupMode = 'DELIVERY';
    const dropMode = 'DELIVERY';
    const { pickupCharge, dropCharge } = getDeliveryCharges(pickupMode, dropMode, settings);
    const { tax, grandTotal } = calculateBookingTotals(baseAmount, pickupCharge, dropCharge);
    setBookingDraft({
      carId: car.id,
      startDate,
      endDate,
      pickupLocation: '',
      dropLocation: '',
      pickupMode,
      dropMode,
      totalDays,
      baseAmount,
      pickupCharge,
      dropCharge,
      tax,
      grandTotal,
    });
    navigate('/booking/confirm');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary pt-24 text-center text-off-white">
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-primary pt-24 text-center text-off-white">
        <p>Car not found.</p>
        <Button variant="primary" asChild className="mt-4"><Link to="/cars">Browse fleet</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-2 text-off-white/60 mb-8 text-sm">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="text-off-white/30">/</span>
          <Link to="/cars" className="hover:text-accent transition-colors">Cars</Link>
          <span className="text-off-white/30">/</span>
          <span className="text-off-white">{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Gallery and Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-3xl border border-off-white/10 shadow-2xl">
                <img
                  src={car.images[activeImage]}
                  alt={car.name}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {car.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      'relative h-20 w-28 rounded-lg overflow-hidden border-2 transition-all',
                      activeImage === idx ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="accent">{car.category}</Badge>
                  <div className="flex items-center gap-1 text-sm font-bold text-accent">
                    <Star className="h-4 w-4 fill-accent" /> {car.rating}
                  </div>
                  <span className="text-off-white/40 text-sm">{car.totalBookings} Bookings</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-off-white">{car.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-off-white/40 uppercase font-bold">Starting From</p>
                  <p className="text-3xl font-display font-bold text-accent">₹{car.pricePerDay}<span className="text-sm text-off-white/60 ml-1">/day</span></p>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
                { icon: User, label: 'Seats', value: `${car.seats} Persons` },
                { icon: Settings, label: 'Transmission', value: car.transmission },
                { icon: Calendar, label: 'Year', value: car.year },
              ].map((spec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface border border-off-white/10 flex flex-col items-center text-center">
                  <spec.icon className="h-6 w-6 text-accent mb-2" />
                  <span className="text-xs text-off-white/40 uppercase font-bold mb-1">{spec.label}</span>
                  <span className="text-sm font-bold text-off-white">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Description & Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-off-white">Description</h3>
              <p className="text-off-white/60 leading-relaxed text-lg">
                {car.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {car.features.map((feat: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-off-white/80">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews (Simplified) */}
            <div className="pt-12 border-t border-off-white/10 space-y-8">
              <h3 className="text-2xl font-display font-bold text-off-white">Customer Reviews</h3>
              <div className="grid gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">U</div>
                        <div>
                          <p className="font-bold text-off-white">User {i}</p>
                          <div className="flex gap-1 text-accent">
                            {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-accent" />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-off-white/40">2 days ago</span>
                    </div>
                    <p className="text-off-white/60 italic">"Absolutely amazing experience. The car was in top condition and the delivery was punctual. Will book again!"</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6 shadow-2xl border-accent/20">
                <h3 className="text-2xl font-display font-bold text-off-white mb-6">Book This Car</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Pickup Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-primary border border-off-white/10 rounded-xl text-off-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Drop-off Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-primary border border-off-white/10 rounded-xl text-off-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-off-white/60">Rental Period</span>
                      <span className="font-bold text-off-white">{totalDays} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-off-white/60">Daily Rate</span>
                      <span className="font-bold text-off-white">₹{car.pricePerDay}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-accent/20">
                      <span className="font-bold text-off-white">Total Amount</span>
                      <span className="text-2xl font-display font-extrabold text-accent">₹{totalPrice}</span>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full py-4 text-lg" onClick={handleProceedBooking}>
                    Proceed to Booking
                  </Button>

                  <p className="text-center text-xs text-off-white/40">
                    Taxes (18% GST) will be added at checkout
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-off-white/5 bg-surface/50">
                <h4 className="text-lg font-bold text-off-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" /> Peace of Mind
                </h4>
                <ul className="space-y-3 text-sm text-off-white/60">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    Full comprehensive insurance included.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    Free cancellation 48h before pickup.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    24/7 premium roadside assistance.
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarDetail;
