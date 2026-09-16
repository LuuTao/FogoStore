// src/services/clientApi.ts

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com/api').replace(/\/$/, '');

// 1. Hàm lấy Token an toàn từ mọi nguồn lưu trữ
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const directToken = 
      localStorage.getItem('token') || 
      localStorage.getItem('fogo_token') || 
      localStorage.getItem('accessToken');
    if (directToken) return directToken;

    // Kiểm tra trong object user
    const rawUser = 
      localStorage.getItem('user') || 
      localStorage.getItem('fogo_user') || 
      localStorage.getItem('currentUser');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return parsed.token || parsed.accessToken || null;
    }
  } catch (e) {
    console.warn('Lỗi đọc token:', e);
  }
  return null;
};

// 2. Hàm dọn dẹp sạch token khi phiên hết hạn
export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('fogo_token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('fogo_user');
  localStorage.removeItem('currentUser');
  
  // Bắn sự kiện ra toàn hệ thống để Header và Checkout cập nhật lại
  window.dispatchEvent(new Event('fogo_auth_cleared'));
};

// 3. Wrapper gọi API chuyên nghiệp chống lỗi ủy quyền
export async function clientFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
  const token = getAuthToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Tự động đính kèm Authorization Header nếu có token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // XỬ LÝ TRIỆT ĐỂ LỖI ỦY QUYỀN (401 / 403)
    if (response.status === 401 || response.status === 403) {
      console.warn(`[Auth Warning] Token hết hạn hoặc không hợp lệ tại ${endpoint}`);
      clearAuthSession();
      
      // Bắn sự kiện để mở modal đăng nhập mà không làm crash web
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fogo_auth_required'));
      }

      return {
        success: false,
        status: response.status,
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      };
    }

    // Nếu endpoint không tồn tại (404)
    if (response.status === 404) {
      return {
        success: false,
        status: 404,
        error: 'Không tìm thấy dữ liệu yêu cầu.',
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      return {
        success: response.ok && (json.success !== false),
        data: json.data !== undefined ? json.data : json,
        error: json.message || json.error,
        status: response.status,
      };
    }

    return {
      success: response.ok,
      status: response.status,
    };
  } catch (err: any) {
    console.error(`[Fetch Error] Lỗi mạng khi gọi ${endpoint}:`, err);
    return {
      success: false,
      status: 0,
      error: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
    };
  }
}

// 4. Các phương thức CRUD tiện ích
export const clientApi = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    clientFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    clientFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    clientFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    clientFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    clientFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default clientApi;