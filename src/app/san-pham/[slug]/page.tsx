import React from 'react';
import { notFound } from 'next/navigation';
import IPhoneDetail from '@/components/products/IPhoneDetail';
import IPadDetail from '@/components/products/IPadDetail';
import MacBookDetail from '@/components/products/MacBookDetail';
import UsedProductDetail from '@/components/products/UsedProductDetail';
import WatchDetail from '@/components/products/WatchDetail';
import AccessoryDetail from '@/components/products/AccessoryDetail';
import { ACCESSORY_CATALOG_ITEMS } from '@/data/accessoryCatalog';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ProductDetailPage(props: PageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  
  const currentSlug = resolvedParams?.slug || '';
  const proid = typeof resolvedSearchParams?.proid === 'string' ? resolvedSearchParams.proid : '';

  if (!currentSlug) {
    notFound();
  }

  // 1. Tách slug và dung lượng / kích cỡ
  const storageMatch = currentSlug.match(/-(64gb|128gb|256gb|512gb|1tb|2tb|40mm|41mm|42mm|44mm|45mm|46mm|49mm)$/i);
  const urlStorage = storageMatch ? storageMatch[1].toUpperCase() : '';
  const baseSlug = storageMatch
    ? currentSlug.substring(0, currentSlug.length - storageMatch[0].length)
    : currentSlug;

  let product: any = null;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

  // 2. Fetch Backend API
  try {
    const query = proid ? `?proid=${proid}` : '';
    let res = await fetch(`${apiUrl}/api/products/${baseSlug}${query}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) {
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        product = resJson.data;
      }
    }

    // Nếu không tìm thấy bằng baseSlug -> Thử lại với currentSlug gốc
    if (!product && baseSlug !== currentSlug) {
      res = await fetch(`${apiUrl}/api/products/${currentSlug}${query}`, { 
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          product = resJson.data;
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi fetch sản phẩm:', err);
  }

  // 3. Tra cứu trong Catalog Phụ Kiện cục bộ
  if (!product && typeof ACCESSORY_CATALOG_ITEMS !== 'undefined' && Array.isArray(ACCESSORY_CATALOG_ITEMS)) {
    const fallbackItem = ACCESSORY_CATALOG_ITEMS.find((item: any) => {
      const itemSlug = item.slug || item.id || item.href?.replace(/^\/san-pham\//, '');
      return itemSlug === currentSlug || itemSlug === baseSlug;
    });

    if (fallbackItem) {
      product = {
        id: fallbackItem.id || currentSlug,
        name: fallbackItem.name || 'Phụ kiện Apple',
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
            images: [fallbackItem.imageUrl || 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'],
          },
        ],
      };
    }
  }

  // 4. Cơ chế cứu nguy tự động (Auto-Fallback) cho dòng AirPods & Phụ Kiện để tuyệt đối không bị 404
  if (!product && (currentSlug.includes('airpods') || currentSlug.includes('sac') || currentSlug.includes('phu-kien'))) {
    const formattedName = currentSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    product = {
      id: `fallback-${currentSlug}`,
      name: formattedName.replace(/Type C/i, 'Type-C').replace(/Airpods/i, 'AirPods'),
      slug: currentSlug,
      category: { slug: 'phu-kien', name: 'Phụ kiện chính hãng' },
      variants: [
        {
          id: `var-${currentSlug}`,
          color: 'Trắng',
          storage: 'Tiêu chuẩn',
          price: 1000,
          originalPrice: 6190000,
          stock: 50,
          images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'],
        },
      ],
    };
  }

  if (!product) {
    notFound();
  }

  const catSlug = (product.category?.slug || '').toLowerCase();
  const catName = (product.category?.name || '').toLowerCase();
  const prodName = (product.name || '').toLowerCase();
  const slugLower = currentSlug.toLowerCase();

  // ================= BỘ ĐIỀU PHỐI (DISPATCHER) =================

  // 1. HÀNG CŨ / LIKE NEW
  const isUsedProduct =
    catSlug === 'hang-cu' ||
    catSlug.includes('cu') ||
    catSlug.includes('used') ||
    catSlug.includes('like-new') ||
    catName.includes('cũ') ||
    catName.includes('like new') ||
    catName.includes('99%') ||
    prodName.includes('cũ') ||
    prodName.includes('like new') ||
    prodName.includes('99%') ||
    slugLower.includes('-cu') ||
    slugLower.includes('like-new');

  if (isUsedProduct) {
    return (
      <UsedProductDetail
        initialProduct={product}
        currentSlug={currentSlug}
        baseSlug={baseSlug}
        urlStorage={urlStorage}
      />
    );
  }

  // 2. PHỤ KIỆN & AIRPODS
  const isAccessory =
    catSlug.includes('phu-kien') ||
    catSlug.includes('accessory') ||
    catName.includes('phụ kiện') ||
    slugLower.includes('phu-kien') ||
    slugLower.includes('sac-') ||
    slugLower.includes('cap-') ||
    slugLower.includes('cu-sac') ||
    slugLower.includes('op-lung') ||
    slugLower.includes('cuong-luc') ||
    slugLower.includes('pencil') ||
    slugLower.includes('magic-mouse') ||
    slugLower.includes('airpods') ||
    prodName.includes('củ sạc') ||
    prodName.includes('cáp sạc') ||
    prodName.includes('tai nghe') ||
    prodName.includes('airpods') ||
    prodName.includes('pencil') ||
    prodName.includes('magic mouse');

  if (isAccessory) {
    return (
      <AccessoryDetail
        initialProduct={product}
        currentSlug={currentSlug}
        baseSlug={baseSlug}
        urlStorage={urlStorage}
      />
    );
  }

  // 3. APPLE WATCH
  const isWatch =
    slugLower.includes('watch') ||
    prodName.includes('watch') ||
    catSlug.includes('watch') ||
    catName.includes('watch') ||
    catName.includes('đồng hồ');

  if (isWatch) {
    return (
      <WatchDetail
        initialProduct={product}
        currentSlug={currentSlug}
        baseSlug={baseSlug}
        urlStorage={urlStorage}
      />
    );
  }

  // 4. MACBOOK
  const isMacBook =
    slugLower.includes('macbook') ||
    prodName.includes('macbook') ||
    catSlug.includes('macbook') ||
    catSlug.includes('laptop');

  if (isMacBook) {
    return (
      <MacBookDetail
        initialProduct={product}
        currentSlug={currentSlug}
        baseSlug={baseSlug}
        urlStorage={urlStorage}
      />
    );
  }

  // 5. IPAD
  const isIPad =
    slugLower.includes('ipad') ||
    prodName.includes('ipad') ||
    catSlug.includes('ipad');

  if (isIPad) {
    return (
      <IPadDetail
        initialProduct={product}
        currentSlug={currentSlug}
        baseSlug={baseSlug}
        urlStorage={urlStorage}
      />
    );
  }

  // 6. IPHONE
  return (
    <IPhoneDetail
      initialProduct={product}
      currentSlug={currentSlug}
      baseSlug={baseSlug}
      urlStorage={urlStorage}
    />
  );
}

function parsePrice(val: any): number {
  if (typeof val === 'number') return val;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}