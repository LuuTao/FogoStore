'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryBanner {
  id: string | number;
  name: string;
  href: string;
  imageUrl: string;
}

// 4 Banner danh mục mẫu theo chuẩn Intrinsic size 700x500 (Render 350x250)
const DEFAULT_CATEGORY_BANNERS: CategoryBanner[] = [
  {
    id: 1,
    name: 'MacBook Air M5',
    href: '/macbook',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 2,
    name: 'iPhone Thế Hệ Mới',
    href: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 3,
    name: 'iPad Pro M4',
    href: '/ipad',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 4,
    name: 'Phụ Kiện Chính Hãng',
    href: '/phu-kien',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&h=500&q=80',
  },
];

export const CategoryGrid: React.FC = () => {
  const [banners, setBanners] = useState<CategoryBanner[]>(DEFAULT_CATEGORY_BANNERS);

  // Đọc dữ liệu từ Admin nếu có cấu hình nhóm promo_cards hoặc all_categories
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const adminItems = parsed.filter(
            (it: any) => it.group === 'promo_cards' || it.group === 'all_categories'
          );
          if (adminItems.length > 0) {
            const mapped = adminItems.slice(0, 4).map((it: any, idx: number) => ({
              id: it.id || idx,
              name: it.name || it.title || 'Banner',
              href: it.link || it.linkUrl || '/',
              imageUrl: it.imageUrl || DEFAULT_CATEGORY_BANNERS[idx]?.imageUrl,
            }));
            setBanners(mapped);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp banner CategoryGrid:', e);
    }
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 my-6 select-none">
      {/* 
        Grid 4 cột trên Desktop (mỗi cột hiển thị chuẩn ~350x250px) 
        Trên Mobile/Tablet chia 2 cột với tỷ lệ aspect-[7/5] chuẩn 100% 
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {banners.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group relative block w-full aspect-[7/5] max-w-[350px] mx-auto rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50 shadow-2xs hover:shadow-lg hover:border-[#d70018]/50 transition-all duration-300"
          >
            {/* Ảnh banner: intrinsic size chuẩn 700x500 render về 350x250 */}
            <img
              src={item.imageUrl}
              alt={item.name}
              width={700}
              height={500}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            />

            {/* Lớp phủ mờ nhẹ & Tên danh mục bên dưới chân card */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-6 flex items-end justify-between pointer-events-none">
              <span className="text-white text-xs sm:text-sm font-bold truncate drop-shadow-sm group-hover:text-red-300 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">
                Xem ngay
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;