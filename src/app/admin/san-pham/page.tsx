'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Check,
  Copy,
  ShoppingCart,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';
import { InstallmentModal } from '@/components/checkout/InstallmentModal';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Hàm trích xuất tên gốc của máy (loại bỏ dung lượng để tìm các phiên bản cùng dòng)
const getBaseModelName = (name: string): string => {
  return name
    .replace(/\b(64gb|128gb|256gb|512gb|1tb|2tb)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Hàm trích xuất dung lượng từ tên sản phẩm hoặc slug
const extractStorageFromName = (text: string): string => {
  const match = text.match(/\b(64gb|128gb|256gb|512gb|1tb|2tb)\b/i);
  return match ? match[0].toUpperCase() : '';
};

// Hàm xử lý URL ảnh tuyệt đối an toàn
const formatProductImageUrl = (url?: string | null): string => {
  if (!url) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80';
  if (url.startsWith('data:') || url.startsWith('https://')) return url;
  if (url.startsWith('http://localhost')) {
    return url.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${clean}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [siblingProducts, setSiblingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal trả góp
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState<boolean>(false);

  // Biến thể màu sắc & hình ảnh
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Tabs
  const [activeTab, setActiveTab] = useState<'policy' | 'desc' | 'specs'>('policy');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 1. Fetch dữ liệu sản phẩm hiện tại và các sản phẩm cùng dòng họ trong Database
  useEffect(() => {
    let isMounted = true;
    const fetchDetailAndSiblings = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết sản phẩm
        const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm');
        const json = await res.json();
        const curData = json.data || json;

        if (!isMounted) return;
        setProduct(curData);

        // Khởi tạo màu và ảnh
        const firstVariant = Array.isArray(curData.variants) && curData.variants.length > 0 ? curData.variants[0] : null;
        const initialColor = firstVariant?.color || (typeof curData.colors?.[0] === 'object' ? curData.colors[0].name : curData.colors?.[0] || 'Tiêu chuẩn');
        const initialImg = formatProductImageUrl(firstVariant?.images?.[0] || curData.imageUrl || curData.image);

        setSelectedColor(initialColor);
        setSelectedImage(initialImg);

        // Fetch toàn bộ sản phẩm để tìm các bản dung lượng khác cùng dòng trong DB
        try {
          const listRes = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
          if (listRes.ok) {
            const listJson = await listRes.json();
            const allProducts: any[] = Array.isArray(listJson.data) ? listJson.data : Array.isArray(listJson) ? listJson : [];
            
            const currentBase = getBaseModelName(curData.name).toLowerCase();
            const categoryId = curData.categoryId || curData.category?.id;

            // Lọc các sản phẩm cùng danh mục và cùng tên dòng máy
            const siblings = allProducts.filter((item: any) => {
              const itemBase = getBaseModelName(item.name).toLowerCase();
              const isSameCat = !categoryId || item.categoryId === categoryId || item.category?.id === categoryId;
              return isSameCat && (itemBase === currentBase || item.name.toLowerCase().includes(currentBase) || currentBase.includes(itemBase));
            });

            if (isMounted) {
              setSiblingProducts(siblings.length > 0 ? siblings : [curData]);
            }
          }
        } catch (e) {
          console.warn('Lỗi tìm sản phẩm cùng dòng:', e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) fetchDetailAndSiblings();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Danh sách các lựa chọn Dung Lượng từ Database (Mỗi nút tương ứng 1 sản phẩm riêng có slug riêng)
  const storageOptions = useMemo(() => {
    if (!siblingProducts || siblingProducts.length === 0) {
      const selfStorage = extractStorageFromName(product?.name || '') || '128GB';
      return [{ storage: selfStorage, slug: product?.slug || slug, isCurrent: true }];
    }

    const map = new Map<string, { storage: string; slug: string; isCurrent: boolean }>();

    siblingProducts.forEach((item) => {
      let st = extractStorageFromName(item.name);
      if (!st && Array.isArray(item.variants) && item.variants[0]?.storage) {
        st = item.variants[0].storage.toUpperCase();
      }
      if (!st) st = 'BẢN CHUẨN';

      if (!map.has(st)) {
        map.set(st, {
          storage: st,
          slug: item.slug || item.id,
          isCurrent: String(item.slug || item.id) === String(slug),
        });
      }
    });

    return Array.from(map.values());
  }, [siblingProducts, product, slug]);

  // Dung lượng hiện tại của sản phẩm đang xem
  const currentProductStorage = useMemo(() => {
    return extractStorageFromName(product?.name || '') || 'Tiêu chuẩn';
  }, [product]);

  // 3. Danh sách màu sắc khả dụng cho sản phẩm này
  const availableColors = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) {
      return ['Đen Titan', 'Trắng Titan', 'Xám'];
    }
    const colorSet = new Set<string>();
    product.variants.forEach((v: any) => {
      if (v.color) colorSet.add(v.color);
    });
    return colorSet.size > 0 ? Array.from(colorSet) : ['Mặc định'];
  }, [product]);

  // 4. Biến thể hiện tại dựa trên màu đang chọn
  const currentVariant = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return null;
    return product.variants.find((v: any) => v.color === selectedColor) || product.variants[0];
  }, [product, selectedColor]);

  const currentPrice = currentVariant?.price || product?.price || 21990000;
  const currentOriginalPrice = currentVariant?.originalPrice || product?.originalPrice || Math.round(currentPrice * 1.15);

  // Khi chọn dung lượng khác -> Điều hướng sang URL trang của sản phẩm đó
  const handleSelectStorageOption = (targetSlug: string) => {
    if (targetSlug !== slug) {
      router.push(`/san-pham/${targetSlug}`);
    }
  };

  // Khi đổi màu sắc -> Giữ nguyên URL, chỉ thay đổi hình ảnh và màu đang chọn
  const handleSelectColor = (col: string) => {
    setSelectedColor(col);
    if (product?.variants) {
      const match = product.variants.find((v: any) => v.color === col);
      if (match?.images?.[0]) {
        setSelectedImage(formatProductImageUrl(match.images[0]));
      }
    }
  };

  const formatVnd = (num: number) => (num ? num.toLocaleString('vi-VN') + 'đ' : '0đ');

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({
      id: currentVariant?.id || product.id,
      name: product.name,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      imageUrl: selectedImage,
      quantity,
      storage: currentProductStorage,
      color: selectedColor,
      modelSlug: product.slug,
    });
    setToast({
      show: true,
      type: 'success',
      message: `Đã thêm ${product.name} (${selectedColor}) vào giỏ hàng!`,
    });
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/thanh-toan');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navbar />
        <div className="max-w-7xl mx-auto py-28 text-center">
          <div className="w-12 h-12 border-4 border-[#d70018] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold text-base">Đang tải dữ liệu sản phẩm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white select-none">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="sticky top-0 z-50 shadow-xs">
        <Header />
        <Navbar />
      </div>

      {/* BREADCRUMB */}
      <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-3 px-4 text-sm text-gray-600">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-[#d70018] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/iphone" className="hover:text-[#d70018] transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">{product?.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* CỘT 1: HÌNH ẢNH TO HƠN 2 SIZE, DỜI QUA PHẢI (lg:col-span-5 + lg:pl-6)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:pl-6">
            <div className="w-full aspect-square max-w-[550px] border border-gray-100 rounded-2xl p-6 flex items-center justify-center bg-white shadow-xs">
              <img
                src={selectedImage}
                alt={product?.name || 'Sản phẩm'}
                onError={() => setSelectedImage('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80')}
                className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail danh sách hình ảnh theo màu */}
            <div className="flex items-center gap-3 mt-4 overflow-x-auto py-2 max-w-full">
              {[
                selectedImage,
                ...(currentVariant?.images?.map((img: string) => formatProductImageUrl(img)) || []),
                formatProductImageUrl(product?.imageUrl),
              ]
                .filter((url, idx, self) => url && self.indexOf(url) === idx)
                .slice(0, 5)
                .map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-18 h-18 rounded-xl border-2 p-1.5 bg-white cursor-pointer transition-all ${
                      selectedImage === imgUrl ? 'border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={imgUrl} alt="thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CỘT 2: THÔNG TIN SẢN PHẨM & MUA HÀNG - TO TOÀN DIỆN THÊM 2 SIZE           */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            <div className="text-xs font-black tracking-widest text-gray-400 uppercase"> Authorized Reseller</div>
            
            {/* Tên máy tăng 2 size */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-snug">
              {product?.name}
            </h1>

            {/* Đánh giá sao */}
            <div className="flex items-center gap-1.5 text-amber-400 text-base">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400" />
              ))}
              <span className="text-gray-500 text-sm ml-2 font-medium">(Đánh giá 5 sao chuẩn Apple VN/A)</span>
            </div>

            {/* Mức giá tăng 2 size */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d70018]">
                {formatVnd(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through font-semibold">
                  {formatVnd(currentOriginalPrice)}
                </span>
              )}
            </div>

            {/* CHỌN DUNG LƯỢNG - MỖI NÚT LÀ MỘT SẢN PHẨM VỚI URL RIÊNG TRONG DATABASE */}
            <div className="pt-2">
              <label className="block text-base font-black text-gray-900 mb-2.5">
                Chọn dung lượng (Chuyển phiên bản):
              </label>
              <div className="flex flex-wrap gap-3">
                {storageOptions.map((opt) => (
                  <button
                    key={opt.storage}
                    type="button"
                    onClick={() => handleSelectStorageOption(opt.slug)}
                    className={`px-5 py-2.5 text-base font-bold rounded-lg border cursor-pointer transition-all ${
                      opt.isCurrent
                        ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                        : 'border-gray-300 text-gray-800 hover:border-[#d70018]/60 bg-white'
                    }`}
                  >
                    {opt.storage}
                  </button>
                ))}
              </div>
            </div>

            {/* CHỌN MÀU SẮC - ĐỔI MÀU & HÌNH ẢNH TẠI TRANG HIỆN TẠI (KHÔNG ĐỔI URL) */}
            <div className="pt-2">
              <label className="block text-base font-black text-gray-900 mb-2.5">Màu sắc:</label>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelectColor(col)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border cursor-pointer transition-all ${
                      selectedColor === col
                        ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                        : 'border-gray-300 text-gray-800 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Số lượng */}
            <div className="pt-2 flex items-center gap-4">
              <span className="text-base font-black text-gray-900">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-base font-black text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-9 h-9 flex items-center justify-center text-base font-bold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">(Còn sẵn hàng trong kho)</span>
            </div>

            {/* Banner ưu đãi phụ kiện */}
            <div className="bg-[#fff1f2] border border-[#ffccd2] rounded-lg p-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#d70018]">
              <span>Giảm thêm 200.000đ khi mua kèm Củ sạc nhanh 20W & Ốp lưng MagSafe</span>
              <span className="bg-[#d70018] text-white text-xs font-black px-2.5 py-1 rounded cursor-pointer shrink-0 ml-2">Ưu đãi</span>
            </div>

            {/* Nút Thêm Vào Giỏ & Mua Ngay */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3.5 px-3 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded-lg font-black text-sm uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                <span>THÊM VÀO GIỎ</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3.5 px-3 bg-[#d70018] hover:bg-[#b50014] text-white rounded-lg font-black text-sm uppercase tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                <span>MUA NGAY</span>
              </button>
            </div>

            {/* Nút MUA NGAY - TRẢ SAU & Nút chia sẻ */}
            <div className="pt-2 space-y-4">
              <button
                type="button"
                onClick={() => setIsInstallmentModalOpen(true)}
                className="w-full py-3.5 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded-lg font-black text-sm uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
              >
                MUA NGAY - TRẢ SAU
              </button>

              <div className="flex items-center gap-3 pt-1 text-sm text-gray-800 font-bold">
                <span>Chia sẻ:</span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm font-black hover:opacity-90 transition-opacity"
                  >
                    f
                  </a>
                  <a
                    href="https://m.me"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
                  >
                    💬
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
                  >
                    🐦
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-[#E60023] text-white flex items-center justify-center text-sm font-serif hover:opacity-90 transition-opacity"
                  >
                    P
                  </a>
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

            {/* Banner Kredivo x Home PayLater click mở Modal trả góp */}
            <div
              onClick={() => setIsInstallmentModalOpen(true)}
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
        {/* TABS CHÍNH SÁCH BÁN HÀNG - MÔ TẢ - BẢNG THÔNG SỐ GRADIENT ĐỎ               */}
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
                  {product?.salesPolicy || `• Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm giá 150.000đ khi mua kèm Củ sạc nhanh Apple chính hãng.\n• Thu cũ lên đời trợ giá đến 90% - giá tốt nhất thị trường.`}
                </div>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-3.5 whitespace-pre-line text-sm md:text-base leading-relaxed text-gray-800 font-medium">
                {product?.description || `${product?.name} mang đến bước nhảy vọt về hiệu năng, thiết kế nguyên khối tinh tế và thời lượng pin bền bỉ cả ngày dài.`}
              </div>
            )}

            {/* BẢNG THÔNG SỐ KỸ THUẬT GRADIENT ĐỎ */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl overflow-hidden rounded-xl border border-red-500 bg-white shadow-xs">
                <div className="grid grid-cols-12 bg-gradient-to-r from-[#d70018] to-[#ea580c] text-white font-black text-sm md:text-base uppercase py-4 px-6">
                  <div className="col-span-4 flex items-center gap-2">
                    <span>🔥 ĐẶC ĐIỂM NỔI BẬT</span>
                  </div>
                  <div className="col-span-8">
                    <span>THÔNG SỐ CHÍNH THỨC {product?.name || ''}</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 text-sm md:text-base">
                  {(Array.isArray(product?.specifications) && product.specifications.length > 0
                    ? product.specifications
                    : [
                        { key: 'Màn hình', value: 'Liquid Retina / Super Retina XDR với dải màu rộng P3 sắc nét' },
                        { key: 'Hệ điều hành', value: 'macOS / iPadOS / iOS tối ưu mượt mà' },
                        { key: 'Vi xử lý', value: 'Apple Silicon thế hệ mới hiệu năng vượt trội' },
                        { key: 'Camera', value: 'Camera độ phân giải cao hỗ trợ gọi video và chụp ảnh sắc nét' },
                        { key: 'Pin & Sạc', value: 'Thời lượng pin ấn tượng suốt cả ngày | Cổng sạc nhanh USB-C / MagSafe' },
                        { key: 'Thiết kế & Độ bền', value: 'Vỏ nhôm nguyên khối tái chế 100% thân thiện môi trường' },
                        { key: 'Màu sắc', value: selectedColor || 'Tiêu chuẩn' },
                      ]
                  ).map((row: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 p-4 md:p-5 hover:bg-gray-50/80 transition-colors">
                      <div className="col-span-4 font-bold text-gray-900 pr-3">
                        {row.key}
                      </div>
                      <div className="col-span-8 text-gray-700 leading-relaxed font-medium">
                        {row.value || 'Đang cập nhật'}
                      </div>
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
        <div className="mt-14 space-y-12">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
              <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                Sản phẩm liên quan
              </h3>
              <div className="flex items-center gap-2 text-gray-400">
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronLeft size={20} /></button>
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {[
                { name: 'iPhone 16 Pro Max 256GB', price: 34490000, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80', slug: 'iphone-16-pro-max' },
                { name: 'iPhone 16 Pro 128GB', price: 28490000, img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80', slug: 'iphone-16-pro' },
                { name: 'iPad Pro M4 11 inch WiFi', price: 27990000, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80', slug: 'ipad-pro-m4' },
                { name: 'MacBook Air M3 13 inch', price: 26990000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', slug: 'macbook-air-m3' },
                { name: 'iPhone 15 128GB New Seal', price: 19490000, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80', slug: 'iphone-15' },
              ].map((p, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group">
                  <Link href={`/san-pham/${p.slug}`} className="w-full aspect-square flex items-center justify-center overflow-hidden mb-2">
                    <img src={p.img} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </Link>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase">APPLE</span>
                    <Link href={`/san-pham/${p.slug}`} className="block font-bold text-xs sm:text-sm text-gray-900 hover:text-[#d70018] line-clamp-2 mt-0.5 leading-snug">
                      {p.name}
                    </Link>
                    <div className="text-sm sm:text-base font-black text-[#d70018] mt-1.5">{formatVnd(p.price)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full mt-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShoppingCart size={14} />
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* MODAL TRẢ GÓP KREDIVO / HOME PAYLATER */}
      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        productName={product?.name || 'Sản phẩm Apple'}
        productImage={selectedImage}
        productPrice={currentPrice}
        initialQuantity={quantity}
      />

      <Footer />
    </div>
  );
}