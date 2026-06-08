import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Package, Plus, ShoppingBag, Store, User, Activity, Calendar, ListChecks } from 'lucide-react';
import { Link } from 'react-router';
import { listSellerOrders, listSellerProducts } from '../api/seller/sellerApi';
import { useAuth } from '../auth/AuthProvider';

const orderTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn tất' },
  { id: 'cancelled', label: 'Đã huỷ' },
] as const;

const productTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang hoạt động' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'violation', label: 'Vi phạm' },
  { id: 'draft', label: 'Chưa đăng' },
] as const;

type OrderTabId = (typeof orderTabs)[number]['id'];
type ProductTabId = (typeof productTabs)[number]['id'];

type ProductCounts = Record<ProductTabId, number>;
type OrderCounts = Record<OrderTabId, number>;

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

export default function SellerIndex() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<ProductCounts>({
    all: 0,
    active: 0,
    pending: 0,
    violation: 0,
    draft: 0,
  });
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    all: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [allProducts, activeProducts, pendingProducts, violationProducts, draftProducts, allOrders, pendingOrders, shippingOrders, completedOrders, cancelledOrders] = await Promise.all([
          listSellerProducts({ status: 'all', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'active', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'pending', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'violation', page: 1, pageSize: 1 }),
          listSellerProducts({ status: 'draft', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'all', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'pending', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'shipping', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'completed', page: 1, pageSize: 1 }),
          listSellerOrders({ status: 'cancelled', page: 1, pageSize: 1 }),
        ]);

        if (!alive) return;

        setProductCounts({
          all: allProducts.data.total,
          active: activeProducts.data.total,
          pending: pendingProducts.data.total,
          violation: violationProducts.data.total,
          draft: draftProducts.data.total,
        });

        setOrderCounts({
          all: allOrders.data.total,
          pending: pendingOrders.data.total,
          shipping: shippingOrders.data.total,
          completed: completedOrders.data.total,
          cancelled: cancelledOrders.data.total,
        });
      } catch (err) {
        if (!alive) return;
        setError('Không tải được dữ liệu Seller. Vui lòng thử lại.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const totalProducts = useMemo(() => productCounts.all, [productCounts]);
  const pendingOrders = useMemo(() => orderCounts.pending, [orderCounts]);
  const activeProducts = useMemo(() => productCounts.active, [productCounts]);
  const completedOrders = useMemo(() => orderCounts.completed, [orderCounts]);

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-500">
        Trang chủ <span className="mx-2">›</span> <span className="text-slate-700">Kênh người bán</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Xin chào,</p>
                <h1 className="text-3xl font-semibold text-slate-900">{auth.user?.username ?? auth.user?.email ?? 'Người bán'}</h1>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                  Đây là trang quản lý Seller. Tại đây bạn xem nhanh số liệu shop, đơn hàng và truy cập các tính năng bán hàng.
                </p>
              </div>
              <div className="rounded-3xl bg-orange-600 px-5 py-4 text-white shadow-md">
                <div className="text-sm uppercase tracking-[0.18em] text-orange-100/90">Tình trạng Shop</div>
                <div className="mt-3 text-3xl font-semibold">Đang hoạt động</div>
                <div className="mt-1 text-sm text-orange-100/80">Shop đã được kích hoạt và đang tiếp nhận đơn.</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Sản phẩm</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '...' : formatNumber(totalProducts)}</p>
                  </div>
                  <div className="size-11 rounded-3xl bg-white text-orange-600 shadow-sm flex items-center justify-center">
                    <Package className="size-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Đơn hàng chờ</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '...' : formatNumber(pendingOrders)}</p>
                  </div>
                  <div className="size-11 rounded-3xl bg-white text-amber-600 shadow-sm flex items-center justify-center">
                    <ShoppingBag className="size-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Sản phẩm hoạt động</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '...' : formatNumber(activeProducts)}</p>
                  </div>
                  <div className="size-11 rounded-3xl bg-white text-emerald-600 shadow-sm flex items-center justify-center">
                    <Store className="size-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Đơn đã hoàn tất</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '...' : formatNumber(completedOrders)}</p>
                  </div>
                  <div className="size-11 rounded-3xl bg-white text-emerald-600 shadow-sm flex items-center justify-center">
                    <Activity className="size-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Theo dõi nhanh</p>
                  <h2 className="text-xl font-semibold text-slate-900">Hoạt động hôm nay</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <Calendar className="size-4" /> 7 ngày qua
                </span>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Sản phẩm chờ duyệt</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{loading ? '...' : formatNumber(productCounts.pending)}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      <ListChecks className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Đơn đang giao</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{loading ? '...' : formatNumber(orderCounts.shipping)}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-slate-500">Hành động nhanh</p>
                <h2 className="text-xl font-semibold text-slate-900">Làm ngay</h2>
              </div>
              <div className="grid gap-3">
                <Link
                  to="/seller/products/add"
                  className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="size-4" /> Thêm sản phẩm mới
                  </span>
                </Link>
                <Link
                  to="/seller/orders"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="size-4" /> Xem đơn hàng
                  </span>
                </Link>
                <Link
                  to="/seller/inventory"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Package className="size-4" /> Quản lý kho hàng
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
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-slate-500">Hiện trạng</p>
                <h2 className="text-lg font-semibold text-slate-900">Số liệu nhanh</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{loading ? 'Đang tải' : 'Cập nhật mới'}</span>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Tổng đơn</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatNumber(orderCounts.all)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Sản phẩm vi phạm</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatNumber(productCounts.violation)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Sản phẩm nháp</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : formatNumber(productCounts.draft)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-slate-500">Hỗ trợ</p>
                <h2 className="text-lg font-semibold text-slate-900">Liên hệ nhanh</h2>
              </div>
              <Store className="size-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Nếu cần hỗ trợ, bạn có thể liên hệ bộ phận Seller Care hoặc xem lại tài liệu bán hàng.</p>
            <div className="mt-5 space-y-3">
              <button className="w-full rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700">
                Gửi yêu cầu hỗ trợ
              </button>
              <button className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Xem chính sách bán hàng
              </button>
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}

