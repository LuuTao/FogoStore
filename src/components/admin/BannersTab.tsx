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
  ChevronUp,
  ChevronDown,
  GripVertical,
  LayoutGrid,
  Grid,
  AlertTriangle,
  CheckSquare,
  Square,
} from 'lucide-react';

interface Props {
  banners?: any[];
  onRefresh?: () => void;
}

type BannerGroup =
  | 'hero_banners'       // Banner Lớn Đầu Trang
  | 'promo_cards'        // 2 Banner Nhỏ Đè Hero
  | 'category_banners'   // 4 Banner Category (Render 350x250)
  | 'all_categories'     // 20 Danh Mục Tròn Trang Chủ
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
        } else if (targetGroup === 'category_banners') {
          width = 700;
          height = 500;
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
        const compressedBase64 = canvas.toDataURL('image/webp', 0.85);
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
  {
    id: 'cat-banner-1',
    name: 'MacBook Air M5',
    link: '/macbook',
    group: 'category_banners',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&h=500&q=80',
    subtitle: 'Cập Nhật Giá Mới',
    tag: 'MỚI',
  },
  {
    id: 'cat-banner-2',
    name: 'iPhone Thế Hệ Mới',
    link: '/iphone',
    group: 'category_banners',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&h=500&q=80',
    subtitle: 'Camera 48MP Dual Fusion',
    tag: 'HOT',
  },
  {
    id: 'cat-banner-3',
    name: 'iPad Pro M4',
    link: '/ipad',
    group: 'category_banners',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&h=500&q=80',
    subtitle: 'Mở Ứng Dụng Song Song',
    tag: 'GIÁ TỐT',
  },
  {
    id: 'cat-banner-4',
    name: 'Phụ Kiện Chính Hãng',
    link: '/phu-kien',
    group: 'category_banners',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&h=500&q=80',
    subtitle: 'Chuẩn Zin Apple',
    tag: 'ƯU ĐÃI',
  },
  { id: 'cat-circle-1', name: 'iPhone 18 Pro Max', link: '/iphone', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300' },
  { id: 'cat-circle-2', name: 'iPhone 17 Pro Max', link: '/iphone', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300' },
  { id: 'cat-circle-3', name: 'iPhone 17', link: '/iphone', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { id: 'cat-circle-4', name: 'iPhone 17 Air', link: '/iphone', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300' },
  { id: 'cat-circle-5', name: 'iPhone 16 Series', link: '/iphone', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300' },
  { id: 'cat-circle-6', name: 'Ốp lưng iPhone', link: '/phu-kien', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300' },
  { id: 'cat-circle-7', name: 'Kính Cường Lực', link: '/phu-kien', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300' },
  { id: 'cat-circle-8', name: 'iPad Pro', link: '/ipad', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300' },
  { id: 'cat-circle-9', name: 'Apple Watch', link: '/watch', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300' },
  { id: 'cat-circle-10', name: 'MacBook Pro', link: '/macbook', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300' },
  { id: 'cat-circle-11', name: 'MacBook Neo (2026)', link: '/macbook', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300' },
  { id: 'cat-circle-12', name: 'MacBook Air', link: '/macbook', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300' },
  { id: 'cat-circle-13', name: 'iPad Air M4', link: '/ipad', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300' },
  { id: 'cat-circle-14', name: 'iPad Mini', link: '/ipad', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300' },
  { id: 'cat-circle-15', name: 'Watch Ultra', link: '/watch', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300' },
  { id: 'cat-circle-16', name: 'Phụ kiện iPad', link: '/phu-kien', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300' },
  { id: 'cat-circle-17', name: 'Phụ kiện Mac', link: '/phu-kien', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300' },
  { id: 'cat-circle-18', name: 'iPhone Cũ Giá Rẻ', link: '/hang-cu', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300' },
  { id: 'cat-circle-19', name: 'iPad Cũ 99%', link: '/hang-cu', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300' },
  { id: 'cat-circle-20', name: 'MacBook Cũ 99%', link: '/hang-cu', group: 'all_categories', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300' },
];

export default function BannersTab({ banners: propBanners, onRefresh }: Props) {
  const [activeGroup, setActiveGroup] = useState<BannerGroup>('hero_banners');
  const [items, setItems] = useState<ItemConfig[]>(INITIAL_ITEMS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // STATE CHỌN NHIỀU ĐỂ XÓA
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // STATE MODAL XÁC NHẬN XÓA (POPUP Ở GIỮA MÀN HÌNH)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    idsToDelete: string[];
    title: string;
  }>({
    isOpen: false,
    idsToDelete: [],
    title: '',
  });

  // STATE MODAL THÊM / SỬA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemConfig | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [itemTag, setItemTag] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [uploading, setUploading] = useState(false);

  // FETCH TRỰC TIẾP TỪ DATABASE NEON QUA API
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

          const hasCategories = mapped.some((it) => it.group === 'all_categories');
          const finalItems = hasCategories
            ? mapped
            : [...mapped, ...INITIAL_ITEMS.filter((i) => i.group === 'all_categories')];

          setItems(finalItems);
          try {
            localStorage.setItem('fogo_banners_config', JSON.stringify(finalItems));
          } catch (_) {}
          return;
        }
      }

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

  // KHI CHUYỂN TAB THÌ RESET SELECTION
  useEffect(() => {
    setSelectedIds([]);
  }, [activeGroup]);

  // LOGIC CHỌN / BỎ CHỌN TẤT CẢ
  const isAllSelected = currentItems.length > 0 && currentItems.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentItems.some((it) => it.id === id)));
    } else {
      const currentGroupIds = currentItems.map((it) => it.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentGroupIds])));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // MỞ HỘP THOẠI XÓA 1 MỤC
  const confirmDeleteSingle = (item: ItemConfig) => {
    setDeleteModal({
      isOpen: true,
      idsToDelete: [item.id],
      title: `Bạn có chắc muốn xóa mục "${item.name}"?`,
    });
  };

  // MỞ HỘP THOẠI XÓA CÁC MỤC ĐÃ CHỌN
  const confirmDeleteSelected = () => {
    const count = selectedIds.filter((id) => currentItems.some((it) => it.id === id)).length;
    if (count === 0) return;
    setDeleteModal({
      isOpen: true,
      idsToDelete: selectedIds.filter((id) => currentItems.some((it) => it.id === id)),
      title: `Bạn có chắc chắn muốn xóa ${count} mục đã chọn?`,
    });
  };

  // THỰC THI XÓA
  const handleExecuteDelete = () => {
    const { idsToDelete } = deleteModal;
    setItems((prev) => prev.filter((it) => !idsToDelete.includes(it.id)));
    setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
    setHasUnsavedChanges(true);
    setDeleteModal({ isOpen: false, idsToDelete: [], title: '' });
  };

  // LOGIC DI CHUYỂN THỨ TỰ (MOVE UP / MOVE DOWN)
  const handleMoveItem = (indexInGroup: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? indexInGroup - 1 : indexInGroup + 1;
    if (targetIdx < 0 || targetIdx >= currentItems.length) return;

    const sourceItem = currentItems[indexInGroup];
    const targetItem = currentItems[targetIdx];

    const realIdxA = items.findIndex((it) => it.id === sourceItem.id);
    const realIdxB = items.findIndex((it) => it.id === targetItem.id);

    if (realIdxA !== -1 && realIdxB !== -1) {
      const nextItems = [...items];
      const temp = nextItems[realIdxA];
      nextItems[realIdxA] = nextItems[realIdxB];
      nextItems[realIdxB] = temp;

      setItems(nextItems);
      setHasUnsavedChanges(true);
    }
  };

  // LOGIC KÉO THẢ (HTML5 DRAG & DROP)
  const handleDropItem = (fromIdxInGroup: number, toIdxInGroup: number) => {
    if (fromIdxInGroup === toIdxInGroup) return;

    const sourceItem = currentItems[fromIdxInGroup];
    const targetItem = currentItems[toIdxInGroup];

    const realSourceIdx = items.findIndex((it) => it.id === sourceItem.id);
    const realTargetIdx = items.findIndex((it) => it.id === targetItem.id);

    if (realSourceIdx !== -1 && realTargetIdx !== -1) {
      const nextItems = [...items];
      const [moved] = nextItems.splice(realSourceIdx, 1);
      nextItems.splice(realTargetIdx, 0, moved);

      setItems(nextItems);
      setHasUnsavedChanges(true);
    }
  };

  // LƯU CẤU HÌNH VÀO DATABASE
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
        window.dispatchEvent(new Event('fogo_banners_updated'));
      } catch (_) {}

      if (!syncSuccess) {
        throw new Error(syncError || 'Backend chưa lưu được dữ liệu');
      }

      setHasUnsavedChanges(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);

      if (onRefresh) onRefresh();
      fetchBannersFromBackend();
    } catch (err: any) {
      alert('Đã xảy ra lỗi khi lưu vào cơ sở dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    setDeleteModal({
      isOpen: true,
      idsToDelete: [],
      title: 'Khôi phục toàn bộ cấu hình Banner & Danh mục về mặc định ban đầu?',
    });
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

  const selectedCountInCurrentGroup = currentItems.filter((it) => selectedIds.includes(it.id)).length;

  return (
    <div className="space-y-6 select-none relative">
      {/* TOAST THÔNG BÁO LƯU THÀNH CÔNG */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-emerald-400">
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
            Dùng mũi tên hoặc kéo thả biểu tượng <b>Grip</b> để đổi thứ tự. Sau đó nhấn <b>LƯU CẤU HÌNH</b>.
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
          { id: 'category_banners', label: '4 Banner Category (350x250)', icon: LayoutGrid },
          { id: 'all_categories', label: 'Tất Cả Danh Mục (Icon Tròn)', icon: Grid },
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

      {/* THANH THAO TÁC HÀNG LOẠT (CHỌN NHIỀU ĐỂ XÓA) */}
      {currentItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-gray-700 hover:text-black cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare size={17} className="text-[#d70018]" />
              ) : (
                <Square size={17} className="text-gray-400" />
              )}
              <span>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 font-medium">
              Đã chọn: <b className="text-gray-900">{selectedCountInCurrentGroup}</b> / {currentItems.length}
            </span>
          </div>

          {selectedCountInCurrentGroup > 0 && (
            <button
              type="button"
              onClick={confirmDeleteSelected}
              className="bg-[#d70018] hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Trash2 size={14} />
              <span>Xóa {selectedCountInCurrentGroup} mục đã chọn</span>
            </button>
          )}
        </div>
      )}

      {/* DANH SÁCH BANNER / MỤC */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs border border-dashed rounded-lg">
            Chưa có mục nào trong nhóm này. Bấm &quot;Thêm Mục Vào Nhóm&quot; để tạo mới.
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/banner-item', idx.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIdx = Number(e.dataTransfer.getData('text/banner-item'));
                    if (!isNaN(fromIdx)) handleDropItem(fromIdx, idx);
                  }}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border rounded-lg shadow-2xs transition-all gap-3 ${
                    isSelected
                      ? 'bg-red-50/50 border-red-300'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
                  }`}
                >
                  {/* Khu vực chọn Checkbox, ảnh & thông tin */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox chọn mục */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="w-4 h-4 accent-[#d70018] cursor-pointer shrink-0 rounded"
                    />

                    {/* Tay cầm kéo thả */}
                    <GripVertical
                      size={18}
                      className="text-gray-300 group-hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0"
                      title="Kéo thả để sắp xếp vị trí"
                    />

                    {/* Số thứ tự */}
                    <span className="w-6 text-center text-xs font-black text-gray-400 group-hover:text-gray-800 shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Thumbnail */}
                    <div
                      className={`rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center ${
                        activeGroup === 'all_categories'
                          ? 'w-14 h-14 rounded-full p-1 bg-white'
                          : activeGroup === 'category_banners'
                          ? 'w-24 aspect-[7/5]'
                          : 'w-28 h-14'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.name}
                        className={`w-full h-full pointer-events-none ${
                          activeGroup === 'all_categories' ? 'object-contain rounded-full' : 'object-cover'
                        }`}
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                        {item.tag && (
                          <span className="bg-red-50 text-[#d70018] border border-red-200 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      {item.subtitle && <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>}
                      <p className="text-[10px] text-gray-400 font-mono truncate">{item.link || '/'}</p>
                    </div>
                  </div>

                  {/* Các nút điều khiển thứ tự & thao tác */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, 'up')}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Di chuyển lên trên"
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={idx === currentItems.length - 1}
                      onClick={() => handleMoveItem(idx, 'down')}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Di chuyển xuống dưới"
                    >
                      <ChevronDown size={16} />
                    </button>

                    <div className="h-4 w-px bg-gray-200 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Nút Xóa (Đã chuyển sang popup ở giữa màn hình) */}
                    <button
                      type="button"
                      onClick={() => confirmDeleteSingle(item)}
                      className="p-1.5 text-gray-400 hover:text-[#d70018] hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Xóa mục này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP THÔNG BÁO XÁC NHẬN XÓA NẰM CHÍNH GIỮA MÀN HÌNH (THAY THẾ WINDOW CONFIRM) */}
      {/* ========================================================================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900">Xác Nhận Xóa</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-medium">
                {deleteModal.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Lưu ý: Sau khi xác nhận, hãy bấm &quot;LƯU CẤU HÌNH&quot; để áp dụng lên Database.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, idsToDelete: [], title: '' })}
                className="py-2.5 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                className="py-2.5 px-4 bg-[#d70018] hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="font-bold text-gray-700 block mb-1">Đường dẫn khi click (URL)</label>
                <input type="text" value={itemLink} onChange={(e) => setItemLink(e.target.value)} className="w-full border rounded p-2 outline-none font-mono text-xs" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Phụ đề (Subtitle)</label>
                <input type="text" value={itemSubtitle} onChange={(e) => setItemSubtitle(e.target.value)} className="w-full border rounded p-2 outline-none" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nhãn Tag (VD: MỚI, HOT, TRỢ GIÁ...)</label>
                <input type="text" value={itemTag} onChange={(e) => setItemTag(e.target.value)} className="w-full border rounded p-2 outline-none" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 block">Hình ảnh (Đường dẫn hoặc tải trực tiếp) *</label>
                  {activeGroup === 'category_banners' && (
                    <span className="text-[10px] text-blue-600 font-bold">Chuẩn: 700x500px (Render 350x250px)</span>
                  )}
                  {activeGroup === 'all_categories' && (
                    <span className="text-[10px] text-emerald-600 font-bold">Chuẩn: 300x300px (Icon Tròn)</span>
                  )}
                </div>
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