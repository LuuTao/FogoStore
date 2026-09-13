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
  ExternalLink,
  X,
  Menu as MenuIcon,
  ChevronRight,
} from 'lucide-react';
import { MENU_DATA } from '@/data/navigation';
import { API_BASE, getFullImageUrl } from '@/lib/imageHelper';


interface Props {
  banners?: any[];
  onRefresh?: () => void;
}

type BannerGroup =
  | 'hero_banners'       // Banner Lớn Đầu Trang
  | 'promo_cards'        // 2 Banner Nhỏ Đè Hero
  | 'all_categories'     // Tất cả danh mục
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

// Helper tự động dọn sạch mọi link localhost:5000 chuyển sang Render HTTPS
const cleanUrl = (url?: string | null): string => {
  if (!url) return '';
  return url.replace(/http:\/\/localhost:5000/g, 'https://fogo-store-api.onrender.com');
};

const INITIAL_ITEMS: ItemConfig[] = [
  // 1. BANNER LỚN ĐẦU TRANG
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

  // 2. 2 BANNER NHỎ ĐÈ HERO
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

  // 3. TẤT CẢ DANH MỤC
  { id: 'cat-1', name: 'iPhone 18 Pro Max', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-2', name: 'iPhone 17 Pro Max', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-3', name: 'iPhone 17', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-4', name: 'iPhone 17 Air', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-5', name: 'iPhone 16 Series', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80' },

  // 4. SUBMODELS
  { id: 'sub-ip-1', name: 'Tất cả', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-2', name: 'iPhone 16 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-3', name: 'iPhone 15 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-4', name: 'iPhone 14 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ip-5', name: 'iPhone 13 Series', group: 'sub_iphone', imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80' },

  { id: 'sub-ipad-1', name: 'Tất cả', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-2', name: 'iPad Pro', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-ipad-3', name: 'iPad Air', group: 'sub_ipad', imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=200&q=80' },

  { id: 'sub-mac-1', name: 'Tất cả', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-2', name: 'MacBook Pro', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80' },
  { id: 'sub-mac-3', name: 'MacBook Air', group: 'sub_macbook', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80' },

  // 5. 4 Ô CAM KẾT
  { id: 'commit-1', name: 'BẢO HÀNH VÀ HẬU MÃI', tag: 'ĐI ĐẦU VỀ CHẾ ĐỘ', subtitle: 'BẢO HÀNH VÀ HẬU MÃI', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80' },
  { id: 'commit-2', name: 'SẢN PHẨM MINH BẠCH', tag: 'MINH BẠCH', subtitle: 'GIÁ BÁN NIÊM YẾT', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80' },
  { id: 'commit-3', name: 'TẬN TÂM PHỤC VỤ', tag: 'PHỤC VỤ TẬN TÂM', subtitle: 'TƯ VẤN CHÍNH XÁC', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=400&q=80' },
  { id: 'commit-4', name: 'CHÍNH HÃNG 100%', tag: 'CAM KẾT', subtitle: 'CHÍNH HÃNG 100%', group: 'commit_cards', imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=400&q=80' },
];

export default function BannersTab({ onRefresh }: Props) {
  const [activeGroup, setActiveGroup] = useState<BannerGroup>('hero_banners');
  const [items, setItems] = useState<ItemConfig[]>(INITIAL_ITEMS);
  const [menus, setMenus] = useState<MenuItem[]>(MENU_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Quản lý cấp chọn của Menu Navbar
  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string>(MENU_DATA[0]?.id || '');
  const [selectedLevel2Idx, setSelectedLevel2Idx] = useState<number | null>(0);

  // Modal State cho Banner / Danh mục
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemConfig | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [uploading, setUploading] = useState(false);

  // Modal State cho Menu
  const [menuModalType, setMenuModalType] = useState<'level1' | 'level2' | 'level3' | null>(null);
  const [menuIsEdit, setMenuIsEdit] = useState(false);
  const [menuEditIndex, setMenuEditIndex] = useState<number | null>(null);
  const [menuTitle, setMenuTitle] = useState('');
  const [menuHref, setMenuHref] = useState('');
  const [menuBadge, setMenuBadge] = useState('');
  const [menuIsNew, setMenuIsNew] = useState(false);

  // Nạp cấu hình từ LocalStorage kèm làm sạch URL
  useEffect(() => {
    try {
      const savedBanners = localStorage.getItem('fogo_banners_config');
      if (savedBanners) {
        const parsed = JSON.parse(savedBanners);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((it: ItemConfig) => ({
            ...it,
            imageUrl: cleanUrl(it.imageUrl),
          }));
          setItems(sanitized);
        }
      }
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
  }, []);

  const currentItems = items.filter((it) => it.group === activeGroup);
  const activeLevel1 = menus.find((m) => m.id === selectedLevel1Id) || menus[0];
  const activeLevel2 =
    activeLevel1?.groups && selectedLevel2Idx !== null
      ? activeLevel1.groups[selectedLevel2Idx]
      : null;


// Khi bấm nút "LƯU CẤU HÌNH"
// LƯU TẤT CẢ VÀO HỆ THỐNG
  const handleSaveAllConfig = async () => {
    setIsSaving(true);
    try {
      // Chuẩn hóa URL ảnh trước khi lưu: bóc tách domain cứng, chỉ giữ /uploads/...
      const cleanItems = items.map((it, idx) => {
        let rawUrl = it.imageUrl || '';
        if (rawUrl.includes('/uploads/')) {
          rawUrl = '/uploads/' + rawUrl.split('/uploads/').pop();
        }
        return {
          id: it.id,
          title: it.name || it.title || 'Banner',
          imageUrl: rawUrl,
          link: it.link || '/',
          group: it.group || activeGroup || 'hero_banners',
          order: idx,
        };
      });

      // Lưu đồng bộ thẳng vào Database qua API
      const res = await fetch(`${API_BASE}/api/admin/banners/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cleanItems, menus }),
      });

      if (!res.ok) {
        throw new Error('Không thể kết nối đến máy chủ API');
      }

      setItems(cleanItems);
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
    if (!confirm('Khôi phục toàn bộ cấu hình Banner & Menu về mặc định?')) return;
    setItems(INITIAL_ITEMS);
    setMenus(MENU_DATA);
    localStorage.removeItem('fogo_banners_config');
    localStorage.removeItem('fogo_menu_config');
    setHasUnsavedChanges(true);
  };

  // Mở modal thêm/sửa Banner
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
    setItemImageUrl(cleanUrl(it.imageUrl));
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
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('https://fogo-store-api.onrender.com/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        // ÉP BUỘC CHUYỂN ĐỔI NGAY TẠI ĐÂY NẾU BACKEND VẪN TRẢ VỀ LOCALHOST
        const forceHttpsUrl = String(data.imageUrl).replace(
          /http:\/\/localhost:[0-9]+/g,
          'https://fogo-store-api.onrender.com'
        );
        setItemImageUrl(forceHttpsUrl);
      } else {
        alert('Tải ảnh thất bại');
      }
    } catch {
      alert('Không thể kết nối máy chủ tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemImageUrl.trim()) {
      alert('Vui lòng nhập tên và tải ảnh');
      return;
    }

    const safeUrl = cleanUrl(itemImageUrl);

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                name: itemName,
                imageUrl: safeUrl,
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
        imageUrl: safeUrl,
        tag: itemTag,
        subtitle: itemSubtitle,
        priceText: itemPriceText,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setHasUnsavedChanges(true);
    setIsModalOpen(false);
  };

  // QUẢN LÝ MENU MODAL SUBMIT
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
      {/* TOAST LƯU THÀNH CÔNG */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-emerald-400">
            <CheckCircle2 size={18} />
            <span>Đã lưu thành công toàn bộ cấu hình Banner &amp; Menu Website!</span>
          </div>
        </div>
      )}

      {/* HEADER TỔNG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <ImageIcon size={22} className="text-[#d70018]" />
            <span>Quản Lý Banner, Danh Mục, Submodel &amp; Menu</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Thay đổi hình ảnh, cấu trúc Navbar đa cấp và bấm <b>LƯU CẤU HÌNH</b> để cập nhật trực tiếp ra Website.
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
            <span>{isSaving ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH'}</span>
          </button>
        </div>
      </div>

      {/* THANH TAB TRỰC QUAN */}
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

      {/* NỘI DUNG TỪNG NHÓM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* NHÓM 1: BANNER LỚN */}
        {activeGroup === 'hero_banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[21/9] flex flex-col justify-between group bg-gray-900"
              >
                <img src={cleanUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
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

        {/* NHÓM 2: 2 BANNER CON THUẦN ẢNH */}
        {activeGroup === 'promo_cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-[2.8/1] flex flex-col justify-between group bg-gray-100"
              >
                <img src={cleanUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
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

        {/* NHÓM 3: 4 Ô CAM KẾT */}
        {activeGroup === 'commit_cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentItems.map((item) => (
              <div key={item.id} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square flex flex-col justify-between group">
                <img src={cleanUrl(item.imageUrl)} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
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

        {/* NHÓM 4, 5, 6, 7: DANH MỤC & SUBMODELS */}
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
                  <img src={cleanUrl(item.imageUrl)} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mt-2">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* NHÓM 8: QUẢN LÝ MENU NAVBAR ĐA CẤP (3 CỘT TRỰC QUAN) */}
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
              {/* CỘT 1: CẤP 1 */}
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

              {/* CỘT 2: CẤP 2 */}
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

              {/* CỘT 3: CẤP 3 */}
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

      {/* MODAL SỬA/THÊM BANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">{editingItem ? 'Chỉnh Sửa Mục' : 'Thêm Mục Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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
                <label className="font-bold text-gray-700 block">Hình ảnh *</label>
                <div className="flex gap-2">
                  <input type="text" required value={itemImageUrl} onChange={(e) => setItemImageUrl(e.target.value)} className="flex-1 border rounded p-2 outline-none text-xs" />
                  <label className="bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <UploadCloud size={14} /><span>Tải Ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {uploading && <p className="text-[10px] text-blue-600 font-bold">Đang tải ảnh...</p>}
                {itemImageUrl && (
                  <div className="p-2 border rounded bg-gray-50 flex items-center justify-center h-28">
                    <img src={cleanUrl(itemImageUrl)} alt="" className="max-h-full object-contain" />
                  </div>
                )}
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#d70018] text-white font-bold rounded shadow-sm">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SỬA/THÊM MENU NAVBAR */}
      {menuModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">
                {menuIsEdit ? 'Chỉnh Sửa' : 'Thêm'} Menu {menuModalType === 'level1' ? 'Cấp 1' : menuModalType === 'level2' ? 'Cấp 2' : 'Cấp 3'}
              </h3>
              <button onClick={() => setMenuModalType(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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
                <button type="button" onClick={() => setMenuModalType(null)} className="px-4 py-2 border rounded">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#d70018] text-white font-bold rounded">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}