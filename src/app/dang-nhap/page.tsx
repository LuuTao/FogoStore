'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý gửi token Google về backend sau khi người dùng chọn tài khoản thành công
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      setError('Không nhận được thông tin xác thực từ Google.');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Xác thực tài khoản Google thất bại');
      }

      // Nhận token và user theo đúng cấu trúc phản hồi API
      const authToken = data.data?.token || data.token;
      const authUser = data.data?.user || data.user;

      login(authToken, authUser);

      if (authUser?.role === 'ADMIN') {
        router.push('/admin/don-hang');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ xác thực.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Khởi tạo nút Google khi script đã nạp xong
  const initGoogleButton = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && GOOGLE_CLIENT_ID) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        const targetEl = document.getElementById('googleLoginButtonDiv');
        if (targetEl) {
          (window as any).google.accounts.id.renderButton(targetEl, {
            theme: 'outline',
            size: 'large',
            width: 384,
            text: 'signin_with',
            locale: 'vi',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Lỗi khởi tạo Google Auth:', err);
      }
    }
  };

  useEffect(() => {
    initGoogleButton();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
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
    <>
      {/* Tải Script Google Identity Services chính thức */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleButton}
      />

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
              disabled={loading || googleLoading}
              className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span>ĐĂNG NHẬP</span>}
            </button>
          </form>

          {/* Dòng phân cách */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
              Hoặc đăng nhập với
            </span>
          </div>

          {/* Khối hiển thị nút đăng nhập Google */}
          <div className="flex flex-col items-center justify-center min-h-[44px]">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 size={18} className="animate-spin text-[#d70018]" />
                <span>Đang xử lý tài khoản Google...</span>
              </div>
            ) : (
              <div id="googleLoginButtonDiv" className="w-full flex justify-center" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}