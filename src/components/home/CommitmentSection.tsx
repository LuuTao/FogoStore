'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export const CommitmentSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 sm:mt-12 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {DEFAULT_COMMITMENT_BANNERS.map((banner, index) => {
          const content = (
            <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] rounded-xl overflow-hidden shadow-sm group border border-gray-100 bg-gray-50 transition-all duration-300 hover:shadow-md">
              <Image
                src={banner.imageUrl}
                alt={banner.title || `Cam kết ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={index < 2}
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
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
