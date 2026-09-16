'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function ProductsExcelTab({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/products/import-excel`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        onSuccess();
      } else {
        setStatus({ type: 'error', message: data.error || 'Có lỗi xảy ra trong quá trình nạp dữ liệu.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.' });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xl font-extrabold text-gray-900">Nhập Sản Phẩm Tự Động Bằng Excel</h2>
        <p className="text-xs text-gray-500 mt-1">
          Hỗ trợ trực tiếp file xuất từ Haravan (tự động nhận diện Dung lượng, Màu sắc, Giá và bài viết Mô tả HTML)
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 text-center space-y-4 shadow-2xs">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FileSpreadsheet size={36} />
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-800">Tải Lên File Excel (.xlsx, .xls)</h3>
          <p className="text-xs text-gray-500 mt-1">
            Đã tích hợp bộ lọc tự động: Bỏ qua dòng ảnh rác, lưu trọn vẹn HTML mô tả và gom biến thể.
          </p>
        </div>

        {status && (
          <div
            className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 max-w-lg mx-auto ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        <div>
          <label
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#d70018] hover:bg-red-700 cursor-pointer active:scale-98'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang phân tích file và lưu vào Database...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Chọn File Excel Haravan</span>
              </>
            )}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        {loading && (
          <p className="text-xs text-blue-600 font-medium animate-pulse">
            Đang xử lý toàn bộ các sản phẩm và biến thể, vui lòng không tắt trình duyệt...
          </p>
        )}
      </div>
    </div>
  );
}