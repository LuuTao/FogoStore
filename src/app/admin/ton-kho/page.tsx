'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import InventoryTab from '@/components/admin/InventoryTab';

const API_URL = 'https://fogo-store-api.onrender.com';

export default function TonKhoPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/inventory`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInventory(json.data);
      } else if (Array.isArray(json)) {
        setInventory(json);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải kho hàng:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center p-20 text-xs font-bold text-gray-500">
        <Loader2 size={24} className="animate-spin text-[#d70018] mr-2" />
        Đang nạp cơ sở dữ liệu tồn kho từ hệ thống...
      </div>
    );
  }

  return <InventoryTab inventory={inventory} onRefresh={fetchInventory} />;
}