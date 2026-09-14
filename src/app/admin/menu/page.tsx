'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Layers,
  X,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MENU_DATA } from '@/data/navigation';

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

// Hàm hoán đổi vị trí phần tử trong mảng
const moveArrayItem = <T,>(arr: T[], fromIndex: number, direction: 'up' | 'down'): T[] => {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  if (toIndex < 0 || toIndex >= arr.length) return arr;
  const newArr = [...arr];
  const [target] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, target);
  return newArr;
};

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>(MENU_DATA);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State chọn Menu Cấp 1 & Cấp 2 đang chỉnh sửa
  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string>(MENU_DATA[0]?.id || '');
  const [selectedLevel2Idx, setSelectedLevel2Idx] = useState<number | null>(0);

  // Modal State cho Thêm / Sửa
  const [modalType, setModalType] = useState<'level1' | 'level2' | 'level3' | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form input states
  const [inputTitle, setInputTitle] = useState('');
  const [inputHref, setInputHref] = useState('');
  const [inputBadge, setInputBadge] = useState('');
  const [inputIsNew, setInputIsNew] = useState(false);

  // Nạp cấu hình từ LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fogo_menu_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenus(parsed);
          setSelectedLevel1Id(parsed[0].id);
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp menu config:', e);
    }
  }, []);

  const activeLevel1 = menus.find((m) => m.id === selectedLevel1Id) || menus[0];
  const activeLevel2 =
    activeLevel1?.groups && selectedLevel2Idx !== null
      ? activeLevel1.groups[selectedLevel2Idx]
      : null;

  // ==========================================
  // LOGIC DI CHUYỂN THỨ TỰ (MOVE UP / DOWN)
  // ==========================================
  const handleMoveLevel1 = (index: number, direction: 'up' | 'down') => {
    setMenus((prev) => moveArrayItem(prev, index, direction));
    setHasChanges(true);
  };

  const handleMoveLevel2 = (index: number, direction: 'up' | 'down') => {
    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);
      if (targetL1?.groups) {
        targetL1.groups = moveArrayItem(targetL1.groups, index, direction);
        const toIdx = direction === 'up' ? index - 1 : index + 1;
        if (toIdx >= 0 && toIdx < targetL1.groups.length) {
          setSelectedLevel2Idx(toIdx);
        }
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleMoveLevel3 = (index: number, direction: 'up' | 'down') => {
    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);
      if (targetL1?.groups && selectedLevel2Idx !== null) {
        const targetL2 = targetL1.groups[selectedLevel2Idx];
        if (targetL2?.items) {
          targetL2.items = moveArrayItem(targetL2.items, index, direction);
        }
      }
      return next;
    });
    setHasChanges(true);
  };

  // ==========================================
  // LOGIC KÉO THẢ (DRAG & DROP)
  // ==========================================
  const handleDropLevel1 = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setMenus((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(fromIdx, 1);
      newArr.splice(toIdx, 0, moved);
      return newArr;
    });
    setHasChanges(true);
  };

  const handleDropLevel2 = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);
      if (targetL1?.groups) {
        const [moved] = targetL1.groups.splice(fromIdx, 1);
        targetL1.groups.splice(toIdx, 0, moved);
        setSelectedLevel2Idx(toIdx);
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleDropLevel3 = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);
      if (targetL1?.groups && selectedLevel2Idx !== null) {
        const targetL2 = targetL1.groups[selectedLevel2Idx];
        if (targetL2?.items) {
          const [moved] = targetL2.items.splice(fromIdx, 1);
          targetL2.items.splice(toIdx, 0, moved);
        }
      }
      return next;
    });
    setHasChanges(true);
  };

  // Lưu toàn bộ cấu hình Menu
  const handleSaveConfig = () => {
    try {
      localStorage.setItem('fogo_menu_config', JSON.stringify(menus));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('Không thể lưu cấu hình menu.');
    }
  };

  // Khôi phục về mặc định ban đầu
  const handleResetDefault = () => {
    if (!confirm('Khôi phục cấu hình menu về mặc định ban đầu?')) return;
    setMenus(MENU_DATA);
    localStorage.removeItem('fogo_menu_config');
    setHasChanges(true);
  };

  // Mở Modal Thêm mới
  const handleOpenAdd = (type: 'level1' | 'level2' | 'level3') => {
    setModalType(type);
    setIsEditMode(false);
    setEditIndex(null);
    setInputTitle('');
    setInputHref(type === 'level1' ? '/iphone' : activeLevel1?.href || '/');
    setInputBadge('');
    setInputIsNew(false);
  };

  // Mở Modal Sửa
  const handleOpenEdit = (type: 'level1' | 'level2' | 'level3', index?: number) => {
    setModalType(type);
    setIsEditMode(true);

    if (type === 'level1') {
      setInputTitle(activeLevel1.title);
      setInputHref(activeLevel1.href);
      setInputBadge(activeLevel1.badge || '');
    } else if (type === 'level2' && index !== undefined && activeLevel1?.groups) {
      setEditIndex(index);
      const target = activeLevel1.groups[index];
      setInputTitle(target.groupTitle);
      setInputHref(target.href);
    } else if (type === 'level3' && index !== undefined && activeLevel2?.items) {
      setEditIndex(index);
      const target = activeLevel2.items[index];
      setInputTitle(target.name);
      setInputHref(target.href);
      setInputIsNew(!!target.isNew);
    }
  };

  // Lưu Modal
  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    setMenus((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const targetL1 = next.find((m) => m.id === selectedLevel1Id);

      if (modalType === 'level1') {
        if (isEditMode) {
          if (targetL1) {
            targetL1.title = inputTitle;
            targetL1.href = inputHref;
            targetL1.badge = inputBadge || undefined;
          }
        } else {
          const newId = `menu-${Date.now()}`;
          next.push({
            id: newId,
            title: inputTitle,
            href: inputHref,
            badge: inputBadge || undefined,
            groups: [],
          });
          setSelectedLevel1Id(newId);
        }
      } else if (modalType === 'level2' && targetL1) {
        if (!targetL1.groups) targetL1.groups = [];
        if (isEditMode && editIndex !== null) {
          targetL1.groups[editIndex].groupTitle = inputTitle;
          targetL1.groups[editIndex].href = inputHref;
        } else {
          targetL1.groups.push({
            groupTitle: inputTitle,
            href: inputHref,
            items: [],
          });
          setSelectedLevel2Idx(targetL1.groups.length - 1);
        }
      } else if (modalType === 'level3' && targetL1 && selectedLevel2Idx !== null) {
        const targetL2 = targetL1.groups?.[selectedLevel2Idx];
        if (targetL2) {
          if (!targetL2.items) targetL2.items = [];
          if (isEditMode && editIndex !== null) {
            targetL2.items[editIndex] = {
              name: inputTitle,
              href: inputHref,
              isNew: inputIsNew,
            };
          } else {
            targetL2.items.push({
              name: inputTitle,
              href: inputHref,
              isNew: inputIsNew,
            });
          }
        }
      }
      return next;
    });

    setHasChanges(true);
    setModalType(null);
  };

  // Xóa mục
  const handleDeleteItem = (type: 'level1' | 'level2' | 'level3', index?: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

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
        const targetL2 = targetL1.groups?.[selectedLevel2Idx];
        targetL2?.items?.splice(index, 1);
      }
      return next;
    });

    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* TOAST THÀNH CÔNG */}
        {saveSuccess && (
          <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-[#00a859] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 font-bold text-xs border border-emerald-400">
              <CheckCircle2 size={18} />
              <span>Đã lưu thành công! Thanh Menu Website đã được cập nhật.</span>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* HEADER DASHBOARD */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
                <Link href="/admin/san-pham" className="hover:text-[#d70018] flex items-center gap-1">
                  <ArrowLeft size={12} /> Quản lý sản phẩm
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Quản trị Navbar</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <Layers className="text-[#d70018]" />
                <span>QUẢN TRỊ THANH MENU ĐA CẤP (NAVBAR)</span>
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetDefault}
                className="px-3.5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} />
                <span>Khôi Phục Mặc Định</span>
              </button>

              <button
                onClick={handleSaveConfig}
                className={`px-5 py-2 rounded text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                  hasChanges
                    ? 'bg-[#d70018] hover:bg-red-700 text-white animate-pulse'
                    : 'bg-[#00a859] hover:bg-emerald-700 text-white'
                }`}
              >
                <Save size={16} />
                <span>LƯU CẤU HÌNH MENU</span>
              </button>
            </div>
          </div>

          {/* BẢNG QUẢN LÝ 3 CỘT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* CỘT 1: MENU CẤP 1 (Thanh chính) */}
            <div className="md:col-span-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d70018]" />
                  <span>Cấp 1 (Thanh chính)</span>
                </h3>
                <button
                  onClick={() => handleOpenAdd('level1')}
                  className="text-[#d70018] hover:bg-red-50 p-1 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Thêm
                </button>
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {menus.map((item, idx) => {
                  const isSelected = item.id === selectedLevel1Id;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/l1', idx.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = Number(e.dataTransfer.getData('text/l1'));
                        if (!isNaN(fromIdx)) handleDropLevel1(fromIdx, idx);
                      }}
                      onClick={() => {
                        setSelectedLevel1Id(item.id);
                        setSelectedLevel2Idx(item.groups && item.groups.length > 0 ? 0 : null);
                      }}
                      className={`group p-2.5 rounded border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#d70018] bg-red-50/60 text-[#d70018] font-bold shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GripVertical
                          size={14}
                          className="text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
                        />
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="bg-[#d70018] text-white text-[9px] px-1 py-0.5 rounded font-black shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Nút mũi tên di chuyển */}
                        <button
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLevel1(idx, 'up');
                          }}
                          className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Lên trên"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          disabled={idx === menus.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLevel1(idx, 'down');
                          }}
                          className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Xuống dưới"
                        >
                          <ChevronDown size={14} />
                        </button>

                        {/* Sửa / Xóa */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLevel1Id(item.id);
                            handleOpenEdit('level1');
                          }}
                          className="p-1 hover:text-blue-600 text-gray-400"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLevel1Id(item.id);
                            handleDeleteItem('level1');
                          }}
                          className="p-1 hover:text-red-600 text-gray-400"
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

            {/* CỘT 2: MENU CẤP 2 (Nhóm theo dòng máy) */}
            <div className="md:col-span-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Cấp 2 (Nhóm theo Series)</span>
                </h3>
                <button
                  onClick={() => handleOpenAdd('level2')}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Thêm
                </button>
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {(!activeLevel1?.groups || activeLevel1.groups.length === 0) ? (
                  <p className="text-xs text-gray-400 text-center py-10">Chưa có menu cấp 2 nào</p>
                ) : (
                  activeLevel1.groups.map((group, idx) => {
                    const isSelected = selectedLevel2Idx === idx;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/l2', idx.toString())}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIdx = Number(e.dataTransfer.getData('text/l2'));
                          if (!isNaN(fromIdx)) handleDropLevel2(fromIdx, idx);
                        }}
                        onClick={() => setSelectedLevel2Idx(idx)}
                        className={`group p-2.5 rounded border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <GripVertical
                            size={14}
                            className="text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
                          />
                          <div className="flex flex-col truncate">
                            <span className="truncate">{group.groupTitle}</span>
                            <span className="text-[10px] text-gray-400 font-mono truncate">{group.href}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* Nút mũi tên di chuyển */}
                          <button
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveLevel2(idx, 'up');
                            }}
                            className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Lên trên"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            disabled={idx === activeLevel1.groups!.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveLevel2(idx, 'down');
                            }}
                            className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Xuống dưới"
                          >
                            <ChevronDown size={14} />
                          </button>

                          {/* Sửa / Xóa */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit('level2', idx);
                            }}
                            className="p-1 hover:text-blue-600 text-gray-400"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem('level2', idx);
                            }}
                            className="p-1 hover:text-red-600 text-gray-400"
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

            {/* CỘT 3: MENU CẤP 3 (Từng phiên bản con) */}
            <div className="md:col-span-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Cấp 3 (Phiên bản con)</span>
                </h3>
                {activeLevel2 && (
                  <button
                    onClick={() => handleOpenAdd('level3')}
                    className="text-emerald-600 hover:bg-emerald-50 p-1 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Thêm
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {(!activeLevel2?.items || activeLevel2.items.length === 0) ? (
                  <p className="text-xs text-gray-400 text-center py-10">Chưa có phiên bản con nào</p>
                ) : (
                  activeLevel2.items.map((sub, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/l3', idx.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = Number(e.dataTransfer.getData('text/l3'));
                        if (!isNaN(fromIdx)) handleDropLevel3(fromIdx, idx);
                      }}
                      className="group p-2.5 rounded border border-gray-200 hover:border-gray-300 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <GripVertical
                          size={14}
                          className="text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
                        />
                        <div className="flex flex-col truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800 truncate">{sub.name}</span>
                            {sub.isNew && (
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-1 rounded">
                                MỚI
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono truncate">{sub.href}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Nút mũi tên di chuyển */}
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveLevel3(idx, 'up')}
                          className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Lên trên"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          disabled={idx === activeLevel2.items!.length - 1}
                          onClick={() => handleMoveLevel3(idx, 'down')}
                          className="p-1 hover:text-black text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Xuống dưới"
                        >
                          <ChevronDown size={14} />
                        </button>

                        {/* Sửa / Xóa */}
                        <button
                          onClick={() => handleOpenEdit('level3', idx)}
                          className="p-1 hover:text-blue-600 text-gray-400 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('level3', idx)}
                          className="p-1 hover:text-red-600 text-gray-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL THÊM / SỬA */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">
                {isEditMode ? 'Chỉnh Sửa Mục' : 'Thêm Mục Mới'}{' '}
                {modalType === 'level1' ? 'Cấp 1' : modalType === 'level2' ? 'Cấp 2' : 'Cấp 3'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên Hiển Thị *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: iPhone 17 Series, 17 Pro Max..."
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-[#d70018] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Đường Dẫn Liên Kết (URL Href) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: /iphone hoặc /iphone?series=17"
                  value={inputHref}
                  onChange={(e) => setInputHref(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-[#d70018] font-mono text-xs"
                />
              </div>

              {modalType === 'level1' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nhãn Badge (Nếu có)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: HOT, NEW..."
                    value={inputBadge}
                    onChange={(e) => setInputBadge(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-[#d70018]"
                  />
                </div>
              )}

              {modalType === 'level3' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isNewCheck"
                    checked={inputIsNew}
                    onChange={(e) => setInputIsNew(e.target.checked)}
                    className="w-4 h-4 accent-[#d70018]"
                  />
                  <label htmlFor="isNewCheck" className="font-bold text-gray-700 cursor-pointer">
                    Gắn nhãn màu xanh "Mới" cho sản phẩm này
                  </label>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border rounded font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded shadow-sm cursor-pointer"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}