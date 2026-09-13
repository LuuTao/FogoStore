'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu as MenuIcon,
  X,
  Search,
  ShoppingBag,
  User,
  PhoneCall,
  ClipboardList,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MENU_DATA } from '@/data/navigation';

export const Header: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();

  const toggleSubMenu = (id: string) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  return (
    <>
      <header className="w-full bg-white select-none relative z-40 border-b border-gray-100 shadow-xs">
        {/* 1. DÒNG SLOGAN */}
        <div className="w-full pt-2 sm:pt-3 pb-1 bg-white flex items-center justify-center px-3">
          <h1 className="text-xs sm:text-base md:text-2xl lg:text-[32px] font-black uppercase tracking-wider text-[#d70018] leading-tight text-center drop-shadow-xs truncate">
            THE BEST APPLE RETAIL STORE IN HCM
          </h1>
        </div>

        {/* 2. HÀNG HEADER CHÍNH */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Cụm Nút 3 Gạch (Mobile/Tablet) + Logo FoGo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* NÚT 3 GẠCH (Chỉ hiện trên Mobile & Tablet < 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-gray-800 hover:text-[#d70018] hover:bg-red-50 transition-colors"
              aria-label="Mở menu danh mục"
            >
              <MenuIcon size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/logoFogo.png"
                alt="Fogo Store"
                className="h-10 sm:h-12 md:h-16 lg:h-18 w-auto object-contain transition-transform active:scale-95"
              />
            </Link>
          </div>

          {/* Thanh tìm kiếm trên PC / Tablet */}
          <div className="flex-1 max-w-lg relative hidden sm:block">
            <input
              type="text"
              placeholder="Bạn cần tìm gì hôm nay..."
              className="w-full pl-4 pr-11 py-2 lg:py-2.5 rounded-sm text-sm text-gray-900 bg-white border-2 border-[#d70018] outline-hidden placeholder-gray-400 focus:ring-1 focus:ring-[#d70018]"
            />
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#d70018] hover:scale-110 transition-transform cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Cụm tiện ích */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 text-xs md:text-sm font-semibold shrink-0">
            {/* Hotline */}
            <a
              href="tel:0566003333"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Hotline</span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">056.600.3333</span>
              </div>
            </a>

            {/* Giỏ hàng */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity cursor-pointer text-gray-700"
            >
              <div className="relative w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 lg:bg-transparent flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#d70018]" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-[#d70018] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalQuantity > 99 ? '99+' : totalQuantity}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Xem giỏ</span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">
                  Giỏ hàng ({totalQuantity})
                </span>
              </div>
            </Link>

            {/* Tra cứu đơn hàng */}
            <Link
              href="/tra-cuu-don-hang"
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Tra cứu</span>
                <span className="text-[16px] font-black text-[#d70018]">Đơn hàng</span>
              </div>
            </Link>

            {/* Tài khoản: Hỗ trợ click mở dropdown menu chi tiết */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 sm:gap-2 py-1 cursor-pointer text-[#d70018] hover:opacity-80 transition-opacity"
                  aria-label="Thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight text-left">
                    <span className="text-[14px] text-gray-700 font-bold truncate max-w-[140px]">
                      {user.fullName || 'Tài khoản'}
                    </span>
                    <span className="text-[16px] font-black text-[#d70018]">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </div>
                </button>

                {/* POPUP DROPDOWN HIỂN THỊ TÊN & MENU TÀI KHOẢN */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="pb-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Đang đăng nhập:</p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                          {user.fullName || 'Người dùng'}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-50 text-[#d70018] border border-red-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                        </span>
                      </div>

                      <div className="py-2 space-y-1">
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin/don-hang"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-[#d70018] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Shield size={15} />
                            <span>Trang Quản Trị</span>
                          </Link>
                        )}
                        <Link
                          href="/tra-cuu-don-hang"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <ClipboardList size={15} />
                          <span>Lịch sử đơn hàng</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-left text-[#d70018] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[14px] text-gray-500 font-medium">Đăng nhập</span>
                  <span className="text-[16px] font-black text-[#d70018]">Tài khoản</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Thanh tìm kiếm phụ trên Mobile (< 640px) */}
        <div className="block sm:hidden px-3 pb-2.5 pt-0.5">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Bạn cần tìm gì hôm nay..."
              className="w-full pl-3 pr-9 py-1.5 rounded-sm text-xs text-gray-900 bg-white border border-[#d70018] outline-hidden placeholder-gray-400"
            />
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d70018]"
            >
              <Search size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MENU SIDEBAR 3 GẠCH (DRAWER SLIDE-OVER TỪ BÊN TRÁI)                      */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-[300px] sm:w-[340px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#d70018] text-white">
              <span className="font-extrabold text-base tracking-wide uppercase">Danh Mục Sản Phẩm</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {MENU_DATA.map((item) => {
                const isExpanded = expandedMenuId === item.id;
                const hasSub = item.groups && item.groups.length > 0;

                return (
                  <div key={item.id} className="py-1">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#d70018] transition-colors flex-1"
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="bg-[#d70018] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {hasSub && (
                        <button
                          type="button"
                          onClick={() => toggleSubMenu(item.id)}
                          className="p-1 text-gray-400 hover:text-[#d70018]"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#d70018]' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSub && isExpanded && (
                      <div className="bg-gray-50 px-6 py-2 space-y-2 border-t border-gray-100">
                        {item.groups?.map((group, gIdx) => (
                          <div key={gIdx} className="py-1">
                            <Link
                              href={group.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xs font-bold text-gray-700 hover:text-[#d70018] block"
                            >
                              {group.groupTitle}
                            </Link>

                            {group.items && (
                              <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-red-200">
                                {group.items.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    href={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs text-gray-500 hover:text-[#d70018] block py-0.5"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Tổng đài hỗ trợ:</p>
              <a href="tel:0566003333" className="text-[#d70018] font-bold text-sm block mt-0.5">
                056.600.3333 (Miễn phí)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal đăng nhập */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};