'use client';

import { DragEvent, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, LayoutDashboard, Loader2, Save } from 'lucide-react';
import { DEFAULT_HOME_SECTIONS, HomeSectionSetting } from '@/components/home/HomeContentSections';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const LABELS: Record<string, string> = {
  hero: 'Banner chính và banner phụ',
  'flash-sale': 'Flash Sale',
  categories: 'Danh mục sản phẩm',
  iphone: 'Sản phẩm iPhone',
  ipad: 'Sản phẩm iPad',
  macbook: 'Sản phẩm MacBook',
  commitment: 'Cam kết dịch vụ',
  news: 'Tin tức mới nhất',
};

const getToken = () => typeof window === 'undefined' ? '' : localStorage.getItem('fogo_admin_token') || localStorage.getItem('fogo_token') || localStorage.getItem('token') || '';

export default function HomeLayoutAdminPage() {
  const [sections, setSections] = useState<HomeSectionSetting[]>(DEFAULT_HOME_SECTIONS);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/home-layout`, { headers: { Authorization: `Bearer ${getToken()}` }, cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json?.success) throw new Error(json?.error || 'Không thể tải bố cục Home');
        if (Array.isArray(json.data?.sections)) setSections(json.data.sections as HomeSectionSetting[]);
      })
      .catch((error) => setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể tải bố cục Home' }))
      .finally(() => setLoading(false));
  }, []);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setSections((current) => {
      const from = current.findIndex((section) => section.id === draggedId);
      const to = current.findIndex((section) => section.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/admin/home-layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sections }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) throw new Error(json?.error || 'Không thể lưu bố cục Home');
      setSections(json.data.sections as HomeSectionSetting[]);
      setMessage({ type: 'success', text: 'Đã cập nhật thứ tự trang Home.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể lưu bố cục Home' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-sm font-bold text-gray-500"><Loader2 className="mr-2 animate-spin text-[#d70018]" /> Đang tải bố cục Home...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-2xl bg-gradient-to-r from-[#d70018] to-[#9f0012] p-6 text-white shadow-lg">
          <div className="flex items-center gap-3"><LayoutDashboard size={30} /><div><h1 className="text-2xl font-black uppercase">Quản lý trang Home</h1><p className="mt-1 text-sm text-white/80">Kéo thả hoặc dùng mũi tên để đổi thứ tự các khối trên trang chủ.</p></div></div>
        </div>

        {message && <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-[#d70018]'}`}>{message.text}</div>}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDraggedId(section.id)}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, section.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${draggedId === section.id ? 'border-[#d70018] bg-red-50 opacity-60' : 'border-gray-200 bg-white hover:border-red-200'}`}
              >
                <GripVertical className="cursor-grab text-gray-400 active:cursor-grabbing" size={21} />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-black text-[#d70018]">{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-gray-800">{LABELS[section.id] || section.id}</p><p className="text-[11px] text-gray-400">{section.enabled ? 'Đang hiển thị' : 'Đang ẩn'}</p></div>
                <button type="button" onClick={() => setSections((current) => current.map((item) => item.id === section.id ? { ...item, enabled: !item.enabled } : item))} className={`rounded-lg p-2 ${section.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`} title={section.enabled ? 'Ẩn khối' : 'Hiện khối'}>{section.enabled ? <Eye size={17} /> : <EyeOff size={17} />}</button>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg border p-2 text-gray-600 disabled:opacity-30" title="Di chuyển lên"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1} className="rounded-lg border p-2 text-gray-600 disabled:opacity-30" title="Di chuyển xuống"><ArrowDown size={16} /></button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end"><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#d70018] px-6 py-3 text-sm font-black text-white shadow disabled:opacity-60">{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Lưu thứ tự Home</button></div>
        </div>
      </div>
    </div>
  );
}
