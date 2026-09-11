'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_DATA } from '@/data/navigation';

export const Navbar: React.FC = () => {
  const [navData, setNavData] = useState(MENU_DATA);

  // Đồng bộ danh mục động từ cấu hình Admin mà không làm thay đổi giao diện
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_banners_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const adminSubIphones = parsed.filter(
            (it: any) => it.group === 'sub_iphone' && it.name.toLowerCase() !== 'tất cả'
          );
          const adminSubIpads = parsed.filter(
            (it: any) => it.group === 'sub_ipad' && it.name.toLowerCase() !== 'tất cả'
          );
          const adminSubMacbooks = parsed.filter(
            (it: any) => it.group === 'sub_macbook' && it.name.toLowerCase() !== 'tất cả'
          );

          // Cập nhật các menu cấp con dựa theo cấu hình Admin
          const updated = MENU_DATA.map((menuItem) => {
            const lowerHref = menuItem.href.toLowerCase();

            // 1. Đồng bộ Menu iPhone
            if (lowerHref.includes('iphone') && adminSubIphones.length > 0) {
              const dynamicGroups = adminSubIphones.map((sub: any) => {
                const numMatch = sub.name.match(/\d+/);
                const queryVal = numMatch ? numMatch[0] : sub.name.toLowerCase().replace(/\s+/g, '-');
                return {
                  groupTitle: sub.name,
                  href: `/iphone?series=${queryVal}`,
                  items: [
                    { name: `${sub.name} Pro Max`, href: `/iphone?series=${queryVal}-pro-max`, isNew: queryVal >= '16' },
                    { name: `${sub.name} Pro`, href: `/iphone?series=${queryVal}-pro` },
                    { name: `${sub.name} Plus`, href: `/iphone?series=${queryVal}-plus` },
                    { name: `${sub.name} Thường`, href: `/iphone?series=${queryVal}-thuong` },
                  ],
                };
              });
              return { ...menuItem, groups: dynamicGroups };
            }

            // 2. Đồng bộ Menu iPad
            if (lowerHref.includes('ipad') && adminSubIpads.length > 0) {
              const dynamicGroups = adminSubIpads.map((sub: any) => {
                const queryVal = sub.name.toLowerCase().replace(/ipad|\s/g, '');
                return {
                  groupTitle: sub.name,
                  href: `/ipad?series=${queryVal}`,
                  items: [
                    { name: `${sub.name} Wi-Fi`, href: `/ipad?series=${queryVal}&type=wifi` },
                    { name: `${sub.name} 5G (Cellular)`, href: `/ipad?series=${queryVal}&type=5g` },
                  ],
                };
              });
              return { ...menuItem, groups: dynamicGroups };
            }

            // 3. Đồng bộ Menu MacBook
            if (lowerHref.includes('macbook') && adminSubMacbooks.length > 0) {
              const dynamicGroups = adminSubMacbooks.map((sub: any) => {
                const queryVal = sub.name.toLowerCase().replace(/macbook|\s/g, '');
                return {
                  groupTitle: sub.name,
                  href: `/macbook?series=${queryVal}`,
                  items: [
                    { name: `${sub.name} 13-inch`, href: `/macbook?series=${queryVal}&size=13` },
                    { name: `${sub.name} 14-inch`, href: `/macbook?series=${queryVal}&size=14` },
                    { name: `${sub.name} 16-inch`, href: `/macbook?series=${queryVal}&size=16` },
                  ],
                };
              });
              return { ...menuItem, groups: dynamicGroups };
            }

            return menuItem;
          });

          setNavData(updated);
        }
      }
    } catch (e) {
      console.error('Lỗi nạp navigation động:', e);
    }
  }, []);

  return (
    <nav className="bg-[#d70018] text-white select-none relative z-30 shadow-md">
      {/* Dàn đều các mục bằng justify-between để menu trải đều cân đối */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {navData.map((item) => (
          /* CẤP 1: Chữ to hơn 2 size (text-base ~ 16px), padding lớn tạo độ thoáng */
          <div key={item.id} className="relative group/level1 py-2.5">
            <Link
              href={item.href}
              className="flex items-center gap-1.5 text-base font-bold tracking-wide px-4 py-1.5 rounded hover:bg-black/15 transition-colors whitespace-nowrap"
            >
              <span>{item.title}</span>
              {item.badge && (
                <span className="bg-white text-[#d70018] text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm scale-90">
                  {item.badge}
                </span>
              )}
            </Link>

            {/* CẤP 2: Menu dọc xổ xuống, chữ text-sm (14px) */}
            {item.groups && item.groups.length > 0 && (
              <div className="hidden group-hover/level1:block absolute left-0 top-full w-64 bg-white text-gray-800 shadow-xl border border-gray-100 rounded-b-md z-50 py-2">
                {item.groups.map((group, gIdx) => (
                  <div key={gIdx} className="relative group/level2">
                    <Link
                      href={group.href}
                      className="flex items-center justify-between px-5 py-2.5 text-sm font-semibold text-gray-800 hover:text-[#d70018] hover:bg-red-50/70 transition-colors"
                    >
                      <span>{group.groupTitle}</span>
                      {group.items && group.items.length > 0 && (
                        <ChevronRight size={15} className="text-gray-400 group-hover/level2:text-[#d70018]" />
                      )}
                    </Link>

                    {/* CẤP 3: Bảng con trỏ ngang từ trái qua phải, chữ text-sm (14px) */}
                    {group.items && group.items.length > 0 && (
                      <div className="hidden group-hover/level2:block absolute left-full top-0 -ml-1 pl-1 w-64 z-50">
                        <div className="bg-white text-gray-800 shadow-2xl border border-gray-100 rounded-r-md py-2">
                          {group.items.map((sub, sIdx) => (
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;