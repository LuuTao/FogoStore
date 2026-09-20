'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

// Dữ liệu danh mục: Đồng bộ hoàn toàn sang dạng query ?series= để trang danh mục lọc đúng sản phẩm
const OFFICIAL_NAV_DATA = [
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
  }, []);

  if (!mounted) {
    return <nav className="hidden lg:block bg-[#d70018] text-white h-12" />;
  }

  return (
    <nav className="hidden lg:block bg-[#d70018] text-white select-none relative z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {navData.map((item) => {
          const rawGroups = item.groups || [];
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
                    const uniqueItems = rawItems.filter(
                      (sub, sIdx, self) =>
                        sIdx === self.findIndex((t) => t.name?.trim().toLowerCase() === sub.name?.trim().toLowerCase())
                    );

                    return (
                      <div key={gIdx} className="relative group/level2">
                        <div className="flex items-center justify-between px-5 py-2.5 text-sm font-semibold text-gray-800 hover:text-[#d70018] hover:bg-red-50/70 transition-colors cursor-pointer">
                          <span>{group.groupTitle}</span>
                          {uniqueItems.length > 0 && (
                            <ChevronRight size={15} className="text-gray-400 group-hover/level2:text-[#d70018]" />
                          )}
                        </div>

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