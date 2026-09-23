'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  User, 
  Tag, 
  FileText 
} from 'lucide-react';

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
      return '23/09/2026';
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

  // Tự động tìm ảnh đại diện: nếu thumbnail rỗng thì trích xuất thẻ <img> đầu tiên trong nội dung
  const featuredImageUrl = useMemo(() => {
    if (post?.thumbnail) return getSafeImageUrl(post.thumbnail);
    if (post?.content) {
      const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        return getSafeImageUrl(match[1]);
      }
    }
    return null;
  }, [post]);

  // Bóc tách Heading 2 và Heading 3 để tạo Mục Lục
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

  // Đánh id tự động vào các heading để cuộn mượt khi click
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

  // Chỉ lấy đúng 4 bài mới nhất cho Widget
  const recentPosts = useMemo(() => allPosts.slice(0, 4), [allPosts]);
  const relatedPosts = useMemo(() => allPosts.filter((p) => p.slug !== slug).slice(0, 4), [allPosts, slug]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <div>
        {/* HEADER VÀ NAVBAR CỐ ĐỊNH CHUẨN TRANG IPHONE */}
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* BREADCRUMB FULL-WIDTH NỀN XÁM NHẠT CHUẨN TRANG IPHONE */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-gray-600 flex-wrap leading-relaxed">
            <Link href="/" className="hover:text-[#d70018] transition-colors shrink-0">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-[#d70018] transition-colors shrink-0">
              Tin tức
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold break-words">
              {post?.title || 'Đang tải bài viết...'}
            </span>
          </div>
        </div>

        {/* KHUNG NỘI DUNG CHÍNH (max-w-7xl mx-auto px-4 py-6) */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d70018] mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Đang tải nội dung bài viết...</p>
            </div>
          ) : !post ? (
            <div className="py-20 text-center bg-gray-50 rounded-xl border border-gray-200 p-8">
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
              <div className="lg:col-span-8 bg-white p-4 sm:p-7 rounded-2xl border border-gray-200/90 shadow-xs space-y-6">
                
                {/* 1. TIÊU ĐỀ & NGÀY ĐĂNG */}
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-[13px] text-gray-400">
                    <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <User size={14} className="text-[#d70018]" />
                      <span>bởi</span>
                      <strong className="text-gray-800">Fogo Store Team</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{formatDate(post.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* 2. ẢNH ĐẠI DIỆN (AVATAR/THUMBNAIL) NẰM NGAY DƯỚI TIÊU ĐỀ */}
                {featuredImageUrl && (
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-2xs">
                    <img
                      src={featuredImageUrl}
                      alt={post.title}
                      className="w-full max-h-[500px] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x450?text=Fogo+Store';
                      }}
                    />
                  </div>
                )}

                {/* 3. BẢNG MỤC LỤC CÁC NỘI DUNG CHÍNH */}
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
                      <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-gray-700">
                        {tocItems.map((item) => (
                          <li
                            key={item.id}
                            onClick={() => scrollToHeading(item.id)}
                            className={`flex items-start gap-2 hover:text-[#d70018] transition-colors cursor-pointer ${
                              item.level === 'h3' ? 'ml-4 text-gray-600' : 'font-semibold text-gray-800'
                            }`}
                          >
                            <span className="text-[#d70018] font-bold shrink-0">•</span>
                            <span className="leading-snug">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 4. NỘI DUNG BÀI VIẾT */}
                <div
                  className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4 pt-2 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:scroll-mt-28 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-gray-800 [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:scroll-mt-28 [&>p]:text-sm sm:[&>p]:text-base [&>p]:leading-relaxed [&>p]:text-gray-700 [&>img]:rounded-xl [&>img]:mx-auto [&>img]:my-5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-sm [&>ul]:space-y-1.5"
                  dangerouslySetInnerHTML={{ __html: processedContent || `<p>${post.summary || ''}</p>` }}
                />

                {/* 5. TAGS */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
                  <span className="font-bold flex items-center gap-1 text-gray-800">
                    <Tag size={14} className="text-[#d70018]" /> Tags:
                  </span>
                  <span className="hover:text-[#d70018] cursor-pointer">#iPhone</span>,
                  <span className="hover:text-[#d70018] cursor-pointer">#iPad</span>,
                  <span className="hover:text-[#d70018] cursor-pointer">#Apple</span>,
                  <span className="hover:text-[#d70018] cursor-pointer">#TinCôngNghệ</span>
                </div>

                {/* 6. BÀI VIẾT LIÊN QUAN */}
                {relatedPosts.length > 0 && (
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Bài viết liên quan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {relatedPosts.map((rel) => (
                        <Link key={rel.id} href={`/tin-tuc/${rel.slug}`} className="group block space-y-2">
                          <div className="aspect-16/10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              src={getSafeImageUrl(rel.thumbnail)}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#d70018] line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                          <p className="text-[11px] text-gray-400">{formatDate(rel.createdAt)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: STICKY SIDEBAR (4 CỘT) */}
              <div className="lg:col-span-4 space-y-6 sticky top-24">
                {/* WIDGET 1: BÀI VIẾT MỚI NHẤT (CHỈ 4 BÀI + XEM THÊM KẾ BÊN) */}
                <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                      Bài viết mới nhất
                    </h3>
                    <Link
                      href="/tin-tuc"
                      className="text-xs font-bold text-[#d70018] hover:underline transition-colors flex items-center gap-0.5"
                    >
                      <span>Xem thêm</span>
                      <ChevronRight size={14} />
                    </Link>
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

                {/* WIDGET 2: DANH MỤC PAGE */}
                <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h3 className="text-[17px] font-black text-gray-900 tracking-tight">
                      Danh mục page
                    </h3>
                    <span className="text-gray-400 text-sm">▼</span>
                  </div>

                  <ul className="divide-y divide-gray-100 text-[16px] font-medium text-gray-700">
                    <li>
                      <Link href="/" className="px-5 py-3.5 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                        <span>Trang chủ</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/" className="px-5 py-3.5 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                        <span>Sản phẩm</span>
                        <span className="text-gray-400 text-base font-normal">+</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/tin-tuc" className="px-5 py-3.5 flex items-center justify-between text-[#d70018] font-bold bg-red-50/30">
                        <span>Tin tức</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/gioi-thieu" className="px-5 py-3.5 flex items-center justify-between hover:text-[#d70018] hover:bg-gray-50/60 transition-colors">
                        <span>Giới thiệu</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}