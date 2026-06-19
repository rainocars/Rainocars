import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Car, Booking, Notification, AppSettings, User, UserDocument, UserDocumentType } from '@/types';
import { useAuth } from './AuthContext';
import api from '@/services/api';

interface DataContextValue {
  cars: Car[];
  bookings: Booking[];
  notifications: Notification[];
  refresh: () => Promise<void>;
  getCarBySlug: (slug: string) => Promise<Car | undefined>;
  getCarById: (id: string) => Car | undefined;
  saveCar: (carData: any, id?: string) => Promise<Car>;
  deleteCar: (id: string) => Promise<void>;
  createBooking: (draft: any, userId: string) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  getBookingsForUser: (userId: string) => Promise<Booking[]>;
  getBookingsForAdmin: () => Promise<Booking[]>;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  getNotificationsForUser: (userId: string) => Promise<Notification[]>;
  markNotificationRead: (id: string) => Promise<void>;
  setBookingDraft: (draft: any) => void;
  getBookingDraft: () => any;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
  getCustomerUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | undefined>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
  addUserDocument: (userId: string, doc: any) => Promise<UserDocument>;
  removeUserDocument: (userId: string, documentId: string) => Promise<void>;
  getAllUserDocuments: () => Promise<(UserDocument & { userName: string; userEmail: string })[]>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    hubAddress: '123 Main St, City',
    pickupDeliveryCharge: 500,
    dropDeliveryCharge: 500,
  });

  const refresh = useCallback(async () => {
    try {
      const carsRes = await api.get('/cars');
      setCars(carsRes.data.data.cars);

      if (user) {
        const bookingsRes = await api.get('/bookings/my-bookings');
        setBookings(bookingsRes.data.data.bookings);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getCarBySlug = useCallback(async (slug: string) => {
    try {
      const res = await api.get(`/cars/${slug}`);
      return res.data.data.car;
    } catch {
      return undefined;
    }
  }, []);

  const getCarById = useCallback((id: string) => {
    return cars.find((c: any) => c.id === id || c._id === id);
  }, [cars]);

  const saveCar = useCallback(async (carData: any, id?: string) => {
    if (id) {
      const res = await api.patch(`/cars/${id}`, carData);
      refresh();
      return res.data.data.car;
    } else {
      const res = await api.post('/cars', carData);
      refresh();
      return res.data.data.car;
    }
  }, [refresh]);

  const deleteCar = useCallback(async (id: string) => {
    await api.delete(`/cars/${id}`);
    refresh();
  }, [refresh]);

  const createBooking = useCallback(async (draft: any, userId: string) => {
    const res = await api.post('/bookings', draft);
    refresh();
    return res.data.data.booking;
  }, [refresh]);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    await api.patch(`/bookings/${id}/status`, { status });
    refresh();
  }, [refresh]);

  const getBookingsForUser = useCallback(async (userId: string) => {
    const res = await api.get('/bookings/my-bookings');
    return res.data.data.bookings;
  }, []);

  const getBookingsForAdmin = useCallback(async () => {
    const res = await api.get('/bookings/admin/all');
    return res.data.data.bookings;
  }, []);

  const addNotification = useCallback(async (n: any) => {
    // Notifications are usually handled by backend, but if manual trigger:
    console.log('Notification triggered:', n);
  }, []);

  const getNotificationsForUser = useCallback(async (userId: string) => {
    const res = await api.get(`/notifications/user/${userId}`);
    return res.data.data.notifications;
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    refresh();
  }, [refresh]);

  const updateSettings = useCallback(async (next: AppSettings) => {
    await api.patch('/settings', next);
    setSettings(next);
  }, []);

  const getCustomerUsers = useCallback(async () => {
    const res = await api.get('/dashboard/admin/users');
    return res.data.data.users;
  }, []);

  const getUserById = useCallback(async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data.user;
  }, []);

  const updateUserProfile = useCallback(async (userId: string, data: Partial<User>) => {
    await api.patch('/dashboard/user/profile', data);
    refresh();
  }, [refresh]);

  const addUserDocument = useCallback(async (userId: string, doc: any) => {
    const res = await api.post(`/users/${userId}/documents`, doc);
    refresh();
    return res.data.data.document;
  }, [refresh]);

  const removeUserDocument = useCallback(async (userId: string, documentId: string) => {
    await api.delete(`/users/${userId}/documents/${documentId}`);
    refresh();
  }, [refresh]);

  const getAllUserDocuments = useCallback(async () => {
    const res = await api.get('/admin/documents');
    return res.data.data.documents;
  }, []);

  // Use localStorage only for the temporary draft
  const setBookingDraft = (draft: any) => localStorage.setItem('booking_draft', JSON.stringify(draft));
  const getBookingDraft = () => JSON.parse(localStorage.getItem('booking_draft') || 'null');

  return (
    <DataContext.Provider
      value={{
        cars,
        bookings,
        notifications,
        refresh,
        getCarBySlug,
        getCarById,
        saveCar,
        deleteCar,
        createBooking,
        updateBookingStatus,
        getBookingsForUser,
        getBookingsForAdmin,
        addNotification,
        getNotificationsForUser,
        markNotificationRead,
        setBookingDraft,
        getBookingDraft,
        settings,
        updateSettings,
        getCustomerUsers,
        getUserById,
        updateUserProfile,
        addUserDocument,
        removeUserDocument,
        getAllUserDocuments,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
