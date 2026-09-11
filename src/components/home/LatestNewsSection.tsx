'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MAIN_FEATURED_POST, SIDE_POSTS } from '@/data/homeExtras';

export const LatestNewsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-14 select-none">
      {/* Tiêu đề & Nút Xem thêm */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
          Bài Viết Mới Nhất
        </h2>
        <Link
          href="/tin-tuc"
          className="text-xs md:text-sm text-blue-600 hover:text-[#d70018] font-semibold flex items-center gap-0.5 transition-colors"
        >
          <span>Xem thêm</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* Bố cục: Bên trái 1 bài lớn, Bên phải danh sách 4 bài nhỏ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: BÀI VIẾT NỔI BẬT LỚN (7 CỘT) */}
        <div className="lg:col-span-7 group">
          <Link href={MAIN_FEATURED_POST.href} className="block">
            <div className="w-full h-[260px] sm:h-[340px] md:h-[400px] rounded-md overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm">
              <img
                src={MAIN_FEATURED_POST.imageUrl}
                alt={MAIN_FEATURED_POST.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="mt-3.5 text-base md:text-lg font-bold text-gray-900 group-hover:text-[#d70018] transition-colors leading-snug">
              {MAIN_FEATURED_POST.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">{MAIN_FEATURED_POST.date}</p>
          </Link>
        </div>

        {/* CỘT PHẢI: 4 BÀI VIẾT NGANG NHỎ (5 CỘT) */}
        <div className="lg:col-span-5 flex flex-col gap-4 divide-y divide-gray-100">
          {SIDE_POSTS.map((post, idx) => (
            <div key={post.id} className={idx !== 0 ? 'pt-4' : ''}>
              <Link href={post.href} className="flex gap-4 group items-center">
                <div className="w-28 h-20 sm:w-32 sm:h-20 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200/80">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#d70018] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 mt-1.5 block">{post.date}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};