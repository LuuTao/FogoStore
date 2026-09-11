'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/filter?isFlashSale=true', {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Lỗi tải sản phẩm Flash Sale:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-gray-400">
        Đang nạp danh sách Flash Sale...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-300 fill-yellow-300 animate-pulse" size={24} />
            <h2 className="text-lg sm:text-2xl font-black tracking-tight uppercase">
              Flash Sale Giá Sốc Hôm Nay
            </h2>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold backdrop-blur-xs">
            Chính hãng Apple VN/A
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {products.map((prod) => {
            const v = prod.variants?.[0] || {};
            const price = v.price || 0;
            const originalPrice = v.originalPrice || price;
            const img = v.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';

            return (
              <Link
                key={prod.id}
                href={`/san-pham/${prod.slug}`}
                className="bg-white rounded-xl p-3 text-gray-800 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div>
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mb-2.5">
                    <img
                      src={img}
                      alt={prod.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-xs line-clamp-2 min-h-[32px] group-hover:text-red-600 transition-colors">
                    {prod.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-sm sm:text-base font-black text-[#d70018]">
                    {price.toLocaleString('vi-VN')} đ
                  </p>
                  {originalPrice > price && (
                    <p className="text-[10px] text-gray-400 line-through">
                      {originalPrice.toLocaleString('vi-VN')} đ
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};