'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Menu as MenuIcon,
  ShieldCheck,
  RotateCcw,
  Truck
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail: string | null;
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function NewsListingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return 'https://placehold.co/600x400?text=Fogo+Store';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Mới cập nhật';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '23/09/2026';
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/posts`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPosts(json.data);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Lỗi nạp bài viết:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 4 bài viết mới nhất cho Sidebar
  const recentPosts = useMemo(() => posts.slice(0, 4), [posts]);

  // Phân trang danh sách bài viết
  const totalPages = Math.ceil(posts.length / postsPerPage) || 1;
  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return posts.slice(start, start + postsPerPage);
  }, [posts, currentPage]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-800 flex flex-col font-sans select-none">
      {/* 1. HEADER CHÍNH GỐC */}
      <Header />

      {/* 2. NAVBAR ĐỎ GỐC CÓ DROPDOWN HOVER */}
      <Navbar />

      {/* 3. SUB-HEADER CAM KẾT CHUẨN GIAO DIỆN FOGO */}
      <div className="bg-white border-b border-gray-200 py-2.5 text-[11px] text-gray-600 hidden sm:block shadow-2xs">
        <div className="max-w-[1380px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-800 uppercase tracking-tight">
            <MenuIcon size={15} className="text-[#d70018]" />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>
          <div className="flex items-center gap-7 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Đảm bảo chất lượng
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw size={14} className="text-blue-600" /> Thu cũ đổi mới
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-amber-600" /> Miễn phí vận chuyển
            </span>
          </div>
        </div>
      </div>

      {/* 4. KHUNG NỘI DUNG CHÍNH (BỐ CỤC 2 CỘT 8 - 4) */}
      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        {/* Breadcrumb to hơn 2px */}
        <nav className="flex items-center gap-1.5 text-[13px] sm:text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#d70018] transition-colors shrink-0">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="shrink-0 text-gray-400" />
          <span className="text-gray-900 font-semibold">Tin tức</span>
        </nav>

        {/* Tiêu đề mục */}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-5">
          Tin tức
        </h1>

        {/* Lưới 2 cột chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT (8 CỘT - LƯỚI 2 BÀI/HÀNG) */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="py-24 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d70018] mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Đang tải danh sách bài viết...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-700">Chưa có bài viết nào được xuất bản</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Lưới bài viết 2 cột */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {currentPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-lg border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                      {/* Ảnh bài viết */}
                      <Link href={`/tin-tuc/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-gray-100 relative">
                        <img
                          src={getSafeImageUrl(post.thumbnail)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Fogo+Store';
                          }}
                        />
                      </Link>

                      {/* Thông tin bài viết */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1.5">
                          <h2 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#d70018] transition-colors line-clamp-2 leading-snug">
                            <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
                          </h2>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {post.summary || 'Thông tin đánh giá chi tiết sản phẩm công nghệ Apple tại Fogo Store...'}
                          </p>
                        </div>

                        {/* Tác giả & Ngày đăng */}
                        <div className="pt-2 text-[11px] text-gray-400">
                          <span>bởi Fogo Team</span>
                          <span className="mx-1.5">•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-4">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#d70018] text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: STICKY SIDEBAR (LƯỚT TRANG ĐI THEO) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* WIDGET 1: BÀI VIẾT MỚI NHẤT (TO HƠN 2PX) */}
            <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                  Bài viết mới nhất
                </h3>
                <ChevronDown size={17} className="text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentPosts.map((rp, index) => (
                  <Link key={rp.id} href={`/tin-tuc/${rp.slug}`} className="flex gap-3 group items-center">
                    <div className="relative shrink-0">
                      <div className="w-22 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={getSafeImageUrl(rp.thumbnail)}
                          alt={rp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 rounded-full bg-[#d70018] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#d70018] line-clamp-2 leading-snug transition-colors">
                        {rp.title}
                      </h4>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        Tin tức • {formatDate(rp.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* WIDGET 2: DANH MỤC BÀI VIẾT */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                <h3 className="text-sm font-black text-gray-900 tracking-tight">
                  Danh mục bài viết
                </h3>
                <span className="text-gray-400 text-xs">▼</span>
              </div>

              <ul className="divide-y divide-gray-100 text-[13px] font-medium text-gray-700">
                <li>
                  <Link href="/" className="px-4 py-3 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                    <span>Trang chủ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/san-pham" className="px-4 py-3 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                    <span>Sản phẩm</span>
                    <span className="text-gray-400 text-sm font-normal">+</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tin-tuc" className="px-4 py-3 flex items-center justify-between text-[#d70018] font-bold bg-red-50/30">
                    <span>Blog</span>
                  </Link>
                </li>
                <li>
                  <Link href="/gioi-thieu" className="px-4 py-3 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                    <span>Giới thiệu</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* 5. FOOTER CHÍNH GỐC */}
      <Footer />
    </div>
  );
}