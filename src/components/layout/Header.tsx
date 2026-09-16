'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu as MenuIcon,
  X,
  Search,
  ShoppingBag,
  User,
  PhoneCall,
  ClipboardList,
  Shield,
  LogOut,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MENU_DATA } from '@/data/navigation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

interface SearchItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  categoryName?: string;
}

export const Header: React.FC = () => {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  // Đồng bộ Menu động cho Mobile (khắc phục menu tĩnh lỗi thời)
  const [menuList, setMenuList] = useState(MENU_DATA);

  // States tìm kiếm gợi ý tức thì
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [productsCache, setProductsCache] = useState<any[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();

  const toggleSubMenu = (id: string) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  // 1. Đồng bộ menu từ cache LocalStorage và API
  useEffect(() => {
    try {
      const cached = localStorage.getItem('fogo_menu_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuList(parsed);
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc cache menu:', e);
    }

    const fetchMenuData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/menu?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data) && data.length > 0) {
            setMenuList(data);
            localStorage.setItem('fogo_menu_config', JSON.stringify(data));
          }
        }
      } catch (err) {
        // Giữ menu dự phòng nếu mất kết nối
      }
    };

    fetchMenuData();
    const handleSync = () => fetchMenuData();
    window.addEventListener('fogo_menu_updated', handleSync);
    return () => window.removeEventListener('fogo_menu_updated', handleSync);
  }, []);

  // 2. Tải trước danh mục sản phẩm phục vụ tìm kiếm nhanh
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProductsCache(json.data);
        }
      } catch (e) {
        console.error('Lỗi khi nạp dữ liệu tìm kiếm:', e);
      }
    };
    loadProducts();
  }, []);

  // 3. Lọc sản phẩm theo từ khóa (Debounce 200ms)
  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      if (productsCache.length > 0) {
        const matched = productsCache
          .filter((item: any) => {
            const name = (item.name || '').toLowerCase();
            const cat = (item.category?.name || item.category?.slug || '').toLowerCase();
            return name.includes(query) || cat.includes(query);
          })
          .slice(0, 6)
          .map((item: any) => {
            const variant = item.variants?.[0] || {};
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              price: variant.price || 0,
              imageUrl: variant.images?.[0] || '/placeholder.png',
              categoryName: item.category?.name,
            };
          });

        setSearchResults(matched);
        setShowDropdown(true);
      }
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, productsCache]);

  // 4. Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setShowDropdown(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const formatVnd = (num: number) => (!num || num <= 0 ? 'Liên hệ' : num.toLocaleString('vi-VN') + 'đ');

  return (
    <>
      <header className="w-full bg-white select-none relative z-40 border-b border-gray-100 shadow-xs">
        {/* SLOGAN */}
        <div className="w-full pt-2 sm:pt-3 pb-1 bg-white flex items-center justify-center px-3">
          <h1 className="text-xs sm:text-base md:text-2xl lg:text-[32px] font-black uppercase tracking-wider text-[#d70018] leading-tight text-center drop-shadow-xs truncate">
            THE BEST APPLE RETAIL STORE IN HCM
          </h1>
        </div>

        {/* HÀNG HEADER CHÍNH */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-gray-800 hover:text-[#d70018] hover:bg-red-50 transition-colors cursor-pointer"
              aria-label="Mở menu danh mục"
            >
              <MenuIcon size={22} />
            </button>

            <Link href="/" className="flex items-center">
              <img
                src="/logoFogo.png"
                alt="Fogo Store"
                className="h-10 sm:h-12 md:h-16 lg:h-18 w-auto object-contain transition-transform active:scale-95"
              />
            </Link>
          </div>

          {/* Thanh tìm kiếm PC */}
          <div ref={searchContainerRef} className="flex-1 max-w-lg relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim() && searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Bạn cần tìm gì hôm nay..."
                className="w-full pl-4 pr-16 py-2 lg:py-2.5 rounded-sm text-sm text-gray-900 bg-white border-2 border-[#d70018] outline-hidden placeholder-gray-400 focus:ring-1 focus:ring-[#d70018]"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#d70018] hover:scale-110 transition-transform cursor-pointer"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={2.5} />}
              </button>
            </form>

            {/* Dropdown gợi ý PC */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Gợi ý cho &quot;{searchTerm}&quot;</span>
                  <span>{searchResults.length} sản phẩm</span>
                </div>

                <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.slug}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 p-3 hover:bg-red-50/50 transition-colors group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0 bg-white shadow-2xs group-hover:scale-105 transition-transform">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] truncate transition-colors">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-[#d70018]">
                              {formatVnd(item.price)}
                            </span>
                            {item.categoryName && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                {item.categoryName}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-5 text-center text-xs text-gray-500">
                      Không tìm thấy sản phẩm nào khớp với &quot;<b className="text-gray-800">{searchTerm}</b>&quot;.
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-[11px] font-bold text-[#d70018] text-center border-t border-gray-100 transition-colors cursor-pointer"
                  >
                    Xem tất cả kết quả &rarr;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cụm tiện ích */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 text-xs md:text-sm font-semibold shrink-0">
            {/* Hotline */}
            <a
              href="tel:0566003333"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Hotline</span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">056.600.3333</span>
              </div>
            </a>

            {/* Giỏ hàng */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity cursor-pointer text-gray-700"
            >
              <div className="relative w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 lg:bg-transparent flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#d70018]" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-[#d70018] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalQuantity > 99 ? '99+' : totalQuantity}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Xem giỏ</span>
                <span className="text-[16px] font-black tracking-tight text-[#d70018]">
                  Giỏ hàng ({totalQuantity})
                </span>
              </div>
            </Link>

            {/* Tra cứu đơn hàng */}
            <Link
              href="/tra-cuu-don-hang"
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity py-1 shrink-0 text-[#d70018]"
            >
              <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[14px] text-gray-500 font-medium">Tra cứu</span>
                <span className="text-[16px] font-black text-[#d70018]">Đơn hàng</span>
              </div>
            </Link>

            {/* Tài khoản */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 sm:gap-2 py-1 cursor-pointer text-[#d70018] hover:opacity-80 transition-opacity"
                  aria-label="Thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight text-left">
                    <span className="text-[14px] text-gray-700 font-bold truncate max-w-[140px]">
                      {user.fullName || 'Tài khoản'}
                    </span>
                    <span className="text-[16px] font-black text-[#d70018]">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="pb-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Đang đăng nhập:</p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                          {user.fullName || 'Người dùng'}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-50 text-[#d70018] border border-red-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                        </span>
                      </div>

                      <div className="py-2 space-y-1">
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin/don-hang"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-[#d70018] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Shield size={15} />
                            <span>Trang Quản Trị</span>
                          </Link>
                        )}
                        <Link
                          href="/tra-cuu-don-hang"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <ClipboardList size={15} />
                          <span>Lịch sử đơn hàng</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity py-1 shrink-0 text-left text-[#d70018] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[14px] text-gray-500 font-medium">Đăng nhập</span>
                  <span className="text-[16px] font-black text-[#d70018]">Tài khoản</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Tìm kiếm Mobile */}
        <div className="block sm:hidden px-3 pb-2.5 pt-0.5 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim() && searchResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Bạn cần tìm gì hôm nay..."
              className="w-full pl-3 pr-14 py-1.5 rounded-sm text-xs text-gray-900 bg-white border border-[#d70018] outline-hidden placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 p-1 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#d70018] cursor-pointer"
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={15} strokeWidth={2.5} />}
            </button>
          </form>

          {showDropdown && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/san-pham/${item.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 p-2.5 hover:bg-red-50/50"
                    >
                      <div className="w-10 h-10 rounded border border-gray-100 p-0.5 flex items-center justify-center shrink-0 bg-white">
                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                        <span className="text-[11px] font-black text-[#d70018] block">{formatVnd(item.price)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">Không tìm thấy sản phẩm.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* DRAWER MENU MOBILE (ĐÃ ĐỒNG BỘ DỮ LIỆU & LỌC TRÙNG SERIES) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-[300px] sm:w-[340px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#d70018] text-white">
              <span className="font-extrabold text-base tracking-wide uppercase">Danh Mục Sản Phẩm</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {menuList.map((item) => {
                const isExpanded = expandedMenuId === item.id;
                
                // Lọc loại bỏ các nhóm/series trùng tên (ví dụ ngăn iPhone 15 Series lặp 2 lần)
                const rawGroups = item.groups || [];
                const uniqueGroups = rawGroups.filter(
                  (group, gIdx, self) =>
                    gIdx === self.findIndex((t) => t.groupTitle?.trim().toLowerCase() === group.groupTitle?.trim().toLowerCase())
                );
                const hasSub = uniqueGroups.length > 0;

                return (
                  <div key={item.id} className="py-1">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#d70018] transition-colors flex-1"
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="bg-[#d70018] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {hasSub && (
                        <button
                          type="button"
                          onClick={() => toggleSubMenu(item.id)}
                          className="p-1 text-gray-400 hover:text-[#d70018] cursor-pointer"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#d70018]' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSub && isExpanded && (
                      <div className="bg-gray-50 px-6 py-2 space-y-2 border-t border-gray-100">
                        {uniqueGroups.map((group, gIdx) => {
                          // Lọc bỏ sản phẩm trùng lặp trong từng group
                          const rawItems = group.items || [];
                          const uniqueItems = rawItems.filter(
                            (sub, sIdx, self) =>
                              sIdx === self.findIndex((t) => t.name?.trim().toLowerCase() === sub.name?.trim().toLowerCase())
                          );

                          return (
                            <div key={gIdx} className="py-1">
                              <Link
                                href={group.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-xs font-bold text-gray-700 hover:text-[#d70018] block"
                              >
                                {group.groupTitle}
                              </Link>

                              {uniqueItems.length > 0 && (
                                <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-red-200">
                                  {uniqueItems.map((sub, sIdx) => (
                                    <Link
                                      key={sIdx}
                                      href={sub.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="text-xs text-gray-500 hover:text-[#d70018] block py-0.5"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Tổng đài hỗ trợ:</p>
              <a href="tel:0566003333" className="text-[#d70018] font-bold text-sm block mt-0.5">
                056.600.3333 (Miễn phí)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal đăng nhập */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Header;