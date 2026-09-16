'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_DATA } from '@/data/navigation';

const API_URL = 'https://fogo-store-api.onrender.com';

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [navData, setNavData] = useState(MENU_DATA);

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
        // Giữ nguyên menu dự phòng nếu lỗi mạng hoặc cold start
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