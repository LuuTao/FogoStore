'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

// BẢNG DỊCH TIẾNG VIỆT CHO TRẠNG THÁI ĐƠN HÀNG
export const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CONFIRMED: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  CANCELLED: {
    label: 'Đã hủy đơn',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch danh sách toàn bộ đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Ưu tiên endpoint admin, nếu 404 fallback về route /api/orders
      let res = await fetch(`${API_URL}/api/admin/orders`, { cache: 'no-store' });
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/orders`, { cache: 'no-store' });
      }
      
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Lỗi nạp đơn hàng admin:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      let res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderStatus: newStatus }),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: newStatus } : ord))
        );
      } else {
        alert('Cập nhật thất bại: ' + (data.error || 'Lỗi hệ thống'));
      }
    } catch (err: any) {
      alert('Không thể kết nối máy chủ để cập nhật!');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'ALL') return true;
    return ord.orderStatus === filterStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Quản Lý */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đơn Hàng Đã Bán
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng: <b>{orders.length}</b> đơn hàng đã ghi nhận vào cơ sở dữ liệu
          </p>
        </div>

        {/* Các nút lọc trạng thái bằng Tiếng Việt */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'CONFIRMED', label: 'Đã xác nhận' },
            { id: 'SHIPPING', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Hoàn tất' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-md border transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider text-[11px]">
                <th className="py-3.5 px-4">MÃ ĐƠN</th>
                <th className="py-3.5 px-4">KHÁCH HÀNG</th>
                <th className="py-3.5 px-4">SẢN PHẨM</th>
                <th className="py-3.5 px-4 text-right">TỔNG TIỀN</th>
                <th className="py-3.5 px-4 text-center">THANH TOÁN</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI ĐƠN</th>
                <th className="py-3.5 px-4 text-center">CẬP NHẬT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                    <span>Đang nạp dữ liệu đơn hàng từ Neon DB...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-semibold">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusInfo = STATUS_LABELS[ord.orderStatus] || {
                    label: ord.orderStatus,
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 font-mono font-black text-[#d70018]">
                        <Link href={`/don-hang/${ord.orderCode}`} target="_blank" className="hover:underline">
                          {ord.orderCode}
                        </Link>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{ord.customerName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{ord.customerPhone}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                          {ord.address ? `${ord.address}, ${ord.district}` : (ord.deliveryMethod || 'Giao hàng tận nơi')}
                        </p>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="space-y-1">
                          {ord.items?.map((it: any) => (
                            <div key={it.id} className="truncate text-[11px]">
                              • <b className="text-gray-800">{it.productName}</b> ({it.storage} - {it.color}) x{it.quantity}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 text-right font-black text-gray-900 text-sm">
                        {formatVnd(ord.totalAmount)}
                      </td>

                      {/* Thanh toán */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-gray-700 uppercase text-[11px]">
                          {ord.paymentMethod === 'cod' || ord.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : ord.paymentMethod}
                        </span>
                      </td>

                      {/* Trạng thái tiếng Việt */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Dropdown cập nhật nhanh trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          disabled={updatingId === ord.id}
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="text-[11px] font-bold bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 focus:outline-none focus:border-[#d70018] cursor-pointer"
                        >
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="SHIPPING">Đang giao hàng</option>
                          <option value="COMPLETED">Hoàn tất</option>
                          <option value="CANCELLED">Hủy đơn</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}