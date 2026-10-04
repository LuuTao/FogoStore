import type { Metadata } from 'next';
import { absoluteUrl, slugFromParam } from '@/lib/seo';

type CategoryKey = 'iphone' | 'ipad' | 'macbook' | 'watch' | 'phu-kien' | 'hang-cu';

const CATEGORY_META: Record<CategoryKey, { label: string; description: string; image: string }> = {
  iphone: {
    label: 'iPhone chính hãng',
    description: 'Mua iPhone chính hãng, nhiều dung lượng và màu sắc, giá tốt, bảo hành uy tín tại Fogo Store.',
    image: '/noi-bat/banneriphone.webp',
  },
  ipad: {
    label: 'iPad chính hãng',
    description: 'Mua iPad chính hãng, nhiều phiên bản và dung lượng, giá tốt, bảo hành uy tín tại Fogo Store.',
    image: '/noi-bat/banneripad.webp',
  },
  macbook: {
    label: 'MacBook chính hãng',
    description: 'Mua MacBook Air, MacBook Pro chính hãng, nhiều cấu hình, giá tốt tại Fogo Store.',
    image: '/noi-bat/bannermacbook.webp',
  },
  watch: {
    label: 'Apple Watch chính hãng',
    description: 'Mua Apple Watch chính hãng, nhiều kích thước và màu sắc, giá tốt tại Fogo Store.',
    image: '/banners/banner1.png',
  },
  'phu-kien': {
    label: 'Phụ kiện Apple chính hãng',
    description: 'Phụ kiện Apple chính hãng, AirPods, sạc, cáp và phụ kiện bảo vệ giá tốt tại Fogo Store.',
    image: '/noi-bat/bannerphukien.webp',
  },
  'hang-cu': {
    label: 'Sản phẩm Apple cũ',
    description: 'iPhone, iPad và MacBook cũ được kiểm tra kỹ, giá tốt và chính sách bảo hành rõ ràng tại Fogo Store.',
    image: '/banners/banner1.png',
  },
};

function humanizeSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildCategoryMetadata(category: CategoryKey, slugParam?: string | string[]): Metadata {
  const config = CATEGORY_META[category];
  const slug = slugFromParam(slugParam);
  const pathname = slug ? `/${category}/${slug}` : `/${category}`;
  const canonical = absoluteUrl(pathname);
  const title = slug ? `${humanizeSlug(slug)} - ${config.label}` : config.label;

  return {
    title,
    description: config.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      siteName: 'Fogo Store',
      title,
      description: config.description,
      url: canonical,
      images: [{ url: absoluteUrl(config.image), alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: config.description,
      images: [absoluteUrl(config.image)],
    },
  };
}
