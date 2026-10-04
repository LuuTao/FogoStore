type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  request?: Promise<unknown>;
};

const responseCache = new Map<string, CacheEntry>();

/**
 * Cache ngắn ở phía trình duyệt và gộp các request trùng nhau đang chạy.
 * Dữ liệu tồn kho/Flash Sale dùng TTL rất ngắn; nội dung Home dùng TTL dài hơn.
 */
export async function fetchJsonCached<T>(url: string, ttlMs = 60_000, init?: RequestInit): Promise<T> {
  const now = Date.now();
  const existing = responseCache.get(url);

  if (existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value as T;
  }

  if (existing?.request) {
    return existing.request as Promise<T>;
  }

  const request = fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      }
      responseCache.set(url, { value: data, expiresAt: Date.now() + ttlMs });
      return data as T;
    })
    .catch((error) => {
      responseCache.delete(url);
      throw error;
    });

  responseCache.set(url, { expiresAt: now + ttlMs, request });
  return request;
}

export function invalidateClientFetchCache(urlPart?: string) {
  if (!urlPart) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.includes(urlPart)) responseCache.delete(key);
  }
}
