'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Truck } from 'lucide-react';
import { QUICK_CATEGORIES } from '@/data/quickCategories';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:')) {
      return url.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    }
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanPath}`;
};

// 4 Banner Category mặc định (Render 350x250px / Intrinsic 700x500px)
const DEFAULT_CATEGORY_BANNERS = [
  {
    id: 'cat-b1',
    name: 'Trợ Giá Thu Cũ Lên Tới 90%',
    link: '/hang-cu',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b2',
    name: 'iPad Pro M5 Hiệu Năng Vô Hạn',
    link: '/ipad',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b3',
    name: 'iPhone 18 Pro Max',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b4',
    name: 'iPhone 17 Pro Max',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&h=500&q=80',
  },
];

export const CategoryGrid: React.FC = () => {
  const [categoryBanners, setCategoryBanners] = useState<any[]>(DEFAULT_CATEGORY_BANNERS);
  const [categories, setCategories] = useState<any[]>(QUICK_CATEGORIES);

  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // 1. Nạp 4 Banner Category chữ nhật
          const adminCategoryBanners = parsed.filter(
            (it: any) => it.group === 'category_banners' || it.group === 'promo_cards'
          );
          if (adminCategoryBanners.length > 0) {
            setCategoryBanners(
              adminCategoryBanners.slice(0, 4).map((it: any, idx: number) => ({
                id: it.id || `cb-${idx}`,
                name: it.name || it.title || 'Banner',
                link: it.link || it.linkUrl || '/',
                imageUrl: resolveImageUrl(it.imageUrl) || DEFAULT_CATEGORY_BANNERS[idx]?.imageUrl,
              }))
            );
          }

          // 2. Nạp Lưới icon nhỏ các dòng máy
          const adminCategories = parsed.filter((it: any) => it.group === 'all_categories');
          if (adminCategories.length > 0) {
            const mapped = adminCategories.map((it: any, index: number) => {
              const fallback = QUICK_CATEGORIES[index] || {};
              return {
                id: it.id || fallback.id || index,
                name: it.name || fallback.name || '',
                href: it.link || fallback.href || '/iphone',
                imageUrl: resolveImageUrl(it.imageUrl) || fallback.imageUrl,
              };
            });
            setCategories(mapped);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp dữ liệu CategoryGrid:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('fogo_banners_updated', handleUpdate);
    return () => window.removeEventListener('fogo_banners_updated', handleUpdate);
  }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-3 select-none space-y-4">
      
      {/* ========================================================================= */}
      {/* PHẦN 2: THANH 3 CAM KẾT - SÁT LÊN TRÊN, CĂN GIỮA, TO THÊM 4 SIZE           */}
      {/* ========================================================================= */}
      <div className="w-full pt-1 pb-2 flex items-center justify-center">
        <div className="flex items-center justify-center gap-8 sm:gap-14 md:gap-20 flex-wrap text-gray-950 text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight">
          {/* 1. Đảm bảo chất lượng */}
          <div className="flex items-center gap-3">
            <Award size={34} strokeWidth={2.4} className="text-gray-900 shrink-0" />
            <span>Đảm bảo chất lượng</span>
          </div>

          {/* 2. Thu cũ đổi mới */}
          <div className="flex items-center gap-3">
            <CheckCircle2 size={34} strokeWidth={2.4} className="text-gray-900 shrink-0" />
            <span>Thu cũ đổi mới</span>
          </div>

          {/* 3. Miễn phí vận chuyển */}
          <div className="flex items-center gap-3">
            <Truck size={36} strokeWidth={2.4} className="text-gray-900 shrink-0" />
            <span>Miễn phí vận chuyển</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 3: LƯỚI CATEGORIES ITEM NHỎ (CẬP NHẬT ĐỘNG TỪ ADMIN)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 md:gap-3">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={item.href || '/'}
              className="flex flex-col items-center justify-between p-2 md:p-2.5 rounded-lg border border-gray-100/90 hover:border-[#d70018]/50 hover:shadow-md transition-all group bg-white text-center min-h-[110px]"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center overflow-hidden">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-gray-700 group-hover:text-[#d70018] transition-colors leading-tight mt-1.5 line-clamp-2">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1: 4 BANNER CATEGORY CHỮ NHẬT (TỶ LỆ 7:5 / RENDER 350x250px)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categoryBanners.map((item) => (
          <Link
            key={item.id}
            href={item.link || '/'}
            className="group relative block w-full aspect-[7/5] rounded-xl overflow-hidden border border-gray-200/80 bg-gray-100 shadow-2xs hover:shadow-lg hover:border-[#d70018]/50 transition-all duration-300"
          >
            <img
              src={resolveImageUrl(item.imageUrl)}
              alt={item.name}
              width={700}
              height={500}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            />

          </Link>
        ))}
      </div>

    </div>
  );
};

export default CategoryGrid;