'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

// Dàn icon series iPad chuẩn giao diện Apple
const IPAD_SERIES_TABS = [
  {
    id: 'ALL',
    series: null,
    name: 'Tất cả',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100',
  },
  {
    id: 'pro',
    series: 'pro',
    name: 'iPad Pro',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100',
  },
  {
    id: 'air',
    series: 'air',
    name: 'iPad Air',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=100',
  },
  {
    id: 'gen',
    series: 'gen',
    name: 'iPad Gen',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=100',
  },
  {
    id: 'mini',
    series: 'mini',
    name: 'iPad Mini',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100',
  },
];

export const IPadShowcaseSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  // 1. Fetch toàn bộ máy iPad từ Database thật qua API
  useEffect(() => {
    const fetchIPads = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/filter?category=ipad', {
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
        console.error('Lỗi nạp sản phẩm iPad trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPads();
  }, []);

  const handleTabClick = (series: string | null) => {
    setActiveSeries((prev) => (prev === series ? null : series));
  };

  // 2. Lọc sản phẩm theo Series (Pro / Air / Gen / Mini) khi click icon tròn
  const displayedItems = useMemo(() => {
    let list = products;
    if (activeSeries) {
      list = list.filter((p) => p.name.toLowerCase().includes(activeSeries.toLowerCase()));
    }
    return list.slice(0, 10);
  }, [products, activeSeries]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 select-none">
      {/* KHUNG NGOÀI VUÔNG VỨC (rounded-md) NỀN VÀNG KEM */}
      <div className="bg-[#fff9f1] border border-[#fbe9d2] rounded-md p-5 md:p-8 shadow-sm">
        
        {/* ================= 1. HÀNG ICON DANH MỤC SERIES ================= */}
        <div className="flex items-center justify-center gap-6 md:gap-14 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {IPAD_SERIES_TABS.map((tab) => {
            const isSelected = activeSeries === tab.series;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.series)}
                className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105"
              >
                {/* Viền tròn ảnh series */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center border-2 transition-all ${
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
                  className={`text-xs md:text-sm transition-colors ${
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

        {/* ================= 2. LƯỚI CARD SẢN PHẨM VUÔNG VỨC (rounded-sm) ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {displayedItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-sm p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200/80 min-h-[420px]"
            >
              <div className="flex items-center justify-between h-6">
                <span className="bg-[#d70018] text-white text-[11px] font-black px-1.5 py-0.5 rounded-none">
                  -{product.discountPercent}%
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                  <span></span>
                  <span className="scale-90 origin-right">Authorized Reseller</span>
                </div>
              </div>

              <Link
                href={product.href}
                className="w-full h-40 my-2 flex items-center justify-center overflow-hidden"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                />
              </Link>

              <Link
                href={product.href}
                className="font-bold text-xs md:text-sm text-gray-800 hover:text-[#d70018] line-clamp-2 transition-colors h-[38px] leading-snug"
              >
                {product.name}
              </Link>

              {/* Box vé Trả góp 0% bo góc vuông */}
              <div className="mt-2.5 bg-[#fff1f2] border border-[#ffccd2] rounded-sm py-1.5 px-2 text-center relative">
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

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-sm md:text-base font-black text-[#d70018]">
                  {product.currentPrice}
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  {product.originalPrice}
                </span>
              </div>

              <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                Hoặc trả trước <strong className="text-gray-900">{product.downPayment}</strong>
              </div>

              <div className="flex items-center gap-0.5 mt-2 text-amber-400 h-3">
                {[...Array(product.rating || 5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. NÚT XEM TOÀN BỘ SẢN PHẨM ================= */}
        <div className="flex justify-center items-center mt-8">
          <Link
            href={activeSeries ? `/ipad/${activeSeries}` : '/ipad'}
            className="inline-flex items-center gap-2 bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-sm px-8 py-2.5 rounded-sm shadow hover:shadow-md transition-transform active:scale-95"
          >
            <span>
              {activeSeries
                ? `Xem toàn bộ sản phẩm iPad ${activeSeries.toUpperCase()}`
                : 'Xem toàn bộ sản phẩm iPad'}
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};