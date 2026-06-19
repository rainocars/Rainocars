import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useData } from '@/context/DataContext';
import { User as UserType } from '@/types';
import { cn } from '@/utils/cn';

const AdminUsers = () => {
  const { getCustomerUsers, getBookingsForAdmin, getCarById, updateUserProfile, getUserById } = useData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserType | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'documents' | 'bookings'>('info');

  const [users, setUsers] = useState<UserType[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const [uData, bData] = await Promise.all([
        getCustomerUsers(),
        getBookingsForAdmin()
      ]);
      setUsers(uData || []);
      setAllBookings(bData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getCustomerUsers, getBookingsForAdmin]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const userBookings = useMemo(() => {
    if (!selected) return [];
    return allBookings
      .filter(b => b.userId === selected.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selected, allBookings]);

  const openUser = async (u: UserType) => {
    try {
      const fresh = await getUserById(u.id);
      setSelected(fresh || u);
    } catch {
      setSelected(u);
    }
    setDetailTab('info');
  };

  const toggleVerify = async () => {
    if (!selected) return;
    try {
      await updateUserProfile(selected.id, { isVerified: !selected.isVerified });
      const fresh = await getUserById(selected.id);
      if (fresh) setSelected(fresh);
      await loadData();
      toast.success('Verification status updated');
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-off-white">User Management</h1>
        <p className="text-off-white/60">View profiles, documents, and full booking history</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-off-white/40" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-accent/15 bg-surface-elevated py-3 pl-12 pr-4 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(user => {
              const bookingCount = allBookings.filter(b => b.userId === user.id).length;
              const docCount = user.documents?.length || 0;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-bold text-off-white">{user.name}</p>
                    <p className="text-xs text-off-white/50">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-off-white/80">{user.email}</p>
                    <p className="text-sm text-off-white/50">{user.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={docCount > 0 ? 'success' : 'warning'}>
                      {docCount} file{docCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-off-white">{bookingCount}</TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'success' : 'warning'}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="primary" size="sm" onClick={() => openUser(user)}>
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : 'User'}
      >
        {selected && (
          <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-1">
            <div className="flex gap-2 border-b border-accent/10 pb-2">
              {(['info', 'documents', 'bookings'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDetailTab(tab)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium capitalize',
                    detailTab === tab ? 'bg-accent/20 text-accent' : 'text-off-white/60 hover:text-off-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === 'info' && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-off-white/50">Email</p>
                    <p className="text-off-white">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-off-white/50">Phone</p>
                    <p className="text-off-white">{selected.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-off-white/50">Member since</p>
                    <p className="text-off-white">{format(new Date(selected.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-off-white/50">Verification</p>
                    <Badge variant={selected.isVerified ? 'success' : 'warning'}>
                      {selected.isVerified ? 'Verified' : 'Not verified'}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={toggleVerify} className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {selected.isVerified ? 'Revoke verification' : 'Mark as verified'}
                </Button>
              </div>
            )}

            {detailTab === 'documents' && (
              <div className="space-y-4">
                {(selected.documents || []).length === 0 ? (
                  <p className="py-8 text-center text-off-white/50">No documents uploaded</p>
                ) : (
                  (selected.documents || []).map(doc => (
                    <div key={doc.id} className="rounded-xl border border-accent/15 p-4 space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-off-white">{doc.label}</p>
                          <p className="text-xs text-off-white/50">{doc.fileName}</p>
                        </div>
                        <p className="text-xs text-off-white/40">
                          {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                        </p>
                      </div>
                      {doc.fileUrl.startsWith('data:image') && (
                        <img src={doc.fileUrl} alt="" className="max-h-48 rounded-lg border border-accent/10 object-contain" />
                      )}
                      <Button variant="surface" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                          <ExternalLink className="h-4 w-4" /> Open document
                        </a>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {detailTab === 'bookings' && (
              <div className="space-y-3">
                {userBookings.length === 0 ? (
                  <p className="py-8 text-center text-off-white/50">No bookings yet</p>
                ) : (
                  userBookings.map(b => {
                    const car = getCarById(b.carId);
                    return (
                      <div key={b.id} className="rounded-xl border border-accent/15 p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-mono text-off-white/50">{b.id}</span>
                          <Badge variant={b.status === 'CONFIRMED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'surface'}>
                            {b.status}
                          </Badge>
                        </div>
                        <p className="font-bold text-off-white">{car?.name || 'Car'}</p>
                        <p className="text-off-white/60">
                          {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-off-white/60">
                          Pickup: {b.pickupMode === 'SELF' ? 'Self @ hub' : b.pickupLocation} (₹{b.pickupCharge})
                        </p>
                        <p className="text-off-white/60">
                          Drop: {b.dropMode === 'SELF' ? 'Self @ hub' : b.dropLocation} (₹{b.dropCharge})
                        </p>
                        <p className="font-bold text-accent">Total ₹{b.totalAmount.toLocaleString()}</p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
