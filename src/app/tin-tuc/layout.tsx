import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tin tức công nghệ Apple',
  description: 'Tin tức, tư vấn và đánh giá mới nhất về iPhone, iPad, MacBook, Apple Watch từ Fogo Store.',
  alternates: { canonical: absoluteUrl('/tin-tuc') },
  openGraph: {
    title: 'Tin tức công nghệ Apple | Fogo Store',
    description: 'Tin tức, tư vấn và đánh giá mới nhất về các sản phẩm Apple.',
    url: absoluteUrl('/tin-tuc'),
    images: [{ url: absoluteUrl('/banners/banner1.png'), alt: 'Tin tức Fogo Store' }],
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
