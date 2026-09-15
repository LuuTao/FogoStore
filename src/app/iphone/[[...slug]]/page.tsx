'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';
import { IPhoneSeoContent } from '@/components/category/IPhoneSeoContent';

interface SeriesTabItem {
  name: string;
  slug?: string;
  imageUrl: string;
  queryTag: string | null;
}

interface SubModelItem {
  name: string;
  tag: string;
  img: string;
}

const DEFAULT_IPHONE_SERIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryTag: null,
  },
  {
    name: 'iPhone Dou Series',
    slug: 'iphone-dou',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryTag: 'dou',
  },
  {
    name: 'iPhone 18 Series',
    slug: 'iphone-18',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    queryTag: '18',
  },
  {
    name: 'iPhone 17 Series',
    slug: 'iphone-17',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    queryTag: '17',
  },
  {
    name: 'iPhone 16 Series',
    slug: 'iphone-16',
    imageUrl: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    queryTag: '16',
  },
];

// Danh sách các model con nhỏ hơn 2 size kèm hình ảnh tròn
const SUB_MODELS_MAP: Record<string, SubModelItem[]> = {
  '18': [
    {
      name: 'Tất cả 18',
      tag: '18',
      img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    },
    {
      name: '18 Pro Max',
      tag: '18-pro-max',
      img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    },
    {
      name: '18 Pro',
      tag: '18-pro',
      img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    },
    {
      name: '18 Plus',
      tag: '18-plus',
      img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    },
    {
      name: 'iPhone 18',
      tag: '18-standard',
      img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    },
  ],
  '17': [
    {
      name: 'Tất cả 17',
      tag: '17',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
    {
      name: '17 Pro Max',
      tag: '17-pro-max',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
    {
      name: '17 Pro',
      tag: '17-pro',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
    {
      name: '17 Plus',
      tag: '17-plus',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
    {
      name: '17 Air',
      tag: '17-air',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
    {
      name: 'iPhone 17',
      tag: '17-standard',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    },
  ],
  '16': [
    {
      name: 'Tất cả 16',
      tag: '16',
      img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    },
    {
      name: '16 Pro Max',
      tag: '16-pro-max',
      img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    },
    {
      name: '16 Pro',
      tag: '16-pro',
      img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    },
    {
      name: '16 Plus',
      tag: '16-plus',
      img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    },
    {
      name: 'iPhone 16',
      tag: '16-standard',
      img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    },
  ],
  'dou': [
    {
      name: 'Tất cả Dou',
      tag: 'dou',
      img: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    },
    {
      name: 'iPhone Dou Fold',
      tag: 'dou-fold',
      img: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    },
    {
      name: 'iPhone Dou Flip',
      tag: 'dou-flip',
      img: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    },
  ],
};

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
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const slugParam = params?.slug;
  const rawFilter =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawFilter || '').toLowerCase().trim();

  // Nhận diện series cha đang chọn (18, 17, 16, dou)
  const currentSeriesTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('dou')) return 'dou';
    const num = currentFilter.match(/\d+/);
    return num ? num[0] : null;
  }, [currentFilter]);

  // Đọc danh sách model con tương ứng
  const subModels = currentSeriesTag ? SUB_MODELS_MAP[currentSeriesTag] || [] : [];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  // Nạp Banner đôi & Danh mục Submodel từ Admin qua LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Lọc 2 Banner đôi iPhone
          const ipBanners = parsed.filter((it: any) => it.group === 'iphone_banners');
          if (ipBanners.length > 0) {
            setAdminBanners(ipBanners);
          }

          // Lọc Icon tròn Submodel iPhone (sub_iphone)
          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_iphone' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const mapped: SeriesTabItem[] = [
              DEFAULT_IPHONE_SERIES[0],
              ...adminSubs.map((it: any) => {
                const numMatch = it.name.match(/\d+/);
                const isDou = it.name.toLowerCase().includes('dou');
                const fallbackSlug = it.name.toLowerCase().replace(/\s+/g, '-');
                return {
                  name: it.name,
                  slug: isDou ? 'iphone-dou' : numMatch ? `iphone-${numMatch[0]}` : fallbackSlug,
                  imageUrl: it.imageUrl,
                  queryTag: isDou ? 'dou' : numMatch ? numMatch[0] : it.name.toLowerCase(),
                };
              }),
            ];
            setSeriesTabs(mapped);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi nạp Submodel iPhone từ Admin:', e);
    }
  }, []);

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

  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

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
        } else if (lowerFilter.includes('air')) {
          items = items.filter((i) => i.searchIndex.includes('air'));
        } else if (lowerFilter.includes('standard') || lowerFilter.includes('thuong')) {
          items = items.filter((i) => !i.searchIndex.includes('pro') && !i.searchIndex.includes('plus') && !i.searchIndex.includes('air'));
        }
      } else if (lowerFilter.includes('dou')) {
        items = items.filter((i) => i.searchIndex.includes('dou'));
        if (lowerFilter.includes('fold')) items = items.filter((i) => i.searchIndex.includes('fold'));
        if (lowerFilter.includes('flip')) items = items.filter((i) => i.searchIndex.includes('flip'));
      } else {
        const cleanTag = lowerFilter.replace(/iphone|-|series/g, ' ').trim();
        if (cleanTag) {
          items = items.filter((i) => i.searchIndex.includes(cleanTag));
        }
      }
    }

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
    if (!currentFilter) return 'Tất cả sản phẩm iPhone';

    const numMatch = currentFilter.match(/\d+/);
    if (numMatch) {
      const num = numMatch[0];
      if (currentFilter.includes('pro-max')) return `iPhone ${num} Pro Max`;
      if (currentFilter.includes('pro')) return `iPhone ${num} Pro`;
      if (currentFilter.includes('plus')) return `iPhone ${num} Plus`;
      if (currentFilter.includes('air')) return `iPhone ${num} Air`;
      if (currentFilter.includes('standard')) return `iPhone ${num}`;
      return `iPhone ${num} Series`;
    }

    if (currentFilter.includes('dou')) {
      if (currentFilter.includes('fold')) return 'iPhone Dou Fold';
      if (currentFilter.includes('flip')) return 'iPhone Dou Flip';
      return 'iPhone Dou Series';
    }

    return currentFilter
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace('Iphone', 'iPhone');
  }, [currentFilter]);

  // Cấu hình 2 Banner đôi (ưu tiên Admin)
  const banner1 = adminBanners[0] || {
    name: 'Thế Hệ iPhone Mới Nhất',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: 'iPhone Dou Series',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&h=200&q=80',
  };

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
          {/* ========================================================================= */}
          {/* 1. BANNER ĐÔI THUẦN ẢNH CHUẨN TỶ LỆ 600x200px (KHÔNG CHỮ ĐÈ, KHÔNG KHUNG) */}
          {/* ========================================================================= */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banner 1 */}
              <Link
                href={banner1.link || '/iphone'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              {/* Banner 2 */}
              <Link
                href={banner2.link || '/iphone'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner2.imageUrl}
                  alt={banner2.name || 'Banner 2'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. HÀNG SERIES CHA: ICON TRÒN TO CHUẨN 80PX (w-20 h-20)                   */}
          {/* ========================================================================= */}
          <div className="my-6 py-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-center gap-6 sm:gap-9 min-w-max px-2">
              {seriesTabs.map((series, idx) => {
                const isAllButton = series.queryTag === null;
                const isSelected = isAllButton
                  ? !currentFilter
                  : currentFilter === series.queryTag ||
                    (series.slug && currentFilter.includes(series.slug)) ||
                    (series.queryTag && currentFilter.includes(series.queryTag));

                return (
                  <Link
                    key={series.slug || idx}
                    href={isAllButton ? '/iphone' : `/iphone?series=${series.queryTag}`}
                    className="group flex flex-col items-center gap-2 cursor-pointer max-w-[95px] sm:max-w-[110px] transition-transform active:scale-95"
                  >
                    {/* Vòng tròn 80px bo tròn chuẩn tuyệt đối */}
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-2.5 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-2 border-[#d70018] shadow-md shadow-red-100 bg-white scale-105'
                          : 'border-2 border-transparent bg-[#f0f2f5] hover:bg-gray-200 group-hover:scale-105'
                      }`}
                    >
                      <img
                        src={series.imageUrl}
                        alt={series.name}
                        className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-xs"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-2 ${
                        isSelected ? 'text-[#d70018] font-bold' : 'text-gray-800 group-hover:text-[#d70018]'
                      }`}
                    >
                      {series.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. HÀNG SUBMODEL CON: CŨNG LÀ ICON TRÒN NHƯNG NHỎ HƠN 2 SIZE (w-14 h-14)  */}
          {/* ========================================================================= */}
          {subModels.length > 0 && (
            <div className="mb-8 pt-2 pb-3 border-t border-dashed border-gray-100 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-center gap-5 sm:gap-7 min-w-max px-2">
                {subModels.map((model) => {
                  const isSubSelected = currentFilter === model.tag;

                  return (
                    <Link
                      key={model.tag}
                      href={`/iphone?series=${model.tag}`}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer max-w-[85px] sm:max-w-[95px] transition-transform active:scale-95"
                    >
                      {/* Vòng tròn nhỏ hơn 2 size (w-13 h-13 sm:w-15 sm:h-15 ~ 56-60px) */}
                      <div
                        className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full p-2 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                          isSubSelected
                            ? 'border-2 border-[#d70018] shadow-sm shadow-red-100 bg-white scale-105'
                            : 'border border-gray-200 bg-[#f8f9fa] hover:border-[#d70018]/60 group-hover:scale-105'
                        }`}
                      >
                        <img
                          src={model.img}
                          alt={model.name}
                          className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-2xs"
                        />
                      </div>

                      {/* Tên Submodel con */}
                      <span
                        className={`text-[11px] sm:text-xs font-medium text-center transition-colors line-clamp-2 leading-tight ${
                          isSubSelected
                            ? 'text-[#d70018] font-bold'
                            : 'text-gray-700 group-hover:text-[#d70018]'
                        }`}
                      >
                        {model.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* LƯỚI SẢN PHẨM */}
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

          {/* BÀI VIẾT SEO */}
          <IPhoneSeoContent categoryKey="iphone_seo_desc" />

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