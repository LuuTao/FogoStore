'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between text-black">
      <div>
        <div className="sticky top-0 z-50 shadow-xs">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-white py-2.5 px-4 text-[13px] text-gray-500 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            <Link href="/" className="hover:text-black">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">Giới thiệu</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Khung nội dung Giới thiệu */}
            <div
              className="lg:col-span-9 bg-white border border-gray-200 rounded-sm shadow-xs p-6 md:p-10 text-[20px] leading-[1.8] text-gray-900 space-y-6"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {/* Tiêu đề trang */}
              <h1 className="text-[28px] font-bold text-black tracking-tight text-left mb-6">
                Giới thiệu
              </h1>

              {/* Logo và Tiêu đề FOGO STORE chuẩn theo ảnh mẫu */}
              <div className="flex items-center justify-start gap-10 py-3">
                <div className="w-32 h-32 shrink-0 flex items-center justify-center">
                  <img
                    src="/logoFogo.png"
                    alt="logoFogo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-[46px] sm:text-[54px] font-black italic tracking-wide text-[#eb4436]">
                  FOGO STORE
                </h2>
              </div>

              {/* Nội dung đoạn văn (Tăng to hơn 1 size: 20px) */}
              <p className="text-justify font-bold">
                Fogo Store được thành lập dựa trên tiêu chí " Sự hài lòng của khách hàng chính là sản phẩm của Fogo". Chính vì thế những sản phẩm mà Fogo mang đến tay người tiêu dùng đều là những mặt hàng chính hãng với chế độ bảo hành rõ ràng, minh bạch. Chính những yếu tố ấy đã tạo nên thương hiệu tin cậy Fogo trong mắt người tiêu dùng.
              </p>

              <p className="text-justify font-bold">
                Fogo Store chuyên cung cấp các mặt hàng công nghệ như iPhone - Macbook - iPad - Apple Watch và phụ kiện chính hãng khác.
              </p>

              <p className="text-justify font-bold">
                Với mức giá cạnh tranh và chế độ bảo hành 12 tháng cho mọi thiết bị giúp cho Fogo luôn là sự lựa chọn ưu tiên của người tiêu dùng Việt Nam.
              </p>
            </div>

            {/* Sidebar Danh mục page */}
            <div className="lg:col-span-3 pl-0">
              <div className="border border-gray-200 rounded-sm bg-white shadow-xs sticky top-24">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 text-lg font-bold text-gray-900">
                  <span>Danh mục page</span>
                  <span className="text-gray-400 text-sm">▼</span>
                </div>
                <div className="divide-y divide-gray-100 text-[16px] text-gray-800">
                  <Link href="/" className="block p-4 hover:text-[#d70018] transition-colors">
                    Trang chủ
                  </Link>
                  <div className="flex items-center justify-between p-4 hover:text-[#d70018] cursor-pointer transition-colors">
                    <span>Sản phẩm</span>
                    <span className="text-gray-400 text-lg font-normal">+</span>
                  </div>
                  <Link href="/tin-tuc" className="block p-4 hover:text-[#d70018] transition-colors">
                    Tin tức
                  </Link>
                  <Link href="/pages/gioi-thieu" className="block p-4 text-[#d70018] font-bold">
                    Giới thiệu
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}