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
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/admin/categories'),
      ]);
      const [prodData, catData] = await Promise.all([resProd.json(), resCat.json()]);
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) {
        setCategories(catData.data);
        if (catData.data.length > 0) setCategoryId(catData.data[0].id);
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

  // Tự sinh slug từ tên sản phẩm
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !categoryId || variants.length === 0) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
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
        variants: variants.map((v) => ({
          storage: v.storage,
          color: v.color,
          price: Number(v.price),
          originalPrice: Number(v.originalPrice),
          stock: Number(v.stock),
          images: v.imagesText ? v.imagesText.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        })),
      };

      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Thêm sản phẩm thất bại');

      alert('Thêm sản phẩm mới thành công!');
      setIsOpenModal(false);
      setName('');
      setSlug('');
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối khi xóa');
    }
  };

  const formatVnd = (num: number) => (num || 0).toLocaleString('vi-VN') + 'đ';

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
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
                <Link href="/admin/menu" className="hover:text-[#d70018]">Quản lý Menu Navbar</Link>
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

              <button
                onClick={() => setIsOpenModal(true)}
                className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-2 rounded flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Thêm sản phẩm mới</span>
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
                        Đang lấy danh mục từ PostgreSQL...
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
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 w-16">
                            <div className="w-12 h-12 border rounded bg-gray-50 p-1 flex items-center justify-center">
                              <img
                                src={firstVar?.images?.[0] || 'https://placehold.co/100'}
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
                            {formatVnd(firstVar?.price)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-gray-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                              title="Xóa máy"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-900 uppercase">Thêm Sản Phẩm Mới Vào Kho</h2>
              <button onClick={() => setIsOpenModal(false)} className="text-gray-400 hover:text-gray-600">
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

              {/* Danh sách biến thể */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Biến thể (Dung lượng, Màu, Giá) *</span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[#d70018] font-bold hover:underline"
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
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
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
                          className="border rounded p-1.5 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Màu sắc (Titan Sa Mạc)"
                          value={v.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="border rounded p-1.5 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Giá bán"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="border rounded p-1.5 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Giá niêm yết"
                          value={v.originalPrice}
                          onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                          className="border rounded p-1.5 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Link ảnh đại diện máy (URL hình ảnh)"
                        value={v.imagesText}
                        onChange={(e) => handleVariantChange(idx, 'imagesText', e.target.value)}
                        className="w-full border rounded p-1.5 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 border rounded font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded font-bold flex items-center gap-1.5 disabled:opacity-60"
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