import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarDays, Users, FileText,
  MessageSquare, CreditCard, Settings, LogOut,
  Menu, X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'cars', label: 'Fleet Management', icon: Car, path: '/admin/cars' },
    { id: 'bookings', label: 'Booking Requests', icon: CalendarDays, path: '/admin/bookings' },
    { id: 'users', label: 'User Base', icon: Users, path: '/admin/users' },
    { id: 'documents', label: 'User Documents', icon: FileText, path: '/admin/documents' },
    { id: 'chats', label: 'Live Chats', icon: MessageSquare, path: '/admin/chats' },
    { id: 'payments', label: 'Revenue', icon: CreditCard, path: '/admin/payments' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          className={cn(
            'fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r border-off-white/10 bg-surface transition-all overflow-y-auto overflow-x-hidden',
            !isSidebarOpen && 'hidden lg:block'
          )}
        >
          <div className="flex flex-col min-h-full p-6">
            <div className="flex-1 space-y-2">
              <p className="text-xs font-bold text-off-white/40 uppercase tracking-widest mb-4 px-3">Admin Control</p>
              {navItems.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                    location.pathname === item.path ? 'bg-accent text-primary' : 'text-off-white/70 hover:bg-off-white/10 hover:text-off-white'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', location.pathname === item.path ? 'text-primary' : 'text-accent')} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-off-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-off-white/60 hover:text-danger"
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOut className="h-4 w-4" /> Admin Logout
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Content Area */}
        <main className={cn(
          'flex-1 transition-all',
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        )}>
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-surface border border-off-white/10 text-off-white hover:text-accent transition-colors"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-off-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-accent">Super Admin</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/20 font-bold text-accent">
                  {user?.name?.slice(0, 2).toUpperCase() || 'RA'}
                </div>
              </div>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
