'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getProducts } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function IPhoneCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ category: 'iphone' })
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const formatVnd = (num: number) => (num || 0).toLocaleString('vi-VN') + 'đ';

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-black text-gray-900 mb-6">DANH SÁCH IPHONE CHÍNH HÃNG</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#d70018]" size={36} />
              <p className="text-xs text-gray-500 mt-2 font-medium">Đang tải sản phẩm từ PostgreSQL...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-gray-200">
              <p className="text-sm text-gray-500">Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((item) => {
                const firstVariant = item.variants?.[0];
                const price = firstVariant?.price || 0;
                const originalPrice = firstVariant?.originalPrice || 0;
                const image = firstVariant?.images?.[0] || '';

                return (
                  <Link
                    key={item.id}
                    href={`/iphone/${item.slug}`}
                    className="bg-white rounded-md border border-gray-200 p-4 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-full aspect-square flex items-center justify-center mb-3 overflow-hidden">
                        <img
                          src={image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#d70018]">
                        {item.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="text-sm font-black text-[#d70018]">
                        {formatVnd(price)}
                      </div>
                      {originalPrice > price && (
                        <div className="text-[11px] text-gray-400 line-through">
                          {formatVnd(originalPrice)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}