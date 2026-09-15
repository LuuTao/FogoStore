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

const API_URL = '[https://fogo-store-api.onrender.com](https://fogo-store-api.onrender.com)';

// Danh sách chuẩn 63 Tỉnh / Thành phố Việt Nam kèm Quận/Huyện tiêu biểu
const VIETNAM_LOCATIONS: Record<string, string[]> = {
  'Hà Nội': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên',
    'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Hoàng Mai',
    'Quận Thanh Xuân', 'Huyện Sóc Sơn', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Huyện Thanh Trì', 'Quận Hà Đông'
  ],
  'TP. Hồ Chí Minh': [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
    'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Tân Bình',
    'Quận Tân Phú', 'Quận Phú Nhuận', 'Quận Gò Vấp', 'TP. Thủ Đức',
    'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè'
  ],
  'Đà Nẵng': [
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn',
    'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hòa Vang'
  ],
  'Hải Phòng': [
    'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An',
    'Quận Kiến An', 'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện An Dương'
  ],
  'Cần Thơ': [
    'Quận Ninh Kiều', 'Quận Ô Môn', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Thốt Nốt'
  ],
  'An Giang': ['TP. Long Xuyên', 'TP. Châu Đốc', 'Huyện An Phú', 'Huyện Tịnh Biên', 'Huyện Tri Tôn'],
  'Bà Rịa - Vũng Tàu': ['TP. Vũng Tàu', 'TP. Bà Rịa', 'Huyện Châu Đức', 'Huyện Xuyên Mộc', 'Huyện Đất Đỏ'],
  'Bắc Giang': ['TP. Bắc Giang', 'Huyện Yên Thế', 'Huyện Tân Yên', 'Huyện Lạng Giang', 'Huyện Lục Nam'],
  'Bắc Kạn': ['TP. Bắc Kạn', 'Huyện Pác Nặm', 'Huyện Ba Bể', 'Huyện Ngân Sơn', 'Huyện Bạch Thông'],
  'Bạc Liêu': ['TP. Bạc Liêu', 'TX. Giá Rai', 'Huyện Hồng Dân', 'Huyện Phước Long', 'Huyện Vĩnh Lợi'],
  'Bắc Ninh': ['TP. Bắc Ninh', 'TP. Từ Sơn', 'Huyện Yên Phong', 'Huyện Quế Võ', 'Huyện Tiên Du'],
  'Bến Tre': ['TP. Bến Tre', 'Huyện Châu Thành', 'Huyện Chợ Lách', 'Huyện Mỏ Cày Nam', 'Huyện Giồng Trôm'],
  'Bình Định': ['TP. Quy Nhơn', 'TX. An Nhơn', 'TX. Hoài Nhơn', 'Huyện An Lão', 'Huyện Hoài Ân'],
  'Bình Dương': ['TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An', 'TX. Bến Cát', 'TX. Tân Uyên', 'Huyện Bàu Bàng'],
  'Bình Phước': ['TP. Đồng Xoài', 'TX. Bình Long', 'TX. Phước Long', 'Huyện Bù Đốp', 'Huyện Bù Gia Mập'],
  'Bình Thuận': ['TP. Phan Thiết', 'TX. La Gi', 'Huyện Tuy Phong', 'Huyện Bắc Bình', 'Huyện Hàm Thuận Bắc'],
  'Cà Mau': ['TP. Cà Mau', 'Huyện U Minh', 'Huyện Thới Bình', 'Huyện Trần Văn Thời', 'Huyện Cái Nước'],
  'Cao Bằng': ['TP. Cao Bằng', 'Huyện Bảo Lạc', 'Huyện Bảo Lâm', 'Huyện Hạ Lang', 'Huyện Hà Quảng'],
  'Đắk Lắk': ['TP. Buôn Ma Thuột', 'TX. Buôn Hồ', 'Huyện Ea Hleo', 'Huyện Ea Súp', 'Huyện Krông Buk'],
  'Đắk Nông': ['TP. Gia Nghĩa', 'Huyện Đắk Glong', 'Huyện Cư Jút', 'Huyện Đắk Mil', 'Huyện Krông Nô'],
  'Điện Biên': ['TP. Điện Biên Phủ', 'TX. Mường Lay', 'Huyện Mường Nhé', 'Huyện Mường Chà', 'Huyện Tủa Chùa'],
  'Đồng Nai': ['TP. Biên Hòa', 'TP. Long Khánh', 'Huyện Long Thành', 'Huyện Nhơn Trạch', 'Huyện Trảng Bom'],
  'Đồng Tháp': ['TP. Cao Lãnh', 'TP. Sa Đéc', 'TP. Hồng Ngự', 'Huyện Tân Hồng', 'Huyện Hồng Ngự'],
  'Gia Lai': ['TP. Pleiku', 'TX. An Khê', 'TX. Ayun Pa', 'Huyện KBang', 'Huyện Đak Đoa'],
  'Hà Giang': ['TP. Hà Giang', 'Huyện Đồng Văn', 'Huyện Mèo Vạc', 'Huyện Yên Minh', 'Huyện Quản Bạ'],
  'Hà Nam': ['TP. Phủ Lý', 'TX. Duy Tiên', 'Huyện Kim Bảng', 'Huyện Lý Nhân', 'Huyện Thanh Liêm'],
  'Hà Tĩnh': ['TP. Hà Tĩnh', 'TX. Hồng Lĩnh', 'TX. Kỳ Anh', 'Huyện Hương Sơn', 'Huyện Đức Thọ'],
  'Hải Dương': ['TP. Hải Dương', 'TP. Chí Linh', 'Huyện Nam Sách', 'Huyện Kinh Môn', 'Huyện Kim Thành'],
  'Hậu Giang': ['TP. Vị Thanh', 'TP. Ngã Bảy', 'TX. Long Mỹ', 'Huyện Châu Thành', 'Huyện Phụng Hiệp'],
  'Hòa Bình': ['TP. Hòa Bình', 'Huyện Đà Bắc', 'Huyện Lương Sơn', 'Huyện Kim Bôi', 'Huyện Cao Phong'],
  'Hưng Yên': ['TP. Hưng Yên', 'Huyện Văn Lâm', 'Huyện Văn Giang', 'Huyện Yên Mỹ', 'Huyện Khoái Châu'],
  'Khánh Hòa': ['TP. Nha Trang', 'TP. Cam Ranh', 'TX. Ninh Hòa', 'Huyện Vạn Ninh', 'Huyện Diên Khánh'],
  'Kiên Giang': ['TP. Rạch Giá', 'TP. Hà Tiên', 'TP. Phú Quốc', 'Huyện Kiên Lương', 'Huyện Hòn Đất'],
  'Kon Tum': ['TP. Kon Tum', 'Huyện Đắk Glei', 'Huyện Ngọc Hồi', 'Huyện Đắk Tô', 'Huyện Kon Rẫy'],
  'Lai Châu': ['TP. Lai Châu', 'Huyện Tam Đường', 'Huyện Mường Tè', 'Huyện Sìn Hồ', 'Huyện Phong Thổ'],
  'Lâm Đồng': ['TP. Đà Lạt', 'TP. Bảo Lộc', 'Huyện Lạc Dương', 'Huyện Đơn Dương', 'Huyện Đức Trọng'],
  'Lạng Sơn': ['TP. Lạng Sơn', 'Huyện Tràng Định', 'Huyện Bình Gia', 'Huyện Văn Lãng', 'Huyện Cao Lộc'],
  'Lào Cai': ['TP. Lào Cai', 'TX. Sa Pa', 'Huyện Bát Xát', 'Huyện Mường Khương', 'Huyện Si Ma Cai'],
  'Long An': ['TP. Tân An', 'TX. Kiến Tường', 'Huyện Tân Hưng', 'Huyện Vĩnh Hưng', 'Huyện Mộc Hóa'],
  'Nam Định': ['TP. Nam Định', 'Huyện Mỹ Lộc', 'Huyện Vụ Bản', 'Huyện Ý Yên', 'Huyện Nam Trực'],
  'Nghệ An': ['TP. Vinh', 'TX. Cửa Lò', 'TX. Thái Hoà', 'TX. Hoàng Mai', 'Huyện Quế Phong', 'Huyện Diễn Châu'],
  'Ninh Bình': ['TP. Ninh Bình', 'TP. Tam Điệp', 'Huyện Nho Quan', 'Huyện Gia Viễn', 'Huyện Hoa Lư'],
  'Ninh Thuận': ['TP. Phan Rang-Tháp Chàm', 'Huyện Bác Ái', 'Huyện Ninh Sơn', 'Huyện Ninh Hải', 'Huyện Thuận Bắc'],
  'Phú Thọ': ['TP. Việt Trì', 'TX. Phú Thọ', 'Huyện Đoan Hùng', 'Huyện Hạ Hòa', 'Huyện Thanh Ba'],
  'Phú Yên': ['TP. Tuy Hòa', 'TX. Sông Cầu', 'TX. Đông Hòa', 'Huyện Đồng Xuân', 'Huyện Tuy An'],
  'Quảng Bình': ['TP. Đồng Hới', 'TX. Ba Đồn', 'Huyện Minh Hóa', 'Huyện Tuyên Hóa', 'Huyện Quảng Trạch'],
  'Quảng Nam': ['TP. Tam Kỳ', 'TP. Hội An', 'TX. Điện Bàn', 'Huyện Tây Giang', 'Huyện Đông Giang'],
  'Quảng Ngãi': ['TP. Quảng Ngãi', 'Huyện Bình Sơn', 'Huyện Trà Bồng', 'Huyện Sơn Tịnh', 'Huyện Tư Nghĩa'],
  'Quảng Ninh': ['TP. Hạ Long', 'TP. Móng Cái', 'TP. Cẩm Phả', 'TP. Uông Bí', 'Huyện Bình Liêu'],
  'Quảng Trị': ['TP. Đông Hà', 'TX. Quảng Trị', 'Huyện Vĩnh Linh', 'Huyện Gio Linh', 'Huyện Cam Lộ'],
  'Sóc Trăng': ['TP. Sóc Trăng', 'TX. Vĩnh Châu', 'TX. Ngã Năm', 'Huyện Kế Sách', 'Huyện Mỹ Tú'],
  'Sơn La': ['TP. Sơn La', 'Huyện Quỳnh Nhai', 'Huyện Thuận Châu', 'Huyện Mường La', 'Huyện Bắc Yên'],
  'Tây Ninh': ['TP. Tây Ninh', 'TX. Hòa Thành', 'TX. Trảng Bàng', 'Huyện Tân Biên', 'Huyện Tân Châu'],
  'Thái Bình': ['TP. Thái Bình', 'Huyện Quỳnh Phụ', 'Huyện Hưng Hà', 'Huyện Đông Hưng', 'Huyện Thái Thụy'],
  'Thái Nguyên': ['TP. Thái Nguyên', 'TP. Sông Công', 'TP. Phổ Yên', 'Huyện Định Hóa', 'Huyện Võ Nhai'],
  'Thanh Hóa': ['TP. Thanh Hóa', 'TP. Sầm Sơn', 'TX. Bỉm Sơn', 'TX. Nghi Sơn', 'Huyện Mường Lát', 'Huyện Hoằng Hóa'],
  'Thừa Thiên Huế': ['TP. Huế', 'TX. Hương Thủy', 'TX. Hương Trà', 'Huyện Phong Điền', 'Huyện Quảng Điền'],
  'Tiền Giang': ['TP. Mỹ Tho', 'TX. Gò Công', 'TX. Cai Lậy', 'Huyện Cái Bè', 'Huyện Cai Lậy'],
  'Trà Vinh': ['TP. Trà Vinh', 'TX. Duyên Hải', 'Huyện Càng Long', 'Huyện Cầu Kè', 'Huyện Tiểu Cần'],
  'Tuyên Quang': ['TP. Tuyên Quang', 'Huyện Lâm Bình', 'Huyện Na Hang', 'Huyện Chiêm Hóa', 'Huyện Hàm Yên'],
  'Vĩnh Long': ['TP. Vĩnh Long', 'TX. Bình Minh', 'Huyện Long Hồ', 'Huyện Tam Bình', 'Huyện Trà Ôn'],
  'Vĩnh Phúc': ['TP. Vĩnh Yên', 'TP. Phúc Yên', 'Huyện Lập Thạch', 'Huyện Tam Dương', 'Huyện Tam Đảo'],
  'Yên Bái': ['TP. Yên Bái', 'TX. Nghĩa Lộ', 'Huyện Lục Yên', 'Huyện Văn Yên', 'Huyện Mù Căng Chải'],
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

  // Quản lý Tỉnh/Thành phố & Quận/Huyện tự động cập nhật
  const provincesList = Object.keys(VIETNAM_LOCATIONS);
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState(VIETNAM_LOCATIONS['TP. Hồ Chí Minh'][0]);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedStore, setSelectedStore] = useState('61-63 Trần Quang Khải, P. Tân Định, Quận 1');

  // Khi thay đổi Tỉnh/Thành phố -> Tự động đổi Quận/Huyện đầu tiên của tỉnh đó
  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const districtsOfNewProv = VIETNAM_LOCATIONS[newProvince] || ['Quận/Huyện khác'];
    setDistrict(districtsOfNewProv[0]);
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
    const syncUser = () => {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          setCurrentUser(parsed);
          if (parsed.name && !customerName) setCustomerName(parsed.name);
          if (parsed.phone && !customerPhone) setCustomerPhone(parsed.phone);
          if (parsed.email && !customerEmail) setCustomerEmail(parsed.email);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setIsAuthModalOpen(true);
      }
    };

    syncUser();
  }, []);

  const handleLoginSuccess = () => {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setCurrentUser(parsed);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.email) setCustomerEmail(parsed.email);
      } catch (err) {
        console.error(err);
      }
    }
    setIsAuthModalOpen(false);
    setToast({
      show: true,
      type: 'success',
      message: 'Đăng nhập thành công! Bạn có thể tiếp tục hoàn tất đơn hàng.',
    });
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'FOGO100') {
      setDiscountAmount(100000);
      setCouponError('');
      setToast({
        show: true,
        type: 'success',
        message: 'Áp dụng mã giảm giá FOGO100: Giảm 100.000đ',
      });
    } else if (code === 'VIPAPPLE') {
      setDiscountAmount(500000);
      setCouponError('');
      setToast({
        show: true,
        type: 'success',
        message: 'Áp dụng mã giảm giá VIPAPPLE: Giảm 500.000đ',
      });
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
      setToast({
        show: true,
        type: 'error',
        message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.',
      });
    }
  };

  const shippingFee = 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount + shippingFee);
  const formatVnd = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (!rawUser) {
      setToast({
        show: true,
        type: 'error',
        message: 'Vui lòng đăng nhập tài khoản để hoàn tất đơn hàng!',
      });
      setIsAuthModalOpen(true);
      return;
    }

    const userObj = JSON.parse(rawUser);
    const userId = userObj.id || userObj._id;

    if (!userId) {
      setToast({
        show: true,
        type: 'error',
        message: 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!',
      });
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền họ và tên người nhận hàng.' });
      return;
    }

    if (!customerPhone.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền số điện thoại nhận hàng.' });
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng nhập địa chỉ giao hàng cụ thể.' });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setToast({ show: true, type: 'error', message: 'Giỏ hàng đang trống, không thể tạo đơn hàng.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          gender: customerGender,
          deliveryMethod: deliveryMethod === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng',
          province,
          district,
          address: address.trim(),
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
          vatInfo: needVat ? { companyName, taxCode, companyAddress } : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Đặt hàng không thành công');
      }

      setToast({
        show: true,
        type: 'success',
        message: `Đặt hàng thành công! Mã đơn: ${result.data?.orderCode || ''}`,
      });

      if (paymentMethod === 'vnpay-qr' || paymentMethod === 'momo') {
        setCreatedOrderCode(result.data.orderCode);
        setCreatedTotalAmount(finalPrice);
        setIsQrModalOpen(true);
      } else {
        clearCart();
        setTimeout(() => {
          router.push(`/don-hang/${result.data.orderCode}`);
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
    router.push(`/don-hang/${createdOrderCode}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none relative">
      <ToastNotification message="{toast.message}" onClose="{()" show="{toast.show}" type="{toast.type}"> setToast((prev) => ({ ...prev, show: false }))}
      />

      <AuthModal isOpen="{isAuthModalOpen}" onClose="{()"> setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header/>
          <Navbar/>
        </div>

        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-gray-500">
            <Link className="hover:text-[#d70018]" href="/">Trang chủ</Link>
            <span>/</span>
            <Link className="hover:text-[#d70018]" href="/iphone">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Thanh toán & Đặt hàng</span>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#d70018] transition-colors" href="/iphone">
              <ChevronLeft size="{16}"/>
              <span>Tiếp tục mua hàng</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              THANH TOÁN ĐƠN HÀNG
            </h1>
            <div className="w-16" />
          </div>

          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="text-emerald-600 shrink-0" size="{16}"/>
                <span>
                  Đang đặt hàng với tài khoản: <strong>{currentUser.name || currentUser.email}</strong>
                </span>
              </div>
              <Link className="font-bold underline hover:text-emerald-950" href="/tai-khoan/don-hang">
                Đơn hàng của tôi
              </Link>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-3 rounded mb-6 flex items-center justify-between">
              <span>Bạn chưa đăng nhập. Vui lòng đăng nhập để lưu và theo dõi đơn hàng của mình.</span>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#d70018] text-white px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors cursor-pointer"
              >
                <LogIn size="{14}"/>
                <span>Đăng nhập ngay</span>
              </button>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-md p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <p className="text-gray-600 font-semibold mb-4">Giỏ hàng của bạn đang trống.</p>
              <Link className="bg-[#d70018] text-white px-6 py-2.5 rounded font-bold text-xs inline-flex items-center gap-2 hover:bg-[#b50014] transition-colors" href="/iphone">
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight size="{14}"/>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. THÔNG TIN KHÁCH HÀNG */}
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
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
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
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
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Email (để nhận hóa đơn điện tử)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. HÌNH THỨC NHẬN HÀNG */}
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>2. Hình thức nhận hàng</span>
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`py-2.5 px-3 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Truck size="{16}"/>
                      <span>Giao hàng tận nơi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('store')}
                      className={`py-2.5 px-3 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'store'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Store size="{16}"/>
                      <span>Nhận tại cửa hàng</span>
                    </button>
                  </div>

                  {deliveryMethod === 'delivery' ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Chọn Tỉnh / Thành phố */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Tỉnh / Thành phố</label>
                          <select
                            value={province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {provincesList.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>

                        {/* Chọn Quận / Huyện tương ứng */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Quận / Huyện</label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {(VIETNAM_LOCATIONS[province] || ['Khác']).map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Địa chỉ cụ thể (Số nhà, Tên đường, Phường/Xã) <span className="text-[#d70018]">*</span>
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod === 'delivery'}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai, Phường Bến Thành"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Ghi chú giao hàng</label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Chọn chi nhánh Fogo Store:</label>
                      {[
                        '61-63 Trần Quang Khải, P. Tân Định, Quận 1',
                        '243-245A Dương Bá Trạc, Phường 1, Quận 8',
                        '179 Khánh Hội, Phường 3, Quận 4',
                        '490-492 Lê Hồng Phong, Phường 1, Quận 10',
                      ].map((st, i) => (
                        <label
                          key={i}
                          className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer text-xs transition-colors ${
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
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>3. Chọn phương thức thanh toán</span>
                  </h2>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'cod',
                        title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                        desc: 'Nhận máy, kiểm tra hàng chính hãng rồi mới trả tiền',
                        icon: <Receipt className="text-[#d70018]" size="{18}"/>,
                      },
                      {
                        id: 'vnpay-qr',
                        title: 'Chuyển khoản / Quét mã VietQR',
                        desc: 'Hiển thị mã QR có sẵn số tiền & nội dung đơn hàng để quét',
                        icon: <QrCode className="text-[#d70018]" size="{18}"/>,
                      },
                      {
                        id: 'card',
                        title: 'Thanh toán thẻ Visa, MasterCard, JCB, Thẻ ATM',
                        desc: 'Không mất phí thanh toán, bảo mật quốc tế',
                        icon: <CreditCard className="text-[#d70018]" size="{18}"/>,
                      },
                      {
                        id: 'momo',
                        title: 'Ví MoMo / ZaloPay',
                        desc: 'Quét mã thanh toán qua ví điện tử',
                        icon: <Wallet className="text-[#d70018]" size="{18}"/>,
                      },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                          paymentMethod === p.id
                            ? 'border-2 border-[#d70018] bg-red-50/40 shadow-xs'
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
                      <div className="mt-3.5 space-y-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <input
                          type="text"
                          required={needVat}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tên công ty đầy đủ theo ĐKKD"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          placeholder="Mã số thuế"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Địa chỉ trụ sở công ty"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: GIỎ HÀNG & NÚT ĐẶT HÀNG */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Đơn hàng của bạn</span>
                      <span className="text-gray-400 text-xs font-normal">({cartItems.length} món)</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-3.5 flex gap-3 items-start">
                        <div className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-200 rounded p-1 flex items-center justify-center">
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
                          <Trash2 size="{15}"/>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mã giảm giá */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="{14}"/>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Mã: FOGO100 hoặc VIPAPPLE"
                          className="w-full text-xs border border-gray-300 rounded pl-8 pr-3 py-2 uppercase font-semibold focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {discountAmount > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size="{13}"/>
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
                    className="w-full mt-6 bg-[#d70018] hover:bg-[#b50014] text-white py-3.5 rounded font-black text-sm uppercase tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size="{18}"/>
                        <span>ĐANG TẠO ĐƠN HÀNG...</span>
                      </>
                    ) : (
                      <>
                        <span>HOÀN TẤT ĐẶT HÀNG</span>
                        <ArrowRight size="{16}"/>
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="text-emerald-600" size="{14}"/>
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

      <QrPaymentModal isOpen="{isQrModalOpen}" onClose="{()" orderCode="{createdOrderCode}" totalAmount="{createdTotalAmount}"> setIsQrModalOpen(false)}
        onSuccess={handleConfirmQrSuccess}
      />

      <Footer/>
    </div>
  );
}