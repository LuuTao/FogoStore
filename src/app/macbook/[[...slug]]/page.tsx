'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, ShoppingCart, CreditCard, Wallet, Percent } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MACBOOK_HELPFUL_NEWS } from '@/data/macbookCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

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

// 1. Giữ chuẩn 100% đầy đủ 4 tab lớn MacBook
const DEFAULT_MACBOOK_SERIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=150',
    queryTag: null,
  },
  {
    name: 'MacBook Pro',
    slug: 'macbook-pro',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=150',
    queryTag: 'pro',
  },
  {
    name: 'MacBook Air',
    slug: 'macbook-air',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_3_ae4b6b83d56744018803cb8c1211dc15_large_2b8556643ad34d4bbc8c1aae0d5e25ce_master.jpg?w=150',
    queryTag: 'air',
  },
  {
    name: 'MacBook Neo',
    slug: 'macbook-neo',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/mbn-vang_01c8b19230654bdbb81f87daae826525_master.jpg?w=150',
    queryTag: 'neo',
  },
];

const MACBOOK_SUBMODELS_MAP: Record<string, SubModelItem[]> = {
  pro: [
    {
      name: 'MacBook Pro M5',
      tag: 'pro-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=150',
    },
    {
      name: 'MacBook Pro M4',
      tag: 'pro-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=150',
    },
    {
      name: 'MacBook Pro M3',
      tag: 'pro-m3',
      img: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=150',
    },
    {
      name: 'MacBook Pro M2',
      tag: 'pro-m2',
      img: 'https://product.hstatic.net/200000768357/product/color_64cbaa85726e49dab23ec2a848b54521_master.png?w=150',
    },
    {
      name: 'MacBook Pro M1',
      tag: 'pro-m1',
      img: 'https://product.hstatic.net/200000768357/product/gray_9303e56f1307413da72dfe5a4826b5f2_master.png?w=150',
    },
  ],
  air: [
    {
      name: 'MacBook Air M5',
      tag: 'air-m5',
      img: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_3_ae4b6b83d56744018803cb8c1211dc15_large_2b8556643ad34d4bbc8c1aae0d5e25ce_master.jpg?w=150',
    },
    {
      name: 'MacBook Air M4',
      tag: 'air-m4',
      img: 'https://cdn.hstatic.net/products/200000768357/acbook-air-m5-starlight-gia-re_60f0d7d0a60f4ce3af41eecce1fb680c_master_1ac5ec3477844421bb8fb62b6a3af448_master.png?w=150',
    },
    {
      name: 'MacBook Air M3',
      tag: 'air-m3',
      img: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_10_792652cbafb04dfba6e6ca428ebf159b_large_95b5ce2b3ecc4ad8947d823544eff163_master.jpeg?w=150',
    },
    {
      name: 'MacBook Air M2',
      tag: 'air-m2',
      img: 'https://product.hstatic.net/200000768357/product/hinh_anh_17_d0d916bb3df444d0aa6b013449985c07_master.jpeg?w=150',
    },
    {
      name: 'MacBook Air M1',
      tag: 'air-m1',
      img: 'https://product.hstatic.net/200000768357/product/gray_643bc60631144e5690acfcc271e05901_master.png?w=150',
    },
  ],
  neo: [
    {
      name: 'MacBook NEO (2026)',
      tag: 'neo-2026',
      img: 'https://cdn.hstatic.net/products/200000768357/mbn-vang_01c8b19230654bdbb81f87daae826525_master.jpg?w=150',
    },
  ],
};

const DEFAULT_MACBOOK_SEO_TEXT = `MacBook là dòng máy tính xách tay cao cấp được phát triển bởi Apple Inc., nổi bật với ngôn ngữ thiết kế nhôm nguyên khối sang trọng, màn hình Retina/Liquid Retina XDR tuyệt mỹ và thời lượng pin bền bỉ ấn tượng. Với sự đột phá từ kiến trúc Apple Silicon M-Series, MacBook mang lại trải nghiệm tối ưu hiệu năng trên từng watt điện năng.`;

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
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

const buildProductNameWithStorage = (originalName: string, storage: string): string => {
  if (!storage) return originalName;
  const upperStorage = storage.toUpperCase();
  let clean = originalName.replace(new RegExp(`\\b${upperStorage}\\b`, 'gi'), '').trim();

  const matchSuffix = clean.match(/(Chính Hãng.*|New Seal.*|CPO.*|Chưa Active.*|Đã Kích Hoạt.*)$/i);
  if (matchSuffix) {
    const mainTitle = clean.substring(0, matchSuffix.index).trim();
    const suffix = matchSuffix[0].trim();
    return `${mainTitle} ${upperStorage} ${suffix}`;
  }

  return `${clean} ${upperStorage}`;
};

export default function DynamicMacBookPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [rawDbProducts, setRawDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_MACBOOK_SERIES);

  const [seoContent, setSeoContent] = useState<string>(DEFAULT_MACBOOK_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  // ĐÃ SỬA: Lấy chính xác slug từ URL (ví dụ /macbook/macbook-pro-m5 hoặc ?series=pro-m5)
  const slugArray = (params?.slug as string[]) || [];
  const rawParam = slugArray.join('/') || searchParams?.get('series') || '';
  const currentFilter = (rawParam || '').toLowerCase().trim();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const macBanners = parsed.filter((it: any) => it.group === 'macbook_banners');
          if (macBanners.length > 0) setAdminBanners(macBanners);

          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_macbook' && it.name.toLowerCase() !== 'tất cả'
          );

          if (adminSubs.length > 0) {
            const merged = DEFAULT_MACBOOK_SERIES.map((tab) => {
              if (!tab.queryTag) return tab;
              const match = adminSubs.find((s: any) => {
                const sName = (s.name || '').toLowerCase();
                return sName.includes(tab.queryTag!);
              });
              return match ? { ...tab, name: match.name, imageUrl: match.imageUrl || tab.imageUrl } : tab;
            });
            setSeriesTabs(merged);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cấu hình banner MacBook:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_macbook_seo_desc');
      if (savedSeo && savedSeo.trim()) setSeoContent(savedSeo);
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO MacBook:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  useEffect(() => {
    const fetchLiveMacbook = async () => {
      try {
        setLoading(true);
        let res = await fetch(`${API_URL}/api/products/filter?category=macbook`, { cache: 'no-store' });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const macItems = itemsList.filter((item: any) => {
          const lower = (item.name || '').toLowerCase();
          const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
          return cat.includes('mac') || lower.includes('macbook');
        });

        setRawDbProducts(macItems);
      } catch (err) {
        console.error('Lỗi khi fetch MacBook từ API:', err);
        setRawDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMacbook();
  }, []);

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
        const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';
        const finalName = buildProductNameWithStorage(prod.name, stKey);
        const hasPrice = curPrice > 0;

        result.push({
          id: prod.id,
          variantId: v.id || prod.id,
          name: finalName,
          rawName: prod.name,
          modelSlug: prod.slug,
          slug: `${prod.slug}${slugSuffix}`,
          href: `/san-pham/${prod.slug}${slugSuffix}`,
          currentPrice: formatVndPrice(curPrice),
          originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
          rawPrice: curPrice,
          storage: stKey,
          color: v.color || '',
          discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
          imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
          statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
        });
      } else {
        storageMap.forEach((varList, stKey) => {
          const v = varList[0];
          const curPrice = Number(v.price || prod.price || 0);
          const origPrice = Number(v.originalPrice || prod.originalPrice || Math.round(curPrice * 1.15));
          const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';
          const finalName = buildProductNameWithStorage(prod.name, stKey);
          const hasPrice = curPrice > 0;

          result.push({
            id: `${prod.id}-${stKey || 'base'}`,
            variantId: v.id || `${prod.id}-${stKey}`,
            name: finalName,
            rawName: prod.name,
            modelSlug: prod.slug,
            slug: `${prod.slug}${slugSuffix}`,
            href: `/san-pham/${prod.slug}${slugSuffix}`,
            currentPrice: formatVndPrice(curPrice),
            originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
            rawPrice: curPrice,
            storage: stKey,
            color: v.color || '',
            discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
            imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
            statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
          });
        });
      }
    });

    return result;
  }, [rawDbProducts]);

  // Nhận diện dòng cha: Pro, Air hay Neo
  const currentSeriesTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('pro')) return 'pro';
    if (currentFilter.includes('air')) return 'air';
    if (currentFilter.includes('neo')) return 'neo';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentSeriesTag ? MACBOOK_SUBMODELS_MAP[currentSeriesTag] || [] : [];

  // Lọc sản phẩm chuẩn xác theo model
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    items = items.filter((i) => {
      const lowerName = (i.name || '').toLowerCase();
      return lowerName.includes('macbook') || lowerName.includes('mac mini');
    });

    if (currentFilter) {
      const f = currentFilter.toLowerCase();
      
      if (f.includes('pro')) {
        items = items.filter((i) => {
          const nameLower = (i.name || '').toLowerCase();
          return nameLower.includes('pro') && !nameLower.includes('air');
        });
        if (f.includes('m5')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m5'));
        else if (f.includes('m4')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m4'));
        else if (f.includes('m3')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m3'));
        else if (f.includes('m2')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m2'));
        else if (f.includes('m1')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m1'));
      } else if (f.includes('air')) {
        items = items.filter((i) => {
          const nameLower = (i.name || '').toLowerCase();
          return nameLower.includes('air') && !nameLower.includes('pro');
        });
        if (f.includes('m5')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m5'));
        else if (f.includes('m4')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m4'));
        else if (f.includes('m3')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m3'));
        else if (f.includes('m2')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m2'));
        else if (f.includes('m1')) items = items.filter((i) => (i.name || '').toLowerCase().includes('m1'));
      } else if (f.includes('neo')) {
        items = items.filter((i) => (i.name || '').toLowerCase().includes('neo'));
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

  const displayTitle = useMemo(() => {
    const f = currentFilter.toLowerCase();
    if (f.includes('pro-m5')) return 'MacBook Pro M5';
    if (f.includes('pro-m4')) return 'MacBook Pro M4';
    if (f.includes('pro-m3')) return 'MacBook Pro M3';
    if (f.includes('pro-m2')) return 'MacBook Pro M2';
    if (f.includes('pro-m1')) return 'MacBook Pro M1';
    if (f.includes('pro')) return 'MacBook Pro';

    if (f.includes('air-m5')) return 'MacBook Air M5';
    if (f.includes('air-m4')) return 'MacBook Air M4';
    if (f.includes('air-m3')) return 'MacBook Air M3';
    if (f.includes('air-m2')) return 'MacBook Air M2';
    if (f.includes('air-m1')) return 'MacBook Air M1';
    if (f.includes('air')) return 'MacBook Air';

    if (f.includes('neo')) return 'MacBook NEO (2026)';

    return currentFilter
      ? currentFilter
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
          .replace('Macbook', 'MacBook')
      : 'Tất cả sản phẩm MacBook';
  }, [currentFilter]);

  const handleAddToCartQuick = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.rawPrice <= 0) return;

    addToCart({
      id: product.variantId,
      name: product.name,
      modelSlug: product.modelSlug,
      price: product.rawPrice,
      originalPrice: parsePrice(product.originalPrice) || product.rawPrice,
      storage: product.storage,
      color: product.color || 'Tiêu chuẩn',
      imageUrl: product.imageUrl,
      quantity: 1,
    });

    setToast({
      show: true,
      message: `Đã thêm ${product.name} vào giỏ hàng!`,
    });
  };

  const banner1 = adminBanners[0] || {
    name: 'MacBook Pro M5 / M4',
    link: '/macbook',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: displayTitle,
    link: '/macbook',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&h=200&q=80',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

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
          {/* BANNER ĐÔI */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={banner1.link || '/macbook'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              <Link
                href={banner2.link || '/macbook'}
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

          {/* HÀNG SERIES CHA */}
          <div className="my-6 py-2 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full px-2">
              {seriesTabs.map((series, idx) => {
                const isAllButton = series.queryTag === null;
                const isSelected = isAllButton
                  ? !currentFilter
                  : (series.queryTag && currentFilter.includes(series.queryTag)) ||
                    (series.slug && currentFilter.includes(series.slug));

                return (
                  <Link
                    key={series.slug || idx}
                    href={isAllButton ? '/macbook' : `/macbook/${series.slug || `macbook-${series.queryTag}`}`}
                    className="group flex flex-col items-center gap-2 cursor-pointer w-[76px] sm:w-[90px] md:w-[105px] transition-transform active:scale-95 shrink-0"
                  >
                    <div
                      className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
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
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-1 w-full ${
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

          {/* HÀNG SUBMODEL CON - ĐÃ SỬA TICK ACTIVE CHUẨN XÁC */}
          {activeSubmodels.length > 0 && (
            <div className="mb-8 pt-3 pb-3 border-t border-dashed border-gray-200 w-full">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-6 w-full px-2">
                {activeSubmodels.map((model) => {
                  // ĐÃ SỬA: Dùng includes để dù là "pro-m5" hay "macbook-pro-m5" đều nhận đúng active
                  const isSubSelected = currentFilter.includes(model.tag) || (model.tag.includes('-') && currentFilter.includes(model.tag.split('-')[1]));

                  return (
                    <Link
                      key={model.tag}
                      href={`/macbook/${model.tag.startsWith('macbook-') ? model.tag : `macbook-${model.tag}`}`}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer w-[72px] sm:w-[84px] md:w-[96px] transition-transform active:scale-95 shrink-0"
                    >
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full p-1.5 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
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
                        className={`text-[11px] sm:text-xs font-medium text-center transition-colors line-clamp-2 leading-tight w-full break-words ${
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
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} phiên bản cấu hình phù hợp`}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5 mb-14">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-3 flex flex-col justify-between min-h-[360px] animate-pulse rounded-lg border border-gray-100"
                >
                  <div className="w-10 h-4 bg-gray-100 mb-2" />
                  <div className="w-full aspect-square bg-gray-50 my-2 rounded" />
                  <div className="w-full h-4 bg-gray-100 mt-2" />
                  <div className="w-3/4 h-4 bg-gray-100 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5 mb-14">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg p-2 sm:p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200 group border border-gray-200/90 w-full overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between h-4 sm:h-5">
                      <span className="bg-[#d70018] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-xs">
                        -{product.discountPercent}%
                      </span>
                      <span />
                    </div>

                    <Link
                      href={product.href}
                      className="w-full aspect-square my-1.5 sm:my-2 flex items-center justify-center bg-white overflow-hidden"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80';
                        }}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs pointer-events-none"
                      />
                    </Link>

                    <Link
                      href={product.href}
                      className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[32px] sm:min-h-[36px] leading-tight"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="mt-1.5">
                    <div className="bg-[#fff1f2] border border-[#ffccd2] rounded-xs py-1 px-1 sm:px-1.5 flex items-center justify-between text-[#d70018]">
                      <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <CreditCard size={10} className="shrink-0 sm:w-3 sm:h-3" />
                        <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black tracking-tighter truncate">
                          Trả góp
                        </span>
                      </div>

                      <span className="text-gray-300 font-light text-[8px] sm:text-[10px] shrink-0">|</span>

                      <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <Wallet size={10} className="shrink-0 sm:w-3 sm:h-3" />
                        <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black tracking-tighter truncate">
                          Trả trước
                        </span>
                      </div>

                      <span className="text-gray-300 font-light text-[8px] sm:text-[10px] shrink-0">|</span>

                      <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <Percent size={9} className="shrink-0 sm:w-2.5 sm:h-2.5" />
                        <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black tracking-tighter truncate">
                          Phí
                        </span>
                      </div>
                    </div>

                    <span className="mt-1 bg-[#ffe8e8] text-[#d70018] text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-xs w-fit block">
                      {product.statusTag}
                    </span>

                    <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                      <span className="font-black text-[#d70018] text-xs sm:text-sm md:text-base leading-none">
                        {product.currentPrice}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through leading-none">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      {product.rawPrice > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => handleAddToCartQuick(e, product)}
                          className="w-full py-1.5 sm:py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-md text-[10px] sm:text-[11px] md:text-xs font-bold uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          <ShoppingCart size={11} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">Thêm Giỏ Hàng</span>
                        </button>
                      ) : (
                        <a
                          href="tel:0566003333"
                          className="w-full py-1.5 sm:py-2 border border-gray-300 hover:border-[#d70018] text-gray-700 hover:text-[#d70018] rounded-md text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center transition-colors"
                        >
                          Liên Hệ Báo Giá
                        </a>
                      )}
                    </div>
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

          {/* BÀI VIẾT SEO */}
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

          {/* CHÂN TRANG TIN TỨC & VỪA XEM */}
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