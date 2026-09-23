'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export const LatestNewsSection: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return 'https://placehold.co/600x400?text=Fogo+Store';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Mới cập nhật';
    }
  };

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/posts`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPosts(json.data.slice(0, 5));
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Lỗi tải bài viết mới nhất:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  // Trạng thái Loading Skeleton
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-14 select-none">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div className="w-full h-[260px] sm:h-[340px] md:h-[400px] rounded-md bg-gray-200 animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-200 rounded-md mt-3.5 animate-pulse" />
            <div className="h-3 w-28 bg-gray-200 rounded-md mt-2 animate-pulse" />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-28 h-20 sm:w-32 sm:h-20 bg-gray-200 rounded-md animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Nếu cơ sở dữ liệu chưa có bài viết
  if (!posts || posts.length === 0) {
    return null;
  }

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 5);

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

      {/* Bố cục: Bên trái 1 bài lớn (7 cột), Bên phải danh sách 4 bài nhỏ (5 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: BÀI VIẾT NỔI BẬT LỚN NHẤT */}
        {mainPost && (
          <div className="lg:col-span-7 group">
            <Link href={`/tin-tuc/${mainPost.slug}`} className="block">
              <div className="w-full h-[260px] sm:h-[340px] md:h-[400px] rounded-md overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm relative">
                <img
                  src={getSafeImageUrl(mainPost.thumbnail)}
                  alt={mainPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Fogo+Store';
                  }}
                />
              </div>
              <h3 className="mt-3.5 text-base md:text-lg font-bold text-gray-900 group-hover:text-[#d70018] transition-colors leading-snug line-clamp-2">
                {mainPost.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{formatDate(mainPost.createdAt)}</p>
            </Link>
          </div>
        )}

        {/* CỘT PHẢI: CÁC BÀI VIẾT PHỤ */}
        <div className="lg:col-span-5 flex flex-col gap-4 divide-y divide-gray-100">
          {sidePosts.map((post, idx) => (
            <div key={post.id} className={idx !== 0 ? 'pt-4' : ''}>
              <Link href={`/tin-tuc/${post.slug}`} className="flex gap-4 group items-center">
                <div className="w-28 h-20 sm:w-32 sm:h-20 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200/80 relative">
                  <img
                    src={getSafeImageUrl(post.thumbnail)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Fogo';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#d70018] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 mt-1.5 block">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};