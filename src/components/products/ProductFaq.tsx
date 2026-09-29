'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

const FALLBACK_FAQS: FaqItem[] = [
  { id: 'default-1', question: 'Sản phẩm có phải hàng chính hãng không?', answer: 'FoGo Store cam kết sản phẩm chính hãng, nguồn gốc rõ ràng và được kiểm tra kỹ trước khi giao đến khách hàng.' },
  { id: 'default-2', question: 'Sản phẩm có được kiểm tra trước khi nhận không?', answer: 'Bạn có thể kiểm tra ngoại quan, phụ kiện và thông tin đơn hàng khi nhận. Nhân viên FoGo Store luôn hỗ trợ trong suốt quá trình nhận hàng.' },
  { id: 'default-3', question: 'Chính sách bảo hành như thế nào?', answer: 'Sản phẩm áp dụng chính sách bảo hành theo thông tin hiển thị tại trang sản phẩm và quy định hiện hành của FoGo Store.' },
  { id: 'default-4', question: 'Tôi có thể đổi trả sản phẩm không?', answer: 'FoGo Store hỗ trợ đổi trả theo điều kiện sản phẩm và chính sách bán hàng. Vui lòng liên hệ cửa hàng để được tư vấn nhanh nhất.' },
];

export function ProductFaq() {
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/product-faqs`, { cache: 'no-store' });
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setFaqs(json.data);
        }
      } catch {
        // Dùng FAQ mặc định khi backend chưa sẵn sàng.
      }
    };
    loadFaqs();
  }, []);

  return (
    <section className="mt-7 border-t border-gray-100 pt-6">
      <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
        <HelpCircle size={21} className="text-[#d70018]" />
        Các câu hỏi thường gặp
      </h3>
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-red-50/50 transition-colors"
              >
                <span className="text-sm sm:text-[15px] font-bold text-gray-800">{faq.question}</span>
                <ChevronDown size={19} className={`shrink-0 text-[#d70018] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
