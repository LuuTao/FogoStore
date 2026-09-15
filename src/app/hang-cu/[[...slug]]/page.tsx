'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, CornerDownLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { USED_HELPFUL_NEWS } from '@/data/usedCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

interface SeriesTabItem {
  name: string;
  slug?: string;
  img: string;
  queryTag: string | null;
}

// 1. Danh mục cấp 1: Kèm nút "Tất cả"
const DEFAULT_USED_CATEGORIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    queryTag: null,
  },
  {
    name: 'iPhone Cũ',
    slug: 'iphone-cu',
    img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    queryTag: 'iphone',
  },
  {
    name: 'iPad Cũ',
    slug: 'ipad-cu',
    img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80',
    queryTag: 'ipad',
  },
  {
    name: 'MacBook Cũ',
    slug: 'macbook-cu',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80',
    queryTag: 'macbook',
  },
];

// 2. Danh mục cấp 2: Phân loại theo đời máy
const USED_SUBMODELS_MAP: Record<string, { name: string; slug: string; img: string }[]> = {
  'iphone-cu': [
    {
      name: 'Tất cả iPhone',
      slug: 'iphone-cu',
      img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 17 Series',
      slug: 'iphone-17-series-cu',
      img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 16 Series',
      slug: 'iphone-16-series-cu',
      img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 15 Series',
      slug: 'iphone-15-series-cu',
      img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'iPhone 14 Series',
      slug: 'iphone-14-series-cu',
      img: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'ipad-cu': [
    {
      name: 'Tất cả iPad',
      slug: 'ipad-cu',
      img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80',
    },
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
      name: 'Tất cả MacBook',
      slug: 'macbook-cu',
      img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80',
    },
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

const DEFAULT_USED_SEO_TEXT = `Tại FoGo Store, toàn bộ các dòng máy cũ bao gồm iPhone Cũ, iPad Cũ và MacBook Cũ đều được trải qua quy trình kiểm định chất lượng nghiêm ngặt 30 bước: màn hình nguyên bản, pin zin dung lượng cao, hoạt động mượt mà không dính tài khoản iCloud ẩn hay khóa cấu hình MDM.

Chính sách ưu đãi độc quyền khi chọn mua máy cũ tại FoGo Store:
- Cam kết máy đẹp Like New 99%, chuẩn zin chưa qua sửa chữa thay thế linh kiện kém chất lượng.
- Bảo hành phần cứng toàn diện 1 đổi 1 lên đến 12 tháng, bao test dùng thử 30 ngày.
- Trợ giá thu cũ đổi mới lên đời cao nhất thị trường, hỗ trợ trả góp 0% lãi suất duyệt hồ sơ nhanh gọn.
- Tặng kèm gói phụ kiện cao cấp và hỗ trợ cài đặt ứng dụng, vệ sinh máy miễn phí trọn đời.`;

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicUsedPage() {
  const params = useParams();
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  const [dbProducts, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  // State Banner & Submodel nạp từ Admin
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [categories] = useState<SeriesTabItem[]>(DEFAULT_USED_CATEGORIES);

  // State bài viết SEO
  const [seoContent, setSeoContent] = useState<string>(DEFAULT_USED_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const currentFilter = Array.isArray(slugParam) ? slugParam[0] || '' : (slugParam as string) || '';

  // 1. Nạp Banner đôi Hàng Cũ từ Admin
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const usedBanners = parsed.filter((it: any) => it.group === 'hang_cu_banners');
          if (usedBanners.length > 0) {
            setAdminBanners(usedBanners);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cấu hình banner Hàng Cũ:', e);
    }
  }, []);

  // 2. Nạp nội dung SEO Hàng Cũ từ Admin
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_hang_cu_seo_desc');
      if (savedSeo && savedSeo.trim()) {
        setSeoContent(savedSeo);
      }
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO Hàng Cũ:', e);
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

  // 4. Fetch danh sách sản phẩm máy cũ
  useEffect(() => {
    const fetchLiveUsedProducts = async () => {
      try {
        setLoading(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products', { cache: 'no-store' });
        let json = await res.json();

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        const mapped = itemsList.map((item: any) => {
          const v = item.variants?.[0] || {};
          const curPrice = v.price || item.price || 0;
          const origPrice = v.originalPrice || item.originalPrice || curPrice;
          const discountPercent = origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 12;

          const lower = (item.name || '').toLowerCase();
          const catName = (item.category?.name || item.category?.slug || '').toLowerCase();

          // Phân loại thiết bị chính xác ngay từ đầu
          let deviceType: 'iphone' | 'ipad' | 'macbook' = 'iphone';
          if (lower.includes('macbook') || lower.includes('mac mini') || catName.includes('mac')) {
            deviceType = 'macbook';
          } else if (lower.includes('ipad') || catName.includes('ipad')) {
            deviceType = 'ipad';
          } else if (lower.includes('iphone') || catName.includes('iphone')) {
            deviceType = 'iphone';
          }

          const isUsed =
            lower.includes('cũ') ||
            lower.includes('like new') ||
            lower.includes('likenew') ||
            lower.includes('99%') ||
            lower.includes('98%') ||
            lower.includes('qua sử dụng') ||
            catName.includes('cũ') ||
            catName.includes('hang-cu');

          return {
            id: item.id,
            name: item.name,
            deviceType,
            isUsed,
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

        // Chỉ lấy sản phẩm máy cũ
        const onlyUsed = mapped.filter((p: any) => p.isUsed);
        setDbItems(onlyUsed.length > 0 ? onlyUsed : mapped.filter((p: any) => !p.name.toLowerCase().includes('new seal')));
      } catch (err) {
        console.error('Lỗi khi fetch hàng cũ từ API:', err);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveUsedProducts();
  }, []);

  const currentCategoryKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('iphone')) return 'iphone-cu';
    if (currentFilter.startsWith('ipad')) return 'ipad-cu';
    if (currentFilter.startsWith('macbook')) return 'macbook-cu';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentCategoryKey ? USED_SUBMODELS_MAP[currentCategoryKey] || [] : null;

  // =========================================================================
  // LOGIC LỌC CHUẨN XÁC THEO TỪNG THIẾT BỊ VÀ THẾ HỆ
  // =========================================================================
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    // Loại trừ phụ kiện
    items = items.filter((i) => {
      const lower = i.name.toLowerCase();
      return !lower.includes('dock sạc') && !lower.includes('cáp sạc') && !lower.includes('new seal');
    });

    if (currentFilter) {
      const slug = currentFilter.toLowerCase();

      // 1. NHÓM IPHONE CŨ
      if (slug.startsWith('iphone')) {
        // Bắt buộc phải là điện thoại iPhone
        items = items.filter((i) => i.deviceType === 'iphone' && i.searchIndex.includes('iphone'));

        if (slug === 'iphone-17-series-cu') {
          items = items.filter((i) => i.searchIndex.includes('17'));
        } else if (slug === 'iphone-16-series-cu') {
          items = items.filter((i) => i.searchIndex.includes('16'));
        } else if (slug === 'iphone-15-series-cu') {
          items = items.filter((i) => i.searchIndex.includes('15'));
        } else if (slug === 'iphone-14-series-cu') {
          items = items.filter((i) => i.searchIndex.includes('14'));
        } else if (slug === 'iphone-13-series-cu') {
          items = items.filter((i) => i.searchIndex.includes('13'));
        }
      }
      // 2. NHÓM IPAD CŨ
      else if (slug.startsWith('ipad')) {
        // Bắt buộc phải là máy tính bảng iPad
        items = items.filter((i) => i.deviceType === 'ipad' && i.searchIndex.includes('ipad'));

        if (slug === 'ipad-pro-cu') {
          items = items.filter((i) => i.searchIndex.includes('pro') && !i.searchIndex.includes('air'));
        } else if (slug === 'ipad-air-cu') {
          items = items.filter((i) => i.searchIndex.includes('air') && !i.searchIndex.includes('pro'));
        } else if (slug === 'ipad-mini-cu') {
          items = items.filter((i) => i.searchIndex.includes('mini'));
        } else if (slug === 'ipad-gen-cu') {
          items = items.filter((i) => i.searchIndex.includes('gen') || (!i.searchIndex.includes('pro') && !i.searchIndex.includes('air') && !i.searchIndex.includes('mini')));
        }
      }
      // 3. NHÓM MACBOOK CŨ
      else if (slug.startsWith('macbook')) {
        // Bắt buộc phải là máy MacBook
        items = items.filter((i) => i.deviceType === 'macbook' && (i.searchIndex.includes('macbook') || i.searchIndex.includes('mac')));

        if (slug === 'macbook-pro-cu') {
          items = items.filter((i) => i.searchIndex.includes('pro'));
        } else if (slug === 'macbook-air-cu') {
          items = items.filter((i) => i.searchIndex.includes('air'));
        }
      }
    }

    // Lọc theo giá
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

    // Sắp xếp
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
      case 'iphone-cu': return 'iPhone Cũ Like New 99%';
      case 'ipad-cu': return 'iPad Cũ Like New 99%';
      case 'macbook-cu': return 'MacBook Cũ Like New 99%';
      case 'iphone-17-series-cu': return 'iPhone 17 Series Cũ';
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

  // Cấu hình 2 Banner đôi
  const banner1 = adminBanners[0] || {
    name: 'Cam Kết Máy Cũ Chuẩn Zin',
    link: '/hang-cu',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: 'Thu Cũ Đổi Mới Lên Đời',
    link: '/hang-cu',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&h=200&q=80',
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
          {/* 1. BANNER ĐÔI THUẦN ẢNH CHUẨN 600x200px */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={banner1.link || '/hang-cu'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              <Link
                href={banner2.link || '/hang-cu'}
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

          {/* 2. HÀNG SERIES CHA: ICON TRÒN TO CHUẨN 80PX (w-20 h-20) */}
          <div className="my-6 py-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-center gap-6 sm:gap-9 min-w-max px-2">
              {categories.map((cat, idx) => {
                const isAllButton = cat.queryTag === null;
                const isSelected = isAllButton
                  ? !currentFilter
                  : currentFilter === cat.slug ||
                    (cat.queryTag && currentFilter.startsWith(cat.queryTag));

                return (
                  <Link
                    key={cat.slug || idx}
                    href={isAllButton ? '/hang-cu' : `/hang-cu/${cat.slug}`}
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
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-xs"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors whitespace-nowrap ${
                        isSelected ? 'text-[#d70018] font-bold' : 'text-gray-800 group-hover:text-[#d70018]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. HÀNG SUBMODEL CON: ICON TRÒN NHỎ HƠN 2 SIZE (w-14 h-14) */}
          {activeSubmodels && activeSubmodels.length > 0 && (
            <div className="mb-8 pt-2 pb-3 border-t border-dashed border-gray-100 overflow-x-auto scrollbar-none">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-5 sm:gap-7 min-w-max px-2">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/hang-cu/${model.slug}`}
                        className="group flex flex-col items-center gap-1.5 cursor-pointer max-w-[85px] sm:max-w-[95px] transition-transform active:scale-95"
                      >
                        <div
                          className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full p-2 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                            isSelected
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
                            isSelected ? 'text-[#d70018] font-bold' : 'text-gray-700 group-hover:text-[#d70018]'
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
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#d70018] transition-colors bg-gray-100 hover:bg-red-50 px-3.5 py-1.5 rounded-full border border-gray-200 cursor-pointer"
                >
                  <CornerDownLeft size={13} />
                  <span>Xem tất cả danh mục hàng cũ khác</span>
                </Link>
              </div>
            </div>
          )}

          {/* TIÊU ĐỀ & CỤM BỘ LỌC */}
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

          {/* LƯỚI SẢN PHẨM */}
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

          {/* ========================================================= */}
          {/* BÀI VIẾT SEO CHÂN TRANG HÀNG CŨ (HỖ TRỢ HTML)             */}
          {/* ========================================================= */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-5 md:p-8 shadow-xs my-10 relative">
            <div
              className={`relative overflow-hidden transition-all duration-500 text-xs md:text-sm text-gray-700 leading-relaxed font-normal ${
                isSeoExpanded ? 'max-h-full pb-2' : 'max-h-[170px]'
              }`}
              dangerouslySetInnerHTML={{ __html: seoContent }}
            />

            {!isSeoExpanded && (
              <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}

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

          {/* CHÂN TRANG TIN TỨC VÀ SẢN PHẨM VỪA XEM */}
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