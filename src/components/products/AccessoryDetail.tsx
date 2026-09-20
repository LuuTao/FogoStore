'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Video,
  Check,
  ShoppingCart,
  Zap,
  PhoneCall,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Link2,
  Banknote,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';
import { InstallmentModal } from '@/components/checkout/InstallmentModal';

const USED_STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatImg = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600';
  }
  const clean = url.trim();
  if (clean.startsWith('http') || clean.startsWith('data:')) {
    if (clean.includes('localhost:')) return clean.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    return clean;
  }
  return `${API_URL}/${clean.replace(/^\//, '')}`;
};

export default function UsedProductDetail({
  initialProduct,
  currentSlug,
  baseSlug,
  urlStorage,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'desc' | 'policy' | 'specs'>('desc');
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;

    const firstValidVar = product.variants.find((v: any) => {
      const st = (v.storage || '').trim().toUpperCase();
      return st && st !== 'TIÊU CHUẨN';
    }) || product.variants[0];

    const activeSt = (urlStorage || firstValidVar?.storage || '128GB').toUpperCase();
    if (activeSt === 'TIÊU CHUẨN') {
      setSelectedStorage('');
    } else {
      setSelectedStorage(activeSt);
    }

    setSelectedColor(firstValidVar?.color || '');

    // Lấy danh sách máy cũ liên quan từ DB
    fetch(`${API_URL}/api/products/filter?category=hang-cu`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        let items = resJson.success && Array.isArray(resJson.data) ? resJson.data : [];
        if (items.length === 0) {
          return fetch(`${API_URL}/api/products`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => (j.success && Array.isArray(j.data) ? j.data : []));
        }
        return items;
      })
      .then((allItems: any[]) => {
        const filtered = allItems.filter((p: any) => p.id !== product.id);
        const mapped = filtered.map((p: any) => {
          const vars: any[] = Array.isArray(p.variants) ? p.variants : [];
          const bestVar = vars.find((v: any) => Number(v.price) > 0 && Array.isArray(v.images) && v.images.length > 0) || vars[0] || {};

          const realPrice = Number(bestVar.price || p.price || 0);
          const realImage = formatImg(bestVar.images?.[0] || p.images?.[0] || p.imageUrl || p.image);

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            realPrice,
            priceDisplay: realPrice > 0 ? realPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ',
            imageUrl: realImage,
            href: `/san-pham/${p.slug}`,
          };
        });

        const validList = mapped.filter((p: any) => p.realPrice > 0);
        setRelatedProducts(validList.length >= 5 ? validList.slice(0, 5) : mapped.slice(0, 5));
      })
      .catch((err) => {
        console.error('Lỗi khi fetch máy cũ liên quan:', err);
        setRelatedProducts([]);
      });

    // Cập nhật sản phẩm đã xem vào localStorage
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      let viewedList: any[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(viewedList)) viewedList = [];

      const currentItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: formatImg(product.images?.[0] || product.imageUrl || product.variants?.[0]?.images?.[0]),
        currentPrice: product.price ? Number(product.price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ',
        href: `/san-pham/${currentSlug || product.slug}`,
      };

      const updatedViewed = [currentItem, ...viewedList.filter((it: any) => it.id !== product.id)].slice(0, 10);
      localStorage.setItem('fogo_recent_viewed', JSON.stringify(updatedViewed));
      setRecentViewed(updatedViewed.filter((it: any) => it.id !== product.id));
    } catch (e) {
      console.warn('Lỗi đọc recent viewed:', e);
    }
  }, [product, urlStorage, currentSlug]);

  const storageList = useMemo(() => {
    if (!product?.variants) return USED_STORAGES;
    const existing = product.variants.map((v: any) => (v.storage || '').trim()).filter(Boolean);
    const merged = Array.from(new Set([...USED_STORAGES, ...existing]));

    const parseSize = (s: string) => {
      const upper = s.toUpperCase();
      const num = parseInt(upper.replace(/[^0-9]/g, '')) || 0;
      if (upper.includes('TB')) return num * 1024 * 1024;
      if (upper.includes('GB')) return num * 1024;
      return num;
    };
    return merged.sort((a, b) => parseSize(a) - parseSize(b));
  }, [product]);

  const currentColorOptions = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];

    const scopedVariants = selectedStorage
      ? product.variants.filter((v: any) => (v.storage || '').trim().toUpperCase() === selectedStorage.toUpperCase())
      : product.variants;

    const targetList = scopedVariants.length > 0 ? scopedVariants : product.variants;
    const map = new Map<string, any>();

    targetList.forEach((v: any) => {
      const c = (v.color || '').trim();
      if (c && !map.has(c)) {
        map.set(c, v);
      }
    });

    return Array.from(map.entries()).map(([colorName, sampleVariant]) => ({
      color: colorName,
      sampleVariant,
    }));
  }, [product, selectedStorage]);

  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    if (selectedStorage) {
      const exact = product.variants.find(
        (v: any) =>
          (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
          (v.color || '').toLowerCase() === selectedColor.toLowerCase()
      );
      if (exact) return exact;
    }

    const sample = product.variants.find(
      (v: any) => (v.color || '').toLowerCase() === selectedColor.toLowerCase()
    );

    const samplePrice = sample?.price || product.variants[0]?.price || 0;

    return {
      id: sample?.id || `out-of-stock-${selectedStorage.toLowerCase()}-${encodeURIComponent(selectedColor)}`,
      storage: selectedStorage,
      color: selectedColor,
      price: samplePrice,
      originalPrice: sample?.originalPrice || product.variants[0]?.originalPrice || 0,
      stock: samplePrice > 0 ? (sample?.stock > 0 ? sample.stock : 10) : 0,
      images: sample?.images || product.variants[0]?.images || [],
    };
  }, [product, selectedStorage, selectedColor]);

  // ĐÃ SỬA TRIỆT ĐỂ: Chỉ lấy mảng ảnh độc lập của riêng màu đang chọn, hiển thị nhiều ảnh và không bị lặp màu
  const imagesList: string[] = useMemo(() => {
    let list: string[] = [];

    // 1. Tìm chính xác biến thể theo màu sắc và dung lượng đang chọn
    const exactVariant = product?.variants?.find(
      (v: any) => 
        (v.color || '').trim().toLowerCase() === selectedColor.toLowerCase() &&
        (!selectedStorage || (v.storage || '').trim().toUpperCase() === selectedStorage.toUpperCase())
    ) || product?.variants?.find(
      (v: any) => (v.color || '').trim().toLowerCase() === selectedColor.toLowerCase()
    );

    // 2. Lấy toàn bộ ảnh của biến thể đó nếu có
    if (exactVariant) {
      if (Array.isArray(exactVariant.images)) {
        exactVariant.images.forEach((img: string) => {
          if (img && !list.includes(img)) list.push(img);
        });
      }
      if (exactVariant.imageUrl && !list.includes(exactVariant.imageUrl)) {
        list.push(exactVariant.imageUrl);
      }
    }

    // 3. Fallback về ảnh chung của sản phẩm nếu biến thể không có ảnh riêng
    if (list.length === 0) {
      if (product?.images && Array.isArray(product.images)) {
        product.images.forEach((img: string) => {
          if (img && !list.includes(img)) list.push(img);
        });
      } else if (product?.imageUrl && !list.includes(product.imageUrl)) {
        list.push(product.imageUrl);
      }
    }

    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'];
  }, [product, selectedColor, selectedStorage]);

  const displayImage = formatImg(imagesList[currentImageIndex] || imagesList[0]);

  const isOutOfStock = useMemo(() => {
    if (!currentVariant) return true;
    const price = Number(currentVariant.price || 0);
    return price <= 0;
  }, [currentVariant]);

  const handleSelectStorage = (st: string) => {
    if (selectedStorage.toUpperCase() === st.toUpperCase()) return;

    const matched = product?.variants?.find(
      (v: any) =>
        (v.storage || '').toUpperCase() === st.toUpperCase() &&
        (v.color || '').toLowerCase() === selectedColor.toLowerCase()
    ) || product?.variants?.find((v: any) => (v.storage || '').toUpperCase() === st.toUpperCase());

    const cleanBase = (baseSlug || '').toLowerCase().replace(/\/+$/, '').trim();
    const targetStorage = st.toLowerCase().replace(/\//g, '-');
    const proidParam = matched ? `?proid=${matched.id}` : '';

    router.replace(`/san-pham/${cleanBase}-${targetStorage}${proidParam}`);
  };

  const handleSelectColor = (colorName: string) => {
    if (selectedColor.toLowerCase() === colorName.toLowerCase()) return;

    setIsImageTransitioning(true);
    setSelectedColor(colorName);
    setCurrentImageIndex(0); // Luôn đưa về ảnh đầu tiên của màu vừa chọn

    setTimeout(() => {
      setIsImageTransitioning(false);
    }, 150);

    const matched = product?.variants?.find(
      (v: any) => v.color.toLowerCase() === colorName.toLowerCase()
    );

    const nextId = matched ? matched.id : `mock-${selectedStorage.toLowerCase()}-${encodeURIComponent(colorName)}`;

    if (typeof window !== 'undefined') {
      const stPath = selectedStorage ? `-${selectedStorage.toLowerCase()}` : '';
      window.history.replaceState(null, '', `/san-pham/${baseSlug}${stPath}?proid=${nextId}`);
    }
  };

  const formatVnd = (num: any) => {
    const parsedNum = Number(num);
    if (!parsedNum || parsedNum <= 0 || isNaN(parsedNum)) {
      return 'Liên hệ';
    }
    return parsedNum.toLocaleString('vi-VN') + 'đ';
  };

  const cleanProductName = product.name
    .replace(/\b(64GB|128GB|256GB|512GB|1TB|2TB)\b/gi, '')
    .replace(/(cũ|like new|99%|chính hãng vn)/gi, '')
    .trim();

  const currentPrice = currentVariant?.price ?? product?.price ?? 0;
  const currentOriginalPrice = currentVariant?.originalPrice ?? product?.originalPrice ?? 0;

  const formattedDescription = useMemo(() => {
    if (!product?.description) return '';
    return String(product.description)
      .replace(/src="\/\//g, 'src="https://')
      .replace(/src='\/\//g, "src='https://");
  }, [product?.description]);

  const handleAddToCart = (redirectCart = false) => {
    if (isOutOfStock) return;

    addToCart({
      id: currentVariant.id,
      name: `${cleanProductName} ${selectedStorage} (Like New 99%)`,
      modelSlug: baseSlug,
      price: currentPrice,
      originalPrice: currentOriginalPrice || currentPrice,
      storage: selectedStorage,
      color: selectedColor,
      imageUrl: displayImage,
      quantity: quantity,
    });

    if (redirectCart) {
      router.push('/gio-hang');
    } else {
      setToast({
        show: true,
        message: `Đã thêm ${cleanProductName} (${selectedStorage} - ${selectedColor}) vào giỏ hàng!`,
      });
    }
  };

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToast({ show: true, message: 'Đã sao chép liên kết sản phẩm!' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* BREADCRUMB */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-3 px-4 text-xs text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/hang-cu" className="hover:text-[#d70018]">Hàng Cũ Like New</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{cleanProductName} {selectedStorage} (99%)</span>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* CỘT 1: HÌNH ẢNH SẢN PHẨM (4/12 cột) */}
            <div className="lg:col-span-4 flex flex-col items-center w-full">
              <div className="relative w-full aspect-square max-w-[480px] border border-gray-200 rounded-3xl p-3 sm:p-5 flex items-center justify-center bg-white shadow-xs overflow-hidden">
                <img
                  src={displayImage}
                  alt={product.name}
                  className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ease-out ${
                    isImageTransitioning ? 'opacity-20 scale-95' : 'opacity-100 scale-100'
                  }`}
                />
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-2 mt-3.5 overflow-x-auto max-w-full pb-1">
                <div className="w-14 h-14 border border-red-500 rounded-xl p-1 flex flex-col items-center justify-center bg-red-50/50 text-[10px] text-[#d70018] shrink-0 cursor-pointer">
                  <Video size={16} />
                  <span className="font-bold">Video</span>
                </div>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsImageTransitioning(true);
                      setCurrentImageIndex(idx);
                      setTimeout(() => setIsImageTransitioning(false), 150);
                    }}
                    className={`w-14 h-14 border rounded-xl p-0.5 bg-white shrink-0 cursor-pointer transition-all ${
                      currentImageIndex === idx ? 'border-2 border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={formatImg(img)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* CỘT 2: THÔNG TIN MUA HÀNG (5/12 cột) */}
            <div className="lg:col-span-5 space-y-4 w-full">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug break-words">
                  {cleanProductName} {selectedStorage} - Cũ Đẹp 99% Zin Keng
                </h1>
              </div>

              {/* Mức giá */}
              <div className="pt-0.5">
                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider">Giá bán ưu đãi:</span>
                <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#d70018]">
                    {formatVnd(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && currentPrice > 0 && (
                    <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">
                      Máy mới: {formatVnd(currentOriginalPrice)}
                    </span>
                  )}
                  {isOutOfStock ? (
                    <span className="bg-red-50 text-[#d70018] border border-red-200 text-xs font-bold px-2 py-0.5 rounded">
                      Tạm hết hàng
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                      Sẵn hàng
                    </span>
                  )}
                </div>
              </div>

              {/* CHỌN DUNG LƯỢNG */}
              {storageList.length > 0 && (
                <div>
                  <label className="block text-sm sm:text-base font-black text-gray-900 mb-2">
                    Chọn dung lượng:
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    {storageList.map((st) => {
                      const isSelected = selectedStorage.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          onClick={() => handleSelectStorage(st)}
                          className={`min-w-[76px] px-4 py-2.5 text-sm sm:text-base font-black rounded-xl border-2 text-center shrink-0 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#d70018] text-[#d70018] bg-white shadow-xs'
                              : 'border-gray-200 text-gray-800 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CHỌN MÀU SẮC */}
              {currentColorOptions.length > 0 && (
                <div>
                  <label className="block text-sm sm:text-base font-black text-gray-900 mb-2">
                    Màu sắc:
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    {currentColorOptions.map(({ color, sampleVariant }) => {
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const thumb = sampleVariant?.images?.[0] || imagesList[0];

                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#d70018] text-[#d70018] font-black bg-white shadow-xs'
                              : 'border-gray-200 text-gray-800 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden p-0.5 border border-gray-200 shrink-0">
                            <img src={formatImg(thumb)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-sm sm:text-base font-bold whitespace-nowrap">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SỐ LƯỢNG */}
              {!isOutOfStock && (
                <div className="pt-1 flex items-center gap-3">
                  <span className="text-sm sm:text-base font-black text-gray-900">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl px-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center text-sm sm:text-base font-black text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Number(currentVariant?.stock || 99), q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    (Còn sẵn hàng)
                  </span>
                </div>
              )}

              {/* NÚT MUA HÀNG */}
              {isOutOfStock ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-xs font-bold text-[#d70018]">
                      Cấu hình {cleanProductName} ({selectedColor}) hiện đang tạm hết hàng.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:0566003333"
                      className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 text-center"
                    >
                      <PhoneCall size={16} />
                      <span>GỌI 056.600.3333</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 border-2 border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 text-center"
                    >
                      <MessageCircle size={16} />
                      <span>CHAT ZALO</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="py-3 px-3 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded-lg font-black text-xs uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="py-3 px-3 bg-[#d70018] hover:bg-[#b50014] text-white rounded-lg font-black text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Zap size={16} />
                    <span>MUA NGAY</span>
                  </button>
                </div>
              )}

              {/* BỘ NÚT KREDIVO TRẢ SAU & ƯU ĐÃI BAOKIM */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsInstallmentOpen(true)}
                  className="w-full py-3 bg-[#fcee21] hover:bg-[#ebd800] rounded-xl flex flex-col items-center justify-center text-[#1e3a8a] shadow-xs cursor-pointer transition-all active:scale-98 border border-yellow-300"
                >
                  <span className="font-black text-xs sm:text-sm tracking-wide uppercase">
                    MUA NGAY - TRẢ SAU
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-[11px] text-gray-800">qua</span>
                    <span className="font-black text-xs text-[#ea580c] tracking-tight">Kredivo</span>
                  </div>
                </button>

                <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#e5e7eb] py-2 px-3 text-center border-b border-gray-200">
                    <h4 className="text-xs font-black text-gray-800 flex items-center justify-center gap-1.5 flex-wrap">
                      <span>ƯU ĐÃI KHI THANH TOÁN</span>
                      <span className="text-[#ea580c]">Kredivo</span>
                    </h4>
                    <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                      (SỬ DỤNG KHI XÁC NHẬN KHOẢN VAY TRÊN TRANG CỦA TỔ CHỨC TÀI CHÍNH)
                    </p>
                  </div>
                  <div className="p-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Hỗ trợ trả góp linh hoạt 3 - 6 - 12 tháng</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <span className="text-gray-400">Powered by</span>
                      <span className="text-emerald-600 font-black">baokim</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-gray-700">Chia sẻ:</span>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity">f</a>
                  <a href="https://messenger.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#0084ff] text-white flex items-center justify-center hover:opacity-90 transition-opacity"><MessageCircle size={13} /></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#1da1f2] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity">t</a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#bd081c] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity">p</a>
                  <button type="button" onClick={handleCopyUrl} className="w-7 h-7 rounded-full bg-[#0099ff] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer" title="Sao chép liên kết"><Link2 size={13} /></button>
                </div>
              </div>
            </div>

            {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG */}
            <div className="lg:col-span-3 space-y-4 w-full">
              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-xs space-y-5">
                <div>
                  <h3 className="font-black text-base text-gray-900 mb-4">
                    Chính sách bán hàng
                  </h3>
                  <div className="space-y-4 text-[15px] text-gray-800 font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check size={15} strokeWidth={3} />
                      </div>
                      <span className="leading-snug">Cam kết chuẩn zin 100%, nguyên bản Like New</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Banknote size={17} />
                      </div>
                      <span className="leading-snug">Lên đời trợ giá lên đến 95%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <RotateCcw size={16} />
                      </div>
                      <span className="leading-snug">1 Đổi 1 trong 30 ngày nếu phát sinh lỗi</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-black text-base text-gray-900 mb-4">
                    Thông tin thêm
                  </h3>
                  <div className="space-y-4 text-[15px] text-gray-800 font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <span className="px-1 py-0.5 border border-blue-600 text-blue-600 font-black rounded text-[10px] leading-none">VISA</span>
                      </div>
                      <span className="leading-snug">Trả góp lãi suất 0%, đa dạng hình thức góp</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Truck size={17} />
                      </div>
                      <span className="leading-snug">Miễn phí giao hàng nội thành TP.HCM</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <span className="px-1 py-0.5 bg-red-600 text-white font-black rounded text-[9px] leading-none">HOME</span>
                      </div>
                      <span className="leading-snug">Giảm đến 500K khi góp qua Home Pay Later</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BANNER KREDIVO BẰNG LINK ẢNH */}
              <div
                onClick={() => setIsInstallmentOpen(true)}
                className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <img
                  src="https://theme.hstatic.net/200000768357/1001357594/14/product_banner.jpg?v=417"
                  alt="Kredivo x Home PayLater - Mua trước trả sau"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300 pointer-events-none"
                />
              </div>
            </div>

          </div>

          {/* KHỐI 3 TAB LỚN */}
          <div className="mt-14 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-8 sm:gap-12 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 text-lg sm:text-xl md:text-2xl font-black transition-all cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'desc' ? 'text-[#d70018] border-b-2 border-[#d70018]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`pb-3 text-lg sm:text-xl md:text-2xl font-black transition-all cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'policy' ? 'text-[#d70018] border-b-2 border-[#d70018]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Chính sách bán hàng
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-lg sm:text-xl md:text-2xl font-black transition-all cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'specs' ? 'text-[#d70018] border-b-2 border-[#d70018]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Thông số kỹ thuật
              </button>
            </div>

            {activeTab === 'desc' && (
              <div className="w-full bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-xs relative">
                <div className={`max-w-4xl mx-auto relative overflow-hidden transition-all duration-300 ${isDescExpanded ? 'max-h-full pb-6' : 'max-h-[440px]'}`}>
                  {formattedDescription ? (
                    <div
                      className="w-full text-justify text-gray-800 leading-relaxed break-words text-sm sm:text-base 
                                 [&_p]:mb-[1cm] [&_p]:leading-relaxed [&_p]:text-justify
                                 [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:rounded-2xl [&_img]:my-6 [&_img]:object-cover"
                      dangerouslySetInnerHTML={{ __html: formattedDescription }}
                    />
                  ) : (
                    <p className="text-xs text-gray-500 text-center">Thông tin mô tả máy cũ đang được cập nhật.</p>
                  )}
                  {!isDescExpanded && (
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="flex justify-center mt-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="px-8 py-2.5 rounded-full border border-gray-300 hover:border-[#d70018] text-gray-700 hover:text-[#d70018] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-2xs"
                  >
                    {isDescExpanded ? (
                      <><span>— Rút gọn nội dung</span><ChevronUp size={14} /></>
                    ) : (
                      <><span>— Xem thêm nội dung</span><ChevronDown size={14} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
                <h3 className="text-base sm:text-lg font-black text-[#1e3a8a]">
                  Chính Sách Bảo Hành &amp; Khuyến Mãi Máy Cũ:
                </h3>
                <ul className="space-y-2.5 list-disc list-inside font-medium text-gray-700">
                  <li>Lỗi 1 đổi 1 trong 30 ngày toàn diện nếu có lỗi phần cứng từ NSX.</li>
                  <li>Bảo hành phần cứng toàn diện lên đến 12 tháng.</li>
                  <li>Tặng bộ sạc cáp 20W chính hãng và dán cường lực miễn phí trọn đời.</li>
                  <li>Thu cũ lên đời trợ giá đến 95% - cao nhất thị trường.</li>
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-xs text-xs sm:text-sm text-gray-700 leading-relaxed">
                <p>Thông số kỹ thuật nguyên bản chuẩn Apple VN/A.</p>
              </div>
            )}
          </div>

          {/* SẢN PHẨM LIÊN QUAN */}
          {relatedProducts.length > 0 && (
            <div className="mt-14 pt-8 border-t border-gray-200">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                <span>MÁY CŨ KHÁC CÙNG QUAN TÂM</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/san-pham/${rel.slug || rel.id}`}
                    className="bg-white rounded-xl p-3 border border-gray-200 hover:border-[#d70018] hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square flex items-center justify-center p-2">
                      <img src={rel.imageUrl} alt={rel.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#d70018] transition-colors leading-snug">{rel.name}</h4>
                      <span className="text-xs sm:text-sm font-black text-[#d70018] mt-1.5 block">{rel.priceDisplay}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SẢN PHẨM VỪA XEM */}
          {recentViewed.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                <span>SẢN PHẨM BẠN VỪA XEM</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {recentViewed.slice(0, 5).map((viewed) => (
                  <Link
                    key={viewed.id}
                    href={viewed.href || `/san-pham/${viewed.slug || viewed.id}`}
                    className="bg-white rounded-xl p-3 border border-gray-200 hover:border-[#d70018] hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square flex items-center justify-center p-2">
                      <img src={viewed.imageUrl} alt={viewed.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#d70018] transition-colors leading-snug">{viewed.name}</h4>
                      <span className="text-xs sm:text-sm font-black text-[#d70018] mt-2 block">{viewed.currentPrice}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <InstallmentModal
        isOpen={isInstallmentOpen}
        onClose={() => setIsInstallmentOpen(false)}
        productName={`${cleanProductName} ${selectedStorage} (Like New 99%)`}
        productImage={displayImage}
        productPrice={currentPrice}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
}