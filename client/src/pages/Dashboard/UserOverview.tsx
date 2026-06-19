import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarDays, PlusCircle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

const statusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'success' as const;
    case 'PENDING': return 'warning' as const;
    case 'CANCELLED': return 'danger' as const;
    default: return 'surface' as const;
  }
};

const UserOverview = () => {
  const { user } = useAuth();
  const { bookings, getCarById } = useData();

  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'ACTIVE').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'PENDING').length;
  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { label: 'Total Bookings', value: String(totalBookingsCount), icon: CalendarDays, color: 'text-accent' },
    { label: 'Active Bookings', value: String(activeBookingsCount), icon: LayoutDashboard, color: 'text-accent' },
    { label: 'Pending', value: String(pendingBookingsCount), icon: PlusCircle, color: 'text-warning' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
  ];

  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(b => {
      const car = getCarById(b.carId);
      return {
        id: b.id || (b as any)._id,
        car: car?.name || 'Vehicle',
        dates: `${format(new Date(b.startDate), 'MMM d')} – ${format(new Date(b.endDate), 'MMM d, yyyy')}`,
        amount: `₹${b.totalAmount.toLocaleString()}`,
        status: b.status,
        payment: b.paymentStatus,
      };
    });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-gradient-to-r from-accent/20 to-transparent border border-accent/20"
      >
        <h1 className="text-3xl font-display font-bold text-off-white mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="text-off-white/60 max-w-xl">
          Your next adventure is just a few clicks away. Check your active bookings or explore our newly added luxury fleet.
        </p>
        <div className="flex gap-4 mt-8">
          <Button variant="primary" asChild>
            <Link to="/cars">Browse Fleet</Link>
          </Button>
          <Button variant="surface" asChild>
            <Link to="/dashboard/bookings">All Bookings</Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="py-6 flex items-center gap-4">
                <div className={cn('h-12 w-12 rounded-xl bg-off-white/5 flex items-center justify-center', stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-off-white/60 font-medium">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-off-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-display font-bold text-off-white">Recent Bookings</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/bookings" className="text-accent">View All →</Link>
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-off-white/40">
                    No bookings found. <Link to="/cars" className="text-accent underline">Browse cars</Link> to start.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-off-white/60">{booking.id}</TableCell>
                    <TableCell className="font-bold text-off-white">{booking.car}</TableCell>
                    <TableCell className="text-off-white/60">{booking.dates}</TableCell>
                    <TableCell className="font-bold text-off-white">{booking.amount}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent">{booking.payment}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/bookings/${booking.id}`} className="text-accent">Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default UserOverview;
