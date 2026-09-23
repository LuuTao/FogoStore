import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

async function getPostDetail(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/posts`, { next: { revalidate: 60 } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.find((p: any) => p.slug === slug) || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostDetail(slug);

  if (!post) {
    notFound();
  }

  const getSafeImg = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      <Link
        href="/tin-tuc"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#d70018] transition-colors"
      >
        <ArrowLeft size={15} />
        <span>Quay lại trang tin tức</span>
      </Link>

      <div className="space-y-3 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <Calendar size={14} className="text-[#d70018]" />
          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.summary && (
          <p className="text-base text-gray-600 italic font-medium leading-relaxed">
            {post.summary}
          </p>
        )}
      </div>

      {post.thumbnail && (
        <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <img src={getSafeImg(post.thumbnail)} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Render HTML nội dung chi tiết bài viết */}
      <div 
        className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: post.content || '<p>Nội dung đang được cập nhật...</p>' }}
      />
    </article>
  );
}