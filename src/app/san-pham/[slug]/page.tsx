'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  CheckCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Zap,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'policy' | 'desc' | 'specs'>('policy');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 1. Fetch dữ liệu sản phẩm chi tiết
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
        const json = await res.json();
        const data = json.data || json;

        setProduct(data);
        const initialImg = data.images?.[0] || data.imageUrl || '/placeholder.png';
        setSelectedImage(initialImg);

        if (data.storageOptions?.length > 0) setSelectedStorage(data.storageOptions[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0].name || data.colors[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const formatVnd = (num: number) => (num ? num.toLocaleString('vi-VN') + 'đ' : '0đ');

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({
      id: product.id,
      name: product.name,
      price: product.price || 21990000,
      imageUrl: selectedImage || product.imageUrl,
      quantity,
      storage: selectedStorage,
      color: selectedColor,
      modelSlug: product.slug,
    });
    setToast({
      show: true,
      type: 'success',
      message: `Đã thêm ${product.name} vào giỏ hàng thành công!`,
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
        <div className="max-w-7xl mx-auto p-12 text-center text-gray-500 font-semibold">
          Đang nạp chi tiết sản phẩm...
        </div>
        <Footer />
      </div>
    );
  }

  const price = product?.price || 21990000;
  const originalPrice = product?.originalPrice || 24990000;

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
          <Link href="/iphone" className="hover:text-[#d70018]">iPhone</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">{product?.name || 'Chi tiết sản phẩm'}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* CỘT 1: HÌNH ẢNH SẢN PHẨM (TO RA 2 SIZE & DỜI QUA PHẢI 1 CHÚT)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:pl-4">
            <div className="w-full aspect-square max-w-[500px] border border-gray-100 rounded-2xl p-4 flex items-center justify-center bg-white shadow-xs">
              <img
                src={selectedImage || product?.imageUrl}
                alt={product?.name}
                className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-2.5 mt-4 overflow-x-auto py-2">
              {[product?.imageUrl, ...(product?.images || [])].filter(Boolean).map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-14 h-14 rounded-lg border-2 p-1 bg-white cursor-pointer transition-all ${
                    selectedImage === imgUrl ? 'border-[#d70018] shadow-xs scale-105' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={imgUrl} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CỘT 2: THÔNG TIN SẢN PHẨM & CÁC NÚT MUA HÀNG                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase"> Authorized Reseller</div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
              {product?.name || 'iPhone 16 Tiêu chuẩn - Chính hãng VN'}
            </h1>

            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400" />
              ))}
              <span className="text-gray-400 ml-2">(Đánh giá 5 sao chuẩn Apple VN/A)</span>
            </div>

            {/* Giá bán */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl md:text-3xl font-black text-[#d70018]">{formatVnd(price)}</span>
              {originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">{formatVnd(originalPrice)}</span>
              )}
            </div>

            {/* Chọn dung lượng */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">Chọn dung lượng:</label>
              <div className="flex flex-wrap gap-2">
                {['128GB', '256GB', '512GB'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStorage(st)}
                    className={`px-4 py-2 text-xs font-bold rounded border cursor-pointer transition-all ${
                      selectedStorage === st || (!selectedStorage && st === '128GB')
                        ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/40 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn màu sắc */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">Màu sắc:</label>
              <div className="flex flex-wrap gap-2">
                {['Hồng Pastel', 'Xanh Măng Két', 'Trắng', 'Đen'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border cursor-pointer transition-all ${
                      selectedColor === col || (!selectedColor && col === 'Hồng Pastel')
                        ? 'border-2 border-[#d70018] text-[#d70018] font-bold bg-red-50/40'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Số lượng */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-gray-400">(Còn 40 sản phẩm trong kho)</span>
            </div>

            {/* Banner ưu đãi phụ kiện */}
            <div className="bg-[#fff1f2] border border-[#ffccd2] rounded-md p-2.5 flex items-center justify-between text-xs font-semibold text-[#d70018]">
              <span>Giảm thêm 200.000đ khi mua kèm Củ sạc nhanh 20W & Ốp lưng MagSafe</span>
              <span className="bg-[#d70018] text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer">Ưu đãi</span>
            </div>

            {/* Nút Thêm Vào Giỏ & Mua Ngay */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-2 border-2 border-[#d70018] text-[#d70018] hover:bg-red-50 rounded font-black text-xs uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={15} />
                <span>THÊM VÀO GIỎ</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded font-black text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Zap size={15} />
                <span>MUA NGAY</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* ẢNH 3: NÚT MUA NGAY - TRẢ SAU & CÁC ICON CHIA SẺ TRÒN                       */}
            {/* ========================================================================= */}
            <div className="pt-2 space-y-3">
              <Link
                href="/lien-he"
                className="w-full py-2.5 bg-[#fde047] hover:bg-[#facc15] text-[#1e3a8a] rounded font-black text-xs uppercase tracking-wider shadow-xs flex items-center justify-center transition-all cursor-pointer"
              >
                MUA NGAY - TRẢ SAU
              </Link>

              {/* Các nút chia sẻ */}
              <div className="flex items-center gap-2 pt-1 text-xs text-gray-700 font-bold">
                <span>Chia sẻ:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[11px] font-black hover:opacity-90 transition-opacity"
                  >
                    f
                  </a>
                  <a
                    href="https://m.me"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#0084FF] text-white flex items-center justify-center text-[10px] hover:opacity-90 transition-opacity"
                  >
                    💬
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-[11px] hover:opacity-90 transition-opacity"
                  >
                    🐦
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center text-[11px] font-serif hover:opacity-90 transition-opacity"
                  >
                    P
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                    title="Sao chép liên kết"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* CỘT 3: CHÍNH SÁCH BÁN HÀNG & BANNER KREDIVO CLICK SANG LIÊN HỆ (ẢNH 2)    */}
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
        {/* ẢNH 4: TABS CHÍNH SÁCH BÁN HÀNG - MÔ TẢ - THÔNG SỐ KỸ THUẬT               */}
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
                <h4 className="font-bold text-[#1e3a8a] text-sm">Chính Sách Bảo Hành:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>
                    Lỗi <strong className="text-[#d70018]">1 đổi 1 trong 18 tháng toàn diện</strong> nếu có lỗi phần cứng từ phía Nhà Sản Xuất (tham khảo thêm <Link href="/lien-he" className="text-[#1e3a8a] underline font-semibold">tại đây</Link>).
                  </li>
                  <li>
                    <strong className="text-[#d70018]">Tặng 1 lần</strong> thay Pin miễn phí trọn đời máy.
                  </li>
                </ul>

                <h4 className="font-bold text-[#1e3a8a] text-sm pt-3">Chương Trình Khuyến Mãi:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>
                    <strong className="text-[#d70018]">Bộ quà tặng</strong> trị giá lên đến <strong className="text-[#d70018]">2.000.000đ</strong>.
                  </li>
                  <li>
                    Giảm giá <strong className="text-[#d70018]">150.000đ</strong> khi mua kèm Dock Sạc Nhanh 20W Chính Hãng Apple.
                  </li>
                  <li>
                    Giảm giá <strong className="text-[#d70018]">150.000đ</strong> khi mua kèm AirPods | Apple Watch.
                  </li>
                  <li>
                    Giảm giá từ <strong className="text-[#d70018]">10% đến 20%</strong> phụ kiện chính hãng.
                  </li>
                  <li>
                    Thu Cũ Lên Đời trợ giá đến <strong className="text-[#d70018]">90%</strong>, giá thu tốt nhất thị trường.
                  </li>
                  <li>
                    Hỗ trợ trả góp <strong className="text-[#d70018]">0%</strong> lãi suất, đa dạng hình thức và linh hoạt kì hạn.
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-3">
                <p>
                  iPhone 16 mang đến bước nhảy vọt về hiệu năng với chip Apple Silicon tiên tiến, cụm camera nâng cấp vượt bậc và thời lượng pin ấn tượng suốt cả ngày dài.
                </p>
                <p>
                  Sản phẩm phân phối chính hãng Apple Việt Nam (Mã VN/A), nguyên seal hộp và đầy đủ chính sách bảo hành chính hãng trên toàn quốc.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-xl space-y-2">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Màn hình:</span>
                  <span className="font-bold text-gray-900">Super Retina XDR OLED 6.1 inch</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Chipset:</span>
                  <span className="font-bold text-gray-900">Apple A18 Bionic (3nm)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Camera chính:</span>
                  <span className="font-bold text-gray-900">48MP Fusion + 12MP Ultra Wide</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Cổng sạc:</span>
                  <span className="font-bold text-gray-900">USB-C hỗ trợ sạc nhanh</span>
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

        {/* ========================================================================= */}
        {/* ẢNH 5: SẢN PHẨM LIÊN QUAN & SẢN PHẨM ĐÃ XEM                              */}
        {/* ========================================================================= */}
        <div className="mt-14 space-y-12">
          
          {/* Sản phẩm liên quan */}
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
                { name: 'iPhone 16 Plus 128GB', price: 25490000, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80', slug: 'iphone-16-plus' },
                { name: 'iPhone 15 Pro Max 256GB', price: 29490000, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80', slug: 'iphone-15-pro-max' },
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

          {/* Sản phẩm đã xem */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
              <h3 className="text-base md:text-lg font-black text-gray-900 uppercase tracking-wide">
                Sản phẩm đã xem
              </h3>
              <div className="flex items-center gap-2 text-gray-400">
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronLeft size={18} /></button>
                <button type="button" className="p-1 hover:text-gray-700 cursor-pointer"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {[
                { name: 'iPad Pro M4 11 inch WiFi', price: 27990000, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80', slug: 'ipad-pro-m4' },
                { name: 'MacBook Air M3 13 inch', price: 26990000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', slug: 'macbook-air-m3' },
                { name: 'Củ sạc Apple 20W Type-C', price: 490000, img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80', slug: 'cu-sac-20w' },
                { name: 'Magic Keyboard iPad Pro', price: 8990000, img: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80', slug: 'magic-keyboard' },
                { name: 'Apple Pencil Pro', price: 3490000, img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80', slug: 'apple-pencil-pro' },
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

      <Footer />
    </div>
  );
}