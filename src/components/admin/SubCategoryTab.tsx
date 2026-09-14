'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, UploadCloud, RotateCcw, CheckCircle2 } from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function SubCategoryTab() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: '',
    name: '',
    categoryId: '',
    imageUrl: '',
    keyword: '',
    order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [previewActive, setPreviewActive] = useState('all');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/subcategories?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setItems(d.data);
      }
    } catch (err) {
      console.error('Lỗi khi fetch subcategories:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload và chuyển ảnh sang Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/admin/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ id: '', name: '', categoryId: '', imageUrl: '', keyword: '', order: 0 });
      fetchData();
    } catch (err) {
      alert('Lưu dữ liệu thất bại, vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa danh mục con này?')) {
      await fetch(`${API_URL}/api/admin/subcategories/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleCancelEdit = () => {
    setForm({ id: '', name: '', categoryId: '', imageUrl: '', keyword: '', order: 0 });
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. KHU VỰC XEM TRƯỚC GIAO DIỆN CHUẨN NGOÀI TRANG CHỦ / SẢN PHẨM */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              Xem trước hiển thị thực tế (Chuẩn bo tròn to)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Kích thước 80px (tăng 2 size), nền xám #f0f2f5, viền đỏ khi chọn
            </p>
          </div>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Đã đồng bộ {items.length} mục
          </span>
        </div>

        <div className="flex items-start justify-center gap-6 overflow-x-auto py-2">
          {/* Nút ALL bo tròn chuẩn mẫu */}
          <button
            type="button"
            onClick={() => setPreviewActive('all')}
            className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                previewActive === 'all'
                  ? 'bg-white border-2 border-[#d70018] shadow-md shadow-red-100 scale-105'
                  : 'bg-[#f0f2f5] border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <span
                className={`text-base font-black tracking-wider ${
                  previewActive === 'all' ? 'text-[#1d1d1f]' : 'text-gray-600'
                }`}
              >
                ALL
              </span>
            </div>
            <span
              className={`text-xs font-bold ${
                previewActive === 'all' ? 'text-[#d70018]' : 'text-gray-700 group-hover:text-black'
              }`}
            >
              Tất cả
            </span>
          </button>

          {/* Danh sách icon tròn to */}
          {items.map((item) => {
            const isSelected = previewActive === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreviewActive(item.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer max-w-[100px] shrink-0"
              >
                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center p-2.5 transition-all duration-200 shadow-sm overflow-hidden ${
                    isSelected
                      ? 'bg-white border-2 border-[#d70018] shadow-md shadow-red-100 scale-105'
                      : 'bg-[#f0f2f5] border-2 border-transparent hover:bg-gray-200 group-hover:scale-105'
                  }`}
                >
                  <img
                    src={item.imageUrl || '/placeholder.png'}
                    alt={item.name}
                    className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
                  />
                </div>
                <span
                  className={`text-xs font-semibold text-center leading-tight line-clamp-2 ${
                    isSelected ? 'text-[#d70018] font-bold' : 'text-gray-800 group-hover:text-black'
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FORM THÊM / CHỈNH SỬA */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="font-extrabold text-sm text-gray-800 flex items-center justify-between border-b pb-2.5">
          <span>{form.id ? '✏️ Chỉnh Sửa Danh Mục Con' : '➕ Thêm Danh Mục Con Mới'}</span>
          {form.id && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Hủy sửa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Tên hiển thị *</label>
            <input
              className="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:border-[#d70018]"
              placeholder="VD: iPhone 18 Series"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Từ khóa lọc (Tìm theo tên) *</label>
            <input
              className="w-full border rounded-lg p-2 text-xs outline-none focus:border-[#d70018]"
              placeholder="VD: 18, 18 Pro, Dou"
              value={form.keyword}
              onChange={(e) => setForm({ ...form, keyword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Danh mục cha (CategoryId) *</label>
            <input
              className="w-full border rounded-lg p-2 text-xs outline-none focus:border-[#d70018]"
              placeholder="VD: iphone hoặc cat-iphone"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Icon hình ảnh tròn</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg p-2 text-xs outline-none truncate focus:border-[#d70018]"
                placeholder="Dán link ảnh URL..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <label className="bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                <UploadCloud size={14} />
                <span>Tải File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            {uploading && <p className="text-[11px] text-blue-600 mt-1 animate-pulse">Đang tải ảnh lên...</p>}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button
            type="submit"
            className="bg-[#d70018] hover:bg-red-700 text-white px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            {form.id ? 'CẬP NHẬT MỤC' : 'THÊM MỤC MỚI'}
          </button>
        </div>
      </form>

      {/* 3. DANH SÁCH QUẢN LÝ DẠNG CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 border border-gray-200 hover:border-gray-300 rounded-xl text-center flex flex-col items-center justify-between shadow-2xs group transition-all"
          >
            {/* Vòng tròn to 80px bo chuẩn */}
            <div className="w-20 h-20 rounded-full bg-[#f0f2f5] border border-gray-200 p-2.5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
              <img
                src={item.imageUrl || '/placeholder.png'}
                alt={item.name}
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>

            <div className="space-y-0.5 mb-3 w-full">
              <span className="font-bold text-xs text-gray-800 block truncate" title={item.name}>
                {item.name}
              </span>
              <span className="text-[10px] text-gray-400 block truncate">Lọc: {item.keyword}</span>
              <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono inline-block mt-1">
                {item.categoryId}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t w-full justify-center">
              <button
                onClick={() => setForm(item)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                title="Sửa"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}