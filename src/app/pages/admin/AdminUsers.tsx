import React, { useEffect, useState } from 'react';
import { getAdminUsers, type AdminUserDto } from '../../api/accountApi';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      setLoading(true);
      try {
        const res = await getAdminUsers();
        if (!alive) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!alive) return;
        toast.error(isApiError(err) ? err.message : 'Không tải được danh sách người dùng');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quản lý Người dùng</h2>
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  Không có người dùng.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.id}</td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
