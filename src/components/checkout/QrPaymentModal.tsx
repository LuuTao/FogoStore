'use client';

import React from 'react';
import { QrCode, CheckCircle, X } from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function QrPaymentModal({
  isOpen,
  orderCode,
  totalAmount,
  onClose,
  onSuccess,
}: QrPaymentModalProps) {
  if (!isOpen) return null;

  // Sử dụng VietQR API công khai để tự động render mã QR có sẵn STK, số tiền và mã đơn
  const bankId = 'MB'; // Tên ngân hàng (MB, VCB, ACB, TPB...)
  const accountNumber = '0987654321'; // STK người nhận tiền của shop
  const accountName = 'FOGO STORE';
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
        >
          <X size={18} />
        </button>

        <div className="inline-flex p-3 bg-red-50 text-[#d70018] rounded-full mb-3">
          <QrCode size={24} />
        </div>

        <h3 className="text-base font-black text-gray-900">Quét mã QR thanh toán</h3>
        <p className="text-xs text-gray-500 mt-1">
          Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã
        </p>

        {/* Khung chứa ảnh QR */}
        <div className="my-4 p-2 border-2 border-dashed border-red-200 rounded-lg bg-gray-50 flex justify-center">
          <img src={qrUrl} alt="VietQR Payment" className="w-56 h-56 object-contain" />
        </div>

        <div className="text-xs space-y-1 bg-gray-50 p-3 rounded text-left mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <strong className="text-gray-900">{orderCode}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền:</span>
            <strong className="text-[#d70018] font-black">
              {totalAmount.toLocaleString('vi-VN')}đ
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nội dung CK:</span>
            <strong className="text-gray-900">{orderCode}</strong>
          </div>
        </div>

        <button
          onClick={onSuccess}
          className="w-full bg-[#d70018] hover:bg-[#b50014] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle size={16} />
          <span>Tôi đã thanh toán thành công</span>
        </button>
      </div>
    </div>
  );
}