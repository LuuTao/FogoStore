'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const GOOGLE_CLIENT_ID = '974988535391-m1b2907pue0m80ek7a5vuvl0idkk2787.apps.googleusercontent.com';

function AuthModalContent({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  const [showPassword, setShowPassword] = useState(false);

  // States nhập liệu
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. ĐĂNG NHẬP THƯỜNG
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tài khoản hoặc mật khẩu không chính xác');
      }

      login(data.data.token, data.data.user);
      onClose();

      if (data.data.user.role === 'ADMIN') {
        router.push('/admin/don-hang');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('fetch')) {
        setError('Không thể kết nối đến máy chủ Backend. Vui lòng thử lại sau giây lát!');
      } else {
        setError(err.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. ĐĂNG KÝ -> GỬI OTP VỀ GMAIL
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, fullName, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể gửi mã xác nhận đến Email');
      }

      setSuccessMsg(`Mã OTP xác thực đã được gửi đến: ${email}`);
      setRegisterStep('otp');
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi mã xác thực');
    } finally {
      setLoading(false);
    }
  };

  // 3. XÁC THỰC MÃ OTP TỪ GMAIL
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Mã xác thực không chính xác hoặc đã hết hạn');
      }

      login(data.data.token, data.data.user);
      alert('Đăng ký tài khoản thành công!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi xác thực OTP');
    } finally {
      setLoading(false);
    }
  };

  // 4. XỬ LÝ ĐĂNG NHẬP GOOGLE: GỬI ĐÚNG TRƯỜNG "token" LÊN BACKEND
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      setError('Không nhận được mã xác thực từ Google');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: idToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Đăng nhập Google thất bại');
      }

      login(data.data.token, data.data.user);
      onClose();

      if (data.data.user.role === 'ADMIN') {
        router.push('/admin/don-hang');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ xác thực Google');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-[430px] w-full overflow-hidden relative">
        {/* HEADER TAB */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-8 flex-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setPassword('');
                setError('');
                setSuccessMsg('');
              }}
              className={`pb-3 text-base font-bold transition-all relative cursor-pointer ${
                activeTab === 'login' ? 'text-[#d70018]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Đăng Nhập
              {activeTab === 'login' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegisterStep('form');
                setPassword('');
                setError('');
                setSuccessMsg('');
              }}
              className={`pb-3 text-base font-bold transition-all relative cursor-pointer ${
                activeTab === 'register' ? 'text-[#d70018]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tạo Tài Khoản
              {activeTab === 'register' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mb-2 p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM ĐĂNG NHẬP */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5 text-[13px]">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="Nhập email hoặc SĐT của bạn"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-gray-700 text-[13px]">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => alert('Vui lòng liên hệ Hotline 056.600.3333 để hỗ trợ!')}
                    className="text-blue-600 hover:underline text-xs font-medium cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded-md uppercase tracking-wider text-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>ĐĂNG NHẬP</span>}
              </button>
            </form>
          )}

          {/* FORM TẠO TÀI KHOẢN */}
          {activeTab === 'register' && registerStep === 'form' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs" autoComplete="off">
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[13px]">Họ và tên *</label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="off"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3.5 py-2 text-sm text-gray-900 outline-none focus:border-[#d70018]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[13px]">Email (Gmail) *</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3.5 py-2 text-sm text-gray-900 outline-none focus:border-[#d70018]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[13px]">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3.5 py-2 text-sm text-gray-900 outline-none focus:border-[#d70018]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[13px]">Mật khẩu *</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    name="fogo_register_password"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm text-gray-900 outline-none focus:border-[#d70018]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded-md uppercase tracking-wider text-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-4 shadow-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>ĐĂNG KÝ</span>}
              </button>
            </form>
          )}

          {/* NHẬP MÃ OTP GMAIL */}
          {activeTab === 'register' && registerStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-center text-[13px]">
                  Nhập mã 6 chữ số đã gửi qua Gmail
                </label>
                <p className="text-center text-gray-500 text-xs mb-2 truncate font-medium">
                  {email}
                </p>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border-2 border-[#d70018] text-center tracking-[8px] font-black text-lg py-2 rounded-md outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded-md uppercase tracking-wider text-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>XÁC NHẬN VÀ HOÀN TẤT</span>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setRegisterStep('form')}
                  className="text-xs text-gray-500 hover:text-[#d70018] underline cursor-pointer"
                >
                  Đổi thông tin đăng ký khác
                </button>
              </div>
            </form>
          )}

          {/* NÚT GOOGLE CHÍNH HÃNG: TỰ CẤP CREDENTIAL HỢP LỆ VÀ CĂN CHÍNH GIỮA */}
          {!(activeTab === 'register' && registerStep === 'otp') && (
            <div className="mt-5">
              <div className="relative flex items-center justify-center mb-4">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                  HOẶC TIẾP TỤC VỚI
                </span>
                <div className="border-t border-gray-200 w-full" />
              </div>

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Hủy đăng nhập Google hoặc xảy ra lỗi')}
                  locale="vi"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="382"
                  text="signin_with"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthModal(props: AuthModalProps) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthModalContent {...props} />
    </GoogleOAuthProvider>
  );
}