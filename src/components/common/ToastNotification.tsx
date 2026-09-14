'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastProps> = ({
  show,
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '20px',
        zIndex: 9999999,
      }}
      className="animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div
        className={`flex items-start sm:items-center gap-3 text-white px-5 py-3.5 rounded-sm shadow-2xl min-w-[320px] max-w-[460px] border ${
          isSuccess
            ? 'bg-[#00a859] border-emerald-400'
            : 'bg-[#d70018] border-red-400'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={24} className="text-white shrink-0 mt-0.5 sm:mt-0" />
        ) : (
          <AlertCircle size={24} className="text-white shrink-0 mt-0.5 sm:mt-0" />
        )}

        <div className="flex-1 text-xs sm:text-sm font-semibold tracking-normal leading-snug break-words">
          {message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1 cursor-pointer hover:bg-white/10 rounded ml-2 shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};