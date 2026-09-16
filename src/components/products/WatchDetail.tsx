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
  Watch as WatchIcon,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';
import { InstallmentModal } from '@/components/checkout/InstallmentModal';

const WATCH_SIZES = ['40mm', '41mm', '42mm', '44mm', '45mm', '46mm', '49mm'];

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string; // Đóng vai trò là Size mặt (41mm, 45mm,...)
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatImg = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
  }
  const clean = url.trim();
  if (clean.startsWith('http') || clean.startsWith('data:')) {
    if (clean.includes('localhost:')) return clean.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    return clean;
  }
  return `${API_URL}/${clean.replace(/^\//, '')}`;
};

export default function WatchDetail({
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

  const [selectedSize, setSelectedSize] = useState<string>('');
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

    const defaultSize = product.variants[0]?.storage || product.variants[0]?.size || '45mm';
    const activeSize = (urlStorage || defaultSize).toUpperCase();

    let initVar = null;
    if (initialProId) {
      initVar = product.variants.find((v: any) => String(v.id) === initialProId);
    }
    if (!initVar) {
      initVar =
        product.variants.find(
          (v: any) =>
            ((v.storage || v.size || '').toUpperCase() === activeSize) && Number(v.stock || 0) > 0
        ) ||
        product.variants.find(
          (v: any) => (v.storage || v.size || '').toUpperCase() === activeSize
        ) ||
        product.variants[0];
    }

    setSelectedSize(activeSize);
    if (!selectedColor) {
      setSelectedColor(initVar?.color || product.variants[0]?.color || 'Sport Band');
    }

    // Lấy danh sách Apple Watch liên quan từ DB
    fetch(`${API_URL}/api/products/filter?category=watch`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setRelatedProducts(resJson.data.filter((p: any) => p.id !== product.id).slice(0, 5));
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product, urlStorage, baseSlug, initialProId]);

  // Danh sách kích thước mặt có sẵn
  const sizeList = useMemo(() => {
    if (!product?.variants) return WATCH_SIZES;
    const existing = product.variants
      .map((v: any) => (v.storage || v.size || '').trim())
      .filter(Boolean);
    const merged = Array.from(new Set(existing.length > 0 ? existing : WATCH_SIZES));

    const parseSize = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
    return merged.sort((a, b) => parseSize(a) - parseSize(b));
  }, [product]);

  // Danh sách màu sắc / dây đeo
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

  // Biến thể hiện tại khớp Size và Màu
  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    const exact = product.variants.find(
      (v: any) =>
        (v.storage || v.size || '').toUpperCase() === selectedSize.toUpperCase() &&
        v.color.toLowerCase() === selectedColor.toLowerCase()
    );
    if (exact) return exact;

    const sample = product.variants.find(
      (v: any) => v.color.toLowerCase() === selectedColor.toLowerCase()
    );
    return {
      id: `out-of-stock-${selectedSize.toLowerCase()}-${encodeURIComponent(selectedColor)}`,
      storage: selectedSize,
      color: selectedColor,
      price: sample?.price || product.variants[0]?.price || 0,
      originalPrice: sample?.originalPrice || product.variants[0]?.originalPrice || 0,
      stock: 0,
      images: sample?.images || product.variants[0]?.images || [],
    };
  }, [product, selectedSize, selectedColor]);

  const isOutOfStock = useMemo(() => {
    return !currentVariant || Number(currentVariant.stock || 0) <= 0;
  }, [currentVariant]);

  const sizeStatusMap = useMemo(() => {
    const map: Record<string, { inStock: boolean; displayPrice: number }> = {};
    if (!product?.variants) return map;

    sizeList.forEach((sz) => {
      const match = product.variants.find(
        (v: any) =>
          (v.storage || v.size || '').toUpperCase() === sz.toUpperCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      );
      if (match) {
        map[sz] = {
          inStock: Number(match.stock || 0) > 0,
          displayPrice: match.price || 0,
        };
      } else {
        map[sz] = { inStock: false, displayPrice: 0 };
      }
    });
    return map;
  }, [product, sizeList, selectedColor]);

  // Bấm chọn size: Chuyển URL sang trang mới
  const handleSelectSize = (sz: string) => {
    if (selectedSize.toUpperCase() === sz.toUpperCase()) return;
    const matched =
      product.variants.find(
        (v: any) =>
          (v.storage || v.size || '').toUpperCase() === sz.toUpperCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      ) ||
      product.variants.find(
        (v: any) => (v.storage || v.size || '').toUpperCase() === sz.toUpperCase()
      );

    const proidParam = matched ? `?proid=${matched.id}` : '';
    router.push(`/san-pham/${baseSlug}-${sz.toLowerCase()}${proidParam}`);
  };

  // Bấm chọn màu sắc: Giữ nguyên URL, đổi hình ảnh tại chỗ
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setCurrentImageIndex(0);

    const matched = product.variants.find(
      (v: any) =>
        (v.storage || v.size || '').toUpperCase() === selectedSize.toUpperCase() &&
        v.color.toLowerCase() === colorName.toLowerCase()
    );

    const nextId = matched ? matched.id : `mock-${selectedSize.toLowerCase()}-${encodeURIComponent(colorName)}`;

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/san-pham/${baseSlug}-${selectedSize.toLowerCase()}?proid=${nextId}`);
    }
  };

  const imagesList: string[] = useMemo(() => {
    if (currentVariant?.images && currentVariant.images.length > 0) return currentVariant.images;
    return product?.variants?.[0]?.images || ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'];
  }, [currentVariant, product]);

  const displayImage = formatImg(imagesList[currentImageIndex] || imagesList[0]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const cleanProductName = product.name
    .replace(/\b(40mm|41mm|42mm|44mm|45mm|46mm|49mm)\b/gi, '')
    .trim();

  const currentPrice = currentVariant?.price || product?.price || 8990000;
  const currentOriginalPrice = currentVariant?.originalPrice || product?.originalPrice || Math.round(currentPrice * 1.15);

  const handleAddToCart = (redirectCart = false) => {
    if (!currentVariant || Number(currentVariant.stock || 0) <= 0) return;

    addToCart({
      id: currentVariant.id,
      name: `${cleanProductName} ${selectedSize}`,
      modelSlug: baseSlug,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice || currentVariant.price,
      storage: selectedSize,
      color: selectedColor,
      imageUrl: displayImage,
      quantity: quantity,
    });

    if (redirectCart) {
      router.push('/gio-hang');
    } else {
      setToast({
        show: true,
        message: `Đã thêm ${cleanProductName} (${selectedSize} - ${selectedColor}) vào giỏ hàng thành công!`,
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

        {/* BREADCRUMB - CỠ CHỮ TO HƠN 2 SIZE */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-3 px-4 text-sm text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/watch" className="hover:text-[#d70018]">Apple Watch</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{cleanProductName} {selectedSize}</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ========================================================================= */}
            {/* CỘT 1: HÌNH TO HƠN 2 SIZE, DỜI QUA PHẢI CÂN ĐỐI (lg:col-span-5 + lg:pl-6)  */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col items-center lg:pl-6">
              <div className="relative w-full aspect-square max-w-[550px] border border-gray-100 rounded-2xl p-6 flex items-center justify-center bg-white shadow-xs">
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
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-all"
                      aria-label="Ảnh sau"
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

            {/* ========================================================================= */}
            {/* CỘT 2: THÔNG TIN SẢN PHẨM & MUA HÀNG - TO TOÀN DIỆN THÊM 2 SIZE           */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 space-y-5">
              <div>
                <span className="text-xs font-black tracking-widest text-gray-400 uppercase">
                   Authorized Reseller
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-snug mt-1">
                  {cleanProductName} {selectedSize} - Chính hãng Apple VN
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
                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider">Giá bán:</span>
                <div className="flex items-baseline gap-4 mt-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d70018]">
                    {formatVnd(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && (
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

              {/* CHỌN KÍCH THƯỚC MẶT (SIZE) - ĐỔI URL CHUẨN SANG TRANG MỚI */}
              <div className="pt-2">
                <label className="block text-base font-black text-gray-900 mb-2.5 flex items-center gap-1.5">
                  <WatchIcon size={18} className="text-[#d70018]" />
                  <span>Chọn kích thước mặt (Chuyển phiên bản):</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {sizeList.map((sz) => {
                    const isSelected = selectedSize.toUpperCase() === sz.toUpperCase();
                    const info = sizeStatusMap[sz];
                    const inStock = isSelected ? !isOutOfStock : (info?.inStock ?? false);
                    const displayPrice = isSelected ? currentVariant?.price : (info?.displayPrice ?? 0);

                    return (
                      <button
                        key={sz}
                        onClick={() => handleSelectSize(sz)}
                        className={`relative p-2.5 border rounded-lg text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                            : 'border-gray-300 text-gray-800 hover:border-[#d70018]/60 bg-white'
                        }`}
                      >
                        <span className={`block font-black text-sm ${isSelected ? 'text-[#d70018]' : 'text-gray-900'}`}>
                          {sz}
                        </span>
                        <span className={`block text-[10px] font-medium mt-0.5 ${!inStock ? 'text-[#d70018] font-bold' : 'text-gray-500'}`}>
                          {!inStock ? 'Liên hệ' : formatVnd(displayPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN MÀU SẮC & DÂY ĐEO - ĐỔI TRỰC TIẾP TẠI TRANG (KHÔNG ĐỔI URL) */}
              {allColorOptions.length > 0 && (
                <div className="pt-2">
                  <label className="block text-base font-black text-gray-900 mb-2.5">
                    Màu sắc &amp; Kiểu dây đeo:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {allColorOptions.map(({ color, sampleVariant }) => {
                      const variantForColor = product.variants.find(
                        (v: any) =>
                          (v.storage || v.size || '').toUpperCase() === selectedSize.toUpperCase() &&
                          v.color.toLowerCase() === color.toLowerCase()
                      );
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const inStockThisColor = variantForColor && Number(variantForColor.stock || 0) > 0;
                      const thumb = variantForColor?.images?.[0] || sampleVariant?.images?.[0] || imagesList[0];

                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`relative p-2 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#d70018] text-[#d70018] font-bold bg-red-50/40 shadow-xs'
                              : 'border-gray-300 text-gray-800 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full overflow-hidden p-0.5 border border-gray-200 shrink-0">
                            <img src={formatImg(thumb)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left overflow-hidden min-w-0">
                            <span className={`block font-bold text-xs truncate ${isSelected ? 'text-[#d70018]' : 'text-gray-900'}`}>
                              {color}
                            </span>
                            <span className={`block text-[10px] ${!inStockThisColor ? 'text-[#d70018] font-bold' : 'text-gray-500'}`}>
                              {!inStockThisColor ? 'Liên hệ' : formatVnd(variantForColor?.price || 0)}
                            </span>
                          </div>
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
                    (Còn {currentVariant?.stock || 20} máy trong kho)
                  </span>
                </div>
              )}

              {/* Banner ưu đãi */}
              <div className="bg-gradient-to-r from-[#e056fd] to-[#686de0] text-white p-3.5 rounded-lg flex items-center justify-between text-xs sm:text-sm font-semibold">
                <span>Giảm ngay 150.000đ khi mua thêm Dây đeo thể thao hoặc Dây Milanese</span>
                <span className="bg-[#ffea00] text-gray-900 font-black px-2.5 py-1 rounded shrink-0 ml-2">Ưu đãi</span>
              </div>

              {/* Nút Mua hàng & Thêm giỏ hàng */}
              {isOutOfStock ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm font-bold text-[#d70018]">
                      Phiên bản {cleanProductName} {selectedSize} ({selectedColor}) tạm hết hàng.
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Quý khách vui lòng liên hệ hotline hoặc Zalo để được giữ máy đợt về tiếp theo.
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
                      <span>CHAT ZALO TƯ VẤN</span>
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

              {/* Nút MUA NGAY - TRẢ SAU & Nút chia sẻ */}
              <div className="pt-2 space-y-4">
                <button
                  type="button"
                  onClick={() => setIsInstallmentOpen(true)}
                  className="w-full py-3.5 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded-lg font-black text-sm uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  MUA NGAY - TRẢ SAU
                </button>

                <div className="flex items-center gap-3 pt-1 text-sm text-gray-800 font-bold">
                  <span>Chia sẻ:</span>
                  <div className="flex items-center gap-2.5">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm font-black hover:opacity-90">f</a>
                    <a href="https://m.me" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-sm hover:opacity-90">💬</a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm hover:opacity-90">🐦</a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center hover:opacity-90 cursor-pointer transition-opacity"
                      title="Sao chép liên kết"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG & BANNER KREDIVO                               */}
            {/* ========================================================================= */}
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

                <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3 mt-6 mb-4">
                  Thông tin thêm
                </h3>
                <div className="space-y-4 text-sm text-gray-800 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="px-1.5 py-0.5 border border-blue-600 text-blue-700 font-black text-[10px] rounded">
                      VISA
                    </span>
                    <span>Trả góp lãi suất 0%, đa dạng hình thức góp</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">🛵</span>
                    <span>Miễn phí giao hàng nội thành TP.HCM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded">
                      HOME
                    </span>
                    <span>Giảm đến 500K khi góp qua Home Pay Later</span>
                  </div>
                </div>
              </div>

              {/* Banner Kredivo click mở Modal trả góp */}
              <div
                onClick={() => setIsInstallmentOpen(true)}
                className="block rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-5 border-b border-orange-100 flex flex-col items-center text-center">
                  <div className="text-xs font-black text-orange-600 uppercase tracking-widest">Kredivo × Home PayLater</div>
                  <div className="text-base font-black text-gray-900 mt-1">MUA TRƯỚC TRẢ SAU</div>
                  <div className="flex items-center gap-3 my-2.5">
                    <span className="text-xs font-black text-[#d70018] bg-red-100 px-2.5 py-0.5 rounded">0% Lãi Suất</span>
                    <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded">5 Phút Duyệt</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Đăng ký Online - Không Chứng Minh Thu Nhập</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* TABS CHÍNH SÁCH BÁN HÀNG - MÔ TẢ - BẢNG THÔNG SỐ GRADIENT ĐỎ CHUẨN MẪU     */}
          {/* ========================================================================= */}
          <div className="mt-14 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-8 border-b border-gray-200 text-sm md:text-base font-black uppercase tracking-wide">
              <button
                type="button"
                onClick={() => setActiveTab('policy')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'policy' ? 'border-[#d70018] text-[#d70018]' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Chính sách bán hàng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'desc' ? 'border-[#d70018] text-[#d70018]' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-[#d70018] text-[#d70018]' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Thông số kỹ thuật
              </button>
            </div>

            <div className="py-6 text-sm md:text-base text-gray-800 leading-relaxed">
              {activeTab === 'policy' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-[#1e3a8a] text-base">Chính Sách Bảo Hành & Khuyến Mãi:</h4>
                  <div className="whitespace-pre-line text-sm md:text-base leading-relaxed text-gray-800 bg-gray-50/60 p-5 rounded-xl border border-gray-200 font-medium">
                    {product?.salesPolicy || `• Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm giá 150.000đ khi mua kèm Dây đeo thể thao chính hãng.\n• Thu cũ lên đời trợ giá đến 90% - giá tốt nhất thị trường.`}
                  </div>
                </div>
              )}

              {activeTab === 'desc' && (
                <div className="space-y-3.5 whitespace-pre-line text-sm md:text-base leading-relaxed text-gray-800 font-medium">
                  {product?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>
                      <strong className="text-gray-900">{cleanProductName}</strong> là người bạn đồng hành hoàn hảo cho sức khỏe và cuộc sống hằng ngày với cảm biến đo nhịp tim thế hệ mới, tính năng phát hiện ngã, theo dõi giấc ngủ chuyên sâu cùng màn hình Always-On Retina luôn sáng rõ ngoài trời.
                    </p>
                  )}
                </div>
              )}

              {/* BẢNG THÔNG SỐ KỸ THUẬT GRADIENT ĐỎ CHUẨN FORM */}
              {activeTab === 'specs' && (
                <div className="max-w-4xl overflow-hidden rounded-xl border border-red-500 bg-white shadow-xs">
                  <div className="grid grid-cols-12 bg-gradient-to-r from-[#d70018] to-[#ea580c] text-white font-black text-sm md:text-base uppercase py-4 px-6">
                    <div className="col-span-4 flex items-center gap-2">
                      <span>🔥 ĐẶC ĐIỂM NỔI BẬT</span>
                    </div>
                    <div className="col-span-8">
                      <span>THÔNG SỐ CHÍNH THỨC {cleanProductName} {selectedSize}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200 text-sm md:text-base">
                    {(Array.isArray(product?.specifications) && product.specifications.length > 0
                      ? product.specifications
                      : [
                          { key: 'Màn hình', value: 'Always-On Retina LTPO OLED, độ sáng lên tới 2000 - 3000 nits' },
                          { key: 'Hệ điều hành', value: 'watchOS phiên bản mới nhất tối ưu cảm biến sức khỏe' },
                          { key: 'Vi xử lý', value: 'Chip S9 SiP / S10 SiP (Xử lý thần kinh 4 lõi, Siri trên thiết bị)' },
                          { key: 'Cảm biến sức khỏe', value: 'Điện tâm đồ ECG, đo SpO2, cảm biến nhiệt độ cổ tay, nhịp tim quang học' },
                          { key: 'Tính năng an toàn', value: 'Phát hiện ngã (Fall Detection), Phát hiện va chạm (Crash Detection), SOS' },
                          { key: 'Pin & Sạc', value: 'Thời lượng pin 18 - 36 giờ (Chế độ nguồn điện thấp) | Sạc nhanh không dây' },
                          { key: 'Chống nước', value: 'Chống nước ở độ sâu 50 mét (ISO 22810:2010), đạt chuẩn lặn biển WR100' },
                          { key: 'Màu sắc & Dây', value: selectedColor || 'Tiêu chuẩn' },
                        ]
                    ).map((row: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 p-4 md:p-5 hover:bg-gray-50/80 transition-colors">
                        <div className="col-span-4 font-bold text-gray-900 pr-3">{row.key}</div>
                        <div className="col-span-8 text-gray-700 leading-relaxed font-medium">{row.value || 'Đang cập nhật'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm font-bold text-gray-500 hover:text-[#d70018] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isExpanded ? '— Rút gọn nội dung' : '+ Xem thêm nội dung'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SẢN PHẨM LIÊN QUAN */}
          {relatedProducts.length > 0 && (
            <div className="mt-14 space-y-12">
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
                  <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                    Các Dòng Apple Watch Khác Cùng Quan Tâm
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {relatedProducts.map((rel) => {
                    const v = rel.variants?.[0] || {};
                    const relPrice = Number(v.price || rel.price || 0);

                    return (
                      <div key={rel.id} className="bg-white rounded-lg border border-gray-200 p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group">
                        <Link href={`/san-pham/${rel.slug}`} className="w-full aspect-square flex items-center justify-center overflow-hidden mb-2">
                          <img
                            src={formatImg(v.images?.[0] || rel.imageUrl)}
                            alt={rel.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </Link>
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase">APPLE</span>
                          <Link href={`/san-pham/${rel.slug}`} className="block font-bold text-xs sm:text-sm text-gray-900 hover:text-[#d70018] line-clamp-2 mt-0.5 leading-snug">
                            {rel.name}
                          </Link>
                          <div className="text-sm sm:text-base font-black text-[#d70018] mt-1.5">{formatVnd(relPrice)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push(`/san-pham/${rel.slug}`)}
                          className="w-full mt-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ShoppingCart size={14} />
                          <span>XEM CHI TIẾT</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL MUA NGAY - TRẢ SAU */}
      <InstallmentModal
        isOpen={isInstallmentOpen}
        onClose={() => setIsInstallmentOpen(false)}
        productName={`${cleanProductName} ${selectedSize}`}
        productImage={displayImage}
        productPrice={currentPrice}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
}