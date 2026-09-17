'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Dữ liệu danh mục chuẩn xác toàn hệ thống
const OFFICIAL_NAV_DATA = [
  {
    id: 'iphone',
    title: 'iPhone',
    badge: 'HOT',
    href: '/iphone',
    groups: [
      {
        groupTitle: 'iPhone 18 Series',
        href: '/iphone?series=18',
        items: [
          { name: 'iPhone 18 Pro Max', href: '/iphone?series=18', isNew: true },
          { name: 'iPhone 18 Pro', href: '/iphone?series=18', isNew: true },
          { name: 'iPhone 18 Plus', href: '/iphone?series=18' },
          { name: 'iPhone 18', href: '/iphone?series=18' },
        ],
      },
      {
        groupTitle: 'iPhone Duo Series',
        href: '/iphone?series=duo',
        items: [
          { name: 'iPhone Duo Fold', href: '/iphone?series=duo', isNew: true },
          { name: 'iPhone Duo Flip', href: '/iphone?series=duo', isNew: true },
        ],
      },
      {
        groupTitle: 'iPhone 17 Series',
        href: '/iphone?series=17',
        items: [
          { name: 'iPhone 17 Pro Max', href: '/iphone?series=17' },
          { name: 'iPhone 17 Pro', href: '/iphone?series=17' },
          { name: 'iPhone 17 Plus', href: '/iphone?series=17' },
          { name: 'iPhone 17 Slim / Air', href: '/iphone?series=17' },
          { name: 'iPhone 17', href: '/iphone?series=17' },
        ],
      },
      {
        groupTitle: 'iPhone 16 Series',
        href: '/iphone?series=16',
        items: [
          { name: 'iPhone 16 Pro Max', href: '/iphone?series=16' },
          { name: 'iPhone 16 Pro', href: '/iphone?series=16' },
          { name: 'iPhone 16 Plus', href: '/iphone?series=16' },
          { name: 'iPhone 16', href: '/iphone?series=16' },
        ],
      },
      {
        groupTitle: 'iPhone 15 Series',
        href: '/iphone?series=15',
        items: [
          { name: 'iPhone 15 Pro Max', href: '/iphone?series=15' },
          { name: 'iPhone 15 Pro', href: '/iphone?series=15' },
          { name: 'iPhone 15', href: '/iphone?series=15' },
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
        href: '/ipad?series=pro',
        items: [
          { name: 'iPad Pro M5', href: '/ipad?series=pro-m5', isNew: true },
          { name: 'iPad Pro M4', href: '/ipad?series=pro-m4' },
          { name: 'iPad Pro M2', href: '/ipad?series=pro-m2' },
        ],
      },
      {
        groupTitle: 'iPad Air',
        href: '/ipad?series=air',
        items: [
          { name: 'iPad Air 7 (M4)', href: '/ipad?series=air-7', isNew: true },
          { name: 'iPad Air 6 (M2)', href: '/ipad?series=air-6' },
          { name: 'iPad Air 5', href: '/ipad?series=air-5' },
        ],
      },
      {
        groupTitle: 'iPad Gen & Mini',
        href: '/ipad?series=gen',
        items: [
          { name: 'iPad Gen 11', href: '/ipad?series=gen-11' },
          { name: 'iPad Gen 10', href: '/ipad?series=gen-10' },
          { name: 'iPad Mini 7', href: '/ipad?series=mini-7' },
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
        href: '/macbook?series=pro',
        items: [
          { name: 'MacBook Pro M5', href: '/macbook?series=pro-m5', isNew: true },
          { name: 'MacBook Pro M4', href: '/macbook?series=pro-m4' },
          { name: 'MacBook Pro M3', href: '/macbook?series=pro-m3' },
        ],
      },
      {
        groupTitle: 'MacBook Air',
        href: '/macbook?series=air',
        items: [
          { name: 'MacBook Air M5', href: '/macbook?series=air-m5', isNew: true },
          { name: 'MacBook Air M4', href: '/macbook?series=air-m4' },
          { name: 'MacBook Air M3', href: '/macbook?series=air-m3' },
        ],
      },
      {
        groupTitle: 'MacBook Neo',
        href: '/macbook?series=neo',
        items: [
          { name: 'MacBook NEO (2026)', href: '/macbook?series=neo-2026', isNew: true },
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
        href: '/hang-cu/iphone-cu',
        items: [
          { name: 'iPhone 17 Series Cũ', href: '/hang-cu/iphone-17-series-cu' },
          { name: 'iPhone 16 Series Cũ', href: '/hang-cu/iphone-16-series-cu' },
          { name: 'iPhone 15 Series Cũ', href: '/hang-cu/iphone-15-series-cu' },
          { name: 'iPhone 14 Series Cũ', href: '/hang-cu/iphone-14-series-cu' },
        ],
      },
      {
        groupTitle: 'iPad & MacBook Cũ Zin',
        href: '/hang-cu/ipad-cu',
        items: [
          { name: 'iPad Pro Cũ 99%', href: '/hang-cu/ipad-pro-cu' },
          { name: 'iPad Air Cũ 99%', href: '/hang-cu/ipad-air-cu' },
          { name: 'MacBook Pro Cũ Zin', href: '/hang-cu/macbook-pro-cu' },
          { name: 'MacBook Air Cũ Zin', href: '/hang-cu/macbook-air-cu' },
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
        href: '/watch',
        items: [
          { name: 'Apple Watch Ultra 2', href: '/watch?series=ultra-2' },
          { name: 'Apple Watch Series 10', href: '/watch?series=series-10' },
          { name: 'Apple Watch Series 9', href: '/watch?series=series-9' },
          { name: 'Apple Watch SE 2', href: '/watch?series=se-2' },
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
        groupTitle: 'Phụ kiện Apple chính hãng',
        href: '/phu-kien',
        items: [
          { name: 'Củ Sạc Nhanh 20W / 35W', href: '/phu-kien?series=sac-cap' },
          { name: 'Cáp Sạc Type-C Chuẩn Apple', href: '/phu-kien?series=sac-cap' },
          { name: 'Tai Nghe AirPods 4 / Pro 2', href: '/phu-kien?series=tai-nghe' },
          { name: 'Apple Pencil Pro & Magic Keyboard', href: '/phu-kien?series=phu-kien-mac' },
        ],
      },
    ],
  },
];

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [navData, setNavData] = useState(OFFICIAL_NAV_DATA);

  useEffect(() => {
    setMounted(true);
    try {
      const cached = localStorage.getItem('fogo_menu_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNavData(parsed);
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc cache menu:', e);
    }

    const fetchNavbarData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/menu?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data) && data.length > 0) {
            setNavData(data);
            localStorage.setItem('fogo_menu_config', JSON.stringify(data));
          }
        }
      } catch (err) {
        // Giữ menu mặc định
      }
    };

    fetchNavbarData();
    const handleSync = () => fetchNavbarData();
    window.addEventListener('fogo_menu_updated', handleSync);
    return () => window.removeEventListener('fogo_menu_updated', handleSync);
  }, []);

  if (!mounted) {
    return <nav className="hidden lg:block bg-[#d70018] text-white h-12" />;
  }

  return (
    <nav className="hidden lg:block bg-[#d70018] text-white select-none relative z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {navData.map((item) => {
          const rawGroups = item.groups || [];
          // Khử trùng nhóm danh mục
          const uniqueGroups = rawGroups.filter(
            (group, gIdx, self) =>
              gIdx === self.findIndex((t) => t.groupTitle?.trim().toLowerCase() === group.groupTitle?.trim().toLowerCase())
          );

          return (
            <div key={item.id} className="relative group/level1 py-2.5">
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-base font-bold tracking-wide px-4 py-1.5 rounded hover:bg-black/15 transition-colors whitespace-nowrap"
              >
                <span>{item.title}</span>
                {item.badge && (
                  <span className="bg-white text-[#d70018] text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs scale-90">
                    {item.badge}
                  </span>
                )}
              </Link>

              {uniqueGroups.length > 0 && (
                <div className="hidden group-hover/level1:block absolute left-0 top-full w-64 bg-white text-gray-800 shadow-xl border border-gray-100 rounded-b-md z-50 py-2">
                  {uniqueGroups.map((group, gIdx) => {
                    const rawItems = group.items || [];
                    // Khử trùng sản phẩm con trong từng nhóm
                    const uniqueItems = rawItems.filter(
                      (sub, sIdx, self) =>
                        sIdx === self.findIndex((t) => t.name?.trim().toLowerCase() === sub.name?.trim().toLowerCase())
                    );

                    return (
                      <div key={gIdx} className="relative group/level2">
                        <Link
                          href={group.href}
                          className="flex items-center justify-between px-5 py-2.5 text-sm font-semibold text-gray-800 hover:text-[#d70018] hover:bg-red-50/70 transition-colors"
                        >
                          <span>{group.groupTitle}</span>
                          {uniqueItems.length > 0 && (
                            <ChevronRight size={15} className="text-gray-400 group-hover/level2:text-[#d70018]" />
                          )}
                        </Link>

                        {uniqueItems.length > 0 && (
                          <div className="hidden group-hover/level2:block absolute left-full top-0 -ml-1 pl-1 w-64 z-50">
                            <div className="bg-white text-gray-800 shadow-2xl border border-gray-100 rounded-r-md py-2">
                              {uniqueItems.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={sub.href}
                                  className="flex items-center justify-between px-5 py-2.5 text-sm text-gray-600 hover:text-[#d70018] hover:bg-red-50/70 transition-colors"
                                >
                                  <span>{sub.name}</span>
                                  {sub.isNew && (
                                    <span className="bg-[#d70018] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                      Mới
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
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
    </nav>
  );
};

export default Navbar;