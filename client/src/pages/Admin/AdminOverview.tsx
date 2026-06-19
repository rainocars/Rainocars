import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Calendar,
  CheckCircle, Clock, Car
} from 'lucide-react';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/utils/cn';
import api from '@/services/api';
import toast from 'react-hot-toast';

const statusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'success' as const;
    case 'PENDING': return 'warning' as const;
    case 'CANCELLED': return 'danger' as const;
    default: return 'surface' as const;
  }
};

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    overview: {
      revenue: number;
      bookings: number;
      pending: number;
      active: number;
      users: number;
      cars: number;
      availableCars: number;
    };
    recentUsers: Array<{ _id: string; name: string; email: string; createdAt: string }>;
    recentBookings: Array<{
      _id: string;
      userId: { name: string; email: string } | null;
      carId: { name: string } | null;
      totalAmount: number;
      status: string;
    }>;
    revenueData: Array<{ name: string; value: number; bookings: number }>;
  }>({
    overview: { revenue: 0, bookings: 0, pending: 0, active: 0, users: 0, cars: 0, availableCars: 0 },
    recentUsers: [],
    recentBookings: [],
    revenueData: []
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin/stats');
      setData(res.data.data.stats);
    } catch (err) {
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success('Booking status updated successfully');
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const { overview, recentUsers, recentBookings, revenueData } = data;

  const stats = [
    { label: 'Total Revenue', value: `₹${overview.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Bookings', value: String(overview.bookings), icon: Calendar, color: 'text-accent' },
    { label: 'Pending', value: String(overview.pending), icon: Clock, color: 'text-warning' },
    { label: 'Active', value: String(overview.active), icon: CheckCircle, color: 'text-accent' },
    { label: 'Total Users', value: String(overview.users), icon: Users, color: 'text-accent' },
    { label: 'Total Cars', value: `${overview.availableCars}/${overview.cars} Available`, icon: Car, color: 'text-success' },
  ];

  const pendingBookings = recentBookings.filter(b => b.status === 'PENDING');

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-off-white">Business Overview</h1>
        <Button variant="primary" onClick={fetchStats}>Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-xl bg-off-white/5 flex items-center justify-center', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-off-white/60 font-medium">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-off-white">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-off-white">Revenue Growth</h3>
            <span className="text-xs text-off-white/60">Last 6 Months</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#ffffff10', color: '#FFFFFF' }}
                  itemStyle={{ color: '#DC2626' }}
                />
                <Area type="monotone" dataKey="value" stroke="#DC2626" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="p-6 space-y-6">
          <h3 className="text-xl font-display font-bold text-off-white">New Users</h3>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-off-white/40 text-center py-8">No new users registered.</p>
            ) : (
              recentUsers.map((u, i) => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-off-white/5 hover:bg-off-white/10 transition-colors cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-off-white truncate">{u.name}</p>
                    <p className="text-xs text-off-white/40 truncate">{u.email}</p>
                  </div>
                  <div className="text-xs text-off-white/40">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full text-accent" asChild>
            <Link to="/admin/users">View All Users →</Link>
          </Button>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-display font-bold text-off-white">Pending Action Bookings</h3>
          <Button variant="surface" size="sm" asChild>
            <Link to="/admin/bookings" className="text-accent">Manage All →</Link>
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-off-white/40">
                    No pending bookings requiring actions.
                  </TableCell>
                </TableRow>
              ) : (
                pendingBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-off-white/60">{booking._id}</TableCell>
                    <TableCell className="font-bold text-off-white">{booking.userId?.name || 'Customer'}</TableCell>
                    <TableCell className="text-off-white/60">{booking.carId?.name || 'Vehicle'}</TableCell>
                    <TableCell className="font-bold text-off-white">₹{booking.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        className="bg-surface border border-off-white/10 text-xs p-1 rounded text-off-white outline-none"
                        defaultValue={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
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

export default AdminOverview;
