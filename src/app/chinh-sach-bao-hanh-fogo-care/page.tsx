'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function FogoCareWarrantyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between text-black">
      <div>
        <div className="sticky top-0 z-50 shadow-xs">
          <Header />
          <Navbar />
        </div>

        {/* Breadcrumb */}
        <div className="w-full bg-white py-2.5 px-4 text-[13px] text-gray-500 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            <Link href="/" className="hover:text-black">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-700 uppercase font-semibold">Chính sách bảo hành Fogo Care</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Khung nội dung bảng chính sách (Tăng lên 9 cột để bảng rộng rãi) */}
            <div
              className="lg:col-span-9 bg-white border border-gray-200 rounded-sm shadow-xs p-5 md:p-8 text-[16px] leading-[1.7] text-black space-y-8 overflow-x-auto"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {/* Tiêu đề trang */}
              <h1 className="text-[26px] font-bold text-black tracking-tight text-left mb-4">
                Chính sách bảo hành Fogo Care
              </h1>

              {/* BẢNG 1: Dịch vụ thay màn hình điện thoại */}
              <div className="space-y-3">
                <p className="font-semibold text-black text-[18px]">
                  Chính sách bảo hành đối với dịch vụ thay màn hình điện thoại
                </p>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-[16px] min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black font-bold bg-gray-50/50">
                        <th className="border-r border-black p-3.5 w-[20%]">Linh Kiện Thay Thế</th>
                        <th className="border-r border-black p-3.5 w-[32%]">Loại linh kiện</th>
                        <th className="p-3.5 w-[48%]">Chế độ bảo hành</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* iPhone */}
                      <tr className="border-b border-black">
                        <td rowSpan={3} className="border-r border-black p-3.5 font-bold align-middle">
                          iPhone
                        </td>
                        <td className="border-r border-black p-3.5 align-top">
                          Màn ép kính/ Màn bóc máy/ Chính hãng Apple
                        </td>
                        <td className="p-3.5 space-y-1.5 align-top">
                          <p>- Bảo hành <strong>01 đổi 01</strong> trong <strong>12 tháng</strong> về chất lượng cảm ứng.</p>
                          <p>- Miễn phí thay kính <strong>01 lần trong 3 tháng</strong> đối với trường hợp rơi vỡ.</p>
                          <p>- Bảo hành <strong>miễn phí trọn đời</strong> với trường hợp hở keo, hở roong, bụi bọt mặt kính.</p>
                          <p>- Bảo hành <strong>6 tháng</strong> xanh trắng màn hình.</p>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 align-top">Màn ép cảm</td>
                        <td className="p-3.5 space-y-1.5 align-top">
                          <p>- Bảo hành <strong>01 đổi 01</strong> trong <strong>12 tháng</strong> về chất lượng cảm ứng.</p>
                          <p>- Miễn phí thay kính cảm ứng <strong>01 lần trong 3 tháng</strong> đối với trường hợp rơi vỡ.</p>
                          <p>- Bảo hành <strong>miễn phí trọn đời</strong> với trường hợp hở keo, hở roong, bụi bọt mặt kính.</p>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 align-top">Chính hãng (GX)</td>
                        <td className="p-3.5 align-top">Không làm</td>
                      </tr>

                      {/* Apple Watch, iPad,... */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 font-bold align-middle">
                          Apple Watch, iPad,...
                        </td>
                        <td className="border-r border-black p-3.5 align-top">
                          Màn hình (ép kính, bóc máy, full khung, zin new, )
                        </td>
                        <td className="p-3.5 space-y-1.5 align-top">
                          <p>- Bảo hành <strong>01 đổi 01</strong> trong <strong>6 tháng</strong> về chất lượng cảm ứng.</p>
                          <p>- Miễn phí thay kính <strong>01 lần trong 3 tháng</strong> đối với trường hợp rơi vỡ.</p>
                          <p>- Bảo hành <strong>miễn phí trọn đời</strong> trong trường hợp hở keo, hở roong bụi bọt mặt kính.</p>
                          <p>- <span className="underline font-bold">LCD IPAD</span>: bảo hành <strong>01 đổi 01 trong 3 tháng</strong> hiển thị (màu sắc,độ phân giải)</p>
                          <p>- Bảo hành <strong>06 tháng</strong> xanh trắng màn hình Samsung (không bảo hành màn dán keo UV)</p>
                        </td>
                      </tr>

                      {/* Ép cổ cáp màn hình */}
                      <tr>
                        <td className="border-r border-black p-3.5 font-bold align-middle">
                          Ép cổ cáp màn hình
                        </td>
                        <td className="border-r border-black p-3.5 align-top"></td>
                        <td className="p-3.5 space-y-1.5 align-top">
                          <p>- Bảo hành <strong>06 tháng</strong> nếu bị lại tình trạng cũ.</p>
                          <p>- Miễn phí thay kính <strong>01 lần trong 3 tháng</strong> đối với trường hợp rơi vỡ.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BẢNG 2: Dịch vụ thay mặt kính điện thoại */}
              <div className="space-y-3 pt-2">
                <p className="font-semibold text-black text-[18px]">
                  Chính sách bảo hành đối với dịch vụ thay mặt kính điện thoại
                </p>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-[16px] min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black font-bold bg-gray-50/50">
                        <th className="border-r border-black p-3.5 w-[35%]">Loại Linh Kiện</th>
                        <th className="p-3.5 w-[65%]">Chế Độ Bảo Hành</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 align-top">Cell Pin Apple</td>
                        <td className="p-3.5 space-y-1 align-top">
                          <p>- Bảo hành <strong>12 tháng</strong>: pin sạc không vào, nhanh tụt pin, dung lượng pin báo ảo.</p>
                          <p>- Bảo hành <strong>12 tháng pin phù</strong>.</p>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 align-top">Pin Pisen</td>
                        <td className="p-3.5 space-y-1 align-top">
                          <p>- Bảo hành <strong>12 tháng</strong>: pin sạc không vào, nhanh tụt pin, dung lượng pin báo ảo.</p>
                          <p>- Bảo hành <strong>12 tháng pin phù</strong>.</p>
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-3.5 align-top">
                          Pin Linh kiện các dòng khác (samsung, Apple Watch, Airpods, ...)
                        </td>
                        <td className="p-3.5 align-top">
                          - Bảo hành <strong>06 tháng</strong>: pin phù, sạc không vào, nhanh tụt pin, dung lượng pin báo ảo.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BẢNG 3: Dịch vụ thay thế linh kiện */}
              <div className="space-y-3 pt-2">
                <p className="font-semibold text-black text-[18px]">
                  Chính sách bảo hành dịch vụ thay thế linh kiện
                </p>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-[16px] min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black font-bold bg-gray-50/50">
                        <th className="border-r border-black p-3.5 w-[20%]">Linh Kiện Thay Thế</th>
                        <th className="border-r border-black p-3.5 w-[35%]">Loại Linh Kiện</th>
                        <th className="p-3.5 w-[45%]">Chế Độ Bảo Hành</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td rowSpan={2} className="border-r border-black p-3.5 font-bold align-middle">
                          Linh Kiện
                        </td>
                        <td className="border-r border-black p-3.5 align-top">
                          Vỏ, nắp sau iPhone (mặt kính sau), kính camera sau, nắp sau (Android)
                        </td>
                        <td className="p-3.5 space-y-1.5 align-top">
                          <p>- <strong>01 đổi 01 trong 60 ngày đầu</strong> nếu không may người dùng làm rơi vỡ, trầy xước nắp sau, kính camera sau, mặt kính sau của vỏ.</p>
                          <p>- Bảo hành <strong>miễn phí trọn đời</strong> hở keo linh kiện thay thế.</p>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-3.5 align-top">
                          Linh kiện khác: Loa trong, loa ngoài, camera, rung, cảm biến, mic, cụm chân sạc, cụm nút nguồn, nút home,...
                        </td>
                        <td className="p-3.5 align-top">
                          - Bảo hành <strong>01 đổi 01 trong 12 tháng</strong> với các lỗi linh kiện thay thế.
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-3.5 font-bold align-top">
                          Sửa chữa phần cứng (main, khò hàn IC, thay chân sạc, nút nguồn trong,...)
                        </td>
                        <td className="border-r border-black p-3.5 align-top"></td>
                        <td className="p-3.5 align-top">
                          - Bảo hành <strong>06 tháng</strong> lỗi linh kiện sửa chữa.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BẢNG 4: Chính sách bảo hành phụ kiện */}
              <div className="space-y-3 pt-2">
                <p className="font-semibold text-black text-[18px]">
                  Chính sách bảo hành phụ kiện
                </p>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-[16px] min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black font-bold bg-gray-50/50">
                        <th className="border-r border-black p-3.5 w-[35%]"></th>
                        <th className="p-3.5 w-[65%]">Thương hiệu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-r border-black p-3.5 font-bold align-middle">
                          Phụ kiện (cáp sạc, dock sạc, tai nghe...)
                        </td>
                        <td className="p-3.5 space-y-2 align-middle">
                          <p>Aukey, Anker, Ugreen.</p>
                          <p>Pisen, Baseus và các thương hiệu khác.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Sidebar Danh mục page (3 cột) */}
            <div className="lg:col-span-3 pl-0">
              <div className="border border-gray-200 rounded-sm bg-white shadow-xs sticky top-24">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 text-lg font-bold text-gray-900">
                  <span>Danh mục page</span>
                  <span className="text-gray-400 text-sm">▼</span>
                </div>
                <div className="divide-y divide-gray-100 text-[16px] text-gray-800">
                  <Link href="/" className="block p-4 hover:text-[#d70018] transition-colors">
                    Trang chủ
                  </Link>
                  <div className="flex items-center justify-between p-4 hover:text-[#d70018] cursor-pointer transition-colors">
                    <span>Sản phẩm</span>
                    <span className="text-gray-400 text-lg font-normal">+</span>
                  </div>
                  <Link href="/blogs" className="block p-4 hover:text-[#d70018] transition-colors">
                    Blog
                  </Link>
                  <Link href="/pages/gioi-thieu" className="block p-4 hover:text-[#d70018] transition-colors">
                    Giới thiệu
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}