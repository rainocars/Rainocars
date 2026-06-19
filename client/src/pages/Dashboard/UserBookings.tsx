import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TabsContainer, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types';

const statusBadge = (status: Booking['status']) => {
  switch (status) {
    case 'CONFIRMED': return 'success' as const;
    case 'PENDING': return 'warning' as const;
    case 'CANCELLED': return 'danger' as const;
    default: return 'surface' as const;
  }
};

const UserBookings = () => {
  const { user } = useAuth();
  const { bookings, getCarById } = useData();
  const [activeTab, setActiveTab] = useState('All');

  const enriched = useMemo(() =>
    bookings.map(b => {
      const car = getCarById(b.carId);
      return {
        ...b,
        carName: car?.name || 'Vehicle',
        img: car?.images[0],
        dates: `${format(new Date(b.startDate), 'MMM d')} – ${format(new Date(b.endDate), 'MMM d, yyyy')}`,
      };
    }),
  [bookings, getCarById]);

  const filtered = enriched.filter(
    b => activeTab === 'All' || b.status === activeTab.toUpperCase()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-off-white">My Bookings</h1>
          <p className="text-off-white/60">Track status — admin must approve pending bookings</p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/cars">Book New Car</Link>
        </Button>
      </div>

      <TabsContainer defaultValue="All" onValueChange={setActiveTab}>
        {['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'].map(tab => (
          <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
        ))}

        <TabsContent value="All">
          {filtered.length === 0 ? (
            <Card className="py-16 text-center text-off-white/50">
              <p>No bookings yet.</p>
              <Button variant="primary" asChild className="mt-4">
                <Link to="/cars">Browse cars</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(booking => (
                <Card key={booking.id}>
                  <div className="relative mb-4 h-40 overflow-hidden rounded-lg">
                    {booking.img ? (
                      <img src={booking.img} alt={booking.carName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary text-off-white/40">No image</div>
                    )}
                    <div className="absolute right-3 top-3">
                      <Badge variant={statusBadge(booking.status)}>{booking.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-off-white">{booking.carName}</h3>
                      <p className="text-sm text-off-white/60">{booking.dates} · {booking.totalDays} days</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-lg font-bold text-accent">₹{booking.totalAmount.toLocaleString()}</p>
                      <Badge variant="accent">{booking.paymentStatus}</Badge>
                    </div>
                    <div className="flex gap-2 border-t border-accent/10 pt-4">
                      <Button variant="surface" size="sm" className="flex-1 gap-2" asChild>
                        <Link to={`/dashboard/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" /> Details
                        </Link>
                      </Button>
                      <Button variant="surface" size="sm" className="flex-1 gap-2" asChild>
                        <Link to={`/dashboard/bookings/${booking.id}/chat`}>
                          <MessageCircle className="h-4 w-4" /> Chat
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </TabsContainer>
    </div>
  );
};

export default UserBookings;
