'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, CornerDownLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

interface SeriesTabItem {
  name: string;
  slug: string;
  img: string;
  queryTag: string;
}

// Fallback danh mục iPhone cấp 1
const DEFAULT_IPHONE_SERIES: SeriesTabItem[] = [
  {
    name: 'iPhone 16 Series',
    slug: 'iphone-16',
    img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=150&q=80',
    queryTag: '16',
  },
  {
    name: 'iPhone 15 Series',
    slug: 'iphone-15',
    img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=150&q=80',
    queryTag: '15',
  },
  {
    name: 'iPhone 14 Series',
    slug: 'iphone-14',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80',
    queryTag: '14',
  },
  {
    name: 'iPhone 13 Series',
    slug: 'iphone-13',
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80',
    queryTag: '13',
  },
];

const IPHONE_HELPFUL_NEWS = [
  {
    id: 1,
    title: 'Đánh giá chi tiết thời lượng pin và camera trên iPhone thế hệ mới',
    href: '/tin-tuc/danh-gia-iphone-pro-max',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    title: 'Apple Intelligence: Các tính năng tiếng Việt đáng chú ý',
    href: '/tin-tuc/apple-intelligence-vietnam',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    title: 'So sánh các phiên bản iPhone: Lựa chọn nào tối ưu túi tiền?',
    href: '/tin-tuc/so-sanh-iphone',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
  },
];

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicIPhonePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_IPHONE_SERIES);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const slugParam = params?.slug;
  const rawFilter =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawFilter || '').toLowerCase().trim();

  // Đọc sản phẩm vừa xem thực tế từ localStorage
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

  // 1. Nạp danh mục Submodel iPhone động từ LocalStorage (Admin lưu)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_iphone' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const mapped: SeriesTabItem[] = adminSubs.map((it: any) => {
              const numMatch = it.name.match(/\d+/);
              const fallbackSlug = it.name.toLowerCase().replace(/\s+/g, '-');
              return {
                name: it.name,
                slug: numMatch ? `iphone-${numMatch[0]}` : fallbackSlug,
                img: it.imageUrl,
                queryTag: numMatch ? numMatch[0] : it.name.toLowerCase(),
              };
            });
            setSeriesTabs(mapped);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp Submodel iPhone từ Admin:', e);
    }
  }, []);

  // 2. Fetch toàn bộ sản phẩm iPhone từ Database với fallback
  useEffect(() => {
    const fetchIPhoneProducts = async () => {
      try {
        setLoadingDb(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=iphone', {
          cache: 'no-store',
        });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch('https://fogo-store-api.onrender.com/api/products', { cache: 'no-store' });
          json = await res.json();
        }

        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data
            .filter((item: any) => {
              const lower = (item.name || '').toLowerCase();
              const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
              return cat.includes('iphone') || lower.includes('iphone');
            })
            .map((item: any) => {
              const v = item.variants?.[0] || {};
              const curPrice = v.price || item.price || 0;
              const origPrice = v.originalPrice || item.originalPrice || curPrice;
              const discountPercent =
                origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

              return {
                id: item.id,
                name: item.name,
                slug: item.slug,
                searchIndex: `${item.name || ''} ${item.description || ''} ${item.category?.name || ''} ${item.subSeriesName || ''}`.toLowerCase(),
                href: `/san-pham/${item.slug || item.id}`,
                currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
                originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
                rawPrice: curPrice,
                discountPercent,
                imageUrl:
                  v.images?.[0] ||
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
                downPayment: Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ',
                statusTag: 'Sẵn hàng',
                rating: 5,
              };
            });

          setDbProducts(formatted);
        } else {
          setDbProducts([]);
        }
      } catch (err) {
        console.error('Lỗi khi fetch sản phẩm iPhone:', err);
        setDbProducts([]);
      } finally {
        setLoadingDb(false);
      }
    };

    fetchIPhoneProducts();
  }, []);

  // Logic lọc tự động kết hợp cả Series và bộ lọc nâng cao từ Modal (activeFilters)
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    // 1. Lọc theo Series (iPhone 17, 16,...)
    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      const numMatch = lowerFilter.match(/\d+/);
      const targetNumber = numMatch ? numMatch[0] : null;

      if (targetNumber) {
        items = items.filter((i) => i.searchIndex.includes(targetNumber));

        if (lowerFilter.includes('pro-max') || lowerFilter.includes('promax')) {
          items = items.filter((i) => i.searchIndex.includes('pro max') || i.searchIndex.includes('promax'));
        } else if (lowerFilter.includes('pro') && !lowerFilter.includes('max')) {
          items = items.filter((i) => i.searchIndex.includes('pro') && !i.searchIndex.includes('max'));
        } else if (lowerFilter.includes('plus')) {
          items = items.filter((i) => i.searchIndex.includes('plus'));
        } else if (lowerFilter.includes('thuong') || lowerFilter.includes('standard')) {
          items = items.filter((i) => !i.searchIndex.includes('pro') && !i.searchIndex.includes('plus'));
        }
      } else {
        const cleanTag = lowerFilter.replace(/iphone|-|series/g, ' ').trim();
        if (cleanTag) {
          items = items.filter((i) => i.searchIndex.includes(cleanTag));
        }
      }
    }

    // 2. Lọc nâng cao từ Modal Bộ Lọc (activeFilters)
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

    if (activeFilters.demand && activeFilters.demand.length > 0) {
      items = items.filter((item) =>
        activeFilters.demand!.some((d) => item.searchIndex.includes(d.toLowerCase()))
      );
    }

    // Sắp xếp sản phẩm
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
    if (!currentFilter) return 'Tất cả sản phẩm iPhone';

    const numMatch = currentFilter.match(/\d+/);
    if (numMatch) {
      const num = numMatch[0];
      if (currentFilter.includes('pro-max')) return `iPhone ${num} Pro Max`;
      if (currentFilter.includes('pro')) return `iPhone ${num} Pro`;
      if (currentFilter.includes('plus')) return `iPhone ${num} Plus`;
      if (currentFilter.includes('thuong')) return `iPhone ${num}`;
      return `iPhone ${num} Series`;
    }

    return currentFilter
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace('Iphone', 'iPhone');
  }, [currentFilter]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* BREADCRUMB */}
        <div className="w-full bg-[#f8f9fa] border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-gray-600">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/iphone" className="hover:text-[#d70018]">iPhone</Link>
            {currentFilter && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-bold">{displayTitle}</span>
              </>
            )}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* BANNER ĐÔI TRÊN CÙNG */}
          <div className="relative mb-6 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-sm bg-gradient-to-r from-[#f3f5f8] to-[#e7ebf0] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>Thế Hệ iPhone Mới Nhất</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">Sức mạnh Apple Intelligence đỉnh cao.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Giá cam kết tốt nhất thị trường
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80"
                    alt="iPhone"
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
                    Trả trước <span>0đ - Lãi suất 0%</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"
                    alt={displayTitle}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG ICON TRÒN SERIES */}
          <div className="my-8 py-2">
            <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
              <Link
                href="/iphone"
                className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-2 bg-[#f0f2f5] flex items-center justify-center transition-all duration-200 ${
                    !currentFilter
                      ? 'border-2 border-[#d70018] shadow-md bg-white scale-105'
                      : 'border border-gray-200 group-hover:border-[#d70018] group-hover:bg-white'
                  }`}
                >
                  <span className="text-xs font-black text-gray-700 group-hover:text-[#d70018]">ALL</span>
                </div>
                <span className={`text-xs sm:text-sm font-semibold transition-colors ${!currentFilter ? 'text-[#d70018] font-bold' : 'text-gray-800'}`}>
                  Tất cả
                </span>
              </Link>

              {seriesTabs.map((series) => {
                const isSelected =
                  currentFilter === series.slug ||
                  (series.queryTag && currentFilter.includes(series.queryTag));

                return (
                  <Link
                    key={series.slug}
                    href={`/iphone?series=${series.queryTag}`}
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
          </div>

          {/* TIÊU ĐỀ VÀ BỘ LỌC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loadingDb ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={false}
            />
          </div>

          {/* LƯỚI SẢN PHẨM & SKELETON LOADER */}
          {loadingDb ? (
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

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm md:text-base font-black text-[#d70018]">{product.currentPrice}</span>
                    <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
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
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm mb-14">
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc mục này trong kho.</p>
              <Link href="/iphone" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả iPhone
              </Link>
            </div>
          )}

          {/* CHÂN TRANG DANH MỤC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Thông tin hay về iPhone</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {IPHONE_HELPFUL_NEWS.map((news) => (
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
            </div>

            {/* Chỉ render khi người dùng thực tế đã xem sản phẩm */}
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