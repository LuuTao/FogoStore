'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  
  const { cartItems, updateQuantity, removeFromCart, totalPrice, totalQuantity, refreshCart } = useCart();

  useEffect(() => {
    if (refreshCart) {
      refreshCart();
    }
  }, [refreshCart]);

  const formatVnd = (num: number) => (!num || num <= 0 ? '0đ' : num.toLocaleString('vi-VN') + 'đ');

  // Hàm tạo khóa định danh duy nhất cho từng biến thể sản phẩm trong giỏ hàng
  const getCartItemKey = (item: any) => {
    return `${item.id || item.productId}-${item.storage || 'default'}-${item.color || 'default'}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between select-none">
      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-5xl mx-auto flex items-center gap-1.5 text-gray-600">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Giỏ hàng ({totalQuantity})</span>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center mb-6">
            GIỎ HÀNG CỦA BẠN
          </h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
              <ShoppingBag size={56} className="text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-700">Giỏ hàng của bạn đang trống</p>
              <p className="text-xs text-gray-400 mt-1">Hãy chọn các sản phẩm công nghệ tuyệt vời từ Fogo Store nhé!</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#d70018] text-white text-xs font-bold rounded-sm hover:bg-[#b50014] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Tiếp tục mua sắm</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Danh sách sản phẩm */}
              <div className="lg:col-span-8 bg-white border border-gray-200 rounded-sm p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500 font-semibold">
                  <span>Có <strong className="text-gray-900">{totalQuantity}</strong> sản phẩm trong giỏ</span>
                  <Link href="/" className="text-[#d70018] hover:underline flex items-center gap-1">
                    <ArrowLeft size={12} /> Tiếp tục chọn thêm
                  </Link>
                </div>

                {cartItems.map((item: any, idx: number) => {
                  const uniqueKey = getCartItemKey(item);
                  const currentQty = Number(item.quantity) || 1;

                  return (
                    <div
                      key={uniqueKey || idx}
                      className="flex gap-4 items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 border border-gray-100 p-1 rounded-sm bg-white flex items-center justify-center">
                        <img src={item.imageUrl || item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          {item.storage && <span>Phiên bản: <strong>{item.storage}</strong></span>}
                          {item.color && <span>• Màu: <strong>{item.color}</strong></span>}
                        </div>
                        <div className="text-xs sm:text-sm font-black text-[#d70018] mt-1">
                          {formatVnd(Number(item.price))}
                        </div>
                      </div>

                      {/* Bộ tăng giảm số lượng */}
                      <div className="flex items-center border border-gray-300 rounded-xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, currentQty - 1), item.storage, item.color)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-xs font-bold text-gray-800 border-x border-gray-300">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, currentQty + 1, item.storage, item.color)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Nút xóa sản phẩm */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.storage, item.color)}
                        className="text-gray-400 hover:text-[#d70018] p-1.5 transition-colors cursor-pointer"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Khung Tóm tắt đơn hàng */}
              <div className="lg:col-span-4 bg-white border border-gray-200 rounded-sm p-4 shadow-sm space-y-4 sticky top-24">
                <h3 className="font-black text-sm text-gray-900 pb-2 border-b border-gray-100 uppercase">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng số lượng:</span>
                    <span className="font-semibold text-gray-900">{totalQuantity} sản phẩm</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-semibold text-gray-900">{formatVnd(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-600 font-bold">Miễn phí toàn quốc</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-700">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-[#d70018]">{formatVnd(totalPrice)}</span>
                </div>

                {/* Chuyển sang thanh toán */}
                <button
                  type="button"
                  onClick={() => router.push('/thanh-toan')}
                  className="w-full py-3.5 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase rounded-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>TIẾN HÀNH ĐẶT HÀNG</span>
                  <ArrowRight size={14} />
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Kiểm tra kỹ cấu hình và màu sắc trước khi tiếp tục.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}