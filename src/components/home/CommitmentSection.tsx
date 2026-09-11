'use client';

import React, { useState, useEffect } from 'react';
import { COMMITMENT_BANNERS } from '@/data/homeExtras';

export const CommitmentSection: React.FC = () => {
  const [banners, setBanners] = useState(COMMITMENT_BANNERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        const filtered = parsed.filter((it: any) => it.group === 'commit_cards');
        if (filtered.length > 0) {
          const mapped = filtered.map((it: any, index: number) => {
            const fallback = COMMITMENT_BANNERS[index] || {};
            return {
              id: it.id || fallback.id || index,
              imageUrl: it.imageUrl || fallback.imageUrl,
              mainBadge: it.subtitle || fallback.mainBadge || it.name || '',
            };
          });
          setBanners(mapped);
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc banners config:', e);
    }
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            /* Tăng chiều cao khung ảnh lên to hơn rõ rệt: h-[300px] sm:h-[360px] md:h-[420px] */
            className="relative h-[300px] sm:h-[360px] md:h-[420px] rounded-md overflow-hidden shadow-md group border border-gray-200 bg-gray-50"
          >
            {/* Ảnh hiển thị tràn khung, full kích thước và phóng to mượt khi hover */}
            <img
              src={banner.imageUrl}
              alt={banner.mainBadge || 'Banner'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};