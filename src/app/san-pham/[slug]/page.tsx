import React from 'react';
import { notFound } from 'next/navigation';
import IPhoneDetail from '@/components/products/IPhoneDetail';
import IPadDetail from '@/components/products/IPadDetail';
import MacBookDetail from '@/components/products/MacBookDetail';
import UsedProductDetail from '@/components/products/UsedProductDetail';
import WatchDetail from '@/components/products/WatchDetail';
import AccessoryDetail from '@/components/products/AccessoryDetail';
import TrackRecentViewed from '@/components/products/TrackRecentViewed';
import { ACCESSORY_CATALOG_ITEMS } from '@/data/accessoryCatalog';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ProductDetailPage(props: PageProps) {
  // ============================================================================
  // 1. GIẢI MÃ PARAMS AN TOÀN TUYỆT ĐỐI (DỨT ĐIỂM 404 & RELOAD LOOP TRÊN NEXT 14/15)
  // ============================================================================
  const resolvedParams = await props.params;
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};

  const rawSlug = resolvedParams?.slug ? String(resolvedParams.slug) : '';
  const currentSlug = decodeURIComponent(rawSlug).trim().replace(/\/+$/, '');
  const proid = typeof resolvedSearchParams?.proid === 'string' ? resolvedSearchParams.proid : '';

  if (!currentSlug) {
    notFound();
  }

  // ============================================================================
  // 2. CHUẨN HÓA SLUG & BÓC TÁCH MỌI THÔNG SỐ (HỖ TRỢ MACBOOK, IPAD, IPHONE)
  // ============================================================================
  const cleanSlugForMatch = currentSlug.replace(/\//g, '-').toLowerCase();

  // Tập hợp các định dạng thông số cấu hình phần cứng (Dung lượng, Kích thước, RAM, CPU, GPU)
  const specPattern = '(?:24gb|32gb|36gb|48gb|64gb|96gb|128gb|256gb|512gb|1tb|2tb|40mm|41mm|42mm|44mm|45mm|46mm|49mm|14-inch|16-inch|18cpu|32gpu|14cpu|20gpu)';
  
  const regEnd = new RegExp(`-(${specPattern})+$`, 'i');
  const storageMatchEnd = cleanSlugForMatch.match(regEnd);

  const urlStorage = storageMatchEnd ? storageMatchEnd[1].toUpperCase() : '';

  // Lọc sạch mọi thông số cấu hình ở đuôi URL để quy hoạch về baseSlug chuẩn của model gốc
  const storageRegex = new RegExp(`-(?:24gb|32gb|36gb|48gb|64gb|96gb|128gb|256gb|512gb|1tb|2tb|40mm|41mm|42mm|44mm|45mm|46mm|49mm|14-inch|16-inch|18cpu|32gpu|14cpu|20gpu)+$`, 'gi');
  
  let baseSlug = cleanSlugForMatch.replace(storageRegex, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!baseSlug) {
    baseSlug = cleanSlugForMatch;
  }

  let product: any = null;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/+$/, '');

  // ============================================================================
  // 3. FETCH DỮ LIỆU TỪ BACKEND DATABASE
  // ============================================================================
  try {
    const query = proid ? `?proid=${encodeURIComponent(proid)}` : '';

    // Thử 1: Gọi với baseSlug (Tên model gốc đã được lọc sạch thông số)
    let res = await fetch(`${apiUrl}/api/products/${baseSlug}${query}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        product = resJson.data;
      }
    }

    // Thử 2: Nếu không thấy, gọi dự phòng với toàn bộ chuỗi slug chưa cắt
    if (!product && cleanSlugForMatch !== baseSlug) {
      res = await fetch(`${apiUrl}/api/products/${cleanSlugForMatch}${query}`, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          product = resJson.data;
        }
      }
    }
  } catch (err) {
    console.warn('Cảnh báo: Không thể kết nối tới API Backend:', err);
  }

  // ============================================================================
  // 4. NEO CHẶT baseSlug THEO SLUG GỐC CHUẨN XÁC TRONG DATABASE
  // ============================================================================
  if (product && product.slug) {
    baseSlug = product.slug;
  }

  // ============================================================================
  // 5. XỬ LÝ FALLBACK PHỤ KIỆN
  // ============================================================================
  if (!product && typeof ACCESSORY_CATALOG_ITEMS !== 'undefined' && Array.isArray(ACCESSORY_CATALOG_ITEMS)) {
    const fallbackItem = ACCESSORY_CATALOG_ITEMS.find((item: any) => {
      const itemSlug = item.slug || item.id || item.href?.replace(/^\/san-pham\//, '');
      return itemSlug === currentSlug || itemSlug === baseSlug;
    });

    if (fallbackItem) {
      product = {
        id: fallbackItem.id || currentSlug,
        name: fallbackItem.name || 'Phụ kiện Apple chính hãng',
        slug: currentSlug,
        category: { slug: 'phu-kien', name: 'Phụ kiện' },
        variants: [
          {
            id: fallbackItem.id || `var-${currentSlug}`,
            color: 'Trắng',
            storage: 'Tiêu chuẩn',
            price: parsePrice(fallbackItem.currentPrice || fallbackItem.rawPrice || 1000),
            originalPrice: parsePrice(fallbackItem.originalPrice || 6190000),
            stock: 50,
            images: [fallbackItem.imageUrl || 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'],
          },
        ],
      };
    }
  }

  // ============================================================================
  // 6. MOCK DATA DỰ PHÒNG CHỐNG CRASH KHI BACKEND SLEEP (RENDER COLD START)
  // ============================================================================
  if (!product) {
    const cleanWords = cleanSlugForMatch
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    let defaultCategorySlug = 'iphone';
    let defaultCategoryName = 'iPhone';
    let defaultPrice = 28990000;
    let defaultImg = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600';

    if (cleanSlugForMatch.includes('iphone')) {
      defaultCategorySlug = 'iphone';
      defaultCategoryName = 'iPhone';
      defaultPrice = 24990000;
      defaultImg = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600';
    } else if (cleanSlugForMatch.includes('ipad')) {
      defaultCategorySlug = 'ipad';
      defaultCategoryName = 'iPad';
      defaultPrice = 18990000;
      defaultImg = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600';
    } else if (cleanSlugForMatch.includes('macbook')) {
      defaultCategorySlug = 'macbook';
      defaultCategoryName = 'MacBook';
      defaultPrice = 32990000;
      defaultImg = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600';
    } else if (cleanSlugForMatch.includes('watch')) {
      defaultCategorySlug = 'watch';
      defaultCategoryName = 'Apple Watch';
      defaultPrice = 9990000;
      defaultImg = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
    }

    product = {
      id: `mock-${cleanSlugForMatch}`,
      name: cleanWords,
      slug: cleanSlugForMatch,
      category: { slug: defaultCategorySlug, name: defaultCategoryName },
      variants: [
        {
          id: `var-${cleanSlugForMatch}-1`,
          color: 'Mặc định',
          storage: urlStorage || '256GB',
          price: defaultPrice,
          originalPrice: defaultPrice + 3000000,
          stock: 15,
          images: [defaultImg],
        },
      ],
    };
  }

  // Đảm bảo luôn có ít nhất 1 biến thể hợp lệ để render giao diện
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    product.variants = [
      {
        id: `var-fallback-${product.id || '1'}`,
        color: 'Mặc định',
        storage: urlStorage || '256GB',
        price: product.price || 25000000,
        originalPrice: product.originalPrice || 28000000,
        stock: 10,
        images: [product.imageUrl || product.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
      },
    ];
  }

  const catSlug = (product.category?.slug || '').toLowerCase();
  const catName = (product.category?.name || '').toLowerCase();
  const prodName = (product.name || '').toLowerCase();
  const slugLower = cleanSlugForMatch.toLowerCase();

  // ============================================================================
  // 7. BỘ ĐIỀU HƯỚNG GIAO DIỆN (DISPATCHER)
  // ============================================================================
  const isUsedProduct =
    catSlug === 'hang-cu' ||
    catSlug.includes('cu') ||
    catName.includes('cũ') ||
    prodName.includes('cũ') ||
    slugLower.includes('-cu');

  if (isUsedProduct) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <UsedProductDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
      </>
    );
  }

  const isAccessory =
    catSlug.includes('phu-kien') ||
    slugLower.includes('phu-kien') ||
    slugLower.includes('sac-') ||
    slugLower.includes('cap-') ||
    slugLower.includes('airpods');

  if (isAccessory) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <AccessoryDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
      </>
    );
  }

  const isWatch = slugLower.includes('watch') || prodName.includes('watch') || catSlug.includes('watch');
  if (isWatch) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <WatchDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
      </>
    );
  }

  const isMacBook = slugLower.includes('macbook') || prodName.includes('macbook') || catSlug.includes('macbook');
  if (isMacBook) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <MacBookDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
      </>
    );
  }

  const isIPad = slugLower.includes('ipad') || prodName.includes('ipad') || catSlug.includes('ipad');
  if (isIPad) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <IPadDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
      </>
    );
  }

  // Mặc định render giao diện iPhone
  return (
    <>
      <TrackRecentViewed product={product} />
      <IPhoneDetail initialProduct={product} currentSlug={cleanSlugForMatch} baseSlug={baseSlug} urlStorage={urlStorage} />
    </>
  );
}

function parsePrice(val: any): number {
  if (typeof val === 'number') return val;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}