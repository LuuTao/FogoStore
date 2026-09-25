'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  Search, 
  CheckSquare, 
  Square, 
  RotateCw, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  X,
  Save,
  Loader2
} from 'lucide-react';

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

  // State hiển thị thông báo kiểu Banner
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  // State Modal chỉnh sửa thông tin đơn hàng
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ customerName: '', customerPhone: '', address: '', note: '' });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // State Modal xác nhận xóa thay thế confirm()
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'single' | 'bulk';
    targetId?: string;
    title: string;
    description: string;
  }>({
    open: false,
    type: 'single',
    title: '',
    description: '',
  });

  const getAdminToken = () =>
    localStorage.getItem('fogo_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('fogo_admin_token') ||
    '';

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 3500);
  };

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

  // Cập nhật trạng thái đơn (kèm Token)
  const handleUpdateStatus = async (id: string, newOrderStatus: string) => {
    try {
      const token = getAdminToken();
      const payload: { orderStatus: string; paymentStatus?: string } = {
        orderStatus: newOrderStatus,
      };

      if (newOrderStatus === 'COMPLETED') {
        payload.paymentStatus = 'PAID';
      }

      const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert('Cập nhật trạng thái đơn hàng thành công!', 'success');
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert(data.message || data.error || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ khi cập nhật đơn hàng', 'error');
    }
  };

  // Mở modal chỉnh sửa đơn hàng
  const handleOpenEdit = (order: any) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      address: order.address || '',
      note: order.note || '',
    });
    setIsEditModalOpen(true);
  };

  // Lưu chỉnh sửa thông tin đơn hàng
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setIsSubmittingEdit(true);
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/orders/${editingOrder.orderCode || editingOrder.id}/update`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showAlert('Chỉnh sửa thông tin đơn hàng thành công!', 'success');
        setIsEditModalOpen(false);
        onRefresh();
      } else {
        showAlert(data.message || data.error || 'Không thể cập nhật đơn hàng', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối khi cập nhật đơn hàng', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Thực thi xóa qua Modal
  const handleExecuteDelete = async () => {
    try {
      setIsDeleting(true);
      const token = getAdminToken();

      if (deleteModal.type === 'single' && deleteModal.targetId) {
        const res = await fetch(`${API_URL}/api/admin/orders/${deleteModal.targetId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          showAlert('Đã xóa đơn hàng thành công!', 'success');
          setSelectedIds((prev) => prev.filter((item) => item !== deleteModal.targetId));
          setDeleteModal({ open: false, type: 'single', title: '', description: '' });
          onRefresh();
        } else {
          const data = await res.json().catch(() => ({}));
          showAlert(data.message || data.error || 'Không thể xóa đơn hàng này', 'error');
        }
      } else if (deleteModal.type === 'bulk') {
        const res = await fetch(`${API_URL}/api/admin/orders/bulk-delete`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (res.ok) {
          showAlert(`Đã xóa thành công ${selectedIds.length} đơn hàng!`, 'success');
          setSelectedIds([]);
          setDeleteModal({ open: false, type: 'bulk', title: '', description: '' });
          onRefresh();
        } else {
          const data = await res.json().catch(() => ({}));
          showAlert(data.message || data.error || 'Xảy ra lỗi khi xóa đơn hàng', 'error');
        }
      }
    } catch {
      showAlert('Lỗi kết nối khi thực hiện xóa', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="space-y-5 select-none relative">
      {/* THÔNG BÁO BANNER */}
      {alertInfo && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
            alertInfo.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertInfo.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={18} className="text-red-600 shrink-0" />
            )}
            <span>{alertInfo.message}</span>
          </div>
          <button onClick={() => setAlertInfo(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. THANH TIÊU ĐỀ & TÌM KIẾM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Quản Lý Đơn Hàng Đã Bán</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng cộng: <strong className="text-gray-800">{orders.length}</strong> đơn hàng đã ghi nhận vào cơ sở dữ liệu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

      {/* 2. THANH THAO TÁC NỔI KHI CHỌN NHIỀU ĐƠN */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <CheckSquare size={16} className="text-[#d70018]" />
            <span>Đã chọn {selectedIds.length} đơn hàng</span>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              setDeleteModal({
                open: true,
                type: 'bulk',
                title: `Xác nhận xóa ${selectedIds.length} đơn hàng`,
                description: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} đơn hàng đã chọn khỏi hệ thống?`,
              })
            }
            className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <Trash2 size={13} />
            <span>Xóa các đơn đã chọn</span>
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
                  <button type="button" onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    {isAllSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
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
                    <tr key={order.id} className={`hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-red-50/30' : ''}`}>
                      <td className="p-3.5 text-center">
                        <button type="button" onClick={() => toggleSelectItem(order.id)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                          {isSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-[#d70018] block text-[13px]">{order.orderCode}</span>
                        <span className="text-gray-400 text-[10px] block mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-gray-600 text-[11px] font-mono mt-0.5">{order.customerPhone}</p>
                        <p className="text-gray-400 text-[10px] truncate max-w-[180px] mt-0.5" title={order.address}>
                          {order.address || 'Tại quầy'}
                        </p>
                      </td>

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
                                <p className="font-medium text-gray-900 truncate">{item.name || item.productName}</p>
                                <p className="text-gray-400 text-[10px]">
                                  {item.storage || 'Tiêu chuẩn'} • {item.color || 'Mặc định'} • x{item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-black text-gray-900 text-sm">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-gray-700 block text-[11px] uppercase">
                          {order.paymentMethod === 'vnpay-qr' ? 'VNPAY-QR' : order.paymentMethod === 'momo' ? 'MOMO' : 'TIỀN MẶT (COD)'}
                        </span>
                        <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9.5px] font-extrabold ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold inline-block ${order.orderStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {order.orderStatus === 'COMPLETED' ? 'Hoàn tất' : order.orderStatus === 'SHIPPING' ? 'Đang giao' : order.orderStatus === 'CANCELLED' ? 'Đã hủy' : 'Đã xác nhận'}
                        </span>
                      </td>

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

                      {/* Thao tác: Xem, Sửa, Xóa */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/don-hang/${order.orderCode}`}
                            target="_blank"
                            className="p-1.5 bg-gray-100 hover:bg-[#d70018] hover:text-white rounded text-gray-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </Link>
                          
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white rounded text-gray-600 transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin đơn"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                type: 'single',
                                targetId: order.id,
                                title: `Xác nhận xóa đơn hàng #${order.orderCode}`,
                                description: 'Bạn có chắc chắn muốn xóa đơn hàng này cùng toàn bộ chi tiết sản phẩm liên quan?',
                              })
                            }
                            className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white rounded text-gray-600 transition-colors cursor-pointer"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA HIỆN ĐẠI */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900">{deleteModal.title}</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-medium">
                {deleteModal.description}
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                * Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, type: 'single', title: '', description: '' })}
                disabled={isDeleting}
                className="py-2.5 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 bg-[#d70018] hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{isDeleting ? 'Đang xóa...' : 'Đồng ý xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA THÔNG TIN ĐƠN HÀNG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-900 uppercase">
                Chỉnh sửa đơn hàng #{editingOrder?.orderCode}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tên khách hàng:</label>
                <input
                  type="text"
                  required
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  required
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Địa chỉ giao hàng:</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#d70018]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú:</label>
                <textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#d70018]"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 bg-[#d70018] hover:bg-red-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmittingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}