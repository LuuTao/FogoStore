'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  X,
} from 'lucide-react';
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

export default function MenuTab() {
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

  // Lưu toàn bộ cấu hình Menu
  const handleSaveConfig = () => {
    try {
      localStorage.setItem('fogo_menu_config', JSON.stringify(menus));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Không thể lưu cấu hình menu.');
    }
  };

  // Khôi phục về mặc định ban đầu
  const handleResetDefault = () => {
    if (!confirm('Khôi phục cấu hình menu về mặc định từ navigation.ts?')) return;
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
    <div className="space-y-6 select-none relative">
      {/* Toast thông báo lưu thành công */}
      {saveSuccess && (
        <div className="fixed top-20 right-8 z-50">
          <div className="bg-[#00a859] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 font-bold text-xs border border-emerald-400">
            <CheckCircle2 size={18} />
            <span>Đã cập nhật toàn bộ cấu hình Menu vào hệ thống!</span>
          </div>
        </div>
      )}

      {/* HEADER TỔNG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <Menu size={22} className="text-[#d70018]" />
            <span>Quản Lý Cấu Trúc Thanh Menu Đa Cấp (Navbar)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tự do thêm bớt menu Cấp 1, dòng máy Cấp 2 và phân khúc con Cấp 3.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={handleSaveConfig}
            className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all ${
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

      {/* BẢNG QUẢN LÝ 3 CỘT (CẤP 1 -> CẤP 2 -> CẤP 3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* CỘT 1: MENU CẤP 1 (Thanh ngang chính) */}
        <div className="md:col-span-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d70018]" />
              <span>Cấp 1 (Thanh chính)</span>
            </h3>
            <button
              onClick={() => handleOpenAdd('level1')}
              className="text-[#d70018] hover:bg-red-50 p-1 rounded font-bold text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Thêm
            </button>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {menus.map((item) => {
              const isSelected = item.id === selectedLevel1Id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedLevel1Id(item.id);
                    setSelectedLevel2Idx(item.groups && item.groups.length > 0 ? 0 : null);
                  }}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#d70018] bg-red-50/50 text-[#d70018] font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="bg-[#d70018] text-white text-[9px] px-1 py-0.5 rounded font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
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

        {/* CỘT 2: MENU CẤP 2 (Nhóm xổ xuống) */}
        <div className="md:col-span-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Cấp 2 (Nhóm theo dòng)</span>
            </h3>
            <button
              onClick={() => handleOpenAdd('level2')}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded font-bold text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Thêm
            </button>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {(!activeLevel1?.groups || activeLevel1.groups.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-8">Chưa có menu cấp 2 nào</p>
            ) : (
              activeLevel1.groups.map((group, idx) => {
                const isSelected = selectedLevel2Idx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedLevel2Idx(idx)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{group.groupTitle}</span>
                      <span className="text-[10px] text-gray-400 font-mono truncate">{group.href}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
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

        {/* CỘT 3: MENU CẤP 3 (Từng phiên bản chi tiết) */}
        <div className="md:col-span-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Cấp 3 (Phiên bản con)</span>
            </h3>
            {activeLevel2 && (
              <button
                onClick={() => handleOpenAdd('level3')}
                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded font-bold text-xs flex items-center gap-1"
              >
                <Plus size={14} /> Thêm
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {(!activeLevel2?.items || activeLevel2.items.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-8">Chưa có phiên bản con nào</p>
            ) : (
              activeLevel2.items.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col truncate pr-2">
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

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit('level3', idx)}
                      className="p-1 hover:text-blue-600 text-gray-400"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('level3', idx)}
                      className="p-1 hover:text-red-600 text-gray-400"
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

      {/* MODAL THÊM / SỬA */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900">
                {isEditMode ? 'Chỉnh Sửa Mục' : 'Thêm Mục Mới'}{' '}
                {modalType === 'level1' ? 'Cấp 1' : modalType === 'level2' ? 'Cấp 2' : 'Cấp 3'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
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
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-bold"
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
                  className="w-full border rounded p-2 outline-none focus:border-red-500 font-mono"
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
                    className="w-full border rounded p-2 outline-none focus:border-red-500"
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
                    Gắn nhãn màu đỏ "Mới" cho sản phẩm này
                  </label>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d70018] hover:bg-red-700 text-white font-bold rounded shadow-sm"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}