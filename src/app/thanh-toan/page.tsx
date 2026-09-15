'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Wallet,
  Receipt,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  Tag,
  ArrowRight,
  Loader2,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { QrPaymentModal } from '@/components/checkout/QrPaymentModal';
import { ToastNotification } from '@/components/common/ToastNotification';
import { AuthModal } from '@/components/auth/AuthModal';

const API_URL = 'https://fogo-store-api.onrender.com';

// ----------------------------------------------------------------------
// DỮ LIỆU HÀNH CHÍNH CHUẨN ĐẦY ĐỦ 63 TỈNH / THÀNH PHỐ VIỆT NAM
// ----------------------------------------------------------------------
const VIETNAM_ADMIN_DATA: Record<string, Record<string, string[]>> = {
  'Thành phố Hà Nội': {
    'Quận Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai', 'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Thành Công'],
    'Quận Hoàn Kiếm': ['Phường Phúc Tân', 'Phường Đồng Xuân', 'Phường Hàng Mã', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Bồ', 'Phường Cửa Đông', 'Phường Lý Thái Tổ', 'Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Chương Dương', 'Phường Hàng Trống', 'Phường Cửa Nam', 'Phường Hàng Bông', 'Phường Tràng Tiền'],
    'Quận Tây Hồ': ['Phường Phú Thượng', 'Phường Nhật Tân', 'Phường Tứ Liên', 'Phường Quảng An', 'Phường Yên Phụ', 'Phường Thụy Khuê', 'Phường Bưởi', 'Phường Xuân La'],
    'Quận Cầu Giấy': ['Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Mai Dịch', 'Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Quan Hoa', 'Phường Yên Hòa', 'Phường Trung Hòa'],
    'Quận Đống Đa': ['Phường Cát Linh', 'Phường Văn Miếu', 'Phường Quốc Tử Giám', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Nam Đồng', 'Phường Trung Liệt', 'Phường Khâm Thiên', 'Phường Thổ Quan', 'Phường Hàng Bột', 'Phường Trung Phụng', 'Phường Kim Liên', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Khương Thượng', 'Phường Ngã Tư Sở', 'Phường Láng Hạ'],
    'Quận Hai Bà Trưng': ['Phường Nguyễn Du', 'Phường Bạch Đằng', 'Phường Phạm Đình Hổ', 'Phường Bùi Thị Xuân', 'Phường Lê Đại Hành', 'Phường Ngô Thì Nhậm', 'Phường Đồng Nhân', 'Phường Phố Huế', 'Phường Đống Mác', 'Phường Thanh Lương', 'Phường Thanh Nhàn', 'Phường Cầu Dền', 'Phường Bách Khoa', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Vĩnh Tuy'],
    'Quận Hoàng Mai': ['Phường Thanh Trì', 'Phường Vĩnh Hưng', 'Phường Định Công', 'Phường Mai Động', 'Phường Tương Mai', 'Phường Đại Kim', 'Phường Tân Mai', 'Phường Hoàng Văn Thụ', 'Phường Giáp Bát', 'Phường Lĩnh Nam', 'Phường Thịnh Liệt', 'Phường Trần Phú', 'Phường Hoàng Liệt', 'Phường Yên Sở'],
    'Quận Thanh Xuân': ['Phường Nhân Chính', 'Phường Thượng Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Hạ Đình', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Phương Liệt'],
    'Quận Long Biên': ['Phường Thượng Thanh', 'Phường Ngọc Thụy', 'Phường Giang Biên', 'Phường Phúc Biên', 'Phường Đức Giang', 'Phường Việt Hưng', 'Phường Gia Thụy', 'Phường Ngọc Lâm', 'Phường Phúc Đồng', 'Phường Bồ Đề', 'Phường Long Biên', 'Phường Thạch Bàn', 'Phường Cự Khối'],
    'Quận Nam Từ Liêm': ['Phường Cầu Diễn', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Mễ Trì', 'Phường Trung Văn', 'Phường Đại Mỗ', 'Phường Tây Mỗ', 'Phường Xuân Phương', 'Phường Phương Canh'],
    'Quận Bắc Từ Liêm': ['Phường Thượng Cát', 'Phường Liên Mạc', 'Phường Tây Tựu', 'Phường Minh Khai', 'Phường Tây Tựu', 'Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đức Thắng', 'Phường Đông Ngạc', 'Phường Thụy Phương', 'Phường Phú Diễn', 'Phường Phúc Diễn'],
    'Quận Hà Đông': ['Phường Nguyễn Trãi', 'Phường Mộ Lao', 'Phường Văn Quán', 'Phường Vạn Phúc', 'Phường Yết Kiêu', 'Phường Quang Trung', 'Phường La Khê', 'Phường Phú La', 'Phường Phúc La', 'Phường Hà Cầu', 'Phường Yên Nghĩa', 'Phường Kiến Hưng', 'Phường Phú Lương', 'Phường Phú Lãm', 'Phường Dương Nội', 'Phường Biên Giang', 'Phường Đồng Mai'],
    'Huyện Sóc Sơn': ['Thị trấn Sóc Sơn', 'Xã Bắc Sơn', 'Xã Minh Trí', 'Xã Hồng Kỳ', 'Xã Nam Sơn', 'Xã Trung Giã', 'Xã Xнициа', 'Xã Phú Cường', 'Xã Phù Linh', 'Xã Tiên Dược', 'Xã Việt Long', 'Xã Tân Hưng', 'Xã Minh Phú', 'Xã Phù Lỗ', 'Xã Đông Xuân'],
    'Huyện Đông Anh': ['Thị trấn Đông Anh', 'Xã Xuân Nộn', 'Xã Thụy Lâm', 'Xã Bắc Hồng', 'Xã Nguyên Khê', 'Xã Nam Hồng', 'Xã Tiên Dương', 'Xã Vân Hà', 'Xã Uy Nỗ', 'Xã Vân Nội', 'Xã Cổ Loa', 'Xã Hải Bối', 'Xã Kim Chung', 'Xã Đại Mạch', 'Xã Võng La', 'Xã Kim Nỗ', 'Xã Hải Bối'],
  },
  'Thành phố Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
    'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường Võ Thị Sáu'],
    'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'],
    'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận 6': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 7': ['Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng', 'Phường Tân Quy', 'Phường Phú Mỹ', 'Phường Phú Thuận', 'Phường Bình Thuận', 'Phường Tân Phú'],
    'Quận 8': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 16'],
    'Quận 10': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận 11': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
    'Quận 12': ['Phường An Phú Đông', 'Phường Đông Hưng Thuận', 'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp', 'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp', 'Phường Tân Thới Nhất', 'Phường Thạnh Lộc', 'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây'],
    'Quận Bình Tân': ['Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A', 'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A', 'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
    'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'],
    'Quận Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17'],
    'Quận Tân Bình': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận Tân Phú': ['Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì', 'Phường Tân Thành', 'Phường Tây Thạnh'],
    'Thành phố Thủ Đức': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Hiệp Phú', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây', 'Phường Linh Trung', 'Phường Linh Xuân', 'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ', 'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tam Bình', 'Phường Tam Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Thạnh Mỹ Lợi', 'Phường Thảo Điền', 'Phường Thủ Thiêm', 'Phường Trường Thạnh', 'Phường Trường Thọ'],
    'Huyện Bình Chánh': ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B'],
    'Huyện Củ Chi': ['Thị trấn Củ Chi', 'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ', 'Xã Hòa Phú', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội', 'Xã Phú Hòa Đông', 'Xã Phú Mỹ Hưng', 'Xã Phước Hiệp', 'Xã Phước Thạnh', 'Xã Phước Vĩnh An', 'Xã Tân An Hội', 'Xã Tân Phú Trung', 'Xã Tân Thạnh Đông', 'Xã Tân Thạnh Tây', 'Xã Tân Thông Hội', 'Xã Trung An'],
    'Huyện Hóc Môn': ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình', 'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân', 'Xã Thới Tam Thôn', 'Xã Trung Chánh', 'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng'],
    'Huyện Nhà Bè': ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc'],
    'Huyện Cần Giờ': ['Thị trấn Cần Thạnh', 'Xã An Thới Đông', 'Xã Bình Khánh', 'Xã Long Hòa', 'Xã Lý Nhơn', 'Xã Tam Thôn Hiệp', 'Xã Thạnh An']
  },
  'Thành phố Đà Nẵng': {
    'Quận Hải Châu': ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
    'Quận Thanh Khê': ['Phường An Khê', 'Phường Chính Gián', 'Phường Hòa Khê', 'Phường Tam Thuận', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Vĩnh Trung', 'Phường Xuân Hà'],
    'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải', 'Phường Hòa Quý'],
    'Quận Liên Chiểu': ['Phường Hòa Minh', 'Phường Hòa Khánh Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Hiệp Bắc'],
    'Quận Cẩm Lệ': ['Phường Khuê Trung', 'Phường Hòa Phát', 'Phường Hòa An', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây', 'Phường Hòa Xuân'],
    'Huyện Hòa Vang': ['Xã Hòa Bắc', 'Xã Hòa Châu', 'Xã Hòa Khương', 'Xã Hòa Liên', 'Xã Hòa Nhơn', 'Xã Hòa Ninh', 'Xã Hòa Phong', 'Xã Hòa Phú', 'Xã Hòa Phước', 'Xã Hòa Sơn', 'Xã Hòa Tiến'],
    'Huyện Hoàng Sa': ['Đặc khu Hoàng Sa']
  },
  'Thành phố Hải Phòng': {
    'Quận Hồng Bàng': ['Phường Hạ Lý', 'Phường Minh Khai', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối'],
    'Quận Ngô Quyền': ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đông Khê', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ'],
    'Quận Lê Chân': ['Phường An Biên', 'Phường An Dương', 'Phường Cát Dài', 'Phường Đông Hải', 'Phường Hàng Kênh', 'Phường Hồ Nam', 'Phường Kênh Dương', 'Phường Lam Sơn', 'Phường Niệm Nghĩa', 'Phường Nghĩa Xá', 'Phường Trại Cau', 'Phường Vĩnh Niệm'],
    'Quận Hải An': ['Phường Cát Bi', 'Phường Đằng Hải', 'Phường Đằng Lâm', 'Phường Đông Hải 1', 'Phường Đông Hải 2', 'Phường Nam Hải', 'Phường Thành Tô'],
    'Quận Kiến An': ['Phường Bắc Sơn', 'Phường Đồng Hòa', 'Phường Lãm Hà', 'Phường Nam Sơn', 'Phường Ngọc Sơn', 'Phường Phù Liễn', 'Phường Quán Trữ', 'Phường Tràng Minh'],
    'Quận Đồ Sơn': ['Phường Bàng La', 'Phường Hợp Đức', 'Phường Minh Đức', 'Phường Ngọc Xuyên', 'Phường Vạn Hương', 'Phường Vạn Sơn'],
    'Quận Dương Kinh': ['Phường Anh Dũng', 'Phường Đa Phúc', 'Phường Hưng Đạo', 'Phường Hòa Nghĩa', 'Phường Hải Thành', 'Phường Tân Thành'],
  },
  'Thành phố Cần Thơ': {
    'Quận Ninh Kiều': ['Phường An Bình', 'Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình'],
    'Quận Bình Thủy': ['Phường An Thới', 'Phường Bùi Hữu Nghĩa', 'Phường Bình Thủy', 'Phường Long Hòa', 'Phường Long Tuyền', 'Phường Thới An Đông', 'Phường Trà An', 'Phường Trà Nóc'],
    'Quận Cái Răng': ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Thường Thạnh', 'Phường Tân Phú'],
    'Quận Ô Môn': ['Phường Châu Văn Liêm', 'Phường Thới Hòa', 'Phường Thới Long', 'Phường Thới An', 'Phường Phước Thới', 'Phường Trường Lạc'],
    'Quận Thốt Nốt': ['Phường Thốt Nốt', 'Phường Thới Thuận', 'Phường Thuận An', 'Phường Trung Kiên', 'Phường Trung Nhứt', 'Phường Tân Hưng', 'Phường Thạnh Hòa'],
  },
  'Tỉnh An Giang': {
    'TP. Long Xuyên': ['Phường Mỹ Bình', 'Phường Mỹ Long', 'Phường Mỹ Xuyên', 'Phường Bình Đức', 'Phường Bình Khánh', 'Phường Mỹ Phước', 'Phường Mỹ Thới', 'Phường Mỹ Thạnh', 'Xã Mỹ Khánh'],
    'TP. Châu Đốc': ['Phường Núi Sam', 'Phường Châu Phú A', 'Phường Châu Phú B', 'Phường Vĩnh Mỹ', 'Phường Vĩnh Ngươn'],
    'Thị xã Tân Châu': ['Phường Long Châu', 'Phường Long Hưng', 'Phường Long Phú', 'Phường Long Sơn', 'Xã Châu Phong', 'Xã Lê Chân'],
    'Huyện An Phú': ['Thị trấn An Phú', 'Xã Khánh An', 'Xã Khánh Bình', 'Xã Nhơn Hội', 'Xã Phú Hội', 'Xã Quốc Thái'],
  },
  'Tỉnh Bà Rịa - Vũng Tàu': {
    'TP. Vũng Tàu': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường Thắng Nhất', 'Phường Thắng Nhì', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Xã Long Sơn'],
    'TP. Bà Rịa': ['Phường Phước Hưng', 'Phường Phước Trung', 'Phường Phước Nguyên', 'Phường Long Toàn', 'Phường Long Tâm', 'Phường Kim Dinh', 'Xã Long Phước'],
    'Thị xã Phú Mỹ': ['Phường Phú Mỹ', 'Phường Hắc Dịch', 'Phường Mỹ Xuân', 'Phường Phước Hòa', 'Phường Tân Phước', 'Xã Sông Xoài', 'Xã Tóc Tiên'],
  },
  'Tỉnh Bắc Giang': {
    'TP. Bắc Giang': ['Phường Lê Lợi', 'Phường Trần Nguyên Hãn', 'Phường Ngô Quyền', 'Phường Trần Phú', 'Phường Thọ Xương', 'Phường Mỹ Độ', 'Phường Đa Mai', 'Xã Song Mai', 'Xã Tân Tiến'],
    'Huyện Yên Thế': ['Thị trấn Bố Hạ', 'Thị trấn Cầu Gồ', 'Xã An Thượng', 'Xã Đồng Hưu', 'Xã Hồng Kỳ', 'Xã Tam Hiệp'],
  },
  'Tỉnh Bắc Kạn': {
    'TP. Bắc Kạn': ['Phường Sông Cầu', 'Phường Đức Xuân', 'Phường Phùng Chí Kiên', 'Phường Huyền Tụng', 'Xã Dương Quang', 'Xã Nông Thượng'],
  },
  'Tỉnh Bạc Liêu': {
    'TP. Bạc Liêu': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 7', 'Phường 8', 'Xã Hiệp Thành', 'Xã Vĩnh Trạch', 'Xã Vĩnh Trạch Đông'],
    'Thị xã Giá Rai': ['Phường Hộ Phòng', 'Phường Láng Tròn', 'Phường 1', 'Xã Phong Thạnh', 'Xã Phong Thạnh Tây'],
  },
  'Tỉnh Bắc Ninh': {
    'TP. Bắc Ninh': ['Phường Đáp Cầu', 'Phường Thị Cầu', 'Phường Vệ An', 'Phường Tiền An', 'Phường Đại Phúc', 'Phường Ninh Xá', 'Phường Suối Hoa', 'Phường Võ Cường', 'Phường Hòa Long', 'Phường Vạn An'],
    'Thị xã Từ Sơn': ['Phường Đông Ngàn', 'Phường Đồng Kỵ', 'Phường Trang Hạ', 'Phường Châu Khê', 'Phường Đình Bảng', 'Phường Đồng Nguyên'],
  },
  'Tỉnh Bến Tre': {
    'TP. Bến Tre': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Xã Bình Phú', 'Xã Mỹ Thức Tây', 'Xã Phú Hưng'],
  },
  'Tỉnh Bình Định': {
    'TP. Quy Nhơn': ['Phường Lê Lợi', 'Phường Trần Hưng Đạo', 'Phường Lý Thường Kiệt', 'Phường Lê Hồng Phong', 'Phường Ngô Mây', 'Phường Nguyễn Văn Cừ', 'Phường Ghềnh Ráng', 'Xã Nhơn Lý', 'Xã Nhơn Hội'],
  },
  'Tỉnh Bình Dương': {
    'TP. Thủ Dầu Một': ['Phường Chánh Mỹ', 'Phường Chánh Nghĩa', 'Phường Định Hòa', 'Phường Hiệp An', 'Phường Hiệp Thành', 'Phường Hòa Phú', 'Phường Phú Cường', 'Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Phú Tân', 'Phường Tân An', 'Phường Tương Bình Hiệp'],
    'TP. Dĩ An': ['Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Dĩ An', 'Phường Đông Hòa', 'Phường Tân Bình', 'Phường Tân Đông Hiệp'],
    'TP. Thuận An': ['Phường An Phú', 'Phường An Thạnh', 'Phường Bình Chuẩn', 'Phường Bình Hòa', 'Phường Bình Nhâm', 'Phường Hưng Định', 'Phường Lái Thiêu', 'Phường Thuận Giao', 'Phường An Sơn'],
    'Thị xã Bến Cát': ['Phường Chánh Phú Hòa', 'Phường Hòa Lợi', 'Phường Mỹ Phước', 'Phường Thới Hòa', 'Phường Tân Định', 'Xã An Điền', 'Xã An Tây', 'Xã Phú An'],
    'Thị xã Tân Uyên': ['Phường Khánh Bình', 'Phường Hội Nghĩa', 'Phường Uyên Hưng', 'Phường Tân Phước Khánh', 'Phường Tân Hiệp', 'Phường Thái Hòa', 'Xã Bạch Đằng', 'Xã Thạnh Hội', 'Xã Vĩnh Tân'],
  },
  'Tỉnh Bình Phước': {
    'TP. Đồng Xoài': ['Phường Tân Phú', 'Phường Tân Thiện', 'Phường Tân Xuân', 'Phường Tiến Thành', 'Phường Tân Đồng', 'Xã Tiến Hưng', 'Xã Tân Thành'],
  },
  'Tỉnh Bình Thuận': {
    'TP. Phan Thiết': ['Phường Đức Nghĩa', 'Phường Đức Thắng', 'Phường Hưng Long', 'Phường Lạc Đạo', 'Phường Phú Trinh', 'Phường Phú Tài', 'Phường Thanh Hải', 'Phường Mũi Né', 'Xã Tiến Lợi', 'Xã Tiến Thành'],
  },
  'Tỉnh Cà Mau': {
    'TP. Cà Mau': ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Xã An Xuyên', 'Xã Định Bình', 'Xã Tắc Vân', 'Xã Lý Văn Lâm'],
  },
  'Tỉnh Cao Bằng': {
    'TP. Cao Bằng': ['Phường Hợp Giang', 'Phường Sông Hiến', 'Phường Sông Bằng', 'Phường Đề Thám', 'Phường Duyệt Trung', 'Xã Vĩnh Quang'],
  },
  'Tỉnh Đắk Lắk': {
    'TP. Buôn Ma Thuột': ['Phường Thắng Lợi', 'Phường Thống Nhất', 'Phường Tân Lợi', 'Phường Tân Lập', 'Phường Tân An', 'Phường Ea Tam', 'Xã Cư Ê Bur', 'Xã Hòa Khánh', 'Xã Hòa Phú', 'Xã Hòa Thắng'],
  },
  'Tỉnh Đắk Nông': {
    'TP. Gia Nghĩa': ['Phường Nghĩa Trung', 'Phường Nghĩa Thành', 'Phường Nghĩa Đức', 'Phường Nghĩa Tân', 'Phường Quảng Thành', 'Xã Đắk R’Moan'],
  },
  'Tỉnh Điện Biên': {
    'TP. Điện Biên Phủ': ['Phường Mường Thanh', 'Phường Tân Thanh', 'Phường Him Lam', 'Phường Nam Thanh', 'Phường Thanh Trường', 'Xã Pá Khoang', 'Xã Mường Phăng'],
  },
  'Tỉnh Đồng Nai': {
    'TP. Biên Hòa': ['Phường Quyết Thắng', 'Phường Quang Vinh', 'Phường Trung Dũng', 'Phường Tân Vạn', 'Phường Hiệp Hòa', 'Phường Bửu Long', 'Phường Hòa Bình', 'Phường Thanh Bình', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường An Bình', 'Phường Bình Đa', 'Phường Tam Hiệp', 'Phường Tam Hòa', 'Phường Tân Tiến', 'Phường Tân Mai', 'Phường Phước Tân', 'Phường Tam Phước', 'Phường Long Hưng'],
    'TP. Long Khánh': ['Phường Xuân An', 'Phường Xuân Bình', 'Phường Xuân Hòa', 'Phường Xuân Lập', 'Phường Xuân Tân', 'Phường Xuân Thanh', 'Phường Xuân Trung', 'Xã Bàu Trâm', 'Xã Bình Lộc', 'Xã Hàng Gòn'],
    'Huyện Nhơn Trạch': ['Thị trấn Hiệp Phước', 'Xã Đại Phước', 'Xã Long Tân', 'Xã Long Thọ', 'Xã Phước An', 'Xã Phước Khánh', 'Xã Phước Thiền', 'Xã Vĩnh Thạnh'],
  },
  'Tỉnh Đồng Tháp': {
    'TP. Cao Lãnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 11', 'Xã Hòa An', 'Xã Tịnh Thới', 'Xã Tân Thuận Tây'],
    'TP. Sa Đéc': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường An Hòa', 'Phường Tân Quy Đông', 'Xã Tân Khánh Đông'],
  },
  'Tỉnh Gia Lai': {
    'TP. Pleiku': ['Phường Diên Hồng', 'Phường Hoa Lư', 'Phường Hội Thương', 'Phường Hội Phú', 'Phường Tây Sơn', 'Phường Trà Bá', 'Phường Yên Đỗ', 'Phường Thống Nhất', 'Xã Chư Á', 'Xã Gào'],
  },
  'Tỉnh Hà Giang': {
    'TP. Hà Giang': ['Phường Minh Khai', 'Phường Nguyễn Trãi', 'Phường Trần Phú', 'Phường Ngọc Hà', 'Xã Phương Độ', 'Xã Phương Thiện'],
  },
  'Tỉnh Hà Nam': {
    'TP. Phủ Lý': ['Phường Hai Bà Trưng', 'Phường Minh Khai', 'Phường Lê Hồng Phong', 'Phường Lương Khánh Thiện', 'Phường Quang Trung', 'Xã Liêm Chính', 'Xã Thanh Tuyền'],
  },
  'Tỉnh Hà Tĩnh': {
    'TP. Hà Tĩnh': ['Phường Nam Hà', 'Phường Bắc Hà', 'Phường Tân Giang', 'Phường Trần Phú', 'Phường Đại Nài', 'Phường Thạch Linh', 'Xã Thạch Trung'],
  },
  'Tỉnh Hải Dương': {
    'TP. Hải Dương': ['Phường Trần Phú', 'Phường Lê Thanh Nghị', 'Phường Phạm Ngũ Lão', 'Phường Quang Trung', 'Phường Nguyễn Trãi', 'Phường Thanh Bình', 'Xã Liên Hồng', 'Xã Ngọc Sơn'],
  },
  'Tỉnh Hậu Giang': {
    'TP. Vị Thanh': ['Phường I', 'Phường III', 'Phường IV', 'Phường V', 'Xã Hỏa Lựu', 'Xã Vị Tân'],
  },
  'Tỉnh Hòa Bình': {
    'TP. Hòa Bình': ['Phường Phương Lâm', 'Phường Đồng Tiến', 'Phường Tân Thịnh', 'Phường Thịnh Lang', 'Phường Hữu Nghị', 'Xã Sủ Ngòi'],
  },
  'Tỉnh Hưng Yên': {
    'TP. Hưng Yên': ['Phường An Tảo', 'Phường Hiến Nam', 'Phường Lê Lợi', 'Phường Minh Khai', 'Phường Quang Trung', 'Xã Liên Phương'],
  },
  'Tỉnh Khánh Hòa': {
    'TP. Nha Trang': ['Phường Lộc Thọ', 'Phường Tân Lập', 'Phường Phước Tiến', 'Phường Phước Tân', 'Phường Phước Hòa', 'Phường Vĩnh Thọ', 'Phường Vĩnh Phước', 'Phường Vĩnh Hải', 'Phường Vĩnh Hòa', 'Phường Phương Sài', 'Phường Xương Huân', 'Phường Vạn Thắng', 'Phường Vạn Thạnh', 'Xã Vĩnh Lương', 'Xã Vĩnh Ngọc', 'Xã Vĩnh Phương', 'Xã Vĩnh Thạnh', 'Xã Vĩnh Trung'],
    'TP. Cam Ranh': ['Phường Cam Linh', 'Phường Cam Lợi', 'Phường Cam Lộc', 'Phường Cam Nghĩa', 'Phường Cam Phú', 'Phường Cam Phúc Bắc', 'Phường Cam Phúc Nam', 'Phường Cam Thuận'],
  },
  'Tỉnh Kiên Giang': {
    'TP. Rạch Giá': ['Phường Vĩnh Bảo', 'Phường Vĩnh Lạc', 'Phường Vĩnh Lợi', 'Phường Vĩnh Thanh', 'Phường Vĩnh Thanh Vân', 'Phường An Bình', 'Phường An Hòa', 'Xã Phi Thông'],
    'TP. Phú Quốc': ['Phường Dương Đông', 'Phường An Thới', 'Xã Bãi Thơm', 'Xã Cửa Cạn', 'Xã Cửa Dương', 'Xã Dương Tơ', 'Xã Gành Dầu', 'Xã Hòn Thơm', 'Xã Thổ Châu'],
  },
  'Tỉnh Kon Tum': {
    'TP. Kon Tum': ['Phường Quyết Thắng', 'Phường Thắng Lợi', 'Phường Thống Nhất', 'Phường Quang Trung', 'Phường Trường Chinh', 'Phường Ngô Mây', 'Xã Đak Blà', 'Xã Hòa Bình'],
  },
  'Tỉnh Lai Châu': {
    'TP. Lai Châu': ['Phường Quyết Thắng', 'Phường Đoàn Kết', 'Phường Tân Phong', 'Phường Quyết Tiến', 'Xã San Thàng'],
  },
  'Tỉnh Lâm Đồng': {
    'TP. Đà Lạt': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Xã Tà Nung', 'Xã Trạm Hành'],
    'TP. Bảo Lộc': ['Phường 1', 'Phường 2', 'Phường B’Lao', 'Phường Lộc Sơn', 'Phường Lộc Phát', 'Phường Lộc Tiến', 'Xã Đại Lào', 'Xã Lộc Châu'],
  },
  'Tỉnh Lạng Sơn': {
    'TP. Lạng Sơn': ['Phường Chi Lăng', 'Phường Đông Kinh', 'Phường Hoàng Văn Thụ', 'Phường Vĩnh Trại', 'Xã Mai Pha'],
  },
  'Tỉnh Lào Cai': {
    'TP. Lào Cai': ['Phường Cốc Lếu', 'Phường Duyên Hải', 'Phường Kim Tân', 'Phường Lào Cai', 'Phường Nam Cường', 'Phường Phố Mới', 'Phường Pom Hán', 'Phường Bắc Cường', 'Xã Vạn Hòa', 'Xã Hợp Thành'],
  },
  'Tỉnh Long An': {
    'TP. Tân An': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Xã Lợi Bình Nhơn', 'Xã Hướng Thọ Phú', 'Xã Nhơn Thạnh Trung'],
  },
  'Tỉnh Nam Định': {
    'TP. Nam Định': ['Phường Cửa Bắc', 'Phường Cửa Nam', 'Phường Bà Triệu', 'Phường Hạ Long', 'Phường Ngô Quyền', 'Phường Nguyễn Du', 'Phường Phan Đình Phùng', 'Phường Quang Trung', 'Phường Thống Nhất', 'Phường Trần Hưng Đạo', 'Phường Văn Miếu', 'Xã Lộc An', 'Xã Lộc Vượng'],
  },
  'Tỉnh Nghệ An': {
    'TP. Vinh': ['Phường Lê Mao', 'Phường Quang Trung', 'Phường Đội Cung', 'Phường Lê Lợi', 'Phường Hưng Bình', 'Phường Hưng Phúc', 'Phường Hưng Dũng', 'Phường Trường Thi', 'Phường Bến Thuỷ', 'Phường Cửa Nam', 'Phường Trung Đô', 'Xã Hưng Lộc', 'Xã Hưng Chính', 'Xã Nghi Phú', 'Xã Nghi Ân'],
  },
  'Tỉnh Ninh Bình': {
    'TP. Ninh Bình': ['Phường Bích Đào', 'Phường Đông Thành', 'Phường Nam Bình', 'Phường Nam Thành', 'Phường Ninh Khánh', 'Phường Ninh Phong', 'Phường Ninh Sơn', 'Phường Tân Thành', 'Xã Ninh Phúc', 'Xã Ninh Tiến'],
  },
  'Tỉnh Ninh Thuận': {
    'TP. Phan Rang-Tháp Chàm': ['Phường Đạo Long', 'Phường Đài Sơn', 'Phường Đô Vinh', 'Phường Kinh Dinh', 'Phường Mỹ Hải', 'Phường Mỹ Hương', 'Phường Phước Mỹ', 'Phường Tấn Tài', 'Phường Thanh Sơn', 'Phường Văn Hải', 'Xã Thành Hải'],
  },
  'Tỉnh Phú Thọ': {
    'TP. Việt Trì': ['Phường Bạch Hạc', 'Phường Dữu Lâu', 'Phường Gia Cẩm', 'Phường Minh Nông', 'Phường Minh Phương', 'Phường Nông Trang', 'Phường Tân Dân', 'Phường Thọ Sơn', 'Phường Tiên Cát', 'Phường Vân Cơ', 'Phường Vân Phú', 'Xã Trưng Vương', 'Xã Sông Lô'],
  },
  'Tỉnh Phú Yên': {
    'TP. Tuy Hòa': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Xã Bình Kiến', 'Xã An Phú', 'Xã Hòa Kiến'],
  },
  'Tỉnh Quảng Bình': {
    'TP. Đồng Hới': ['Phường Đồng Mỹ', 'Phường Đồng Phú', 'Phường Đồng Sơn', 'Phường Hải Thành', 'Phường Nam Lý', 'Phường Bắc Lý', 'Phường Bắc Nghĩa', 'Xã Bảo Ninh', 'Xã Lộc Ninh', 'Xã Quang Phú'],
  },
  'Tỉnh Quảng Nam': {
    'TP. Tam Kỳ': ['Phường An Mỹ', 'Phường An Phú', 'Phường An Sơn', 'Phường Phước Hòa', 'Phường Tân Thạnh', 'Phường Trường Xuân', 'Xã Tam Ngọc', 'Xã Tam Thăng', 'Xã Tam Thanh'],
    'TP. Hội An': ['Phường Cẩm An', 'Phường Cẩm Châu', 'Phường Cẩm Nam', 'Phường Cẩm Phô', 'Phường Minh An', 'Phường Sơn Phong', 'Phường Tân An', 'Xã Cẩm Hà', 'Xã Cẩm Kim', 'Xã Cửa Đại', 'Xã Tân Hiệp (Cù Lao Chàm)'],
  },
  'Tỉnh Quảng Ngãi': {
    'TP. Quảng Ngãi': ['Phường Chánh Lộ', 'Phường Lê Hồng Phong', 'Phường Nghĩa Chánh', 'Phường Nghĩa Lộ', 'Phường Nghĩa Pha', 'Phường Nguyễn Ngiêm', 'Phường Trần Hưng Đạo', 'Phường Trần Phú', 'Xã Nghĩa Dũng', 'Xã Nghĩa Hà', 'Xã Tịnh An', 'Xã Tịnh Khê'],
  },
  'Tỉnh Quảng Ninh': {
    'TP. Hạ Long': ['Phường Bạch Đằng', 'Phường Bãi Cháy', 'Phường Cao Hanh', 'Phường Cao Xanh', 'Phường Đại Yên', 'Phường Giếng Đáy', 'Phường Hà Khẩu', 'Phường Hà Lầm', 'Phường Hà Phong', 'Phường Hà Trung', 'Phường Hà Tu', 'Phường Hòn Gai', 'Phường Hồng Gai', 'Phường Hồng Hà', 'Phường Hồng Hải', 'Phường Tuần Châu', 'Phường Việt Hưng', 'Xã Lê Lợi', 'Xã Tân An'],
    'TP. Móng Cái': ['Phường Hải Hòa', 'Phường Hải Yên', 'Phường Ka Long', 'Phường Ninh Dương', 'Phường Trần Phú', 'Xã Bắc Sơn', 'Xã Hải Sơn', 'Xã Quảng Nghĩa'],
    'TP. Cẩm Phả': ['Phường Cẩm Bình', 'Phường Cẩm Đông', 'Phường Cẩm Phú', 'Phường Cẩm Sơn', 'Phường Cẩm Thành', 'Phường Cẩm Tây', 'Phường Cẩm Thạch', 'Phường Cẩm Thành', 'Phường Cẩm Trung', 'Phường Cẩm Thịnh', 'Phường Cẩm Tây'],
  },
  'Tỉnh Quảng Trị': {
    'TP. Đông Hà': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường Đông Lễ', 'Phường Đông Lương', 'Phường Đông Thanh', 'Xã Gio Mai'],
  },
  'Tỉnh Sóc Trăng': {
    'TP. Sóc Trăng': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Xã An Hệp'],
  },
  'Tỉnh Sơn La': {
    'TP. Sơn La': ['Phường Chiềng Lề', 'Phường Quyết Thắng', 'Phường Quyết Tâm', 'Phường Tô Hiệu', 'Phường Chiềng Cơi', 'Phường Chiềng An', 'Phường Chiềng Xôm'],
  },
  'Tỉnh Tây Ninh': {
    'TP. Tây Ninh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường Hiệp Ninh', 'Phường Ninh Sơn', 'Phường Ninh Thạnh', 'Xã Bình Minh', 'Xã Tân Bình'],
  },
  'Tỉnh Thái Bình': {
    'TP. Thái Bình': ['Phường Bồ Xuyên', 'Phường Đề Hám', 'Phường Hoàng Diệu', 'Phường Kỳ Bá', 'Phường Phú Khánh', 'Phường Quang Trung', 'Phường Tiền Phong', 'Phường Trần Hưng Đạo', 'Phường Trần Lãm', 'Xã Đông Hòa', 'Xã Phú Xuân'],
  },
  'Tỉnh Thái Nguyên': {
    'TP. Thái Nguyên': ['Phường Hoàng Văn Thụ', 'Phường Trưng Vương', 'Phường Quang Trung', 'Phường Phan Đình Phùng', 'Phường Tân Thịnh', 'Phường Thịnh Đán', 'Phường Quyết Thận', 'Phường Đồng Bẩm', 'Phường Túc Duyên', 'Phường Chùa Hang', 'Xã Cao Ngạn', 'Xã Huống Thượng', 'Xã Quyết Thắng'],
    'TP. Sông Công': ['Phường Bách Quang', 'Phường Cải Đan', 'Phường Lương Sơn', 'Phường Mỏ Chè', 'Phường Phố Cò', 'Phường Thắng Lợi', 'Phường Vinh Sơn'],
  },
  'Tỉnh Thanh Hóa': {
    'TP. Thanh Hóa': ['Phường Ba Đình', 'Phường Điện Biên', 'Phường Đông Cương', 'Phường Đông Hải', 'Phường Đông Hương', 'Phường Đông Lĩnh', 'Phường Đông Sơn', 'Phường Đông Thọ', 'Phường Hàm Rồng', 'Phường Lam Sơn', 'Phường Nam Ngạn', 'Phường Ngọc Trạo', 'Phường Phú Sơn', 'Phường Quảng Hưng', 'Phường Quảng Thành', 'Phường Quảng Thịnh', 'Phường Tào Xuyên', 'Phường Tân Sơn', 'Phường Trường Thi', 'Xã Hoằng Đại', 'Xã Đông Vinh'],
    'TP. Sầm Sơn': ['Phường Bắc Sơn', 'Phường Quảng Cư', 'Phường Quảng Châu', 'Phường Quảng Thọ', 'Phường Quảng Tiến', 'Phường Quảng Vinh', 'Phường Trung Sơn', 'Phường Trường Sơn', 'Xã Quảng Minh', 'Xã Quảng Hùng'],
  },
  'Tỉnh Thừa Thiên Huế': {
    'Thành phố Huế': ['Phường An Cựu', 'Phường An Đông', 'Phường An Hòa', 'Phường An Tây', 'Phường Đông Ba', 'Phường Gia Hội', 'Phường Kim Long', 'Phường Phú Hội', 'Phường Phú Nhuận', 'Phường Phú Cát', 'Phường Phú Hiệp', 'Phường Phú Hậu', 'Phường Phước Vĩnh', 'Phường Tây Lộc', 'Phường Thuận Hòa', 'Phường Thuận Lộc', 'Phường Thuận Thành', 'Phường Trường An', 'Phường Vĩnh Ninh', 'Phường Vỹ Dạ', 'Phường Xuân Phú'],
  },
  'Tỉnh Tiền Giang': {
    'TP. Mỹ Tho': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Xã Đạo Thạnh', 'Xã Mỹ Phong', 'Xã Trung An'],
  },
  'Tỉnh Trà Vinh': {
    'TP. Trà Vinh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Xã Long Đức'],
  },
  'Tỉnh Tuyên Quang': {
    'TP. Tuyên Quang': ['Phường An Tường', 'Phường Đội Cấn', 'Phường Hưng Thành', 'Phường Minh Xuân', 'Phường Nông Tiến', 'Phường Tân Hà', 'Phường Ỷ La', 'Xã Tràng Đà'],
  },
  'Tỉnh Vĩnh Long': {
    'TP. Vĩnh Long': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 8', 'Phường 9', 'Xã Tân Ngãi', 'Xã Tân Hòa', 'Xã Trường An'],
  },
  'Tỉnh Vĩnh Phúc': {
    'TP. Vĩnh Yên': ['Phường Đống Đa', 'Phường Đồng Tâm', 'Phường Hội Hợp', 'Phường Khai Quang', 'Phường Liên Bảo', 'Phường Ngô Quyền', 'Phường Tích Sơn'],
    'TP. Phúc Yên': ['Phường Hùng Vương', 'Phường Nam Viêm', 'Phường Phúc Thắng', 'Phường Tiền Châu', 'Phường Trưng Trắc', 'Phường Trưng Nhị', 'Xã Cao Minh', 'Xã Ngọc Thanh'],
  },
  'Tỉnh Yên Bái': {
    'TP. Yên Bái': ['Phường Đồng Tâm', 'Phường Hồng Hà', 'Phường Minh Tân', 'Phường Nguyễn Thái Học', 'Phường Nam Cường', 'Phường Yên Ninh', 'Phường Hợp Minh', 'Xã Tuy Lộc', 'Xã Giới Phiên'],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [createdTotalAmount, setCreatedTotalAmount] = useState(0);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'store'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  const [customerGender, setCustomerGender] = useState<'anh' | 'chi'>('anh');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // 3 Cấp Địa Chính tự động đồng bộ (Tỉnh/Thành phố -> Quận/Huyện -> Phường/Xã)
  const provincesList = Object.keys(VIETNAM_ADMIN_DATA);
  const [province, setProvince] = useState('Thành phố Hồ Chí Minh');
  
  const districtsList = Object.keys(VIETNAM_ADMIN_DATA[province] || {});
  const [district, setDistrict] = useState(districtsList[0] || '');

  const wardsList = (VIETNAM_ADMIN_DATA[province] && VIETNAM_ADMIN_DATA[province][district]) || ['Phường / Xã khác'];
  const [ward, setWard] = useState(wardsList[0] || '');

  const [streetAddress, setStreetAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedStore, setSelectedStore] = useState('61-63 Trần Quang Khải, P. Tân Định, Quận 1');

  // Khi thay đổi Tỉnh / Thành phố
  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const newDistricts = Object.keys(VIETNAM_ADMIN_DATA[newProv] || {});
    const firstDist = newDistricts[0] || '';
    setDistrict(firstDist);
    const newWards = (VIETNAM_ADMIN_DATA[newProv] && VIETNAM_ADMIN_DATA[newProv][firstDist]) || ['Phường / Xã khác'];
    setWard(newWards[0] || '');
  };

  // Khi thay đổi Quận / Huyện
  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const newWards = (VIETNAM_ADMIN_DATA[province] && VIETNAM_ADMIN_DATA[province][newDist]) || ['Phường / Xã khác'];
    setWard(newWards[0] || '');
  };

  // VAT
  const [needVat, setNeedVat] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Voucher
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const syncUser = () => {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          setCurrentUser(parsed);
          if (parsed.name && !customerName) setCustomerName(parsed.name);
          if (parsed.phone && !customerPhone) setCustomerPhone(parsed.phone);
          if (parsed.email && !customerEmail) setCustomerEmail(parsed.email);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setIsAuthModalOpen(true);
      }
    };

    syncUser();
  }, []);

  const handleLoginSuccess = () => {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setCurrentUser(parsed);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.email) setCustomerEmail(parsed.email);
      } catch (err) {
        console.error(err);
      }
    }
    setIsAuthModalOpen(false);
    setToast({
      show: true,
      type: 'success',
      message: 'Đăng nhập thành công! Bạn có thể tiếp tục hoàn tất đơn hàng.',
    });
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'FOGO100') {
      setDiscountAmount(100000);
      setCouponError('');
      setToast({ show: true, type: 'success', message: 'Áp dụng mã giảm giá FOGO100: Giảm 100.000đ' });
    } else if (code === 'VIPAPPLE') {
      setDiscountAmount(500000);
      setCouponError('');
      setToast({ show: true, type: 'success', message: 'Áp dụng mã giảm giá VIPAPPLE: Giảm 500.000đ' });
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
      setToast({ show: true, type: 'error', message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.' });
    }
  };

  const shippingFee = 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount + shippingFee);
  const formatVnd = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (!rawUser) {
      setToast({ show: true, type: 'error', message: 'Vui lòng đăng nhập tài khoản để hoàn tất đơn hàng!' });
      setIsAuthModalOpen(true);
      return;
    }

    const userObj = JSON.parse(rawUser);
    const userId = userObj.id || userObj._id;

    if (!userId) {
      setToast({ show: true, type: 'error', message: 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!' });
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền họ và tên người nhận hàng.' });
      return;
    }

    if (!customerPhone.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng điền số điện thoại nhận hàng.' });
      return;
    }

    if (deliveryMethod === 'delivery' && !streetAddress.trim()) {
      setToast({ show: true, type: 'error', message: 'Vui lòng nhập số nhà và tên đường.' });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setToast({ show: true, type: 'error', message: 'Giỏ hàng đang trống, không thể tạo đơn hàng.' });
      return;
    }

    setIsSubmitting(true);

    // Ghép hoàn chỉnh địa chỉ nhận hàng
    const fullAddress = `${streetAddress.trim()}, ${ward}, ${district}, ${province}`;

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          gender: customerGender,
          deliveryMethod: deliveryMethod === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng',
          province,
          district,
          ward,
          address: fullAddress,
          storeAddress: deliveryMethod === 'store' ? selectedStore : undefined,
          note: note.trim(),
          paymentMethod,
          items: cartItems.map((item) => ({
            id: item.id,
            variantId: item.variantId || item.id,
            name: item.name || item.productName,
            storage: item.storage || 'Tiêu chuẩn',
            color: item.color || 'Mặc định',
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            imageUrl: item.imageUrl || item.image || '',
          })),
          subTotal: totalPrice,
          totalAmount: finalPrice,
          discountAmount,
          shippingFee,
          needVat,
          vatInfo: needVat ? { companyName, taxCode, companyAddress } : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Đặt hàng không thành công');
      }

      setToast({
        show: true,
        type: 'success',
        message: `Đặt hàng thành công! Mã đơn: ${result.data?.orderCode || ''}`,
      });

      if (paymentMethod === 'vnpay-qr' || paymentMethod === 'momo') {
        setCreatedOrderCode(result.data.orderCode);
        setCreatedTotalAmount(finalPrice);
        setIsQrModalOpen(true);
      } else {
        clearCart();
        setTimeout(() => {
          router.push(`/don-hang/${result.data.orderCode}`);
        }, 1200);
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      setToast({
        show: true,
        type: 'error',
        message: error.message || 'Không thể kết nối máy chủ đặt hàng. Vui lòng thử lại!',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmQrSuccess = () => {
    clearCart();
    setIsQrModalOpen(false);
    router.push(`/don-hang/${createdOrderCode}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between select-none relative">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <div>
        <div className="sticky top-0 z-50 shadow-md">
          <Header />
          <Navbar />
        </div>

        <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-gray-500">
            <Link href="/" className="hover:text-[#d70018]">Trang chủ</Link>
            <span>/</span>
            <Link href="/iphone" className="hover:text-[#d70018]">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Thanh toán & Đặt hàng</span>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/iphone" className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#d70018] transition-colors">
              <ChevronLeft size={16} />
              <span>Tiếp tục mua hàng</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              THANH TOÁN ĐƠN HÀNG
            </h1>
            <div className="w-16" />
          </div>

          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Đang đặt hàng với tài khoản: <strong>{currentUser.name || currentUser.email}</strong>
                </span>
              </div>
              <Link href="/tai-khoan/don-hang" className="font-bold underline hover:text-emerald-950">
                Đơn hàng của tôi
              </Link>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-3 rounded mb-6 flex items-center justify-between">
              <span>Bạn chưa đăng nhập. Vui lòng đăng nhập để lưu và theo dõi đơn hàng của mình.</span>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#d70018] text-white px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors cursor-pointer"
              >
                <LogIn size={14} />
                <span>Đăng nhập ngay</span>
              </button>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-md p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <p className="text-gray-600 font-semibold mb-4">Giỏ hàng của bạn đang trống.</p>
              <Link href="/iphone" className="bg-[#d70018] text-white px-6 py-2.5 rounded font-bold text-xs inline-flex items-center gap-2 hover:bg-[#b50014] transition-colors">
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. THÔNG TIN KHÁCH HÀNG */}
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>1. Thông tin người đặt hàng</span>
                  </h2>

                  <div className="flex items-center gap-6 mb-4 text-xs font-semibold text-gray-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={customerGender === 'anh'}
                        onChange={() => setCustomerGender('anh')}
                        className="accent-[#d70018]"
                      />
                      <span>Anh</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={customerGender === 'chi'}
                        onChange={() => setCustomerGender('chi')}
                        className="accent-[#d70018]"
                      />
                      <span>Chị</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Họ và tên <span className="text-[#d70018]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Số điện thoại nhận hàng <span className="text-[#d70018]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ví dụ: 0987654321"
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Email (để nhận hóa đơn điện tử)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. HÌNH THỨC NHẬN HÀNG */}
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>2. Hình thức nhận hàng</span>
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`py-2.5 px-3 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Truck size={16} />
                      <span>Giao hàng tận nơi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('store')}
                      className={`py-2.5 px-3 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryMethod === 'store'
                          ? 'border-2 border-[#d70018] text-[#d70018] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <Store size={16} />
                      <span>Nhận tại cửa hàng</span>
                    </button>
                  </div>

                  {deliveryMethod === 'delivery' ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Tỉnh / Thành phố */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Tỉnh / Thành phố</label>
                          <select
                            value={province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-2.5 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {provincesList.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Quận / Huyện */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Quận / Huyện</label>
                          <select
                            value={district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-2.5 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {districtsList.map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Phường / Xã */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Phường / Xã</label>
                          <select
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-2.5 py-2.5 bg-white focus:border-[#d70018] focus:outline-none"
                          >
                            {wardsList.map((wName) => (
                              <option key={wName} value={wName}>{wName}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Số nhà, Tên đường <span className="text-[#d70018]">*</span>
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod === 'delivery'}
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Ghi chú giao hàng</label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 focus:border-[#d70018] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Chọn chi nhánh Fogo Store:</label>
                      {[
                        '61-63 Trần Quang Khải, P. Tân Định, Quận 1',
                        '243-245A Dương Bá Trạc, Phường 1, Quận 8',
                        '179 Khánh Hội, Phường 3, Quận 4',
                        '490-492 Lê Hồng Phong, Phường 1, Quận 10',
                      ].map((st, i) => (
                        <label
                          key={i}
                          className={`flex items-start gap-2.5 p-3 rounded border cursor-pointer text-xs transition-colors ${
                            selectedStore === st
                              ? 'border-[#d70018] bg-red-50/40 text-gray-900 font-semibold'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="storeSelect"
                            checked={selectedStore === st}
                            onChange={() => setSelectedStore(st)}
                            className="mt-0.5 accent-[#d70018]"
                          />
                          <div>
                            <span className="font-bold block text-gray-900">Chi nhánh {i + 1}: {st}</span>
                            <span className="text-[11px] text-emerald-600 font-medium">Sẵn hàng - Giữ máy trong 24 giờ</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. PHƯƠNG THỨC THANH TOÁN */}
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <span className="w-1.5 h-4 bg-[#d70018] inline-block" />
                    <span>3. Chọn phương thức thanh toán</span>
                  </h2>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'cod',
                        title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                        desc: 'Nhận máy, kiểm tra hàng chính hãng rồi mới trả tiền',
                        icon: <Receipt size={18} className="text-[#d70018]" />,
                      },
                      {
                        id: 'vnpay-qr',
                        title: 'Chuyển khoản / Quét mã VietQR',
                        desc: 'Hiển thị mã QR có sẵn số tiền & nội dung đơn hàng để quét',
                        icon: <QrCode size={18} className="text-[#d70018]" />,
                      },
                      {
                        id: 'card',
                        title: 'Thanh toán thẻ Visa, MasterCard, JCB, Thẻ ATM',
                        desc: 'Không mất phí thanh toán, bảo mật quốc tế',
                        icon: <CreditCard size={18} className="text-[#d70018]" />,
                      },
                      {
                        id: 'momo',
                        title: 'Ví MoMo / ZaloPay',
                        desc: 'Quét mã thanh toán qua ví điện tử',
                        icon: <Wallet size={18} className="text-[#d70018]" />,
                      },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                          paymentMethod === p.id
                            ? 'border-2 border-[#d70018] bg-red-50/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === p.id}
                          onChange={() => setPaymentMethod(p.id)}
                          className="mt-1 accent-[#d70018]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                            {p.icon}
                            <span>{p.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">{p.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* VAT */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={needVat}
                        onChange={(e) => setNeedVat(e.target.checked)}
                        className="rounded accent-[#d70018]"
                      />
                      <span>Yêu cầu xuất hóa đơn điện tử VAT (Công ty / Doanh nghiệp)</span>
                    </label>

                    {needVat && (
                      <div className="mt-3.5 space-y-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <input
                          type="text"
                          required={needVat}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tên công ty đầy đủ theo ĐKKD"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          placeholder="Mã số thuế"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                        <input
                          type="text"
                          required={needVat}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Địa chỉ trụ sở công ty"
                          className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: GIỎ HÀNG & NÚT ĐẶT HÀNG */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Đơn hàng của bạn</span>
                      <span className="text-gray-400 text-xs font-normal">({cartItems.length} món)</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-3.5 flex gap-3 items-start">
                        <div className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-200 rounded p-1 flex items-center justify-center">
                          <img src={item.imageUrl || '/placeholder.png'} alt={item.name || 'Sản phẩm'} className="max-h-full max-w-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Phân loại: <strong className="text-gray-700">{item.storage || 'Tiêu chuẩn'}</strong> - {item.color || 'Mặc định'}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-300 rounded bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-black text-[#d70018]">
                              {formatVnd(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mã giảm giá */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Mã: FOGO100 hoặc VIPAPPLE"
                          className="w-full text-xs border border-gray-300 rounded pl-8 pr-3 py-2 uppercase font-semibold focus:outline-none focus:border-[#d70018]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {discountAmount > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Đã áp dụng mã giảm giá thành công!</span>
                      </p>
                    )}
                    {couponError && <p className="text-[11px] text-red-500 font-medium mt-1.5">{couponError}</p>}
                  </div>

                  {/* Tiền hàng */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính tiền hàng:</span>
                      <span className="font-semibold text-gray-900">{formatVnd(totalPrice)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Giảm giá khuyến mại:</span>
                        <span>-{formatVnd(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Phí giao hàng:</span>
                      <span className="text-emerald-600 font-semibold">Miễn phí</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-900">TỔNG TIỀN THANH TOÁN:</span>
                      <span className="text-base md:text-lg font-black text-[#d70018]">{formatVnd(finalPrice)}</span>
                    </div>
                  </div>

                  {/* Nút Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#d70018] hover:bg-[#b50014] text-white py-3.5 rounded font-black text-sm uppercase tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>ĐANG TẠO ĐƠN HÀNG...</span>
                      </>
                    ) : (
                      <>
                        <span>HOÀN TẤT ĐẶT HÀNG</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Bảo mật 100%</span>
                    </span>
                    <span>•</span>
                    <span>Chính hãng VN/A</span>
                    <span>•</span>
                    <span>Đổi mới 30 ngày</span>
                  </div>
                </div>
              </div>

            </form>
          )}
        </main>
      </div>

      <QrPaymentModal
        isOpen={isQrModalOpen}
        orderCode={createdOrderCode}
        totalAmount={createdTotalAmount}
        onClose={() => setIsQrModalOpen(false)}
        onSuccess={handleConfirmQrSuccess}
      />

      <Footer />
    </div>
  );
}