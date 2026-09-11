import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Banner đỏ trên cùng */}
      <div className="bg-[#fff1f2] text-[#d70018] text-center text-xs font-bold py-1.5 border-b border-red-100">
        DÙNG TRƯỚC TRẢ SAU - LÃI SUẤT 0%
      </div>

      {/* Bộ Header và Navbar */}
      <Header />
      <Navbar />

      {/* Nội dung trang */}
      <main className="flex-1">{children}</main>
    </div>
  );
}