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

const DEFAULT_CATEGORY_BANNERS = [
  {
    id: 'cat-b1',
    name: 'banner1',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b2',
    name: 'banner2',
    link: '/ipad',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b3',
    name: 'banner3',
    link: '/macbook',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&h=500&q=80',
  },
  {
    id: 'cat-b4',
    name: 'banner4',
    link: '/phu-kien',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&h=500&q=80',
  },
];

export const CategoryGrid: React.FC = () => {
  const [categoryBanners, setCategoryBanners] = useState<any[]>(DEFAULT_CATEGORY_BANNERS);
  const [categories, setCategories] = useState<any[]>(QUICK_CATEGORIES);

  const loadData = useCallback(async () => {
    // 1. Đọc nhanh từ localStorage
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const adminCatBanners = parsed.filter(
            (it: any) => it.group === 'category_banners' || it.position === 'category_banners'
          );
          if (adminCatBanners.length > 0) {
            setCategoryBanners(
              adminCatBanners.slice(0, 4).map((it: any, idx: number) => ({
                id: it.id || `cb-${idx}`,
                name: it.name || it.title || `banner${idx + 1}`,
                link: it.link || it.linkUrl || '/',
                imageUrl: resolveImageUrl(it.imageUrl),
              }))
            );
          }

          const adminCats = parsed.filter(
            (it: any) => it.group === 'all_categories' || it.position === 'all_categories'
          );
          if (adminCats.length > 0) {
            setCategories(
              adminCats.map((it: any, index: number) => ({
                id: it.id || `cat-${index}`,
                name: it.name || it.title || 'Danh mục',
                href: it.link || it.linkUrl || '/',
                imageUrl: resolveImageUrl(it.imageUrl),
              }))
            );
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cache localStorage:', e);
    }

    // 2. Fetch mới nhất từ API Backend
    try {
      const res = await fetch(`${API_URL}/api/banners?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const dataList = json.data || json;
        if (Array.isArray(dataList) && dataList.length > 0) {
          const liveCatBanners = dataList.filter(
            (it: any) => it.group === 'category_banners' || it.position === 'category_banners'
          );
          if (liveCatBanners.length > 0) {
            setCategoryBanners(
              liveCatBanners.slice(0, 4).map((it: any, idx: number) => ({
                id: it.id || `cb-${idx}`,
                name: it.name || it.title || `banner${idx + 1}`,
                link: it.link || it.linkUrl || '/',
                imageUrl: resolveImageUrl(it.imageUrl),
              }))
            );
          }

          const liveCats = dataList.filter(
            (it: any) => it.group === 'all_categories' || it.position === 'all_categories'
          );
          if (liveCats.length > 0) {
            setCategories(
              liveCats.map((it: any, index: number) => ({
                id: it.id || `cat-${index}`,
                name: it.name || it.title || 'Danh mục',
                href: it.link || it.linkUrl || '/',
                imageUrl: resolveImageUrl(it.imageUrl),
              }))
            );
          }
        }
      }
    } catch (err) {
      console.warn('Không thể fetch live banners:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('fogo_banners_updated', handleUpdate);
    return () => window.removeEventListener('fogo_banners_updated', handleUpdate);
  }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-2 sm:mt-3 select-none space-y-3 sm:space-y-4">

      {/* ========================================================================= */}
      {/* PHẦN 2: THANH 3 CAM KẾT                                                    */}
      {/* ========================================================================= */}
      <div className="w-full pt-1 pb-1.5 px-1 sm:px-3">
        <div className="grid grid-cols-3 items-center justify-items-center gap-1 sm:gap-4 md:gap-8 max-w-4xl mx-auto text-gray-950">
          
          {/* Cam kết 1 */}
          <div className="flex items-center gap-1 sm:gap-2 text-center sm:text-left">
            <Award className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-900 shrink-0" strokeWidth={2.2} />
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold leading-tight">
              Đảm bảo chất lượng
            </span>
          </div>

          {/* Cam kết 2 */}
          <div className="flex items-center gap-1 sm:gap-2 text-center sm:text-left">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-900 shrink-0" strokeWidth={2.2} />
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold leading-tight">
              Thu cũ đổi mới
            </span>
          </div>

          {/* Cam kết 3 */}
          <div className="flex items-center gap-1 sm:gap-2 text-center sm:text-left">
            <Truck className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-900 shrink-0" strokeWidth={2.2} />
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold leading-tight">
              Miễn phí vận chuyển
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 3: LƯỚI CATEGORIES ITEM NHỎ BO TRÒN GÓC TUYỆT ĐỐI                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-xs border border-gray-100">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 md:gap-3">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={item.href || '/'}
              className="flex flex-col items-center justify-between p-1.5 sm:p-2 md:p-2.5 rounded-lg border border-gray-100 hover:border-[#d70018]/50 hover:shadow-md transition-all group bg-white text-center min-h-[95px] sm:min-h-[110px]"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#f8f9fa] border border-gray-200 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-2xs"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-gray-700 group-hover:text-[#d70018] transition-colors leading-tight mt-1.5 line-clamp-2">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1: 4 BANNER CATEGORY CHỮ NHẬT (TỶ LỆ 7:5 / 350x250px)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
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