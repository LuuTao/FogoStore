'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AnalyticsTab from '@/components/admin/AnalyticsTab';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function ThongKePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/orders`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else if (Array.isArray(json)) {
        setOrders(json);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-20 text-xs font-bold text-gray-500">
        <Loader2 size={24} className="animate-spin text-[#d70018] mr-2" />
        Đang tổng hợp dữ liệu doanh thu từ hệ thống...
      </div>
    );
  }

  // Chuyển toàn bộ danh sách đơn hàng vào analytics để component tự xử lý logic lọc
  return <AnalyticsTab analytics={{ orders }} />;
}