import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">Users overview (placeholder)</div>
        <div className="p-4 bg-white shadow rounded">Orders overview (placeholder)</div>
        <div className="p-4 bg-white shadow rounded">Products overview (placeholder)</div>
      </div>
    </div>
  );
}
