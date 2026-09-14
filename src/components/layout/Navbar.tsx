'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_DATA } from '@/data/navigation';

export const Navbar: React.FC = () => {
  const [navData, setNavData] = useState(MENU_DATA);

  // Đồng bộ cấu hình menu chuẩn trực tiếp từ Admin (fogo_menu_config)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fogo_menu_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNavData(parsed);
        }
      }
    } catch (e) {
      console.error('Lỗi nạp navigation động từ Admin:', e);
    }
  }, []);

  return (
    <nav className="hidden lg:block bg-[#d70018] text-white select-none relative z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {navData.map((item) => (
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

            {/* Menu cấp 2 & cấp 3 */}
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