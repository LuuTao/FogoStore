'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const API_BASE = `${API_URL}/api`;

const getFullImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:')) {
      return url.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    }
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanPath}`;
};

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [promoList, setPromoList] = useState<any[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Thao tác vuốt cảm ứng trên Mobile & Tablet
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (!isMounted) return;

            const heroList = json.data.filter((b: any) => b.group === 'hero_banners');
            if (heroList.length > 0) {
              setBanners(
                heroList.map((b: any) => ({
                  id: b.id,
                  title: b.title || b.name,
                  imageUrl: getFullImageUrl(b.imageUrl),
                  link: b.link || '/',
                }))
              );
            }

            const promos = json.data.filter((b: any) => b.group === 'promo_cards');
            if (promos.length > 0) {
              setPromoList(
                promos.map((b: any) => ({
                  id: b.id,
                  imageUrl: getFullImageUrl(b.imageUrl),
                  link: b.link || '/',
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error('Lỗi nạp banner từ Database:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động chuyển slider Hero
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timerTop = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timerTop);
  }, [isHovered, banners.length]);

  // Gom các banner phụ thành từng cặp 2
  const promoPairs: any[][] = [];
  for (let i = 0; i < promoList.length; i += 2) {
    promoPairs.push(promoList.slice(i, i + 2));
  }

  // Tự động chuyển slider cặp banner con
  useEffect(() => {
    if (isHovered || promoPairs.length <= 1) return;
    const timerBottom = setInterval(() => {
      setBottomIndex((prev) => (prev + 1) % promoPairs.length);
    }, 4500);
    return () => clearInterval(timerBottom);
  }, [isHovered, promoPairs.length]);

  // Xử lý vuốt trên màn hình cảm ứng (Mobile/Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || banners.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setTopIndex((prev) => (prev + 1) % banners.length);
      } else {
        setTopIndex((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    touchStartX.current = null;
  };

  const currentTop = banners[topIndex] || banners[0];
  const currentPair = promoPairs[bottomIndex] || promoList.slice(0, 2);

  // SKELETON CHỐNG CHỚP GIẬT
  if (loading && banners.length === 0) {
    return (
      <div className="w-full relative pb-6 lg:pb-16 animate-pulse">
        {/* Mobile & Tablet Skeleton */}
        <div className="block lg:hidden px-3 pt-2">
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="aspect-[16/8] sm:h-[130px] bg-gray-300 rounded-lg" />
            <div className="aspect-[16/8] sm:h-[130px] bg-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden lg:block">
          <div className="w-full h-[480px] lg:h-[540px] bg-gray-200" />
          <div className="max-w-7xl mx-auto px-4 relative -mt-16 md:-mt-20">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px] bg-gray-300 rounded-md shadow-lg" />
              <div className="h-[200px] bg-gray-300 rounded-md shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className="w-full select-none relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========================================================================= */}
      {/* 1. GIAO DIỆN RIÊNG CHO MOBILE (< 640px)                                  */}
      {/* ========================================================================= */}
      <div className="block sm:hidden px-3 pt-2 pb-4">
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 shadow-md">
          {currentTop && (
            <Link href={currentTop.link || '/'} className="block w-full h-full">
              <img
                src={currentTop.imageUrl}
                alt={currentTop.title || 'Banner'}
                className="w-full h-full object-cover"
              />
            </Link>
          )}

          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {banners.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    topIndex === idx ? 'w-4 bg-[#d70018]' : 'w-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2 Banner phụ dạng lưới 2 cột nhỏ xinh */}
        {promoList.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            {promoList.slice(0, 2).map((promo: any, idx: number) => (
              <Link
                key={promo.id || idx}
                href={promo.link || '/'}
                className="block relative aspect-[16/8] rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-white"
              >
                <img
                  src={promo.imageUrl}
                  alt="Promo"
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. GIAO DIỆN RIÊNG CHO TABLET / IPAD (640px -> 1023px)                     */}
      {/* ========================================================================= */}
      <div className="hidden sm:block lg:hidden px-4 pt-3 pb-6">
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-900 shadow-lg">
          {currentTop && (
            <Link href={currentTop.link || '/'} className="block w-full h-full">
              <img
                src={currentTop.imageUrl}
                alt={currentTop.title || 'Banner'}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </Link>
          )}

          {banners.length > 1 && (
            <>
              <button
                onClick={() => setTopIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-sm shadow"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setTopIndex((prev) => (prev + 1) % banners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-sm shadow"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Cặp banner con trên Tablet */}
        {promoList.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {promoList.slice(0, 2).map((promo: any, idx: number) => (
              <Link
                key={promo.id || idx}
                href={promo.link || '/'}
                className="block relative h-[140px] rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white"
              >
                <img
                  src={promo.imageUrl}
                  alt="Promo"
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. GIAO DIỆN DESKTOP (GIỮ NGUYÊN 100% NHƯ CŨ TRÊN MÀN HÌNH >= 1024px)     */}
      {/* ========================================================================= */}
      <div className="hidden lg:block pb-16">
        {/* Banner Lớn Desktop */}
        <div className="relative w-full h-[480px] lg:h-[540px] overflow-hidden bg-gray-900 flex items-center justify-center">
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

        {/* Cặp Banner Con Đè Dưới Desktop */}
        {currentPair.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 relative z-30 -mt-16 md:-mt-20">
            <div className="relative">
              <div
                className={`grid gap-4 ${
                  currentPair.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
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
      </div>
    </section>
  );
};