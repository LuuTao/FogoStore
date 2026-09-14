'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, CornerDownLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { IPAD_HELPFUL_NEWS } from '@/data/ipadCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

// 1. Dữ liệu 4 dòng lớn
const IPAD_SERIES_LIST = [
  {
    name: 'iPad Pro',
    slug: 'ipad-pro',
    img: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'iPad Air',
    slug: 'ipad-air',
    img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'iPad Gen',
    slug: 'ipad-gen',
    img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_30_8234a6ff9e3b48fd9cc8571feaf230a7_master.jpeg?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'iPad Mini',
    slug: 'ipad-mini',
    img: 'https://product.hstatic.net/200000768357/product/hinh_anh_12_6ddc1b37c55c4213838c8e5047f59a8c_master.jpeg?auto=format&fit=crop&w=150&q=80',
  },
];

// 2. Danh mục model con
const IPAD_SUBMODELS_MAP: Record<
  string,
  { name: string; slug: string; img: string }[]
> = {
  'ipad-pro': [
    {
      name: 'iPad Pro M5',
      slug: 'ipad-pro-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Pro M4',
      slug: 'ipad-pro-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Pro M2',
      slug: 'ipad-pro-m2',
      img: 'https://product.hstatic.net/200000768357/product/ipad_pro_m2_-_11_inch__colors__c4189cc924bb40b181351e979df29f64_master.png?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'ipad-air': [
    {
      name: 'iPad Air M4',
      slug: 'ipad-air-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Air 7',
      slug: 'ipad-air-7',
      img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPad Air 6',
      slug: 'ipad-air-6',
      img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'iPad Air 5',
      slug: 'ipad-air-5',
      img: 'https://product.hstatic.net/200000768357/product/ipad_air_5__colors__06251c7b63d5478188404b205b5b5fdb_master.png?auto=format&fit=crop&w=150&q=80'
    },
  ],
  'ipad-gen': [
    {
      name: 'iPad Gen 11',
      slug: 'ipad-gen-11',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_30_8234a6ff9e3b48fd9cc8571feaf230a7_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'ipad-mini': [
    {
      name: 'iPad Mini 7',
      slug: 'ipad-mini-7',
      img: 'https://product.hstatic.net/200000768357/product/hinh_anh_12_6ddc1b37c55c4213838c8e5047f59a8c_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicIPadPage() {
  const params = useParams();
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  
  const [dbProducts, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const slugArray = (params?.slug as string[]) || [];
  const currentFilter = slugArray[0] || '';

  // Đọc danh sách sản phẩm vừa xem thực tế từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) {
        setRecentViewed(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  // Kết nối API Backend để đồng bộ với Database
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setLoading(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=ipad', {
          cache: 'no-store',
        });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch('https://fogo-store-api.onrender.com/api/products', { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        const mapped = itemsList
          .filter((item: any) => {
            const lower = (item.name || '').toLowerCase();
            const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
            return cat.includes('ipad') || lower.includes('ipad');
          })
          .map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || item.price || 0;
            const origPrice = v.originalPrice || item.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

            const lower = item.name.toLowerCase();
            let series = 'ipad-pro';
            let subModel = 'ipad-pro-m4';

            if (lower.includes('air')) {
              series = 'ipad-air';
              subModel = lower.includes('m2') ? 'ipad-air-m2' : 'ipad-air-5';
            } else if (lower.includes('mini')) {
              series = 'ipad-mini';
              subModel = 'ipad-mini-7';
            } else if (lower.includes('gen')) {
              series = 'ipad-gen';
              subModel = 'ipad-gen-11';
            } else {
              subModel = lower.includes('m4') ? 'ipad-pro-m4' : 'ipad-pro-m2';
            }

            return {
              id: item.id,
              name: item.name,
              series,
              subModel,
              href: `/san-pham/${item.slug || item.id}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              rawPrice: curPrice,
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                item.imageUrl ||
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
              downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
              statusTag: 'Sẵn hàng',
              rating: 5,
              searchIndex: `${item.name || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase(),
            };
          });

        setDbItems(mapped);
      } catch (err) {
        console.error('Lỗi khi fetch iPad từ API:', err);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();
  }, []);

  const currentSeriesKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('ipad-pro')) return 'ipad-pro';
    if (currentFilter.startsWith('ipad-air')) return 'ipad-air';
    if (currentFilter.startsWith('ipad-gen')) return 'ipad-gen';
    if (currentFilter.startsWith('ipad-mini')) return 'ipad-mini';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesKey ? IPAD_SUBMODELS_MAP[currentSeriesKey] : null;

  // Lọc sản phẩm chuẩn từ cơ sở dữ liệu kết hợp Modal Bộ Lọc
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    // 1. Chỉ lọc các sản phẩm thuộc danh mục iPad
    items = items.filter((i) => {
      const lowerName = (i.name || '').toLowerCase();
      return lowerName.includes('ipad');
    });

    // 2. Lọc theo Series hoặc Submodel (iPad Pro, iPad Air, iPad Mini, iPad Gen)
    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      if (lowerFilter.includes('pro')) {
        items = items.filter((i) => i.searchIndex.includes('pro'));
      } else if (lowerFilter.includes('air')) {
        items = items.filter((i) => i.searchIndex.includes('air'));
      } else if (lowerFilter.includes('mini')) {
        items = items.filter((i) => i.searchIndex.includes('mini'));
      } else if (lowerFilter.includes('gen') || lowerFilter.includes('thuong')) {
        items = items.filter((i) => !i.searchIndex.includes('pro') && !i.searchIndex.includes('air') && !i.searchIndex.includes('mini'));
      }
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

    if (activeFilters.screenSize) {
      const screenVal = activeFilters.screenSize.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(screenVal));
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

  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'ipad-pro':
        return 'iPad Pro';
      case 'ipad-air':
        return 'iPad Air';
      case 'ipad-gen':
        return 'iPad Gen';
      case 'ipad-mini':
        return 'iPad Mini';
      case 'ipad-pro-m5':
        return 'iPad Pro M5';
      case 'ipad-pro-m4':
        return 'iPad Pro M4';
      case 'ipad-pro-m2':
        return 'iPad Pro M2';
      case 'ipad-air-m4':
        return 'iPad Air M4';
      case 'ipad-air-7':
        return 'iPad Air 7';
      case 'ipad-air-6':
        return 'iPad Air 6';
      case 'ipad-air-5':
        return 'iPad Air 5';
      case 'ipad-gen-11':
        return 'iPad Gen 11';
      case 'ipad-mini-7':
        return 'iPad Mini 7';
      default:
        return currentFilter
          ? currentFilter
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .replace('Ipad', 'iPad')
          : 'Tất cả sản phẩm iPad';
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
            <Link href="/ipad" className="hover:text-[#d70018]">iPad</Link>
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
              <div className="relative rounded-sm bg-gradient-to-r from-[#f3f5f8] to-[#e7ebf0] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>iPad Pro Thế Hệ Mới</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">Mỏng siêu thực. Sức mạnh AI không giới hạn.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Sẵn hàng <span className="text-sm">Giá tốt nhất</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80"
                    alt="iPad Pro"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>

              <div className="relative rounded-sm bg-gradient-to-r from-[#fbf8f5] to-[#f4eef9] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>{displayTitle}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">Chính hãng Apple VN/A - Bảo hành 1 đổi 1</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Trả trước <span className="text-sm">0đ - Lãi suất 0%</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80"
                    alt={displayTitle}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>

            <button className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50">
              <ChevronLeft size={18} />
            </button>
            <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Thanh icon chọn Model */}
          <div className="my-8 py-2">
            {activeSubmodels ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/ipad/${model.slug}`}
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
                          className={`text-xs sm:text-sm font-semibold text-center transition-colors max-w-[120px] leading-tight ${
                            isSelected
                              ? 'text-[#d70018] font-bold'
                              : 'text-gray-800 group-hover:text-[#d70018]'
                          }`}
                        >
                          {model.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/ipad"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#d70018] transition-colors bg-gray-100 hover:bg-red-50 px-3.5 py-1.5 rounded-full border border-gray-200"
                >
                  <CornerDownLeft size={13} />
                  <span>Xem tất cả các dòng iPad khác</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                {IPAD_SERIES_LIST.map((series) => {
                  const isSelected = currentFilter === series.slug;
                  return (
                    <Link
                      key={series.slug}
                      href={`/ipad/${series.slug}`}
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
                          src={series.img}
                          alt={series.name}
                          className="w-full h-full object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold text-center transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'text-[#d70018] font-bold'
                            : 'text-gray-800 group-hover:text-[#d70018]'
                        }`}
                      >
                        {series.name}
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
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => {
                setActiveFilters(filters);
              }}
              isTabletOrMac={true}
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
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                      <span></span>
                      <span className="scale-90 origin-right">Authorized Reseller</span>
                    </div>
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

                  {product.statusTag && (
                    <span className="mt-1 bg-[#ffe8e8] text-[#d70018] text-[9px] font-bold px-1.5 py-0.5 rounded-sm w-fit">
                      {product.statusTag}
                    </span>
                  )}

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm md:text-base font-black text-[#d70018]">{product.currentPrice}</span>
                    <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
                  </div>

                  <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                    Hoặc trả trước <strong className="text-gray-900">{product.downPayment}</strong>
                  </div>

                  <div className="flex items-center gap-0.5 mt-2 text-amber-400 h-3">
                    {product.rating ? (
                      [...Array(product.rating)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400" />
                      ))
                    ) : (
                      <div className="h-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm mb-14">
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc mục này trong kho.</p>
              <Link href="/ipad" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả iPad
              </Link>
            </div>
          )}

          {/* Chân trang danh mục */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Thông tin hay về iPad</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {IPAD_HELPFUL_NEWS.map((news) => (
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
                <h2 className="text-xl font-black text-gray-900">{displayTitle} tại Fogo Store</h2>
                <p>
                  Tại Fogo Store, các dòng máy tính bảng <strong className="text-gray-900">{displayTitle}</strong> luôn sẵn hàng với mức giá cam kết tốt nhất thị trường. Sản phẩm chuẩn Apple chính hãng VN/A, bảo hành 1 đổi 1 và hỗ trợ trả góp 0% lãi suất với thủ tục nhanh gọn.
                </p>
              </div>
            </div>

            {/* Khối bạn vừa xem đọc động từ localStorage */}
            {recentViewed.length > 0 && (
              <div className="lg:col-span-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Bạn vừa xem</span>
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  {recentViewed.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href || `/san-pham/${item.slug || item.id}`}
                      className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm border border-gray-200 hover:border-[#d70018] transition-colors group"
                    >
                      <div className="w-full h-32 my-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="font-bold text-xs text-gray-800 line-clamp-2 h-[34px] group-hover:text-[#d70018]">
                        {item.name}
                      </span>
                      <span className="text-xs font-black text-[#d70018] mt-2">
                        {item.currentPrice}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}