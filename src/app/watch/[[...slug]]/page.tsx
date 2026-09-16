'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WATCH_HELPFUL_NEWS } from '@/data/watchCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// 1. Danh sách Series Apple Watch mặc định kèm nút "Tất cả"
const DEFAULT_WATCH_SERIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    queryTag: null,
  },
  {
    name: 'Apple Watch Ultra',
    slug: 'watch-ultra',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    queryTag: 'ultra',
  },
  {
    name: 'Apple Watch Series',
    slug: 'watch-series',
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    queryTag: 'series',
  },
  {
    name: 'Apple Watch SE',
    slug: 'watch-se',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    queryTag: 'se',
  },
];

// 2. Sub-models chi tiết từng dòng
const WATCH_SUBMODELS_MAP: Record<string, SubModelItem[]> = {
  ultra: [
    {
      name: 'Tất cả Ultra',
      tag: 'ultra',
      img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch Ultra 2',
      tag: 'ultra-2',
      img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch Ultra 1',
      tag: 'ultra-1',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
  ],
  series: [
    {
      name: 'Tất cả Series',
      tag: 'series',
      img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Series 10',
      tag: 'series-10',
      img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Series 9',
      tag: 'series-9',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Series 8',
      tag: 'series-8',
      img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    },
  ],
  se: [
    {
      name: 'Tất cả SE',
      tag: 'se',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch SE 2',
      tag: 'se-2',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Watch SE 1',
      tag: 'se-1',
      img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

const DEFAULT_WATCH_SEO_TEXT = `Apple Watch là dòng đồng hồ thông minh bán chạy nhất thế giới do Apple Inc. phát triển, đóng vai trò như một người bạn đồng hành sức khỏe tối thượng, huấn luyện viên thể thao chuyên nghiệp và công cụ kết nối thông minh tức thì ngay trên cổ tay của bạn.

Các dòng sản phẩm Apple Watch chính hãng nổi bật:
- Apple Watch Ultra: Thiết kế vỏ Titanium siêu bền chuẩn quân đội, màn hình sapphire độ sáng lên đến 3000 nits, định vị GPS tần số kép chính xác cao và thời lượng pin vượt trội dành cho vận động viên sức bền và nhà thám hiểm.
- Apple Watch Series (Series 10, 9, 8): Viền màn hình siêu mỏng, cảm biến điện tâm đồ ECG, đo nồng độ oxy trong máu SpO2, đo nhiệt độ cổ tay và tính năng phát hiện té ngã, va chạm an toàn.
- Apple Watch SE: Tối ưu chi phí với đầy đủ các tính năng theo dõi sức khỏe cốt lõi, gọi khẩn cấp SOS và thông báo thông minh, phù hợp cho học sinh, sinh viên và người dùng cơ bản.

Lợi ích khi chọn mua Apple Watch tại FoGo Store:
- Hàng Apple chính hãng VN/A nguyên seal bảo hành 12 tháng tại các trung tâm uỷ quyền Apple.
- Đầy đủ phiên bản GPS và LTE (eSIM) kết nối gọi điện, nghe nhạc độc lập không cần mang theo điện thoại.
- Trả góp 0% lãi suất, hỗ trợ thu cũ đổi mới lên đời trợ giá tốt nhất thị trường.`;

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

// Hàm định dạng giá: Trả về "Liên hệ" nếu giá <= 0
const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80';
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('https://')) return cleanUrl;
  if (cleanUrl.startsWith('http://localhost')) {
    return cleanUrl.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
  }
  if (cleanUrl.startsWith('http://')) {
    return cleanUrl.replace('http://', 'https://');
  }
  const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${API_URL}${path}`;
};

export default function DynamicWatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [rawDbProducts, setRawDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_WATCH_SERIES);

  const [seoContent, setSeoContent] = useState<string>(DEFAULT_WATCH_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const rawParam =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawParam || '').toLowerCase().trim();

  // 1. Nạp Banner đôi & Danh mục Submodel từ Admin
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const watchBanners = parsed.filter((it: any) => it.group === 'watch_banners');
          if (watchBanners.length > 0) setAdminBanners(watchBanners);

          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_watch' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const mapped: SeriesTabItem[] = [
              DEFAULT_WATCH_SERIES[0],
              ...adminSubs.map((it: any) => {
                const lower = it.name.toLowerCase();
                let queryTag = 'series';
                if (lower.includes('ultra')) queryTag = 'ultra';
                else if (lower.includes('se')) queryTag = 'se';

                return {
                  name: it.name,
                  slug: `watch-${queryTag}`,
                  imageUrl: it.imageUrl,
                  queryTag,
                };
              }),
            ];
            setSeriesTabs(mapped);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cấu hình banner Watch:', e);
    }
  }, []);

  // 2. Nạp nội dung SEO Apple Watch
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_watch_seo_desc');
      if (savedSeo && savedSeo.trim()) setSeoContent(savedSeo);
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO Watch:', e);
    }
  }, []);

  // 3. Đọc sản phẩm đã xem
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  // 4. Fetch sản phẩm Apple Watch từ Database
  useEffect(() => {
    const fetchWatchFromDB = async () => {
      try {
        setLoading(true);
        let res = await fetch(`${API_URL}/api/products/filter?category=watch`, {
          cache: 'no-store',
        });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const watchItems = itemsList.filter((item: any) => {
          const lower = (item.name || '').toLowerCase();
          const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
          return cat.includes('watch') || lower.includes('watch') || lower.includes('đồng hồ');
        });

        setRawDbProducts(watchItems);
      } catch (err) {
        console.error('Lỗi khi fetch Apple Watch từ API:', err);
        setRawDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchFromDB();
  }, []);

  // 5. TỰ ĐỘNG PHÂN TÁCH BIẾN THỂ KÍCH THƯỚC/DUNG LƯỢNG THÀNH TỪNG CARD ĐỘC LẬP
  const expandedProducts = useMemo(() => {
    const result: any[] = [];

    rawDbProducts.forEach((prod) => {
      const variants: any[] = Array.isArray(prod.variants) ? prod.variants : [];

      const storageMap = new Map<string, any[]>();
      variants.forEach((v) => {
        const rawSt = (v.storage && String(v.storage).trim()) || '';
        const stKey = rawSt.toLowerCase() === 'tiêu chuẩn' || !rawSt ? '' : rawSt.toUpperCase().replace(/\//g, '-');
        if (!storageMap.has(stKey)) {
          storageMap.set(stKey, []);
        }
        storageMap.get(stKey)!.push(v);
      });

      if (storageMap.size <= 1) {
        const v = variants[0] || {};
        const curPrice = Number(v.price || prod.price || 0);
        const origPrice = Number(v.originalPrice || prod.originalPrice || Math.round(curPrice * 1.15));
        const stKey = Array.from(storageMap.keys())[0] || '';
        const nameSuffix = stKey ? ` ${stKey}` : '';
        const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';

        // QUY TẮC: CÓ GIÁ (> 0) LÀ SẴN HÀNG, GIÁ <= 0 LÀ LIÊN HỆ & TẠM HẾT HÀNG
        const hasPrice = curPrice > 0;

        result.push({
          id: prod.id,
          name: prod.name.includes(stKey) ? prod.name : `${prod.name}${nameSuffix}`,
          slug: `${prod.slug}${slugSuffix}`,
          href: `/san-pham/${prod.slug}${slugSuffix}`,
          currentPrice: formatVndPrice(curPrice),
          originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
          rawPrice: curPrice,
          discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
          imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
          downPayment: hasPrice ? Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ' : 'Liên hệ',
          statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
          rating: 5,
          searchIndex: `${prod.name} ${stKey} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
        });
      } else {
        storageMap.forEach((varList, stKey) => {
          const v = varList[0];
          const curPrice = Number(v.price || prod.price || 0);
          const origPrice = Number(v.originalPrice || prod.originalPrice || Math.round(curPrice * 1.15));
          const nameSuffix = stKey ? ` ${stKey}` : '';
          const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';

          // QUY TẮC: CÓ GIÁ (> 0) LÀ SẴN HÀNG, GIÁ <= 0 LÀ LIÊN HỆ & TẠM HẾT HÀNG
          const hasPrice = curPrice > 0;

          result.push({
            id: `${prod.id}-${stKey || 'base'}`,
            name: prod.name.includes(stKey) ? prod.name : `${prod.name}${nameSuffix}`,
            slug: `${prod.slug}${slugSuffix}`,
            href: `/san-pham/${prod.slug}${slugSuffix}`,
            currentPrice: formatVndPrice(curPrice),
            originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
            rawPrice: curPrice,
            discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
            imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
            downPayment: hasPrice ? Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ' : 'Liên hệ',
            statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
            rating: 5,
            searchIndex: `${prod.name} ${stKey} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
          });
        });
      }
    });

    return result;
  }, [rawDbProducts]);

  // Nhận diện dòng cha đang chọn (ultra, series, se)
  const currentSeriesKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('ultra')) return 'ultra';
    if (currentFilter.includes('series')) return 'series';
    if (currentFilter.includes('se')) return 'se';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesKey ? WATCH_SUBMODELS_MAP[currentSeriesKey] || [] : [];

  // Lọc sản phẩm Apple Watch chính xác
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    items = items.filter((i) => {
      const lowerName = (i.name || '').toLowerCase();
      return lowerName.includes('watch') || lowerName.includes('đồng hồ');
    });

    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      if (lowerFilter.includes('ultra')) {
        items = items.filter((i) => i.searchIndex.includes('ultra'));
        if (lowerFilter.includes('2')) items = items.filter((i) => i.searchIndex.includes('2'));
        else if (lowerFilter.includes('1')) items = items.filter((i) => !i.searchIndex.includes('2'));
      } else if (lowerFilter.includes('se')) {
        items = items.filter((i) => i.searchIndex.includes('se'));
        if (lowerFilter.includes('2')) items = items.filter((i) => i.searchIndex.includes('2'));
        else if (lowerFilter.includes('1')) items = items.filter((i) => !i.searchIndex.includes('2'));
      } else if (lowerFilter.includes('series')) {
        items = items.filter((i) => !i.searchIndex.includes('ultra') && !i.searchIndex.includes('se'));
        if (lowerFilter.includes('10')) items = items.filter((i) => i.searchIndex.includes('10'));
        else if (lowerFilter.includes('9')) items = items.filter((i) => i.searchIndex.includes('9'));
        else if (lowerFilter.includes('8')) items = items.filter((i) => i.searchIndex.includes('8'));
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

    if (activeFilters.screenSize) {
      const sizeVal = activeFilters.screenSize.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(sizeVal));
    }

    if (activeFilters.demand && activeFilters.demand.length > 0) {
      items = items.filter((item) =>
        activeFilters.demand!.some((d) => item.searchIndex.includes(d.toLowerCase()))
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
  }, [expandedProducts, currentFilter, currentSort, activeFilters]);

  // Tiêu đề hiển thị
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'watch-ultra':
      case 'ultra':
        return 'Apple Watch Ultra';
      case 'watch-series':
      case 'series':
        return 'Apple Watch Series';
      case 'watch-se':
      case 'se':
        return 'Apple Watch SE';
      case 'watch-ultra-2':
      case 'ultra-2':
        return 'Apple Watch Ultra 2';
      case 'watch-ultra-1':
      case 'ultra-1':
        return 'Apple Watch Ultra 1';
      case 'watch-series-10':
      case 'series-10':
        return 'Apple Watch Series 10';
      case 'watch-series-9':
      case 'series-9':
        return 'Apple Watch Series 9';
      case 'watch-series-8':
      case 'series-8':
        return 'Apple Watch Series 8';
      case 'watch-se-2':
      case 'se-2':
        return 'Apple Watch SE 2 (2024)';
      case 'watch-se-1':
      case 'se-1':
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

  const banner1 = adminBanners[0] || {
    name: 'Apple Watch Ultra 2',
    link: '/watch',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: displayTitle,
    link: '/watch',
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=600&h=200&q=80',
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
          {/* 1. BANNER ĐÔI THUẦN ẢNH CHUẨN 600x200px */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={banner1.link || '/watch'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              <Link
                href={banner2.link || '/watch'}
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

          {/* 2. HÀNG SERIES CHA: ICON TRÒN TO CHUẨN 80PX */}
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
                    href={isAllButton ? '/watch' : `/watch?series=${series.queryTag}`}
                    className="group flex flex-col items-center gap-2 cursor-pointer max-w-[95px] sm:max-w-[110px] transition-transform active:scale-95"
                  >
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

          {/* 3. HÀNG SUBMODEL CON */}
          {activeSubmodels.length > 0 && (
            <div className="mb-8 pt-2 pb-3 border-t border-dashed border-gray-100 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-center gap-5 sm:gap-7 min-w-max px-2">
                {activeSubmodels.map((model) => {
                  const isSubSelected = currentFilter === model.tag;

                  return (
                    <Link
                      key={model.tag}
                      href={`/watch?series=${model.tag}`}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer max-w-[85px] sm:max-w-[95px] transition-transform active:scale-95"
                    >
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

          {/* TIÊU ĐỀ & BỘ LỌC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Đang tải dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} phiên bản phù hợp`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={false}
            />
          </div>

          {/* LƯỚI SẢN PHẨM PHÂN TÁCH KÍCH THƯỚC / BIẾN THỂ */}
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
                    {product.rawPrice > 0 ? (
                      <span className="bg-[#d70018] text-white text-[11px] font-black px-1.5 py-0.5 rounded-none">
                        -{product.discountPercent}%
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5">
                        Hot
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                      <span></span>
                      <span className="scale-90 origin-right">Authorized Reseller</span>
                    </div>
                  </div>

                  <Link href={product.href} className="w-full h-40 my-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    />
                  </Link>

                  <Link
                    href={product.href}
                    className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug"
                  >
                    {product.name}
                  </Link>

                  {/* KHỐI TRẢ GÓP: CÓ GIÁ MỚI HIỆN BẢNG 0% 0Đ 0Đ */}
                  {product.rawPrice > 0 ? (
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
                  ) : (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-sm py-1.5 px-2 text-center">
                      <span className="text-[10px] font-bold text-gray-500">
                        Liên hệ nhận báo giá tốt nhất
                      </span>
                    </div>
                  )}

                  {/* NHÃN TRẠNG THÁI: CÓ GIÁ LÀ SẴN HÀNG, KHÔNG CÓ GIÁ LÀ TẠM HẾT HÀNG */}
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm w-fit ${
                      product.statusTag === 'Sẵn hàng'
                        ? 'bg-[#ffe8e8] text-[#d70018]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {product.statusTag}
                  </span>

                  {/* MỨC GIÁ: CÓ GIÁ THÌ HIỆN SỐ TIỀN, GIÁ <= 0 THÌ HIỆN CHỮ "LIÊN HỆ" */}
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={`font-black text-[#d70018] ${product.rawPrice > 0 ? 'text-sm md:text-base' : 'text-base sm:text-lg'}`}>
                      {product.currentPrice}
                    </span>
                    {product.rawPrice > 0 && product.originalPrice && (
                      <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                    {product.rawPrice > 0 ? (
                      <>Hoặc trả trước <strong className="text-gray-900">{product.downPayment}</strong></>
                    ) : (
                      <span className="text-[#d70018] font-bold">Hotline: 056.600.3333</span>
                    )}
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc danh mục này trong kho.</p>
              <Link href="/watch" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả Apple Watch
              </Link>
            </div>
          )}

          {/* BÀI VIẾT SEO CHÂN TRANG */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-5 md:p-8 shadow-xs my-10 relative">
            <div
              className={`relative overflow-hidden transition-all duration-500 text-xs md:text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line ${
                isSeoExpanded ? 'max-h-full pb-2' : 'max-h-[170px]'
              }`}
            >
              {seoContent}

              {!isSeoExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>

            <div className="flex justify-center mt-4 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                className="px-6 py-2 rounded-full border border-gray-300 hover:border-[#d70018] text-gray-700 hover:text-[#d70018] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
              >
                {isSeoExpanded ? (
                  <>
                    <span>Rút gọn</span>
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    <span>Xem thêm bài viết</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CHÂN TRANG TIN TỨC VÀ BẠN VỪA XEM */}
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