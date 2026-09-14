'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('fogo_token') || localStorage.getItem('token');
    const savedUser = localStorage.getItem('fogo_user') || localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('fogo_token');
        localStorage.removeItem('fogo_user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    const formattedUser = {
      ...newUser,
      name: newUser.fullName || newUser.name, // Đảm bảo luôn có name
    };
    setToken(newToken);
    setUser(formattedUser);
    
    // Đồng bộ tất cả các key mà các component đang dùng
    localStorage.setItem('fogo_token', newToken);
    localStorage.setItem('fogo_user', JSON.stringify(formattedUser));
    localStorage.setItem('user', JSON.stringify(formattedUser));
    localStorage.setItem('token', newToken);

    // Kích hoạt sự kiện storage để CartContext tự động load giỏ của user này
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fogo_token');
    localStorage.removeItem('fogo_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};