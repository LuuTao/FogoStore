'use client';

import React from 'react';
import { TrendingUp, ShoppingCart, Layers, FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react';

export type AdminTab = 'analytics' | 'orders' | 'inventory' | 'products' | 'posts' | 'banners';

interface Props {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: Props) {
  const menuItems = [
    { key: 'analytics', label: 'Doanh Thu & Thống Kê', icon: TrendingUp },
    { key: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingCart },
    { key: 'inventory', label: 'Quản Lý Tồn Kho', icon: Layers },
    { key: 'products', label: 'Nhập Sản Phẩm Excel', icon: FileSpreadsheet },
    { key: 'posts', label: 'Bài Viết & SEO Blog', icon: FileText },
    { key: 'banners', label: 'Quản Lý Banner', icon: ImageIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0">
      {menuItems.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key as AdminTab)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === key ? 'bg-[#d70018] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </aside>
  );
}