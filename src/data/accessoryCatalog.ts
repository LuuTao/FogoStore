export interface AccessoryItem {
  id: string;
  name: string;
  series: string;     // 'sac-cap', 'tai-nghe', 'op-lung', 'cuong-luc', 'phu-kien-mac'
  subModel: string;   // 'cu-sac-apple', 'cap-type-c', 'airpods-4', 'airpods-pro-2', 'apple-pencil'
  discountPercent: number;
  imageUrl: string;
  currentPrice: string;
  originalPrice: string;
  downPayment: string;
  statusTag?: string;
  rating?: number;
  href: string;
}

export const ACCESSORY_CATALOG_ITEMS: AccessoryItem[] = [
  // ================= TAI NGHE & ÂM THANH =================
  {
    id: 'acc-airpods-pro-2-usbc',
    name: 'Tai nghe Apple AirPods Pro 2 (USB-C) Chống Ồn Chủ Động 2X',
    series: 'tai-nghe',
    subModel: 'airpods-pro-2',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
    currentPrice: '5,390,000đ',
    originalPrice: '6,190,000đ',
    downPayment: '1,500,000đ',
    statusTag: 'BÁN CHẠY',
    rating: 5,
    href: '/phu-kien/tai-nghe/airpods-pro-2-usbc',
  },
  {
    id: 'acc-airpods-4-anc',
    name: 'Tai nghe Apple AirPods 4 (Bản Có Chống Ồn ANC) Chính Hãng VN/A',
    series: 'tai-nghe',
    subModel: 'airpods-4',
    discountPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=400&q=80',
    currentPrice: '4,390,000đ',
    originalPrice: '4,790,000đ',
    downPayment: '1,200,000đ',
    rating: 5,
    href: '/phu-kien/tai-nghe/airpods-4-anc',
  },

  // ================= CỦ SẠC & DÂY CÁP =================
  {
    id: 'acc-adapter-apple-20w',
    name: 'Củ sạc nhanh Apple 20W Type-C Chính Hãng VN/A',
    series: 'sac-cap',
    subModel: 'cu-sac-apple',
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '450,000đ',
    originalPrice: '590,000đ',
    downPayment: '100,000đ',
    statusTag: 'HOT DEAL',
    rating: 5,
    href: '/phu-kien/sac-cap/apple-20w-usbc',
  },
  {
    id: 'acc-cable-apple-usbc-60w',
    name: 'Cáp sạc dệt Apple Type-C to Type-C 60W (1 mét)',
    series: 'sac-cap',
    subModel: 'cap-type-c',
    discountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    currentPrice: '490,000đ',
    originalPrice: '580,000đ',
    downPayment: '150,000đ',
    rating: 5,
    href: '/phu-kien/sac-cap/cable-apple-usbc-60w',
  },
  {
    id: 'acc-magsafe-charger',
    name: 'Đế sạc không dây Apple MagSafe Charger 15W Hít Nam Châm',
    series: 'sac-cap',
    subModel: 'cu-sac-apple',
    discountPercent: 10,
    imageUrl: 'https://images.unsplash.com/photo-1622445268045-81766c61be33?auto=format&fit=crop&w=400&q=80',
    currentPrice: '1,090,000đ',
    originalPrice: '1,190,000đ',
    downPayment: '300,000đ',
    rating: 5,
    href: '/phu-kien/sac-cap/apple-magsafe-charger',
  },

  // ================= BÚT & BÀN PHÍM IPAD/MAC =================
  {
    id: 'acc-apple-pencil-pro',
    name: 'Bút cảm ứng Apple Pencil Pro (Cảm ứng bóp & Phản hồi rung)',
    series: 'phu-kien-mac',
    subModel: 'apple-pencil',
    discountPercent: 9,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '3,190,000đ',
    originalPrice: '3,490,000đ',
    downPayment: '900,000đ',
    rating: 5,
    href: '/phu-kien/phu-kien-mac/apple-pencil-pro',
  },
  {
    id: 'acc-magic-keyboard-ipad-11',
    name: 'Bàn phím Magic Keyboard Apple cho iPad Pro 11 M4 - Nhôm Nguyên Khối',
    series: 'phu-kien-mac',
    subModel: 'magic-keyboard',
    discountPercent: 7,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
    currentPrice: '7,690,000đ',
    originalPrice: '8,290,000đ',
    downPayment: '2,200,000đ',
    statusTag: 'CAO CẤP',
    rating: 5,
    href: '/phu-kien/phu-kien-mac/magic-keyboard-ipad-11',
  },

  // ================= ỐP LƯNG & CƯỜNG LỰC =================
  {
    id: 'acc-op-silicone-magsafe',
    name: 'Ốp lưng Silicone Apple MagSafe cho iPhone 16 / 17 Series',
    series: 'op-lung',
    subModel: 'op-magsafe',
    discountPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80',
    currentPrice: '1,190,000đ',
    originalPrice: '1,450,000đ',
    downPayment: '350,000đ',
    rating: 5,
    href: '/phu-kien/op-lung/apple-silicone-case-magsafe',
  },
  {
    id: 'acc-cuong-luc-kingkong',
    name: 'Kính cường lực KingKong Full viền 9D chống xước và va đập',
    series: 'cuong-luc',
    subModel: 'cuong-luc-iphone',
    discountPercent: 35,
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '190,000đ',
    originalPrice: '290,000đ',
    downPayment: '50,000đ',
    statusTag: 'GIÁ SỐC',
    rating: 5,
    href: '/phu-kien/cuong-luc/kingkong-9d-full',
  },
  {
    id: 'acc-airtag-single',
    name: 'Thiết bị định vị đồ đạc Apple AirTag 1 Pack Chính Hãng',
    series: 'phu-kien-mac',
    subModel: 'airtag',
    discountPercent: 14,
    imageUrl: 'https://images.unsplash.com/photo-1622445268045-81766c61be33?auto=format&fit=crop&w=400&q=80',
    currentPrice: '690,000đ',
    originalPrice: '799,000đ',
    downPayment: '200,000đ',
    rating: 5,
    href: '/phu-kien/phu-kien-mac/apple-airtag-1-pack',
  },
];

export const ACCESSORY_HELPFUL_NEWS = [
  {
    id: 'acc-news-1',
    title: 'Cách phân biệt củ sạc Apple 20W chính hãng và hàng nhái trôi nổi trên thị trường',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/phan-biet-cu-sac-apple-chinh-hang',
  },
  {
    id: 'acc-news-2',
    title: 'AirPods 4 ANC vs AirPods Pro 2: Chênh lệch hơn 1 triệu, trải nghiệm có khác biệt?',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/airpods-4-anc-vs-pro-2',
  },
  {
    id: 'acc-news-3',
    title: 'Những loại phụ kiện bắt buộc phải sắm ngay khi vừa đập hộp iPhone mới',
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=200&q=80',
    href: '/tin-tuc/phu-kien-can-thiet-cho-iphone',
  },
];

export const RECENTLY_VIEWED_ACCESSORIES = [
  {
    id: 'rec-acc-1',
    name: 'Củ sạc nhanh Apple 20W Type-C',
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    currentPrice: '450,000đ',
    originalPrice: '590,000đ',
    downPayment: '100,000đ',
    href: '/phu-kien/sac-cap/apple-20w-usbc',
  },
  {
    id: 'rec-acc-2',
    name: 'Tai nghe Apple AirPods Pro 2 (USB-C)',
    discountPercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
    currentPrice: '5,390,000đ',
    originalPrice: '6,190,000đ',
    downPayment: '1,500,000đ',
    href: '/phu-kien/tai-nghe/airpods-pro-2-usbc',
  },
];