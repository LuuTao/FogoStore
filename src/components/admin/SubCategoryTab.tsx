import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function SubCategoryTab() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ id: '', name: '', categoryId: '', imageUrl: '', keyword: '', order: 0 });

  const fetchData = async () => {
    const res = await fetch('https://fogo-store-api.onrender.com/api/admin/subcategories');
    const d = await res.json();
    if (d.success) setItems(d.data);

    const catRes = await fetch('https://fogo-store-api.onrender.com/api/admin/inventory'); // hoặc API categories
    // nạp categories vào state
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('https://fogo-store-api.onrender.com/api/admin/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ id: '', name: '', categoryId: '', imageUrl: '', keyword: '', order: 0 });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa item này?')) {
      await fetch(`https://fogo-store-api.onrender.com/api/admin/subcategories/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-xs font-bold">Tên hiển thị</label>
          <input className="w-full border p-2 rounded text-sm" placeholder="VD: iPhone 17 Series" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold">Từ khóa lọc (Tìm theo tên)</label>
          <input className="w-full border p-2 rounded text-sm" placeholder="VD: 17, 17 Pro" value={form.keyword} onChange={e => setForm({...form, keyword: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold">Link Icon tròn</label>
          <input className="w-full border p-2 rounded text-sm" placeholder="URL ảnh" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-bold">Danh mục cha ID</label>
          <input className="w-full border p-2 rounded text-sm" placeholder="Nhập CategoryId" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required />
        </div>
        <button type="submit" className="bg-red-600 text-white p-2 rounded text-sm font-bold h-10 hover:bg-red-700">
          {form.id ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-3 border rounded-lg text-center flex flex-col items-center">
            <img src={item.imageUrl || '/placeholder.png'} className="w-14 h-14 rounded-full border object-cover mb-2" />
            <span className="font-bold text-xs">{item.name}</span>
            <span className="text-[10px] text-gray-500">Từ khóa: {item.keyword}</span>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setForm(item)} className="text-blue-600"><Edit size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}