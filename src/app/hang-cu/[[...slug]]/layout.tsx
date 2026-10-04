import { buildCategoryMetadata } from '@/lib/categoryMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return buildCategoryMetadata('hang-cu', slug);
}

export default function UsedCategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
