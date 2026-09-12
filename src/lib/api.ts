const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const API_BASE_URL = `${API_URL}/api`;

export async function getProducts(params?: { category?: string; series?: string; isUsed?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.series) query.append('series', params.series);
    if (params?.isUsed !== undefined) query.append('isUsed', String(params.isUsed));

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
      cache: 'no-store', // Giữ dữ liệu luôn tươi mới
    });
    if (!res.ok) throw new Error('Lỗi fetch sản phẩm');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Fetch products error:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return null;
  }
}