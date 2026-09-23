'use client';

import React, { useState } from 'react';
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, FileCheck } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function ImportPostsPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const getAdminToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('fogo_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      ''
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus(null);

    try {
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/admin/posts/import`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ 
          type: 'success', 
          message: data.message || 'Đã nhập dữ liệu bài viết vào hệ thống thành công!' 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: data.message || data.error || 'Có lỗi xảy ra trong quá trình nạp dữ liệu bài viết.' 
        });
      }
    } catch {
      setStatus({ 
        type: 'error', 
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.' 
      });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 select-none max-w-full">
      {/* Tiêu đề & Giới thiệu */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Nhập Bài Viết Tự Động Bằng Excel & Word
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Hỗ trợ file xuất danh sách bài viết từ Haravan (.xlsx, .xls, .csv) hoặc bài viết đơn lẻ từ Microsoft Word (.docx).
        </p>
      </div>

      {/* Khung tải file trung tâm phong cách Fogo Admin */}
      <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center space-y-5 shadow-2xs transition-all hover:border-gray-400">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
          <FileText size={42} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Tải Lên File Bài Viết (.xlsx, .xls, .csv, .docx)
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Hệ thống tự động chuyển đổi định dạng: Word (.docx) sang HTML chuẩn SEO, hoặc trích xuất hàng loạt tiêu đề, đường dẫn (slug) và hình ảnh từ bảng tính Excel.
          </p>
        </div>

        {/* Thông báo kết quả */}
        {status && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 max-w-lg mx-auto animate-in fade-in duration-200 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Nút chọn file */}
        <div>
          <label
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#d70018] hover:bg-[#b50014] cursor-pointer active:scale-98'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang phân tích tài liệu và lưu bài viết...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Chọn File Excel Hoặc Word</span>
              </>
            )}
            <input
              type="file"
              accept=".xlsx, .xls, .csv, .docx"
              onChange={handleUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        {loading && (
          <p className="text-xs text-blue-600 font-medium animate-pulse">
            Đang phân tích cấu trúc bài viết và hình ảnh, vui lòng không tắt hoặc tải lại trang...
          </p>
        )}
      </div>

      {/* Hộp hướng dẫn định dạng file */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Đối với file Excel (.xlsx / .csv)</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            File cần có các cột tiêu đề ở dòng 1: <b>Title</b> (Tiêu đề), <b>Handle</b> (Slug), <b>Summary</b> (Tóm tắt), <b>Image Src</b> (Ảnh đại diện), và <b>Body (HTML)</b> (Nội dung).
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <FileCheck size={16} className="text-blue-600" />
            <span>Đối với file Word (.docx)</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Hệ thống lấy tên file làm tiêu đề bài viết, tự sinh URL thân thiện và chuyển toàn bộ định dạng heading, đoạn văn, danh sách trong file Word thành mã HTML.
          </p>
        </div>
      </div>
    </div>
  );
}