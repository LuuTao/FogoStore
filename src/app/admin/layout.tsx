'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// Chú ý chữ B viết hoa: AdminSideBar
import AdminSideBar from '@/components/admin/AdminSideBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dang-nhap');
  }, [isLoading, router, user?.role]);

  if (isLoading || user?.role !== 'ADMIN') {
    return <div className="min-h-screen bg-white" />;
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
