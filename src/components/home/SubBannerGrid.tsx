'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS, PROMO_PAIRS } from '@/data/banners';

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>(HERO_BANNERS);
  const [promoPairs, setPromoPairs] = useState<any[][]>(PROMO_PAIRS);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('fogo_banners_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);

        if (Array.isArray(parsed)) {
          // Lọc banner lớn
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

          // Lọc 2 banner nhỏ thuần ảnh
          const promoCards = parsed.filter((b: any) => b.group === 'promo_cards');
          if (promoCards.length >= 2) {
            const mappedPromos = promoCards.map((b: any) => ({
              id: b.id,
              imageUrl: b.imageUrl,
              link: b.link || '/',
            }));

            const pairs = [];
            for (let i = 0; i < mappedPromos.length; i += 2) {
              pairs.push(mappedPromos.slice(i, i + 2));
            }
            setPromoPairs(pairs);
            return;
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc cấu hình banner:', e);
    }

    // Fallback API backend
    const fetchBannersFromAPI = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/banners', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const topList = data.data.filter((b: any) => b.position === 'HOME_TOP');
          if (topList.length > 0) {
            setBanners(
              topList.map((b: any) => ({
                id: b.id,
                title: b.title,
                imageUrl: b.imageUrl,
                link: b.linkUrl || '/',
              }))
            );
          }

          const promoList = data.data.filter((b: any) => b.position === 'HOME_PROMO_PAIR');
          if (promoList.length >= 2) {
            const pairs = [];
            for (let i = 0; i < promoList.length; i += 2) {
              pairs.push(
                promoList.slice(i, i + 2).map((b: any) => ({
                  id: b.id,
                  imageUrl: b.imageUrl,
                  link: b.linkUrl || '/',
                }))
              );
            }
            setPromoPairs(pairs);
          }
        }
      } catch (err) {
        console.error('Lỗi tải banner từ backend:', err);
      }
    };

    fetchBannersFromAPI();
  }, []);

  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timerTop = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timerTop);
  }, [isHovered, banners.length]);

  useEffect(() => {
    if (isHovered || promoPairs.length <= 1) return;
    const timerBottom = setInterval(() => {
      setBottomIndex((prev) => (prev + 1) % promoPairs.length);
    }, 4000);
    return () => clearInterval(timerBottom);
  }, [isHovered, promoPairs.length]);

  const currentTop = banners[topIndex] || banners[0];
  const currentBottomPair = promoPairs[bottomIndex] || promoPairs[0] || [];

  return (
    <section
      className="w-full select-none relative pb-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. BANNER LỚN CO GIÃN TỶ LỆ */}
      <div className="relative w-full aspect-[21/10] sm:aspect-[21/9] md:aspect-[2.7/1] lg:aspect-[2.85/1] overflow-hidden bg-gray-900 flex items-center justify-center">
        {currentTop && (
          <Link href={currentTop.link || '/'} className="block w-full h-full">
            <img
              src={currentTop.imageUrl}
              alt={currentTop.title || 'Banner'}
              className="w-full h-full object-contain md:object-cover object-top md:object-center transition-all duration-500"
            />
          </Link>
        )}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setTopIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setTopIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* 2. CẶP 2 BANNER CON THUẦN ẢNH */}
      {currentBottomPair.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 relative z-30 -mt-6 sm:-mt-8 md:-mt-10 lg:-mt-12">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {currentBottomPair.map((promo: any) => (
                <Link
                  key={promo.id}
                  href={promo.link || '/'}
                  className="block relative w-full h-[140px] sm:h-[170px] md:h-[190px] rounded-lg overflow-hidden shadow-lg border border-gray-200 group bg-white cursor-pointer"
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