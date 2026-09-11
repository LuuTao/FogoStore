'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, RefreshCw, Wallet, CalendarDays } from 'lucide-react';
import { QUICK_CATEGORIES } from '@/data/quickCategories';

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState(QUICK_CATEGORIES);

  // Lắng nghe và đọc dữ liệu danh mục do Admin cấu hình
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const adminCategories = parsed.filter((it: any) => it.group === 'all_categories');
          if (adminCategories.length > 0) {
            const mapped = adminCategories.map((it: any, index: number) => {
              const fallback = QUICK_CATEGORIES[index] || {};
              return {
                id: it.id || fallback.id || index,
                name: it.name || fallback.name || '',
                href: it.link || fallback.href || '/iphone',
                imageUrl: it.imageUrl || fallback.imageUrl,
              };
            });
            setCategories(mapped);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp danh mục cấu hình:', e);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 select-none">
      {/* ================= 1. DẢI BANNER ƯU ĐÃI NẰM NGANG ================= */}
      <div className="bg-[#fff1f2] border border-[#ffd1d7] rounded-xl p-3 md:p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center divide-y md:divide-y-0 md:divide-x divide-red-200">
          
          {/* Cột 1: Tựu trường rộn ràng */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#d70018]/10 flex items-center justify-center text-[#d70018] shrink-0">
              🎓
            </div>
            <div>
              <span className="text-xs md:text-sm font-black text-[#d70018] uppercase tracking-tight block">
                TỰU TRƯỜNG RỘN RÀNG
              </span>
              <span className="text-[11px] font-semibold text-gray-600">Ưu đãi ngập tràn</span>
            </div>
          </div>

          {/* Cột 2: Đổi giấy báo trúng tuyển */}
          <div className="flex items-center gap-3 px-3 pt-3 md:pt-0">
            <div className="w-9 h-9 rounded-lg bg-[#d70018] text-white flex items-center justify-center shrink-0">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                ĐỔI GIẤY BÁO TRÚNG TUYỂN
              </span>
              <span className="text-[11px] text-gray-500">
                Nhận voucher đến <strong className="text-[#d70018]">1.5 TRIỆU</strong>
              </span>
            </div>
          </div>

          {/* Cột 3: Thu cũ lên đời trợ giá */}
          <div className="flex items-center gap-3 px-3 pt-3 md:pt-0">
            <div className="w-9 h-9 rounded-lg bg-[#d70018] text-white flex items-center justify-center shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                THU CŨ LÊN ĐỜI, TRỢ GIÁ
              </span>
              <span className="text-[11px] text-gray-500">
                iPad <strong className="text-[#d70018]">500K</strong> | MacBook <strong className="text-[#d70018]">1 TRIỆU</strong>
              </span>
            </div>
          </div>

          {/* Cột 4: Dùng trước trả sau 0% */}
          <div className="flex items-center justify-between px-3 pt-3 md:pt-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#d70018] text-white flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  DÙNG TRƯỚC TRẢ SAU
                </span>
                <span className="text-[11px] text-gray-600 font-semibold">
                  Góp <span className="text-[#d70018]">0%</span> | Trả trước <span className="text-[#d70018]">0đ</span> | Phí <span className="text-[#d70018]">0đ</span>
                </span>
              </div>
            </div>

            {/* Khung thời gian áp dụng */}
            <div className="hidden lg:flex flex-col items-end border border-red-300 rounded px-2 py-0.5 bg-white/70 text-[9px] text-[#d70018] font-bold shrink-0">
              <span className="flex items-center gap-0.5">
                <CalendarDays size={10} /> Áp dụng từ:
              </span>
              <span className="text-gray-700">01.09 - 30.09</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 2. BẢNG LƯỚI ICON CẬP NHẬT ĐỘNG TỪ ADMIN ================= */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 md:gap-3">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={item.href || '/'}
              className="flex flex-col items-center justify-between p-2 md:p-2.5 rounded-lg border border-gray-100/90 hover:border-[#d70018]/50 hover:shadow-md transition-all group bg-white text-center min-h-[110px]"
            >
              {/* Hình ảnh đại diện model máy */}
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Tên dòng máy */}
              <span className="text-[11px] md:text-xs font-semibold text-gray-700 group-hover:text-[#d70018] transition-colors leading-tight mt-1.5 line-clamp-2">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};