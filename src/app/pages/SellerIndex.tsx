import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Calendar,
  CircleDollarSign,
  Clock3,
  ListChecks,
  Package,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router';
import { listSellerOrders } from '../api/seller/sellerApi';
import { useAuth } from '../auth/AuthProvider';
import { mapSellerOrderDto } from '../mappers/seller';
import type { SellerOrder } from '../types/models/seller';

type StatusKey = SellerOrder['status'];

type StatusMeta = {
  label: string;
  chipClass: string;
  barClass: string;
};

const statusMeta: Record<StatusKey, StatusMeta> = {
  pending: { label: 'Chờ xử lý', chipClass: 'bg-amber-50 text-amber-800 border-amber-200', barClass: 'bg-amber-500' },
  confirmed: { label: 'Đã xác nhận', chipClass: 'bg-sky-50 text-sky-700 border-sky-200', barClass: 'bg-sky-500' },
  shipped: { label: 'Đang giao', chipClass: 'bg-blue-50 text-blue-700 border-blue-200', barClass: 'bg-blue-500' },
  delivered: { label: 'Hoàn tất', chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', barClass: 'bg-emerald-500' },
  cancelled: { label: 'Đã huỷ', chipClass: 'bg-slate-50 text-slate-700 border-slate-200', barClass: 'bg-slate-400' },
  failed: { label: 'Thất bại', chipClass: 'bg-rose-50 text-rose-700 border-rose-200', barClass: 'bg-rose-500' },
};

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent: string;
};

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

async function loadAllSellerOrders(): Promise<SellerOrder[]> {
  const pageSize = 50;
  let page = 1;
  const collected: SellerOrder[] = [];

  while (true) {
    const res = await listSellerOrders({ status: 'all', page, pageSize, sortBy: 'createdAt', sortDir: 'desc' });
    const pageItems = res.data.items.map(mapSellerOrderDto);
    collected.push(...pageItems);

    const totalPages = 'totalPages' in res.data && typeof res.data.totalPages === 'number' ? res.data.totalPages : 1;
    if (page >= totalPages || pageItems.length === 0) {
      break;
    }

    page += 1;
  }

  return collected;
}

export default function SellerIndex() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<SellerOrder[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await loadAllSellerOrders();
        if (!alive) return;
        setOrders(data);
      } catch {
        if (!alive) return;
        setError('Không tải được thống kê đơn hàng của seller. Vui lòng thử lại.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalVnd, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter((order) => order.status === 'pending').length;
    const confirmedOrders = orders.filter((order) => order.status === 'confirmed').length;
    const shippedOrders = orders.filter((order) => order.status === 'shipped').length;
    const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
    const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length;
    const failedOrders = orders.filter((order) => order.status === 'failed').length;
    const completedRevenue = orders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.totalVnd, 0);
    const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayOrders = orders.filter((order) => order.createdAt >= day && order.createdAt < nextDay);
      return {
        label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit' }).format(day),
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.totalVnd, 0),
      };
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      failedOrders,
      completedRevenue,
      fulfillmentRate,
      last7Days,
    };
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 6),
    [orders]
  );

  const maxDailyRevenue = Math.max(...metrics.last7Days.map((item) => item.revenue), 1);
  const totalStatusOrders = Math.max(metrics.totalOrders, 1);

  const metricCards: MetricCard[] = [
    {
      label: 'Tổng đơn hàng',
      value: loading ? '...' : formatNumber(metrics.totalOrders),
      helper: 'Toàn bộ đơn hàng của shop',
      icon: ShoppingBag,
      accent: 'from-orange-500 to-orange-400',
    },
    {
      label: 'Doanh thu',
      value: loading ? '...' : formatCurrency(metrics.totalRevenue),
      helper: 'Tổng giá trị từ response API',
      icon: CircleDollarSign,
      accent: 'from-emerald-500 to-emerald-400',
    },
    {
      label: 'Đơn đang xử lý',
      value: loading ? '...' : formatNumber(metrics.pendingOrders + metrics.confirmedOrders + metrics.shippedOrders),
      helper: 'Đơn chưa hoàn tất',
      icon: Clock3,
      accent: 'from-sky-500 to-sky-400',
    },
    {
      label: 'Tỉ lệ hoàn tất',
      value: loading ? '...' : `${metrics.fulfillmentRate.toFixed(1)}%`,
      helper: 'Tỉ lệ đơn giao thành công',
      icon: TrendingUp,
      accent: 'from-violet-500 to-violet-400',
    },
  ];

  const statusSummary: Array<{ key: StatusKey; count: number }> = [
    { key: 'pending', count: metrics.pendingOrders },
    { key: 'confirmed', count: metrics.confirmedOrders },
    { key: 'shipped', count: metrics.shippedOrders },
    { key: 'delivered', count: metrics.deliveredOrders },
    { key: 'cancelled', count: metrics.cancelledOrders },
    { key: 'failed', count: metrics.failedOrders },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="text-xs text-slate-500">
        Trang chủ <span className="mx-2">›</span> <span className="text-slate-700">Kênh người bán</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-700">Thống kê đơn hàng</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Xin chào, {auth.user?.username ?? auth.user?.email ?? 'Người bán'}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Đây là trang thống kê của kênh người bán. Dữ liệu được lấy trực tiếp từ response API đơn hàng của seller
                    để tổng hợp doanh thu, số lượng đơn và trạng thái xử lý.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                  <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Tổng đơn</div>
                    <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                      <ShoppingBag className="size-5 text-orange-600" />
                      {loading ? '...' : formatNumber(metrics.totalOrders)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Doanh thu</div>
                    <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                      <CircleDollarSign className="size-5 text-emerald-600" />
                      {loading ? '...' : formatCurrency(metrics.totalRevenue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric) => (
                <article key={metric.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
                      <p className="mt-2 text-xs text-slate-500">{metric.helper}</p>
                    </div>
                    <div className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} text-white shadow-sm`}>
                      <metric.icon className="size-5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Xu hướng bán hàng</p>
                  <h2 className="text-xl font-semibold text-slate-900">7 ngày gần nhất</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <Calendar className="size-4" /> 7 ngày qua
                </span>
              </div>

              <div className="space-y-4">
                {metrics.last7Days.map((day) => {
                  const revenueWidth = day.revenue > 0 ? Math.max((day.revenue / maxDailyRevenue) * 100, 8) : 0;

                  return (
                    <div key={day.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">{day.label}</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(day.count)} đơn</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Doanh thu</p>
                          <p className="mt-1 font-semibold text-slate-900">{formatCurrency(day.revenue)}</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-orange-600" style={{ width: `${revenueWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Phân bổ trạng thái</p>
                  <h2 className="text-xl font-semibold text-slate-900">Tổng hợp từ API</h2>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="size-4" />
                  Làm mới
                </button>
              </div>

              <div className="space-y-3">
                {statusSummary.map((item) => {
                  const meta = statusMeta[item.key];
                  const width = metrics.totalOrders > 0 ? Math.max((item.count / totalStatusOrders) * 100, item.count > 0 ? 8 : 0) : 0;

                  return (
                    <div key={item.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.chipClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{formatNumber(item.count)}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${meta.barClass}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Đơn hoàn tất</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{loading ? '...' : formatNumber(metrics.deliveredOrders)}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      <ListChecks className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-slate-500">Đơn gần đây</p>
                <h2 className="text-xl font-semibold text-slate-900">6 đơn mới nhất</h2>
              </div>
              <Link to="/seller/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                Xem tất cả
              </Link>
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã đơn</th>
                    <th className="px-4 py-3 font-medium">Người mua</th>
                    <th className="px-4 py-3 font-medium">Ngày tạo</th>
                    <th className="px-4 py-3 font-medium">Số lượng</th>
                    <th className="px-4 py-3 font-medium">Tổng tiền</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={6}>
                        Đang tải dữ liệu thống kê...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={6}>
                        Chưa có đơn hàng nào để thống kê.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const meta = statusMeta[order.status];

                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-slate-900">{order.id}</td>
                          <td className="px-4 py-4 text-slate-700">{order.buyerName}</td>
                          <td className="px-4 py-4 text-slate-600">{formatDateTime(order.createdAt)}</td>
                          <td className="px-4 py-4 text-slate-700">{formatNumber(order.itemCount)}</td>
                          <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(order.totalVnd)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.chipClass}`}>
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-slate-500">Trạng thái dữ liệu</p>
                <h2 className="text-lg font-semibold text-slate-900">Kênh người bán</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{loading ? 'Đang tải' : 'Sẵn sàng'}</div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Doanh thu hoàn tất</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatCurrency(metrics.completedRevenue)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Giá trị đơn trung bình</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatCurrency(metrics.averageOrderValue)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Đơn đang xử lý</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {loading ? '...' : formatNumber(metrics.pendingOrders + metrics.confirmedOrders + metrics.shippedOrders)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Đơn bị huỷ / thất bại</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatNumber(metrics.cancelledOrders + metrics.failedOrders)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-sm text-slate-500">Hành động nhanh</p>
              <h2 className="text-lg font-semibold text-slate-900">Đi tới nhanh</h2>
            </div>

            <div className="grid gap-3">
              <Link
                to="/seller/orders"
                className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="size-4" /> Xem danh sách đơn hàng
                </span>
              </Link>

              <Link
                to="/seller/products"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Package className="size-4" /> Quản lý sản phẩm
                </span>
              </Link>

              <Link
                to="/seller/inventory"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Store className="size-4" /> Quản lý kho hàng
                </span>
              </Link>

              <Link
                to="/seller/profile"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <User className="size-4" /> Thông tin người bán
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="size-4" /> Tải lại thống kê
            </button>
          </div>
        </aside>
      </div>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>}
    </div>
  );
}
