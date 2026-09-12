'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, CornerDownLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  WATCH_CATALOG_ITEMS,
  WATCH_HELPFUL_NEWS,
  RECENTLY_VIEWED_WATCH,
} from '@/data/watchCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

// 1. Dữ liệu 3 dòng lớn cấp 1
const WATCH_SERIES_LIST = [
  {
    name: 'Apple Watch Ultra',
    slug: 'watch-ultra',
    img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Apple Watch Series',
    slug: 'watch-series',
    img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Apple Watch SE',
    slug: 'watch-se',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
  },
];

// 2. Sub-models chi tiết từng dòng
const WATCH_SUBMODELS_MAP: Record<
  string,
  { name: string; slug: string; img: string }[]
> = {
  'watch-ultra': [
    {
      name: 'Watch Ultra 2',
      slug: 'watch-ultra-2',
      img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch Ultra 1',
      slug: 'watch-ultra-1',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'watch-series': [
    {
      name: 'Watch Series 10',
      slug: 'watch-series-10',
      img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch Series 9',
      slug: 'watch-series-9',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch Series 8',
      slug: 'watch-series-8',
      img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'watch-se': [
    {
      name: 'Watch SE 2 (2024)',
      slug: 'watch-se-2',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch SE 1',
      slug: 'watch-se-1',
      img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicWatchPage() {
  const params = useParams();
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // State lưu danh sách sản phẩm lấy trực tiếp từ Database
  const [dbItems, setDbItems] = useState<any[]>([]);

  const slugArray = (params?.slug as string[]) || [];
  const currentFilter = slugArray[0] || '';

  // 1. Fetch dữ liệu thực tế từ Database thông qua API
  useEffect(() => {
    const fetchWatchFromDB = async () => {
      try {
        const res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=watch', {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || 0;
            const origPrice = v.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

            const lower = item.name.toLowerCase();
            let series = 'watch-series';
            let subModel = 'watch-series-10';

            if (lower.includes('ultra')) {
              series = 'watch-ultra';
              subModel = lower.includes('2') ? 'watch-ultra-2' : 'watch-ultra-1';
            } else if (lower.includes('se')) {
              series = 'watch-se';
              subModel = lower.includes('2') ? 'watch-se-2' : 'watch-se-1';
            } else {
              series = 'watch-series';
              if (lower.includes('10')) subModel = 'watch-series-10';
              else if (lower.includes('9')) subModel = 'watch-series-9';
              else if (lower.includes('8')) subModel = 'watch-series-8';
              else subModel = 'watch-series-10';
            }

            return {
              id: item.id,
              name: item.name,
              series,
              subModel,
              href: `/san-pham/${item.slug}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              rawPrice: curPrice,
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
              downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
              statusTag: 'Sẵn hàng',
              rating: 5,
            };
          });
          setDbItems(mapped);
        }
      } catch (err) {
        console.error('Lỗi khi fetch Apple Watch từ API:', err);
      }
    };

    fetchWatchFromDB();
  }, []);

  // 2. Xác định dòng cha đang chọn
  const currentSeriesKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('watch-ultra')) return 'watch-ultra';
    if (currentFilter.startsWith('watch-series')) return 'watch-series';
    if (currentFilter.startsWith('watch-se')) return 'watch-se';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesKey ? WATCH_SUBMODELS_MAP[currentSeriesKey] : null;

  // 3. Lọc sản phẩm chính xác (Ưu tiên Database, fallback về Catalog mẫu)
  const filteredProducts = useMemo(() => {
    let items = dbItems.length > 0 ? dbItems : WATCH_CATALOG_ITEMS;

    if (currentFilter) {
      if (['watch-ultra', 'watch-series', 'watch-se'].includes(currentFilter)) {
        items = items.filter((item) => item.series === currentFilter);
      } else {
        const keyword = currentFilter.replace('watch-', '').replace(/-/g, ' ').trim();
        items = items.filter(
          (item) => item.subModel === currentFilter || item.name.toLowerCase().includes(keyword)
        );
      }
    }

    const sorted = [...items].sort((a, b) => {
      const priceA = parsePrice((a as any).rawPrice || a.currentPrice);
      const priceB = parsePrice((b as any).rawPrice || b.currentPrice);

      if (currentSort === 'price_asc') return priceA - priceB;
      if (currentSort === 'price_desc') return priceB - priceA;
      if (currentSort === 'id') return a.id.localeCompare(b.id);
      return 0;
    });

    return sorted;
  }, [currentFilter, currentSort, dbItems]);

  // 4. Tên hiển thị tiêu đề và breadcrumb (chính xác từng model)
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'watch-ultra':
        return 'Apple Watch Ultra';
      case 'watch-series':
        return 'Apple Watch Series';
      case 'watch-se':
        return 'Apple Watch SE';
      case 'watch-ultra-2':
        return 'Apple Watch Ultra 2';
      case 'watch-ultra-1':
        return 'Apple Watch Ultra 1';
      case 'watch-series-10':
        return 'Apple Watch Series 10';
      case 'watch-series-9':
        return 'Apple Watch Series 9';
      case 'watch-series-8':
        return 'Apple Watch Series 8';
      case 'watch-se-2':
        return 'Apple Watch SE 2 (2024)';
      case 'watch-se-1':
        return 'Apple Watch SE 1';
      default:
        return currentFilter
          ? currentFilter
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .replace('Watch', 'Apple Watch')
          : 'Tất cả Apple Watch';
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
            <Link href="/watch" className="hover:text-[#d70018]">Apple Watch</Link>
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
              <div className="relative rounded-sm bg-gradient-to-r from-[#1c1d21] to-[#2e313d] border border-gray-800 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm text-white">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 font-bold text-lg md:text-xl text-white">
                    <span></span>
                    <span>Apple Watch Ultra 2</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium mb-3">Titanium Đen ấn tượng. Thách thức mọi giới hạn.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Giá chỉ từ <span className="text-sm">14.x90.000đ</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80"
                    alt="Apple Watch Ultra 2"
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
                    src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&q=80"
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
                <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/watch/${model.slug}`}
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
                  href="/watch"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#d70018] transition-colors bg-gray-100 hover:bg-red-50 px-3.5 py-1.5 rounded-full border border-gray-200"
                >
                  <CornerDownLeft size={13} />
                  <span>Xem tất cả các dòng Apple Watch khác</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
                {WATCH_SERIES_LIST.map((series) => {
                  const isSelected = currentFilter === series.slug;
                  return (
                    <Link
                      key={series.slug}
                      href={`/watch/${series.slug}`}
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
              <p className="text-xs text-gray-500 mt-0.5">Tìm thấy {filteredProducts.length} phiên bản phù hợp</p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => {
                setActiveFilters(filters);
              }}
              isTabletOrMac={false}
            />
          </div>

          {/* Lưới sản phẩm */}
          {filteredProducts.length > 0 ? (
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc mục này.</p>
              <Link href="/watch" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả Apple Watch
              </Link>
            </div>
          )}

          {/* Chân trang danh mục */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                  <span>Thông tin hay về Apple Watch</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {WATCH_HELPFUL_NEWS.map((news) => (
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
                  Đồng hồ thông minh <strong className="text-gray-900">{displayTitle}</strong> chính hãng Apple VN/A với đầy đủ chế độ bảo hành 1 đổi 1, hỗ trợ kết nối eSIM độc lập và chương trình trả góp 0% lãi suất.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                <span>Bạn vừa xem</span>
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                {RECENTLY_VIEWED_WATCH.map((item) => (
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