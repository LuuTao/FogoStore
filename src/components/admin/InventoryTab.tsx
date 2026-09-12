'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  X,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Star,
  Zap,
  Smartphone,
  Tablet,
  Laptop,
  Watch as WatchIcon,
  Headphones,
  Cpu,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';

interface Props {
  inventory: any[];
  onRefresh: () => void;
}

// 1. Bổ sung 3 danh mục máy cũ vào cấu trúc phân cấp khi đăng sản phẩm
const SUB_SERIES_PRESETS: Record<string, string[]> = {
  iPhone: ['iPhone 16 Series', 'iPhone 15 Series', 'iPhone 14 Series', 'iPhone 13 Series'],
  iPad: ['iPad Pro', 'iPad Air', 'iPad Gen', 'iPad Mini'],
  MacBook: ['MacBook Pro', 'MacBook Air', 'MacBook Neo'],
  Watch: ['Apple Watch Ultra', 'Apple Watch Series', 'Apple Watch SE'],
  'Phụ kiện': ['Củ sạc & Cáp', 'Tai nghe AirPods', 'Ốp lưng & Bao da', 'Kính cường lực', 'Bút & Bàn phím'],
  'iPhone Cũ': ['iPhone 16 Series Cũ', 'iPhone 15 Series Cũ', 'iPhone 14 Series Cũ', 'iPhone 13 Series Cũ'],
  'iPad Cũ': ['iPad Pro Cũ', 'iPad Air Cũ', 'iPad Gen Cũ', 'iPad Mini Cũ'],
  'MacBook Cũ': ['MacBook Pro Cũ', 'MacBook Air Cũ'],
};

const PRESET_STORAGES = [
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
  '64GB',
  '40mm',
  '41mm',
  '42mm',
  '44mm',
  '45mm',
  '46mm',
  '49mm',
  '20W',
  '35W',
  'Tiêu chuẩn',
];

const PRESET_CHIPS = ['A18 Pro', 'A18', 'A17 Pro', 'A16 Bionic', 'M5', 'M4', 'M3', 'M2', 'M1', 'S10', 'S9'];

export default function InventoryTab({ inventory, onRefresh }: Props) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStorage, setSelectedStorage] = useState('ALL');
  const [selectedChip, setSelectedChip] = useState('ALL');
  const [selectedRam, setSelectedRam] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<
    'name_asc' | 'name_desc' | 'stock_desc' | 'stock_asc' | 'price_desc' | 'price_asc'
  >('name_asc');

  // Trạng thái mở/đóng danh mục
  const [expandedSeries, setExpandedSeries] = useState<{ [series: string]: boolean }>({});
  const [expandedProducts, setExpandedProducts] = useState<{ [id: string]: boolean }>({});

  // Modals
  const [isOpenAddProductModal, setIsOpenAddProductModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [addingVariantProduct, setAddingVariantProduct] = useState<any>(null);

  const [loadingAction, setLoadingAction] = useState(false);

  // Form state đăng sản phẩm mới
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('iPhone');
  const [selectedSubSeries, setSelectedSubSeries] = useState('iPhone 16 Series');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isHot, setIsHot] = useState(false);
  const [variantsList, setVariantsList] = useState([
    {
      storage: '128GB',
      color: 'Titan Tự Nhiên',
      price: 29990000,
      originalPrice: 31990000,
      stock: 20,
      images: [] as string[],
    },
  ]);

  // Tự động phân dòng Series từ tên sản phẩm và phân loại Cũ / Mới chuẩn xác
  const getProductSeries = (name: string, catName: string = '') => {
    const lower = (name + ' ' + catName).toLowerCase();
    const isUsed = lower.includes('cũ') || lower.includes('like new') || lower.includes('99%');

    if (lower.includes('iphone')) {
      if (lower.includes('18')) return isUsed ? 'iPhone 18 Series Cũ' : 'iPhone 18 Series';
      if (lower.includes('17')) return isUsed ? 'iPhone 17 Series Cũ' : 'iPhone 17 Series';
      if (lower.includes('16')) return isUsed ? 'iPhone 16 Series Cũ' : 'iPhone 16 Series';
      if (lower.includes('15')) return isUsed ? 'iPhone 15 Series Cũ' : 'iPhone 15 Series';
      if (lower.includes('14')) return isUsed ? 'iPhone 14 Series Cũ' : 'iPhone 14 Series';
      if (lower.includes('13')) return isUsed ? 'iPhone 13 Series Cũ' : 'iPhone 13 Series';
      return isUsed ? 'iPhone Cũ Khác' : 'iPhone Khác';
    }
    if (lower.includes('ipad')) {
      if (lower.includes('pro')) return isUsed ? 'iPad Pro Cũ' : 'iPad Pro';
      if (lower.includes('air')) return isUsed ? 'iPad Air Cũ' : 'iPad Air';
      if (lower.includes('mini')) return isUsed ? 'iPad Mini Cũ' : 'iPad Mini';
      if (lower.includes('gen')) return isUsed ? 'iPad Gen Cũ' : 'iPad Gen';
      return isUsed ? 'iPad Cũ Khác' : 'iPad Khác';
    }
    if (lower.includes('mac') || lower.includes('macbook')) {
      if (lower.includes('pro')) return isUsed ? 'MacBook Pro Cũ' : 'MacBook Pro';
      if (lower.includes('air')) return isUsed ? 'MacBook Air Cũ' : 'MacBook Air';
      return isUsed ? 'MacBook Cũ Khác' : 'MacBook Khác';
    }
    if (lower.includes('watch')) {
      if (lower.includes('ultra')) return 'Apple Watch Ultra';
      if (lower.includes('series')) return 'Apple Watch Series';
      if (lower.includes('se')) return 'Apple Watch SE';
      return 'Apple Watch Khác';
    }
    return 'Phụ Kiện Apple';
  };

  const detectChip = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('m4')) return 'M4';
    if (lower.includes('m3')) return 'M3';
    if (lower.includes('m2')) return 'M2';
    if (lower.includes('m1')) return 'M1';
    if (lower.includes('16 pro') || lower.includes('16 pro max')) return 'A18 Pro';
    if (lower.includes('iphone 16')) return 'A18';
    if (lower.includes('15 pro') || lower.includes('15 pro max')) return 'A17 Pro';
    if (lower.includes('iphone 15')) return 'A16 Bionic';
    if (lower.includes('ultra 2') || lower.includes('series 10') || lower.includes('series 9')) return 'S10/S9';
    return 'Khác';
  };

  // Danh mục động kết hợp sẵn 3 danh mục máy cũ
  const categories = useMemo(() => {
    const defaultCats = ['iPhone', 'MacBook', 'Watch', 'iPad', 'Phụ kiện', 'iPhone Cũ', 'iPad Cũ', 'MacBook Cũ'];
    const set = new Set<string>(defaultCats);
    inventory.forEach((item) => {
      const cat = item.product?.category?.name;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [inventory]);

  const sortedStorages = useMemo(() => {
    const rawSet = new Set<string>();
    inventory.forEach((item) => {
      if (item.storage) rawSet.add(item.storage.trim());
    });

    const parseStorageSize = (s: string) => {
      const upper = s.toUpperCase();
      const num = parseInt(upper.replace(/[^0-9]/g, '')) || 0;
      if (upper.includes('TB')) return num * 1024 * 1024;
      if (upper.includes('GB')) return num * 1024;
      if (upper.includes('MM')) return num * 10;
      if (upper.includes('W')) return num;
      return 9999999;
    };

    return Array.from(rawSet).sort((a, b) => parseStorageSize(a) - parseStorageSize(b));
  }, [inventory]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, { product: any; variants: any[] }>();
    inventory.forEach((item) => {
      const p = item.product;
      if (!p) return;
      if (!map.has(p.id)) {
        map.set(p.id, { product: p, variants: [] });
      }
      map.get(p.id)!.variants.push(item);
    });
    return Array.from(map.values());
  }, [inventory]);

  const groupedBySeries = useMemo(() => {
    let filtered = groupedProducts.filter(({ product, variants }) => {
      const catName = (product.category?.name || '').toLowerCase();
      const catSlug = (product.category?.slug || '').toLowerCase();
      const prodName = (product.name || '').toLowerCase();
      const isUsed = prodName.includes('cũ') || prodName.includes('like new') || prodName.includes('99%') || catSlug.includes('cu');

      // Lọc chuẩn xác theo danh mục mới chọn
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'iPhone Cũ') {
          if (!(prodName.includes('iphone') && isUsed)) return false;
        } else if (selectedCategory === 'iPad Cũ') {
          if (!(prodName.includes('ipad') && isUsed)) return false;
        } else if (selectedCategory === 'MacBook Cũ') {
          if (!(prodName.includes('macbook') && isUsed)) return false;
        } else if (selectedCategory === 'iPhone') {
          if (!prodName.includes('iphone') || isUsed) return false;
        } else if (selectedCategory === 'iPad') {
          if (!prodName.includes('ipad') || isUsed) return false;
        } else if (selectedCategory === 'MacBook') {
          if (!prodName.includes('macbook') || isUsed) return false;
        } else if (selectedCategory === 'Watch') {
          if (!prodName.includes('watch')) return false;
        } else if (selectedCategory === 'Phụ kiện') {
          if (!catSlug.includes('phu-kien') && !prodName.includes('sạc') && !prodName.includes('cáp') && !prodName.includes('ốp')) return false;
        } else {
          if (product.category?.name !== selectedCategory) return false;
        }
      }

      if (selectedStorage !== 'ALL') {
        const hasStorage = variants.some((v) => v.storage === selectedStorage);
        if (!hasStorage) return false;
      }

      if (selectedRam !== 'ALL') {
        const hasRam = variants.some((v) => (v.storage || '').includes(selectedRam));
        if (!hasRam) return false;
      }

      if (selectedChip !== 'ALL') {
        const chip = detectChip(product.name);
        if (!chip.toLowerCase().includes(selectedChip.toLowerCase())) return false;
      }

      if (stockStatusFilter === 'LOW') {
        if (!variants.some((v) => v.stock <= 5)) return false;
      } else if (stockStatusFilter === 'IN_STOCK') {
        if (!variants.every((v) => v.stock > 5)) return false;
      } else if (stockStatusFilter === 'OUT_OF_STOCK') {
        if (!variants.every((v) => v.stock === 0)) return false;
      }

      const keyword = searchKeyword.toLowerCase().trim();
      if (keyword) {
        const matchName = product.name.toLowerCase().includes(keyword);
        const matchVar = variants.some(
          (v) =>
            (v.storage && v.storage.toLowerCase().includes(keyword)) ||
            (v.color && v.color.toLowerCase().includes(keyword))
        );
        if (!matchName && !matchVar) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const stockA = a.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const stockB = b.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const minPriceA = Math.min(...a.variants.map((v) => v.price || 0));
      const minPriceB = Math.min(...b.variants.map((v) => v.price || 0));

      if (sortBy === 'name_asc') return a.product.name.localeCompare(b.product.name);
      if (sortBy === 'name_desc') return b.product.name.localeCompare(a.product.name);
      if (sortBy === 'stock_desc') return stockB - stockA;
      if (sortBy === 'stock_asc') return stockA - stockB;
      if (sortBy === 'price_desc') return minPriceB - minPriceA;
      if (sortBy === 'price_asc') return minPriceA - minPriceB;
      return 0;
    });

    const result: Record<string, { product: any; variants: any[] }[]> = {};
    filtered.forEach((item) => {
      const series = getProductSeries(item.product.name, item.product.category?.name);
      if (!result[series]) result[series] = [];
      result[series].push(item);
    });

    return result;
  }, [groupedProducts, selectedCategory, selectedStorage, selectedRam, selectedChip, stockStatusFilter, searchKeyword, sortBy]);

  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) => ({
      ...prev,
      [series]: prev[series] === undefined ? false : !prev[series],
    }));
  };

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: prev[productId] === undefined ? true : !prev[productId],
    }));
  };

  const getCategoryIcon = (seriesName: string) => {
    const s = seriesName.toLowerCase();
    if (s.includes('cũ')) return <RotateCcw size={16} className="text-amber-500" />;
    if (s.includes('ipad')) return <Tablet size={16} className="text-blue-500" />;
    if (s.includes('mac')) return <Laptop size={16} className="text-purple-500" />;
    if (s.includes('watch')) return <WatchIcon size={16} className="text-orange-500" />;
    if (s.includes('phụ kiện')) return <Headphones size={16} className="text-emerald-500" />;
    return <Smartphone size={16} className="text-[#d70018]" />;
  };

  const handleQuickStockUpdate = async (variantId: string, newStock: number) => {
    try {
      await fetch(`https://fogo-store-api.onrender.com/api/admin/inventory/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      onRefresh();
    } catch {
      alert('Lỗi cập nhật tồn kho');
    }
  };

  const handleUploadMultipleImagesForEditing = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setLoadingAction(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res = await fetch('https://fogo-store-api.onrender.com/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.imageUrl);
        }
      }
      setEditingVariant((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch {
      alert('Lỗi khi tải ảnh lên');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveImageFromEditing = (index: number) => {
    setEditingVariant((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSaveEditVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/inventory/${editingVariant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingVariant,
          price: Number(editingVariant.price),
          originalPrice: Number(editingVariant.originalPrice || editingVariant.price),
          stock: Number(editingVariant.stock),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingVariant(null);
        onRefresh();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Lỗi lưu thông tin');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateVariantForProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    setLoadingAction(true);
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/inventory/variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: addingVariantProduct.id,
          storage: form.storage.value,
          color: form.color.value,
          price: Number(form.price.value),
          originalPrice: Number(form.originalPrice.value || form.price.value),
          stock: Number(form.stock.value),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddingVariantProduct(null);
        onRefresh();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Lỗi khi thêm biến thể');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/products/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          categoryName: newProdCategory,
          subSeriesName: selectedSubSeries,
          isFeatured,
          isFlashSale,
          isHot,
          variants: variantsList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpenAddProductModal(false);
        setNewProdName('');
        setVariantsList([
          { storage: '128GB', color: 'Titan Tự Nhiên', price: 29990000, originalPrice: 31990000, stock: 20, images: [] },
        ]);
        onRefresh();
      } else {
        alert(data.error || 'Thêm sản phẩm thất bại');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteFullProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ dòng máy này cùng tất cả biến thể?')) return;
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.error);
    } catch {
      alert('Không thể xóa sản phẩm');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Bạn có chắc muốn xóa biến thể cấu hình này?')) return;
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/inventory/${variantId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.error);
    } catch {
      alert('Lỗi khi xóa biến thể');
    }
  };

  const totalProductModels = Object.values(groupedBySeries).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <span>Quản Lý Tồn Kho & Sản Phẩm Thật</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu trúc phân cấp: Danh Mục &rarr; Dòng Series &rarr; Sub-model &rarr; Cấu Hình & Tồn Kho Thực Tế
          </p>
        </div>
        <button
          onClick={() => setIsOpenAddProductModal(true)}
          className="bg-[#d70018] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <Plus size={16} /> Đăng Sản Phẩm Mới
        </button>
      </div>

      {/* CỤM BỘ LỌC ĐA NĂNG */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm máy, màu..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-red-500 bg-gray-50/50"
            />
          </div>

          {/* DROPDOWN DANH MỤC CÓ ĐẦY ĐỦ 3 MỤC MÁY CŨ */}
          <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 bg-gray-50/50">
            <Layers size={14} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const firstSub = SUB_SERIES_PRESETS[e.target.value]?.[0] || 'ALL';
                setSelectedSubSeries(firstSub);
              }}
              className="w-full bg-transparent outline-none cursor-pointer font-medium text-gray-700"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 bg-gray-50/50">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full bg-transparent outline-none cursor-pointer font-medium text-gray-700"
            >
              <option value="ALL">Bộ nhớ: Tất cả</option>
              {sortedStorages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 bg-gray-50/50">
            <Cpu size={14} className="text-gray-500" />
            <select
              value={selectedChip}
              onChange={(e) => setSelectedChip(e.target.value)}
              className="w-full bg-transparent outline-none cursor-pointer font-medium text-gray-700"
            >
              <option value="ALL">Chip: Tất cả</option>
              {PRESET_CHIPS.map((chip) => (
                <option key={chip} value={chip}>
                  {chip}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 bg-gray-50/50">
            <Filter size={14} className="text-gray-500" />
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="w-full bg-transparent outline-none cursor-pointer font-medium text-gray-700"
            >
              <option value="ALL">Tất cả mức tồn</option>
              <option value="IN_STOCK">Còn hàng (&gt; 5)</option>
              <option value="LOW">Sắp hết (&le; 5)</option>
              <option value="OUT_OF_STOCK">Hết hàng (0)</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50/50 outline-none cursor-pointer font-bold text-gray-700 focus:border-red-500"
          >
            <option value="name_asc">Tên máy: A &rarr; Z</option>
            <option value="name_desc">Tên máy: Z &rarr; A</option>
            <option value="stock_desc">Tồn kho: Nhiều &rarr; Ít</option>
            <option value="stock_asc">Tồn kho: Ít &rarr; Nhiều</option>
            <option value="price_desc">Giá bán: Cao &rarr; Thấp</option>
            <option value="price_asc">Giá bán: Thấp &rarr; Cao</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Tìm thấy: <strong className="text-gray-800">{Object.keys(groupedBySeries).length}</strong> nhóm Series •{' '}
            <strong className="text-[#d70018]">{totalProductModels}</strong> dòng máy
          </span>
          <button
            onClick={() => {
              setSearchKeyword('');
              setSelectedCategory('ALL');
              setSelectedStorage('ALL');
              setSelectedChip('ALL');
              setSelectedRam('ALL');
              setStockStatusFilter('ALL');
              setSortBy('name_asc');
            }}
            className="text-[#d70018] hover:underline font-bold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* DANH SÁCH 3 TẦNG */}
      <div className="space-y-4">
        {Object.keys(groupedBySeries).length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-400 text-xs">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            Không có sản phẩm nào phù hợp với bộ lọc.
          </div>
        ) : (
          Object.entries(groupedBySeries).map(([seriesName, productList]) => {
            const isSeriesOpen = expandedSeries[seriesName] !== false;
            const totalSeriesStock = productList.reduce(
              (sum, item) => sum + item.variants.reduce((vSum, v) => vSum + (v.stock || 0), 0),
              0
            );

            return (
              <div key={seriesName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* TẦNG 1: HEADER DÒNG SERIES */}
                <div
                  onClick={() => toggleSeries(seriesName)}
                  className="bg-slate-100/90 hover:bg-slate-200/80 p-3.5 px-4 flex items-center justify-between border-b border-gray-200 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      {isSeriesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(seriesName)}
                      <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">{seriesName}</h3>
                      <span className="bg-white text-gray-700 border border-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {productList.length} dòng máy
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 font-medium">
                    Tổng tồn Series: <strong className="text-gray-900">{totalSeriesStock} máy</strong>
                  </div>
                </div>

                {/* TẦNG 2: DANH SÁCH SUB-MODELS */}
                {isSeriesOpen && (
                  <div className="divide-y divide-gray-200/80">
                    {productList.map(({ product, variants }) => {
                      const isExpanded = expandedProducts[product.id] === true;
                      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                      const minPrice =
                        variants.length > 0 ? Math.min(...variants.map((v) => v.price || 0)) : 0;

                      return (
                        <div key={product.id}>
                          <div className="bg-slate-50/70 p-3.5 px-4 pl-6 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleExpand(product.id)}
                                className="p-1 hover:bg-gray-200 rounded cursor-pointer text-gray-600 transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-extrabold text-gray-800">
                                    {product.name}
                                  </span>
                                  <span className="bg-red-50 text-[#d70018] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                    {product.category?.name || 'Apple'}
                                  </span>
                                  {product.isFlashSale && (
                                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                                      <Zap size={10} /> Flash Sale
                                    </span>
                                  )}
                                  {product.isFeatured && (
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                                      <Star size={10} /> Nổi Bật
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Tổng tồn: <span className="font-bold text-blue-600">{totalStock} máy</span> | Giá khởi điểm:{' '}
                                  <span className="font-bold text-emerald-600">
                                    {minPrice.toLocaleString('vi-VN')} đ
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAddingVariantProduct(product)}
                                className="bg-white hover:bg-red-50 hover:text-[#d70018] text-gray-700 border border-gray-300 hover:border-[#d70018] px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Plus size={13} /> Thêm Cấu Hình
                              </button>
                              <button
                                onClick={() => handleDeleteFullProduct(product.id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                title="Xóa dòng máy này"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* TẦNG 3: BẢNG BIẾN THỂ */}
                          {isExpanded && (
                            <div className="overflow-x-auto bg-gray-50/40 p-3 pl-10">
                              <div className="bg-white border rounded-lg overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-100/70 text-gray-500 uppercase border-b border-gray-200 text-[10px]">
                                    <tr>
                                      <th className="py-2.5 px-4">Ảnh ({'>'}1 ảnh)</th>
                                      <th className="py-2.5 px-4">Dung Lượng / Kích Thước</th>
                                      <th className="py-2.5 px-4">Màu Sắc</th>
                                      <th className="py-2.5 px-4">Giá Bán</th>
                                      <th className="py-2.5 px-4">Giá Gốc</th>
                                      <th className="py-2.5 px-4">Tồn Kho (Nhập nhanh)</th>
                                      <th className="py-2.5 px-4">Trạng Thái</th>
                                      <th className="py-2.5 px-4 text-right">Thao Tác</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {variants.map((v) => (
                                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-2 px-4">
                                          <div className="flex items-center gap-1.5">
                                            {v.images?.[0] ? (
                                              <img
                                                src={v.images[0]}
                                                alt="Variant"
                                                className="w-9 h-9 object-cover rounded border"
                                              />
                                            ) : (
                                              <div className="w-9 h-9 bg-gray-100 rounded border flex items-center justify-center text-[9px] text-gray-400">
                                                No img
                                              </div>
                                            )}
                                            {v.images?.length > 1 && (
                                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0.5 rounded border">
                                                +{v.images.length - 1}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-800">{v.storage}</td>
                                        <td className="py-3 px-4">
                                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                                            {v.color}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 font-black text-emerald-600">
                                          {v.price?.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 line-through">
                                          {(v.originalPrice || v.price)?.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="py-3 px-4">
                                          <input
                                            type="number"
                                            defaultValue={v.stock}
                                            onBlur={(e) =>
                                              handleQuickStockUpdate(v.id, Number(e.target.value))
                                            }
                                            className="w-20 border rounded-md px-2 py-1 text-center font-bold text-gray-800 outline-none focus:border-red-500 bg-white"
                                          />
                                        </td>
                                        <td className="py-3 px-4">
                                          {v.stock === 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                              Hết hàng (0)
                                            </span>
                                          ) : v.stock <= 5 ? (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                              <AlertTriangle size={11} /> Sắp hết ({v.stock})
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                              <CheckCircle2 size={11} /> Còn hàng ({v.stock})
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                          <button
                                            onClick={() => setEditingVariant({ ...v, images: v.images || [] })}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                            title="Sửa biến thể & Quản lý ảnh"
                                          >
                                            <Edit2 size={15} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteVariant(v.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                            title="Xóa cấu hình này"
                                          >
                                            <Trash2 size={15} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL SỬA BIẾN THỂ & THƯ VIỆN NHIỀU ẢNH */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                <Edit2 size={16} className="text-[#d70018]" />
                <span>Chỉnh Sửa Biến Thể Cấu Hình</span>
              </h3>
              <button
                onClick={() => setEditingVariant(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditVariant} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dung Lượng / Kích Thước *</label>
                <div className="flex gap-2">
                  <select
                    value={PRESET_STORAGES.includes(editingVariant.storage) ? editingVariant.storage : 'CUSTOM'}
                    onChange={(e) => {
                      if (e.target.value !== 'CUSTOM') {
                        setEditingVariant({ ...editingVariant, storage: e.target.value });
                      }
                    }}
                    className="flex-1 border rounded p-2 outline-none focus:border-red-500 bg-white font-bold"
                  >
                    {PRESET_STORAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="CUSTOM">Khác / Tự nhập...</option>
                  </select>
                  {!PRESET_STORAGES.includes(editingVariant.storage) && (
                    <input
                      type="text"
                      placeholder="Tự nhập..."
                      value={editingVariant.storage}
                      onChange={(e) => setEditingVariant({ ...editingVariant, storage: e.target.value })}
                      className="w-1/2 border rounded p-2 outline-none focus:border-red-500 font-bold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Màu Sắc *</label>
                <input
                  type="text"
                  required
                  value={editingVariant.color}
                  onChange={(e) => setEditingVariant({ ...editingVariant, color: e.target.value })}
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Giá Bán Khuyến Mãi (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingVariant.price}
                    onChange={(e) => setEditingVariant({ ...editingVariant, price: e.target.value })}
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-black text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Giá Gốc Niêm Yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingVariant.originalPrice || editingVariant.price}
                    onChange={(e) => setEditingVariant({ ...editingVariant, originalPrice: e.target.value })}
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số Lượng Tồn Kho *</label>
                <input
                  type="number"
                  required
                  value={editingVariant.stock}
                  onChange={(e) => setEditingVariant({ ...editingVariant, stock: e.target.value })}
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold"
                />
              </div>

              {/* QUẢN LÝ THƯ VIỆN ĐA ẢNH */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#d70018]" />
                    <span>Bộ Sưu Tập Hình Ảnh ({editingVariant.images?.length || 0} ảnh)</span>
                  </label>
                  <label className="bg-red-50 hover:bg-red-100 text-[#d70018] px-2.5 py-1 rounded font-bold cursor-pointer transition-colors border border-red-200 flex items-center gap-1">
                    <UploadCloud size={13} />
                    <span>+ Tải Thêm Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleUploadMultipleImagesForEditing(e.target.files)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-gray-50 p-2.5 rounded-lg border border-dashed min-h-[90px] items-center">
                  {editingVariant.images?.length === 0 ? (
                    <div className="col-span-4 text-center text-gray-400 py-3">
                      Chưa có ảnh nào. Bấm <b>Tải Thêm Ảnh</b> để thêm ảnh góc chụp.
                    </div>
                  ) : (
                    editingVariant.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded border bg-white overflow-hidden">
                        <img src={imgUrl} alt="" className="w-full h-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromEditing(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center font-bold py-0.5">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loadingAction ? 'Đang Lưu...' : 'Cập Nhật Biến Thể'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM CẤU HÌNH BIẾN THỂ CHO DÒNG CÓ SẴN */}
      {addingVariantProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Thêm Cấu Hình Biến Thể Mới</h3>
                <p className="text-[11px] text-gray-500">{addingVariantProduct.name}</p>
              </div>
              <button
                onClick={() => setAddingVariantProduct(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateVariantForProduct} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dung Lượng / Kích Thước (Chọn nhanh) *</label>
                <select
                  name="storage"
                  defaultValue="256GB"
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold bg-white cursor-pointer"
                >
                  {PRESET_STORAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Màu Sắc *</label>
                <input
                  name="color"
                  type="text"
                  required
                  placeholder="Ví dụ: Titan Tự Nhiên, Đen Không Gian"
                  className="w-full border rounded p-2 outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="34990000"
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Giá Gốc (VNĐ) *</label>
                  <input
                    name="originalPrice"
                    type="number"
                    required
                    placeholder="36990000"
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tồn Kho Ban Đầu *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={10}
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setAddingVariantProduct(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  {loadingAction ? 'Đang Tạo...' : 'Thêm Cấu Hình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐĂNG SẢN PHẨM MỚI VỚI DROPDOWN ĐẦY ĐỦ CÁC DANH MỤC CŨ */}
      {isOpenAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-gray-800">Đăng Sản Phẩm Mới Để Bán</h3>
              <button
                onClick={() => setIsOpenAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFullProduct} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên Dòng Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: iPhone 16 Pro Max 256GB Cũ 99%"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full border rounded-md p-2 text-xs outline-none focus:border-red-500 font-bold"
                />
              </div>

              {/* KHỐI CHỌN DANH MỤC CÓ THÊM 3 MỤC HÀNG CŨ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Danh Mục Thiết Bị *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      setNewProdCategory(e.target.value);
                      const firstSub = SUB_SERIES_PRESETS[e.target.value]?.[0] || '';
                      setSelectedSubSeries(firstSub);
                    }}
                    className="w-full border rounded-md p-2 bg-white outline-none focus:border-red-500 font-medium cursor-pointer text-xs"
                  >
                    <option value="iPhone">iPhone</option>
                    <option value="iPad">iPad</option>
                    <option value="MacBook">MacBook</option>
                    <option value="Watch">Apple Watch</option>
                    <option value="Phụ kiện">Phụ Kiện</option>
                    <option value="iPhone Cũ">iPhone Cũ</option>
                    <option value="iPad Cũ">iPad Cũ</option>
                    <option value="MacBook Cũ">MacBook Cũ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dòng / Phân Loại Con *</label>
                  <select
                    value={selectedSubSeries}
                    onChange={(e) => setSelectedSubSeries(e.target.value)}
                    className="w-full border rounded-md p-2 bg-red-50/40 border-red-200 outline-none focus:border-red-500 font-bold text-[#d70018] cursor-pointer text-xs"
                  >
                    {(SUB_SERIES_PRESETS[newProdCategory] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vị Trí Hiển Thị Ra Web:</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <label className="flex items-center gap-1 cursor-pointer font-semibold text-gray-700 text-xs">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="accent-[#d70018]"
                      />
                      Hiện Trang Chủ
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-semibold text-gray-700 text-xs">
                      <input
                        type="checkbox"
                        checked={isFlashSale}
                        onChange={(e) => setIsFlashSale(e.target.checked)}
                        className="accent-[#d70018]"
                      />
                      Flash Sale
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-semibold text-gray-700 text-xs">
                      <input
                        type="checkbox"
                        checked={isHot}
                        onChange={(e) => setIsHot(e.target.checked)}
                        className="accent-[#d70018]"
                      />
                      Bán Chạy
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800">Cấu Hình Khởi Tạo Ban Đầu</p>
                </div>

                {variantsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                  >
                    <select
                      value={item.storage}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].storage = e.target.value;
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white font-bold"
                    >
                      {PRESET_STORAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Màu sắc (VD: Titan)"
                      value={item.color}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].color = e.target.value;
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Giá bán"
                      value={item.price}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].price = Number(e.target.value);
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white font-bold text-emerald-600"
                    />
                    <input
                      type="number"
                      placeholder="Số tồn"
                      value={item.stock}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].stock = Number(e.target.value);
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white text-center font-bold"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpenAddProductModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-md cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {loadingAction ? 'Đang Đăng...' : 'Lưu & Đăng Bán Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}