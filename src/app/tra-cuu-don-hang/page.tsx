'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Phone,
  UserCheck
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function OrderTrackingPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Tự động nạp đơn hàng của tài khoản đang đăng nhập
  useEffect(() => {
    const rawUser = localStorage.getItem('fogo_user') || localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        setCurrentUser(user);
        const userId = user.id || user._id;

        if (userId) {
          setLoading(true);
          fetch(`${API_URL}/api/orders/my-orders?userId=${userId}`, { cache: 'no-store' })
            .then((res) => res.json())
            .then((res) => {
              if (res.success && Array.isArray(res.data)) {
                setOrders(res.data);
              }
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Tra cứu theo từ khóa (Mã đơn hoặc Số điện thoại)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      // Tìm theo mã đơn hàng
      const res = await fetch(`${API_URL}/api/orders/${keyword.trim()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setOrders([data.data]);
      } else {
        // Nếu không ra, tìm theo API user hoặc số điện thoại
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} />
            Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={13} />
            Đang vận chuyển
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            Giao hàng thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200">
            <XCircle size={13} />
            Đã hủy đơn
          </span>
        );
      default:
        return <span className="text-xs font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-700">{st}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-gray-500">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Tra cứu đơn hàng</span>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Form Tra Cứu */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              Tra Cứu Tiến Độ Đơn Hàng
            </h1>
            <p className="text-xs text-gray-500 mb-6">
              Nhập chính xác <b>Số điện thoại đặt hàng</b> hoặc <b>Mã đơn hàng</b> (VD: FG-123456)
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập số điện thoại hoặc mã đơn..."
                  className="w-full text-xs pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d70018]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d70018] hover:bg-[#b50014] text-white px-6 py-3 rounded-lg text-xs font-bold transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'ĐANG TÌM...' : 'TRA CỨU'}
              </button>
            </form>

            {currentUser && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium">
                <UserCheck size={15} />
                <span>Đang hiển thị các đơn hàng đã đặt của: <b>{currentUser.name || currentUser.email}</b></span>
              </div>
            )}
          </div>

          {/* Danh Sách Đơn Hàng Hiển Thị Ngay */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-gray-800 tracking-wider flex items-center justify-between">
              <span>Đơn hàng gần đây ({orders.length})</span>
            </h2>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                <Loader2 size={28} className="animate-spin text-[#d70018] mx-auto mb-2" />
                <p className="text-xs text-gray-500">Đang tải thông tin đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
                Chưa có đơn hàng nào được tìm thấy. Vui lòng nhập mã đơn hoặc kiểm tra tài khoản!
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition-all">
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-[#d70018] text-sm">{order.orderCode}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                        <Calendar size={13} />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div>{renderStatusBadge(order.orderStatus)}</div>
                  </div>

                  <div className="p-5 divide-y divide-gray-100 text-xs">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded p-1 flex items-center justify-center shrink-0">
                            <img src={item.imageUrl || '/placeholder.png'} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.productName}</p>
                            <p className="text-[11px] text-gray-500">{item.storage} • {item.color} • x{item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{formatVnd(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-gray-500">
                      Người nhận: <b>{order.customerName}</b> ({order.customerPhone})
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-[#d70018] text-sm">{formatVnd(order.totalAmount)}</span>
                      <Link
                        href={`/don-hang/${order.orderCode}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}