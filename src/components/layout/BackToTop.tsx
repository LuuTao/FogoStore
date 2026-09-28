'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const BackToTop: React.FC = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={`fixed right-4 sm:right-6 bottom-[190px] sm:bottom-32 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#d70018] text-white shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-red-700 hover:scale-110 active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.75} />
    </button>
  );
};

export default BackToTop;
