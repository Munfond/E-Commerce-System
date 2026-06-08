import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { listSellerOrders, listSellerOrderStatus } from '../api/seller/sellerApi';
import { mapSellerOrderDto } from '../mappers/seller';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import type { SellerOrder } from '../types/models/seller';
import type { SellerOrderStatusDto } from '../types/dto/seller';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn tất' },
  { id: 'cancelled', label: 'Đã huỷ' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function formatVND(n: number) {
  return `₫${n.toLocaleString('vi-VN')}`;
}

function statusPill(status: SellerOrderStatusDto) {
  switch (status) {
    case 'pending':
      return { text: 'Chờ xử lý', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'shipping':
      return { text: 'Đang giao', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'completed':
      return { text: 'Hoàn tất', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'cancelled':
      return { text: 'Đã huỷ', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
    default:
      return { text: '—', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export default function SellerOrders() {
  const [tab, setTab] = useState<TabId>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<SellerOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<TabId, number>>({
    all: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<SellerOrderStatusDto | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [tab, q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listSellerOrders({
          q: q || undefined,
          status: tab,
          page,
          pageSize,
        });
        if (!alive) return;
        setItems(res.data.items.map(mapSellerOrderDto));
        setTotal(res.data.total);
      } catch {
        if (!alive) return;
        setError('Không tải được danh sách đơn hàng.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, q, page, pageSize]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [all, pending, shipping, completed, cancelled] = await Promise.all([
          listSellerOrders({ status: 'all', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'pending', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'shipping', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'completed', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'cancelled', page: 1, pageSize: 1 }),
        ]);
        if (!alive) return;
        setCounts({
          all: all.data.total,
          pending: pending.data.total,
          shipping: shipping.data.total,
          completed: completed.data.total,
          cancelled: cancelled.data.total,
        });
      } catch {
        // ignore counts failure
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function openStatusDialog(orderId: string) {
    setSelectedOrderId(orderId);
    setSelectedOrderStatus(null);
    setStatusError(null);
    setStatusLoading(true);
    setStatusDialogOpen(true);

    try {
      const res = await listSellerOrderStatus(orderId);
      setSelectedOrderStatus(res.data.status);
    } catch {
      setStatusError('Không lấy được trạng thái đơn hàng.');
    } finally {
      setStatusLoading(false);
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500">
        Trang chủ <span className="mx-2">›</span> <span className="text-slate-700">Đơn hàng</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-slate-900">Đơn hàng</div>
          <div className="text-sm text-slate-600">Danh sách đơn hàng (demo)</div>
        </div>

        <div className="px-5 pt-4">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100">
            {tabs.map((t) => {
              const active = tab === t.id;
              const badge =
                t.id === 'all'
                  ? counts.all
                  : t.id === 'pending'
                    ? counts.pending
                    : t.id === 'shipping'
                      ? counts.shipping
                      : t.id === 'completed'
                        ? counts.completed
                        : counts.cancelled;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    'relative -mb-px px-1 py-3 text-sm font-medium transition-colors',
                    active ? 'text-orange-700' : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.label}
                    <span
                      className={[
                        'text-xs px-2 h-5 rounded-full inline-flex items-center justify-center border',
                        active ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      ].join(' ')}
                    >
                      {badge}
                    </span>
                  </span>
                  {active && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-orange-600" />}
                </button>
              );
            })}
          </div>

          <div className="py-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc người mua"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="overflow-auto border border-slate-200 rounded-xl">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 w-32">Mã đơn</th>
                  <th className="px-4 py-3">Người mua</th>
                  <th className="px-4 py-3 w-36">Ngày tạo</th>
                  <th className="px-4 py-3 w-24">Số SP</th>
                  <th className="px-4 py-3 w-36">Tổng tiền</th>
                  <th className="px-4 py-3 w-28">Trạng thái</th>
                  <th className="px-4 py-3 w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>
                      Đang tải...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>
                      Không có đơn hàng.
                    </td>
                  </tr>
                ) : (
                  items.map((o) => {
                    const st = statusPill(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-900">{o.id}</td>
                      <td className="px-4 py-4 text-slate-800">{o.buyerName}</td>
                      <td className="px-4 py-4 text-slate-700">{o.createdAt.toISOString().slice(0, 10)}</td>
                      <td className="px-4 py-4 text-slate-700">{o.itemCount}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{formatVND(o.totalVnd)}</td>
                      <td className="px-4 py-4">
                        <span className={['text-[11px] px-2 h-5 rounded-full border inline-flex items-center', st.cls].join(' ')}>
                          {st.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => openStatusDialog(o.id)}
                          className="text-orange-700 hover:text-orange-800 font-semibold text-xs"
                        >
                          Xem trạng thái
                        </button>
                        <button className="text-slate-600 hover:text-slate-900 font-semibold text-xs">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <div>
              Tổng: <span className="font-semibold text-slate-900">{total.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Trước
              </button>
              <div className="text-sm">
                Trang <span className="font-semibold text-slate-900">{page}</span>/{totalPages}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader>
            <DialogTitle>Trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              {selectedOrderId ? `Mã đơn: ${selectedOrderId}` : 'Chọn đơn hàng để xem trạng thái.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 min-h-[5rem] rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            {statusLoading ? (
              <div>Đang tải trạng thái...</div>
            ) : statusError ? (
              <div className="text-rose-700">{statusError}</div>
            ) : selectedOrderStatus ? (
              <div className="text-slate-900">
                Trạng thái hiện tại: <span className="font-semibold text-orange-700">{selectedOrderStatus}</span>
              </div>
            ) : (
              <div>Không có trạng thái để hiển thị.</div>
            )}
          </div>
          <DialogFooter>
            <DialogClose className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Đóng
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

