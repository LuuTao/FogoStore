'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  User, 
  Tag, 
  ChevronDown, 
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Menu as MenuIcon
} from 'lucide-react';

// Import trực tiếp 3 component gốc của hệ thống Fogo Store
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  createdAt: string;
}

interface TocItem {
  id: string;
  level: 'h2' | 'h3';
  text: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToc, setShowToc] = useState(true);

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return 'https://placehold.co/800x450?text=Fogo+Store';
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
      return '22/09/2026';
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/posts`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAllPosts(json.data);
          const current = json.data.find((p: Post) => p.slug === slug);
          setPost(current || null);
        }
      } catch (error) {
        console.error('Lỗi nạp bài viết:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPostData();
    }
  }, [slug]);

  // Bóc tách danh sách Heading 2 và Heading 3 tạo Mục Lục
  const tocItems = useMemo<TocItem[]>(() => {
    if (!post?.content) return [];
    const regex = /<(h[23])[^>]*>(.*?)<\/\1>/gi;
    const items: TocItem[] = [];
    let match;
    let index = 0;

    while ((match = regex.exec(post.content)) !== null) {
      const level = match[1].toLowerCase() as 'h2' | 'h3';
      const plainText = match[2].replace(/<[^>]+>/g, '').trim();
      if (plainText) {
        items.push({
          id: `heading-${index}`,
          level,
          text: plainText,
        });
        index++;
      }
    }
    return items;
  }, [post]);

  // Tự động chèn ID vào các thẻ heading để scroll khi bấm mục lục
  const processedContent = useMemo(() => {
    if (!post?.content) return '';
    let index = 0;
    return post.content.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
      const headingId = `heading-${index}`;
      index++;
      return `<${tag}${attrs} id="${headingId}">${text}</${tag}>`;
    });
  }, [post]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const recentPosts = useMemo(() => allPosts.slice(0, 5), [allPosts]);
  const relatedPosts = useMemo(() => allPosts.filter((p) => p.slug !== slug).slice(0, 3), [allPosts, slug]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-800 flex flex-col font-sans">
      {/* 1. HEADER CHÍNH GỐC CỦA BẠN */}
      <Header />

      {/* 2. THANH NAVBAR ĐỎ CỦA BẠN (ĐẦY ĐỦ DROPDOWN ĐA CẤP HOVER) */}
      <Navbar />

      {/* 3. THANH CAM KẾT (DƯỚI NAVBAR) */}
      <div className="bg-white border-b border-gray-200 py-2 text-[11px] text-gray-600 hidden sm:block shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-gray-800">
            <MenuIcon size={14} className="text-[#d70018]" />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
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

      {/* 4. NỘI DUNG CHÍNH (LAYOUT 2 CỘT: 8 CỘT BÀI VIẾT - 4 CỘT WIDGET) */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4 overflow-hidden truncate">
          <Link href="/" className="hover:text-[#d70018] transition-colors shrink-0">
            Trang chủ
          </Link>
          <ChevronRight size={12} className="shrink-0 text-gray-400" />
          <Link href="/tin-tuc" className="hover:text-[#d70018] transition-colors shrink-0">
            Tin tức
          </Link>
          <ChevronRight size={12} className="shrink-0 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate">{post?.title || 'Đang tải bài viết...'}</span>
        </nav>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d70018] mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Đang tải nội dung bài viết...</p>
          </div>
        ) : !post ? (
          <div className="py-20 text-center bg-white rounded-xl border border-gray-200 p-8">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-bold text-gray-800">Không tìm thấy bài viết này</h2>
            <p className="text-xs text-gray-500 mt-1 mb-4">Bài viết có thể đã bị xóa hoặc đổi đường dẫn.</p>
            <Link href="/tin-tuc" className="px-4 py-2 bg-[#d70018] text-white rounded-lg text-xs font-bold hover:bg-red-700">
              Quay lại trang tin tức
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT NỘI DUNG BÀI VIẾT (8 CỘT) */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-8 rounded-xl border border-gray-200/80 shadow-xs space-y-6">
              
              {/* Tiêu đề & Tác giả */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <User size={13} className="text-[#d70018]" />
                    <span>bởi</span>
                    <strong className="text-gray-800">Fogo Store Team</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-gray-400" />
                    <span>{formatDate(post.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Bảng mục lục tự động */}
              {tocItems.length > 0 && (
                <div className="bg-[#fdfefe] border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                    <span className="text-sm font-bold text-gray-900">Các nội dung chính</span>
                    <button
                      type="button"
                      onClick={() => setShowToc(!showToc)}
                      className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer transition-colors"
                    >
                      [{showToc ? 'Ẩn' : 'Hiện'}]
                    </button>
                  </div>
                  {showToc && (
                    <ul className="space-y-2 text-xs font-medium text-gray-700">
                      {tocItems.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => scrollToHeading(item.id)}
                          className={`flex items-start gap-2 hover:text-[#d70018] transition-colors cursor-pointer ${
                            item.level === 'h3' ? 'ml-4 text-gray-600' : 'font-semibold text-gray-800'
                          }`}
                        >
                          <span className="text-[#d70018] font-bold">•</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Nội dung chi tiết bài viết */}
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4 pt-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:scroll-mt-32 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-800 [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:scroll-mt-32 [&>p]:text-xs [&>p]:sm:text-sm [&>p]:leading-relaxed [&>p]:text-gray-700 [&>img]:rounded-xl [&>img]:mx-auto [&>img]:my-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-xs [&>ul]:space-y-1"
                dangerouslySetInnerHTML={{ __html: processedContent || `<p>${post.summary || ''}</p>` }}
              />

              {/* Tags */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
                <span className="font-bold flex items-center gap-1 text-gray-800">
                  <Tag size={13} className="text-[#d70018]" /> Tags:
                </span>
                <span className="hover:text-[#d70018] cursor-pointer">#iPhone</span>,
                <span className="hover:text-[#d70018] cursor-pointer">#iPad</span>,
                <span className="hover:text-[#d70018] cursor-pointer">#Apple</span>,
                <span className="hover:text-[#d70018] cursor-pointer">#TinCôngNghệ</span>
              </div>

              {/* Bài viết liên quan */}
              {relatedPosts.length > 0 && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Bài viết liên quan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPosts.map((rel) => (
                      <Link key={rel.id} href={`/tin-tuc/${rel.slug}`} className="group block space-y-2">
                        <div className="aspect-16/10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={getSafeImageUrl(rel.thumbnail)}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                        <p className="text-[10px] text-gray-400">{formatDate(rel.createdAt)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CỘT SIDEBAR BÊN PHẢI (4 CỘT) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* WIDGET DUY NHẤT: BÀI VIẾT MỚI NHẤT */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Bài viết mới nhất</h3>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>

                <div className="space-y-3.5">
                  {recentPosts.map((rp, index) => (
                    <Link key={rp.id} href={`/tin-tuc/${rp.slug}`} className="flex gap-3 group items-center">
                      <div className="relative shrink-0">
                        <div className="w-20 h-14 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={getSafeImageUrl(rp.thumbnail)}
                            alt={rp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#d70018] text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] line-clamp-2 leading-snug">
                          {rp.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Tin tức • {formatDate(rp.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* 5. FOOTER CHÍNH GỐC CỦA BẠN (CÓ LOGO BỘ CÔNG THƯƠNG, ZALO, MESSENGER) */}
      <Footer />
    </div>
  );
}