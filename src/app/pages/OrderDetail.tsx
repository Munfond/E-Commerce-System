import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { orderApi, type CustomerOrderDetailDto, type CustomerOrderTrackingDto, type OrderHistoryEventDto } from '../api/orderApi';

type OrderTrackingState = {
  order: (CustomerOrderDetailDto & { history?: OrderHistoryEventDto[] }) | CustomerOrderTrackingDto | null;
  loading: boolean;
  error: string | null;
  canceling: boolean;
  cancelError: string | null;
  cancelSuccess: boolean;
  cancelReason: string;
};

function formatCurrency(value: number) {
  return `₫${value.toLocaleString('vi-VN')}`;
}

function getOrderItems(order: OrderTrackingState['order']) {
  if (!order || !('items' in order)) return [];
  return order.items;
}

function getOrderStatusLabel(status?: string) {
  if (!status) return 'Không xác định';
  const normalized = status.toUpperCase();
  const labels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
    FAILED: 'Thất bại',
  };
  return labels[normalized] ?? normalized;
}

function getOrderHistory(order: OrderTrackingState['order']) {
  if (!order) return [];
  if ('history' in order && Array.isArray(order.history)) return order.history;
  return [];
}

function renderHistoryItem(item: OrderHistoryEventDto, index: number) {
  const status = typeof item.status === 'string' ? item.status : undefined;
  const timestamp =
    typeof item.timestamp === 'string' ? item.timestamp :
    typeof item.createdAt === 'string' ? item.createdAt :
    typeof item.date === 'string' ? item.date :
    undefined;
  const note =
    typeof item.note === 'string' ? item.note :
    typeof item.description === 'string' ? item.description :
    typeof item.message === 'string' ? item.message :
    undefined;

  return (
    <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            {status ?? `Bước ${index + 1}`}
          </p>
          {timestamp && (
            <p className="mt-1 text-xs text-slate-400">
              {new Date(timestamp).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>
      {note ? (
        <p className="mt-4 text-slate-700">{note}</p>
      ) : (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          {JSON.stringify(item, null, 2)}
        </pre>
      )}
    </div>
  );
}

function renderOrderItem(item: NonNullable<ReturnType<typeof getOrderItems>>[number], index: number) {
  const subtotal = item.quantity * item.price_at_purchase;

  return (
    <div key={item.id || index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sản phẩm {index + 1}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.variant.product.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Biến thể: {item.variant.name}</p>
          <p className="mt-1 text-xs text-slate-400">SKU: {item.variant.sku}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-slate-500">Thành tiền</p>
          <p className="mt-1 text-xl font-semibold text-orange-600">{formatCurrency(subtotal)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Số lượng</p>
          <p className="mt-2 font-medium">{item.quantity}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Giá tại mua</p>
          <p className="mt-2 font-medium">{formatCurrency(item.price_at_purchase)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Giá gốc biến thể</p>
          <p className="mt-2 font-medium">{formatCurrency(item.variant.sale_price)}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [state, setState] = useState<OrderTrackingState>({
    order: null,
    loading: true,
    error: null,
    canceling: false,
    cancelError: null,
    cancelSuccess: false,
    cancelReason: '',
  });

  useEffect(() => {
    if (!id) {
      setState({ order: null, loading: false, error: 'Mã đơn hàng không hợp lệ.', canceling: false, cancelError: null, cancelSuccess: false, cancelReason: '' });
      return;
    }

    setState({ order: null, loading: true, error: null, canceling: false, cancelError: null, cancelSuccess: false, cancelReason: '' });
    orderApi
      .getCustomerOrder(id)
      .then((res) => {
        setState((prev) => ({ ...prev, order: res.data, loading: false }));
      })
      .catch(() => {
        setState({ order: null, loading: false, error: 'Không tải được thông tin theo dõi đơn hàng.', canceling: false, cancelError: null, cancelSuccess: false, cancelReason: '' });
      });
  }, [id]);

  const handleCancelOrder = () => {
    if (!id) return;
    if (!state.cancelReason.trim()) {
      setState((prev) => ({ ...prev, cancelError: 'Vui lòng nhập lý do hủy đơn hàng.' }));
      return;
    }

    setState((prev) => ({ ...prev, canceling: true, cancelError: null, cancelSuccess: false }));
    orderApi
      .cancelCustomerOrder(id, { reason: state.cancelReason.trim() })
      .then(() => {
        setState((prev) => ({ ...prev, canceling: false, cancelSuccess: true }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, canceling: false, cancelError: 'Không hủy được đơn hàng. Vui lòng thử lại.' }));
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-orange-600 text-white px-6 py-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-100/80">Theo dõi đơn hàng</p>
                  <h1 className="mt-3 text-4xl font-semibold">Mã đơn hàng: {id}</h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/orders"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                  >
                    Quay lại danh sách
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-8">
              {state.cancelSuccess && (
                <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  Đã hủy đơn hàng thành công.
                </div>
              )}
              {state.cancelError && (
                <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                  {state.cancelError}
                </div>
              )}
              {state.loading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  Đang tải thông tin đơn hàng...
                </div>
              ) : state.error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
                  {state.error}
                </div>
              ) : !state.order ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  Không có thông tin đơn hàng.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Hủy đơn hàng</p>
                    <label className="mt-4 block text-sm font-medium text-slate-700">Lý do hủy</label>
                    <textarea
                      value={state.cancelReason}
                      onChange={(e) => setState((prev) => ({ ...prev, cancelReason: e.target.value }))}
                      placeholder="Nhập lý do hủy đơn hàng"
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-600"
                    />
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={state.canceling}
                        className="inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {state.canceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                      </button>
                      <p className="text-xs text-slate-500">Lý do sẽ được gửi trong request body với key <span className="font-medium">reason</span>.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm text-slate-500">Mã đơn</p>
                      <p className="mt-2 break-all text-base font-semibold text-slate-900">{state.order.id}</p>
                    </div>
                    {'total_amount' in state.order ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm text-slate-500">Tổng tiền</p>
                        <p className="mt-2 text-xl font-semibold text-orange-600">{formatCurrency(state.order.total_amount)}</p>
                      </div>
                    ) : null}
                    {'status' in state.order ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm text-slate-500">Trạng thái</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{getOrderStatusLabel(state.order.status)}</p>
                      </div>
                    ) : null}
                    {'payment_method' in state.order ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm text-slate-500">Thanh toán</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{state.order.payment_method}</p>
                      </div>
                    ) : null}
                  </div>
                  {'created_at' in state.order ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm text-slate-500">Thời gian tạo</p>
                      <p className="mt-2 text-lg font-medium text-slate-900">{new Date(state.order.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                  ) : null}

                  {'address_id' in state.order ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Địa chỉ giao hàng</p>
                      <p className="mt-2 break-all text-lg font-medium text-slate-900">{state.order.address_id}</p>
                    </div>
                  ) : null}

                  {getOrderItems(state.order).length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900">Chi tiết sản phẩm</h2>
                      {getOrderItems(state.order).map(renderOrderItem)}
                    </div>
                  ) : null}

                  {getOrderHistory(state.order).length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900">Lịch sử cập nhật</h2>
                      {getOrderHistory(state.order).map(renderHistoryItem)}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
