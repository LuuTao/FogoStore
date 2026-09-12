'use client';

import React, { useState } from 'react';

interface Props {
  orders: any[];
  onRefresh: () => void;
}

export default function OrdersTab({ orders, onRefresh }: Props) {
  const [filter, setFilter] = useState('ALL');

  const handleUpdate = async (id: string, orderStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`https://fogo-store-api.onrender.com/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      if (res.ok) onRefresh();
    } catch {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const filteredOrders = orders.filter((o) => (filter === 'ALL' ? true : o.orderStatus === filter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-800">Quản Lý Đơn Hàng Đã Bán</h2>
        <div className="flex gap-2 text-xs font-semibold">
          {['ALL', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-md border cursor-pointer ${
                filter === st ? 'bg-[#d70018] text-white border-[#d70018]' : 'bg-white text-gray-600'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase border-b">
            <tr>
              <th className="p-3.5">Mã Đơn</th>
              <th className="p-3.5">Khách Hàng</th>
              <th className="p-3.5">Sản Phẩm</th>
              <th className="p-3.5">Tổng Tiền</th>
              <th className="p-3.5">Thanh Toán</th>
              <th className="p-3.5">Trạng Thái Đơn</th>
              <th className="p-3.5">Cập Nhật</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Không có đơn hàng nào</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3.5 font-bold text-blue-600">{order.orderCode}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-gray-800">{order.customerName}</p>
                    <p className="text-gray-500 text-[11px]">{order.customerPhone}</p>
                  </td>
                  <td className="p-3.5">
                    {order.items?.map((item: any) => (
                      <p key={item.id} className="text-[11px] text-gray-700">
                        • {item.productName} ({item.storage} - {item.color}) x{item.quantity}
                      </p>
                    ))}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600">
                    {order.totalAmount?.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Chuyển Tiền'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdate(order.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs bg-white outline-none cursor-pointer"
                    >
                      <option value="CONFIRMED">Xác nhận</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Hủy đơn</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}