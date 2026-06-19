import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import api from '@/services/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data.data.payments || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (bookingId: string, paymentId: string) => {
    if (!window.confirm(`Are you sure you want to refund payment ${paymentId}?`)) return;
    setRefundingId(paymentId);
    try {
      await api.post('/payments/refund', { bookingId });
      toast.success('Payment refunded successfully');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to refund payment');
    } finally {
      setRefundingId(null);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      toast.error('No payments to export');
      return;
    }
    const headers = ['Payment ID', 'User Name', 'User Email', 'Amount', 'Method', 'Status', 'Date'];
    const rows = payments.map(pay => [
      pay.razorpayPaymentId || pay._id,
      pay.userId?.name || 'Unknown User',
      pay.userId?.email || '',
      `₹${pay.amount}`,
      pay.method,
      pay.status,
      format(new Date(pay.createdAt), 'yyyy-MM-dd HH:mm:ss')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter(pay => {
    const q = searchTerm.toLowerCase();
    const payId = (pay.razorpayPaymentId || pay._id || '').toLowerCase();
    const userName = (pay.userId?.name || '').toLowerCase();
    const userEmail = (pay.userId?.email || '').toLowerCase();
    const method = (pay.method || '').toLowerCase();
    const status = (pay.status || '').toLowerCase();
    return payId.includes(q) || userName.includes(q) || userEmail.includes(q) || method.includes(q) || status.includes(q);
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-off-white">Payment History</h1>
          <p className="text-off-white/60 text-sm mt-1">Monitor all customer payments and process refunds</p>
        </div>
        <div className="flex gap-3">
          <Button variant="surface" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="surface" size="sm" className="gap-2" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-off-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search payments by ID, user name, or email..."
          className="w-full pl-12 pr-4 py-3 bg-surface border border-off-white/10 rounded-xl text-off-white placeholder:text-off-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-off-white/50">
            No payments found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map(pay => {
                const bookingId = pay.bookingId?._id || pay.bookingId;
                const paymentId = pay.razorpayPaymentId || pay._id;
                return (
                  <TableRow key={pay._id}>
                    <TableCell className="font-mono text-off-white/60 text-xs">{paymentId}</TableCell>
                    <TableCell className="font-bold text-off-white">
                      <div>{pay.userId?.name || 'Unknown User'}</div>
                      <div className="text-xs text-off-white/40 font-normal">{pay.userId?.email || ''}</div>
                    </TableCell>
                    <TableCell className="font-bold text-off-white">
                      ₹{pay.amount?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-off-white/60">{pay.method}</TableCell>
                    <TableCell>
                      <Badge variant={pay.status === 'SUCCESS' ? 'success' : pay.status === 'REFUNDED' ? 'warning' : 'danger'}>
                        {pay.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-off-white/60 text-sm">
                      {format(new Date(pay.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent"
                        disabled={pay.status !== 'SUCCESS' || refundingId === paymentId}
                        onClick={() => handleRefund(bookingId, paymentId)}
                      >
                        {refundingId === paymentId ? 'Refunding...' : 'Refund'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AdminPayments;

