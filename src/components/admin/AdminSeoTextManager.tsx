'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, RotateCcw, FileText } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { key: 'iphone_seo_desc', label: 'Trang iPhone (/iphone)' },
  { key: 'ipad_seo_desc', label: 'Trang iPad (/ipad)' },
  { key: 'macbook_seo_desc', label: 'Trang MacBook (/macbook)' },
  { key: 'watch_seo_desc', label: 'Trang Apple Watch (/watch)' },
  { key: 'phu_kien_seo_desc', label: 'Trang Phụ Kiện (/phu-kien)' },
];

export default function AdminSeoTextManager() {
  const [selectedKey, setSelectedKey] = useState('iphone_seo_desc');
  const [seoText, setSeoText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(`fogo_seo_${selectedKey}`);
      if (existing) {
        setSeoText(existing);
      } else {
        setSeoText('');
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedKey]);

  const handleSave = () => {
    try {
      localStorage.setItem(`fogo_seo_${selectedKey}`, seoText);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Không thể lưu bài viết, vui lòng thử lại.');
    }
  };

  const handleClear = () => {
    if (confirm('Xóa nội dung đã lưu để quay về bài viết mặc định ban đầu?')) {
      localStorage.removeItem(`fogo_seo_${selectedKey}`);
      setSeoText('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-5 max-w-5xl mx-auto my-6 shadow-xs select-none">
      {saved && (
        <div className="fixed top-20 right-8 z-50 bg-[#00a859] text-white px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-bold text-xs border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>Đã lưu thành công bài viết giới thiệu!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-[#d70018]" />
            <span>Quản Lý Bài Viết Chân Trang (SEO Content)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý văn bản hiển thị kèm tính năng rút gọn/xem thêm ở chân trang các danh mục.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-[#d70018] hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Save size={15} />
            <span>LƯU BÀI VIẾT</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 text-xs">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedKey(cat.key)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedKey === cat.key
                ? 'bg-red-50 text-[#d70018] border border-red-200'
                : 'text-gray-600 hover:text-black bg-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-bold text-gray-700 block mb-2">
          Nội dung văn bản chi tiết:
        </label>
        <textarea
          rows={18}
          value={seoText}
          onChange={(e) => setSeoText(e.target.value)}
          placeholder="Nhập nội dung bài viết giới thiệu sản phẩm, lịch sử ra mắt, đặc điểm nổi bật... tại đây"
          className="w-full border border-gray-300 rounded-lg p-4 text-xs md:text-sm font-sans outline-none focus:border-[#d70018] leading-relaxed shadow-inner"
        />
      </div>
    </div>
  );
}