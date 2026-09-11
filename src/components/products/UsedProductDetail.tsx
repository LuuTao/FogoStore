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
  FileText,
  Sparkles,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  BatteryCharging,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

const USED_STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string;
}

export default function UsedProductDetail({
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
      setSelectedColor(initVar?.color || product.variants[0]?.color || '');
    }

    // Lấy danh sách máy cũ liên quan
    fetch(`http://localhost:5000/api/products/filter?category=hang-cu`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setRelatedProducts(resJson.data.filter((p: any) => p.id !== product.id).slice(0, 5));
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product, urlStorage, baseSlug, initialProId]);

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
    return product?.variants?.[0]?.images || ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'];
  }, [currentVariant, product]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const handleAddToCart = (redirectCart = false) => {
    if (!currentVariant || Number(currentVariant.stock || 0) <= 0) return;

    addToCart({
      id: currentVariant.id,
      name: `${cleanProductName} ${selectedStorage} (Like New 99%)`,
      modelSlug: baseSlug,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice || currentVariant.price,
      storage: selectedStorage,
      color: selectedColor,
      imageUrl: imagesList[currentImageIndex] || imagesList[0],
      quantity: quantity,
    });

    if (redirectCart) {
      router.push('/gio-hang');
    } else {
      setToast({
        show: true,
        message: `Đã thêm ${cleanProductName} vào giỏ hàng thành công!`,
      });
    }
  };

  const cleanProductName = product.name
    .replace(/\b(64GB|128GB|256GB|512GB|1TB|2TB)\b/gi, '')
    .replace(/(cũ|like new|99%|chính hãng vn)/gi, '')
    .trim();

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

        {/* Breadcrumb Hàng Cũ */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2 px-4 text-[11px] text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/hang-cu" className="hover:text-[#d70018]">Hàng Cũ Like New</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{cleanProductName} {selectedStorage} (99%)</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery ảnh máy cũ */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-square border border-gray-200 rounded-sm p-4 flex items-center justify-center bg-white">
                <img
                  src={imagesList[currentImageIndex] || imagesList[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-all duration-200"
                />
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + imagesList.length) % imagesList.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % imagesList.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                <div className="w-14 h-14 border border-red-500 rounded-sm p-1 flex flex-col items-center justify-center bg-red-50/50 text-[10px] text-[#d70018] shrink-0 cursor-pointer">
                  <Video size={16} />
                  <span className="font-bold scale-90">Video</span>
                </div>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-14 h-14 border p-1 rounded-sm bg-white shrink-0 cursor-pointer transition-all ${
                      currentImageIndex === idx ? 'border-2 border-[#d70018] shadow-xs' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chi tiết máy cũ */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#d70018] bg-red-50 border border-red-200 px-2 py-0.5 rounded-xs">
                    Like New 99%
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-xs">
                     Nguyên Bản Chuẩn Zin
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug mt-1.5">
                  {cleanProductName} {selectedStorage} - Cũ Đẹp 99% Zin Keng
                </h1>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <span className="text-[11px] text-gray-400 ml-1">(Đã qua kiểm định 32 bước)</span>
                </div>
              </div>

              {/* Khung Giá bán */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block text-[11px]">Giá tiết kiệm</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl md:text-3xl font-black text-[#d70018]">
                    {formatVnd(currentVariant?.price || 0)}
                  </span>
                  {currentVariant?.originalPrice > currentVariant?.price && (
                    <span className="text-xs text-gray-400 line-through">
                      Máy mới: {formatVnd(currentVariant.originalPrice)}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-50 text-[#d70018] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-xs ml-2">
                      Tạm hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* Dung lượng */}
              <div className="space-y-1.5 pt-2">
                <span className="font-semibold text-gray-700">Chọn dung lượng:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          isSelected ? 'border-[#d70018] bg-white shadow-2xs' : 'border-gray-200 hover:border-gray-300 bg-white'
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

              {/* Màu sắc */}
              <div className="space-y-1.5 pt-2">
                <span className="font-semibold text-gray-700">Màu sắc:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allColorOptions.map(({ color, sampleVariant }) => {
                    const variantForColor = product.variants.find(
                      (v: any) =>
                        (v.storage || '').toUpperCase() === selectedStorage.toUpperCase() &&
                        v.color.toLowerCase() === color.toLowerCase()
                    );
                    const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                    const inStockThisColor = variantForColor && Number(variantForColor.stock || 0) > 0;
                    const displayImg = variantForColor?.images?.[0] || sampleVariant?.images?.[0] || imagesList[0];

                    return (
                      <button
                        key={color}
                        onClick={() => handleSelectColor(color)}
                        className={`relative p-1.5 border rounded-sm flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected ? 'border-[#d70018] bg-white shadow-2xs' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 shrink-0 border border-gray-100 rounded-xs p-0.5 bg-gray-50 flex items-center justify-center">
                          <img src={displayImg} alt={color} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <span className={`block font-bold text-[11px] truncate ${isSelected ? 'text-[#d70018]' : 'text-gray-800'}`}>
                            {color}
                          </span>
                          <span className={`block text-[10px] font-medium ${!inStockThisColor ? 'text-[#d70018] font-bold' : 'text-gray-500'}`}>
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

              {/* 3 Cam kết tiêu chuẩn hàng cũ tại Fogo Store */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-gray-700">
                <div className="border border-gray-200 p-2 rounded-xs flex flex-col items-center text-center bg-[#fafafa]">
                  <BatteryCharging size={16} className="text-[#00a859] mb-1" />
                  <span className="font-bold">Pin Zin &gt; 85%</span>
                  <span className="text-gray-400 scale-90">Hỗ trợ thay pin giá gốc</span>
                </div>
                <div className="border border-gray-200 p-2 rounded-xs flex flex-col items-center text-center bg-[#fafafa]">
                  <ShieldCheck size={16} className="text-[#0066cc] mb-1" />
                  <span className="font-bold">Bảo hành 12 tháng</span>
                  <span className="text-gray-400 scale-90">Toàn diện nguồn &amp; màn</span>
                </div>
                <div className="border border-gray-200 p-2 rounded-xs flex flex-col items-center text-center bg-[#fafafa]">
                  <RefreshCw size={16} className="text-[#d70018] mb-1" />
                  <span className="font-bold">1 Đổi 1 Trong 30 Ngày</span>
                  <span className="text-gray-400 scale-90">Lỗi là đổi ngay máy khác</span>
                </div>
              </div>

              {/* Số lượng */}
              {!isOutOfStock && currentVariant && Number(currentVariant.stock || 0) > 0 && (
                <div className="flex items-center gap-3 pt-2">
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
                      onClick={() => setQuantity((q) => Math.min(Number(currentVariant.stock), q + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500">(Còn {currentVariant.stock} cây sẵn tại cửa hàng)</span>
                </div>
              )}

              {/* Banner Phụ kiện tặng kèm */}
              <div className="bg-gradient-to-r from-[#d70018] to-[#ff4d4f] text-white p-3 rounded-sm flex items-center justify-between mt-2">
                <span className="font-bold text-xs">Tặng bộ sạc cáp 20W + Cường lực trọn đời máy</span>
                <span className="bg-white text-[#d70018] font-black px-2 py-0.5 rounded-xs text-[11px]">
                  Quà tặng
                </span>
              </div>

              {/* Nút hành động */}
              {isOutOfStock ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-center">
                    <p className="text-xs font-bold text-[#d70018]">
                      Cấu hình {cleanProductName} {selectedStorage} ({selectedColor}) tạm hết hàng tại chi nhánh.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:0566003333"
                      className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-sm shadow flex items-center justify-center gap-2 text-center"
                    >
                      <PhoneCall size={16} />
                      <span>GỌI GIỮ MÁY (056.600.3333)</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 border-2 border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-xs uppercase rounded-sm flex items-center justify-center gap-2 text-center"
                    >
                      <MessageCircle size={16} />
                      <span>XEM HÌNH MÁY THỰC TẾ</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="w-full py-3 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 font-bold text-xs uppercase rounded-sm transition-colors text-center cursor-pointer"
                  >
                    THÊM VÀO GIỎ
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-sm shadow text-center cursor-pointer"
                  >
                    MUA NGAY
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tiêu chuẩn kiểm định */}
          <div className="mt-12 bg-white p-6 rounded-sm border border-gray-200">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <FileText size={18} className="text-[#d70018]" />
              <span>Quy Trình Tuyển Chọn &amp; Cam Kết Chất Lượng Máy Cũ Tại Fogo Store</span>
            </h2>
            <div className="text-xs text-gray-700 leading-relaxed space-y-3 max-w-4xl">
              <p>
                Mọi thiết bị Apple đã qua sử dụng tại Fogo Store đều trải qua quy trình đánh giá nghiêm ngặt 32 bước: kiểm tra FaceID/TouchID, màn hình hiển thị không ám ố hay điểm chết, cụm camera lấy nét chuẩn xác và cam kết bo mạch nguyên zin chưa qua sửa chữa.
              </p>
            </div>
          </div>

          {/* Sản phẩm cũ cùng phân khúc */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#d70018]" />
                <span>Các Dòng Máy Cũ Giá Tốt Khác</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {relatedProducts.map((rel) => {
                  const v = rel.variants?.[0] || {};
                  return (
                    <div key={rel.id} className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-xs border border-gray-200">
                      <Link href={`/san-pham/${rel.slug}`} className="w-full h-36 flex items-center justify-center p-2">
                        <img
                          src={v.images?.[0] || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300'}
                          alt={rel.name}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div>
                        <Link href={`/san-pham/${rel.slug}`} className="font-bold text-xs text-gray-800 hover:text-[#d70018] line-clamp-2">
                          {rel.name}
                        </Link>
                        <span className="text-sm font-black text-[#d70018] mt-2 block">
                          {(v.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}