'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white mt-16 border-t-4 border-[#d70018] select-none text-gray-700 text-sm md:text-base">
      {/* Khối nội dung chính chia 5 cột */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          
          {/* CỘT 1: VỀ FOGO STORE */}
          <div>
            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-4 tracking-tight">
              Về Fogo Store
            </h4>
            <p className="leading-relaxed text-gray-600 mb-5 text-sm md:text-base">
              Sự hài lòng của khách hàng chính là sản phẩm của Fogo
            </p>

            {/* Logo Đã thông báo Bộ Công Thương */}
            <div className="mb-5">
              <img
                src="/logoCongThuong.jpg"
                alt="Đã thông báo Bộ Công Thương"
                className="w-48 md:w-56 h-auto border border-blue-200 rounded p-1.5 object-contain shadow-sm"
              />
            </div>

            {/* Cụm icon mạng xã hội: Facebook, Instagram, TikTok */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/fogostorehcm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Fogo Store"
                className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:text-[#d70018] hover:border-[#d70018] transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.643 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/fogostore.vn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Fogo Store"
                className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:text-[#d70018] hover:border-[#d70018] transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@fogo.store"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Fogo Store"
                className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:text-[#d70018] hover:border-[#d70018] transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* CỘT 2: THÔNG TIN LIÊN HỆ */}
          <div>
            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-4 tracking-tight">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4 leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-900 shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">298 Trần Hưng Đạo, phường Nguyễn Cư Trinh, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={19} className="text-gray-900 shrink-0" />
                <span className="text-sm md:text-base font-bold text-gray-900">(+84)566003333</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={19} className="text-gray-900 shrink-0" />
                <span className="text-sm md:text-base">fogostore9393@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-4 tracking-tight">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/tim-kiem" className="hover:text-[#d70018] transition-colors font-medium">
                  • Tìm kiếm
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-[#d70018] transition-colors font-medium">
                  • Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-[#d70018] transition-colors font-medium">
                  • Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN KẾT */}
          <div>
            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-4 tracking-tight">
              Liên kết
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/iphone" className="hover:text-[#d70018] transition-colors font-medium">• iPhone</Link></li>
              <li><Link href="/ipad" className="hover:text-[#d70018] transition-colors font-medium">• iPad</Link></li>
              <li><Link href="/macbook" className="hover:text-[#d70018] transition-colors font-medium">• Macbook</Link></li>
              <li><Link href="/hang-cu/iphone-cu" className="hover:text-[#d70018] transition-colors font-medium">• iPhone Cũ</Link></li>
              <li><Link href="/hang-cu/ipad-cu" className="hover:text-[#d70018] transition-colors font-medium">• iPad Cũ</Link></li>
              <li><Link href="/hang-cu/macbook-cu" className="hover:text-[#d70018] transition-colors font-medium">• Macbook Cũ</Link></li>
              <li><Link href="/watch" className="hover:text-[#d70018] transition-colors font-medium">• Watch</Link></li>
              <li><Link href="/phu-kien" className="hover:text-[#d70018] transition-colors font-medium">• Phụ Kiện</Link></li>
        
            </ul>
          </div>

          {/* CỘT 5: CHÍNH SÁCH */}
          <div>
            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-4 tracking-tight">
              Chính sách
            </h4>
            <ul className="space-y-3 leading-snug">
              <li>
                <Link href="/chinh-sach-bao-hanh" className="hover:text-[#d70018] transition-colors font-medium block">
                  • Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-hanh-linh-kien-sua-chua-macbook" className="hover:text-[#d70018] transition-colors font-medium block">
                  • Chính Sách Bảo Hành Linh Kiện Sửa Chữa Macbook
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-hanh-fogo-care" className="hover:text-[#d70018] transition-colors font-medium block">
                  • Chính sách bảo hành Fogo Care
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Dải bản quyền dưới cùng */}
      <div className="border-t border-gray-200 py-5 text-center text-xs md:text-sm text-gray-600 bg-gray-50 font-medium">
        Copyright © 2026 Fogo Store - Apple Chính Hãng Giá Rẻ Vô Địch. Powered by Haravan
      </div>

      {/* Widget chat góc phải (Zalo & Facebook Messenger) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2.5 sm:gap-3">
        {/* Nút Zalo */}
        <a
          href="https://zalo.me/0566003333"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo Fogo Store"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform font-black text-xs md:text-sm"
        >
          Zalo
        </a>

        {/* Nút Facebook Messenger Fogo Store */}
        <a
          href="https://m.me/fogostorehcm"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Messenger Fogo Store"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
          title="Chat Facebook Messenger"
        >
          {/* Icon Messenger chuẩn */}
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.513 3.736 7.189v3.553a.75.75 0 0 0 1.157.633l3.208-1.782c.62.17 1.272.262 1.942.262 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.44-2.57-2.742-5.013 2.742 5.513-5.854 2.634 2.742 4.95-2.742-5.514 5.854z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};