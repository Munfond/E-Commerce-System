import React from 'react';
import { Outlet, Link } from 'react-router';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/admin" className="text-lg font-semibold">Admin Panel</Link>
          <nav className="flex gap-4">
            <Link to="/admin" className="text-sm text-slate-700">Dashboard</Link>
            <Link to="/admin/categories" className="text-sm text-slate-700">Danh mục</Link>
            <Link to="/admin/orders" className="text-sm text-slate-700">Đơn hàng</Link>
            <Link to="/admin/products/pending" className="text-sm text-slate-700">Sản phẩm chờ</Link>
            <Link to="/admin/shops" className="text-sm text-slate-700">Shops</Link>
            <Link to="/admin/users" className="text-sm text-slate-700">Người dùng</Link>
          </nav>
          <div>
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-800">Về trang chủ</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
