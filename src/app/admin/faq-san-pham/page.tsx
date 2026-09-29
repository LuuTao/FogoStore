'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Save, Trash2 } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fogo_admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('fogo_token') || localStorage.getItem('token') || '';
};

export default function ProductFaqAdminPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [draft, setDraft] = useState({ question: '', answer: '' });
  const [message, setMessage] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadFaqs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/product-faqs`, { headers: { Authorization: `Bearer ${getAdminToken()}` }, cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Không thể tải FAQ');
      setFaqs(json.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải FAQ');
    }
  };

  useEffect(() => { loadFaqs(); }, []);

  const request = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || json.message || 'Không thể lưu FAQ');
    return json;
  };

  const addFaq = async () => {
    if (!draft.question.trim() || !draft.answer.trim()) return setMessage('Vui lòng nhập câu hỏi và câu trả lời.');
    setSavingId('new');
    try {
      await request(`${API_URL}/api/admin/product-faqs`, 'POST', draft);
      setDraft({ question: '', answer: '' });
      setMessage('Đã thêm FAQ.');
      await loadFaqs();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể thêm FAQ'); }
    finally { setSavingId(null); }
  };

  const saveFaq = async (faq: FaqItem) => {
    setSavingId(faq.id);
    try {
      await request(`${API_URL}/api/admin/product-faqs/${faq.id}`, 'PUT', faq);
      setMessage('Đã lưu FAQ.');
      await loadFaqs();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể lưu FAQ'); }
    finally { setSavingId(null); }
  };

  const deleteFaq = async (id: string) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    setSavingId(id);
    try {
      await request(`${API_URL}/api/admin/product-faqs/${id}`, 'DELETE');
      setFaqs((items) => items.filter((item) => item.id !== id));
      setMessage('Đã xóa FAQ.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể xóa FAQ'); }
    finally { setSavingId(null); }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-black text-gray-900">FAQ sản phẩm</h1>
        <p className="mt-1 text-sm text-gray-500">Các câu hỏi này hiển thị mặc định dưới mô tả của mọi trang sản phẩm.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2"><Plus size={17} className="text-[#d70018]" /> Thêm câu hỏi</h2>
        <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Nhập câu hỏi..." className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[#d70018]" />
        <textarea value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} placeholder="Nhập câu trả lời..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[#d70018]" />
        <button type="button" onClick={addFaq} disabled={savingId === 'new'} className="rounded-lg bg-[#d70018] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{savingId === 'new' ? 'Đang thêm...' : 'Thêm FAQ'}</button>
      </div>

      {message && <p className="text-sm font-medium text-[#d70018]">{message}</p>}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex gap-3 items-center">
              <ChevronDown size={18} className="text-[#d70018] shrink-0" />
              <input value={faq.question} onChange={(e) => setFaqs((items) => items.map((item) => item.id === faq.id ? { ...item, question: e.target.value } : item))} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#d70018]" />
              <label className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"><input type="checkbox" checked={faq.isActive} onChange={(e) => setFaqs((items) => items.map((item) => item.id === faq.id ? { ...item, isActive: e.target.checked } : item))} className="accent-[#d70018]" /> Hiện</label>
            </div>
            <textarea value={faq.answer} onChange={(e) => setFaqs((items) => items.map((item) => item.id === faq.id ? { ...item, answer: e.target.value } : item))} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[#d70018]" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => deleteFaq(faq.id)} disabled={savingId === faq.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-[#d70018] disabled:opacity-60"><Trash2 size={14} className="inline mr-1" />Xóa</button>
              <button type="button" onClick={() => saveFaq(faq)} disabled={savingId === faq.id} className="rounded-lg bg-[#d70018] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Save size={14} className="inline mr-1" />Lưu</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
