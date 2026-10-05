const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

declare global {
  interface Window {
    __fogoCredentialedFetchInstalled?: boolean;
  }
}

// Các màn hình cũ vẫn gọi fetch trực tiếp. Chỉ với đúng API của FoGo,
// tự động gửi cookie HttpOnly; không thay đổi request sang dịch vụ bên thứ ba.
export const installCredentialedApiFetch = () => {
  if (typeof window === 'undefined' || window.__fogoCredentialedFetchInstalled) return;
  const originalFetch = window.fetch.bind(window);
  let refreshPromise: Promise<boolean> | null = null;
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
    if (url.startsWith(`${API_ORIGIN}/api/`)) {
      const options = { ...init, credentials: init.credentials || 'include' } as RequestInit;
      const retryInput = typeof Request !== 'undefined' && input instanceof Request ? input.clone() : input;
      const response = await originalFetch(input, options);
      const isAuthLifecycle = url.startsWith(`${API_ORIGIN}/api/auth/`);
      if (response.status !== 401 || isAuthLifecycle) return response;

      refreshPromise ||= originalFetch(`${API_ORIGIN}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }).then((refreshResponse) => refreshResponse.ok).finally(() => {
        refreshPromise = null;
      });
      if (!(await refreshPromise)) return response;
      return originalFetch(retryInput, options);
    }
    return originalFetch(input, init);
  };
  window.__fogoCredentialedFetchInstalled = true;
};
