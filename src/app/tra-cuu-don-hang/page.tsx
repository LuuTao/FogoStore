'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const queryOrderCode = searchParams?.get('code') || '';

  const [inputQuery, setInputQuery] = useState(queryOrderCode);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 1. Tự động kiểm tra đơn hàng nếu có mã trên URL hoặc trong localStorage
  useEffect(() => {
    const savedCode = queryOrderCode || (typeof window !== 'undefined' ? localStorage.getItem('last_order_code') : '');
    if (savedCode) {
      setInputQuery(savedCode);
      handleSearchOrders(savedCode);
    }
  }, [queryOrderCode]);

  // 2. Gọi API tìm kiếm đơn hàng linh hoạt theo biến môi trường
  const handleSearchOrders = async (queryValue?: string) => {
    const target = (queryValue !== undefined ? queryValue : inputQuery).trim();
    if (!target) {
      alert('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại để tra cứu');
      return;
    }

    setLoading(true);
    setSearched(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com';

    try {
      const res = await fetch(`${baseUrl}/api/orders/track?query=${encodeURIComponent(target)}`, {
        cache: 'no-store',
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Lỗi khi tra cứu đơn hàng:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={13} /> Hoàn tất đơn hàng
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
            <Truck size={13} /> Đang giao hàng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
            <ShieldAlert size={13} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
            <Clock size={13} /> Đang xử lý
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs text-gray-500">
          <div className="max-w-5xl mx-auto flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-bold">Tra cứu đơn hàng</span>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* KHỐI TÌM KIẾM ĐƠN HÀNG */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-xs mb-8 text-center">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
              Tra Cứu Tiến Độ Đơn Hàng
            </h1>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              Nhập chính xác <strong>Số điện thoại đặt hàng</strong> hoặc <strong>Mã đơn hàng</strong> (VD: FG-123456) để xem chi tiết sản phẩm và thời gian giao dự kiến.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchOrders();
              }}
              className="max-w-lg mx-auto flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Nhập số điện thoại hoặc mã đơn..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#d70018] font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d70018] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang kiểm tra...' : 'Tra cứu'}
              </button>
            </form>
          </div>

          {/* KẾT QUẢ ĐƠN HÀNG */}
          {loading ? (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-200 text-xs text-gray-500">
              <Clock className="animate-spin mx-auto text-[#d70018] mb-2" size={28} />
              <span>Đang kiểm tra dữ liệu đơn hàng...</span>
            </div>
          ) : searched && orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-200 text-xs text-gray-500">
              <AlertCircle size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-800 text-sm mb-1">Không tìm thấy đơn hàng</p>
              <p>Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng bạn vừa nhập.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  {/* Header Đơn Hàng */}
                  <div className="bg-slate-50 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500">Mã đơn hàng: </span>
                      <strong className="text-gray-900 text-sm font-black tracking-wide">
                        {order.orderCode || order.id.slice(0, 8).toUpperCase()}
                      </strong>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Danh sách các sản phẩm trong đơn */}
                  <div className="p-4 sm:p-6 divide-y divide-gray-100">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 shrink-0 border border-gray-100 rounded-lg p-1 bg-gray-50 flex items-center justify-center">
                            <img
                              src={item.variant?.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                              {item.product?.name || item.variant?.product?.name || 'Thiết bị Apple'}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Phân loại: <strong className="text-gray-700">{item.variant?.storage || 'Tiêu chuẩn'}</strong> - {item.variant?.color || 'Zin'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Số lượng: <span className="font-bold text-gray-900">x{item.quantity}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm sm:text-base text-[#d70018]">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Thông tin người nhận và Tổng tiền */}
                  <div className="bg-gray-50/60 p-4 sm:px-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-gray-600 space-y-0.5">
                      <p>
                        Người nhận: <strong className="text-gray-800">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                      <p className="text-gray-500 line-clamp-1">
                        Địa chỉ: {order.shippingAddress}
                      </p>
                    </div>

                    <div className="text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <span className="text-xs text-gray-500 block">Tổng tiền thanh toán:</span>
                      <span className="text-lg font-black text-[#d70018]">
                        {(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                      </span>
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

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-xs text-gray-500">
          <Clock className="animate-spin text-[#d70018] mr-2" size={18} />
          <span>Đang chuẩn bị trang tra cứu đơn hàng...</span>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}