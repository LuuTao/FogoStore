'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Layers,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export type AdminTab = 'analytics' | 'orders' | 'inventory' | 'products' | 'posts' | 'banners';

interface Props {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
}: Props) {
  const menuItems = [
    { key: 'analytics', label: 'Doanh Thu & Thống Kê', icon: TrendingUp },
    { key: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingCart },
    { key: 'inventory', label: 'Quản Lý Tồn Kho', icon: Layers },
    { key: 'products', label: 'Nhập Sản Phẩm Excel', icon: FileSpreadsheet },
    { key: 'posts', label: 'Bài Viết & SEO Blog', icon: FileText },
    { key: 'banners', label: 'Quản Lý Banner', icon: ImageIcon },
  ];

  const handleSelect = (key: AdminTab) => {
    setActiveTab(key);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* 1. DRAWER SLIDE-OVER CHO MOBILE & TABLET (< 1024px) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Lớp nền mờ click ra ngoài để đóng */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Khung drawer trượt ra từ mép trái */}
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#d70018] text-white">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                MENU QUẢN TRỊ FOGO
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-gray-100">
              {menuItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === key
                      ? 'bg-[#d70018] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 text-center">
              Hệ thống quản trị FoGo Store
            </div>
          </div>
        </div>
      )}

      {/* 2. CỘT DỌC CỐ ĐỊNH TRÊN DESKTOP (>= 1024px) */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 space-y-1.5 shrink-0 min-h-[calc(100vh-60px)]">
        <div className="text-[11px] font-extrabold uppercase text-gray-400 px-3 py-1 tracking-wider">
          Menu Điều Hành
        </div>
        {menuItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as AdminTab)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-[#d70018] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </aside>
    </>
  );
}