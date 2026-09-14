'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PostsTab from '@/components/admin/PostsTab';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function BaiVietPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/posts`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(json.data);
      } else if (Array.isArray(json)) {
        setPosts(json);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách bài viết:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center p-20 text-xs font-bold text-gray-500">
        <Loader2 size={24} className="animate-spin text-[#d70018] mr-2" />
        Đang tải dữ liệu bài viết từ hệ thống...
      </div>
    );
  }

  return <PostsTab posts={posts} onRefresh={fetchPosts} />;
}