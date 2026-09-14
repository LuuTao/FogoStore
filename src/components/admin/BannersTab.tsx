'use client';

import React, { useState, useEffect } from 'react';
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
  Save,
  RotateCcw,
  Sliders,
  CreditCard,
  X,
  Menu as MenuIcon,
  ChevronRight,
} from 'lucide-react';
import { MENU_DATA } from '@/data/navigation';

interface Props {
  banners?: any[];
  onRefresh?: () => void;
}

type BannerGroup =
  | 'hero_banners'       // Banner Lớn Đầu Trang
  | 'promo_cards'        // 2 Banner Nhỏ Đè Hero
  | 'all_categories'     // Tất cả danh mục
  | 'iphone_banners'     // Banner Trang iPhone (BỔ SUNG MỚI)
  | 'ipad_banners'       // Banner Trang iPad (BỔ SUNG MỚI)
  | 'macbook_banners'    // Banner Trang MacBook (BỔ SUNG MỚI)
  | 'sub_iphone'         // Submodel iPhone
  | 'sub_ipad'           // Submodel iPad
  | 'sub_macbook'        // Submodel MacBook
  | 'commit_cards'       // 4 Ô Cam Kết
  | 'nav_menu';          // QUẢN LÝ MENU NAVBAR

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

export interface SubMenuItem {
  name: string;
  href: string;
  isNew?: boolean;
}

export interface MenuGroup {
  groupTitle: string;
  href: string;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  badge?: string;
  groups?: MenuGroup[];
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Hàm xử lý link ảnh an toàn (hỗ trợ cả Base64, CDN ngoài và đường dẫn /uploads)
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
  // Bổ sung mặc định cho Banner Trang Sản Phẩm
  { id: 'ip-b1', name: 'Thế Hệ iPhone Mới Nhất', subtitle: 'Sức mạnh Apple Intelligence đỉnh cao.', tag: 'Giá tốt nhất', link: '/iphone', group: 'iphone_banners', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80' },
  { id: 'ip-b2', name: 'iPhone 17 Series', subtitle: 'Chính hãng Apple VN/A - Bảo hành 1 đổi 1', tag: 'Trả trước 0đ', link: '/iphone', group: 'iphone_banners', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80' },
  { id: 'id-b1', name: 'iPad Pro Thế Hệ Mới', subtitle: 'Mỏng siêu thực. Sức mạnh AI không giới hạn.', tag: 'Sẵn hàng', link: '/ipad', group: 'ipad_banners', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80' },
  { id: 'id-b2', name: 'Tất cả sản phẩm iPad', subtitle: 'Chính hãng Apple VN/A - Bảo hành 1 đổi 1', tag: 'Trả trước 0đ', link: '/ipad', group: 'ipad_banners', imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80' },
  { id: 'mb-b1', name: 'MacBook Pro M5 / M4', subtitle: 'Hiệu năng tối thượng cho chuyên gia đồ họa.', tag: 'Ưu đãi', link: '/macbook', group: 'macbook_banners', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 'mb-b2', name: 'Tất cả sản phẩm MacBook', subtitle: 'Chính hãng Apple VN/A - Bảo hành 12 tháng', tag: 'Trả trước 0đ', link: '/macbook', group: 'macbook_banners', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80' },

  { id: 'cat-1', name: 'iPhone 18 Pro Max', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-2', name: 'iPhone 17 Pro Max', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-3', name: 'iPhone 17', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-4', name: 'iPhone 17 Air', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-5', name: 'iPhone 16 Series', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80' },
  { id: 'sub-ip-1', name: 'Tất cả', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-2', name: 'iPhone 16 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-3', name: 'iPhone 15 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-1', name: 'Tất cả', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-2', name: 'iPad Pro', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-1', name: 'Tất cả', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-2', name: 'MacBook Pro', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80' },
  { id: 'commit-1', name: 'BẢO HÀNH VÀ HẬU MÃI', tag: 'ĐI ĐẦU VỀ CHẾ ĐỘ', subtitle: 'BẢO HÀNH VÀ HẬU MÃI', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80' },
  { id: 'commit-2', name: 'SẢN PHẨM MINH BẠCH', tag: 'MINH BẠCH', subtitle: 'GIÁ BÁN NIÊM YẾT', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80' },
];

export default function BannersTab({ banners: propBanners, onRefresh }: Props) {
  const [activeGroup, setActiveGroup] = useState<BannerGroup>('hero_banners');
  const [items, setItems] = useState<ItemConfig[]>(INITIAL_ITEMS);
  const [menus, setMenus] = useState<MenuItem[]>(MENU_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string>(MENU_DATA[0]?.id || '');
  const [selectedLevel2Idx, setSelectedLevel2Idx] = useState<number | null>(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemConfig | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [uploading, setUploading] = useState(false);

  const [menuModalType, setMenuModalType] = useState<'level1' | 'level2' | 'level3' | null>(null);
  const [menuIsEdit, setMenuIsEdit] = useState(false);
  const [menuEditIndex, setMenuEditIndex] = useState<number | null>(null);
  const [menuTitle, setMenuTitle] = useState('');
  const [menuHref, setMenuHref] = useState('');
  const [menuBadge, setMenuBadge] = useState('');
  const [menuIsNew, setMenuIsNew] = useState(false);

  // Nạp dữ liệu từ Database / Props hoặc LocalStorage
  useEffect(() => {
    if (propBanners && Array.isArray(propBanners) && propBanners.length > 0) {
      const mapped = propBanners.map((b: any) => ({
        id: b.id,
        name: b.title || b.name || 'Banner',
        link: b.linkUrl || b.link || '/',
        group: (b.position || b.group || 'hero_banners') as BannerGroup,
        imageUrl: resolveImageUrl(b.imageUrl),
        order: b.order,
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

    try {
      const savedMenu = localStorage.getItem('fogo_menu_config');
      if (savedMenu) {
        const parsedMenu = JSON.parse(savedMenu);
        if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
          setMenus(parsedMenu);
          setSelectedLevel1Id(parsedMenu[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [propBanners]);

  const currentItems = items.filter((it) => it.group === activeGroup);
  const activeLevel1 = menus.find((m) => m.id === selectedLevel1Id) || menus[0];
  const activeLevel2 =
    activeLevel1?.groups && selectedLevel2Idx !== null
      ? activeLevel1.groups[selectedLevel2Idx]
      : null;

  // LƯU TOÀN BỘ VÀO NEON DATABASE
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

      const res = await fetch(`${API_URL}/api/admin/banners/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Lỗi máy chủ (${res.status})`);
      }

      localStorage.setItem('fogo_banners_config', JSON.stringify(items));
      localStorage.setItem('fogo_menu_config', JSON.stringify(menus));

      setHasUnsavedChanges(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Đã xảy ra lỗi khi lưu vào cơ sở dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (!confirm('Khôi phục toàn bộ cấu hình Banner về mặc định?')) return;
    setItems(INITIAL_ITEMS);
    setMenus(MENU_DATA);
    localStorage.removeItem('fogo_banners_config');
    localStorage.removeItem('fogo_menu_config');
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

  // NÉN VÀ ĐỌC FILE ẢNH THÀNH BASE64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Vui lòng chọn file ảnh có dung lượng dưới 3MB để tải nhanh!');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setItemImageUrl(base64);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Lỗi khi đọc file ảnh');
      setUploading(false);
    };
    reader.readAsDataURL(file);
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

  const handleSaveMenuModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuTitle.trim()) return;

    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);

      if (menuModalType === 'level1') {
        if (menuIsEdit) {
          if (targetL1) {
            targetL1.title = menuTitle;
            targetL1.href = menuHref;
            targetL1.badge = menuBadge || undefined;
          }
        } else {
          const newId = `menu-${Date.now()}`;
          next.push({ id: newId, title: menuTitle, href: menuHref, badge: menuBadge || undefined, groups: [] });
          setSelectedLevel1Id(newId);
        }
      } else if (menuModalType === 'level2' && targetL1) {
        if (!targetL1.groups) targetL1.groups = [];
        if (menuIsEdit && menuEditIndex !== null) {
          targetL1.groups[menuEditIndex].groupTitle = menuTitle;
          targetL1.groups[menuEditIndex].href = menuHref;
        } else {
          targetL1.groups.push({ groupTitle: menuTitle, href: menuHref, items: [] });
          setSelectedLevel2Idx(targetL1.groups.length - 1);
        }
      } else if (menuModalType === 'level3' && targetL1 && selectedLevel2Idx !== null) {
        const targetL2 = targetL1.groups?.[selectedLevel2Idx];
        if (targetL2) {
          if (!targetL2.items) targetL2.items = [];
          if (menuIsEdit && menuEditIndex !== null) {
            targetL2.items[menuEditIndex] = { name: menuTitle, href: menuHref, isNew: menuIsNew };
          } else {
            targetL2.items.push({ name: menuTitle, href: menuHref, isNew: menuIsNew });
          }
        }
      }
      return next;
    });

    setHasUnsavedChanges(true);
    setMenuModalType(null);
  };

  const handleDeleteMenuItem = (type: 'level1' | 'level2' | 'level3', index?: number) => {
    if (!confirm('Bạn có chắc muốn xóa mục menu này?')) return;
    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      if (type === 'level1') {
        const filtered = next.filter((m) => m.id !== selectedLevel1Id);
        if (filtered.length > 0) setSelectedLevel1Id(filtered[0].id);
        return filtered;
      }
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);
      if (type === 'level2' && targetL1?.groups && index !== undefined) {
        targetL1.groups.splice(index, 1);
        setSelectedLevel2Idx(targetL1.groups.length > 0 ? 0 : null);
      } else if (type === 'level3' && targetL1 && selectedLevel2Idx !== null && index !== undefined) {
        targetL1.groups?.[selectedLevel2Idx]?.items?.splice(index, 1);
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6 select-none relative">
      {saveToast && (
        <div className="fixed top-20 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-emerald-400">
            <CheckCircle2 size={18} />
            <span>Đã lưu thành công toàn bộ cấu hình Banner &amp; Menu vào Database!</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <ImageIcon size={22} className="text-[#d70018]" />
            <span>Quản Lý Banner, Danh Mục, Submodel &amp; Menu</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mọi hình ảnh tải lên sẽ được lưu trữ vĩnh viễn trong <b>Database Neon</b> và tự động hiển thị ra Trang Chủ &amp; Trang Sản Phẩm.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw size={14} />
            <span>Khôi Phục</span>
          </button>

          {activeGroup !== 'nav_menu' && (
            <button
              onClick={handleOpenAdd}
              className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Thêm Mục Vào Nhóm</span>
            </button>
          )}

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

      {/* TABS (ĐÃ BỔ SUNG TAB TRANG SẢN PHẨM) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 text-xs">
        <button
          onClick={() => setActiveGroup('hero_banners')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'hero_banners'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Sliders size={15} />
          <span>Banner Lớn (Hero)</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'hero_banners').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('promo_cards')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'promo_cards'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <CreditCard size={15} />
          <span>2 Banner Nhỏ Đè Hero</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'promo_cards').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('iphone_banners')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'iphone_banners'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Smartphone size={15} />
          <span>Banner Trang iPhone</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'iphone_banners').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('ipad_banners')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'ipad_banners'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Tablet size={15} />
          <span>Banner Trang iPad</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'ipad_banners').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('macbook_banners')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'macbook_banners'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Laptop size={15} />
          <span>Banner Trang MacBook</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'macbook_banners').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('all_categories')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'all_categories'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Layers size={15} />
          <span>Tất Cả Danh Mục</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'all_categories').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('sub_iphone')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'sub_iphone'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Smartphone size={15} />
          <span>Submodel iPhone</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'sub_iphone').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('sub_ipad')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'sub_ipad'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Tablet size={15} />
          <span>Submodel iPad</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'sub_ipad').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('sub_macbook')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'sub_macbook'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <Laptop size={15} />
          <span>Submodel MacBook</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'sub_macbook').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('commit_cards')}
          className={`px-4 py-2.5 rounded-t-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'commit_cards'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Banner Cam Kết 4 Ô</span>
          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => i.group === 'commit_cards').length}
          </span>
        </button>

        <button
          onClick={() => setActiveGroup('nav_menu')}
          className={`px-4 py-2.5 rounded-t-lg font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGroup === 'nav_menu'
              ? 'bg-white border-t-2 border-x border-[#d70018] text-[#d70018] shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
          }`}
        >
          <MenuIcon size={15} className="text-[#d70018]" />
          <span>Quản Lý Menu (Navbar)</span>
        </button>
      </div>

      {/* DANH SÁCH BANNER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {activeGroup === 'hero_banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[21/9] flex flex-col justify-between group bg-gray-900"
              >
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
                <div className="relative p-4 z-10 text-white space-y-1">
                  <h3 className="font-black text-sm md:text-base">{item.name}</h3>
                  {item.subtitle && <p className="text-xs text-gray-300">{item.subtitle}</p>}
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer">
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
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HIỂN THỊ BANNER TRANG SẢN PHẨM (IPHONE, IPAD, MACBOOK) */}
        {['iphone_banners', 'ipad_banners', 'macbook_banners'].includes(activeGroup) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[21/9] flex flex-col justify-between group bg-gray-900"
              >
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
                <div className="relative p-4 z-10 text-white space-y-1">
                  <h3 className="font-black text-sm md:text-base">{item.name}</h3>
                  {item.subtitle && <p className="text-xs text-gray-300">{item.subtitle}</p>}
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer">
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
              <div key={item.id} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square flex flex-col justify-between group">
                <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative p-4 z-10 text-center text-white space-y-1">
                  <span className="bg-[#d70018] text-white font-black text-xs px-2 py-0.5 rounded uppercase">{item.name}</span>
                </div>
                <div className="relative p-3 z-10 flex items-center justify-end gap-1.5">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-600 rounded cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {['all_categories', 'sub_iphone', 'sub_ipad', 'sub_macbook'].includes(activeGroup) && (
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

        {/* MENU NAVBAR CẤP 1 - 2 - 3 */}
        {activeGroup === 'nav_menu' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between">
              <span>Bấm chọn Cấp 1 để xem các nhóm Cấp 2, và chọn Cấp 2 để chỉnh sửa các mục con Cấp 3.</span>
              <button
                onClick={() => {
                  setMenuModalType('level1');
                  setMenuIsEdit(false);
                  setMenuTitle('');
                  setMenuHref('/iphone');
                  setMenuBadge('');
                }}
                className="bg-[#d70018] text-white px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Thêm Cấp 1
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* CỘT 1 */}
              <div className="md:col-span-4 bg-[#f8f9fa] border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-black text-xs uppercase text-gray-800">Cấp 1 (Thanh Menu)</span>
                  <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded font-bold">{menus.length} mục</span>
                </div>
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                  {menus.map((item) => {
                    const isSelected = item.id === selectedLevel1Id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedLevel1Id(item.id);
                          setSelectedLevel2Idx(item.groups && item.groups.length > 0 ? 0 : null);
                        }}
                        className={`p-2.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-white border-[#d70018] text-[#d70018] font-bold shadow-xs' : 'bg-white/70 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs truncate">{item.title}</span>
                          {item.badge && <span className="bg-[#d70018] text-white text-[9px] px-1 rounded font-black">{item.badge}</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLevel1Id(item.id);
                              setMenuModalType('level1');
                              setMenuIsEdit(true);
                              setMenuTitle(item.title);
                              setMenuHref(item.href);
                              setMenuBadge(item.badge || '');
                            }}
                            className="p-1 text-blue-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLevel1Id(item.id);
                              handleDeleteMenuItem('level1');
                            }}
                            className="p-1 text-red-600 hover:bg-gray-100 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ChevronRight size={14} className={isSelected ? 'text-[#d70018]' : 'text-gray-300'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỘT 2 */}
              <div className="md:col-span-4 bg-[#f8f9fa] border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-black text-xs uppercase text-blue-700">Cấp 2 (Nhóm Dropdown)</span>
                  <button
                    onClick={() => {
                      setMenuModalType('level2');
                      setMenuIsEdit(false);
                      setMenuTitle('');
                      setMenuHref(activeLevel1?.href || '/');
                    }}
                    className="text-blue-700 text-xs font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={13} /> Thêm
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                  {(!activeLevel1?.groups || activeLevel1.groups.length === 0) ? (
                    <p className="text-xs text-gray-400 text-center py-8">Chưa có nhóm menu cấp 2</p>
                  ) : (
                    activeLevel1.groups.map((group, idx) => {
                      const isSelected = selectedLevel2Idx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedLevel2Idx(idx)}
                          className={`p-2.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected ? 'bg-white border-blue-600 text-blue-700 font-bold shadow-xs' : 'bg-white/70 border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="text-xs truncate">{group.groupTitle}</span>
                            <span className="text-[10px] text-gray-400 font-mono truncate">{group.href}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuModalType('level2');
                                setMenuIsEdit(true);
                                setMenuEditIndex(idx);
                                setMenuTitle(group.groupTitle);
                                setMenuHref(group.href);
                              }}
                              className="p-1 text-blue-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMenuItem('level2', idx);
                              }}
                              className="p-1 text-red-600 hover:bg-gray-100 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                            <ChevronRight size={14} className={isSelected ? 'text-blue-600' : 'text-gray-300'} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CỘT 3 */}
              <div className="md:col-span-4 bg-[#f8f9fa] border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-black text-xs uppercase text-emerald-700">Cấp 3 (Phiên Bản Con)</span>
                  {activeLevel2 && (
                    <button
                      onClick={() => {
                        setMenuModalType('level3');
                        setMenuIsEdit(false);
                        setMenuTitle('');
                        setMenuHref(activeLevel2.href || '/');
                        setMenuIsNew(false);
                      }}
                      className="text-emerald-700 text-xs font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={13} /> Thêm
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                  {(!activeLevel2?.items || activeLevel2.items.length === 0) ? (
                    <p className="text-xs text-gray-400 text-center py-8">Chưa có phiên bản con</p>
                  ) : (
                    activeLevel2.items.map((sub, idx) => (
                      <div key={idx} className="p-2.5 rounded-md border border-gray-200 bg-white flex items-center justify-between text-xs">
                        <div className="flex flex-col truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800 truncate">{sub.name}</span>
                            {sub.isNew && <span className="bg-[#d70018] text-white text-[8px] font-black px-1 rounded">MỚI</span>}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono truncate">{sub.href}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setMenuModalType('level3');
                              setMenuIsEdit(true);
                              setMenuEditIndex(idx);
                              setMenuTitle(sub.name);
                              setMenuHref(sub.href);
                              setMenuIsNew(!!sub.isNew);
                            }}
                            className="p-1 text-blue-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteMenuItem('level3', idx)} className="p-1 text-red-600 hover:bg-gray-100 rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL SỬA/THÊM BANNER KÈM PREVIEW CHUẨN */}
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
                
                {/* KHUNG PREVIEW LUÔN HIỆN ẢNH KỂ CẢ BASE64 */}
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

      {/* MODAL MENU NAVBAR */}
      {menuModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">
                {menuIsEdit ? 'Chỉnh Sửa' : 'Thêm'} Menu {menuModalType === 'level1' ? 'Cấp 1' : menuModalType === 'level2' ? 'Cấp 2' : 'Cấp 3'}
              </h3>
              <button onClick={() => setMenuModalType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveMenuModal} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên Hiển Thị *</label>
                <input type="text" required value={menuTitle} onChange={(e) => setMenuTitle(e.target.value)} className="w-full border rounded p-2 outline-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Đường dẫn lọc URL (Href) *</label>
                <input type="text" required value={menuHref} onChange={(e) => setMenuHref(e.target.value)} className="w-full border rounded p-2 outline-none font-mono text-xs" />
              </div>
              {menuModalType === 'level1' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nhãn Badge</label>
                  <input type="text" placeholder="HOT, NEW..." value={menuBadge} onChange={(e) => setMenuBadge(e.target.value)} className="w-full border rounded p-2 outline-none" />
                </div>
              )}
              {menuModalType === 'level3' && (
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="checkNew" checked={menuIsNew} onChange={(e) => setMenuIsNew(e.target.checked)} className="w-4 h-4 accent-[#d70018]" />
                  <label htmlFor="checkNew" className="font-bold text-gray-700 cursor-pointer">Gắn nhãn màu đỏ "MỚI"</label>
                </div>
              )}
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setMenuModalType(null)} className="px-4 py-2 border rounded cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#d70018] text-white font-bold rounded cursor-pointer">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}