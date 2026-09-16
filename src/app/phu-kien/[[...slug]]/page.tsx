'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
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

interface SubModelItem {
  name: string;
  tag: string;
  img: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// 1. Danh mục phụ kiện chính mặc định kèm nút "Tất cả"
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

// 2. Danh mục model con
const ACCESSORY_SUBMODELS_MAP: Record<string, SubModelItem[]> = {
  'sac-cap': [
    {
      name: 'Củ Sạc Nhanh 20W',
      tag: 'sac-20w',
      img: 'https://cdn.hstatic.net/products/200000768357/mw2l3_geo_vn_de11bc805a154184b143c3eb18f4da05_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Củ Sạc Kép 35W',
      tag: 'sac-35w',
      img: 'https://cdn.hstatic.net/products/200000768357/mw2l3_geo_vn_de11bc805a154184b143c3eb18f4da05_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Cáp C to C Dù',
      tag: 'cap-c-to-c',
      img: 'https://cdn.hstatic.net/products/200000768357/mw2l3_geo_vn_de11bc805a154184b143c3eb18f4da05_master.jpeg?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'tai-nghe': [

    {
      name: 'AirPods 4',
      tag: 'airpods-4',
      img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'AirPods Pro 2',
      tag: 'airpods-pro-2',
      img: 'https://product.hstatic.net/200000768357/product/a3_1_42b1bd6f73de43ea8152bb40d71e610d_997dc83fdca54d0fb00c189095d50e21_master.png?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'AirPods Max',
      tag: 'airpods-max',
      img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=150&q=80',
    },
  ],
  'phu-kien-mac': [

    {
      name: 'Apple Pencil Pro',
      tag: 'pencil-pro',
      img: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Magic Keyboard',
      tag: 'magic-keyboard',
      img: 'https://product.hstatic.net/200000768357/product/magic-keyboard-for-ipad-pro-11-inch-m4-white-4-square_medium_344b97d0559244a485169928d75bb5a7_master.jpg?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Magic Mouse 2',
      tag: 'magic-mouse',
      img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80',
    },
  ],
};

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

// Hàm định dạng giá tiền: Trả về "Liên hệ" nếu giá <= 0
const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80';
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

export default function DynamicAccessoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [rawDbProducts, setRawDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentViewed, setRecentViewed] = useState<any[]>([]);

  const [adminBanners, setAdminBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<SeriesTabItem[]>(DEFAULT_ACCESSORY_CATEGORIES);

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
          const accBanners = parsed.filter((it: any) => it.group === 'phu_kien_banners');
          if (accBanners.length > 0) setAdminBanners(accBanners);

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
      if (savedSeo && savedSeo.trim()) setSeoContent(savedSeo);
    } catch (e) {
      console.warn('Lỗi nạp bài viết SEO Phụ Kiện:', e);
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

  // 4. Fetch danh sách phụ kiện từ API Backend
  useEffect(() => {
    const fetchAccessoryFromDB = async () => {
      try {
        setLoading(true);
        let res = await fetch(`${API_URL}/api/products/filter?category=phu-kien`, {
          cache: 'no-store',
        });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
          json = await res.json();
        }

        const itemsList = json.success && Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        // Lọc nghiêm ngặt: Chỉ lấy phụ kiện thật, loại bỏ máy iPhone, iPad, MacBook
        const onlyAccessories = itemsList.filter((item: any) => {
          const lower = (item.name || '').toLowerCase();
          const cat = (item.category?.slug || item.category?.name || '').toLowerCase();

          if (
            (lower.startsWith('iphone') && !lower.includes('ốp') && !lower.includes('kính')) ||
            (lower.startsWith('ipad') && !lower.includes('bút') && !lower.includes('bàn phím') && !lower.includes('bao da') && !lower.includes('dán')) ||
            (lower.startsWith('macbook') && !lower.includes('chuột') && !lower.includes('túi') && !lower.includes('phím'))
          ) {
            return false;
          }

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
            lower.includes('magic mouse') ||
            lower.includes('chuột') ||
            lower.includes('magic keyboard') ||
            lower.includes('bàn phím')
          );
        });

        setRawDbProducts(onlyAccessories);
      } catch (err) {
        console.error('Lỗi khi fetch phụ kiện từ API:', err);
        setRawDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessoryFromDB();
  }, []);

  // 5. TỰ ĐỘNG PHÂN TÁCH BIẾN THỂ DUNG LƯỢNG / CÔNG SUẤT THÀNH TỪNG CARD ĐỘC LẬP
  const expandedProducts = useMemo(() => {
    const result: any[] = [];

    rawDbProducts.forEach((prod) => {
      const variants: any[] = Array.isArray(prod.variants) ? prod.variants : [];

      const lower = (prod.name || '').toLowerCase();
      let accGroup = 'sac-cap';
      if (lower.includes('airpods') || lower.includes('tai nghe') || lower.includes('âm thanh')) {
        accGroup = 'tai-nghe';
      } else if (lower.includes('ốp') || lower.includes('bao da')) {
        accGroup = 'op-lung';
      } else if (lower.includes('kính') || lower.includes('cường lực')) {
        accGroup = 'cuong-luc';
      } else if (lower.includes('pencil') || lower.includes('bàn phím') || lower.includes('magic')) {
        accGroup = 'phu-kien-mac';
      }

      // Gom nhóm variants theo dung lượng / công suất
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
          accGroup,
          currentPrice: formatVndPrice(curPrice),
          originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
          rawPrice: curPrice,
          discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 10,
          imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
          statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
          rating: 5,
          searchIndex: `${prod.name} ${stKey} ${accGroup} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
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
            accGroup,
            currentPrice: formatVndPrice(curPrice),
            originalPrice: hasPrice ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
            rawPrice: curPrice,
            discountPercent: origPrice > curPrice && hasPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 10,
            imageUrl: formatProductImageUrl(v.images?.[0] || prod.imageUrl || prod.image),
            statusTag: hasPrice ? 'Sẵn hàng' : 'Tạm hết hàng',
            rating: 5,
            searchIndex: `${prod.name} ${stKey} ${accGroup} ${prod.description || ''} ${prod.category?.name || ''}`.toLowerCase(),
          });
        });
      }
    });

    return result;
  }, [rawDbProducts]);

  // Nhận diện nhóm phụ kiện cha (sac-cap, tai-nghe, phu-kien-mac)
  const currentCategoryTag = useMemo(() => {
    if (!currentFilter) return null;
    if (currentFilter.includes('sac') || currentFilter.includes('cap')) return 'sac-cap';
    if (currentFilter.includes('tai-nghe') || currentFilter.includes('airpods')) return 'tai-nghe';
    if (currentFilter.includes('mac') || currentFilter.includes('pencil') || currentFilter.includes('phim')) return 'phu-kien-mac';
    return null;
  }, [currentFilter]);

  const activeSubmodels = currentCategoryTag ? ACCESSORY_SUBMODELS_MAP[currentCategoryTag] || [] : [];

  // LỌC SẢN PHẨM CHUẨN XÁC THEO SUBMODEL VÀ TỪNG DANH MỤC CON
  const filteredProducts = useMemo(() => {
    let items = [...expandedProducts];

    if (currentFilter) {
      const f = currentFilter.toLowerCase();

      // 1. NHÓM SẠC & CÁP
      if (f.startsWith('sac') || f.startsWith('cap')) {
        items = items.filter((i) => i.accGroup === 'sac-cap' || i.searchIndex.includes('sạc') || i.searchIndex.includes('cáp'));

        if (f === 'sac-20w') items = items.filter((i) => i.searchIndex.includes('20w'));
        else if (f === 'sac-35w') items = items.filter((i) => i.searchIndex.includes('35w'));
        else if (f === 'cap-c-to-c') items = items.filter((i) => i.searchIndex.includes('c to c') || (i.searchIndex.includes('cáp') && i.searchIndex.includes('type-c')));
      }
      // 2. NHÓM TAI NGHE / AIRPODS
      else if (f.startsWith('tai-nghe') || f.startsWith('airpods')) {
        items = items.filter((i) => i.accGroup === 'tai-nghe' || i.searchIndex.includes('airpods') || i.searchIndex.includes('tai nghe'));

        if (f === 'airpods-4') items = items.filter((i) => i.searchIndex.includes('airpods 4') || i.searchIndex.includes('airpod 4'));
        else if (f === 'airpods-pro-2') items = items.filter((i) => i.searchIndex.includes('pro 2') || i.searchIndex.includes('pro gen 2'));
        else if (f === 'airpods-max') items = items.filter((i) => i.searchIndex.includes('max'));
      }
      // 3. NHÓM BÚT / PHÍM / CHUỘT
      else if (f.startsWith('phu-kien-mac') || f.startsWith('pencil') || f.startsWith('magic')) {
        items = items.filter((i) => i.accGroup === 'phu-kien-mac' || i.searchIndex.includes('pencil') || i.searchIndex.includes('magic') || i.searchIndex.includes('bàn phím'));

        if (f === 'pencil-pro') items = items.filter((i) => i.searchIndex.includes('pencil pro'));
        else if (f === 'magic-keyboard') items = items.filter((i) => i.searchIndex.includes('magic keyboard') || i.searchIndex.includes('bàn phím'));
        else if (f === 'magic-mouse') items = items.filter((i) => i.searchIndex.includes('magic mouse') || i.searchIndex.includes('chuột'));
      }
      // 4. CÁC DANH MỤC KHÁC
      else {
        const cleanTag = f.replace(/[-]/g, ' ').trim();
        items = items.filter((i) => i.searchIndex.includes(cleanTag));
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

  // Tiêu đề hiển thị
  const displayTitle = useMemo(() => {
    switch (currentFilter) {
      case 'sac-cap': return 'Củ Sạc & Cáp Sạc Nhanh Apple';
      case 'sac-20w': return 'Củ Sạc Nhanh Apple 20W Type-C';
      case 'sac-35w': return 'Củ Sạc Kép Apple 35W Type-C';
      case 'cap-c-to-c': return 'Cáp Sạc Apple Type-C to Type-C';
      case 'tai-nghe': return 'Tai Nghe AirPods & Thiết Bị Âm Thanh';
      case 'airpods-4': return 'Tai Nghe Apple AirPods 4';
      case 'airpods-pro-2': return 'Tai Nghe Apple AirPods Pro 2';
      case 'airpods-max': return 'Tai Nghe Chụp Tai Apple AirPods Max';
      case 'phu-kien-mac': return 'Apple Pencil, Bàn Phím & Magic Mouse';
      case 'pencil-pro': return 'Bút Cảm Ứng Apple Pencil Pro';
      case 'magic-keyboard': return 'Bàn Phím Apple Magic Keyboard';
      case 'magic-mouse': return 'Chuột Không Dây Apple Magic Mouse';
      case 'op-lung': return 'Ốp Lưng & Bao Da MagSafe';
      case 'cuong-luc': return 'Kính Cường Lực Chống Trầy Xước';
      default: return 'Phụ Kiện Apple Chính Hãng';
    }
  }, [currentFilter]);

  const banner1 = adminBanners[0] || {
    name: 'Củ Sạc & Cáp Zin Apple',
    link: '/phu-kien',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&h=200&q=80',
  };

  const banner2 = adminBanners[1] || {
    name: 'AirPods Pro 2 USB-C',
    link: '/phu-kien',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&h=200&q=80',
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
          {/* 1. BANNER ĐÔI THUẦN ẢNH CHUẨN 600x200px */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={banner1.link || '/phu-kien'}
                className="w-full aspect-[3/1] rounded-lg overflow-hidden block shadow-2xs hover:shadow-md transition-shadow bg-transparent"
              >
                <img
                  src={banner1.imageUrl}
                  alt={banner1.name || 'Banner 1'}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </Link>

              <Link
                href={banner2.link || '/phu-kien'}
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

          {/* 3. HÀNG SUBMODEL CON: NHỎ HƠN 2 SIZE */}
          {activeSubmodels.length > 0 && (
            <div className="mb-8 pt-2 pb-3 border-t border-dashed border-gray-100 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-center gap-5 sm:gap-7 min-w-max px-2">
                {activeSubmodels.map((model) => {
                  const isSubSelected = currentFilter === model.tag;

                  return (
                    <Link
                      key={model.tag}
                      href={`/phu-kien?series=${model.tag}`}
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

          {/* LƯỚI SẢN PHẨM PHÂN TÁCH BIẾN THỂ */}
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
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200 min-h-[410px]"
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
                      <span className="scale-90 origin-right">Chính hãng</span>
                    </div>
                  </div>

                  <Link href={product.href} className="w-full h-40 my-2 flex items-center justify-center overflow-hidden cursor-pointer">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    />
                  </Link>

                  <Link
                    href={product.href}
                    className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug cursor-pointer"
                  >
                    {product.name}
                  </Link>

                  {/* KHỐI CAM KẾT HOẶC LIÊN HỆ */}
                  {product.rawPrice > 0 ? (
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
                      <span className="text-emerald-600 font-semibold">Chính hãng Apple VN</span>
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có phụ kiện nào phù hợp với danh mục này trong kho.</p>
              <Link href="/phu-kien" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả phụ kiện
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