'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  CreditCard,
  QrCode,
  DollarSign,
  Package,
} from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

interface OrderItem {
  id?: string;
  name?: string;
  productName?: string;
  product?: { name?: string };
  price?: number;
  quantity?: number;
}

interface Order {
  id: string;
  orderCode?: string;
  customerName?: string;
  phone?: string;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function ThongKeAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/orders`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Lỗi khi fetch đơn hàng để thống kê:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Lọc đơn hàng theo mốc thời gian được chọn
  const filteredOrders = useMemo(() => {
    if (timeFilter === 'all') return orders;

    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return true;

      if (timeFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (timeFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, timeFilter]);

  // 2. Tính toán các chỉ số kinh doanh chính
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'Đã hủy')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const deliveredOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'Hoàn tất');
  }, [filteredOrders]);

  const processingOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) =>
        o.status === 'PENDING' ||
        o.status === 'CONFIRMED' ||
        o.status === 'SHIPPING' ||
        o.status === 'Đã xác nhận' ||
        o.status === 'Đang giao hàng'
    );
  }, [filteredOrders]);

  const cancelledOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'CANCELLED' || o.status === 'Đã hủy');
  }, [filteredOrders]);

  // 3. Phân bổ theo phương thức thanh toán
  const paymentStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {
      COD: { count: 0, total: 0 },
      VIETQR: { count: 0, total: 0 },
      MOMO: { count: 0, total: 0 },
      VNPAY: { count: 0, total: 0 },
      OTHER: { count: 0, total: 0 },
    };

    filteredOrders.forEach((o) => {
      const pm = (o.paymentMethod || '').toUpperCase();
      const amount = o.totalAmount || 0;

      if (pm.includes('COD') || pm.includes('TIỀN MẶT')) {
        stats.COD.count += 1;
        stats.COD.total += amount;
      } else if (pm.includes('QR') || pm.includes('BANK') || pm.includes('CHUYỂN KHOẢN')) {
        stats.VIETQR.count += 1;
        stats.VIETQR.total += amount;
      } else if (pm.includes('MOMO')) {
        stats.MOMO.count += 1;
        stats.MOMO.total += amount;
      } else if (pm.includes('VNPAY')) {
        stats.VNPAY.count += 1;
        stats.VNPAY.total += amount;
      } else {
        stats.OTHER.count += 1;
        stats.OTHER.total += amount;
      }
    });

    return stats;
  }, [filteredOrders]);

  // 4. Biểu đồ cột doanh thu theo 7 ngày gần nhất
  const revenueChartData = useMemo(() => {
    const last7Days: { dateStr: string; label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      last7Days.push({ dateStr, label, revenue: 0 });
    }

    orders.forEach((o) => {
      if (o.status === 'CANCELLED' || o.status === 'Đã hủy') return;
      const orderDate = (o.createdAt || '').split('T')[0];
      const found = last7Days.find((d) => d.dateStr === orderDate);
      if (found) {
        found.revenue += o.totalAmount || 0;
      }
    });

    const maxRev = Math.max(...last7Days.map((d) => d.revenue), 1);
    return { data: last7Days, maxRev };
  }, [orders]);

  // 5. Thống kê top sản phẩm bán ra
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredOrders.forEach((o) => {
      if (o.status === 'CANCELLED' || o.status === 'Đã hủy') return;
      (o.items || []).forEach((item) => {
        const pName = item.name || item.productName || item.product?.name || 'Sản phẩm Apple';
        const qty = item.quantity || 1;
        const rev = (item.price || 0) * qty;

        if (!productMap[pName]) {
          productMap[pName] = { name: pName, quantity: 0, revenue: 0 };
        }
        productMap[pName].quantity += qty;
        productMap[pName].revenue += rev;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredOrders]);

  const formatVnd = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* TIÊU ĐỀ VÀ BỘ LỌC THỜI GIAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-[#d70018]" size={26} />
            <span>Doanh Thu & Thống Kê Kinh Doanh</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Số liệu thời gian thực được đồng bộ trực tiếp từ kho Neon DB
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-2xs">
            {[
              { key: 'today', label: 'Hôm nay' },
              { key: '7days', label: '7 ngày' },
              { key: 'month', label: 'Tháng này' },
              { key: 'all', label: 'Tất cả' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTimeFilter(tab.key as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  timeFilter === tab.key
                    ? 'bg-[#d70018] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#d70018] hover:border-[#d70018] transition-colors cursor-pointer shadow-2xs"
            title="Làm mới số liệu"
          >
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4 CARD CHỈ SỐ KPI CHÍNH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng doanh thu */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#d70018] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#d70018] tracking-tight">
            {loading ? '---' : formatVnd(totalRevenue)}
          </p>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">
            Không tính các đơn đã hủy
          </span>
        </div>

        {/* Tổng đơn hàng */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {loading ? '---' : filteredOrders.length}
          </p>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">
            {processingOrders.length} đơn đang xử lý / vận chuyển
          </span>
        </div>

        {/* Đơn hoàn tất */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Giao Thành Công</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">
            {loading ? '---' : deliveredOrders.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {filteredOrders.length > 0
              ? `${Math.round((deliveredOrders.length / filteredOrders.length) * 100)}% tỷ lệ thành công`
              : '0%'}
          </span>
        </div>

        {/* Đơn đã hủy */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đơn Đã Hủy</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            {loading ? '---' : cancelledOrders.length}
          </p>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">
            Khách hủy hoặc hết hàng
          </span>
        </div>
      </div>

      {/* BIỂU ĐỒ DOANH THU 7 NGÀY GẦN NHẤT & CƠ CẤU THANH TOÁN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ thanh doanh thu */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Xu Hướng Doanh Thu 7 Ngày Gần Nhất
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Biểu đồ doanh thu theo từng ngày</p>
            </div>
          </div>

          <div className="h-60 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-gray-100">
            {revenueChartData.data.map((col, idx) => {
              const heightPercent =
                col.revenue > 0 ? Math.round((col.revenue / revenueChartData.maxRev) * 100) : 4;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-[#d70018] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatVnd(col.revenue)}
                  </span>
                  <div className="w-full max-w-[42px] bg-gray-100 rounded-t-md overflow-hidden flex items-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#d70018] to-[#ff6b6b] rounded-t-md transition-all duration-500 group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500 mt-1">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phân bổ theo Phương Thức Thanh Toán */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Phương Thức Thanh Toán</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tỷ lệ sử dụng cổng thanh toán</p>
          </div>

          <div className="space-y-4 my-4">
            {/* VietQR / Chuyển khoản */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <QrCode size={14} className="text-blue-600" />
                  <span>VietQR Tự Động</span>
                </span>
                <span className="font-black text-gray-900">
                  {paymentStats.VIETQR.count} đơn ({formatVnd(paymentStats.VIETQR.total)})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (paymentStats.VIETQR.count / filteredOrders.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Tiền mặt COD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-600" />
                  <span>Tiền Mặt (COD)</span>
                </span>
                <span className="font-black text-gray-900">
                  {paymentStats.COD.count} đơn ({formatVnd(paymentStats.COD.total)})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (paymentStats.COD.count / filteredOrders.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Ví MoMo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-500 inline-block" />
                  <span>Ví MoMo</span>
                </span>
                <span className="font-black text-gray-900">
                  {paymentStats.MOMO.count} đơn ({formatVnd(paymentStats.MOMO.total)})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (paymentStats.MOMO.count / filteredOrders.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* VNPAY */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block" />
                  <span>VNPAY-QR</span>
                </span>
                <span className="font-black text-gray-900">
                  {paymentStats.VNPAY.count} đơn ({formatVnd(paymentStats.VNPAY.total)})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${
                      filteredOrders.length > 0
                        ? (paymentStats.VNPAY.count / filteredOrders.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            VietQR và COD chiếm phần lớn giao dịch của khách hàng tại Fogo Store.
          </p>
        </div>
      </div>

      {/* TOP SẢN PHẨM BÁN CHẠY VÀ DANH SÁCH ĐƠN MỚI GẦN ĐÂY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top sản phẩm bán chạy */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Package size={18} className="text-[#d70018]" />
            <span>Top Sản Phẩm Bán Chạy</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Dựa trên số lượng sản phẩm được đặt mua</p>

          <div className="divide-y divide-gray-100">
            {topProducts.length > 0 ? (
              topProducts.map((p, index) => (
                <div key={index} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 ${
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-800 truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-gray-900 block">{p.quantity} chiếc</span>
                    <span className="text-[10px] text-[#d70018] font-semibold">{formatVnd(p.revenue)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-gray-400">Chưa có dữ liệu sản phẩm bán ra.</p>
            )}
          </div>
        </div>

        {/* Đơn hàng mới phát sinh gần đây */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <span>Đơn Hàng Phát Sinh Gần Đây</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">5 đơn hàng mới nhất được ghi nhận</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-y border-gray-100 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Mã đơn</th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3">Tổng tiền</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-3 font-bold text-[#d70018]">
                      {o.orderCode || o.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 truncate max-w-[140px]">
                      {o.customerName || 'Khách vãng lai'}
                    </td>
                    <td className="py-3 px-3 font-black text-gray-900">
                      {formatVnd(o.totalAmount || 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'DELIVERED' || o.status === 'Hoàn tất'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.status === 'CANCELLED' || o.status === 'Đã hủy'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}