'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Props {
  banners: any[];
  promoList: any[];
}

export const HeroMobile: React.FC<Props> = ({ banners, promoList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || banners.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    touchStartX.current = null;
  };

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div 
      className="w-full px-3 pt-2 pb-4 flex flex-col gap-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner chính tỉ lệ 16:9 bo góc tròn */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 shadow-md">
        {currentBanner && (
          <Link href={currentBanner.link || '/'} className="block w-full h-full">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </Link>
        )}

        {/* Chấm tròn báo slide */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {banners.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-4 bg-[#d70018]' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2 Banner phụ dạng lưới 2 cột nhỏ gọn */}
      {promoList.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {promoList.slice(0, 2).map((promo, idx) => (
            <Link
              key={promo.id || idx}
              href={promo.link || '/'}
              className="block relative aspect-[16/8] rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-white"
            >
              <img
                src={promo.imageUrl}
                alt="Khuyến mãi"
                className="w-full h-full object-cover"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};