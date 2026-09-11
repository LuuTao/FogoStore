export interface SubMenuItem {
  name: string;
  href: string;
  isNew?: boolean;
}

export interface MenuGroup {
  groupTitle: string;
  href: string;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  badge?: string;
  groups?: MenuGroup[];
}

export const MENU_DATA: MenuItem[] = [
  // ================= 1. iPHONE =================
  {
    id: 'iphone',
    title: 'iPhone',
    href: '/iphone',
    badge: 'HOT',
    groups: [
     // Trong MENU_DATA -> mục iPhone -> groups:
    {
      groupTitle: 'iPhone 16 Series',
      // SỬA TẠI ĐÂY: Đổi thành /iphone/iphone-16-series hoặc /iphone?series=16
      href: '/iphone/iphone-16-series', 
      items: [
        { name: 'iPhone 16 Pro Max', href: '/san-pham/iphone-16-pro-max' },
        { name: 'iPhone 16 Pro', href: '/san-pham/iphone-16-pro' },
        { name: 'iPhone 16 Plus', href: '/san-pham/iphone-16-plus' },
        { name: 'iPhone 16', href: '/san-pham/iphone-16' },
      ],
    },
    {
      groupTitle: 'iPhone 15 Series',
      href: '/iphone/iphone-15-series',
      items: [
        { name: 'iPhone 15 Pro Max', href: '/san-pham/iphone-15-pro-max' },
        { name: 'iPhone 15 Pro', href: '/san-pham/iphone-15-pro' },
        { name: 'iPhone 15 Plus', href: '/san-pham/iphone-15-plus' },
        { name: 'iPhone 15', href: '/san-pham/iphone-15' },
      ],
    },
// Các dòng iPhone 14, 13, 17 tương tự...
      {
        groupTitle: 'iPhone 15 Series',
        href: '/iphone/iphone-15-series',
        items: [
          { name: 'iPhone 15 Pro Max', href: '/iphone/iphone-15-pro-max' },
          { name: 'iPhone 15 Pro', href: '/iphone/iphone-15-pro' },
          { name: 'iPhone 15 Plus', href: '/iphone/iphone-15-plus' },
          { name: 'iPhone 15', href: '/iphone/iphone-15' },
        ],
      },
      {
        groupTitle: 'iPhone 14 Series',
        href: '/iphone/iphone-14-series',
        items: [
          { name: 'iPhone 14 Pro Max', href: '/iphone/iphone-14-pro-max' },
          { name: 'iPhone 14 Pro', href: '/iphone/iphone-14-pro' },
          { name: 'iPhone 14 Plus', href: '/iphone/iphone-14-plus' },
          { name: 'iPhone 14', href: '/iphone/iphone-14' },
        ],
      },
    ],
  },

  // ================= 2. iPAD =================
  {
    id: 'ipad',
    title: 'iPad',
    href: '/ipad',
    badge: 'NEW',
    groups: [
      {
        groupTitle: 'iPad Pro',
        href: '/ipad/ipad-pro',
        items: [
          { name: 'iPad Pro M5', href: '/ipad/ipad-pro-m5', isNew: true },
          { name: 'iPad Pro M4', href: '/ipad/ipad-pro-m4' },
          { name: 'iPad Pro M2', href: '/ipad/ipad-pro-m2' },
        ],
      },
      {
        groupTitle: 'iPad Air',
        href: '/ipad/ipad-air',
        items: [
          { name: 'iPad Air M4', href: '/ipad/ipad-air-m4', isNew: true },
          { name: 'iPad Air 7', href: '/ipad/ipad-air-7' },
          { name: 'iPad Air 6', href: '/ipad/ipad-air-6' },
          { name: 'iPad Air 5', href: '/ipad/ipad-air-5' },
        ],
      },
      {
        groupTitle: 'iPad Gen',
        href: '/ipad/ipad-gen',
        items: [
          { name: 'iPad Gen 11', href: '/ipad/ipad-gen-11', isNew: true },
        ],
      },
      {
        groupTitle: 'iPad Mini',
        href: '/ipad/ipad-mini',
        items: [
          { name: 'iPad Mini 7', href: '/ipad/ipad-mini-7' },
        ],
      },
    ],
  },

  // ================= 3. MACBOOK =================
  {
    id: 'macbook',
    title: 'MacBook',
    href: '/macbook',
    badge: 'NEW',
    groups: [
      {
        groupTitle: 'MacBook Pro',
        href: '/macbook/macbook-pro',
        items: [
          { name: 'MacBook Pro M5 (2026)', href: '/macbook/macbook-pro-m5', isNew: true },
          { name: 'MacBook Pro M4 (2025)', href: '/macbook/macbook-pro-m4' },
          { name: 'MacBook Pro M3 (2024)', href: '/macbook/macbook-pro-m3' },
          { name: 'MacBook Pro M2 (2023)', href: '/macbook/macbook-pro-m2' },
          { name: 'MacBook Pro M1 (2021)', href: '/macbook/macbook-pro-m1' },
        ],
      },
      {
        groupTitle: 'MacBook Air',
        href: '/macbook/macbook-air',
        items: [
          { name: 'MacBook Air M5 (2026)', href: '/macbook/macbook-air-m5', isNew: true },
          { name: 'MacBook Air M4 (2025)', href: '/macbook/macbook-air-m4' },
          { name: 'MacBook Air M3 (2024)', href: '/macbook/macbook-air-m3' },
          { name: 'MacBook Air M2 (2022)', href: '/macbook/macbook-air-m2' },
          { name: 'MacBook Air M1 (2020)', href: '/macbook/macbook-air-m1' },
        ],
      },
      {
        groupTitle: 'MacBook Neo',
        href: '/macbook/macbook-neo',
        items: [
          { name: 'MacBook NEO (2026)', href: '/macbook/macbook-neo-2026', isNew: true },
        ],
      },
    ],
  },

  // ================= 4. HÀNG CŨ =================
    {
      id: 'hang-cu',
      title: 'Hàng Cũ',
      href: '/hang-cu',
      groups: [
        {
          groupTitle: 'iPhone Cũ',
          href: '/hang-cu/iphone-cu',
          items: [
            { name: 'iPhone 17 Series Cũ', href: '/hang-cu/iphone-17-series-cu', isNew: true },
            { name: 'iPhone 16 Series Cũ', href: '/hang-cu/iphone-16-series-cu' },
            { name: 'iPhone 15 Series Cũ', href: '/hang-cu/iphone-15-series-cu' },
            { name: 'iPhone 14 Series Cũ', href: '/hang-cu/iphone-14-series-cu' },
          ],
        },
        {
          groupTitle: 'iPad Cũ',
          href: '/hang-cu/ipad-cu',
          items: [
            { name: 'iPad Pro Cũ', href: '/hang-cu/ipad-pro-cu' },
            { name: 'iPad Air Cũ', href: '/hang-cu/ipad-air-cu' },
            { name: 'iPad Gen Cũ', href: '/hang-cu/ipad-gen-cu' },
            { name: 'iPad Mini Cũ', href: '/hang-cu/ipad-mini-cu' },
          ],
        },
        {
          groupTitle: 'MacBook Cũ',
          href: '/hang-cu/macbook-cu',
          items: [
            { name: 'MacBook Pro Cũ', href: '/hang-cu/macbook-pro-cu' },
            { name: 'MacBook Air Cũ', href: '/hang-cu/macbook-air-cu' },
          ],
        },
      ],
    },

  // ================= 5. WATCH =================
  {
    id: 'watch',
    title: 'Watch',
    href: '/watch',
    groups: [
      {
        groupTitle: 'Apple Watch Ultra',
        href: '/watch/watch-ultra',
        items: [
          { name: 'Watch Ultra 2', href: '/watch/watch-ultra-2' },
          { name: 'Watch Ultra 1', href: '/watch/watch-ultra-1' },
        ],
      },
      {
        groupTitle: 'Apple Watch Series',
        href: '/watch/watch-series',
        items: [
          { name: 'Watch Series 10', href: '/watch/watch-series-10' },
          { name: 'Watch Series 9', href: '/watch/watch-series-9' },
          { name: 'Watch Series 8', href: '/watch/watch-series-8' },
        ],
      },
      {
        groupTitle: 'Apple Watch SE',
        href: '/watch/watch-se',
        items: [
          { name: 'Watch SE 2 (2024)', href: '/watch/watch-se-2' },
          { name: 'Watch SE 1', href: '/watch/watch-se-1' },
        ],
      },
    ],
  },

  // ================= 6. PHỤ KIỆN =================
  {
    id: 'phu-kien',
    title: 'Phụ kiện',
    href: '/phu-kien',
    groups: [
      {
        groupTitle: 'Sạc & Cáp',
        href: '/phu-kien/sac-cap',
        items: [
          { name: 'Củ sạc nhanh 20W', href: '/phu-kien/sac-cap' },
          { name: 'Dây cáp Type-C', href: '/phu-kien/sac-cap' },
        ],
      },
      {
        groupTitle: 'Âm thanh',
        href: '/phu-kien/tai-nghe',
        items: [
          { name: 'AirPods Pro 2', href: '/phu-kien/tai-nghe' },
          { name: 'AirPods 4 ANC', href: '/phu-kien/tai-nghe' },
        ],
      },
      {
        groupTitle: 'Bảo vệ máy',
        href: '/phu-kien/op-lung',
        items: [
          { name: 'Ốp lưng MagSafe', href: '/phu-kien/op-lung' },
          { name: 'Kính cường lực', href: '/phu-kien/cuong-luc' },
        ],
      },
    ],
  },
];