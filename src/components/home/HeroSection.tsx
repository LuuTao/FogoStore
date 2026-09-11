'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS, PROMO_PAIRS } from '@/data/banners';

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>(HERO_BANNERS);
  const [promoList, setPromoList] = useState<any[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Đọc dữ liệu do Admin lưu
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('fogo_banners_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);

        if (Array.isArray(parsed)) {
          // 1. Banner lớn
          const heroList = parsed.filter((b: any) => b.group === 'hero_banners');
          if (heroList.length > 0) {
            setBanners(
              heroList.map((b: any) => ({
                id: b.id,
                title: b.name,
                imageUrl: b.imageUrl,
                link: b.link || '/',
              }))
            );
          }

          // 2. Banner nhỏ đè phía dưới
          const promos = parsed.filter((b: any) => b.group === 'promo_cards');
          if (promos.length > 0) {
            setPromoList(
              promos.map((b: any) => ({
                id: b.id,
                imageUrl: b.imageUrl,
                link: b.link || '/',
              }))
            );
            return;
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc cấu hình banner:', e);
    }

    // Fallback nếu chưa lưu trong Admin
    if (PROMO_PAIRS && PROMO_PAIRS.length > 0) {
      setPromoList(PROMO_PAIRS.flat());
    }
  }, []);

  // Tự động chuyển slider banner lớn mỗi 5s
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timerTop = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timerTop);
  }, [isHovered, banners.length]);

  // Gom các banner nhỏ thành từng cặp 2
  const promoPairs: any[][] = [];
  for (let i = 0; i < promoList.length; i += 2) {
    promoPairs.push(promoList.slice(i, i + 2));
  }

  // Tự động chuyển cặp banner nhỏ mỗi 4.5s
  useEffect(() => {
    if (isHovered || promoPairs.length <= 1) return;
    const timerBottom = setInterval(() => {
      setBottomIndex((prev) => (prev + 1) % promoPairs.length);
    }, 4500);
    return () => clearInterval(timerBottom);
  }, [isHovered, promoPairs.length]);

  const currentTop = banners[topIndex] || banners[0];
  const currentPair = promoPairs[bottomIndex] || promoList.slice(0, 2);

  return (
    <section
      className="w-full select-none relative pb-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. BANNER LỚN: WIDTH & HEIGHT NHƯ CŨ */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-900 flex items-center justify-center">
        {currentTop && (
          <Link href={currentTop.link || '/'} className="block w-full h-full">
            <img
              src={currentTop.imageUrl}
              alt={currentTop.title || 'Banner'}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
          </Link>
        )}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setTopIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setTopIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* 2. CẶP BANNER CON: THUẦN ẢNH, CHIỀU CAO CỐ ĐỊNH THEO PIXEL NHƯ CŨ */}
      {currentPair.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 relative z-30 -mt-16 md:-mt-20">
          <div className="relative">
            <div className={`grid gap-4 ${currentPair.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
              {currentPair.map((promo: any, idx: number) => (
                <Link
                  key={promo.id || idx}
                  href={promo.link || '/'}
                  className="block relative w-full h-[160px] sm:h-[180px] md:h-[200px] rounded-md overflow-hidden shadow-xl border border-gray-200 group bg-white cursor-pointer"
                >
                  <img
                    src={promo.imageUrl}
                    alt="Promo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              ))}
            </div>

            {promoPairs.length > 1 && (
              <>
                <button
                  onClick={() => setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-red-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setBottomIndex((prev) => (prev + 1) % promoPairs.length)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-red-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};