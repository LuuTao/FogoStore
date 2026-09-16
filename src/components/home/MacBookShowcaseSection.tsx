'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

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

// Hàm định dạng giá tiền chuẩn: Trả về "Liên hệ" nếu giá <= 0
const formatVndPrice = (price: number) => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};

export const MacBookShowcaseSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  // 1. Fetch dữ liệu từ API và lọc chỉ lấy sản phẩm có giá > 0
  useEffect(() => {
    const fetchMacBooks = async () => {
      try {
        const res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=macbook', {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data
            .map((item: any) => {
              const v = item.variants?.[0] || {};
              const curPrice = Number(v.price || item.price || 0);
              const origPrice = Number(v.originalPrice || item.originalPrice || curPrice);
              const discountPercent =
                origPrice > curPrice && curPrice > 0 ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

              return {
                id: item.id,
                name: item.name,
                slug: item.slug,
                searchKeywords: `${item.name} ${item.subSeriesName || ''}`.toLowerCase(),
                href: `/san-pham/${item.slug}`,
                currentPrice: formatVndPrice(curPrice),
                originalPrice: curPrice > 0 ? origPrice.toLocaleString('vi-VN') + 'đ' : '',
                rawPrice: curPrice,
                discountPercent,
                imageUrl:
                  v.images?.[0] ||
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                downPayment: curPrice > 0 ? Math.round(curPrice * 0.3).toLocaleString('vi-VN') + 'đ' : 'Liên hệ',
                rating: 5,
                isFeatured: item.isFeatured,
              };
            })
            // CHỈ LẤY CÁC SẢN PHẨM CÓ GIÁ TIỀN > 0
            .filter((p: any) => p.rawPrice > 0);

          const sorted = formatted.sort(
            (a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
          );
          setProducts(sorted);
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

  // 2. Lọc sản phẩm theo Series đang chọn và giới hạn CHÍNH XÁC TỐI ĐA 20 SẢN PHẨM
  const displayedItems = useMemo(() => {
    let list = products;
    if (selectedSeries) {
      const val = selectedSeries.toLowerCase();
      list = list.filter((p) => p.searchKeywords.includes(val));
    }
    return list.slice(0, 20);
  }, [products, selectedSeries]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10 select-none w-full overflow-hidden">
      {/* KHUNG NGOÀI NỀN VÀNG KEM */}
      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-xl p-3 sm:p-5 md:p-8 shadow-xs">
        
        {/* ================= 1. HÀNG ICON DANH MỤC SERIES ================= */}
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

        {/* ================= 2. LƯỚI CARD SẢN PHẨM ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 group border border-gray-200/80 min-h-[420px]"
            >
              <div>
                <div className="flex items-center justify-between h-5 sm:h-6">
                  <span className="bg-[#d70018] text-white text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-sm">
                    -{product.discountPercent}%
                  </span>
                  <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-gray-400">
                    <span></span>
                    <span className="scale-90 origin-right truncate">VN/A</span>
                  </div>
                </div>

                <Link
                  href={product.href}
                  className="w-full aspect-square my-2 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                  />
                </Link>

                <Link
                  href={product.href}
                  className="font-bold text-xs sm:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors min-h-[34px] sm:min-h-[38px] leading-snug"
                >
                  {product.name}
                </Link>
              </div>

              <div>
                {/* Box vé Trả góp 0% */}
                <div className="mt-2 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1 px-1.5 text-center">
                  <div className="text-[8px] sm:text-[9px] font-bold text-gray-500 flex items-center justify-around">
                    <span>Trả Góp</span>
                    <span>•</span>
                    <span>Trả Trước</span>
                    <span>•</span>
                    <span>Phí</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-black text-[#d70018] tracking-tight flex items-center justify-around mt-0.5">
                    <span>0%</span>
                    <span>0đ</span>
                    <span>0đ</span>
                  </div>
                </div>

                {/* Giá tiền */}
                <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline gap-1">
                  <span className="text-xs sm:text-sm md:text-base font-black text-[#d70018]">
                    {product.currentPrice}
                  </span>
                  <span className="text-[9px] sm:text-[11px] text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                </div>

                <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                  Trả trước <strong className="text-gray-900">{product.downPayment}</strong>
                </div>

                <div className="flex items-center gap-0.5 mt-1.5 text-amber-400">
                  {[...Array(product.rating || 5)].map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. NÚT XEM TOÀN BỘ SẢN PHẨM ================= */}
        <div className="flex justify-center items-center mt-6 sm:mt-8">
          <Link
            href={selectedSeries ? `/macbook/${selectedSeries}` : '/macbook'}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-md shadow-xs hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {selectedSeries
                ? `Xem toàn bộ sản phẩm MacBook ${selectedSeries.toUpperCase()}`
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