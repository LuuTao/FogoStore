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
  Star,
  Check,
  Copy,
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
  const initialProId = searchParams?.get('proid') || '';

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Tabs & tương tác
  const [activeTab, setActiveTab] = useState<'policy' | 'desc' | 'specs'>('policy');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

  const allColorOptions = useMemo(() => {
    if (!product?.variants) return [];
    const map = new Map<string, any>();
    product.variants.forEach((v: any) => {
      if (v.color && !map.has(v.color.trim())) {
        map.set(v.color.trim(), v);
      }
    });
    return Array.from(map.entries()).map(([colorName, sampleVariant]) => ({
      color: colorName,
      sampleVariant,
    }));
  }, [product]);

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
    return {
      id: `out-of-stock-${selectedStorage.toLowerCase()}-${encodeURIComponent(selectedColor)}`,
      storage: selectedStorage,
      color: selectedColor,
      price: sample?.price || product.variants[0]?.price || 0,
      originalPrice: sample?.originalPrice || product.variants[0]?.originalPrice || 0,
      stock: 0,
      images: sample?.images || product.variants[0]?.images || [],
    };
  }, [product, selectedStorage, selectedColor]);

  // Kiểm tra hết hàng (stock <= 0)
  const isOutOfStock = useMemo(() => {
    return !currentVariant || Number(currentVariant.stock || 0) <= 0;
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
    setSelectedColor(colorName);
    setCurrentImageIndex(0);

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

  // Hàm định dạng giá tiền chuẩn: Tự động hiển thị "Liên hệ" nếu giá <= 0 hoặc không hợp lệ
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
    if (!currentVariant || Number(currentVariant.stock || 0) <= 0) return;

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
        message: `Đã thêm ${cleanProductName} (${selectedStorage} - ${selectedColor}) vào giỏ hàng thành công!`,
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-3 px-4 text-sm text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/iphone" className="hover:text-[#d70018]">iPhone</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{cleanProductName} {selectedStorage}</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT 1: HÌNH ẢNH */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative w-full aspect-square border border-gray-100 rounded-2xl p-6 flex items-center justify-center bg-white shadow-xs">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
                />
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
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
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 border rounded-xl p-1 bg-white shrink-0 cursor-pointer transition-all ${
                      currentImageIndex === idx ? 'border-2 border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={formatImg(img)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* CỘT 2: THÔNG TIN & MUA HÀNG */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-black tracking-widest text-gray-400 uppercase">
                   Authorized Reseller
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-snug mt-1">
                  {cleanProductName} {selectedStorage} - Chính hãng Apple VN
                </h1>
                <div className="flex items-center gap-1.5 text-amber-400 text-base mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400" />
                  ))}
                  <span className="text-gray-500 text-sm ml-2 font-medium">(Đánh giá 5 sao chuẩn Apple VN/A)</span>
                </div>
              </div>

              {/* Mức giá */}
              <div className="pt-1">
                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider">Giá bán ưu đãi:</span>
                <div className="flex items-baseline gap-4 mt-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d70018]">
                    {formatVnd(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && currentPrice > 0 && (
                    <span className="text-lg text-gray-400 line-through font-semibold">
                      {formatVnd(currentOriginalPrice)}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-50 text-[#d70018] border border-red-200 text-xs font-bold px-2.5 py-1 rounded">
                      Tạm hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* CHỌN DUNG LƯỢNG */}
              {storageList.length > 0 && (
                <div className="pt-2">
                  <label className="block text-base font-black text-gray-900 mb-2.5">
                    Chọn dung lượng:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {storageList.map((st) => {
                      const isSelected = selectedStorage.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          onClick={() => handleSelectStorage(st)}
                          className={`px-5 py-2.5 text-base font-bold rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                              : 'border-gray-300 text-gray-800 hover:border-[#d70018]/60 bg-white'
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
              {allColorOptions.length > 0 && (
                <div className="pt-2">
                  <label className="block text-base font-black text-gray-900 mb-2.5">
                    Màu sắc:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {allColorOptions.map(({ color, sampleVariant }) => {
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const thumb = sampleVariant?.images?.[0] || imagesList[0];

                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`px-3.5 py-2 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#d70018] text-[#d70018] font-bold bg-red-50/40 shadow-xs'
                              : 'border-gray-300 text-gray-800 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden p-0.5 border border-gray-200">
                            <img src={formatImg(thumb)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-sm font-bold">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Số lượng */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-4">
                  <span className="text-base font-black text-gray-900">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-12 text-center text-base font-black text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Number(currentVariant?.stock || 99), q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    (Còn {currentVariant?.stock || 0} sản phẩm trong kho)
                  </span>
                </div>
              )}

              {/* Nút Mua hàng / Hết hàng */}
              {isOutOfStock ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm font-bold text-[#d70018]">
                      Cấu hình {cleanProductName} ({selectedColor}) hiện đang tạm hết hàng.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:0566003333"
                      className="w-full py-3.5 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-lg shadow flex items-center justify-center gap-2 text-center"
                    >
                      <PhoneCall size={18} />
                      <span>GỌI 056.600.3333</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 border-2 border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 text-center"
                    >
                      <MessageCircle size={18} />
                      <span>CHAT ZALO</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="py-3.5 px-3 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded-lg font-black text-sm uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="py-3.5 px-3 bg-[#d70018] hover:bg-[#b50014] text-white rounded-lg font-black text-sm uppercase tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    <span>MUA NGAY</span>
                  </button>
                </div>
              )}

              {/* MUA NGAY - TRẢ SAU */}
              <div className="pt-2 space-y-4">
                <button
                  type="button"
                  onClick={() => setIsInstallmentOpen(true)}
                  className="w-full py-3.5 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded-lg font-black text-sm uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  MUA NGAY - TRẢ SAU
                </button>
              </div>
            </div>

            {/* CỘT 3: CHÍNH SÁCH */}
            <div className="lg:col-span-3 space-y-5">
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs">
                <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3 mb-4">
                  Chính sách bán hàng
                </h3>
                <div className="space-y-4 text-sm text-gray-800 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span>Cam kết 100% chính hãng Apple</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">💵</span>
                    <span>Lên đời trợ giá lên đến 95%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">🔄</span>
                    <span>Ưu đãi lỗi đổi máy mới 100% trong 12 tháng</span>
                  </div>
                </div>
              </div>
            </div>

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