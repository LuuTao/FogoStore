'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  categoryKey?: string;
  defaultContent?: string;
}

const DEFAULT_TEXT = `iPhone là dòng điện thoại thông minh cao cấp được thiết kế, phát triển và bán bởi Apple Inc. Kể từ khi ra mắt lần đầu tiên vào năm 2007, iPhone đã trở thành một trong những sản phẩm công nghệ có ảnh hưởng nhất mọi thời đại, dẫn đầu xu hướng smartphone và thay đổi cách mọi người sử dụng điện thoại.

Lịch sử ra mắt
Dưới đây là danh sách tất cả các sản phẩm iPhone đã được ra mắt theo thứ tự thời gian, bao gồm cả các phiên bản khác nhau:
2007: iPhone (bản gốc)
2008: iPhone 3G
2009: iPhone 3GS
2010: iPhone 4
2011: iPhone 4S
2012: iPhone 5
2013: iPhone 5C, iPhone 5S
2014: iPhone 6, iPhone 6 Plus
2015: iPhone 6S, iPhone 6S Plus
2016: iPhone SE, iPhone 7, iPhone 7 Plus
2017: iPhone 8, iPhone 8 Plus, iPhone X
2018: iPhone XR, iPhone XS, iPhone XS Max
2019: iPhone 11, iPhone 11 Pro, iPhone 11 Pro Max
2020: iPhone SE (2nd gen), iPhone 12, iPhone 12 mini, iPhone 12 Pro, iPhone 12 Pro Max
2021: iPhone 13, iPhone 13 mini, iPhone 13 Pro, iPhone 13 Pro Max
2022: iPhone SE (3rd gen), iPhone 14, iPhone 14 Plus, iPhone 14 Pro, iPhone 14 Pro Max
2023: iPhone 15, iPhone 15 Plus, iPhone 15 Pro, iPhone 15 Pro Max

Đặc điểm nổi bật
iPhone được biết đến với nhiều tính năng nổi bật, bao gồm:
Hệ điều hành iOS: Mượt mà, dễ sử dụng và được cập nhật thường xuyên.
Thiết kế: Sang trọng, cao cấp và có độ hoàn thiện cao.
Màn hình: Hiển thị sắc nét, sống động với độ phân giải cao.
Camera: Chụp ảnh và quay phim chất lượng cao.
Hiệu năng: Mạnh mẽ, xử lý nhanh chóng và đa nhiệm tốt.
Ứng dụng: Kho ứng dụng App Store phong phú với hàng triệu ứng dụng hữu ích và thú vị.

Tác động
iPhone đã có tác động to lớn đến ngành công nghiệp di động và xã hội nói chung. Một số tác động tiêu biểu bao gồm:
Thúc đẩy sự phát triển của smartphone: iPhone đã truyền cảm hứng cho các nhà sản xuất khác tạo ra những chiếc smartphone tốt hơn với nhiều tính năng mới.
Thay đổi cách mọi người sử dụng điện thoại: iPhone đã khiến mọi người sử dụng điện thoại nhiều hơn cho nhiều mục đích khác nhau như lướt web, chơi game, xem phim, nghe nhạc, v.v.
Tạo ra một nền tảng ứng dụng mới: App Store của iPhone đã trở thành nền tảng ứng dụng di động lớn nhất thế giới với hàng triệu ứng dụng được phát triển cho iPhone.

Kết luận
iPhone là một sản phẩm công nghệ đột phá đã thay đổi cách mọi người sử dụng điện thoại. Với thiết kế đẹp mắt, hệ điều hành mượt mà, camera chụp ảnh ấn tượng và kho ứng dụng phong phú, iPhone luôn là một trong những chiếc điện thoại thông minh được mong muốn nhất trên thị trường.`;

export const IPhoneSeoContent: React.FC<Props> = ({
  categoryKey = 'iphone_seo_desc',
  defaultContent = DEFAULT_TEXT,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState<string>(defaultContent);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fogo_seo_${categoryKey}`);
      if (saved && saved.trim()) {
        setContent(saved);
      }
    } catch (e) {
      console.error('Lỗi khi đọc nội dung SEO:', e);
    }
  }, [categoryKey]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-5 md:p-8 shadow-xs my-10 relative">
      <div
        className={`relative overflow-hidden transition-all duration-500 text-xs md:text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line ${
          isExpanded ? 'max-h-full pb-2' : 'max-h-[170px]'
        }`}
      >
        {content}

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      <div className="flex justify-center mt-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-2 rounded-full border border-gray-300 hover:border-[#d70018] text-gray-700 hover:text-[#d70018] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
        >
          {isExpanded ? (
            <>
              <span>Rút gọn</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Xem thêm</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};