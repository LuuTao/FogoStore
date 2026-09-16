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
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';
import { InstallmentModal } from '@/components/checkout/InstallmentModal';

const IPHONE_STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatImg = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600';
  }
  const clean = url.trim();
  if (clean.startsWith('http') || clean.startsWith('data:')) {
    if (clean.includes('localhost:')) return clean.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    return clean;
  }
  return `${API_URL}/${clean.replace(/^\//, '')}`;
};

export default function IPhoneDetail({
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

  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'policy' | 'desc' | 'specs'>('policy');
  const [isInstallmentOpen, setIsInstallmentOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    if (!product?.variants) return;

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

    setSelectedColor(firstValidVar?.color || 'Titan Tự Nhiên');

    fetch(`${API_URL}/api/products/filter?category=iphone`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setRelatedProducts(resJson.data.filter((p: any) => p.id !== product.id).slice(0, 5));
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product, urlStorage]);

  const storageList = useMemo(() => {
    if (!product?.variants) return IPHONE_STORAGES;
    const set = new Set<string>();
    product.variants.forEach((v: any) => {
      const st = (v.storage || '').trim().toUpperCase();
      if (st && st !== 'TIÊU CHUẨN') {
        set.add(st);
      }
    });
    const list = Array.from(set);
    const parseSize = (s: string) => {
      const upper = s.toUpperCase();
      const num = parseInt(upper.replace(/[^0-9]/g, '')) || 0;
      if (upper.includes('TB')) return num * 1024 * 1024;
      if (upper.includes('GB')) return num * 1024;
      return num;
    };
    return list.sort((a, b) => parseSize(a) - parseSize(b));
  }, [product]);

  // Nhặt danh sách màu sắc của cấu hình dung lượng đang chọn
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

  // Biến thể khớp dung lượng và màu
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    if (selectedStorage) {
      const exact = product.variants.find(
        (v: any) =>
          (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      );
      if (exact) return exact;
    }

    const sample = product.variants.find(
      (v: any) => v.color.toLowerCase() === selectedColor.toLowerCase()
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

  // Kiểm tra tình trạng hàng: Có giá (> 0) thì luôn sẵn hàng
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
        v.color.toLowerCase() === selectedColor.toLowerCase()
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
    setCurrentImageIndex(0);

    setTimeout(() => {
      setIsImageTransitioning(false);
    }, 250);

    const matched = product.variants.find(
      (v: any) =>
        (!selectedStorage || (v.storage || '').toUpperCase() === selectedStorage.toUpperCase()) &&
        v.color.toLowerCase() === colorName.toLowerCase()
    );

    const nextId = matched ? matched.id : `mock-${selectedStorage.toLowerCase()}-${encodeURIComponent(colorName)}`;

    if (typeof window !== 'undefined') {
      const stPath = selectedStorage ? `-${selectedStorage.toLowerCase()}` : '';
      window.history.replaceState(null, '', `/san-pham/${baseSlug}${stPath}?proid=${nextId}`);
    }
  };

  const imagesList: string[] = useMemo(() => {
    if (currentVariant?.images && currentVariant.images.length > 0) return currentVariant.images;
    return product?.variants?.[0]?.images || ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'];
  }, [currentVariant, product]);

  const displayImage = formatImg(imagesList[currentImageIndex] || imagesList[0]);

  const formatVnd = (num: any) => {
    const parsedNum = Number(num);
    if (!parsedNum || parsedNum <= 0 || isNaN(parsedNum)) {
      return 'Liên hệ';
    }
    return parsedNum.toLocaleString('vi-VN') + 'đ';
  };

  const cleanProductName = product.name
    .replace(/\b(64GB|128GB|256GB|512GB|1TB|2TB|Tiêu chuẩn)\b/gi, '')
    .trim();

  const currentPrice = currentVariant?.price ?? product?.price ?? 0;
  const currentOriginalPrice = currentVariant?.originalPrice ?? product?.originalPrice ?? 0;

  const handleAddToCart = (redirectCart = false) => {
    if (isOutOfStock) return;

    addToCart({
      id: currentVariant.id,
      name: `${cleanProductName} ${selectedStorage}`,
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
          <div className="max-w-[1440px] mx-auto flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/iphone" className="hover:text-[#d70018]">iPhone</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{cleanProductName} {selectedStorage}</span>
          </div>
        </div>

        {/* CONTAINER MỞ RỘNG TỐI ĐA 1440PX */}
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* CỘT 1: HÌNH ẢNH SẢN PHẨM (4/12 cột) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative w-full aspect-square border border-gray-200/80 rounded-2xl p-6 flex items-center justify-center bg-white shadow-xs overflow-hidden">
                <img
                  src={displayImage}
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain pointer-events-none transition-all duration-300 ease-out ${
                    isImageTransitioning ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  }`}
                />
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 mt-4 overflow-x-auto max-w-full pb-1">
                <div className="w-16 h-16 border border-red-500 rounded-xl p-1 flex flex-col items-center justify-center bg-red-50/50 text-[11px] text-[#d70018] shrink-0 cursor-pointer">
                  <Video size={18} />
                  <span className="font-bold">Video</span>
                </div>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsImageTransitioning(true);
                      setCurrentImageIndex(idx);
                      setTimeout(() => setIsImageTransitioning(false), 200);
                    }}
                    className={`w-16 h-16 border rounded-xl p-1 bg-white shrink-0 cursor-pointer transition-all ${
                      currentImageIndex === idx ? 'border-2 border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={formatImg(img)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* CỘT 2: THÔNG TIN MUA HÀNG (5/12 cột) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {cleanProductName} {selectedStorage} - Chính hãng Apple VN
                </h1>
              </div>

              {/* Mức giá */}
              <div className="pt-1">
                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider">Giá bán ưu đãi:</span>
                <div className="flex items-baseline gap-4 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#d70018]">
                    {formatVnd(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && currentPrice > 0 && (
                    <span className="text-base text-gray-400 line-through font-semibold">
                      {formatVnd(currentOriginalPrice)}
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
                <div className="pt-1">
                  <label className="block text-xs font-black text-gray-900 mb-2">
                    Chọn dung lượng:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {storageList.map((st) => {
                      const isSelected = selectedStorage.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          onClick={() => handleSelectStorage(st)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                              : 'border-gray-200 text-gray-800 hover:border-[#d70018]/60 bg-white'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CHỌN MÀU SẮC CÓ ANIMATION MƯỢT */}
              {currentColorOptions.length > 0 && (
                <div className="pt-1">
                  <label className="block text-xs font-black text-gray-900 mb-2">
                    Màu sắc:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentColorOptions.map(({ color, sampleVariant }) => {
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const thumb = sampleVariant?.images?.[0] || imagesList[0];

                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#d70018] text-[#d70018] font-bold bg-red-50/40 shadow-xs scale-102'
                              : 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden p-0.5 border border-gray-200 shrink-0">
                            <img src={formatImg(thumb)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-xs font-semibold">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SỐ LƯỢNG */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-black text-gray-900">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Number(currentVariant?.stock || 99), q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    (Còn sẵn hàng trong kho)
                  </span>
                </div>
              )}

              {/* NÚT MUA HÀNG HOẶC LIÊN HỆ */}
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
                      className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 text-center"
                    >
                      <PhoneCall size={16} />
                      <span>GỌI 056.600.3333</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 border-2 border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 text-center"
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
            </div>

            {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG & BANNER KREDIVO (3/12 cột) */}
            <div className="lg:col-span-3 space-y-4">

              {/* BOX 1: CHÍNH SÁCH BÁN HÀNG & THÔNG TIN THÊM */}
              <div className="border border-gray-200/90 rounded-2xl p-5 bg-white shadow-xs space-y-5">
                <div>
                  <h3 className="font-black text-base text-gray-900 mb-3.5">
                    Chính sách bán hàng
                  </h3>
                  <div className="space-y-3.5 text-xs text-gray-700 font-medium">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>Cam kết 100% chính hãng Apple</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">💵</span>
                      <span>Lên đời trợ giá lên đến 95%</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">🔄</span>
                      <span>Ưu đãi lỗi đổi máy mới 100% trong 12 tháng</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-black text-base text-gray-900 mb-3.5">
                    Thông tin thêm
                  </h3>
                  <div className="space-y-3.5 text-xs text-gray-700 font-medium">
                    <div className="flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 border border-blue-600 text-blue-600 font-black rounded text-[9px] shrink-0 mt-0.5">
                        VISA
                      </span>
                      <span>Trả góp lãi suất 0%, đa dạng hình thức góp</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">🛵</span>
                      <span>Miễn phí giao hàng nội thành TP.HCM</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 bg-red-600 text-white font-black rounded text-[9px] shrink-0 mt-0.5">
                        HOME
                      </span>
                      <span>Giảm đến 500K khi góp qua Home Pay Later</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX 2: BANNER KREDIVO BẰNG LINK ẢNH HSTATIC */}
              <div
                onClick={() => setIsInstallmentOpen(true)}
                className="w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <img
                  src="https://theme.hstatic.net/200000768357/1001357594/14/product_banner.jpg?v=417"
                  alt="Kredivo x Home PayLater - Mua trước trả sau"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300 pointer-events-none"
                />
              </div>

            </div>

          </div>

          {/* KHỐI CHÍNH SÁCH BẢO HÀNH & KHUYẾN MÃI CHI TIẾT */}
          <div className="mt-14 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('policy')}
                className={`pb-3 text-sm font-black transition-all cursor-pointer relative ${
                  activeTab === 'policy'
                    ? 'text-[#d70018] border-b-2 border-[#d70018]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Chính sách bán hàng
              </button>
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 text-sm font-black transition-all cursor-pointer relative ${
                  activeTab === 'desc'
                    ? 'text-[#d70018] border-b-2 border-[#d70018]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-black transition-all cursor-pointer relative ${
                  activeTab === 'specs'
                    ? 'text-[#d70018] border-b-2 border-[#d70018]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Thông số kỹ thuật
              </button>
            </div>

            {activeTab === 'policy' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs text-xs text-gray-700 leading-relaxed space-y-3">
                <h3 className="text-sm font-black text-[#1e3a8a]">
                  Chính Sách Bảo Hành & Khuyến Mãi:
                </h3>
                <ul className="space-y-2 list-disc list-inside font-medium text-gray-700">
                  <li>Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.</li>
                  <li>Tặng 1 lần thay Pin miễn phí trọn đời máy.</li>
                  <li>Giảm giá 150.000đ khi mua kèm Củ sạc nhanh Apple chính hãng.</li>
                  <li>Thu cũ lên đời trợ giá đến 90% - tốt nhất thị trường.</li>
                </ul>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs text-xs text-gray-700 leading-relaxed">
                <p>{product.description || 'Thông tin mô tả sản phẩm đang được cập nhật.'}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs text-xs text-gray-700 leading-relaxed">
                <p>Thông số kỹ thuật chi tiết chuẩn Apple VN/A.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <InstallmentModal
        isOpen={isInstallmentOpen}
        onClose={() => setIsInstallmentOpen(false)}
        productName={`${cleanProductName} ${selectedStorage}`}
        productImage={displayImage}
        productPrice={currentPrice}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
}