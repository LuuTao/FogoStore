export interface FullBanner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  studentDiscount?: string;
  cardDiscount?: string;
  imageUrl: string;
  link: string;
}

// 1. Banner lớn tràn viền 100% (dùng ảnh ngang đồ họa có sẵn chữ/sản phẩm)
export const HERO_BANNERS: FullBanner[] = [
  {
    id: 'hero-1',
    title: 'Ưu đãi giờ vàng Deal cực đậm',
    // Ảnh đồ họa tông vàng cam như ảnh mẫu
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
    link: '/deal-gio-vang',
  },
  {
    id: 'hero-2',
    title: 'MacBook Air M5 Siêu mạnh mẽ',
    // Ảnh công nghệ tông xanh tím sang trọng
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80',
    link: '/macbook',
  },
  {
    id: 'hero-3',
    title: 'iPhone 17 Series Mới',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1920&q=80',
    link: '/iphone',
  },
];

// 2. Danh sách banner đôi tự trượt (mỗi cặp gồm 2 sản phẩm chữ nhật ngang)
export const PROMO_PAIRS: PromoBanner[][] = [
  // Cặp 1: AirPods 4 & Apple Watch SE3
  [
    {
      id: 'sub-1',
      title: 'AirPods 4',
      price: '2.x90.000đ',
      studentDiscount: 'HSSV giảm đến 150K',
      cardDiscount: 'Ưu đãi thanh toán đến 700K',
      imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=400&q=80',
      link: '/phu-kien/airpods-4',
    },
    {
      id: 'sub-2',
      title: 'Apple Watch SE 3',
      subtitle: 'Đi cùng. Trò chuyện. Theo sát. Mãi yêu.',
      price: '6.x90.000đ',
      studentDiscount: 'HSSV giảm đến 100K',
      cardDiscount: 'Ưu đãi thanh toán đến 700K',
      imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
      link: '/watch/se-3',
    },
  ],
  // Cặp 2: AirPods Pro 3 & iPad Air 6
  [
    {
      id: 'sub-3',
      title: 'AirPods Pro 3',
      subtitle: 'Nay với Cảm Biến Nhịp Tim.',
      price: '5.x90.000đ',
      studentDiscount: 'HSSV giảm đến 100K',
      cardDiscount: 'Ưu đãi thanh toán đến 700K',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
      link: '/phu-kien/airpods-pro-3',
    },
    {
      id: 'sub-4',
      title: 'iPad Air 6 M2',
      subtitle: 'Mạnh mẽ vượt trội với M2.',
      price: '14.x90.000đ',
      studentDiscount: 'HSSV giảm đến 300K',
      cardDiscount: 'Ưu đãi thanh toán đến 500K',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
      link: '/ipad/ipad-air-6',
    },
  ],
];