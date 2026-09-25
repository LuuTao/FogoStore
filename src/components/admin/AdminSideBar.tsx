'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Activity,
  ShoppingCart,
  Layers,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Menu as MenuIcon,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const MENU_ITEMS = [
  { href: '/admin/thong-ke', label: 'Doanh Thu & Thống Kê', icon: TrendingUp },
  { href: '/admin/khach-hang', label: 'Quản Lý Khách Hàng', icon: Users },
  { href: '/admin/thong-ke-truy-cap', label: 'Quản Lý Truy Cập', icon: Activity },
  { href: '/admin/don-hang', label: 'Quản Lý Đơn Hàng', icon: ShoppingCart },
  { href: '/admin/ton-kho', label: 'Quản Lý Tồn Kho', icon: Layers },
  { href: '/admin/nhap-excel', label: 'Nhập Sản Phẩm Excel', icon: FileSpreadsheet },
  { href: '/admin/nhap-bai-viet-seo', label: 'Nhập Bài Viết SEO', icon: FileText },
  { href: '/admin/bai-viet', label: 'Quản Lý Bài Viết SEO', icon: FileText },
  { href: '/admin/banner', label: 'Quản Lý Banner', icon: ImageIcon },
  { href: '/admin/menu', label: 'Quản Lý Menu', icon: MenuIcon },
  { href: '/admin/manage-seo', label: 'Quản Lý SEO', icon: Search },
  { href: '/admin/manage-specifications', label: 'Thông Số Kỹ Thuật', icon: SlidersHorizontal },
  { href: '/admin/bao-mat', label: 'Bảo Mật & Log Nguy Cơ', icon: ShieldAlert },
];

export default function AdminSidebar({
  isOpenMobile = false,
  onCloseMobile,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Đăng xuất và xóa toàn bộ token lưu trên máy
  const handleLogout = () => {
    localStorage.removeItem('fogo_token');
    localStorage.removeItem('fogo_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('fogo_admin_token');

    // Xóa cookie nếu có
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'fogo_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    router.push('/');
    window.location.reload();
  };

  return (
    <>
      {/* 1. DRAWER SLIDE-OVER CHO MOBILE & TABLET (< 1024px) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Lớp nền mờ */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Khung drawer trượt ra */}
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

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#d70018] text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Chân drawer mobile */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                <ExternalLink size={14} />
                <span>Xem Cửa Hàng</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-50 text-[#d70018] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut size={14} />
                <span>Đăng Xuất Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CỘT DỌC CỐ ĐỊNH TRÊN DESKTOP (>= 1024px) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-4 shrink-0 min-h-[calc(100vh-60px)]">
        <div className="text-[11px] font-extrabold uppercase text-gray-400 px-3 py-1 tracking-wider mb-1">
          Menu Điều Hành
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d70018] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Chân sidebar desktop */}
        <div className="pt-3 border-t border-gray-100 space-y-1.5 mt-auto">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            <ExternalLink size={14} />
            <span>Xem Cửa Hàng</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-50 text-[#d70018] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}