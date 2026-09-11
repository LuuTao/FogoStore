'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS } from '@/data/banners';

export const HeroSlider: React.FC = () => {
  const [banners, setBanners] = useState<any[]>(HERO_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Lấy dữ liệu banner từ Backend Admin
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/banners');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const homeTop = data.data.filter((b: any) => b.position === 'HOME_TOP');
          const activeList = homeTop.length > 0 ? homeTop : data.data;

          setBanners(
            activeList.map((b: any) => ({
              id: b.id,
              title: b.title,
              imageUrl: b.imageUrl,
              link: b.linkUrl || '/',
            }))
          );
        }
      } catch (err) {
        console.error('Lỗi tải banner động:', err);
      }
    };

    fetchBanners();
  }, []);

  // Tự động chuyển banner sau mỗi 4.5 giây
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovered, banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Khung hiển thị Banner */}
      <div className="w-full relative h-[260px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
        {banners.map((banner, index) => (
          <Link
            key={banner.id || index}
            href={banner.link || banner.linkUrl || '/'}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover object-center"
            />
          </Link>
        ))}
      </div>

      {/* Nút điều hướng trái/phải */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Banner trước"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/90 hover:bg-[#d70018] text-gray-800 hover:text-white shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Banner tiếp"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/90 hover:bg-[#d70018] text-gray-800 hover:text-white shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dấu chấm chỉ số slide */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-[#d70018]' : 'w-2.5 bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};