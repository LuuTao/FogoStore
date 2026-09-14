'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, CornerDownLeft, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  USED_HELPFUL_NEWS,
  RECENTLY_VIEWED_USED,
} from '@/data/usedCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

// 1. Danh mục cấp 1: 3 Nhóm lớn Hàng Cũ
const USED_CATEGORIES = [
  {
    name: 'iPhone Cũ',
    slug: 'iphone-cu',
    img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'iPad Cũ',
    slug: 'ipad-cu',
    img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'MacBook Cũ',
    slug: 'macbook-cu',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80',
  },
];

// 2. Danh mục cấp 2: Phân loại theo đời máy
const USED_SUBMODELS_MAP: Record<string, { name: string; slug: string; img: string }[]> = {
  'iphone-cu': [
    {
      name: 'iPhone 16 Series Cũ',
      slug: 'iphone-16-series-cu',
      img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 15 Series Cũ',
      slug: 'iphone-15-series-cu',
      img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 14 Series Cũ',
      slug: 'iphone-14-series-cu',
      img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 13 Series Cũ',
      slug: 'iphone-13-series-cu',
      img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'ipad-cu': [
    {
      name: 'iPad Pro Cũ',
      slug: 'ipad-pro-cu',
      img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Air Cũ',
      slug: 'ipad-air-cu',
      img: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Gen Cũ',
      slug: 'ipad-gen-cu',
      img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Mini Cũ',
      slug: 'ipad-mini-cu',
      img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'macbook-cu': [
    {
      name: 'MacBook Pro Cũ',
      slug: 'macbook-pro-cu',
      img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Air Cũ',
      slug: 'macbook-air-cu',
      img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicUsedPage() {
  const params = useParams();
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  
  // Đổi tên biến thành dbProducts để đồng bộ và tránh lỗi ReferenceError
  const [dbProducts, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy chính xác slug từ URL
  const slugParam = params?.slug;
  const currentFilter = Array.isArray(slugParam) ? slugParam[0] || '' : (slugParam as string) || '';

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchLiveUsedProducts = async () => {
      try {
        setLoading(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=hang-cu', { cache: 'no-store' });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch('https://fogo-store-api.onrender.com/api/products', { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        const mapped = itemsList.map((item: any) => {
          const v = item.variants?.[0] || {};
          const curPrice = v.price || item.price || 0;
          const origPrice = v.originalPrice || item.originalPrice || curPrice;
          const discountPercent = origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 12;

          const lower = (item.name || '').toLowerCase();
          let category = 'iphone-cu';
          let subModel = 'iphone-16-series-cu';

          if (lower.includes('macbook')) {
            category = 'macbook-cu';
            subModel = lower.includes('air') ? 'macbook-air-cu' : 'macbook-pro-cu';
          } else if (lower.includes('ipad')) {
            category = 'ipad-cu';
            if (lower.includes('pro')) subModel = 'ipad-pro-cu';
            else if (lower.includes('air')) subModel = 'ipad-air-cu';
            else if (lower.includes('mini')) subModel = 'ipad-mini-cu';
            else subModel = 'ipad-gen-cu';
          } else {
            category = 'iphone-cu';
            if (lower.includes('16')) subModel = 'iphone-16-series-cu';
            else if (lower.includes('15')) subModel = 'iphone-15-series-cu';
            else if (lower.includes('14')) subModel = 'iphone-14-series-cu';
            else subModel = 'iphone-13-series-cu';
          }

          return {
            id: item.id,
            name: item.name,
            category,
            subModel,
            href: `/san-pham/${item.slug || item.id}`,
            currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
            originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
            rawPrice: curPrice,
            discountPercent,
            conditionTag: '99% Zin Đẹp',
            imageUrl: v.images?.[0] || item.imageUrl || 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80',
            downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
            rating: 5,
            searchIndex: `${item.name || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase(),
          };
        });
        setDbItems(mapped);
      } catch (err) {
        console.error('Lỗi khi fetch hàng cũ từ API:', err);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveUsedProducts();
  }, []);

  // 2. Nhận diện danh mục cha
  const currentCategoryKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('iphone')) return 'iphone-cu';
    if (currentFilter.startsWith('ipad')) return 'ipad-cu';
    if (currentFilter.startsWith('macbook')) return 'macbook-cu';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentCategoryKey ? USED_SUBMODELS_MAP[currentCategoryKey] : null;

  // Logic lọc tự động kết hợp các sản phẩm cũ/like-new và bộ lọc nâng cao từ Modal
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    // 1. Lọc theo danh mục hoặc từ khóa hàng cũ
    items = items.filter((i) => {
      const lowerName = (i.name || '').toLowerCase();
      return (
        lowerName.includes('cũ') ||
        lowerName.includes('like new') ||
        lowerName.includes('99%') ||
        lowerName.includes('98%') ||
        true // Cho phép hiển thị linh hoạt các sản phẩm trong mục hàng cũ
      );
    });

    // 2. Lọc theo dòng máy (nếu trên URL có chọn sub-filter)
    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      items = items.filter((i) => i.searchIndex.includes(lowerFilter.replace(/[-]/g, ' ')));
    }

    // 3. Lọc nâng cao từ Modal Bộ Lọc (activeFilters)
    if (activeFilters.price) {
      items = items.filter((item) => {
        const price = parsePrice(item.rawPrice || item.currentPrice);
        if (activeFilters.price === 'Dưới 2 triệu') return price < 2000000;
        if (activeFilters.price === 'Từ 2 - 4 triệu') return price >= 2000000 && price <= 4000000;
        if (activeFilters.price === 'Từ 4 - 7 triệu') return price > 4000000 && price <= 7000000;
        if (activeFilters.price === 'Từ 7 - 13 triệu') return price > 7000000 && price <= 13000000;
        if (activeFilters.price === 'Từ 13 - 20 triệu') return price > 13000000 && price <= 20000000;
        if (activeFilters.price === 'Trên 20 triệu') return price > 20000000;
        return true;
      });
    }

    if (activeFilters.ram) {
      const ramVal = activeFilters.ram.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(ramVal));
    }

    if (activeFilters.storage) {
      const storeVal = activeFilters.storage.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(storeVal));
    }

    if (activeFilters.chip && activeFilters.chip.length > 0) {
      items = items.filter((item) =>
        activeFilters.chip!.some((c) => item.searchIndex.includes(c.toLowerCase().replace('apple ', '')))
      );
    }

    // Sắp xếp sản phẩm theo tiêu chí hiện tại
    items.sort((a, b) => {
      const priceA = parsePrice(a.rawPrice || a.currentPrice);
      const priceB = parsePrice(b.rawPrice || b.currentPrice);

      if (currentSort === 'price_asc') return priceA - priceB;
      if (currentSort === 'price_desc') return priceB - priceA;
      if (currentSort === 'id') return String(a.id).localeCompare(String(b.id));
      return 0;
    });

    return items;
  }, [dbProducts, currentFilter, currentSort, activeFilters]);

  // 4. Tiêu đề hiển thị
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'iphone-cu': return 'iPhone Cũ Like New 99%';
      case 'ipad-cu': return 'iPad Cũ Like New 99%';
      case 'macbook-cu': return 'MacBook Cũ Like New 99%';
      case 'iphone-16-series-cu': return 'iPhone 16 Series Cũ';
      case 'iphone-15-series-cu': return 'iPhone 15 Series Cũ';
      case 'iphone-14-series-cu': return 'iPhone 14 Series Cũ';
      case 'iphone-13-series-cu': return 'iPhone 13 Series Cũ';
      case 'ipad-pro-cu': return 'iPad Pro Cũ';
      case 'ipad-air-cu': return 'iPad Air Cũ';
      case 'ipad-gen-cu': return 'iPad Gen Cũ';
      case 'ipad-mini-cu': return 'iPad Mini Cũ';
      case 'macbook-pro-cu': return 'MacBook Pro Cũ';
      case 'macbook-air-cu': return 'MacBook Air Cũ';
      default: return 'Máy Cũ Tuyển Chọn - Thu Cũ Đổi Mới';
    }
  }, [currentFilter]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-gray-600">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/hang-cu" className="hover:text-[#d70018]">Hàng cũ</Link>
            {currentFilter && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-bold">{displayTitle}</span>
              </>
            )}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Banner */}
          <div className="relative mb-6 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-sm bg-gradient-to-r from-[#1c1d21] to-[#30333d] border border-gray-800 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm text-white">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 font-bold text-lg md:text-xl text-white">
                    <ShieldCheck size={20} className="text-emerald-400" />
                    <span>Cam Kết Máy Cũ Chuẩn Zin</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium my-2">Bảo hành 1 đổi 1 trong 12 tháng. Bao test 30 ngày.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Tiết kiệm đến <span className="text-sm">40% So với máy mới</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80"
                    alt="iPhone Cũ"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>

              <div className="relative rounded-sm bg-gradient-to-r from-[#fbf8f5] to-[#f4eef9] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>Thu Cũ Đổi Mới Lên Đời</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">Trợ giá thu mua thêm đến 2.000.000đ.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Trả trước <span className="text-sm">0đ - Duyệt hồ sơ 5 phút</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                    alt="MacBook Cũ"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thanh icon 2 tầng */}
          <div className="my-8 py-2">
            {activeSubmodels ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/hang-cu/${model.slug}`}
                        className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
                      >
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-2 bg-[#f0f2f5] flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'border-2 border-[#d70018] shadow-md bg-white scale-105'
                              : 'border border-gray-200 group-hover:border-[#d70018] group-hover:bg-white'
                          }`}
                        >
                          <img
                            src={model.img}
                            alt={model.name}
                            className="w-full h-full object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-semibold text-center transition-colors max-w-[130px] leading-tight ${
                            isSelected ? 'text-[#d70018] font-bold' : 'text-gray-800 group-hover:text-[#d70018]'
                          }`}
                        >
                          {model.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/hang-cu"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#d70018] transition-colors bg-gray-100 hover:bg-red-50 px-3.5 py-1.5 rounded-full border border-gray-200"
                >
                  <CornerDownLeft size={13} />
                  <span>Xem tất cả danh mục hàng cũ khác</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8 sm:gap-14 md:gap-20 flex-wrap">
                {USED_CATEGORIES.map((cat) => {
                  const isSelected = currentFilter === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/hang-cu/${cat.slug}`}
                      className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
                    >
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-2.5 bg-[#f0f2f5] flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'border-2 border-[#d70018] shadow-md bg-white scale-105'
                            : 'border border-gray-200 group-hover:border-[#d70018] group-hover:bg-white'
                        }`}
                      >
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="w-full h-full object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-base font-bold text-center transition-colors whitespace-nowrap ${
                          isSelected ? 'text-[#d70018]' : 'text-gray-800 group-hover:text-[#d70018]'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tiêu đề & Cụm Bộ Lọc */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} máy tuyển chọn chất lượng cao`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={currentCategoryKey === 'macbook-cu' || currentCategoryKey === 'ipad-cu'}
            />
          </div>

          {/* Lưới sản phẩm & Skeleton Loader */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-14">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-sm p-3 flex flex-col justify-between border border-gray-200 min-h-[430px] animate-pulse"
                >
                  <div className="flex justify-between items-center h-6">
                    <div className="w-10 h-4 bg-gray-200" />
                    <div className="w-16 h-3 bg-gray-200" />
                  </div>
                  <div className="w-full h-40 bg-gray-100 my-2 rounded" />
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200" />
                    <div className="w-3/4 h-4 bg-gray-200" />
                  </div>
                  <div className="w-full h-8 bg-gray-100 my-2" />
                  <div className="w-1/2 h-5 bg-gray-200" />
                  <div className="w-1/3 h-3 bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-14">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200 min-h-[430px]"
                >
                  <div className="flex items-center justify-between h-6">
                    <span className="bg-[#d70018] text-white text-[11px] font-black px-1.5 py-0.5 rounded-none">
                      -{product.discountPercent}%
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                      {product.conditionTag}
                    </span>
                  </div>

                  <Link href={product.href} className="w-full h-40 my-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    />
                  </Link>

                  <Link
                    href={product.href}
                    className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-2 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1 px-2 text-center relative">
                    <div className="text-[10px] font-bold text-gray-500 flex items-center justify-around">
                      <span>Trả Góp</span>
                      <span>•</span>
                      <span>Bảo Hành</span>
                      <span>•</span>
                      <span>Bao Test</span>
                    </div>
                    <div className="text-xs font-black text-[#d70018] tracking-tight flex items-center justify-around mt-0.5">
                      <span>0%</span>
                      <span>12T 1 đổi 1</span>
                      <span>30 Ngày</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm md:text-base font-black text-[#d70018]">{product.currentPrice}</span>
                    <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
                  </div>

                  <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                    Hoặc trả trước <strong className="text-gray-900">{product.downPayment}</strong>
                  </div>

                  <div className="flex items-center gap-0.5 mt-2 text-amber-400 h-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm mb-14">
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm máy cũ nào phù hợp với bộ lọc trong kho.</p>
              <Link href="/hang-cu" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả máy cũ
              </Link>
            </div>
          )}

          {/* Chân trang danh mục */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Kinh nghiệm mua máy cũ hữu ích</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {USED_HELPFUL_NEWS.map((news) => (
                    <Link
                      key={news.id}
                      href={news.href}
                      className="group flex gap-3 p-2 rounded-sm border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] line-clamp-3 leading-snug">
                        {news.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-[#fafafb] p-6 rounded-sm border border-gray-200 leading-relaxed text-gray-700 text-xs md:text-sm space-y-4">
                <h2 className="text-xl font-black text-gray-900">Mua {displayTitle} Uy Tín Tại Fogo Store</h2>
                <p>
                  Toàn bộ các sản phẩm máy cũ bao gồm <strong className="text-gray-900">iPhone Cũ, iPad Cũ và MacBook Cũ</strong> tại Fogo Store đều trải qua quy trình kiểm định nghiêm ngặt 30 bước: màn hình zin, pin dung lượng cao, camera sắc nét và không dính iCloud/MDM. Khách hàng được hưởng chính sách bảo hành 1 đổi 1 và dùng thử 30 ngày hoàn toàn miễn phí.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                <span>Bạn vừa xem</span>
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                {RECENTLY_VIEWED_USED.map((item) => (
                  <div key={item.id} className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm border border-gray-200">
                    <div className="w-full h-32 my-2 flex items-center justify-center overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="font-bold text-xs text-gray-800 line-clamp-2 h-[34px]">{item.name}</span>
                    <span className="text-xs font-black text-[#d70018] mt-2">{item.currentPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}