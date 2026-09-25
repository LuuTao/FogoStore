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
  Crown,
  HeartHandshake,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const OFFICIAL_MENU_DATA = [
  {
    id: 'iphone',
    title: 'iPhone',
    badge: 'HOT',
    href: '/iphone',
    groups: [
      {
        groupTitle: 'iPhone 18 Series',
        href: '/iphone?series=iphone-18',
        items: [
          { name: 'iPhone 18 Pro Max', href: '/iphone?series=iphone-18-pro-max', isNew: true },
          { name: 'iPhone 18 Pro', href: '/iphone?series=iphone-18-pro', isNew: true },
          { name: 'iPhone 18 Plus', href: '/iphone?series=iphone-18-plus' },
          { name: 'iPhone 18', href: '/iphone?series=iphone-18' },
        ],
      },
      {
        groupTitle: 'iPhone Duo Series',
        href: '/iphone?series=iphone-duo',
        items: [
          { name: 'iPhone Duo', href: '/iphone?series=iphone-duo', isNew: true },
        ],
      },
      {
        groupTitle: 'iPhone 17 Series',
        href: '/iphone?series=iphone-17',
        items: [
          { name: 'iPhone 17 Pro Max', href: '/iphone?series=iphone-17-pro-max' },
          { name: 'iPhone 17 Pro', href: '/iphone?series=iphone-17-pro' },
          { name: 'iPhone 17 Plus', href: '/iphone?series=iphone-17-plus' },
          { name: 'iPhone 17 Air', href: '/iphone?series=iphone-17-air' },
          { name: 'iPhone 17', href: '/iphone?series=iphone-17' },
        ],
      },
      {
        groupTitle: 'iPhone 16 Series',
        href: '/iphone?series=iphone-16',
        items: [
          { name: 'iPhone 16 Pro Max', href: '/iphone?series=iphone-16-pro-max' },
          { name: 'iPhone 16 Pro', href: '/iphone?series=iphone-16-pro' },
          { name: 'iPhone 16 Plus', href: '/iphone?series=iphone-16-plus' },
          { name: 'iPhone 16', href: '/iphone?series=iphone-16' },
        ],
      },
      {
        groupTitle: 'iPhone 15 Series',
        href: '/iphone?series=iphone-15',
        items: [
          { name: 'iPhone 15 Pro Max', href: '/iphone?series=iphone-15-pro-max' },
          { name: 'iPhone 15 Pro', href: '/iphone?series=iphone-15-pro' },
          { name: 'iPhone 15 Plus', href: '/iphone?series=iphone-15-plus' },
          { name: 'iPhone 15', href: '/iphone?series=iphone-15' },
        ],
      },
    ],
  },
  {
    id: 'ipad',
    title: 'iPad',
    badge: 'NEW',
    href: '/ipad',
    groups: [
      {
        groupTitle: 'iPad Pro',
        href: '/ipad?series=ipad-pro',
        items: [
          { name: 'iPad Pro M5', href: '/ipad?series=ipad-pro-m5', isNew: true },
          { name: 'iPad Pro M4', href: '/ipad?series=ipad-pro-m4' },
          { name: 'iPad Pro M2', href: '/ipad?series=ipad-pro-m2' },
        ],
      },
      {
        groupTitle: 'iPad Air',
        href: '/ipad?series=ipad-air',
        items: [
          { name: 'iPad Air 7 (M4)', href: '/ipad?series=ipad-air-7', isNew: true },
          { name: 'iPad Air 6 (M2)', href: '/ipad?series=ipad-air-6' },
          { name: 'iPad Air 5', href: '/ipad?series=ipad-air-5' },
        ],
      },
      {
        groupTitle: 'iPad Gen',
        href: '/ipad?series=ipad-gen',
        items: [
          { name: 'iPad Gen 11', href: '/ipad?series=ipad-gen-11' },
          { name: 'iPad Gen 10', href: '/ipad?series=ipad-gen-10' },
        ],
      },
      {
        groupTitle: 'iPad Mini',
        href: '/ipad?series=ipad-mini',
        items: [
          { name: 'iPad Mini 7', href: '/ipad?series=ipad-mini-7' },
        ],
      },
    ],
  },
  {
    id: 'macbook',
    title: 'MacBook',
    badge: 'NEW',
    href: '/macbook',
    groups: [
      {
        groupTitle: 'MacBook Pro',
        href: '/macbook?series=macbook-pro',
        items: [
          { name: 'MacBook Pro M5', href: '/macbook?series=macbook-pro-m5' },
          { name: 'MacBook Pro M4', href: '/macbook?series=macbook-pro-m4' },
          { name: 'MacBook Pro M3', href: '/macbook?series=macbook-pro-m3' },
          { name: 'MacBook Pro M2', href: '/macbook?series=macbook-pro-m2' },
          { name: 'MacBook Pro M1', href: '/macbook?series=macbook-pro-m1' },
        ],
      },
      {
        groupTitle: 'MacBook Air',
        href: '/macbook?series=macbook-air',
        items: [
          { name: 'MacBook Air M5', href: '/macbook?series=macbook-air-m5' },
          { name: 'MacBook Air M4', href: '/macbook?series=macbook-air-m4' },
          { name: 'MacBook Air M3', href: '/macbook?series=macbook-air-m3' },
          { name: 'MacBook Air M2', href: '/macbook?series=macbook-air-m2' },
          { name: 'MacBook Air M1', href: '/macbook?series=macbook-air-m1' },
        ],
      },
    ],
  },
  {
    id: 'hang-cu',
    title: 'Hàng Cũ',
    href: '/hang-cu',
    groups: [
      {
        groupTitle: 'iPhone Cũ Like New 99%',
        href: '/hang-cu?series=iphone-cu',
        items: [
          { name: 'iPhone 17 Series Cũ', href: '/hang-cu?series=iphone-17-cu' },
          { name: 'iPhone 16 Series Cũ', href: '/hang-cu?series=iphone-16-cu' },
          { name: 'iPhone 15 Series Cũ', href: '/hang-cu?series=iphone-15-cu' },
        ],
      },
    ],
  },
  {
    id: 'watch',
    title: 'Watch',
    href: '/watch',
    groups: [
      {
        groupTitle: 'Dòng Apple Watch',
        href: '/watch?series=watch',
        items: [
          { name: 'Apple Watch Ultra 2', href: '/watch?series=apple-watch-ultra-2' },
          { name: 'Apple Watch Series 10', href: '/watch?series=apple-watch-series-10' },
        ],
      },
    ],
  },
  {
    id: 'phu-kien',
    title: 'Phụ Kiện',
    href: '/phu-kien',
    groups: [
      {
        groupTitle: 'Phụ kiện chính hãng Apple',
        href: '/phu-kien?series=phu-kien',
        items: [
          { name: 'Củ Sạc Nhanh 20W / 35W', href: '/phu-kien?series=cu-sac' },
          { name: 'Tai Nghe AirPods', href: '/phu-kien?series=airpods' },
        ],
      },
    ],
  },
];

interface SearchItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  categoryName?: string;
  isUsed?: boolean;
}

const formatSearchImage = (url?: string | null): string => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  return `${API_URL}/${url}`;
};

export const Header: React.FC = () => {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>('iphone');

  const [menuList, setMenuList] = useState(OFFICIAL_MENU_DATA);

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

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/menu?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data) && data.length > 0) {
            setMenuList(data);
          }
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchMenuData();
  }, []);

  // Nạp toàn bộ danh mục sản phẩm (kèm tất cả các biến thể) vào Cache
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?all=true&limit=all`);
        if (!res.ok) return;
        const json = await res.json();

        let list: any[] = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (Array.isArray(json.data)) {
          list = json.data;
        } else if (json.data && Array.isArray(json.data.products)) {
          list = json.data.products;
        } else if (Array.isArray(json.products)) {
          list = json.products;
        }

        if (list.length > 0) {
          setProductsCache(list);
        }
      } catch (e) {
        console.error('Lỗi nạp sản phẩm tìm kiếm:', e);
      }
    };
    loadProducts();
  }, []);

  // LOGIC TÌM KIẾM THÔNG MINH: BẮT BUỘC KHỚP TỪ KHÓA, BUNG BIẾN THỂ, ƯU TIÊN MÔ ĐEN MỚI NHẤT
  useEffect(() => {
    const rawQuery = searchTerm.trim().toLowerCase();
    if (!rawQuery) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      const processProducts = (rawList: any[]): SearchItem[] => {
        const queryKeywords = rawQuery.split(/\s+/).filter(Boolean);
        const flattenedList: any[] = [];

        rawList.forEach((product: any) => {
          if (!product || !product.name) return;

          const variants =
            Array.isArray(product.variants) && product.variants.length > 0
              ? product.variants
              : [{ price: product.price || 0, images: product.images }];

          variants.forEach((v: any, vIdx: number) => {
            const price = Number(v.price !== undefined ? v.price : (product.price || 0));

            // Chỉ lấy các cấu hình có giá bán thực tế (> 0đ)
            if (price <= 0) return;

            // Xây dựng nhãn hiển thị biến thể (dung lượng, màu sắc)[cite: 7]
            const extraTags: string[] = [];
            if (v.storage && !product.name.toLowerCase().includes(v.storage.toLowerCase())) {
              extraTags.push(v.storage);
            }
            if (v.color && !product.name.toLowerCase().includes(v.color.toLowerCase())) {
              extraTags.push(v.color);
            }

            const fullName =
              extraTags.length > 0
                ? `${product.name} (${extraTags.join(' - ')})`
                : product.name;

            // Xử lý ảnh biến thể
            let rawImg = '';
            if (Array.isArray(v.images) && v.images.length > 0) {
              rawImg = v.images[0];
            } else if (typeof v.images === 'string') {
              try {
                const parsed = JSON.parse(v.images);
                rawImg = Array.isArray(parsed) ? parsed[0] : parsed;
              } catch {
                rawImg = v.images;
              }
            } else {
              rawImg = v.imageUrl || product.imageUrl || product.thumbnail || '/placeholder.png';
            }

            const searchString = `${product.name} ${fullName} ${v.storage || ''} ${v.color || ''} ${product.category?.name || ''} ${product.slug || ''} ${v.slug || ''}`.toLowerCase();

            const isUsed =
              searchString.includes('cũ') ||
              searchString.includes('like new') ||
              searchString.includes('99%') ||
              searchString.includes('cu');

            // HỆ THỐNG TÍNH ĐIỂM ƯU TIÊN THẾ HỆ FLAGSHIP MỚI NHẤT
            let priorityScore = 0;

            // Đời cao nhất (+100 điểm)
            if (
              searchString.includes('18') ||
              searchString.includes('duo') ||
              searchString.includes('m5')
            ) {
              priorityScore += 100;
            }
            // Đời cận cao (+80 điểm)
            else if (
              searchString.includes('17') ||
              searchString.includes('m4') ||
              searchString.includes('air 7')
            ) {
              priorityScore += 80;
            }
            // Đời tiếp theo (+50 điểm)
            else if (searchString.includes('16') || searchString.includes('m3')) {
              priorityScore += 50;
            }

            // Hàng Mới được ưu tiên hơn Hàng Cũ (+50 điểm)
            if (!isUsed) {
              priorityScore += 50;
            }

            // Trùng khớp từ khóa trong tên được cộng thêm điểm
            queryKeywords.forEach((kw) => {
              if (searchString.includes(kw)) priorityScore += 30;
            });

            flattenedList.push({
              id: `${product.id}-${v.id || vIdx}`,
              name: fullName,
              slug: v.slug || product.slug || product.id,
              price,
              imageUrl: formatSearchImage(rawImg),
              categoryName: product.category?.name || product.categoryName,
              createdAt: product.createdAt ? new Date(product.createdAt).getTime() : 0,
              isUsed,
              priorityScore,
              searchString,
            });
          });
        });

        // BẮT BUỘC KHỚP TẤT CẢ TỪ KHÓA (Ví dụ: "17" phải có "17", "m5" phải có "m5")[cite: 8, 9]
        const matched = flattenedList.filter((item) =>
          queryKeywords.every((kw) => item.searchString.includes(kw))
        );

        // Khử trùng lặp tên hiển thị
        const uniqueMatches = matched.filter(
          (item, idx, self) =>
            idx === self.findIndex((t) => t.name?.trim().toLowerCase() === item.name?.trim().toLowerCase())
        );

        // Sắp xếp: Ưu tiên điểm thế hệ cao nhất lên đầu bảng, hàng Mới trước, cùng điểm thì xếp theo ngày tạo
        uniqueMatches.sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) {
            return b.priorityScore - a.priorityScore;
          }
          return b.createdAt - a.createdAt;
        });

        return uniqueMatches.slice(0, 10);
      };

      if (productsCache.length > 0) {
        const matched = processProducts(productsCache);
        setSearchResults(matched);
        setShowDropdown(true);
        setIsSearching(false);
      } else {
        try {
          const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(rawQuery)}&all=true`);
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
            const matched = processProducts(list);
            setSearchResults(matched);
            setShowDropdown(true);
          }
        } catch (e) {
          // ignore
        } finally {
          setIsSearching(false);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm, productsCache]);

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
        <div className="w-full pt-2 sm:pt-3 pb-1 bg-white flex items-center justify-center px-3">
          <h1 className="text-xs sm:text-base md:text-2xl lg:text-[32px] font-black uppercase tracking-wider text-[#d70018] leading-tight text-center drop-shadow-xs truncate">
            THE BEST APPLE RETAIL STORE IN HCM
          </h1>
        </div>

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

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Gợi ý cho &quot;{searchTerm}&quot;</span>
                  <span>{searchResults.length} lựa chọn</span>
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
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
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-gray-800 group-hover:text-[#d70018] truncate transition-colors">
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-[#d70018]">
                              {formatVnd(item.price)}
                            </span>
                            {item.categoryName && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  item.isUsed
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {item.categoryName}
                              </span>
                            )}
                            {!item.isUsed && (
                              <span className="text-[9px] bg-red-50 text-[#d70018] font-bold px-1 py-0.5 rounded">
                                MỚI
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

          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 text-xs md:text-sm font-semibold shrink-0">
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

            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1 cursor-pointer text-[#d70018] hover:opacity-80 transition-opacity"
                  aria-label="Thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-full lg:rounded-sm bg-[#d70018]/10 flex items-center justify-center text-[#d70018]">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight text-left">
                    <span className="text-[14px] text-gray-700 font-bold truncate max-w-[140px]">
                      {user.fullName || 'Tài khoản'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-black text-[#d70018]">
                        {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                      </span>

                      {user.role !== 'ADMIN' && user.rank === 'VIP' && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-xs tracking-wider animate-pulse">
                          <Crown size={10} strokeWidth={3} />
                          VIP
                        </span>
                      )}

                      {user.role !== 'ADMIN' && user.rank === 'LOYAL' && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-600 text-white shadow-xs">
                          <HeartHandshake size={10} strokeWidth={2.5} />
                          Thân Thiết
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="pb-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Đang đăng nhập:</p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                          {user.fullName || 'Người dùng'}
                        </p>

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span
                            className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-sm ${
                              user.role === 'ADMIN'
                                ? 'bg-red-50 text-[#d70018] border border-red-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                          </span>

                          {user.role !== 'ADMIN' && user.rank === 'VIP' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-white shadow-xs tracking-wider">
                              <Crown size={11} strokeWidth={3} />
                              VIP
                            </span>
                          )}

                          {user.role !== 'ADMIN' && user.rank === 'LOYAL' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-blue-600 text-white shadow-xs">
                              <HeartHandshake size={11} strokeWidth={2.5} />
                              THÂN THIẾT
                            </span>
                          )}
                        </div>

                        {user.role !== 'ADMIN' && (
                          <p className="text-[11px] text-gray-500 mt-2 font-medium">
                            Đã mua thành công: <b className="text-gray-800">{user.totalItemsPurchased || 0}</b> món
                          </p>
                        )}
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
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-black text-[#d70018] block">{formatVnd(item.price)}</span>
                          {!item.isUsed && (
                            <span className="text-[9px] bg-red-50 text-[#d70018] font-bold px-1 py-0.5 rounded">
                              MỚI
                            </span>
                          )}
                        </div>
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

      {/* DRAWER MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-[310px] sm:w-[350px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#d70018] text-white shadow-xs">
              <span className="font-extrabold text-[17px] tracking-wide uppercase">Danh Mục Sản Phẩm</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {menuList.map((item) => {
                const isExpanded = expandedMenuId === item.id;
                const rawGroups = item.groups || [];
                const uniqueGroups = rawGroups.filter(
                  (group, gIdx, self) =>
                    gIdx === self.findIndex((t) => t.groupTitle?.trim().toLowerCase() === group.groupTitle?.trim().toLowerCase())
                );
                const hasSub = uniqueGroups.length > 0;

                return (
                  <div key={item.id} className="py-0.5">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-[15px] font-bold text-gray-800 hover:text-[#d70018] transition-colors flex-1"
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="bg-[#d70018] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
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
                            size={19}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#d70018]' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSub && isExpanded && (
                      <div className="bg-[#fafafb] px-5 py-3 space-y-4 border-t border-gray-100/80">
                        {uniqueGroups.map((group, gIdx) => {
                          const rawItems = group.items || [];
                          const uniqueItems = rawItems.filter(
                            (sub, sIdx, self) =>
                              sIdx === self.findIndex((t) => t.name?.trim().toLowerCase() === sub.name?.trim().toLowerCase())
                          );

                          return (
                            <div key={gIdx} className="space-y-2">
                              <Link
                                href={group.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block font-black text-gray-900 text-[13.5px] uppercase tracking-wide hover:text-[#d70018]"
                              >
                                {group.groupTitle}
                              </Link>

                              {uniqueItems.length > 0 && (
                                <div className="space-y-1.5 pl-3 border-l-2 border-red-300">
                                  {uniqueItems.map((sub, sIdx) => (
                                    <Link
                                      key={sIdx}
                                      href={sub.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="block py-1 text-gray-700 hover:text-[#d70018] font-medium text-[13px] transition-colors"
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

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Header;