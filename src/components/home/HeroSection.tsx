'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS, PROMO_PAIRS } from '@/data/banners';

const API_BASE = 'https://fogo-store-api.onrender.com/api';

// Hàm chuẩn hóa link ảnh an toàn HTTPS, không bao giờ để lọt localhost
const sanitizeUrl = (url?: string | null): string => {
  if (!url) return '';
  return url.replace(/http:\/\/localhost:[0-9]+/g, 'https://fogo-store-api.onrender.com');
};

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>(HERO_BANNERS);
  const [promoList, setPromoList] = useState<any[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAllBanners = async () => {
      let bannerData: any[] = [];

      // 1. ƯU TIÊN SỐ 1: Lấy trực tiếp từ Database qua Backend Render
      try {
        const res = await fetch(`${API_BASE}/banners`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            bannerData = json.data;
          }
        }
      } catch (err) {
        console.warn('Backend chưa phản hồi, chuyển sang đọc bộ nhớ đệm cục bộ.');
      }

      // 2. DỰ PHÒNG 2: Nếu mạng lag/Render đang ngủ thì lấy localStorage tạm
      if (bannerData.length === 0 && typeof window !== 'undefined') {
        try {
          const savedConfig = localStorage.getItem('fogo_banners_config');
          if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            if (Array.isArray(parsed)) bannerData = parsed;
          }
        } catch (e) {
          console.error('Lỗi đọc localStorage:', e);
        }
      }

      if (!isMounted) return;

      // 3. Phân loại và gán dữ liệu vào State
      if (bannerData.length > 0) {
        // Banner lớn (Hero)
        const heroList = bannerData.filter((b: any) => b.group === 'hero_banners');
        if (heroList.length > 0) {
          setBanners(
            heroList.map((b: any) => ({
              id: b.id,
              title: b.name || b.title,
              imageUrl: sanitizeUrl(b.imageUrl),
              link: b.link || '/',
            }))
          );
        }

        // Cặp Banner nhỏ đè dưới
        const promos = bannerData.filter((b: any) => b.group === 'promo_cards');
        if (promos.length > 0) {
          setPromoList(
            promos.map((b: any) => ({
              id: b.id,
              imageUrl: sanitizeUrl(b.imageUrl),
              link: b.link || '/',
            }))
          );
          return;
        }
      }

      // 4. DỰ PHÒNG CUỐI: Dữ liệu mặc định từ file tĩnh nếu DB trống
      if (PROMO_PAIRS && PROMO_PAIRS.length > 0) {
        setPromoList(PROMO_PAIRS.flat());
      }
    };

    fetchAllBanners();

    return () => {
      isMounted = false;
    };
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
      {/* 1. BANNER LỚN */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-900 flex items-center justify-center">
        {currentTop && (
          <Link href={currentTop.link || '/'} className="block w-full h-full">
            <img
              src={sanitizeUrl(currentTop.imageUrl)}
              alt={currentTop.title || 'Banner'}
              className="w-full h-full object-cover object-center transition-all duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80';
              }}
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

      {/* 2. CẶP BANNER CON ĐÈ DƯỚI */}
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
                    src={sanitizeUrl(promo.imageUrl)}
                    alt="Promo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80';
                    }}
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