'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { installCredentialedApiFetch, refreshAuthSession } from '@/lib/secureFetch';

installCredentialedApiFetch();

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  rank?: 'MEMBER' | 'LOYAL' | 'VIP';
  totalItemsPurchased?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  logoutAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('fogo_token');
    localStorage.removeItem('token');
    localStorage.removeItem('fogo_admin_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('accessToken');
    const savedUser = localStorage.getItem('fogo_user') || localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('fogo_token');
        localStorage.removeItem('fogo_user');
      }
    }
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          const refreshed = await refreshAuthSession();
          if (!refreshed) throw new Error('Phiên hết hạn');
          return fetch(`${API_URL}/api/auth/me`, { credentials: 'include', cache: 'no-store' });
        }
        return response;
      })
      .then((response) => response.json())
      .then((body) => {
        if (!body.success) throw new Error('Chưa đăng nhập');
        const verifiedUser = { ...body.data, name: body.data.fullName || body.data.name };
        setUser(verifiedUser);
        localStorage.setItem('fogo_user', JSON.stringify(verifiedUser));
        localStorage.setItem('user', JSON.stringify(verifiedUser));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('fogo_user');
        localStorage.removeItem('user');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (newUser: User) => {
    const formattedUser = {
      ...newUser,
      name: newUser.fullName || newUser.name, // Đảm bảo luôn có name
    };
    setToken(null);
    setUser(formattedUser);
    setIsLoading(false);
    
    // Đồng bộ tất cả các key mà các component đang dùng
    localStorage.setItem('fogo_user', JSON.stringify(formattedUser));
    localStorage.setItem('user', JSON.stringify(formattedUser));
    localStorage.removeItem('fogo_token');
    localStorage.removeItem('token');
    localStorage.removeItem('fogo_admin_token');
    localStorage.removeItem('admin_token');

    // Kích hoạt sự kiện storage để CartContext tự động load giỏ của user này
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem('fogo_token');
    localStorage.removeItem('fogo_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const logoutAllDevices = async () => {
    await fetch(`${API_URL}/api/auth/logout-all`, { method: 'POST', credentials: 'include' }).catch(() => {});
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, logoutAllDevices }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
