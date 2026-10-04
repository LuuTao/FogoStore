import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  absoluteUrl,
  fetchPostForSeo,
  firstPostImage,
  plainText,
  seoDescription,
  SITE_URL,
  slugFromParam,
} from '@/lib/seo';

interface ArticleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string | string[] }>;
}

export async function generateMetadata({ params }: Omit<ArticleLayoutProps, 'children'>): Promise<Metadata> {
  const { slug: slugParam } = await params;
  const slug = slugFromParam(slugParam);
  const post = await fetchPostForSeo(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
      robots: { index: false, follow: true },
    };
  }

  const canonical = absoluteUrl(`/tin-tuc/${post.slug || slug}`);
  const title = post.metaTitle || post.title || 'Tin tức Fogo Store';
  const description = seoDescription(post.metaDesc || post.summary || post.content, 'Tin tức công nghệ mới nhất từ Fogo Store.');
  const image = firstPostImage(post);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      siteName: 'Fogo Store',
      title,
      description,
      url: canonical,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: ['Fogo Store Team'],
      images: [{ url: image, alt: post.title || 'Tin tức Fogo Store' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticleSeoLayout({ children, params }: ArticleLayoutProps) {
  const { slug: slugParam } = await params;
  const slug = slugFromParam(slugParam);
  const post = await fetchPostForSeo(slug);
  if (!post) return children;

  const canonical = absoluteUrl(`/tin-tuc/${post.slug || slug}`);
  const image = firstPostImage(post);
  const description = seoDescription(post.metaDesc || post.summary || post.content, 'Tin tức công nghệ mới nhất từ Fogo Store.');
  const wordCount = plainText(post.content).split(/\s+/).filter(Boolean).length;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: post.title,
    description,
    image: [image],
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Organization', name: 'Fogo Store Team', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Fogo Store',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logoFogo.png') },
    },
    wordCount,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: absoluteUrl('/tin-tuc') },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <>
      <StructuredData id="article-structured-data" data={articleSchema} />
      <StructuredData id="article-breadcrumb-structured-data" data={breadcrumbSchema} />
      {children}
    </>
  );
}
