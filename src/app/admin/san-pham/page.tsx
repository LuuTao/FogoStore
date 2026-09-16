'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Package,
  Layers,
  Search,
  CheckCircle,
  Loader2,
  X,
  Sliders,
  CheckSquare,
  Square,
  Cpu,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastNotification } from '@/components/common/ToastNotification';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const DEFAULT_SPEC_FIELDS = [
  'Màn hình',
  'Hệ điều hành',
  'Vi xử lý',
  'Camera sau',
  'Camera trước',
  'Pin & Sạc',
  'Thiết kế & Độ bền',
  'Màu sắc',
];

interface SpecItem {
  key: string;
  value: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [description, setDescription] = useState('');
  const [salesPolicy, setSalesPolicy] = useState(
    '• Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm 150.000đ khi mua kèm Củ sạc nhanh Apple chính hãng.'
  );

  // Thông số kỹ thuật
  const [specsList, setSpecsList] = useState<SpecItem[]>([
    { key: 'Màn hình', value: '' },
    { key: 'Vi xử lý', value: '' },
    { key: 'Camera sau', value: '' },
    { key: 'Pin & Sạc', value: '' },
  ]);

  // Biến thể khởi tạo
  const [variants, setVariants] = useState([
    {
      storage: '128GB',
      color: 'Đen Titan',
      price: 25000000,
      originalPrice: 28000000,
      stock: 20,
      imagesText: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch(`${API_BASE}/api/products`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/admin/categories`, { cache: 'no-store' }),
      ]);
      const [prodData, catData] = await Promise.all([resProd.json(), resCat.json()]);

      if (prodData.success) {
        setProducts(Array.isArray(prodData.data) ? prodData.data : []);
      } else if (Array.isArray(prodData)) {
        setProducts(prodData);
      }

      if (catData.success) {
        const catList = Array.isArray(catData.data) ? catData.data : [];
        setCategories(catList);
        if (catList.length > 0 && !categoryId) setCategoryId(catList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleAddVariantRow = () => {
    setVariants([
      ...variants,
      {
        storage: '256GB',
        color: 'Trắng Titan',
        price: 28000000,
        originalPrice: 31000000,
        stock: 15,
        imagesText: '',
      },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const toggleSpecField = (fieldName: string) => {
    const exists = specsList.some((s) => s.key.toLowerCase() === fieldName.toLowerCase());
    if (exists) {
      setSpecsList(specsList.filter((s) => s.key.toLowerCase() !== fieldName.toLowerCase()));
    } else {
      setSpecsList([...specsList, { key: fieldName, value: '' }]);
    }
  };

  const handleSpecValueChange = (index: number, value: string) => {
    const updated = [...specsList];
    updated[index].value = value;
    setSpecsList(updated);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !categoryId || variants.length === 0) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        categoryId,
        seriesId: seriesId || undefined,
        description,
        salesPolicy,
        specifications: specsList.filter((s) => s.key.trim() && s.value.trim()),
        variants: variants.map((v) => ({
          storage: v.storage,
          color: v.color,
          price: Number(v.price),
          originalPrice: Number(v.originalPrice),
          stock: Number(v.stock),
          images: v.imagesText ? v.imagesText.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        })),
      };

      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Thêm sản phẩm thất bại');

      setToast({ show: true, type: 'success', message: 'Thêm sản phẩm mới thành công!' });
      setIsOpenModal(false);
      setName('');
      setSlug('');
      setDescription('');
      loadData();
    } catch (err: any) {
      setToast({ show: true, type: 'error', message: err.message || 'Lỗi khi lưu sản phẩm' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
        setToast({ show: true, type: 'success', message: 'Đã xóa sản phẩm thành công.' });
      } else {
        setToast({ show: true, type: 'error', message: data.error || 'Xóa sản phẩm thất bại.' });
      }
    } catch {
      setToast({ show: true, type: 'error', message: 'Lỗi kết nối máy chủ khi xóa.' });
    }
  };

  const formatVnd = (num: number) => (num || 0).toLocaleString('vi-VN') + 'đ';
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
                <Link href="/admin/don-hang" className="hover:text-[#d70018]">Quản lý đơn hàng</Link>
                <span>/</span>
                <Link href="/admin/manage-specifications" className="hover:text-[#d70018]">Quản lý thông số</Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Danh sách sản phẩm</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <Layers className="text-[#d70018]" />
                <span>QUẢN TRỊ DANH MỤC & SẢN PHẨM</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên máy, slug..."
                  className="text-xs pl-9 pr-3 py-2 rounded border border-gray-300 bg-white w-64 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <Link
                href="/admin/manage-specifications"
                className="bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm"
              >
                <Sliders size={15} />
                <span>Quản lý thông số</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpenModal(true)}
                className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-2 rounded flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Thêm sản phẩm</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách sản phẩm */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Ảnh</th>
                    <th className="py-3 px-4">Tên Sản Phẩm</th>
                    <th className="py-3 px-4">Danh Mục</th>
                    <th className="py-3 px-4">Kho Biến Thể</th>
                    <th className="py-3 px-4">Mức Giá</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                        Đang lấy danh mục từ kho...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const firstVar = p.variants?.[0];
                      const thumb = firstVar?.images?.[0] || p.imageUrl || 'https://placehold.co/100';

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 w-16">
                            <div className="w-12 h-12 border rounded bg-gray-50 p-1 flex items-center justify-center">
                              <img
                                src={thumb}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900 leading-snug">{p.name}</p>
                            <p className="text-[11px] text-gray-400">/{p.slug}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              {p.category?.name || 'iPhone'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700 font-medium">
                              {p.variants?.length || 0} phiên bản
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-[#d70018]">
                            {formatVnd(firstVar?.price || p.price)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/admin/manage-specifications`}
                                className="text-blue-600 hover:text-blue-800 p-1.5 transition-colors"
                                title="Chỉnh sửa thông số"
                              >
                                <Sliders size={15} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                                title="Xóa máy"
                              >
                                <Trash2 size={16} />
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
        </main>
      </div>

      {/* MODAL THÊM SẢN PHẨM MỚI */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
                <Package size={17} className="text-[#d70018]" />
                <span>Thêm Sản Phẩm Mới Vào Kho</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: iPhone 16 Plus 128GB Chính Hãng VN/A"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đường dẫn Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Danh mục *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCategoryObj?.series?.length > 0 && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dòng Series (tùy chọn)</label>
                  <select
                    value={seriesId}
                    onChange={(e) => setSeriesId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none"
                  >
                    <option value="">-- Không thuộc Series cụ thể --</option>
                    {selectedCategoryObj.series.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bảng biến thể */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Biến thể (Dung lượng, Màu, Giá) *</span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[#d70018] font-bold hover:underline cursor-pointer"
                  >
                    + Thêm biến thể
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div key={idx} className="p-3 border rounded bg-gray-50 space-y-2 relative">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Dung lượng (256GB)"
                          value={v.storage}
                          onChange={(e) => handleVariantChange(idx, 'storage', e.target.value)}
                          className="border rounded p-1.5 bg-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Màu sắc (Titan Sa Mạc)"
                          value={v.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="border rounded p-1.5 bg-white text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Giá bán"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="border rounded p-1.5 bg-white text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Giá niêm yết"
                          value={v.originalPrice}
                          onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                          className="border rounded p-1.5 bg-white text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Link ảnh đại diện máy (URL)"
                        value={v.imagesText}
                        onChange={(e) => handleVariantChange(idx, 'imagesText', e.target.value)}
                        className="w-full border rounded p-1.5 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng cấu hình Thông số kỹ thuật nhanh */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Cpu size={15} className="text-[#d70018]" />
                    <span>Đặc Điểm Nổi Bật & Thông Số Kỹ Thuật</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SPEC_FIELDS.map((fName) => {
                    const isChecked = specsList.some((s) => s.key.toLowerCase() === fName.toLowerCase());
                    return (
                      <button
                        key={fName}
                        type="button"
                        onClick={() => toggleSpecField(fName)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-[#d70018] bg-red-50 text-[#d70018]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {isChecked ? <CheckSquare size={13} /> : <Square size={13} />}
                        <span>{fName}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 border border-gray-200 rounded p-2.5 bg-gray-50/50">
                  {specsList.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                      <span className="w-1/3 min-w-[110px] font-bold text-gray-800 text-[11px] truncate">
                        {spec.key}
                      </span>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecValueChange(sIdx, e.target.value)}
                        placeholder={`Thông số cho ${spec.key}...`}
                        className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#d70018]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mô tả & Chính sách bán hàng */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mô tả sản phẩm</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả tóm tắt tính năng..."
                    className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#d70018]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chính sách bán hàng</label>
                  <textarea
                    rows={3}
                    value={salesPolicy}
                    onChange={(e) => setSalesPolicy(e.target.value)}
                    placeholder="Chính sách bảo hành, quà tặng..."
                    className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#d70018]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 border rounded font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  <span>Lưu sản phẩm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}