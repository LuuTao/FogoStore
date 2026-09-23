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
  ArrowRight,
  Sparkles
} from 'lucide-react';

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

  // 1. Tự động bóc tách danh sách Heading 2 và Heading 3 (Hỗ trợ từ file Word/HTML)
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

  // 2. Chèn thuộc tính id vào các thẻ h2/h3 trong content để cuộn mượt khi bấm mục lục
  const processedContent = useMemo(() => {
    if (!post?.content) return '';
    let index = 0;
    return post.content.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
      const headingId = `heading-${index}`;
      index++;
      return `<${tag}${attrs} id="${headingId}">${text}</${tag}>`;
    });
  }, [post]);

  // Cuộn trang mượt mà đến vị trí tiêu đề khi bấm vào mục lục
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 4 bài viết mới nhất cho Sidebar bên phải
  const recentPosts = useMemo(() => {
    return allPosts.slice(0, 4);
  }, [allPosts]);

  // Bài viết liên quan ở chân trang
  const relatedPosts = useMemo(() => {
    return allPosts.filter((p) => p.slug !== slug).slice(0, 3);
  }, [allPosts, slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d70018] mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-medium">Đang tải nội dung bài viết...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center select-none">
        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy bài viết này</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link
          href="/tin-tuc"
          className="px-5 py-2.5 bg-[#d70018] text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
        >
          Quay lại trang tin tức
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 select-none text-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* 1. THANH ĐIỀU HƯỚNG BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4 overflow-hidden truncate">
          <Link href="/" className="hover:text-[#d70018] transition-colors shrink-0">
            Trang chủ
          </Link>
          <ChevronRight size={12} className="shrink-0 text-gray-400" />
          <Link href="/tin-tuc" className="hover:text-[#d70018] transition-colors shrink-0">
            Tin tức
          </Link>
          <ChevronRight size={12} className="shrink-0 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate">{post.title}</span>
        </nav>

        {/* 2. BỐ CỤC CHÍNH (GRID 12 CỘT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT NỘI DUNG CHÍNH (8 CỘT) */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-8 rounded-xl border border-gray-200/70 shadow-xs space-y-6">
            
            {/* TIÊU ĐỀ & META */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
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

            {/* ẢNH ĐẠI DIỆN LỚN */}
            {post.thumbnail && (
              <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img
                  src={getSafeImageUrl(post.thumbnail)}
                  alt={post.title}
                  className="w-full max-h-[460px] object-cover"
                />
              </div>
            )}

            {/* MỤC LỤC TỰ ĐỘNG (TABLE OF CONTENTS) */}
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

            {/* NỘI DUNG BÀI VIẾT (HTML) */}
            <div
              className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4 pt-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:scroll-mt-20 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-800 [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:scroll-mt-20 [&>p]:text-xs [&>p]:sm:text-sm [&>p]:leading-relaxed [&>p]:text-gray-700 [&>img]:rounded-xl [&>img]:mx-auto [&>img]:my-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-xs [&>ul]:space-y-1"
              dangerouslySetInnerHTML={{ __html: processedContent || `<p>${post.summary || ''}</p>` }}
            />

            {/* BANNER ƯU ĐÃI NỔI BẬT */}
            <div className="bg-gradient-to-r from-red-600 to-[#d70018] text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <p className="font-extrabold text-sm sm:text-base">MUA SẢN PHẨM APPLE TẠI FOGO STORE CỰC ƯU ĐÃI</p>
                <p className="text-[11px] text-red-100">Bảo hành 12 tháng 1 đổi 1 • Trả góp 0% duyệt nhanh</p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 bg-white text-[#d70018] rounded-lg font-bold text-xs hover:bg-gray-100 shrink-0 shadow-xs transition-colors"
              >
                Khám phá ngay
              </Link>
            </div>

            {/* TAGS */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <span className="font-bold flex items-center gap-1 text-gray-800">
                <Tag size={13} className="text-[#d70018]" />
                Tags:
              </span>
              <span className="hover:text-[#d70018] cursor-pointer">#iPhone</span>,
              <span className="hover:text-[#d70018] cursor-pointer">#iPad</span>,
              <span className="hover:text-[#d70018] cursor-pointer">#Apple</span>,
              <span className="hover:text-[#d70018] cursor-pointer">#TinCôngNghệ</span>
            </div>

            {/* BÀI VIẾT LIÊN QUAN */}
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
            
            {/* WIDGET 1: BÀI VIẾT MỚI NHẤT KÈM THỨ TỰ (1, 2, 3, 4) */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Bài viết mới nhất</h3>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              <div className="space-y-3.5">
                {recentPosts.map((rp, index) => (
                  <Link key={rp.id} href={`/tin-tuc/${rp.slug}`} className="flex gap-3 group items-center">
                    {/* Số thứ tự tròn đỏ */}
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

                    {/* Tiêu đề & ngày */}
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

            {/* WIDGET 2: DANH MỤC BÀI VIẾT ACCORDION */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Danh mục bài viết</h3>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              <ul className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                <li>
                  <Link href="/" className="py-2.5 flex items-center justify-between hover:text-[#d70018] transition-colors">
                    <span>Trang chủ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/san-pham" className="py-2.5 flex items-center justify-between hover:text-[#d70018] transition-colors">
                    <span>Sản phẩm</span>
                    <span className="text-gray-400">+</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tin-tuc" className="py-2.5 flex items-center justify-between text-[#d70018] font-bold">
                    <span>Blog Tin tức</span>
                  </Link>
                </li>
                <li>
                  <Link href="/gioi-thieu" className="py-2.5 flex items-center justify-between hover:text-[#d70018] transition-colors">
                    <span>Giới thiệu</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}