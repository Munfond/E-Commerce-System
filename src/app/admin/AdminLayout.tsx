import React from 'react';
import { Outlet, Link } from 'react-router';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/admin" className="text-lg font-semibold text-slate-900">Admin Panel</Link>
            <p className="text-xs text-slate-500 mt-1">Quản trị hệ thống trên mọi thiết bị</p>
          </div>
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 md:pb-0 md:gap-4">
            <Link to="/admin/categories" className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">Danh mục</Link>
            <Link to="/admin/orders" className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">Đơn hàng</Link>
            <Link to="/admin/shops" className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">Shops</Link>
            <Link to="/admin/users" className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">Người dùng</Link>
          </nav>
          <div>
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-800">Về trang chủ</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
