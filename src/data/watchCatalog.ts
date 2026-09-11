export interface WatchItem {
  id: string;
  name: string;
  series: string;     // 'watch-ultra', 'watch-series', 'watch-se'
  subModel: string;   // 'watch-ultra-2', 'watch-ultra-1', 'watch-series-10', 'watch-series-9', 'watch-series-8', 'watch-se-2', 'watch-se-1'
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  statusTag?: string;
  rating?: number;
  href: string;
}

export const WATCH_CATALOG_ITEMS: WatchItem[] = [
  // ================= APPLE WATCH ULTRA =================
  {
    id: 'aw-u2-black-trail',
    name: 'Apple Watch Ultra 2 49mm (GPS + Cellular) Titanium Đen - Dây Trail',
    series: 'watch-ultra',
    subModel: 'watch-ultra-2',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
    currentPrice: '20,490,000đ',
    originalPrice: '21,990,000đ',
    downPayment: '6,100,000đ',
    statusTag: 'HÀNG MỚI VỀ',
    rating: 5,
    href: '/watch/watch-ultra-2',
  },
  {
    id: 'aw-u1-ocean',
    name: 'Apple Watch Ultra 1 49mm (GPS + Cellular) Titan Tự Nhiên - Dây Ocean',
    series: 'watch-ultra',
    subModel: 'watch-ultra-1',
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    currentPrice: '14,990,000đ',
    originalPrice: '19,990,000đ',
    downPayment: '4,500,000đ',
    statusTag: 'XẢ KHO',
    rating: 5,
    href: '/watch/watch-ultra-1',
  },

  // ================= APPLE WATCH SERIES (10, 9, 8) =================
  {
    id: 'aw-s10-46-nhom-gps',
    name: 'Apple Watch Series 10 46mm (GPS) Viền Nhôm Jet Black Siêu Mỏng',
    series: 'watch-series',
    subModel: 'watch-series-10',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
    currentPrice: '10,990,000đ',
    originalPrice: '11,990,000đ',
    downPayment: '3,200,000đ',
    rating: 5,
    href: '/watch/watch-series-10',
  },
  {
    id: 'aw-s10-42-titan-lte',
    name: 'Apple Watch Series 10 42mm (GPS + Cellular) Viền Titanium Slate',
    series: 'watch-series',
    subModel: 'watch-series-10',
    discountPercent: 6,
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&q=80',
    currentPrice: '18,490,000đ',
    originalPrice: '19,790,000đ',
    downPayment: '5,500,000đ',
    statusTag: 'CAO CẤP',
    rating: 5,
    href: '/watch/watch-series-10',
  },
  {
    id: 'aw-s9-45-nhom-gps',
    name: 'Apple Watch Series 9 45mm (GPS) Viền Nhôm Midnight',
    series: 'watch-series',
    subModel: 'watch-series-9',
    discountPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    currentPrice: '8,490,000đ',
    originalPrice: '10,490,000đ',
    downPayment: '2,500,000đ',
    rating: 5,
    href: '/watch/watch-series-9',
  },
  {
    id: 'aw-s8-41-nhom-gps',
    name: 'Apple Watch Series 8 41mm (GPS) Viền Nhôm Starlight',
    series: 'watch-series',
    subModel: 'watch-series-8',
    discountPercent: 28,
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&q=80',
    currentPrice: '6,290,000đ',
    originalPrice: '8,990,000đ',
    downPayment: '1,800,000đ',
    statusTag: 'GIÁ SỐC',
    rating: 5,
    href: '/watch/watch-series-8',
  },

  // ================= APPLE WATCH SE (SE 2, SE 1) =================
  {
    id: 'aw-se2-40-nhom-gps',
    name: 'Apple Watch SE 2 (2024) 40mm (GPS) Viền Nhôm Chính Hãng',
    series: 'watch-se',
    subModel: 'watch-se-2',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    currentPrice: '5,490,000đ',
    originalPrice: '6,290,000đ',
    downPayment: '1,600,000đ',
    rating: 5,
    href: '/watch/watch-se-2',
  },
  {
    id: 'aw-se2-44-nhom-lte',
    name: 'Apple Watch SE 2 (2024) 44mm (GPS + Cellular) Kết Nối eSIM',
    series: 'watch-se',
    subModel: 'watch-se-2',
    discountPercent: 10,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
    currentPrice: '6,990,000đ',
    originalPrice: '7,790,000đ',
    downPayment: '2,000,000đ',
    statusTag: 'HỖ TRỢ ESIM',
    rating: 5,
    href: '/watch/watch-se-2',
  },
  {
    id: 'aw-se1-40-nhom-gps',
    name: 'Apple Watch SE 1 40mm (GPS) Viền Nhôm Bạc Quốc Dân',
    series: 'watch-se',
    subModel: 'watch-se-1',
    discountPercent: 35,
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&q=80',
    currentPrice: '3,890,000đ',
    originalPrice: '5,990,000đ',
    downPayment: '1,100,000đ',
    statusTag: 'GIÁ RẺ NHẤT',
    rating: 5,
    href: '/watch/watch-se-1',
  },
];

export const WATCH_HELPFUL_NEWS = [
  {
    id: 'w-news-1',
    title: 'Đánh giá Apple Watch Series 10: Màn hình góc rộng sáng hơn 40%, mỏng nhẹ bất ngờ',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/danh-gia-apple-watch-series-10',
  },
  {
    id: 'w-news-2',
    title: 'Nên mua Apple Watch Ultra 2 hay Series 10 Titanium?',
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/ultra-2-vs-series-10-titanium',
  },
  {
    id: 'w-news-3',
    title: 'So sánh Apple Watch SE 2 và các dòng Series cũ: Đâu là lựa chọn tiết kiệm?',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/apple-watch-se-2-co-dang-mua',
  },
];

export const RECENTLY_VIEWED_WATCH = [
  {
    id: 'rec-w-1',
    name: 'Apple Watch Ultra 2 Titanium Đen',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
    currentPrice: '20,490,000đ',
    originalPrice: '21,990,000đ',
    downPayment: '6,100,000đ',
    href: '/watch/watch-ultra-2',
  },
  {
    id: 'rec-w-2',
    name: 'Apple Watch Series 10 46mm GPS',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&q=80',
    currentPrice: '10,990,000đ',
    originalPrice: '11,990,000đ',
    downPayment: '3,200,000đ',
    href: '/watch/watch-series-10',
  },
];