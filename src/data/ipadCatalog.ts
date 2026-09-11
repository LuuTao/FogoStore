export interface IPadItem {
  id: string;
  name: string;
  series: string;     // 'ipad-pro', 'ipad-air', 'ipad-gen', 'ipad-mini'
  subModel: string;   // 'ipad-pro-m5', 'ipad-pro-m4', 'ipad-pro-m2', 'ipad-air-m4', 'ipad-air-7', 'ipad-air-6', 'ipad-air-5', 'ipad-gen-11', 'ipad-mini-7'
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  statusTag?: string;
  rating?: number;
  href: string;
}

export const IPAD_CATALOG_ITEMS: IPadItem[] = [
  // ================= iPAD PRO M5, M4, M2 =================
  {
    id: 'ipad-pro-m5-256',
    name: 'iPad Pro 13 inch M5 Wi-Fi 256GB - Thế Hệ Đột Phá AI',
    series: 'ipad-pro',
    subModel: 'ipad-pro-m5',
    discountPercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '38,990,000đ',
    originalPrice: '40,990,000đ',
    downPayment: '11,500,000đ',
    statusTag: 'HÀNG MỚI VỀ',
    rating: 5,
    href: '/ipad/ipad-pro-m5',
  },
  {
    id: 'ipad-pro-m4-256',
    name: 'iPad Pro 11 inch M4 Wi-Fi 256GB - Ultra Retina XDR OLED',
    series: 'ipad-pro',
    subModel: 'ipad-pro-m4',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    currentPrice: '26,990,000đ',
    originalPrice: '28,990,000đ',
    downPayment: '8,100,000đ',
    rating: 5,
    href: '/ipad/ipad-pro-m4',
  },
  {
    id: 'ipad-pro-m2-128',
    name: 'iPad Pro 11 inch M2 Wi-Fi 128GB - Đồ Họa Cực Đỉnh',
    series: 'ipad-pro',
    subModel: 'ipad-pro-m2',
    discountPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '18,490,000đ',
    originalPrice: '22,490,000đ',
    downPayment: '5,500,000đ',
    statusTag: 'GIÁ XẢ KHO',
    rating: 5,
    href: '/ipad/ipad-pro-m2',
  },

  // ================= iPAD AIR M4, AIR 7, AIR 6, AIR 5 =================
  {
    id: 'ipad-air-m4-128',
    name: 'iPad Air 11 inch M4 Wi-Fi 128GB - Hiệu Năng Vượt Trội',
    series: 'ipad-air',
    subModel: 'ipad-air-m4',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '17,490,000đ',
    originalPrice: '18,990,000đ',
    downPayment: '5,200,000đ',
    statusTag: 'SIÊU PHẨM',
    rating: 5,
    href: '/ipad/ipad-air-m4',
  },
  {
    id: 'ipad-air-7-128',
    name: 'iPad Air 7 13 inch Wi-Fi 128GB - Màn Lớn Đa Nhiệm Mới',
    series: 'ipad-air',
    subModel: 'ipad-air-7',
    discountPercent: 6,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    currentPrice: '21,990,000đ',
    originalPrice: '23,490,000đ',
    downPayment: '6,500,000đ',
    href: '/ipad/ipad-air-7',
  },
  {
    id: 'ipad-air-6-128',
    name: 'iPad Air 6 11 inch M2 Wi-Fi 128GB - Chính Hãng VN/A',
    series: 'ipad-air',
    subModel: 'ipad-air-6',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '14,990,000đ',
    originalPrice: '16,990,000đ',
    downPayment: '4,500,000đ',
    rating: 5,
    href: '/ipad/ipad-air-6',
  },
  {
    id: 'ipad-air-5-64',
    name: 'iPad Air 5 M1 Wi-Fi 64GB - Thiết Kế Mỏng Nhẹ Thời Thượng',
    series: 'ipad-air',
    subModel: 'ipad-air-5',
    discountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '12,290,000đ',
    originalPrice: '15,490,000đ',
    downPayment: '3,600,000đ',
    rating: 5,
    href: '/ipad/ipad-air-5',
  },

  // ================= iPAD GEN 11 =================
  {
    id: 'ipad-gen-11-128',
    name: 'iPad Gen 11 10.9 inch Wi-Fi 128GB - Chip A16 Mạnh Mẽ',
    series: 'ipad-gen',
    subModel: 'ipad-gen-11',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '9,990,000đ',
    originalPrice: '10,990,000đ',
    downPayment: '2,900,000đ',
    statusTag: 'BÁN CHẠY',
    rating: 5,
    href: '/ipad/ipad-gen-11',
  },
  {
    id: 'ipad-gen-11-256',
    name: 'iPad Gen 11 10.9 inch Wi-Fi 256GB - Sắc Màu Trẻ Trung',
    series: 'ipad-gen',
    subModel: 'ipad-gen-11',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    currentPrice: '12,990,000đ',
    originalPrice: '13,990,000đ',
    downPayment: '3,900,000đ',
    href: '/ipad/ipad-gen-11',
  },

  // ================= iPAD MINI 7 =================
  {
    id: 'ipad-mini-7-128',
    name: 'iPad Mini 7 (A17 Pro) Wi-Fi 128GB - Bỏ Túi Tiện Lợi',
    series: 'ipad-mini',
    subModel: 'ipad-mini-7',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    currentPrice: '13,490,000đ',
    originalPrice: '14,490,000đ',
    downPayment: '4,000,000đ',
    statusTag: 'APPLE INTELLIGENCE',
    rating: 5,
    href: '/ipad/ipad-mini-7',
  },
  {
    id: 'ipad-mini-7-256',
    name: 'iPad Mini 7 (A17 Pro) 5G 256GB - Xám Không Gian',
    series: 'ipad-mini',
    subModel: 'ipad-mini-7',
    discountPercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '19,990,000đ',
    originalPrice: '20,990,000đ',
    downPayment: '6,000,000đ',
    rating: 5,
    href: '/ipad/ipad-mini-7',
  },
];

export const IPAD_HELPFUL_NEWS = [
  {
    id: 'ipd-news-1',
    title: 'So sánh iPad Pro M5, M4 và M2: Đâu là lựa chọn cấu hình kinh tế nhất?',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/so-sanh-ipad-pro-m5-m4-m2',
  },
  {
    id: 'ipd-news-2',
    title: 'Đánh giá iPad Gen 11: Mẫu máy tính bảng quốc dân hoàn hảo cho học tập',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/danh-gia-ipad-gen-11',
  },
  {
    id: 'ipd-news-3',
    title: 'iPad Mini 7 với chip A17 Pro: Sức mạnh đồ họa đỉnh cao trong thân hình nhỏ gọn',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/ipad-mini-7-a17-pro',
  },
];

export const RECENTLY_VIEWED_IPAD = [
  {
    id: 'rec-ipd-1',
    name: 'iPad Pro 11 inch M4 256GB',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '26,990,000đ',
    originalPrice: '28,990,000đ',
    downPayment: '8,100,000đ',
    href: '/ipad/ipad-pro-m4',
  },
  {
    id: 'rec-ipd-2',
    name: 'iPad Air 6 11 inch M2 128GB',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80',
    currentPrice: '14,990,000đ',
    originalPrice: '16,990,000đ',
    downPayment: '4,500,000đ',
    href: '/ipad/ipad-air-6',
  },
];