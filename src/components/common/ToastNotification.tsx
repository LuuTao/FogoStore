'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ show, message, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: '20px',
        transform: 'translateY(3px)', // DÙNG TRANSFORM ĐỂ ÉP TRÌNH DUYỆT ĐẨY XUỐNG DƯỚI MENU
        zIndex: 9999999,
      }}
    >
      <div className="flex items-center gap-3 bg-[#00a859] text-white px-5 py-3.5 rounded-sm shadow-2xl border border-emerald-400 min-w-[360px]">
        <CheckCircle2 size={26} className="text-white shrink-0" />
        <span className="text-base font-bold tracking-normal leading-snug flex-1">
          {message}
        </span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1 cursor-pointer hover:bg-white/10 rounded ml-2"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};