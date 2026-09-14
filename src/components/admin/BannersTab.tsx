'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Tablet,
  Laptop,
  Save,
  RotateCcw,
  Sliders,
  CreditCard,
  X,
} from 'lucide-react';

interface Props {
  banners?: any[];
  onRefresh?: () => void;
}

type BannerGroup =
  | 'hero_banners'       // Banner Lớn Đầu Trang (Home)
  | 'promo_cards'        // 2 Banner Nhỏ Đè Hero (Home)
  | 'iphone_banners'     // Banner Trang iPhone
  | 'ipad_banners'       // Banner Trang iPad
  | 'macbook_banners'    // Banner Trang MacBook
  | 'sub_iphone'         // Icon Sub iPhone
  | 'sub_ipad'           // Icon Sub iPad
  | 'sub_macbook'        // Icon Sub MacBook
  | 'commit_cards';      // 4 Ô Cam Kết

interface ItemConfig {
  id: string;
  name: string;
  link?: string;
  group: BannerGroup;
  imageUrl: string;
  subtitle?: string;
  tag?: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:')) {
      return url.replace(/http:\/\/localhost:[0-9]+/g, API_URL);
    }
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanPath}`;
};

const INITIAL_ITEMS: ItemConfig[] = [
  { id: 'hero-1', name: 'Đại Tiệc Mua Sắm Apple - Giảm Sốc Đến 40%', link: '/iphone', group: 'hero_banners', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80', tag: 'SIÊU SALE', subtitle: 'Áp dụng cho toàn bộ dòng sản phẩm Apple chính hãng' },
  { id: 'hero-2', name: 'MacBook & iPad M-Series Trợ Giá Thu Cũ Đến 2 Triệu', link: '/macbook', group: 'hero_banners', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80', tag: 'TRỢ GIÁ', subtitle: 'Bảo hành chính hãng 12 tháng 1 đổi 1' },
  { id: 'promo-1', name: 'AirPods 4', subtitle: 'Chính hãng VN/A', tag: 'HSSV giảm đến 150K', link: '/san-pham/airpods-4', group: 'promo_cards', imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=300&q=80' },
  { id: 'promo-2', name: 'Apple Watch SE 3', subtitle: 'Chính hãng VN/A', tag: 'Ưu đãi thanh toán đến 700K', link: '/san-pham/apple-watch-se', group: 'promo_cards', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80' },
  
  // Banner Trang iPhone
  { id: 'ip-b1', name: 'Thế Hệ iPhone Mới Nhất', subtitle: 'Sức mạnh Apple Intelligence đỉnh cao.', tag: 'Giá tốt nhất', link: '/iphone', group: 'iphone_banners', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80' },
  { id: 'ip-b2', name: 'iPhone 17 Series', subtitle: 'Chính hãng Apple VN/A - Bảo hành 1 đổi 1', tag: 'Trả trước 0đ', link: '/iphone', group: 'iphone_banners', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80' },

  // Banner Trang iPad
  { id: 'id-b1', name: 'iPad Pro Thế Hệ Mới', subtitle: 'Mỏng siêu thực. Sức mạnh AI không giới hạn.', tag: 'Sẵn hàng', link: '/ipad', group: 'ipad_banners', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80' },
  { id: 'id-b2', name: 'Tất cả sản phẩm iPad', subtitle: 'Chính hãng Apple VN/A - Bảo hành 1 đổi 1', tag: 'Trả trước 0đ', link: '/ipad', group: 'ipad_banners', imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80' },

  // Banner Trang MacBook
  { id: 'mb-b1', name: 'MacBook Pro M5 / M4', subtitle: 'Hiệu năng tối thượng cho chuyên gia đồ họa.', tag: 'Ưu đãi', link: '/macbook', group: 'macbook_banners', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 'mb-b2', name: 'Tất cả sản phẩm MacBook', subtitle: 'Chính hãng Apple VN/A - Bảo hành 12 tháng', tag: 'Trả trước 0đ', link: '/macbook', group: 'macbook_banners', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80' },

  { id: 'sub-ip-1', name: 'iPhone 16 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-2', name: 'iPhone 15 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-1', name: 'iPad Pro', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-2', name: 'iPad Air', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-1', name: 'MacBook Pro', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-2', name: 'MacBook Air', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80' },
  { id: 'commit-1', name: 'BẢO HÀNH VÀ HẬU MÃI', tag: 'ĐI ĐẦU VỀ CHẾ ĐỘ', subtitle: 'BẢO HÀNH VÀ HẬU MÃI', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80' },
  { id: 'commit-2', name: 'SẢN PHẨM MINH BẠCH', tag: 'MINH BẠCH', subtitle: 'GIÁ BÁN NIÊM YẾT', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80' },
];

export default function BannersTab({ banners: propBanners, onRefresh }: Props) {
  const [activeGroup, setActiveGroup] = useState<BannerGroup>('hero_banners');
  const [items, setItems] = useState<ItemConfig[]>(INITIAL_ITEMS);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemConfig | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propBanners && Array.isArray(propBanners) && propBanners.length > 0) {
      const mapped = propBanners.map((b: any) => ({
        id: b.id,
        name: b.title || b.name || 'Banner',
        link: b.linkUrl || b.link || '/',
        group: (b.position || b.group || 'hero_banners') as BannerGroup,
        imageUrl: resolveImageUrl(b.imageUrl),
      }));
      setItems(mapped);
    } else {
      try {
        const savedBanners = localStorage.getItem('fogo_banners_config');
        if (savedBanners) {
          const parsed = JSON.parse(savedBanners);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed.map((it: ItemConfig) => ({ ...it, imageUrl: resolveImageUrl(it.imageUrl) })));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [propBanners]);

  const currentItems = items.filter((it) => it.group === activeGroup);

  const handleSaveAllConfig = async () => {
    setIsSaving(true);
    try {
      const payloadItems = items.map((it, idx) => ({
        id: it.id,
        title: it.name,
        name: it.name,
        imageUrl: it.imageUrl,
        linkUrl: it.link || '/',
        position: it.group,
        group: it.group,
        isActive: true,
        order: idx,
      }));

      await fetch(`${API_URL}/api/admin/banners/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });

      localStorage.setItem('fogo_banners_config', JSON.stringify(items));
      setHasUnsavedChanges(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Lỗi lưu cấu hình: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (!confirm('Khôi phục cấu hình banner về mặc định?')) return;
    setItems(INITIAL_ITEMS);
    localStorage.removeItem('fogo_banners_config');
    setHasUnsavedChanges(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemName('');
    setItemImageUrl('');
    setItemLink('');
    setItemTag('');
    setItemSubtitle('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (it: ItemConfig) => {
    setEditingItem(it);
    setItemName(it.name);
    setItemImageUrl(it.imageUrl);
    setItemLink(it.link || '');
    setItemTag(it.tag || '');
    setItemSubtitle(it.subtitle || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setItemImageUrl(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemImageUrl.trim()) return;

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, name: itemName, imageUrl: itemImageUrl, link: itemLink, tag: itemTag, subtitle: itemSubtitle } : it))
      );
    } else {
      setItems((prev) => [...prev, { id: `item-${Date.now()}`, name: itemName, link: itemLink, group: activeGroup, imageUrl: itemImageUrl, tag: itemTag, subtitle: itemSubtitle }]);
    }

    setHasUnsavedChanges(true);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none relative">
      {saveToast && (
        <div className="fixed top-20 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 font-bold text-xs">
            <CheckCircle2 size={18} />
            <span>Đã lưu thành công cấu hình Banner vào Database!</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <ImageIcon size={22} className="text-[#d70018]" />
            <span>Quản Lý Banner &amp; Danh Mục (Trang Chủ &amp; Trang Sản Phẩm)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Tùy chỉnh linh hoạt banner trang chủ, banner danh mục iPhone, iPad, MacBook...</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handleResetDefault} className="px-3 py-2 border text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RotateCcw size={14} /> Khôi Phục
          </button>
          <button onClick={handleOpenAdd} className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} /> Thêm Mục
          </button>
          <button onClick={handleSaveAllConfig} disabled={isSaving} className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 cursor-pointer shadow-md ${hasUnsavedChanges ? 'bg-[#d70018] text-white animate-pulse' : 'bg-[#00a859] text-white'}`}>
            <Save size={16} /> {isSaving ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 text-xs">
        {[
          { id: 'hero_banners', label: 'Banner Lớn (Hero)' },
          { id: 'promo_cards', label: '2 Banner Nhỏ Đè Hero' },
          { id: 'iphone_banners', label: 'Banner Trang iPhone' },
          { id: 'ipad_banners', label: 'Banner Trang iPad' },
          { id: 'macbook_banners', label: 'Banner Trang MacBook' },
          { id: 'sub_iphone', label: 'Icon Sub iPhone' },
          { id: 'sub_ipad', label: 'Icon Sub iPad' },
          { id: 'sub_macbook', label: 'Icon Sub MacBook' },
          { id: 'commit_cards', label: 'Banner Cam Kết 4 Ô' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGroup(tab.id as BannerGroup)}
            className={`px-4 py-2.5 rounded-t-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeGroup === tab.id ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018]' : 'text-gray-600 bg-gray-100'
            }`}
          >
            {tab.label} ({items.filter((i) => i.group === tab.id).length})
          </button>
        ))}
      </div>

      {/* DANH SÁCH HIỂN THỊ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentItems.map((item) => (
            <div key={item.id} className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <img src={resolveImageUrl(item.imageUrl)} alt="" className="w-20 h-14 object-cover rounded border bg-white shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                  <p className="text-[11px] text-gray-500">{item.subtitle || item.link}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded border cursor-pointer"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded border cursor-pointer"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">{editingItem ? 'Chỉnh Sửa Mục' : 'Thêm Mục Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveModal} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tiêu đề / Tên *</label>
                <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border rounded p-2 outline-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Đường dẫn khi click</label>
                <input type="text" value={itemLink} onChange={(e) => setItemLink(e.target.value)} className="w-full border rounded p-2 outline-none font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Hình ảnh (Đường dẫn hoặc tải trực tiếp) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    placeholder="Nhập URL ảnh hoặc bấm Tải Ảnh"
                    className="flex-1 border rounded p-2 outline-none text-xs truncate"
                  />
                  <label className="bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <UploadCloud size={14} />
                    <span>Tải Ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {uploading && <p className="text-[11px] text-blue-600 font-bold">Đang tải và xử lý hình ảnh...</p>}
                
                <div className="p-2 border rounded-lg bg-gray-50 flex items-center justify-center h-36 overflow-hidden">
                  {itemImageUrl ? (
                    <img
                      src={resolveImageUrl(itemImageUrl)}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs italic">Xem trước hình ảnh sẽ xuất hiện tại đây</span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#d70018] text-white font-bold rounded shadow-sm cursor-pointer">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}