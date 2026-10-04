'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock3, Flame, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ToastNotification } from '@/components/common/ToastNotification';
import { ProductCardImages, ProductCardTags } from '@/components/common/ProductCardExtras';
import { getProductTags } from '@/lib/productTags';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { fetchJsonCached } from '@/lib/clientFetchCache';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

type FlashSaleVariant = {
  id?: string;
  slug?: string;
  storage?: string;
  color?: string;
  size?: string | null;
  version?: string | null;
  price?: number | string;
  originalPrice?: number | string;
  stock?: number | string;
  images?: string[] | string;
  createdAt?: string;
};

type FlashSaleProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  specs?: unknown;
  variants?: FlashSaleVariant[];
};

type FlashSaleConfig = {
  title?: string;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
};

const formatImage = (value?: string) => {
  if (!value) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return `${API_URL}/${value.replace(/^\//, '')}`;
};

const formatSaleSlot = (value?: string | null) => value
  ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    .format(new Date(value))
    .replace(',', ' •')
  : '--';

export const FeaturedProductsSection: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [config, setConfig] = useState<FlashSaleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const trackRef = useRef<HTMLDivElement>(null);

  const flashItems = useMemo(() => products.flatMap((product) =>
    (Array.isArray(product.variants) ? product.variants : []).map((variant) => ({ product, variant }))
  ), [products]);

  useEffect(() => {
    fetchJsonCached<any>(`${API_URL}/api/flash-sale`, 15_000)
      .then((json) => {
        if (!json?.success) throw new Error(json?.error || 'Không thể tải Flash Sale');
        setConfig(json.data?.config || null);
        setProducts(Array.isArray(json.data?.products) ? json.data.products as FlashSaleProduct[] : []);
      })
      .catch((error) => console.error('Lỗi tải Flash Sale:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
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
    const targetValue = status === 'UPCOMING' ? config?.startAt : config?.endAt;
    const target = new Date(targetValue || 0).getTime();
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

  const handleAddToCart = async (event: React.MouseEvent, product: FlashSaleProduct, variant: FlashSaleVariant, imageUrl: string) => {
    event.preventDefault();
    event.stopPropagation();
    await addToCart({
      id: variant.id || product.id,
      name: product.name,
      modelSlug: product.slug,
      price: Number(variant.price || 0),
      originalPrice: Number(variant.originalPrice || variant.price || 0),
      storage: variant.storage || 'Tiêu chuẩn',
      color: variant.color || 'Tiêu chuẩn',
      imageUrl,
      quantity: 1,
    });
    setToast({ show: true, message: `Đã thêm ${product.name} vào giỏ hàng!` });
  };

  useEffect(() => {
    if (flashItems.length < 2 || isHovered || !['UPCOMING', 'ACTIVE'].includes(status)) return;
    const timer = window.setInterval(() => moveSlider(1), 5000);
    return () => window.clearInterval(timer);
  }, [flashItems.length, isHovered, status]);

  // Lịch Flash Sale và danh sách sản phẩm là hai phần cấu hình độc lập.
  // Không ẩn toàn bộ bảng chỉ vì quản trị viên chưa tick sản phẩm.
  if (loading || !config?.isActive || status === 'ENDED' || status === 'INACTIVE') return null;

  const timeParts = [
    ...(countdown.days > 0 ? [{ label: 'Ngày', value: countdown.days }] : []),
    { label: 'Giờ', value: countdown.hours },
    { label: 'Phút', value: countdown.minutes },
    { label: 'Giây', value: countdown.seconds },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-9">
      <ToastNotification show={toast.show} message={toast.message} onClose={() => setToast((current) => ({ ...current, show: false }))} />
      <div className="relative pt-7 sm:pt-9">
        <div className="pointer-events-none absolute inset-x-6 top-4 h-14 bg-gradient-to-r from-[#f13a22] via-[#ff5a3c] to-[#f13a22] [clip-path:polygon(4%_0,96%_0,100%_100%,0_100%)] sm:inset-x-10" />
        <div className="absolute left-1/2 top-0 z-20 w-[72%] max-w-[485px] -translate-x-1/2 rounded-t-2xl border-b-4 border-[#9d0012] bg-gradient-to-b from-[#ef3347] to-[#c41329] px-4 py-3 text-center text-white shadow-lg">
          <div className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[108%] -translate-x-1/2 rounded-t-xl bg-[#8e0010] -z-10" />
          <h2 className="truncate text-base font-black uppercase italic sm:text-xl">{config.title || 'Flash Sale Giá Sốc'}</h2>
        </div>

        <div className="relative z-10 overflow-hidden rounded-[22px] border-[3px] border-[#ffd25a] bg-[#dc0b0b] px-2.5 pb-3 pt-6 shadow-[0_4px_0_#b78b22,0_12px_25px_rgba(120,0,0,0.25)] sm:px-5 sm:pb-4 sm:pt-7">
          <div className="pointer-events-none absolute -left-4 top-12 rotate-[-25deg] rounded bg-yellow-300 px-2 py-1 text-sm font-black text-[#d70018] shadow">%</div>
          <div className="pointer-events-none absolute -right-4 top-12 rotate-[25deg] rounded bg-yellow-300 px-2 py-1 text-sm font-black text-[#d70018] shadow">%</div>

          <div className="relative flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 rounded-full bg-white px-4 py-2 text-[11px] font-black text-[#d70018] shadow-sm sm:text-sm">{formatSaleSlot(config.startAt)}</span>
              <span className="shrink-0 rounded-full border-2 border-white px-4 py-1.5 text-[11px] font-black text-white sm:text-sm">{formatSaleSlot(config.endAt)}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-white sm:justify-end">
              <p className="mr-1 flex items-center gap-1 text-[11px] font-black uppercase sm:text-base">
                <Clock3 size={15} /> {status === 'UPCOMING' ? 'Bắt đầu sau' : 'Kết thúc sau'}
              </p>
              {timeParts.map((part, index) => (
                <React.Fragment key={part.label}>
                  {index > 0 && <span className="text-base font-black">:</span>}
                  <div className="min-w-9 rounded-md bg-white px-1.5 py-1 text-center text-[#d70018] shadow-sm sm:min-w-11 sm:px-2 sm:py-1.5">
                    <strong className="block text-base font-black leading-none sm:text-xl">{String(part.value).padStart(2, '0')}</strong>
                    <span className="text-[7px] font-bold uppercase text-gray-500">{part.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {flashItems.length > 0 ? (
            <>
              <button type="button" onClick={() => moveSlider(-1)} aria-label="Sản phẩm trước" className="absolute -left-1 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-r-full bg-white/95 text-gray-800 shadow-lg transition hover:scale-105 sm:h-12 sm:w-9"><ChevronLeft size={24} /></button>
              <div ref={trackRef} className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3">
                {flashItems.map(({ product, variant }) => {
                  const price = Number(variant.price || 0);
                  const originalPrice = Number(variant.originalPrice || price);
                  const discount = originalPrice > price && price > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
                  const image = formatImage(Array.isArray(variant.images) ? variant.images[0] : variant.images || product.imageUrl);
                  const href = `/san-pham/${variant.slug || product.slug}${variant.id ? `?proid=${variant.id}` : ''}`;

                  return (
                    <div key={variant.id || `${product.id}-${variant.slug}`} data-flash-card className="group w-[47%] flex-none snap-start overflow-hidden rounded-xl bg-white p-2 text-gray-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[31%] md:w-[23%] lg:w-[19.1%] lg:p-2.5">
                      <Link href={href} className="relative block aspect-square overflow-hidden rounded-lg bg-white">
                        {discount > 0 && <span className="absolute left-2 top-2 z-10 rounded-md bg-[#d70018] px-2 py-1 text-[10px] font-black text-white">-{discount}%</span>}
                        <OptimizedImage src={image} alt={product.name} fill className="object-contain p-2 transition duration-500 group-hover:scale-105" />
                      </Link>
                      <Link href={href} className="mt-2 block min-h-10 line-clamp-2 text-xs font-bold leading-5 hover:text-[#d70018] sm:text-sm">{product.name}</Link>
                      <p className="mt-0.5 truncate text-[10px] font-semibold text-gray-500">{[variant.storage, variant.size, variant.version, variant.color].filter(Boolean).join(' · ')}</p>
                      <ProductCardTags name={product.name} tags={getProductTags(product)} />
                      <ProductCardImages />
                      <span className="mt-1 block w-fit rounded-xs bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-700 sm:text-[9px]">{Number(variant.stock || 0) > 0 ? 'Sẵn hàng' : 'Hết hàng'}</span>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#d70018] sm:text-base">{price > 0 ? `${price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                        {originalPrice > price && <span className="text-[11px] text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}đ</span>}
                      </div>
                      <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#f8c3cb] text-center text-[8px] font-bold leading-4 text-white">
                        <span className="inline-flex items-center gap-1"><Flame size={10} fill="currentColor" /> Còn {Math.max(0, Number(variant.stock || 0))} suất</span>
                      </div>
                      <button type="button" disabled={Number(variant.stock || 0) <= 0} onClick={(event) => handleAddToCart(event, product, variant, image)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-[#d70018] py-1.5 text-[9px] font-black uppercase text-white transition hover:bg-[#b50014] disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-[10px]">
                        <ShoppingCart size={11} /> Thêm giỏ hàng
                      </button>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => moveSlider(1)} aria-label="Sản phẩm tiếp theo" className="absolute -right-1 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-l-full bg-white/95 text-gray-800 shadow-lg transition hover:scale-105 sm:h-12 sm:w-9"><ChevronRight size={24} /></button>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/50 bg-white/10 px-4 py-8 text-center text-white">
              <Flame className="mx-auto mb-2 text-yellow-300" size={28} />
              <p className="font-black">Sản phẩm Flash Sale đang được cập nhật</p>
              <p className="mt-1 text-xs text-white/80">Các ưu đãi sẽ xuất hiện tại đây trong ít phút nữa.</p>
            </div>
          )}
        </div>

          <p className="mt-3 px-2 text-center text-[9px] font-bold leading-4 text-white sm:text-xs">
            Áp dụng cho sản phẩm được chọn trong Flash Sale — Số lượng ưu đãi có hạn trong thời gian chương trình.
          </p>
        </div>
      </div>
    </section>
  );
};
