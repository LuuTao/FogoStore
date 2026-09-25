'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ShoppingCart, CreditCard, Wallet, Percent } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';
import { IPhoneSeoContent } from '@/components/category/IPhoneSeoContent';
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

const DEFAULT_IPHONE_SERIES: SeriesTabItem[] = [
  {
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryTag: null,
  },
  {
    name: 'iPhone Duo Series',
    slug: 'iphone-duo',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryTag: 'duo',
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
  {
    name: 'iPhone 15 Series',
    slug: 'iphone-15',
    imageUrl: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    queryTag: '15',
  },
];

const SUB_MODELS_MAP: Record<string, SubModelItem[]> = {
  '18': [
    { name: '18 Pro Max', tag: 'iphone-18-pro-max', img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100' },
    { name: '18 Pro', tag: 'iphone-18-pro', img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100' },
    { name: '18 Plus', tag: 'iphone-18-plus', img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100' },
    { name: 'iPhone 18', tag: 'iphone-18-tieuchuan', img: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100' },
  ],
  '17': [
    { name: '17 Pro Max', tag: 'iphone-17-pro-max', img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100' },
    { name: '17 Pro', tag: 'iphone-17-pro', img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100' },
    { name: '17 Plus', tag: 'iphone-17-plus', img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100' },
    { name: '17 Air', tag: 'iphone-17-air', img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100' },
    { name: 'iPhone 17', tag: 'iphone-17-tieuchuan', img: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100' },
  ],
  '16': [
    { name: '16 Pro Max', tag: 'iphone-16-pro-max', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: '16 Pro', tag: 'iphone-16-pro', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: '16 Plus', tag: 'iphone-16-plus', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: 'iPhone 16', tag: 'iphone-16-tieuchuan', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
  ],
  '15': [
    { name: '15 Pro Max', tag: 'iphone-15-pro-max', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: '15 Pro', tag: 'iphone-15-pro', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: '15 Plus', tag: 'iphone-15-plus', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
    { name: 'iPhone 15', tag: 'iphone-15-tieuchuan', img: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100' },
  ],
  'duo': [
    { name: 'iPhone Duo Series', tag: 'iphone-duo', img: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100' },
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

const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80';
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

const buildProductNameWithStorage = (originalName: string, storage: string, color?: string): string => {
  let result = originalName;
  const upperStorage = storage ? storage.toUpperCase() : '';
  
  if (upperStorage && !result.toUpperCase().includes(upperStorage)) {
    const matchSuffix = result.match(/(Chính Hãng.*|New Seal.*|CPO.*|Chưa Active.*|Đã Kích Hoạt.*)$/i);
    if (matchSuffix) {
      const mainTitle = result.substring(0, matchSuffix.index).trim();
      const suffix = matchSuffix[0].trim();
      result = `${mainTitle} ${upperStorage} ${suffix}`;
    } else {
      result = `${result} ${upperStorage}`;
    }
  }

  if (color && !result.toLowerCase().includes(color.toLowerCase())) {
    result = `${result} - ${color}`;
  }

  return result;
};

export default function DynamicIPhonePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [rawDbProducts, setRawDbProducts] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTabItem[]>(DEFAULT_IPHONE_SERIES);
  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const slugParam = params?.slug;
  const rawSlug = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam as string) || '';
  const queryParam = searchParams?.get('series') || '';
  const currentFilter = (rawSlug || queryParam || '').toLowerCase().trim();

  const currentSeriesTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('duo')) return 'duo';
    const num = currentFilter.match(/\d+/);
    return num ? num[0] : null;
  }, [currentFilter]);

  const subModels = currentSeriesTag ? SUB_MODELS_MAP[currentSeriesTag] || [] : [];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_recent_viewed');
      if (saved) setRecentViewed(JSON.parse(saved));
    } catch (err) {
      console.error('Lỗi đọc recent viewed:', err);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ipBanners = parsed.filter((it: any) => it.group === 'iphone_banners');
          if (ipBanners.length > 0) setAdminBanners(ipBanners);

          const adminSubs = parsed.filter(
            (it: any) => it.group === 'sub_iphone' && it.name.toLowerCase() !== 'tất cả'
          );
          if (adminSubs.length > 0) {
            const merged = DEFAULT_IPHONE_SERIES.map((tab) => {
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
      console.error('Lỗi nạp Submodel iPhone:', e);
    }
  }, []);

  useEffect(() => {
    const fetchIPhoneProducts = async () => {
      try {
        setLoadingDb(true);
        // Gọi API lấy toàn bộ biến thể
        let res = await fetch(`${API_URL}/api/products?all=true&limit=all`, { cache: 'no-store' });
        let json = await res.json();

        const items = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const filtered = items.filter((item: any) => {
          const lower = (item.name || '').toLowerCase();
          const cat = (item.category?.slug || item.category?.name || '').toLowerCase();
          return cat.includes('iphone') || lower.includes('iphone');
        });

        setRawDbProducts(filtered);
      } catch (err) {
        console.error('Lỗi khi fetch iPhone:', err);
        setRawDbProducts([]);
      } finally {
        setLoadingDb(false);
      }
    };

    fetchIPhoneProducts();
  }, []);

  // Bung chi tiết toàn bộ các biến thể dung lượng/màu sắc (giá = 0đ vẫn hiển thị "Liên hệ")
  const expandedProducts = useMemo(() => {
    const result: any[] = [];

    rawDbProducts.forEach((prod) => {
      const variants: any[] = Array.isArray(prod.variants) && prod.variants.length > 0
        ? prod.variants
        : [{ price: prod.price || 0, images: prod.images }];

      variants.forEach((v, vIdx) => {
        const curPrice = Number(v.price !== undefined ? v.price : (prod.price || 0));
        const origPrice = Number(v.originalPrice || prod.originalPrice || Math.round(curPrice * 1.15));
        const stKey = (v.storage && String(v.storage).trim()) || '';
        const colorKey = (v.color && String(v.color).trim()) || '';
        const finalName = buildProductNameWithStorage(prod.name, stKey, colorKey);

        // Đường dẫn chính xác trỏ đến biến thể (sử dụng slug của variant hoặc query)
        const targetSlug = v.slug || prod.slug;
        const targetHref = v.slug
          ? `/san-pham/${v.slug}`
          : `/san-pham/${prod.slug}?storage=${encodeURIComponent(stKey)}&color=${encodeURIComponent(colorKey)}`;

        let rawImg = '';
        if (Array.isArray(v.images) && v.images.length > 0) {
          rawImg = v.images[0];
        } else if (typeof v.images === 'string') {
          try {
            const parsed = JSON.parse(v.images);
            rawImg = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            rawImg = v.images;
          }
        } else {
          rawImg = v.imageUrl || prod.imageUrl || prod.thumbnail || prod.image || '/placeholder.png';
        }

        let priorityScore = 0;
        const lowerName = finalName.toLowerCase();
        if (lowerName.includes('18') || lowerName.includes('duo')) priorityScore += 100;
        else if (lowerName.includes('17')) priorityScore += 80;
        else if (lowerName.includes('16')) priorityScore += 50;

        // Ưu tiên biến thể có giá đang bán lên trước biến thể "Liên hệ"
        if (curPrice > 0) priorityScore += 20;

        result.push({
          id: `${prod.id}-${v.id || vIdx}`,
          variantId: v.id || `${prod.id}-${stKey}`,
          name: finalName,
          slug: targetSlug,
          modelSlug: prod.slug,
          href: targetHref,
          currentPrice: formatVndPrice(curPrice),
          originalPrice: curPrice > 0 && origPrice > curPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
          rawPrice: curPrice,
          storage: stKey,
          color: colorKey,
          priorityScore,
          createdAt: prod.createdAt ? new Date(prod.createdAt).getTime() : 0,
          discountPercent: curPrice > 0 && origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 0,
          imageUrl: formatProductImageUrl(rawImg),
          statusTag: curPrice > 0 ? 'Sẵn hàng' : 'Liên hệ',
          searchIndex: `${finalName} ${stKey} ${colorKey} ${prod.slug}`.toLowerCase(),
        });
      });
    });

    return result;
  }, [rawDbProducts]);

  // Bộ lọc sản phẩm: Xử lý chuẩn xác URL "iphone-17-series" và toàn bộ các dòng con
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    if (currentFilter) {
      const lowerFilter = currentFilter.toLowerCase().trim();
      const numMatch = lowerFilter.match(/\d+/);
      const targetNumber = numMatch ? numMatch[0] : null;

      // TRƯỜNG HỢP 1: LỌC THEO THẾ HỆ SỐ (Ví dụ: "17", "18", "16", "15")
      if (targetNumber) {
        // Chỉ giữ lại các sản phẩm có chứa số đời máy (ví dụ chữ "17")
        items = items.filter((i) => {
          const checkStr = `${i.name} ${i.modelSlug || ''} ${i.slug || ''}`.toLowerCase();
          return checkStr.includes(targetNumber);
        });

        // 1. Nếu đang chọn nút "Pro Max"
        if (lowerFilter.includes('pro-max') || lowerFilter.includes('promax')) {
          items = items.filter((i) => {
            const nl = i.name.toLowerCase();
            return nl.includes('pro max') || nl.includes('promax');
          });
        }
        // 2. Nếu đang chọn nút "Pro" (không tính Pro Max)
        else if (lowerFilter.includes('pro') && !lowerFilter.includes('max')) {
          items = items.filter((i) => {
            const nl = i.name.toLowerCase();
            return nl.includes('pro') && !nl.includes('max');
          });
        }
        // 3. Nếu đang chọn nút "Plus"
        else if (lowerFilter.includes('plus')) {
          items = items.filter((i) => i.name.toLowerCase().includes('plus'));
        }
        // 4. Nếu đang chọn nút "Air"
        else if (lowerFilter.includes('air')) {
          items = items.filter((i) => i.name.toLowerCase().includes('air'));
        }
        // 5. Nếu đang chọn nút bản thường / tiêu chuẩn
        else if (lowerFilter.includes('tieuchuan') || lowerFilter.includes('standard')) {
          items = items.filter((i) => {
            const nl = i.name.toLowerCase();
            return !nl.includes('pro') && !nl.includes('plus') && !nl.includes('air');
          });
        }
        // 6. QUAN TRỌNG: NẾU URL LÀ "iphone-17-series" HOẶC "iphone-17" 
        // -> GIỮ NGUYÊN TOÀN BỘ CÁC BẢN CỦA IPHONE 17 (KHÔNG LỌC BỚT GÌ HẾT)
      } 
      // TRƯỜNG HỢP 2: DÒNG IPHONE DUO
      else if (lowerFilter.includes('duo')) {
        items = items.filter((i) => {
          const checkStr = `${i.name} ${i.modelSlug || ''} ${i.slug || ''}`.toLowerCase();
          return checkStr.includes('duo');
        });
      }
    }

    // Bộ lọc theo khoảng giá
    if (activeFilters.price) {
      items = items.filter((item) => {
        const price = item.rawPrice;
        if (activeFilters.price === 'Dưới 2 triệu') return price < 2000000;
        if (activeFilters.price === 'Từ 2 - 4 triệu') return price >= 2000000 && price <= 4000000;
        if (activeFilters.price === 'Từ 4 - 7 triệu') return price > 4000000 && price <= 7000000;
        if (activeFilters.price === 'Từ 7 - 13 triệu') return price > 7000000 && price <= 13000000;
        if (activeFilters.price === 'Từ 13 - 20 triệu') return price > 13000000 && price <= 20000000;
        if (activeFilters.price === 'Trên 20 triệu') return price > 20000000;
        return true;
      });
    }

    // Bộ lọc theo bộ nhớ
    if (activeFilters.storage) {
      const storeVal = activeFilters.storage.toLowerCase();
      items = items.filter((item) => item.searchIndex.includes(storeVal));
    }

    // Sắp xếp
    items.sort((a, b) => {
      if (currentSort === 'price_asc') return a.rawPrice - b.rawPrice;
      if (currentSort === 'price_desc') return b.rawPrice - a.rawPrice;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return b.createdAt - a.createdAt;
    });

    return items;
  }, [expandedProducts, currentFilter, currentSort, activeFilters]);

  const displayTitle = useMemo(() => {
    if (!currentFilter) return 'Tất cả sản phẩm iPhone';

    const numMatch = currentFilter.match(/\d+/);
    if (numMatch) {
      const num = numMatch[0];
      if (currentFilter.includes('pro-max') || currentFilter.includes('promax')) return `iPhone ${num} Pro Max`;
      if (currentFilter.includes('pro')) return `iPhone ${num} Pro`;
      if (currentFilter.includes('plus')) return `iPhone ${num} Plus`;
      if (currentFilter.includes('air')) return `iPhone ${num} Air`;
      if (currentFilter.includes('tieuchuan')) return `iPhone ${num} Tiêu Chuẩn`;
      return `iPhone ${num} Series`;
    }

    if (currentFilter.includes('duo')) return 'iPhone Duo Series';

    return currentFilter
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace('Iphone', 'iPhone');
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
    name: 'Thế Hệ iPhone Mới Nhất',
    link: '/iphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: 'iPhone Duo Series',
    link: '/iphone/iphone-duo',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&h=200&q=80',
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
          {/* BANNER ĐÔI */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* HÀNG SERIES CHA */}
          <div className="my-6 py-2 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full px-2">
              {seriesTabs.map((series, idx) => {
                const isAllButton = series.queryTag === null;
                const isSelected = isAllButton
                  ? !currentFilter
                  : currentFilter.startsWith(series.slug || '') ||
                    (series.queryTag && currentFilter.includes(`iphone-${series.queryTag}`));

                return (
                  <Link
                    key={series.slug || idx}
                    href={isAllButton ? '/iphone' : `/iphone/${series.slug || `iphone-${series.queryTag}`}`}
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

          {/* SUBMODELS CON */}
          {subModels.length > 0 && (
            <div className="mb-8 pt-3 pb-3 border-t border-dashed border-gray-200 w-full">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-6 w-full px-2">
                {subModels.map((model) => {
                  let isSubSelected = false;
                  if (model.tag.includes('pro-max')) {
                    isSubSelected = currentFilter.includes('pro-max') || currentFilter.includes('promax');
                  } else if (model.tag.includes('pro')) {
                    isSubSelected = currentFilter.includes('pro') && !currentFilter.includes('max');
                  } else if (model.tag.includes('plus')) {
                    isSubSelected = currentFilter.includes('plus');
                  } else if (model.tag.includes('air')) {
                    isSubSelected = currentFilter.includes('air');
                  } else if (model.tag.includes('tieuchuan')) {
                    isSubSelected = currentFilter.includes('tieuchuan') || currentFilter.includes('standard');
                  } else {
                    isSubSelected = currentFilter === model.tag;
                  }

                  return (
                    <Link
                      key={model.tag}
                      href={`/iphone/${model.tag}`}
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

          {/* TIÊU ĐỀ VÀ BỘ LỌC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loadingDb ? 'Đang nạp dữ liệu từ kho...' : `Tìm thấy ${filteredProducts.length} phiên bản phù hợp`}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5 mb-14">
              {Array.from({ length: 10 }).map((_, index) => (
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
                      {product.rawPrice > 0 ? (
                        <span className="bg-[#d70018] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-xs">
                          -{product.discountPercent}%
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                          Hot
                        </span>
                      )}
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
                            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80';
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
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xs py-1 px-1.5 text-center">
                        <span className="text-[9px] font-bold text-gray-500 truncate block">
                          Liên hệ báo giá
                        </span>
                      </div>
                    )}

                    <span
                      className={`mt-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-xs w-fit block ${
                        product.statusTag === 'Sẵn hàng'
                          ? 'bg-[#ffe8e8] text-[#d70018]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.statusTag}
                    </span>

                    <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                      <span className={`font-black text-[#d70018] ${product.rawPrice > 0 ? 'text-xs sm:text-sm md:text-base leading-none' : 'text-xs sm:text-sm'}`}>
                        {product.currentPrice}
                      </span>
                      {product.rawPrice > 0 && product.originalPrice && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through leading-none">{product.originalPrice}</span>
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