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
  Zap,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

interface Props {
  initialProduct: any;
  currentSlug: string;
  baseSlug: string;
  urlStorage: string; // Đóng vai trò là phân loại / công suất / chiều dài (20W, 1m, 2m,...)
}

export default function AccessoryDetail({
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
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;

    // Đọc phân loại từ variant (công suất/độ dài/loại cổng)
    const defaultType =
      product.variants[0]?.storage ||
      product.variants[0]?.type ||
      product.variants[0]?.version ||
      'Tiêu chuẩn';
    const activeType = (urlStorage || defaultType).toUpperCase();

    let initVar = null;
    if (initialProId) {
      initVar = product.variants.find((v: any) => String(v.id) === initialProId);
    }
    if (!initVar) {
      initVar =
        product.variants.find(
          (v: any) =>
            (v.storage || v.type || v.version || 'Tiêu chuẩn').toUpperCase() === activeType &&
            Number(v.stock || 0) > 0
        ) ||
        product.variants.find(
          (v: any) => (v.storage || v.type || v.version || 'Tiêu chuẩn').toUpperCase() === activeType
        ) ||
        product.variants[0];
    }

    setSelectedType(activeType);
    if (!selectedColor) {
      setSelectedColor(initVar?.color || product.variants[0]?.color || '');
    }

    // Lấy danh sách phụ kiện liên quan từ DB
    fetch(`http://localhost:5000/api/products/filter?category=phu-kien`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setRelatedProducts(resJson.data.filter((p: any) => p.id !== product.id).slice(0, 5));
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product, urlStorage, baseSlug, initialProId]);

  // Danh sách các tùy chọn phân loại (Ví dụ: 20W, 35W hoặc 1m, 2m)
  const typeList = useMemo(() => {
    if (!product?.variants) return [];
    const list = product.variants
      .map((v: any) => (v.storage || v.type || v.version || '').trim())
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  // Danh sách màu sắc
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

  // Biến thể khớp Phân loại & Màu
  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    const exact = product.variants.find(
      (v: any) =>
        (v.storage || v.type || v.version || 'Tiêu chuẩn').toUpperCase() === selectedType.toUpperCase() &&
        (v.color || '').toLowerCase() === selectedColor.toLowerCase()
    );
    if (exact) return exact;

    const sample = product.variants.find(
      (v: any) => (v.color || '').toLowerCase() === selectedColor.toLowerCase()
    );
    return {
      id: `out-of-stock-${selectedType.toLowerCase()}-${encodeURIComponent(selectedColor)}`,
      storage: selectedType,
      color: selectedColor,
      price: sample?.price || product.variants[0]?.price || 0,
      originalPrice: sample?.originalPrice || product.variants[0]?.originalPrice || 0,
      stock: 0,
      images: sample?.images || product.variants[0]?.images || [],
    };
  }, [product, selectedType, selectedColor]);

  const isOutOfStock = useMemo(() => {
    return !currentVariant || Number(currentVariant.stock || 0) <= 0;
  }, [currentVariant]);

  const handleSelectType = (tp: string) => {
    if (selectedType.toUpperCase() === tp.toUpperCase()) return;
    const matched = product.variants.find(
      (v: any) =>
        (v.storage || v.type || v.version || 'Tiêu chuẩn').toUpperCase() === tp.toUpperCase() &&
        (v.color || '').toLowerCase() === selectedColor.toLowerCase()
    ) || product.variants.find((v: any) => (v.storage || v.type || v.version || '').toUpperCase() === tp.toUpperCase());

    const proidParam = matched ? `?proid=${matched.id}` : '';
    router.push(`/san-pham/${baseSlug}-${tp.toLowerCase()}${proidParam}`);
  };

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setCurrentImageIndex(0);

    const matched = product.variants.find(
      (v: any) =>
        (v.storage || v.type || v.version || 'Tiêu chuẩn').toUpperCase() === selectedType.toUpperCase() &&
        (v.color || '').toLowerCase() === colorName.toLowerCase()
    );

    const nextId = matched ? matched.id : `mock-${selectedType.toLowerCase()}-${encodeURIComponent(colorName)}`;

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/san-pham/${baseSlug}-${selectedType.toLowerCase()}?proid=${nextId}`);
    }
  };

  const imagesList: string[] = useMemo(() => {
    if (currentVariant?.images && currentVariant.images.length > 0) return currentVariant.images;
    return product?.variants?.[0]?.images || ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'];
  }, [currentVariant, product]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const handleAddToCart = (redirectCart = false) => {
    if (!currentVariant || Number(currentVariant.stock || 0) <= 0) return;

    addToCart({
      id: currentVariant.id,
      name: `${product.name} ${typeList.length > 1 ? selectedType : ''}`.trim(),
      modelSlug: baseSlug,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice || currentVariant.price,
      storage: selectedType,
      color: selectedColor,
      imageUrl: imagesList[currentImageIndex] || imagesList[0],
      quantity: quantity,
    });

    if (redirectCart) {
      router.push('/gio-hang');
    } else {
      setToast({
        show: true,
        message: `Đã thêm ${product.name} vào giỏ hàng thành công!`,
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

        {/* Breadcrumb */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2 px-4 text-[11px] text-gray-600">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 truncate">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/phu-kien" className="hover:text-[#d70018]">Phụ kiện chính hãng</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery ảnh Phụ kiện */}
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

            {/* Chi tiết thông tin Phụ kiện */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-xs">
                   Phụ Kiện Apple Chính Hãng
                </span>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug mt-1">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <span className="text-[11px] text-gray-500 ml-1">Bảo hành chính hãng 12 tháng 1 đổi 1</span>
                </div>
              </div>

              {/* Khung Giá bán */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block text-[11px]">Giá bán ưu đãi</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl md:text-3xl font-black text-[#d70018]">
                    {formatVnd(currentVariant?.price || 0)}
                  </span>
                  {currentVariant?.originalPrice > currentVariant?.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatVnd(currentVariant.originalPrice)}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-50 text-[#d70018] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-xs ml-2">
                      Tạm hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* Phân loại tùy chọn (nếu có hơn 1 phiên bản) */}
              {typeList.length > 1 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-semibold text-gray-700">Chọn phiên bản / Công suất:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {typeList.map((tp) => {
                      const isSelected = selectedType.toUpperCase() === tp.toUpperCase();
                      return (
                        <button
                          key={tp}
                          onClick={() => handleSelectType(tp)}
                          className={`relative p-2 border rounded-sm text-center transition-all cursor-pointer ${
                            isSelected ? 'border-[#d70018] bg-white shadow-2xs' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className={`block font-black text-xs ${isSelected ? 'text-[#d70018]' : 'text-gray-800'}`}>
                            {tp}
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
              )}

              {/* Tùy chọn màu sắc (nếu có) */}
              {allColorOptions.length > 0 && allColorOptions[0]?.color && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-semibold text-gray-700">Màu sắc:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {allColorOptions.map(({ color, sampleVariant }) => {
                      const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                      const displayImg = sampleVariant?.images?.[0] || imagesList[0];

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

              {/* Chọn số lượng */}
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
                  <span className="text-[11px] text-gray-500">(Còn {currentVariant.stock} sản phẩm sẵn có)</span>
                </div>
              )}

              {/* Banner Cam kết phụ kiện */}
              <div className="bg-[#f8f9fa] border border-gray-200 p-3 rounded-sm flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#00a859]" />
                  <span className="font-bold text-xs text-gray-800">Cam kết 100% chính hãng Apple • Lỗi 1 đổi 1 ngay lập tức</span>
                </div>
                <span className="bg-[#00a859] text-white font-bold px-2 py-0.5 rounded-xs text-[10px]">
                  Bảo hành 12T
                </span>
              </div>

              {/* Cụm nút mua hàng */}
              {isOutOfStock ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-center">
                    <p className="text-xs font-bold text-[#d70018]">
                      Phụ kiện {product.name} hiện đang tạm hết hàng.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:0566003333"
                      className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-sm shadow flex items-center justify-center gap-2 text-center"
                    >
                      <PhoneCall size={16} />
                      <span>GỌI HOTLINE (056.600.3333)</span>
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 border-2 border-[#0068ff] text-[#0068ff] hover:bg-blue-50 font-black text-xs uppercase rounded-sm flex items-center justify-center gap-2 text-center"
                    >
                      <MessageCircle size={16} />
                      <span>CHAT ZALO TƯ VẤN</span>
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

          {/* Mô tả phụ kiện */}
          <div className="mt-12 bg-white p-6 rounded-sm border border-gray-200">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <FileText size={18} className="text-[#d70018]" />
              <span>Đặc Điểm Nổi Bật Của {product.name}</span>
            </h2>
            <div className="text-xs text-gray-700 leading-relaxed space-y-3 max-w-4xl">
              <p>
                <strong className="text-gray-900">{product.name}</strong> được sản xuất theo quy chuẩn khắt khe từ Apple, đảm bảo hiệu suất truyền tải tối ưu, công nghệ sạc thông minh bảo vệ tuổi thọ pin thiết bị và độ bền bỉ vượt trội qua thời gian.
              </p>
            </div>
          </div>

          {/* Phụ kiện khác cùng danh mục */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#d70018]" />
                <span>Phụ Kiện Khác Thường Được Mua Kèm</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {relatedProducts.map((rel) => {
                  const v = rel.variants?.[0] || {};
                  return (
                    <div key={rel.id} className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-xs border border-gray-200">
                      <Link href={`/san-pham/${rel.slug}`} className="w-full h-36 flex items-center justify-center p-2">
                        <img
                          src={v.images?.[0] || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300'}
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