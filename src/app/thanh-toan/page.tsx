'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Wallet,
  Receipt,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  Tag,
  ArrowRight,
  Loader2,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { QrPaymentModal } from '@/components/checkout/QrPaymentModal';
import { ToastNotification } from '@/components/common/ToastNotification';
import { AuthModal } from '@/components/auth/AuthModal';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// ----------------------------------------------------------------------
// DỮ LIỆU ĐỊA CHÍNH: TỈNH/THÀNH PHỐ -> XÃ/PHƯỜNG TRỰC THUỘC
// ----------------------------------------------------------------------
const VIETNAM_STREAMLINED_LOCATIONS: Record<string, string[]> = {
  'Thành phố Hồ Chí Minh': [
    'Phường Sài Gòn', 'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Ông Lãnh', 'Phường Tân Định',
    'Phường Đa Kao', 'Phường Bàn Cờ', 'Phường Xuân Hòa', 'Phường Nhiêu Lộc', 'Phường Khánh Hội',
    'Phường Xóm Chiếu', 'Phường Vĩnh Hội', 'Phường Chợ Quán', 'Phường An Đông', 'Phường Chợ Lớn',
    'Phường Bình Tiên', 'Phường Bình Tây', 'Phường Bình Phú', 'Phường Phú Lâm', 'Phường Rạch Ông',
    'Phường Hưng Phú', 'Phường Xóm Củi', 'Phường An Khánh', 'Phường Thảo Điền', 'Phường Thủ Thiêm',
    'Phường Hiệp Bình Chánh', 'Phường Linh Trung', 'Phường Tăng Nhơn Phú', 'Phường Phú Hữu',
    'Phường Tân Thuận', 'Phường Phú Mỹ', 'Phường Tân Hưng', 'Phường Tân Phong', 'Phường Bình Hưng Hòa',
    'Phường Tân Tạo', 'Phường Gia Định', 'Phường Hạnh Thông', 'Phường An Nhơn', 'Xã Tân Túc',
    'Xã Bình Chánh', 'Xã Vĩnh Lộc', 'Xã Củ Chi', 'Xã Tân An Hội', 'Xã Hóc Môn', 'Xã Bà Điểm',
    'Xã Nhà Bè', 'Xã Phước Kiển', 'Xã Cần Thạnh', 'Xã Bình Khánh',
  ],
  'Thành phố Hà Nội': [
    'Phường Ba Đình', 'Phường Quán Thánh', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Tràng Tiền',
    'Phường Hàng Bạc', 'Phường Đồng Xuân', 'Phường Cửa Nam', 'Phường Tây Hồ', 'Phường Quảng An',
    'Phường Thụy Khuê', 'Phường Cầu Giấy', 'Phường Dịch Vọng', 'Phường Nghĩa Đô', 'Phường Trung Hòa',
    'Phường Văn Miếu', 'Phường Ô Chợ Dừa', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Bạch Mai',
    'Phường Vĩnh Tuy', 'Phường Bách Khoa', 'Phường Hoàng Mai', 'Phường Định Công', 'Phường Giáp Bát',
    'Phường Thanh Xuân', 'Phường Nhân Chính', 'Phường Khương Đình', 'Phường Long Biên', 'Phường Bồ Đề',
    'Phường Mỹ Đình', 'Phường Mễ Trì', 'Phường Cổ Nhuế', 'Phường Xuân Đỉnh', 'Phường Hà Đông',
    'Phường Vạn Phúc', 'Xã Sóc Sơn', 'Xã Phù Lỗ', 'Xã Đông Anh', 'Xã Cổ Loa', 'Xã Gia Lâm', 'Xã Thanh Trì',
  ],
  'Thành phố Đà Nẵng': [
    'Phường Hải Châu', 'Phường Thạch Thang', 'Phường Thuận Phước', 'Phường Hòa Cường', 'Phường An Hải',
    'Phường Phước Mỹ', 'Phường Thọ Quang', 'Phường Thanh Khê', 'Phường Tam Thuận', 'Phường Mỹ An',
    'Phường Khuê Mỹ', 'Phường Hòa Khánh', 'Phường Hòa Minh', 'Phường Cẩm Lệ', 'Phường Hòa Xuân',
    'Xã Hòa Vang', 'Xã Hòa Tiến', 'Xã Hòa Ninh', 'Đặc khu Hoàng Sa',
  ],
  'Thành phố Hải Phòng': [
    'Phường Hồng Bàng', 'Phường Hạ Lý', 'Phường Ngô Quyền', 'Phường Cầu Đất', 'Phường Lê Chân',
    'Phường An Biên', 'Phường Hải An', 'Phường Cát Bi', 'Phường Kiến An', 'Phường Đồ Sơn',
    'Phường Dương Kinh', 'Xã Thủy Nguyên', 'Xã An Dương', 'Xã Cát Bà',
  ],
  'Thành phố Cần Thơ': [
    'Phường Ninh Kiều', 'Phường Cái Khế', 'Phường An Khánh', 'Phường Bình Thủy', 'Phường Trà Nóc',
    'Phường Cái Răng', 'Phường Hưng Phú', 'Phường Ô Môn', 'Phường Thốt Nốt', 'Xã Phong Điền',
  ],
  'Tỉnh Bình Dương': [
    'Phường Thủ Dầu Một', 'Phường Phú Cường', 'Phường Dĩ An', 'Phường An Bình', 'Phường Thuận An',
    'Phường Lái Thiêu', 'Phường Bến Cát', 'Phường Tân Uyên', 'Xã Bàu Bàng',
  ],
  'Tỉnh Đồng Nai': [
    'Phường Biên Hòa', 'Phường Quyết Thắng', 'Phường Trảng Dài', 'Phường Long Khánh',
    'Xã Long Thành', 'Xã Nhơn Trạch', 'Xã Trảng Bom', 'Xã Vĩnh Cửu',
  ],
  'Tỉnh Bà Rịa - Vũng Tàu': [
    'Phường Vũng Tàu', 'Phường Thắng Tam', 'Phường Bà Rịa', 'Phường Phước Hưng', 'Phường Phú Mỹ',
    'Xã Long Đất', 'Xã Châu Đức', 'Xã Côn Đảo',
  ],
  'Tỉnh Lâm Đồng': [
    'Phường Đà Lạt', 'Phường 1', 'Phường 10', 'Phường Bảo Lộc', 'Phường B’Lao',
    'Xã Đức Trọng', 'Xã Lạc Dương', 'Xã Đơn Dương',
  ],
  'Tỉnh Khánh Hòa': [
    'Phường Nha Trang', 'Phường Lộc Thọ', 'Phường Vĩnh Hải', 'Phường Cam Ranh', 'Phường Ninh Hòa',
    'Xã Diên Khánh', 'Xã Vạn Ninh', 'Huyện đảo Trường Sa',
  ],
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [createdTotalAmount, setCreatedTotalAmount] = useState(0);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'store'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  const [customerGender, setCustomerGender] = useState<'anh' | 'chi'>('anh');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Tỉnh/Thành phố -> Xã/Phường
  const provincesList = Object.keys(VIETNAM_STREAMLINED_LOCATIONS);
  const [province, setProvince] = useState('Thành phố Hồ Chí Minh');
  const wardsList = VIETNAM_STREAMLINED_LOCATIONS[province] || ['Phường / Xã khác'];
  const [ward, setWard] = useState(wardsList[0] || '');

  const [streetAddress, setStreetAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedStore, setSelectedStore] = useState('61-63 Trần Quang Khải, P. Tân Định, Quận 1');

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const newWards = VIETNAM_STREAMLINED_LOCATIONS[newProv] || ['Phường / Xã khác'];
    setWard(newWards[0] || '');
  };

  // VAT
  const [needVat, setNeedVat] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Voucher
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setCurrentUser(parsed);
        if (parsed.fullName || parsed.name) setCustomerName(parsed.fullName || parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.email) setCustomerEmail(parsed.email);
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'FOGO100') {
      setDiscountAmount(100000);
      setCouponError('');
      setToast({ show: true, type: 'success', message: 'Áp dụng mã giảm giá FOGO100: Giảm 100.000đ' });
    } else if (code === 'VIPAPPLE') {
      setDiscountAmount(500000);
      setCouponError('');
      setToast({ show: true, type: 'success', message: 'Áp dụng mã giảm giá VIPAPPLE: Giảm 500.000đ' });
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
      setToast({ show: true, type: 'error', message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.' });
    }
  };

  const shippingFee = 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount + shippingFee);
  const formatVnd = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    const cleanEmail = customerEmail.trim();

    if (!cleanName) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền họ và tên người nhận hàng.' });
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam chuẩn
    const phoneRegex = /^(0|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setToast({ show: true, type: 'error', message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số di động.' });
      return;
    }

    // Kiểm tra định dạng email nếu người dùng nhập
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setToast({ show: true, type: 'error', message: 'Địa chỉ email không đúng định dạng.' });
        return;
      }
    }

    if (deliveryMethod === 'delivery' && !streetAddress.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng nhập số nhà và tên đường cụ thể.' });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setToast({ show: true, type: 'error', message: 'Giỏ hàng đang trống, không thể tạo đơn hàng.' });
      return;
    }

    setIsSubmitting(true);

    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    let userId: string | null = null;
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        userId = u.id || u._id || null;
      } catch {}
    }

    const fullAddress = `${streetAddress.trim()}, ${ward}, ${province}`;

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || undefined,
          isGuest: !userId,
          customerName: cleanName,
          customerPhone: cleanPhone,
          customerEmail: cleanEmail || undefined,
          gender: customerGender,
          deliveryMethod: deliveryMethod === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng',
          province,
          ward,
          district: ward,
          address: fullAddress,
          storeAddress: deliveryMethod === 'store' ? selectedStore : undefined,
          note: note.trim(),
          paymentMethod,
          items: cartItems.map((item) => ({
            id: item.id,
            variantId: item.variantId || item.id,
            name: item.name || item.productName,
            storage: item.storage || 'Tiêu chuẩn',
            color: item.color || 'Mặc định',
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            imageUrl: item.imageUrl || item.image || '',
          })),
          subTotal: totalPrice,
          totalAmount: finalPrice,
          discountAmount,
          shippingFee,
          needVat,
          vatInfo: needVat ? {
            companyName: companyName.trim(),
            taxCode: taxCode.trim(),
            companyAddress: companyAddress.trim()
          } : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Đặt hàng không thành công');
      }

      const orderCode = result.data?.orderCode || result.data?.id || `DH${Date.now()}`;

      setToast({
        show: true,
        type: 'success',
        message: `Đặt hàng thành công! Mã đơn: ${orderCode}`,
      });

      if (paymentMethod === 'vnpay-qr' || paymentMethod === 'momo') {
        setCreatedOrderCode(orderCode);
        setCreatedTotalAmount(finalPrice);
        setIsQrModalOpen(true);
      } else {
        clearCart();
        setTimeout(() => {
          router.push(`/tra-cuu-don-hang?code=${orderCode}`);
        }, 1200);
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      setToast({
        show: true,
        type: 'error',
        message: error.message || 'Không thể kết nối máy chủ đặt hàng. Vui lòng thử lại!',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmQrSuccess = () => {
    clearCart();
    setIsQrModalOpen(false);
    router.push(`/tra-cuu-don-hang?code=${createdOrderCode}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none relative">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-gray-500">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/iphone" className="hover:text-[#d70018]">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Thanh toán & Đặt hàng</span>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/gio-hang" className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#d70018] transition-colors">
              <ChevronLeft size={16} />
              <span>Quay lại giỏ hàng</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              THANH TOÁN ĐƠN HÀNG
            </h1>
            <div className="w-16" />
          </div>

          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg mb-6 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Đang đặt hàng với tài khoản: <strong>{currentUser.fullName || currentUser.name || currentUser.email}</strong>
                </span>
              </div>
              <Link href="/tra-cuu-don-hang" className="font-bold underline hover:text-emerald-950">
                Đơn hàng của tôi
              </Link>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-4 py-3 rounded-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <span>
                💡 Bạn có thể đặt hàng nhanh ngay bên dưới mà không cần đăng nhập.
              </span>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#d70018] text-white px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors cursor-pointer w-fit"
              >
                <LogIn size={13} />
                <span>Đăng nhập để tích điểm</span>
              </button>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <p className="text-gray-600 font-semibold mb-4">Giỏ hàng của bạn đang trống.</p>
              <Link href="/iphone" className="bg-[#d70018] text-white px-6 py-2.5 rounded-lg font-bold text-xs inline-flex items-center gap-2 hover:bg-[#b50014] transition-colors shadow-sm">
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. THÔNG TIN KHÁCH HÀNG */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>1. Thông tin người đặt hàng</span>
                  </h2>

                  <div className="flex items-center gap-6 mb-4 text-xs font-semibold text-gray-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={customerGender === 'anh'}
                        onChange={() => setCustomerGender('anh')}
                        className="accent-[#d70018]"
                      />
                      <span>Anh</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={customerGender === 'chi'}
                        onChange={() => setCustomerGender('chi')}
                        className="accent-[#d70018]"
                      />
                      <span>Chị</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Họ và tên <span className="text-[#d70018]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Số điện thoại nhận hàng <span className="text-[#d70018]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ví dụ: 0987654321"
                        className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Email (để nhận hóa đơn & cập nhật vận đơn)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. HÌNH THỨC NHẬN HÀNG */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>2. Hình thức nhận hàng</span>
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Truck size={16} />
                      <span>Giao hàng tận nơi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('store')}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'store'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Store size={16} />
                      <span>Nhận tại cửa hàng</span>
                    </button>
                  </div>

                  {deliveryMethod === 'delivery' ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Tỉnh / Thành phố</label>
                          <select
                            value={province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {provincesList.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Xã / Phường / Thị trấn</label>
                          <select
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {wardsList.map((wName) => (
                              <option key={wName} value={wName}>{wName}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Số nhà, Tên đường, Khu phố <span className="text-[#d70018]">*</span>
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod === 'delivery'}
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai, Khu phố 2"
                          className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Ghi chú giao hàng</label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút"
                          className="w-full text-xs border border-gray-300 rounded-md px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Chọn chi nhánh Fogo Store:</label>
                      {[
                        '61-63 Trần Quang Khải, P. Tân Định, TP. Hồ Chí Minh',
                        '243-245A Dương Bá Trạc, P. Rạch Ông, TP. Hồ Chí Minh',
                        '179 Khánh Hội, P. Khánh Hội, TP. Hồ Chí Minh',
                        '490-492 Lê Hồng Phong, P. Vườn Lài, TP. Hồ Chí Minh',
                      ].map((st, i) => (
                        <label
                          key={i}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                            selectedStore === st
                              ? 'border-[#d70018] bg-red-50/40 text-gray-900 font-semibold'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="storeSelect"
                            checked={selectedStore === st}
                            onChange={() => setSelectedStore(st)}
                            className="mt-0.5 accent-[#d70018]"
                          />
                          <div>
                            <span className="font-bold block text-gray-900">Chi nhánh {i + 1}: {st}</span>
                            <span className="text-[11px] text-emerald-600 font-medium">Sẵn hàng - Giữ máy trong 24 giờ</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. PHƯƠNG THỨC THANH TOÁN */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>3. Chọn phương thức thanh toán</span>
                  </h2>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'vnpay-qr',
                        title: 'Quét mã VietQR (Tự động nhận tiền 24/7)',
                        desc: 'Tự động tạo mã QR có sẵn số tiền & nội dung đơn hàng để chuyển khoản',
                        icon: <QrCode size={18} className="text-[#d70018]" />,
                        badge: 'Khuyên dùng',
                      },
                      {
                        id: 'cod',
                        title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                        desc: 'Nhận máy, kiểm tra hàng chính hãng nguyên seal rồi mới thanh toán',
                        icon: <Receipt size={18} className="text-[#d70018]" />,
                      },
                      {
                        id: 'card',
                        title: 'Thanh toán thẻ Visa, MasterCard, JCB, Thẻ ATM',
                        desc: 'Cổng thanh toán thẻ nội địa & quốc tế bảo mật',
                        icon: <CreditCard size={18} className="text-[#d70018]" />,
                      },
                      {
                        id: 'momo',
                        title: 'Ví MoMo / ZaloPay',
                        desc: 'Quét mã thanh toán tức thì qua ví điện tử',
                        icon: <Wallet size={18} className="text-[#d70018]" />,
                      },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                          paymentMethod === p.id
                            ? 'border-2 border-[#d70018] bg-red-50/40 shadow-2xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === p.id}
                          onChange={() => setPaymentMethod(p.id)}
                          className="mt-1 accent-[#d70018]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                            {p.icon}
                            <span>{p.title}</span>
                            {p.badge && (
                              <span className="bg-[#d70018] text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">{p.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* VAT */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={needVat}
                        onChange={(e) => setNeedVat(e.target.checked)}
                        className="rounded accent-[#d70018]"
                      />
                      <span>Yêu cầu xuất hóa đơn điện tử VAT (Công ty / Doanh nghiệp)</span>
                    </label>

                    {needVat && (
                      <div className="mt-3.5 space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          required={needVat}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tên công ty đầy đủ theo ĐKKD"
                          className="w-full text-xs border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          placeholder="Mã số thuế"
                          className="w-full text-xs border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Địa chỉ trụ sở công ty"
                          className="w-full text-xs border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: GIỎ HÀNG & NÚT ĐẶT HÀNG */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Đơn hàng của bạn</span>
                      <span className="text-gray-400 text-xs font-normal">({cartItems.length} món)</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-3.5 flex gap-3 items-start">
                        <div className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-1 flex items-center justify-center">
                          <img src={item.imageUrl || '/placeholder.png'} alt={item.name || 'Sản phẩm'} className="max-h-full max-w-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Phân loại: <strong className="text-gray-700">{item.storage || 'Tiêu chuẩn'}</strong> - {item.color || 'Mặc định'}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-300 rounded bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-black text-[#d70018]">
                              {formatVnd(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mã giảm giá */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Mã: FOGO100 hoặc VIPAPPLE"
                          className="w-full text-xs border border-gray-300 rounded-md pl-8 pr-3 py-2 uppercase font-semibold focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-md transition-colors cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {discountAmount > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Đã áp dụng mã giảm giá thành công!</span>
                      </p>
                    )}
                    {couponError && <p className="text-[11px] text-red-500 font-medium mt-1.5">{couponError}</p>}
                  </div>

                  {/* Tiền hàng */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính tiền hàng:</span>
                      <span className="font-semibold text-gray-900">{formatVnd(totalPrice)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Giảm giá khuyến mại:</span>
                        <span>-{formatVnd(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Phí giao hàng:</span>
                      <span className="text-emerald-600 font-semibold">Miễn phí</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-900">TỔNG TIỀN THANH TOÁN:</span>
                      <span className="text-base md:text-lg font-black text-[#d70018]">{formatVnd(finalPrice)}</span>
                    </div>
                  </div>

                  {/* Nút Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#d70018] hover:bg-[#b50014] text-white py-3.5 rounded-lg font-black text-sm uppercase tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>ĐANG TẠO ĐƠN HÀNG...</span>
                      </>
                    ) : (
                      <>
                        <span>{paymentMethod === 'vnpay-qr' ? 'TIẾP TỤC QUÉT MÃ THANH TOÁN' : 'HOÀN TẤT ĐẶT HÀNG'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Bảo mật 100%</span>
                    </span>
                    <span>•</span>
                    <span>Chính hãng VN/A</span>
                    <span>•</span>
                    <span>Đổi mới 30 ngày</span>
                  </div>
                </div>
              </div>

            </form>
          )}
        </main>
      </div>

      <QrPaymentModal
        isOpen={isQrModalOpen}
        orderCode={createdOrderCode}
        totalAmount={createdTotalAmount}
        onClose={() => setIsQrModalOpen(false)}
        onSuccess={handleConfirmQrSuccess}
      />

      <Footer />
    </div>
  );
}