'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bold,
  Italic,
  Heading2,
  List,
  UploadCloud,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  ExternalLink,
  Search,
} from 'lucide-react';
import mammoth from 'mammoth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

type SeoCategoryKey = 'iphone' | 'ipad' | 'macbook' | 'watch' | 'phu-kien';

interface SeoTabConfig {
  key: SeoCategoryKey;
  label: string;
  path: string;
  storageKey: string;
}

const SEO_TABS: SeoTabConfig[] = [
  { key: 'iphone', label: 'iPhone (/iphone)', path: '/iphone', storageKey: 'fogo_seo_iphone_seo_desc' },
  { key: 'ipad', label: 'iPad (/ipad)', path: '/ipad', storageKey: 'fogo_seo_ipad_seo_desc' },
  { key: 'macbook', label: 'MacBook (/macbook)', path: '/macbook', storageKey: 'fogo_seo_macbook_seo_desc' },
  { key: 'watch', label: 'Apple Watch (/watch)', path: '/watch', storageKey: 'fogo_seo_watch_seo_desc' },
  { key: 'phu-kien', label: 'Phụ Kiện (/phu-kien)', path: '/phu-kien', storageKey: 'fogo_seo_phu_kien_seo_desc' },
];

export default function AdminSeoManagementPage() {
  const [activeTab, setActiveTab] = useState<SeoCategoryKey>('iphone');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const currentTabConfig = SEO_TABS.find((t) => t.key === activeTab)!;

  // Nạp dữ liệu khi đổi Tab
  useEffect(() => {
    // 1. Đọc nội dung bài viết Rich Text
    const savedHtml = localStorage.getItem(currentTabConfig.storageKey) || '';
    if (editorRef.current) {
      editorRef.current.innerHTML = savedHtml;
    }

    // 2. Đọc thẻ Meta SEO
    const savedMeta = localStorage.getItem(`${currentTabConfig.storageKey}_meta`);
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta);
        setMetaTitle(parsed.title || '');
        setMetaDesc(parsed.description || '');
        setMetaKeywords(parsed.keywords || '');
      } catch (_) {}
    } else {
      setMetaTitle(`${currentTabConfig.label.split(' ')[0]} Chính Hãng VN/A - Giá Tốt Nhất Thị Trường | FoGo Store`);
      setMetaDesc(`Mua ${currentTabConfig.label.split(' ')[0]} chính hãng Apple VN/A giá tốt, hỗ trợ trả góp 0%, bảo hành uy tín 1 đổi 1 tại FoGo Store.`);
      setMetaKeywords(`apple, ${currentTabConfig.key}, gia re, chinh hang`);
    }
  }, [activeTab, currentTabConfig.storageKey, currentTabConfig.label, currentTabConfig.key]);

  // Các hàm định dạng Word trực tiếp
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Import từ file Word (.docx)
  const handleImportWordDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Vui lòng chọn file Word định dạng .docx');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (editorRef.current) {
        editorRef.current.innerHTML = result.value;
      }
    } catch (err) {
      alert('Không thể đọc file Word, vui lòng thử lại!');
    }
  };

  // Lưu cấu hình
  const handleSaveSeo = async () => {
    setIsSaving(true);
    const contentHtml = editorRef.current ? editorRef.current.innerHTML : '';

    try {
      // 1. Lưu LocalStorage để các component giao diện đọc ngay
      localStorage.setItem(currentTabConfig.storageKey, contentHtml);
      localStorage.setItem(
        `${currentTabConfig.storageKey}_meta`,
        JSON.stringify({ title: metaTitle, description: metaDesc, keywords: metaKeywords })
      );

      // 2. Lưu lên API Database Backend
      await fetch(`${API_URL}/api/admin/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeTab,
          htmlContent: contentHtml,
          metaTitle,
          metaDescription: metaDesc,
          metaKeywords,
        }),
      }).catch(() => {});

      window.dispatchEvent(new Event('fogo_banners_updated'));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Lỗi lưu cấu hình SEO!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 md:p-8 select-none">
      {saveSuccess && (
        <div className="fixed top-8 right-8 z-[99999] bg-[#00a859] text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 size={18} />
          <span>Đã lưu thành công bài viết SEO &amp; thẻ Meta!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <Link href="/admin" className="hover:underline">Bảng điều khiển</Link>
            <span>/</span>
            <span>Quản trị SEO</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="text-[#d70018]" size={26} />
            <span>QUẢN LÝ BÀI VIẾT CHÂN TRANG &amp; THẺ SEO META</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (confirm('Khôi phục nội dung mặc định?')) {
                localStorage.removeItem(currentTabConfig.storageKey);
                window.location.reload();
              }
            }}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSeo}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-[#d70018] hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH SEO'}</span>
          </button>
        </div>
      </div>

      {/* Tabs danh mục */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {SEO_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${
              activeTab === tab.key
                ? 'bg-[#d70018] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Trình soạn thảo Word */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>Bài Viết Giới Thiệu Chân Trang</span>
                </h3>
                <p className="text-[11px] text-gray-500">Hiển thị ở chân trang danh mục, có nút Xem thêm / Thu gọn tự động.</p>
              </div>

              <Link
                href={currentTabConfig.path}
                target="_blank"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Xem trang</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            {/* Thanh công cụ định dạng phong cách Word */}
            <div className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg mb-3 flex-wrap">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                title="In đậm (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                title="In nghiêng (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h2>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer font-black text-xs"
                title="Tiêu đề H2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                title="Danh sách gạch đầu dòng"
              >
                <List size={15} />
              </button>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* Nút Import file Word (.docx) */}
              <label className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-xs font-bold text-blue-700 cursor-pointer shadow-2xs">
                <UploadCloud size={14} />
                <span>Nhập từ file Word (.docx)</span>
                <input
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={handleImportWordDocx}
                />
              </label>
            </div>

            {/* Vùng soạn thảo Rich Text (có thể paste thẳng từ Word) */}
            <div
              ref={editorRef}
              contentEditable
              className="w-full min-h-[380px] p-4 border border-gray-200 rounded-lg outline-none focus:border-[#d70018] text-xs sm:text-sm text-gray-800 leading-relaxed overflow-y-auto bg-white"
              style={{ minHeight: '380px' }}
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 mt-2">
            <span>Mẹo: Bạn có thể copy trực tiếp từ văn bản Word (.docx) rồi Ctrl+V dán vào đây mà không mất định dạng in đậm/nghiêng.</span>
          </div>
        </div>

        {/* Cột phải: Thẻ Meta SEO Google */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Search size={16} className="text-[#d70018]" />
              <span>Thẻ Meta SEO Google</span>
            </h3>

            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">Tiêu Đề Trang (Meta Title)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs outline-none focus:border-[#d70018]"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">Mô Tả Trang (Meta Description)</label>
              <textarea
                rows={4}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs outline-none focus:border-[#d70018]"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">Từ Khóa (Meta Keywords)</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="VD: iphone, macbook, apple chinh hang..."
                className="w-full border border-gray-200 rounded p-2 text-xs outline-none focus:border-[#d70018]"
              />
            </div>
          </div>

          {/* Khung Xem Trước Google (Google Search Preview) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Xem trước trên Google</span>
            <span className="text-[11px] text-gray-500 block truncate">https://fogostore.vn{currentTabConfig.path}</span>
            <h4 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer line-clamp-1">
              {metaTitle || 'Tiêu đề trang mẫu'}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2 leading-snug">
              {metaDesc || 'Mô tả tóm tắt nội dung khi tìm kiếm trên công cụ tìm kiếm Google...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}