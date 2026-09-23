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
  Search,
  PhoneCall,
  ShoppingBag,
  FileCheck,
  RotateCcw,
  Truck,
  Menu,
  ShieldCheck
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

  // Chèn ID tự động vào các heading để click mục lục là cuộn tới
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

  const recentPosts = useMemo(() => allPosts.slice(0, 4), [allPosts]);
  const relatedPosts = useMemo(() => allPosts.filter((p) => p.slug !== slug).slice(0, 3), [allPosts, slug]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-800 flex flex-col font-sans">
      {/* ========================================================
          1. HEADER CHUẨN FOGO STORE
      ======================================================== */}
      {/* Top Banner Đỏ */}
      <div className="bg-[#d70018] text-white py-1.5 px-4 text-center text-xs font-black tracking-wider flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="font-extrabold tracking-tight text-sm uppercase">FOGO STORE</Link>
        <span className="hidden sm:inline font-bold">THE BEST APPLE RETAIL STORE IN HCM</span>
        <a href="tel:0566003333" className="font-extrabold text-sm hover:underline">056.600.3333</a>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d70018] to-amber-500 flex items-center justify-center text-white font-black text-xl italic shadow-xs">
              Fs
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900 hidden sm:inline">
              FOGO <span className="text-[#d70018]">STORE</span>
            </span>
          </Link>

          {/* Search Box */}
          <div className="flex-1 max-w-xl relative">
            <input 
              type="text"
              placeholder="Bạn cần tìm gì hôm nay..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#d70018]"
            />
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d70018]">
              <Search size={16} />
            </button>
          </div>

          {/* Contact & Actions */}
          <div className="hidden lg:flex items-center gap-5 text-xs">
            <a href="tel:0566003333" className="flex items-center gap-2 text-gray-700 hover:text-[#d70018]">
              <PhoneCall size={18} className="text-[#d70018]" />
              <div>
                <p className="text-[10px] text-gray-400">Hotline</p>
                <p className="font-bold">056.600.3333</p>
              </div>
            </a>

            <Link href="/gio-hang" className="flex items-center gap-2 text-gray-700 hover:text-[#d70018]">
              <ShoppingBag size={18} className="text-[#d70018]" />
              <div>
                <p className="text-[10px] text-gray-400">Xem giỏ</p>
                <p className="font-bold">Giỏ hàng (0)</p>
              </div>
            </Link>

            <Link href="/tra-cuu" className="flex items-center gap-2 text-gray-700 hover:text-[#d70018]">
              <FileCheck size={18} className="text-[#d70018]" />
              <div>
                <p className="text-[10px] text-gray-400">Tra cứu</p>
                <p className="font-bold">Đơn hàng</p>
              </div>
            </Link>

            <Link href="/admin/dang-nhap" className="flex items-center gap-2 text-gray-700 hover:text-[#d70018]">
              <User size={18} className="text-[#d70018]" />
              <div>
                <p className="text-[10px] text-gray-400">FoGo Super Admin</p>
                <p className="font-bold">Quản trị viên</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Thanh Menu Đỏ Danh Mục Sản Phẩm */}
        <div className="bg-[#d70018] text-white text-xs font-bold">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto whitespace-nowrap">
            <div className="flex items-center">
              <Link href="/iphone" className="px-4 py-2.5 hover:bg-red-700 flex items-center gap-1.5 border-r border-red-600">
                iPhone <span className="bg-white text-[#d70018] text-[9px] px-1 py-0.2 rounded font-black">HOT</span>
              </Link>
              <Link href="/ipad" className="px-4 py-2.5 hover:bg-red-700 flex items-center gap-1.5 border-r border-red-600">
                iPad <span className="bg-white text-[#d70018] text-[9px] px-1 py-0.2 rounded font-black">NEW</span>
              </Link>
              <Link href="/macbook" className="px-4 py-2.5 hover:bg-red-700 flex items-center gap-1.5 border-r border-red-600">
                MacBook <span className="bg-white text-[#d70018] text-[9px] px-1 py-0.2 rounded font-black">NEW</span>
              </Link>
              <Link href="/hang-cu" className="px-4 py-2.5 hover:bg-red-700 border-r border-red-600">Hàng Cũ</Link>
              <Link href="/watch" className="px-4 py-2.5 hover:bg-red-700 border-r border-red-600">Watch</Link>
              <Link href="/phu-kien" className="px-4 py-2.5 hover:bg-red-700">Phụ kiện</Link>
            </div>
          </div>
        </div>

        {/* Sub-Header Cam Kết Fogo Store */}
        <div className="bg-gray-50 border-b border-gray-200 py-2 text-[11px] text-gray-600 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-1 font-bold text-gray-800">
              <Menu size={14} className="text-[#d70018]" />
              <span>DANH MỤC SẢN PHẨM</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-600" /> Đảm bảo chất lượng</span>
              <span className="flex items-center gap-1.5"><RotateCcw size={14} className="text-blue-600" /> Thu cũ đổi mới</span>
              <span className="flex items-center gap-1.5"><Truck size={14} className="text-amber-600" /> Miễn phí vận chuyển</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. NỘI DUNG CHÍNH (BREADCRUMB, CONTENT & SIDEBAR)
      ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4 overflow-hidden truncate">
          <Link href="/" className="hover:text-[#d70018] transition-colors shrink-0">Trang chủ</Link>
          <ChevronRight size={12} className="shrink-0 text-gray-400" />
          <Link href="/tin-tuc" className="hover:text-[#d70018] transition-colors shrink-0">Tin tức</Link>
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
            {/* CỘT BÀI VIẾT (8 CỘT) */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-8 rounded-xl border border-gray-200/80 shadow-xs space-y-6">
              {/* Tiêu đề & tác giả */}
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

              {/* Ảnh đại diện lớn */}
              {post.thumbnail && (
                <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={getSafeImageUrl(post.thumbnail)} alt={post.title} className="w-full max-h-[460px] object-cover" />
                </div>
              )}

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

              {/* Nội dung bài viết */}
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4 pt-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:scroll-mt-28 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-800 [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:scroll-mt-28 [&>p]:text-xs [&>p]:sm:text-sm [&>p]:leading-relaxed [&>p]:text-gray-700 [&>img]:rounded-xl [&>img]:mx-auto [&>img]:my-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-xs [&>ul]:space-y-1"
                dangerouslySetInnerHTML={{ __html: processedContent || `<p>${post.summary || ''}</p>` }}
              />

              {/* Banner CTA */}
              <div className="bg-[#d70018] text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="font-black text-sm sm:text-base uppercase tracking-tight">MUA SẢN PHẨM APPLE TẠI FOGO STORE CỰC ƯU ĐÃI</p>
                  <p className="text-[11px] text-red-100">Bảo hành 12 tháng 1 đổi 1 • Trả góp 0% duyệt nhanh</p>
                </div>
                <Link
                  href="/"
                  className="px-4 py-2 bg-white text-[#d70018] rounded-lg font-bold text-xs hover:bg-gray-100 shrink-0 transition-colors shadow-2xs"
                >
                  Khám phá ngay
                </Link>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
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

            {/* CỘT BÊN PHẢI (4 CỘT) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Widget: Bài viết mới nhất */}
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

              {/* Widget: Danh mục page */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-3">
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
        )}
      </main>

      {/* ========================================================
          3. FOOTER CHUẨN FOGO STORE
      ======================================================== */}
      <footer className="bg-white border-t border-gray-200 mt-14 pt-10 pb-6 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Cột 1 */}
          <div className="space-y-3">
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Về Fogo Store</h4>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Sự hài lòng của khách hàng chính là sản phẩm của Fogo Store. Hệ thống bán lẻ sản phẩm Apple chính hãng uy tín tại TP.HCM.
            </p>
          </div>

          {/* Cột 2 */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Thông tin liên hệ</h4>
            <p className="text-[11px] text-gray-500">298 Trần Hưng Đạo, P. Nguyễn Cư Trinh, Quận 1, TP.HCM</p>
            <p className="text-[11px] text-gray-500">Hotline: 056.600.3333</p>
            <p className="text-[11px] text-gray-500">Email: cskh@fogostore.vn</p>
          </div>

          {/* Cột 3 */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Hỗ trợ khách hàng</h4>
            <ul className="space-y-1 text-[11px] text-gray-500">
              <li><Link href="/tim-kiem" className="hover:text-[#d70018]">Tìm kiếm</Link></li>
              <li><Link href="/gioi-thieu" className="hover:text-[#d70018]">Giới thiệu</Link></li>
              <li><Link href="/tin-tuc" className="hover:text-[#d70018]">Tin tức công nghệ</Link></li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Liên kết</h4>
            <ul className="space-y-1 text-[11px] text-gray-500">
              <li><Link href="/iphone" className="hover:text-[#d70018]">iPhone</Link></li>
              <li><Link href="/ipad" className="hover:text-[#d70018]">iPad</Link></li>
              <li><Link href="/macbook" className="hover:text-[#d70018]">MacBook</Link></li>
            </ul>
          </div>

          {/* Cột 5 */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Chính sách</h4>
            <ul className="space-y-1 text-[11px] text-gray-500">
              <li><Link href="/chinh-sach-bao-hanh" className="hover:text-[#d70018]">Chính sách bảo hành</Link></li>
              <li><Link href="/chinh-sach-doi-tra" className="hover:text-[#d70018]">Chính sách đổi trả</Link></li>
              <li><Link href="/chinh-sach-van-chuyen" className="hover:text-[#d70018]">Chính sách vận chuyển</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 text-center text-[11px] text-gray-400">
          <p>© 2026 Fogo Store. Tất cả các quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}