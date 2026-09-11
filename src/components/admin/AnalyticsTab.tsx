'use client';

import React from 'react';

interface Props {
  analytics: any;
}

export default function AnalyticsTab({ analytics }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-gray-800">Tổng Quan Báo Cáo Doanh Thu</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase">Tổng Doanh Thu</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {analytics?.totalRevenue?.toLocaleString('vi-VN') || 0} đ
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase">Tổng Số Đơn Hàng</p>
          <p className="text-2xl font-black text-blue-600 mt-2">{analytics?.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase">Số Lượng Sản Phẩm</p>
          <p className="text-2xl font-black text-purple-600 mt-2">{analytics?.totalProducts || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Doanh Thu 7 Ngày Gần Nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase border-b">
              <tr>
                <th className="p-3">Ngày</th>
                <th className="p-3">Số Đơn Hoàn Tất</th>
                <th className="p-3 text-right">Doanh Số Ngày</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.revenueByDay?.map((row: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-700">{row.date}</td>
                  <td className="p-3">{row.ordersCount} đơn</td>
                  <td className="p-3 text-right font-black text-emerald-600">
                    {row.total.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Top Sản Phẩm Bán Chạy Nhất</h3>
        <div className="space-y-3">
          {!analytics?.topSelling || analytics.topSelling.length === 0 ? (
            <p className="text-xs text-gray-400">Chưa có dữ liệu sản phẩm bán ra.</p>
          ) : (
            analytics.topSelling.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2 text-xs">
                <span className="font-bold text-gray-800">{p.name}</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">
                  Đã bán: {p.soldQuantity} máy
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}