'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const defaults = [1, 2, 3].map((n) => ({ name: `Ảnh mẫu ${n}`, imageUrl: `/card-badges/sample-${n}.svg` }));
const ImagesContext = createContext(defaults);

export function ProductCardImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState(defaults);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/banners`, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        const rows: unknown = json.data || json;
        if (!Array.isArray(rows)) return;
        const configured = rows.filter((row) => row.position === 'product_card_images' || row.group === 'product_card_images')
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .slice(0, 3).map((row) => ({
            name: String(row.title || row.name || 'Ưu đãi'),
            imageUrl: String(row.imageUrl || ''),
          }));
        if (configured.length === 3 && configured.every((row) => row.imageUrl)) setImages(configured);
      } catch { /* Giữ ảnh mẫu khi API chưa sẵn sàng. */ }
    }
    void load();
    window.addEventListener('fogo_banners_updated', load);
    return () => { controller.abort(); window.removeEventListener('fogo_banners_updated', load); };
  }, []);
  return <ImagesContext.Provider value={images}>{children}</ImagesContext.Provider>;
}

export function ProductCardImages() {
  const images = useContext(ImagesContext);
  return <div className="grid grid-cols-3 gap-1" aria-label="Thông tin ưu đãi">
    {images.map((item, index) => {
      const src = item.imageUrl.startsWith('/card-badges/') || /^https?:\/\//.test(item.imageUrl) || item.imageUrl.startsWith('data:')
        ? item.imageUrl : `${API_URL}/${item.imageUrl.replace(/^\//, '')}`;
      return <img key={index} src={src} alt={item.name} loading="lazy" className="w-full aspect-[3/1] object-contain rounded border border-gray-100" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaults[index].imageUrl; }} />;
    })}
  </div>;
}

const labelPattern = /Like\s*New\s*99%|Chính\s*hãng(?:\s*VN\s*\/\s*A)?|New\s*Seal|CPO|Chưa\s*Active|Đã\s*Kích\s*Hoạt/gi;

export function productCardTitle(name: string) {
  return name.replace(labelPattern, '').replace(/\s*\bVN\s*\/\s*A\b/gi, '').replace(/\s+/g, ' ').replace(/^[\s|–-]+|[\s|–-]+$/g, '').trim();
}

const storagePattern = /\b(\d+(?:[.,]\d+)?\s*(?:TB|GB))\b\s*$/i;

export function splitProductCardTitle(name: string) {
  const cleanedName = productCardTitle(name);
  const storageMatch = cleanedName.match(storagePattern);
  if (!storageMatch) return { model: cleanedName, storage: '' };

  return {
    model: cleanedName.slice(0, storageMatch.index).trim(),
    storage: storageMatch[1].replace(/\s+/g, '').toUpperCase(),
  };
}

export function ProductCardTitle({ name, singleLine = false }: { name: string; singleLine?: boolean }) {
  const { model, storage } = splitProductCardTitle(name);
  const visibleModel = singleLine ? productCardTitle(name) : model;
  const visibleStorage = singleLine ? '' : storage;
  const containerRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<HTMLSpanElement>(null);
  const storageRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(13);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const modelLine = modelRef.current;
    const storageLine = storageRef.current;
    if (!container || !modelLine) return;

    const fitText = () => {
      const availableWidth = container.clientWidth;
      if (!availableWidth) return;

      let low = 9;
      let high = 16;
      for (let index = 0; index < 8; index += 1) {
        const candidate = (low + high) / 2;
        modelLine.style.fontSize = `${candidate}px`;
        if (storageLine) storageLine.style.fontSize = `${candidate}px`;
        const fits = modelLine.scrollWidth <= availableWidth
          && (!storageLine || storageLine.scrollWidth <= availableWidth);
        if (fits) low = candidate;
        else high = candidate;
      }
      setFontSize(Math.floor(low * 10) / 10);
    };

    fitText();
    const observer = new ResizeObserver(fitText);
    observer.observe(container);
    void document.fonts?.ready.then(fitText);
    return () => observer.disconnect();
  }, [visibleModel, visibleStorage]);

  return (
    <span ref={containerRef} className="block w-full min-w-0 leading-tight">
      <span ref={modelRef} className="block w-full whitespace-nowrap text-left" style={{ fontSize }}>{visibleModel}</span>
      {visibleStorage && <span ref={storageRef} className="block w-full whitespace-nowrap text-left" style={{ fontSize }}>{visibleStorage}</span>}
    </span>
  );
}

export function ProductCardTags({ name, tags }: { name: string; tags?: string[] }) {
  const labels = tags ?? Array.from(new Set((name.match(labelPattern) || []).map((label) =>
    /^chính/i.test(label) ? 'Chính hãng' : /^new/i.test(label) ? 'New Seal' : label)));
  if (!labels.length) return null;
  return <div className="flex flex-wrap justify-center gap-1 mt-1">
    {labels.map((label) => <span key={label} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-gray-600">{label}</span>)}
  </div>;
}
