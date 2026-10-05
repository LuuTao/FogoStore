import { getAuthToken } from '@/services/clientApi';

const orderTokenKey = (orderCode: string) => `fogo_order_access:${orderCode.trim().toUpperCase()}`;

export const clearOrderAccessToken = (orderCode: string) => {
  if (typeof window === 'undefined' || !orderCode) return;
  localStorage.removeItem(orderTokenKey(orderCode));
};

export const getOrderAccessToken = (orderCode: string) => {
  if (typeof window === 'undefined' || !orderCode) return '';
  return localStorage.getItem(orderTokenKey(orderCode)) || '';
};

export const getOrderAccessHeaders = (orderCode: string, phone?: string) => {
  const headers: Record<string, string> = {};
  const authToken = getAuthToken();
  const orderToken = getOrderAccessToken(orderCode);
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (orderToken) headers['x-order-token'] = orderToken;
  if (!orderToken && phone?.trim()) headers['x-order-phone'] = phone.trim();
  return headers;
};
