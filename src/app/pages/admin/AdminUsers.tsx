import React, { useEffect, useState } from 'react';
import { getAdminUsers, updateAdminUserStatus, type AdminUserDto, type AdminUserStatus } from '../../api/accountApi';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['ACTIVE', 'PENDING', 'BANNED'] as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<AdminUserStatus | null>(null);

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

  const handleStatusChange = async (userId: string, nextStatus: AdminUserStatus) => {
    setSavingUserId(userId);
    setSavingStatus(nextStatus);
    try {
      await updateAdminUserStatus(userId, nextStatus);
      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, status: nextStatus } : user)));
      toast.success('Đã cập nhật trạng thái user');
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Không cập nhật được trạng thái user');
    } finally {
      setSavingUserId(null);
      setSavingStatus(null);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
      case 'BANNED':
        return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    }
  };

  const counts = users.reduce(
    (accumulator, user) => {
      const status = user.status.toUpperCase();
      if (status === 'ACTIVE') accumulator.active += 1;
      else if (status === 'PENDING') accumulator.pending += 1;
        else accumulator.banned += 1;
      return accumulator;
    },
    { active: 0, pending: 0, banned: 0 }
  );

  const renderStatusAction = (user: AdminUserDto, status: AdminUserStatus) => {
    const isCurrent = user.status === status;
    const isSaving = savingUserId === user.id && savingStatus === status;

    return (
      <button
        type="button"
        onClick={() => void handleStatusChange(user.id, status)}
        disabled={savingUserId === user.id || isCurrent}
        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          isCurrent
            ? 'cursor-default border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isSaving ? 'Đang lưu...' : status}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white shadow-lg shadow-slate-900/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Admin users</p>
            <h2 className="mt-2 text-2xl font-semibold">Quản lý trạng thái người dùng</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Xem nhanh thông tin user và đổi trạng thái trực tiếp bằng một cú bấm.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
              <div className="text-xs text-slate-300">Tổng</div>
              <div className="mt-1 text-xl font-semibold">{users.length}</div>
            </div>
            <div className="rounded-xl bg-emerald-500/15 px-4 py-3 backdrop-blur">
              <div className="text-xs text-emerald-100">Active</div>
              <div className="mt-1 text-xl font-semibold">{counts.active}</div>
            </div>
            <div className="rounded-xl bg-amber-500/15 px-4 py-3 backdrop-blur">
              <div className="text-xs text-amber-100">Pending</div>
              <div className="mt-1 text-xl font-semibold">{counts.pending}</div>
            </div>
            <div className="rounded-xl bg-rose-500/15 px-4 py-3 backdrop-blur">
              <div className="text-xs text-rose-100">Banned</div>
              <div className="mt-1 text-xl font-semibold">{counts.banned}</div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl bg-white px-6 py-10 text-center text-slate-500 shadow-sm">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-10 text-center text-slate-500 shadow-sm">Không có người dùng.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {users.map((user) => (
            <article key={user.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email || 'User')}&background=random&color=fff&rounded=true&format=svg`}
                    alt={user.username || user.email}
                    className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="text-base font-semibold text-slate-900">{user.username || 'Chưa có tên'}</div>
                    <div className="mt-1 text-sm text-slate-600">{user.email}</div>
                    <div className="mt-2 text-xs text-slate-400">ID: {user.id}</div>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(user.status)}`}>
                  {user.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span key={role} className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">Không có role</span>
                )}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Đổi trạng thái</div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => renderStatusAction(user, status))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
