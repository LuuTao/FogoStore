'use client';

import React, { useState, useEffect } from 'react';
import {
  Filter,
  ArrowUpDown,
  Check,
  X,
  ArrowDownAZ,
  Clock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

export interface FilterState {
  price?: string;
  screenSize?: string;
  ram?: string;
  demand?: string[];
  battery?: string[];
  refreshRate?: string;
  screenType?: string;
  storage?: string;
  chip?: string[];
  camera?: string[];
  specialFeature?: string[];
}

export type SortType = 'id' | 'recent' | 'price_asc' | 'price_desc';

interface Props {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
  onApplyFilters: (filters: FilterState) => void;
  isTabletOrMac?: boolean;
}

export const FilterAndSortBar: React.FC<Props> = ({
  currentSort,
  onSortChange,
  onApplyFilters,
  isTabletOrMac = false,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Bộ lọc đang chọn
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    demand: [],
    battery: [],
    chip: [],
    camera: [],
    specialFeature: [],
  });

  // Khóa scroll trang khi mở modal bộ lọc
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  // Đếm tổng số tiêu chí đang được chọn
  const countSelected = () => {
    let count = 0;
    if (selectedFilters.price) count++;
    if (selectedFilters.screenSize) count++;
    if (selectedFilters.ram) count++;
    if (selectedFilters.refreshRate) count++;
    if (selectedFilters.screenType) count++;
    if (selectedFilters.storage) count++;
    count += selectedFilters.demand?.length || 0;
    count += selectedFilters.battery?.length || 0;
    count += selectedFilters.chip?.length || 0;
    count += selectedFilters.camera?.length || 0;
    count += selectedFilters.specialFeature?.length || 0;
    return count;
  };

  const toggleSingle = (
    key: 'price' | 'screenSize' | 'ram' | 'refreshRate' | 'screenType' | 'storage',
    value: string
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const toggleMulti = (
    key: 'demand' | 'battery' | 'chip' | 'camera' | 'specialFeature',
    value: string
  ) => {
    setSelectedFilters((prev) => {
      const list = prev[key] || [];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    const emptyState: FilterState = {
      demand: [],
      battery: [],
      chip: [],
      camera: [],
      specialFeature: [],
    };
    setSelectedFilters(emptyState);
    onApplyFilters(emptyState);
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case 'id':
        return 'Theo mã sản phẩm';
      case 'recent':
        return 'Gần đây nhất';
      case 'price_asc':
        return 'Giá bán tăng dần';
      case 'price_desc':
        return 'Giá bán giảm dần';
    }
  };

  const totalActive = countSelected();

  return (
    <>
      {/* ================= THANH NÚT NGOÀI TRANG DANH MỤC ================= */}
      <div className="flex items-center gap-3 select-none">
        {/* Nút mở Bộ lọc */}
        <button
          onClick={() => {
            setIsFilterOpen(true);
            setIsSortOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 border text-xs sm:text-sm font-bold rounded-sm transition-all shadow-sm ${
            totalActive > 0
              ? 'border-[#d70018] text-[#d70018] bg-red-50'
              : 'border-gray-300 bg-white hover:border-[#d70018] text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Filter size={15} className={totalActive > 0 ? 'text-[#d70018]' : 'text-gray-600'} />
          <span>Bộ lọc</span>
          {totalActive > 0 && (
            <span className="bg-[#d70018] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-1">
              {totalActive}
            </span>
          )}
        </button>

        {/* Dropdown Sắp xếp màu đỏ */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#d70018] hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-sm shadow-sm transition-colors"
          >
            <ArrowUpDown size={15} />
            <span>{getSortLabel()}</span>
            <span className="text-[10px] ml-1">▼</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-sm shadow-xl z-30 py-1 divide-y divide-gray-100">
              <button
                onClick={() => {
                  onSortChange('id');
                  setIsSortOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-red-50 transition-colors ${
                  currentSort === 'id' ? 'bg-red-50 text-[#d70018]' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowDownAZ size={15} />
                  <span>Theo mã sản phẩm</span>
                </div>
                {currentSort === 'id' ? (
                  <Check size={14} className="text-[#d70018]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
              </button>

              <button
                onClick={() => {
                  onSortChange('recent');
                  setIsSortOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-red-50 transition-colors ${
                  currentSort === 'recent' ? 'bg-red-50 text-[#d70018]' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={15} />
                  <span>Gần đây nhất</span>
                </div>
                {currentSort === 'recent' ? (
                  <Check size={14} className="text-[#d70018]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
              </button>

              <button
                onClick={() => {
                  onSortChange('price_asc');
                  setIsSortOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-red-50 transition-colors ${
                  currentSort === 'price_asc' ? 'bg-red-50 text-[#d70018]' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUp size={15} />
                  <span>Giá bán tăng dần</span>
                </div>
                {currentSort === 'price_asc' ? (
                  <Check size={14} className="text-[#d70018]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
              </button>

              <button
                onClick={() => {
                  onSortChange('price_desc');
                  setIsSortOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-red-50 transition-colors ${
                  currentSort === 'price_desc' ? 'bg-red-50 text-[#d70018]' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowDown size={15} />
                  <span>Giá bán giảm dần</span>
                </div>
                {currentSort === 'price_desc' ? (
                  <Check size={14} className="text-[#d70018]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL BỘ LỌC CĂN GIỮA MÀN HÌNH CHUẨN ĐẸP ================= */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none">
          {/* Nền tối làm mờ */}
          <div
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Hộp thoại Modal chính */}
          <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-sm bg-[#d70018]/10 text-[#d70018] flex items-center justify-center">
                  <Filter size={16} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Bộ Lọc Tìm Kiếm Sản Phẩm
                </h3>
                {totalActive > 0 && (
                  <span className="text-xs bg-[#d70018] text-white font-bold px-2 py-0.5 rounded-full">
                    Đã chọn {totalActive}
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 rounded-sm bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thân Modal (Chia 2 cột cân đối, cuộn mượt mà) */}
            <div className="p-6 overflow-y-auto space-y-7 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                
                {/* ===== CỘT TRÁI ===== */}
                <div className="space-y-6">
                  {/* 1. Giá */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Giá</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Dưới 2 triệu',
                        'Từ 2 - 4 triệu',
                        'Từ 4 - 7 triệu',
                        'Từ 7 - 13 triệu',
                        'Từ 13 - 20 triệu',
                        'Trên 20 triệu',
                      ].map((item) => {
                        const active = selectedFilters.price === item;
                        return (
                          <button
                            key={item}
                            onClick={() => toggleSingle('price', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Kích thước màn hình */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Kích thước màn hình</h4>
                    <div className="flex flex-wrap gap-2">
                      {(isTabletOrMac
                        ? ['Dưới 11 inch', 'Từ 11 - 13 inch', 'Trên 13 inch', '14 - 16 inch']
                        : ['Dưới 6 inch', 'Trên 6 inch', '6.1 inch', '6.7 inch', '6.9 inch']
                      ).map((item) => {
                        const active = selectedFilters.screenSize === item;
                        return (
                          <button
                            key={item}
                            onClick={() => toggleSingle('screenSize', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. RAM */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">RAM</h4>
                    <div className="flex flex-wrap gap-2">
                      {['3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB', '36GB'].map((item) => {
                        const active = selectedFilters.ram === item;
                        return (
                          <button
                            key={item}
                            onClick={() => toggleSingle('ram', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Pin & Sạc */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Pin & Sạc</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Dưới 3000 mah',
                        'Pin từ 3000 - 4000 mah',
                        'Pin từ 4000 - 5000 mah',
                        'Trên 5000 mah',
                        'Sạc nhanh (từ 20W)',
                        'Sạc siêu nhanh (từ 60W)',
                        'Sạc MagSafe',
                      ].map((item) => {
                        const active = selectedFilters.battery?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleMulti('battery', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Tần số quét */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Tần số quét</h4>
                    <div className="flex flex-wrap gap-2">
                      {['60Hz', '90Hz', '120Hz ProMotion', 'Từ 144Hz trở lên'].map((item) => {
                        const active = selectedFilters.refreshRate === item;
                        return (
                          <button
                            key={item}
                            onClick={() => toggleSingle('refreshRate', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Kiểu màn hình */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Kiểu màn hình</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Dynamic Island', 'Tai thỏ', 'Tràn viền', 'Màn hình gập', 'Kính Nano'].map(
                        (item) => {
                          const active = selectedFilters.screenType === item;
                          return (
                            <button
                              key={item}
                              onClick={() => toggleSingle('screenType', item)}
                              className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                                active
                                  ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== CỘT PHẢI ===== */}
                <div className="space-y-6">
                  {/* 7. Chọn theo nhu cầu */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Chọn theo nhu cầu</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Điện thoại AI',
                        'Chơi game',
                        'Pin trâu',
                        'Dung lượng lớn',
                        'Cấu hình cao',
                        'Mỏng nhẹ',
                        'Chụp ảnh / Quay phim',
                        'Nhỏ gọn',
                        'Livestream',
                        'Đồ họa chuyên sâu',
                      ].map((item) => {
                        const active = selectedFilters.demand?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleMulti('demand', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 8. Chip xử lý */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">
                      Chip xử lý {isTabletOrMac ? '(iPad & Mac)' : ''}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Apple A18 Pro',
                        'Apple A18',
                        'Apple A17 Pro',
                        'Apple A16',
                        'Apple M4',
                        'Apple M3',
                        'Apple M2',
                        'Apple M1',
                      ].map((item) => {
                        const active = selectedFilters.chip?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleMulti('chip', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 9. Dung lượng lưu trữ */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Dung lượng lưu trữ</h4>
                    <div className="flex flex-wrap gap-2">
                      {['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'].map((item) => {
                        const active = selectedFilters.storage === item;
                        return (
                          <button
                            key={item}
                            onClick={() => toggleSingle('storage', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 10. Camera */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Camera</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Chụp xóa phông',
                        'Chụp góc rộng',
                        'Quay video 4K',
                        'Chống rung OIS',
                        'Camera 48MP',
                        'Chụp đêm',
                        'Zoom quang 5x',
                      ].map((item) => {
                        const active = selectedFilters.camera?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleMulti('camera', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 11. Tính năng đặc biệt */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 mb-2.5">Tính năng đặc biệt</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Apple Intelligence',
                        'Camera Control',
                        'Action Button',
                        'Face ID 3D',
                        'Kháng nước IP68',
                        'Hỗ trợ 5G',
                        'Apple Pencil',
                      ].map((item) => {
                        const active = selectedFilters.specialFeature?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleMulti('specialFeature', item)}
                            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap inline-flex items-center justify-center ${
                              active
                                ? 'bg-[#d70018] text-white border-[#d70018] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Modal: 2 nút thao tác tiện dụng */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#d70018] transition-colors"
              >
                <RotateCcw size={15} />
                <span>Bỏ chọn tất cả</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs sm:text-sm font-bold rounded-sm transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleApply}
                  className="px-8 py-2.5 bg-[#d70018] hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-sm shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Filter size={15} />
                  <span>Áp dụng bộ lọc {totalActive > 0 ? `(${totalActive})` : ''}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};