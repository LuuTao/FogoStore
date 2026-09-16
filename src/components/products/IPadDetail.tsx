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

const IPAD_STORAGES = ['128GB', '256GB', '512GB', '1TB', '2TB'];

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatImg = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600';
  }
  const clean = url.trim();
  if (clean.startsWith('http') || clean.startsWith('data:')) {
    if (clean.includes('localhost:')) return clean.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    return clean;
  }
  return `${API_URL}/${clean.replace(/^\//, '')}`;
};

export default function IPadDetail({
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

    const activeSt = (urlStorage || product.variants[0]?.storage || '128GB').toUpperCase();

    let initVar = null;
    if (initialProId) {
      initVar = product.variants.find((v: any) => String(v.id) === initialProId);
    }
    if (!initVar) {
      initVar =
        product.variants.find(
          (v: any) => (v.storage || '').toUpperCase() === activeSt && Number(v.stock || 0) > 0
        ) ||
        product.variants.find((v: any) => (v.storage || '').toUpperCase() === activeSt) ||
        product.variants[0];
    }

    setSelectedStorage(activeSt);
    if (!selectedColor) {
      setSelectedColor(initVar?.color || product.variants[0]?.color || 'Space Black');
    }

    // Lấy danh sách iPad liên quan từ DB
    fetch(`${API_URL}/api/products/filter?category=ipad`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setRelatedProducts(resJson.data.filter((p: any) => p.id !== product.id).slice(0, 5));
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product, urlStorage, baseSlug, initialProId]);

  // Danh sách dung lượng thực tế
  const storageList = useMemo(() => {
    if (!product?.variants) return IPAD_STORAGES;
    const existing = product.variants.map((v: any) => (v.storage || '').trim()).filter(Boolean);
    const merged = Array.from(new Set([...IPAD_STORAGES, ...existing]));

    const parseSize = (s: string) => {
      const upper = s.toUpperCase();
      const num = parseInt(upper.replace(/[^0-9]/g, '')) || 0;
      if (upper.includes('TB')) return num * 1024 * 1024;
      if (upper.includes('GB')) return num * 1024;
      return num;
    };
    return merged.sort((a, b) => parseSize(a) - parseSize(b));
  }, [product]);

  // Danh sách màu sắc thực tế
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

  // Biến thể khớp dung lượng và màu
  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    const exact = product.variants.find(
      (v: any) =>
        (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
        v.color.toLowerCase() === selectedColor.toLowerCase()
    );
    if (exact) return exact;

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

  const isOutOfStock = useMemo(() => {
    return !currentVariant || Number(currentVariant.stock || 0) <= 0;
  }, [currentVariant]);

  const storageStatusMap = useMemo(() => {
    const map: Record<string, { inStock: boolean; displayPrice: number }> = {};
    if (!product?.variants) return map;

    storageList.forEach((st) => {
      const match = product.variants.find(
        (v: any) =>
          (v.storage || '').toUpperCase() === st.toUpperCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      );
      if (match) {
        map[st] = {
          inStock: Number(match.stock || 0) > 0,
          displayPrice: match.price || 0,
        };
      } else {
        map[st] = { inStock: false, displayPrice: 0 };
      }
    });
    return map;
  }, [product, storageList, selectedColor]);

  // Bấm dung lượng: chuyển URL sang trang mới
  const handleSelectStorage = (st: string) => {
    if (selectedStorage.toUpperCase() === st.toUpperCase()) return;
    const matched = product.variants.find(
      (v: any) =>
        (v.storage || '').toUpperCase() === st.toUpperCase() &&
        v.color.toLowerCase() === selectedColor.toLowerCase()
    ) || product.variants.find((v: any) => (v.storage || '').toUpperCase() === st.toUpperCase());

    const proidParam = matched ? `?proid=${matched.id}` : '';
    router.push(`/san-pham/${baseSlug}-${st.toLowerCase()}${proidParam}`);
  };

  // Bấm màu sắc: giữ nguyên trang
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setCurrentImageIndex(0);

    const matched = product.variants.find(
      (v: any) =>
        (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
        v.color.toLowerCase() === colorName.toLowerCase()
    );

    const nextId = matched ? matched.id : `mock-${selectedStorage.toLowerCase()}-${encodeURIComponent(colorName)}`;

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/san-pham/${baseSlug}-${selectedStorage.toLowerCase()}?proid=${nextId}`);
    }
  };

  const imagesList: string[] = useMemo(() => {
    if (currentVariant?.images && currentVariant.images.length > 0) return currentVariant.images;
    return product?.variants?.[0]?.images || ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'];
  }, [currentVariant, product]);

  const displayImage = formatImg(imagesList[currentImageIndex] || imagesList[0]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const cleanProductName = product.name.replace(/\b(64GB|128GB|256GB|512GB|1TB|2TB)\b/gi, '').trim();

  const currentPrice = currentVariant?.price || product?.price || 21990000;
  const currentOriginalPrice = currentVariant?.originalPrice || product?.originalPrice || Math.round(currentPrice * 1.15);

  const handleAddToCart = (redirectCart = false) => {
    if (!currentVariant || Number(currentVariant.stock || 0) <= 0) return;

    addToCart({
      id: currentVariant.id,
      name: `${cleanProductName} ${selectedStorage}`,
      modelSlug: baseSlug,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice || currentVariant.price,
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

        {/* BREADCRUMB - CỠ CHỮ GỌN GÀNG NHƯ CŨ */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2 px-4 text-xs text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/ipad" className="hover:text-[#d70018]">iPad</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">{cleanProductName} {selectedStorage}</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ========================================================================= */}
            {/* CỘT 1: HÌNH ẢNH SẢN PHẨM                                                 */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-square border border-gray-200 rounded-sm p-4 flex items-center justify-center bg-white shadow-2xs">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-200 hover:scale-105"
                />
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
                <div className="w-14 h-14 border border-red-500 rounded-sm p-1 flex flex-col items-center justify-center bg-red-50/50 text-[10px] text-[#d70018] shrink-0 cursor-pointer">
                  <Video size={16} />
                  <span className="font-bold scale-90">Video</span>
                </div>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-14 h-14 border rounded-sm p-1 bg-white shrink-0 cursor-pointer transition-all ${
                      currentImageIndex === idx ? 'border-2 border-[#d70018] shadow-xs' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={formatImg(img)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CỘT 2: THÔNG TIN CHI TIẾT & TÁC VỤ MUA HÀNG (CỠ CHỮ CHUẨN GỌN NHƯ CŨ)     */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-xs uppercase">
                   Authorized Reseller
                </span>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug mt-1">
                  {cleanProductName} {selectedStorage} - Chính hãng Apple VN
                </h1>
                <div className="flex items-center gap-1 text-amber-400 text-sm mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400" />
                  ))}
                  <span className="text-gray-500 text-xs ml-1 font-medium">(Đánh giá 5 sao chuẩn Apple VN/A)</span>
                </div>
              </div>

              {/* Mức giá */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block text-[11px]">Giá bán:</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl md:text-3xl font-black text-[#d70018]">
                    {formatVnd(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatVnd(currentOriginalPrice)}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-50 text-[#d70018] border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-xs ml-2">
                      Tạm hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* CHỌN DUNG LƯỢNG - ĐỔI URL CHUẨN */}
              <div className="pt-1">
                <label className="block font-bold text-gray-800 mb-1.5">
                  Chọn dung lượng (Chuyển phiên bản):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {storageList.map((st) => {
                    const isSelected = selectedStorage.toUpperCase() === st.toUpperCase();
                    const info = storageStatusMap[st];
                    const inStock = isSelected ? !isOutOfStock : (info?.inStock ?? false);
                    const displayPrice = isSelected ? currentVariant?.price : (info?.displayPrice ?? 0);

                    return (
                      <button
                        key={st}
                        onClick={() => handleSelectStorage(st)}
                        className={`relative p-2 border rounded-sm text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#d70018] bg-white shadow-2xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className={`block font-black text-xs ${isSelected ? 'text-[#d70018]' : 'text-gray-800'}`}>
                          {st}
                        </span>
                        <span className={`block text-[10px] font-medium mt-0.5 ${!inStock ? 'text-[#d70018] font-bold' : 'text-gray-500'}`}>
                          {!inStock ? 'Liên hệ' : formatVnd(displayPrice)}
                        </span>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#d70018] text-white flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN MÀU SẮC - ĐỔI TRỰC TIẾP TẠI TRANG */}
              {allColorOptions.length > 0 && (
                <div className="pt-1">
                  <label className="block font-bold text-gray-800 mb-1.5">Màu sắc:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allColorOptions.map(({ color, sampleVariant }) => {
                      const variantForColor = product.variants.find(
                        (v: any) =>
                          (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
                          v.color.toLowerCase() === color.toLowerCase()
                      );
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const inStockThisColor = variantForColor && Number(variantForColor.stock || 0) > 0;
                      const thumb = variantForColor?.images?.[0] || sampleVariant?.images?.[0] || imagesList[0];

                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`relative p-1.5 border rounded-sm flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#d70018] bg-white shadow-2xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="w-7 h-7 shrink-0 border border-gray-100 rounded-xs p-0.5 bg-gray-50 flex items-center justify-center">
                            <img src={formatImg(thumb)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left overflow-hidden min-w-0">
                            <span className={`block font-bold text-[11px] truncate ${isSelected ? 'text-[#d70018]' : 'text-gray-800'}`}>
                              {color}
                            </span>
                            <span className={`block text-[10px] ${!inStockThisColor ? 'text-[#d70018] font-bold' : 'text-gray-500'}`}>
                              {!inStockThisColor ? 'Liên hệ' : formatVnd(variantForColor?.price || 0)}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#d70018] text-white flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Số lượng */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="font-semibold text-gray-700">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-xs overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-gray-900 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Number(currentVariant?.stock || 99), q + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500">(Còn {currentVariant?.stock || 20} máy trong kho)</span>
                </div>
              )}

              {/* Banner ưu đãi */}
              <div className="bg-[#fff1f2] border border-[#ffccd2] rounded-sm p-3 flex items-center justify-between text-xs font-semibold text-[#d70018]">
                <span>Giảm thêm 300.000đ khi mua kèm Apple Pencil & Magic Keyboard</span>
                <span className="bg-[#d70018] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs shrink-0 ml-2">Ưu đãi</span>
              </div>

              {/* Nút Mua hàng & Thêm giỏ hàng */}
              {isOutOfStock ? (
                <div className="pt-1 space-y-2">
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-sm text-center">
                    <p className="text-xs font-bold text-[#d70018]">
                      Cấu hình {cleanProductName} {selectedStorage} ({selectedColor}) tạm hết hàng.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:0566003333"
                      className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-[11px] uppercase rounded-sm shadow flex items-center justify-center gap-1.5 text-center"
                    >
                      <PhoneCall size={14} />
                      <span>GỌI HOTLINE</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 border border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-[11px] uppercase rounded-sm flex items-center justify-center gap-1.5 text-center"
                    >
                      <MessageCircle size={14} />
                      <span>CHAT ZALO</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="py-2.5 px-2 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded-sm font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={15} />
                    <span>THÊM GIỎ HÀNG</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="py-2.5 px-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-sm font-black text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Zap size={15} />
                    <span>MUA NGAY</span>
                  </button>
                </div>
              )}

              {/* Nút MUA NGAY - TRẢ SAU & Chia sẻ */}
              <div className="pt-1 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsInstallmentOpen(true)}
                  className="w-full py-2.5 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded-sm font-black text-xs uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  MUA NGAY - TRẢ SAU
                </button>

                <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-700 font-bold">
                  <span>Chia sẻ:</span>
                  <div className="flex items-center gap-2">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black hover:opacity-90">f</a>
                    <a href="https://m.me" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-xs hover:opacity-90">💬</a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-xs hover:opacity-90">🐦</a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center hover:opacity-90 cursor-pointer"
                      title="Sao chép liên kết"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG & BANNER KREDIVO                               */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-xs">
                <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5 mb-3">
                  Chính sách bán hàng
                </h3>
                <div className="space-y-3.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>Cam kết 100% chính hãng Apple</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base shrink-0">💵</span>
                    <span>Lên đời trợ giá lên đến 95%</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base shrink-0">🔄</span>
                    <span>Ưu đãi lỗi đổi máy mới 100% trong 12 tháng</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5 mt-5 mb-3">
                  Thông tin thêm
                </h3>
                <div className="space-y-3.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2.5">
                    <span className="px-1 py-0.5 border border-blue-600 text-blue-700 font-bold text-[9px] rounded">
                      VISA
                    </span>
                    <span>Trả góp lãi suất 0%, đa dạng hình thức góp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base shrink-0">🛵</span>
                    <span>Miễn phí giao hàng nội thành TP.HCM</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-1 py-0.5 bg-red-600 text-white font-bold text-[8px] rounded">
                      HOME
                    </span>
                    <span>Giảm đến 500K khi góp qua Home Pay Later</span>
                  </div>
                </div>
              </div>

              {/* Banner Kredivo click mở Modal trả góp */}
              <div
                onClick={() => setIsInstallmentOpen(true)}
                className="block rounded-lg overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 border-b border-orange-100 flex flex-col items-center text-center">
                  <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Kredivo × Home PayLater</div>
                  <div className="text-sm font-black text-gray-900 mt-1">MUA TRƯỚC TRẢ SAU</div>
                  <div className="flex items-center gap-3 my-2">
                    <span className="text-xs font-black text-[#d70018] bg-red-100 px-2 py-0.5 rounded">0% Lãi Suất</span>
                    <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded">5 Phút Duyệt</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Đăng ký Online - Không Chứng Minh Thu Nhập</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* TABS CHÍNH SÁCH BÁN HÀNG - MÔ TẢ - BẢNG THÔNG SỐ GRADIENT ĐỎ               */}
          {/* ========================================================================= */}
          <div className="mt-14 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-8 border-b border-gray-200 text-xs md:text-sm font-bold uppercase tracking-wide">
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

            <div className="py-6 text-xs md:text-sm text-gray-700 leading-relaxed">
              {activeTab === 'policy' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-[#1e3a8a] text-sm">Chính Sách Bảo Hành & Khuyến Mãi:</h4>
                  <div className="whitespace-pre-line text-xs md:text-sm leading-relaxed text-gray-800 bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                    {product?.salesPolicy || `• Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm giá 150.000đ khi mua kèm Củ sạc nhanh Apple chính hãng.\n• Thu cũ lên đời trợ giá đến 90% - tốt nhất thị trường.`}
                  </div>
                </div>
              )}

              {activeTab === 'desc' && (
                <div className="space-y-3 whitespace-pre-line text-xs md:text-sm leading-relaxed text-gray-800">
                  {product?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>
                      <strong className="text-gray-900">{cleanProductName}</strong> là chiếc máy tính bảng hoàn hảo cho công việc sáng tạo, học tập và giải trí với vi xử lý Apple Silicon thế hệ mới, màn hình chuẩn đồ họa và hệ điều hành iPadOS tối ưu cho đa nhiệm.
                    </p>
                  )}
                </div>
              )}

              {/* BẢNG THÔNG SỐ KỸ THUẬT GRADIENT ĐỎ */}
              {activeTab === 'specs' && (
                <div className="max-w-4xl overflow-hidden rounded-xl border border-red-500 bg-white shadow-xs">
                  <div className="grid grid-cols-12 bg-gradient-to-r from-[#d70018] to-[#ea580c] text-white font-black text-xs md:text-sm uppercase py-3.5 px-5">
                    <div className="col-span-4 flex items-center gap-1.5">
                      <span>🔥 ĐẶC ĐIỂM NỔI BẬT</span>
                    </div>
                    <div className="col-span-8">
                      <span>THÔNG SỐ CHÍNH THỨC {cleanProductName} {selectedStorage}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200 text-xs md:text-sm">
                    {(Array.isArray(product?.specifications) && product.specifications.length > 0
                      ? product.specifications
                      : [
                          { key: 'Màn hình', value: 'Ultra Retina XDR OLED / Liquid Retina sắc nét, công nghệ ProMotion 120Hz' },
                          { key: 'Hệ điều hành', value: 'iPadOS phiên bản mới nhất tối ưu đa nhiệm Split View & Stage Manager' },
                          { key: 'Vi xử lý', value: 'Chip Apple Silicon M-Series thế hệ mới mạnh mẽ' },
                          { key: 'Camera sau', value: '12MP Wide, quay video 4K ProRes chuẩn điện ảnh' },
                          { key: 'Camera trước', value: '12MP Ultra Wide Center Stage đặt cạnh ngang góc siêu rộng' },
                          { key: 'Pin & Sạc', value: 'Thời lượng pin lướt web cả ngày dài | Cổng Thunderbolt / USB 4 sạc nhanh' },
                          { key: 'Thiết kế & Độ bền', value: 'Khung vỏ nhôm nguyên khối tái chế 100%, thiết kế siêu mỏng nhẹ' },
                          { key: 'Màu sắc', value: selectedColor || 'Tiêu chuẩn' },
                        ]
                    ).map((row: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 p-3.5 md:p-4 hover:bg-gray-50/70 transition-colors">
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
                  className="text-xs font-bold text-gray-500 hover:text-[#d70018] flex items-center gap-1 cursor-pointer transition-colors"
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
                  <h3 className="text-base md:text-lg font-black text-gray-900 uppercase tracking-wide">
                    Các Dòng iPad Khác Cùng Quan Tâm
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {relatedProducts.map((rel) => {
                    const v = rel.variants?.[0] || {};
                    const relPrice = Number(v.price || rel.price || 0);

                    return (
                      <div key={rel.id} className="bg-white rounded border border-gray-200 p-3 flex flex-col justify-between hover:shadow-lg transition-all group">
                        <Link href={`/san-pham/${rel.slug}`} className="w-full aspect-square flex items-center justify-center overflow-hidden mb-2">
                          <img
                            src={formatImg(v.images?.[0] || rel.imageUrl)}
                            alt={rel.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </Link>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">APPLE</span>
                          <Link href={`/san-pham/${rel.slug}`} className="block font-bold text-xs text-gray-900 hover:text-[#d70018] line-clamp-2 mt-0.5 leading-snug">
                            {rel.name}
                          </Link>
                          <div className="text-xs font-black text-[#d70018] mt-1.5">{formatVnd(relPrice)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push(`/san-pham/${rel.slug}`)}
                          className="w-full mt-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <ShoppingCart size={12} />
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
        productName={`${cleanProductName} ${selectedStorage}`}
        productImage={displayImage}
        productPrice={currentPrice}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
}