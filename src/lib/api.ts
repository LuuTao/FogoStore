const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const API_BASE_URL = `${API_URL}/api`;

export async function getProducts(params?: { category?: string; series?: string; isUsed?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.series) query.append('series', params.series);
    if (params?.isUsed !== undefined) query.append('isUsed', String(params.isUsed));

    const queryString = query.toString();
    // Nếu có category thì dùng route /filter để khớp với backend của bạn
    const endpoint = params?.category
      ? `${API_BASE_URL}/products/filter${queryString ? `?${queryString}` : ''}`
      : `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(endpoint, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[getProducts] HTTP error ${res.status} tại ${endpoint}`);
      return [];
    }

    // Kiểm tra contentType tránh crash khi server Render trả về HTML lỗi
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return [];
    }

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  } catch (error) {
    console.error('Fetch products error:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  if (!slug) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const json = await res.json();
    return json.data || json || null;
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return null;
  }
}