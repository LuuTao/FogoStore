'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Search, CheckSquare, Square, RotateCw, AlertTriangle, Eye } from 'lucide-react';

interface Props {
  orders: any[];
  onRefresh: () => void;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function OrdersTab({ orders = [], onRefresh }: Props) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Chuyển đổi an toàn ảnh localhost sang CDN Render
  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return 'https://placehold.co/100';
    if (url.includes('localhost:5000')) {
      return url.replace('http://localhost:5000', API_URL);
    }
    if (url.startsWith('/uploads')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  // Cập nhật trạng thái đơn: Khi chọn "Hoàn tất" -> tự động chuyển sang "Đã Thanh Toán"
  const handleUpdateStatus = async (id: string, newOrderStatus: string) => {
    try {
      const payload: { orderStatus: string; paymentStatus?: string } = {
        orderStatus: newOrderStatus,
      };

      // TỰ ĐỘNG: Nếu đơn chuyển thành Hoàn tất (COMPLETED) -> thanh toán đổi thành Đã thanh toán (PAID)
      if (newOrderStatus === 'COMPLETED') {
        payload.paymentStatus = 'PAID';
      }

      const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi cập nhật trạng thái đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi cập nhật đơn hàng');
    }
  };

  // Xóa một đơn hàng đơn lẻ
  const handleDeleteSingle = async (id: string, orderCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderCode}?`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể xóa đơn hàng này');
      }
    } catch {
      alert('Lỗi kết nối khi xóa đơn hàng');
    } finally {
      setIsDeleting(false);
    }
  };

  // Xóa hàng loạt nhiều đơn hàng đã chọn
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác!`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/api/admin/orders/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Xảy ra lỗi khi xóa đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối khi thực hiện xóa hàng loạt');
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc theo trạng thái và thanh tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = filter === 'ALL' ? true : o.orderStatus === filter;
      const search = searchTerm.trim().toLowerCase();
      const matchSearch =
        !search ||
        (o.orderCode || '').toLowerCase().includes(search) ||
        (o.customerName || '').toLowerCase().includes(search) ||
        (o.customerPhone || '').toLowerCase().includes(search);

      return matchFilter && matchSearch;
    });
  }, [orders, filter, searchTerm]);

  // Chọn hoặc bỏ chọn tất cả
  const isAllSelected = filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5 select-none">
      {/* 1. THANH TIÊU ĐỀ, TÌM KIẾM VÀ BỘ LỌC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Quản Lý Đơn Hàng Đã Bán</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng cộng: <strong className="text-gray-800">{orders.length}</strong> đơn hàng đã ghi nhận vào cơ sở dữ liệu[cite: 8]
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên, SĐT..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:border-[#d70018] outline-none w-48 sm:w-56"
            />
          </div>

          {/* Các nút Tab trạng thái */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'CONFIRMED', label: 'Đã xác nhận' },
              { id: 'SHIPPING', label: 'Đang giao' },
              { id: 'COMPLETED', label: 'Hoàn tất' },
              { id: 'CANCELLED', label: 'Đã hủy' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilter(st.id)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  filter === st.id ? 'bg-[#d70018] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Nút làm mới */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-md shadow-2xs transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. THANH THAO TÁC NỔI KHI CÓ ĐƠN HÀNG ĐƯỢC CHỌN */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <CheckSquare size={16} className="text-[#d70018]" />
            <span>Đã chọn {selectedIds.length} đơn hàng</span>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDeleteBulk}
            className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <Trash2 size={13} />
            <span>{isDeleting ? 'Đang xóa...' : 'Xóa các đơn đã chọn'}</span>
          </button>
        </div>
      )}

      {/* 3. BẢNG DANH SÁCH ĐƠN HÀNG */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200 font-extrabold text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-[#d70018]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Mã Đơn & Ngày Đặt</th>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5">Chi Tiết Sản Phẩm</th>
                <th className="p-3.5">Tổng Tiền</th>
                <th className="p-3.5">PT Thanh Toán</th>
                <th className="p-3.5">Trạng Thái Đơn</th>
                <th className="p-3.5">Cập Nhật</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <AlertTriangle size={24} className="mx-auto text-gray-300 mb-2" />
                    <span>Không tìm thấy đơn hàng nào phù hợp</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const isPaid = order.paymentStatus === 'PAID';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Checkbox chọn */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(order.id)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#d70018]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Mã đơn & Ngày đặt */}
                      <td className="p-3.5">
                        <span className="font-bold text-[#d70018] block text-[13px]">
                          {order.orderCode}
                        </span>
                        <span className="text-gray-400 text-[10px] block mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-gray-600 text-[11px] font-mono mt-0.5">{order.customerPhone}</p>
                        <p className="text-gray-400 text-[10px] truncate max-w-[180px] mt-0.5" title={order.address}>
                          {order.address || 'Tại quầy'}
                        </p>
                      </td>

                      {/* Sản phẩm */}
                      <td className="p-3.5">
                        <div className="space-y-2 max-w-[240px]">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <img
                                src={getSafeImageUrl(item.imageUrl || item.variant?.images?.[0])}
                                alt={item.name || item.productName}
                                className="w-8 h-8 object-contain rounded border border-gray-200 bg-white p-0.5 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100';
                                }}
                              />
                              <div className="text-[11px] text-gray-700 leading-tight truncate">
                                <p className="font-medium text-gray-900 truncate">
                                  {item.name || item.productName}
                                </p>
                                <p className="text-gray-400 text-[10px]">
                                  {item.storage || 'Tiêu chuẩn'} • {item.color || 'Mặc định'} • x{item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="p-3.5 font-black text-gray-900 text-sm">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </td>

                      {/* PT Thanh toán */}
                      <td className="p-3.5">
                        <span className="font-bold text-gray-700 block text-[11px] uppercase">
                          {order.paymentMethod === 'vnpay-qr'
                            ? 'VNPAY-QR'
                            : order.paymentMethod === 'momo'
                            ? 'MOMO'
                            : order.paymentMethod === 'card'
                            ? 'THẺ ATM/VISA'
                            : 'TIỀN MẶT (COD)'}
                        </span>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9.5px] font-extrabold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                        </span>
                      </td>

                      {/* Trạng thái đơn */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold inline-block ${
                            order.orderStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.orderStatus === 'SHIPPING'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.orderStatus === 'CANCELLED'
                              ? 'bg-gray-100 text-gray-500 border border-gray-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.orderStatus === 'COMPLETED'
                            ? 'Hoàn tất'
                            : order.orderStatus === 'SHIPPING'
                            ? 'Đang giao'
                            : order.orderStatus === 'CANCELLED'
                            ? 'Đã hủy'
                            : 'Đã xác nhận'}
                        </span>
                      </td>

                      {/* Dropdown Cập nhật trạng thái */}
                      <td className="p-3.5">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white outline-none cursor-pointer focus:border-[#d70018] font-medium"
                        >
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="COMPLETED">Hoàn tất (Đã TT)</option>
                          <option value="CANCELLED">Hủy đơn</option>
                        </select>
                      </td>

                      {/* Thao tác (Xóa đơn) */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(order.id, order.orderCode)}
                          className="p-1.5 text-gray-400 hover:text-[#d70018] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 size={15} />
                        </button>
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