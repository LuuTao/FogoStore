'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Calendar, 
  Phone, 
  Loader2,
  RefreshCw,
  Eye, 
  MapPin,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Crown,
  UserCheck,
  Sparkles
} from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

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
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  
  // State bộ lọc theo ngày/tháng/năm
  const [filterDate, setFilterDate] = useState<string>('');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // State quản lý chọn nhiều đơn hàng để xóa
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // State thông báo banner
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  // State Modal chỉnh sửa thông tin đơn hàng
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ customerName: '', customerPhone: '', address: '', note: '' });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // State Modal xác nhận xóa hiện đại giữa màn hình
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    orderId?: string;
    orderCode?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'single',
  });

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4000);
  };

  const getAdminToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('fogo_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      ''
    );
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res = await fetch(`${API_URL}/api/admin/orders`, { 
        headers,
        cache: 'no-store' 
      });
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

  const customerRankMap = useMemo(() => {
    const map = new Map<string, { totalOrders: number; totalSpent: number; rank: 'NEW' | 'RETURNING' | 'LOYAL' | 'VIP' }>();

    orders.forEach((ord) => {
      if (ord.orderStatus === 'CANCELLED') return;
      const phone = (ord.customerPhone || '').trim();
      if (!phone) return;

      if (!map.has(phone)) {
        map.set(phone, { totalOrders: 0, totalSpent: 0, rank: 'NEW' });
      }
      const item = map.get(phone)!;
      item.totalOrders += 1;
      item.totalSpent += Number(ord.totalAmount || 0);
    });

    map.forEach((item) => {
      if (item.totalOrders >= 5 || item.totalSpent >= 80000000) {
        item.rank = 'VIP';
      } else if (item.totalOrders >= 3 || item.totalSpent >= 30000000) {
        item.rank = 'LOYAL';
      } else if (item.totalOrders >= 2) {
        item.rank = 'RETURNING';
      } else {
        item.rank = 'NEW';
      }
    });

    return map;
  }, [orders]);

  const renderCustomerRankBadge = (phone: string) => {
    const cleanPhone = (phone || '').trim();
    const info = customerRankMap.get(cleanPhone);
    if (!info) return null;

    switch (info.rank) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs">
            <Crown size={10} className="text-amber-500" />
            VIP
          </span>
        );
      case 'LOYAL':
        return (
          <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
            <UserCheck size={10} className="text-purple-600" />
            Thân thiết
          </span>
        );
      case 'RETURNING':
        return (
          <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium px-1.5 py-0.5 rounded">
            Quay lại ({info.totalOrders})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-1.5 py-0.5 rounded">
            <Sparkles size={10} className="text-emerald-500" />
            Khách mới
          </span>
        );
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const currentOrder = orders.find((o) => o.id === orderId);
      const rawMethod = (currentOrder?.paymentMethod || '').toLowerCase();
      const isQrMethod = ['vnpay-qr', 'momo', 'qr', 'bank'].includes(rawMethod);

      // Quy tắc thanh toán:
      // - Chuyển khoản QR: Luôn là PAID
      // - Tiền mặt (COD): Chỉ khi chọn Hoàn tất (COMPLETED) mới là PAID, còn lại là UNPAID
      const expectedPaymentStatus = (isQrMethod || newStatus === 'COMPLETED') ? 'PAID' : 'UNPAID';

      const token = getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        orderStatus: newStatus,
        paymentStatus: expectedPaymentStatus,
      };

      let res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('Cập nhật trạng thái đơn hàng thành công!', 'success');
        setOrders((prev) =>
          prev.map((ord) => 
            ord.id === orderId 
              ? { 
                  ...ord, 
                  orderStatus: newStatus, 
                  paymentStatus: expectedPaymentStatus 
                } 
              : ord
          )
        );
      } else {
        showAlert(data.message || 'Cập nhật thất bại', 'error');
      }
    } catch {
      showAlert('Không thể kết nối máy chủ!', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setIsSubmittingEdit(true);
      const token = getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/orders/${editingOrder.orderCode || editingOrder.id}/update`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('Chỉnh sửa thông tin đơn hàng thành công!', 'success');
        setIsEditModalOpen(false);
        fetchOrders();
      } else {
        showAlert(data.error || 'Không thể cập nhật đơn hàng', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối khi cập nhật đơn hàng!', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const triggerDeleteSingle = (orderId: string, orderCode: string) => {
    setConfirmDeleteModal({
      isOpen: true,
      type: 'single',
      orderId,
      orderCode,
    });
  };

  const triggerDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setConfirmDeleteModal({
      isOpen: true,
      type: 'bulk',
      count: selectedIds.length,
    });
  };

  const handleExecuteDelete = async () => {
    const token = getAdminToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (confirmDeleteModal.type === 'single' && confirmDeleteModal.orderId) {
      try {
        setIsDeleting(true);
        const res = await fetch(`${API_URL}/api/admin/orders/${confirmDeleteModal.orderId}`, {
          method: 'DELETE',
          headers,
        });
        if (res.ok) {
          showAlert(`Đã xóa thành công đơn hàng #${confirmDeleteModal.orderCode}!`, 'success');
          setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteModal.orderId));
          setOrders((prev) => prev.filter((ord) => ord.id !== confirmDeleteModal.orderId));
        } else {
          const data = await res.json();
          showAlert(data.error || data.message || 'Xóa đơn hàng thất bại', 'error');
        }
      } catch {
        showAlert('Không thể kết nối máy chủ khi xóa đơn!', 'error');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteModal({ isOpen: false, type: 'single' });
      }
    } else if (confirmDeleteModal.type === 'bulk') {
      try {
        setIsDeleting(true);
        const res = await fetch(`${API_URL}/api/admin/orders/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (res.ok) {
          showAlert(`Đã xóa thành công ${selectedIds.length} đơn hàng đã chọn!`, 'success');
          setOrders((prev) => prev.filter((ord) => !selectedIds.includes(ord.id)));
          setSelectedIds([]);
        } else {
          const data = await res.json();
          showAlert(data.error || data.message || 'Xóa hàng loạt thất bại', 'error');
        }
      } catch {
        showAlert('Lỗi kết nối khi xóa hàng loạt đơn hàng!', 'error');
      } finally {
        setIsDeleting(false);
        setConfirmDeleteModal({ isOpen: false, type: 'bulk' });
      }
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

    let matchDate = true;
    if (filterDate && ord.createdAt) {
      const orderDateStr = new Date(ord.createdAt).toISOString().split('T')[0];
      matchDate = orderDateStr === filterDate;
    }

    return matchStatus && matchKeyword && matchDate;
  });

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
    <div className="space-y-6 max-w-full overflow-hidden select-none relative">
      {/* THÔNG BÁO BANNER TRÊN ĐẦU */}
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
          {/* Ô TÌM KIẾM */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm mã đơn, tên, SĐT..."
              className="text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-[#d70018] w-44"
            />
          </div>

          {/* CHỌN NGÀY / THÁNG / NĂM */}
          <div className="relative flex items-center bg-white border border-gray-300 rounded-md px-2.5 py-1 text-xs">
            <Calendar size={14} className="text-[#d70018] mr-1.5 shrink-0" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
              title="Lọc theo ngày đặt hàng"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="ml-1 text-gray-400 hover:text-red-600 cursor-pointer"
                title="Xóa lọc ngày"
              >
                <X size={13} />
              </button>
            )}
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

      {/* Thanh thao tác nổi khi chọn nhiều đơn */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <CheckSquare size={16} className="text-[#d70018]" />
            <span>Đã chọn {selectedIds.length} đơn hàng</span>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={triggerDeleteBulk}
            className="bg-[#d70018] hover:bg-[#b50014] text-white px-3.5 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <Trash2 size={13} />
            <span>Xóa các đơn đã chọn</span>
          </button>
        </div>
      )}

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {isAllSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
                  </button>
                </th>
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
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                    <span>Đang nạp dữ liệu đơn hàng từ cơ sở dữ liệu...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-semibold">
                    <AlertTriangle size={24} className="mx-auto text-gray-300 mb-2" />
                    <span>Không có đơn hàng nào khớp với điều kiện tìm kiếm</span>
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
                  const isSelected = selectedIds.includes(ord.id);

                  // QUY TẮC THANH TOÁN CHUẨN XÁC:
                  // 1. Chuyển khoản QR: Luôn là Đã chuyển tiền (true)
                  // 2. Tiền mặt (COD): Chỉ là Đã chuyển tiền khi trạng thái là Hoàn tất (COMPLETED) hoặc DB lưu PAID
                  const rawMethod = (ord.paymentMethod || '').toLowerCase();
                  const isQrMethod = ['vnpay-qr', 'momo', 'qr', 'bank'].includes(rawMethod);
                  const isPaid = isQrMethod || ord.orderStatus === 'COMPLETED' || ord.paymentStatus === 'PAID';

                  return (
                    <tr key={ord.id} className={`hover:bg-gray-50/70 transition-colors ${isSelected ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(ord.id)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-[#d70018]" /> : <Square size={16} />}
                        </button>
                      </td>

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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-gray-900">{ord.customerName}</p>
                          {renderCustomerRankBadge(ord.customerPhone)}
                        </div>
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

                      {/* CỘT PHƯƠNG THỨC THANH TOÁN */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-gray-700 uppercase text-[11px] block">
                          {isQrMethod ? 'Chuyển khoản QR' : 'Tiền mặt (COD)'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'Đã chuyển tiền' : 'Chưa thanh toán'}
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
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/don-hang/${ord.orderCode}`}
                            target="_blank"
                            className="p-1.5 bg-gray-100 hover:bg-[#d70018] hover:text-white rounded text-gray-600 inline-flex items-center justify-center transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ord)}
                            className="p-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white rounded text-gray-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerDeleteSingle(ord.id, ord.orderCode)}
                            className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white rounded text-gray-600 inline-flex items-center justify-center transition-colors cursor-pointer"
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

      {/* MODAL XÁC NHẬN XÓA HIỆN ĐẠI NGAY GIỮA MÀN HÌNH */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center space-y-4 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-[#d70018] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                {confirmDeleteModal.type === 'single'
                  ? 'Xác nhận xóa đơn hàng?'
                  : `Xóa ${confirmDeleteModal.count} đơn hàng đã chọn?`}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {confirmDeleteModal.type === 'single' ? (
                  <>
                    Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng{' '}
                    <strong className="text-gray-800">#{confirmDeleteModal.orderCode}</strong> khỏi hệ thống? Hành động này không thể hoàn tác.
                  </>
                ) : (
                  'Toàn bộ các đơn hàng đã được chọn sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn tiếp tục?'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteModal({ isOpen: false, type: 'single' })}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#d70018] hover:bg-[#b50014] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Xác nhận xóa</span>
                  </>
                )}
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