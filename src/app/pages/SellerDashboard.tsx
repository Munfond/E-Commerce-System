import { motion } from 'motion/react';
import { BarChart3, ClipboardList, Package, Wallet } from 'lucide-react';
import Header from '../components/Header';

const cards = [
  { title: 'Đơn hàng hôm nay', value: '12', icon: ClipboardList, accent: 'bg-blue-600' },
  { title: 'Sản phẩm đang bán', value: '84', icon: Package, accent: 'bg-emerald-600' },
  { title: 'Doanh thu tháng', value: '₫18.450.000', icon: Wallet, accent: 'bg-orange-600' },
  { title: 'Lượt xem gian hàng', value: '1.2k', icon: BarChart3, accent: 'bg-violet-600' },
];

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Seller Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Tổng quan nhanh về cửa hàng của bạn. (Demo UI — bạn có thể nối API sau)
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm"
          >
            <div className="size-9 rounded-lg bg-orange-600 text-white flex items-center justify-center font-semibold">
              SV
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">ShopViet Seller</div>
              <div className="text-xs text-slate-500">Kênh người bán</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {cards.map((c) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">{c.title}</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{c.value}</div>
                </div>
                <div className={`size-11 rounded-xl ${c.accent} text-white flex items-center justify-center`}>
                  <c.icon className="size-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Đơn hàng gần đây</h2>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                Xem tất cả
              </button>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {[
                { id: '#SV-1024', status: 'Đang xử lý', total: '₫1.250.000' },
                { id: '#SV-1023', status: 'Đang giao', total: '₫320.000' },
                { id: '#SV-1022', status: 'Hoàn tất', total: '₫780.000' },
              ].map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{o.id}</div>
                    <div className="text-sm text-slate-600">{o.status}</div>
                  </div>
                  <div className="font-semibold text-slate-900">{o.total}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Việc cần làm</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Xác nhận đơn mới', count: 3 },
                { label: 'Cập nhật tồn kho', count: 5 },
                { label: 'Trả lời chat', count: 2 },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-sm font-medium text-slate-800">{t.label}</div>
                  <div className="min-w-7 h-7 px-2 rounded-full bg-orange-600 text-white text-xs font-semibold flex items-center justify-center">
                    {t.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
