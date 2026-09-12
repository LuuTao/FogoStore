'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar, { AdminTab } from '../../../components/admin/AdminSideBar';
import AnalyticsTab from '../../../components/admin/AnalyticsTab';
import OrdersTab from '../../../components/admin/OrdersTab';
import InventoryTab from '../../../components/admin/InventoryTab';
import ProductsExcelTab from '../../../components/admin/ProductsExcelTab';
import PostsTab from '../../../components/admin/PostsTab';
import BannersTab from '../../../components/admin/BannersTab';

// Hàm đệ quy làm sạch mọi link localhost:5000 trong dữ liệu trả về từ API
const sanitizeUrls = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'string') {
    return data.replace(/http:\/\/localhost:5000/g, 'https://fogo-store-api.onrender.com');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeUrls);
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const key in data) {
      cleaned[key] = sanitizeUrls(data[key]);
    }
    return cleaned;
  }
  return data;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/analytics');
      const data = await res.json();
      if (data.success) setAnalytics(sanitizeUrls(data.data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/orders');
      const data = await res.json();
      if (data.success) setOrders(sanitizeUrls(data.data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/admin/inventory');
      const data = await res.json();
      if (data.success) setInventory(sanitizeUrls(data.data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/posts');
      const data = await res.json();
      if (data.success) setPosts(sanitizeUrls(data.data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('https://fogo-store-api.onrender.com/api/banners');
      const data = await res.json();
      if (data.success) setBanners(sanitizeUrls(data.data));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
    fetchInventory();
    fetchPosts();
    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-[#1e293b] text-white py-4 px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-wider text-[#d70018]">FOGO</span>
          <span className="text-xs bg-red-600/30 text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/30">
            ADMIN SYSTEM
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-300">Quản trị viên FoGo</span>
          <a href="/" className="hover:underline text-gray-400">Xem Cửa Hàng</a>
        </div>
      </header>

      <div className="flex flex-1">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={() => { fetchOrders(); fetchAnalytics(); }} />}
          {activeTab === 'inventory' && <InventoryTab inventory={inventory} onRefresh={fetchInventory} />}
          {activeTab === 'products' && <ProductsExcelTab onSuccess={fetchInventory} />}
          {activeTab === 'posts' && <PostsTab posts={posts} onRefresh={fetchPosts} />}
          {activeTab === 'banners' && <BannersTab banners={banners} onRefresh={fetchBanners} />}
        </main>
      </div>
    </div>
  );
}