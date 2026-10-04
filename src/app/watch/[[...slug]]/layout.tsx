import { buildCategoryMetadata } from '@/lib/categoryMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return buildCategoryMetadata('watch', slug);
}

export default function WatchCategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
