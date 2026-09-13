'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
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
    title: 'Apple Watch Series 10 - Siêu Phẩm Mới',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop',
    link: '/watch',
  },
  {
    id: 'default-promo-4',
    title: 'AirPods 4 Chống Ồn Chủ Động',
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

  // Lưu tọa độ cảm ứng riêng biệt cho banner trên và banner dưới
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

  // Tự động chuyển slider Hero
  useEffect(() => {
    if (isHovered || activeBanners.length <= 1) return;
    const timerTop = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timerTop);
  }, [isHovered, activeBanners.length]);

  // Gom các banner phụ thành cặp 2
  const promoPairs: any[][] = [];
  for (let i = 0; i < activePromos.length; i += 2) {
    promoPairs.push(activePromos.slice(i, i + 2));
  }

  // Tự động chuyển cặp banner con
  useEffect(() => {
    if (isHovered || promoPairs.length <= 1) return;
    const timerBottom = setInterval(() => {
      setBottomIndex((prev) => (prev + 1) % promoPairs.length);
    }, 4500);
    return () => clearInterval(timerBottom);
  }, [isHovered, promoPairs.length]);

  // --- XỬ LÝ VUỐT CẢM ỨNG BANNER LỚN (TRÊN) ---
  const handleTopTouchStart = (e: React.TouchEvent) => {
    topTouchStartX.current = e.touches[0].clientX;
  };

  const handleTopTouchEnd = (e: React.TouchEvent) => {
    if (topTouchStartX.current === null || activeBanners.length <= 1) return;
    const diff = topTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setTopIndex((prev) => (prev + 1) % activeBanners.length);
      } else {
        setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
      }
    }
    topTouchStartX.current = null;
  };

  // --- XỬ LÝ VUỐT CẢM ỨNG BANNER CON (DƯỚI) ---
  const handleBottomTouchStart = (e: React.TouchEvent) => {
    bottomTouchStartX.current = e.touches[0].clientX;
  };

  const handleBottomTouchEnd = (e: React.TouchEvent) => {
    if (bottomTouchStartX.current === null || promoPairs.length <= 1) return;
    const diff = bottomTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setBottomIndex((prev) => (prev + 1) % promoPairs.length);
      } else {
        setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length);
      }
    }
    bottomTouchStartX.current = null;
  };

  const currentTop = activeBanners[topIndex] || activeBanners[0];
  const currentPair = promoPairs[bottomIndex] || promoPairs[0] || activePromos.slice(0, 2);

  if (loading && banners.length === 0) {
    return (
      <div className="w-full relative pb-6 lg:pb-16 animate-pulse">
        <div className="block lg:hidden px-3 pt-2">
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="aspect-[16/8] sm:h-[130px] bg-gray-300 rounded-lg" />
            <div className="aspect-[16/8] sm:h-[130px] bg-gray-300 rounded-lg" />
          </div>
        </div>

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
    >
      {/* ========================================================================= */}
      {/* 1. GIAO DIỆN MOBILE (< 640px)                                             */}
      {/* ========================================================================= */}
      <div className="block sm:hidden px-3 pt-2 pb-4">
        {/* Banner Lớn Mobile (Vuốt lướt qua lại) */}
        <div
          className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 shadow-md"
          onTouchStart={handleTopTouchStart}
          onTouchEnd={handleTopTouchEnd}
        >
          {currentTop && (
            <Link href={currentTop.link || '/'} className="block w-full h-full">
              <img
                src={currentTop.imageUrl}
                alt={currentTop.title || 'Banner'}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </Link>
          )}

          {activeBanners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {activeBanners.map((_, idx) => (
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

        {/* Cặp Banner Nhỏ Bên Dưới (Hỗ trợ vuốt lướt mượt mà) */}
        {promoPairs.length > 0 && (
          <div
            className="mt-2.5 relative"
            onTouchStart={handleBottomTouchStart}
            onTouchEnd={handleBottomTouchEnd}
          >
            <div className="grid grid-cols-2 gap-2">
              {currentPair.map((promo: any, idx: number) => (
                <Link
                  key={promo.id || idx}
                  href={promo.link || '/'}
                  className="block relative aspect-[16/8] rounded-lg overflow-hidden shadow-xs border border-gray-100 bg-white"
                >
                  <img
                    src={promo.imageUrl}
                    alt="Promo"
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </Link>
              ))}
            </div>

            {/* Chấm tròn báo trang cho banner dưới trên Mobile */}
            {promoPairs.length > 1 && (
              <div className="flex justify-center items-center gap-1 mt-2">
                {promoPairs.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBottomIndex(idx)}
                    className={`h-1 rounded-full transition-all ${
                      bottomIndex === idx ? 'w-3 bg-[#d70018]' : 'w-1 bg-gray-300'
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
          className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 shadow-lg"
          onTouchStart={handleTopTouchStart}
          onTouchEnd={handleTopTouchEnd}
        >
          {currentTop && (
            <Link href={currentTop.link || '/'} className="block w-full h-full">
              <img
                src={currentTop.imageUrl}
                alt={currentTop.title || 'Banner'}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </Link>
          )}

          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-xs shadow cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#d70018] text-white flex items-center justify-center backdrop-blur-xs shadow cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Cặp banner con trên Tablet */}
        {promoPairs.length > 0 && (
          <div
            className="mt-3 relative"
            onTouchStart={handleBottomTouchStart}
            onTouchEnd={handleBottomTouchEnd}
          >
            <div className="grid grid-cols-2 gap-3">
              {currentPair.map((promo: any, idx: number) => (
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

            {promoPairs.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-2.5">
                {promoPairs.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBottomIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      bottomIndex === idx ? 'w-4 bg-[#d70018]' : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. GIAO DIỆN DESKTOP (>= 1024px)                                          */}
      {/* ========================================================================= */}
      <div className="hidden lg:block pb-16">
        <div className="relative w-full h-[480px] lg:h-[540px] overflow-hidden bg-gray-100 flex items-center justify-center">
          {currentTop && (
            <Link href={currentTop.link || '/'} className="block w-full h-full">
              <img
                src={currentTop.imageUrl}
                alt={currentTop.title || 'Banner'}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
            </Link>
          )}

          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => setTopIndex((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

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
                    type="button"
                    onClick={() => setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
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