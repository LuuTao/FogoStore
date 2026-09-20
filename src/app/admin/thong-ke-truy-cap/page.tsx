'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  UserPlus, 
  Repeat, 
  Eye, 
  Search, 
  Loader2, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

interface DailyStat {
  date: string;
  views: number;
  registrations: number;
  newCustomers: number;
  returningCustomers: number;
}

export default function TrafficAnalyticsPage() {
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Mặc định lọc 7 ngày gần đây
  const todayStr = new Date().toISOString().split('T')[0];
  const lastWeekStr = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(lastWeekStr);
  const [endDate, setEndDate] = useState(todayStr);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/admin/traffic-analytics?startDate=${startDate}&endDate=${endDate}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats();
  };

  // Tính tổng trong khoảng thời gian đã lọc
  const totals = stats.reduce(
    (acc, curr) => ({
      views: acc.views + curr.views,
      registrations: acc.registrations + curr.registrations,
      newCustomers: acc.newCustomers + curr.newCustomers,
      returningCustomers: acc.returningCustomers + curr.returningCustomers,
    }),
    { views: 0, registrations: 0, newCustomers: 0, returningCustomers: 0 }
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="text-[#d70018]" />
          Thống Kê Lượt Truy Cập & Khách Hàng
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi lưu lượng web, tài khoản mới và mức độ quay lại của khách hàng theo ngày/tháng/năm
        </p>
      </div>

      {/* THANH LỌC LỊCH SỬ NGÀY / THÁNG / NĂM */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={15} />
            Khoảng thời gian:
          </span>
          <div className="flex items-center gap-2">
            <label>Từ:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-[#d70018] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label>Đến:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-[#d70018] outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#d70018] hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search size={14} />
            <span>Tìm kiếm</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </form>

      {/* 4 THẺ TỔNG HỢP NHANH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Lượt truy cập</p>
            <p className="text-xl font-black text-gray-900">{totals.views.toLocaleString('vi-VN')}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserPlus size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Đăng ký mới</p>
            <p className="text-xl font-black text-emerald-600">{totals.registrations}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Khách mua mới</p>
            <p className="text-xl font-black text-purple-600">{totals.newCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Repeat size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Khách mua quay lại</p>
            <p className="text-xl font-black text-amber-600">{totals.returningCustomers}</p>
          </div>
        </div>
      </div>

      {/* BẢNG LỊCH SỬ THEO TỪNG NGÀY */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ngày ghi nhận</th>
                <th className="py-3.5 px-4 text-center">Lượt truy cập (Views)</th>
                <th className="py-3.5 px-4 text-center">Tài khoản đăng ký</th>
                <th className="py-3.5 px-4 text-center">Đơn khách mới</th>
                <th className="py-3.5 px-4 text-center">Đơn khách quay lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin text-[#d70018] mx-auto mb-2" />
                    <span>Đang nạp dữ liệu thống kê...</span>
                  </td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Không có dữ liệu trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              ) : (
                stats.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 font-mono">
                      {new Date(row.date).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                      {row.views.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        +{row.registrations}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                        {row.newCustomers}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                        {row.returningCustomers}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}