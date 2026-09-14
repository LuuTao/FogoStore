'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, CornerDownLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MACBOOK_HELPFUL_NEWS } from '@/data/macbookCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

// 1. Dữ liệu 3 dòng lớn
const MACBOOK_SERIES_LIST = [
  {
    name: 'MacBook Pro',
    slug: 'macbook-pro',
    img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'MacBook Air',
    slug: 'macbook-air',
    img: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_3_ae4b6b83d56744018803cb8c1211dc15_large_2b8556643ad34d4bbc8c1aae0d5e25ce_master.jpg?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'MacBook Neo',
    slug: 'macbook-neo',
    img: 'https://cdn.hstatic.net/products/200000768357/mbn-vang_01c8b19230654bdbb81f87daae826525_master.jpg?auto=format&fit=crop&w=150&q=80',
  },
];

// 2. Sub-models chi tiết
const MACBOOK_SUBMODELS_MAP: Record<
  string,
  { name: string; slug: string; img: string }[]
> = {
  'macbook-pro': [
    {
      name: 'MacBook Pro M5',
      slug: 'macbook-pro-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Pro M4',
      slug: 'macbook-pro-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Pro M3',
      slug: 'macbook-pro-m3',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Pro M2',
      slug: 'macbook-pro-m2',
      img: 'https://product.hstatic.net/200000768357/product/color_64cbaa85726e49dab23ec2a848b54521_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Pro M1',
      slug: 'macbook-pro-m1',
      img: 'https://product.hstatic.net/200000768357/product/gray_9303e56f1307413da72dfe5a4826b5f2_master.png?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'macbook-air': [
    {
      name: 'MacBook Air M5',
      slug: 'macbook-air-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_3_ae4b6b83d56744018803cb8c1211dc15_large_2b8556643ad34d4bbc8c1aae0d5e25ce_master.jpg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Air M4',
      slug: 'macbook-air-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/acbook-air-m5-starlight-gia-re_60f0d7d0a60f4ce3af41eecce1fb680c_master_1ac5ec3477844421bb8fb62b6a3af448_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Air M3',
      slug: 'macbook-air-m3',
      img: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_10_792652cbafb04dfba6e6ca428ebf159b_large_95b5ce2b3ecc4ad8947d823544eff163_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      img: 'https://product.hstatic.net/200000768357/product/hinh_anh_17_d0d916bb3df444d0aa6b013449985c07_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'MacBook Air M1',
      slug: 'macbook-air-m1',
      img: 'https://product.hstatic.net/200000768357/product/gray_643bc60631144e5690acfcc271e05901_master.png?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'macbook-neo': [
    {
      name: 'MacBook NEO (2026)',
      slug: 'macbook-neo-2026',
      img: 'https://cdn.hstatic.net/products/200000768357/mbn-vang_01c8b19230654bdbb81f87daae826525_master.jpg?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

// Chuẩn hóa slug
const resolveMacbookSlug = (raw: string): string => {
  if (!raw) return '';
  let s = raw.toLowerCase().trim();
  s = s.replace(/-(202[0-9])/g, '');

  if (s === 'pro' || s === 'macbook-pro') return 'macbook-pro';
  if (s === 'air' || s === 'macbook-air') return 'macbook-air';
  if (s === 'neo' || s === 'macbook-neo') return 'macbook-neo';

  if (s.includes('air') && s.includes('m5')) return 'macbook-air-m5';
  if (s.includes('air') && s.includes('m4')) return 'macbook-air-m4';
  if (s.includes('air') && s.includes('m3')) return 'macbook-air-m3';
  if (s.includes('air') && s.includes('m2')) return 'macbook-air-m2';
  if (s.includes('air') && s.includes('m1')) return 'macbook-air-m1';

  if (s.includes('pro') && s.includes('m5')) return 'macbook-pro-m5';
  if (s.includes('pro') && s.includes('m4')) return 'macbook-pro-m4';
  if (s.includes('pro') && s.includes('m3')) return 'macbook-pro-m3';
  if (s.includes('pro') && s.includes('m2')) return 'macbook-pro-m2';
  if (s.includes('pro') && s.includes('m1')) return 'macbook-pro-m1';

  if (s.includes('neo')) return 'macbook-neo-2026';

  return s.startsWith('macbook-') ? s : `macbook-${s}`;
};

export default function DynamicMacBookPage() {
  const params = useParams();
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const slugArray = (params?.slug as string[]) || [];
  const rawParam = slugArray[0] || '';

  // Đọc sản phẩm đã xem thực tế từ localStorage
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

  // Fetch dữ liệu từ API Backend
  useEffect(() => {
    const fetchLiveMacbook = async () => {
      try {
        setLoading(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=macbook', {
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
            return cat.includes('mac') || lower.includes('macbook') || lower.includes('mac');
          })
          .map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || item.price || 0;
            const origPrice = v.originalPrice || item.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

            const lower = (item.name || '').toLowerCase();
            let series = 'macbook-pro';
            let subModel = 'macbook-pro-m3';

            if (lower.includes('air')) {
              series = 'macbook-air';
              if (lower.includes('m5')) subModel = 'macbook-air-m5';
              else if (lower.includes('m4')) subModel = 'macbook-air-m4';
              else if (lower.includes('m3')) subModel = 'macbook-air-m3';
              else if (lower.includes('m2')) subModel = 'macbook-air-m2';
              else if (lower.includes('m1')) subModel = 'macbook-air-m1';
              else subModel = 'macbook-air-m3';
            } else if (lower.includes('neo')) {
              series = 'macbook-neo';
              subModel = 'macbook-neo-2026';
            } else {
              if (lower.includes('m5')) subModel = 'macbook-pro-m5';
              else if (lower.includes('m4')) subModel = 'macbook-pro-m4';
              else if (lower.includes('m3')) subModel = 'macbook-pro-m3';
              else if (lower.includes('m2')) subModel = 'macbook-pro-m2';
              else if (lower.includes('m1')) subModel = 'macbook-pro-m1';
              else subModel = 'macbook-pro-m3';
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
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
              downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
              statusTag: 'Sẵn hàng',
              rating: 5,
              searchIndex: `${item.name || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase(),
            };
          });

        setDbItems(mapped);
      } catch (err) {
        console.error('Lỗi khi fetch MacBook từ API:', err);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMacbook();
  }, []);

  const currentFilter = useMemo(() => resolveMacbookSlug(rawParam), [rawParam]);

  const currentSeriesKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('macbook-pro')) return 'macbook-pro';
    if (currentFilter.includes('macbook-air')) return 'macbook-air';
    if (currentFilter.includes('macbook-neo')) return 'macbook-neo';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesKey ? MACBOOK_SUBMODELS_MAP[currentSeriesKey] : null;

  // Lọc chuẩn từ dữ liệu thật
  const filteredProducts = useMemo(() => {
    let items = [...dbItems];

    // 1. Chỉ lọc các sản phẩm thuộc danh mục MacBook
    items = items.filter((i) => {
      const lowerName = (i.name || '').toLowerCase();
      return lowerName.includes('macbook') || lowerName.includes('mac mini');
    });

    // 2. Lọc theo Series hoặc Submodel (nếu có trên URL)
    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      if (lowerFilter.includes('pro')) {
        items = items.filter((i) => i.searchIndex.includes('pro'));
      } else if (lowerFilter.includes('air')) {
        items = items.filter((i) => i.searchIndex.includes('air'));
      } else if (lowerFilter.includes('neo')) {
        items = items.filter((i) => i.searchIndex.includes('neo'));
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

    // Sắp xếp sản phẩm theo tiêu chí
    items.sort((a, b) => {
      const priceA = parsePrice(a.rawPrice || a.currentPrice);
      const priceB = parsePrice(b.rawPrice || b.currentPrice);

      if (currentSort === 'price_asc') return priceA - priceB;
      if (currentSort === 'price_desc') return priceB - priceA;
      if (currentSort === 'id') return String(a.id).localeCompare(String(b.id));
      return 0;
    });

    return items;
  }, [dbItems, currentFilter, currentSort, activeFilters]);

  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'macbook-pro':
        return 'MacBook Pro';
      case 'macbook-air':
        return 'MacBook Air';
      case 'macbook-neo':
        return 'MacBook Neo';
      case 'macbook-pro-m5':
        return 'MacBook Pro M5';
      case 'macbook-pro-m4':
        return 'MacBook Pro M4';
      case 'macbook-pro-m3':
        return 'MacBook Pro M3';
      case 'macbook-pro-m2':
        return 'MacBook Pro M2';
      case 'macbook-pro-m1':
        return 'MacBook Pro M1';
      case 'macbook-air-m5':
        return 'MacBook Air M5';
      case 'macbook-air-m4':
        return 'MacBook Air M4';
      case 'macbook-air-m3':
        return 'MacBook Air M3';
      case 'macbook-air-m2':
        return 'MacBook Air M2';
      case 'macbook-air-m1':
        return 'MacBook Air M1';
      case 'macbook-neo-2026':
        return 'MacBook NEO (2026)';
      default:
        return currentFilter
          ? currentFilter
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .replace('Macbook', 'MacBook')
          : 'Tất cả sản phẩm MacBook';
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
            <Link href="/macbook" className="hover:text-[#d70018]">MacBook</Link>
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
              <div className="relative rounded-sm bg-gradient-to-r from-[#1c1d21] to-[#2b2d35] border border-gray-800 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm text-white">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 font-bold text-lg md:text-xl text-white">
                    <span></span>
                    <span>MacBook Pro M5 / M4</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium mb-3">Hiệu năng tối thượng cho chuyên gia đồ họa.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Sẵn hàng <span className="text-sm">Ưu đãi hôm nay</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                    alt="MacBook Pro"
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
                  <p className="text-xs text-gray-600 font-medium mb-3">Chính hãng Apple VN/A - Bảo hành 12 tháng</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Trả trước <span className="text-sm">0đ - Lãi suất 0%</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80"
                    alt={displayTitle}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>

            <button className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Thanh icon chọn Model */}
          <div className="my-8 py-2">
            {activeSubmodels ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-5 sm:gap-8 md:gap-12 flex-wrap">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/macbook/${model.slug}`}
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
                  href="/macbook"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#d70018] transition-colors bg-gray-100 hover:bg-red-50 px-3.5 py-1.5 rounded-full border border-gray-200"
                >
                  <CornerDownLeft size={13} />
                  <span>Xem tất cả các dòng MacBook khác</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                {MACBOOK_SERIES_LIST.map((series) => {
                  const isSelected = currentFilter === series.slug;
                  return (
                    <Link
                      key={series.slug}
                      href={`/macbook/${series.slug}`}
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

          {/* Tiêu đề & Bộ Lọc */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} cấu hình phù hợp`}
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc danh mục này trong kho.</p>
              <Link href="/macbook" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả MacBook
              </Link>
            </div>
          )}

          {/* Chân trang danh mục */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Thông tin hay về MacBook</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {MACBOOK_HELPFUL_NEWS.map((news) => (
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
                  Toàn bộ các phiên bản <strong className="text-gray-900">{displayTitle}</strong> chính hãng Apple VN/A đều sẵn hàng với chính sách trợ giá thu cũ lên đời hấp dẫn và hỗ trợ trả góp 0% lãi suất.
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