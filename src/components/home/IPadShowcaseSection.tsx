'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const IPAD_SERIES_TABS = [
];

export const IPadShowcaseSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPads = async () => {
      try {
        const res = await fetch('https://fogo-store-api.onrender.com/api/products/filter?category=ipad', {
          cache: 'no-store',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data.map((item: any) => {
            const v = item.variants?.[0] || {};
            const curPrice = v.price || 0;
            const origPrice = v.originalPrice || curPrice;
            const discountPercent =
              origPrice > curPrice ? Math.round(((origPrice - curPrice) / origPrice) * 100) : 5;

            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              href: `/ipad/${item.slug}`,
              currentPrice: curPrice.toLocaleString('vi-VN') + 'đ',
              originalPrice: origPrice.toLocaleString('vi-VN') + 'đ',
              discountPercent,
              imageUrl:
                v.images?.[0] ||
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
              downPayment: (Math.round(curPrice * 0.3)).toLocaleString('vi-VN') + 'đ',
              rating: 5,
            };
          });
          setProducts(formatted);
        }
      } catch (err) {
        console.error('Lỗi nạp sản phẩm iPad:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPads();
  }, []);

  const handleTabClick = (series: string | null) => {
    setActiveSeries((prev) => (prev === series ? null : series));
  };

  const displayedItems = useMemo(() => {
    let list = products;
    if (activeSeries) {
      list = list.filter((p) => p.name.toLowerCase().includes(activeSeries.toLowerCase()));
    }
    return list.slice(0, 10);
  }, [products, activeSeries]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10 select-none w-full overflow-hidden">
      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-xl p-3 sm:p-5 md:p-8 shadow-xs">
        
       {/* ================= 1. HÀNG ICON DANH MỤC: FIT ĐỀU 5 CỘT BẰNG NHAU ================= */}
        <div className="grid grid-cols-5 gap-1 sm:gap-3 md:gap-6 mb-6 sm:mb-8 max-w-2xl mx-auto w-full">
          {IPAD_SERIES_TABS.map((tab) => {
            const isSelected = activeSeries === tab.series;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.series)}
                className="flex flex-col items-center gap-1 group cursor-pointer w-full transition-transform active:scale-95"
              >
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white p-1 shadow-xs flex items-center justify-center border-2 transition-all ${
                    isSelected
                      ? 'border-[#d70018] shadow-md scale-105 ring-2 ring-red-100'
                      : 'border-transparent group-hover:border-red-200'
                  }`}
                >
                  <img
                    src={tab.imageUrl}
                    alt={tab.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <span
                  className={`text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap transition-colors ${
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 group border border-gray-200/80"
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

        {/* 3. NÚT XEM TẤT CẢ */}
        <div className="flex justify-center items-center mt-6 sm:mt-8">
          <Link
            href={activeSeries ? `/ipad/${activeSeries}` : '/ipad'}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-md shadow-xs hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {activeSeries
                ? `Xem toàn bộ iPad ${activeSeries.toUpperCase()}`
                : 'Xem toàn bộ iPad'}
            </span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
};