'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCw,
  X,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'TITLE_AZ' | 'TITLE_ZA'>('NEWEST');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State Modal Thêm / Chỉnh sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    thumbnail: '',
    summary: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // State Modal xóa
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: string;
    title?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'single',
  });

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 3500);
  };

  const getAdminToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('fogo_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      ''
    );
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/posts`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(json.data);
      } else {
        setPosts([]);
      }
    } catch {
      showAlert('Không thể nạp danh sách bài viết!', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({ title: '', slug: '', thumbnail: '', summary: '', content: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      thumbnail: post.thumbnail || '',
      summary: post.summary || '',
      content: post.content || '',
    });
    setIsModalOpen(true);
  };

  // Upload file ảnh thumbnail từ máy
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setIsUploadingThumb(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/admin/upload-image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: data,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFormData((prev) => ({ ...prev, thumbnail: `${API_URL}${json.imageUrl}` }));
        showAlert('Tải ảnh đại diện lên thành công!', 'success');
      } else {
        showAlert(json.message || 'Không thể tải ảnh lên', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối khi tải ảnh!', 'error');
    } finally {
      setIsUploadingThumb(false);
      e.target.value = '';
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = getAdminToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const endpoint = editingPost
        ? `${API_URL}/api/admin/posts/${editingPost.id}`
        : `${API_URL}/api/admin/posts`;
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showAlert(editingPost ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết mới thành công!', 'success');
        setIsModalOpen(false);
        fetchPosts();
      } else {
        showAlert(json.message || json.error || 'Cập nhật thất bại!', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    const token = getAdminToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      if (confirmDeleteModal.type === 'single' && confirmDeleteModal.id) {
        const res = await fetch(`${API_URL}/api/admin/posts/${confirmDeleteModal.id}`, {
          method: 'DELETE',
          headers,
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showAlert(`Đã xóa bài viết thành công!`, 'success');
          setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteModal.id));
          setPosts((prev) => prev.filter((p) => p.id !== confirmDeleteModal.id));
        } else {
          showAlert(json.message || 'Xóa thất bại!', 'error');
        }
      } else if (confirmDeleteModal.type === 'bulk') {
        const res = await fetch(`${API_URL}/api/admin/posts/bulk-delete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ids: selectedIds }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showAlert(`Đã xóa thành công ${selectedIds.length} bài viết!`, 'success');
          setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
        } else {
          showAlert(json.message || 'Xóa thất bại!', 'error');
        }
      }
    } catch {
      showAlert('Lỗi kết nối khi xóa!', 'error');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteModal({ isOpen: false, type: 'single' });
    }
  };

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = posts.filter((p) => {
      return (
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.summary && p.summary.toLowerCase().includes(term))
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'TITLE_AZ') return a.title.localeCompare(b.title);
      if (sortBy === 'TITLE_ZA') return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [posts, searchTerm, sortBy]);

  const isAllSelected = filteredPosts.length > 0 && selectedIds.length === filteredPosts.length;
  const toggleSelectAll = () => setSelectedIds(isAllSelected ? [] : filteredPosts.map((p) => p.id));
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden select-none relative p-2 sm:p-6">
      {alertInfo && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
            alertInfo.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertInfo.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={18} className="text-red-600 shrink-0" />
            )}
            <span>{alertInfo.message}</span>
          </div>
          <button onClick={() => setAlertInfo(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText size={26} className="text-[#d70018]" />
            <span>Quản Lý Tin Tức & Bài Viết</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng: <b>{posts.length}</b> bài viết trên hệ thống Fogo Store[cite: 13]
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tiêu đề, đường dẫn slug..."
              className="text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#d70018] w-48 sm:w-60 shadow-2xs"
            />
          </div>

          <div className="relative flex items-center bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown size={14} className="text-gray-400 mr-1.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-gray-700 font-bold cursor-pointer"
            >
              <option value="NEWEST">Mới nhất trước</option>
              <option value="OLDEST">Cũ nhất trước</option>
              <option value="TITLE_AZ">Tên: A → Z</option>
              <option value="TITLE_ZA">Tên: Z → A</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchPosts}
            className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-300 shadow-2xs transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Viết Bài Mới</span>
          </button>
        </div>
      </div>

      {/* Thanh xóa nhiều */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <CheckSquare size={16} className="text-[#d70018]" />
            <span>Đã chọn {selectedIds.length} bài viết</span>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setConfirmDeleteModal({ isOpen: true, type: 'bulk', count: selectedIds.length })}
            className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <Trash2 size={13} />
            <span>Xóa các bài đã chọn</span>
          </button>
        </div>
      )}

      {/* Bảng danh sách bài viết */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button type="button" onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    {isAllSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="py-3.5 px-4 w-20">Ảnh bìa</th>
                <th className="py-3.5 px-4">Tiêu đề bài viết</th>
                <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                <th className="py-3.5 px-4">Ngày xuất bản</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                    <span>Đang tải danh sách bài viết...</span>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <AlertTriangle size={24} className="mx-auto text-gray-300 mb-2" />
                    <span>Không tìm thấy bài viết nào phù hợp</span>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);

                  return (
                    <tr key={post.id} className={`hover:bg-gray-50/70 transition-colors ${isSelected ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(post.id)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-14 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                          {post.thumbnail ? (
                            <img src={getSafeImageUrl(post.thumbnail)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-bold text-gray-900 line-clamp-1 text-[13px]">{post.title}</p>
                        <p className="text-gray-400 text-[11px] line-clamp-1 mt-0.5">{post.summary || 'Không có tóm tắt'}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-600 truncate max-w-xs">
                        /{post.slug}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/tin-tuc/${post.slug}`}
                            target="_blank"
                            className="p-1.5 bg-gray-100 hover:bg-[#d70018] hover:text-white rounded-lg text-gray-600 transition-colors"
                            title="Xem trước bài viết ngoài website"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(post)}
                            className="p-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg text-gray-600 transition-colors cursor-pointer"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteModal({ isOpen: true, type: 'single', id: post.id, title: post.title })}
                            className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white rounded-lg text-gray-600 transition-colors cursor-pointer"
                            title="Xóa bài viết"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / CẬP NHẬT BÀI VIẾT TÍCH HỢP UPLOAD ẢNH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Tin Tức Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tiêu đề bài viết (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đánh giá iPhone 16 Pro Max sau 1 tháng trải nghiệm..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Đường dẫn URL tùy biến (Slug):</label>
                <input
                  type="text"
                  placeholder="Để trống sẽ tự động sinh theo tiêu đề"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              {/* Tải ảnh đại diện trực tiếp hoặc nhập URL */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ảnh đại diện (Thumbnail):</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-24 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.thumbnail ? (
                      <img src={getSafeImageUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Dán link ảnh hoặc tải ảnh từ máy tính..."
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#d70018]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                      {isUploadingThumb ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isUploadingThumb ? 'Đang tải ảnh...' : 'Tải ảnh từ máy tính'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImageFile}
                        disabled={isUploadingThumb}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tóm tắt ngắn (SEO Description):</label>
                <textarea
                  rows={2}
                  placeholder="Đoạn văn ngắn tóm tắt nội dung bài viết..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nội dung chi tiết (Hỗ trợ HTML):</label>
                <textarea
                  rows={8}
                  placeholder="Nội dung bài viết chi tiết..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 font-mono text-[11px] focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#d70018] hover:bg-[#b50014] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
                  <span>{editingPost ? 'Lưu Thay Đổi' : 'Tạo & Xuất Bản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center space-y-4 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-[#d70018] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                {confirmDeleteModal.type === 'single'
                  ? 'Xác nhận xóa bài viết?'
                  : `Xóa ${confirmDeleteModal.count} bài viết đã chọn?`}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Bài viết sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và website. Bạn có chắc chắn muốn tiếp tục?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteModal({ isOpen: false, type: 'single' })}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#d70018] hover:bg-[#b50014] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}