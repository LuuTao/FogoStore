// src/services/clientApi.ts

// Chuẩn hóa Base URL, loại bỏ /api hoặc dấu / ở cuối nếu có sẵn để tránh bị trùng lặp /api/api
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com';
const API_BASE = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api';

// 1. Hàm lấy Token an toàn từ các khóa lưu trữ
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
    console.warn('[Auth Warning] Lỗi đọc token từ localStorage:', e);
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

// 3. Wrapper gọi API chuyên nghiệp
export async function clientFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
  const token = getAuthToken();
  
  // Chuẩn hóa endpoint: xử lý nếu endpoint truyền vào đã có hoặc chưa có /api
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
  }
  const url = `${API_BASE}${cleanEndpoint}`;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string>),
  };

  // Tự động đính kèm Authorization Header nếu có token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Cấu hình Timeout sau 25 giây (tránh treo giao diện nếu server Render khởi động lại)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 Unauthorized: Phiên đăng nhập hết hạn -> Dọn session và yêu cầu đăng nhập lại
    if (response.status === 401) {
      console.warn(`[Auth Warning] Token hết hạn tại ${endpoint}`);
      clearAuthSession();
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fogo_auth_required'));
      }

      return {
        success: false,
        status: 401,
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      };
    }

    // 403 Forbidden: Không có quyền truy cập chức năng này (không xóa session của user)
    if (response.status === 403) {
      return {
        success: false,
        status: 403,
        error: 'Bạn không có quyền thực hiện thao tác này.',
      };
    }

    // 404 Not Found: Đường dẫn không tồn tại
    if (response.status === 404) {
      return {
        success: false,
        status: 404,
        error: 'Không tìm thấy dữ liệu yêu cầu.',
      };
    }

    // Parse kết quả trả về
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
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 408,
        error: 'Kết nối máy chủ quá thời gian (Timeout). Vui lòng thử lại!',
      };
    }

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
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    clientFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    clientFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    clientFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default clientApi;