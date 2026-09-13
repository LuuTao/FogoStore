'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Mail, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Giả lập gửi thông tin liên hệ
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setContent('');
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#f8f9fa] border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 text-xs text-gray-600 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800">Liên hệ</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CỘT TRÁI: THÔNG TIN & FORM LIÊN HỆ */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700">
                {/* Địa chỉ */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 mb-0.5">Địa chỉ</h2>
                    <p className="leading-relaxed">298 Trần Hưng Đạo, phường Nguyễn Cư Trinh, Quận 1, TP.HCM</p>
                  </div>
                </div>

                {/* Thời gian làm việc */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 mb-0.5">Thời gian làm việc</h2>
                    <p>Thứ 2 đến Thứ 7: từ 9h đến 21h;</p>
                    <p>Chủ nhật: từ 9h đến 19h</p>
                  </div>
                </div>

                {/* Điện thoại */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 mb-0.5">Điện thoại</h2>
                    <a href="tel:0566003333" className="hover:text-[#d70018] font-semibold">0566003333</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 mb-0.5">Email</h2>
                    <a href="mailto:fogostore9393@gmail.com" className="hover:text-[#d70018]">fogostore9393@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM GỬI THẮC MẮC */}
            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Gửi thắc mắc cho chúng tôi</h2>
              <p className="text-xs text-gray-500 mb-6">
                Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
              </p>

              {submitted && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Cảm ơn bạn! Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Tên của bạn"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-md outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    required
                    placeholder="Email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-md outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại của bạn"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-md outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nội dung"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-md outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400 resize-none"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">Privacy Policy</a> and{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">Terms of Service</a> apply.
                </p>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#d70018] hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded uppercase tracking-wider transition-colors disabled:opacity-70 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? 'ĐANG GỬI...' : 'GỬI CHO CHÚNG TÔI'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* CỘT PHẢI: GOOGLE MAPS */}
          <div className="lg:col-span-5 h-[450px] lg:h-[540px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm sticky top-24">
            <iframe
              title="Địa chỉ Fogo Store"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.645579998142!2d106.68735227583803!3d10.761775759458933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f16a695dbb3%3A0x6ce8017c66e2c342!2zMjk4IMSQLiBUcuG6p24gSMawbmcgxJDhuqFvLCBQaMaw4budbmcgTmd1eeG7hW4gQ8awIFRyaW5oLCBRdeG6rW4gMSwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </main>
  );
}