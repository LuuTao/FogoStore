export interface UsedItem {
  id: string;
  name: string;
  category: string;   // 'iphone-cu', 'ipad-cu', 'macbook-cu'
  subModel: string;   // 'iphone-17-series-cu', 'iphone-16-series-cu', 'ipad-pro-cu', 'macbook-pro-cu', ...
  conditionTag: string; // 'Cũ Đẹp 99%', 'Like New Pin 100%', 'Cũ 98%'
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  rating?: number;
  href: string;
}

export const USED_CATALOG_ITEMS: UsedItem[] = [
  // ================= iPHONE CŨ =================
  {
    id: 'used-ip17-pm-256',
    name: 'iPhone 17 Pro Max 256GB Cũ Đẹp 99% - Pin 98% VN/A',
    category: 'iphone-cu',
    subModel: 'iphone-17-series-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80',
    currentPrice: '28,990,000đ',
    originalPrice: '35,490,000đ',
    downPayment: '8,500,000đ',
    rating: 5,
    href: '/hang-cu/iphone-17-series-cu',
  },
  {
    id: 'used-ip16-pm-256',
    name: 'iPhone 16 Pro Max 256GB Cũ Like New - Nguyên Bản',
    category: 'iphone-cu',
    subModel: 'iphone-16-series-cu',
    conditionTag: 'Like New 99%',
    discountPercent: 22,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
    currentPrice: '24,990,000đ',
    originalPrice: '31,990,000đ',
    downPayment: '7,500,000đ',
    rating: 5,
    href: '/hang-cu/iphone-16-series-cu',
  },
  {
    id: 'used-ip16-pro-128',
    name: 'iPhone 16 Pro 128GB Cũ Đẹp 99% - Titan Tự Nhiên',
    category: 'iphone-cu',
    subModel: 'iphone-16-series-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80',
    currentPrice: '19,890,000đ',
    originalPrice: '26,490,000đ',
    downPayment: '5,900,000đ',
    rating: 5,
    href: '/hang-cu/iphone-16-series-cu',
  },
  {
    id: 'used-ip15-pm-256',
    name: 'iPhone 15 Pro Max 256GB Cũ 98% - Giá Cực Hời',
    category: 'iphone-cu',
    subModel: 'iphone-15-series-cu',
    conditionTag: 'Cũ 98%',
    discountPercent: 28,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
    currentPrice: '19,490,000đ',
    originalPrice: '26,990,000đ',
    downPayment: '5,800,000đ',
    rating: 5,
    href: '/hang-cu/iphone-15-series-cu',
  },
  {
    id: 'used-ip14-pm-128',
    name: 'iPhone 14 Pro Max 128GB Cũ Đẹp 99% - Tím Deep Purple',
    category: 'iphone-cu',
    subModel: 'iphone-14-series-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 32,
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '15,990,000đ',
    originalPrice: '23,490,000đ',
    downPayment: '4,800,000đ',
    rating: 5,
    href: '/hang-cu/iphone-14-series-cu',
  },

  // ================= iPAD CŨ =================
  {
    id: 'used-ipad-pro-m4',
    name: 'iPad Pro 11 inch M4 Wi-Fi 256GB Cũ Like New Fullbox',
    category: 'ipad-cu',
    subModel: 'ipad-pro-cu',
    conditionTag: 'Like New 99%',
    discountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '21,490,000đ',
    originalPrice: '26,990,000đ',
    downPayment: '6,400,000đ',
    rating: 5,
    href: '/hang-cu/ipad-pro-cu',
  },
  {
    id: 'used-ipad-air-m2',
    name: 'iPad Air 11 inch M2 (2024) 128GB Cũ Đẹp 99%',
    category: 'ipad-cu',
    subModel: 'ipad-air-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 24,
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '12,490,000đ',
    originalPrice: '16,490,000đ',
    downPayment: '3,700,000đ',
    rating: 5,
    href: '/hang-cu/ipad-air-cu',
  },
  {
    id: 'used-ipad-gen-10',
    name: 'iPad Gen 10 64GB Wi-Fi Cũ Đẹp 99% - Học Tập Tuyệt Vời',
    category: 'ipad-cu',
    subModel: 'ipad-gen-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 30,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    currentPrice: '6,990,000đ',
    originalPrice: '9,990,000đ',
    downPayment: '2,000,000đ',
    rating: 5,
    href: '/hang-cu/ipad-gen-cu',
  },

  // ================= MACBOOK CŨ =================
  {
    id: 'used-mbp-m3-pro',
    name: 'MacBook Pro 14 inch M3 Pro (18GB/512GB) Cũ Đẹp 99% Sạc 20 Lần',
    category: 'macbook-cu',
    subModel: 'macbook-pro-cu',
    conditionTag: 'Like New 99%',
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    currentPrice: '33,990,000đ',
    originalPrice: '45,490,000đ',
    downPayment: '10,200,000đ',
    rating: 5,
    href: '/hang-cu/macbook-pro-cu',
  },
  {
    id: 'used-mba-m2-16gb',
    name: 'MacBook Air 13 inch M2 (16GB RAM / 256GB) Cũ Đẹp Chuẩn Zin',
    category: 'macbook-cu',
    subModel: 'macbook-air-cu',
    conditionTag: 'Cũ Đẹp 99%',
    discountPercent: 28,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '17,990,000đ',
    originalPrice: '24,990,000đ',
    downPayment: '5,300,000đ',
    rating: 5,
    href: '/hang-cu/macbook-air-cu',
  },
];

export const USED_HELPFUL_NEWS = [
  {
    id: 'used-news-1',
    title: 'Kinh nghiệm kiểm tra iPhone cũ trước khi xuống tiền: Tránh mua phải máy dựng',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/kinh-nghiem-kiem-tra-iphone-cu',
  },
  {
    id: 'used-news-2',
    title: 'Chính sách bảo hành VIP 12 tháng 1 đổi 1 dành riêng cho máy Like New tại Fogo Store',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/chinh-sach-bao-hanh-may-cu',
  },
  {
    id: 'used-news-3',
    title: 'Có nên mua MacBook Cũ trong năm 2026? Cách check số lần sạc pin chuẩn xác',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/co-nen-mua-macbook-cu',
  },
];

export const RECENTLY_VIEWED_USED = [
  {
    id: 'rec-used-1',
    name: 'iPhone 16 Pro Max 256GB Cũ Like New',
    discountPercent: 22,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
    currentPrice: '24,990,000đ',
    originalPrice: '31,990,000đ',
    downPayment: '7,500,000đ',
    href: '/hang-cu/iphone-16-series-cu',
  },
  {
    id: 'rec-used-2',
    name: 'MacBook Air 13 inch M2 Cũ Đẹp 99%',
    discountPercent: 28,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '17,990,000đ',
    originalPrice: '24,990,000đ',
    downPayment: '5,300,000đ',
    href: '/hang-cu/macbook-air-cu',
  },
];