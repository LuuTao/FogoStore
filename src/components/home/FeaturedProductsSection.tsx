'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock3, Flame, Zap } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const formatImage = (value?: string) => {
  if (!value) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return `${API_URL}/${value.replace(/^\//, '')}`;
};

const formatDateTime = (value?: string | null) => value
  ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : '--';

export const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/flash-sale`, { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Không thể tải Flash Sale');
        setConfig(json.data?.config || null);
        setProducts(Array.isArray(json.data?.products) ? json.data.products : []);
      })
      .catch((error) => console.error('Lỗi tải Flash Sale:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    if (!config?.isActive || !config.startAt || !config.endAt) return 'INACTIVE';
    const start = new Date(config.startAt).getTime();
    const end = new Date(config.endAt).getTime();
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    return 'ACTIVE';
  }, [config, now]);

  const countdown = useMemo(() => {
    const target = status === 'UPCOMING' ? new Date(config.startAt).getTime() : new Date(config?.endAt || 0).getTime();
    const seconds = Math.max(0, Math.floor((target - now) / 1000));
    return {
      days: Math.floor(seconds / 86400),
      hours: Math.floor((seconds % 86400) / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60,
    };
  }, [config, now, status]);

  const moveSlider = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-flash-card]');
    const step = (card?.offsetWidth || Math.max(240, track.clientWidth * 0.25)) + 12;
    const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step / 2;
    const isAtStart = track.scrollLeft <= step / 2;
    const left = direction > 0 && isAtEnd
      ? 0
      : direction < 0 && isAtStart
        ? track.scrollWidth
        : track.scrollLeft + direction * step;
    track.scrollTo({ left, behavior: 'smooth' });
  };

  useEffect(() => {
    if (products.length < 2 || isHovered || !['UPCOMING', 'ACTIVE'].includes(status)) return;
    const timer = window.setInterval(() => moveSlider(1), 5000);
    return () => window.clearInterval(timer);
  }, [products.length, isHovered, status]);

  if (loading || !config?.isActive || products.length === 0 || status === 'ENDED' || status === 'INACTIVE') return null;

  const timeParts = [
    ...(countdown.days > 0 ? [{ label: 'Ngày', value: countdown.days }] : []),
    { label: 'Giờ', value: countdown.hours },
    { label: 'Phút', value: countdown.minutes },
    { label: 'Giây', value: countdown.seconds },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-7">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-yellow-300 bg-gradient-to-b from-[#ec001b] via-[#d70018] to-[#b90014] p-3 sm:p-5 shadow-xl">
        <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-20 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-3 border-b border-white/25 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-[#d70018] shadow-md">
              <Zap size={23} fill="currentColor" className="animate-pulse" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-200">Ưu đãi giới hạn</p>
              <h2 className="text-xl font-black uppercase leading-tight sm:text-3xl">{config.title || 'Flash Sale Giá Sốc'}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-white">
            <div className="mr-1">
              <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-yellow-100">
                <Clock3 size={13} /> {status === 'UPCOMING' ? 'Bắt đầu sau' : 'Kết thúc sau'}
              </p>
              <p className="mt-0.5 text-[10px] text-white/80">{formatDateTime(config.startAt)} – {formatDateTime(config.endAt)}</p>
            </div>
            {timeParts.map((part, index) => (
              <React.Fragment key={part.label}>
                {index > 0 && <span className="font-black text-yellow-200">:</span>}
                <div className="min-w-11 rounded-lg bg-white px-2 py-1.5 text-center text-[#d70018] shadow-md">
                  <strong className="block text-lg font-black leading-none">{String(part.value).padStart(2, '0')}</strong>
                  <span className="text-[8px] font-bold uppercase text-gray-500">{part.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="relative mt-4" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <button type="button" onClick={() => moveSlider(-1)} aria-label="Sản phẩm trước" className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#d70018] shadow-lg transition hover:scale-110"><ChevronLeft size={22} /></button>
          <div ref={trackRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => {
              const variants = (Array.isArray(product.variants) ? product.variants : [])
                .filter((variant: any) => Number(variant.price) > 0)
                .sort((a: any, b: any) => Number(a.price) - Number(b.price));
              const variant = variants.find((item: any) => Number(item.stock) > 0) || variants[0] || {};
              const price = Number(variant.price || 0);
              const originalPrice = Number(variant.originalPrice || price);
              const discount = originalPrice > price && price > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
              const image = formatImage(Array.isArray(variant.images) ? variant.images[0] : variant.images || product.imageUrl);
              const href = `/san-pham/${variant.slug || product.slug}${variant.id ? `?proid=${variant.id}` : ''}`;

              return (
                <Link key={product.id} data-flash-card href={href} className="group min-w-[47%] snap-start rounded-2xl bg-white p-3 text-gray-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:min-w-[31%] md:min-w-[23%] lg:min-w-[18.9%]">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f7f7f9]">
                    {discount > 0 && <span className="absolute left-2 top-2 z-10 rounded-md bg-[#d70018] px-2 py-1 text-[10px] font-black text-white">-{discount}%</span>}
                    <img src={image} alt={product.name} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-3 min-h-10 line-clamp-2 text-sm font-extrabold leading-5">{product.name}</h3>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-black text-[#d70018] sm:text-lg">{price > 0 ? `${price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                    {originalPrice > price && <span className="text-[11px] text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}đ</span>}
                  </div>
                  <div className="mt-3 h-5 overflow-hidden rounded-full bg-red-100 text-center text-[9px] font-bold leading-5 text-[#d70018]">
                    <span className="inline-flex items-center gap-1"><Flame size={11} fill="currentColor" /> Còn {Math.max(0, Number(variant.stock || 0))} suất</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <button type="button" onClick={() => moveSlider(1)} aria-label="Sản phẩm tiếp theo" className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#d70018] shadow-lg transition hover:scale-110"><ChevronRight size={22} /></button>
        </div>
      </div>
    </section>
  );
};
