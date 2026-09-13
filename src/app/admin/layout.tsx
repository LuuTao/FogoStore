'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fogo_user');
      if (!savedUser) {
        setAuthorized(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.role === 'ADMIN') {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch {
      setAuthorized(false);
    }
  }, []);

  if (authorized === null) {
    return <div className="min-h-screen bg-white" />;
  }

  // Giao diện căn giữa tuyệt đối, chữ to đậm chuẩn 404
  if (!authorized) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center text-center px-4 select-none">
        {/* Số 404 siêu to */}
        <h1 className="text-8xl sm:text-9xl font-black text-[#d70018] tracking-widest drop-shadow-sm leading-none">
          404
        </h1>

        {/* Dòng thông báo chính chữ to đậm */}
        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mt-6 uppercase tracking-wide">
          Trang tìm kiếm không tồn tại
        </h2>

        {/* Dòng mô tả phụ */}
        <p className="text-base sm:text-lg text-gray-500 font-medium mt-3 max-w-lg leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại! Vui lòng quay lại trang chủ.
        </p>

        {/* Nút Quay về trang chủ to rõ ràng ở giữa */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#d70018] hover:bg-red-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <Home size={22} />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}