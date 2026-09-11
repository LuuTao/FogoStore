export interface MacBookItem {
  id: string;
  name: string;
  series: string;     // 'macbook-pro', 'macbook-air', 'macbook-neo'
  subModel: string;   // 'macbook-pro-m5', 'macbook-pro-m4', 'macbook-pro-m3', 'macbook-pro-m2', 'macbook-pro-m1', 'macbook-air-m5', 'macbook-air-m4', 'macbook-air-m3', 'macbook-air-m2', 'macbook-air-m1', 'macbook-neo-2026'
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  statusTag?: string;
  rating?: number;
  href: string;
}

export const MACBOOK_CATALOG_ITEMS: MacBookItem[] = [
  // ================= MACBOOK PRO (M5 -> M1) =================
  {
    id: 'mbp-m5-16',
    name: 'MacBook Pro 16 inch M5 Max (36GB RAM / 1TB SSD) - Siêu Đồ Họa',
    series: 'macbook-pro',
    subModel: 'macbook-pro-m5',
    discountPercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '89,990,000đ',
    originalPrice: '94,490,000đ',
    downPayment: '27,000,000đ',
    statusTag: 'SIÊU PHẨM 2026',
    rating: 5,
    href: '/macbook/macbook-pro-m5',
  },
  {
    id: 'mbp-m4-14',
    name: 'MacBook Pro 14 inch M4 (16GB RAM / 512GB SSD) - Space Black',
    series: 'macbook-pro',
    subModel: 'macbook-pro-m4',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    currentPrice: '39,990,000đ',
    originalPrice: '42,990,000đ',
    downPayment: '11,900,000đ',
    rating: 5,
    href: '/macbook/macbook-pro-m4',
  },
  {
    id: 'mbp-m3-14',
    name: 'MacBook Pro 14 inch M3 Pro (18GB RAM / 512GB SSD) - Titan Bạc',
    series: 'macbook-pro',
    subModel: 'macbook-pro-m3',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '42,490,000đ',
    originalPrice: '48,490,000đ',
    downPayment: '12,500,000đ',
    rating: 5,
    href: '/macbook/macbook-pro-m3',
  },
  {
    id: 'mbp-m2-14',
    name: 'MacBook Pro 14 inch M2 Pro (16GB RAM / 512GB SSD) - Xả Kho Giá Tốt',
    series: 'macbook-pro',
    subModel: 'macbook-pro-m2',
    discountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    currentPrice: '32,990,000đ',
    originalPrice: '41,490,000đ',
    downPayment: '9,800,000đ',
    statusTag: 'GIÁ XẢ KHO',
    rating: 5,
    href: '/macbook/macbook-pro-m2',
  },
  {
    id: 'mbp-m1-13',
    name: 'MacBook Pro 13 inch M1 (16GB RAM / 256GB SSD) - Touch Bar Tiện Lợi',
    series: 'macbook-pro',
    subModel: 'macbook-pro-m1',
    discountPercent: 28,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '19,990,000đ',
    originalPrice: '27,990,000đ',
    downPayment: '5,900,000đ',
    rating: 5,
    href: '/macbook/macbook-pro-m1',
  },

  // ================= MACBOOK AIR (M5 -> M1) =================
  {
    id: 'mba-m5-13',
    name: 'MacBook Air 13 inch M5 (16GB RAM / 256GB SSD) - Chuẩn Mới Siêu Nhanh',
    series: 'macbook-air',
    subModel: 'macbook-air-m5',
    discountPercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '32,990,000đ',
    originalPrice: '34,990,000đ',
    downPayment: '9,800,000đ',
    statusTag: 'HÀNG MỚI VỀ',
    rating: 5,
    href: '/macbook/macbook-air-m5',
  },
  {
    id: 'mba-m4-13',
    name: 'MacBook Air 13 inch M4 (16GB RAM / 256GB SSD) - Tối Ưu AI Đỉnh Cao',
    series: 'macbook-air',
    subModel: 'macbook-air-m4',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '28,490,000đ',
    originalPrice: '30,490,000đ',
    downPayment: '8,500,000đ',
    rating: 5,
    href: '/macbook/macbook-air-m4',
  },
  {
    id: 'mba-m3-13',
    name: 'MacBook Air 13 inch M3 (16GB RAM / 256GB SSD) - Midnight Sang Trọng',
    series: 'macbook-air',
    subModel: 'macbook-air-m3',
    discountPercent: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '26,490,000đ',
    originalPrice: '29,490,000đ',
    downPayment: '7,900,000đ',
    rating: 5,
    href: '/macbook/macbook-air-m3',
  },
  {
    id: 'mba-m2-13',
    name: 'MacBook Air 13 inch M2 (16GB RAM / 256GB SSD) - Mỏng Nhẹ Quốc Dân',
    series: 'macbook-air',
    subModel: 'macbook-air-m2',
    discountPercent: 14,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '22,490,000đ',
    originalPrice: '25,990,000đ',
    downPayment: '6,700,000đ',
    rating: 5,
    href: '/macbook/macbook-air-m2',
  },
  {
    id: 'mba-m1-13',
    name: 'MacBook Air 13 inch M1 (8GB RAM / 256GB SSD) - Giá Rẻ Cho Học Sinh/SV',
    series: 'macbook-air',
    subModel: 'macbook-air-m1',
    discountPercent: 30,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    currentPrice: '16,790,000đ',
    originalPrice: '23,990,000đ',
    downPayment: '4,900,000đ',
    statusTag: 'BÁN CHẠY NHẤT',
    rating: 5,
    href: '/macbook/macbook-air-m1',
  },

  // ================= MACBOOK NEO (2026) =================
  {
    id: 'mbn-2026-14',
    name: 'MacBook Neo (2026) 14 inch M5 (24GB RAM / 512GB SSD) - Thiết Kế Không Viền',
    series: 'macbook-neo',
    subModel: 'macbook-neo-2026',
    discountPercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '45,990,000đ',
    originalPrice: '48,490,000đ',
    downPayment: '13,500,000đ',
    statusTag: 'THẾ HỆ MỚI 2026',
    rating: 5,
    href: '/macbook/macbook-neo-2026',
  },
  {
    id: 'mbn-2026-14-1tb',
    name: 'MacBook Neo (2026) 14 inch M5 (32GB RAM / 1TB SSD) - Hợp Kim Titan',
    series: 'macbook-neo',
    subModel: 'macbook-neo-2026',
    discountPercent: 4,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    currentPrice: '54,990,000đ',
    originalPrice: '57,490,000đ',
    downPayment: '16,500,000đ',
    statusTag: 'BẢN CAO CẤP',
    rating: 5,
    href: '/macbook/macbook-neo-2026',
  },
];

export const MACBOOK_HELPFUL_NEWS = [
  {
    id: 'mb-news-1',
    title: 'So sánh chip Apple Silicon từ M1 đến M5: Khi nào bạn thực sự cần nâng cấp?',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/so-sanh-apple-silicon-m1-den-m5',
  },
  {
    id: 'mb-news-2',
    title: 'MacBook Neo (2026) có gì đột phá? Thân máy titan và màn hình OLED vô cực',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/macbook-neo-2026-co-gi-moi',
  },
  {
    id: 'mb-news-3',
    title: 'Nên chọn MacBook Air M5 mới hay MacBook Pro M4 tiết kiệm chi phí?',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/nen-chon-air-m5-hay-pro-m4',
  },
];

export const RECENTLY_VIEWED_MACBOOK = [
  {
    id: 'rec-mb-1',
    name: 'MacBook Pro 14 inch M4 16GB/512GB',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '39,990,000đ',
    originalPrice: '42,990,000đ',
    downPayment: '11,900,000đ',
    href: '/macbook/macbook-pro-m4',
  },
  {
    id: 'rec-mb-2',
    name: 'MacBook Air 13 inch M3 16GB/256GB',
    discountPercent: 10,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '26,490,000đ',
    originalPrice: '29,490,000đ',
    downPayment: '7,900,000đ',
    href: '/macbook/macbook-air-m3',
  },
];