import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { HomeContentSections } from '@/components/home/HomeContentSections';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      
      {/* ================= KHỐI HEADER + MENU CỐ ĐỊNH KHI CUỘN ================= */}
      <div className="sticky top-0 z-50 shadow-md">
        {/* 1. Header (Logo, Tìm kiếm, Hotline, Giỏ hàng, Đơn hàng, Tài khoản) */}
        <Header />

        {/* 2. Menu chính màu đỏ nhạt hơn (iPhone, iPad, Mac, v.v.) */}
        <Navbar />
      </div>

      {/* Nội dung có thể đổi thứ tự tại Admin > Quản lý Home */}
      <HomeContentSections />

      {/* 11. Chân trang (Footer) */}
      <Footer />
    </div>
  );
}
