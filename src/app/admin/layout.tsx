'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('fogo_user');
    if (!savedUser) {
      router.replace('/dang-nhap');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'ADMIN') {
        alert('Tài khoản của bạn không có quyền truy cập trang Quản Trị.');
        router.replace('/');
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace('/dang-nhap');
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6f8]">
        <Loader2 size={36} className="animate-spin text-[#d70018]" />
        <p className="text-sm text-gray-600 font-bold mt-3">Đang xác thực quyền Admin...</p>
      </div>
    );
  }

  return <>{children}</>;
}