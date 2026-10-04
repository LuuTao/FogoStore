import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BackToTop } from '@/components/layout/BackToTop';
import { SITE_URL } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Fogo Store',
  title: {
    default: 'Fogo Store - The Best Apple Retail Store in HCM',
    template: '%s | Fogo Store',
  },
  description: 'Mua iPhone, iPad, MacBook và Apple Watch chính hãng, giá tốt, giao hàng toàn quốc tại Fogo Store.',
  keywords: ['Fogo Store', 'Apple chính hãng', 'iPhone', 'iPad', 'MacBook', 'Apple Watch'],
  authors: [{ name: 'Fogo Store', url: SITE_URL }],
  creator: 'Fogo Store',
  publisher: 'Fogo Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Fogo Store',
    title: 'Fogo Store - The Best Apple Retail Store in HCM',
    description: 'Mua sản phẩm Apple chính hãng, giá tốt và giao hàng toàn quốc tại Fogo Store.',
    url: SITE_URL,
    images: [{ url: '/banners/banner1.png', alt: 'Fogo Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fogo Store - The Best Apple Retail Store in HCM',
    description: 'Mua sản phẩm Apple chính hãng, giá tốt và giao hàng toàn quốc tại Fogo Store.',
    images: ['/banners/banner1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/logoFogo.png',
    apple: '/logoFogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fogo-store-api.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fogo-store-api.onrender.com" />
        <link rel="preconnect" href="https://cdn.hstatic.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://product.hstatic.net" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} pb-16 lg:pb-0`}>
        <Providers>
          {children}
          <BackToTop />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
