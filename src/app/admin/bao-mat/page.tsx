'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Lock, 
  KeyRound, 
  Search,
  LogOut,
  Loader2
} from 'lucide-react';

interface SecurityLog {
  id: string;
  ip: string;
  method: string;
  path: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventType: string;
  payload: string;
  userAgent: string;
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const TARGET_EMAIL = 'tao6a3lt@gmail.com';

export default function SecurityManagementPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, critical: 0, high: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Kiểm tra session token lớp 2 khi mở trang
  useEffect(() => {
    const secToken = sessionStorage.getItem('fogo_sec_token');
    if (secToken) {
      setIsAuthenticated(true);
      fetchLogs(secToken);
    }
  }, []);

  // 2. Hàm đăng nhập lớp 2
  const handleVerify2ndLayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');

    try {
      const adminToken = localStorage.getItem('fogo_admin_token') || localStorage.getItem('admin_token') || '';
      const res = await fetch(`${API_URL}/api/admin/security-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          email: TARGET_EMAIL,
          password: passwordInput,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Mật khẩu lớp 2 không chính xác!');
      }

      // Lưu token lớp 2 vào sessionStorage
      sessionStorage.setItem('fogo_sec_token', json.securityToken);
      setIsAuthenticated(true);
      setPasswordInput('');
      fetchLogs(json.securityToken);
    } catch (err: any) {
      setAuthError(err.message || 'Lỗi xác thực.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Hàm tải log (gửi kèm cả 2 token)
  const fetchLogs = async (secTokenOverride?: string) => {
    setLoading(true);
    const secToken = secTokenOverride || sessionStorage.getItem('fogo_sec_token') || '';
    const adminToken = localStorage.getItem('fogo_admin_token') || localStorage.getItem('admin_token') || '';

    try {
      const res = await fetch(`${API_URL}/api/admin/security-logs`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-security-token': secToken,
        },
      });

      if (res.status === 403 || res.status === 401) {
        handleLogout2ndLayer();
        return;
      }

      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs || []);
        setStats(json.data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 4. Khóa màn hình / Đăng xuất lớp 2
  const handleLogout2ndLayer = () => {
    sessionStorage.removeItem('fogo_sec_token');
    setIsAuthenticated(false);
    setLogs([]);
  };

  // 5. Xóa log
  const handleClearLogs = async () => {
    if (!confirm('Bạn có chắc chắn muốn dọn sạch toàn bộ log cảnh báo?')) return;
    const secToken = sessionStorage.getItem('fogo_sec_token') || '';
    const adminToken = localStorage.getItem('fogo_admin_token') || localStorage.getItem('admin_token') || '';

    try {
      await fetch(`${API_URL}/api/admin/security-logs`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-security-token': secToken,
        },
      });
      fetchLogs();
    } catch (e) {
      alert('Lỗi xóa log');
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.ip.includes(searchTerm) ||
      l.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================================================================
  // GIAO DIỆN MÀN HÌNH KHÓA BẢO MẬT CẤP 2 (KHI CHƯA NHẬP MẬT KHẨU RIÊNG)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-50 text-[#d70018] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Xác Thực Lớp 2 Chuyên Biệt</h2>
            <p className="text-xs text-gray-500">
              Khu vực nhạy cảm giám sát an ninh. Vui lòng xác thực tài khoản được cấp quyền để mở dữ liệu log.
            </p>
          </div>

          <form onSubmit={handleVerify2ndLayer} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Tài khoản quản trị</label>
              <input
                type="email"
                disabled
                value={TARGET_EMAIL}
                className="w-full text-xs font-semibold bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Mật khẩu riêng lớp 2</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu an toàn..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 focus:border-[#d70018] focus:outline-none"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-[#d70018] hover:bg-[#b50014] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>ĐANG KIỂM TRA QUYỀN...</span>
                </>
              ) : (
                <span>MỞ KHÓA BẢNG ĐIỀU KHIỂN</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN DASHBOARD SAU KHI ĐÃ MỞ KHÓA
  // =========================================================================
  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShieldAlert size={24} className="text-[#d70018]" />
            <span>Trung Tâm Cảnh Báo An Toàn & Bảo Mật</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Đang mở quyền xem riêng cho: <strong>{TARGET_EMAIL}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm Mới</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 size={14} />
            <span>Dọn Sạch Log</span>
          </button>
          <button
            onClick={handleLogout2ndLayer}
            className="px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Khóa lại màn hình bảo mật"
          >
            <LogOut size={14} />
            <span>Khóa Màn Hình</span>
          </button>
        </div>
      </div>

      {/* Thẻ Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Tổng Vi Phạm Phát Hiện</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-2xs">
          <span className="text-[11px] font-bold text-red-600 uppercase">Nguy Hiểm Cao (Critical)</span>
          <p className="text-2xl font-black text-red-700 mt-1">{stats.critical || 0}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">Khai Thác SQLi</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.sqli || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Tấn Công XSS</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.xss || 0}</p>
        </div>
      </div>

      {/* Thanh Tìm kiếm */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-2">
        <Search size={16} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Lọc theo Địa chỉ IP, Đường dẫn URL hoặc Loại tấn công..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Danh sách Bảng Log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Mức Độ</th>
                <th className="p-3.5">Loại Hành Vi</th>
                <th className="p-3.5">Địa Chỉ IP</th>
                <th className="p-3.5">Đường Dẫn Bị Quét</th>
                <th className="p-3.5 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Hệ thống an toàn! Chưa ghi nhận hành vi xâm nhập hoặc quét lỗ hổng nào.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-mono text-gray-600">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                          log.threatLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : log.threatLevel === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {log.threatLevel}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{log.eventType}</td>
                    <td className="p-3.5 font-mono text-blue-600">{log.ip}</td>
                    <td className="p-3.5 font-mono text-gray-600 truncate max-w-xs">
                      {log.method} {log.path}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md cursor-pointer"
                        title="Xem payload chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup Chi tiết */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                <span>Chi Tiết Hành Vi Tấn Công</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-black font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p>
                <b>IP nguồn:</b> <span className="font-mono text-blue-600">{selectedLog.ip}</span>
              </p>
              <p>
                <b>User-Agent:</b> <span className="text-gray-600 break-all">{selectedLog.userAgent}</span>
              </p>
              <p>
                <b>Target Path:</b>{' '}
                <span className="font-mono text-red-600">
                  {selectedLog.method} {selectedLog.path}
                </span>
              </p>
              <p className="font-bold pt-2">Payload gửi lên:</p>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono max-h-48 whitespace-pre-wrap break-all">
                {selectedLog.payload || 'Không có body'}
              </pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}