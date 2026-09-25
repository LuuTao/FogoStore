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
  params: Promise<{ slug: string | string[] }> | { slug: string | string[] };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

function parsePrice(val: any): number {
  if (typeof val === 'number') return val;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}

export default async function ProductDetailPage(props: PageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};

  // ============================================================================
  // 1. CHUẨN HÓA SLUG TỪ MẢNG PATH / CATCH-ALL ROUTE
  // ============================================================================
  const rawSlugArray = resolvedParams?.slug || [];
  const rawSlug = Array.isArray(rawSlugArray) ? rawSlugArray.join('-') : String(rawSlugArray);
  const currentSlug = decodeURIComponent(rawSlug).trim().replace(/\/+$/, '').toLowerCase();
  const proid = typeof resolvedSearchParams?.proid === 'string' ? resolvedSearchParams.proid.trim() : '';

  if (!currentSlug) {
    notFound();
  }

  // ============================================================================
  // 2. BÓC TÁCH THÔNG SỐ (DUNG LƯỢNG, MÀU SẮC, HASH ID) KHỎI SLUG
  // ============================================================================
  const cleanSlugForMatch = currentSlug.replace(/\//g, '-').toLowerCase();

  // 2.1. Loại bỏ mã hash ID số ở đuôi (ví dụ: -1174439965)
  const slugWithoutHash = cleanSlugForMatch.replace(/-\d{6,}$/gi, '');

  // 2.2. Nhận diện dung lượng từ URL
  const specPattern = '(?:8gb|16gb|24gb|32gb|36gb|48gb|64gb|96gb|128gb|256gb|512gb|1tb|2tb|40mm|41mm|42mm|44mm|45mm|46mm|49mm)';
  const storageRegexMatch = slugWithoutHash.match(new RegExp(`-(${specPattern})`, 'i'));
  const urlStorage = storageRegexMatch ? storageRegexMatch[1].toUpperCase() : '';

  // 2.3. Nhận diện màu sắc từ URL
  const colorPattern = '(?:glacier|blue-glacier|silver|black|burgundy|gold|gray|grey|titanium|natural-titanium|white|space-black|deep-blue|cosmic-orange|soft-pink|midnight|starlight|lavender|mist-blue|sage)';
  const colorRegexMatch = slugWithoutHash.match(new RegExp(`-(${colorPattern})`, 'i'));
  const urlColorSlug = colorRegexMatch ? colorRegexMatch[1] : '';

  // 2.4. Bóc tách để tìm ra Model cha gốc (baseSlug)
  let baseSlug = slugWithoutHash
    .replace(new RegExp(`-(?:${specPattern})`, 'gi'), '')
    .replace(new RegExp(`-(?:${colorPattern})`, 'gi'), '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) {
    baseSlug = slugWithoutHash;
  }

  let product: any = null;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/+$/, '');

  // ============================================================================
  // 3. FETCH DỮ LIỆU TỪ BACKEND DATABASE
  // ============================================================================
  try {
    const query = proid ? `?proid=${encodeURIComponent(proid)}` : '';

    // Thử 1: Gọi API bằng slug gốc không chứa hash ID
    let res = await fetch(`${apiUrl}/api/products/${slugWithoutHash}${query}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        product = resJson.data;
      }
    }

    // Thử 2: Gọi API bằng baseSlug (đã lọc sạch dung lượng và màu sắc)
    if (!product && baseSlug !== slugWithoutHash) {
      res = await fetch(`${apiUrl}/api/products/${baseSlug}${query}`, {
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

    // Thử 3: Gọi API bằng chuỗi slug ban đầu (bao gồm cả hash ID nếu có)
    if (!product && cleanSlugForMatch !== slugWithoutHash) {
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
  // 4. NEO CHẶT baseSlug THEO SLUG TRONG DATABASE
  // ============================================================================
  if (product && product.slug) {
    baseSlug = product.slug;
  }

  // ============================================================================
  // 5. XỬ LÝ DỮ LIỆU PHỤ KIỆN TỪ CATALOG LOCAL (FALLBACK)
  // ============================================================================
  if (!product && typeof ACCESSORY_CATALOG_ITEMS !== 'undefined' && Array.isArray(ACCESSORY_CATALOG_ITEMS)) {
    const fallbackItem = ACCESSORY_CATALOG_ITEMS.find((item: any) => {
      const itemSlug = item.slug || item.id || item.href?.replace(/^\/san-pham\//, '');
      return itemSlug === currentSlug || itemSlug === baseSlug || itemSlug === slugWithoutHash;
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
            price: parsePrice(fallbackItem.currentPrice || fallbackItem.rawPrice || 0),
            originalPrice: parsePrice(fallbackItem.originalPrice || 0),
            stock: 50,
            images: [fallbackItem.imageUrl || 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'],
          },
        ],
      };
    }
  }

  // ============================================================================
  // 6. DỮ LIỆU MẪU DỰ PHÒNG KHI BACKEND SLEEP
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
          color: 'Tiêu chuẩn',
          storage: urlStorage || '256GB',
          price: defaultPrice,
          originalPrice: defaultPrice + 3000000,
          stock: 15,
          images: [defaultImg],
        },
      ],
    };
  }

  // Đảm bảo mảng variants luôn tồn tại
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    product.variants = [
      {
        id: `var-fallback-${product.id || '1'}`,
        color: 'Tiêu chuẩn',
        storage: urlStorage || '256GB',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        stock: 10,
        images: [product.imageUrl || product.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
      },
    ];
  }

  // ============================================================================
  // 7. XÁC ĐỊNH BIẾN THỂ KHỚP VỚI URL (DUNG LƯỢNG & MÀU SẮC BAN ĐẦU)
  // ============================================================================
  let matchedVariant = null;

  if (proid) {
    matchedVariant = product.variants.find((v: any) => String(v.id) === proid);
  }

  if (!matchedVariant && (urlStorage || urlColorSlug)) {
    matchedVariant = product.variants.find((v: any) => {
      const stMatch = urlStorage ? String(v.storage || '').toUpperCase() === urlStorage : true;
      const clMatch = urlColorSlug
        ? String(v.color || '').toLowerCase().replace(/\s+/g, '-').includes(urlColorSlug) ||
          urlColorSlug.includes(String(v.color || '').toLowerCase().replace(/\s+/g, '-'))
        : true;
      return stMatch && clMatch;
    });

    if (!matchedVariant && urlStorage) {
      matchedVariant = product.variants.find((v: any) => String(v.storage || '').toUpperCase() === urlStorage);
    }
  }

  if (!matchedVariant) {
    matchedVariant = product.variants[0];
  }

  // ============================================================================
  // 8. ĐIỀU HƯỚNG GIAO DIỆN THEO DANH MỤC
  // ============================================================================
  const catSlug = (product.category?.slug || '').toLowerCase();
  const catName = (product.category?.name || '').toLowerCase();
  const prodName = (product.name || '').toLowerCase();
  const slugLower = cleanSlugForMatch.toLowerCase();

  const detailProps = {
    initialProduct: product,
    currentSlug: cleanSlugForMatch,
    baseSlug: baseSlug,
    urlStorage: matchedVariant?.storage || urlStorage || '',
    initialVariantId: matchedVariant?.id || '',
    initialColor: matchedVariant?.color || '',
  };

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
        <UsedProductDetail {...detailProps} />
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
        <AccessoryDetail {...detailProps} />
      </>
    );
  }

  const isWatch = slugLower.includes('watch') || prodName.includes('watch') || catSlug.includes('watch');
  if (isWatch) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <WatchDetail {...detailProps} />
      </>
    );
  }

  const isMacBook = slugLower.includes('macbook') || prodName.includes('macbook') || catSlug.includes('macbook');
  if (isMacBook) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <MacBookDetail {...detailProps} />
      </>
    );
  }

  const isIPad = slugLower.includes('ipad') || prodName.includes('ipad') || catSlug.includes('ipad');
  if (isIPad) {
    return (
      <>
        <TrackRecentViewed product={product} />
        <IPadDetail {...detailProps} />
      </>
    );
  }

  // Mặc định hiển thị trang iPhone
  return (
    <>
      <TrackRecentViewed product={product} />
      <IPhoneDetail {...detailProps} />
    </>
  );
}