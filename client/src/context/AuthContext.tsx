import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import api from '@/services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, otp?: string) => Promise<{ ok: boolean; message?: string; role?: UserRole; otpRequired?: boolean }>;
  register: (data: { name: string; email: string; phone: string; password: string; otp: string }) => Promise<{ ok: boolean; message?: string }>;
  sendOtp: (email: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string, otp?: string) => {
    try {
      const response = await api.post('/auth/login', { email, password, otp });
      if (response.data.status === 'otp_required') {
        return { ok: true, otpRequired: true };
      }
      const userData = response.data.data.user;
      setUser(userData);
      return { ok: true, role: userData.role };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Invalid email or password'
      };
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string; otp: string }) => {
    try {
      const response = await api.post('/auth/register', data);
      const userData = response.data.data.user;
      setUser(userData);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    try {
      const response = await api.post('/auth/send-otp', { email });
      return { ok: true, message: response.data.message, otp: response.data.otp };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to send verification code'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user,
        login,
        register,
        sendOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
