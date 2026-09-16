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

interface SubModelItem {
  name: string;
  tag: string;
  img: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// 1. Danh sách Series iPad mặc định
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

// 2. Danh mục sub-model con
const IPAD_SUBMODELS_MAP: Record<string, SubModelItem[]> = {
  pro: [
    {
      name: 'iPad Pro M5',
      tag: 'pro-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?w=150',
    },
    {
      name: 'iPad Pro M4',
      tag: 'pro-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/a56e64526860d147af5df6287_large_f538544de8084063b01cb8240d390313_large_17deb5f948f94a1e99117511b49ebcba_master.webp?w=150',
    },
    {
      name: 'iPad Pro M2',
      tag: 'pro-m2',
      img: 'https://product.hstatic.net/200000768357/product/ipad_pro_m2_-_11_inch__colors__c4189cc924bb40b181351e979df29f64_master.png?w=150',
    },
  ],
  air: [
    {
      name: 'iPad Air M4',
      tag: 'air',
      img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?w=150',
    },
    {
      name: 'iPad Air 7',
      tag: 'air-7',
      img: 'https://cdn.hstatic.net/products/200000768357/air7-color_2326bc48c0054009ba361f7de1df2cd8_master.jpg?w=150',
    },
    {
      name: 'iPad Air 6',
      tag: 'air-6',
      img: 'https://product.hstatic.net/200000768357/product/ipad_air_5__colors__06251c7b63d5478188404b205b5b5fdb_master.png?w=150',
    },
    {
      name: 'iPad Air 5',
      tag: 'air-5',
      img: 'https://product.hstatic.net/200000768357/product/ipad_air_5__colors__06251c7b63d5478188404b205b5b5fdb_master.png?w=150',
    },
  ],
  gen: [
    {
      name: 'iPad Gen 11',
      tag: 'gen-11',
      img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_30_8234a6ff9e3b48fd9cc8571feaf230a7_master.jpeg?w=150',
    },
  ],
  mini: [
    {
      name: 'iPad Mini 7',
      tag: 'mini-7',
      img: 'https://product.hstatic.net/200000768357/product/hinh_anh_12_6ddc1b37c55c4213838c8e5047f59a8c_master.jpeg?w=150',
    },
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

// Hàm định dạng giá tiền: Trả về "Liên hệ" nếu giá <= 0
const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80';
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

export default function DynamicIPadPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [rawDbProducts, setRawDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_IPAD_SERIES);

  const [seoContent, setSeoContent] = useState<string>(DEFAULT_IPAD_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const rawFilter =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawFilter || '').toLowerCase().trim();

  // 1. Nạp cấu hình Banner từ LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ipadBanners = parsed.filter((it: any) => it.group === 'ipad_banners');
          if (ipadBanners.length > 0) setAdminBanners(ipadBanners);

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

  // 2. Nạp nội dung SEO
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

  // 4. Fetch sản phẩm iPad từ API
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setLoading(true);
        let res = await fetch(`${API_URL}/api/products/filter?category=ipad`, { cache: 'no-store' });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const ipadItems = itemsList.filter((item: any) => {
          const lower = (item.name || '').toLowerCase();
          const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
          return cat.includes('ipad') || lower.includes('ipad');
        });

        setRawDbProducts(ipadItems);
      } catch (err) {
        console.error('Lỗi khi fetch iPad từ API:', err);
        setRawDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();
  }, []);

  // 5. TỰ ĐỘNG PHÂN TÁCH TỪNG DUNG LƯỢNG THÀNH TỪNG CARD SẢN PHẨM RIÊNG BIỆT
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
          searchIndex: `${prod.name} ${stKey} ${prod.description || ''}`.toLowerCase(),
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
            searchIndex: `${prod.name} ${stKey} ${prod.description || ''}`.toLowerCase(),
          });
        });
      }
    });

    return result;
  }, [rawDbProducts]);

  // Nhận diện nhóm dòng máy cha (pro, air, gen, mini)
  const currentSeriesTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('pro') || currentFilter === 'ipad-pro') return 'pro';
    if (currentFilter.startsWith('air') || currentFilter === 'ipad-air') return 'air';
    if (currentFilter.startsWith('gen') || currentFilter === 'ipad-gen') return 'gen';
    if (currentFilter.startsWith('mini') || currentFilter === 'ipad-mini') return 'mini';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesTag ? IPAD_SUBMODELS_MAP[currentSeriesTag] || [] : [];

  // Lọc sản phẩm chính xác theo bộ lọc
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    if (currentFilter) {
      const f = currentFilter.toLowerCase();

      // 1. Phân loại theo nhóm iPad PRO
      if (f.startsWith('pro') || f === 'ipad-pro') {
        items = items.filter((i) => {
          const text = i.searchIndex;
          return text.includes('pro') && !text.includes('air') && !text.includes('mini');
        });

        if (f.includes('m4')) {
          items = items.filter((i) => i.searchIndex.includes('m4'));
        } else if (f.includes('m2')) {
          items = items.filter((i) => i.searchIndex.includes('m2'));
        }
      }
      // 2. Phân loại theo nhóm iPad AIR
      else if (f.startsWith('air') || f === 'ipad-air') {
        items = items.filter((i) => {
          const text = i.searchIndex;
          return text.includes('air') && !text.includes('pro');
        });

        if (f.includes('m2')) {
          items = items.filter((i) => i.searchIndex.includes('m2') || i.searchIndex.includes('air 6'));
        } else if (f.includes('5')) {
          items = items.filter((i) => i.searchIndex.includes('air 5') || i.searchIndex.includes('m1'));
        }
      }
      // 3. Phân loại theo nhóm iPad GEN
      else if (f.startsWith('gen') || f === 'ipad-gen') {
        items = items.filter((i) => {
          const text = i.searchIndex;
          const isNotOthers = !text.includes('pro') && !text.includes('air') && !text.includes('mini');
          return text.includes('gen') || isNotOthers;
        });

        if (f.includes('10')) {
          items = items.filter((i) => i.searchIndex.includes('10'));
        } else if (f.includes('9')) {
          items = items.filter((i) => i.searchIndex.includes('9'));
        }
      }
      // 4. Phân loại theo nhóm iPad MINI
      else if (f.startsWith('mini') || f === 'ipad-mini') {
        items = items.filter((i) => i.searchIndex.includes('mini'));

        if (f.includes('7')) {
          items = items.filter((i) => i.searchIndex.includes('7') || i.searchIndex.includes('a17'));
        } else if (f.includes('6')) {
          items = items.filter((i) => i.searchIndex.includes('6') || i.searchIndex.includes('a15'));
        }
      }
    }

    // Lọc theo khoảng giá
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
  }, [expandedProducts, currentFilter, currentSort, activeFilters]);

  // Tiêu đề hiển thị chuẩn chỉnh đầy đủ chữ "iPad"
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'ipad-pro':
      case 'pro':
        return 'iPad Pro';
      case 'pro-m4':
        return 'iPad Pro M4';
      case 'pro-m2':
        return 'iPad Pro M2';
      case 'ipad-air':
      case 'air':
        return 'iPad Air';
      case 'air-m2':
        return 'iPad Air M2';
      case 'air-5':
        return 'iPad Air 5';
      case 'ipad-gen':
      case 'gen':
        return 'iPad Gen';
      case 'gen-10':
        return 'iPad Gen 10';
      case 'gen-9':
        return 'iPad Gen 9';
      case 'ipad-mini':
      case 'mini':
        return 'iPad Mini';
      case 'mini-7':
        return 'iPad Mini 7';
      case 'mini-6':
        return 'iPad Mini 6';
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

  const banner1 = adminBanners[0] || {
    name: 'iPad Pro M4',
    link: '/ipad',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: displayTitle,
    link: '/ipad',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=600&h=200&q=80',
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
          {/* 1. BANNER ĐÔI THUẦN ẢNH CHUẨN 600x200px */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={banner1.link || '/ipad'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              <Link
                href={banner2.link || '/ipad'}
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
                    currentFilter.startsWith(series.queryTag || '') ||
                    (series.slug && currentFilter.includes(series.slug));

                return (
                  <Link
                    key={series.slug || idx}
                    href={isAllButton ? '/ipad' : `/ipad?series=${series.queryTag}`}
                    className="group flex flex-col items-center gap-2 cursor-pointer max-w-[95px] sm:max-w-[110px] transition-transform active:scale-95"
                  >
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'border-2 border-[#d70018] shadow-md shadow-red-100 scale-105 ring-2 ring-red-100/50'
                          : 'border-2 border-transparent hover:border-gray-200 bg-[#f8f9fa] shadow-2xs'
                      }`}
                    >
                      <img
                        src={series.imageUrl}
                        alt={series.name}
                        className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-2xs"
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
                      href={`/ipad?series=${model.tag}`}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer max-w-[85px] sm:max-w-[95px] transition-transform active:scale-95"
                    >
                      <div
                        className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full p-1.5 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
                          isSubSelected
                            ? 'border-2 border-[#d70018] shadow-sm shadow-red-100 scale-105 ring-2 ring-red-100/50'
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
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} phiên bản phù hợp`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={true}
            />
          </div>

          {/* LƯỚI SẢN PHẨM HIỂN THỊ CHI TIẾT TỪNG PHIÊN BẢN DUNG LƯỢNG */}
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
                          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80';
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào thuộc mục này trong kho.</p>
              <Link href="/ipad" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả iPad
              </Link>
            </div>
          )}

          {/* BÀI VIẾT SEO CHÂN TRANG */}
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