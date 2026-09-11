'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export default function ProductsExcelTab({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/products/import-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onSuccess();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Không thể tải file lên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-gray-800">Nhập Sản Phẩm Tự Động Bằng Excel</h2>
      <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center space-y-4">
        <FileSpreadsheet size={48} className="mx-auto text-emerald-600" />
        <div>
          <h3 className="text-sm font-bold text-gray-800">Tải Lên File Excel (.xlsx)</h3>
          <p className="text-xs text-gray-500 mt-1">
            Cột bắt buộc: <span className="font-bold">Tên, Danh Mục, Dung Lượng, Màu Sắc, Giá Bán, Tồn Kho, Ảnh</span>
          </p>
        </div>
        <label className="inline-flex items-center gap-2 bg-[#d70018] text-white px-5 py-2.5 rounded-md text-xs font-bold cursor-pointer hover:bg-red-700">
          <Upload size={16} /> Chọn File Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleUpload} className="hidden" />
        </label>
        {loading && <p className="text-xs text-blue-600 font-bold">Đang nạp dữ liệu vào Database...</p>}
      </div>
    </div>
  );
}