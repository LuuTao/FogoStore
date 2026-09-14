'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Users, Award } from 'lucide-react';

interface Props {
  analytics: any;
}

export default function AnalyticsTab({ analytics }: Props) {
  // Lọc chỉ tính các đơn hàng ở trạng thái hoàn tất (hoặc dùng trực tiếp từ dữ liệu trả về nếu backend đã lọc)
  const completedOrdersList = useMemo(() => {
    const rawOrders = analytics?.rawOrders || analytics?.orders || [];
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders.filter((o: any) => {
      const st = (o.status || o.orderStatus || '').toLowerCase();
      return st === 'hoàn tất' || st === 'completed' || st === 'delivered' || st === 'success';
    });
  }, [analytics]);

  // Tính toán Top sản phẩm bán chạy và Khách hàng mua nhiều nhất từ đơn hoàn tất
  const { topProducts, topCustomer } = useMemo(() => {
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    const customerMap: Record<string, { name: string; phone: string; totalSpent: number; orderCount: number }> = {};

    completedOrdersList.forEach((order: any) => {
      const orderTotal = Number(order.totalPrice || order.total || order.amount) || 0;
      
      // Khách hàng
      const custName = order.customerName || order.shippingAddress?.fullName || order.name || 'Khách lẻ';
      const custPhone = order.customerPhone || order.phone || order.shippingAddress?.phone || 'Chưa có SĐT';
      const custKey = custPhone !== 'Chưa có SĐT' ? custPhone : custName;

      if (!customerMap[custKey]) {
        customerMap[custKey] = { name: custName, phone: custPhone, totalSpent: 0, orderCount: 0 };
      }
      customerMap[custKey].totalSpent += orderTotal;
      customerMap[custKey].orderCount += 1;

      // Sản phẩm
      const items = order.items || order.orderItems || order.products || [];
      items.forEach((item: any) => {
        const qty = Number(item.quantity || item.qty) || 1;
        const prodName = item.product?.name || item.name || 'Sản phẩm Apple';
        if (!productMap[prodName]) {
          productMap[prodName] = { name: prodName, qty: 0, revenue: 0 };
        }
        productMap[prodName].qty += qty;
        productMap[prodName].revenue += (Number(item.price) || 0) * qty;
      });
    });

    const sortedProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty);
    const sortedCustomers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      topProducts: sortedProducts.slice(0, 5),
      topCustomer: sortedCustomers.length > 0 ? sortedCustomers[0] : null,
    };
  }, [completedOrdersList]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">
        Tổng Quan Báo Cáo Doanh Thu (Đơn Hoàn Tất)
      </h2>

      {/* Thống kê: 1 cột trên Mobile, 3 cột từ tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100 flex sm:flex-col justify-between items-center sm:items-start">
          <p className="text-xs text-gray-500 font-bold uppercase">Tổng Doanh Thu</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 sm:mt-2">
            {analytics?.totalRevenue?.toLocaleString('vi-VN') || 0} đ
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100 flex sm:flex-col justify-between items-center sm:items-start">
          <p className="text-xs text-gray-500 font-bold uppercase">Tổng Số Đơn Hàng</p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 sm:mt-2">
            {analytics?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100 flex sm:flex-col justify-between items-center sm:items-start">
          <p className="text-xs text-gray-500 font-bold uppercase">Số Lượng Sản Phẩm</p>
          <p className="text-xl sm:text-2xl font-black text-purple-600 sm:mt-2">
            {analytics?.totalProducts || 0}
          </p>
        </div>
      </div>

      {/* BỔ SUNG: TOP SẢN PHẨM BÁN CHẠY & KHÁCH HÀNG MUA NHIỀU NHẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top sản phẩm */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#d70018]" />
            <span>Top Sản Phẩm Bán Chạy</span>
          </h3>
          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Chưa có dữ liệu sản phẩm bán ra.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-full bg-red-50 text-[#d70018] font-black flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-600">{p.qty} máy</span>
                    <p className="text-[10px] text-gray-400">{p.revenue.toLocaleString('vi-VN')} đ</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Khách hàng mua nhiều nhất */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span>Khách Hàng Mua Nhiều Nhất</span>
          </h3>
          {topCustomer ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 p-4 rounded-xl space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1">
                  <Award size={12} /> VIP Customer
                </span>
                <span className="text-gray-500 font-medium text-xs">Tổng đơn: <strong>{topCustomer.orderCount} đơn</strong></span>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Họ tên khách hàng:</p>
                <p className="font-extrabold text-gray-900">{topCustomer.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Số điện thoại liên hệ:</p>
                <p className="font-bold text-gray-800 font-mono">{topCustomer.phone}</p>
              </div>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                <span className="text-gray-600 font-bold text-xs">Tổng tiền chi tiêu:</span>
                <span className="font-black text-emerald-600">{topCustomer.totalSpent.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Chưa có thông tin khách hàng.
            </div>
          )}
        </div>
      </div>

      {/* Bảng báo cáo 7 ngày gần nhất có cuộn ngang an toàn */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Doanh Thu 7 Ngày Gần Nhất
        </h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="py-2.5 px-3 font-bold text-gray-600">Ngày</th>
                <th className="py-2.5 px-3 font-bold text-gray-600">Số Đơn</th>
                <th className="py-2.5 px-3 font-bold text-gray-600">Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics?.dailyRevenue?.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/80">
                  <td className="py-2.5 px-3 font-medium text-gray-700">{row.date}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.orders} đơn</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">
                    {row.revenue?.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    Chưa có dữ liệu giao dịch
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