const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

declare global {
  interface Window {
    __fogoCredentialedFetchInstalled?: boolean;
  }
}

let originalApiFetch: typeof fetch | null = null;
let refreshPromise: Promise<boolean> | null = null;

const getApiPath = (url: string) => {
  if (url.startsWith(`${API_ORIGIN}/api/`)) return url.slice(API_ORIGIN.length);
  if (url.startsWith('/api/')) return url;
  if (typeof window !== 'undefined' && url.startsWith(`${window.location.origin}/api/`)) {
    return url.slice(window.location.origin.length);
  }
  return null;
};

const performRefresh = async () => {
  const fetchImpl = originalApiFetch || window.fetch.bind(window);

  // Một tab khác có thể vừa refresh trong lúc tab hiện tại chờ Web Lock.
  const currentSession = await fetchImpl('/api/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (currentSession.ok) return true;

  const response = await fetchImpl('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return response.ok;
};

export const refreshAuthSession = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (refreshPromise) return refreshPromise;

  const refresh = async () => {
    if (navigator.locks?.request) {
      return navigator.locks.request('fogo-auth-refresh', { mode: 'exclusive' }, performRefresh);
    }
    return performRefresh();
  };

  refreshPromise = refresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

// Các màn hình cũ vẫn gọi thẳng sang Render. Chuyển mọi request FoGo API
// về proxy /api cùng origin của Vercel để cookie HttpOnly luôn là first-party.
export const installCredentialedApiFetch = () => {
  if (typeof window === 'undefined' || window.__fogoCredentialedFetchInstalled) return;
  const originalFetch = window.fetch.bind(window);
  originalApiFetch = originalFetch;
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
    const apiPath = getApiPath(url);
    if (apiPath) {
      const options = { ...init, credentials: init.credentials || 'include' } as RequestInit;
      const proxyInput = typeof Request !== 'undefined' && input instanceof Request
        ? new Request(`${window.location.origin}${apiPath}`, input)
        : apiPath;
      const retryInput = typeof Request !== 'undefined' && proxyInput instanceof Request
        ? proxyInput.clone()
        : proxyInput;
      const response = await originalFetch(proxyInput, options);
      const isAuthLifecycle = apiPath.startsWith('/api/auth/');
      if (response.status !== 401 || isAuthLifecycle) return response;

      if (!(await refreshAuthSession())) return response;
      return originalFetch(retryInput, options);
    }
    return originalFetch(input, init);
  };
  window.__fogoCredentialedFetchInstalled = true;
};
