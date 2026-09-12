'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function MacBookRepairWarrantyPolicyPage() {
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
            <span className="text-gray-700 uppercase font-semibold">
              CHÍNH SÁCH BẢO HÀNH LINH KIỆN SỬA CHỮA MACBOOK
            </span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Khung nội dung văn bản chính */}
            <div
              className="lg:col-span-8 bg-white border border-gray-200 rounded-sm shadow-xs p-6 md:p-8 text-[17px] leading-[1.8] text-justify text-black space-y-6"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {/* Tiêu đề chính */}
              <h1 className="text-[24px] font-bold text-black uppercase tracking-tight text-left mb-4">
                CHÍNH SÁCH BẢO HÀNH LINH KIỆN SỬA CHỮA MACBOOK
              </h1>

              {/* 1. Chính sách bảo hành và hậu mãi linh kiện Fogo Store */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] text-[19px]">
                  1. Chính sách bảo hành và hậu mãi linh kiện Fogo Store:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Thời gian bảo hành: 12 tháng tại Fogo</li>
                  <li>Hỗ trợ thay thế miễn phí</li>
                  <li>Hỗ trợ cài đặt phần mềm miễn phí</li>
                  <li>Giảm từ 10% -20% khi mua kèm phụ kiện chính hãng</li>
                </ul>
              </div>

              {/* 2. Quy định về sản phẩm đủ điều kiện bảo hành */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] text-[19px]">
                  2. Quy định về sản phẩm đủ điều kiện bảo hành:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Máy móc linh kiện không bị rơi rớt, cấn móp, không bị hỏng hóc bên trong do tác động vật lý, màn hình không bị phản quang hoặc có điểm chết.</li>
                  <li>Máy móc linh kiện không bị rơi vỡ, cấn móp, không bị hỏng hóc, màn hình không bị phản quang, không điểm chết được gây ra bởi những tác động vật lý bên ngoài.</li>
                  <li>Máy không bị tình trạng vào nước.</li>
                  <li>Máy hoặc linh kiện còn trong thời gian hiệu lực bảo hành và các vấn đề hư hỏng do nhà sản xuất, lỗi kỹ thuật.</li>
                  <li>Máy hoặc linh kiện chưa từng qua sửa chữa từ nơi thứ ba (không phải FOGO) hoặc người dùng chưa từng can thiệp.</li>
                  <li>Tem bảo hành, mã vạch, seri number còn nguyên vẹn, không có dấu hiệu cạo sửa, tẩy, xóa hay bị rách mờ.</li>
                </ul>
              </div>

              {/* 3. Quy định về sản phẩm không đủ điều kiện bảo hành */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] text-[19px]">
                  3. Quy định về sản phẩm không đủ điều kiện bảo hành:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Máy hoặc linh kiện bị rơi rớt, cấn móp một hoặc nhiều góc, bị hỏng hóc những bộ phận bên trong,… được gây ra bởi những tác động vật lý bên ngoài.</li>
                  <li>Màn hình bị phản quang hoặc có điểm chết.</li>
                  <li>Máy đã từng bị vào nước hoặc tiếp xúc với nước trực tiếp dẫn đến tình trạng hỏng hóc những linh kiện bên trong.</li>
                  <li>Máy hoặc linh kiện đã sửa chữa bởi bên khác (không phải Fogo) hoặc người dùng tự ý can thiệp vào bên trong mà không thông báo với Fogo Store.</li>
                  <li>Tem bảo hành, mã vạch, seri number đã có dấu hiệu cạo sửa, tẩy xóa hay bị rách mờ, máy hoặc linh kiện không dán tem bảo hành.</li>
                  <li>Máy lỗi do việc cài đặt không đúng như: tự ý cài đặt &amp; nâng cấp phần mềm và firmware.</li>
                </ul>
              </div>

              {/* 4. Cần phải thay màn hình Macbook nếu có các dấu hiệu sau */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] text-[19px]">
                  4. Cần phải thay màn hình Macbook nếu có các dấu hiệu sau:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Màn hình Macbook có các đường kẻ sọc ngang, sọc dọc màu đen, trắng hoặc nhiều màu.</li>
                  <li>Màn hình mất màu hoặc hiển thị chỉ một màu duy nhất.</li>
                  <li>Màn hình Macbook có đốm trắng hoặc đen càng ngày càng lan rộng.</li>
                  <li>Màn hình bị bóng mờ, âm bản một vùng.</li>
                  <li>Màn hình bị phản quang, ám màu.</li>
                  <li>Màn hình nứt vỡ, không hiển thị được nữa, bị vô nước.</li>
                  <li>Màn hình nhòe, giật liên tục.</li>
                </ul>
              </div>

              {/* 5. Quy trình thay màn hình Macbook */}
              <div className="space-y-2">
                <p className="font-bold text-[#002060] text-[19px]">
                  5. Quy trình thay màn hình Macbook:
                </p>
                <div className="space-y-2 text-[17px] pl-2">
                  <p>
                    &nbsp;&nbsp;<strong>5.1.</strong> Khách hàng mang máy đến Fogo Store, nhân viên sẽ tiếp nhận máy và ghi nhận yêu cầu sửa chữa Macbook của khách hàng.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.2.</strong> Nhân viên tư vấn cho khách hàng về chính sách bảo hành linh kiện tại Fogo Store.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.3.</strong> Nhân viên tiến hành kiểm tra máy của khách, nhận định “bệnh” mà máy khách đang gặp phải.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.4.</strong> Tư vấn cho khách hàng phương án sửa chữa tối ưu, tiết kiệm chi phí nhất cho khách hàng. Đồng thời báo giá cụ thể và thời gian sửa chữa.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.5.</strong> Trường hợp nếu Macbook của khách bị lỗi nhẹ thì có thể tiến hành sửa Macbook lấy ngay cho khách hàng trong vòng 30 đến 60 phút (tùy mức độ). Còn nếu như máy của khách gặp các lỗi nặng liên quan đến Mainboard, màn hình,… thì cần phải để lại máy để cửa hàng có thêm thời gian thay thế, sửa chữa.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.6.</strong> Sau khi quá trình sửa chữa hoàn tất, quý khách hàng xác nhận lại linh kiện và tiến hành test kiểm tra lại máy xem có hoạt động ổn định hay không, có vấn đề gì thì có thể nói ngay với nhân viên để được khắc phục lỗi Macbook tại chỗ.
                  </p>
                  <p>
                    &nbsp;&nbsp;<strong>5.7.</strong> Sau khi máy đã hoạt động ổn định, quý khách sẽ thanh toán chi phí sửa chữa theo như hóa đơn nhận máy sửa chữa.
                  </p>
                </div>
              </div>

            </div>

            {/* Sidebar Danh mục page bên phải */}
            <div className="lg:col-span-4 pl-0 lg:pl-4">
              <div className="border border-gray-200 rounded-sm bg-white shadow-xs">
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