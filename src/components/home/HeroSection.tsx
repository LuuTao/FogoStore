'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';
const API_BASE = `${API_URL}/api`;

const DEFAULT_HERO_BANNERS = [
  {
    id: 'default-hero-1',
    title: 'iPhone 16 Pro Max - Thiết kế Titan sa mạc đẳng cấp',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop',
    link: '/iphone',
  },
  {
    id: 'default-hero-2',
    title: 'MacBook Pro M3 Max - Sức mạnh đỉnh cao cho chuyên gia',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2052&auto=format&fit=crop',
    link: '/macbook',
  },
  {
    id: 'default-hero-3',
    title: 'iPad Pro M4 - Siêu mỏng đỉnh cao hiển thị OLED',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2038&auto=format&fit=crop',
    link: '/ipad',
  },
];

const DEFAULT_PROMO_CARDS = [
  {
    id: 'default-promo-1',
    title: 'Thu Cũ Đổi Mới Trợ Giá Đến 2 Triệu',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1000&auto=format&fit=crop',
    link: '/hang-cu',
  },
  {
    id: 'default-promo-2',
    title: 'Phụ Kiện Apple Chính Hãng Giảm 30%',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1000&auto=format&fit=crop',
    link: '/phu-kien',
  },
  {
    id: 'default-promo-3',
    title: 'Apple Watch Series 10 - Đỉnh Cao Công Nghệ',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop',
    link: '/watch',
  },
  {
    id: 'default-promo-4',
    title: 'AirPods 4 Âm Thanh Vòm Siêu Thực',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1000&auto=format&fit=crop',
    link: '/phu-kien',
  },
];

const getFullImageUrl = (url?: string | null): string => {
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

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [promoList, setPromoList] = useState<any[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  const topTouchStartX = useRef<number | null>(null);
  const bottomTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (!isMounted) return;

            const heroList = json.data.filter(
              (b: any) => b.group === 'hero_banners' || b.position === 'hero_banners' || b.position === 'HOME_TOP'
            );
            if (heroList.length > 0) {
              setBanners(
                heroList.map((b: any) => ({
                  id: b.id,
                  title: b.title || b.name,
                  imageUrl: getFullImageUrl(b.imageUrl),
                  link: b.linkUrl || b.link || '/',
                }))
              );
            }

            const promos = json.data.filter(
              (b: any) => b.group === 'promo_cards' || b.position === 'promo_cards' || b.position === 'HOME_MIDDLE'
            );
            if (promos.length > 0) {
              setPromoList(
                promos.map((b: any) => ({
                  id: b.id,
                  title: b.title || b.name,
                  imageUrl: getFullImageUrl(b.imageUrl),
                  link: b.linkUrl || b.link || '/',
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

  const activeBanners = banners.length > 0 ? banners : DEFAULT_HERO_BANNERS;
  const activePromos = promoList.length > 0 ? promoList : DEFAULT_PROMO_CARDS;

  const promoPairs: any[][] = [];
  for (let i = 0; i < activePromos.length; i += 2) {
    promoPairs.push(activePromos.slice(i, i + 2));
  }

  // =========================================================================
  // ĐỒNG BỘ: CỨ 5 GIÂY LƯỚT CHUYỂN CẢ BANNER TRÊN VÀ DƯỚI CÙNG LÚC
  // =========================================================================
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      // 1. Chuyển Banner lớn
      if (activeBanners.length > 1) {
        setTopIndex((prev) => (prev + 1) % activeBanners.length);
      }
      // 2. Chuyển đồng thời cặp Banner nhỏ phía dưới
      if (promoPairs.length > 1) {
        setBottomIndex((prev) => (prev + 1) % promoPairs.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, activeBanners.length, promoPairs.length]);

  // Touch handlers cho Banner lớn
  const handleTopTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    topTouchStartX.current = e.touches[0].clientX;
  };

  const handleTopTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (topTouchStartX.current === null || activeBanners.length <= 1) return;
    const diff = topTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setTopIndex((prev) => (prev + 1) % activeBanners.length);
      } else {
        setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
      }
    }
    topTouchStartX.current = null;
  };

  // Touch handlers cho 2 Banner nhỏ
  const handleBottomTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    bottomTouchStartX.current = e.touches[0].clientX;
  };

  const handleBottomTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (bottomTouchStartX.current === null || promoPairs.length <= 1) return;
    const diff = bottomTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setBottomIndex((prev) => (prev + 1) % promoPairs.length);
      } else {
        setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length);
      }
    }
    bottomTouchStartX.current = null;
  };

  if (loading && banners.length === 0) {
    return (
      <div className="w-full relative pb-6 lg:pb-16 animate-pulse">
        <div className="block lg:hidden px-3 pt-2">
          <div className="w-full aspect-[1920/540] bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="aspect-[3/1] bg-gray-300 rounded-lg" />
            <div className="aspect-[3/1] bg-gray-300 rounded-lg" />
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="w-full aspect-[1920/540] max-h-[540px] bg-gray-200" />
          <div className="max-w-7xl mx-auto px-4 relative -mt-16">
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
    >
      {/* ========================================================================= */}
      {/* 1. GIAO DIỆN MOBILE (< 640px)                                             */}
      {/* ========================================================================= */}
      <div className="block sm:hidden px-3 pt-2 pb-4">
        {/* Banner Lớn: Trượt ngang mượt mà */}
        <div
          className="relative w-full aspect-[1920/540] rounded-xl overflow-hidden bg-gray-100 shadow-md"
          onTouchStart={handleTopTouchStart}
          onTouchEnd={handleTopTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${topIndex * 100}%)` }}
          >
            {activeBanners.map((banner, idx) => (
              <div key={banner.id || idx} className="w-full h-full shrink-0">
                <Link href={banner.link || '/'} className="block w-full h-full select-none">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </Link>
              </div>
            ))}
          </div>

          {activeBanners.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
              {activeBanners.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    topIndex === idx ? 'w-3.5 bg-[#d70018]' : 'w-1 bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2 Banner Nhỏ Dưới: Cùng trượt êm ái */}
        {promoPairs.length > 0 && (
          <div className="mt-2.5 relative">
            <div
              className="overflow-hidden rounded-lg"
              onTouchStart={handleBottomTouchStart}
              onTouchEnd={handleBottomTouchEnd}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${bottomIndex * 100}%)` }}
              >
                {promoPairs.map((pair: any[], pIdx: number) => (
                  <div key={pIdx} className="w-full shrink-0 grid grid-cols-2 gap-2">
                    {pair.map((promo: any, idx: number) => (
                      <Link
                        key={promo.id || idx}
                        href={promo.link || '/'}
                        className="block relative aspect-[3/1] rounded-lg overflow-hidden shadow-xs border border-gray-100 bg-white select-none active:scale-[0.98] transition-transform"
                      >
                        <img
                          src={promo.imageUrl}
                          alt={promo.title || 'Promo'}
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {promoPairs.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-2">
                {promoPairs.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBottomIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      bottomIndex === idx ? 'w-4 bg-[#d70018]' : 'w-1.5 bg-gray-300'
                    }`}
                    aria-label={`Trang ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. GIAO DIỆN TABLET (640px -> 1023px)                                     */}
      {/* ========================================================================= */}
      <div className="hidden sm:block lg:hidden px-4 pt-3 pb-6">
        <div
          className="relative w-full aspect-[1920/540] rounded-2xl overflow-hidden bg-gray-100 shadow-lg"
          onTouchStart={handleTopTouchStart}
          onTouchEnd={handleTopTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${topIndex * 100}%)` }}
          >
            {activeBanners.map((banner, idx) => (
              <div key={banner.id || idx} className="w-full h-full shrink-0">
                <Link href={banner.link || '/'} className="block w-full h-full select-none">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </Link>
              </div>
            ))}
          </div>

          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-xs shadow cursor-pointer transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-xs shadow cursor-pointer transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* 2 Banner Dưới Tablet */}
        {promoPairs.length > 0 && (
          <div className="mt-3 relative">
            <div
              className="overflow-hidden rounded-xl"
              onTouchStart={handleBottomTouchStart}
              onTouchEnd={handleBottomTouchEnd}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${bottomIndex * 100}%)` }}
              >
                {promoPairs.map((pair: any[], pIdx: number) => (
                  <div key={pIdx} className="w-full shrink-0 grid grid-cols-2 gap-3">
                    {pair.map((promo: any, idx: number) => (
                      <Link
                        key={promo.id || idx}
                        href={promo.link || '/'}
                        className="block relative h-[140px] rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white select-none active:scale-[0.98] transition-transform"
                      >
                        <img
                          src={promo.imageUrl}
                          alt="Promo"
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. GIAO DIỆN DESKTOP (>= 1024px)                                          */}
      {/* ========================================================================= */}
      <div className="hidden lg:block pb-16">
        {/* Banner Hero: Trượt ngang êm ái */}
        <div className="relative w-full aspect-[1920/540] max-h-[540px] overflow-hidden bg-gray-100">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${topIndex * 100}%)` }}
          >
            {activeBanners.map((banner, idx) => (
              <div key={banner.id || idx} className="w-full h-full shrink-0">
                <Link href={banner.link || '/'} className="block w-full h-full">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </Link>
              </div>
            ))}
          </div>

          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-all hover:scale-105"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-all hover:scale-105"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dấu chấm tròn điều hướng */}
              <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      topIndex === idx ? 'w-7 bg-[#d70018]' : 'w-2 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2 Banner Nhỏ Dưới: Trượt ngang đồng bộ nhịp 5 giây */}
        {promoPairs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 relative z-30 -mt-12 md:-mt-16">
            <div className="relative overflow-hidden rounded-md">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${bottomIndex * 100}%)` }}
              >
                {promoPairs.map((pair: any[], pIdx: number) => (
                  <div
                    key={pIdx}
                    className={`w-full shrink-0 grid gap-4 ${
                      pair.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-2'
                    }`}
                  >
                    {pair.map((promo: any, idx: number) => (
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
                ))}
              </div>

              {promoPairs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomIndex((prev) => (prev + 1) % promoPairs.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-red-700 transition-colors"
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