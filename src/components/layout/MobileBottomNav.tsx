'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Flame, PhoneCall, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Danh mục chuẩn đồng bộ toàn hệ thống
const BOTTOM_NAV_CATEGORIES = [
  { id: 'iphone', title: 'iPhone', href: '/iphone', badge: 'HOT' },
  { id: 'ipad', title: 'iPad', href: '/ipad', badge: 'NEW' },
  { id: 'macbook', title: 'MacBook', href: '/macbook', badge: 'NEW' },
  { id: 'hang-cu', title: 'Hàng Cũ', href: '/hang-cu' },
  { id: 'watch', title: 'Apple Watch', href: '/watch' },
  { id: 'phu-kien', title: 'Phụ Kiện', href: '/phu-kien' },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden select-none">
        <div className="grid grid-cols-5 h-14 items-center max-w-md mx-auto">
          {/* Trang chủ */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              pathname === '/' ? 'text-[#d70018] font-bold' : 'text-gray-600 hover:text-[#d70018]'
            }`}
          >
            <Home size={20} className={pathname === '/' ? 'stroke-[2.5]' : ''} />
            <span className="mt-0.5">Trang chủ</span>
          </Link>

          {/* Danh mục Popup */}
          <button
            type="button"
            onClick={() => setIsCategoryOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-[11px] font-medium text-gray-600 hover:text-[#d70018] cursor-pointer"
          >
            <Grid size={20} />
            <span className="mt-0.5">Danh mục</span>
          </button>

          {/* Giá sốc */}
          <Link
            href="/hang-cu"
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              pathname === '/hang-cu' ? 'text-[#d70018] font-bold' : 'text-gray-600 hover:text-[#d70018]'
            }`}
          >
            <Flame size={20} className={pathname === '/hang-cu' ? 'stroke-[2.5]' : ''} />
            <span className="mt-0.5">Giá sốc</span>
          </Link>

          {/* Hotline */}
          <a
            href="tel:0566003333"
            className="flex flex-col items-center justify-center py-1 text-[11px] font-medium text-gray-600 hover:text-[#d70018]"
          >
            <PhoneCall size={20} />
            <span className="mt-0.5">Gọi mua</span>
          </a>

          {/* Giỏ hàng */}
          <Link
            href="/gio-hang"
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium relative transition-colors ${
              pathname === '/gio-hang' ? 'text-[#d70018] font-bold' : 'text-gray-600 hover:text-[#d70018]'
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} className={pathname === '/gio-hang' ? 'stroke-[2.5]' : ''} />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#d70018] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </div>
            <span className="mt-0.5">Giỏ hàng</span>
          </Link>
        </div>
      </nav>

      {/* POPUP MENU DANH MỤC TRÊN MOBILE */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden select-none">
          <div className="bg-white rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base uppercase">Danh mục sản phẩm</h3>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 py-4">
              {BOTTOM_NAV_CATEGORIES.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsCategoryOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-red-50 text-center transition-colors border border-gray-100 group"
                >
                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] transition-colors">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="mt-1 bg-[#d70018] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;