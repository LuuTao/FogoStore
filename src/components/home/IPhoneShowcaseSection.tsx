'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, CreditCard, Wallet, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

interface TabItem {
  id: string;
  name: string;
  imageUrl: string;
  queryValue: string | null;
}

const DEFAULT_TABS: TabItem[] = [
  {
    id: 'sub-ip-1',
    name: 'Tất cả',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryValue: null,
  },
  {
    id: 'sub-ip-2',
    name: 'iPhone 18 Series',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/burgundy_345c3a6b026f4c72acf2a2774152a256_master.png?w=100',
    queryValue: '18',
  },
  {
    id: 'sub-ip-3',
    name: 'iPhone Duo Series',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/duo-3_fd7ff82269ad428d92cac7125608414b_master.png?w=100',
    queryValue: 'duo',
  },
  {
    id: 'sub-ip-4',
    name: 'iPhone 17 Series',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/h_nh__nh_f27c19cdd95d4d2ba295fcde3a86415c_master.jpeg?w=100',
    queryValue: '17',
  },
  {
    id: 'sub-ip-5',
    name: 'iPhone 16 Series',
    imageUrl: 'https://product.hstatic.net/200000768357/product/16pr_93cbc33842244d9a8a24f5e40c62a4f5_master.png?w=100',
    queryValue: '16',
  },
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

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

// Hàm dời dung lượng lên trước các hậu tố
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

export const IPhoneShowcaseSection: React.FC = () => {
  const { addToCart } = useCart();
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabItem | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // 1. Nạp Tabs động từ Admin
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_banners_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const adminSubIphones = parsed.filter((it: any) => it.group === 'sub_iphone');
          if (adminSubIphones.length > 0) {
            const dynamicTabs: TabItem[] = adminSubIphones.map((it: any) => {
              const nameLower = (it.name || '').trim().toLowerCase();
              const isAll = nameLower === 'tất cả' || nameLower === 'all';
              const matchNum = it.name.match(/\d+/);
              const isDuo = nameLower.includes('duo');
              const queryValue = isAll ? null : isDuo ? 'duo' : matchNum ? matchNum[0] : it.name.trim();

              return {
                id: it.id,
                name: it.name,
                imageUrl: it.imageUrl,
                queryValue,
              };
            });
            setTabs(dynamicTabs);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi nạp submodel iphone:', e);
    }
  }, []);

  // 2. Fetch dữ liệu từ API và tự động bóc tách từng dung lượng thành thẻ riêng
  useEffect(() => {
    const fetchIPhones = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/filter?category=iphone`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted: any[] = [];

          json.data.forEach((item: any) => {
            const variants: any[] = Array.isArray(item.variants) ? item.variants : [];

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
              const curPrice = Number(v.price || item.price || 0);

              if (curPrice <= 0) return;

              const origPrice = Number(v.originalPrice || item.originalPrice || Math.round(curPrice * 1.15));
              const stKey = Array.from(storageMap.keys())[0] || '';
              const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';
              const finalName = buildProductNameWithStorage(item.name, stKey);

              formatted.push({
                id: item.id,
                variantId: v.id || item.id,
                name: finalName,
                rawName: item.name,
                modelSlug: item.slug,
                slug: `${item.slug}${slugSuffix}`,
                href: `/san-pham/${item.slug}${slugSuffix}`,
                currentPrice: formatVndPrice(curPrice),
                originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
                rawPrice: curPrice,
                storage: stKey,
                color: v.color || '',
                discountPercent: origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
                imageUrl: formatProductImageUrl(v.images?.[0] || item.imageUrl || item.image),
                statusTag: 'Sẵn hàng',
                isFeatured: item.isFeatured,
              });
            } else {
              storageMap.forEach((varList, stKey) => {
                const v = varList[0];
                const curPrice = Number(v.price || item.price || 0);

                if (curPrice <= 0) return;

                const origPrice = Number(v.originalPrice || item.originalPrice || Math.round(curPrice * 1.15));
                const slugSuffix = stKey ? `-${stKey.toLowerCase()}` : '';
                const finalName = buildProductNameWithStorage(item.name, stKey);

                formatted.push({
                  id: `${item.id}-${stKey || 'base'}`,
                  variantId: v.id || `${item.id}-${stKey}`,
                  name: finalName,
                  rawName: item.name,
                  modelSlug: item.slug,
                  slug: `${item.slug}${slugSuffix}`,
                  href: `/san-pham/${item.slug}${slugSuffix}`,
                  currentPrice: formatVndPrice(curPrice),
                  originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
                  rawPrice: curPrice,
                  storage: stKey,
                  color: v.color || '',
                  discountPercent: origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5,
                  imageUrl: formatProductImageUrl(v.images?.[0] || item.imageUrl || item.image),
                  statusTag: 'Sẵn hàng',
                  isFeatured: item.isFeatured,
                });
              });
            }
          });

          setProducts(formatted);
        }
      } catch (err) {
        console.error('Lỗi nạp sản phẩm iPhone:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPhones();
  }, []);

  const handleTabClick = (tab: TabItem) => {
    if (!tab.queryValue) {
      setSelectedTab(null);
    } else {
      setSelectedTab((prev) => (prev?.id === tab.id ? null : tab));
    }
  };

  // 3. Khóa chặt bộ lọc: chỉ lọc trên tên sản phẩm bằng Regex ranh giới từ
  const displayedItems = useMemo(() => {
    let items = [...products];

    if (selectedTab && selectedTab.queryValue) {
      const target = selectedTab.queryValue.toLowerCase();

      if (target === 'duo') {
        items = items.filter((p) => p.name.toLowerCase().includes('duo'));
      } else if (/^\d+$/.test(target)) {
        // Khớp chính xác số series (\b18\b, \b17\b, \b16\b) để không lẫn lộn giữa các dòng máy
        const regex = new RegExp(`\\b${target}\\b`, 'i');
        items = items.filter((p) => regex.test(p.name));
      } else {
        items = items.filter((p) => p.name.toLowerCase().includes(target));
      }
    }

    // Sắp xếp đời máy mới nhất và giá giảm dần
    items.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const is18A = /\b18\b/.test(nameA);
      const is18B = /\b18\b/.test(nameB);
      if (is18A && !is18B) return -1;
      if (!is18A && is18B) return 1;

      const isDuoA = nameA.includes('duo');
      const isDuoB = nameB.includes('duo');
      if (isDuoA && !isDuoB) return -1;
      if (!isDuoA && isDuoB) return 1;

      const is17A = /\b17\b/.test(nameA);
      const is17B = /\b17\b/.test(nameB);
      if (is17A && !is17B) return -1;
      if (!is17A && is17B) return 1;

      const is16A = /\b16\b/.test(nameA);
      const is16B = /\b16\b/.test(nameB);
      if (is16A && !is16B) return -1;
      if (!is16A && is16B) return 1;

      return b.rawPrice - a.rawPrice;
    });

    return items.slice(0, 20);
  }, [products, selectedTab]);

  const handleAddToCartQuick = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.variantId,
      name: product.name,
      modelSlug: product.modelSlug,
      price: product.rawPrice,
      originalPrice: product.rawPrice,
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

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10 select-none w-full overflow-hidden">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-xl p-3 sm:p-5 md:p-8 shadow-xs">
        {/* ================= 1. HÀNG ICON SERIES ================= */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-9 gap-y-3 mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const isSelected = (!selectedTab && !tab.queryValue) || selectedTab?.id === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer w-[72px] sm:w-[88px] md:w-[100px] transition-transform active:scale-95"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#d70018] shadow-md shadow-red-100 scale-105 ring-2 ring-red-100/50'
                      : 'border-2 border-transparent bg-white hover:border-gray-200 shadow-xs'
                  }`}
                >
                  <img
                    src={tab.imageUrl}
                    alt={tab.name}
                    className="w-full h-full object-contain rounded-full pointer-events-none drop-shadow-2xs"
                  />
                </div>

                <span
                  className={`text-[11px] sm:text-xs md:text-sm text-center line-clamp-1 transition-colors w-full ${
                    isSelected ? 'text-[#d70018] font-black' : 'text-gray-700 font-semibold group-hover:text-[#d70018]'
                  }`}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= 2. LƯỚI SẢN PHẨM ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group border border-gray-200/80 min-h-[410px]"
            >
              <div>
                {/* TAG GIẢM GIÁ (ĐÃ BỎ AUTHORIZED RESELLER) */}
                <div className="flex items-center justify-between h-5">
                  <span className="bg-[#d70018] text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-sm">
                    -{product.discountPercent}%
                  </span>
                  <span />
                </div>

                {/* KHUNG ẢNH: TO LÊN, NỀN TRẮNG TINH, KHÔNG VIỀN */}
                <Link
                  href={product.href}
                  className="w-full h-44 sm:h-48 my-2 flex items-center justify-center bg-white overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-sm"
                  />
                </Link>

                {/* TÊN SẢN PHẨM: ĐÃ DỜI DUNG LƯỢNG LÊN TRƯỚC */}
                <Link
                  href={product.href}
                  className="font-bold text-xs sm:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[36px] sm:min-h-[38px] leading-snug"
                >
                  {product.name}
                </Link>
              </div>

              <div>
                {/* KHỐI TRẢ GÓP MỚI: 3 ICON CĂN ĐỀU GIỮA */}
                <div className="mt-2 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1.5 px-2 flex items-center justify-around text-[#d70018]">
                  <div className="flex items-center gap-1">
                    <CreditCard size={12} className="shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black tracking-tight whitespace-nowrap">Trả góp</span>
                  </div>

                  <span className="text-gray-300 font-normal">|</span>

                  <div className="flex items-center gap-1">
                    <Wallet size={12} className="shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black tracking-tight whitespace-nowrap">Trả trước</span>
                  </div>

                  <span className="text-gray-300 font-normal">|</span>

                  <div className="flex items-center gap-1">
                    <Percent size={11} className="shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black tracking-tight whitespace-nowrap">Phí</span>
                  </div>
                </div>

                {/* NHÃN TRẠNG THÁI */}
                <span className="mt-1.5 bg-[#ffe8e8] text-[#d70018] text-[9px] font-bold px-1.5 py-0.5 rounded-sm w-fit block">
                  {product.statusTag}
                </span>

                {/* GIÁ BÁN */}
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-black text-[#d70018] text-sm sm:text-base">
                    {product.currentPrice}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                {/* NÚT THÊM GIỎ HÀNG */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCartQuick(e, product)}
                    className="w-full py-2 bg-[#d70018] hover:bg-[#b50014] text-white rounded-md text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                  >
                    <ShoppingCart size={13} />
                    <span>Thêm Giỏ Hàng</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. NÚT XEM TẤT CẢ ================= */}
        <div className="flex justify-center items-center mt-6 sm:mt-8">
          <Link
            href={selectedTab?.queryValue ? `/iphone?series=${selectedTab.queryValue}` : '/iphone'}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-md shadow-xs hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {selectedTab?.queryValue ? `Xem toàn bộ ${selectedTab.name}` : 'Xem toàn bộ iPhone'}
            </span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IPhoneShowcaseSection;