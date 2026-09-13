'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  banners: any[];
  promoList: any[];
}

export const HeroDesktop: React.FC<Props> = ({ banners, promoList }) => {
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timerTop = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timerTop);
  }, [isHovered, banners.length]);

  const promoPairs: any[][] = [];
  for (let i = 0; i < promoList.length; i += 2) {
    promoPairs.push(promoList.slice(i, i + 2));
  }

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
    <div
      className="w-full select-none relative pb-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner màn lớn */}
      <div className="relative w-full h-[480px] lg:h-[540px] overflow-hidden bg-gray-900 flex items-center justify-center">
        {currentTop && (
          <Link href={currentTop.link || '/'} className="block w-full h-full">
            <img
              src={currentTop.imageUrl}
              alt={currentTop.title}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
          </Link>
        )}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setTopIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setTopIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* 2 Banner phụ đè mép âm (-mt) */}
      {currentPair.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 relative z-30 -mt-16 md:-mt-20">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {currentPair.map((promo: any, idx: number) => (
                <Link
                  key={promo.id || idx}
                  href={promo.link || '/'}
                  className="block relative w-full h-[180px] lg:h-[200px] rounded-xl overflow-hidden shadow-xl border border-gray-200 group bg-white"
                >
                  <img
                    src={promo.imageUrl}
                    alt="Promo Desktop"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              ))}
            </div>

            {promoPairs.length > 1 && (
              <>
                <button
                  onClick={() => setBottomIndex((prev) => (prev - 1 + promoPairs.length) % promoPairs.length)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 hover:bg-red-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setBottomIndex((prev) => (prev + 1) % promoPairs.length)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d70018] text-white flex items-center justify-center shadow-lg z-40 hover:bg-red-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};