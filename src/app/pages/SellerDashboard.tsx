import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { listSellerProducts } from '../api/seller/sellerApi';
import { mapSellerProductDto } from '../mappers/seller';
import type { SellerProduct } from '../types/models/seller';
import type { SellerProductStatusDto } from '../types/dto/seller';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang hoạt động' },
  { id: 'violation', label: 'Vi phạm' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'draft', label: 'Chưa được đăng' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function formatPriceVNDLike(value: number) {
  if (value < 1000) return `₫${value}`;
  return `₫${value.toLocaleString('vi-VN')}`;
}

function formatK(value: number) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return `${value}`;
}

function statusLabel(s: SellerProductStatusDto) {
  switch (s) {
    case 'active':
      return { text: 'Đang hoạt động', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'hidden':
      return { text: 'Đã ẩn', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
    case 'violation':
      return { text: 'Vi phạm', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'pending':
      return { text: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'draft':
      return { text: 'Chưa đăng', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { text: '—', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('all');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<SellerProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<TabId, number>>({
    all: 0,
    active: 0,
    violation: 0,
    pending: 0,
    draft: 0,
  });

  useEffect(() => {
    setPage(1);
  }, [tab, q, category, brand]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listSellerProducts({
          q: q || undefined,
          status: tab,
          page,
          pageSize,
        });
        if (!alive) return;
        setItems(res.data.items.map(mapSellerProductDto));
        setTotal(res.data.total);
      } catch {
        if (!alive) return;
        setError('Không tải được danh sách sản phẩm.');
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
        const [all, active, violation, pending, draft] = await Promise.all([
          listSellerProducts({ status: 'all', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'active', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'violation', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'pending', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'draft', page: 1, pageSize: 1 }),
        ]);
        if (!alive) return;
        setCounts({
          all: all.data.total,
          active: active.data.total,
          violation: violation.data.total,
          pending: pending.data.total,
          draft: draft.data.total,
        });
      } catch {
        // ignore counts failure
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 mb-3">
        <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">Sản phẩm</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-slate-900">Sản phẩm</div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
              Công cụ xử lý hàng loạt
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/seller/products/add')}
              className="h-9 px-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              Thêm 1 sản phẩm mới
            </motion.button>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100">
            {tabs.map((t) => {
              const active = tab === t.id;
              const badge =
                t.id === 'all'
                  ? counts.all
                  : t.id === 'active'
                    ? counts.active
                    : t.id === 'violation'
                      ? counts.violation
                      : t.id === 'pending'
                        ? counts.pending
                        : counts.draft;
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 py-4">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm Sản phẩm, Tên sản phẩm, SKU, Mã sản phẩm"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Tìm theo Ngành hàng</option>
                <option value="fashion">Thời trang</option>
                <option value="tech">Công nghệ</option>
                <option value="home">Nhà cửa</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Tìm theo Loại đăng bán sản phẩm</option>
                <option value="normal">Bán thường</option>
                <option value="deal">Deal</option>
              </select>
            </div>
            <div className="lg:col-span-1 flex items-center gap-2">
              <button className="h-10 px-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700">
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="text-sm text-slate-700">
              <span className="font-semibold">{total.toLocaleString('vi-VN')}</span> Sản phẩm
            </div>
            <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
              Hạn mức đăng bán: 100
            </div>
          </div>

          <div className="overflow-auto border border-slate-200 rounded-xl">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="size-4" />
                  </th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3 w-28">Doanh số</th>
                  <th className="px-4 py-3 w-28">Giá</th>
                  <th className="px-4 py-3 w-28">Kho hàng</th>
                  <th className="px-4 py-3 w-40">Tồn kho “Gói Sẵn Giao Nhanh”</th>
                  <th className="px-4 py-3 w-32">Thao tác</th>
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
                      Không có sản phẩm.
                    </td>
                  </tr>
                ) : (
                  items.map((p) => {
                    const st = statusLabel(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="size-4" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="size-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-semibold">
                              IMG
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={[
                                    'text-[11px] px-2 h-5 rounded-full border inline-flex items-center',
                                    st.cls,
                                  ].join(' ')}
                                >
                                  {st.text}
                                </span>
                              </div>
                              <div className="font-semibold text-slate-900 truncate mt-1">{p.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                SKU: {p.sku} · ID: {p.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-800">{formatK(0)}</td>
                        <td className="px-4 py-4 text-slate-800">{formatPriceVNDLike(p.priceVnd)}</td>
                        <td className="px-4 py-4 text-slate-800">{formatK(p.stock)}</td>
                        <td className="px-4 py-4 text-slate-500">—</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 text-xs">
                            <button className="text-orange-700 hover:text-orange-800 font-semibold text-left">
                              Cập nhật
                            </button>
                            <button className="text-slate-600 hover:text-slate-800 font-semibold text-left">
                              Quảng cáo
                            </button>
                            <button className="text-slate-600 hover:text-slate-800 font-semibold text-left">
                              Xem thêm
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-500 mt-3">
            Đây là UI demo theo format bạn gửi. Khi nối API, mình sẽ map dữ liệu thật vào bảng và bộ lọc.
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <div className="hidden md:block">
              Trang <span className="font-semibold text-slate-900">{page}</span>/{totalPages}
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
