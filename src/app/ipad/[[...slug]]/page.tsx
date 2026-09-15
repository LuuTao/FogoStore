'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { IPAD_HELPFUL_NEWS } from '@/data/ipadCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

interface SeriesTabItem {
  name: string;
  slug?: string;
  imageUrl: string;
  queryTag: string | null;
}

// 1. Danh sách Series iPad mặc định có nút "Tất cả"
const DEFAULT_IPAD_SERIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?w=150',
    queryTag: null,
  },
  {
    name: 'iPad Pro',
    slug: 'ipad-pro',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?w=150',
    queryTag: 'pro',
  },
  {
    name: 'iPad Air',
    slug: 'ipad-air',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?w=150',
    queryTag: 'air',
  },
  {
    name: 'iPad Gen',
    slug: 'ipad-gen',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_30_8234a6ff9e3b48fd9cc8571feaf230a7_master.jpeg?w=150',
    queryTag: 'gen',
  },
  {
    name: 'iPad Mini',
    slug: 'ipad-mini',
    imageUrl: 'https://product.hstatic.net/200000768357/product/hinh_anh_12_6ddc1b37c55c4213838c8e5047f59a8c_master.jpeg?w=150',
    queryTag: 'mini',
  },
];

// 2. Danh mục model con tương ứng từng dòng máy
const IPAD_SUBMODELS_MAP: Record<string, { name: string; tag: string }[]> = {
  pro: [
    { name: 'Tất cả iPad Pro', tag: 'pro' },
    { name: 'iPad Pro M4', tag: 'pro-m4' },
    { name: 'iPad Pro M2', tag: 'pro-m2' },
  ],
  air: [
    { name: 'Tất cả iPad Air', tag: 'air' },
    { name: 'iPad Air M2', tag: 'air-m2' },
    { name: 'iPad Air 5', tag: 'air-5' },
  ],
  gen: [
    { name: 'Tất cả iPad Gen', tag: 'gen' },
    { name: 'iPad Gen 10', tag: 'gen-10' },
    { name: 'iPad Gen 9', tag: 'gen-9' },
  ],
  mini: [
    { name: 'Tất cả iPad Mini', tag: 'mini' },
    { name: 'iPad Mini 7', tag: 'mini-7' },
    { name: 'iPad Mini 6', tag: 'mini-6' },
  ],
};

const DEFAULT_IPAD_SEO_TEXT = `iPad là dòng máy tính bảng tiên phong do Apple thiết kế và phát triển, kết hợp hoàn hảo giữa tính di động của smartphone và hiệu năng mạnh mẽ của laptop. Kể từ khi Steve Jobs giới thiệu chiếc iPad đầu tiên vào năm 2010, dòng sản phẩm này đã liên tục định hình lại phương thức học tập, làm việc và giải trí sáng tạo.

Các dòng iPad hiện nay:
- iPad Pro: Đỉnh cao công nghệ với vi xử lý Apple Silicon M-Series, màn hình OLED Tandem Ultra Retina XDR siêu mượt mà.
- iPad Air: Sự cân bằng hoàn hảo giữa hiệu năng khủng và thiết kế siêu nhẹ, phù hợp cho đa số người dùng văn phòng và sáng tạo.
- iPad Gen (Tiêu chuẩn): Lựa chọn quốc dân tối ưu chi phí dành cho học sinh, sinh viên học tập online và giải trí nhẹ nhàng.
- iPad Mini: Thiết kế nhỏ gọn tiện lợi bỏ túi, hiệu năng mạnh mẽ cho nhu cầu di chuyển linh hoạt mọi nơi.

Ưu điểm nổi bật của iPad:
- Hệ điều hành iPadOS trực quan, hỗ trợ đa nhiệm Split View, Stage Manager mượt mà.
- Tương thích phụ kiện cao cấp: Bút Apple Pencil và bàn phím Magic Keyboard biến iPad thành cỗ máy làm việc thực thụ.
- Thời lượng pin bền bỉ cả ngày dài và kho ứng dụng chuyên nghiệp phong phú trên App Store.`;

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

export default function DynamicIPadPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [dbProducts, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  // State quản lý Banner đôi nạp từ Admin
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  // State quản lý Icon tròn danh mục
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_IPAD_SERIES);

  // State quản lý bài viết SEO chân trang iPad
  const [seoContent, setSeoContent] = useState<string>(DEFAULT_IPAD_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const rawFilter =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawFilter || '').toLowerCase().trim();

  // 1. Nạp Banner đôi & Danh mục Submodel từ Admin qua LocalStorage / API
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Lọc 2 Banner đôi iPad
          const ipadBanners = parsed.filter((it: any) => it.group === 'ipad_banners');
          if (ipadBanners.length > 0) {
            setAdminBanners(ipadBanners);
          }

          // Lọc Icon tròn dòng iPad (sub_ipad)
          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_ipad' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const mapped: SeriesTabItem[] = [
              DEFAULT_IPAD_SERIES[0],
              ...adminSubs.map((it: any) => {
                const lower = it.name.toLowerCase();
                let queryTag = 'pro';
                if (lower.includes('air')) queryTag = 'air';
                else if (lower.includes('gen')) queryTag = 'gen';
                else if (lower.includes('mini')) queryTag = 'mini';

                return {
                  name: it.name,
                  slug: `ipad-${queryTag}`,
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
      console.warn('Lỗi nạp cấu hình banner iPad:', e);
    }
  }, []);

  // 2. Nạp nội dung SEO iPad đã lưu từ Admin
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_ipad_seo_desc');
      if (savedSeo && savedSeo.trim()) {
        setSeoContent(savedSeo);
      }
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO iPad:', e);
    }
  }, []);

  // 3. Đọc danh sách xem gần đây
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  // 4. Kết nối API nạp sản phẩm iPad
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

            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              href: `/san-pham/${item.slug || item.id}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              rawPrice: curPrice,
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                item.imageUrl ||
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
              downPayment: Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ',
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

  // Nhận diện dòng máy đang chọn (pro, air, gen, mini)
  const currentSeriesTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('pro')) return 'pro';
    if (currentFilter.includes('air')) return 'air';
    if (currentFilter.includes('gen')) return 'gen';
    if (currentFilter.includes('mini')) return 'mini';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesTag ? IPAD_SUBMODELS_MAP[currentSeriesTag] || [] : [];

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    let items = [...dbProducts];

    items = items.filter((i) => (i.name || '').toLowerCase().includes('ipad'));

    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase();
      if (lowerFilter.includes('pro')) {
        items = items.filter((i) => i.searchIndex.includes('pro'));
      } else if (lowerFilter.includes('air')) {
        items = items.filter((i) => i.searchIndex.includes('air'));
      } else if (lowerFilter.includes('mini')) {
        items = items.filter((i) => i.searchIndex.includes('mini'));
      } else if (lowerFilter.includes('gen')) {
        items = items.filter(
          (i) =>
            i.searchIndex.includes('gen') ||
            (!i.searchIndex.includes('pro') && !i.searchIndex.includes('air') && !i.searchIndex.includes('mini'))
        );
      }

      if (lowerFilter.includes('m4')) items = items.filter((i) => i.searchIndex.includes('m4'));
      if (lowerFilter.includes('m2')) items = items.filter((i) => i.searchIndex.includes('m2'));
      if (lowerFilter.includes('10')) items = items.filter((i) => i.searchIndex.includes('10'));
      if (lowerFilter.includes('9')) items = items.filter((i) => i.searchIndex.includes('9'));
      if (lowerFilter.includes('7')) items = items.filter((i) => i.searchIndex.includes('7'));
      if (lowerFilter.includes('6')) items = items.filter((i) => i.searchIndex.includes('6'));
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

  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'ipad-pro':
      case 'pro':
        return 'iPad Pro';
      case 'ipad-air':
      case 'air':
        return 'iPad Air';
      case 'ipad-gen':
      case 'gen':
        return 'iPad Gen';
      case 'ipad-mini':
      case 'mini':
        return 'iPad Mini';
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

  // Cấu hình 2 Banner đôi (ưu tiên Admin)
  const banner1 = adminBanners[0] || {
    name: 'iPad Pro Thế Hệ Mới',
    subtitle: 'Mỏng siêu thực. Sức mạnh AI không giới hạn.',
    tag: 'Sẵn hàng Giá tốt nhất',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: displayTitle,
    subtitle: 'Chính hãng Apple VN/A - Bảo hành 1 đổi 1',
    tag: 'Trả trước 0đ - Lãi suất 0%',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80',
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
          {/* BANNER ĐÔI TRANG IPAD (CẬP NHẬT ĐỘNG TỪ ADMIN) */}
          <div className="relative mb-6 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-sm bg-gradient-to-r from-[#f3f5f8] to-[#e7ebf0] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>{banner1.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">{banner1.subtitle}</p>
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
                    href={isAllButton ? '/ipad' : `/ipad?series=${series.queryTag}`}
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
                        src={series.imageUrl}
                        alt={series.name}
                        className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-xs"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-2 ${
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

          {/* HÀNG NHẢY MODEL CON NẾU ĐANG CHỌN 1 DÒNG MÁY */}
          {activeSubmodels.length > 0 && (
            <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {activeSubmodels.map((m) => {
                const isSubSelected = currentFilter === m.tag;
                return (
                  <Link
                    key={m.tag}
                    href={`/ipad?series=${m.tag}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      isSubSelected
                        ? 'bg-[#d70018] text-white border-[#d70018] shadow-sm scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#d70018] hover:text-[#d70018]'
                    }`}
                  >
                    {m.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* TIÊU ĐỀ & BỘ LỌC */}
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
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={true}
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
              <Link href="/ipad" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả iPad
              </Link>
            </div>
          )}

          {/* ========================================================= */}
          {/* BÀI VIẾT SEO CHÂN TRANG IPAD (LẤY ĐỘNG TỪ TRANG ADMIN)     */}
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

          {/* CHÂN TRANG TIN TỨC VÀ SẢN PHẨM VỪA XEM */}
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