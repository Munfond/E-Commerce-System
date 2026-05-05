import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { listSellerInventory } from '../api/seller/sellerApi';
import { mapSellerInventoryDto } from '../mappers/seller';
import type { SellerInventoryItem } from '../types/models/seller';

export default function SellerInventory() {
  const [q, setQ] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<SellerInventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [q, onlyLow]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listSellerInventory({ q: q || undefined, onlyLow: onlyLow || undefined, page, pageSize });
        if (!alive) return;
        setItems(res.data.items.map(mapSellerInventoryDto));
        setTotal(res.data.total);
      } catch {
        if (!alive) return;
        setError('Không tải được dữ liệu kho hàng.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q, onlyLow, page, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500">
        Trang chủ <span className="mx-2">›</span> <span className="text-slate-700">Kho hàng</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Kho hàng</div>
            <div className="text-sm text-slate-600 mt-1">Theo dõi tồn kho và cảnh báo sắp hết (demo)</div>
          </div>
          <button className="h-9 px-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700">
            Nhập kho
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative max-w-xl w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo sản phẩm/SKU/ID"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
              className="size-4"
            />
            Chỉ hiển thị hàng sắp hết (≤ 10)
          </label>
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
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3 w-28">Tồn kho</th>
                  <th className="px-4 py-3 w-28">Giữ chỗ</th>
                  <th className="px-4 py-3 w-28">Có thể bán</th>
                  <th className="px-4 py-3 w-36">Cảnh báo</th>
                  <th className="px-4 py-3 w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Đang tải...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Không có dữ liệu kho.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => {
                    const low = r.isLow;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="size-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-semibold">
                              IMG
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{r.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                SKU: {r.sku} · ID: {r.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-800">{r.onHand.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-4 text-slate-800">{r.reserved.toLocaleString('vi-VN')}</td>
                        <td className={['px-4 py-4 font-semibold', low ? 'text-rose-700' : 'text-slate-900'].join(' ')}>
                          {r.available.toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-4">
                          {low ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 h-5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                              <AlertTriangle className="size-3" />
                              Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] px-2 h-5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                              Ổn định
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button className="text-orange-700 hover:text-orange-800 font-semibold text-xs">Cập nhật</button>
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
    </div>
  );
}

