import type { MetadataRoute } from 'next';
import {
  absoluteUrl,
  fetchPostsForSeo,
  fetchProductsForSeo,
  productCanonicalSlug,
} from '@/lib/seo';

export const revalidate = 900;

function safeDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    fetchProductsForSeo(),
    fetchPostsForSeo(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/iphone'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/ipad'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/macbook'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/watch'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/phu-kien'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/hang-cu'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/tin-tuc'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/gioi-thieu'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/lien-he'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/chinh-sach-bao-hanh'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const seenProducts = new Set<string>();
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) => {
    const slug = productCanonicalSlug(product, '');
    if (!slug || seenProducts.has(slug)) return [];
    seenProducts.add(slug);
    return [{
      url: absoluteUrl(`/san-pham/${slug}`),
      lastModified: safeDate(product.updatedAt || product.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }];
  });

  const seenPosts = new Set<string>();
  const articlePages: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const slug = String(post.slug || '').trim();
    if (!slug || seenPosts.has(slug)) return [];
    seenPosts.add(slug);
    return [{
      url: absoluteUrl(`/tin-tuc/${slug}`),
      lastModified: safeDate(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }];
  });

  return [...staticPages, ...productPages, ...articlePages];
}
