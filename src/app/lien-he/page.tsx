'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Mail, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      <div>
        {/* HEADER & NAVBAR CHUẨN GIAO DIỆN FOGO STORE */}
        <div className="sticky top-0 z-50 shadow-xs">
          <Header />
          <Navbar />
        </div>

        <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          {/* BREADCRUMB TEXT ĐƠN GIẢN CHUẨN MẪU GỐC */}
          <div className="text-[12px] text-gray-500 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-800 font-normal">Liên hệ</span>
          </div>

          {/* BỐ CỤC 2 CỘT: TRÁI LÀ FORM, PHẢI LÀ GOOGLE MAPS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ========================================================= */}
            {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ & FORM GỬI THẮC MẮC           */}
            {/* ========================================================= */}
            <div className="lg:col-span-6 space-y-7">
              {/* KHỐI THÔNG TIN LIÊN HỆ */}
              <div>
                <h1 className="text-lg md:text-[20px] font-bold text-gray-900 mb-6">
                  Thông tin liên hệ
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-[12px] text-gray-700">
                  {/* Địa chỉ */}
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} strokeWidth={1.75} className="text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-gray-900 mb-0.5">Địa chỉ</h2>
                      <p className="leading-snug text-gray-600">
                        298 Trần Hưng Đạo, phường Nguyễn Cư Trinh, Quận 1, TP.HCM
                      </p>
                    </div>
                  </div>

                  {/* Thời gian làm việc */}
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} strokeWidth={1.75} className="text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-gray-900 mb-0.5">Thời gian làm việc</h2>
                      <p className="leading-snug text-gray-600">Thứ 2 đến Thứ 7: từ 9h đến 21h;</p>
                      <p className="leading-snug text-gray-600">Chủ nhật: từ 9h đến 19h</p>
                    </div>
                  </div>

                  {/* Điện thoại */}
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} strokeWidth={1.75} className="text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-gray-900 mb-0.5">Điện thoại</h2>
                      <a href="tel:0566003333" className="hover:text-[#d70018] text-gray-700">
                        0566003333
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} strokeWidth={1.75} className="text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-gray-900 mb-0.5">Email</h2>
                      <a href="mailto:fogostore9393@gmail.com" className="hover:text-[#d70018] text-gray-700">
                        fogostore9393@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHỐI FORM GỬI THẮC MẮC */}
              <div className="pt-2">
                <h2 className="text-base md:text-[17px] font-bold text-gray-900 mb-1.5">
                  Gửi thắc mắc cho chúng tôi
                </h2>
                <p className="text-[12px] text-gray-500 mb-5 leading-normal">
                  Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
                </p>

                {submitted && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Cảm ơn bạn! Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Tên */}
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Tên của bạn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-[3px] outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="email"
                      required
                      placeholder="Email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-[3px] outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Số điện thoại của bạn"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-[3px] outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  {/* Nội dung */}
                  <div>
                    <textarea
                      rows={4}
                      required
                      placeholder="Nội dung"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-[3px] outline-none focus:border-[#d70018] transition-colors placeholder:text-gray-400 resize-none"
                    />
                  </div>

                  {/* Captcha Disclaimer */}
                  <p className="text-[11px] text-gray-400 leading-normal">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-gray-600"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-gray-600"
                    >
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>

                  {/* Nút Submit */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#d70018] hover:bg-red-700 text-white font-bold text-[11px] px-5 py-2.5 rounded-[3px] uppercase tracking-wide transition-colors disabled:opacity-70 cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? 'ĐANG GỬI...' : 'GỬI CHO CHÚNG TÔI'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CỘT PHẢI: GOOGLE MAPS GHIM ĐÚNG TÊN CỬA HÀNG FOGO STORE   */}
            {/* ========================================================= */}
            <div className="lg:col-span-6 h-[420px] lg:h-[500px] w-full rounded-[4px] overflow-hidden border border-gray-200 shadow-xs">
              <iframe
                title="Cửa Hàng Điện Thoại FOGO STORE - 298 Trần Hưng Đạo"
                src="https://maps.google.com/maps?q=C%E1%BB%ACA+H%C3%80NG+%C4%90I%E1%BB%86N+THO%E1%BA%A0I+FOGO+STORE,+298+%C4%90.+Tr%E1%BA%A7n+H%C6%B0ng+%C4%90%E1%BA%A1o,+Ph%C6%B0%E1%BB%9Dng+Nguy%E1%BB%85n+C%C6%B0+Trinh,+Qu%E1%BA%ADn+1,+H%E1%BB%93+Ch%C3%AD+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}