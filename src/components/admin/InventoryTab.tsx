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
  CheckSquare,
  Square,
  MinusSquare,
  Download,
  Loader2,
  Globe,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  inventory: any[];
  onRefresh: () => void;
}

const SUB_SERIES_PRESETS: Record<string, string[]> = {
  iPhone: ['iPhone Duo Series', 'iPhone 18 Series', 'iPhone 17 Series', 'iPhone 16 Series'],
  iPad: ['iPad Pro', 'iPad Air', 'iPad Gen', 'iPad Mini'],
  MacBook: ['MacBook Pro', 'MacBook Air', 'MacBook Neo'],
  Watch: ['Apple Watch Ultra', 'Apple Watch Series', 'Apple Watch SE'],
  'Phụ kiện': ['Củ sạc & Cáp', 'Tai nghe AirPods', 'Bút & Bàn phím'],
  'iPhone Cũ': ['iPhone 17 Series Cũ', 'iPhone 16 Series Cũ', 'iPhone 15 Series Cũ', 'iPhone 14 Series Cũ'],
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

const PRESET_ORIGINS = ['Việt Nam', 'Nhập Khẩu', 'VN/A', 'LL/A', 'ZA/A', 'Chính Hãng'];

const PRESET_CHIPS = ['A18 Pro', 'A18', 'A17 Pro', 'A16 Bionic', 'M5', 'M4', 'M3', 'M2', 'M1', 'S10', 'S9'];

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

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

  // Modals nghiệp vụ
  const [isOpenAddProductModal, setIsOpenAddProductModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [addingVariantProduct, setAddingVariantProduct] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Chọn nhiều và Modal xóa
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'single_product' | 'bulk_products' | 'single_variant';
    targetIds: string[];
    title: string;
    description: string;
  }>({
    open: false,
    type: 'single_product',
    targetIds: [],
    title: '',
    description: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAuthHeader = () => {
    const token =
      localStorage.getItem('fogo_token') ||
      localStorage.getItem('token') ||
      '';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

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
      origin: 'Việt Nam',
      price: 29990000,
      originalPrice: 31990000,
      stock: 20,
      images: [] as string[],
    },
  ]);

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
      const catSlug = (product.category?.slug || '').toLowerCase();
      const prodName = (product.name || '').toLowerCase();
      const isUsed = prodName.includes('cũ') || prodName.includes('like new') || prodName.includes('99%') || catSlug.includes('cu');

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
            (v.color && v.color.toLowerCase().includes(keyword)) ||
            (v.origin && v.origin.toLowerCase().includes(keyword))
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

  const allVisibleProductIds = useMemo(() => {
    const ids: string[] = [];
    Object.values(groupedBySeries).forEach((list) => {
      list.forEach((item) => ids.push(item.product.id));
    });
    return ids;
  }, [groupedBySeries]);

  const toggleSelectProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectSeries = (seriesProducts: { product: any }[], e: React.MouseEvent) => {
    e.stopPropagation();
    const seriesIds = seriesProducts.map((p) => p.product.id);
    const isAllSelected = seriesIds.every((id) => selectedProductIds.includes(id));

    if (isAllSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !seriesIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...seriesIds])));
    }
  };

  const toggleSelectAllVisible = () => {
    if (selectedProductIds.length === allVisibleProductIds.length && allVisibleProductIds.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allVisibleProductIds);
    }
  };

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
      const res = await fetch(`${API_BASE}/api/admin/variants/${variantId}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Cập nhật số lượng tồn kho thành công!');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Cập nhật tồn kho thất bại', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật tồn kho', 'error');
    }
  };

  // Xuất Excel có cột Xuất Xứ
  const handleDownloadExcel = () => {
    if (!inventory || inventory.length === 0) {
      showToast('Không có dữ liệu kho hàng để xuất file!', 'error');
      return;
    }

    try {
      setIsExportingExcel(true);
      const dataRows: any[] = [];
      let stt = 1;

      groupedProducts.forEach(({ product, variants }) => {
        const seriesName = getProductSeries(product.name, product.category?.name);
        const categoryName = product.category?.name || 'Apple';

        if (variants && variants.length > 0) {
          variants.forEach((v: any) => {
            const price = Number(v.price || 0);
            const originalPrice = Number(v.originalPrice || 0);
            const stock = Number(v.stock || 0);

            dataRows.push({
              STT: stt++,
              'Dòng Series': seriesName,
              'Tên Sản Phẩm': product.name,
              'Danh Mục': categoryName,
              'Dung Lượng / Kích Thước': v.storage || 'Tiêu chuẩn',
              'Màu Sắc': v.color || 'Tiêu chuẩn',
              'Xuất Xứ': v.origin || 'Việt Nam',
              'Giá Bán (VNĐ)': price > 0 ? price : 'Liên hệ',
              'Giá Gốc (VNĐ)': originalPrice > 0 ? originalPrice : '',
              'Tồn Kho (Máy)': stock,
              'Trạng Thái': stock === 0 ? 'Hết hàng (0)' : stock <= 5 ? `Sắp hết (${stock})` : `Còn hàng (${stock})`,
              'Mã Biến Thể / Slug': v.slug || product.slug || '',
            });
          });
        } else {
          dataRows.push({
            STT: stt++,
            'Dòng Series': seriesName,
            'Tên Sản Phẩm': product.name,
            'Danh Mục': categoryName,
            'Dung Lượng / Kích Thước': 'Chưa tạo',
            'Màu Sắc': 'Chưa tạo',
            'Xuất Xứ': 'Chưa tạo',
            'Giá Bán (VNĐ)': 'Liên hệ',
            'Giá Gốc (VNĐ)': '',
            'Tồn Kho (Máy)': 0,
            'Trạng Thái': 'Hết hàng (0)',
            'Mã Biến Thể / Slug': product.slug || '',
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 45 },
        { wch: 15 },
        { wch: 24 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 16 },
        { wch: 38 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ton_Kho_FoGoStore');

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `Bao_Cao_Ton_Kho_FoGoStore_${dateStr}.xlsx`);
      showToast('Đã tải thành công file Excel về máy tính!');
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      showToast('Đã xảy ra lỗi khi tạo file Excel', 'error');
    } finally {
      setIsExportingExcel(false);
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
        const res = await fetch(`${API_BASE}/api/upload`, {
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
      showToast('Lỗi khi tải ảnh lên', 'error');
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
      const res = await fetch(`${API_BASE}/api/admin/variants/${editingVariant.id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          ...editingVariant,
          price: Number(editingVariant.price),
          originalPrice: Number(editingVariant.originalPrice || editingVariant.price),
          stock: Number(editingVariant.stock),
          origin: editingVariant.origin || 'Việt Nam',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingVariant(null);
        showToast('Đã lưu cấu hình biến thể vào Database!');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Lỗi lưu thông tin', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi lưu biến thể', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateVariantForProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/variants`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          productId: addingVariantProduct.id,
          storage: form.storage.value,
          color: form.color.value,
          origin: form.origin?.value || 'Việt Nam',
          price: Number(form.price.value),
          originalPrice: Number(form.originalPrice.value || form.price.value),
          stock: Number(form.stock.value),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddingVariantProduct(null);
        showToast('Đã thêm biến thể mới!');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Lỗi khi thêm biến thể', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi thêm cấu hình', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/full`, {
        method: 'POST',
        headers: getAuthHeader(),
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
      if (res.ok && data.success) {
        setIsOpenAddProductModal(false);
        setNewProdName('');
        setVariantsList([
          { storage: '128GB', color: 'Titan Tự Nhiên', origin: 'Việt Nam', price: 29990000, originalPrice: 31990000, stock: 20, images: [] },
        ]);
        showToast('Đã đăng sản phẩm thành công!');
        onRefresh();
      } else {
        showToast(data.message || data.error || 'Thêm sản phẩm thất bại', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExecuteDelete = async () => {
    setLoadingAction(true);
    try {
      let res;
      if (deleteModal.type === 'single_product') {
        res = await fetch(`${API_BASE}/api/admin/products/${deleteModal.targetIds[0]}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
      } else if (deleteModal.type === 'bulk_products') {
        res = await fetch(`${API_BASE}/api/admin/products/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ ids: deleteModal.targetIds }),
        });
      } else if (deleteModal.type === 'single_variant') {
        res = await fetch(`${API_BASE}/api/admin/variants/${deleteModal.targetIds[0]}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
      }

      const data = await res?.json();
      if (res?.ok && (data.success || data.message)) {
        showToast(data.message || 'Đã xóa dữ liệu thành công!');
        setSelectedProductIds((prev) => prev.filter((id) => !deleteModal.targetIds.includes(id)));
        setDeleteModal((prev) => ({ ...prev, open: false }));
        onRefresh();
      } else {
        showToast(data?.message || data?.error || 'Có lỗi xảy ra trong quá trình xóa', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ API', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const totalProductModels = Object.values(groupedBySeries).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-6 select-none relative">
      {/* TOAST THÔNG BÁO */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all transform animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER & NÚT THAO TÁC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <span>Quản Lý Tồn Kho & Sản Phẩm Thật</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu trúc phân cấp: Danh Mục &rarr; Dòng Series &rarr; Sub-model &rarr; Cấu Hình & Tồn Kho Thực Tế
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={isExportingExcel}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-50"
            title="Tải toàn bộ danh sách tồn kho về máy tính định dạng Excel (.xlsx)"
          >
            {isExportingExcel ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{isExportingExcel ? 'Đang tạo Excel...' : 'Xuất File Excel'}</span>
          </button>

          <button
            onClick={() => setIsOpenAddProductModal(true)}
            className="bg-[#d70018] hover:bg-red-700 active:scale-95 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus size={16} /> Đăng Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* THANH THAO TÁC HÀNG LOẠT */}
      {selectedProductIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3.5 px-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-extrabold text-red-900">
              Đã chọn {selectedProductIds.length} sản phẩm trên trang
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductIds([])}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
            <button
              onClick={() =>
                setDeleteModal({
                  open: true,
                  type: 'bulk_products',
                  targetIds: selectedProductIds,
                  title: `Xác nhận xóa ${selectedProductIds.length} sản phẩm`,
                  description: `Bạn có chắc chắn muốn xóa toàn bộ ${selectedProductIds.length} dòng máy này và tất cả các biến thể tương ứng không? Dữ liệu sẽ biến mất vĩnh viễn khỏi Database.`,
                })
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Trash2 size={14} /> Xóa {selectedProductIds.length} Mục Đã Chọn
            </button>
          </div>
        </div>
      )}

      {/* BỘ LỌC ĐA NĂNG */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm máy, màu, xuất xứ..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-red-500 bg-gray-50/50"
            />
          </div>

          {/* DROPDOWN DANH MỤC */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllVisible}
              className="flex items-center gap-1.5 text-gray-700 hover:text-red-600 font-bold cursor-pointer"
            >
              {selectedProductIds.length > 0 && selectedProductIds.length === allVisibleProductIds.length ? (
                <CheckSquare size={16} className="text-red-600" />
              ) : selectedProductIds.length > 0 ? (
                <MinusSquare size={16} className="text-red-600" />
              ) : (
                <Square size={16} />
              )}
              <span>Chọn tất cả ({allVisibleProductIds.length} máy)</span>
            </button>
            <span>•</span>
            <span>
              Tìm thấy: <strong className="text-gray-800">{Object.keys(groupedBySeries).length}</strong> nhóm Series •{' '}
              <strong className="text-[#d70018]">{totalProductModels}</strong> dòng máy
            </span>
          </div>

          <button
            onClick={() => {
              setSearchKeyword('');
              setSelectedCategory('ALL');
              setSelectedStorage('ALL');
              setSelectedChip('ALL');
              setSelectedRam('ALL');
              setStockStatusFilter('ALL');
              setSortBy('name_asc');
              setSelectedProductIds([]);
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

            const isAllSeriesSelected = productList.every((p) => selectedProductIds.includes(p.product.id));

            return (
              <div key={seriesName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* TẦNG 1: HEADER SERIES */}
                <div
                  onClick={() => toggleSeries(seriesName)}
                  className="bg-slate-100/90 hover:bg-slate-200/80 p-3.5 px-4 flex items-center justify-between border-b border-gray-200 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      {isSeriesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleSelectSeries(productList, e)}
                      className="text-gray-500 hover:text-red-600 transition"
                      title="Chọn tất cả dòng máy trong nhóm này"
                    >
                      {isAllSeriesSelected ? (
                        <CheckSquare size={18} className="text-red-600" />
                      ) : (
                        <Square size={18} />
                      )}
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

                {/* TẦNG 2: DANH SÁCH DÒNG MÁY CHA */}
                {isSeriesOpen && (
                  <div className="divide-y divide-gray-200/80">
                    {productList.map(({ product, variants }) => {
                      const isExpanded = expandedProducts[product.id] === true;
                      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                      const minPrice =
                        variants.length > 0 ? Math.min(...variants.map((v) => v.price || 0)) : 0;
                      const isChecked = selectedProductIds.includes(product.id);

                      return (
                        <div key={product.id} className={isChecked ? 'bg-red-50/30' : ''}>
                          <div className="bg-slate-50/70 p-3.5 px-4 pl-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => toggleSelectProduct(product.id, e)}
                                className="text-gray-400 hover:text-red-600 cursor-pointer transition"
                              >
                                {isChecked ? (
                                  <CheckSquare size={18} className="text-red-600" />
                                ) : (
                                  <Square size={18} />
                                )}
                              </button>

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
                                    {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
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
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    type: 'single_product',
                                    targetIds: [product.id],
                                    title: 'Xóa dòng máy này?',
                                    description: `Bạn có chắc muốn xóa "${product.name}" cùng tất cả các biến thể liên quan?`,
                                  })
                                }
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                title="Xóa dòng máy này"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* TẦNG 3: BẢNG BIẾN THỂ (CÓ CỘT XUẤT XỨ RIÊNG BIỆT) */}
                          {isExpanded && (
                            <div className="overflow-x-auto bg-gray-50/40 p-3 pl-10">
                              <div className="bg-white border rounded-lg overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-100/70 text-gray-600 uppercase border-b border-gray-200 text-[10px] font-bold">
                                    <tr>
                                      <th className="py-2.5 px-4 text-center">ẢNH (&gt;1 ẢNH)</th>
                                      <th className="py-2.5 px-4">DUNG LƯỢNG / KÍCH THƯỚC</th>
                                      <th className="py-2.5 px-4">MÀU SẮC</th>
                                      <th className="py-2.5 px-4 text-center">XUẤT XỨ</th>
                                      <th className="py-2.5 px-4 text-right">GIÁ BÁN</th>
                                      <th className="py-2.5 px-4 text-right">GIÁ GỐC</th>
                                      <th className="py-2.5 px-4 text-center">TỒN KHO (NHẬP NHANH)</th>
                                      <th className="py-2.5 px-4 text-center">TRẠNG THÁI</th>
                                      <th className="py-2.5 px-4 text-right">THAO TÁC</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {variants.map((v) => {
                                      const isVn = (v.origin || '').toLowerCase().includes('việt nam') || (v.origin || '').toLowerCase().includes('vn');

                                      return (
                                        <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                                          {/* CỘT 1: ẢNH */}
                                          <td className="py-2 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                              {v.images?.[0] ? (
                                                <img
                                                  src={v.images[0]}
                                                  alt="Variant"
                                                  className="w-9 h-9 object-contain rounded border mx-auto p-0.5 bg-white"
                                                />
                                              ) : (
                                                <div className="w-9 h-9 bg-gray-100 rounded border flex items-center justify-center text-[9px] text-gray-400 mx-auto">
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

                                          {/* CỘT 2: DUNG LƯỢNG THỰC TẾ (128GB, 256GB, 512GB, 1TB...) */}
                                          <td className="py-3 px-4 font-extrabold text-gray-900">
                                            {v.storage || 'Tiêu chuẩn'}
                                          </td>

                                          {/* CỘT 3: MÀU SẮC THỰC TẾ (Lavender, Sage, Black, White...) */}
                                          <td className="py-3 px-4">
                                            <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-800 font-semibold text-xs inline-block">
                                              {v.color || 'Tiêu chuẩn'}
                                            </span>
                                          </td>

                                          {/* CỘT 4: XUẤT XỨ (VIỆT NAM / NHẬP KHẨU) */}
                                          <td className="py-3 px-4 text-center">
                                            <span
                                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                                                isVn
                                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                                              }`}
                                            >
                                              <Globe size={11} />
                                              <span>{v.origin || 'Việt Nam'}</span>
                                            </span>
                                          </td>

                                          {/* CỘT 5: GIÁ BÁN */}
                                          <td className="py-3 px-4 text-right font-black text-emerald-600">
                                            {v.price > 0 ? `${v.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                                          </td>

                                          {/* CỘT 6: GIÁ GỐC */}
                                          <td className="py-3 px-4 text-right text-gray-400 line-through">
                                            {(v.originalPrice || v.price) > 0 ? `${(v.originalPrice || v.price).toLocaleString('vi-VN')} đ` : ''}
                                          </td>

                                          {/* CỘT 7: TỒN KHO */}
                                          <td className="py-3 px-4 text-center">
                                            <input
                                              type="number"
                                              defaultValue={v.stock}
                                              onBlur={(e) =>
                                                handleQuickStockUpdate(v.id, Number(e.target.value))
                                              }
                                              className="w-16 border rounded-md px-1.5 py-1 text-center font-bold text-gray-800 outline-none focus:border-red-500 bg-white"
                                            />
                                          </td>

                                          {/* CỘT 8: TRẠNG THÁI */}
                                          <td className="py-3 px-4 text-center">
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

                                          {/* CỘT 9: THAO TÁC */}
                                          <td className="py-3 px-4 text-right space-x-1">
                                            <button
                                              onClick={() => setEditingVariant({ ...v, images: v.images || [], origin: v.origin || 'Việt Nam' })}
                                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                              title="Sửa biến thể & Quản lý ảnh"
                                            >
                                              <Edit2 size={15} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                setDeleteModal({
                                                  open: true,
                                                  type: 'single_variant',
                                                  targetIds: [v.id],
                                                  title: 'Xóa biến thể cấu hình?',
                                                  description: `Bạn có chắc muốn xóa biến thể "${v.storage} - ${v.color} (${v.origin || 'Việt Nam'})" này không?`,
                                                })
                                              }
                                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                              title="Xóa cấu hình này"
                                            >
                                              <Trash2 size={15} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
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

      {/* MODAL THÔNG BÁO XÁC NHẬN XÓA */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle size={24} />
              </div>
              <button
                onClick={() => setDeleteModal((prev) => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900">{deleteModal.title}</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{deleteModal.description}</p>
              <p className="text-[11px] text-red-600 font-semibold mt-2">
                * Cảnh báo: Thao tác này không thể hoàn tác sau khi đã xóa!
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDeleteModal((prev) => ({ ...prev, open: false }))}
                disabled={loadingAction}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={loadingAction}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                {loadingAction ? 'Đang thực hiện xóa...' : 'Đồng ý Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA BIẾN THỂ & XUẤT XỨ */}
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Xuất Xứ *</label>
                  <select
                    value={editingVariant.origin || 'Việt Nam'}
                    onChange={(e) => setEditingVariant({ ...editingVariant, origin: e.target.value })}
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold bg-white cursor-pointer"
                  >
                    {PRESET_ORIGINS.map((orig) => (
                      <option key={orig} value={orig}>
                        {orig}
                      </option>
                    ))}
                  </select>
                </div>
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

              {/* QUẢN LÝ ẢNH */}
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

      {/* MODAL THÊM CẤU HÌNH BIẾN THỂ */}
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
                <label className="font-bold text-gray-700 block mb-1">Dung Lượng / Kích Thước *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Màu Sắc *</label>
                  <input
                    name="color"
                    type="text"
                    required
                    placeholder="VD: Titan Tự Nhiên"
                    className="w-full border rounded p-2 outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Xuất Xứ *</label>
                  <select
                    name="origin"
                    defaultValue="Việt Nam"
                    className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold bg-white cursor-pointer"
                  >
                    {PRESET_ORIGINS.map((orig) => (
                      <option key={orig} value={orig}>
                        {orig}
                      </option>
                    ))}
                  </select>
                </div>
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

      {/* MODAL ĐĂNG SẢN PHẨM MỚI */}
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
                    className="p-3 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
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
                      placeholder="Màu sắc"
                      value={item.color}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].color = e.target.value;
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white"
                    />
                    <select
                      value={item.origin || 'Việt Nam'}
                      onChange={(e) => {
                        const up = [...variantsList];
                        up[idx].origin = e.target.value;
                        setVariantsList(up);
                      }}
                      className="border p-1.5 rounded bg-white font-bold"
                    >
                      {PRESET_ORIGINS.map((orig) => (
                        <option key={orig} value={orig}>
                          {orig}
                        </option>
                      ))}
                    </select>
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