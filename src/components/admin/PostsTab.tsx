'use client';

import React, { useState } from 'react';
import { Plus, Trash2, X, Eye, Globe, FileSpreadsheet, UploadCloud, RefreshCw } from 'lucide-react';

interface Props {
  posts: any[];
  onRefresh: () => void;
}

export default function PostsTab({ posts, onRefresh }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnail: '',
    metaTitle: '',
    metaDesc: '',
  });

  // Tự động sinh slug khi gõ tiêu đề thủ công
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: generatedSlug,
      metaTitle: val,
    }));
  };

  // Upload file Haravan (Excel hoặc CSV)
  const handleImportHaravan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    setImporting(true);
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/posts/import-haravan', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onRefresh();
      } else {
        alert(data.error || 'Lỗi khi nhập file');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ để tải file lên');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng điền tiêu đề và nội dung bài viết!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpenModal(false);
        setFormData({
          title: '',
          slug: '',
          summary: '',
          content: '',
          thumbnail: '',
          metaTitle: '',
          metaDesc: '',
        });
        onRefresh();
      } else {
        alert(data.error || 'Thêm bài viết thất bại');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này không?')) return;
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.error);
    } catch {
      alert('Không thể xóa bài viết');
    }
  };

  return (
    <div className="space-y-6">
      {/* THANH ĐIỀU HƯỚNG TRÊN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Quản Lý Bài Viết & SEO Blog</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng cộng: <span className="font-bold text-red-600">{posts.length}</span> bài viết
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* NÚT IMPORT TỰ ĐỘNG TỪ HARAVAN */}
          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
            {importing ? <RefreshCw size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
            <span>{importing ? 'Đang Import Dữ Liệu...' : 'Import Từ Haravan (.xlsx / .csv)'}</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportHaravan}
              disabled={importing}
              className="hidden"
            />
          </label>

          {/* NÚT TẠO THỦ CÔNG */}
          <button
            onClick={() => setIsOpenModal(true)}
            className="bg-[#d70018] hover:bg-red-700 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus size={16} /> Viết Bài Mới
          </button>
        </div>
      </div>

      {/* DANH SÁCH BÀI VIẾT */}
      <div className="bg-white rounded-lg border border-gray-100 divide-y overflow-hidden shadow-sm">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-2">
            <UploadCloud size={40} className="mx-auto text-gray-300" />
            <p className="font-medium">Chưa có bài viết nào trên hệ thống.</p>
            <p className="text-[11px] text-gray-400">
              Hãy bấm nút <span className="text-emerald-600 font-bold">Import Từ Haravan</span> ở trên để nạp toàn bộ bài viết từ file xuất về!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-16 h-12 object-cover rounded border shrink-0 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gray-100 rounded border shrink-0 flex items-center justify-center text-gray-400 text-[10px]">
                    No Image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-sm truncate">{post.title}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1 truncate">
                    <Globe size={12} className="shrink-0" /> /{post.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Eye size={12} /> {post.views || 0}
                </span>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  title="Xóa bài viết"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL VIẾT BÀI THỦ CÔNG */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm">Thêm Bài Viết Mới Chuẩn SEO</h3>
              <button onClick={() => setIsOpenModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đánh giá chi tiết iPhone 16 Pro Max..."
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Đường dẫn tĩnh (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ảnh Đại Diện (URL Image)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tóm Tắt Ngắn (Summary)</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt nội dung chính..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nội Dung Chi Tiết (HTML) *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="<p>Nội dung chi tiết...</p>"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="border border-blue-100 bg-blue-50/40 p-3.5 rounded-lg space-y-3">
                <p className="font-bold text-blue-900 text-xs flex items-center gap-1">
                  <Globe size={13} /> Thiết Lập Thẻ SEO Google
                </p>
                <div>
                  <label className="text-gray-600 block mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full border rounded-md p-2 text-xs outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.metaDesc}
                    onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                    className="w-full border rounded-md p-2 text-xs outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Đang Lưu...' : 'Lưu Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}