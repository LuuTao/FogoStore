'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Calendar,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  CreditCard,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const API_URL = 'https://fogo-store-api.onrender.com';

interface OrderItem {
  id: string;
  productName: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  address?: string;
  province?: string;
  district?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    // 1. Kiểm tra tài khoản đăng nhập từ localStorage
    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (!rawUser) {
      router.push('/dang-nhap?redirect=/tai-khoan/don-hang');
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser);
      setUser(parsedUser);
      const userId = parsedUser.id || parsedUser._id;

      if (!userId) {
        setError('Không xác định được ID tài khoản. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      // 2. Fetch danh sách đơn hàng của người dùng hiện tại
      fetch(`${API_URL}/api/orders/my-orders?userId=${userId}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setOrders(json.data);
          } else {
            setOrders([]);
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy danh sách đơn:', err);
          setError('Không thể kết nối đến máy chủ lấy danh sách đơn hàng.');
        })
        .finally(() => setLoading(false));
    } catch {
      router.push('/dang-nhap?redirect=/tai-khoan/don-hang');
    }
  }, [router]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={12} />
            Đang giao hàng
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Giao thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200">
            <XCircle size={12} />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
            {status || 'Đang xử lý'}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING';
    if (filterStatus === 'SHIPPING') return o.orderStatus === 'SHIPPING';
    if (filterStatus === 'COMPLETED') return o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED';
    if (filterStatus === 'CANCELLED') return o.orderStatus === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-gray-500">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Lịch sử đơn hàng của tôi</span>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                ĐƠN HÀNG CỦA BẠN
              </h1>
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Xin chào, <strong className="text-gray-800">{user.name || user.email}</strong> • Quản lý các đơn hàng đã đặt
                </p>
              )}
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#d70018] bg-white border border-gray-200 px-3.5 py-2 rounded shadow-2xs transition-colors self-start sm:self-auto"
            >
              <ArrowLeft size={14} />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs">
            {[
              { id: 'ALL', label: 'Tất cả đơn' },
              { id: 'PENDING', label: 'Đang xử lý' },
              { id: 'SHIPPING', label: 'Đang vận chuyển' },
              { id: 'COMPLETED', label: 'Đã hoàn thành' },
              { id: 'CANCELLED', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#d70018] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Vùng nội dung danh sách */}
          {loading ? (
            <div className="bg-white rounded-md p-16 text-center border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-[#d70018] animate-spin" />
              <p className="text-xs font-semibold text-gray-600">Đang nạp dữ liệu đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-md p-8 text-center border border-red-200 shadow-sm max-w-lg mx-auto">
              <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
              <p className="text-xs font-bold text-red-600 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded"
              >
                Tải lại trang
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-md p-16 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#d70018] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} />
              </div>
              <p className="text-gray-900 font-bold text-base mb-1">Chưa có đơn hàng nào</p>
              <p className="text-xs text-gray-500 mb-5">
                {filterStatus === 'ALL'
                  ? 'Tài khoản của bạn chưa thực hiện đặt mua sản phẩm nào.'
                  : 'Không tìm thấy đơn hàng nào ở trạng thái này.'}
              </p>
              <Link
                href="/iphone"
                className="bg-[#d70018] hover:bg-red-700 text-white px-6 py-2.5 rounded font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Khám phá sản phẩm Fogo Store</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden transition-all hover:border-gray-300"
                >
                  {/* Top Bar của Card đơn hàng */}
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package size={14} className="text-[#d70018]" />
                        <span className="font-mono font-bold text-gray-900">{order.orderCode}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                        <Calendar size={13} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {renderStatusBadge(order.orderStatus)}
                      <Link
                        href={`/don-hang/${order.orderCode}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#d70018] hover:underline ml-2"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Danh sách sản phẩm của đơn */}
                  <div className="p-5 divide-y divide-gray-100">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded border border-gray-200 bg-gray-50 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={item.imageUrl || '/placeholder.png'}
                              alt={item.productName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 leading-snug line-clamp-1">{item.productName}</h3>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Phân loại: {item.storage} • {item.color}
                            </p>
                            <span className="text-[11px] text-gray-400 font-semibold">Số lượng: x{item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <span className="font-bold text-gray-900">{formatVnd(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer thông tin nhận hàng & Tổng tiền */}
                  <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {order.customerPhone} ({order.customerName})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {order.address ? `${order.address}, ${order.province}` : order.deliveryMethod}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} />
                        {order.paymentMethod?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-end gap-2 text-right">
                      <span className="text-xs text-gray-600 font-medium">Tổng số tiền:</span>
                      <span className="text-base font-black text-[#d70018]">{formatVnd(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}