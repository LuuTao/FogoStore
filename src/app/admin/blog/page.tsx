'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Globe,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  Tag,
  Share2,
} from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  author: string;
  published: boolean;
  views: number;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
}

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Đánh giá chi tiết iPhone thế hệ mới: Camera và Apple Intelligence đỉnh cao',
    slug: 'danh-gia-iphone-the-he-moi',
    category: 'Đánh giá',
    excerpt: 'Trải nghiệm thực tế hệ thống camera thế hệ mới và các tính năng AI thông minh hỗ trợ tiếng Việt.',
    content: 'Nội dung chi tiết bài viết đánh giá về thiết kế titanium, màn hìnhPromotion và thời lượng pin...',
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    author: 'Fogo Editor',
    published: true,
    views: 1240,
    metaTitle: 'Đánh giá iPhone thế hệ mới - Fogo Store HCM',
    metaDesc: 'Bài đánh giá chi tiết camera, thời lượng pin và cấu hình iPhone chính hãng tại Fogo Store.',
    createdAt: '2026-09-10',
  },
  {
    id: 'post-2',
    title: 'Hướng dẫn cách kiểm tra MacBook cũ chuẩn zin 100% khi mua tại cửa hàng',
    slug: 'cach-kiem-tra-macbook-cu-chuan-zin',
    category: 'Mẹo hay',
    excerpt: 'Các bước test màn hình, số chu kỳ sạc pin, bàn phím và kiểm tra tài khoản iCloud ẩn/MDM.',
    content: 'Khi chọn mua MacBook qua sử dụng, bạn cần chú ý kiểm tra cycle count của pin và test bàn phím...',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    author: 'Kỹ Thuật Viên FoGo',
    published: true,
    views: 890,
    metaTitle: 'Bí quyết test MacBook cũ chính hãng - Fogo Store',
    metaDesc: 'Hướng dẫn từng bước test máy MacBook like new bao zin, không dính tài khoản iCloud ẩn.',
    createdAt: '2026-09-08',
  },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Tin tức');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');

  // Tự động tạo slug từ tiêu đề
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPost) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setFormSlug(generatedSlug);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('Tin tức');
    setFormExcerpt('');
    setFormContent('');
    setFormThumbnail('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80');
    setFormPublished(true);
    setFormMetaTitle('');
    setFormMetaDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: BlogPost) => {
    setEditingPost(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormExcerpt(p.excerpt);
    setFormContent(p.content);
    setFormThumbnail(p.thumbnail);
    setFormPublished(p.published);
    setFormMetaTitle(p.metaTitle || '');
    setFormMetaDesc(p.metaDesc || '');
    setIsModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    if (editingPost) {
      // Cập nhật bài viết
      setPosts((prev) =>
        prev.map((item) =>
          item.id === editingPost.id
            ? {
                ...item,
                title: formTitle,
                slug: formSlug,
                category: formCategory,
                excerpt: formExcerpt,
                content: formContent,
                thumbnail: formThumbnail,
                published: formPublished,
                metaTitle: formMetaTitle,
                metaDesc: formMetaDesc,
              }
            : item
        )
      );
    } else {
      // Thêm bài mới
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        title: formTitle,
        slug: formSlug || `bai-viet-${Date.now()}`,
        category: formCategory,
        excerpt: formExcerpt,
        content: formContent,
        thumbnail: formThumbnail,
        author: 'Fogo Admin',
        published: formPublished,
        views: 0,
        metaTitle: formMetaTitle || formTitle,
        metaDesc: formMetaDesc || formExcerpt,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPosts([newPost, ...posts]);
    }

    setIsModalOpen(false);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      setPosts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchQuery =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* TIÊU ĐỀ TRANG VÀ NÚT TẠO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-[#d70018]" size={26} />
            <span>Quản Lý Bài Viết & SEO Blog</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Biên tập tin tức công nghệ, đánh giá sản phẩm và tối ưu thứ hạng tìm kiếm trên Google
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer w-fit"
        >
          <Plus size={16} />
          <span>Viết Bài Mới</span>
        </button>
      </div>

      {/* THANH TÌM KIẾM & CHỌN CHUYÊN MỤC */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc đường dẫn bài viết..."
            className="w-full bg-[#f8f9fa] border border-gray-200 focus:border-[#d70018] focus:bg-white rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 outline-none transition-all"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['Tất cả', 'Tin tức', 'Đánh giá', 'Mẹo hay', 'Khuyến mãi'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-red-50 text-[#d70018] border border-red-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* BẢNG DANH SÁCH BÀI VIẾT */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Bài Viết</th>
                <th className="py-3 px-4">Chuyên Mục</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Lượt Xem</th>
                <th className="py-3 px-4">Ngày Đăng</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 line-clamp-1 hover:text-[#d70018] transition-colors cursor-pointer">
                            {post.title}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">/tin-tuc/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {post.published ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          Công khai
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold whitespace-nowrap">{post.views.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{post.createdAt}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(post)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / CHỈNH SỬA BÀI VIẾT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900">
                {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo Bài Viết Mới'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-5 space-y-4 text-xs">
              {/* Tiêu đề */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#d70018]"
                />
              </div>

              {/* Đường dẫn Slug & Chuyên mục */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đường dẫn thân thiện (Slug)</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-[#d70018]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chuyên mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-[#d70018] bg-white cursor-pointer"
                  >
                    <option value="Tin tức">Tin tức</option>
                    <option value="Đánh giá">Đánh giá</option>
                    <option value="Mẹo hay">Mẹo hay</option>
                    <option value="Khuyến mãi">Khuyến mãi</option>
                  </select>
                </div>
              </div>

              {/* Link ảnh bìa */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Đường dẫn ảnh bìa (Thumbnail URL)</label>
                <input
                  type="url"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-[#d70018]"
                />
              </div>

              {/* Đoạn tóm tắt */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mô tả ngắn gọn (Excerpt)</label>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Tóm tắt 1-2 câu về nội dung bài viết..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-[#d70018]"
                />
              </div>

              {/* Nội dung chính */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nội dung chi tiết bài viết</label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Biên tập toàn bộ nội dung bài viết..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-[#d70018]"
                />
              </div>

              {/* Khối Cấu hình SEO Google */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2.5">
                <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                  <Globe size={15} className="text-[#d70018]" />
                  <span>Xem trước kết quả tìm kiếm Google (SEO Preview)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Tiêu đề SEO (Meta Title)</label>
                  <input
                    type="text"
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    placeholder={formTitle || 'Tiêu đề hiển thị trên Google'}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-xs outline-none focus:border-[#d70018]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Mô tả SEO (Meta Description)</label>
                  <textarea
                    rows={2}
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    placeholder={formExcerpt || 'Mô tả ngắn xuất hiện dưới tiêu đề tìm kiếm'}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-xs outline-none focus:border-[#d70018]"
                  />
                </div>
              </div>

              {/* Trạng thái xuất bản */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publish-check"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 text-[#d70018] rounded cursor-pointer"
                />
                <label htmlFor="publish-check" className="font-bold text-gray-700 cursor-pointer">
                  Công khai bài viết ngay sau khi lưu
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-lg font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {editingPost ? 'Cập Nhật Bài Viết' : 'Lưu & Đăng Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}