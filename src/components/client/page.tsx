import React from 'react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">FoGo Store</h1>
        <p className="text-gray-500 mt-2">
          Rê chuột (hover) vào menu <strong>iPhone</strong>, <strong>Macbook</strong> hoặc <strong>iPad</strong> ở thanh màu đỏ bên trên để kiểm tra bảng điều hướng đa cấp.
        </p>
      </div>
    </div>
  );
}