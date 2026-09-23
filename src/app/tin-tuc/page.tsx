import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, FileText } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

async function getPublishedPosts() {
  try {
    const res = await fetch(`${API_URL}/api/admin/posts`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

export default async function NewsListingPage() {
  const posts = await getPublishedPosts();

  const getSafeImg = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tin Tức Công Nghệ & Thủ Thuật Fogo</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Cập nhật những đánh giá, mẹo sử dụng và tin tức công nghệ mới nhất về Apple và hệ sinh thái Fogo Store.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-base font-semibold">Chưa có bài viết tin tức nào được đăng tải.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/tin-tuc/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="aspect-16/10 bg-gray-100 overflow-hidden relative">
                {post.thumbnail ? (
                  <img
                    src={getSafeImg(post.thumbnail)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FileText size={36} />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#d70018]" />
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <h2 className="text-base font-bold text-gray-900 group-hover:text-[#d70018] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.summary || 'Xem chi tiết bài viết công nghệ và thủ thuật tại Fogo Store...'}
                  </p>
                </div>

                <div className="pt-2 text-xs font-bold text-[#d70018] flex items-center gap-1">
                  <span>Đọc tiếp</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}