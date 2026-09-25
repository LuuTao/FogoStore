'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Users, Award, DollarSign, ShoppingBag, Package } from 'lucide-react';

interface Props {
  analytics: any;
}

export default function AnalyticsTab({ analytics }: Props) {
  // 1. Trích xuất danh sách đơn hàng thô (nếu có)
  const rawOrders = useMemo(() => {
    if (Array.isArray(analytics)) return analytics;
    const list = analytics?.rawOrders || analytics?.orders || analytics?.data?.orders;
    return Array.isArray(list) ? list : [];
  }, [analytics]);

  // 2. Lọc các đơn hàng hợp lệ: COMPLETED hoặc đã thanh toán (PAID / QR / Online)
  const validOrders = useMemo(() => {
    if (rawOrders.length === 0) return [];

    return rawOrders.filter((o: any) => {
      const status = (o.status || o.orderStatus || '').toLowerCase();
      const paymentMethod = (o.paymentMethod || o.ptThanhToan || '').toLowerCase();
      const paymentStatus = (o.paymentStatus || o.trangThaiThanhToan || '').toLowerCase();

      const isCompleted =
        status === 'hoàn tất' ||
        status === 'completed' ||
        status === 'delivered' ||
        status === 'success';

      const isPaidOnline =
        paymentStatus.includes('đã thanh toán') ||
        paymentStatus.includes('paid') ||
        paymentMethod.includes('momo') ||
        paymentMethod.includes('vnpay') ||
        paymentMethod.includes('qr') ||
        paymentMethod.includes('bank') ||
        paymentMethod.includes('chuyển khoản');

      return isCompleted || isPaidOnline;
    });
  }, [rawOrders]);

  // 3. Tính toán các chỉ số phân tích chuyên sâu
  const calculatedData = useMemo(() => {
    // Ưu tiên đọc trực tiếp số liệu tổng kết từ Backend API nếu không có danh sách đơn thô
    const serverData = analytics?.data || analytics || {};

    if (validOrders.length === 0) {
      return {
        totalRevenue: Number(serverData.totalRevenue || 0),
        totalOrdersCount: Number(serverData.totalOrders || 0),
        totalProductsCount: Number(serverData.totalProducts || 0),
        dailyRevenueList: Array.isArray(serverData.revenueByDay)
          ? serverData.revenueByDay.map((d: any) => ({
              date: d.date,
              orders: d.ordersCount || 0,
              revenue: d.total || 0,
            }))
          : [],
        topProducts: Array.isArray(serverData.topSelling)
          ? serverData.topSelling.map((p: any) => ({
              name: p.name,
              qty: p.soldQuantity || 0,
              revenue: 0,
            }))
          : [],
        topCustomer: null,
      };
    }

    let revenue = 0;
    let prodCount = 0;
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    const customerMap: Record<string, { name: string; phone: string; totalSpent: number; orderCount: number }> = {};
    const dateMap: Record<string, { orders: number; revenue: number }> = {};

    validOrders.forEach((order: any) => {
      const orderTotal =
        Number(order.totalAmount) ||
        Number(order.totalPrice) ||
        Number(order.total) ||
        Number(order.finalTotal) ||
        Number(order.amount) ||
        Number(order.subTotal) ||
        0;

      revenue += orderTotal;

      // Gom nhóm theo ngày
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('vi-VN')
        : 'Hôm nay';

      if (!dateMap[orderDate]) {
        dateMap[orderDate] = { orders: 0, revenue: 0 };
      }
      dateMap[orderDate].orders += 1;
      dateMap[orderDate].revenue += orderTotal;

      // Gom nhóm khách hàng
      const custName =
        order.customerName ||
        order.shippingAddress?.fullName ||
        order.name ||
        'Khách vãng lai';
      const custPhone =
        order.customerPhone ||
        order.phone ||
        order.shippingAddress?.phone ||
        'Chưa có SĐT';
      const custKey = custPhone !== 'Chưa có SĐT' ? custPhone : custName;

      if (!customerMap[custKey]) {
        customerMap[custKey] = { name: custName, phone: custPhone, totalSpent: 0, orderCount: 0 };
      }
      customerMap[custKey].totalSpent += orderTotal;
      customerMap[custKey].orderCount += 1;

      // Gom nhóm sản phẩm bán ra
      const items = order.items || order.orderItems || order.products || [];
      items.forEach((item: any) => {
        const qty = Number(item.quantity || item.qty) || 1;
        prodCount += qty;

        const itemPrice = Number(item.price || item.productPrice) || 0;
        const prodName = item.productName || item.product?.name || item.name || 'Sản phẩm Apple';

        if (!productMap[prodName]) {
          productMap[prodName] = { name: prodName, qty: 0, revenue: 0 };
        }
        productMap[prodName].qty += qty;
        productMap[prodName].revenue += itemPrice * qty;
      });
    });

    const sortedProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty);
    const sortedCustomers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

    const formattedDaily = Object.entries(dateMap).map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue,
    }));

    return {
      totalRevenue: revenue,
      totalOrdersCount: validOrders.length,
      totalProductsCount: prodCount,
      dailyRevenueList: formattedDaily,
      topProducts: sortedProducts.slice(0, 5),
      topCustomer: sortedCustomers.length > 0 ? sortedCustomers[0] : null,
    };
  }, [analytics, validOrders]);

  const {
    totalRevenue,
    totalOrdersCount,
    totalProductsCount,
    dailyRevenueList,
    topProducts,
    topCustomer,
  } = calculatedData;

  return (
    <div className="space-y-4 sm:space-y-6 select-none">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
          Tổng Quan Doanh Thu &amp; Phân Tích Bán Hàng
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Dữ liệu thống kê từ các đơn hàng hoàn tất hoặc đã thanh toán thành công qua cổng trực tuyến
        </p>
      </div>

      {/* 3 THẺ STATS NỔI BẬT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Tổng Doanh Thu</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Tổng Số Đơn Hợp Lệ</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
              {totalOrdersCount} đơn
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Sản Phẩm Đã Bán</p>
            <p className="text-xl sm:text-2xl font-black text-purple-600 mt-1">
              {totalProductsCount} máy
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* TOP SẢN PHẨM & KHÁCH HÀNG VIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top sản phẩm bán chạy */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 space-y-3">
          <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2 border-b pb-3">
            <TrendingUp size={16} className="text-[#d70018]" />
            <span>Top Sản Phẩm Bán Chạy Nhất</span>
          </h3>

          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-xs">Chưa có giao dịch phát sinh.</p>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className="w-5 h-5 rounded-full bg-red-50 text-[#d70018] font-black flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-600">{p.qty} máy</span>
                    {p.revenue > 0 && (
                      <p className="text-[10px] text-gray-400">{p.revenue.toLocaleString('vi-VN')} đ</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Khách hàng mua nhiều nhất */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 space-y-3">
          <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2 border-b pb-3">
            <Users size={16} className="text-blue-600" />
            <span>Khách Hàng Thân Thiết Chi Tiêu Lớn Nhất</span>
          </h3>

          {topCustomer ? (
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 p-4 rounded-xl space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-2xs">
                  <Award size={12} /> VIP CUSTOMER
                </span>
                <span className="text-gray-500 font-medium text-xs">
                  Đã hoàn tất: <strong className="text-blue-700">{topCustomer.orderCount} đơn</strong>
                </span>
              </div>

              <div>
                <p className="text-gray-500 text-[11px]">Họ tên khách hàng:</p>
                <p className="font-extrabold text-gray-900 text-sm">{topCustomer.name}</p>
              </div>

              <div>
                <p className="text-gray-500 text-[11px]">Số điện thoại liên hệ:</p>
                <p className="font-bold text-gray-800 font-mono">{topCustomer.phone}</p>
              </div>

              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                <span className="text-gray-700 font-bold text-xs">Tổng số tiền chi trả:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {topCustomer.totalSpent.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              Chưa có dữ liệu khách hàng tích lũy.
            </div>
          )}
        </div>
      </div>

      {/* BẢNG BÁO CÁO DOANH THU THEO NGÀY */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
        <h3 className="text-sm font-extrabold text-gray-800 mb-3">
          Lịch Sử Báo Cáo Theo Ngày
        </h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                <th className="py-2.5 px-3">Thời Gian / Ngày</th>
                <th className="py-2.5 px-3">Số Lượng Đơn</th>
                <th className="py-2.5 px-3 text-right">Doanh Số Ghi Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyRevenueList.length > 0 ? (
                dailyRevenueList.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{row.date}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-medium">{row.orders} đơn</td>
                    <td className="py-2.5 px-3 font-black text-emerald-600 text-right">
                      {row.revenue?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400 text-xs">
                    Chưa có phát sinh giao dịch trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}