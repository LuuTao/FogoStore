'use client';
import { useEffect, useState } from 'react';
import { getProductTags, isUsedProduct, PRODUCT_TAGS, type TaggedProduct } from '@/lib/productTags';
import { ProductTagEditor } from '@/components/admin/ProductTagEditor';

type Product = TaggedProduct & { id: string; name: string };
const API = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
export default function ProductTagsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(API + '/api/admin/inventory', { signal: controller.signal, cache: 'no-store' })
      .then(async res => { if (!res.ok) throw Error('Không thể tải sản phẩm'); return res.json(); })
      .then(json => {
        if (!json.success || !Array.isArray(json.data)) throw Error('Không thể tải sản phẩm');
        const map = new Map<string, Product>();
        json.data.forEach((row: { product?: Product }) => { if (row.product) map.set(row.product.id, row.product); });
        setProducts([...map.values()]);
      })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  async function save() {
    if (!editing) return;
    setSaving(true); setMessage('');
    try {
      const token = localStorage.getItem('fogo_token') || localStorage.getItem('token') || localStorage.getItem('fogo_admin_token') || '';
      const res = await fetch(API + '/api/admin/products/' + editing.id + '/tags', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ tags }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw Error(json.error || json.message || 'Không thể lưu tag');
      setProducts(previous => previous.map(product => product.id === editing.id ? { ...product, specs: { ...(product.specs as object || {}), productTags: tags } } : product));
      setEditing(null); setMessage('Đã lưu tag sản phẩm.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể lưu tag'); }
    finally { setSaving(false); }
  }
  return <div className="space-y-4">
    <h1 className="text-xl font-bold">Quản lý tag sản phẩm</h1>
    <div className="flex flex-wrap gap-3">
      <input aria-label="Tìm sản phẩm" placeholder="Tìm tên sản phẩm…" value={query} onChange={e => setQuery(e.target.value)} className="border rounded p-2" />
      <select aria-label="Lọc tag" value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2">
        <option value="">Tất cả tag</option><option value="new">Máy mới</option><option value="used">Hàng cũ</option>
        {PRODUCT_TAGS.map(tag => <option key={tag}>{tag}</option>)}
      </select>
    </div>
    {message && <p role="status">{message}</p>}
    {loading ? <p>Đang tải sản phẩm…</p> : products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) && (!filter || (filter === 'new' ? !isUsedProduct(p) : filter === 'used' ? isUsedProduct(p) : getProductTags(p).includes(filter)))).map(p =>
      <div key={p.id} className="bg-white border rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-semibold">{p.name}</p><p className="text-sm text-gray-500">{getProductTags(p).join(' · ') || 'Chưa có tag'} — {isUsedProduct(p) ? 'Hàng cũ' : 'Máy mới'}</p></div>
        <button className="text-red-700 font-semibold" onClick={() => { setEditing(p); setTags(getProductTags(p)); }}>Sửa tag</button>
      </div>)}
    {editing && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg space-y-4">
        <h2 className="font-bold">{editing.name}</h2>
        <ProductTagEditor value={tags} onChange={setTags} />
        <div className="flex justify-end gap-4"><button disabled={saving} onClick={() => setEditing(null)}>Hủy</button><button disabled={saving} onClick={save} className="bg-red-700 text-white px-4 py-2 rounded">{saving ? 'Đang lưu…' : 'Lưu tag'}</button></div>
        {message && <p role="alert">{message}</p>}
      </div>
    </div>}
  </div>;
}
