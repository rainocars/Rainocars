import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SplashScreen from '@/components/SplashScreen';

import LandingPage from '@/pages/LandingPage';
import CarsListing from '@/pages/CarsListing';
import CarDetail from '@/pages/CarDetail';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import UserDashboard from '@/pages/Dashboard/UserDashboard';
import UserOverview from '@/pages/Dashboard/UserOverview';
import UserBookings from '@/pages/Dashboard/UserBookings';
import UserProfile from '@/pages/Dashboard/UserProfile';
import UserNotifications from '@/pages/Dashboard/UserNotifications';
import BookingDetail from '@/pages/Dashboard/BookingDetail';
import BookingChat from '@/pages/Dashboard/BookingChat';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import AdminOverview from '@/pages/Admin/AdminOverview';
import AdminCars from '@/pages/Admin/AdminCars';
import AdminBookings from '@/pages/Admin/AdminBookings';
import AdminUsers from '@/pages/Admin/AdminUsers';
import AdminChats from '@/pages/Admin/AdminChats';
import AdminPayments from '@/pages/Admin/AdminPayments';
import AdminSettings from '@/pages/Admin/AdminSettings';
import AdminDocuments from '@/pages/Admin/AdminDocuments';
import BookingConfirm from '@/pages/Booking/BookingConfirm';
import BookingPayment from '@/pages/Booking/BookingPayment';
import Page404 from '@/pages/Page404';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/cars" element={<CarsListing />} />
    <Route path="/cars/:slug" element={<CarDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/booking/confirm"
      element={
        <ProtectedRoute>
          <BookingConfirm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/booking/payment"
      element={
        <ProtectedRoute>
          <BookingPayment />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<UserOverview />} />
      <Route path="bookings" element={<UserBookings />} />
      <Route path="bookings/:id" element={<BookingDetail />} />
      <Route path="bookings/:id/chat" element={<BookingChat />} />
      <Route path="profile" element={<UserProfile />} />
      <Route path="notifications" element={<UserNotifications />} />
    </Route>

    <Route
      path="/admin"
      element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminOverview />} />
      <Route path="cars" element={<AdminCars />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="documents" element={<AdminDocuments />} />
      <Route path="chats" element={<AdminChats />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>

    <Route path="*" element={<Page404 />} />
  </Routes>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [theme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('raino-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('raino-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-primary text-off-white selection:bg-accent/30 selection:text-off-white">
            <Toaster position="top-right" />

            <AnimatePresence mode="wait">
              {showSplash && (
                <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
              )}
            </AnimatePresence>

            {!showSplash && <AppRoutes />}
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
