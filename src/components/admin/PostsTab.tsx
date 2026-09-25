'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  X,
  Eye,
  Globe,
  FileSpreadsheet,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Square,
  Search,
} from 'lucide-react';

interface Props {
  posts: any[];
  onRefresh: () => void;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function PostsTab({ posts = [], onRefresh }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Toast thông báo kiểu banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal xác nhận xóa an toàn
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'single' | 'bulk';
    targetId?: string;
    title: string;
    description: string;
  }>({
    open: false,
    type: 'single',
    title: '',
    description: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnail: '',
    metaTitle: '',
    metaDesc: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAdminToken = () =>
    localStorage.getItem('fogo_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('fogo_admin_token') ||
    '';

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

  // Upload file Haravan (Excel, CSV, DOCX) kèm Token
  const handleImportHaravan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    setImporting(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`${API_URL}/api/admin/posts/import-haravan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || 'Nhập bài viết thành công!', 'success');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Lỗi khi nhập file bài viết', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ để tải file lên', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Tạo bài viết mới kèm Token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Vui lòng điền tiêu đề và nội dung bài viết!', 'error');
      return;
    }

    setLoading(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`${API_URL}/api/admin/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
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
        showToast('Đã lưu bài viết mới thành công!', 'success');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Thêm bài viết thất bại', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Thực thi xóa (1 bài hoặc nhiều bài)
  const handleExecuteDelete = async () => {
    setLoading(true);
    const token = getAdminToken();

    try {
      let res;
      if (deleteModal.type === 'single' && deleteModal.targetId) {
        res = await fetch(`${API_URL}/api/admin/posts/${deleteModal.targetId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (deleteModal.type === 'bulk') {
        res = await fetch(`${API_URL}/api/admin/posts/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }

      const data = await res?.json().catch(() => ({}));
      if (res?.ok && (data.success || data.message)) {
        showToast(data.message || 'Đã xóa bài viết thành công!', 'success');
        setSelectedIds((prev) =>
          deleteModal.type === 'single'
            ? prev.filter((id) => id !== deleteModal.targetId)
            : []
        );
        setDeleteModal({ open: false, type: 'single', title: '', description: '' });
        onRefresh();
      } else {
        showToast(data?.message || data?.error || 'Có lỗi xảy ra khi xóa', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lọc bài viết theo ô tìm kiếm
  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q)
    );
  }, [posts, searchTerm]);

  const isAllSelected = filteredPosts.length > 0 && selectedIds.length === filteredPosts.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 select-none relative">
      {/* TOAST THÔNG BÁO GÓC MÀN HÌNH */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG TRÊN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Quản Lý Bài Viết &amp; SEO Blog</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng cộng: <span className="font-bold text-red-600">{posts.length}</span> bài viết trong Database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:border-[#d70018] outline-none w-48 sm:w-56"
            />
          </div>

          {/* NÚT IMPORT TỰ ĐỘNG TỪ HARAVAN */}
          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
            {importing ? <RefreshCw size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
            <span>{importing ? 'Đang Import...' : 'Import Haravan (.xlsx/.csv)'}</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv, .docx"
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

      {/* THANH THAO TÁC HÀNG LOẠT */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <CheckSquare size={16} className="text-[#d70018]" />
            <span>Đã chọn {selectedIds.length} bài viết</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={() =>
                setDeleteModal({
                  open: true,
                  type: 'bulk',
                  title: `Xác nhận xóa ${selectedIds.length} bài viết`,
                  description: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} bài viết đã chọn không? Thao tác này không thể hoàn tác.`,
                })
              }
              className="bg-[#d70018] hover:bg-red-700 text-white px-3.5 py-1.5 rounded font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 size={13} />
              <span>Xóa các bài đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* DANH SÁCH BÀI VIẾT */}
      <div className="bg-white rounded-lg border border-gray-100 divide-y overflow-hidden shadow-sm">
        {/* Hàng chọn tất cả */}
        {filteredPosts.length > 0 && (
          <div className="p-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-bold border-b">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-gray-700 hover:text-black cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare size={16} className="text-[#d70018]" />
              ) : (
                <Square size={16} />
              )}
              <span>Chọn tất cả ({filteredPosts.length} bài)</span>
            </button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-2">
            <UploadCloud size={40} className="mx-auto text-gray-300" />
            <p className="font-medium">Chưa có bài viết nào phù hợp.</p>
            <p className="text-[11px] text-gray-400">
              Hãy bấm nút <span className="text-emerald-600 font-bold">Import Haravan</span> ở trên để nạp danh sách bài viết!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isSelected = selectedIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isSelected ? 'bg-red-50/40' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelectOne(post.id)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[#d70018]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-16 h-12 object-cover rounded border shrink-0 bg-gray-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x75?text=No+Img';
                      }}
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

                <div className="flex items-center gap-3 shrink-0">
                  <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Eye size={12} /> {post.views || 0}
                  </span>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        open: true,
                        type: 'single',
                        targetId: post.id,
                        title: 'Xác nhận xóa bài viết',
                        description: `Bạn có chắc muốn xóa bài viết "${post.title}"?`,
                      })
                    }
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Xóa bài viết"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL XÁC NHẬN XÓA (THAY THẾ CONFIRM WINDOW BỊ UNDEFINED) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900">{deleteModal.title}</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-medium">
                {deleteModal.description}
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                * Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, type: 'single', title: '', description: '' })}
                disabled={loading}
                className="py-2.5 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={loading}
                className="py-2.5 px-4 bg-[#d70018] hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{loading ? 'Đang xóa...' : 'Đồng ý xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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