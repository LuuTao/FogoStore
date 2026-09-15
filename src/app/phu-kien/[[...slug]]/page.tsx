'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

interface SeriesTabItem {
  name: string;
  slug?: string;
  imageUrl: string;
  queryTag: string | null;
}

// 1. Danh mục phụ kiện mặc định kèm nút "Tất cả"
const DEFAULT_ACCESSORY_CATEGORIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/mw2l3_geo_vn_de11bc805a154184b143c3eb18f4da05_master.jpeg?auto=format&fit=crop&w=150&q=80',
    queryTag: null,
  },
  {
    name: 'Củ & Cáp Sạc',
    slug: 'sac-cap',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/mw2l3_geo_vn_de11bc805a154184b143c3eb18f4da05_master.jpeg?auto=format&fit=crop&w=150&q=80',
    queryTag: 'sac-cap',
  },
  {
    name: 'AirPods & Âm Thanh',
    slug: 'tai-nghe',
    imageUrl: 'https://product.hstatic.net/200000768357/product/a3_1_42b1bd6f73de43ea8152bb40d71e610d_997dc83fdca54d0fb00c189095d50e21_master.png?auto=format&fit=crop&w=150&q=80',
    queryTag: 'tai-nghe',
  },
  {
    name: 'Bút Pencil & Phím',
    slug: 'phu-kien-mac',
    imageUrl: 'https://product.hstatic.net/200000768357/product/magic-keyboard-for-ipad-pro-11-inch-m4-white-4-square_medium_344b97d0559244a485169928d75bb5a7_master.jpg?auto=format&fit=crop&w=150&q=80',
    queryTag: 'phu-kien-mac',
  },
];

const DEFAULT_ACCESSORY_SEO_TEXT = `Phụ kiện Apple chính hãng là giải pháp tối ưu giúp bảo vệ thiết bị, duy trì tuổi thọ pin và nâng cao trải nghiệm sử dụng hàng ngày của bạn. Việc dùng củ sạc, cáp sạc và phụ kiện chuẩn zin đảm bảo nguồn điện ổn định, chống cháy nổ và tương thích hoàn hảo với hệ điều hành iOS, iPadOS và macOS.

Các nhóm phụ kiện Apple được phân phối tại FoGo Store:
- Củ sạc nhanh & Cáp sạc: Công nghệ sạc nhanh PD 20W, 35W, 70W, 96W và 140W Type-C chuẩn Apple, bảo vệ pin tối đa.
- Tai nghe AirPods: AirPods 4, AirPods Pro 2 với chip H2, chống ồn chủ động ANC và âm thanh không gian Spatial Audio sống động.
- Bàn phím & Bút Apple Pencil: Magic Keyboard, Magic Mouse và Apple Pencil Pro mang đến hiệu suất làm việc chuyên nghiệp trên iPad và Mac.
- Ốp lưng & Kính cường lực: Ốp hỗ trợ MagSafe từ tính hít chặt và kính cường lực chống trầy xước, va đập vượt trội.

Chính sách bán hàng tại FoGo Store:
- Cam kết 100% sản phẩm có nguồn gốc xuất xứ rõ ràng, nguyên seal nguyên hộp.
- Bảo hành 1 đổi 1 trong vòng 12 tháng đối với lỗi từ nhà sản xuất.
- Hỗ trợ giao hàng hoả tốc và tư vấn chọn đúng chuẩn phụ kiện cho từng dòng máy.`;

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

const getProductLink = (item: any) => {
  if (item.slug) return `/san-pham/${item.slug}`;
  if (item.href) {
    if (item.href.startsWith('/san-pham/')) return item.href;
    return `/san-pham/${item.href.replace(/^\//, '')}`;
  }
  return `/san-pham/${item.id}`;
};

export default function DynamicAccessoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [dbProducts, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  // State Banner & Submodel nạp từ Admin
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<SeriesTabItem[]>(DEFAULT_ACCESSORY_CATEGORIES);

  // State bài viết SEO
  const [seoContent, setSeoContent] = useState<string>(DEFAULT_ACCESSORY_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const rawParam =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawParam || '').toLowerCase().trim();

  // 1. Nạp Banner đôi & Danh mục Submodel từ Admin qua LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Lọc 2 Banner đôi Phụ Kiện
          const accBanners = parsed.filter((it: any) => it.group === 'phu_kien_banners');
          if (accBanners.length > 0) {
            setAdminBanners(accBanners);
          }

          // Lọc Icon tròn Phụ Kiện (sub_phu_kien)
          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_phu_kien' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const mapped: SeriesTabItem[] = [
              DEFAULT_ACCESSORY_CATEGORIES[0],
              ...adminSubs.map((it: any) => {
                const lower = it.name.toLowerCase();
                let queryTag = 'sac-cap';
                if (lower.includes('tai nghe') || lower.includes('airpods')) queryTag = 'tai-nghe';
                else if (lower.includes('bút') || lower.includes('pencil') || lower.includes('phím')) queryTag = 'phu-kien-mac';
                else if (lower.includes('ốp')) queryTag = 'op-lung';
                else if (lower.includes('kính') || lower.includes('cường lực')) queryTag = 'cuong-luc';

                return {
                  name: it.name,
                  slug: queryTag,
                  imageUrl: it.imageUrl,
                  queryTag,
                };
              }),
            ];
            setCategories(mapped);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cấu hình banner Phụ Kiện:', e);
    }
  }, []);

  // 2. Nạp nội dung SEO Phụ Kiện từ Admin
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_phu_kien_seo_desc');
      if (savedSeo && savedSeo.trim()) {
        setSeoContent(savedSeo);
      }
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO Phụ Kiện:', e);
    }
  }, []);

  // 3. Đọc sản phẩm đã xem thực tế từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  // 4. Fetch danh sách phụ kiện từ API Backend
  useEffect(() => {
    const fetchAccessoryFromDB = async () => {
      try {
        setLoading(true);
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=phu-kien', {
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
            return (
              cat.includes('phu-kien') ||
              cat.includes('accessory') ||
              lower.includes('sạc') ||
              lower.includes('cáp') ||
              lower.includes('tai nghe') ||
              lower.includes('airpods') ||
              lower.includes('ốp') ||
              lower.includes('kính') ||
              lower.includes('pencil') ||
              lower.includes('chuột') ||
              lower.includes('keyboard')
            );
          })
          .map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || item.price || 0;
            const origPrice = v.originalPrice || item.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 10;

            const lower = (item.name || '').toLowerCase();
            let series = 'sac-cap';

            if (lower.includes('airpods') || lower.includes('tai nghe')) {
              series = 'tai-nghe';
            } else if (lower.includes('ốp') || lower.includes('bao da')) {
              series = 'op-lung';
            } else if (lower.includes('kính') || lower.includes('cường lực')) {
              series = 'cuong-luc';
            } else if (
              lower.includes('pencil') ||
              lower.includes('bàn phím') ||
              lower.includes('magic')
            ) {
              series = 'phu-kien-mac';
            }

            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              series,
              subModel: series,
              href: `/san-pham/${item.slug || item.id}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              rawPrice: curPrice,
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                item.imageUrl ||
                'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
              downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
              rating: 5,
              searchIndex: `${item.name || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase(),
            };
          });

        setDbItems(mapped);
      } catch (err) {
        console.error('Lỗi khi fetch phụ kiện từ API:', err);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessoryFromDB();
  }, []);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase().replace(/[-]/g, ' ');
      items = items.filter((i) => i.series === currentFilter || i.searchIndex.includes(lowerFilter));
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

  // Tiêu đề hiển thị
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'sac-cap': return 'Củ Sạc & Cáp Sạc Nhanh Apple';
      case 'tai-nghe': return 'Tai Nghe AirPods & Thiết Bị Âm Thanh';
      case 'op-lung': return 'Ốp Lưng & Bao Da MagSafe Cao Cấp';
      case 'cuong-luc': return 'Kính Cường Lực Chống Trầy Xước';
      case 'phu-kien-mac': return 'Apple Pencil, Bàn Phím & Magic Mouse';
      default: return 'Phụ Kiện Apple Chính Hãng';
    }
  }, [currentFilter]);

  // Cấu hình 2 Banner đôi (ưu tiên dữ liệu Admin)
  const banner1 = adminBanners[0] || {
    name: 'Củ Sạc & Cáp Zin Apple',
    subtitle: 'Bảo vệ tuổi thọ pin tối đa. Bảo hành 12 tháng 1 đổi 1.',
    tag: 'Giảm sốc 25% Hôm Nay',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: 'AirPods Pro 2 USB-C',
    subtitle: 'Âm thanh studio. Chống ồn chủ động đỉnh cao.',
    tag: 'Sẵn hàng Giá tốt nhất',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
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
            <Link href="/phu-kien" className="hover:text-[#d70018]">Phụ kiện</Link>
            {currentFilter && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-bold">{displayTitle}</span>
              </>
            )}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* BANNER ĐÔI TRANG PHỤ KIỆN (CẬP NHẬT ĐỘNG TỪ ADMIN) */}
          <div className="relative mb-6 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-sm bg-gradient-to-r from-[#1c1d21] to-[#30333d] border border-gray-800 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm text-white">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 font-bold text-lg md:text-xl text-white">
                    <Zap size={20} className="text-amber-400" />
                    <span>{banner1.name}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium my-2">{banner1.subtitle}</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    {banner1.tag}
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0 flex items-center justify-center">
                  <img
                    src={banner1.imageUrl}
                    alt={banner1.name}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>

              <div className="relative rounded-sm bg-gradient-to-r from-[#fbf8f5] to-[#f4eef9] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>{banner2.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">{banner2.subtitle}</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    {banner2.tag}
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0 flex items-center justify-center">
                  <img
                    src={banner2.imageUrl}
                    alt={banner2.name}
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG ICON TRÒN 80PX (CHUẨN VIỀN ĐỎ BO TRÒN KHI CHỌN) */}
          <div className="my-8 py-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-center gap-6 sm:gap-9 min-w-max px-2">
              {categories.map((cat, idx) => {
                const isAllButton = cat.queryTag === null;
                const isSelected = isAllButton
                  ? !currentFilter
                  : currentFilter === cat.slug ||
                    (cat.queryTag && currentFilter.includes(cat.queryTag));

                return (
                  <Link
                    key={cat.slug || idx}
                    href={isAllButton ? '/phu-kien' : `/phu-kien?series=${cat.queryTag}`}
                    className="group flex flex-col items-center gap-2 cursor-pointer max-w-[95px] sm:max-w-[110px]"
                  >
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-2.5 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-2 border-[#d70018] shadow-md shadow-red-100 bg-white scale-105'
                          : 'border-2 border-transparent bg-[#f0f2f5] hover:bg-gray-200 group-hover:scale-105'
                      }`}
                    >
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-xs"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-2 ${
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

          {/* TIÊU ĐỀ & BỘ LỌC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Đang tải dữ liệu...' : `Tìm thấy ${filteredProducts.length} phụ kiện chính hãng`}
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
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-14">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-sm p-3 flex flex-col justify-between border border-gray-200 min-h-[410px] animate-pulse"
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
              {filteredProducts.map((product) => {
                const targetLink = getProductLink(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200 min-h-[410px]"
                  >
                    <div className="flex items-center justify-between h-6">
                      <span className="bg-[#d70018] text-white text-[11px] font-black px-1.5 py-0.5 rounded-none">
                        -{product.discountPercent}%
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                        <span></span>
                        <span className="scale-90 origin-right">Chính hãng</span>
                      </div>
                    </div>

                    <Link href={targetLink} className="w-full h-40 my-2 flex items-center justify-center overflow-hidden cursor-pointer">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                      />
                    </Link>

                    <Link
                      href={targetLink}
                      className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug cursor-pointer"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-2 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1 px-2 text-center relative">
                      <div className="text-[10px] font-bold text-gray-500 flex items-center justify-around">
                        <span>Bảo Hành</span>
                        <span>•</span>
                        <span>Cam Kết</span>
                        <span>•</span>
                        <span>Đổi Mới</span>
                      </div>
                      <div className="text-xs font-black text-[#d70018] tracking-tight flex items-center justify-around mt-0.5">
                        <span>12 Tháng</span>
                        <span>100% Zin</span>
                        <span>30 Ngày</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-sm md:text-base font-black text-[#d70018]">{product.currentPrice}</span>
                      <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
                    </div>

                    <div className="flex items-center gap-0.5 mt-2 text-amber-400 h-3">
                      {[...Array(product.rating || 5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm mb-14">
              <p className="text-gray-500 font-semibold text-sm">Chưa có phụ kiện nào phù hợp với danh mục này trong kho.</p>
              <Link href="/phu-kien" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả phụ kiện
              </Link>
            </div>
          )}

          {/* ========================================================= */}
          {/* BÀI VIẾT SEO CHÂN TRANG PHỤ KIỆN (LẤY ĐỘNG TỪ TRANG ADMIN)*/}
          {/* ========================================================= */}
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

          {/* CHÂN TRANG THÔNG TIN VÀ BẠN VỪA XEM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="bg-[#fafafb] p-6 rounded-sm border border-gray-200 leading-relaxed text-gray-700 text-xs md:text-sm space-y-3">
                <h2 className="text-xl font-black text-gray-900">Hệ Sinh Thái Phụ Kiện Apple Chính Hãng Tại FoGo Store</h2>
                <p>
                  Sử dụng phụ kiện chính hãng Apple giúp thiết bị của bạn luôn hoạt động bền bỉ, an toàn nguồn điện và chống chai pin. FoGo Store cam kết 100% sản phẩm có nguồn gốc rõ ràng, bảo hành 1 đổi 1 trong vòng 12 tháng.
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
                      <div className="w-full h-28 my-2 flex items-center justify-center overflow-hidden">
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