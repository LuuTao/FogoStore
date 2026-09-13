'use client';

import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import AdminSidebar, { AdminTab } from '../../../components/admin/AdminSideBar';
import AnalyticsTab from '../../../components/admin/AnalyticsTab';
import OrdersTab from '../../../components/admin/OrdersTab';
import InventoryTab from '../../../components/admin/InventoryTab';
import ProductsExcelTab from '../../../components/admin/ProductsExcelTab';
import PostsTab from '../../../components/admin/PostsTab';
import BannersTab from '../../../components/admin/BannersTab';

// Hàm làm sạch localhost sang URL production nếu có dữ liệu cũ
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics`);
      const json = await res.json();
      if (json.success) setAnalytics(sanitizeUrls(json.data));
    } catch (err) {
      console.error('Lỗi lấy Analytics:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`);
      const json = await res.json();
      if (json.success) setOrders(sanitizeUrls(json.data));
    } catch (err) {
      console.error('Lỗi lấy Orders:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/inventory`);
      const json = await res.json();
      if (json.success) setInventory(sanitizeUrls(json.data));
    } catch (err) {
      console.error('Lỗi lấy Inventory:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/posts`);
      const json = await res.json();
      if (json.success) setPosts(sanitizeUrls(json.data));
    } catch (err) {
      console.error('Lỗi lấy Posts:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/banners`);
      const json = await res.json();
      if (json.success) setBanners(sanitizeUrls(json.data));
    } catch (err) {
      console.error('Lỗi lấy Banners:', err);
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
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans w-full overflow-x-hidden">
      {/* Header Admin */}
      <header className="bg-[#1e293b] text-white py-3 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          {/* Nút 3 gạch mở Drawer trên Mobile/Tablet */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Mở menu quản trị"
          >
            <MenuIcon size={18} />
          </button>

          <span className="text-lg sm:text-xl font-black tracking-wider text-[#d70018]">FOGO</span>
          <span className="text-[10px] bg-red-600/30 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/30">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href="/"
            className="text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors"
          >
            Xem Cửa Hàng
          </a>
        </div>
      </header>

      {/* Vùng bố cục thân trang */}
      <div className="flex flex-1 w-full">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-8 w-full overflow-x-hidden">
          {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onRefresh={() => {
                fetchOrders();
                fetchAnalytics();
              }}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab inventory={inventory} onRefresh={fetchInventory} />
          )}
          {activeTab === 'products' && (
            <ProductsExcelTab onSuccess={fetchInventory} />
          )}
          {activeTab === 'posts' && (
            <PostsTab posts={posts} onRefresh={fetchPosts} />
          )}
          {activeTab === 'banners' && (
            <BannersTab banners={banners} onRefresh={fetchBanners} />
          )}
        </main>
      </div>
    </div>
  );
}