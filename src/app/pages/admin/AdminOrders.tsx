import React, { useEffect, useState } from 'react';
import { orderApi, type AdminOrderDto } from '../../api/orderApi';
import { isApiError } from '../../api/errors';
import { toast } from 'sonner';

function formatDateTime(value: string) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
}

function formatCurrency(value: number) {
  return Number.isFinite(value) ? value.toLocaleString('vi-VN') : '0';
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      try {
        const res = await orderApi.getAdminOrders();
        if (!alive) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!alive) return;
        toast.error(isApiError(err) ? err.message : 'Không tải được danh sách đơn hàng');
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
      <h2 className="text-xl font-semibold mb-4">Đơn hàng</h2>
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full min-w-[1400px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID đơn hàng</th>
              <th className="px-4 py-3 text-left">User ID</th>
              <th className="px-4 py-3 text-left">Tổng tiền</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-left">Phương thức thanh toán</th>
              <th className="px-4 py-3 text-left">Shop ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  Đang tải...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  Không có đơn hàng.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                  <td className="px-4 py-3 text-slate-700">{order.user_id}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3 text-slate-700">{order.status}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-slate-700">{order.payment_method}</td>
                  <td className="px-4 py-3 text-slate-700">{order.shop_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
