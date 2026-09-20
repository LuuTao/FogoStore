'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Crown, 
  Sparkles, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface CustomerItem {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  customerRank: 'NEW' | 'RETURNING' | 'LOYAL' | 'VIP';
  lastOrderDate: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export default function AdminCustomerPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'LOYAL' | 'VIP'>('ALL');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/admin/customers`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCustomers(json.data);
        }
      } catch (err) {
        console.error('Lỗi nạp danh sách khách hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Bộ đếm thống kê nhanh
  const stats = useMemo(() => {
    return {
      total: customers.length,
      newCustomers: customers.filter(c => c.customerRank === 'NEW').length,
      loyalCustomers: customers.filter(c => c.customerRank === 'LOYAL').length,
      vipCustomers: customers.filter(c => c.customerRank === 'VIP').length,
    };
  }, [customers]);

  // Bộ lọc theo tab và từ khóa tìm kiếm (tên / sđt)
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = 
        (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm);

      if (activeTab === 'NEW') return matchSearch && c.customerRank === 'NEW';
      if (activeTab === 'LOYAL') return matchSearch && c.customerRank === 'LOYAL';
      if (activeTab === 'VIP') return matchSearch && c.customerRank === 'VIP';
      return matchSearch;
    });
  }, [customers, searchTerm, activeTab]);

  const renderBadge = (rank: CustomerItem['customerRank']) => {
    switch (rank) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black">
            <Crown size={12} className="text-amber-500" />
            Khách VIP
          </span>
        );
      case 'LOYAL':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <UserCheck size={12} className="text-purple-600" />
            Thân thiết
          </span>
        );
      case 'RETURNING':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            Đã quay lại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Sparkles size={12} className="text-emerald-500" />
            Khách mới
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Quản Lý Khách Hàng</h1>
        <p className="text-sm text-gray-500">Phân tích hành vi, phân hạng khách hàng thân thiết và khách hàng mới</p>
      </div>

      {/* 4 THẺ THỐNG KÊ NHANH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tổng khách hàng</p>
            <p className="text-xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Khách hàng mới</p>
            <p className="text-xl font-black text-emerald-600">{stats.newCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Khách thân thiết</p>
            <p className="text-xl font-black text-purple-600">{stats.loyalCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Crown size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Khách VIP</p>
            <p className="text-xl font-black text-amber-600">{stats.vipCustomers}</p>
          </div>
        </div>
      </div>

      {/* THANH TÌM KIẾM & TAB LỌC */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-80 bg-gray-50">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'NEW', 'LOYAL', 'VIP'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#d70018] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'ALL' && 'Tất cả'}
              {tab === 'NEW' && 'Khách mới (1 đơn)'}
              {tab === 'LOYAL' && 'Thân thiết (3+ đơn)'}
              {tab === 'VIP' && 'VIP (Chi tiêu lớn)'}
            </button>
          ))}
        </div>
      </div>

      {/* BẢNG DANH SÁCH KHÁCH HÀNG */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Phân hạng</th>
                <th className="py-3.5 px-4 text-center">Số đơn hàng</th>
                <th className="py-3.5 px-4 text-right">Tổng chi tiêu</th>
                <th className="py-3.5 px-4">Đơn gần nhất</th>
                <th className="py-3.5 px-4 text-center">Lịch sử đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">Đang tải danh sách...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">Không tìm thấy khách hàng nào.</td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{c.fullName || 'Khách vãng lai'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone size={12} className="text-gray-400" />
                          {c.phone}
                        </span>
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-gray-400" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderBadge(c.customerRank)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 font-bold rounded-lg text-xs">
                        {c.totalOrders} đơn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#d70018]">
                      {c.totalSpent.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(c.lastOrderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/don-hang?search=${c.phone}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>Xem đơn</span>
                        <ExternalLink size={12} />
                      </Link>
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