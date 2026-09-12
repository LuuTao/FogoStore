'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  positionKey: string; // Ví dụ: 'CATEGORY_IPHONE', 'CATEGORY_IPAD'
}

export const CategoryBanner: React.FC<Props> = ({ positionKey }) => {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategoryBanners = async () => {
      try {
        const res = await fetch('https://fogo-store-api.onrender.com/api/banners');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const matched = data.data.filter((b: any) => b.position === positionKey);
          setBanners(matched);
        }
      } catch (err) {
        console.error('Lỗi tải banner danh mục:', err);
      }
    };
    fetchCategoryBanners();
  }, [positionKey]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow-sm">
      {banners.map((banner) => (
        <a key={banner.id} href={banner.linkUrl || '#'}>
          <img src={banner.imageUrl} alt={banner.title} className="w-full h-[180px] sm:h-[240px] md:h-[300px] object-cover" />
        </a>
      ))}
    </div>
  );
};