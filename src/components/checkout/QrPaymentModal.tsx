'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Cấu hình thông tin tài khoản thụ hưởng MB Bank của cửa hàng
const BANK_CONFIG = {
  BANK_ID: 'MB',
  ACCOUNT_NO: '0000246759502',
  ACCOUNT_NAME: 'LUU VAN TAO',
  TEMPLATE: 'compact2',
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  orderCode,
  totalAmount,
  onClose,
  onSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // Đếm ngược 10 phút (600 giây)

  // Cú pháp nội dung chuyển khoản chuẩn hóa cho hệ thống tự động gạch nợ
  const transferContent = orderCode.trim();

  // Tạo URL mã VietQR tự động theo chuẩn NAPAS 24/7
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Đếm ngược thời gian phiên giao dịch
  useEffect(() => {
    if (!isOpen || isPaid) return;
    setTimeLeft(600);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaid]);

  // Polling tự động kiểm tra trạng thái thanh toán từ backend mỗi 3 giây
  useEffect(() => {
    if (!isOpen || !orderCode || isPaid) return;

    const checkStatusInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderCode}/status?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (
            json.success &&
            (json.data?.paymentStatus === 'PAID' ||
              json.data?.status === 'CONFIRMED' ||
              json.data?.status === 'PROCESSING')
          ) {
            setIsPaid(true);
            clearInterval(checkStatusInterval);
            setTimeout(() => {
              onSuccess();
            }, 1600);
          }
        }
      } catch {
        // Bỏ qua lỗi kết nối mạng tạm thời để duy trì polling
      }
    }, 3000);

    return () => clearInterval(checkStatusInterval);
  }, [isOpen, orderCode, isPaid, onSuccess]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-center">
          {isPaid ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base font-black text-gray-900">ĐÃ NHẬN THANH TOÁN THÀNH CÔNG!</h3>
              <p className="text-gray-500 text-xs">
                Hệ thống đang chuẩn bị đơn hàng và chuyển hướng ngay...
              </p>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 bg-red-50 text-[#d70018] rounded-full flex items-center justify-center mx-auto">
                <QrCode size={24} />
              </div>

              <div>
                <h3 className="text-base font-black text-gray-900">Quét mã QR thanh toán</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã tự động
                </p>
              </div>

              {/* Thông báo thời gian phiên */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between text-amber-900 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  <span>Mã QR có hiệu lực trong:</span>
                </div>
                <span className="font-mono font-black text-[#d70018] text-sm">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Vùng hiển thị mã QR */}
              <div className="p-3 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/20 flex flex-col justify-center items-center">
                <div className="bg-white p-2 rounded-xl shadow-2xs border border-gray-200 w-52 h-52 flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt="Mã QR Thanh Toán"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-gray-500 mt-2">
                  <Loader2 size={12} className="animate-spin text-[#d70018]" />
                  <span>Hệ thống tự động xác nhận sau khi nhận tiền</span>
                </div>
              </div>

              {/* Chi tiết thông tin chuyển khoản */}
              <div className="bg-gray-50 rounded-xl p-3 text-left text-xs space-y-1.5 border border-gray-200">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Ngân hàng thụ hưởng:</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <Building2 size={13} className="text-gray-500" />
                    <span>{BANK_CONFIG.BANK_ID} Bank</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {BANK_CONFIG.ACCOUNT_NAME}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-gray-900 font-mono text-[13px]">
                      {BANK_CONFIG.ACCOUNT_NO}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_CONFIG.ACCOUNT_NO, 'stk')}
                      className="p-1 text-gray-400 hover:text-[#d70018] cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'stk' ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-1.5">
                  <span>Số tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#d70018] text-sm">
                      {totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(totalAmount), 'amount')}
                      className="p-1 text-gray-400 hover:text-[#d70018] cursor-pointer"
                      title="Sao chép số tiền"
                    >
                      {copiedField === 'amount' ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-600 bg-red-50/70 p-2 rounded-md border border-red-100">
                  <span className="text-gray-700 font-medium">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-[#d70018] text-xs uppercase">
                      {transferContent}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'content')}
                      className="p-1 text-[#d70018] hover:scale-110 transition-transform cursor-pointer"
                      title="Sao chép nội dung chuyển khoản"
                    >
                      {copiedField === 'content' ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút hoàn tất thủ công khi đã gửi tiền */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onSuccess}
                  className="w-full py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <CheckCircle2 size={16} />
                  <span>TÔI ĐÃ CHUYỂN KHOẢN XONG</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>Giao dịch bảo mật chuẩn mã hoá Napas 247</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrPaymentModal;