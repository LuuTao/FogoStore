'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Flame, PhoneCall, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MENU_DATA } from '@/data/navigation';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Đọc danh mục đồng bộ từ admin nếu có
  const [navData, setNavData] = useState(MENU_DATA);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_menu_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNavData(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <>
      {/* 1. THANH BOTTOM BAR CỐ ĐỊNH Ở ĐÁY MÀN HÌNH (Chỉ hiện trên Mobile & Tablet < 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none">
        {/* Nút Trang chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname === '/' ? 'text-[#d70018]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Home size={19} className={pathname === '/' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-bold">Trang chủ</span>
        </Link>

        {/* Nút Danh mục (Bấm mở drawer) */}
        <button
          onClick={() => setIsCategoryOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            isCategoryOpen ? 'text-[#d70018]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid size={19} />
          <span className="text-[10px] font-bold">Danh mục</span>
        </button>

        {/* Nút Khuyến mãi */}
        <Link
          href="/khuyen-mai"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname === '/khuyen-mai' ? 'text-[#d70018]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Flame size={19} className="text-amber-500" />
          <span className="text-[10px] font-bold">Sale sốc</span>
        </Link>

        {/* Nút Giỏ hàng (Có Badge số lượng) */}
        <Link
          href="/gio-hang"
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname === '/gio-hang' ? 'text-[#d70018]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag size={19} className={pathname === '/gio-hang' ? 'stroke-[2.5]' : ''} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#d70018] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Giỏ hàng</span>
        </Link>

        {/* Nút Hotline / Liên hệ */}
        <a
          href="tel:0566003333"
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
        >
          <PhoneCall size={19} />
          <span className="text-[10px] font-bold">Hotline</span>
        </a>
      </div>

      {/* 2. DRAWER DANH MỤC TRƯỢT DÀNH RIÊNG CHO MOBILE & TABLET */}
      {isCategoryOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex">
          {/* Vùng Backdrop click đóng */}
          <div className="flex-1" onClick={() => setIsCategoryOpen(false)} />

          {/* Khung Drawer trượt từ bên phải qua */}
          <div className="w-[85%] sm:w-[380px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header Drawer */}
            <div className="bg-[#d70018] text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Grid size={20} />
                <h3 className="text-sm font-black uppercase tracking-wide">Danh Mục Sản Phẩm</h3>
              </div>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Danh sách danh mục cuộn dọc */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {navData.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <Link
                      href={item.href}
                      onClick={() => setIsCategoryOpen(false)}
                      className="font-black text-sm text-gray-900 hover:text-[#d70018] flex items-center gap-1.5"
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="bg-[#d70018] text-white text-[9px] px-1 py-0.5 rounded font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Nhóm submodel con */}
                  {item.groups && item.groups.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {item.groups.map((grp, gIdx) => (
                        <Link
                          key={gIdx}
                          href={grp.href}
                          onClick={() => setIsCategoryOpen(false)}
                          className="text-xs font-semibold text-gray-600 bg-white hover:text-[#d70018] hover:border-red-200 border border-gray-200/80 rounded px-2.5 py-2 truncate transition-colors shadow-2xs"
                        >
                          {grp.groupTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-600">
              <span>Hotline: <strong className="text-[#d70018]">0566.003.333</strong></span>
              <Link
                href="/admin/don-hang"
                onClick={() => setIsCategoryOpen(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                Quản trị
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};