const DEFAULT_SITE_URL = 'https://fogo-store.vercel.app';
const DEFAULT_API_URL = 'https://fogo-store-api.onrender.com';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export interface SeoProductVariant {
  id?: string;
  slug?: string;
  storage?: string;
  color?: string;
  price?: number | string;
  originalPrice?: number | string;
  stock?: number | string;
  images?: string[] | string;
  imageUrl?: string;
}

export interface SeoProduct {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number | string;
  averageRating?: number | string;
  reviewCount?: number | string;
  category?: { name?: string; slug?: string };
  variants?: SeoProductVariant[];
}

export interface SeoPost {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoFaq {
  id?: string;
  question: string;
  answer: string;
}

export const DEFAULT_PRODUCT_FAQS: SeoFaq[] = [
  {
    question: 'Sản phẩm có phải hàng chính hãng không?',
    answer: 'FoGo Store cam kết sản phẩm chính hãng, nguồn gốc rõ ràng và được kiểm tra kỹ trước khi giao đến khách hàng.',
  },
  {
    question: 'Sản phẩm có được kiểm tra trước khi nhận không?',
    answer: 'Bạn có thể kiểm tra ngoại quan, phụ kiện và thông tin đơn hàng khi nhận. Nhân viên FoGo Store luôn hỗ trợ trong suốt quá trình nhận hàng.',
  },
  {
    question: 'Chính sách bảo hành như thế nào?',
    answer: 'Sản phẩm áp dụng chính sách bảo hành theo thông tin hiển thị tại trang sản phẩm và quy định hiện hành của FoGo Store.',
  },
  {
    question: 'Tôi có thể đổi trả sản phẩm không?',
    answer: 'FoGo Store hỗ trợ đổi trả theo điều kiện sản phẩm và chính sách bán hàng. Vui lòng liên hệ cửa hàng để được tư vấn nhanh nhất.',
  },
];

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function absoluteImageUrl(value?: string | null) {
  const image = String(value || '').trim();
  if (!image) return absoluteUrl('/banners/banner1.png');
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/uploads/')) return `${API_URL}${image}`;
  if (image.startsWith('uploads/')) return `${API_URL}/${image}`;
  return absoluteUrl(image);
}

export function plainText(value?: string | null) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function seoDescription(value: string | null | undefined, fallback: string) {
  const text = plainText(value) || fallback;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export function slugFromParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join('-') : String(value || '');
  try {
    return decodeURIComponent(raw).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  } catch {
    return raw.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  }
}

export function productCanonicalSlug(product: SeoProduct | null, requestedSlug: string) {
  return String(product?.slug || requestedSlug).trim().replace(/^\/+|\/+$/g, '');
}

export function productImages(product: SeoProduct | null) {
  if (!product) return [absoluteImageUrl()];

  const images = (product.variants || []).flatMap((variant) => {
    const source = Array.isArray(variant.images)
      ? variant.images
      : typeof variant.images === 'string'
        ? [variant.images]
        : variant.imageUrl
          ? [variant.imageUrl]
          : [];
    return source.map(absoluteImageUrl);
  });

  return [...new Set(images.filter(Boolean))].slice(0, 12).length
    ? [...new Set(images.filter(Boolean))].slice(0, 12)
    : [absoluteImageUrl()];
}

export function firstPostImage(post: SeoPost | null) {
  if (post?.thumbnail) return absoluteImageUrl(post.thumbnail);
  const match = String(post?.content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return absoluteImageUrl(match?.[1]);
}

export function positiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function fetchSeoJson(url: string, revalidate: number) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchProductForSeo(slug: string): Promise<SeoProduct | null> {
  if (!slug) return null;
  const json = await fetchSeoJson(`${API_URL}/api/products/${encodeURIComponent(slug)}`, 300);
  return json?.success && json?.data ? (json.data as SeoProduct) : null;
}

export async function fetchProductsForSeo(): Promise<SeoProduct[]> {
  const products: SeoProduct[] = [];
  let page = 1;
  let totalPages = 1;

  // Chia nhỏ dữ liệu để sitemap không phải cache một phản hồi tồn kho quá lớn.
  do {
    const json = await fetchSeoJson(`${API_URL}/api/products?limit=100&page=${page}`, 900);
    const current = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.data?.products)
        ? json.data.products
        : [];

    products.push(...current);
    totalPages = Math.max(1, Math.min(20, Number(json?.pagination?.totalPages) || 1));
    page += 1;
  } while (page <= totalPages);

  return products;
}

export async function fetchPostsForSeo(): Promise<SeoPost[]> {
  const json = await fetchSeoJson(`${API_URL}/api/posts`, 600);
  const posts = Array.isArray(json?.data) ? (json.data as SeoPost[]) : [];
  return posts.filter((post) => post.published !== false);
}

export async function fetchPostForSeo(slug: string): Promise<SeoPost | null> {
  const posts = await fetchPostsForSeo();
  return posts.find((post) => post.slug === slug) || null;
}

export async function fetchFaqsForSeo(): Promise<SeoFaq[]> {
  const json = await fetchSeoJson(`${API_URL}/api/product-faqs`, 600);
  if (!json?.success || !Array.isArray(json.data)) return DEFAULT_PRODUCT_FAQS;
  const faqs = json.data.filter((item: SeoFaq) => item?.question && item?.answer);
  return faqs.length ? faqs : DEFAULT_PRODUCT_FAQS;
}
