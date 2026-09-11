export interface ProductVariant {
  storage: string;        // '256GB', '512GB', '1TB'
  color: string;          // 'Cam Vũ Trụ', 'Xanh Đậm', 'Bạc'
  colorHex: string;       // mã màu hiển thị
  slug: string;           // '256gb-cam-vu-tru'
  price: string;
  originalPrice: string;
  discountPercent: number;
  images: string[];
}

export interface IPhoneDetail {
  baseModel: string;      // 'iphone-17-pro'
  name: string;
  brand: string;
  rating: number;
  reviewCount: number;
  storages: string[];
  colors: { name: string; hex: string; thumb: string }[];
  variants: ProductVariant[];
  descriptionHtml: string;
  specs: { [key: string]: string };
}

export const IPHONE_17_PRO_DATA: IPhoneDetail = {
  baseModel: 'iphone-17-pro',
  name: 'iPhone 17 Pro - Chính Hãng VN/A',
  brand: 'Apple',
  rating: 5,
  reviewCount: 48,
  storages: ['256GB', '512GB', '1TB'],
  colors: [
    {
      name: 'Cam Vũ Trụ',
      hex: '#d3733b',
      thumb: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Xanh Đậm',
      hex: '#2b3a4a',
      thumb: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Bạc',
      hex: '#e2e4e5',
      thumb: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80',
    },
  ],
  variants: [
    // 256GB
    {
      storage: '256GB',
      color: 'Cam Vũ Trụ',
      colorHex: '#d3733b',
      slug: '256gb-cam-vu-tru',
      price: '31,290,000đ',
      originalPrice: '34,990,000đ',
      discountPercent: 11,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '256GB',
      color: 'Xanh Đậm',
      colorHex: '#2b3a4a',
      slug: '256gb-xanh-dam',
      price: '31,290,000đ',
      originalPrice: '34,990,000đ',
      discountPercent: 11,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '256GB',
      color: 'Bạc',
      colorHex: '#e2e4e5',
      slug: '256gb-bac',
      price: '31,290,000đ',
      originalPrice: '34,990,000đ',
      discountPercent: 11,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      ],
    },
    // 512GB (Mặc định trong ảnh demo của bạn)
    {
      storage: '512GB',
      color: 'Cam Vũ Trụ',
      colorHex: '#d3733b',
      slug: '512gb-cam-vu-tru',
      price: '37,990,000đ',
      originalPrice: '41,490,000đ',
      discountPercent: 9,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '512GB',
      color: 'Xanh Đậm',
      colorHex: '#2b3a4a',
      slug: '512gb-xanh-dam',
      price: '37,990,000đ',
      originalPrice: '41,490,000đ',
      discountPercent: 9,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '512GB',
      color: 'Bạc',
      colorHex: '#e2e4e5',
      slug: '512gb-bac',
      price: '37,990,000đ',
      originalPrice: '41,490,000đ',
      discountPercent: 9,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      ],
    },
    // 1TB
    {
      storage: '1TB',
      color: 'Cam Vũ Trụ',
      colorHex: '#d3733b',
      slug: '1tb-cam-vu-tru',
      price: '43,990,000đ',
      originalPrice: '47,990,000đ',
      discountPercent: 8,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '1TB',
      color: 'Xanh Đậm',
      colorHex: '#2b3a4a',
      slug: '1tb-xanh-dam',
      price: '43,990,000đ',
      originalPrice: '47,990,000đ',
      discountPercent: 8,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      storage: '1TB',
      color: 'Bạc',
      colorHex: '#e2e4e5',
      slug: '1tb-bac',
      price: '43,990,000đ',
      originalPrice: '47,990,000đ',
      discountPercent: 8,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ],
  specs: {
    'Màn hình': '6.3 inch Super Retina XDR OLED, 120Hz ProMotion',
    'Độ phân giải': '2622 x 1206 pixels, 460 ppi',
    'Chip xử lý': 'Apple A19 Pro (3nm thế hệ mới), Ray Tracing phần cứng',
    'RAM': '8GB',
    'Bộ nhớ trong': '256GB / 512GB / 1TB',
    'Camera sau': 'Chính 48MP + Góc siêu rộng 48MP + Telephoto 48MP (Zoom 5x)',
    'Camera trước': '12MP TrueDepth, khẩu độ f/1.9',
    'Pin & Sạc': 'Xem video liên tục 27 giờ, Sạc nhanh 50% trong 30 phút, MagSafe 25W',
    'Hệ điều hành': 'iOS 20',
    'Chất liệu': 'Khung viền Titanium cấp 5, Mặt kính Ceramic Shield thế hệ mới',
    'Trọng lượng': '199 gram',
  },
  descriptionHtml: `
    <h3>Đánh giá chi tiết iPhone 17 Pro: Đỉnh cao công nghệ và thiết kế</h3>
    <p>iPhone 17 Pro tiếp tục khẳng định vị thế dẫn đầu phân khúc smartphone cao cấp với khung viền Titanium siêu bền nhẹ, trang bị con chip A19 Pro xử lý các tác vụ AI và đồ họa game AAA ấn tượng.</p>
    <h4>Hệ thống Camera 48MP toàn diện</h4>
    <p>Cả 3 ống kính phía sau đều nâng cấp lên độ phân giải 48MP sắc nét, kết hợp nút điều khiển Camera Control hỗ trợ chuyển đổi tiêu cự và chụp ảnh nhanh chóng.</p>
    <h4>Màn hình sáng vượt trội cùng thời lượng pin bền bỉ</h4>
    <p>Tấm nền OLED đạt độ sáng tối đa 2.000 nits hiển thị rõ nét ngoài trời nắng gắt. Công nghệ ProMotion 120Hz tự động điều chỉnh giúp tối ưu thời lượng pin lên đến hơn một ngày sử dụng.</p>
  `,
};

export const RELATED_PRODUCTS = [
  {
    id: 'rel-1',
    name: 'iPhone 17 Pro Max 256GB - Chính hãng VN',
    price: '33,990,000đ',
    originalPrice: '37,990,000đ',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=300&q=80',
    href: '/iphone/iphone-17-pro-max/256gb-cam-vu-tru',
  },
  {
    id: 'rel-2',
    name: 'iPhone 17 256GB - Chính hãng VN',
    price: '23,890,000đ',
    originalPrice: '24,990,000đ',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
    href: '/iphone/iphone-17/256gb-den',
  },
  {
    id: 'rel-3',
    name: 'Củ sạc nhanh Apple 20W Type-C',
    price: '450,000đ',
    originalPrice: '590,000đ',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80',
    href: '/phu-kien/sac-cap',
  },
  {
    id: 'rel-4',
    name: 'Ốp lưng MagSafe iPhone 17 Pro',
    price: '1,190,000đ',
    originalPrice: '1,450,000đ',
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=300&q=80',
    href: '/phu-kien/op-lung',
  },
];