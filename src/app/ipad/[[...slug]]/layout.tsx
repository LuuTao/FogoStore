import { buildCategoryMetadata } from '@/lib/categoryMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return buildCategoryMetadata('ipad', slug);
}

export default function IPadCategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
