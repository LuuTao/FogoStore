import { fetchJsonCached } from '@/lib/clientFetchCache';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

type ProductListResponse = {
  success?: boolean;
  data?: unknown;
};

/**
 * Trang chủ ưu tiên endpoint gọn. Fallback giữ tương thích với backend cũ trong
 * thời điểm frontend được deploy trước backend.
 */
export async function fetchHomeProducts(category: 'iphone' | 'ipad' | 'macbook') {
  try {
    const compact = await fetchJsonCached<ProductListResponse>(
      `${API_URL}/api/products/home?category=${category}`,
      120_000,
      undefined,
      8_000,
    );
    if (compact?.success && Array.isArray(compact.data)) return compact;
  } catch {
    // Backend cũ không có endpoint /home; dùng endpoint hiện có trong thời gian chuyển đổi.
  }

  return fetchJsonCached<ProductListResponse>(
    `${API_URL}/api/products/filter?category=${category}`,
    60_000,
    undefined,
    10_000,
  );
}
