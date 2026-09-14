'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Phone, 
  Loader2,
  RefreshCw,
  Eye,
  MapPin
} from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
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
      console.error('Lỗi nạp đơn admin:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
        alert('Cập nhật thất bại: ' + (data.error || 'Lỗi server'));
      }
    } catch {
      alert('Không thể kết nối máy chủ!');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = filterStatus === 'ALL' || ord.orderStatus === filterStatus;
    const kw = searchKeyword.trim().toLowerCase();
    const matchKeyword =
      !kw ||
      ord.orderCode?.toLowerCase().includes(kw) ||
      ord.customerName?.toLowerCase().includes(kw) ||
      ord.customerPhone?.includes(kw);
    return matchStatus && matchKeyword;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Tiêu đề & Bộ lọc */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đơn Hàng Đã Bán
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng: <b>{orders.length}</b> đơn hàng đã ghi nhận vào cơ sở dữ liệu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm mã đơn, tên, SĐT..."
              className="text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#d70018] w-48"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
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
                className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
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
              className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-md border border-gray-300 transition-colors cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider text-[11px]">
                <th className="py-3.5 px-4">MÃ ĐƠN & NGÀY ĐẶT</th>
                <th className="py-3.5 px-4">KHÁCH HÀNG</th>
                <th className="py-3.5 px-4">CHI TIẾT SẢN PHẨM</th>
                <th className="py-3.5 px-4 text-right">TỔNG TIỀN</th>
                <th className="py-3.5 px-4 text-center">PT THANH TOÁN</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI ĐƠN</th>
                <th className="py-3.5 px-4 text-center">CẬP NHẬT</th>
                <th className="py-3.5 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                    <span>Đang nạp dữ liệu đơn hàng từ Neon DB...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-semibold">
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
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/don-hang/${ord.orderCode}`}
                          target="_blank"
                          className="font-mono font-black text-[#d70018] hover:underline block"
                        >
                          {ord.orderCode}
                        </Link>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{ord.customerName}</p>
                        <p className="text-[11px] text-gray-600 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={11} />
                          {ord.customerPhone}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          <span title={ord.address ? `${ord.address}, ${ord.district || ''}, ${ord.province || ''}` : ord.deliveryMethod}>
                            {ord.address ? `${ord.address}, ${ord.district || ''}` : (ord.deliveryMethod || 'Giao hàng')}
                          </span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="space-y-1.5">
                          {ord.items?.map((it: any) => (
                            <div key={it.id} className="flex items-center gap-2">
                              {it.imageUrl ? (
                                <div className="w-8 h-8 rounded border border-gray-200 bg-white p-0.5 shrink-0 flex items-center justify-center">
                                  <img src={it.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                                  SP
                                </div>
                              )}
                              <div className="truncate text-[11px] leading-tight">
                                <span className="font-bold text-gray-900">{it.productName}</span>
                                <span className="text-gray-500 block">
                                  ({it.storage} - {it.color}) × <b className="text-gray-800">{it.quantity}</b>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-gray-900 text-sm whitespace-nowrap">
                        {formatVnd(ord.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-gray-700 uppercase text-[11px] block">
                          {ord.paymentMethod === 'cod' || ord.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : ord.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

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

                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/don-hang/${ord.orderCode}`}
                          target="_blank"
                          className="p-1.5 bg-gray-100 hover:bg-[#d70018] hover:text-white rounded text-gray-600 inline-flex items-center justify-center transition-colors"
                          title="Xem hóa đơn chi tiết"
                        >
                          <Eye size={14} />
                        </Link>
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