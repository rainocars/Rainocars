import React from 'react';
import { CreditCard, Download, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

const AdminPayments = () => {
  const payments = [
    { id: 'P102', user: 'Aryan Sharma', amount: '₹6,600', method: 'Razorpay', status: 'SUCCESS', date: '2026-06-03' },
    { id: 'P101', user: 'Priya Iyer', amount: '₹4,200', method: 'Razorpay', status: 'SUCCESS', date: '2026-06-01' },
    { id: 'P100', user: 'Vikram Rao', amount: '₹25,000', method: 'Razorpay', status: 'SUCCESS', date: '2026-05-28' },
    { id: 'P99', user: 'Siddharth Rao', amount: '₹12,000', method: 'NetBanking', status: 'FAILED', date: '2026-05-20' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-off-white">Payment History</h1>
        <div className="flex gap-3">
          <Button variant="surface" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-off-white/40" />
        <input
          type="text"
          placeholder="Search payments by ID or user..."
          className="w-full pl-12 pr-4 py-3 bg-surface border border-off-white/10 rounded-xl text-off-white placeholder:text-off-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
      </div>

      <Card>
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
            {payments.map(pay => (
              <TableRow key={pay.id}>
                <TableCell className="font-mono text-off-white/60">{pay.id}</TableCell>
                <TableCell className="font-bold text-off-white">{pay.user}</TableCell>
                <TableCell className="font-bold text-off-white">{pay.amount}</TableCell>
                <TableCell className="text-off-white/60">{pay.method}</TableCell>
                <TableCell>
                  <Badge variant={pay.status === 'SUCCESS' ? 'success' : 'danger'}>{pay.status}</Badge>
                </TableCell>
                <TableCell className="text-off-white/60">{pay.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-accent" disabled={pay.status !== 'SUCCESS'}>
                    Refund
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminPayments;
