'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const InventoryTab = dynamic(
  () => import('@/components/admin/InventoryTab').then((mod) => mod.default || (mod as any).InventoryTab),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-16 text-xs font-bold text-gray-500">
        <Loader2 size={22} className="animate-spin text-[#d70018] mr-2" />
        Đang tải dữ liệu tồn kho thật từ hệ thống...
      </div>
    ),
  }
);

export default function TonKhoPage() {
  return <InventoryTab />;
}