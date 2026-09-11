export interface BlogPost {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  href: string;
}

export interface CommitmentBanner {
  id: string;
  titleBadge: string;
  mainBadge: string;
  subBadge?: string;
  imageUrl: string;
}

export const MAIN_FEATURED_POST: BlogPost = {
  id: 'post-main',
  title: 'iPad Pro M4 cũ sau 2 năm: Hiệu năng còn mạnh không?',
  date: '08 Tháng 08, 2026',
  imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  href: '/tin-tuc/ipad-pro-m4-sau-2-nam',
};

export const SIDE_POSTS: BlogPost[] = [
  {
    id: 'side-1',
    title: 'iPad Air M4 cũ: 5 lý do vẫn đáng mua trong năm 2026',
    date: '08 Tháng 08, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=300&q=80',
    href: '/tin-tuc/ipad-air-m4-cu-ly-do-mua',
  },
  {
    id: 'side-2',
    title: 'MacBook Air M5 15 inch: Có đáng chọn thay bản 13 inch?',
    date: '08 Tháng 08, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
    href: '/tin-tuc/macbook-air-m5-15-inch',
  },
  {
    id: 'side-3',
    title: 'iPad Pro M5 cũ 256GB có đủ dùng cho công việc?',
    date: '07 Tháng 08, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=300&q=80',
    href: '/tin-tuc/ipad-pro-m5-256gb',
  },
  {
    id: 'side-4',
    title: 'iPad Pro M4 cũ edit video: Có đủ sức thay laptop?',
    date: '07 Tháng 08, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
    href: '/tin-tuc/ipad-pro-m4-cu-edit-video',
  },
];

export const COMMITMENT_BANNERS: CommitmentBanner[] = [
  {
    id: 'commit-1',
    titleBadge: 'ĐI ĐẦU VỀ CHẾ ĐỘ',
    mainBadge: 'BẢO HÀNH VÀ HẬU MÃI',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'commit-2',
    titleBadge: 'MINH BẠCH',
    mainBadge: 'SẢN PHẨM',
    subBadge: 'GIÁ BÁN NIÊM YẾT',
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'commit-3',
    titleBadge: 'PHỤC VỤ',
    mainBadge: 'TẬN TÂM.',
    subBadge: 'TƯ VẤN CHÍNH XÁC',
    imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'commit-4',
    titleBadge: 'CAM KẾT',
    mainBadge: 'CHÍNH HÃNG 100%',
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=600&q=80',
  },
];