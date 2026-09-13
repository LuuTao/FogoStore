const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com';
export const API_BASE = RAW_API_URL.replace(/\/$/, '');

export const getFullImageUrl = (url?: string | null): string => {
  if (!url) return 'https://placehold.co/600x400';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:5000')) {
      return url.replace(/http:\/\/localhost:[0-9]+/g, API_BASE);
    }
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${cleanPath}`;
};