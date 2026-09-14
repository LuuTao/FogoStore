'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Smartphone,
  Tablet,
  Laptop,
  Watch as WatchIcon,
  Headphones,
  Save,
  RotateCcw,
  Sliders,
  CreditCard,
  X,
  RefreshCw,
} from 'lucide-react';

interface Props {
  banners?: any[];
  onRefresh?: () => void;
}

type BannerGroup =
  | 'hero_banners'       // Banner Lớn Đầu Trang
  | 'promo_cards'        // 2 Banner Nhỏ Đè Hero
  | 'all_categories'     // Tất cả danh mục
  | 'iphone_banners'     // Banner Trang iPhone
  | 'ipad_banners'       // Banner Trang iPad
  | 'macbook_banners'    // Banner Trang MacBook
  | 'watch_banners'      // Banner Trang Watch
  | 'hang_cu_banners'    // Banner Trang Hàng Cũ
  | 'phu_kien_banners'   // Banner Trang Phụ Kiện
  | 'sub_iphone'         // Submodel iPhone
  | 'sub_ipad'           // Submodel iPad
  | 'sub_macbook'        // Submodel MacBook
  | 'sub_watch'          // Submodel Watch
  | 'sub_phu_kien'       // Submodel Phụ Kiện
  | 'commit_cards';      // 4 Ô Cam Kết

interface ItemConfig {
  id: string;
  name: string;
  link?: string;
  group: BannerGroup;
  imageUrl: string;
  subtitle?: string;
  tag?: string;
  priceText?: string;
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

// Hàm nén ảnh giữ chuẩn tỷ lệ gốc (không bị bè hay méo)
const compressImageFile = (file: File, targetGroup: BannerGroup): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;
        const ratio = origHeight / origWidth;

        let width = origWidth;
        let height = origHeight;

        if (targetGroup === 'hero_banners') {
          width = 1920;
          height = 540;
        } else if (targetGroup === 'promo_cards') {
          width = 800;
          height = Math.round(800 * ratio);
        } else if (targetGroup === 'commit_cards') {
          width = Math.min(origWidth, 600);
          height = Math.round(width * ratio);
        } else if (targetGroup.startsWith('sub_') || targetGroup === 'all_categories') {
          width = 300;
          height = 300;
        } else {
          width = Math.min(origWidth, 1200);
          height = Math.round(width * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/webp', 0.82);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Lỗi load ảnh vào canvas'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file ảnh'));
    reader.readAsDataURL(file);
  });
};

const INITIAL_ITEMS: ItemConfig[] = [
  {
    id: 'hero-1',
    name: 'Đại Tiệc Mua Sắm Apple - Giảm Sốc Đến 40%',
    link: '/iphone',
    group: 'hero_banners',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    tag: 'SIÊU SALE',
    subtitle: 'Áp dụng cho toàn bộ dòng sản phẩm Apple chính hãng',
  },
  {
    id: 'hero-2',
    name: 'MacBook & iPad M-Series Trợ Giá Thu Cũ Đến 2 Triệu',
    link: '/macbook',
    group: 'hero_banners',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
    tag: 'TRỢ GIÁ',
    subtitle: 'Bảo hành chính hãng 12 tháng 1 đổi 1',
  },
  {
    id: 'promo-1',
    name: 'AirPods 4',
    subtitle: 'Chính hãng VN/A',
    tag: 'HSSV giảm đến 150K',
    priceText: '2.x90.000đ',
    link: '/san-pham/airpods-4',
    group: 'promo_cards',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'promo-2',
    name: 'Apple Watch SE 3',
    subtitle: 'Chính hãng VN/A',
    tag: 'Ưu đãi thanh toán đến 700K',
    priceText: '6.x90.000đ',
    link: '/san-pham/apple-watch-se',
    group: 'promo_cards',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
  },
];

export default function BannersTab({ banners: propBanners, onRefresh }: Props) {
  const [activeGroup, setActiveGroup] = useState<BannerGroup>('hero_banners');
  const [items, setItems] = useState<ItemConfig[]>(INITIAL_ITEMS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemConfig | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [uploading, setUploading] = useState(false);

  // FETCH TRỰC TIẾP TỪ DATABASE NEON QUA API (Không sợ F5 hay Deploy mất dữ liệu)
  const fetchBannersFromBackend = useCallback(async () => {
    setIsLoadingDB(true);
    try {
      const res = await fetch(`${API_URL}/api/banners?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });

      if (res.ok) {
        const json = await res.json();
        const dataList = json.data || json;
        if (Array.isArray(dataList) && dataList.length > 0) {
          const mapped: ItemConfig[] = dataList.map((b: any, idx: number) => ({
            id: String(b.id || `item-${idx}`),
            name: b.title || b.name || 'Banner',
            link: b.linkUrl || b.link || '/',
            group: (b.position || b.group || 'hero_banners') as BannerGroup,
            imageUrl: resolveImageUrl(b.imageUrl),
            subtitle: b.subtitle || '',
            tag: b.tag || '',
            priceText: b.priceText || '',
          }));

          setItems(mapped);
          try {
            localStorage.setItem('fogo_banners_config', JSON.stringify(mapped));
          } catch (_) {}
          return;
        }
      }
      
      // Fallback: Kiểm tra propBanners hoặc localStorage nếu API chưa phản hồi
      if (propBanners && Array.isArray(propBanners) && propBanners.length > 0) {
        const mapped = propBanners.map((b: any, idx: number) => ({
          id: String(b.id || `item-${idx}`),
          name: b.title || b.name || 'Banner',
          link: b.linkUrl || b.link || '/',
          group: (b.position || b.group || 'hero_banners') as BannerGroup,
          imageUrl: resolveImageUrl(b.imageUrl),
        }));
        setItems(mapped);
      } else {
        const cached = localStorage.getItem('fogo_banners_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi fetch banner từ backend:', err);
    } finally {
      setIsLoadingDB(false);
    }
  }, [propBanners]);

  useEffect(() => {
    fetchBannersFromBackend();
  }, [fetchBannersFromBackend]);

  const currentItems = items.filter((it) => it.group === activeGroup);

  // LƯU CẤU HÌNH VÀO NEON DATABASE
  const handleSaveAllConfig = async () => {
    setIsSaving(true);
    try {
      const payloadItems = items.map((it, idx) => ({
        id: it.id,
        title: it.name,
        name: it.name,
        imageUrl: it.imageUrl,
        linkUrl: it.link || '/',
        link: it.link || '/',
        position: it.group,
        group: it.group,
        isActive: true,
        order: idx,
      }));

      let syncSuccess = false;
      let syncError = '';

      // Thử Route 1: /api/admin/banners/sync
      try {
        const res1 = await fetch(`${API_URL}/api/admin/banners/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payloadItems }),
        });
        if (res1.ok) syncSuccess = true;
        else syncError = `Status ${res1.status}`;
      } catch (e: any) {
        syncError = e.message;
      }

      // Thử Route 2: /api/banners
      if (!syncSuccess) {
        try {
          const res2 = await fetch(`${API_URL}/api/banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: payloadItems }),
          });
          if (res2.ok) syncSuccess = true;
        } catch (e: any) {
          syncError = e.message;
        }
      }

      try {
        localStorage.setItem('fogo_banners_config', JSON.stringify(items));
      } catch (_) {}

      if (!syncSuccess) {
        throw new Error(syncError || 'Backend chưa lưu được dữ liệu');
      }

      setHasUnsavedChanges(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
      
      if (onRefresh) onRefresh();
      // Load lại để đồng bộ state sạch
      fetchBannersFromBackend();
    } catch (err: any) {
      alert('Đã xảy ra lỗi khi lưu vào cơ sở dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (!confirm('Khôi phục toàn bộ cấu hình Banner về mặc định?')) return;
    setItems(INITIAL_ITEMS);
    try {
      localStorage.removeItem('fogo_banners_config');
    } catch (_) {}
    setHasUnsavedChanges(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemName('');
    setItemImageUrl('');
    setItemLink('');
    setItemTag('');
    setItemSubtitle('');
    setItemPriceText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (it: ItemConfig) => {
    setEditingItem(it);
    setItemName(it.name);
    setItemImageUrl(it.imageUrl);
    setItemLink(it.link || '');
    setItemTag(it.tag || '');
    setItemSubtitle(it.subtitle || '');
    setItemPriceText(it.priceText || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImageFile(file, activeGroup);
      setItemImageUrl(compressed);
    } catch (err) {
      alert('Không thể xử lý ảnh, vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemImageUrl.trim()) {
      alert('Vui lòng nhập tên và chọn ảnh');
      return;
    }

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                name: itemName,
                imageUrl: itemImageUrl,
                link: itemLink,
                tag: itemTag,
                subtitle: itemSubtitle,
                priceText: itemPriceText,
              }
            : it
        )
      );
    } else {
      const newItem: ItemConfig = {
        id: `item-${Date.now()}`,
        name: itemName,
        link: itemLink,
        group: activeGroup,
        imageUrl: itemImageUrl,
        tag: itemTag,
        subtitle: itemSubtitle,
        priceText: itemPriceText,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setHasUnsavedChanges(true);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none relative">
      {saveToast && (
        <div className="fixed top-20 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-emerald-400">
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
            <span>Quản Lý Banner &amp; Danh Mục</span>
            {isLoadingDB && <RefreshCw size={15} className="animate-spin text-gray-400" />}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dữ liệu đồng bộ trực tiếp từ <b>Database Neon</b>, đảm bảo an toàn vĩnh viễn khi deploy lại website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBannersFromBackend}
            title="Tải lại từ Database"
            className="p-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold cursor-pointer"
          >
            <RefreshCw size={14} className={isLoadingDB ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleResetDefault}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw size={14} />
            <span>Khôi Phục</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Thêm Mục Vào Nhóm</span>
          </button>

          <button
            onClick={handleSaveAllConfig}
            disabled={isSaving}
            className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              hasUnsavedChanges
                ? 'bg-[#d70018] hover:bg-red-700 text-white animate-pulse'
                : 'bg-[#00a859] hover:bg-emerald-700 text-white'
            }`}
          >
            <Save size={16} className={isSaving ? 'animate-spin' : ''} />
            <span>{isSaving ? 'ĐANG LƯU VÀO DB...' : 'LƯU CẤU HÌNH'}</span>
          </button>
        </div>
      </div>

      {/* TABS DANH MỤC */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 text-xs">
        {[
          { id: 'hero_banners', label: 'Banner Lớn (Hero)', icon: Sliders },
          { id: 'promo_cards', label: '2 Banner Nhỏ Đè Hero', icon: CreditCard },
          { id: 'iphone_banners', label: 'Banner iPhone', icon: Smartphone },
          { id: 'ipad_banners', label: 'Banner iPad', icon: Tablet },
          { id: 'macbook_banners', label: 'Banner MacBook', icon: Laptop },
          { id: 'watch_banners', label: 'Banner Watch', icon: WatchIcon },
          { id: 'hang_cu_banners', label: 'Banner Hàng Cũ', icon: Layers },
          { id: 'phu_kien_banners', label: 'Banner Phụ Kiện', icon: Headphones },
          { id: 'sub_iphone', label: 'Sub iPhone', icon: Smartphone },
          { id: 'sub_ipad', label: 'Sub iPad', icon: Tablet },
          { id: 'sub_macbook', label: 'Sub MacBook', icon: Laptop },
          { id: 'sub_watch', label: 'Sub Watch', icon: WatchIcon },
          { id: 'sub_phu_kien', label: 'Sub Phụ Kiện', icon: Headphones },
          { id: 'commit_cards', label: 'Cam Kết 4 Ô', icon: ShieldCheck },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id as BannerGroup)}
              className={`px-3.5 py-2.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeGroup === tab.id
                  ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-100'
              }`}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
              <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
                {items.filter((i) => i.group === tab.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* DANH SÁCH BANNER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {activeGroup === 'hero_banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[1920/540] flex flex-col justify-between group bg-gray-900"
              >
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="relative p-4 z-10 text-white space-y-1">
                  <h3 className="font-black text-sm md:text-base drop-shadow-md">{item.name}</h3>
                  {item.subtitle && <p className="text-xs text-gray-200 drop-shadow-xs">{item.subtitle}</p>}
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer shadow">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer shadow">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeGroup === 'promo_cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[2.8/1] flex flex-col justify-between group bg-gray-100"
              >
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative p-2 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-b from-black/60 to-transparent">
                  <span className="text-[10px] text-white font-bold mr-auto px-2 py-0.5 bg-black/40 rounded">{item.name}</span>
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer shadow">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer shadow">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {['iphone_banners', 'ipad_banners', 'macbook_banners', 'watch_banners', 'hang_cu_banners', 'phu_kien_banners'].includes(activeGroup) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[21/9] flex flex-col justify-between group bg-gray-900"
              >
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
                <div className="relative p-4 z-10 text-white space-y-1">
                  <h3 className="font-black text-sm md:text-base drop-shadow-md">{item.name}</h3>
                  {item.subtitle && <p className="text-xs text-gray-300 drop-shadow-xs">{item.subtitle}</p>}
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer shadow">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer shadow">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeGroup === 'commit_cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentItems.map((item) => (
              <div key={item.id} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[3/4] flex flex-col justify-between group bg-gray-50">
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-contain" />
                <div className="relative p-4 z-10 text-center text-white space-y-1">
                  <span className="bg-[#d70018] text-white font-black text-xs px-2 py-0.5 rounded uppercase shadow">{item.name}</span>
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer shadow">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer shadow">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {['all_categories', 'sub_iphone', 'sub_ipad', 'sub_macbook', 'sub_watch', 'sub_phu_kien'].includes(activeGroup) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {currentItems.map((item) => (
              <div key={item.id} className="relative bg-[#fafafb] border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center justify-between group min-h-[140px]">
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white p-0.5 rounded border">
                  <button onClick={() => handleOpenEdit(item)} className="text-blue-600 p-1 cursor-pointer">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 p-1 cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="w-14 h-14 rounded-md bg-white p-1 border flex items-center justify-center my-auto">
                  <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mt-2">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL SỬA/THÊM BANNER */}
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
                {uploading && <p className="text-[11px] text-blue-600 font-bold animate-pulse">Đang nén tối ưu và xử lý hình ảnh...</p>}
                
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded cursor-pointer font-semibold">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#d70018] text-white font-bold rounded shadow-sm cursor-pointer hover:bg-red-700 transition-colors">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}