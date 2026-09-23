'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function WarrantyPolicyPage() {
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
            <span className="text-gray-700 uppercase font-semibold">CHÍNH SÁCH BẢO HÀNH</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Khung viền ngoài bao bọc toàn bộ nội dung văn bản */}
            <div
              className="lg:col-span-8 bg-white border border-gray-200 rounded-sm shadow-xs p-6 md:p-8 text-[17px] leading-[1.8] text-justify text-black space-y-6"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {/* Tiêu đề chính */}
              <h1 className="text-[26px] font-bold text-black uppercase tracking-tight text-left mb-2">
                CHÍNH SÁCH BẢO HÀNH
              </h1>

              {/* Tiêu đề đỏ căn giữa */}
              <p className="text-center font-bold text-[22px] text-[#b30000] uppercase my-4">
                CHÍNH SÁCH BẢO HÀNH TẠI FOGO STORE ÁP DỤNG TỪ 02/07/2026
              </p>

              {/* 1. ĐIỀU KIỆN BẢO HÀNH MIỄN PHÍ */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] uppercase text-[19px]">
                  1. ĐIỀU KIỆN BẢO HÀNH MIỄN PHÍ:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Sản phẩm còn trong thời gian bảo hành.</li>
                  <li>Các lỗi hư hỏng do linh kiện, phần cứng trong máy từ nhà sản xuất.</li>
                  <li>Màn hình lỗi từ 3 điểm chết trở lên hoặc 2 điểm chết liền kề trong khoảng 1 mm.</li>
                  <li>Sản phẩm không bị cong vênh, gãy, nứt vở, bể, vào nước, vào chất lỏng, không bị can thiệp bởi đơn vị bên thứ 3,...</li>
                </ul>
              </div>

              {/* 2. PHƯƠNG THỨC BẢO HÀNH */}
              <div className="space-y-4">
                <p className="font-bold text-[#002060] uppercase text-[19px]">
                  2. PHƯƠNG THỨC BẢO HÀNH:
                </p>

                {/* 2.1 iPhone mới 100% */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1. Đối với máy iPhone mới 100%:
                  </p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>Lỗi 1 Đổi 1 trong vòng 18 tháng toàn diện.</li>
                    <li>
                      <strong>Trong 45 ngày đầu tiên:</strong> Đổi máy mới nguyên seal chưa active. <strong>Thời gian còn lại đến hết 18 tháng:</strong> đổi máy cấu hình &amp; tình trạng tương đương.
                    </li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      Sau khi tiếp nhận và xác minh lỗi tại cửa hàng (đúng là lỗi phần cứng từ nhà sản xuất), thì nếu máy còn <strong>trong thời hạn 45 ngày đầu tiên</strong> thì Fogo hỗ trợ&nbsp;&nbsp;đổi máy mới nguyên seal chưa active. Nếu máy còn <strong>trong thời gian còn lại đến hết 18 tháng</strong> thì Fogo hỗ trợ đổi máy cấu hình &amp; tình trạng tương đương.
                    </li>
                  </ul>
                </div>

                {/* 2.2 iPad & Macbook mới 100% */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2. Đối với máy iPad &amp; Macbook mới 100%:
                  </p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>Lỗi 1 Đổi 1 trong vòng 45 ngày đầu tiên đối với iPad - Macbook Mới.</li>
                    <li>
                      <strong>Trong 15 ngày đầu:</strong> Đổi máy mới nguyên seal chưa active. <strong>30 ngày tiếp theo:</strong> đổi máy đã kích hoạt hoặc Like New với cấu hình và tình trạng máy tương đương.
                    </li>
                    <li>Bảo hành chính hãng 12 tháng (Cam kết không phát sinh bất kỳ chi phí nào).</li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      Một số trường hợp máy cần phải gửi đi nước ngoài để bảo hành chính hãng, nhiều nơi sẽ tính phí vận chuyển và bắt khách trả từ 2-3 triệu đồng. Trong trường hợp này, riêng tại Fogo vẫn sẽ là <strong>miễn phí!</strong>
                    </li>
                    <li>
                      Sau khi tiếp nhận và xác minh lỗi tại cửa hàng (đúng là lỗi phần cứng từ nhà sản xuất), máy sẽ được gửi đi bảo hành chính hãng được Apple thẩm định lại và bảo hành theo chính sách của hãng.
                    </li>
                  </ul>
                </div>

                {/* 2.3 iPhone đã qua sử dụng */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.3. Đối với máy iPhone đã qua sử dụng:
                  </p>
                  <p className="font-bold text-black text-[17px] pl-6 mt-1">CHẾ ĐỘ BẢO HÀNH MẶC ĐỊNH:</p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>Bảo hành 1 Đổi 1 trong 12 tháng toàn diện phần cứng bao gồm: Nguồn, màn hình, camera, Face ID, phím cứng,...</li>
                    <li>Khách hàng sẽ được hỗ trợ đổi ngay lập tức một máy tình trạng tương đương (Cam kết không phát sinh bất kỳ chi phí).</li>
                    <li>Kèm bộ quà tặng: Cường lực cao cấp, Ốp lưng Magsafe, Dock &amp; Cáp sạc nhanh 20W chính hãng.</li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      <strong>Về Pin:</strong> bảo hành theo thời hạn máy (Ví dụ: Đối với máy Pin zin theo máy thì hỗ trợ 50% nếu khách có nhu cầu thay pin mới; Đối với máy đã được thay pin mới sẵn sẽ được BH 12 Tháng).
                    </li>
                    <li>
                      <strong>Về màn hình:</strong> Bảo hành từ 3 điểm chết trở lên. Từ chối bảo hành đối với những lỗi xuất phát từ phía người dùng như: bầm màn, chảy mực, phản quang màn hình, nứt bể,...
                    </li>
                    <li>
                      <strong>Về nguồn:</strong> Máy bị mất nguồn do khách hàng sử dụng bộ sạc không chính hãng gây cháy nổ, bị va đập hoặc tự ý cập nhật phần mềm không chính hãng (jailbreak máy,...) Fogo Store có quyền từ chối bảo hành.
                    </li>
                  </ul>
                </div>

                {/* 2.4 iPad & Macbook đã qua sử dụng */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.4. Đối với máy iPad &amp; Macbook đã qua sử dụng:
                  </p>
                  <p className="font-bold text-black text-[17px] pl-6 mt-1">CHẾ ĐỘ BẢO HÀNH MẶC ĐỊNH:</p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>1 đổi 1 trong vòng 30 ngày đầu tiên &amp; bảo hành sửa chữa và thay thế trong 12 tháng toàn diện phần cứng bao gồm: Nguồn, màn hình, camera, Face ID, phím cứng,...</li>
                    <li>Kèm bộ quà tặng: Dock &amp; Cáp sạc nhanh 20W chính hãng. Giảm giá từ 10% - 20% cho các phụ kiện theo kèm máy.</li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      <strong>Về màn hình:</strong> Bảo hành từ 3 điểm chết trở lên. Từ chối bảo hành đối với những lỗi xuất phát từ phía người dùng như: bầm màn, chảy mực, phản quang màn hình, nứt bể,...
                    </li>
                    <li>
                      <strong>Về nguồn:</strong> Máy bị mất nguồn do khách hàng sử dụng bộ sạc không chính hãng gây chập, cháy nổ chân sạc và hư nguồn của máy, bị va đập hoặc tự ý cập nhật phần mềm không chính hãng (jailbreak máy,...) Fogo Store có quyền từ chối bảo hành.
                    </li>
                  </ul>
                </div>

                {/* 2.5 CPO */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.5. Đối với máy iPhone, iPad, Macbook CPO:
                  </p>
                  <p className="font-bold text-black text-[17px] pl-6 mt-1">CHẾ ĐỘ BẢO HÀNH MẶC ĐỊNH:</p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>Lỗi 1 Đổi 1 trong vòng 45 ngày đầu tiên đối với iPhone - iPad - Macbook CPO.</li>
                    <li>
                      <strong>Trong 15 ngày đầu:</strong> Đổi máy mới nguyên seal chưa active. <strong>30 ngày tiếp theo:</strong> đổi máy đã kích hoạt hoặc Like New với cấu hình và tình trạng máy tương đương.
                    </li>
                    <li>Bảo hành trong vòng 12 tháng tại cửa hàng (Cam kết không phát sinh bất kỳ chi phí nào).</li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      <strong>Về màn hình:</strong> Bảo hành từ 3 điểm chết trở lên. Từ chối bảo hành đối với những lỗi xuất phát từ phía người dùng như: bầm màn, chảy mực, phản quang màn hình, nứt bể,...
                    </li>
                    <li>
                      <strong>Về nguồn:</strong> Máy bị mất nguồn do khách hàng sử dụng bộ sạc không chính hãng gây chập, cháy nổ chân sạc và hư nguồn của máy, bị va đập hoặc tự ý cập nhật phần mềm không chính hãng (jailbreak máy,...) Fogo Store có quyền từ chối bảo hành.
                    </li>
                  </ul>
                </div>

                {/* 2.5 (Phụ kiện) */}
                <div className="space-y-1.5">
                  <p className="font-bold text-black text-[17px]">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.5. Đối với phụ kiện chính hãng Apple như (Magic Mouse, Airpods, Apple Pencil, Magic Keyboard, Apple Watch):
                  </p>
                  <p className="font-bold text-black text-[17px] pl-6 mt-1">CHẾ ĐỘ BẢO HÀNH MẶC ĐỊNH:</p>
                  <ul className="text-[17px] list-disc pl-6 space-y-2">
                    <li>Lỗi 1 Đổi 1 trong vòng 7 ngày đầu tiên.</li>
                    <li>Bảo hành chính hãng trong vòng 12 tháng (Cam kết không phát sinh bất kỳ chi phí nào).</li>
                    <li>
                      Để xác định lỗi do phần mềm hay phần cứng, Fogo Store sẽ cài đặt lại phần mềm gốc. Trường hợp một số lỗi của máy được Apple công bố trên website chính thức là lỗi do phần mềm, quý khách vui lòng chờ Apple cập nhật phần mềm mới để sửa lỗi. Thời gian tiếp nhận máy và kiểm tra không quá 48 giờ.
                    </li>
                    <li>
                      <strong>Về nguồn &amp; pin:</strong> Máy bị mất nguồn và hư pin do khách hàng sử dụng bộ sạc không chính hãng gây chập, cháy nổ chân sạc, khách sử dụng bộ sạc công suất cao sạc cho máy gây hư pin của máy, bị va đập hoặc tự ý cập nhật phần mềm không chính hãng (jailbreak máy,...) Fogo Store có quyền từ chối bảo hành.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3. KHÁC */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] uppercase text-[19px]">
                  3. KHÁC:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>
                    Trường hợp máy còn trong thời gian bảo hành gặp lỗi phần cứng. Nếu khách hàng muốn lên đời sản phẩm khác, Fogo Store hỗ trợ thu lại 100% giá trị máy (khách hàng đảm bảo ngoại hình máy khi đổi giống như tình trạng máy mua lúc đầu), lúc này khách hàng chỉ cần bù thêm phần chênh lệch giữa hai máy.
                  </li>
                </ul>
              </div>

              {/* 4. TRƯỜNG HỢP MÁY KHÔNG ĐỦ ĐIỀU KIỆN BẢO HÀNH */}
              <div className="space-y-1.5">
                <p className="font-bold text-[#002060] uppercase text-[19px]">
                  4. TRƯỜNG HỢP MÁY KHÔNG ĐỦ ĐIỀU KIỆN BẢO HÀNH:
                </p>
                <ul className="text-[17px] list-disc pl-6 space-y-1.5">
                  <li>Máy vào nước hoặc phát hiện có chất lỏng trong thân máy.</li>
                  <li>Khách hàng tự update phần mềm dẫn đến lỗi mất nguồn.</li>
                  <li>Sản phẩm hết thời hạn bảo hành, phiếu bảo hành không đúng tên thiết bị, model, số serial/imei có dấu hiệu bị tẩy xóa trên Phiếu bảo hành.</li>
                  <li>Đối với máy cũ: tem niêm phong máy không còn nguyên vẹn, có dấu hiệu cậy, xé, rách, vỡ,…</li>
                  <li>Sản phẩm có dấu hiệu rơi vỡ, cấn móp va đập, hoặc hư hỏng do bên thứ 3 tự ý can thiệp vào máy.</li>
                  <li>Màn hình xuất hiện 1 hoặc vài điểm chết nhưng không thỏa điều kiện của nhà sản xuất, không được bảo hành.</li>
                  <li>Sản phẩm bị thay đổi Firmware, Root, Jailbreak, Cài đặt Cydia và phần cứng bởi sự tự ý của khách hàng hoặc các nơi khác.</li>
                  <li>Sản phẩm bị khóa iCloud, Knox, PassCode, Vân tay, Pattern lock, Security Lock.</li>
                </ul>
              </div>

              {/* Ghi chú màu đỏ cuối bài */}
              <div className="pt-3 space-y-2 text-[#cc0000] font-bold text-[17px]">
                <p>*** CÁC TRƯỜNG HỢP LỖI DO NGƯỜI DÙNG SẼ ĐƯỢC FOGO HỖ TRỢ CHI PHÍ SỬA CHỮA THAY THẾ VỚI CHI PHÍ GỐC.</p>
                <p>*** FOGO KHÔNG CHỊU TRÁCH NHIỆM VỚI BẤT KÌ MẤT MÁT DỮ LIỆU TRONG QUÁ TRÌNH BẢO HÀNH SẢN PHẨM.</p>
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
                  <Link href="/tin-tuc" className="block p-4 hover:text-[#d70018] transition-colors">
                    Tin tức
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