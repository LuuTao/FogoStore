'use client';

import React, { useState } from 'react';

interface SubCategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  keyword?: string;
  badge?: string;
}

interface Props {
  items: SubCategoryItem[];
  allImageUrl?: string; // Link ảnh máy dùng cho nút "Tất cả"
  onSelect?: (item: SubCategoryItem | null) => void;
}

export default function SubCategoryBar({
  items = [],
  allImageUrl = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80', // Ảnh máy cho nút Tất cả
  onSelect,
}: Props) {
  const [activeId, setActiveId] = useState<string>('all');

  const handleSelectAll = () => {
    setActiveId('all');
    if (onSelect) onSelect(null);
  };

  const handleSelectItem = (item: SubCategoryItem) => {
    setActiveId(item.id);
    if (onSelect) onSelect(item);
  };

  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-none select-none">
      <div className="flex items-start justify-center gap-5 sm:gap-7 md:gap-9 min-w-max px-4 mx-auto">
        
        {/* 1. NÚT "TẤT CẢ" DÙNG HÌNH ẢNH MÁY - BO TRÒN VIỀN ĐỎ KHI CHỌN */}
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-2.5 transition-all duration-200 overflow-hidden shrink-0 ${
              activeId === 'all'
                ? 'bg-white border-[2.5px] border-[#d70018] shadow-md shadow-red-100 scale-105'
                : 'bg-[#f0f2f5] border-[2.5px] border-transparent hover:bg-gray-200'
            }`}
          >
            <img
              src={allImageUrl}
              alt="Tất cả"
              className="w-full h-full object-contain rounded-full pointer-events-none"
            />
          </div>
          <span
            className={`text-xs sm:text-sm font-bold tracking-tight text-center ${
              activeId === 'all' ? 'text-[#d70018]' : 'text-gray-700 group-hover:text-black'
            }`}
          >
            Tất cả
          </span>
        </button>

        {/* 2. CÁC DÒNG SERIES CÒN LẠI */}
        {items.map((item) => {
          const isSelected = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectItem(item)}
              className="flex flex-col items-center gap-2 group cursor-pointer max-w-[85px] sm:max-w-[105px]"
            >
              <div
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-2.5 transition-all duration-200 overflow-hidden shrink-0 ${
                  isSelected
                    ? 'bg-white border-[2.5px] border-[#d70018] shadow-md shadow-red-100 scale-105'
                    : 'bg-[#f0f2f5] border-[2.5px] border-transparent hover:bg-gray-200'
                }`}
              >
                <img
                  src={item.imageUrl || '/placeholder.png'}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-xs"
                />
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xs sm:text-sm text-center leading-tight line-clamp-2 ${
                    isSelected
                      ? 'text-[#d70018] font-extrabold'
                      : 'text-gray-800 font-semibold group-hover:text-black'
                  }`}
                >
                  {item.name}
                </span>

                {item.badge && (
                  <span className="mt-1 bg-[#d70018] text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs uppercase">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}