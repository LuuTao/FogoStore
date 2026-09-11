'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Đăng nhập không thành công');
      }

      login(data.data.token, data.data.user);

      if (data.data.user.role === 'ADMIN') {
        router.push('/admin/don-hang');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-center items-center px-4">
      <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-sm max-w-md w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-[#d70018] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Về trang chủ</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">ĐĂNG NHẬP HỆ THỐNG</h1>
        <p className="text-sm text-gray-500 mb-6">Đăng nhập tài khoản khách hàng hoặc ban quản trị</p>

        {error && (
          <div className="p-3 mb-4 text-sm bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fogo.vn hoặc email cá nhân"
                className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#d70018]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#d70018]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>ĐĂNG NHẬP</span>}
          </button>
        </form>
      </div>
    </div>
  );
}