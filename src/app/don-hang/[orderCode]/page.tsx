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
  X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastNotification } from '@/components/common/ToastNotification';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function OrderDetailPage() {
  const params = useParams();
  const orderCode = typeof params?.orderCode === 'string' ? params.orderCode : '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Modal Sửa Thông Tin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNote, setEditNote] = useState('');

  // 1. Fetch thông tin đơn hàng
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
      } else {
        setToast({
          show: true,
          type: 'error',
          message: json.error || 'Không tìm thấy thông tin đơn hàng này!',
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        type: 'error',
        message: 'Lỗi kết nối máy chủ lấy dữ liệu đơn!',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderCode]);

  // 2. Xử lý Hủy đơn hàng
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
        setToast({
          show: true,
          type: 'success',
          message: 'Hủy đơn hàng thành công!',
        });
        setOrder(data.data);
      } else {
        setToast({
          show: true,
          type: 'error',
          message: data.error || 'Không thể hủy đơn hàng này!',
        });
      }
    } catch {
      setToast({
        show: true,
        type: 'error',
        message: 'Lỗi kết nối hủy đơn hàng!',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Xử lý Lưu cập nhật thông tin
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      setToast({
        show: true,
        type: 'error',
        message: 'Họ tên và số điện thoại không được để trống!',
      });
      return;
    }

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
        setToast({
          show: true,
          type: 'success',
          message: 'Cập nhật thông tin đơn hàng thành công!',
        });
        setOrder(data.data);
        setIsEditModalOpen(false);
      } else {
        setToast({
          show: true,
          type: 'error',
          message: data.error || 'Cập nhật không thành công!',
        });
      }
    } catch {
      setToast({
        show: true,
        type: 'error',
        message: 'Lỗi kết nối cập nhật đơn!',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const renderStatusBadge = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} />
            Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={13} />
            Đang vận chuyển
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            Giao hàng thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded bg-red-50 text-red-600 border border-red-200">
            <XCircle size={13} />
            Đã hủy đơn
          </span>
        );
      default:
        return <span className="text-xs font-bold px-3 py-1 rounded bg-gray-100 text-gray-700">{st}</span>;
    }
  };

  const isCancelled = order?.orderStatus === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between select-none relative">
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
              <Loader2 size={36} className="animate-spin text-[#d70018] mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-500">Đang nạp chi tiết đơn hàng...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-xs space-y-6">
              
              {/* PHẦN HEADER THÔNG BÁO */}
              <div className="text-center space-y-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ring-8 ${
                  isCancelled ? 'bg-red-50 text-[#d70018] ring-red-50/60' : 'bg-emerald-50 text-[#00a859] ring-emerald-50/60'
                }`}>
                  {isCancelled ? <AlertTriangle size={36} strokeWidth={2.5} /> : <CheckCircle2 size={36} strokeWidth={2.5} />}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {isCancelled ? 'Đơn Hàng Đã Bị Hủy' : 'Đặt Hàng Thành Công!'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                    {isCancelled 
                      ? 'Đơn hàng này đã được xác nhận hủy theo yêu cầu của bạn.' 
                      : 'Cảm ơn bạn đã tin tưởng mua sắm tại Fogo Store. Đơn hàng của bạn đã sẵn sàng xử lý!'}
                  </p>
                </div>

                {/* MÃ ĐƠN & TRẠNG THÁI */}
                <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                    <span>Mã đơn hàng:</span>
                    <span className="text-base font-black text-[#d70018] tracking-wider font-mono">
                      {orderCode}
                    </span>
                  </div>
                  {order && renderStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* NÚT CHỨC NĂNG CHỈNH SỬA & HỦY ĐƠN */}
              {order && !isCancelled && order.orderStatus !== 'SHIPPING' && order.orderStatus !== 'COMPLETED' && (
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Sửa thông tin nhận</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCancelOrder}
                    className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    <span>Hủy đơn hàng</span>
                  </button>
                </div>
              )}

              {/* CHI TIẾT ĐƠN HÀNG */}
              {order && (
                <div className="border-t border-gray-100 pt-6 space-y-6">
                  
                  {/* Người nhận & Địa chỉ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/70 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                        <Phone size={14} className="text-[#d70018]" />
                        <span>Người nhận hàng</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                      <p className="text-gray-600 font-mono">{order.customerPhone}</p>
                      {order.customerEmail && <p className="text-gray-500">{order.customerEmail}</p>}
                    </div>

                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/70 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                        <MapPin size={14} className="text-[#d70018]" />
                        <span>Hình thức & Địa chỉ</span>
                      </div>
                      <p className="font-bold text-gray-900">{order.deliveryMethod || 'Giao hàng tận nơi'}</p>
                      <p className="text-gray-600 leading-relaxed">
                        {order.address
                          ? `${order.address}${order.district ? ', ' + order.district : ''}${order.province ? ', ' + order.province : ''}`
                          : (order.storeAddress || 'Tại cửa hàng Fogo Store')}
                      </p>
                      {order.note && <p className="text-gray-500 italic">Ghi chú: {order.note}</p>}
                    </div>
                  </div>

                  {/* DANH SÁCH SẢN PHẨM ĐÃ MUA */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-gray-700 flex items-center gap-1.5">
                      <Package size={15} className="text-[#d70018]" />
                      <span>Sản phẩm trong đơn ({order.items?.length || 0})</span>
                    </h2>

                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((it: any, idx: number) => (
                          <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3.5">
                              <div className="w-14 h-14 rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0 bg-white shadow-2xs">
                                <img
                                  src={it.imageUrl || '/placeholder.png'}
                                  alt=""
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm leading-snug">{it.productName}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Phân loại: <b className="text-gray-700">{it.storage}</b> - {it.color} • SL: <b className="text-gray-900">x{it.quantity}</b>
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-[#d70018] text-sm whitespace-nowrap">
                              {formatVnd(it.price * it.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400">Không có sản phẩm nào</div>
                      )}
                    </div>
                  </div>

                  {/* TỔNG TIỀN VÀ THANH TOÁN */}
                  <div className="flex justify-between items-center p-4 bg-red-50/50 border border-red-100 rounded-xl">
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CreditCard size={14} className="text-[#d70018]" />
                        <span>
                          {order.paymentMethod === 'cod' || order.paymentMethod === 'COD'
                            ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                            : order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Trạng thái thanh toán: <b>{order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</b>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 block font-medium">Tổng thanh toán</span>
                      <span className="text-lg sm:text-xl font-black text-[#d70018]">
                        {formatVnd(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CAM KẾT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-[11px] text-gray-600">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#00a859]" />
                  <span>100% Chính Hãng Apple</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Clock size={16} className="text-[#00a859]" />
                  <span>Lỗi 1 đổi 1 trong 45 ngày</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Package size={16} className="text-[#00a859]" />
                  <span>Giao hàng toàn quốc</span>
                </div>
              </div>

              {/* NÚT ĐIỀU HƯỚNG */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-3 bg-[#d70018] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Home size={15} />
                  <span>TIẾP TỤC MUA SẮM</span>
                </Link>
                <Link
                  href="/tra-cuu-don-hang"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Search size={15} />
                  <span>TRA CỨU ĐƠN HÀNG</span>
                </Link>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL POPUP CHỈNH SỬA THÔNG TIN ĐƠN HÀNG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative border border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Chỉnh Sửa Thông Tin Nhận Hàng
            </h3>

            <form onSubmit={handleUpdateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Số nhà, tên đường..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú giao hàng</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Giờ giao, lưu ý đặc biệt..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#d70018]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>LƯU THAY ĐỔI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}