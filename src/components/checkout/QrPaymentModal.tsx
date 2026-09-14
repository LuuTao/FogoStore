'use client';

import React from 'react';
import { X, QrCode, CheckCircle2, ShieldCheck, Copy } from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

// 🟢 ĐIỀN THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA BẠN TẠI ĐÂY
const BANK_CONFIG = {
  BANK_ID: 'MB', // Mã ngân hàng: MB, VCB, TCB, ACB, TPB, VPB, CTG (Vietinbank), BIDV,...
  ACCOUNT_NO: '0000246759502', // 👈 Số tài khoản của bạn
  ACCOUNT_NAME: 'LUU VAN TAO', // 👈 Tên chủ tài khoản (VIẾT HOA KHÔNG DẤU)
  TEMPLATE: 'compact2', // Giao diện QR: 'compact2', 'qr_only', 'print'
};

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  orderCode,
  totalAmount,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  // Link VietQR tự động điền sẵn STK, Số tiền và Nội dung là mã đơn hàng
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(
    BANK_CONFIG.ACCOUNT_NAME
  )}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép: ${text}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative border border-gray-100">
        
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-[#d70018] rounded-full flex items-center justify-center mx-auto">
            <QrCode size={26} />
          </div>

          <div>
            <h3 className="text-base font-black text-gray-900">Quét mã QR thanh toán</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mở app Ngân hàng hoặc Ví điện tử để quét mã tự động
            </p>
          </div>

          {/* Vùng hiển thị mã QR */}
          <div className="p-3 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/20 flex justify-center items-center">
            <img
              src={qrUrl}
              alt="Mã QR Thanh Toán"
              className="w-56 h-auto object-contain rounded-xl shadow-xs"
            />
          </div>

          {/* Chi tiết thông tin chuyển khoản */}
          <div className="bg-gray-50 rounded-xl p-3.5 text-left text-xs space-y-2 border border-gray-200">
            <div className="flex justify-between items-center text-gray-600">
              <span>Ngân hàng:</span>
              <span className="font-bold text-gray-900">{BANK_CONFIG.BANK_ID} Bank</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span>Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-gray-900 font-mono text-[13px]">
                  {BANK_CONFIG.ACCOUNT_NO}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_CONFIG.ACCOUNT_NO)}
                  className="text-gray-400 hover:text-gray-700"
                  title="Sao chép STK"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span>Chủ tài khoản:</span>
              <span className="font-bold text-gray-900 uppercase">
                {BANK_CONFIG.ACCOUNT_NAME}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-600 border-t border-gray-200 pt-2">
              <span>Mã đơn hàng:</span>
              <span className="font-mono font-bold text-gray-900">{orderCode}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span>Số tiền:</span>
              <span className="font-black text-[#d70018] text-sm">
                {totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span>Nội dung CK:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[#d70018] font-mono">
                  {orderCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(orderCode)}
                  className="text-gray-400 hover:text-gray-700"
                  title="Sao chép nội dung CK"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Nút xác nhận thanh toán */}
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>TÔI ĐÃ THANH TOÁN THÀNH CÔNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};