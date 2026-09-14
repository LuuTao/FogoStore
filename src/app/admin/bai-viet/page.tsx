'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PostsTab = dynamic(
  () => import('@/components/admin/PostsTab').then((mod) => mod.default || (mod as any).PostsTab),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-16 text-xs font-bold text-gray-500">
        <Loader2 size={22} className="animate-spin text-[#d70018] mr-2" />
        Đang tải danh sách bài viết...
      </div>
    ),
  }
);

export default function BaiVietPage() {
  return <PostsTab />;
}