'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  ACCESSORY_CATALOG_ITEMS,
  ACCESSORY_HELPFUL_NEWS,
  RECENTLY_VIEWED_ACCESSORIES,
} from '@/data/accessoryCatalog';
import { FilterAndSortBar, SortType, FilterState } from '@/components/category/FilterAndSortBar';

const ACCESSORY_CATEGORIES = [
  {
    name: 'Củ & Cáp Sạc',
    slug: 'sac-cap',
    img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'AirPods & Âm Thanh',
    slug: 'tai-nghe',
    img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Ốp Lưng & Bao Da',
    slug: 'op-lung',
    img: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Kính Cường Lực',
    slug: 'cuong-luc',
    img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Bút Pencil & Phím',
    slug: 'phu-kien-mac',
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
  },
];

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
};

// Hàm chuẩn hóa đường dẫn để click luôn ăn 100%
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
  const [currentSort, setCurrentSort] = useState<SortType>('price_desc');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [dbItems, setDbItems] = useState<any[]>([]);

  const slugParam = params?.slug;
  const currentFilter = Array.isArray(slugParam) ? slugParam[0] || '' : (slugParam as string) || '';

  useEffect(() => {
    const fetchAccessoryFromDB = async () => {
      try {
        let res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=phu-kien', {
          cache: 'no-store',
        });
        let json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch('https://fogo-store-api.onrender.com/api/products', { cache: 'no-store' });
          json = await res.json();
        }

        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data
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
              const curPrice = v.price || 0;
              const origPrice = v.originalPrice || curPrice;
              const discountPercent =
                origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 10;

              const lower = item.name.toLowerCase();
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
                href: `/san-pham/${item.slug}`,
                currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
                originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
                rawPrice: curPrice,
                discountPercent,
                imageUrl:
                  v.images?.[0] ||
                  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
                downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
                rating: 5,
              };
            });

          if (mapped.length > 0) {
            setDbItems(mapped);
          }
        }
      } catch (err) {
        console.error('Lỗi khi fetch phụ kiện từ API:', err);
      }
    };

    fetchAccessoryFromDB();
  }, []);

  const filteredProducts = useMemo(() => {
    let items = dbItems.length > 0 ? dbItems : (ACCESSORY_CATALOG_ITEMS || []);

    if (currentFilter) {
      items = items.filter((item) => {
        if (item.series === currentFilter || item.subModel === currentFilter) return true;

        const nameLower = (item.name || '').toLowerCase();
        if (currentFilter === 'sac-cap') return nameLower.includes('sạc') || nameLower.includes('cáp');
        if (currentFilter === 'tai-nghe') return nameLower.includes('airpods') || nameLower.includes('tai nghe');
        if (currentFilter === 'op-lung') return nameLower.includes('ốp') || nameLower.includes('bao da');
        if (currentFilter === 'cuong-luc') return nameLower.includes('kính') || nameLower.includes('cường lực');
        if (currentFilter === 'phu-kien-mac')
          return nameLower.includes('pencil') || nameLower.includes('phím') || nameLower.includes('chuột');

        return false;
      });
    }

    return [...items].sort((a, b) => {
      const priceA = parsePrice((a as any).rawPrice || a.currentPrice);
      const priceB = parsePrice((b as any).rawPrice || b.currentPrice);
      if (currentSort === 'price_asc') return priceA - priceB;
      if (currentSort === 'price_desc') return priceB - priceA;
      return 0;
    });
  }, [currentFilter, currentSort, dbItems]);

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

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
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
          {/* Banner */}
          <div className="relative mb-6 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-sm bg-gradient-to-r from-[#1c1d21] to-[#30333d] border border-gray-800 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm text-white">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 font-bold text-lg md:text-xl text-white">
                    <Zap size={20} className="text-amber-400" />
                    <span>Củ Sạc & Cáp Zin Apple</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium my-2">Bảo vệ tuổi thọ pin tối đa. Bảo hành 12 tháng 1 đổi 1.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Giảm sốc <span className="text-sm">25% Hôm Nay</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80"
                    alt="Củ sạc Apple"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>

              <div className="relative rounded-sm bg-gradient-to-r from-[#fbf8f5] to-[#f4eef9] border border-gray-200 p-5 md:p-6 flex items-center justify-between min-h-[190px] shadow-sm">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-gray-900 font-bold text-lg md:text-xl">
                    <span></span>
                    <span>AirPods Pro 2 USB-C</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">Âm thanh studio. Chống ồn chủ động đỉnh cao.</p>
                  <div className="inline-block bg-[#fff1f2] border border-[#ffccd2] px-2.5 py-1 rounded-sm text-xs font-black text-[#d70018]">
                    Giá ưu đãi chỉ từ <span className="text-sm">5.x90.000đ</span>
                  </div>
                </div>
                <div className="w-40 sm:w-48 h-32 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80"
                    alt="AirPods Pro 2"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thanh icon chọn danh mục con phụ kiện */}
          <div className="my-8 py-2">
            <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 flex-wrap">
              {ACCESSORY_CATEGORIES.map((cat) => {
                const isSelected = currentFilter === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={`/phu-kien/${cat.slug}`}
                    className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
                  >
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-2.5 bg-[#f0f2f5] flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-2 border-[#d70018] shadow-md bg-white scale-105'
                          : 'border border-gray-200 group-hover:border-[#d70018] group-hover:bg-white'
                      }`}
                    >
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center transition-colors max-w-[120px] leading-tight ${
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

          {/* Tiêu đề & Cụm Bộ Lọc */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">{displayTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Tìm thấy {filteredProducts.length} phụ kiện chính hãng</p>
            </div>

            <FilterAndSortBar
              currentSort={currentSort}
              onSortChange={(sort) => setCurrentSort(sort)}
              onApplyFilters={(filters) => setActiveFilters(filters)}
              isTabletOrMac={false}
            />
          </div>

          {/* Lưới sản phẩm */}
          {filteredProducts.length > 0 ? (
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
              <p className="text-gray-500 font-semibold text-sm">Chưa có phụ kiện nào phù hợp với danh mục này.</p>
              <Link href="/phu-kien" className="text-[#d70018] font-bold text-xs mt-2 inline-block hover:underline">
                Quay lại xem tất cả phụ kiện
              </Link>
            </div>
          )}

          {/* Chân trang thông tin */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
            <div className="lg:col-span-8">
              <div className="bg-[#fafafb] p-6 rounded-sm border border-gray-200 leading-relaxed text-gray-700 text-xs md:text-sm space-y-3">
                <h2 className="text-xl font-black text-gray-900">Hệ Sinh Thái Phụ Kiện Apple Chính Hãng Tại Fogo Store</h2>
                <p>
                  Sử dụng phụ kiện chính hãng Apple giúp thiết bị của bạn luôn hoạt động bền bỉ, an toàn nguồn điện và chống chai pin. Fogo Store cam kết 100% sản phẩm có nguồn gốc rõ ràng, bảo hành 1 đổi 1 trong vòng 12 tháng.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#d70018] inline-block" />
                <span>Bạn vừa xem</span>
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                {(RECENTLY_VIEWED_ACCESSORIES || []).slice(0, 2).map((item) => (
                  <div key={item.id} className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm border border-gray-200">
                    <div className="w-full h-28 my-2 flex items-center justify-center overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="font-bold text-xs text-gray-800 line-clamp-2 h-[34px]">{item.name}</span>
                    <span className="text-xs font-black text-[#d70018] mt-2">{item.currentPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}