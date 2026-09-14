'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Tắt SSR để ngăn chặn hoàn toàn lỗi crash 'This page couldn't load'
const InventoryTab = dynamic(
  () =>
    import('@/components/admin/InventoryTab').then((mod) => mod.default || (mod as any).InventoryTab),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12 text-xs font-bold text-gray-500">
        <Loader2 size={20} className="animate-spin text-[#d70018] mr-2" />
        Đang nạp dữ liệu tồn kho...
      </div>
    ),
  }
);

export default function TonKhoPage() {
  return <InventoryTab />;
}