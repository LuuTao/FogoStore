import DOMPurify from 'dompurify';

function sanitizeOnServer(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:javascript|vbscript)\s*:/gi, '');
}

export function sanitizeHtml(value?: string | null) {
  const html = String(value || '');
  const purifier = DOMPurify as unknown as { sanitize?: (dirty: string) => string };

  if (typeof window !== 'undefined' && typeof purifier?.sanitize === 'function') {
    return purifier.sanitize(html);
  }

  // DOMPurify cần DOM của trình duyệt; bản lọc này giữ SSR an toàn và tránh lỗi 500.
  return sanitizeOnServer(html);
}
