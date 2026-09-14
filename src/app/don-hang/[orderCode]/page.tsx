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
  ArrowRight, 
  Home, 
  Search,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function OrderSuccessPage() {
  const params = useParams();
  const orderCode = typeof params?.orderCode === 'string' ? params.orderCode : '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderCode) return;

    // Fetch thông tin đơn hàng từ Backend
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderCode}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setOrder(json.data);
          }
        }
      } catch (err) {
        console.error('Không thể lấy chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-sm">
          <Header />
          <Navbar />
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
          {/* KHỐI CHÚC MỪNG ĐẶT HÀNG THÀNH CÔNG */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-[#00a859] rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
              <CheckCircle2 size={38} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Đặt Hàng Thành Công!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Cảm ơn bạn đã tin tưởng mua sắm tại <b>Fogo Store</b>. Chuyên viên CSKH sẽ liên hệ với bạn trong vòng 15 phút để xác nhận đơn.
              </p>
            </div>

            {/* MÃ ĐƠN HÀNG */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
              <span>Mã đơn hàng:</span>
              <span className="text-base font-black text-[#d70018] tracking-wider font-mono">
                {orderCode}
              </span>
            </div>

            {/* THÔNG TIN CHI TIẾT ĐƠN HÀNG */}
            {order && (
              <div className="mt-8 text-left border-t border-gray-100 pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Người nhận */}
                  <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                      <Phone size={14} className="text-[#d70018]" />
                      <span>Thông tin người nhận</span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerPhone}</p>
                    {order.customerEmail && <p className="text-gray-500">{order.customerEmail}</p>}
                  </div>

                  {/* Địa chỉ giao */}
                  <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                      <MapPin size={14} className="text-[#d70018]" />
                      <span>Địa chỉ nhận hàng</span>
                    </div>
                    <p className="font-bold text-gray-800">{order.deliveryMethod || 'Giao hàng tận nơi'}</p>
                    <p className="text-gray-600 leading-relaxed">
                      {order.address ? `${order.address}, ${order.district}, ${order.province}` : (order.storeAddress || 'Tại cửa hàng Fogo Store')}
                    </p>
                  </div>
                </div>

                {/* DANH SÁCH SẢN PHẨM */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-gray-700 flex items-center gap-1.5">
                      <Package size={15} className="text-[#d70018]" />
                      <span>Sản phẩm trong đơn ({order.items.length})</span>
                    </h2>
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                      {order.items.map((it: any, idx: number) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            {it.imageUrl && (
                              <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0 bg-white">
                                <img src={it.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{it.productName}</p>
                              <p className="text-[11px] text-gray-500">
                                Phân loại: {it.storage} - {it.color} • SL: x{it.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-[#d70018] whitespace-nowrap">
                            {formatVnd(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TỔNG TIỀN */}
                <div className="flex justify-between items-center p-4 bg-red-50/50 border border-red-100 rounded-xl">
                  <div className="text-xs text-gray-700 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CreditCard size={14} className="text-[#d70018]" />
                      <span>Phương thức: {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : order.paymentMethod}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Trạng thái: Chưa thanh toán</p>
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

            {/* CÁC NÚT ĐIỀU HƯỚNG */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 bg-[#d70018] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
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
        </main>
      </div>

      <Footer />
    </div>
  );
}