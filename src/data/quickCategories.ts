export interface QuickCategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  // --- Hàng 1: Dòng máy iPhone & Phụ kiện chủ lực ---
  {
    id: '1',
    name: 'iPhone 18 Pro Max',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80',
    href: '/iphone/18-pro-max',
  },
  {
    id: '2',
    name: 'iPhone 17 Pro Max',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80',
    href: '/iphone/17-pro-max',
  },
  {
    id: '3',
    name: 'iPhone 17',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80',
    href: '/iphone/17',
  },
  {
    id: '4',
    name: 'iPhone 17 Air',
    imageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=200&q=80',
    href: '/iphone/17-air',
  },
  {
    id: '5',
    name: 'iPhone 16 Series',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=200&q=80',
    href: '/iphone/iphone-16-series',
  },
  {
    id: '6',
    name: 'Ốp lưng iPhone',
    imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=200&q=80',
    href: '/phu-kien/iphone',
  },
  {
    id: '7',
    name: 'Kính Cường Lực',
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80',
    href: '/phu-kien/cuong-luc',
  },
  {
    id: '8',
    name: 'iPad Pro',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80',
    href: '/ipad/ipad-pro',
  },
  {
    id: '9',
    name: 'Apple Watch',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=80',
    href: '/watch',
  },
  {
    id: '10',
    name: 'MacBook Pro',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80',
    href: '/macbook/macbook-pro',
  },

  // --- Hàng 2: MacBook Neo, iPad & Dòng máy Hàng Cũ ---
  {
    id: '11',
    name: 'MacBook Neo (2026)',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
    href: '/macbook/macbook-neo-2026',
  },
  {
    id: '12',
    name: 'MacBook Air',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=80',
    href: '/macbook/macbook-air',
  },
  {
    id: '13',
    name: 'iPad Air M4',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=200&q=80',
    href: '/ipad/ipad-air',
  },
  {
    id: '14',
    name: 'iPad Mini',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80',
    href: '/ipad/ipad-mini',
  },
  {
    id: '15',
    name: 'Watch Ultra',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    href: '/watch/ultra',
  },
  {
    id: '16',
    name: 'Phụ kiện iPad',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-40742fba7b10?auto=format&fit=crop&w=200&q=80',
    href: '/phu-kien/ipad',
  },
  {
    id: '17',
    name: 'Phụ kiện Mac',
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=200&q=80',
    href: '/phu-kien/macbook',
  },
  {
    id: '18',
    name: 'iPhone Cũ Giá Rẻ',
    imageUrl: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=200&q=80',
    href: '/hang-cu/iphone-cu',
  },
  {
    id: '19',
    name: 'iPad Cũ 99%',
    imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=200&q=80',
    href: '/hang-cu/ipad-cu',
  },
  {
    id: '20',
    name: 'MacBook Cũ 99%',
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=200&q=80',
    href: '/hang-cu/macbook-cu',
  },
];