'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

interface TabItem {
  id: string;
  name: string;
  imageUrl: string;
  queryValue: string | null;
}

const DEFAULT_TABS: TabItem[] = [
  {
    id: 'sub-ip-1',
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryValue: null,
  },
  {
    id: 'sub-ip-2',
    name: 'iPhone Duo',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryValue: 'duo',
  },
  {
    id: 'sub-ip-3',
    name: 'iPhone 18 Series',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    queryValue: '18',
  },
  {
    id: 'sub-ip-4',
    name: 'iPhone 17 Series',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    queryTag: '17',
  },
  {
    id: 'sub-ip-5',
    name: 'iPhone 16 Series',
    imageUrl: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    queryValue: '16',
  },
];

export const IPhoneShowcaseSection: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabItem | null>(null);

  // 1. Nạp Tabs động từ Admin
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
      console.error('Lỗi nạp submodel iphone:', e);
    }
  }, []);

  // 2. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchIPhones = async () => {
      try {
        const res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=iphone', {
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
              searchKeywords: `${item.name} ${item.subSeriesName || ''}`.toLowerCase(),
              href: `/san-pham/${item.slug}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                item.imageUrl ||
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
        console.error('Lỗi nạp sản phẩm iPhone:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPhones();
  }, []);

  const handleTabClick = (tab: TabItem) => {
    if (!tab.queryValue) {
      setSelectedTab(null);
    } else {
      setSelectedTab((prev) => (prev?.id === tab.id ? null : tab));
    }
  };

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
    <section className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10 select-none w-full overflow-hidden">
      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-xl p-3 sm:p-5 md:p-8 shadow-xs">
        
        {/* ================= 1. HÀNG ICON SERIES: BO TRÒN TUYỆT ĐỐI KHÔNG LÒI GÓC VUÔNG ================= */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-9 gap-y-3 mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const isSelected =
              (!selectedTab && !tab.queryValue) || selectedTab?.id === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer w-[72px] sm:w-[88px] md:w-[100px] transition-transform active:scale-95"
              >
                {/* Khung tròn chuẩn 80px, bo tròn hoàn toàn và khóa góc lòi bằng overflow-hidden */}
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#d70018] shadow-md shadow-red-100 scale-105 ring-2 ring-red-100/50'
                      : 'border-2 border-transparent bg-white hover:border-gray-200 shadow-xs'
                  }`}
                >
                  <img
                    src={tab.imageUrl}
                    alt={tab.name}
                    className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-2xs"
                  />
                </div>

                <span
                  className={`text-[11px] sm:text-xs md:text-sm text-center line-clamp-1 transition-colors w-full ${
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 group border border-gray-200/80"
            >
              <div>
                <div className="flex items-center justify-between h-5 sm:h-6">
                  <span className="bg-[#d70018] text-white text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-sm">
                    -{product.discountPercent}%
                  </span>
                  <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-gray-400">
                    <span></span>
                    <span className="scale-90 origin-right truncate">VN/A</span>
                  </div>
                </div>

                {/* Khung ảnh sản phẩm */}
                <Link
                  href={product.href}
                  className="w-full aspect-square my-2 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                  />
                </Link>

                <Link
                  href={product.href}
                  className="font-bold text-xs sm:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[34px] sm:min-h-[38px] leading-snug"
                >
                  {product.name}
                </Link>
              </div>

              <div>
                {/* Box Trả góp 0% */}
                <div className="mt-2 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1 px-1.5 text-center">
                  <div className="text-[8px] sm:text-[9px] font-bold text-gray-500 flex items-center justify-around">
                    <span>Trả Góp</span>
                    <span>•</span>
                    <span>Trả Trước</span>
                    <span>•</span>
                    <span>Phí</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-black text-[#d70018] tracking-tight flex items-center justify-around mt-0.5">
                    <span>0%</span>
                    <span>0đ</span>
                    <span>0đ</span>
                  </div>
                </div>

                {/* Giá tiền */}
                <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline gap-1">
                  <span className="text-xs sm:text-sm md:text-base font-black text-[#d70018]">
                    {product.currentPrice}
                  </span>
                  <span className="text-[9px] sm:text-[11px] text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                </div>

                <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                  Trả trước <strong className="text-gray-900">{product.downPayment}</strong>
                </div>

                <div className="flex items-center gap-0.5 mt-1.5 text-amber-400">
                  {[...Array(product.rating || 5)].map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. NÚT XEM TẤT CẢ ================= */}
        <div className="flex justify-center items-center mt-6 sm:mt-8">
          <Link
            href={
              selectedTab?.queryValue
                ? `/iphone?series=${selectedTab.queryValue}`
                : '/iphone'
            }
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-md shadow-xs hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {selectedTab?.queryValue
                ? `Xem toàn bộ iPhone ${selectedTab.name}`
                : 'Xem toàn bộ iPhone'}
            </span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IPhoneShowcaseSection;