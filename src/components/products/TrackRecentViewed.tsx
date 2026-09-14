'use client';

import { useEffect } from 'react';

export default function TrackRecentViewed({ product }: { product: any }) {
  useEffect(() => {
    if (!product || (!product.id && !product.slug)) return;

    try {
      const key = 'fogo_recent_viewed';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      // 1. Lấy giá và ảnh hiển thị
      const firstVariant = product.variants?.[0] || {};
      const rawPrice = Number(firstVariant.price || product.rawPrice || product.price || 0);
      const displayPrice = rawPrice > 0 ? rawPrice.toLocaleString('vi-VN') + 'đ' : (product.currentPrice || 'Liên hệ');
      const displayImg =
        firstVariant.images?.[0] ||
        product.imageUrl ||
        product.image ||
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400';

      // 2. Lọc bỏ sản phẩm này nếu đã từng xem trước đó để đưa lên đầu danh sách
      const currentId = String(product.id || product.slug);
      const filtered = existing.filter((item: any) => String(item.id) !== currentId && item.slug !== product.slug);

      // 3. Đưa sản phẩm vừa xem lên đầu mảng (giới hạn lưu 8 sản phẩm gần nhất)
      const updated = [
        {
          id: product.id || product.slug,
          name: product.name,
          slug: product.slug,
          currentPrice: displayPrice,
          imageUrl: displayImg,
          href: `/san-pham/${product.slug || product.id}`,
        },
        ...filtered,
      ].slice(0, 8);

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm vừa xem:', err);
    }
  }, [product]);

  return null; // Component chạy ngầm, không render giao diện
}