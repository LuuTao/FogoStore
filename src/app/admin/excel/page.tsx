'use client';

import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Database,
} from 'lucide-react';

const API_URL = 'https://fogo-store-api.onrender.com';

interface ParsedProduct {
  name: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  stock: number;
  color: string;
  storage: string;
  imageUrl: string;
  isValid: boolean;
  error?: string;
}

export default function ExcelImportAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. TẢI FILE EXCEL MẪU
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Tên Sản Phẩm (*)': 'iPhone 16 Pro Max 256GB Desert Titanium',
        'Danh Mục (*) (iphone/macbook/ipad/watch/phu-kien/hang-cu)': 'iphone',
        'Giá Bán (*)': 34990000,
        'Giá Niêm Yết': 36990000,
        'Số Lượng Kho (*)': 20,
        'Màu Sắc': 'Titan Sa Mạc',
        'Dung Lượng': '256GB',
        'Link Ảnh (URL)': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
      },
      {
        'Tên Sản Phẩm (*)': 'MacBook Air M3 13 inch 16GB 256GB',
        'Danh Mục (*) (iphone/macbook/ipad/watch/phu-kien/hang-cu)': 'macbook',
        'Giá Bán (*)': 27490000,
        'Giá Niêm Yết': 29990000,
        'Số Lượng Kho (*)': 15,
        'Màu Sắc': 'Midnight',
        'Dung Lượng': '256GB',
        'Link Ảnh (URL)': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
      },
      {
        'Tên Sản Phẩm (*)': 'Củ Sạc Nhanh Apple 20W Type-C Chính Hãng',
        'Danh Mục (*) (iphone/macbook/ipad/watch/phu-kien/hang-cu)': 'phu-kien',
        'Giá Bán (*)': 490000,
        'Giá Niêm Yết': 590000,
        'Số Lượng Kho (*)': 100,
        'Màu Sắc': 'Trắng',
        'Dung Lượng': '',
        'Link Ảnh (URL)': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Hang');

    // Tự động căn chỉnh độ rộng cột
    worksheet['!cols'] = [
      { wch: 45 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
      { wch: 50 },
    ];

    XLSX.writeFile(workbook, 'FogoStore_Mau_Nhap_SanPham.xlsx');
  };

  // 2. ĐỌC FILE EXCEL KHI NGƯỜI DÙNG TẢI LÊN
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;

  setFile(selectedFile);
  setStatusMessage(null);
  setLoading(true);

  try {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await selectedFile.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    const rows: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Bỏ qua hàng tiêu đề
      const values = row.values as any[];
      rows.push({
        name: String(values[1] || '').trim(),
        categorySlug: String(values[2] || 'iphone').trim().toLowerCase(),
        price: Number(String(values[3] || 0).replace(/[^0-9]/g, '')),
        originalPrice: Number(String(values[4] || values[3] || 0).replace(/[^0-9]/g, '')),
        stock: Number(values[5] || 0),
        color: String(values[6] || 'Mặc định').trim(),
        storage: String(values[7] || '').trim(),
        imageUrl: String(values[8] || '').trim(),
      });
    });

    const validCategories = ['iphone', 'macbook', 'ipad', 'watch', 'phu-kien', 'hang-cu'];
    const mapped = rows.map((r) => {
      let isValid = true;
      let error = '';
      if (!r.name) {
        isValid = false;
        error = 'Thiếu tên sản phẩm';
      } else if (r.price <= 0) {
        isValid = false;
        error = 'Giá bán phải > 0';
      } else if (!validCategories.includes(r.categorySlug)) {
        isValid = false;
        error = `Danh mục không hợp lệ (${r.categorySlug})`;
      }
      return { ...r, isValid, error };
    });

    setParsedData(mapped);
  } catch (err) {
    setStatusMessage({ type: 'error', text: 'Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file!' });
  } finally {
    setLoading(false);
  }
};

  // 3. XÓA BỎ FILE ĐÃ CHỌN
  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setStatusMessage(null);
  };

  // 4. LƯU HÀNG LOẠT VÀO DATABASE BACKEND
  const handleSaveToDatabase = async () => {
    const validItems = parsedData.filter((i) => i.isValid);
    if (validItems.length === 0) {
      alert('Không có sản phẩm nào hợp lệ để thêm vào kho!');
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      // Gửi mảng sản phẩm lên API backend Render
      const res = await fetch(`${API_URL}/api/admin/products/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validItems }),
      });
      const json = await res.json();

      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: `Đã nhập thành công ${validItems.length} sản phẩm vào cơ sở dữ liệu kho Neon DB!`,
        });
        setParsedData([]);
        setFile(null);
      } else {
        throw new Error(json.error || 'Máy chủ backend từ chối ghi dữ liệu');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi kết nối khi gửi dữ liệu lên máy chủ',
      });
    } finally {
      setUploading(false);
    }
  };

  const validCount = parsedData.filter((i) => i.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-[#d70018]" size={26} />
            <span>Nhập Sản Phẩm Hàng Loạt Qua Excel</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Đồng bộ bảng tính vào cơ sở dữ liệu kho hàng tự động chỉ với 1 cú click
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-[#d70018] text-gray-700 hover:text-[#d70018] rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer w-fit"
        >
          <Download size={16} />
          <span>Tải File Excel Mẫu (.xlsx)</span>
        </button>
      </div>

      {/* THÔNG BÁO TRẠNG THÁI */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KHU VỰC TẢI FILE */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-2xs space-y-6">
        <div className="border-2 border-dashed border-gray-300 hover:border-[#d70018] rounded-xl p-8 sm:p-10 text-center transition-all bg-gray-50/50 hover:bg-red-50/20 group">
          <FileSpreadsheet
            size={46}
            className="mx-auto text-gray-400 group-hover:text-[#d70018] transition-colors mb-3"
          />
          <p className="text-sm font-bold text-gray-800">
            {file ? file.name : 'Kéo thả file Excel vào đây hoặc bấm nút để chọn tập tin'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Hỗ trợ các định dạng .xlsx, .xls (Dung lượng tối đa 15MB)</p>

          <input
            type="file"
            id="excel-file-input"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-5 flex items-center justify-center gap-3">
            <label
              htmlFor="excel-file-input"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Upload size={15} />
              <span>{file ? 'Đổi File Khác' : 'Chọn File Excel'}</span>
            </label>

            {file && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Hủy</span>
              </button>
            )}
          </div>
        </div>

        {/* HƯỚNG DẪN ĐIỀN CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <span className="font-bold text-gray-800 block mb-1">1. Danh mục chuẩn</span>
            <p className="text-gray-500">
              Điền chính xác 1 trong 6 mã: <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">iphone</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">macbook</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">ipad</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">watch</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">phu-kien</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#d70018] font-bold">hang-cu</code>.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <span className="font-bold text-gray-800 block mb-1">2. Định dạng số tiền</span>
            <p className="text-gray-500">
              Điền số nguyên trơn (Ví dụ: <code className="bg-white px-1 py-0.5 rounded font-bold">34990000</code>). Hệ thống tự động loại bỏ dấu chấm/phẩy/chữ &apos;đ&apos;.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <span className="font-bold text-gray-800 block mb-1">3. Đường dẫn ảnh</span>
            <p className="text-gray-500">
              Dán URL ảnh trực tiếp từ Unsplash, Imgur hoặc link ảnh Apple để hiển thị thumbnail sản phẩm sắc nét.
            </p>
          </div>
        </div>
      </div>

      {/* BẢNG PREVIEW DỮ LIỆU ĐỌC ĐƯỢC TỪ FILE */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-2xs">
          <Loader2 size={32} className="animate-spin text-[#d70018] mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-600">Đang đọc và phân tích cấu trúc dữ liệu bảng tính...</p>
        </div>
      )}

      {!loading && parsedData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Xem Trước Dữ Liệu ({parsedData.length} sản phẩm)
                </h2>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ {validCount} hợp lệ
                </span>
                {invalidCount > 0 && (
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded">
                    ✕ {invalidCount} lỗi cần sửa
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={validCount === 0 || uploading}
              onClick={handleSaveToDatabase}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#d70018] hover:bg-[#b50014] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang Lưu Vào Neon DB...</span>
                </>
              ) : (
                <>
                  <Database size={16} />
                  <span>Xác Nhận Nhập {validCount} Sản Phẩm Vào Kho</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3">Tên Sản Phẩm</th>
                  <th className="py-3 px-3">Danh Mục</th>
                  <th className="py-3 px-3">Giá Bán</th>
                  <th className="py-3 px-3">Kho</th>
                  <th className="py-3 px-3">Màu/Dung lượng</th>
                  <th className="py-3 px-3 text-center">Ảnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {parsedData.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50/60 ${!item.isValid ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.isValid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Hợp lệ
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          {item.error}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 max-w-[220px] truncate">
                      {item.name || '---'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
                        {item.categorySlug}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-[#d70018] whitespace-nowrap">
                      {item.price > 0 ? item.price.toLocaleString('vi-VN') + 'đ' : 'Lỗi giá'}
                    </td>
                    <td className="py-3 px-3 font-bold">{item.stock}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {[item.color, item.storage].filter(Boolean).join(' - ') || 'Mặc định'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-9 h-9 rounded border border-gray-200 p-0.5 mx-auto flex items-center justify-center bg-white">
                        <img
                          src={item.imageUrl}
                          alt="Thumb"
                          className="max-w-full max-h-full object-contain"
                          onError={(e: any) => {
                            e.target.src = 'https://placehold.co/100x100?text=No+Img';
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}