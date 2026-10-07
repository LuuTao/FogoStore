'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { adminImportExcel, adminPreviewExcel } from '@/services/adminApi';

type ImportSummary = {
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
  variantsUnchanged: number;
  conflicts: number;
  skippedRows: number;
  duplicateRows: number;
};

type ImportResult = {
  success: boolean;
  preview?: boolean;
  message?: string;
  error?: string;
  summary?: ImportSummary;
  warnings?: string[];
};

const summaryLabels: Array<{ key: keyof ImportSummary; label: string; tone: string }> = [
  { key: 'productsCreated', label: 'Model tạo mới', tone: 'text-emerald-700 bg-emerald-50' },
  { key: 'productsUpdated', label: 'Model cập nhật', tone: 'text-blue-700 bg-blue-50' },
  { key: 'variantsCreated', label: 'Cấu hình tạo mới', tone: 'text-emerald-700 bg-emerald-50' },
  { key: 'variantsUpdated', label: 'Cấu hình cập nhật', tone: 'text-blue-700 bg-blue-50' },
  { key: 'variantsUnchanged', label: 'Không thay đổi', tone: 'text-gray-700 bg-gray-100' },
  { key: 'conflicts', label: 'Xung đột', tone: 'text-red-700 bg-red-50' },
];

export default function ProductsExcelTab() {
  const [loading, setLoading] = useState<'preview' | 'import' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const uploadFile = async (file: File, preview: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preview', String(preview));

    setLoading(preview ? 'preview' : 'import');
    if (!preview) setResult(null);

    try {
      const data = await (preview ? adminPreviewExcel(formData) : adminImportExcel(formData)) as ImportResult;
      setResult(data);
      if (data.success && !preview) setSelectedFile(null);
    } catch {
      setResult({
        success: false,
        error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    void uploadFile(file, true);
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setResult(null);
  };

  const isPreviewReady = Boolean(selectedFile && result?.success && result.preview && result.summary);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xl font-extrabold text-gray-900">Nhập Sản Phẩm Tự Động Bằng Excel</h2>
        <p className="mt-1 text-xs text-gray-500">
          Hệ thống xem trước thay đổi và dùng Mã biến thể để cập nhật đúng sản phẩm, không tạo bản trùng khi nhập lại.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border-2 border-dashed border-gray-300 bg-white p-5 text-center shadow-2xs sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FileSpreadsheet size={36} />
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-800">Tải lên file Excel (.xlsx, .xls)</h3>
          <p className="mt-1 text-xs text-gray-500">
            Nên có cột “Mã biến thể”. Nếu chưa có, hệ thống đối chiếu theo model, dung lượng, màu và xuất xứ.
          </p>
        </div>

        {!selectedFile && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#d70018] px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-700 active:scale-98">
            <Upload size={16} />
            <span>Chọn file để kiểm tra</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleSelectFile}
              disabled={Boolean(loading)}
              className="hidden"
            />
          </label>
        )}

        {selectedFile && (
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            {!loading && (
              <button
                type="button"
                onClick={resetSelection}
                className="shrink-0 rounded-md px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Chọn file khác
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
            <Loader2 size={16} className="animate-spin" />
            <span>{loading === 'preview' ? 'Đang kiểm tra dữ liệu, chưa ghi vào kho...' : 'Đang cập nhật sản phẩm vào kho...'}</span>
          </div>
        )}

        {result && !result.success && (
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertCircle size={16} />
            <span>{result.error || 'Có lỗi xảy ra trong quá trình xử lý dữ liệu.'}</span>
          </div>
        )}

        {result?.success && result.summary && (
          <div className="mx-auto max-w-3xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              {result.preview ? <FileCheck2 className="text-blue-600" size={19} /> : <CheckCircle2 className="text-emerald-600" size={19} />}
              <span>{result.message}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {summaryLabels.map(({ key, label, tone }) => (
                <div key={key} className={`rounded-lg p-3 ${tone}`}>
                  <p className="text-xl font-extrabold">{result.summary?.[key] || 0}</p>
                  <p className="text-xs font-semibold">{label}</p>
                </div>
              ))}
            </div>

            {(result.summary.skippedRows > 0 || result.summary.duplicateRows > 0) && (
              <p className="text-xs text-amber-700">
                Bỏ qua {result.summary.skippedRows} dòng thiếu tên; gộp {result.summary.duplicateRows} dòng trùng trong file.
              </p>
            )}

            {Boolean(result.warnings?.length) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="mb-1 font-bold">Cần kiểm tra:</p>
                <ul className="list-disc space-y-1 pl-5">
                  {result.warnings?.map((warning) => <li key={warning}>{warning}</li>)}
                </ul>
              </div>
            )}

            {isPreviewReady && (
              <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => selectedFile && void uploadFile(selectedFile, true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw size={15} /> Kiểm tra lại
                </button>
                <button
                  type="button"
                  onClick={() => selectedFile && void uploadFile(selectedFile, false)}
                  disabled={Boolean(loading) || result.summary.conflicts > 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d70018] px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Upload size={15} /> Xác nhận nhập dữ liệu
                </button>
              </div>
            )}

            {isPreviewReady && result.summary.conflicts > 0 && (
              <p className="text-right text-xs font-semibold text-red-600">
                Hãy sửa các Mã biến thể bị xung đột trong file rồi tải lại.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
