import { buildCategoryMetadata } from '@/lib/categoryMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return buildCategoryMetadata('phu-kien', slug);
}

export default function AccessoryCategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
