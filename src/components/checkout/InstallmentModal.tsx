'use client';

import React, { useState, useMemo } from 'react';
import { X, Info, ShieldCheck, ChevronRight, Check } from 'lucide-react';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  productPrice: number;
  initialQuantity?: number;
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  productName,
  productImage,
  productPrice,
  initialQuantity = 1,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [qty, setQty] = useState<number>(initialQuantity);
  const [selectedProvider, setSelectedProvider] = useState<'home' | 'kredivo'>('home');

  // Tổng tiền đơn hàng
  const totalAmount = useMemo(() => productPrice * qty, [productPrice, qty]);

  // Số tiền trả sau (mặc định lấy 70% tổng tiền hoặc tối đa)
  const [deferredAmount, setDeferredAmount] = useState<number>(Math.round(totalAmount * 0.7));
  const [selectedTenure, setSelectedTenure] = useState<number>(3); // 1, 3, 6, 12 tháng

  // Đồng bộ lại khi tổng tiền thay đổi
  React.useEffect(() => {
    setDeferredAmount(Math.min(deferredAmount, totalAmount));
  }, [totalAmount]);

  // Tiền trả trước
  const prepaidAmount = Math.max(0, totalAmount - deferredAmount);

  // Số tiền mỗi tháng theo kỳ hạn
  const monthlyPayment = useMemo(() => {
    if (!selectedTenure || selectedTenure === 0) return 0;
    return Math.round(deferredAmount / selectedTenure);
  }, [deferredAmount, selectedTenure]);

  const formatVnd = (num: number) => (num || 0).toLocaleString('vi-VN') + ' đ';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-[#edf2f7] rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* HEADER: THANH TIẾN TRÌNH 4 BƯỚC NỀN XANH */}
        <div className="bg-[#02688b] text-white px-6 py-4 flex items-center justify-between relative shrink-0">
          <div className="flex items-center justify-center w-full max-w-2xl mx-auto gap-4 sm:gap-8 text-xs font-semibold">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-white text-[#02688b] font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <span className="text-[11px] font-bold whitespace-nowrap">Chọn gói trả góp</span>
            </div>

            <div className="w-8 sm:w-12 h-[1px] bg-white/40 -mt-4" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 opacity-70">
              <span className="w-5 h-5 rounded-full border border-white text-white font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <span className="text-[11px] whitespace-nowrap">Điền thông tin</span>
            </div>

            <div className="w-8 sm:w-12 h-[1px] bg-white/40 -mt-4 hidden sm:block" />

            {/* Step 3 */}
            <div className="hidden sm:flex flex-col items-center gap-1 opacity-70">
              <span className="w-5 h-5 rounded-full border border-white text-white font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <span className="text-[11px] whitespace-nowrap">Trả sau cùng CTTC</span>
            </div>

            <div className="w-8 sm:w-12 h-[1px] bg-white/40 -mt-4 hidden sm:block" />

            {/* Step 4 */}
            <div className="hidden sm:flex flex-col items-center gap-1 opacity-70">
              <span className="w-5 h-5 rounded-full border border-white text-white font-bold text-[11px] flex items-center justify-center">
                4
              </span>
              <span className="text-[11px] whitespace-nowrap">Hoàn tất thanh toán</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY CUỘN */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* KHỐI 1: THÔNG TIN SẢN PHẨM & SỐ LƯỢNG */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                <img src={productImage} alt={productName} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate leading-snug">{productName}</h3>
                <span className="text-xs text-emerald-600 font-medium">Chính hãng Apple VN/A</span>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              {/* Tăng giảm số lượng */}
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-900">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Tổng tiền */}
              <div className="text-sm sm:text-base font-black text-gray-900 min-w-[110px] text-right">
                {formatVnd(totalAmount)}
              </div>
            </div>
          </div>

          {/* KHỐI 2: CHỌN CÔNG TY TÀI CHÍNH & THANH KÉO SỐ TIỀN */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Chọn công ty tài chính</span>
              <a href="#huong-dan" className="text-xs text-[#02688b] font-semibold flex items-center gap-1 hover:underline">
                <Info size={13} />
                <span>Hướng dẫn đăng ký</span>
              </a>
            </div>

            {/* Thẻ nhà cung cấp */}
            <div className="flex items-center justify-center gap-4 py-1">
              {/* Home PayLater */}
              <div
                onClick={() => setSelectedProvider('home')}
                className={`w-44 p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedProvider === 'home'
                    ? 'border-[#02688b] bg-blue-50/30 shadow-xs scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-6 flex items-center justify-center">
                  <span className="font-black text-xs text-red-600 tracking-tighter">HOME <span className="text-gray-900">PayLater</span></span>
                </div>
                <span className="mt-1 bg-[#02688b] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Duyệt nhanh nhất
                </span>
              </div>

              {/* Kredivo */}
              <div
                onClick={() => setSelectedProvider('kredivo')}
                className={`w-44 p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedProvider === 'kredivo'
                    ? 'border-[#02688b] bg-blue-50/30 shadow-xs scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-6 flex items-center justify-center">
                  <span className="font-black text-xs text-orange-500 tracking-wider">Kredivo</span>
                </div>
                <span className="mt-1 bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Hạn mức cao nhất
                </span>
              </div>
            </div>

            {/* Thanh trượt số tiền trả sau */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-800">Số tiền trả sau</span>
                <span className="text-sm font-black text-[#02688b]">{formatVnd(deferredAmount)}</span>
              </div>

              <input
                type="range"
                min={0}
                max={totalAmount}
                step={500000}
                value={deferredAmount}
                onChange={(e) => setDeferredAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#02688b]"
              />

              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>Trả trước: <strong>{formatVnd(prepaidAmount)}</strong></span>
                <span>Tối đa: <strong>{formatVnd(totalAmount)}</strong></span>
              </div>
            </div>
          </div>

          {/* KHỐI 3: CHỌN KỲ HẠN */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <span className="text-sm font-bold text-gray-900 block">Chọn kỳ hạn</span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { months: 1, label: '1 Tháng' },
                { months: 3, label: '3 Tháng' },
                { months: 6, label: '6 Tháng' },
                { months: 12, label: '12 Tháng' },
              ].map((t) => {
                const isSelected = selectedTenure === t.months;
                const monthly = Math.round(deferredAmount / t.months);

                return (
                  <div
                    key={t.months}
                    onClick={() => setSelectedTenure(t.months)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      isSelected
                        ? 'border-[#02688b] bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-800 block">{t.label}</span>
                    <span className="text-sm font-black text-[#02688b] block mt-1">
                      {formatVnd(monthly)}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Lãi suất 0%</span>
                  </div>
                );
              })}
            </div>

            {/* Nút xác nhận tiếp tục */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  alert(`Đã chọn gói trả sau ${selectedTenure} tháng. Chuyển sang điền hồ sơ!`);
                  onClose();
                }}
                className="w-full py-3 bg-[#02688b] hover:bg-[#025370] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>XÁC NHẬN CHỌN GÓI TRẢ GÓP NÀY</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER CHỨNG CHỈ BẢO MẬT */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-4">
            <a href="#terms" className="hover:text-gray-900 transition-colors">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#faq" className="hover:text-gray-900 transition-colors">Câu hỏi thường gặp</a>
            <span>•</span>
            <a href="#privacy" className="hover:text-gray-900 transition-colors">Chính sách bảo mật</a>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-gray-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>PCI-DSS Compliant</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-gray-700">
              <Check size={13} className="text-blue-600" />
              <span>Secure GlobalSign</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};