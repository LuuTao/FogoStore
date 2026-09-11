export interface CategoryProduct {
  id: string;
  name: string;
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  statusTag?: string;
  rating?: number;
  href: string;
}

export interface NewsCard {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

export const HELPFUL_NEWS: NewsCard[] = [
  {
    id: 'hn-1',
    title: 'Vì sao iPhone e có giá "hời" hơn nhiều so với phiên bản tiêu chuẩn?',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/vi-sao-iphone-e-gia-hoi',
  },
  {
    id: 'hn-2',
    title: 'Tặng combo cốc sạc và ốp khi mua bảo hành VIP 12 tháng',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/tang-combo-coc-sac-op',
  },
  {
    id: 'hn-3',
    title: 'Vivo V70 Lite trình làng với thiết kế lấy cảm hứng từ iPhone 17',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/vivo-v70-lite-iphone-17',
  },
  {
    id: 'hn-4',
    title: 'Bảng giá iPhone 17 Pro Max tháng 9/2026 và kinh nghiệm chọn mua',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/bang-gia-iphone-17-pro-max',
  },
  {
    id: 'hn-5',
    title: 'Apple bất ngờ phát hành iOS 26.5.1 sửa lỗi sạc nghiêm trọng',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/ios-26-sua-loi-sac',
  },
  {
    id: 'hn-6',
    title: 'Săn iPhone 17 Pro Max giảm đến 500K khung giờ vàng',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/san-sale-khung-gio-vang',
  },
];

export const RECENTLY_VIEWED_PRODUCTS: CategoryProduct[] = [
  {
    id: 'recent-1',
    name: 'iPhone 17e 512GB',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
    currentPrice: '22,990,000đ',
    originalPrice: '24,490,000đ',
    downPayment: '6,900,000đ',
    statusTag: 'SẮP VỀ HÀNG',
    href: '/iphone/iphone-17-series',
  },
  {
    id: 'recent-2',
    name: 'iPhone 17e 256GB',
    discountPercent: 4,
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80',
    currentPrice: '17,290,000đ',
    originalPrice: '17,990,000đ',
    downPayment: '3,500,000đ',
    href: '/iphone/iphone-17-series',
  },
];