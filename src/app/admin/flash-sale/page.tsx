'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Loader2, Save, TimerReset, Zap } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const getToken = () => typeof window === 'undefined' ? '' : localStorage.getItem('fogo_admin_token') || localStorage.getItem('fogo_token') || localStorage.getItem('token') || '';

const toLocalInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function FlashSaleAdminPage() {
  const [title, setTitle] = useState('FLASH SALE GIÁ SỐC');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [status, setStatus] = useState('INACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/flash-sale`, { headers: { Authorization: `Bearer ${getToken()}` }, cache: 'no-store' });
      const text = await res.text();
      const json = JSON.parse(text);
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Không thể tải cấu hình Flash Sale');
      const config = json.data?.config || {};
      setTitle(config.title || 'FLASH SALE GIÁ SỐC');
      setStartAt(toLocalInput(config.startAt));
      setEndAt(toLocalInput(config.endAt));
      setIsActive(Boolean(config.isActive));
      setStatus(json.data?.status || 'INACTIVE');
      setSelectedProducts(Array.isArray(json.data?.products) ? json.data.products : []);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Backend chưa được cập nhật chức năng Flash Sale.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/flash-sale`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          title,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          isActive,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Không thể lưu Flash Sale');
      setStatus(json.data?.status || 'INACTIVE');
      setMessage({ type: 'success', text: 'Đã lưu lịch Flash Sale thành công.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể lưu Flash Sale' });
    } finally {
      setSaving(false);
    }
  };

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Đang diễn ra',
    UPCOMING: 'Sắp diễn ra',
    ENDED: 'Đã kết thúc',
    INACTIVE: 'Đang tắt',
  };
  const selectedVariantCount = selectedProducts.reduce((total, product) => total + (Array.isArray(product.variants) ? product.variants.length : 0), 0);

  if (loading) return <div className="flex items-center justify-center p-20 text-sm font-bold text-gray-500"><Loader2 className="mr-2 animate-spin text-[#d70018]" /> Đang tải Flash Sale...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#d70018] to-[#9f0012] p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3"><Zap size={30} fill="currentColor" className="text-yellow-300" /><div><h1 className="text-2xl font-black uppercase">Quản lý Flash Sale</h1><p className="mt-1 text-sm text-white/80">Thiết lập lịch hiển thị trên trang chủ và chọn sản phẩm tại Tồn kho.</p></div></div>
            <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase">{statusLabel[status] || status}</span>
          </div>
        </div>

        {message && <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-[#d70018]'}`}>{message.text}</div>}

        {isActive && selectedVariantCount === 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black">Flash Sale đang chạy nhưng chưa có sản phẩm</p>
              <p className="mt-1 text-xs">Hãy tick “Flash Sale” cho ít nhất một sản phẩm trong Quản lý Tồn kho.</p>
            </div>
            <Link href="/admin/ton-kho" className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-center text-xs font-black text-white shadow-sm hover:bg-amber-600">
              Chọn sản phẩm
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold text-gray-700">Tiêu đề bảng Flash Sale</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#d70018]" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700"><CalendarClock size={16} /> Ngày giờ bắt đầu</span><input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#d70018]" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700"><TimerReset size={16} /> Ngày giờ kết thúc</span><input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#d70018]" /></label>
            <label className="md:col-span-2 flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"><div><p className="text-sm font-black text-gray-800">Hiển thị Flash Sale trên trang chủ</p><p className="text-xs text-gray-500">Bảng vẫn tự ẩn sau khi hết thời gian.</p></div><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-5 w-5 accent-[#d70018]" /></label>
          </div>
          <div className="mt-6 flex justify-end"><button type="button" onClick={saveConfig} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#d70018] px-6 py-3 text-sm font-black text-white shadow disabled:opacity-60">{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Lưu lịch Flash Sale</button></div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-black text-gray-900">Cấu hình đang được chọn</h2><p className="text-xs text-gray-500">Tick hoặc bỏ tick từng màu/dung lượng tại trang Quản lý Tồn kho.</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#d70018]">{selectedVariantCount} cấu hình</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {selectedVariantCount > 0 ? selectedProducts.flatMap((product) => (product.variants || []).map((variant: any) => (
              <div key={variant.id} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700">
                <p className="font-black">{product.name}</p>
                <p className="mt-1 text-[11px] text-gray-500">{[variant.storage, variant.size, variant.version, variant.color].filter(Boolean).join(' · ')}</p>
              </div>
            ))) : <p className="text-sm text-gray-400">Chưa có cấu hình sản phẩm nào được chọn.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
