import { getAuthToken } from './clientApi';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Tự động nhận diện token admin lưu trong browser
export const getAuthHeaders = (isFormData: boolean = false) => {
  let token = '';
  if (typeof window !== 'undefined') {
    token =
      localStorage.getItem('fogo_admin_token') ||
      localStorage.getItem('admin_token') ||
      getAuthToken() ||
      '';

    if (!token) {
      try {
        const rawUser = localStorage.getItem('fogo_user') || localStorage.getItem('user') || localStorage.getItem('currentUser');
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
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminCreateProduct = async (data: any) => {
  const res = await fetch(`${API_URL}/api/admin/products`, {
    credentials: 'include',
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminUpdateProduct = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    credentials: 'include',
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeleteProduct = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// ĐƠN HÀNG
export const adminGetOrders = async () => {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminUpdateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
    credentials: 'include',
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const adminDeleteOrder = async (orderId: string) => {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// BANNERS
export const adminGetBanners = async () => {
  const res = await fetch(`${API_URL}/api/banners?t=${Date.now()}`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminSyncBanners = async (items: any[]) => {
  const res = await fetch(`${API_URL}/api/admin/banners/sync`, {
    credentials: 'include',
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  return res.json();
};

// BÀI VIẾT
export const adminGetPosts = async () => {
  const res = await fetch(`${API_URL}/api/admin/posts`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminCreatePost = async (data: any) => {
  const res = await fetch(`${API_URL}/api/admin/posts`, {
    credentials: 'include',
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminUpdatePost = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
    credentials: 'include',
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeletePost = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// THỐNG KÊ
export const adminGetStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

export const adminGetTrafficStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/traffic-stats`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
};

// IMPORT EXCEL
export const adminPreviewExcel = async (formData: FormData) => {
  const res = await fetch(`${API_URL}/api/admin/products/import-excel/preview`, {
    credentials: 'include',
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });
  return res.json();
};

export const adminImportExcel = async (formData: FormData) => {
  const res = await fetch(`${API_URL}/api/admin/products/import-excel`, {
    credentials: 'include',
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });
  return res.json();
};
