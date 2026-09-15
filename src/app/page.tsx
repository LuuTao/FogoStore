import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { IPhoneShowcaseSection } from '@/components/home/IPhoneShowcaseSection';
import { IPadShowcaseSection } from '@/components/home/IPadShowcaseSection';
import { MacBookShowcaseSection } from '@/components/home/MacBookShowcaseSection';
import { LatestNewsSection } from '@/components/home/LatestNewsSection';
import { CommitmentSection } from '@/components/home/CommitmentSection';
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

      {/* ================= NỘI DUNG TRANG CHỦ ================= */}
      {/* 3. Hero Banner tràn viền & 2 Banner phụ trượt đôi */}
      <HeroSection />

      {/* 5. Khối Sản phẩm Flash Sale */}
      <FeaturedProductsSection />

      {/* 4. Dải ưu đãi tiện ích & Bảng icon danh mục */}
      <CategoryGrid />

      {/* 6. Khối iPhone */}
      <IPhoneShowcaseSection />

      {/* 7. Khối iPad */}
      <IPadShowcaseSection />

      {/* 8. Khối MacBook */}
      <MacBookShowcaseSection />
      
      {/* 10. Khối Cam kết uy tín */}
      <CommitmentSection />

      {/* 9. Khối Tin tức */}
      <LatestNewsSection />

      

      {/* 11. Chân trang (Footer) */}
      <Footer />
    </div>
  );
}