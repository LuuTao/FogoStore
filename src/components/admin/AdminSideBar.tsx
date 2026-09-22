'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  ShoppingCart,
  Layers,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface Props {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}
const MENU_ITEMS = [
  { href: '/admin/thong-ke', label: 'Doanh Thu & Thống Kê', icon: TrendingUp },
  { href: '/admin/khach-hang', label: 'Quản Lý Khách Hàng', icon: ImageIcon },
  { href: '/admin/thong-ke-truy-cap', label: 'Quản Lý Truy Cập', icon: ImageIcon },
  { href: '/admin/don-hang', label: 'Quản Lý Đơn Hàng', icon: ShoppingCart },
  { href: '/admin/ton-kho', label: 'Quản Lý Tồn Kho', icon: Layers },
  { href: '/admin/nhap-excel', label: 'Nhập Sản Phẩm Excel', icon: FileSpreadsheet },
  { href: '/admin/bai-viet', label: 'Bài Viết & SEO Blog', icon: FileText },
  { href: '/admin/banner', label: 'Quản Lý Banner', icon: ImageIcon },
  { href: '/admin/menu', label: 'Quản Lý Menu', icon: ImageIcon },
  { href: '/admin/manage-seo', label: 'Quản Lý SEO', icon: ImageIcon },
  { href: '/admin/manage-specifications', label: 'Quản Lý Thông Số Kỹ Thuật', icon: ImageIcon },
  { href: '/admin/bao-mat', label: 'Bảo Mật & Log Nguy Cơ', icon: ImageIcon },
];

export default function AdminSidebar({
  isOpenMobile = false,
  onCloseMobile,
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. DRAWER SLIDE-OVER CHO MOBILE & TABLET (< 1024px) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Lớp nền mờ click ra ngoài để đóng */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Khung drawer trượt ra từ mép trái */}
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#d70018] text-white">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                MENU QUẢN TRỊ FOGO
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#d70018] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 text-center">
              Hệ thống quản trị FoGo Store
            </div>
          </div>
        </div>
      )}

      {/* 2. CỘT DỌC CỐ ĐỊNH TRÊN DESKTOP (>= 1024px) */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 space-y-1.5 shrink-0 min-h-[calc(100vh-60px)]">
        <div className="text-[11px] font-extrabold uppercase text-gray-400 px-3 py-1 tracking-wider">
          Menu Điều Hành
        </div>
        {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#d70018] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </aside>
    </>
  );
}