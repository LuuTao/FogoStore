'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, PhoneCall, ClipboardList, Shield, LogOut } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();

  return (
    <>
      <header className="w-full bg-white select-none relative z-40 border-b border-gray-100 shadow-sm">
        {/* ================= 1. DÒNG SLOGAN ================= */}
        <div className="w-full pt-3 pb-1 bg-white flex items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black uppercase tracking-wider text-[#d70018] leading-tight text-center drop-shadow-sm">
            THE BEST APPLE RETAIL STORE IN HCM
          </h1>
        </div>

        {/* ================= 2. HÀNG HEADER CHÍNH ================= */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 md:gap-6">
          {/* Logo FoGo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src="/logoFogo.png"
                alt="Fogo Store"
                className="h-16 md:h-18 w-auto object-contain transition-transform active:scale-95"
              />
            </Link>
          </div>

          {/* Thanh tìm kiếm viền đỏ */}
          <div className="flex-1 max-w-lg relative hidden sm:block">
            <input
              type="text"
              placeholder="Bạn cần tìm gì hôm nay..."
              className="w-full pl-4 pr-11 py-2.5 rounded-sm text-sm text-gray-900 bg-white border-2 border-[#d70018] outline-none placeholder-gray-400 focus:ring-1 focus:ring-[#d70018]"
            />
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#d70018] hover:scale-110 transition-transform cursor-pointer"
            >
              <Search size={19} strokeWidth={2.5} />
            </button>
          </div>

          {/* Cụm tiện ích 4 nút chữ đỏ + icon đỏ */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs md:text-sm font-semibold shrink-0">
            {/* 1. Hotline */}
            <a
              href="tel:0566003333"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <PhoneCall size={20} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Hotline</span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">056.600.3333</span>
              </div>
            </a>

            {/* KHU VỰC NÚT GIỎ HÀNG */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-gray-700"
            >
              <div className="relative flex items-center justify-center">
                {/* Icon túi/giỏ hàng */}
                <ShoppingBag size={22} className="text-[#d70018]" />

                {/* Badge số lượng đỏ nhảy tự động theo totalQuantity */}
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#d70018] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                    {totalQuantity > 99 ? '99+' : totalQuantity}
                  </span>
                )}
              </div>

              <div className="flex flex-col text-left">
                <span className="text-[14px] text-gray-500 font-medium">
                  Xem giỏ
                </span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">
                  Giỏ hàng ({totalQuantity})
                </span>
              </div>
            </Link>

            {/* 3. Tra cứu Đơn hàng */}
            <Link
              href="/tra-cuu-don-hang"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <ClipboardList size={20} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Tra cứu</span>
                <span className="text-[16px] font-black text-[#d70018]">Đơn hàng</span>
              </div>
            </Link>

            {/* 4. Tài khoản / Quản trị */}
            {user ? (
              <div className="flex items-center gap-2 py-1 shrink-0">
                <div className="flex items-center gap-1.5 text-[#d70018]">
                  <div className="w-8 h-8 rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                    <User size={20} />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[14px] text-gray-500 font-medium truncate max-w-[200px]">
                      {user.fullName}
                    </span>
                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin/don-hang"
                        className="font-black text-[#d70018] hover:underline inline-flex items-center gap-0.5 text-[16px]"
                      >
                        <Shield size={12} />
                        <span>Quản trị</span>
                      </Link>
                    ) : (
                      <span className="font-black text-[#d70018]">Thành viên</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất"
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-[#d70018] hover:bg-gray-100 transition-colors cursor-pointer ml-1"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-left cursor-pointer text-[#d70018]"
              >
                <div className="w-8 h-8 rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                  <User size={16} />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[14px] text-gray-500 font-medium">Đăng nhập</span>
                  <span className="text-[16px] font-black text-[#d70018]">Tài khoản</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal popup xác thực tài khoản */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};