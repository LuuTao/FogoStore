'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// 4 Banner cam kết mặc định trỏ thẳng vào public/commitments (Load ngay 0ms không phụ thuộc API)
const DEFAULT_COMMITMENT_BANNERS = [
  {
    id: 'commit-default-1',
    imageUrl: '/banner-bao-hanh/banner-bao-hanh1.webp',
    title: 'Cam kết máy chính hãng 100%',
    link: '/',
  },
  {
    id: 'commit-default-2',
    imageUrl: '/banner-bao-hanh/banner-bao-hanh2.webp',
    title: 'Cam kết máy chính hãng 100%',
    link: '/',
  },
  {
    id: 'commit-default-3',
    imageUrl: '/banner-bao-hanh/banner-bao-hanh3.webp',
    title: 'Cam kết máy chính hãng 100%',
    link: '/',
  },
  {
    id: 'commit-default-4',
    imageUrl: '/banner-bao-hanh/banner-bao-hanh4.webp',
    title: 'Cam kết máy chính hãng 100%',
    link: '/',
  },
];

const getFullImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    if (url.includes('localhost:')) {
      return url.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    }
    return url;
  }
  return `${API_URL}/${url}`;
};

export const CommitmentSection: React.FC = () => {
  const [banners, setBanners] = useState(DEFAULT_COMMITMENT_BANNERS);

  useEffect(() => {
    let isMounted = true;

    const fetchCommitBanners = async () => {
      try {
        // 1. Kiểm tra cache cấu hình nhanh từ localStorage trước
        const raw = localStorage.getItem('fogo_banners_config');
        if (raw) {
          const parsed = JSON.parse(raw);
          const filteredLocal = parsed.filter(
            (it: any) => it.group === 'commit_cards' || it.position === 'commit_cards' || it.position === 'COMMITMENT'
          );
          if (filteredLocal.length > 0 && isMounted) {
            setBanners(
              filteredLocal.map((it: any, idx: number) => ({
                id: it.id || `local-${idx}`,
                imageUrl: getFullImageUrl(it.imageUrl) || DEFAULT_COMMITMENT_BANNERS[idx]?.imageUrl,
                title: it.title || it.name || DEFAULT_COMMITMENT_BANNERS[idx]?.title,
                link: it.linkUrl || it.link || DEFAULT_COMMITMENT_BANNERS[idx]?.link,
              }))
            );
          }
        }

        // 2. Đồng bộ ngầm với Backend API
        const res = await fetch(`${API_URL}/api/banners?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const apiCommits = json.data.filter(
              (it: any) => it.group === 'commit_cards' || it.position === 'commit_cards' || it.position === 'COMMITMENT'
            );

            if (apiCommits.length > 0 && isMounted) {
              setBanners(
                apiCommits.map((it: any, idx: number) => ({
                  id: it.id || `api-${idx}`,
                  imageUrl: getFullImageUrl(it.imageUrl) || DEFAULT_COMMITMENT_BANNERS[idx]?.imageUrl,
                  title: it.title || it.name || DEFAULT_COMMITMENT_BANNERS[idx]?.title,
                  link: it.linkUrl || it.link || DEFAULT_COMMITMENT_BANNERS[idx]?.link,
                }))
              );
            }
          }
        }
      } catch (e) {
        // Khi lỗi mạng hoặc backend sleep, hệ thống vẫn dùng mảng mặc định mượt mà
      }
    };

    fetchCommitBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 sm:mt-12 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {banners.map((banner, index) => {
          const content = (
            <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] rounded-xl overflow-hidden shadow-sm group border border-gray-100 bg-gray-50 transition-all duration-300 hover:shadow-md">
              <img
                src={banner.imageUrl}
                alt={banner.title || `Cam kết ${index + 1}`}
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              />
            </div>
          );

          if (banner.link && banner.link !== '#') {
            return (
              <Link key={banner.id || index} href={banner.link} className="block cursor-pointer">
                {content}
              </Link>
            );
          }

          return <div key={banner.id || index}>{content}</div>;
        })}
      </div>
    </section>
  );
};

export default CommitmentSection;