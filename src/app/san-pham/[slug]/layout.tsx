import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  absoluteUrl,
  fetchFaqsForSeo,
  fetchProductForSeo,
  positiveNumber,
  productCanonicalSlug,
  productImages,
  seoDescription,
  SITE_URL,
  slugFromParam,
  type SeoProduct,
} from '@/lib/seo';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string | string[] }>;
}

function categoryPath(product: SeoProduct) {
  const category = `${product.category?.slug || ''} ${product.category?.name || ''} ${product.name || ''}`.toLowerCase();
  if (category.includes('ipad')) return '/ipad';
  if (category.includes('macbook') || category.includes('mac')) return '/macbook';
  if (category.includes('watch')) return '/watch';
  if (category.includes('phụ kiện') || category.includes('phu-kien')) return '/phu-kien';
  if (category.includes('cũ') || category.includes('hang-cu')) return '/hang-cu';
  return '/iphone';
}

function productDescription(product: SeoProduct) {
  return seoDescription(
    product.description,
    `Mua ${product.name || 'sản phẩm Apple'} chính hãng, giá tốt, bảo hành uy tín và giao hàng toàn quốc tại Fogo Store.`,
  );
}

export async function generateMetadata({ params }: Omit<ProductLayoutProps, 'children'>): Promise<Metadata> {
  const { slug: slugParam } = await params;
  const requestedSlug = slugFromParam(slugParam);
  const product = await fetchProductForSeo(requestedSlug);

  if (!product) {
    return {
      title: 'Sản phẩm Apple chính hãng',
      description: 'Sản phẩm Apple chính hãng tại Fogo Store.',
      robots: { index: false, follow: true },
    };
  }

  const canonicalSlug = productCanonicalSlug(product, requestedSlug);
  const canonical = absoluteUrl(`/san-pham/${canonicalSlug}`);
  const description = productDescription(product);
  const images = productImages(product);
  const variants = product.variants || [];
  const prices = variants.map((variant) => positiveNumber(variant.price)).filter(Boolean);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const inStock = variants.some((variant) => Number(variant.stock || 0) > 0);

  return {
    title: product.name || 'Sản phẩm Apple chính hãng',
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      siteName: 'Fogo Store',
      title: product.name || 'Sản phẩm Apple chính hãng',
      description,
      url: canonical,
      images: images.slice(0, 4).map((url) => ({ url, alt: product.name || 'Fogo Store' })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name || 'Sản phẩm Apple chính hãng',
      description,
      images: images.slice(0, 1),
    },
    other: {
      ...(lowestPrice ? { 'product:price:amount': String(lowestPrice), 'product:price:currency': 'VND' } : {}),
      'product:availability': inStock ? 'in stock' : 'out of stock',
    },
  };
}

export default async function ProductSeoLayout({ children, params }: ProductLayoutProps) {
  const { slug: slugParam } = await params;
  const requestedSlug = slugFromParam(slugParam);
  const [product, faqs] = await Promise.all([
    fetchProductForSeo(requestedSlug),
    fetchFaqsForSeo(),
  ]);

  if (!product) return children;

  const canonicalSlug = productCanonicalSlug(product, requestedSlug);
  const canonical = absoluteUrl(`/san-pham/${canonicalSlug}`);
  const description = productDescription(product);
  const images = productImages(product);
  const categoryUrl = absoluteUrl(categoryPath(product));
  const categoryName = product.category?.name || 'Sản phẩm Apple';
  const seenOffers = new Set<string>();
  const variants = (product.variants || []).filter((variant) => {
    if (!positiveNumber(variant.price)) return false;
    const key = [variant.storage, variant.color, positiveNumber(variant.price)].join('|').toLowerCase();
    if (seenOffers.has(key)) return false;
    seenOffers.add(key);
    return true;
  });
  const isUsed = `${product.category?.slug || ''} ${product.category?.name || ''} ${product.name || ''}`.toLowerCase().includes('cũ');

  const offers = variants.map((variant) => ({
    '@type': 'Offer',
    url: variant.id ? `${canonical}?proid=${encodeURIComponent(variant.id)}` : canonical,
    priceCurrency: 'VND',
    price: positiveNumber(variant.price),
    availability: Number(variant.stock || 0) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: isUsed
      ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/NewCondition',
    sku: variant.id || variant.slug,
    name: [product.name, variant.storage, variant.color].filter(Boolean).join(' - '),
    seller: { '@type': 'Organization', name: 'Fogo Store' },
  }));

  const rating = positiveNumber(product.averageRating || product.rating);
  const reviewCount = Math.floor(positiveNumber(product.reviewCount));
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: product.name,
    url: canonical,
    description,
    image: images,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand || 'Apple' },
    category: categoryName,
    offers,
  };

  // Chỉ công bố điểm đánh giá khi có dữ liệu đánh giá thật, tránh tạo sao giả trên Google.
  if (rating && reviewCount) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: categoryName, item: categoryUrl },
      { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <StructuredData id="product-structured-data" data={productSchema} />
      <StructuredData id="product-breadcrumb-structured-data" data={breadcrumbSchema} />
      <StructuredData id="product-faq-structured-data" data={faqSchema} />
      {children}
    </>
  );
}
