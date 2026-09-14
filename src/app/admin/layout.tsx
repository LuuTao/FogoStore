'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Menu, Store } from 'lucide-react';
// Chú ý chữ B viết hoa: AdminSideBar
import AdminSideBar from '@/components/admin/AdminSideBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fogo_user');
      if (!savedUser) {
        setAuthorized(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.role === 'ADMIN') {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch {
      setAuthorized(false);
    }
  }, []);

  if (authorized === null) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center text-center px-4 select-none">
        <h1 className="text-8xl sm:text-9xl font-black text-[#d70018] tracking-widest drop-shadow-sm leading-none">
          404
        </h1>
        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mt-6 uppercase tracking-wide">
          Trang tìm kiếm không tồn tại
        </h2>
        <p className="text-base sm:text-lg text-gray-500 font-medium mt-3 max-w-lg leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại! Vui lòng quay lại trang chủ.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#d70018] hover:bg-red-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <Home size={22} />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col select-none">
      {/* 1. HEADER CHUNG TOÀN BỘ ADMIN */}
      <header className="bg-[#1e293b] text-white px-6 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/admin/don-hang" className="flex items-center gap-2 font-black tracking-wider text-lg">
            <span className="text-[#d70018]">FOGO</span>
            <span className="bg-[#d70018] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>
          </Link>
        </div>

        <Link
          href="/"
          target="_blank"
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
        >
          <span>Xem Cửa Hàng ↗</span>
        </Link>
      </header>

      {/* 2. THÂN TRANG: SIDEBAR + NỘI DUNG */}
      <div className="flex flex-1 relative">
        <AdminSideBar
          isOpenMobile={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}