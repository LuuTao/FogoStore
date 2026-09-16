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
const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState<boolean>(false);
// Hàm xử lý URL ảnh tuyệt đối, tự động thay thế localhost sang Render
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
  const [loading, setLoading] = useState(true);

  // Lựa chọn biến thể hiện tại
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Tabs & tương tác
  const [activeTab, setActiveTab] = useState<'policy' | 'desc' | 'specs'>('policy');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 1. Fetch dữ liệu sản phẩm từ API
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm');
        const json = await res.json();
        const data = json.data || json;

        if (!isMounted) return;
        setProduct(data);

        // Khởi tạo biến thể đầu tiên
        const firstVariant = Array.isArray(data.variants) && data.variants.length > 0 ? data.variants[0] : null;
        const initialStorage = firstVariant?.storage || (data.storageOptions?.[0] || '128GB');
        const initialColor = firstVariant?.color || (typeof data.colors?.[0] === 'object' ? data.colors[0].name : data.colors?.[0] || 'Mặc định');
        const initialImg = firstVariant?.images?.[0] || data.imageUrl || data.image;

        setSelectedStorage(initialStorage);
        setSelectedColor(initialColor);
        setSelectedImage(formatProductImageUrl(initialImg));
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Danh sách các dung lượng duy nhất từ variants thực tế
  const availableStorages = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) {
      return ['128GB', '256GB', '512GB'];
    }
    const set = new Set<string>();
    product.variants.forEach((v: any) => {
      if (v.storage) set.add(v.storage);
    });
    return set.size > 0 ? Array.from(set) : ['128GB', '256GB', '512GB'];
  }, [product]);

  // 3. Danh sách các màu sắc tương ứng với dung lượng đang chọn
  const availableColors = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) {
      return ['Đen', 'Bạc', 'Xám'];
    }
    const filtered = product.variants.filter(
      (v: any) => !selectedStorage || v.storage === selectedStorage
    );
    const colorSet = new Set<string>();
    filtered.forEach((v: any) => {
      if (v.color) colorSet.add(v.color);
    });
    if (colorSet.size === 0) {
      product.variants.forEach((v: any) => {
        if (v.color) colorSet.add(v.color);
      });
    }
    return Array.from(colorSet);
  }, [product, selectedStorage]);

  // 4. Biến thể hiện tại dựa trên Storage + Color đã chọn
  const currentVariant = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return null;
    return (
      product.variants.find(
        (v: any) => v.storage === selectedStorage && v.color === selectedColor
      ) ||
      product.variants.find((v: any) => v.storage === selectedStorage) ||
      product.variants[0]
    );
  }, [product, selectedStorage, selectedColor]);

  // 5. Cập nhật hình ảnh và giá khi đổi lựa chọn
  const currentPrice = currentVariant?.price || product?.price || 21990000;
  const currentOriginalPrice = currentVariant?.originalPrice || product?.originalPrice || Math.round(currentPrice * 1.15);

  const handleSelectStorage = (st: string) => {
    setSelectedStorage(st);
    if (product?.variants) {
      const match = product.variants.find((v: any) => v.storage === st && v.color === selectedColor)
        || product.variants.find((v: any) => v.storage === st);
      if (match) {
        if (match.color) setSelectedColor(match.color);
        if (match.images?.[0]) setSelectedImage(formatProductImageUrl(match.images[0]));
      }
    }
  };

  const handleSelectColor = (col: string) => {
    setSelectedColor(col);
    if (product?.variants) {
      const match = product.variants.find((v: any) => v.color === col && v.storage === selectedStorage)
        || product.variants.find((v: any) => v.color === col);
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
      storage: selectedStorage,
      color: selectedColor,
      modelSlug: product.slug,
    });
    setToast({
      show: true,
      type: 'success',
      message: `Đã thêm ${product.name} (${selectedStorage} - ${selectedColor}) vào giỏ hàng!`,
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
        <div className="max-w-7xl mx-auto py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#d70018] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-bold text-sm">Đang nạp dữ liệu chi tiết sản phẩm...</p>
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
      <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2.5 px-4 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
          <span>/</span>
          <Link href="/iphone" className="hover:text-[#d70018]">Sản phẩm</Link>
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
            <div className="w-full aspect-square max-w-[540px] border border-gray-100 rounded-2xl p-6 flex items-center justify-center bg-white shadow-xs">
              <img
                src={selectedImage}
                alt={product?.name || 'Sản phẩm'}
                onError={() => setSelectedImage('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80')}
                className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail danh sách hình ảnh theo biến thể */}
            <div className="flex items-center gap-2.5 mt-4 overflow-x-auto py-2 max-w-full">
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
                    className={`w-16 h-16 rounded-lg border-2 p-1 bg-white cursor-pointer transition-all ${
                      selectedImage === imgUrl ? 'border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={imgUrl} alt="thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CỘT 2: THÔNG TIN SẢN PHẨM & CÁC NÚT MUA HÀNG (CHỮ TO LÊN 2 SIZE)           */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase"> Authorized Reseller</div>
            
            {/* Tên máy tăng 2 size */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">
              {product?.name}
            </h1>

            <div className="flex items-center gap-1 text-amber-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} className="fill-amber-400" />
              ))}
              <span className="text-gray-500 text-xs ml-2 font-medium">(Đánh giá 5 sao chuẩn Apple VN/A)</span>
            </div>

            {/* Mức giá tăng 2 size */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl md:text-4xl font-black text-[#d70018]">
                {formatVnd(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-base text-gray-400 line-through">
                  {formatVnd(currentOriginalPrice)}
                </span>
              )}
            </div>

            {/* Chọn dung lượng */}
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-800 mb-2">Chọn dung lượng:</label>
              <div className="flex flex-wrap gap-2.5">
                {availableStorages.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStorage(st)}
                    className={`px-4 py-2 text-sm font-bold rounded-md border cursor-pointer transition-all ${
                      selectedStorage === st
                        ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn màu sắc */}
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-800 mb-2">Màu sắc:</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelectColor(col)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md border cursor-pointer transition-all ${
                      selectedColor === col
                        ? 'border-2 border-[#d70018] text-[#d70018] font-bold bg-red-50/40'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Số lượng */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-sm font-bold text-gray-800">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">(Còn sẵn hàng trong kho)</span>
            </div>

            {/* Banner ưu đãi phụ kiện */}
            <div className="bg-[#fff1f2] border border-[#ffccd2] rounded-md p-3 flex items-center justify-between text-xs font-semibold text-[#d70018]">
              <span>Giảm thêm 200.000đ khi mua kèm Củ sạc nhanh 20W & Ốp lưng MagSafe</span>
              <span className="bg-[#d70018] text-white text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer">Ưu đãi</span>
            </div>

            {/* Nút Thêm Vào Giỏ & Mua Ngay */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-2 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded-md font-black text-xs uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={16} />
                <span>THÊM VÀO GIỎ</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-md font-black text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Zap size={16} />
                <span>MUA NGAY</span>
              </button>
            </div>

            {/* Nút MUA NGAY - TRẢ SAU */}
            <button
              type="button"
              onClick={() => setIsInstallmentModalOpen(true)}
              className="w-full py-3 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded-md font-black text-xs uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
            >
              MUA NGAY - TRẢ SAU
            </button>

              <div className="flex items-center gap-2 pt-1 text-xs text-gray-700 font-bold">
                <span>Chia sẻ:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black hover:opacity-90"
                  >
                    f
                  </a>
                  <a
                    href="https://m.me"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-xs hover:opacity-90"
                  >
                    💬
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-xs hover:opacity-90"
                  >
                    🐦
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center text-xs font-serif hover:opacity-90"
                  >
                    P
                  </a>
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
          {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG & BANNER KREDIVO QUA TRANG LIÊN HỆ             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs">
              <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5 mb-3">
                Chính sách bán hàng
              </h3>
              <div className="space-y-3.5 text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span>Cam kết 100% chính hãng</span>
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

            {/* Banner Kredivo x Home PayLater click chuyển sang /lien-he */}
            <Link
              href="/lien-he"
              className="block rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 border-b border-orange-100 flex flex-col items-center text-center">
                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Kredivo × Home PayLater</div>
                <div className="text-sm font-black text-gray-900 mt-1">MUA TRƯỚC TRẢ SAU</div>
                <div className="flex items-center gap-3 my-2">
                  <span className="text-xs font-black text-[#d70018] bg-red-100 px-2 py-0.5 rounded">0% Lãi Suất</span>
                  <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded">5 Phút Duyệt</span>
                </div>
                <p className="text-[10px] text-gray-500">Đăng ký Online - Không Chứng Minh Thu Nhập</p>
              </div>
            </Link>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TABS CHÍNH SÁCH BÁN HÀNG - MÔ TẢ - BẢNG THÔNG SỐ KỸ THUẬT                  */}
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
                  {product?.salesPolicy || `• Lỗi 1 đổi 1 trong 18 tháng toàn diện nếu có lỗi phần cứng từ NSX.\n• Tặng 1 lần thay Pin miễn phí trọn đời máy.\n• Giảm giá 150.000đ khi mua kèm Dock sạc nhanh Apple chính hãng.\n• Thu cũ lên đời trợ giá đến 90% - tốt nhất thị trường.`}
                </div>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-3 whitespace-pre-line text-xs md:text-sm leading-relaxed text-gray-800">
                {product?.description || `${product?.name} mang đến bước nhảy vọt về hiệu năng, thiết kế mỏng nhẹ tinh tế và thời lượng pin bền bỉ cả ngày dài.`}
              </div>
            )}

            {/* BẢNG THÔNG SỐ GRADIENT ĐỎ CHUẨN MẪU */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl overflow-hidden rounded-xl border border-red-500 bg-white shadow-xs">
                <div className="grid grid-cols-12 bg-gradient-to-r from-[#d70018] to-[#ea580c] text-white font-black text-xs md:text-sm uppercase py-3.5 px-5">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <span>🔥 ĐẶC ĐIỂM NỔI BẬT</span>
                  </div>
                  <div className="col-span-8">
                    <span>THÔNG SỐ CHÍNH THỨC {product?.name || ''}</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 text-xs md:text-sm">
                  {(Array.isArray(product?.specifications) && product.specifications.length > 0
                    ? product.specifications
                    : [
                        { key: 'Màn hình', value: 'OLED Super Retina XDR, ProMotion 1-120Hz, độ sáng đỉnh cao' },
                        { key: 'Hệ điều hành', value: 'iPadOS / iOS tối ưu' },
                        { key: 'Vi xử lý', value: 'Apple Silicon thế hệ mới' },
                        { key: 'Camera sau', value: 'Hệ thống camera độ phân giải cao, quay phim chuẩn 4K' },
                        { key: 'Camera trước', value: 'Ultra Wide Center Stage góc nhìn rộng' },
                        { key: 'Pin & Sạc', value: 'Thời lượng pin cả ngày dài | Cổng USB-C sạc nhanh' },
                        { key: 'Thiết kế & Độ bền', value: 'Khung vỏ nguyên khối sang trọng, gia công chính xác' },
                        { key: 'Màu sắc', value: selectedColor || 'Tiêu chuẩn' },
                      ]
                  ).map((row: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 p-3.5 md:p-4 hover:bg-gray-50/70 transition-colors">
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
                className="text-xs font-bold text-gray-500 hover:text-[#d70018] flex items-center gap-1 cursor-pointer transition-colors"
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
              <h3 className="text-base md:text-lg font-black text-gray-900 uppercase tracking-wide">
                Sản phẩm liên quan
              </h3>
              <div className="flex items-center gap-2 text-gray-400">
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronLeft size={18} /></button>
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronRight size={18} /></button>
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
                <div key={idx} className="bg-white rounded border border-gray-200 p-3 flex flex-col justify-between hover:shadow-lg transition-all group">
                  <Link href={`/san-pham/${p.slug}`} className="w-full aspect-square flex items-center justify-center overflow-hidden mb-2">
                    <img src={p.img} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </Link>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">APPLE</span>
                    <Link href={`/san-pham/${p.slug}`} className="block font-bold text-xs text-gray-900 hover:text-[#d70018] line-clamp-2 mt-0.5 leading-snug">
                      {p.name}
                    </Link>
                    <div className="text-xs font-black text-[#d70018] mt-1.5">{formatVnd(p.price)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full mt-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShoppingCart size={12} />
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
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