'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Search,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface CategoryOption {
  key: string;
  label: string;
  href: string;
  defaultTitle: string;
  defaultDesc: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    key: 'iphone_seo_desc',
    label: 'iPhone (/iphone)',
    href: '/iphone',
    defaultTitle: 'iPhone Chính Hãng VN/A - Giá Tốt Nhất Thị Trường | FoGo Store',
    defaultDesc: 'Mua iPhone chính hãng Apple VN/A giá tốt, hỗ trợ trả góp 0%, bảo hành uy tín.',
  },
  {
    key: 'ipad_seo_desc',
    label: 'iPad (/ipad)',
    href: '/ipad',
    defaultTitle: 'iPad Chính Hãng Apple Giá Tốt Nhất | FoGo Store',
    defaultDesc: 'Tổng hợp các dòng máy tính bảng iPad Pro, iPad Air chính hãng Apple giá tốt.',
  },
  {
    key: 'macbook_seo_desc',
    label: 'MacBook (/macbook)',
    href: '/macbook',
    defaultTitle: 'MacBook Pro, MacBook Air Chính Hãng Apple | FoGo Store',
    defaultDesc: 'MacBook chính hãng giá ưu đãi cho học sinh, sinh viên, trả góp 0%.',
  },
  {
    key: 'watch_seo_desc',
    label: 'Apple Watch (/watch)',
    href: '/watch',
    defaultTitle: 'Đồng Hồ Apple Watch Chính Hãng | FoGo Store',
    defaultDesc: 'Apple Watch theo dõi sức khỏe, đo nhịp tim và thể thao chuyên nghiệp.',
  },
  {
    key: 'phu_kien_seo_desc',
    label: 'Phụ Kiện (/phu-kien)',
    href: '/phu-kien',
    defaultTitle: 'Phụ Kiện Apple Chính Hãng | FoGo Store',
    defaultDesc: 'Cung cấp phụ kiện Apple chính hãng: cáp sạc, tai nghe, ốp lưng cao cấp.',
  },
];

export default function ManageSeoPage() {
  const [selectedKey, setSelectedKey] = useState<string>('iphone_seo_desc');
  const [seoText, setSeoText] = useState<string>('');
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');
  const [savedToast, setSavedToast] = useState(false);

  const currentCategory = CATEGORY_OPTIONS.find((c) => c.key === selectedKey) || CATEGORY_OPTIONS[0];

  useEffect(() => {
    try {
      const savedText = localStorage.getItem(`fogo_seo_${selectedKey}`);
      setSeoText(savedText || '');

      const savedMeta = localStorage.getItem(`fogo_meta_${selectedKey}`);
      if (savedMeta) {
        const parsed = JSON.parse(savedMeta);
        setMetaTitle(parsed.title || currentCategory.defaultTitle);
        setMetaDescription(parsed.description || currentCategory.defaultDesc);
        setMetaKeywords(parsed.keywords || '');
      } else {
        setMetaTitle(currentCategory.defaultTitle);
        setMetaDescription(currentCategory.defaultDesc);
        setMetaKeywords('');
      }
    } catch (e) {
      console.error('Lỗi nạp cấu hình SEO:', e);
    }
  }, [selectedKey, currentCategory.defaultTitle, currentCategory.defaultDesc]);

  const handleSaveAll = () => {
    try {
      localStorage.setItem(`fogo_seo_${selectedKey}`, seoText);
      localStorage.setItem(
        `fogo_meta_${selectedKey}`,
        JSON.stringify({
          title: metaTitle,
          description: metaDescription,
          keywords: metaKeywords,
        })
      );
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      alert('Không thể lưu dữ liệu SEO vào máy.');
    }
  };

  const handleReset = () => {
    if (!confirm('Khôi phục nội dung về rỗng ban đầu?')) return;
    localStorage.removeItem(`fogo_seo_${selectedKey}`);
    localStorage.removeItem(`fogo_meta_${selectedKey}`);
    setSeoText('');
    setMetaTitle(currentCategory.defaultTitle);
    setMetaDescription(currentCategory.defaultDesc);
    setMetaKeywords('');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {savedToast && (
          <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-[#00a859] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 font-bold text-xs border border-emerald-400">
              <CheckCircle2 size={18} />
              <span>Đã lưu thành công bài viết và cấu hình thẻ Meta!</span>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
                <Link href="/admin/san-pham" className="hover:text-[#d70018] flex items-center gap-1">
                  <ArrowLeft size={12} /> Bảng điều khiển
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Quản trị SEO</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <FileText className="text-[#d70018]" />
                <span>QUẢN LÝ BÀI VIẾT CHÂN TRANG & THẺ SEO META</span>
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} />
                <span>Khôi Phục Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-6 py-2 bg-[#d70018] hover:bg-red-700 text-white rounded text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Save size={16} />
                <span>LƯU CẤU HÌNH SEO</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = selectedKey === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedKey(cat.key)}
                  className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#d70018] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Globe size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#d70018]" />
                    <span>Bài Viết Giới Thiệu Chân Trang</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Hiển thị ở cuối danh mục sản phẩm, có nút Xem thêm / Rút gọn tự động.
                  </p>
                </div>
                <Link
                  href={currentCategory.href}
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Xem trang ↗
                </Link>
              </div>

              <div>
                <textarea
                  rows={18}
                  value={seoText}
                  onChange={(e) => setSeoText(e.target.value)}
                  placeholder="Dán toàn bộ văn bản mô tả, lịch sử hoặc đánh giá sản phẩm tại đây..."
                  className="w-full border border-gray-300 rounded-lg p-4 text-xs md:text-sm font-sans outline-none focus:border-[#d70018] leading-relaxed shadow-inner"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                <span>Số từ: {seoText.trim() ? seoText.trim().split(/\s+/).length : 0} từ</span>
                <span>Số ký tự: {seoText.length} ký tự</span>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-gray-900 border-b pb-3 flex items-center gap-2">
                  <Search size={16} className="text-blue-600" />
                  <span>Thẻ Meta SEO Google</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Tiêu Đề Trang (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Tiêu đề hiển thị trên Google..."
                      className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#d70018] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mô Tả Trang (Meta Description)
                    </label>
                    <textarea
                      rows={4}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Mô tả tóm tắt khi tìm kiếm Google..."
                      className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#d70018] leading-normal"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Từ Khóa (Meta Keywords)
                    </label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="VD: iphone, macbook, gia re..."
                      className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#d70018]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Xem trước Google
                </h4>
                <div className="p-3 bg-gray-50 rounded border border-gray-100 space-y-1">
                  <span className="text-[11px] text-[#202124] block truncate">
                    https://fogostore.vn{currentCategory.href}
                  </span>
                  <span className="text-sm text-[#1a0dab] font-medium line-clamp-1 block">
                    {metaTitle || 'Tiêu đề trang'}
                  </span>
                  <span className="text-xs text-[#4d5156] line-clamp-2 block leading-relaxed">
                    {metaDescription || 'Đoạn mô tả ngắn gọn giới thiệu sản phẩm.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}