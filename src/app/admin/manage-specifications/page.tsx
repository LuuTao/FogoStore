'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  CheckSquare, 
  Square,
  Loader2,
  Filter
} from 'lucide-react';
import { ToastNotification } from '@/components/common/ToastNotification';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Danh sách các trường thông số mẫu có sẵn để tích chọn nhanh
const DEFAULT_SPEC_FIELDS = [
  'Màn hình',
  'Hệ điều hành',
  'Vi xử lý',
  'Camera sau',
  'Camera trước',
  'Pin & Sạc',
  'Thiết kế & Độ bền',
  'Màu sắc',
  'RAM & Bộ nhớ',
  'Kết nối & Mạng',
  'Trọng lượng',
];

interface SpecItem {
  key: string;
  value: string;
}

export default function ManageSpecificationsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('ALL'); // Thêm state lọc dòng sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dữ liệu chỉnh sửa cho sản phẩm đang chọn
  const [description, setDescription] = useState('');
  const [salesPolicy, setSalesPolicy] = useState('');
  const [specsList, setSpecsList] = useState<SpecItem[]>([]);
  const [customKey, setCustomKey] = useState('');

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 1. Fetch danh sách sản phẩm
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      setProducts(list);
      if (list.length > 0) {
        selectProductToEdit(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chọn một sản phẩm để load dữ liệu vào form
  const selectProductToEdit = (prod: any) => {
    setSelectedProduct(prod);
    setDescription(prod.description || '');
    setSalesPolicy(
      prod.salesPolicy ||
      `• Lỗi 1 đổi 1 trong 12 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm 150.000đ khi mua kèm Củ sạc nhanh Apple chính hãng.\n• Hỗ trợ thu cũ đổi mới trợ giá lên đến 95%.`
    );

    // Load thông số kỹ thuật (nếu đã lưu từ trước dạng array hoặc object)
    if (Array.isArray(prod.specifications) && prod.specifications.length > 0) {
      setSpecsList(prod.specifications);
    } else if (typeof prod.specifications === 'object' && prod.specifications !== null) {
      const converted = Object.entries(prod.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSpecsList(converted);
    } else {
      // Mặc định tạo danh sách cơ bản
      setSpecsList([
        { key: 'Màn hình', value: 'OLED Super Retina XDR' },
        { key: 'Vi xử lý', value: 'Apple Silicon' },
        { key: 'Hệ điều hành', value: 'iOS' },
      ]);
    }
  };

  // Các dòng sản phẩm mẫu để chọn nhanh
  const seriesFilters = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'iPhone', value: 'iphone' },
    { label: 'iPad', value: 'ipad' },
    { label: 'MacBook', value: 'mac`book' },
    { label: 'Watch', value: 'watch' },
    { label: 'Hàng Cũ', value: 'cũ' },
  ];

  // Lọc sản phẩm theo từ khóa và dòng sản phẩm được chọn
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category?.name || p.categorySlug || '').toLowerCase();
      
      const matchSearch = name.includes(searchQuery.toLowerCase());

      if (selectedSeries === 'ALL') return matchSearch;

      const matchSeries = name.includes(selectedSeries) || category.includes(selectedSeries);
      return matchSearch && matchSeries;
    });
  }, [products, searchQuery, selectedSeries]);

  // Toggle tích chọn trường thông số có sẵn
  const toggleDefaultField = (fieldName: string) => {
    const exists = specsList.some((item) => item.key.toLowerCase() === fieldName.toLowerCase());
    if (exists) {
      setSpecsList(specsList.filter((item) => item.key.toLowerCase() !== fieldName.toLowerCase()));
    } else {
      setSpecsList([...specsList, { key: fieldName, value: '' }]);
    }
  };

  const handleSpecValueChange = (index: number, val: string) => {
    const updated = [...specsList];
    updated[index].value = val;
    setSpecsList(updated);
  };

  const addCustomSpec = () => {
    if (!customKey.trim()) return;
    setSpecsList([...specsList, { key: customKey.trim(), value: '' }]);
    setCustomKey('');
  };

  const removeSpecRow = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  // 3. Lưu thông số về backend
  const handleSave = async () => {
    if (!selectedProduct) return;
    try {
      setIsSaving(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('fogo_token') : null;

      const payload = {
        description,
        salesPolicy,
        specifications: specsList,
      };

      const res = await fetch(`${API_URL}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        localStorage.setItem(`fogo_specs_${selectedProduct.id}`, JSON.stringify(payload));
      }

      setToast({
        show: true,
        type: 'success',
        message: `Đã lưu thành công thông số cho sản phẩm ${selectedProduct.name}!`,
      });
    } catch (err) {
      console.error(err);
      setToast({ show: true, type: 'error', message: 'Có lỗi xảy ra khi lưu thông số.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 select-none">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Cpu className="text-[#d70018]" size={24} />
              <span>QUẢN LÝ THÔNG SỐ & MÔ TẢ TỪNG SẢN PHẨM</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Chỉnh sửa Thông số kỹ thuật, Mô tả sản phẩm và Chính sách bảo hành áp dụng độc lập cho từng máy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedProduct}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d70018] hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span>Lưu Thay Đổi</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH CHỌN SẢN PHẨM KÈM LỌC NHANH DÒNG */}
          <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Chọn sản phẩm ({filteredProducts.length})
            </h2>

            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên máy..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:border-[#d70018] focus:outline-none"
              />
            </div>

            {/* THANH CHỌN NHANH DÒNG SẢN PHẨM */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar border-b border-gray-100 pb-2">
              <span className="text-[10px] font-bold text-gray-400 shrink-0 flex items-center gap-0.5">
                <Filter size={11} /> Dòng:
              </span>
              {seriesFilters.map((series) => (
                <button
                  key={series.value}
                  type="button"
                  onClick={() => setSelectedSeries(series.value)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSeries === series.value
                      ? 'bg-[#d70018] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {series.label}
                </button>
              ))}
            </div>

            {/* List sản phẩm cuộn */}
            <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Đang tải sản phẩm...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">Không tìm thấy sản phẩm phù hợp.</div>
              ) : (
                filteredProducts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectProductToEdit(item)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      selectedProduct?.id === item.id
                        ? 'bg-red-50/70 border border-red-200 text-[#d70018]'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <img
                      src={item.imageUrl || item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded bg-white p-1 border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-snug">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {Number(item.price || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA THÔNG SỐ (8 CỘT) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* THẺ 1: CHECKLIST & BẢNG THÔNG SỐ KỸ THUẬT NỔI BẬT */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                  <span>1. Bảng Thông Số Kỹ Thuật (Đặc Điểm Nổi Bật)</span>
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Tích chọn các đặc điểm có sẵn để tự động đưa vào bảng thông số, sau đó điền chi tiết nội dung bên dưới.
                </p>
              </div>

              {/* HÀNG CHECKLIST TÍCH CHỌN TRƯỜNG CÓ SẴN */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">
                  Tích chọn các thông số muốn hiển thị:
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SPEC_FIELDS.map((fName) => {
                    const isChecked = specsList.some(
                      (item) => item.key.toLowerCase() === fName.toLowerCase()
                    );
                    return (
                      <button
                        key={fName}
                        type="button"
                        onClick={() => toggleDefaultField(fName)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-[#d70018] bg-red-50 text-[#d70018] shadow-2xs'
                            : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span>{fName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BẢNG ĐIỀN NỘI DUNG CHI TIẾT CỦA CÁC ĐẶC ĐIỂM ĐÃ CHỌN */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-700">
                  Nội dung chi tiết từng thông số:
                </label>

                <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                  {specsList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Chưa chọn thông số nào. Hãy tích chọn các trường phía trên!
                    </div>
                  ) : (
                    specsList.map((spec, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                        <div className="w-1/3 min-w-[130px]">
                          <span className="text-xs font-bold text-gray-900 block truncate">
                            {spec.key}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecValueChange(index, e.target.value)}
                          placeholder={`Nhập thông số cho ${spec.key}...`}
                          className="flex-1 text-xs border border-gray-300 rounded px-3 py-1.5 focus:border-[#d70018] focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => removeSpecRow(index)}
                          className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Xóa trường này"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Thêm trường tự nhập khác */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="Thêm đặc điểm khác (Ví dụ: Cổng sạc, Chuẩn Bluetooth...)"
                    className="flex-1 text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:border-[#d70018] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomSpec}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={14} /> Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* THẺ 2: MÔ TẢ SẢN PHẨM & CHÍNH SÁCH BÁN HÀNG */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                  <span>2. Mô Tả Chi Tiết & Chính Sách Bán Hàng</span>
                </h2>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-500" />
                  <span>Mô tả sản phẩm (Hiển thị tab MÔ TẢ):</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông tin giới thiệu, các tính năng nổi bật..."
                  className="w-full text-xs border border-gray-300 rounded-md p-3 focus:border-[#d70018] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gray-500" />
                  <span>Chính sách bán hàng & Bảo hành (Hiển thị tab CHÍNH SÁCH):</span>
                </label>
                <textarea
                  rows={5}
                  value={salesPolicy}
                  onChange={(e) => setSalesPolicy(e.target.value)}
                  placeholder="Nhập các điều khoản bảo hành, ưu đãi quà tặng..."
                  className="w-full text-xs border border-gray-300 rounded-md p-3 focus:border-[#d70018] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}