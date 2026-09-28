'use client';
import { useEffect, useState } from 'react';
import { getProductTags, isUsedProduct, PRODUCT_TAGS, type TaggedProduct } from '@/lib/productTags';
import { ProductTagEditor } from '@/components/admin/ProductTagEditor';

type Product = TaggedProduct & { id: string; name: string };
const API = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  const keys = ['fogo_admin_token', 'admin_token', 'fogo_token', 'token', 'accessToken'];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  for (const key of ['user', 'currentUser']) {
    try {
      const user = JSON.parse(localStorage.getItem(key) || 'null');
      if (user?.token || user?.accessToken) return user.token || user.accessToken;
    } catch { /* Bỏ qua dữ liệu phiên không hợp lệ. */ }
  }
  return '';
};
async function readApiResponse(response: Response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw Error(response.ok ? 'API trả về dữ liệu không hợp lệ' : `API lỗi (${response.status}). Vui lòng kiểm tra URL backend.`); }
}
export default function ProductTagsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('fogo_product_custom_tags') || '[]');
      return Array.isArray(saved) ? saved.filter((tag): tag is string => typeof tag === 'string') : [];
    } catch { return []; }
  });
  const [newTag, setNewTag] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(API + '/api/admin/inventory', { signal: controller.signal, cache: 'no-store', headers: { Authorization: `Bearer ${getAdminToken()}` } })
      .then(async res => { const json = await readApiResponse(res); if (!res.ok) throw Error(json.message || json.error || 'Không thể tải sản phẩm'); return json; })
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
      const token = getAdminToken();
      if (!token) throw Error('Chưa có token đăng nhập admin. Vui lòng đăng nhập lại.');
      const res = await fetch(API + '/api/admin/products/' + editing.id + '/tags', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ tags }),
      });
      const json = await readApiResponse(res);
      if (!res.ok || !json.success) throw Error(json.error || json.message || 'Không thể lưu tag');
      setProducts(previous => previous.map(product => product.id === editing.id ? { ...product, specs: { ...(product.specs as object || {}), productTags: tags } } : product));
      setEditing(null); setMessage('Đã lưu tag sản phẩm.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể lưu tag'); }
    finally { setSaving(false); }
  }
  const dynamicTags = Array.from(new Set([
    ...PRODUCT_TAGS,
    ...customTags,
    ...products.flatMap(product => getProductTags(product)),
  ]));
  function addTag() {
    const tag = newTag.trim();
    if (!tag || dynamicTags.some(existing => existing.toLowerCase() === tag.toLowerCase())) return;
    const next = [...customTags, tag];
    setCustomTags(next);
    localStorage.setItem('fogo_product_custom_tags', JSON.stringify(next));
    setNewTag('');
    setMessage(`Đã thêm tag “${tag}”.`);
  }
  return <div className="space-y-4">
    <h1 className="text-xl font-bold">Quản lý tag sản phẩm</h1>
    <div className="flex flex-wrap items-center gap-2">
      <input aria-label="Tên tag mới" placeholder="Tên tag mới…" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTag(); }} className="border rounded p-2" />
      <button type="button" onClick={addTag} className="rounded bg-red-700 px-3 py-2 text-white font-semibold">Thêm tag</button>
    </div>
    <div className="flex flex-wrap gap-3">
      <input aria-label="Tìm sản phẩm" placeholder="Tìm tên sản phẩm…" value={query} onChange={e => setQuery(e.target.value)} className="border rounded p-2" />
      <select aria-label="Lọc tag" value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2">
        <option value="">Tất cả tag</option><option value="new">Máy mới</option><option value="used">Hàng cũ</option>
        {dynamicTags.map(tag => <option key={tag}>{tag}</option>)}
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
        <ProductTagEditor value={tags} onChange={setTags} availableTags={dynamicTags} />
        <div className="flex justify-end gap-4"><button disabled={saving} onClick={() => setEditing(null)}>Hủy</button><button disabled={saving} onClick={save} className="bg-red-700 text-white px-4 py-2 rounded">{saving ? 'Đang lưu…' : 'Lưu tag'}</button></div>
        {message && <p role="alert">{message}</p>}
      </div>
    </div>}
  </div>;
}
