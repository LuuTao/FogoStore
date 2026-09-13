'use client';

import React from 'react';

interface Props {
  analytics: any;
}

export default function AnalyticsTab({ analytics }: Props) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">
        Tổng Quan Báo Cáo Doanh Thu
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