'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  Phone, 
  CreditCard, 
  Home, 
  Search,
  ShieldCheck,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Loader2,
  X,
  QrCode,
  Wallet,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastNotification } from '@/components/common/ToastNotification';
import { QrPaymentModal } from '@/components/checkout/QrPaymentModal';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function OrderDetailPage() {
  const params = useParams();
  const orderCode = typeof params?.orderCode === 'string' ? params.orderCode : '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast thông báo
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Modal Sửa Thông Tin Nhận Hàng
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNote, setEditNote] = useState('');

  // Modal Đổi Phương Thức Thanh Toán
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');

  // Modal Quét QR Thanh Toán Trực Tiếp
  const [isQrOpen, setIsQrOpen] = useState(false);

  const fetchOrder = async () => {
    if (!orderCode) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders/${orderCode}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setOrder(json.data);
        setEditName(json.data.customerName || '');
        setEditPhone(json.data.customerPhone || '');
        setEditAddress(json.data.address || '');
        setEditNote(json.data.note || '');
        setSelectedPayment(json.data.paymentMethod || 'cod');
      }
    } catch {
      setToast({
        show: true,
        type: 'error',
        message: 'Không thể kết nối máy chủ lấy dữ liệu đơn hàng.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderCode]);

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderCode}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ show: true, type: 'success', message: 'Hủy đơn hàng thành công!' });
        setOrder(data.data);
      } else {
        setToast({ show: true, type: 'error', message: data.error || 'Hủy đơn thất bại!' });
      }
    } catch {
      setToast({ show: true, type: 'error', message: 'Lỗi kết nối hủy đơn!' });
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật thông tin nhận hàng
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderCode}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editName,
          customerPhone: editPhone,
          address: editAddress,
          note: editNote,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ show: true, type: 'success', message: 'Cập nhật địa chỉ nhận hàng thành công!' });
        setOrder(data.data);
        setIsEditModalOpen(false);
      } else {
        setToast({ show: true, type: 'error', message: data.error || 'Cập nhật thất bại!' });
      }
    } catch {
      setToast({ show: true, type: 'error', message: 'Lỗi kết nối máy chủ!' });
    } finally {
      setActionLoading(false);
    }
  };

  // Đổi phương thức thanh toán
  const handleChangePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderCode}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedPayment }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ show: true, type: 'success', message: 'Đổi phương thức thanh toán thành công!' });
        setOrder(data.data);
        setIsPaymentModalOpen(false);

        // Nếu chuyển sang VietQR hoặc Momo thì tự động bật modal QR thanh toán luôn
        if (selectedPayment === 'vnpay-qr' || selectedPayment === 'momo') {
          setIsQrOpen(true);
        }
      } else {
        setToast({ show: true, type: 'error', message: data.error || 'Đổi phương thức thất bại!' });
      }
    } catch {
      setToast({ show: true, type: 'error', message: 'Lỗi kết nối máy chủ!' });
    } finally {
      setActionLoading(false);
    }
  };

  // Xác nhận sau khi quét QR xong
  const handleConfirmQrPaid = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderCode}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.data);
        setToast({ show: true, type: 'success', message: 'Đã ghi nhận thanh toán thành công!' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsQrOpen(false);
    }
  };

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const getPaymentName = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cod':
        return 'Thanh toán tiền mặt khi nhận hàng (COD)';
      case 'vnpay-qr':
        return 'Chuyển khoản / Quét mã VietQR';
      case 'momo':
        return 'Ví MoMo / ZaloPay';
      case 'card':
        return 'Thanh toán thẻ Visa, MasterCard, ATM';
      default:
        return method?.toUpperCase() || 'Tiền mặt (COD)';
    }
  };

  const renderStatusBadge = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={16} />
            Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={16} />
            Đang vận chuyển
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={16} />
            Giao hàng thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
            <XCircle size={16} />
            Đã hủy đơn
          </span>
        );
      default:
        return <span className="text-sm font-bold px-3.5 py-1.5 rounded-lg bg-gray-100 text-gray-700">{st}</span>;
    }
  };

  const isCancelled = order?.orderStatus === 'CANCELLED';
  const isPaid = order?.paymentStatus === 'PAID';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between select-none relative text-gray-800">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-sm">
          <Header />
          <Navbar />
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
              <Loader2 size={40} className="animate-spin text-[#d70018] mx-auto mb-3" />
              <p className="text-base font-bold text-gray-500">Đang nạp chi tiết đơn hàng...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-xs space-y-8">
              
              {/* PHẦN HEADER THÔNG BÁO */}
              <div className="text-center space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-8 ${
                  isCancelled ? 'bg-red-50 text-[#d70018] ring-red-50/60' : 'bg-emerald-50 text-[#00a859] ring-emerald-50/60'
                }`}>
                  {isCancelled ? <AlertTriangle size={42} strokeWidth={2.5} /> : <CheckCircle2 size={42} strokeWidth={2.5} />}
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    {isCancelled ? 'Đơn Hàng Đã Bị Hủy' : 'Đặt Hàng Thành Công!'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
                    {isCancelled 
                      ? 'Đơn hàng này đã được hủy theo yêu cầu của bạn.' 
                      : 'Cảm ơn bạn đã tin tưởng mua sắm tại Fogo Store. Đơn hàng của bạn đã sẵn sàng xử lý!'}
                  </p>
                </div>

                {/* MÃ ĐƠN & TRẠNG THÁI */}
                <div className="inline-flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                    <span>Mã đơn hàng:</span>
                    <span className="text-lg font-black text-[#d70018] tracking-wider font-mono">
                      {orderCode}
                    </span>
                  </div>
                  {order && renderStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* CÁC NÚT THAO TÁC CỦA KHÁCH */}
              {order && !isCancelled && order.orderStatus !== 'SHIPPING' && order.orderStatus !== 'COMPLETED' && (
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <CreditCard size={16} />
                    <span>Đổi phương thức thanh toán</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit3 size={16} />
                    <span>Sửa thông tin nhận</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCancelOrder}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-sm font-bold text-red-600 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    <span>Hủy đơn hàng</span>
                  </button>
                </div>
              )}

              {/* CHI TIẾT ĐƠN HÀNG */}
              {order && (
                <div className="border-t border-gray-100 pt-6 space-y-7">
                  
                  {/* Người nhận & Địa chỉ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                        <Phone size={17} className="text-[#d70018]" />
                        <span>Người nhận hàng</span>
                      </div>
                      <p className="font-black text-gray-900 text-base">{order.customerName}</p>
                      <p className="text-gray-700 font-mono text-sm">{order.customerPhone}</p>
                      {order.customerEmail && <p className="text-gray-500 text-xs">{order.customerEmail}</p>}
                    </div>

                    <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                        <MapPin size={17} className="text-[#d70018]" />
                        <span>Hình thức & Địa chỉ giao</span>
                      </div>
                      <p className="font-black text-gray-900 text-base">{order.deliveryMethod || 'Giao hàng tận nơi'}</p>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {order.address
                          ? `${order.address}${order.district ? ', ' + order.district : ''}${order.province ? ', ' + order.province : ''}`
                          : (order.storeAddress || 'Tại cửa hàng Fogo Store')}
                      </p>
                      {order.note && <p className="text-gray-500 text-xs italic">Ghi chú: {order.note}</p>}
                    </div>
                  </div>

                  {/* SẢN PHẨM TRONG ĐƠN */}
                  <div className="space-y-4">
                    <h2 className="text-sm sm:text-base font-black uppercase text-gray-800 flex items-center gap-2">
                      <Package size={18} className="text-[#d70018]" />
                      <span>Sản phẩm trong đơn ({order.items?.length || 0})</span>
                    </h2>

                    <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden bg-white">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((it: any, idx: number) => (
                          <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl border border-gray-100 p-1.5 flex items-center justify-center shrink-0 bg-white shadow-2xs">
                                <img
                                  src={it.imageUrl || '/placeholder.png'}
                                  alt=""
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-base leading-snug">{it.productName}</p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  Phân loại: <b className="text-gray-800">{it.storage}</b> - {it.color} • SL: <b className="text-[#d70018]">x{it.quantity}</b>
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-[#d70018] text-base sm:text-lg whitespace-nowrap">
                              {formatVnd(it.price * it.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-gray-400">Không có sản phẩm nào</div>
                      )}
                    </div>
                  </div>

                  {/* KHỐI THANH TOÁN & NÚT THANH TOÁN NGAY */}
                  <div className="p-5 sm:p-6 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800">
                        <CreditCard size={18} className="text-[#d70018]" />
                        <span>{getPaymentName(order.paymentMethod)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <span>Trạng thái:</span>
                        <b className={isPaid ? 'text-[#00a859]' : 'text-amber-700'}>
                          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </b>
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5">
                      <div className="text-left sm:text-right">
                        <span className="text-xs sm:text-sm text-gray-500 block font-medium">Tổng thanh toán:</span>
                        <span className="text-2xl sm:text-3xl font-black text-[#d70018]">
                          {formatVnd(order.totalAmount)}
                        </span>
                      </div>

                      {/* NÚT THANH TOÁN THẲNG LUÔN */}
                      {!isPaid && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => setIsQrOpen(true)}
                          className="px-5 py-2.5 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <QrCode size={16} />
                          <span>THANH TOÁN NGAY BẰNG QR</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CAM KẾT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck size={18} className="text-[#00a859]" />
                  <span>100% Chính Hãng Apple</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock size={18} className="text-[#00a859]" />
                  <span>Lỗi 1 đổi 1 trong 45 ngày</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Package size={18} className="text-[#00a859]" />
                  <span>Giao hàng toàn quốc</span>
                </div>
              </div>

              {/* NÚT ĐIỀU HƯỚNG */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#d70018] hover:bg-red-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Home size={17} />
                  <span>TIẾP TỤC MUA SẮM</span>
                </Link>
                <Link
                  href="/tra-cuu-don-hang"
                  className="w-full sm:w-auto px-7 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Search size={17} />
                  <span>TRA CỨU ĐƠN HÀNG</span>
                </Link>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: SỬA THÔNG TIN NHẬN HÀNG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative border border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              Chỉnh Sửa Thông Tin Nhận Hàng
            </h3>

            <form onSubmit={handleUpdateOrder} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường xã..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú giao hàng</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Giờ giao, dặn dò shipper..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>LƯU THAY ĐỔI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ĐỔI PHƯƠNG THỨC THANH TOÁN */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative border border-gray-200">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              Chọn Phương Thức Thanh Toán Mới
            </h3>

            <form onSubmit={handleChangePaymentMethod} className="space-y-3 text-sm">
              {[
                {
                  id: 'cod',
                  title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                  icon: <Receipt size={18} className="text-[#d70018]" />,
                },
                {
                  id: 'vnpay-qr',
                  title: 'Chuyển khoản / Quét mã VietQR',
                  icon: <QrCode size={18} className="text-[#d70018]" />,
                },
                {
                  id: 'momo',
                  title: 'Ví MoMo / ZaloPay',
                  icon: <Wallet size={18} className="text-[#d70018]" />,
                },
                {
                  id: 'card',
                  title: 'Thanh toán thẻ Visa, MasterCard, ATM',
                  icon: <CreditCard size={18} className="text-[#d70018]" />,
                },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPayment === p.id
                      ? 'border-2 border-[#d70018] bg-red-50/40 font-bold text-gray-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modal_payment"
                    checked={selectedPayment === p.id}
                    onChange={() => setSelectedPayment(p.id)}
                    className="accent-[#d70018]"
                  />
                  {p.icon}
                  <span className="text-xs sm:text-sm">{p.title}</span>
                </label>
              ))}

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  ĐÓNG
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>XÁC NHẬN ĐỔI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUÉT MÃ QR THANH TOÁN TRỰC TIẾP */}
      <QrPaymentModal
        isOpen={isQrOpen}
        orderCode={orderCode}
        totalAmount={order?.totalAmount || 0}
        onClose={() => setIsQrOpen(false)}
        onSuccess={handleConfirmQrPaid}
      />

      <Footer />
    </div>
  );
}