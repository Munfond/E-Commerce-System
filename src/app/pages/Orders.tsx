import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Box, Clock3, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { orderApi, type CustomerOrderDto } from '../api/orderApi';

type CustomerOrder = CustomerOrderDto;

export default function Orders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    orderApi
      .getCustomerOrders()
      .then((res) => {
        if (!isMounted) return;
        setOrders(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Không tải được danh sách đơn hàng.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-orange-600 text-white px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-3xl bg-white/15 flex items-center justify-center">
                  <ShoppingBag className="size-8" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-100/80">Đơn hàng của bạn</p>
                  <h1 className="mt-3 text-4xl font-semibold">Lịch sử đơn hàng</h1>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6 text-slate-600">
                <p className="text-lg font-medium text-slate-900">Danh sách đơn hàng đã mua</p>
                <p className="mt-2">Xem tổng tiền và trạng thái đơn hàng của bạn.</p>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Đang tải đơn hàng...</div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</div>
              ) : orders.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có đơn hàng nào.
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-6 py-4">Mã đơn</th>
                        <th className="px-6 py-4">Tổng tiền</th>
                        <th className="px-6 py-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <Link to={`/orders/${order.id}`} className="text-orange-600 hover:text-orange-700">
                              {order.id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{formatCurrency(order.total)}</td>
                          <td className="px-6 py-4 text-slate-700">{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-8 text-center">
                <Link to="/products" className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition">
                  Quay lại mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
