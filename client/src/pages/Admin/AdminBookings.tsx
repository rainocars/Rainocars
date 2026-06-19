import React, { useMemo, useState } from 'react';
import { Search, CheckCircle, XCircle, PlayCircle, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useData } from '@/context/DataContext';
import { storage } from '@/services/storage';
import { Booking } from '@/types';
import { format } from 'date-fns';

const statusVariant = (status: Booking['status']) => {
  switch (status) {
    case 'PENDING': return 'warning' as const;
    case 'CONFIRMED': return 'success' as const;
    case 'ACTIVE': return 'accent' as const;
    case 'COMPLETED': return 'surface' as const;
    case 'CANCELLED': return 'danger' as const;
    default: return 'surface' as const;
  }
};

const AdminBookings = () => {
  const { getBookingsForAdmin, updateBookingStatus, getCarById } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const users = storage.getUsers();

  const loadData = React.useCallback(async () => {
    try {
      const data = await getBookingsForAdmin();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getBookingsForAdmin]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const enriched = useMemo(() => {
    return bookings.map(b => {
      const user = users.find(u => u.id === b.userId);
      const car = getCarById(b.carId);
      return {
        ...b,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        carName: car?.name || 'Unknown car',
        carImage: car?.images[0],
        dateLabel: `${format(new Date(b.startDate), 'MMM d')} – ${format(new Date(b.endDate), 'MMM d, yyyy')}`,
      };
    });
  }, [bookings, users, getCarById]);

  const filtered = enriched.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.carName.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (id: string, status: Booking['status'], label: string) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${label}`);
      await loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-off-white">Booking Requests</h1>
        <p className="text-off-white/60">Approve, confirm, or decline customer reservations</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-off-white/40" />
          <input
            type="text"
            placeholder="Search booking ID, user, or car..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-accent/15 bg-surface-elevated py-3 pl-12 pr-4 text-off-white placeholder:text-off-white/30 outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-accent/15 bg-surface-elevated px-4 py-3 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell className="py-12 text-center text-off-white/50">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-sm text-off-white/60">{booking.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-off-white">{booking.userName}</p>
                    <p className="text-xs text-off-white/50">{booking.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {booking.carImage && (
                        <img src={booking.carImage} alt="" className="h-8 w-12 rounded object-cover" />
                      )}
                      <span className="text-off-white">{booking.carName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-off-white/70">
                    <p>{booking.dateLabel}</p>
                    <p className="text-xs text-off-white/40">
                      P: {booking.pickupMode === 'SELF' ? 'Self' : 'Delivery'} · D: {booking.dropMode === 'SELF' ? 'Self' : 'Delivery'}
                    </p>
                  </TableCell>
                  <TableCell className="font-bold text-accent">₹{booking.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleAction(booking.id, 'CONFIRMED', 'approved')}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleAction(booking.id, 'CANCELLED', 'declined')}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          variant="accent"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAction(booking.id, 'ACTIVE', 'marked active')}
                        >
                          <PlayCircle className="h-3.5 w-3.5" /> Start Rental
                        </Button>
                      )}
                      {booking.status === 'ACTIVE' && (
                        <Button
                          variant="surface"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAction(booking.id, 'COMPLETED', 'completed')}
                        >
                          <Flag className="h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {!['PENDING', 'CONFIRMED', 'ACTIVE'].includes(booking.status) && (
                        <span className="text-xs text-off-white/40">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminBookings;
