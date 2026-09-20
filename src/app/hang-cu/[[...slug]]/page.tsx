'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CornerDownLeft, ChevronDown, ChevronUp, ShoppingCart, CreditCard, Wallet, Percent } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { USED_HELPFUL_NEWS } from '@/data/usedCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

interface SeriesTabItem {
  name: string;
  slug?: string;
  img: string;
  queryTag: string | null;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// 1. Danh mục cấp 1 mặc định
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

// 2. Danh mục cấp 2 chi tiết
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

const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&q=80';
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

  const matchSuffix = clean.match(/(Cũ.*|Like New.*|99%.*|98%.*|Chính Hãng.*|New Seal.*)$/i);
  if (matchSuffix) {
    const mainTitle = clean.substring(0, matchSuffix.index).trim();
    const suffix = matchSuffix[0].trim();
    return `${mainTitle} ${upperStorage} ${suffix}`;
  }

  return `${clean} ${upperStorage}`;
};

export default function DynamicUsedPage() {
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
  const [categories, setCategories] = useState<SeriesTabItem[]>(DEFAULT_USED_CATEGORIES);

  const [seoContent, setSeoContent] = useState<string>(DEFAULT_USED_SEO_TEXT);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const slugParam = params?.slug;
  const rawParam =
    (Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)) ||
    searchParams?.get('series') ||
    '';
  const currentFilter = (rawParam || '').toLowerCase().trim();

  // 1. Nạp Banner & Danh mục an toàn (không ghi đè mất tab)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const usedBanners = parsed.filter((it: any) => it.group === 'hang_cu_banners');
          if (usedBanners.length > 0) setAdminBanners(usedBanners);

          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_hang_cu' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const merged = DEFAULT_USED_CATEGORIES.map((tab) => {
              if (!tab.queryTag) return tab;
              const match = adminSubs.find((s: any) => {
                const sName = (s.name || '').toLowerCase();
                return sName.includes(tab.queryTag!);
              });
              return match ? { ...tab, name: match.name, img: match.imageUrl || tab.img } : tab;
            });
            setCategories(merged);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp cấu hình banner Hàng Cũ:', e);
    }
  }, []);

  // 2. Nạp nội dung SEO Hàng Cũ
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem('fogo_seo_hang_cu_seo_desc');
      if (savedSeo && savedSeo.trim()) setSeoContent(savedSeo);
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

  // 4. Fetch danh sách sản phẩm từ API
  useEffect(() => {
    const fetchLiveUsedProducts = async () => {
      try {
        setLoading(true);
        let res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
        let json = await res.json();

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        // Lọc lấy sản phẩm máy cũ / đã qua sử dụng
        const usedItems = itemsList.filter((item: any) => {
          const lowerName = (item.name || '').toLowerCase();
          const catName = (item.category?.name || item.category?.slug || '').toLowerCase();

          const isExplicitUsed =
            lowerName.includes('cũ') ||
            lowerName.includes('like new') ||
            lowerName.includes('likenew') ||
            lowerName.includes('99%') ||
            lowerName.includes('98%') ||
            lowerName.includes('qua sử dụng') ||
            item.isUsed === true ||
            catName.includes('cũ') ||
            catName.includes('hang-cu');

          const isAccessory =
            lowerName.includes('củ sạc') ||
            lowerName.includes('cáp sạc') ||
            lowerName.includes('dock sạc') ||
            lowerName.includes('ốp lưng') ||
            lowerName.includes('tai nghe');

          return isExplicitUsed && !isAccessory;
        });

        setRawDbProducts(
          usedItems.length > 0
            ? usedItems
            : itemsList.filter((p: any) => !(p.name || '').toLowerCase().includes('new seal'))
        );
      } catch (err) {
        console.error('Lỗi khi fetch hàng cũ từ API:', err);
        setRawDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveUsedProducts();
  }, []);

  // 5. Tự động phân tách cấu hình thành thẻ riêng biệt
  const expandedProducts = useMemo(() => {
    const result: any[] = [];

    rawDbProducts.forEach((prod) => {
      const variants: any[] = Array.isArray(prod.variants) ? prod.variants : [];

      const lower = (prod.name || '').toLowerCase();
      const cat = (prod.category?.slug || prod.category?.name || '').toLowerCase();

      let deviceType: 'iphone' | 'ipad' | 'macbook' = 'iphone';
      if (lower.includes('macbook') || lower.includes('mac mini') || cat.includes('mac')) {
        deviceType = 'macbook';
      } else if (lower.includes('ipad') || cat.includes('ipad')) {
        deviceType = 'ipad';
      } else if (lower.includes('iphone') || cat.includes('iphone')) {
        deviceType = 'iphone';
      }

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
          deviceType,
          currentPrice: formatVndPrice(curPrice),
          originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
          rawPrice: curPrice,
          storage: stKey,
          color: v.color || '',
          discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 12,
          imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
          statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
          conditionTag: '99% Zin Đẹp',
          searchIndex: `${prod.name} ${stKey} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
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
            deviceType,
            currentPrice: formatVndPrice(curPrice),
            originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
            rawPrice: curPrice,
            storage: stKey,
            color: v.color || '',
            discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 12,
            imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
            statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
            conditionTag: '99% Zin Đẹp',
            searchIndex: `${prod.name} ${stKey} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
          });
        });
      }
    });

    return result;
  }, [rawDbProducts]);

  const currentCategoryKey = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.startsWith('iphone')) return 'iphone-cu';
    if (currentFilter.startsWith('ipad')) return 'ipad-cu';
    if (currentFilter.startsWith('macbook')) return 'macbook-cu';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentCategoryKey ? USED_SUBMODELS_MAP[currentCategoryKey] || [] : null;

  // Lọc sản phẩm máy cũ chính xác theo danh mục và thế hệ
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    if (currentFilter) {
      const slug = currentFilter.toLowerCase();

      if (slug.startsWith('iphone')) {
        items = items.filter((i) => i.deviceType === 'iphone');
        if (slug.includes('17')) items = items.filter((i) => i.searchIndex.includes('17'));
        else if (slug.includes('16')) items = items.filter((i) => i.searchIndex.includes('16'));
        else if (slug.includes('15')) items = items.filter((i) => i.searchIndex.includes('15'));
        else if (slug.includes('14')) items = items.filter((i) => i.searchIndex.includes('14'));
      } else if (slug.startsWith('ipad')) {
        items = items.filter((i) => i.deviceType === 'ipad');
        if (slug.includes('pro')) items = items.filter((i) => i.searchIndex.includes('pro') && !i.searchIndex.includes('air'));
        else if (slug.includes('air')) items = items.filter((i) => i.searchIndex.includes('air') && !i.searchIndex.includes('pro'));
        else if (slug.includes('mini')) items = items.filter((i) => i.searchIndex.includes('mini'));
        else if (slug.includes('gen')) items = items.filter((i) => i.searchIndex.includes('gen') || (!i.searchIndex.includes('pro') && !i.searchIndex.includes('air') && !i.searchIndex.includes('mini')));
      } else if (slug.startsWith('macbook')) {
        items = items.filter((i) => i.deviceType === 'macbook');
        if (slug.includes('pro')) items = items.filter((i) => i.searchIndex.includes('pro'));
        else if (slug.includes('air')) items = items.filter((i) => i.searchIndex.includes('air'));
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

    if (activeFilters.storage) {
      const storeVal = activeFilters.storage.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(storeVal));
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
    switch (currentFilter) {
      case 'iphone-cu': return 'iPhone Cũ Like New 99%';
      case 'ipad-cu': return 'iPad Cũ Like New 99%';
      case 'macbook-cu': return 'MacBook Cũ Like New 99%';
      case 'iphone-17-series-cu': return 'iPhone 17 Series Cũ';
      case 'iphone-16-series-cu': return 'iPhone 16 Series Cũ';
      case 'iphone-15-series-cu': return 'iPhone 15 Series Cũ';
      case 'iphone-14-series-cu': return 'iPhone 14 Series Cũ';
      case 'ipad-pro-cu': return 'iPad Pro Cũ';
      case 'ipad-air-cu': return 'iPad Air Cũ';
      case 'ipad-gen-cu': return 'iPad Gen Cũ';
      case 'ipad-mini-cu': return 'iPad Mini Cũ';
      case 'macbook-pro-cu': return 'MacBook Pro Cũ';
      case 'macbook-air-cu': return 'MacBook Air Cũ';
      default: return 'Máy Cũ Tuyển Chọn - Thu Cũ Đổi Mới';
    }
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
          {/* 1. BANNER ĐÔI THUẦN ẢNH */}
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

          {/* 2. HÀNG DANH MỤC CHA: TỰ ĐỘNG XUỐNG DÒNG (FLEX-WRAP) */}
          <div className="my-6 py-2 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full px-2">
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
                    className="group flex flex-col items-center gap-2 cursor-pointer w-[76px] sm:w-[90px] md:w-[105px] transition-transform active:scale-95 shrink-0"
                  >
                    <div
                      className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-2.5 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-2 border-[#d70018] shadow-md shadow-red-100 bg-white scale-105 ring-2 ring-red-100/50'
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
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors line-clamp-1 w-full ${
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

          {/* 3. HÀNG SUBMODEL CON: TỰ ĐỘNG XUỐNG DÒNG (FLEX-WRAP) */}
          {activeSubmodels && activeSubmodels.length > 0 && (
            <div className="mb-8 pt-3 pb-3 border-t border-dashed border-gray-200 w-full">
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-6 w-full px-2">
                  {activeSubmodels.map((model) => {
                    const isSelected = currentFilter === model.slug;
                    return (
                      <Link
                        key={model.slug}
                        href={`/hang-cu/${model.slug}`}
                        className="group flex flex-col items-center gap-1.5 cursor-pointer w-[72px] sm:w-[84px] md:w-[96px] transition-transform active:scale-95 shrink-0"
                      >
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full p-2 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                            isSelected
                              ? 'border-2 border-[#d70018] shadow-sm shadow-red-100 bg-white scale-105 ring-2 ring-red-100/50'
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

          {/* TIÊU ĐỀ & BỘ LỌC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} phiên bản cấu hình tuyển chọn`}
              </p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={currentCategoryKey === 'macbook-cu' || currentCategoryKey === 'ipad-cu'}
            />
          </div>

          {/* LƯỚI SẢN PHẨM: CO GIÃN CHUẨN TỶ LỆ */}
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
                    {/* TAG GIẢM GIÁ VÀ TÌNH TRẠNG LIKENEW */}
                    <div className="flex items-center justify-between h-4 sm:h-5">
                      {product.rawPrice > 0 ? (
                        <span className="bg-[#d70018] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-xs">
                          -{product.discountPercent}%
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                          Hot
                        </span>
                      )}
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                        {product.conditionTag}
                      </span>
                    </div>

                    {/* KHUNG ẢNH VUÔNG TỰ CO GIÃN */}
                    <Link
                      href={product.href}
                      className="w-full aspect-square my-1.5 sm:my-2 flex items-center justify-center bg-white overflow-hidden cursor-pointer"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80';
                        }}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs pointer-events-none"
                      />
                    </Link>

                    {/* TÊN SẢN PHẨM CỐ ĐỊNH 2 DÒNG */}
                    <Link
                      href={product.href}
                      className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[32px] sm:min-h-[36px] leading-tight cursor-pointer"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="mt-1.5">
                    {/* KHỐI CAM KẾT HÀNG CŨ: 3 TIỆN ÍCH CHUẨN */}
                    {product.rawPrice > 0 ? (
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
                            12T 1 đổi 1
                          </span>
                        </div>

                        <span className="text-gray-300 font-light text-[8px] sm:text-[10px] shrink-0">|</span>

                        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                          <Percent size={9} className="shrink-0 sm:w-2.5 sm:h-2.5" />
                          <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black tracking-tighter truncate">
                            30 Ngày
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xs py-1 px-1.5 text-center">
                        <span className="text-[9px] font-bold text-gray-500 truncate block">
                          Liên hệ nhận báo giá tốt nhất
                        </span>
                      </div>
                    )}

                    {/* NHÃN TRẠNG THÁI */}
                    <span
                      className={`mt-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-xs w-fit block ${
                        product.statusTag === 'Sẵn hàng'
                          ? 'bg-[#ffe8e8] text-[#d70018]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.statusTag}
                    </span>

                    {/* GIÁ BÁN */}
                    <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                      <span className={`font-black text-[#d70018] ${product.rawPrice > 0 ? 'text-xs sm:text-sm md:text-base leading-none' : 'text-xs sm:text-sm'}`}>
                        {product.currentPrice}
                      </span>
                      {product.rawPrice > 0 && product.originalPrice && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through leading-none">{product.originalPrice}</span>
                      )}
                    </div>

                    {/* NÚT THÊM GIỎ HÀNG */}
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm máy cũ nào phù hợp với bộ lọc trong kho.</p>
              <Link href="/hang-cu" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả máy cũ
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