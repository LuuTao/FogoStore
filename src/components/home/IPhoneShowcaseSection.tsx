'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

interface TabItem {
  id: string;
  name: string;
  imageUrl: string;
  queryValue: string | null; // Giá trị dùng để so khớp lọc sản phẩm
}

// Dữ liệu ban đầu làm fallback nếu Admin chưa lưu
const DEFAULT_TABS: TabItem[] = [
  {
    id: 'sub-ip-1',
    name: 'Tất cả',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    queryValue: null,
  },
  {
    id: 'sub-ip-2',
    name: 'iPhone 16 Series',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100',
    queryValue: '16',
  },
  {
    id: 'sub-ip-3',
    name: 'iPhone 15 Series',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    queryValue: '15',
  },
  {
    id: 'sub-ip-4',
    name: 'iPhone 14 Series',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100',
    queryValue: '14',
  },
  {
    id: 'sub-ip-5',
    name: 'iPhone 13 Series',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100',
    queryValue: '13',
  },
];

export const IPhoneShowcaseSection: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabItem | null>(null);

  // 1. Nạp Tabs động từ Admin (nhóm sub_iphone)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_banners_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const adminSubIphones = parsed.filter((it: any) => it.group === 'sub_iphone');
          if (adminSubIphones.length > 0) {
            const dynamicTabs: TabItem[] = adminSubIphones.map((it: any) => {
              const nameLower = (it.name || '').trim().toLowerCase();
              const isAll = nameLower === 'tất cả' || nameLower === 'all';
              
              // Tự động rút trích số Series từ tên tab (ví dụ: "iPhone 17 Series" -> "17")
              const matchNum = it.name.match(/\d+/);
              const queryValue = isAll ? null : matchNum ? matchNum[0] : it.name.trim();

              return {
                id: it.id,
                name: it.name,
                imageUrl: it.imageUrl,
                queryValue,
              };
            });
            setTabs(dynamicTabs);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi nạp submodel iphone từ cấu hình Admin:', e);
    }
  }, []);

  // 2. Fetch dữ liệu sản phẩm từ Database
  useEffect(() => {
    const fetchIPhones = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/filter?category=iphone', {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data.map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || 0;
            const origPrice = v.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              // Gộp tên đầy đủ để tìm kiếm thông minh
              searchKeywords: `${item.name} ${item.subSeriesName || ''}`.toLowerCase(),
              href: `/iphone/${item.slug}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
              downPayment: Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ',
              rating: 5,
              isFeatured: item.isFeatured,
            };
          });

          const sorted = formatted.sort(
            (a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
          );
          setProducts(sorted);
        }
      } catch (err) {
        console.error('Lỗi nạp sản phẩm iPhone trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPhones();
  }, []);

  const handleTabClick = (tab: TabItem) => {
    if (!tab.queryValue) {
      setSelectedTab(null); // Click 'Tất cả'
    } else {
      setSelectedTab((prev) => (prev?.id === tab.id ? null : tab));
    }
  };

  // 3. Logic lọc thông minh: Bắt khớp bất kỳ số Series nào trong tên sản phẩm
  const displayedItems = useMemo(() => {
    if (!selectedTab || !selectedTab.queryValue) {
      return products.slice(0, 10);
    }
    const val = selectedTab.queryValue.toLowerCase();
    return products
      .filter((p) => p.searchKeywords.includes(val))
      .slice(0, 10);
  }, [products, selectedTab]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 select-none">
      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-md p-5 md:p-8 shadow-sm">
        
        {/* ================= 1. HÀNG ICON SERIES ĐỒNG BỘ ADMIN ================= */}
        <div className="flex items-center justify-center gap-6 md:gap-12 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected =
              (!selectedTab && !tab.queryValue) || selectedTab?.id === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105"
              >
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center border-2 transition-all ${
                    isSelected
                      ? 'border-[#d70018] shadow-md scale-105 ring-2 ring-red-100'
                      : 'border-transparent group-hover:border-red-200'
                  }`}
                >
                  <img src={tab.imageUrl} alt={tab.name} className="w-full h-full object-contain" />
                </div>

                <span
                  className={`text-xs md:text-sm transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'text-[#d70018] font-black'
                      : 'text-gray-700 font-semibold group-hover:text-[#d70018]'
                  }`}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= 2. LƯỚI SẢN PHẨM ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200/80 min-h-[420px]"
            >
              <div className="flex items-center justify-between h-6">
                <span className="bg-[#d70018] text-white text-[11px] font-black px-1.5 py-0.5 rounded-none">
                  -{product.discountPercent}%
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                  <span></span>
                  <span className="scale-90 origin-right">Authorized Reseller</span>
                </div>
              </div>

              <Link
                href={product.href}
                className="w-full h-40 my-2 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                />
              </Link>

              <Link
                href={product.href}
                className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug cursor-pointer"
              >
                {product.name}
              </Link>

              {/* Box Trả góp 0% */}
              <div className="mt-2.5 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1.5 px-2 text-center relative">
                <div className="text-[10px] font-bold text-gray-500 flex items-center justify-around">
                  <span>Trả Góp</span>
                  <span>•</span>
                  <span>Trả Trước</span>
                  <span>•</span>
                  <span>Phí</span>
                </div>
                <div className="text-xs font-black text-[#d70018] tracking-tight flex items-center justify-around mt-0.5">
                  <span>0%</span>
                  <span>0đ</span>
                  <span>0đ</span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-sm md:text-base font-black text-[#d70018]">
                  {product.currentPrice}
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  {product.originalPrice}
                </span>
              </div>

              <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                Hoặc trả trước <strong className="text-gray-900">{product.downPayment}</strong>
              </div>

              <div className="flex items-center gap-0.5 mt-2 text-amber-400 h-3">
                {[...Array(product.rating || 5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. NÚT XEM TOÀN BỘ SẢN PHẨM ================= */}
        <div className="flex justify-center items-center mt-8">
          <Link
            href={
              selectedTab?.queryValue
                ? `/iphone?series=${selectedTab.queryValue}`
                : '/iphone'
            }
            className="inline-flex items-center gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-sm px-8 py-2.5 rounded-sm shadow hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {selectedTab?.queryValue
                ? `Xem toàn bộ sản phẩm ${selectedTab.name}`
                : 'Xem toàn bộ sản phẩm iPhone'}
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};