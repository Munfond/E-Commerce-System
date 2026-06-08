import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { orderApi, type CustomerOrderTrackingDto, type OrderHistoryEventDto } from '../api/orderApi';

type OrderTrackingState = {
  order: CustomerOrderTrackingDto | null;
  loading: boolean;
  error: string | null;
  canceling: boolean;
  cancelError: string | null;
  cancelSuccess: boolean;
};

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

export default function OrderDetail() {
  const { id } = useParams();
  const [state, setState] = useState<OrderTrackingState>({
    order: null,
    loading: true,
    error: null,
    canceling: false,
    cancelError: null,
    cancelSuccess: false,
  });

  useEffect(() => {
    if (!id) {
      setState({ order: null, loading: false, error: 'Mã đơn hàng không hợp lệ.' });
      return;
    }

    setState({ order: null, loading: true, error: null, canceling: false, cancelError: null, cancelSuccess: false });
    orderApi
      .getCustomerOrder(id)
      .then((res) => {
        setState((prev) => ({ ...prev, order: res.data, loading: false }));
      })
      .catch(() => {
        setState({ order: null, loading: false, error: 'Không tải được thông tin theo dõi đơn hàng.', canceling: false, cancelError: null, cancelSuccess: false });
      });
  }, [id]);

  const handleCancelOrder = () => {
    if (!id) return;
    setState((prev) => ({ ...prev, canceling: true, cancelError: null, cancelSuccess: false }));
    orderApi
      .cancelCustomerOrder(id)
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
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={state.canceling}
                    className="inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state.canceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
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
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm text-slate-500">Mã đơn</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{state.order.id}</p>
                  </div>
                  {state.order.history.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      Chưa có lịch sử cập nhật cho đơn hàng này.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.order.history.map(renderHistoryItem)}
                    </div>
                  )}
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
