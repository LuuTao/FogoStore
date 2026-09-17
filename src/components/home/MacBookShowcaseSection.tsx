'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, CreditCard, Wallet, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';

interface TabItem {
  id: string;
  series: string | null;
  name: string;
  imageUrl: string;
}

const MACBOOK_SERIES_TABS: TabItem[] = [
  {
    id: 'ALL',
    series: null,
    name: 'Tất cả',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
  },
  {
    id: 'pro',
    series: 'pro',
    name: 'MacBook Pro',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/space-black-gia-tot-tai-vender_4c05978b386c4855905e3df8a4af82e4_master_f1dd9fb4b7f84a86bb86fc31720cbed8_master.png?w=100',
  },
  {
    id: 'air',
    series: 'air',
    name: 'MacBook Air',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/hinh_anh_3_ae4b6b83d56744018803cb8c1211dc15_large_2b8556643ad34d4bbc8c1aae0d5e25ce_master.jpg?w=100',
  },
  {
    id: 'neo',
    series: 'neo',
    name: 'MacBook Neo',
    imageUrl: 'https://cdn.hstatic.net/products/200000768357/mbn-vang_01c8b19230654bdbb81f87daae826525_master.jpg?w=100',
  },
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const formatProductImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500';
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

// Hàm định dạng tên sản phẩm đưa dung lượng lên trước các hậu tố
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

export const MacBookShowcaseSection: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    const fetchMacBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/filter?category=macbook`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted: any[] = [];

          json.data.forEach((item: any) => {
            const variants: any[] = Array.isArray(item.variants) ? item.variants : [];

            // Gom nhóm các biến thể theo dung lượng / cấu hình
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
        console.error('Lỗi nạp sản phẩm MacBook trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMacBooks();
  }, []);

  const handleTabClick = (series: string | null) => {
    setSelectedSeries((prev) => (prev === series ? null : series));
  };

  // Khóa chặt bộ lọc: chỉ lọc trực tiếp trên tên sản phẩm
  const displayedItems = useMemo(() => {
    let list = [...products];

    if (selectedSeries) {
      const target = selectedSeries.toLowerCase();
      list = list.filter((p) => {
        const nameLower = p.name.toLowerCase();

        if (target === 'pro') {
          return nameLower.includes('pro') && !nameLower.includes('air') && !nameLower.includes('neo');
        }
        if (target === 'air') {
          return nameLower.includes('air') && !nameLower.includes('pro') && !nameLower.includes('neo');
        }
        if (target === 'neo') {
          return nameLower.includes('neo');
        }
        return nameLower.includes(target);
      });
    }

    list.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const getPriority = (name: string) => {
        if (name.includes('pro')) return 1;
        if (name.includes('air')) return 2;
        if (name.includes('neo')) return 3;
        return 4;
      };

      const pA = getPriority(nameA);
      const pB = getPriority(nameB);

      if (pA !== pB) return pA - pB;
      return b.rawPrice - a.rawPrice;
    });

    return list.slice(0, 20);
  }, [products, selectedSeries]);

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
        {/* 1. HÀNG ICON DANH MỤC SERIES */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-10 gap-y-3 mb-6 sm:mb-8 max-w-3xl mx-auto w-full">
          {MACBOOK_SERIES_TABS.map((tab) => {
            const isSelected = selectedSeries === tab.series;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.series)}
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
                  className={`text-[11px] sm:text-xs md:text-sm text-center whitespace-nowrap transition-colors w-full ${
                    isSelected
                      ? 'text-[#d70018] font-black'
                      : 'text-gray-700 font-semibold group-hover:text-[#d70018]'
                  }`}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. LƯỚI CARD SẢN PHẨM */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group border border-gray-200/80 min-h-[410px]"
            >
              <div>
                <div className="flex items-center justify-between h-5">
                  <span className="bg-[#d70018] text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-sm">
                    -{product.discountPercent}%
                  </span>
                  <span />
                </div>

                <Link
                  href={product.href}
                  className="w-full h-44 sm:h-48 my-2 flex items-center justify-center bg-white overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500';
                    }}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-sm"
                  />
                </Link>

                <Link
                  href={product.href}
                  className="font-bold text-xs sm:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[36px] sm:min-h-[38px] leading-snug"
                >
                  {product.name}
                </Link>
              </div>

              <div>
                {/* Khối trả góp chia đều 3 icon */}
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

                <span className="mt-1.5 bg-[#ffe8e8] text-[#d70018] text-[9px] font-bold px-1.5 py-0.5 rounded-sm w-fit block">
                  {product.statusTag}
                </span>

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

        {/* 3. NÚT XEM TOÀN BỘ SẢN PHẨM */}
        <div className="flex justify-center items-center mt-6 sm:mt-8">
          <Link
            href={selectedSeries ? `/macbook?series=${selectedSeries}` : '/macbook'}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-md shadow-xs hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {selectedSeries
                ? `Xem toàn bộ ${selectedSeries.toUpperCase()}`
                : 'Xem toàn bộ sản phẩm MacBook'}
            </span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MacBookShowcaseSection;