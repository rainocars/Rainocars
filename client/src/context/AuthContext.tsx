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
    const token = localStorage.getItem('raino_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      const u = response.data.data.user;
      setUser(u ? { ...u, id: u.id || u._id, _id: u._id || u.id } : null);
    } catch (error) {
      // If access token expired, try using refresh token
      const refreshToken = localStorage.getItem('raino_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await api.post('/auth/refresh-token', { refreshToken });
          const { token: newToken, refreshToken: newRefreshToken, user: userData } = refreshRes.data.data;
          localStorage.setItem('raino_access_token', newToken);
          if (newRefreshToken) localStorage.setItem('raino_refresh_token', newRefreshToken);
          setUser(userData ? { ...userData, id: userData.id || userData._id, _id: userData._id || userData.id } : null);
        } catch (refreshErr) {
          localStorage.removeItem('raino_access_token');
          localStorage.removeItem('raino_refresh_token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('raino_access_token');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleLogout = () => {
      localStorage.removeItem('raino_access_token');
      localStorage.removeItem('raino_refresh_token');
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
      const { token, refreshToken, user: userData } = response.data.data;
      localStorage.setItem('raino_access_token', token);
      localStorage.setItem('raino_refresh_token', refreshToken);
      setUser(userData ? { ...userData, id: userData.id || userData._id, _id: userData._id || userData.id } : null);
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
      const { token, refreshToken, user: userData } = response.data.data;
      localStorage.setItem('raino_access_token', token);
      localStorage.setItem('raino_refresh_token', refreshToken);
      setUser(userData ? { ...userData, id: userData.id || userData._id, _id: userData._id || userData.id } : null);
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
      localStorage.removeItem('raino_access_token');
      localStorage.removeItem('raino_refresh_token');
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
