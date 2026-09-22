const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Tự động nhận diện token admin lưu trong browser
export const getAuthHeaders = (isFormData: boolean = false) => {
  let token = '';
  if (typeof window !== 'undefined') {
    token =
      localStorage.getItem('fogo_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      '';

    if (!token) {
      try {
        const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          token = u.token || u.accessToken || '';
        }
      } catch (e) {}
    }
  }

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// SẢN PHẨM & TỒN KHO
export const adminGetProducts = async () => {
  const res = await fetch(`${API_URL}/api/admin/products`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminCreateProduct = async (data: any) => {
  const res = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminUpdateProduct = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeleteProduct = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// ĐƠN HÀNG
export const adminGetOrders = async () => {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminUpdateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const adminDeleteOrder = async (orderId: string) => {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// BANNERS
export const adminGetBanners = async () => {
  const res = await fetch(`${API_URL}/api/banners?t=${Date.now()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminSyncBanners = async (items: any[]) => {
  const res = await fetch(`${API_URL}/api/admin/banners/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  return res.json();
};

// BÀI VIẾT
export const adminGetPosts = async () => {
  const res = await fetch(`${API_URL}/api/admin/posts`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminCreatePost = async (data: any) => {
  const res = await fetch(`${API_URL}/api/admin/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminUpdatePost = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeletePost = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// THỐNG KÊ
export const adminGetStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminGetTrafficStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/traffic-stats`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

// IMPORT EXCEL
export const adminImportExcel = async (formData: FormData) => {
  const res = await fetch(`${API_URL}/api/admin/products/import-excel`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });
  return res.json();
};